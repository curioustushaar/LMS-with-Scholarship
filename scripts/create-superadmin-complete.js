/**
 * Create Superadmin User - Node.js Script
 * 
 * This script creates the superadmin user using Supabase Admin API
 * Run this with: node create-superadmin-complete.js
 * 
 * Prerequisites:
 * 1. .env file with SUPABASE credentials
 * 2. create-superadmin-system.sql already executed
 * 3. Node.js installed with @supabase/supabase-js package
 */

require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

// Load credentials from .env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const superadminEmail = process.env.SUPERADMIN_EMAIL || 'superadmin@lms.com'
const superadminPassword = process.env.SUPERADMIN_PASSWORD || 'Super@Admin123!'
const superadminName = process.env.SUPERADMIN_NAME || 'Super Administrator'

// Validation
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials in .env file')
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

if (!superadminEmail || !superadminPassword) {
  console.error('❌ Error: Missing superadmin credentials in .env file')
  console.error('   Required: SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD')
  process.exit(1)
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createSuperadminUser() {
  console.log('🚀 Starting Superadmin User Creation...\n')
  
  try {
    // Step 1: Check if user already exists
    console.log('📋 Step 1: Checking if user already exists...')
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Error listing users:', listError.message)
      return
    }

    const existingUser = existingUsers.users.find(u => u.email === superadminEmail)
    
    let userId

    if (existingUser) {
      console.log('ℹ️  User already exists:', existingUser.email)
      console.log('   User ID:', existingUser.id)
      userId = existingUser.id
      
      // Update user metadata
      console.log('\n📋 Step 2: Updating user metadata...')
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        {
          email_confirm: true,
          user_metadata: {
            full_name: superadminName,
            role: 'superadmin'
          },
          app_metadata: {
            role: 'superadmin',
            provider: 'email'
          }
        }
      )

      if (updateError) {
        console.error('❌ Error updating user metadata:', updateError.message)
      } else {
        console.log('✅ User metadata updated successfully')
      }
    } else {
      // Create new user
      console.log('📋 Step 2: Creating new superadmin user...')
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: superadminEmail,
        password: superadminPassword,
        email_confirm: true,
        user_metadata: {
          full_name: superadminName,
          role: 'superadmin'
        },
        app_metadata: {
          role: 'superadmin',
          provider: 'email'
        }
      })

      if (createError) {
        console.error('❌ Error creating user:', createError.message)
        return
      }

      console.log('✅ Superadmin user created successfully')
      console.log('   Email:', newUser.user.email)
      console.log('   User ID:', newUser.user.id)
      userId = newUser.user.id
    }

    // Step 3: Update profile in database
    console.log('\n📋 Step 3: Updating profile in database...')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: superadminEmail,
        full_name: superadminName,
        role: 'superadmin',
        account_status: 'active',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select()
      .single()

    if (profileError) {
      console.error('❌ Error updating profile:', profileError.message)
      return
    }

    console.log('✅ Profile updated to superadmin role')

    // Step 4: Verify setup
    console.log('\n📋 Step 4: Verifying superadmin setup...')
    const { data: verifyProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, account_status, created_at')
      .eq('id', userId)
      .eq('role', 'superadmin')
      .single()

    if (verifyError || !verifyProfile) {
      console.error('❌ Verification failed:', verifyError?.message || 'Profile not found')
      return
    }

    // Success!
    console.log('\n✨✨✨ SUCCESS! Superadmin user is properly configured! ✨✨✨\n')
    console.log('📧 Email:', verifyProfile.email)
    console.log('👤 Name:', verifyProfile.full_name)
    console.log('🎭 Role:', verifyProfile.role)
    console.log('✅ Status:', verifyProfile.account_status)
    console.log('📅 Created:', new Date(verifyProfile.created_at).toLocaleString())
    
    console.log('\n⚠️  IMPORTANT SECURITY STEPS:')
    console.log('   1. Login with these credentials from your .env file')
    console.log('   2. IMMEDIATELY change the password after first login')
    console.log('   3. Update SUPERADMIN_PASSWORD in .env file with new password')
    console.log('   4. Never share superadmin credentials')
    console.log('   5. Enable 2FA if available')
    
    console.log('\n🔗 Login URL: http://localhost:3001/login')
    console.log('📧 Email: ' + superadminEmail)
    console.log('🔑 Password: (check .env file - SUPERADMIN_PASSWORD)')
    
    console.log('\n✅ Setup complete! You can now login as superadmin.\n')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    console.error(error)
  }
}

// Run the script
createSuperadminUser()
  .then(() => {
    console.log('✨ Script execution completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
