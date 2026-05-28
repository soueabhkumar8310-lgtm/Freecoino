# 🚀 Deployment Guide - Freecoino Project

## ✅ Pre-Deployment Checklist

### 1. **Environment Variables Setup**

Create `.env.production` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://uqxxpeirvnuphabkbvnc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Site URL (Update with your domain)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# OAuth Redirect URLs (Update with your domain)
NEXT_PUBLIC_OAUTH_REDIRECT_URL=https://yourdomain.com/auth/callback
```

### 2. **Supabase Configuration**

#### A. Update Redirect URLs:
1. Go to [Supabase Dashboard - URL Configuration](https://supabase.com/dashboard/project/uqxxpeirvnuphabkbvnc/auth/url-configuration)
2. Add production URLs:
   ```
   https://yourdomain.com/auth/callback
   https://yourdomain.com
   ```

#### B. Update OAuth Providers:

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Add authorized redirect URI:
   ```
   https://uqxxpeirvnuphabkbvnc.supabase.co/auth/v1/callback
   ```
3. Add authorized JavaScript origin:
   ```
   https://yourdomain.com
   ```

**Facebook OAuth:**
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Add redirect URI:
   ```
   https://uqxxpeirvnuphabkbvnc.supabase.co/auth/v1/callback
   ```
3. Add app domain: `yourdomain.com`

### 3. **Database Setup**

Create necessary tables in Supabase:

```sql
-- User profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  coins_balance INTEGER DEFAULT 0,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url, referral_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    substring(md5(random()::text) from 1 for 8)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  type TEXT NOT NULL, -- 'earn', 'withdraw', 'referral', 'bonus'
  amount INTEGER NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'completed', -- 'completed', 'pending', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Withdrawals table
CREATE TABLE public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount INTEGER NOT NULL,
  method TEXT NOT NULL, -- 'paypal', 'bitcoin', etc.
  wallet_address TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own withdrawals"
  ON public.withdrawals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create withdrawals"
  ON public.withdrawals FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### 4. **Update Metadata in Code**

Update `app/layout.tsx` with production URLs:

```typescript
export const metadata: Metadata = {
  title: "Freecoino — Get Paid to Complete Surveys & Tasks",
  metadataBase: new URL("https://yourdomain.com"), // Update this
  alternates: {
    canonical: "https://yourdomain.com", // Update this
  },
  // ... rest of metadata
};
```

### 5. **Build Test**

Test production build locally:

```bash
npm run build
npm run start
```

Check for:
- ✅ No build errors
- ✅ All pages load correctly
- ✅ Authentication works
- ✅ No console errors

---

## 🌐 Deployment Options

### Option 1: Vercel (Recommended - Easiest)

#### Steps:

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Add Environment Variables:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all variables from `.env.local`

5. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

#### Vercel Configuration:

Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

---

### Option 2: Netlify

#### Steps:

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login:**
   ```bash
   netlify login
   ```

3. **Initialize:**
   ```bash
   netlify init
   ```

4. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

#### Netlify Configuration:

Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

---

### Option 3: Railway

#### Steps:

1. Go to [Railway.app](https://railway.app/)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your repository
5. Add environment variables
6. Deploy!

---

### Option 4: DigitalOcean App Platform

#### Steps:

1. Go to [DigitalOcean](https://www.digitalocean.com/)
2. Create new App
3. Connect GitHub repository
4. Configure:
   - Build Command: `npm run build`
   - Run Command: `npm run start`
5. Add environment variables
6. Deploy!

---

### Option 5: Self-Hosted (VPS)

#### Requirements:
- Ubuntu 22.04 LTS
- Node.js 20+
- Nginx
- PM2

#### Steps:

1. **Setup Server:**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   
   # Install Nginx
   sudo apt install -y nginx
   ```

2. **Clone & Build:**
   ```bash
   cd /var/www
   git clone your-repo-url freecoino
   cd freecoino
   npm install
   npm run build
   ```

3. **Create PM2 Ecosystem:**
   
   Create `ecosystem.config.js`:
   ```javascript
   module.exports = {
     apps: [{
       name: 'freecoino',
       script: 'npm',
       args: 'start',
       cwd: '/var/www/freecoino',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   }
   ```

4. **Start with PM2:**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx:**
   
   Create `/etc/nginx/sites-available/freecoino`:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **Enable Site:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/freecoino /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **Setup SSL (Let's Encrypt):**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

---

## 📋 Post-Deployment Checklist

### 1. **Test Everything:**
- [ ] Homepage loads
- [ ] Login/Signup works
- [ ] Google OAuth works
- [ ] Facebook OAuth works
- [ ] Protected routes work
- [ ] Logout works
- [ ] All pages accessible

### 2. **Performance:**
- [ ] Run Lighthouse audit
- [ ] Check page load times
- [ ] Optimize images
- [ ] Enable caching

### 3. **SEO:**
- [ ] Submit sitemap to Google Search Console
- [ ] Verify robots.txt
- [ ] Check meta tags
- [ ] Test social media previews

### 4. **Security:**
- [ ] Enable HTTPS
- [ ] Configure CORS
- [ ] Set security headers
- [ ] Enable rate limiting

### 5. **Monitoring:**
- [ ] Setup error tracking (Sentry)
- [ ] Setup analytics (Google Analytics)
- [ ] Monitor uptime
- [ ] Setup alerts

---

## 🔧 Environment Variables Reference

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=

# Optional (for future features)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=
NEXT_PUBLIC_SENTRY_DSN=
CLOUDFLARE_TURNSTILE_SECRET_KEY=
```

---

## 🐛 Common Issues & Solutions

### Issue: Build fails
**Solution:** Run `npm run build` locally first to catch errors

### Issue: OAuth not working
**Solution:** Check redirect URLs in Supabase and OAuth providers

### Issue: 404 on routes
**Solution:** Ensure Next.js is configured for your hosting platform

### Issue: Environment variables not working
**Solution:** Restart deployment after adding env vars

---

## 📞 Support Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Netlify Docs](https://docs.netlify.com/)

---

## 🎯 Recommended: Vercel Deployment

**Why Vercel?**
- ✅ Built for Next.js
- ✅ Zero configuration
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Free tier available
- ✅ Easy environment variables
- ✅ Preview deployments
- ✅ Automatic scaling

**Deploy in 2 minutes:**
```bash
npm install -g vercel
vercel login
vercel
```

Done! 🚀
