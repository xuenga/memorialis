import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

serve(async (req) => {
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
        return new Response('No signature', { status: 400 })
    }

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
        return new Response('Missing configuration', { status: 500 })
    }

    const stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2023-10-16',
        httpClient: Stripe.createFetchHttpClient(),
    })

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    try {
        const body = await req.text()
        const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session

            const metadata = session.metadata || {}
            const items = JSON.parse(metadata.items || '[]')
            const customerName = metadata.customer_name
            const customerEmail = session.customer_email

            // 1. Find an available QR code
            const { data: qrCodes, error: qrError } = await supabase
                .from('QRCode')
                .select('*')
                .eq('status', 'available')
                .limit(1)

            let qrCode = qrCodes && qrCodes.length > 0 ? qrCodes[0] : null
            const accessCode = qrCode?.code || Math.random().toString(36).substring(2, 8).toUpperCase()

            // 2. Create the memorial
            const { data: memorial, error: memError } = await supabase
                .from('Memorial')
                .insert({
                    name: items[0]?.personalization?.deceased_name || 'Mémorial',
                    access_code: accessCode,
                    owner_email: customerEmail,
                    is_activated: false,
                    theme: 'classic',
                })
                .select()
                .single()

            if (memError) throw memError

            // 3. Create the order
            const orderNumber = `MEM-${Date.now()}`
            const { data: order, error: orderError } = await supabase
                .from('Order')
                .insert({
                    order_number: orderNumber,
                    customer_email: customerEmail,
                    customer_name: customerName,
                    items: items,
                    total: session.amount_total ? session.amount_total / 100 : 0,
                    status: 'paid',
                    memorial_id: memorial.id,
                    stripe_payment_id: session.payment_intent as string,
                })
                .select()
                .single()

            if (orderError) throw orderError

            // 4. Update QR code status if found
            if (qrCode) {
                await supabase
                    .from('QRCode')
                    .update({
                        status: 'reserved',
                        memorial_id: memorial.id,
                        order_id: order.id,
                        owner_email: customerEmail,
                        reserved_at: new Date().toISOString(),
                    })
                    .eq('id', qrCode.id)
            }

            console.log('Order processed successfully:', orderNumber)
        }

        return new Response(JSON.stringify({ received: true }), { status: 200 })
    } catch (err) {
        console.error('Webhook processing failed:', err.message)
        return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }
})
