// Migration script to add created_by_admin_id column
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function runMigration() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase credentials in .env file');
      process.exit(1);
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('🔄 Running migration: Adding created_by_admin_id column...');

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add created_by_admin_id column to profiles table
        ALTER TABLE profiles 
        ADD COLUMN IF NOT EXISTS created_by_admin_id UUID REFERENCES profiles(id);

        -- Add index for better query performance
        CREATE INDEX IF NOT EXISTS idx_profiles_created_by_admin 
        ON profiles(created_by_admin_id);
      `
    });

    if (error) {
      console.error('❌ Migration failed:', error.message);
      console.log('\n📝 Please run this SQL manually in Supabase SQL Editor:');
      console.log('--------------------------------------------------');
      console.log(`
        -- Add created_by_admin_id column to profiles table
        ALTER TABLE profiles 
        ADD COLUMN IF NOT EXISTS created_by_admin_id UUID REFERENCES profiles(id);

        -- Add index for better query performance
        CREATE INDEX IF NOT EXISTS idx_profiles_created_by_admin 
        ON profiles(created_by_admin_id);
      `);
      console.log('--------------------------------------------------');
      process.exit(1);
    }

    console.log('✅ Migration completed successfully!');
    console.log('Column "created_by_admin_id" added to profiles table');

  } catch (error) {
    console.error('💥 Error:', error.message);
    console.log('\n📝 Please run this SQL manually in Supabase SQL Editor:');
    console.log('--------------------------------------------------');
    console.log(`
      -- Add created_by_admin_id column to profiles table
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS created_by_admin_id UUID REFERENCES profiles(id);

      -- Add index for better query performance
      CREATE INDEX IF NOT EXISTS idx_profiles_created_by_admin 
      ON profiles(created_by_admin_id);
    `);
    console.log('--------------------------------------------------');
    process.exit(1);
  }
}

runMigration();
