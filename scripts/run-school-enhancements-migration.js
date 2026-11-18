require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function runEnhancementsMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('⚠️ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const sqlFilePath = path.join(__dirname, '../migrations/20261031_school_partner_enhancements.sql');
  const sql = fs.readFileSync(sqlFilePath, 'utf8');

  console.log('🔄 Applying school partner enhancements migration...');
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    if (error) {
      console.warn('⚠️ exec_sql RPC notice:', error.message);
      console.log('ℹ️ If exec_sql RPC is not enabled, please run migrations/20261031_school_partner_enhancements.sql in Supabase SQL editor.');
    } else {
      console.log('✅ Migration applied successfully via exec_sql!');
    }
  } catch (err) {
    console.warn('Migration run exception:', err.message);
  }
}

runEnhancementsMigration();
