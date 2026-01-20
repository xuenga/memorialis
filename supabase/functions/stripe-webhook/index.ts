
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { sendOrderConfirmationEmail } from '../_shared/email.ts'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    const signature = req.headers.get('stripe-signature')

    if (!signature) {
        console.error('Missing stripe-signature header')
        return new Response('No signature', { status: 400 })
    }

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!stripeSecretKey || !webhookSecret) {
        console.error('Missing Stripe configuration')
        return new Response('Missing Stripe configuration', { status: 500 })
    }

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Supabase configuration')
        return new Response('Missing Supabase configuration', { status: 500 })
    }

    const stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2023-10-16',
        httpClient: Stripe.createFetchHttpClient(),
    })

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    try {
        const body = await req.text()
        const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

        console.log(`Received Stripe event: ${event.type}`)

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session

            console.log('Processing checkout session:', session.id)

            const metadata = session.metadata || {}
            const items = JSON.parse(metadata.items || '[]')
            const customerName = metadata.customer_name || 'Client'
            const customerEmail = session.customer_email || ''
            const shippingAddress = metadata.shipping_address ? JSON.parse(metadata.shipping_address) : null

            // Generate order number
            const orderNumber = `MEM-${Date.now().toString(36).toUpperCase()}`

            console.log('Creating order:', orderNumber)

            // 1. Find an available QR code for each item purchased
            let qrCode = null
            let accessCode = ''
            let memorialId = null
            let memorial = null;

            // Check if we need a QR code (for memorial products)
            // Relaxed check: If there are items, we assume it's a memorial product
            const needsQRCode = items.length > 0;

            console.log('Webhook: Checking needsQRCode', needsQRCode);

            if (needsQRCode) {
                const { data: qrCodes, error: qrError } = await supabase
                    .from('QRCode')
                    .select('*')
                    .eq('status', 'available')
                    .limit(1)

                if (qrError) {
                    console.error('Error fetching QR code:', qrError)
                }

                qrCode = qrCodes && qrCodes.length > 0 ? qrCodes[0] : null
                accessCode = qrCode?.code || Math.random().toString(36).substring(2, 8).toUpperCase()

                // 2. Create the memorial
                const deceasedName = items[0]?.personalization?.deceased_name ||
                    items[0]?.personalization?.defunt_name ||
                    'Mémorial'

                const { data: createdMemorial, error: memError } = await supabase
                    .from('Memorial')
                    .insert({
                        id: crypto.randomUUID(),
                        name: deceasedName,
                        access_code: accessCode,
                        owner_email: customerEmail,
                        is_activated: false,
                        theme: 'classic',
                        birth_date: items[0]?.personalization?.birth_date || null,
                        death_date: items[0]?.personalization?.death_date || null,
                    })
                    .select()
                    .single()

                if (memError) {
                    console.error('Error creating memorial:', memError)
                } else {
                    memorial = createdMemorial;
                    memorialId = createdMemorial.id
                    console.log('Memorial created:', createdMemorial.id)
                }
            }

            // 3. Create the order
            const { data: order, error: orderError } = await supabase
                .from('Order')
                .insert({
                    order_number: orderNumber,
                    customer_email: customerEmail,
                    customer_name: customerName,
                    customer_phone: metadata.customer_phone || null,
                    shipping_address: shippingAddress,
                    items: items,
                    subtotal: session.amount_subtotal ? session.amount_subtotal / 100 : 0,
                    shipping_cost: 9.90, // Default shipping, could be calculated
                    total: session.amount_total ? session.amount_total / 100 : 0,
                    status: 'paid',
                    memorial_id: memorialId,
                    stripe_payment_id: session.payment_intent as string,
                    personalization: items[0]?.personalization || null,
                })
                .select()
                .single()

            if (orderError) {
                console.error('Error creating order:', orderError)
                throw orderError
            }

            console.log('Order created:', order.id)

            // 4. Update QR code status if found
            if (qrCode && memorialId) {
                const { error: updateError } = await supabase
                    .from('QRCode')
                    .update({
                        status: 'reserved',
                        memorial_id: memorialId,
                        order_id: order.id,
                        owner_email: customerEmail,
                        reserved_at: new Date().toISOString(),
                    })
                    .eq('id', qrCode.id)

                if (updateError) {
                    console.error('Error updating QR code:', updateError)
                } else {
                    console.log('QR code reserved:', qrCode.code)
                }
            }

            console.log(`✅ Order ${orderNumber} processed successfully`)

            // Send Confirmation Email
            try {
                // Construct logic url (assumes frontend is at origin of valid domain or localhost)
                const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://memorialis.shop';
                const memorialLink = memorial ? `${frontendUrl}/memorial/${memorial.slug || memorial.id}` : `${frontendUrl}/edit-memorial/${memorialId || ''}`;

                await sendOrderConfirmationEmail(
                    customerEmail,
                    customerName,
                    orderNumber,
                    accessCode,
                    memorialLink
                );
            } catch (emailError) {
                console.error('Failed to send confirmation email:', emailError);
            }
        }

        return new Response(
            JSON.stringify({ received: true }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        )

    } catch (err) {
        console.error('Webhook processing failed:', err.message)
        return new Response(
            JSON.stringify({ error: err.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            }
        )
    }
})
