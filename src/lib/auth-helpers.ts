import { supabase } from './supabase'

/**
 * Retrieves the genuine Supabase auth session token.
 * Refreshes session if expired or close to expiry.
 */
export async function getClientAuthToken(): Promise<string> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (!error && session?.access_token) {
      return session.access_token
    }
  } catch (err) {
    console.warn('Exception fetching Supabase session token:', err)
  }

  // Fallback to localStorage
  if (typeof window !== 'undefined') {
    return (
      localStorage.getItem('superadmin_token') ||
      localStorage.getItem('school_token') ||
      localStorage.getItem('supabase.auth.token') ||
      ''
    )
  }

  return ''
}

/**
 * Retrieves specifically the Superadmin authentication token.
 */
export async function getSuperadminClientAuthToken(): Promise<string> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (!error && session?.access_token) {
      return session.access_token
    }
  } catch (err) {
    console.warn('Exception fetching superadmin session token:', err)
  }

  if (typeof window !== 'undefined') {
    return (
      localStorage.getItem('superadmin_token') ||
      localStorage.getItem('supabase.auth.token') ||
      ''
    )
  }

  return ''
}

/**
 * Retrieves specifically the School Partner authentication token.
 */
export async function getSchoolClientAuthToken(): Promise<string> {
  if (typeof window !== 'undefined') {
    const schoolToken = localStorage.getItem('school_token')
    if (schoolToken) return schoolToken
  }

  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (!error && session?.access_token) {
      return session.access_token
    }
  } catch (err) {
    console.warn('Exception fetching school session token:', err)
  }

  if (typeof window !== 'undefined') {
    return localStorage.getItem('supabase.auth.token') || ''
  }

  return ''
}
