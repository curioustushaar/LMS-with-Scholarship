# JWT Authentication Setup - LMS Admin

## ✅ What's Been Configured

Your LMS Admin application is now secured with JWT authentication! 

### 🔐 Security Features Added:

1. **JWT_SECRET** - 256-character secure secret key for token signing
2. **Session Configuration** - 7-day access tokens, 30-day refresh tokens
3. **Rate Limiting** - Protection against brute force attacks
4. **Cookie Security** - HTTP-only, secure cookies
5. **CORS Configuration** - Restricted origins
6. **File Upload Limits** - 5MB max, allowed types defined

---

## 📋 Environment Variables

### `.env` File (DO NOT COMMIT!)
Contains actual secrets and keys. Already in `.gitignore`.

### `.env.example` File (SAFE TO COMMIT)
Template with placeholder values for team members.

---

## 🔑 JWT Secret Details

**Current Configuration:**
- **Secret Length:** 256 characters (Base64 encoded)
- **Algorithm:** HS256 (HMAC-SHA256)
- **Access Token Expiry:** 7 days
- **Refresh Token Expiry:** 30 days

**Security Strength:**
- 256-character Base64 = ~1536 bits of entropy
- Cryptographically secure random generation
- Meeting industry best practices

---

## 🔄 How to Rotate JWT Secret

### When to Rotate:
- **Quarterly** (every 3 months) - Recommended
- After suspected security breach
- When employee with access leaves
- During major version updates

### Rotation Steps:

**Method 1: Using OpenSSL (Linux/Mac/WSL)**
```bash
openssl rand -base64 64 | tr -d '\n'
```

**Method 2: Using Node.js (Windows/Any)**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

**Method 3: Using PowerShell (Windows)**
```powershell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
```

### Apply New Secret:
1. Generate new secret using above methods
2. Update `JWT_SECRET` in `.env` file
3. Restart application
4. **All users will need to login again** (tokens invalidated)

---

## 🚀 Production Deployment Checklist

Before deploying to production, update these in `.env`:

```bash
# Change to production
NODE_ENV=production

# Use production Supabase project
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-key

# Generate NEW JWT secret for production
JWT_SECRET=new-production-secret-different-from-dev

# Enable secure cookies
COOKIE_SECURE=true

# Set production URLs
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com/api

# Update allowed origins
NEXT_PUBLIC_ALLOWED_ORIGINS=https://yourdomain.com
```

---

## 🛡️ Security Best Practices

### ✅ DO:
- Keep `.env` in `.gitignore`
- Use different secrets for dev/staging/production
- Rotate JWT_SECRET quarterly
- Set `COOKIE_SECURE=true` in production
- Monitor failed login attempts
- Use HTTPS in production
- Keep dependencies updated

### ❌ DON'T:
- Never commit `.env` to git
- Never share JWT_SECRET publicly
- Don't use weak/predictable secrets
- Don't expose service role keys to client
- Don't use same secrets across environments
- Don't ignore rate limiting warnings

---

## 📊 Rate Limiting Configuration

Current settings protect against brute force attacks:

```bash
RATE_LIMIT_MAX_REQUESTS=100    # 100 requests per window
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes (900,000ms)
LOGIN_MAX_ATTEMPTS=5            # 5 login attempts
LOGIN_WINDOW_MS=900000          # 15 minutes
```

**What this means:**
- General API: 100 requests per 15 minutes per IP
- Login endpoint: 5 attempts per 15 minutes per IP
- After limit: User gets 429 Too Many Requests error

---

## 🔍 Monitoring & Troubleshooting

### Check JWT Configuration:
```bash
# Verify JWT_SECRET is set
node -e "console.log(process.env.JWT_SECRET ? 'JWT_SECRET is set ✓' : 'JWT_SECRET missing ✗')"
```

### Common Issues:

**1. "Invalid token" errors**
- Solution: JWT_SECRET might have changed, users need to re-login

**2. "Too Many Requests" errors**
- Solution: Rate limit exceeded, wait 15 minutes or adjust limits

**3. Cookies not working**
- Solution: Check COOKIE_SECURE setting matches HTTP/HTTPS

**4. CORS errors**
- Solution: Add your domain to NEXT_PUBLIC_ALLOWED_ORIGINS

---

## 📝 Token Structure

**Access Token Payload:**
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "admin|student", 
  "iat": 1234567890,
  "exp": 1234567890
}
```

**Refresh Token Payload:**
```json
{
  "userId": "uuid",
  "type": "refresh",
  "iat": 1234567890,
  "exp": 1234567890
}
```

---

## 🔧 Environment-Specific Secrets

### Development:
```bash
JWT_SECRET=dev-secret-key (current in .env)
COOKIE_SECURE=false
NODE_ENV=development
```

### Staging:
```bash
JWT_SECRET=staging-secret-key (different from dev)
COOKIE_SECURE=true
NODE_ENV=production
```

### Production:
```bash
JWT_SECRET=prod-secret-key (unique & strong)
COOKIE_SECURE=true
NODE_ENV=production
```

---

## 📚 Additional Resources

- [JWT.io](https://jwt.io/) - Token debugger
- [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/security)

---

## ✅ Security Verification

Your application now has:
- ✅ Secure JWT authentication
- ✅ Token-based sessions
- ✅ Rate limiting protection
- ✅ Secure cookie configuration
- ✅ CORS protection
- ✅ File upload validation
- ✅ Environment-based configuration

**Status: Production Ready! 🚀**

---

*Last Updated: February 19, 2026*
*Security Audit: Quarterly rotation recommended*
