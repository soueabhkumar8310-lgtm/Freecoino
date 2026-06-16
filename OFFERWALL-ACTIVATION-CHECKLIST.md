# ✅ Offerwall Activation Checklist

Quick reference for activating each offerwall. Check ✅ after completing each step.

---

## 🎯 **QUICK SUMMARY**

**Goal**: Get 1600+ gaming offers from all offerwalls

**Current**: 1454 offers (Revtoo only)

**Needed**: Configure Vortex, Gemiad, CPX Research

**Time**: 15-20 minutes total

---

## 📋 **VORTEX OFFERWALL** (+100-200 games)

Dashboard: https://publisher.vortexwall.com/

- [ ] Step 1: Login to Vortex dashboard
- [ ] Step 2: Go to Settings → API
- [ ] Step 3: Copy API Key → Save to notepad
- [ ] Step 4: Go to Placements section
- [ ] Step 5: Copy Placement ID → Save to notepad
- [ ] Step 6: Add to Vercel:
  - [ ] `VORTEX_API_KEY` = (your key)
  - [ ] `VORTEX_PLACEMENT_ID` = (your placement ID)
- [ ] Step 7: Add to `.env.local` (for localhost testing)
- [ ] Step 8: Trigger redeploy (push to GitHub or click Redeploy in Vercel)
- [ ] Step 9: Wait 2-3 minutes for deployment
- [ ] Step 10: Test on freecoino.com/earn → Check console logs

**Expected Result**: 
```
✅ Vortex offers loaded: 150
```

---

## 📋 **CPX RESEARCH** (+20-50 surveys)

Dashboard: https://offers.cpx-research.com/

- [ ] Step 1: Login to CPX dashboard
- [ ] Step 2: Go to Apps section
- [ ] Step 3: Select your app
- [ ] Step 4: Go to Integration Settings
- [ ] Step 5: Copy App ID (Publisher ID) → Save to notepad
- [ ] Step 6: Copy Secure Hash (API Key) → Save to notepad
- [ ] Step 7: Add to Vercel:
  - [ ] `CPX_PUBLISHER_ID` = (your app ID)
  - [ ] `CPX_API_KEY` = (your secure hash)
- [ ] Step 8: Add to `.env.local` (for localhost testing)
- [ ] Step 9: Trigger redeploy
- [ ] Step 10: Test on freecoino.com/earn → Check Surveys section

**Expected Result**: 
```
✅ CPX surveys loaded: 25
```

---

## 📋 **GEMIAD OFFERWALL** (+50-100 offers)

Dashboard: https://gemiad.com/publishers/

- [ ] Step 1: Create account or login to Gemiad
- [ ] Step 2: Wait for account approval (if new)
- [ ] Step 3: Go to Integration → API section
- [ ] Step 4: Copy API Key → Save to notepad
- [ ] Step 5: Copy Publisher ID (if required) → Save to notepad
- [ ] Step 6: Add to Vercel:
  - [ ] `GEMIAD_API_KEY` = (your key)
- [ ] Step 7: Add to `.env.local` (for localhost testing)
- [ ] Step 8: Trigger redeploy
- [ ] Step 9: Test on freecoino.com/earn → Check console logs

**Expected Result**: 
```
✅ Gemiad offers loaded: 80
```

---

## 📋 **NOTIK OFFERWALL** (Iframe Only - Already Configured)

Status: ✅ API Key already added to Vercel

- [x] API Key configured: `22IuIvBsE3L9Wo7ECjCrOYqvvT5jKrBS`
- [x] Issue identified: Cloudflare 403 protection (no REST API available)
- [x] Solution: Use iframe integration in Notik tab
- [ ] Optional: Add Notik iframe to offerwall tabs

**Note**: Notik offers won't appear in Gaming Offers section (API blocked). Use iframe instead.

---

## 📋 **REVTOO OFFERWALL** (Already Working!)

Status: ✅ Working perfectly

- [x] API Key configured: `lmtx1hoinv2rvugle7z+l5bn7pe20fh`
- [x] Currently loading: **1454 gaming offers**
- [x] Console shows: `✅ Revtoo offers loaded: 1454`
- [x] Gaming Offers section populated

**No action needed** - already working! 🎉

---

## 📋 **TIMEWALL OFFERWALL** (Already Working!)

Status: ✅ Working as iframe

- [x] Iframe integration working in Taskwall tab
- [x] Placement ID: `ba72f7d1dde24922`
- [x] Postback configured

**No action needed** - already working! 🎉

---

## 🔧 **VERCEL DEPLOYMENT STEPS**

After adding environment variables:

- [ ] Step 1: Go to Vercel dashboard
- [ ] Step 2: Select "Freecoino" project
- [ ] Step 3: Go to Settings → Environment Variables
- [ ] Step 4: Click "Add New" button
- [ ] Step 5: Enter variable name and value
- [ ] Step 6: Select all environments (Production, Preview, Development)
- [ ] Step 7: Click "Save"
- [ ] Step 8: Repeat for all variables
- [ ] Step 9: Go to Deployments tab
- [ ] Step 10: Click "Redeploy" on latest deployment
- [ ] Step 11: Wait 2-3 minutes
- [ ] Step 12: Test on live site

---

## ✅ **VERIFICATION CHECKLIST**

### Localhost Testing (Before Production):

- [ ] Started dev server: `npm run dev`
- [ ] Opened: http://localhost:3000/earn
- [ ] Opened browser console (F12)
- [ ] Checked logs for each offerwall:
  - [ ] ✅ Vortex offers loaded: X
  - [ ] ✅ CPX surveys loaded: X
  - [ ] ✅ Gemiad offers loaded: X
  - [ ] ✅ Revtoo offers loaded: 1454
- [ ] Gaming Offers section showing cards
- [ ] Surveys section showing surveys
- [ ] Click on offer opens modal
- [ ] "View All" button works

### Production Testing (After Deployment):

- [ ] Waited 2-3 minutes for deployment
- [ ] Opened: https://freecoino.com/earn
- [ ] Opened browser console (F12)
- [ ] Checked logs for success messages
- [ ] Gaming Offers section showing cards
- [ ] Surveys section showing surveys
- [ ] Offers from multiple offerwalls visible
- [ ] Click on offer opens modal
- [ ] "View All" button works
- [ ] Checked total offer count in console

---

## 📊 **EXPECTED FINAL RESULTS**

### Console Logs:
```
✅ Revtoo offers loaded: 1454
✅ Vortex offers loaded: 150
✅ CPX surveys loaded: 25
✅ Gemiad offers loaded: 80
Total combined offers: 1709
Filtered gaming offers: 1684
Using offers (showing all): 1684
Gaming Offers section: Displaying 12 of 1684
```

### Gaming Offers Section:
- Shows 12 offer cards initially
- Infinite scroll loads more as you scroll
- "View All" button links to /offers/all
- Each card shows:
  - Game image
  - Game name
  - Payout amount
  - Provider name (Revtoo/Vortex/Gemiad)
  - Tracking type (CPE/CPI/CPA)

### Surveys Section:
- Shows up to 12 CPX surveys
- Each survey shows:
  - Survey length (LOI)
  - Payout amount
  - Click opens survey in new tab

---

## 🚨 **TROUBLESHOOTING**

### Issue: Environment variable not found

**Symptoms**: Console shows `❌ [Offerwall] API key not configured`

**Solution**:
- [ ] Check variable name spelling in Vercel
- [ ] Check variable name matches code (e.g., `VORTEX_API_KEY` not `VORTEX_KEY`)
- [ ] Redeploy after adding variables
- [ ] Clear browser cache (Ctrl+Shift+Delete)

### Issue: API returns 0 offers

**Symptoms**: Console shows `✅ [Offerwall] offers loaded: 0`

**Solution**:
- [ ] Offerwall might be iframe-only (check if returns message)
- [ ] Check if account approved on offerwall dashboard
- [ ] Check API key is correct (copy again from dashboard)
- [ ] Check console for detailed error messages
- [ ] Contact offerwall support

### Issue: Gaming Offers section still empty

**Symptoms**: No offer cards showing even after configuration

**Solution**:
- [ ] Check if deployment completed successfully
- [ ] Check console for JavaScript errors (red text)
- [ ] Check if API routes return 404 (network tab)
- [ ] Check if offers are actually gaming-related (might be filtered out)
- [ ] Temporarily disable gaming filter for testing
- [ ] Hard refresh: Ctrl+Shift+R

---

## 📞 **SUPPORT CONTACTS**

### Offerwall Support:

**Vortex**: 
- Email: support@vortexwall.com
- Dashboard: https://publisher.vortexwall.com/

**CPX Research**:
- Email: support@cpx-research.com
- Dashboard: https://offers.cpx-research.com/

**Gemiad**:
- Email: support@gemiad.com
- Dashboard: https://gemiad.com/publishers/

**Notik**:
- Email: support@notik.me
- Dashboard: https://notik.me/

**Revtoo**:
- Email: support@revtoo.com
- Dashboard: https://publisher.revtoo.com/

---

## 🎯 **PRIORITY ACTIONS (Do These First)**

**If you only have 5 minutes**:

1. ⭐ **Configure Vortex** (+150 games)
   - Login → Copy API Key + Placement ID
   - Add to Vercel → Redeploy
   
2. ✅ **Test Production**
   - Wait 2 minutes → Open freecoino.com/earn
   - Check console: `✅ Vortex offers loaded: 150`

**Result**: **1600+ games** in Gaming Offers! 🎉

---

**Created**: June 16, 2026  
**Last Updated**: June 16, 2026  
**Status**: Ready to activate offerwalls

