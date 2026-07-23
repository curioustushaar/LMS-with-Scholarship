# 🚀 Vercel Deployment Guide for LMS Admin

## Prerequisites

1. **Vercel Account**: Create account at [vercel.com](https://vercel.com)
2. **Vercel CLI** (Optional): `npm i -g vercel`
3. **GitHub Repository**: Code pushed to GitHub
4. **Supabase Project**: Active Supabase project

---

## 📋 Environment Variables Required

Before deploying, collect these values:

### 🔑 Supabase (from your Supabase Dashboard → Settings → API)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (⚠️ Keep Secret!)
```

### 🔐 JWT Secret (Generate New)
```bash
# Generate on Windows PowerShell:
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# Or use online generator:
# https://generate-secret.vercel.app/64
```

### 🌐 Application URLs
```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_API_URL=https://your-app.vercel.app/api
```

### 📝 Complete Environment Variables List
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Authentication
JWT_SECRET=
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Application
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_API_URL=
NODE_ENV=production

# Security
NEXT_PUBLIC_ALLOWED_ORIGINS=https://your-app.vercel.app
COOKIE_SECURE=true
COOKIE_HTTP_ONLY=true
COOKIE_SAME_SITE=lax
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
LOGIN_MAX_ATTEMPTS=5
LOGIN_WINDOW_MS=900000

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp,application/pdf
```

---

## 🎯 Method 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Import Project
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your GitHub repository: `chikkucoder/admin`
4. Choose the branch: `validation-fixes-and-certificate-eligibility` (or `main`)

### Step 2: Configure Project
1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: Leave as `.` (root)
3. **Build Command**: `npm run build` (auto-detected)
4. **Output Directory**: `.next` (auto-detected)

### Step 3: Add Environment Variables
Click **"Environment Variables"** and add all variables from the list above:

```
NEXT_PUBLIC_SUPABASE_URL         → your-value
NEXT_PUBLIC_SUPABASE_ANON_KEY    → your-value
SUPABASE_SERVICE_ROLE_KEY        → your-value
JWT_SECRET                       → your-generated-secret
NEXT_PUBLIC_APP_URL              → https://your-app.vercel.app
NEXT_PUBLIC_API_URL              → https://your-app.vercel.app/api
NODE_ENV                         → production
...etc
```

**⚠️ Important**: 
- Add environment variables for **Production**, **Preview**, and **Development**
- Use different JWT_SECRET for each environment (recommended)

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait for build to complete (2-3 minutes)
3. Visit your deployed app at `https://your-app.vercel.app`

---

## 🖥️ Method 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Login
```bash
vercel login
```

### Step 3: Deploy
```bash
# From project root directory
cd d:\lmsadmin\LMS-admin

# Deploy to production
vercel --prod

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? [Your account]
# - Link to existing project? No
# - Project name? lms-admin (or your choice)
# - Directory? ./
```

### Step 4: Add Environment Variables
```bash
# Add each environment variable
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add JWT_SECRET
# ... add all variables

# Or add via dashboard: vercel.com/[username]/[project]/settings/environment-variables
```

### Step 5: Redeploy with Environment Variables
```bash
vercel --prod
```

---

## 🔄 Post-Deployment Setup

### 1. Update Supabase CORS Settings
In Supabase Dashboard → Settings → API → CORS:
```
https://your-app.vercel.app
```

### 2. Update Authentication Redirect URLs
In Supabase Dashboard → Authentication → URL Configuration:
```
Site URL: https://your-app.vercel.app
Redirect URLs: 
  - https://your-app.vercel.app/admin/**
  - https://your-app.vercel.app/api/**
```

### 3. Test Admin Login
1. Visit `https://your-app.vercel.app/admin/login`
2. Login with admin credentials
3. Verify all features work

### 4. Update Certificate URLs
Certificates will now generate with your production URL:
```
https://your-app.vercel.app/certificate/{certificate-number}
```

---

## 🔐 Security Checklist

- [ ] Different JWT_SECRET for production
- [ ] COOKIE_SECURE=true in production
- [ ] Supabase RLS policies enabled
- [ ] Service Role Key never exposed to client
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] .env file in .gitignore

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Check build logs in Vercel dashboard
# Common issues:
# - Missing environment variables
# - TypeScript errors
# - Import path issues
```

### Environment Variables Not Working
1. Check variable names (case-sensitive)
2. Ensure NEXT_PUBLIC_ prefix for client variables
3. Redeploy after adding variables
4. Clear browser cache

### Database Connection Issues
1. Verify Supabase URL and keys
2. Check Supabase project is active
3. Verify RLS policies allow admin access
4. Check CORS settings in Supabase

### Certificate Generation Fails
1. Update NEXT_PUBLIC_APP_URL to your Vercel URL
2. Test certificate URL: `https://your-app.vercel.app/certificate/test-id`

---

## 📊 Monitoring

### View Logs
```bash
# Real-time logs
vercel logs

# Or visit: vercel.com/[username]/[project]/deployments/[deployment-id]/logs
```

### Analytics
- Visit Vercel Dashboard → Analytics
- Monitor page views, performance, errors

---

## 🔄 Auto-Deployments

Vercel automatically deploys when you push to GitHub:

- **Production**: Push to `main` branch
- **Preview**: Push to any other branch

### Configure Auto-Deploy
1. Go to Vercel Dashboard → Settings → Git
2. Enable **"Auto-Deploy"**
3. Set production branch to `main`

---

## 🎉 Quick Deploy Button

Add this to your README.md for one-click deploy:

```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/chikkucoder/admin)
```

---

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Supabase Docs**: https://supabase.com/docs

---

## 🚀 Quick Commands Reference

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Deploy to preview
vercel

# View logs
vercel logs

# List deployments
vercel ls

# Environment variables
vercel env ls
vercel env add [name]
vercel env rm [name]

# Pull environment variables locally
vercel env pull

# Link local project to Vercel project
vercel link
```

---

**Happy Deploying! 🎉**
