require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function runSchoolMigration() {
  console.log('🚀 Starting School Partner Module Migration...');
  
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

  const sqlFilePath = path.join(__dirname, '../migrations/20260828_school_partner_module.sql');
  const sql = fs.readFileSync(sqlFilePath, 'utf8');

  try {
    // Attempt exec_sql RPC
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.warn('⚠️ exec_sql RPC error (will test direct table queries):', error.message);
      console.log('ℹ️ If exec_sql RPC is not enabled on your Supabase instance, please run migrations/20260828_school_partner_module.sql in Supabase SQL Editor.');
    } else {
      console.log('✅ SQL Schema applied successfully via exec_sql!');
    }

    // Check / Seed sample showcase schools
    console.log('🌱 Checking / Seeding sample partner schools...');

    const sampleSchools = [
      {
        id: 'sch-inst-001',
        school_id: 'SCH000101',
        name: 'ABC Public School',
        udise_code: '09012345678',
        school_type: 'Private',
        board: 'CBSE',
        address: 'Sector 15, Rohini',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110085',
        contact_person_name: 'Dr. Ramesh Chandra',
        designation: 'Principal',
        official_email: 'abcschool@gmail.com',
        mobile: '+91 9876500101',
        status: 'ACTIVE',
        bank_details: {
          beneficiary_name: 'ABC Public School Educational Trust',
          account_number: '91802003881928',
          ifsc_code: 'HDFC0001234',
          bank_name: 'HDFC Bank',
          document_url: '',
          is_verified: true
        }
      },
      {
        id: 'sch-inst-002',
        school_id: 'SCH000102',
        name: 'Delhi Public School (DPS) Greater Noida',
        udise_code: '09023456789',
        school_type: 'Private',
        board: 'CBSE',
        address: 'Knowledge Park III',
        city: 'Greater Noida',
        state: 'Uttar Pradesh',
        pincode: '201310',
        contact_person_name: 'Mrs. Sunita Verma',
        designation: 'Scholarship Coordinator',
        official_email: 'dps.gnoida@schoolnet.in',
        mobile: '+91 9876500102',
        status: 'ACTIVE',
        bank_details: {
          beneficiary_name: 'DPS Greater Noida Society',
          account_number: '50100293847119',
          ifsc_code: 'ICIC0000456',
          bank_name: 'ICICI Bank',
          document_url: '',
          is_verified: true
        }
      },
      {
        id: 'sch-inst-003',
        school_id: 'SCH000103',
        name: 'St. Xavier High School',
        udise_code: '09034567890',
        school_type: 'Private',
        board: 'ICSE',
        address: 'Park Street Campus',
        city: 'Patna',
        state: 'Bihar',
        pincode: '800001',
        contact_person_name: 'Father Joseph Mathew',
        designation: 'Principal',
        official_email: 'stxavier.patna@edu.in',
        mobile: '+91 9876500103',
        status: 'PENDING',
        bank_details: {}
      }
    ];

    for (const school of sampleSchools) {
      const { data: existing } = await supabase.from('schools').select('id').eq('school_id', school.school_id).maybeSingle();
      if (!existing) {
        const { error: insErr } = await supabase.from('schools').insert(school);
        if (insErr) {
          console.warn(`Could not insert sample school ${school.school_id}:`, insErr.message);
        } else {
          console.log(`✅ Seeded school: ${school.name} (${school.school_id})`);
        }
      } else {
        console.log(`ℹ️ School ${school.school_id} already exists.`);
      }
    }

    // Seed School - Scholarship Assignment for sch-1
    const { data: targetScheme } = await supabase.from('scholarships').select('id, title').limit(1).maybeSingle();
    const schemeId = targetScheme?.id || 'sch-1';

    const assignments = [
      {
        id: 'ss-001',
        school_id: 'SCH000101',
        scholarship_id: schemeId,
        registration_fee: 100,
        incentive_per_verified_registration: 20,
        start_date: '2026-08-01',
        end_date: '2026-09-20',
        status: 'ACTIVE'
      },
      {
        id: 'ss-002',
        school_id: 'SCH000102',
        scholarship_id: schemeId,
        registration_fee: 100,
        incentive_per_verified_registration: 25,
        start_date: '2026-08-01',
        end_date: '2026-09-20',
        status: 'ACTIVE'
      }
    ];

    for (const assign of assignments) {
      const { data: existingAssn } = await supabase
        .from('school_scholarships')
        .select('id')
        .eq('school_id', assign.school_id)
        .eq('scholarship_id', assign.scholarship_id)
        .maybeSingle();

      if (!existingAssn) {
        const { error: assnErr } = await supabase.from('school_scholarships').insert(assign);
        if (!assnErr) {
          console.log(`✅ Assigned scholarship ${assign.scholarship_id} to ${assign.school_id} (Fee: ₹${assign.registration_fee}, Incentive: ₹${assign.incentive_per_verified_registration})`);
        }
      }
    }

    console.log('🎉 School module migration check complete!');
  } catch (err) {
    console.error('💥 Migration exception:', err);
  }
}

runSchoolMigration();
