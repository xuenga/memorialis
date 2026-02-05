
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qjtzpbpvjiicddkmqfim.supabase.co';
const supabaseKey = 'sb_publishable_RzQ_g8_oJbdGhcuga7T1aQ_We17LJlU'; // Assuming this is correct from .env but usually keys are 'ey...' this looks like a custom format or shorter key?
// Wait, the key in .env was: VITE_SUPABASE_ANON_KEY=sb_publishable_RzQ_g8_oJbdGhcuga7T1aQ_We17LJlU
// That looks like a "publishable key" format which acts as Anon Key.

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log('Testing Order list...');
    const { data: orders, error: orderError } = await supabase.from('Order').select('*');
    if (orderError) {
        console.error('Order Error:', orderError);
    } else {
        console.log('Orders found:', orders?.length);
    }

    console.log('Testing Memorial list...');
    const { data: memorials, error: memorialError } = await supabase.from('Memorial').select('*');
    if (memorialError) {
        console.error('Memorial Error:', memorialError);
    } else {
        console.log('Memorials found:', memorials?.length);
    }

    // Test lowercase versions just in case
    console.log('Testing "orders" list...');
    const { data: ordersLower, error: orderLowerError } = await supabase.from('orders').select('*');
    if (orderLowerError) {
        console.error('orders (lower) Error:', orderLowerError);
    } else {
        console.log('orders (lower) found:', ordersLower?.length);
    }
}

test();
