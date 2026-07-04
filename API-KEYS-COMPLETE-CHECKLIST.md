# 🔑 Complete API Keys Checklist - Freecoino

## ✅ Which API Keys You Need to Add

Yeh list priority order mein hai - **sabse important pehle**!

---

## 🔴 CRITICAL - Add These FIRST (Top Priority):

### 1. **REVTOO_API_KEY** ⚠️ MOST URGENT!
**Status:** ❌ Missing (Site NOT working without this!)  
**Priority:** 🔴 **HIGHEST - Add immediately!**

**Kya Hoga Iske Bina:**
- ❌ Gaming Offers section EMPTY rahega
- ❌ 1454 offers nahi dikhenge
- ❌ Users kuch earn nahi kar payenge
- ❌ Site useless rahegi

**Kahan Se Milega:**
```
1. Login: Revtoo Publisher Dashboard
   URL: https://revtoo.com/publisher (ya jo bhi signup kiya tha)
   
2. Go to: 
   - Settings → API Settings, YA
   - Integration → API Credentials, YA
   - Dashboard → Developer Tools

3. Look for: "API Key" field
   
4. Copy the key (looks like: "rev_abc123xyz456...")
```

**Vercel Mein Kaise Add Karein:**
```
Vercel Dashboard → freecoino project → Settings → Environment Variables

Name: REVTOO_API_KEY
Value: [paste your copied API key]
Environment: ✅ Production ✅ Preview ✅ Development (select all 3)

Click: Save
```

**Expected Result:**
- ✅ 1454 Revtoo gaming offers will appear
- ✅ Users can click and complete offers
- ✅ Real payout data will show (e.g., "Earn 1500 coins")

---

### 2. **VORTEX_API_KEY** ⚠️ Very Important!
**Status:** ❌ Missing  
**Priority:** 🟠 **HIGH**

**Kya Hoga Iske Bina:**
- ⚠️ Vortex iframe toh kaam karega (already working)
- ❌ But Gaming Offers section mein 100-200 extra offers nahi dikhenge

**Kahan Se Milega:**
```
1. Login: https://publisher.vortexwall.com/

2. Go to:
   - Placement Details → Click on "freecoino" placement → Look for API Key field
   - Settings → API Configuration
   
3. If NOT visible:
   - Contact Vortex Support (in-dashboard chat or support@vortexwall.com)
   - Message template already created in: VORTEX-SUPPORT-CONTACT.md

Your Placement ID: 6a45ffeebe991f606452e3a6
```

**Vercel Mein Add Karein:**
```
Name: VORTEX_API_KEY
Value: [API key from Vortex dashboard]
Environment: All 3

Already added:
Name: VORTEX_PLACEMENT_ID
Value: 69dfafd0a982f180b5caa54c ✅
```

**Expected Result:**
- ✅ 100-200 more Vortex offers in Gaming Offers section
- ✅ Total offers increase to ~1600+

---

## 🟡 MEDIUM Priority - Add These for More Offers:

### 3. **GEMIAD_API_KEY**
**Status:** ❌ Missing  
**Priority:** 🟡 **MEDIUM**

**Kya Hoga Iske Bina:**
- ⚠️ Gemiad tab iframe kaam karega
- ❌ Gaming Offers mein Gemiad offers nahi dikhenge (~200 offers miss)

**Kahan Se Milega:**
```
1. Login: Gemiad Publisher Dashboard
   URL: Check your Gemiad signup email

2. Go to: Settings → API Settings or Integration

3. Copy: API Key
```

**Vercel Mein Add Karein:**
```
Name: GEMIAD_API_KEY
Value: [your Gemiad API key]
Environment: All 3
```

**Expected Result:**
- ✅ 200+ more offers from Gemiad

---

### 4. **CPX_PUBLISHER_ID** and **CPX_API_KEY**
**Status:** ❌ Missing  
**Priority:** 🟡 **MEDIUM** (For Surveys section)

**Kya Hoga Iske Bina:**
- ❌ CPX Surveys section EMPTY rahega
- ⚠️ But CPX/KLink gaming offers shayad kaam kar rahe hain (needs verification)

**Kahan Se Milega:**
```
1. Login: CPX Research Publisher Dashboard
   URL: https://www.cpx-research.com/

2. Go to: Integration → API Settings

3. Copy:
   - Publisher ID (or App ID)
   - API Key
```

**Vercel Mein Add Karein:**
```
Name: CPX_PUBLISHER_ID
Value: [your publisher ID]
Environment: All 3

Name: CPX_API_KEY
Value: [your API key]
Environment: All 3
```

**Expected Result:**
- ✅ CPX Surveys section will show surveys
- ✅ Users can earn coins from surveys

---

### 5. **KLINK_API_KEY** and **KLINK_PUBLISHER_ID**
**Status:** ❌ Unknown (may be working without key?)  
**Priority:** 🟡 **MEDIUM**

**Kya Hoga:**
- KLink is alternative to CPX Research
- Same gaming offers, different API

**Kahan Se Milega:**
```
1. Login: KLink Labs Dashboard
   URL: Check your KLink signup email

2. Go to: Settings → API Configuration

3. Copy:
   - Publisher ID
   - API Key
   - API Secret (if required)
```

**Vercel Mein Add Karein:**
```
Name: KLINK_API_KEY
Value: [your API key]
Environment: All 3

Name: KLINK_PUBLISHER_ID
Value: [your publisher ID]
Environment: All 3

Name: KLINK_API_SECRET (if needed)
Value: [your API secret]
Environment: All 3
```

---

## 🟢 LOW Priority - Already Working OR Not Critical:

### 6. **NOTIK_API_KEY** ✅ Already Added!
**Status:** ✅ Already in Vercel  
**Value:** `22IuIvBsE3L9Wo7ECjCrOYqvvT5jKrBS`  
**Priority:** 🟢 **DONE**

**Note:** Notik REST API blocked by Cloudflare, but iframe working perfectly!

---

### 7. **NOTIK_API_SECRET**
**Status:** ❌ Missing (for postback verification)  
**Priority:** 🟢 **LOW** (postback will work without it, but less secure)

**Value:** `v95KIW0kDXyVdIEVVZT9ZArM0WpDEz4v` (you already shared this!)

**Vercel Mein Add Karein:**
```
Name: NOTIK_API_SECRET
Value: v95KIW0kDXyVdIEVVZT9ZArM0WpDEz4v
Environment: All 3
```

**Purpose:** Verify postback requests from Notik (security)

---

### 8. **TIMEWALL_API_KEY**
**Status:** ❌ Unknown  
**Priority:** 🟢 **LOW** (iframe working)

**Kahan Se Milega:**
```
1. Login: Timewall Publisher Dashboard
   URL: https://timewall.io/

2. Go to: Settings → API or Integration

3. Copy: API Key
```

**Vercel Mein Add Karein:**
```
Name: TIMEWALL_API_KEY
Value: [your Timewall API key]
Environment: All 3

Name: TIMEWALL_APP_ID
Value: [your app ID]
Environment: All 3
```

---

## 📊 Complete API Keys Summary:

| API Key | Status | Priority | Impact | Dashboard URL |
|---------|--------|----------|--------|---------------|
| **REVTOO_API_KEY** | ❌ Missing | 🔴 CRITICAL | 1454 offers missing! | Revtoo Dashboard |
| **VORTEX_API_KEY** | ❌ Missing | 🟠 HIGH | 100-200 offers missing | https://publisher.vortexwall.com |
| **GEMIAD_API_KEY** | ❌ Missing | 🟡 MEDIUM | 200 offers missing | Gemiad Dashboard |
| **CPX_PUBLISHER_ID** | ❌ Missing | 🟡 MEDIUM | Surveys not working | https://cpx-research.com |
| **CPX_API_KEY** | ❌ Missing | 🟡 MEDIUM | Surveys not working | https://cpx-research.com |
| **KLINK_API_KEY** | ❌ Unknown | 🟡 MEDIUM | May need for KLink | KLink Dashboard |
| **NOTIK_API_KEY** | ✅ Added | 🟢 DONE | Working (iframe only) | - |
| **NOTIK_API_SECRET** | ❌ Missing | 🟢 LOW | Postback security | - |
| **TIMEWALL_API_KEY** | ❌ Unknown | 🟢 LOW | Optional (iframe works) | https://timewall.io |

---

## 🎯 RECOMMENDED ACTION PLAN:

### Week 1 (This Week) - Critical:
```
Day 1-2:
1. ✅ Add REVTOO_API_KEY (MOST IMPORTANT!)
   → Without this, site is useless for users
   
2. ✅ Contact Vortex Support for VORTEX_API_KEY
   → Use template in VORTEX-SUPPORT-CONTACT.md
```

### Week 2 - Important:
```
Day 3-5:
3. ✅ Add GEMIAD_API_KEY
   → Get 200 more offers
   
4. ✅ Add CPX_PUBLISHER_ID + CPX_API_KEY
   → Enable surveys section
```

### Week 3 - Optional:
```
Day 6-7:
5. ✅ Add NOTIK_API_SECRET (security)
6. ✅ Add KLINK keys (if needed)
7. ✅ Add TIMEWALL keys (optional)
```

---

## 🔧 How to Add API Keys to Vercel (Step-by-Step):

### Step 1: Open Vercel Dashboard
```
1. Go to: https://vercel.com/dashboard
2. Find and click: "freecoino" project
```

### Step 2: Navigate to Environment Variables
```
1. Click: "Settings" tab (top navigation)
2. Scroll to: "Environment Variables" section in left sidebar
3. Click: "Environment Variables"
```

### Step 3: Add New Variable
```
1. Click: "Add New" button (or "+ Add Variable")

2. Fill in:
   Name: REVTOO_API_KEY (example)
   Value: [paste your API key here]
   
3. Select Environments:
   ✅ Production
   ✅ Preview
   ✅ Development
   (Select all 3!)
   
4. Click: "Save"
```

### Step 4: Repeat for Each API Key
```
Repeat Step 3 for:
- VORTEX_API_KEY
- GEMIAD_API_KEY
- CPX_PUBLISHER_ID
- CPX_API_KEY
- etc.
```

### Step 5: Redeploy (Automatic)
```
After saving, Vercel will automatically redeploy your site.
Wait 2-3 minutes for deployment to complete.
```

### Step 6: Verify
```
1. Visit: https://freecoino.com/earn
2. Check: Gaming Offers section
3. Should see: All offers from configured offerwalls!
```

---

## 📧 Support Contact Template (For All Offerwalls):

```
Subject: Need API Key for Website Integration

Hello [Offerwall Name] Support Team,

I need my API key to integrate [Offerwall Name] REST API into my website.

Account Details:
- Website: https://freecoino.com
- Email: souabhkumar8310@gmail.com
- Platform: Web (Offerwall)

I cannot find the API key in my publisher dashboard. Could you please:
1. Provide my API key, OR
2. Guide me to where I can find it in the dashboard

Purpose: I want to fetch your offers programmatically and display them 
on my cryptocurrency rewards website.

Thank you!

Best regards,
Souabh Kumar
https://freecoino.com
```

---

## ✅ Current Environment Variables Status:

### Already Configured: ✅
```
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ SUPABASE_SERVICE_ROLE_KEY
✅ RESEND_API_KEY
✅ ADMIN_EMAIL
✅ NOTIK_API_KEY
✅ VORTEX_PLACEMENT_ID
✅ NEXT_PUBLIC_NOTIK_APP_ID
✅ NEXT_PUBLIC_NOTIK_PUBLISHER_ID
```

### Need to Add: ❌
```
❌ REVTOO_API_KEY ← URGENT!
❌ VORTEX_API_KEY ← Contact support
❌ GEMIAD_API_KEY
❌ CPX_PUBLISHER_ID
❌ CPX_API_KEY
❌ KLINK_API_KEY (optional)
❌ KLINK_PUBLISHER_ID (optional)
❌ NOTIK_API_SECRET
❌ TIMEWALL_API_KEY (optional)
❌ TIMEWALL_APP_ID (optional)
```

---

## 🎉 Final Result After All Keys Added:

```
Gaming Offers Section:
├── Revtoo: ~1454 offers ✅
├── Vortex: ~150 offers ✅
├── Gemiad: ~200 offers ✅
├── KLink/CPX: ~50 offers ✅
├── Notik: 0 (Cloudflare blocked, iframe works) ✅
└── TOTAL: ~1850+ OFFERS! 🚀

Surveys Section:
└── CPX Surveys: ~20-50 surveys ✅

Iframe Tabs (Already Working):
├── Notik Offerwall ✅
├── Vortex Offerwall ✅
├── Timewall Offerwall ✅
└── All working perfectly! ✅
```

---

## 🆘 Need Help?

1. **Can't find API key in dashboard?**
   → Contact offerwall support using template above

2. **Don't remember which offerwall you signed up for?**
   → Check your email for signup confirmations

3. **API key not working after adding?**
   → Wait 2-3 minutes for Vercel redeploy
   → Check Vercel deployment logs for errors
   → Verify API key is correct (no extra spaces)

4. **Still confused?**
   → Tell me which specific offerwall you're trying to set up
   → I'll give you step-by-step guide for that one!

---

**START HERE:** Add **REVTOO_API_KEY** first! It's the most important! 🔴

**Question:** Aapke paas already konse offerwall accounts hain? Batao, main priority set karne mein help karunga! 😊
