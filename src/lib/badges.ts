import { supabaseAdmin } from './supabase'

/**
 * Badge Awarding Helper Functions
 * Automatically check and award badges based on student achievements
 */

interface BadgeRule {
  id: string
  name: string
  description: string
  category: string
  rule_type: string
  rule_value: number
  rule_duration?: number
}

/**
 * Check and award task completion badges
 * Called after a task submission is approved
 */
export async function checkAndAwardTaskBadges(userId: string, taskId: string) {
  try {
    console.log('🏅 Checking task badges for user:', userId)

    // Get all task-related badge rules
    const { data: badgeRules, error: badgeError } = await supabaseAdmin
      .from('badges')
      .select('*')
      .eq('category', 'tasks')
      .eq('rule_type', 'task_submitted')

    if (badgeError || !badgeRules || badgeRules.length === 0) {
      console.log('ℹ️ No task badge rules found')
      return { success: true, badges_awarded: 0 }
    }

    console.log(`📋 Found ${badgeRules.length} task badge rules`)

    // Count student's approved task submissions
    const { data: approvedSubmissions, error: countError } = await supabaseAdmin
      .from('task_submissions')
      .select('id, submitted_at')
      .eq('user_id', userId)
      .eq('status', 'approved')

    if (countError) {
      console.error('❌ Error counting approved submissions:', countError.message)
      return { success: false, error: countError.message }
    }

    const approvedCount = approvedSubmissions?.length || 0
    console.log(`📊 Student has ${approvedCount} approved tasks`)

    let badgesAwarded = 0

    // Check each badge rule
    for (const rule of badgeRules) {
      // Check if student meets the criteria
      if (approvedCount >= rule.rule_value) {
        // Check if student already has this badge
        const { data: existingBadge } = await supabaseAdmin
          .from('user_badges')
          .select('id')
          .eq('user_id', userId)
          .eq('badge_id', rule.id)
          .maybeSingle()

        if (!existingBadge) {
          // Award the badge!
          const { error: awardError } = await supabaseAdmin
            .from('user_badges')
            .insert({
              user_id: userId,
              badge_id: rule.id,
              awarded_at: new Date().toISOString()
            })

          if (awardError) {
            console.error(`❌ Failed to award badge "${rule.name}":`, awardError.message)
          } else {
            console.log(`✅ Awarded badge: "${rule.name}" to user ${userId}`)
            badgesAwarded++
          }
        } else {
          console.log(`ℹ️ User already has badge: "${rule.name}"`)
        }
      } else {
        console.log(`⏳ Badge "${rule.name}" requires ${rule.rule_value} tasks (current: ${approvedCount})`)
      }
    }

    return {
      success: true,
      badges_awarded: badgesAwarded,
      total_approved_tasks: approvedCount
    }

  } catch (error: any) {
    console.error('💥 Error in checkAndAwardTaskBadges:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Check and award video completion badges
 * Called after a video is marked as watched
 */
export async function checkAndAwardVideoBadges(userId: string, videoId: string) {
  try {
    console.log('🏅 Checking video badges for user:', userId)

    // Get all video-related badge rules
    const { data: badgeRules, error: badgeError } = await supabaseAdmin
      .from('badges')
      .select('*')
      .eq('category', 'completion')
      .eq('rule_type', 'video_completed')

    if (badgeError || !badgeRules || badgeRules.length === 0) {
      console.log('ℹ️ No video badge rules found')
      return { success: true, badges_awarded: 0 }
    }

    // Count student's watched videos
    // Note: You'll need to implement video progress tracking
    // For now, this is a placeholder

    return { success: true, badges_awarded: 0, message: 'Video badges not implemented yet' }

  } catch (error: any) {
    console.error('💥 Error in checkAndAwardVideoBadges:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Check and award course completion badges
 * Called when a student completes all requirements
 */
export async function checkAndAwardCourseBadges(userId: string, courseId: string) {
  try {
    console.log('🏅 Checking course badges for user:', userId)

    // Get all course-related badge rules
    const { data: badgeRules, error: badgeError } = await supabaseAdmin
      .from('badges')
      .select('*')
      .eq('category', 'completion')
      .eq('rule_type', 'course_completed')

    if (badgeError || !badgeRules || badgeRules.length === 0) {
      console.log('ℹ️ No course badge rules found')
      return { success: true, badges_awarded: 0 }
    }

    // Check if student completed course requirements
    // This would need to check:
    // - All videos watched
    // - All tasks submitted and approved
    // - All quizzes passed
    // For now, this is a placeholder

    return { success: true, badges_awarded: 0, message: 'Course badges not implemented yet' }

  } catch (error: any) {
    console.error('💥 Error in checkAndAwardCourseBadges:', error.message)
    return { success: false, error: error.message }
  }
}
