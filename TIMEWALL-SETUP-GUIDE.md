# 🕐 Timewall Integration Setup Guide

## ⚠️ Current Status

**Timewall offerwall NOT LIVE** because:
- ❌ Timewall API credentials are **NOT configured** in `.env.local`
- ❌ Timewall widget is **NOT embedded** in the earn page
- ✅ Timewall postback API is ready at `/api/timewall/postback`

## 📋 What You Need to Do

### Step 1: Sign Up for Timewall Publisher Account

1. **Visit Timewall Website**:
   - Go to: https://timewall.io/
   - Or: https://wall.mn/ (Timewall's alternative domain)
   - Or: https://offerwall.timewall.io/

2. **Create Publisher Account**:
   - Click "Publishers" or "Sign Up as Publisher"
   - Fill in your details:
     - Company/Website Name: **Freecoino**
     - Website URL: **https://freecoino.com**
     - Email: **soueabhkumar8310@gmail.com** (or support@freecoino.com)
     - Description: **Cryptocurrency rewards platform where users earn coins by completing offers**

3. **Get Your Credentials**:
   After approval, you'll get:
   - **App ID** (or Publisher ID)
   - **API Key** (or Secret Key)
   - **Postback URL** to configure

### Step 2: Configure Postback URL in Timewall Dashboard

Once logged into Timewall dashboard:

1. **Find Postback Settings**:
   - Look for "Postback URL", "Callback URL", or "Server-to-Server Postback"

2. **Set Your Postback URL**:
   ```
   https://freecoino.com/api/timewall/postback?user_id={user_id}&tx_id={transaction_id}&amount={payout}
   ```

3. **Configure Parameters** (if Timewall asks):
   - **User ID Parameter**: `{user_id}` or `{subid}` or `{uid}`
   - **Transaction ID Parameter**: `{transaction_id}` or `{tx_id}` or `{offer_id}`
   - **Payout Parameter**: `{payout}` or `{amount}` or `{reward}`

   **Note**: Different offerwall providers use different parameter names. Check Timewall's documentation.

### Step 3: Add Credentials to Environment Variables

1. **Open your `.env.local` file** in the project root

2. **Add Timewall credentials**:
   ```env
   # Timewall API
   TIMEWALL_API_KEY=your_actual_timewall_api_key_here
   TIMEWALL_APP_ID=your_actual_timewall_app_id_here
   ```

3. **Example** (replace with your actual values):
   ```env
   TIMEWALL_API_KEY=sk_live_abc123xyz789
   TIMEWALL_APP_ID=12345
   ```

4. **Save the file**

### Step 4: Deploy to Vercel

Since you're using Vercel, you need to add these environment variables there too:

1. **Go to Vercel Dashboard**:
   - Open: https://vercel.com/dashboard
   - Select your project: **freecoino**

2. **Add Environment Variables**:
   - Go to: **Settings** → **Environment Variables**
   - Add:
     - **Name**: `TIMEWALL_API_KEY`
     - **Value**: Your Timewall API Key
     - **Environments**: Check **Production**, **Preview**, **Development**
   - Click "Save"
   - Add another:
     - **Name**: `TIMEWALL_APP_ID`
     - **Value**: Your Timewall App ID
     - **Environments**: Check **Production**, **Preview**, **Development**
   - Click "Save"

3. **Redeploy**:
   - Go to: **Deployments** tab
   - Click on the latest deployment
   - Click "Redeploy" button

### Step 5: Add Timewall Widget to Earn Page (Optional)

If Timewall provides an iframe embed (most offerwalls do):

The Timewall API route is ready at `/api/timewall-offers`. It returns the iframe URL you can embed.

**To add it to the earn page**, you'll need to:
1. Add a Timewall section in `components/earn-content.tsx`
2. Embed the iframe with the URL from the API

**Example code** (add this section in earn-content.tsx):

```tsx
// Add this in the offerwall sections
<Box>
  <Typography variant="h6">Timewall Offers</Typography>
  <iframe
    src={`https://timewall.io/offer-wall/${TIMEWALL_APP_ID}?user_id=${userId}`}
    width="100%"
    height="600px"
    frameBorder="0"
    style={{ border: 'none', borderRadius: '8px' }}
  />
</Box>
```

## 🧪 Testing Timewall Integration

### Test Postback Manually

Once credentials are configured, test the postback:

1. **Test URL** (replace with actual values):
   ```
   https://freecoino.com/api/timewall/postback?user_id=338939c3-a7ba-45ce-ad02-6af8126b78fd&tx_id=TEST_TX_123&amount=1000
   ```

2. **Open in browser** - should return "OK"

3. **Check database**:
   ```sql
   -- Check if coins were added
   SELECT coins_balance, total_earned FROM profiles 
   WHERE id = '338939c3-a7ba-45ce-ad02-6af8126b78fd';

   -- Check offer completion
   SELECT * FROM offer_completions 
   WHERE offer_provider = 'timewall' 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```

### Test on Live Site

1. **Complete an offer** on Timewall widget
2. **Check your profile** - coins should increase
3. **Check transaction history** - should show Timewall offer completion

## 📊 Alternative: Why Timewall Might Not Be Needed

**Current Active Offerwalls** on Freecoino:
1. ✅ **Revtoo** - Working
2. ✅ **Gemiad** - Working
3. ✅ **Notik** - Working  
4. ✅ **Vortex** - Working
5. ✅ **CPX Research** - Surveys working
6. ❌ **Timewall** - Not configured

**You already have 5 working offerwalls!** Timewall is optional. Many reward platforms run successfully with 3-5 offerwalls.

### Pros of Adding Timewall:
- ✅ More offer variety for users
- ✅ Better fill rates in certain regions
- ✅ Competitive payouts

### Cons:
- ❌ Requires publisher approval (can take days)
- ❌ Another integration to maintain
- ❌ More API costs/revenue share

## 🎯 Recommendation

**Option 1: Add Timewall** (If you want maximum offers)
- Follow steps 1-5 above
- Apply for Timewall publisher account
- Wait for approval (usually 1-3 days)
- Configure and deploy

**Option 2: Skip Timewall** (If current offerwalls are enough)
- Keep using your 5 active offerwalls
- Focus on user growth and marketing
- Add Timewall later if needed

## 🆘 Common Issues

### Issue 1: "Timewall not configured" error

**Fix**: Add `TIMEWALL_API_KEY` and `TIMEWALL_APP_ID` to `.env.local` and Vercel environment variables

### Issue 2: Postback not working

**Check**:
- Postback URL configured correctly in Timewall dashboard
- Parameter names match Timewall's format (`{user_id}`, `{tx_id}`, `{payout}`)
- Firewall not blocking Timewall's servers

### Issue 3: Iframe not loading

**Check**:
- App ID is correct
- Domain `freecoino.com` is whitelisted in Timewall dashboard
- No CORS errors in browser console

## 📞 Support

**Timewall Support**:
- Email: Usually `support@timewall.io` or check their website
- Documentation: Check their publisher dashboard

**Your Options**:
1. Contact Timewall support for publisher signup
2. Use existing 5 offerwalls and skip Timewall
3. Replace Timewall with another offerwall provider

---

**Bottom Line**: Timewall is **optional**. Your site is already working with 5 other offerwalls. Only add Timewall if you specifically need their offers or have better rates with them! 🚀
