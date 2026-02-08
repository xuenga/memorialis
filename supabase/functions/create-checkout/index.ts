import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { items, customer_email, customer_name, customer_phone, shipping_address, success_url, cancel_url } = await req.json()

        // Initialize Stripe
        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
        if (!stripeSecretKey) {
            throw new Error('STRIPE_SECRET_KEY is not set')
        }
        const stripe = new Stripe(stripeSecretKey, {
            apiVersion: '2023-10-16',
            httpClient: Stripe.createFetchHttpClient(),
        })

        // Prepare line items
        const lineItems = items.map((item: any) => {
            // If we have a stripe_price_id, use it. Otherwise use price_data as fallback
            if (item.stripe_price_id) {
                return {
                    price: item.stripe_price_id,
                    quantity: item.quantity || 1,
                }
            } else {
                return {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: item.product_name || 'Produit Memorialis',
                            images: item.product_image ? [item.product_image] : [],
                        },
                        unit_amount: Math.round(item.price * 100),
                    },
                    quantity: item.quantity || 1,
                }
            }
        })

        // Calculate subtotal for shipping
        const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * (item.quantity || 1)), 0)
        const shippingCost = 0

        // No shipping costs to add

        // Create session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: success_url,
            cancel_url: cancel_url,
            customer_email: customer_email,
            metadata: {
                customer_name: customer_name,
                customer_phone: customer_phone || '',
                shipping_address: JSON.stringify(shipping_address || {}),
                items: JSON.stringify(items.map((i: any) => ({
                    id: i.product_id,
                    name: i.product_name,
                    quantity: i.quantity,
                    personalization: i.personalization
                }))),
            },
        })

        return new Response(
            JSON.stringify({ url: session.url, sessionId: session.id }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        )

    } catch (error) {
        console.error('Error creating checkout session:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            }
        )
    }
})
