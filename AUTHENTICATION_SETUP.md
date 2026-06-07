# Authentication Setup Guide

## Overview
Freecoino supports three authentication methods:
1. **Email/Password** - Traditional email-based authentication
2. **Google OAuth** - Sign in with Google account
3. **Phone Number** - Sign in with phone number and password

---

## 1. Email/Password Authentication ✅

**Status**: Fully configured and working

**How it works**:
- Users sign up with email, password, and display name
- Email confirmation is disabled for easier testing
- Passwords must be at least 6 characters

**No additional setup required** - This works out of the box with Supabase.

---

## 2. Google OAuth Authentication 🔧

**Status**: Configured but needs verification

### Current Configuration:
- **Google Client ID**: `796105265741-dl66s79h5p9tk2h8sda8ffi4djvjr1da.apps.googleusercontent.com`
- **Google Client Secret**: `Sourabh@123`

### Supabase Dashboard Setup:

1. **Go to Supabase Dashboard** → Authentication → Providers → Google
2. **Enable Google Provider**
3. **Add Client ID and Secret** (already done)
4. **Configure Redirect URLs**:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://freecoino.vercel.app/auth/callback`

### Google Cloud Console Setup:

1. **Go to**: https://console.cloud.google.com/apis/credentials
2. **Select your OAuth 2.0 Client ID**
3. **Add Authorized JavaScript origins**:
   ```
   http://localhost:3000
   https://freecoino.vercel.app
   https://uqxxpeirvnuphabkbvnc.supabase.co
   ```

4. **Add Authorized redirect URIs**:
   ```
   http://localhost:3000/auth/callback
   https://freecoino.vercel.app/auth/callback
   https://uqxxpeirvnuphabkbvnc.supabase.co/auth/v1/callback
   ```

5. **Save changes**

### Testing Google OAuth:

1. Start dev server: `npm run dev`
2. Go to: http://localhost:3000/auth/login
3. Click "Continue with Google"
4. Should redirect to Google login
5. After successful login, should redirect back to `/earn` page

### Common Issues:

**Issue**: "Failed to fetch" error
- **Solution**: Check if Supabase URL is accessible
- **Solution**: Verify Google OAuth credentials in Supabase Dashboard
- **Solution**: Clear browser cache and cookies

**Issue**: "redirect_uri_mismatch" error
- **Solution**: Verify redirect URIs in Google Cloud Console match exactly
- **Solution**: Make sure to include Supabase callback URL

---

## 3. Phone Number Authentication 📱

**Status**: Code implemented, needs Supabase configuration

### Supabase Dashboard Setup:

1. **Go to Supabase Dashboard** → Authentication → Providers → Phone
2. **Enable Phone Provider**
3. **Choose SMS Provider**:
   - **Twilio** (Recommended for production)
   - **MessageBird**
   - **Vonage**
   - **Supabase built-in** (Limited free tier)

### For Testing (Supabase Built-in):

1. **Enable Phone Auth** in Supabase Dashboard
2. **No SMS provider needed** for testing
3. **Phone numbers will be stored** but OTP won't be sent
4. **Use password-based phone auth** (already implemented)

### For Production (Twilio Setup):

1. **Create Twilio Account**: https://www.twilio.com/
2. **Get Twilio Credentials**:
   - Account SID
   - Auth Token
   - Phone Number

3. **Configure in Supabase**:
   - Go to Authentication → Providers → Phone
   - Select "Twilio" as provider
   - Enter Account SID, Auth Token, and Phone Number
   - Save changes

4. **Test with real phone number**:
   - Use format: `+91` followed by 10-digit number
   - Example: `+919876543210`

### Phone Authentication Features:

**Password-based** (Currently implemented):
- Sign up with phone + password
- Sign in with phone + password
- No OTP required

**OTP-based** (Functions available, needs SMS provider):
- Send OTP to phone: `sendPhoneOTP(phone)`
- Verify OTP: `verifyPhoneOTP(phone, token)`
- Passwordless authentication

---

## Environment Variables

Make sure these are set in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://uqxxpeirvnuphabkbvnc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**For Vercel deployment**, add these in:
- Vercel Dashboard → Project Settings → Environment Variables

---

## Testing Checklist

### Email/Password:
- [ ] Sign up with new email
- [ ] Log in with email
- [ ] Password validation (min 6 chars)
- [ ] Error handling for invalid credentials

### Google OAuth:
- [ ] Click "Continue with Google"
- [ ] Redirects to Google login
- [ ] Successfully logs in
- [ ] Redirects back to `/earn` page
- [ ] User profile created in database

### Phone Number:
- [ ] Toggle to "Phone" method
- [ ] Enter phone with country code
- [ ] Sign up with phone + password
- [ ] Log in with phone + password
- [ ] Phone number validation

---

## Troubleshooting

### "Auth session missing" error:
- Clear browser cookies
- Check if `.env.local` has correct Supabase credentials
- Restart dev server: `npm run dev`

### Google OAuth not working:
1. Check Supabase Dashboard → Authentication → Providers → Google
2. Verify Client ID and Secret are correct
3. Check Google Cloud Console redirect URIs
4. Look for errors in browser console

### Phone auth not working:
1. Check if Phone provider is enabled in Supabase
2. Verify phone number format: `+[country_code][number]`
3. For OTP: Make sure SMS provider is configured

---

## Next Steps

1. **Test Google OAuth** on localhost
2. **Enable Phone Auth** in Supabase Dashboard
3. **Configure SMS provider** (Twilio) for production
4. **Test all three methods** thoroughly
5. **Deploy to Vercel** and test in production

---

## Support

If you encounter any issues:
1. Check browser console for errors
2. Check Supabase logs: Dashboard → Logs
3. Verify all environment variables are set
4. Contact: sourabhkumar8310@gmail.com
