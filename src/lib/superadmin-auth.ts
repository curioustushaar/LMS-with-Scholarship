import { supabaseAdmin } from '@/lib/supabase'

/**
 * Shared helper to verify authentic superadmin access.
 * Validates the Supabase JWT Bearer token and checks public.profiles role.
 */
export async function verifySuperadminAccess(request: Request): Promise<{ authorized: boolean; userId?: string }> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) return { authorized: false }

  const token = authHeader.replace('Bearer ', '').trim()
  if (!token || token.length < 20) return { authorized: false }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !user) {
      console.warn('Superadmin auth verification failed:', error?.message)
      return { authorized: false }
    }

    const isSuperadminEmail = 
      user.email?.toLowerCase() === (process.env.SUPERADMIN_EMAIL || 'superadmin@lms.com').toLowerCase()

    const userMetadataRole = user.user_metadata?.role || user.app_metadata?.role

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.role === 'superadmin' || userMetadataRole === 'superadmin' || isSuperadminEmail) {
      if (!profile || profile.role !== 'superadmin') {
        try {
          await supabaseAdmin.from('profiles').upsert({
            id: user.id,
            email: user.email?.toLowerCase(),
            full_name: 'Super Administrator',
            role: 'superadmin',
            account_status: 'active',
            updated_at: new Date().toISOString(),
          })
        } catch (upsertErr) {
          console.warn('Superadmin profile upsert notice:', upsertErr)
        }
      }
      return { authorized: true, userId: user.id }
    }

    console.warn(`Unauthorized superadmin attempt by user ${user.id} with role ${profile?.role || userMetadataRole}`)
    return { authorized: false }
  } catch (err) {
    console.error('Exception in verifySuperadminAccess:', err)
    return { authorized: false }
  }
}

/**
 * Standard JSON error response helper
 */
export function errorResponse(message: string, status: number = 500) {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Standard JSON success response helper
 */
export function successResponse(data: any, message?: string) {
  return new Response(JSON.stringify({ success: true, data, message }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
