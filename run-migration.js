// Migration script to add created_by_admin_id column
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    // Read environment variables from .env file
    const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
    const envLines = envContent.split('\n');
    const env = {};
    
    envLines.forEach(line => {
      const match = line.match(/^([^#=]+)=(.+)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        env[key] = value;
      }
    });

    // Import Supabase
    const { createClient } = require('@supabase/supabase-js');
    
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
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
      const sqlContent = fs.readFileSync(path.join(__dirname, 'add-created-by-admin-column.sql'), 'utf8');
      console.log(sqlContent);
      console.log('--------------------------------------------------');
      process.exit(1);
    }

    console.log('✅ Migration completed successfully!');
    console.log('Column "created_by_admin_id" added to profiles table');

  } catch (error) {
    console.error('💥 Error:', error.message);
    console.log('\n📝 Please run this SQL manually in Supabase SQL Editor:');
    console.log('--------------------------------------------------');
    const sqlContent = fs.readFileSync(path.join(__dirname, 'add-created-by-admin-column.sql'), 'utf8');
    console.log(sqlContent);
    console.log('--------------------------------------------------');
    process.exit(1);
  }
}

runMigration();
