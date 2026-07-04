# 🔍 Vortex API Key - Exact Location

## ❌ Wrong Page: You're on "Offerwall Integration" (Iframe Setup)

The page you shared is for **iframe integration**, NOT REST API!

---

## ✅ Correct Location: API Documentation Page

### How to Navigate to API Key:

```
Vortex Publisher Dashboard
├── Dashboard (current homepage)
├── Placement
├── Offers
├── Reports
├── Billing
├── Settings
└── Docs (dropdown) ← EXPAND THIS!
    ├── Getting Started
    ├── Offerwall Integration ← (You are here - WRONG PAGE)
    └── API Documentation ← GO HERE! ✅
```

---

## 🎯 Step-by-Step Instructions:

### Step 1: Go to Docs Section
Left sidebar mein **"Docs"** pe click karo (dropdown expand hoga)

### Step 2: Click "API Documentation"
Docs dropdown mein se **"API Documentation"** option pe click karo

### Step 3: Find API Key
API Documentation page pe ye dikhega:

```
API Documentation
═══════════════════════════════════════

Integrating the API allows server-side data retrieval.

Request Method: GET
URL: https://api.vortexwall.com/api/v1/offers/static

Query Parameters:
┌──────────────┬─────────────────────────────┬─────────────────────────────┐
│ Parameter    │ Description                 │ Example                     │
├──────────────┼─────────────────────────────┼─────────────────────────────┤
│ placementId* │ Your Placement ID           │ 69dfafd0a982f180b5caa54c    │
│ apiKey*      │ Your API Key                │ abc123-def456-ghi789-jkl012 │ ← THIS!
│ country      │ Filter by country (optional)│ US,AU,IN                    │
└──────────────┴─────────────────────────────┴─────────────────────────────┘

* Required parameters

Example Request:
https://api.vortexwall.com/api/v1/offers/static?placementId=YOUR_PLACEMENT_ID&apiKey=YOUR_API_KEY
                                                                                    ↑
                                                                    API KEY YAHA HOGI! ✅
```

API Documentation page pe tumhara **actual API key pre-filled** hoga example mein!

---

## 📋 Alternative Methods:

### Method 1: Placement Page → API Tab
```
1. Left Sidebar → "Placement" click karo
2. Your placement (69dfafd0a982f180b5caa54c) pe click karo
3. Inside placement details, "API" ya "Integration" tab dhundho
4. API Key waha dikhega
```

### Method 2: Settings → API Configuration
```
1. Left Sidebar → "Settings" click karo
2. "API Settings" ya "API Configuration" section dhundho
3. API Key field mein hoga with [Copy] button
```

---

## 🎯 Current vs Correct Page:

### ❌ Current Page (Iframe Integration):
```
Docs → Offerwall Integration
└── Iframe setup instructions
    └── URL: https://vortexwall.com/ow/{PLACEMENT_ID}/{USER_ID}
    └── For iframe embedding only (NO API KEY)
```

### ✅ Correct Page (API Documentation):
```
Docs → API Documentation
└── REST API instructions
    └── URL: https://api.vortexwall.com/api/v1/offers/static
    └── Parameters: placementId + apiKey ← API KEY HERE!
```

---

## 🚀 What to Do Now:

### Action 1: Navigate to API Documentation
```
1. Vortex Dashboard pe jao
2. Left sidebar mein "Docs" expand karo
3. "API Documentation" pe click karo (NOT "Offerwall Integration")
4. API key waha dikhega examples mein
```

### Action 2: Look for These Sections
API Documentation page pe ye headings dhundho:
- ✅ "API" or "API Integration"
- ✅ "Server-Side Integration"
- ✅ "REST API"
- ✅ "Offers API"

### Action 3: Copy API Key
API Documentation page pe example code mein:
```javascript
// Example API call
fetch('https://api.vortexwall.com/api/v1/offers/static?placementId=69dfafd0a982f180b5caa54c&apiKey=YOUR_ACTUAL_KEY_HERE')
                                                                                                    ↑
                                                                                    Yeh copy karna hai! ✅
```

---

## 📸 Screenshot Request:

**Please share screenshot of:**
1. **Docs dropdown expanded** (Left sidebar → Docs → expand karke)
2. **API Documentation page** (Docs → API Documentation pe click karke)

Waha se main exact API key location point out kar dunga!

---

## ⚠️ Important Note:

Iframe integration (current page) aur REST API integration **alag-alag** cheezein hain:

| Feature | Iframe Integration | REST API Integration |
|---------|-------------------|---------------------|
| Page | Offerwall Integration | API Documentation |
| URL | `vortexwall.com/ow/...` | `api.vortexwall.com/api/v1/...` |
| Auth | Placement ID only | Placement ID + **API Key** |
| Use Case | Embed iframe | Fetch offers server-side |
| Current Status | ✅ Already working | ⚠️ Needs API key |

Aapko **REST API Documentation** page pe jana hai, NOT iframe integration page!

---

**Next Step:** Left sidebar → Docs → **API Documentation** pe jao! 🎯
