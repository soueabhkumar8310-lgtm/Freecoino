# Authentication Troubleshooting Guide

## ❌ "Authentication failed. Please try again." Error

### Possible Causes & Solutions:

### 1. **Redirect URL Not Configured in Supabase**

**Fix:**
1. Go to [Supabase Dashboard - URL Configuration](https://supabase.com/dashboard/project/uqxxpeirvnuphabkbvnc/auth/url-configuration)
2. In **Redirect URLs** section, add:
   ```
   http://localhost:3000/auth/callback
   ```
3. Click **Save**

### 2. **Redirect URI Not Added in Google Console**

**Fix:**
1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Click on your OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, make sure these are added:
   ```
   https://uqxxpeirvnuphabkbvnc.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   ```
4. Click **Save**

### 3. **Server Restart Needed**

After installing `@supabase/ssr`, restart your dev server:

```bash
# Stop the server (Ctrl+C)
npm run dev
```

### 4. **Check Browser Console for Errors**

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Try logging in again
4. Check for any error messages

### 5. **Check Terminal for Server Errors**

Look at your terminal where `npm run dev` is running for any error messages.

---

## ✅ How to Test if OAuth is Working:

### Step 1: Restart Dev Server
```bash
npm run dev
```

### Step 2: Clear Browser Cache
- Press `Ctrl + Shift + Delete`
- Clear cookies and cache
- Or use Incognito/Private mode

### Step 3: Test Login Flow
1. Go to `http://localhost:3000/auth/login`
2. Click **"Continue with Google"**
3. Select Google account
4. Should redirect to `/earn` page

---

## 🔍 Debug Mode

To see detailed error messages, check:

1. **Browser Console** (F12 → Console tab)
2. **Terminal** where dev server is running
3. **Network tab** (F12 → Network tab) - look for failed requests

---

## 📋 Checklist

Before testing, make sure:

- [ ] `@supabase/ssr` is installed
- [ ] Dev server is restarted
- [ ] Redirect URL added in Supabase Dashboard
- [ ] Redirect URI added in Google Console
- [ ] Google OAuth is enabled in Supabase
- [ ] Client ID and Secret are correct in Supabase

---

## 🆘 Still Not Working?

### Check Supabase Logs:
1. Go to [Supabase Dashboard - Logs](https://supabase.com/dashboard/project/uqxxpeirvnuphabkbvnc/logs/explorer)
2. Look for authentication errors

### Verify Environment Variables:
Check `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://uqxxpeirvnuphabkbvnc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Test Email Login First:
Try creating an account with email/password to verify basic auth works:
1. Go to signup page
2. Enter email and password
3. Check if you receive verification email
4. If email works but OAuth doesn't, it's an OAuth configuration issue

---

## 💡 Common Mistakes

1. **Wrong Redirect URL** - Must be exact match (http vs https, trailing slash, etc.)
2. **OAuth not enabled** - Check Supabase Dashboard → Authentication → Providers
3. **Wrong Client ID/Secret** - Double-check credentials in Supabase
4. **Browser cache** - Clear cache or use incognito mode
5. **Server not restarted** - Always restart after installing packages

---

## 📞 Need More Help?

Check the main setup guide: `SUPABASE_AUTH_SETUP.md`
