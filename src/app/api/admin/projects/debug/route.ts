import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { count, error: countError } = await supabaseAdmin
      .from('projects')
      .select('id', { count: 'exact', head: false })

    if (countError) {
      return NextResponse.json({ success: false, error: countError.message }, { status: 500 })
    }

    const { data: rows, error: rowsError } = await supabaseAdmin
      .from('projects')
      .select('id, title, status, user_id, course_id, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    if (rowsError) {
      return NextResponse.json({ success: false, error: rowsError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, count, rows })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
