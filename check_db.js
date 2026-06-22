const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: offers, error: err1 } = await supabase
    .from('offer_completions')
    .select('*')
    .eq('offer_provider', 'notik')
    .order('completed_at', { ascending: false })
    .limit(5);
    
  console.log('Recent Notik offers in offer_completions:', offers, err1);
}

check();
