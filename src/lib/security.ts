/**
 * Security Configuration
 * Centralized security settings for the application
 */

export const SecurityConfig = {
  // Rate limiting settings
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // Max requests per window
    maxLoginAttempts: 5, // Max login attempts
    loginWindowMs: 15 * 60 * 1000 // 15 minutes
  },

  // File upload limits
  fileUpload: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    maxAvatarSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    allowedDocumentTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  },

  // CORS settings
  cors: {
    allowedOrigins: process.env.NEXT_PUBLIC_ALLOWED_ORIGINS?.split(',').map((o) => o.trim()) || [
      'http://localhost:3001',
      'http://localhost:3000',
      'https://www.aagajfoundation.in',
      'https://aagajfoundation.in',
    ],
    allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },

  // Authentication settings
  auth: {
    tokenExpiryHours: 24,
    refreshTokenExpiryDays: 7,
    minPasswordLength: 8
  },

  // Database protection
  database: {
    enableRLS: true, // Row Level Security
    maxQueryResults: 1000,
    queryTimeout: 30000 // 30 seconds
  }
}

/**
 * Validate file upload
 */
export function validateFileUpload(file: File, type: 'image' | 'document' = 'document'): { valid: boolean; error?: string } {
  const config = SecurityConfig.fileUpload
  
  if (type === 'image') {
    if (file.size > config.maxAvatarSize) {
      return { valid: false, error: 'Image size exceeds 5MB limit' }
    }
    if (!config.allowedImageTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid image type. Only JPEG, PNG, WebP and GIF allowed' }
    }
  } else {
    if (file.size > config.maxFileSize) {
      return { valid: false, error: 'File size exceeds 50MB limit' }
    }
  }
  
  return { valid: true }
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  if (!input) return ''
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim()
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Check if password meets security requirements
 */
export function isStrongPassword(password: string): { valid: boolean; error?: string } {
  if (password.length < SecurityConfig.auth.minPasswordLength) {
    return { valid: false, error: `Password must be at least ${SecurityConfig.auth.minPasswordLength} characters` }
  }
  
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  
  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    return { valid: false, error: 'Password must contain uppercase, lowercase and number' }
  }
  
  return { valid: true }
}
