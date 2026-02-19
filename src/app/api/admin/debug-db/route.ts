import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // 1. Inspect profiles columns (by fetching one row)
    const { data: profileSample, error: profileError } = await supabaseAdmin.from('profiles').select('*').limit(1)

    // 2. Count profiles
    const { count: profilesCount } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true })

    // 3. Count users
    const { count: usersCount } = await supabaseAdmin.from('users').select('*', { count: 'exact', head: true })

    // 4. Count task submissions (Exams?)
    const { count: submissionsCount } = await supabaseAdmin.from('task_submissions').select('*', { count: 'exact', head: true })

    return NextResponse.json({
      profiles: {
        count: profilesCount,
        sample: profileSample?.[0] || {},
        error: profileError?.message
      },
      users: {
        count: usersCount
      },
      submissions: {
        count: submissionsCount
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message })
  }
}
