
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { order_id } = await req.json()

        if (!order_id) {
            throw new Error('Missing order_id')
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

        // 1. Get Order
        const { data: order, error: orderError } = await supabase
            .from('Order')
            .select('*')
            .eq('id', order_id)
            .single()

        if (orderError || !order) {
            throw new Error('Order not found')
        }

        if (order.memorial_id) {
            // Already has memorial, return it
            const { data: memorial } = await supabase
                .from('Memorial')
                .select('*')
                .eq('id', order.memorial_id)
                .single()

            return new Response(JSON.stringify({ success: true, memorial, message: 'Memorial already existed' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            })
        }

        // 2. Create Memorial
        const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        // Use order details for memorial
        let deceasedName = 'Mémorial';
        if (order.items && Array.isArray(order.items) && order.items.length > 0) {
            const item = order.items[0];
            deceasedName = item.personalization?.deceased_name ||
                item.personalization?.defunt_name ||
                'Mémorial';
        }

        console.log('Creating memorial for order:', order_id, deceasedName);

        const { data: newMemorial, error: memError } = await supabase
            .from('Memorial')
            .insert({
                id: crypto.randomUUID(), // Explicitly generate ID to avoid null constraint violation
                name: deceasedName,
                access_code: accessCode,
                owner_email: order.customer_email,
                is_activated: false,
                theme: 'classic'
            })
            .select()
            .single()

        if (memError) {
            console.error('Create Memorial Failed:', memError);
            throw memError;
        }

        // 3. Link Order
        const { error: updateError } = await supabase
            .from('Order')
            .update({ memorial_id: newMemorial.id })
            .eq('id', order_id)

        if (updateError) {
            console.error('Link Order Failed:', updateError);
            throw updateError;
        }

        return new Response(JSON.stringify({ success: true, memorial: newMemorial, repaired: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
        })

    } catch (error) {
        console.error('Repair failed:', error)
        const message = error instanceof Error ? error.message : 'Unknown error'
        return new Response(JSON.stringify({ error: message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
        })
    }
})
