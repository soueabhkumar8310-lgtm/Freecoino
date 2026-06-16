# 🔓 Vortex Activation Guide (After Approval)

## 📋 Current Status:
- ❌ **Vortex API calls**: DISABLED (commented out)
- ✅ **Vortex offerwall tab**: Still visible in UI (ready for future)
- ⏳ **Registration**: Pending (apply at https://publisher.vortexwall.com/register)

## 🚀 When You Get Approval:

### Step 1: Get API Credentials
After Vortex approves your application, you'll receive:
- **Placement ID** (something like: `69dfafd0a982f180b5caa54c`)
- **API Key** (if applicable)
- **Postback URL** configuration instructions

### Step 2: Add Environment Variable
Add to `.env.local` and Vercel:
```env
VORTEX_API_KEY=your_vortex_api_key_here
VORTEX_PLACEMENT_ID=your_placement_id_here
```

### Step 3: Uncomment API Calls

**In `components/earn-content.tsx`:**

1. **Line ~693** - Uncomment Vortex API fetch:
   ```typescript
   const [gemiadResponse, notikResponse, vortexResponse, revtooResponse] = await Promise.all([
     fetch(`/api/gemiad-offers?user_id=${userId}`),
     fetch(`/api/notik-offers?user_id=${userId}&device_type=mobile&device_os=${primaryOS}`),
     fetch(`/api/vortex-offers?user_id=${userId}`), // ← UNCOMMENT THIS
     fetch(`/api/revtoo-offers?user_id=${userId}`)
   ]);
   ```

2. **Line ~702** - Uncomment variable:
   ```typescript
   let vortexOffers: NotikOffer[] = []; // ← UNCOMMENT THIS
   ```

3. **Line ~730** - Uncomment processing:
   ```typescript
   // Uncomment this entire block:
   if (vortexResponse.ok) {
     const vortexData = await vortexResponse.json();
     if (vortexData.success && vortexData.offers && Array.isArray(vortexData.offers)) {
       vortexOffers = vortexData.offers;
       console.log(`Vortex offers loaded: ${vortexOffers.length}`);
     }
   }
   ```

4. **Line ~750** - Uncomment in combine loop:
   ```typescript
   const maxProviderLength = Math.max(gemiadOffers.length, notikOffers.length, vortexOffers.length, revtooOffers.length);
   
   for (let i = 0; i < maxProviderLength; i++) {
     if (i < gemiadOffers.length) combinedOffers.push(gemiadOffers[i]);
     if (i < notikOffers.length) combinedOffers.push(notikOffers[i]);
     if (i < vortexOffers.length) combinedOffers.push(vortexOffers[i]); // ← UNCOMMENT THIS
     if (i < revtooOffers.length) combinedOffers.push(revtooOffers[i]);
   }
   ```

**In `components/all-offers-client.tsx`:**

Repeat the same uncomment steps (same line numbers approximately).

### Step 4: Update Vortex API Route

**In `app/api/vortex-offers/route.ts`:**

Replace placeholder with actual implementation (similar to Revtoo API route).

### Step 5: Configure Postback URL in Vortex Dashboard

Add this URL in Vortex dashboard:
```
https://freecoino.com/api/vortex/postback?user_id={userId}&tx_id={transactionId}&amount={payout}
```

(Check Vortex documentation for exact parameter names)

### Step 6: Deploy

```bash
git add .
git commit -m "Activate Vortex offerwall after approval"
git push origin main
```

---

## 🧪 Testing After Activation:

1. Go to: https://freecoino.com/earn
2. Check console - should see: "Vortex offers loaded: X"
3. Click "Vortex" tab - offers should display
4. Complete an offer to test postback

---

## 📞 Need Help?

When you get approval, just tell me:
```
"Vortex approved! Placement ID: YOUR_ID"
```

I'll uncomment everything and deploy it for you! 🚀

---

**Current deployment**: Vortex disabled, all other offerwalls active ✅
