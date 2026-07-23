import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
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

    const { data, error } = await supabaseAdmin
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
 * Get all badges and calculate system stats
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    // 1. Fetch all badges
    const { data: badges, error: badgesError } = await supabaseAdmin
      .from('badges')
      .select('*')
      .order('created_at', { ascending: false })

    if (badgesError) {
      return NextResponse.json(
        { error: 'Failed to fetch badges', details: badgesError.message },
        { status: 500 }
      )
    }

    // 2. Fetch user_badges to calculate statistics
    const { data: userBadges, error: ubError } = await supabaseAdmin
      .from('user_badges')
      .select('badge_id')

    // 3. Fetch count of active students
    const { count: studentCount, error: studentError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student')

    const totalEarned = userBadges?.length || 0
    const totalStudents = studentCount || 0
    const avgPerStudent = totalStudents > 0 ? parseFloat((totalEarned / totalStudents).toFixed(1)) : 0

    // 4. Compute badge counts and find the most popular badge
    const badgeCounts: Record<string, number> = {}
    let mostPopularId = null
    let maxCount = 0
    if (userBadges) {
      for (const ub of userBadges) {
        badgeCounts[ub.badge_id] = (badgeCounts[ub.badge_id] || 0) + 1
        if (badgeCounts[ub.badge_id] > maxCount) {
          maxCount = badgeCounts[ub.badge_id]
          mostPopularId = ub.badge_id
        }
      }
    }
    const mostPopular = badges.find(b => b.id === mostPopularId)?.name || '-'

    // 5. Map earned counts directly onto the badge data objects
    const badgesWithCount = badges.map(badge => ({
      ...badge,
      earned_count: badgeCounts[badge.id] || 0
    }))

    return NextResponse.json({
      success: true,
      data: badgesWithCount,
      count: badges.length,
      stats: {
        total: badges.length,
        earned: totalEarned,
        mostPopular,
        avgPerStudent
      }
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

