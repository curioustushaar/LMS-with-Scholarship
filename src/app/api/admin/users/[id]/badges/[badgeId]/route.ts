import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * DELETE /api/admin/users/[id]/badges/[badgeId]
 * Remove badge from a user
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; badgeId: string } }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { id: userId, badgeId } = params

    // Check if user badge exists
    const { data: userBadge, error: fetchError } = await supabase
      .from('user_badges')
      .select(`
        *,
        users!user_badges_user_id_fkey(full_name),
        badges(name)
      `)
      .eq('user_id', userId)
      .eq('badge_id', badgeId)
      .single()

    if (fetchError || !userBadge) {
      return NextResponse.json(
        { error: 'Badge assignment not found' },
        { status: 404 }
      )
    }

    // Delete the badge assignment
    const { error } = await supabase
      .from('user_badges')
      .delete()
      .eq('user_id', userId)
      .eq('badge_id', badgeId)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to remove badge', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Badge "${userBadge.badges.name}" removed from ${userBadge.users.full_name}`
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
