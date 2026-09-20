/**
 * Audit Logger Utility
 * Safe, structured logging of sensitive SuperAdmin & Admin operations.
 * Never logs raw passwords, JWT tokens, OTPs, or private document payloads.
 */

import { supabaseAdmin } from './supabase'

export interface AuditLogEntry {
  userId: string
  userEmail?: string
  role?: string
  action: string
  targetResource: string
  targetId?: string
  ipAddress?: string
  status?: 'success' | 'failure'
  details?: Record<string, any>
}

// Sanitize details to strip any sensitive key patterns before logging
function sanitizeDetails(details?: Record<string, any>): Record<string, any> {
  if (!details) return {}

  const sanitized: Record<string, any> = {}
  const sensitiveKeys = ['password', 'token', 'secret', 'otp', 'jwt', 'auth', 'private']

  Object.keys(details).forEach((key) => {
    const lowerKey = key.toLowerCase()
    if (sensitiveKeys.some((s) => lowerKey.includes(s))) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof details[key] === 'object' && details[key] !== null) {
      sanitized[key] = '[OBJECT]'
    } else {
      sanitized[key] = details[key]
    }
  })

  return sanitized
}

export async function logAuditAction(entry: AuditLogEntry): Promise<void> {
  const timestamp = new Date().toISOString()
  const cleanDetails = sanitizeDetails(entry.details)

  // Console log for server monitoring
  console.log(
    `[AUDIT LOG ${timestamp}] Action: "${entry.action}" | Resource: "${entry.targetResource}" | User: "${entry.userId}" | Status: ${entry.status || 'success'}`
  )

  // Asynchronously attempt DB insert into system_audit_logs if table exists
  try {
    await supabaseAdmin.from('system_audit_logs').insert({
      user_id: entry.userId,
      user_email: entry.userEmail || '',
      role: entry.role || 'admin',
      action: entry.action,
      target_resource: entry.targetResource,
      target_id: entry.targetId || null,
      ip_address: entry.ipAddress || '127.0.0.1',
      status: entry.status || 'success',
      details: cleanDetails,
      created_at: timestamp,
    })
  } catch (err) {
    // Ignore database log failures to prevent blocking core operations
  }
}
