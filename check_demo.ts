
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qjtzpbpvjiicddkmqfim.supabase.co'
const supabaseKey = 'sb_publishable_RzQ_g8_oJbdGhcuga7T1aQ_We17LJlU' // Using anon key

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDemo() {
    // Try to find demo memorial by some criteria, or just list all to find it
    const { data: memorials, error } = await supabase
        .from('Memorial')
        .select('*')

    if (error) {
        console.error('Error:', error)
        return
    }

    console.log('Found ' + memorials.length + ' memorials.');
    const demo = memorials.find(m => m.name.toLowerCase().includes('demo') || m.access_code === 'DEMO' || m.id === 'demo-memorial');

    if (demo) {
        console.log('Demo Memorial found:', demo);
    } else {
        console.log('Demo memorial NOT found in the list. Please verify criteria.');
        console.log('Listing all names:', memorials.map(m => m.name));
    }
}

checkDemo();
