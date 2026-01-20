import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { product_id, name, description, price, image_url } = await req.json()

        // Initialize Stripe
        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
        if (!stripeSecretKey) {
            throw new Error('STRIPE_SECRET_KEY is not set')
        }
        const stripe = new Stripe(stripeSecretKey, {
            apiVersion: '2023-10-16',
            httpClient: Stripe.createFetchHttpClient(),
        })

        // Create product in Stripe
        const stripeProduct = await stripe.products.create({
            name: name,
            description: description || undefined,
            images: image_url ? [image_url] : undefined,
            metadata: {
                supabase_product_id: product_id
            }
        })

        console.log('Created Stripe product:', stripeProduct.id)

        // Create price for the product
        const stripePrice = await stripe.prices.create({
            product: stripeProduct.id,
            unit_amount: Math.round(price * 100), // Convert to cents
            currency: 'eur',
        })

        console.log('Created Stripe price:', stripePrice.id)

        return new Response(
            JSON.stringify({
                stripe_product_id: stripeProduct.id,
                stripe_price_id: stripePrice.id
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        )

    } catch (error: unknown) {
        console.error('Error syncing with Stripe:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return new Response(
            JSON.stringify({ error: errorMessage }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            }
        )
    }
})
