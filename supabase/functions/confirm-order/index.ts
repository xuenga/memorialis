
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { sendOrderConfirmationEmail } from '../_shared/email.ts'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { session_id } = await req.json()

        if (!session_id) {
            return new Response(JSON.stringify({ error: 'Missing session_id' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        const stripe = new Stripe(stripeSecretKey!, {
            apiVersion: '2023-10-16',
            httpClient: Stripe.createFetchHttpClient(),
        })

        const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

        // 1. Check database first to avoid duplicates
        const { data: existingOrder } = await supabase
            .from('Order')
            .select('*')
            .eq('stripe_payment_id', session_id) // We'll assume we stored session_id or payment_intent here
            .single()

        // Also check by payment_intent as that's what we usually store
        // Retrieve session details from Stripe
        const session = await stripe.checkout.sessions.retrieve(session_id)

        if (!session) {
            throw new Error('Session not found')
        }

        // Check if order exists with this payment_intent
        const { data: existingOrderByIntent } = await supabase
            .from('Order')
            .select('*')
            .eq('stripe_payment_id', session.payment_intent as string)
            .single()

        if (existingOrder || existingOrderByIntent) {
            let order = existingOrder || existingOrderByIntent

            // Check if order has memorial_id
            if (!order.memorial_id) {
                console.log('Existing order found but missing memorial_id. Attempting auto-repair.')
                // Logic to create missing memorial will be handled below by skipping this return block
                // But we need to be careful not to duplicate effort if we just fall through.
                // Let's implement specific repair logic here.

                const metadata = session.metadata || {}
                const items = JSON.parse(metadata.items || '[]')
                const customerEmail = session.customer_email || ''

                // Check if needs QR/Memorial
                // Relaxed check: If there are items, we assume it's a memorial product
                const needsQRCode = items.length > 0;

                console.log('Auto-repair: Checking needsQRCode', needsQRCode, items);

                if (needsQRCode) {
                    // Find available QR
                    const { data: qrCodes } = await supabase
                        .from('QRCode')
                        .select('*')
                        .eq('status', 'available')
                        .limit(1)

                    const qrCode = qrCodes && qrCodes.length > 0 ? qrCodes[0] : null
                    const accessCode = qrCode?.code || Math.random().toString(36).substring(2, 8).toUpperCase()
                    const deceasedName = items[0]?.personalization?.deceased_name || 'Mémorial'

                    // Create Memorial
                    const { data: newMemorial, error: memError } = await supabase
                        .from('Memorial')
                        .insert({
                            id: crypto.randomUUID(), // Explicitly generate ID
                            name: deceasedName,
                            access_code: accessCode,
                            owner_email: customerEmail,
                            is_activated: false,
                            theme: 'classic',
                        })
                        .select()
                        .single()

                    if (newMemorial) {
                        // Update Order
                        const { data: updatedOrder, error: updateError } = await supabase
                            .from('Order')
                            .update({ memorial_id: newMemorial.id })
                            .eq('id', order.id)
                            .select()
                            .single()

                        if (updatedOrder) order = updatedOrder

                        // Update QR Code
                        if (qrCode) {
                            await supabase.from('QRCode').update({
                                status: 'reserved',
                                memorial_id: newMemorial.id,
                                order_id: order.id,
                                owner_email: customerEmail,
                                reserved_at: new Date().toISOString(),
                            }).eq('id', qrCode.id)
                        }

                        // Send confirmation email on repair
                        try {
                            const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://memorialis.shop';
                            const memorialLink = newMemorial ? `${frontendUrl}/memorial/${newMemorial.slug || newMemorial.id}` : `${frontendUrl}/edit-memorial/${newMemorial.id}`;
                            const orderNumber = order.order_number || 'UNKNOWN';

                            await sendOrderConfirmationEmail(
                                customerEmail,
                                session.customer_details?.name || 'Client',
                                orderNumber,
                                accessCode,
                                memorialLink
                            );
                        } catch (emailError) {
                            console.error('Failed to send repair email:', emailError);
                        }

                        return new Response(JSON.stringify({ order, memorial: newMemorial }), {
                            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                            status: 200
                        })
                    }
                }
            }

            // Standard fetch if memorial exists
            const { data: memorial } = await supabase
                .from('Memorial')
                .select('*')
                .eq('id', order.memorial_id)
                .single()

            return new Response(JSON.stringify({ order, memorial }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            })
        }

        // 2. If not found, create it (Manual processing logic similar to webhook)
        if (session.payment_status === 'paid') {
            const metadata = session.metadata || {}
            const items = JSON.parse(metadata.items || '[]')
            const customerName = metadata.customer_name || 'Client'
            const customerEmail = session.customer_email || ''
            const shippingAddress = metadata.shipping_address ? JSON.parse(metadata.shipping_address) : null

            const orderNumber = `MEM-${Date.now().toString(36).toUpperCase()}`

            // Find QR Code logic
            let qrCode = null
            let accessCode = ''
            let memorialId = null

            // Relaxed check: If there are items, we assume it's a memorial product
            const needsQRCode = items.length > 0;

            if (needsQRCode) {
                const { data: qrCodes } = await supabase
                    .from('QRCode')
                    .select('*')
                    .eq('status', 'available')
                    .limit(1)

                qrCode = qrCodes && qrCodes.length > 0 ? qrCodes[0] : null
                accessCode = qrCode?.code || Math.random().toString(36).substring(2, 8).toUpperCase()

                const deceasedName = items[0]?.personalization?.deceased_name ||
                    items[0]?.personalization?.defunt_name ||
                    'Mémorial'

                const { data: memorial, error: memError } = await supabase
                    .from('Memorial')
                    .insert({
                        id: crypto.randomUUID(), // Explicitly generate ID
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

                if (memorial) {
                    memorialId = memorial.id
                }
            }

            // Create Order
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
                    shipping_cost: 9.90,
                    total: session.amount_total ? session.amount_total / 100 : 0,
                    status: 'paid',
                    memorial_id: memorialId,
                    stripe_payment_id: session.payment_intent as string,
                    personalization: items[0]?.personalization || null,
                })
                .select()
                .single()

            if (orderError) throw orderError

            // Update QR Code
            if (qrCode && memorialId) {
                await supabase
                    .from('QRCode')
                    .update({
                        status: 'reserved',
                        memorial_id: memorialId,
                        order_id: order.id,
                        owner_email: customerEmail,
                        reserved_at: new Date().toISOString(),
                    })
                    .eq('id', qrCode.id)
            }

            // Fetch the created memorial to return it
            const { data: finalMemorial } = await supabase
                .from('Memorial')
                .select('*')
                .eq('id', memorialId)
                .single()

            // Send Confirmation Email
            try {
                const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://memorialis.shop';
                const memorialLink = finalMemorial ? `${frontendUrl}/memorial/${finalMemorial.slug || finalMemorial.id}` : `${frontendUrl}/edit-memorial/${memorialId}`;

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

            return new Response(JSON.stringify({ order, memorial: finalMemorial }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            })
        } else {
            return new Response(JSON.stringify({ error: 'Payment not paid' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

    } catch (error: any) {
        console.error('Error confirming order:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})
