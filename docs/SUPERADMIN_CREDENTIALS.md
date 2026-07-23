# 🎯 SUPERADMIN CREDENTIALS - Quick Reference

## 📧 Default Credentials

Superadmin credentials `.env` file mein properly stored hain:

```env
SUPERADMIN_EMAIL=superadmin@lms.com
SUPERADMIN_PASSWORD=Super@Admin123!
SUPERADMIN_NAME=Super Administrator
```

---

## 🚀 One-Line Setup

Database tables banne ke baad, sirf ek command se setup complete:

```bash
npm run setup:superadmin
```

---

## 🔐 Login Information

**Login URL:** http://localhost:3001/login

**Credentials:**
- **Email:** superadmin@lms.com  
- **Password:** Super@Admin123!

⚠️ **Security Warning:**  
First login ke baad immediately password change karen aur `.env` file update karen!

---

## 📁 All Setup Files

| File | Purpose |
|------|---------|
| `.env` | Credentials stored ✅ |
| `create-superadmin-system.sql` | Database tables & triggers |
| `setup-superadmin-user.sql` | SQL user creation script |
| `create-superadmin-complete.js` | Automatic setup (Node.js) |
| `SUPERADMIN_QUICK_SETUP.md` | Complete setup guide |
| `SUPERADMIN_CREDENTIALS.md` | This file |

---

## ✅ Complete Setup Process

### Method 1: Automatic (Best) ⚡

```bash
# 1. Database tables banayen (Supabase SQL Editor)
# Run: create-superadmin-system.sql

# 2. User create karen (automatic)
npm run setup:superadmin

# 3. Login karen
# URL: http://localhost:3001/login
# Email: superadmin@lms.com
# Password: Super@Admin123!
```

### Method 2: Manual SQL 📝

```bash
# 1. Database tables (Supabase SQL Editor)
# Run: create-superadmin-system.sql

# 2. User create (Supabase SQL Editor)
# Run: setup-superadmin-user.sql
# Note: Pehle Supabase Dashboard se user banana padega

# 3. Login karen
```

### Method 3: Dashboard Only 🖱️

```bash
# 1. Database tables (Supabase SQL Editor)
# Run: create-superadmin-system.sql

# 2. Supabase Dashboard → Authentication → Users
#    - Add User
#    - Email: superadmin@lms.com
#    - Password: Super@Admin123!
#    - Auto Confirm: Yes

# 3. SQL Editor mein role update:
UPDATE profiles 
SET role = 'superadmin', 
    full_name = 'Super Administrator',
    account_status = 'active'
WHERE id = 'USER_ID_FROM_STEP_2';

# 4. Login karen
```

---

## 🔍 Verification

Database mein check karen:

```sql
SELECT id, email, full_name, role, account_status 
FROM profiles 
WHERE email = 'superadmin@lms.com';
```

Expected result:
- **Email:** superadmin@lms.com
- **Role:** superadmin
- **Status:** active

---

## 🎯 Features Access

Login karne ke baad aap kar sakte hain:

✅ **Admin Management**
- Create new admins
- View all admins
- Track admin activities
- Deactivate admins

✅ **Activity Tracking**
- Courses added
- Students enrolled
- Projects evaluated
- Tickets resolved
- Tasks created
- Videos uploaded
- Badges awarded

✅ **Analytics Dashboard**
- System overview
- Top performing admins
- Recent activity timeline
- Performance metrics

---

## ⚠️ Security Best Practices

1. ✅ **Change password immediately** after first login
2. ✅ **Update .env file** with new password
3. ✅ **Never commit .env** to git
4. ✅ **Use strong password** in production (min 12 chars, mixed case, numbers, symbols)
5. ✅ **Different credentials** for dev/staging/production
6. ✅ **Enable 2FA** if available
7. ✅ **Rotate credentials** regularly (quarterly)
8. ✅ **Limit access** - only give to trusted team members

---

## 🆘 Troubleshooting

### Can't login?
```sql
-- Check if user exists
SELECT * FROM profiles WHERE email = 'superadmin@lms.com';

-- If role is not 'superadmin', update it:
UPDATE profiles SET role = 'superadmin' WHERE email = 'superadmin@lms.com';
```

### "Superadmin Panel" button not visible?
1. Logout and login again
2. Clear browser cache
3. Check role in database (should be 'superadmin')

### Setup script error?
- Check `.env` file for correct Supabase credentials
- Ensure `create-superadmin-system.sql` ran successfully
- Check Supabase project is running

---

## 📞 Quick Commands

```bash
# Run automatic setup
npm run setup:superadmin

# Start development server
npm run dev

# Check logs
# Supabase Dashboard → Logs
```

---

## 🎉 Summary

**Everything Ready:**
- ✅ Credentials in `.env`
- ✅ Database scripts created
- ✅ Automatic setup script ready
- ✅ Manual setup guides ready
- ✅ Security best practices documented

**Next:** Run setup and start using! 🚀

---

**For detailed guide, see:** [SUPERADMIN_QUICK_SETUP.md](SUPERADMIN_QUICK_SETUP.md)
