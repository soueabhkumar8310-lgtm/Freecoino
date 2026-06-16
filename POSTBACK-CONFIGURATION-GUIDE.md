# 🔔 Postback URL Configuration Guide

## ✅ ALL POSTBACK ENDPOINTS NOW READY!

### Status Summary:

| Offerwall | Postback Endpoint | Status | Dashboard Configure |
|-----------|------------------|--------|---------------------|
| **Revtoo** | ✅ Ready | Code deployed | ❓ Need to check |
| **Timewall** | ✅ Ready | Code deployed | ❓ Need to check |
| **Vortex** | ✅ Ready | Just deployed | ❓ Need to check |
| **CPX Research** | ✅ Ready | Just deployed | ❓ Need to check |

---

## 📋 POSTBACK URLs TO CONFIGURE:

### 1. Revtoo Postback
**URL**:
```
https://freecoino.com/api/revtoo/postback?user_id={USER_ID}&tx_id={TRANSACTION_ID}&amount={AMOUNT}
```

**Where to configure**:
- Login to Revtoo dashboard
- Go to Placement settings for "freecoino"
- Find "Postback URL" or "Callback URL" section
- Paste the URL above

**Parameter mapping** (check Revtoo docs):
- `{USER_ID}` → Their parameter name (might be `{user_id}`, `{uid}`, `{subid}`)
- `{TRANSACTION_ID}` → Their parameter name (might be `{tx_id}`, `{transaction_id}`)
- `{AMOUNT}` → Reward amount in coins (might be `{reward}`, `{payout}`)

---

### 2. Timewall Postback
**URL**:
```
https://freecoino.com/api/timewall/postback?user_id={USER_ID}&tx_id={TRANSACTION_ID}&amount={AMOUNT}
```

**Where to configure**:
- Login to Timewall dashboard: https://discover.timewall.io/
- Click "INTEGRATE" on your placement
- Find "Postback" or "Webhook" settings
- Paste the URL above

**Parameter mapping** (check Timewall docs):
- `{USER_ID}` → Usually `{uid}` or `{userId}`
- `{TRANSACTION_ID}` → Usually `{transactionId}` or `{tx_id}`
- `{AMOUNT}` → Reward amount (usually `{payout}`)

---

### 3. Vortex Postback (NEW!)
**URL**:
```
https://freecoino.com/api/vortex/postback?user_id={USER_ID}&tx_id={TRANSACTION_ID}&amount={AMOUNT}
```

**Where to configure**:
- Login to Vortex dashboard: https://publisher.vortexwall.com/
- Go to your placement settings
- Find "Postback URL" or "Server Callback" section
- Paste the URL above

**Parameter mapping** (check Vortex docs):
- `{USER_ID}` → Their user ID parameter
- `{TRANSACTION_ID}` → Transaction/offer ID parameter
- `{AMOUNT}` → Reward amount parameter

---

### 4. CPX Research Postback (NEW!)
**URL**:
```
https://freecoino.com/api/cpx/postback?user_id={USER_ID}&tx_id={TRANSACTION_ID}&amount={AMOUNT}
```

**Where to configure**:
- Login to CPX Research dashboard: https://offers.cpx-research.com/
- Go to Settings or Integration section
- Find "Postback URL" or "Server-to-Server Callback"
- Paste the URL above

**Special Note**: CPX sends amount in USD, our endpoint automatically converts to coins (1 USD = 1000 coins)

**Parameter mapping** (check CPX docs):
- `{USER_ID}` → Usually `{ext_user_id}` or `{user_id}`
- `{TRANSACTION_ID}` → Usually `{trans_id}` or `{transaction_id}`
- `{AMOUNT}` → Usually `{reward_usd}` (in USD)

---

## 🧪 HOW TO TEST POSTBACKS:

### Method 1: Manual Test (Browser)
Replace `{USER_ID}`, `{TRANSACTION_ID}`, `{AMOUNT}` with actual values and open in browser:

```
https://freecoino.com/api/revtoo/postback?user_id=338939c3-a7ba-45ce-ad02-6af8126b78fd&tx_id=TEST123&amount=1000
```

**Expected**: Should return "OK" and add 1000 coins to user.

### Method 2: Complete Real Offer
1. Go to: https://freecoino.com/earn
2. Complete an offer on any offerwall
3. Wait 1-2 minutes
4. Check your balance - coins should increase!
5. Check "My Offers" page - completed offer should appear

### Method 3: Check Database
```sql
-- Check offer completions
SELECT * FROM offer_completions 
WHERE user_id = '338939c3-a7ba-45ce-ad02-6af8126b78fd'
ORDER BY created_at DESC
LIMIT 10;

-- Check transactions
SELECT * FROM transactions
WHERE user_id = '338939c3-a7ba-45ce-ad02-6af8126b78fd'
ORDER BY created_at DESC
LIMIT 10;
```

---

## ❓ HOW TO CHECK IF ALREADY CONFIGURED:

### For Each Offerwall:

1. **Login to dashboard**
2. **Go to Settings/Integration section**
3. **Look for**:
   - "Postback URL"
   - "Callback URL"
   - "Server-to-Server Postback"
   - "Webhook URL"
4. **Check if freecoino.com URL is there**
5. **If YES** ✅ - Already configured!
6. **If NO** ❌ - Need to add it

---

## 🎯 CURRENT STATUS - WHAT YOU NEED TO DO:

### Step 1: Check Each Dashboard

Go to each offerwall dashboard and check if postback URL is configured:

- [ ] **Revtoo** - Check dashboard → Placement → Postback URL
- [ ] **Timewall** - Check dashboard → Integration → Postback URL
- [ ] **Vortex** - Check dashboard → Settings → Postback URL
- [ ] **CPX Research** - Check dashboard → Settings → Postback URL

### Step 2: Configure Missing Ones

For any that's NOT configured, add the postback URL from this guide.

### Step 3: Test Each One

After configuring, complete a real offer on each offerwall to test.

---

## ✅ POSTBACK ENDPOINTS FEATURES:

All 4 postback endpoints have:
- ✅ **Duplicate prevention** - Same transaction won't be credited twice
- ✅ **Flexible parameters** - Supports multiple parameter name formats
- ✅ **Database tracking** - Records in `offer_completions` table
- ✅ **Coin awarding** - Uses `add_coins` RPC for atomic transactions
- ✅ **Logging** - Console logs for debugging
- ✅ **Error handling** - Proper error responses

---

## 📞 NEED HELP?

Tell me:
```
"I checked [OFFERWALL_NAME] dashboard. Postback URL is [CONFIGURED/NOT CONFIGURED]"
```

I'll guide you through the configuration! 🚀

---

**All postback endpoints are NOW LIVE!** Just need to configure them in each offerwall dashboard! 🎉
