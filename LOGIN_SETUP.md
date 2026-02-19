# 🔐 LOGIN KAISE KAREIN - QUICK GUIDE

## Step 1: Supabase Dashboard Mein User Banao

1. **Supabase Dashboard kholo**: https://ajuwcsnwfrwktvjdmkru.supabase.co

2. **Authentication Section Mein Jao**:
   - Left sidebar mein "Authentication" pe click karo
   - "Users" tab select karo

3. **New User Add Karo**:
   - "Add User" button pe click karo
   - **Email**: Apna email dalo (example: `admin@lms.com`)
   - **Password**: Strong password set karo (example: `Admin@123456`)
   - "Create User" pe click karo

## Step 2: User Ko Admin Banao

1. **SQL Editor Mein Jao**:
   - Left sidebar mein "SQL Editor" pe click karo
   - "New Query" select karo

2. **Ye Query Run Karo**:
```sql
-- Apne email se replace karo
UPDATE users SET role = 'admin' WHERE email = 'admin@lms.com';
```

3. **Run** button pe click karo

## Step 3: Login Karo LMS Admin Mein

1. **Dev Server Start Karo** (agar nahi chala hua):
```bash
cd LMS-admin
npm run dev
```

2. **Browser Mein Kholo**: http://localhost:3001/login

3. **Login Credentials Use Karo**:
   - **Email**: `admin@lms.com` (jo Supabase mein banaya)
   - **Password**: `Admin@123456` (jo Supabase mein set kiya)

4. **Sign In** button pe click karo

## ✅ Login Success!

Login successful hone ke baad aap `/admin/dashboard` pe redirect ho jaoge.

---

## 🆘 Agar Login Nahi Ho Raha?

### Problem 1: "Invalid login credentials"
**Solution**: 
- Check karo email aur password sahi hai
- Supabase Dashboard mein verify karo user create hua hai
- Password reset karke try karo

### Problem 2: "Access denied. Admin privileges required"
**Solution**:
- SQL query run karo user ko admin banane ke liye:
```sql
UPDATE users SET role = 'admin' WHERE email = 'YOUR_EMAIL';
```

### Problem 3: Email not found
**Solution**:
- Supabase Authentication section mein user create karo pehle
- Fir SQL query run karo users table mein entry ke liye:
```sql
INSERT INTO users (email, full_name, role, status) 
VALUES ('admin@lms.com', 'Admin User', 'admin', 'active')
ON CONFLICT (email) DO UPDATE SET role = 'admin';
```

---

## 📝 Test Login Credentials

Database mein already ek admin user hai:
- **Email**: `admin@lms.com`
- **Password**: Supabase Authentication mein set karna hoga

---

## 🔒 Production Ke Liye

Production environment mein:
1. Strong passwords use karo
2. Email verification enable karo
3. 2FA (Two Factor Authentication) add karo
4. Environment variables secure rakho
5. API keys public Github mein mat push karo

---

## 📞 Need Help?

Agar koi issue aa raha hai:
1. Browser console check karo (F12)
2. Network tab mein API calls check karo
3. Supabase Dashboard mein logs check karo
