const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()
const fs = require('fs')
const path = require('path')

async function runMigration() {
  console.log('🚀 Starting comprehensive ticket fix migration...\n')

  // Get credentials from environment
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env file')
    console.error('   Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
    process.exit(1)
  }

  console.log('✅ Credentials found')
  console.log('📡 Connecting to Supabase...')
  console.log('   URL:', supabaseUrl)
  console.log()

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  console.log('=' .repeat(80))
  console.log('📋 IMPORTANT: Run this SQL in Supabase SQL Editor')
  console.log('=' .repeat(80))
  console.log()
  console.log('1. Open Supabase Dashboard: https://supabase.com/dashboard')
  console.log('2. Go to: SQL Editor')
  console.log('3. Copy and paste the contents of: fix-ticket-status-update.sql')
  console.log('4. Click "Run" button')
  console.log()
  console.log('=' .repeat(80))
  console.log()

  // Read and display the SQL
  const sqlFile = path.join(__dirname, 'fix-ticket-status-update.sql')
  
  if (!fs.existsSync(sqlFile)) {
    console.error('❌ SQL file not found:', sqlFile)
    process.exit(1)
  }

  const sql = fs.readFileSync(sqlFile, 'utf8')
  
  console.log('📄 SQL Migration Preview (first 500 chars):')
  console.log('-'.repeat(80))
  console.log(sql.substring(0, 500) + '...')
  console.log('-'.repeat(80))
  console.log()
  console.log(`📝 Full SQL file: ${sqlFile}`)
  console.log(`📏 Size: ${sql.length} characters`)
  console.log()

  // Try to test connection
  try {
    console.log('🧪 Testing Supabase connection...')
    const { data, error } = await supabase
      .from('tickets')
      .select('id')
      .limit(1)
    
    if (error) {
      console.error('⚠️  Connection test failed:', error.message)
      console.log('   But you can still run the SQL manually in Supabase dashboard')
    } else {
      console.log('✅ Connection successful!')
      console.log(`   Found ${data?.length || 0} ticket(s) in database`)
    }
  } catch (error) {
    console.error('⚠️  Connection error:', error.message)
  }

  console.log()
  console.log('=' .repeat(80))
  console.log('🎯 Next Steps:')
  console.log('=' .repeat(80))
  console.log()
  console.log('1. ✅ Copy the SQL file content')  
  console.log('2. ✅ Run it in Supabase SQL Editor')
  console.log('3. ✅ Look for "MIGRATION COMPLETE!" message')
  console.log('4. ✅ Restart your dev server: npm run dev')
  console.log('5. ✅ Test ticket status update in admin panel')
  console.log()
  console.log('Expected console output after fix:')
  console.log('  ✅ UPDATE SUCCESSFUL via RPC!')
  console.log()
}

runMigration().catch(console.error)
