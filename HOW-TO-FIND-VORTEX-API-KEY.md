# 🔍 How to Find Vortex API Key

## Dashboard Status: API Key Not Visible Yet

Aapne dashboard screenshot share ki hai. API key dhoondhne ke liye ye steps follow karo:

---

## Method 1: Settings/API Section (Most Common)

### Step 1: Click on "Settings" in Left Sidebar
```
Dashboard (current page)
├── Placement
├── Offers
├── Reports
├── Billing
└── Settings ← Click this!
```

### Step 2: Look for API Configuration
Settings page pe ye sections honge:
- General Settings
- **API Settings** ← Check this section
- Integration Settings
- Security Settings

### Step 3: Find API Key Field
API Settings section mein ye fields dikhenge:
```
┌─────────────────────────────────────┐
│ API Configuration                   │
├─────────────────────────────────────┤
│ API Key: ************************** │
│ [Show] [Copy]                       │
│                                     │
│ Placement ID: 69dfafd0a982f180b5... │
└─────────────────────────────────────┘
```

---

## Method 2: Placement Details (Alternative)

### Step 1: Click "Placement" in Left Sidebar
```
Dashboard
├── Placement ← Click this!
```

### Step 2: Click on Your Placement
You should see your placement:
```
Name: [Your placement name]
ID: 69dfafd0a982f180b5caa54c
Status: Active
```
Click on it.

### Step 3: Look for "API" Tab or Section
Inside placement details:
```
Tabs:
├── Overview
├── Integration ← Check this!
├── API Settings ← Or this!
└── Statistics
```

### Step 4: Find API Key
API section mein:
```
API Endpoint: https://api.vortexwall.com/api/v1/offers/static

Required Parameters:
- placementId: 69dfafd0a982f180b5caa54c
- apiKey: ************************** [Copy]
```

---

## Method 3: Docs Section

### Step 1: Click "Docs" in Left Sidebar
```
Dashboard
└── Docs ← Expand this dropdown
    ├── Getting Started
    ├── API Documentation ← Click this!
    └── Integration Guide
```

### Step 2: Check API Documentation
Documentation page pe:
- Example API calls dikhenge
- Aapka **API key pre-filled** hoga examples mein
- Copy that key

---

## Method 4: Contact Support (If Still Not Found)

Agar upar ke kisi bhi method se API key nahi mila:

### Option A: In-Dashboard Support
1. Dashboard pe right-bottom corner mein **Support/Help** icon hoga
2. Click karke message bhejo:
   ```
   Subject: Need API Key for REST API Integration
   Message: Hi, I need my API key to integrate the REST API. 
   My Placement ID is: 69dfafd0a982f180b5caa54c
   ```

### Option B: Check Email
- Signup confirmation email check karo
- Welcome email mein API credentials hote hain

---

## 🆘 Agar API Key Feature Hi Nahi Hai

Kuch publisher dashboards mein API access initially disabled hota hai:

### Check Account Status:
1. Dashboard → **Billing** or **Account Type**
2. Check if you need to:
   - ✅ Verify email
   - ✅ Complete profile
   - ✅ Upgrade plan (some require paid plan for API)
   - ✅ Request API access

### Request API Access:
If API feature locked hai:
```
Settings → Contact Support
Subject: Enable REST API Access
Message: 
Hi, I would like to enable REST API access for my account.
Placement ID: 69dfafd0a982f180b5caa54c
Use case: Integrate offers into my website (freecoino.com)
```

---

## 🔄 Alternative: Use Iframe Only (Temporary)

Agar API key abhi nahi mil raha, toh temporarily iframe use karo:

### Iframe Already Configured:
Vortex iframe already working hai aapke site pe:
```
https://freecoino.com/earn → Vortex tab
```

Iframe URL:
```
https://vortexwall.com/ow/69dfafd0a982f180b5caa54c/{userId}
```

API key milne ke baad REST API enable ho jayega automatically.

---

## ✅ What to Do Right Now:

### Immediate Actions:
1. ⬜ Click "Settings" in left sidebar
2. ⬜ Look for "API Settings" or "Integration" section
3. ⬜ Find API Key field and copy it
4. ⬜ If not found, click "Placement" → Your placement → API tab
5. ⬜ If still not found, click "Docs" → API Documentation
6. ⬜ If API feature disabled, contact support to enable it

### Once You Find API Key:
```bash
# Add to Vercel:
1. Vercel Dashboard → freecoino → Settings → Environment Variables
2. Add: VORTEX_API_KEY = [your_api_key]
3. Save and redeploy
```

---

## 📸 Screenshot Request:

Agar abhi bhi nahi mil raha, toh ye screenshots bhejo:

1. **Settings page ka screenshot**
   - Click: Settings in left sidebar
   - Take full page screenshot

2. **Placement Details page ka screenshot**
   - Click: Placement → Your placement
   - Take screenshot of all tabs visible

3. **Docs/API Documentation page ka screenshot**
   - Click: Docs → API Documentation
   - Take screenshot

Main dekhkar bataunga API key exactly kaha hai!

---

## 🎯 Expected Locations (Based on Common Dashboards):

| Location | Probability | Path |
|----------|-------------|------|
| Settings → API Settings | ⭐⭐⭐⭐⭐ (90%) | Dashboard → Settings → API |
| Placement → API Tab | ⭐⭐⭐⭐ (80%) | Dashboard → Placement → [Your placement] → API |
| Docs → API Examples | ⭐⭐⭐ (60%) | Dashboard → Docs → API Documentation |
| Profile → Credentials | ⭐⭐ (40%) | Dashboard → Profile/Account → API Credentials |

---

**Next Step:** Settings section mein jaao aur API Settings dhundho! 🔍
