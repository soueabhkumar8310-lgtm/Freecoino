# 🎮 Offerwall Activation Guide (Hindi/Hinglish)

## 📊 **CURRENT STATUS**

| Offerwall | Status | Kya Karna Hai |
|-----------|--------|---------------|
| ✅ **Revtoo** | WORKING | Nothing - already 1454 games showing |
| ⚠️ **Vortex** | Approved but not configured | API Key + Placement ID add karo |
| ⚠️ **CPX Research** | Active but not configured | Publisher ID + API Key add karo |
| ⚠️ **Notik** | Approved (Iframe-only) | Already configured - iframe use karo |
| ❌ **Gemiad** | Not configured | API Key add karo |
| ✅ **Timewall** | WORKING | Already working in Taskwall tab |

---

## 🔑 **STEP-BY-STEP ACTIVATION**

### 1️⃣ **VORTEX OFFERWALL** (Priority: High)

**Dashboard**: https://publisher.vortexwall.com/

**Kya milega**: 100-200 gaming offers

**Configuration Steps**:

1. **Login karo** Vortex dashboard me
2. **Settings → API** section me jao
3. **API Key copy** karo (example: `abc123xyz...`)
4. **Placements section** me jao
5. **Placement ID copy** karo (example: `69dfafd0a982f180b5caa54c`)

**Vercel me add karo**:
```
VORTEX_API_KEY = your_api_key_here
VORTEX_PLACEMENT_ID = your_placement_id_here
```

**Localhost me add karo** (.env.local):
```env
VORTEX_API_KEY=your_api_key_here
VORTEX_PLACEMENT_ID=your_placement_id_here
```

---

### 2️⃣ **CPX RESEARCH** (Priority: Medium - Surveys only)

**Dashboard**: https://offers.cpx-research.com/

**Kya milega**: Surveys (not gaming offers)

**Configuration Steps**:

1. **Login karo** CPX dashboard me
2. **Apps section** me jao
3. **Your App select** karo
4. **Integration Settings** me jao
5. **App ID (Publisher ID) copy** karo
6. **Secure Hash (API Key) copy** karo

**Vercel me add karo**:
```
CPX_PUBLISHER_ID = your_app_id_here
CPX_API_KEY = your_secure_hash_here
```

**Localhost me add karo** (.env.local):
```env
CPX_PUBLISHER_ID=your_app_id_here
CPX_API_KEY=your_secure_hash_here
```

---

### 3️⃣ **GEMIAD OFFERWALL** (Priority: Low)

**Dashboard**: https://gemiad.com/publishers/

**Kya milega**: 50-100 offers

**Configuration Steps**:

1. **Account banao** ya login karo
2. **Integration → API** section me jao
3. **API Key copy** karo
4. **Publisher ID bhi copy** karo (if required)

**Vercel me add karo**:
```
GEMIAD_API_KEY = your_api_key_here
```

**Localhost me add karo** (.env.local):
```env
GEMIAD_API_KEY=your_api_key_here
```

---

### 4️⃣ **NOTIK OFFERWALL** (Already Configured - Iframe Only)

**Status**: ✅ API Key already added: `22IuIvBsE3L9Wo7ECjCrOYqvvT5jKrBS`

**Problem**: Notik ka REST API nahi hai - **Cloudflare 403 protection** hai

**Solution**: Iframe integration use karo

**Kya karna hai**:
- Nothing! Already working as iframe
- Gaming Offers me Notik offers nahi aayenge
- Notik tab me iframe working hai (if configured)

---

## 🔧 **HOW TO ADD ENVIRONMENT VARIABLES**

### **A) VERCEL (Production)**

1. **Vercel Dashboard** open karo: https://vercel.com/
2. **Your project** select karo: `Freecoino`
3. **Settings → Environment Variables** me jao
4. **Add New** button click karo
5. **Variable details** enter karo:
   - **Key**: `VORTEX_API_KEY`
   - **Value**: `your_api_key_here`
   - **Environment**: Select all (Production, Preview, Development)
6. **Save** karo
7. **Repeat** for all variables

**Variables to add**:
```
VORTEX_API_KEY
VORTEX_PLACEMENT_ID
CPX_PUBLISHER_ID
CPX_API_KEY
GEMIAD_API_KEY
```

### **B) LOCALHOST (Development)**

1. **Open file**: `c:\project\freecoino\.env.local`
2. **Add these lines**:

```env
# Vortex Offerwall
VORTEX_API_KEY=your_vortex_api_key
VORTEX_PLACEMENT_ID=your_vortex_placement_id

# CPX Research (Surveys)
CPX_PUBLISHER_ID=your_cpx_publisher_id
CPX_API_KEY=your_cpx_api_key

# Gemiad Offerwall
GEMIAD_API_KEY=your_gemiad_api_key

# Notik (Already added)
NOTIK_API_KEY=22IuIvBsE3L9Wo7ECjCrOYqvvT5jKrBS

# Revtoo (Already working)
REVTOO_API_KEY=lmtx1hoinv2rvugle7z+l5bn7pe20fh
```

3. **Save file**
4. **Restart dev server**:
```bash
npm run dev
```

---

## ✅ **VERIFICATION STEPS**

### **Step 1: Test Locally**

1. **Start dev server**:
```bash
cd c:\project\freecoino
npm run dev
```

2. **Open**: http://localhost:3000/earn

3. **Check console** (F12 → Console):
```
✅ Vortex offers loaded: 150
✅ CPX surveys loaded: 25
✅ Gemiad offers loaded: 80
✅ Revtoo offers loaded: 1454
Total combined offers: 1684
```

4. **Gaming Offers section** should show cards from all offerwalls

### **Step 2: Deploy to Production**

```bash
git add .env.local
# DON'T commit .env.local - only for reference!

# If you made code changes:
git add .
git commit -m "Configure all offerwalls - add API integrations"
git push origin main
```

### **Step 3: Test on Live Site**

1. **Wait 2-3 minutes** for Vercel deployment
2. **Open**: https://freecoino.com/earn
3. **Check console** for success messages
4. **Gaming Offers section** should show games
5. **Surveys section** should show CPX surveys

---

## 🎯 **EXPECTED RESULTS AFTER ACTIVATION**

### **Before** (Current State):
```
✅ Revtoo: 1454 gaming offers
❌ Vortex: 0 offers (not configured)
❌ CPX: 0 surveys (not configured)
❌ Gemiad: 0 offers (not configured)
❌ Notik: 0 offers (iframe-only, Cloudflare blocked)
```

### **After** (All Configured):
```
✅ Revtoo: 1454 gaming offers
✅ Vortex: 100-200 gaming offers
✅ CPX: 20-50 surveys
✅ Gemiad: 50-100 offers
⚠️ Notik: Iframe integration (separate tab)
```

**Total Gaming Offers**: **1600-1800+ games!** 🎮

---

## 📋 **PRIORITY ORDER**

Konsa offerwall pehle activate karo:

1. **Revtoo** ✅ Already working - 1454 games
2. **Vortex** ⭐ HIGH PRIORITY - 100-200 more games
3. **Gemiad** ⭐ MEDIUM PRIORITY - 50-100 more games
4. **CPX Research** ⭐ LOW PRIORITY - Surveys only (not games)
5. **Notik** ⚠️ Skip API - Iframe integration only

---

## 🆘 **TROUBLESHOOTING**

### **Problem 1**: Gaming Offers still empty after adding keys

**Solution**:
1. Check Vercel deployment completed
2. Check console logs for errors
3. Verify API keys are correct
4. Clear browser cache: Ctrl+Shift+Delete

### **Problem 2**: "API key not configured" error in console

**Solution**:
1. Check environment variable name spelling
2. Redeploy: `git commit --allow-empty -m "Redeploy" && git push`
3. Check Vercel dashboard shows the variables

### **Problem 3**: Offerwall returns 0 offers

**Solution**:
1. Offerwall might be iframe-only (normal for Notik)
2. Check offerwall dashboard - account approved?
3. Check console logs for API endpoint errors
4. Contact offerwall support

---

## 🎉 **QUICK START (5 Minutes)**

**Sabse fast way to activate Vortex**:

1. **Login**: https://publisher.vortexwall.com/
2. **Copy API Key + Placement ID**
3. **Add to Vercel**: Settings → Environment Variables
4. **Redeploy**: 
   ```bash
   git commit --allow-empty -m "Activate Vortex offerwall"
   git push origin main
   ```
5. **Wait 2 minutes** → Check freecoino.com/earn
6. **100+ more games appear!** 🎮

---

## 📞 **NEED HELP?**

**Check these files**:
- `OFFERWALL-API-SETUP-GUIDE.md` - Detailed technical guide
- `POSTBACK-CONFIGURATION-GUIDE.md` - How to receive coins
- `CHECK-VERCEL-ENV-VARS.md` - Environment variables checklist

**Console logs dikha do**:
1. Open freecoino.com/earn
2. Press F12 → Console
3. Copy all logs
4. Share with me

---

**Created**: June 16, 2026  
**Last Updated**: June 16, 2026  
**Status**: All APIs implemented, waiting for configuration

