require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function runCentersMigration() {
  console.log('🚀 Starting Exam Centers & Allocation Migration...');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env file (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const sqlFilePath = path.join(__dirname, '../migrations/20260911_exam_centers_and_allocations.sql');
  const sql = fs.readFileSync(sqlFilePath, 'utf8');

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    if (error) {
      console.warn('⚠️ exec_sql RPC notice:', error.message);
    } else {
      console.log('✅ Migration SQL executed successfully via RPC!');
    }

    // Check exam_centers table
    const { data: centers, error: centerErr } = await supabase
      .from('exam_centers')
      .select('id, center_code, center_name, state, district, max_capacity')
      .limit(5);

    if (centerErr) {
      console.warn('⚠️ exam_centers query check notice:', centerErr.message);
    } else {
      console.log(`✅ Exam Centers table verified! Found ${centers?.length || 0} sample centers:`);
      centers?.forEach(c => console.log(`   - [${c.center_code}] ${c.center_name} (${c.district}, ${c.state}) [Cap: ${c.max_capacity}]`));
    }

    console.log('🎉 Migration check complete!');
  } catch (err) {
    console.error('💥 Migration exception:', err);
  }
}

runCentersMigration();
