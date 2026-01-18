import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { sendConfirmationEmail } from '../_shared/email-utils.ts'

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
            const order = existingOrder || existingOrderByIntent

            // Get memorial info
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

            const needsQRCode = items.some((item: any) =>
                item.name?.toLowerCase().includes('plaque') ||
                item.name?.toLowerCase().includes('mémorial')
            )

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

            // Send confirmation email
            await sendConfirmationEmail(order, finalMemorial)

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
