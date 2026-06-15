# 🔧 Add Environment Variables to Vercel

## ⚠️ CRITICAL: Environment Variables Missing on Vercel

Your offerwalls are not loading because environment variables are not set in Vercel production.

## 🚀 Quick Fix (2 minutes)

### Step 1: Open Vercel Dashboard

1. Go to: https://vercel.com/sourabhkumar-s-projects/freecoino/settings/environment-variables
   
   OR

2. Go to: https://vercel.com/dashboard
3. Click on **freecoino** project
4. Click **Settings** tab
5. Click **Environment Variables** in left sidebar

### Step 2: Add These Variables

Add each variable ONE BY ONE:

#### Variable 1: REVTOO_API_KEY
- **Name**: `REVTOO_API_KEY`
- **Value**: `lmtx1hoinv2rvigke7z15bn7pe20fh`
- **Environments**: Check ✅ **Production**, **Preview**, **Development**
- Click **Save**

#### Variable 2: REVTOO_SECRET_KEY  
- **Name**: `REVTOO_SECRET_KEY`
- **Value**: `ffebbb41f825f742d6b7a5f53a80ede3`
- **Environments**: Check ✅ **Production**, **Preview**, **Development**
- Click **Save**

#### Variable 3: SUPABASE_SERVICE_ROLE_KEY
- **Name**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpYWdkbGF1YWpxem90eGl6bXBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDg5NzkxNywiZXhwIjoyMDk2NDczOTE3fQ.3uo2gZ2jyGJCLvuWtzxK5W3eGNvatQs3N9VZWxMLn58`
- **Environments**: Check ✅ **Production**, **Preview**, **Development**
- Click **Save**

#### Variable 4: ADMIN_EMAIL
- **Name**: `ADMIN_EMAIL`
- **Value**: `soueabhkumar8310@gmail.com`
- **Environments**: Check ✅ **Production**, **Preview**, **Development**
- Click **Save**

#### Variable 5: RESEND_API_KEY
- **Name**: `RESEND_API_KEY`
- **Value**: `re_b6wv427H_8auMEFcHndquMDWrZ3wwxRua`
- **Environments**: Check ✅ **Production**, **Preview**, **Development**
- Click **Save**

### Step 3: Redeploy

After adding all variables:

1. Go to **Deployments** tab
2. Click on the latest deployment (top one)
3. Click **"..."** (three dots menu)
4. Click **"Redeploy"**
5. Wait 2-3 minutes for deployment

### Step 4: Test

After redeployment:

1. Open: https://freecoino.com/test-revtoo.html
2. Click "Test Revtoo API" button
3. Should see offers loading! ✅

OR

Test API directly:
```
https://freecoino.com/api/revtoo-offers?user_id=338939c3-a7ba-45ce-ad02-6af8126b78fd
```

Should return JSON with offers array (not empty).

## ✅ Expected Result

After adding variables and redeploying:

```json
{
  "success": true,
  "offers": [
    {
      "offer_id": "123",
      "name": "Install App XYZ",
      "payout": 2.5,
      ...
    }
  ],
  "count": 50
}
```

## 🐛 Still Not Working?

### Check 1: Variables Are Saved
- Go back to Settings → Environment Variables
- All 5 variables should be listed
- Each should have ✅ checkmarks for Production, Preview, Development

### Check 2: Deployment Succeeded
- Go to Deployments tab
- Latest deployment should show ✅ "Ready"
- Click on it to see build logs
- No errors should be present

### Check 3: Test Again
- Clear browser cache (Ctrl+Shift+Delete)
- Open test page in incognito mode
- Test API endpoint directly

## 📞 Need Help?

If still not working, check:
1. Revtoo API key is valid (not expired)
2. Revtoo account is active
3. No IP restrictions on Revtoo dashboard

---

**Total Time**: 2 minutes to add variables + 3 minutes for deployment = 5 minutes total! 🚀
