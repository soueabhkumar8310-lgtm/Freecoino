# Supabase Authentication Setup Guide

## ✅ What's Been Implemented

Your freecoino project now has a complete authentication system with:

- ✅ **Email/Password Authentication**
- ✅ **Google OAuth Login**
- ✅ **Facebook OAuth Login**
- ✅ **Auth Callback Handling**
- ✅ **User Session Management**

## 📁 Files Created/Modified

### New Files:
1. `lib/supabase/client.ts` - Supabase client initialization
2. `lib/supabase/auth.ts` - Authentication functions
3. `app/auth/callback/route.ts` - OAuth callback handler

### Modified Files:
1. `components/login-client.tsx` - Updated with real Supabase auth
2. `components/signup-client.tsx` - Updated with real Supabase auth

## 🔧 Configuration Steps

### 1. Configure OAuth Providers in Supabase Dashboard

#### **Google OAuth Setup:**

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/uqxxpeirvnuphabkbvnc
2. Navigate to **Authentication** → **Providers**
3. Find **Google** and click to expand
4. Enable Google provider
5. You'll need to create a Google OAuth app:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorized redirect URIs: `https://uqxxpeirvnuphabkbvnc.supabase.co/auth/v1/callback`
   - Copy **Client ID** and **Client Secret**
6. Paste them in Supabase Dashboard under Google provider settings
7. Click **Save**

#### **Facebook OAuth Setup:**

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Find **Facebook** and click to expand
3. Enable Facebook provider
4. You'll need to create a Facebook app:
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Click **My Apps** → **Create App**
   - Select app type and fill in details
   - Go to **Facebook Login** → **Settings**
   - Add Valid OAuth Redirect URI: `https://uqxxpeirvnuphabkbvnc.supabase.co/auth/v1/callback`
   - Under **Use Cases**, enable `email` permission
   - Copy **App ID** and **App Secret** from **Settings** → **Basic**
5. Paste them in Supabase Dashboard under Facebook provider settings
6. Click **Save**

### 2. Configure Redirect URLs

In Supabase Dashboard:
1. Go to **Authentication** → **URL Configuration**
2. Add these URLs to **Redirect URLs**:
   - `http://localhost:3000/auth/callback` (for local development)
   - `https://yourdomain.com/auth/callback` (for production)

### 3. Email Templates (Optional)

Configure email templates for:
- Email verification
- Password reset
- Magic link login

Go to **Authentication** → **Email Templates** in Supabase Dashboard.

## 🚀 How to Use

### Sign Up with Email:
```typescript
import { signUpWithEmail } from '@/lib/supabase/auth'

await signUpWithEmail('user@example.com', 'password123', 'John Doe')
```

### Sign In with Email:
```typescript
import { signInWithEmail } from '@/lib/supabase/auth'

await signInWithEmail('user@example.com', 'password123')
```

### Sign In with OAuth:
```typescript
import { signInWithOAuth } from '@/lib/supabase/auth'

// Google
await signInWithOAuth('google')

// Facebook
await signInWithOAuth('facebook')
```

### Sign Out:
```typescript
import { signOut } from '@/lib/supabase/auth'

await signOut()
```

### Get Current User:
```typescript
import { getCurrentUser } from '@/lib/supabase/auth'

const user = await getCurrentUser()
```

## 🔐 Security Features

- ✅ Email verification required for email signups
- ✅ Secure password hashing
- ✅ OAuth state validation
- ✅ PKCE flow for OAuth
- ✅ Session management with JWT tokens
- ✅ Automatic token refresh

## 📊 Database Schema

Supabase automatically creates these tables:
- `auth.users` - User accounts
- `auth.identities` - OAuth identities
- `auth.sessions` - Active sessions

You can extend with custom tables:
```sql
-- Example: User profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);
```

## 🧪 Testing

### Local Development:
1. Start your dev server: `npm run dev`
2. Visit `http://localhost:3000/auth/login`
3. Try signing up with email
4. Try logging in with Google/Facebook

### Production:
1. Deploy your app
2. Update redirect URLs in Supabase Dashboard
3. Update OAuth app redirect URIs in Google/Facebook consoles

## 🐛 Troubleshooting

### "Invalid redirect URL" error:
- Make sure the callback URL is added to Supabase Dashboard → Authentication → URL Configuration

### OAuth not working:
- Verify OAuth credentials in Supabase Dashboard
- Check that redirect URIs match exactly in OAuth provider console
- Ensure OAuth app is published/approved (for Facebook)

### Email verification not sending:
- Check Supabase Dashboard → Authentication → Email Templates
- Verify SMTP settings if using custom email provider

### Session not persisting:
- Check browser cookies are enabled
- Verify Supabase URL and anon key in `.env.local`

## 📚 Additional Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Facebook OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-facebook)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)

## 🎯 Next Steps

1. **Configure OAuth providers** in Supabase Dashboard (see steps above)
2. **Test authentication** locally
3. **Add user profiles** table for additional user data
4. **Implement protected routes** using auth middleware
5. **Add password reset** functionality
6. **Customize email templates**

## 💡 Pro Tips

- Use `onAuthStateChange` to listen for auth events
- Store additional user data in a separate `profiles` table
- Implement Row Level Security (RLS) policies for data access
- Use Supabase Realtime for live updates
- Enable MFA (Multi-Factor Authentication) for enhanced security

---

**Need help?** Check the Supabase documentation or reach out to the Supabase community!
