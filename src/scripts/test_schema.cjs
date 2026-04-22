const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://qjtzpbpvjiicddkmqfim.supabase.co', 'sb_publishable_RzQ_g8_oJbdGhcuga7T1aQ_We17LJlU');
async function test() {
  const { data, error } = await supabase.from('Memorial').select('*').limit(1);
  console.log(Object.keys(data[0] || {}));
}
test();
