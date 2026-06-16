# 🎮 Vortex Offerwall Activation - Step by Step

**Time Required**: 5-7 minutes  
**Result**: +100-200 gaming offers  
**Difficulty**: Easy ⭐

---

## 🎯 **GOAL**

Activate Vortex offerwall to add 100-200 more gaming offers to your site.

---

## 📋 **PART 1: GET VORTEX CREDENTIALS**

### Step 1: Open Vortex Dashboard

1. Go to: https://publisher.vortexwall.com/
2. Click "Login" or "Sign In"
3. Enter your email: `soueabhkumar8310@gmail.com`
4. Enter your password
5. Click "Login"

**Note**: If you don't have account, you mentioned Vortex is already approved (auto-approved), so account should exist.

---

### Step 2: Find API Key

Once logged in:

1. Look for **"Settings"** or **"Integration"** in left sidebar
2. Click on **"API"** or **"API Settings"**
3. You should see:
   - **API Key**: A long string like `abc123xyz456...`
   - Or **"Show API Key"** button to reveal it

4. **Copy the API Key** → Save to Notepad

**Example**:
```
API Key: 7a8b9c0d1e2f3g4h5i6j7k8l9m0n1o2p
```

---

### Step 3: Find Placement ID

In the same dashboard:

1. Look for **"Placements"** or **"Apps"** in sidebar
2. Click on it
3. You should see your placement listed
4. Look for **"Placement ID"** or **"App ID"**
   - It looks like: `69dfafd0a982f180b5caa54c`
5. **Copy the Placement ID** → Save to Notepad

**Alternative locations**:
- Integration → Placements
- Dashboard → My Placements
- Settings → Placement Settings

**Example**:
```
Placement ID: 69dfafd0a982f180b5caa54c
```

---

### Step 4: Verify You Have Both Values

Your notepad should now have:

```
VORTEX_API_KEY: 7a8b9c0d1e2f3g4h5i6j7k8l9m0n1o2p
VORTEX_PLACEMENT_ID: 69dfafd0a982f180b5caa54c
```

✅ **If you have both, proceed to Part 2**

❌ **If you can't find them**:
- Check "Integration" section
- Check "API Documentation" section
- Contact Vortex support: support@vortexwall.com
- Or send me screenshot of dashboard and I'll help locate them

---

## 📋 **PART 2: ADD TO VERCEL (PRODUCTION)**

### Step 1: Open Vercel Dashboard

1. Go to: https://vercel.com/
2. Login with your account
3. You should see your projects list
4. Find and click on **"Freecoino"** or **"freecoino"** project

---

### Step 2: Navigate to Environment Variables

1. In project page, look at top tabs
2. Click on **"Settings"** tab
3. In left sidebar, click **"Environment Variables"**
4. You should now see list of existing variables:
   - REVTOO_API_KEY
   - NOTIK_API_KEY
   - etc.

---

### Step 3: Add VORTEX_API_KEY

1. Click **"Add New"** button (top right)
2. A popup appears with 3 fields:

**Field 1 - Key**:
```
VORTEX_API_KEY
```
(Copy exactly as written - case sensitive!)

**Field 2 - Value**:
```
(Paste your API key from notepad)
Example: 7a8b9c0d1e2f3g4h5i6j7k8l9m0n1o2p
```

**Field 3 - Environments**:
- ✅ Check "Production"
- ✅ Check "Preview"  
- ✅ Check "Development"
(Select all 3)

3. Click **"Save"** button

✅ **Success message**: "Environment variable added"

---

### Step 4: Add VORTEX_PLACEMENT_ID

1. Click **"Add New"** button again
2. Another popup appears

**Field 1 - Key**:
```
VORTEX_PLACEMENT_ID
```
(Copy exactly as written - case sensitive!)

**Field 2 - Value**:
```
(Paste your Placement ID from notepad)
Example: 69dfafd0a982f180b5caa54c
```

**Field 3 - Environments**:
- ✅ Check "Production"
- ✅ Check "Preview"
- ✅ Check "Development"
(Select all 3)

3. Click **"Save"** button

✅ **Success message**: "Environment variable added"

---

### Step 5: Verify Variables Added

Scroll through environment variables list and verify you see:

```
✅ VORTEX_API_KEY          Production, Preview, Development
✅ VORTEX_PLACEMENT_ID     Production, Preview, Development
✅ REVTOO_API_KEY          (already exists)
✅ NOTIK_API_KEY           (already exists)
```

---

## 📋 **PART 3: TRIGGER REDEPLOY**

### Option A: Redeploy from Vercel Dashboard (Recommended)

1. In Vercel dashboard, click **"Deployments"** tab (top)
2. You should see list of recent deployments
3. Find the **topmost deployment** (most recent)
4. Click the **"..." (three dots)** menu on the right
5. Click **"Redeploy"** option
6. A popup appears: "Redeploy to Production?"
7. Click **"Redeploy"** button to confirm

✅ **Deployment started!**

You'll see:
```
Building...
Running Build Command...
Deploying...
```

---

### Option B: Push Empty Commit (Alternative)

If you prefer using Git:

```bash
# Open command prompt in project folder
cd c:\project\freecoino

# Create empty commit to trigger deploy
git commit --allow-empty -m "Activate Vortex offerwall"

# Push to GitHub
git push origin main
```

Vercel will automatically detect push and start deployment.

---

### Step 6: Wait for Deployment

**Time**: 2-3 minutes

**What's happening**:
1. Vercel rebuilding your site with new environment variables
2. API routes now have access to VORTEX_API_KEY and VORTEX_PLACEMENT_ID
3. Vortex API endpoint will be called when users visit /earn page

**How to check progress**:
1. Stay on "Deployments" tab
2. Watch the topmost deployment
3. Status will change:
   - 🟡 Building... (1 minute)
   - 🟡 Deploying... (30 seconds)
   - 🟢 Ready (Done!)

✅ **When you see "Ready" status, proceed to Part 4**

---

## 📋 **PART 4: TEST ON LIVE SITE**

### Step 1: Open Live Site

1. Open new browser tab
2. Go to: https://freecoino.com/earn
3. Wait for page to load completely

---

### Step 2: Open Developer Console

**Chrome / Edge / Brave**:
- Press `F12` key
- Or right-click → "Inspect" → "Console" tab

**Firefox**:
- Press `F12` key
- Click "Console" tab

**Safari**:
- Enable Developer menu first (Preferences → Advanced → Show Develop menu)
- Press `Cmd+Option+C`

---

### Step 3: Check Console Logs

In the console, look for these messages:

✅ **SUCCESS - What you want to see**:
```
✅ API Key loaded, first 10 chars: lmtx1hoinv
🔄 Trying Revtoo API endpoints...
✅ Success with endpoint: https://revtoo.com/api/offers
✅ Revtoo offers loaded: 1454

✅ Vortex API Key loaded, first 10 chars: 7a8b9c0d1e
🔄 Trying Vortex API endpoints...
✅ Success with endpoint: https://api.vortexwall.com/...
✅ Vortex offers loaded: 150

Total combined offers: 1604
Filtered gaming offers: 1604
Gaming Offers section: Displaying 12 of 1604
```

❌ **FAILURE - What indicates problem**:
```
❌ Vortex API key or Placement ID not configured
```

or

```
✅ Vortex API Key loaded, first 10 chars: 7a8b9c0d1e
❌ Failed: All Vortex API endpoints failed
```

---

### Step 4: Visual Verification

Scroll down to **"Gaming Offers"** section on the page.

✅ **SUCCESS indicators**:
- You see game cards (with images)
- Some cards show "Provider: Vortex" (hover or check details)
- More games than before (was ~1454, now ~1600+)
- Cards have different games from multiple providers

❌ **FAILURE indicators**:
- Section still empty
- Only seeing Revtoo games (no Vortex games)
- Console shows error messages

---

## ✅ **SUCCESS CHECKLIST**

After completing all steps, verify:

- [x] Logged into Vortex dashboard
- [x] Copied API Key from Vortex
- [x] Copied Placement ID from Vortex
- [x] Added VORTEX_API_KEY to Vercel
- [x] Added VORTEX_PLACEMENT_ID to Vercel
- [x] Triggered redeploy in Vercel
- [x] Waited for "Ready" status (2-3 min)
- [x] Opened freecoino.com/earn
- [x] Checked console logs
- [x] Saw "✅ Vortex offers loaded: X" (X > 0)
- [x] Gaming Offers section showing cards
- [x] Some cards show Vortex provider

🎉 **If all checked, Vortex is ACTIVATED!**

---

## 🚨 **TROUBLESHOOTING**

### Problem 1: Can't find API Key in Vortex dashboard

**Solution**:
1. Check these sections:
   - Settings → API
   - Integration → API Keys
   - Developer → API Credentials
   - Account → API Settings
2. If still not found, contact Vortex support:
   - Email: support@vortexwall.com
   - Tell them: "I need my API key for REST API integration"

---

### Problem 2: Can't find Placement ID

**Solution**:
1. Check these sections:
   - Placements
   - Apps
   - Integration → My Apps
   - Dashboard → Placement List
2. If no placement exists:
   - Create new placement
   - Name it: "Freecoino Gaming Offers"
   - Platform: Web
   - Copy the generated Placement ID

---

### Problem 3: Vercel shows "Invalid Value" when adding variable

**Solution**:
- Check no extra spaces in Key or Value
- Check no quotes around the value
- Example WRONG: `"7a8b9c0d1e2f..."` (has quotes)
- Example RIGHT: `7a8b9c0d1e2f...` (no quotes)

---

### Problem 4: Console shows "Vortex API key not configured" even after adding

**Solution**:
1. Check variable name is EXACTLY: `VORTEX_API_KEY` (case sensitive)
2. Not: `VORTEX_KEY` or `vortex_api_key` or `VortexApiKey`
3. Check variable is in "Production" environment
4. Trigger redeploy again (variables load on deployment)
5. Clear browser cache: Ctrl+Shift+Delete → Clear cached files
6. Hard refresh: Ctrl+Shift+R

---

### Problem 5: Console shows "Vortex offers loaded: 0"

**Possible reasons**:

**A) API credentials invalid**:
- Verify API key is correct (copy again from dashboard)
- Verify Placement ID is correct
- Check account is approved on Vortex

**B) API endpoint changed**:
- Check console for detailed error message
- Look for HTTP status codes (404, 401, 403)
- Contact Vortex support for correct API endpoint

**C) No offers available**:
- This is normal if Vortex doesn't have offers for your traffic
- Wait and check again later
- Or Vortex might be iframe-only (see console message)

---

### Problem 6: Deployment failed in Vercel

**Solution**:
1. Go to Vercel → Deployments → Click failed deployment
2. Check "Build Logs" for error messages
3. Common errors:
   - **Build timeout**: Redeploy again
   - **Module not found**: Check package.json
   - **Syntax error**: Check recent code changes
4. If persistent, contact me with error logs

---

## 📱 **BONUS: ADD TO LOCALHOST (OPTIONAL)**

For testing on your local development server:

### Step 1: Open .env.local file

```bash
# File location
c:\project\freecoino\.env.local
```

### Step 2: Add these lines

```env
# Vortex Offerwall
VORTEX_API_KEY=7a8b9c0d1e2f3g4h5i6j7k8l9m0n1o2p
VORTEX_PLACEMENT_ID=69dfafd0a982f180b5caa54c
```

(Replace with your actual values)

### Step 3: Restart dev server

```bash
# Stop current server (Ctrl+C)
# Start again
npm run dev
```

### Step 4: Test locally

1. Open: http://localhost:3000/earn
2. Check console for Vortex logs
3. Verify offers loading

---

## 🎯 **NEXT OFFERWALLS**

After Vortex is working, activate more offerwalls:

**Priority 2**: Gemiad (+50-100 offers)
- Similar process
- See `ACTIVATE-OFFERWALLS-HINDI.md` for guide

**Priority 3**: CPX Research (+20-50 surveys)
- For Surveys section (not Gaming Offers)
- See `ACTIVATE-OFFERWALLS-HINDI.md` for guide

---

## 📊 **EXPECTED RESULTS**

### Before Vortex:
```
Gaming Offers: 1454 (Revtoo only)
```

### After Vortex:
```
Gaming Offers: 1600+ (Revtoo + Vortex)
```

### Console Logs:
```
✅ Revtoo offers loaded: 1454
✅ Vortex offers loaded: 150
Total combined offers: 1604
Gaming Offers showing: 1604 games
```

### Gaming Offers Section:
- More variety of games
- Mix of Revtoo and Vortex providers
- Better payout options for users
- More chances for conversions

---

## 📞 **NEED HELP?**

**Stuck at any step?**

1. **Take screenshot** of where you're stuck
2. **Copy console logs** (if applicable)
3. **Share with me** and I'll guide you

**Common help requests**:
- "Can't find API Key" → Share screenshot of Vortex dashboard
- "Vercel giving error" → Share screenshot of error message
- "Console shows error" → Copy and paste full console log
- "Offers not showing" → Share console log + screenshot of page

---

**Created**: June 16, 2026  
**Last Updated**: June 16, 2026  
**Estimated Time**: 5-7 minutes  
**Difficulty**: Easy ⭐

