
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qjtzpbpvjiicddkmqfim.supabase.co'
const supabaseKey = 'sb_publishable_RzQ_g8_oJbdGhcuga7T1aQ_We17LJlU' // Using anon key for now

const supabase = createClient(supabaseUrl, supabaseKey)

// const sessionId = 'cs_test_b1WtN9Eh323HTu8YwJVtu0WPt1TWyZfRRmrNPnLBp28ELNJz2bXMAjGAPu';
const orderNumber = 'MEM-MLIFQ8M3';

async function checkOrder() {
    const { data: order, error } = await supabase
        .from('Order')
        .select(`
            *,
            Memorial (*)
        `)
        .eq('order_number', orderNumber)
        .single()

    if (error) {
        console.error('Error fetching order:', error)
    } else {
        console.log('Order ID:', order.id);
        console.log('Stripe Payment ID:', order.stripe_payment_id);
        console.log('Memorial ID:', order.memorial_id);
        console.log('Memorial:', order.Memorial);
    }
}

checkOrder();
