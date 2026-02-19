import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

/**
 * POST /api/admin/badges
 * Create new badge
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const body = await request.json()
    const { name, description, icon_url, category, rule_type, rule_value, rule_duration } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const badgeData = {
      name,
      description: description || null,
      icon_url: icon_url || '🏆',
      category: category || 'achievement',
      rule_type: rule_type || 'manual',
      rule_value: rule_value ? parseInt(rule_value) : 1,
      rule_duration: rule_duration ? parseInt(rule_duration) : null
    }

    const { data, error } = await supabase
      .from('badges')
      .insert(badgeData)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create badge', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Badge created successfully'
    }, { status: 201 })

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/badges
 * Get all badges
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch badges', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      count: data?.length || 0
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
