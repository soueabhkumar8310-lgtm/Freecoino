# 🎉 NEW SUPABASE PROJECT SETUP - COMPLETE!

## ✅ WHAT'S DONE:

### 1. **New Supabase Project Created** ✅
- **Name:** Freecoino
- **Region:** Mumbai (ap-south-1) - Closest to India
- **Project ID:** `fiagdlauajqzotxizmpc`
- **Status:** ACTIVE_HEALTHY
- **URL:** https://fiagdlauajqzotxizmpc.supabase.co
- **Cost:** FREE ($0/month)

### 2. **Database Schema Applied** ✅
All tables created:
- ✅ `profiles` - User profiles with coins balance
- ✅ `transactions` - All coin transactions
- ✅ `withdrawals` - Withdrawal requests
- ✅ `daily_bonuses` - Daily bonus tracking
- ✅ `offer_completions` - Offer tracking

All functions created:
- ✅ `handle_new_user()` - Auto-create profile on signup
- ✅ `handle_updated_at()` - Update timestamps
- ✅ `add_coins()` - Add coins to user
- ✅ `process_withdrawal()` - Process withdrawal request

All RLS policies enabled ✅

### 3. **Environment Variables Updated** ✅
- `.env.local` file updated with new credentials
- Old Supabase credentials replaced
- **NOTE:** Service Role Key needs to be added manually (see step below)

---

## 🚨 IMPORTANT NEXT STEPS:

### Step 1: Get Service Role Key
1. Visit: https://supabase.com/dashboard/project/fiagdlauajqzotxizmpc/settings/api
2. Scroll to "Service role" section
3. Click "Reveal" to see the key
4. Copy the service_role key
5. Paste in `.env.local` file (replace `YOUR_SERVICE_ROLE_KEY_HERE`)

### Step 2: Configure Google OAuth
1. Visit: https://supabase.com/dashboard/project/fiagdlauajqzotxizmpc/auth/providers
2. Enable Google provider
3. Add your Google OAuth credentials:
   - **Client ID:** `796105265741-dl66s79h5p9tk2h8sda8ffi4djvjr1da.apps.googleusercontent.com`
   - **Client Secret:** `Sourabh@123`
4. Click "Save"

### Step 3: Configure Email Settings
1. Visit: https://supabase.com/dashboard/project/fiagdlauajqzotxizmpc/auth/templates
2. **IMPORTANT:** Turn OFF "Confirm email" (same as before)
3. Set Site URL: `https://freecoino.vercel.app`
4. Add Redirect URLs:
   ```
   https://freecoino.vercel.app/auth/callback
   http://localhost:3000/auth/callback
   http://localhost:3001/auth/callback
   ```

### Step 4: Update Vercel Environment Variables
1. Visit: https://vercel.com/dashboard (your Freecoino project)
2. Go to: Settings > Environment Variables
3. Update these variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://fiagdlauajqzotxizmpc.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpYWdkbGF1YWpxem90eGl6bXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4OTc5MTcsImV4cCI6MjA5NjQ3MzkxN30.mYfRPL1Z-IOaFVv_XVZsouiaekFW3oYfeTf-Ta0H7Yk
   SUPABASE_SERVICE_ROLE_KEY=[your service role key from step 1]
   ```
4. Click "Save"
5. Redeploy the project

### Step 5: Test Locally
```bash
# Stop current dev server if running
# Then restart:
npm run dev

# Visit: http://localhost:3000/auth/signup
# Create a new test user
# Try login
```

---

## 📋 CREDENTIALS SUMMARY:

### New Supabase Project:
```
Project ID: fiagdlauajqzotxizmpc
URL: https://fiagdlauajqzotxizmpc.supabase.co
Region: ap-south-1 (Mumbai)

Anon Key: 
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpYWdkbGF1YWpxem90eGl6bXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4OTc5MTcsImV4cCI6MjA5NjQ3MzkxN30.mYfRPL1Z-IOaFVv_XVZsouiaekFW3oYfeTf-Ta0H7Yk

Service Role Key: [Get from dashboard - see Step 1]
```

### Google OAuth:
```
Client ID: 796105265741-dl66s79h5p9tk2h8sda8ffi4djvjr1da.apps.googleusercontent.com
Client Secret: Sourabh@123
```

### Production URL:
```
Site URL: https://freecoino.vercel.app
Callback URL: https://freecoino.vercel.app/auth/callback
```

---

## ✅ WHAT'S PRESERVED:

**ALL YOUR CODE IS SAFE:**
- ✅ All authentication pages
- ✅ Login/Signup components
- ✅ Withdrawal system
- ✅ Admin APIs
- ✅ Cashout pages
- ✅ All UI components

**ONLY CHANGED:**
- Database backend (fresh Supabase project)
- Environment variables (.env.local)

---

## 🧪 TESTING CHECKLIST:

After completing above steps, test:

1. **Local Development:**
   - [ ] `npm run dev` works
   - [ ] Signup works (create new user)
   - [ ] Login works (email/password)
   - [ ] Google OAuth works
   - [ ] Profile page loads
   - [ ] Coins balance shows (0 initially)

2. **Production (after Vercel deploy):**
   - [ ] Visit freecoino.vercel.app
   - [ ] Signup works
   - [ ] Login works
   - [ ] Google OAuth works
   - [ ] No 404 errors
   - [ ] No auth errors

---

## 🆘 IF ISSUES OCCUR:

### Common Issues:

**1. "Missing environment variables" error:**
- Check `.env.local` has new credentials
- Restart dev server

**2. "Invalid API key" error:**
- Double-check Anon Key is copied correctly
- No extra spaces or line breaks

**3. Google OAuth fails:**
- Check Google OAuth is enabled in Supabase
- Check Client ID/Secret are correct
- Check redirect URLs include callback URL

**4. Signup works but can't login:**
- Check "Confirm email" is DISABLED in Supabase
- Check user exists in: https://supabase.com/dashboard/project/fiagdlauajqzotxizmpc/auth/users

---

## 📊 DATABASE ACCESS:

View your database:
- Tables: https://supabase.com/dashboard/project/fiagdlauajqzotxizmpc/editor
- Users: https://supabase.com/dashboard/project/fiagdlauajqzotxizmpc/auth/users
- SQL Editor: https://supabase.com/dashboard/project/fiagdlauajqzotxizmpc/sql

---

## 🎯 WHY THIS SHOULD WORK:

1. **Fresh Start:** No old configuration issues
2. **Clean Database:** No conflicting data
3. **Mumbai Region:** Faster for Indian users
4. **Same Code:** All your backend work preserved
5. **Proven Setup:** Same schema that worked before

---

**Good luck bhai! This time authentication should work properly!** 🚀

If you face any issues during setup, just share screenshots and I'll help! 💪
