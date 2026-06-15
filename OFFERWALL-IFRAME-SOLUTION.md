# 🎯 Offerwall Integration - Iframe Solution

## 🚨 Problem: REST APIs Not Available

Most offerwalls (Revtoo, CPX, MyLead, etc.) **DO NOT provide REST APIs** to fetch offers.

Instead, they provide **iframe embed URLs** that you need to embed directly in your website.

## ✅ Correct Approach: Iframe Embedding

### How Offerwalls Actually Work:

1. **Publisher signs up** → Gets Publisher ID / App ID
2. **Offerwall provides iframe URL** → Format: `https://offerwall.com/widget/{publisherId}?userId={userId}`
3. **You embed iframe** in your earn page
4. **User completes offers** → Offerwall sends postback to your server
5. **Your postback endpoint** receives completion → Awards coins

## 📋 What We Have vs What We Need:

### ✅ Already Working:
- Postback endpoints ready:
  - `/api/revtoo/postback` ✅
  - `/api/timewall/postback` ✅
  
### ❌ What's Missing:
- **Iframe URLs** from offerwall providers
- **Publisher IDs** to construct iframe URLs

## 🔧 Fix Strategy:

### Option 1: Revtoo Iframe (If Available)

Revtoo might provide an iframe URL like:
```html
<iframe 
  src="https://revtoo.com/offerwall/{YOUR_PUBLISHER_ID}?userId={userId}"
  width="100%"
  height="800px"
  frameborder="0"
></iframe>
```

**You need to:**
1. Login to Revtoo publisher dashboard
2. Find your **Publisher ID** or **App ID**
3. Find the **Iframe Embed Code** in dashboard
4. Configure **Postback URL**: `https://freecoino.com/api/revtoo/postback?user_id={userId}&tx_id={txId}&amount={amount}`

### Option 2: MyLead Iframe (EASIEST - Approval Pending)

MyLead definitely provides iframe:
```html
<iframe 
  src="https://www.mylead.global/offer-wall/{YOUR_PUBLISHER_ID}?user_id={userId}"
  width="100%"
  height="800px"
  frameborder="0"
></iframe>
```

**Once you get approval:**
1. Get your MyLead Publisher ID
2. Embed iframe in earn page
3. Configure postback URL in MyLead dashboard

### Option 3: CPX Research Iframe

CPX provides iframe for surveys:
```html
<iframe 
  src="https://offers.cpx-research.com/index.php?app_id={YOUR_APP_ID}&ext_user_id={userId}"
  width="100%"
  height="800px"
  frameborder="0"
></iframe>
```

## 🚀 Immediate Action Items:

### For You:

1. **Login to Revtoo Dashboard**:
   - Find your Publisher ID / App ID
   - Look for "Integration" or "Embed Code" section
   - Get the iframe URL format
   - Configure postback URL: `https://freecoino.com/api/revtoo/postback?user_id={user_id}&tx_id={transaction_id}&amount={payout}`

2. **Wait for MyLead Approval**:
   - Once approved, get Publisher ID
   - Get iframe embed code
   - Configure postback

3. **Sign Up for CPX Research** (if you haven't):
   - https://cpx-research.com/
   - Apply as publisher
   - Get App ID
   - Get iframe code

### For Me (When You Provide IDs):

Once you give me the Publisher IDs / App IDs, I'll:
1. Update earn page to embed iframes
2. Configure proper postback parameters
3. Test the full flow

## 📞 Next Steps:

**Tell me:**
1. Do you have access to Revtoo publisher dashboard?
2. Can you find the iframe embed code there?
3. What's your Revtoo Publisher ID / App ID?
4. Have you received MyLead approval yet?

---

**Bottom Line**: Offerwalls don't have REST APIs. We need to embed iframes. Postback endpoints are already ready! 🚀
