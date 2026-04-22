const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qjtzpbpvjiicddkmqfim.supabase.co';
const supabaseKey = 'sb_publishable_RzQ_g8_oJbdGhcuga7T1aQ_We17LJlU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Fetching available QR code...');
  const { data: qrcodes, error: qrErr } = await supabase
    .from('QRCode')
    .select('*')
    .eq('status', 'available')
    .not('code', 'in', '("2601-0001", "2601-0002", "2601-0003", "2601-0004", "2601-0005")')
    .limit(1);

  if (qrErr) {
    console.error('Error fetching QR:', qrErr);
    return;
  }

  if (!qrcodes || qrcodes.length === 0) {
    console.log('No available QR codes found for testing.');
    return;
  }

  const qr = qrcodes[0];
  console.log('Testing with QR Code:', qr.code, 'UUID:', qr.id);

  console.log('Calling activate_memorial...');
  const { data, error } = await supabase.rpc('activate_memorial', {
    code_input: qr.id,
    email_input: 'test@example.com'
  });

  if (error) {
    console.error('RPC Error:', error);
  } else {
    console.log('RPC Result:', data);
  }
}

test();
