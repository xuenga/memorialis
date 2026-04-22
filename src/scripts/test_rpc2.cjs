const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://qjtzpbpvjiicddkmqfim.supabase.co', 'sb_publishable_RzQ_g8_oJbdGhcuga7T1aQ_We17LJlU');

async function test() {
  console.log('Testing with QR Code 2602-0008');
  
  // Find the UUID for 2602-0008
  const { data: qrcodes } = await supabase.from('QRCode').select('id, code').eq('code', '2602-0008');
  if (!qrcodes || qrcodes.length === 0) {
     console.log('QR code not found!');
     return;
  }
  const qrId = qrcodes[0].id;

  const { data, error } = await supabase.rpc('activate_memorial', {
    code_input: qrId,
    email_input: 'test_existing_account@example.com'
  });

  console.log('RPC Result:', data);
  console.log('RPC Error:', error);
}

test();
