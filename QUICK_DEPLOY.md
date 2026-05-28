# 🚀 Quick Deploy - 5 Minutes Setup

## Step 1: Database Setup (2 minutes)

1. **Go to Supabase SQL Editor:**
   https://supabase.com/dashboard/project/uqxxpeirvnuphabkbvnc/sql/new

2. **Copy & Paste** entire content from `supabase-schema.sql`

3. **Click "Run"**

4. **Verify:** Check that tables are created in Table Editor

---

## Step 2: Update Supabase Settings (1 minute)

### A. Redirect URLs:
https://supabase.com/dashboard/project/uqxxpeirvnuphabkbvnc/auth/url-configuration

Add:
```
https://your-app-name.vercel.app/auth/callback
https://your-app-name.vercel.app
```

### B. Email Confirmation (Optional):
https://supabase.com/dashboard/project/uqxxpeirvnuphabkbvnc/auth/providers

Turn OFF "Confirm email" for testing

---

## Step 3: Deploy to Vercel (2 minutes)

### Option A: Using Vercel Dashboard (Easiest)

1. **Go to:** https://vercel.com/new

2. **Import Git Repository:**
   - Connect your GitHub/GitLab
   - Select `freecoino` repository

3. **Configure Project:**
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Install Command: `npm install --legacy-peer-deps`

4. **Add Environment Variables:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://uqxxpeirvnuphabkbvnc.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxeHhwZWlydm51cGhhYmtidm5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzMTc1ODMsImV4cCI6MjA5Mzg5MzU4M30.d1iTzAlUHYpL5wVw5JBx9lBUsnUfJh6fQqMhy8CLVsA
   ```

5. **Click "Deploy"**

6. **Wait 2-3 minutes** ⏳

7. **Done!** 🎉 Your app is live!

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? freecoino
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Deploy to production
vercel --prod
```

---

## Step 4: Update OAuth Providers

### Google OAuth:
1. Go to: https://console.cloud.google.com/apis/credentials
2. Edit your OAuth 2.0 Client
3. Add Authorized redirect URI:
   ```
   https://uqxxpeirvnuphabkbvnc.supabase.co/auth/v1/callback
   ```
4. Add Authorized JavaScript origin:
   ```
   https://your-app-name.vercel.app
   ```
5. Save

### Facebook OAuth:
1. Go to: https://developers.facebook.com/apps
2. Select your app
3. Facebook Login → Settings
4. Add Valid OAuth Redirect URI:
   ```
   https://uqxxpeirvnuphabkbvnc.supabase.co/auth/v1/callback
   ```
5. Settings → Basic → Add App Domain:
   ```
   your-app-name.vercel.app
   ```
6. Save

---

## Step 5: Test Your Deployment ✅

Visit your deployed URL and test:

- [ ] Homepage loads
- [ ] Signup with email works
- [ ] Login with email works
- [ ] Google login works
- [ ] Facebook login works
- [ ] Protected pages work
- [ ] Logout works

---

## 🎯 Your App is Live!

**Deployment URL:** `https://your-app-name.vercel.app`

### Next Steps:

1. **Custom Domain (Optional):**
   - Vercel Dashboard → Your Project → Settings → Domains
   - Add your custom domain
   - Update DNS records

2. **Analytics (Optional):**
   - Add Google Analytics
   - Setup Vercel Analytics

3. **Monitoring:**
   - Check Vercel Dashboard for errors
   - Monitor Supabase Dashboard for database activity

---

## 🐛 Troubleshooting

### Build fails:
```bash
# Test build locally first
npm run build
```

### OAuth not working:
- Check redirect URLs in Supabase
- Check redirect URIs in Google/Facebook console
- Make sure URLs match exactly (no trailing slashes)

### Environment variables not working:
- Redeploy after adding env vars
- Check spelling and values

### 404 errors:
- Clear Vercel cache and redeploy
- Check Next.js configuration

---

## 📞 Need Help?

- Vercel Support: https://vercel.com/support
- Supabase Support: https://supabase.com/support
- Next.js Docs: https://nextjs.org/docs

---

**Total Time: ~5 minutes** ⏱️

**Congratulations! Your app is live!** 🎉🚀
