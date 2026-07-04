# 🔍 Test Revtoo API - Real Data Not Coming

## Problem Statement:
Aap bol rahe ho: **"$0.63 aur 630 coins Revtoo se nahi aa raha - fake data hai!"**

---

## 🧪 Debug Steps - Do This NOW:

### Step 1: Test Revtoo API Directly in Browser

Open this URL in browser (replace `YOUR_USER_ID` with real user ID):
```
https://freecoino.com/api/revtoo-offers?user_id=YOUR_USER_ID
```

Or use test user:
```
https://freecoino.com/api/revtoo-offers?user_id=test123
```

**Expected Response if API Key is CORRECT:**
```json
{
  "success": true,
  "offers": [
    {
      "offer_id": "real_offer_id_123",
      "name": "REAL GAME NAME from Revtoo",
      "payout": 1500,  // Real payout from Revtoo
      "click_url": "https://revtoo.com/click/xyz...",
      "provider": "Revtoo",
      ...
    },
    ... 1454 more offers
  ]
}
```

**If API Key is WRONG, you'll see:**
```json
{
  "success": false,
  "error": "RevToo API key not configured",
  "offers": []
}
```

OR

```json
{
  "success": true,
  "offers": [],  // EMPTY!
  "iframeUrl": "https://revtoo.com/offerwall/..."
}
```

---

### Step 2: Check Browser Console Logs

1. Open: https://freecoino.com/earn
2. Press F12 (DevTools)
3. Console tab
4. Look for these logs:

**If API working:**
```
✅ Revtoo offers loaded: 1454
```

**If API failing:**
```
❌ Revtoo offers loaded: 0
```

---

### Step 3: Check Vercel Function Logs

```
1. Go to: https://vercel.com/dashboard
2. Select: freecoino project
3. Click: Deployments tab
4. Click: Latest deployment
5. Click: "Functions" tab
6. Look for: /api/revtoo-offers logs

Check for errors like:
- "401 Unauthorized"
- "403 Forbidden"
- "Invalid API key"
- "API endpoint not found"
```

---

## 🔴 Most Likely Causes:

### Cause 1: **REVTOO_API_KEY is WRONG**
**Probability:** 90%

**Evidence:**
- Offers showing but with fake data
- Means API call is failing
- Code returns empty offers when API fails
- Frontend shows placeholder/dummy offers

**Solution:**
```bash
1. Check Revtoo Dashboard → Settings → API Key
2. Compare with Vercel env var: REVTOO_API_KEY
3. If different, update in Vercel:
   
   Name: REVTOO_API_KEY
   Value: [CORRECT key from dashboard]
   
4. Save and redeploy
```

---

### Cause 2: **You Added SECRET KEY Instead of API KEY**
**Probability:** 80%

**Evidence:**
Screenshot showed TWO keys in Vercel:
- `REVTOO_SECRET_KEY` ← For postback verification
- `REVTOO_API_KEY` ← For fetching offers

**Issue:** 
Maybe you put SECRET key value in API_KEY variable!

**Check:**
```
REVTOO_API_KEY should be: ffebbb41f825f742d6b7a5f53a80ede3
REVTOO_SECRET_KEY should be: lmtx1hoinv2rvigke7z15bn7pe20fhk

OR vice versa!

One is for API calls, one is for postback verification.
```

**Solution:**
Try swapping the values if current setup not working!

---

### Cause 3: **Revtoo API Endpoint Changed**
**Probability:** 10%

**Current code tries 3 endpoints:**
```typescript
const endpoints = [
  `https://revtoo.com/api/offers/?api_key=${apiKey}&user_id=${userId}`,
  `https://api.revtoo.com/v1/offers?apiKey=${apiKey}&userId=${userId}`,
  `https://wall.revtoo.com/api/offers?apiKey=${apiKey}&userId=${userId}`,
];
```

**Check:** If all 3 failing, API might have moved to new URL.

**Solution:** Contact Revtoo support for correct API endpoint.

---

## 🔧 Quick Fix - Add Better Error Logging:

Let me add debug logging to see what's happening:

### Update: `app/api/revtoo-offers/route.ts`

Add these console logs:

```typescript
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "user_id is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.REVTOO_API_KEY;

    console.log("🔍 DEBUG: REVTOO_API_KEY exists?", !!apiKey);
    console.log("🔍 DEBUG: API key first 10 chars:", apiKey?.substring(0, 10));

    if (!apiKey) {
      console.error("❌ Revtoo API key NOT configured!");
      return NextResponse.json({
        success: false,
        error: "RevToo API key not configured",
        offers: [],
      });
    }

    const endpoints = [
      `https://revtoo.com/api/offers/?api_key=${apiKey}&user_id=${userId}`,
      `https://api.revtoo.com/v1/offers?apiKey=${apiKey}&userId=${userId}`,
      `https://wall.revtoo.com/api/offers?apiKey=${apiKey}&userId=${userId}`,
    ];

    let response;
    let lastError;
    let workingEndpoint = null;

    for (const endpoint of endpoints) {
      try {
        console.log(`🔄 Trying endpoint: ${endpoint.split('?')[0]}...`);
        response = await fetch(endpoint, {
          headers: {
            Accept: "application/json",
            "User-Agent": "Freecoino/1.0",
          },
        });

        if (response.ok) {
          workingEndpoint = endpoint.split('?')[0];
          console.log(`✅ Endpoint worked: ${workingEndpoint}`);
          break;
        } else {
          console.log(`❌ Endpoint failed with status: ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ Endpoint error:`, error);
        lastError = error;
      }
    }

    if (!response || !response.ok) {
      console.error("❌ All Revtoo endpoints failed!");
      console.error("Last error:", lastError);
      return NextResponse.json({
        success: true,
        offers: [],
        error: "All Revtoo API endpoints failed",
        iframeUrl: `https://revtoo.com/offerwall/${apiKey}/${userId}`,
      });
    }

    let data: any;
    try {
      data = await response.json();
      console.log("✅ Revtoo API response received");
      console.log("🔍 Response keys:", Object.keys(data));
      console.log("🔍 Offers count in response:", data.offers?.length || 0);
    } catch {
      console.error("❌ Failed to parse Revtoo API JSON response");
      return NextResponse.json({
        success: true,
        offers: [],
        iframeUrl: `https://revtoo.com/offerwall/${apiKey}/${userId}`,
      });
    }

    const rawOffers = data.offers || [];
    console.log(`🔍 Raw offers from Revtoo: ${rawOffers.length}`);
    
    if (rawOffers.length === 0) {
      console.warn("⚠️ Revtoo API returned 0 offers!");
    }

    // ... rest of the code
  }
}
```

This will show in Vercel Function logs exactly what's happening!

---

## 📊 Comparison: Real vs Fake Data

### If Data is REAL (from Revtoo API):
```
Offer Name: Varies (MISTPLAY, Bubble Pop, etc.)
Payout: Varies ($0.50 - $10.00)
Image: Real game icons from Google Play
Click URL: Real tracking URLs
Events: Real milestones with different payouts
Total Offers: ~1454
```

### If Data is FAKE (fallback/mock):
```
Offer Name: Same generic names repeating
Payout: Same values (like 0.63) repeating
Image: Placeholder images
Click URL: Empty or "#"
Events: Generic "Complete Offer" only
Total Offers: Very few (like 5-10)
```

---

## ✅ Action Plan:

### Do These in Order:

1. ⬜ **Test API URL directly in browser:**
   ```
   https://freecoino.com/api/revtoo-offers?user_id=test123
   ```
   - Screenshot response bhejo!

2. ⬜ **Check Vercel Function Logs:**
   - Go to latest deployment
   - Check /api/revtoo-offers logs
   - Screenshot bhejo!

3. ⬜ **Verify API Key in Revtoo Dashboard:**
   - Login to Revtoo
   - Settings → API
   - Compare key with Vercel env var
   - Screenshot (hide middle) bhejo!

4. ⬜ **If Still Not Working:**
   - Try swapping REVTOO_API_KEY with the other key value
   - Maybe you added wrong key

---

## 🆘 Quick Test Commands:

### Test 1: Check if API key exists
```bash
# Check Vercel env vars
Vercel → freecoino → Settings → Environment Variables
Look for: REVTOO_API_KEY
Value should start with: ffebbb41... OR lmtx1hoi...
```

### Test 2: Test API response format
```bash
# Open in browser:
https://freecoino.com/api/revtoo-offers?user_id=test123

# If you see this = API KEY WRONG:
{
  "success": false,
  "error": "RevToo API key not configured"
}

# If you see this = API WORKING:
{
  "success": true,
  "offers": [ ... hundreds of offers ... ]
}
```

---

**URGENT:** Test karke batao ki API URL se kya response aa raha hai! 🔍

**Most Likely:** API key wrong hai ya API failing hai isliye dummy data dikh raha! 🎯
