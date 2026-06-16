# 🔔 Timewall Postback Configuration

## ✅ Timewall Approved!

**Placement**: Freecoino Main Offerwall  
**Placement ID**: `ba72f7d1fde24922`  
**Status**: APPROVED ✅

## 🔧 Configure Postback URL

### Step 1: Go to Timewall Dashboard
You're already there: https://discover.timewall.io/placements

### Step 2: Click "INTEGRATE" Button
On your placement "Freecoino Main Offerwall", click the blue **"INTEGRATE"** button.

### Step 3: Find Postback Settings
Look for:
- "Postback URL" section
- "Callback URL" section  
- "Server-to-Server Postback" section

### Step 4: Add Postback URL

**Copy this exact URL:**
```
https://freecoino.com/api/timewall/postback?user_id={userId}&tx_id={transactionId}&amount={payout}
```

**Parameter Mapping** (if Timewall asks):
- `{userId}` → User ID parameter
- `{transactionId}` → Transaction/Offer ID  
- `{payout}` → Reward amount in coins

**Note**: Different offerwalls use different parameter names. Check Timewall's documentation for exact parameter names like:
- User ID: `{userId}`, `{user_id}`, `{subid}`, `{uid}`
- Transaction ID: `{transactionId}`, `{transaction_id}`, `{tx_id}`, `{offer_id}`
- Amount: `{payout}`, `{amount}`, `{reward}`, `{coins}`

### Step 5: Save & Test

1. Save the postback URL
2. Look for "Test Postback" button (if available)
3. Test it to make sure it works

---

## ✅ Iframe Already Integrated!

The Timewall iframe is already embedded in the earn page:
```
https://wall.timewall.io/ba72f7d1fde24922?userId={userId}
```

## 🧪 Testing After Setup:

1. **Go to**: https://freecoino.com/earn
2. **Select "Taskwall"** from offerwall tabs
3. **Timewall iframe should load** with offers
4. **Complete an offer** to test
5. **Check your balance** - coins should be added via postback

---

## 📋 Quick Checklist:

- [x] Timewall approved ✅
- [x] Placement ID added to code ✅
- [x] Iframe URL configured ✅
- [x] Postback endpoint ready ✅
- [ ] Postback URL configured in Timewall dashboard (YOU need to do this)
- [ ] Test offer completion

---

**Total time**: 2 minutes to configure postback! 🚀
