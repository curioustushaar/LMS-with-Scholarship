import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

/**
 * POST /api/admin/users/[id]/badges
 * Award badge to a user
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { id: userId } = params
    const body = await request.json()
    const { badge_id } = body

    if (!badge_id) {
      return NextResponse.json(
        { error: 'badge_id is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if badge exists
    const { data: badge, error: badgeError } = await supabase
      .from('badges')
      .select('id, name')
      .eq('id', badge_id)
      .single()

    if (badgeError || !badge) {
      return NextResponse.json(
        { error: 'Badge not found' },
        { status: 404 }
      )
    }

    // Check if user already has this badge
    const { data: existing } = await supabase
      .from('user_badges')
      .select('id')
      .eq('user_id', userId)
      .eq('badge_id', badge_id)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'User already has this badge' },
        { status: 409 }
      )
    }

    // Award badge
    const userBadgeData = {
      user_id: userId,
      badge_id,
      awarded_at: new Date().toISOString(),
      awarded_by: authResult.id
    }

    const { data, error } = await supabase
      .from('user_badges')
      .insert(userBadgeData)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to award badge', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: `Badge "${badge.name}" awarded to ${user.full_name}`
    }, { status: 201 })

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/users/[id]/badges
 * Get all badges for a user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { id: userId } = params

    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        *,
        badges(*),
        awarded_by_user:users!user_badges_awarded_by_fkey(id, full_name)
      `)
      .eq('user_id', userId)
      .order('awarded_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch user badges', details: error.message },
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
