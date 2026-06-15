# 🧪 Withdrawal System Testing Guide

## ⚠️ Important Information

### Why Localhost Testing Won't Work Fully

**Offerwalls (Revtoo, MyLead, etc.) ONLY work on verified live domains:**
- ❌ `http://localhost:3000` - Offerwalls won't load
- ✅ `https://freecoino.com` - Offerwalls work properly

**What you CAN test on localhost:**
- ✅ UI/UX of all pages
- ✅ Withdrawal form validation
- ✅ Withdrawal submission
- ✅ Profile page
- ✅ Transaction history

**What you CANNOT test on localhost:**
- ❌ Offerwall loading (Revtoo, MyLead, Vortex, etc.)
- ❌ Earning coins through offers
- ❌ Postback callbacks from offerwall providers

## 📋 Testing Steps

### Step 1: Fix Database Schema (If Needed)

If you get `column "balance_after" does not exist` error, run this in Supabase SQL Editor:

```sql
-- Drop and recreate transactions table with correct schema
DROP TABLE IF EXISTS public.transactions CASCADE;

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT transactions_type_check CHECK (type IN ('earn', 'withdraw', 'bonus', 'referral')),
  CONSTRAINT transactions_status_check CHECK (status IN ('pending', 'completed', 'failed'))
);

-- Add index
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can view own transactions" 
ON public.transactions FOR SELECT 
USING (auth.uid() = user_id);
```

### Step 2: Add Test Coins to Your Account

Run this SQL in Supabase SQL Editor:

```sql
-- Add 2000 coins (minimum for withdrawal)
UPDATE profiles 
SET coins_balance = 2000,
    total_earned = 2000,
    updated_at = NOW()
WHERE id = '338939c3-a7ba-45ce-ad02-6af8126b78fd';

-- Verify
SELECT email, coins_balance, total_earned 
FROM profiles 
WHERE id = '338939c3-a7ba-45ce-ad02-6af8126b78fd';
```

### Step 3: Test on Live Site (RECOMMENDED) ✅

1. **Open** `https://freecoino.com` in your browser
2. **Login** with your account (`soueabhkumar8310@gmail.com`)
3. **Go to** Profile page - verify you see **2000 coins** ($2.00)
4. **Go to** Cashout page - `https://freecoino.com/cashout`
5. **Test withdrawal**:
   - Enter amount: `2000` coins
   - Enter LTC address: `LTC_TEST_ADDRESS` (any test address)
   - Click "Withdraw"
6. **Verify**:
   - Should see success message
   - Balance should decrease to 0 coins
   - Withdrawal should appear in history with "pending" status

### Step 4: Test Admin Panel

1. **Go to** `https://freecoino.com/admin`
2. **Login** with admin account (`soueabhkumar8310@gmail.com`)
3. **Go to** Withdrawals section
4. **Find** your test withdrawal
5. **Test approval**:
   - Click "Approve" button
   - Should see status change to "approved"
   - User balance should NOT be refunded (already deducted)

## 🐛 Common Issues & Solutions

### Issue 1: "Profile not found" Error

**Cause**: User profile doesn't exist in database or RLS policies blocking access

**Fix**:
```sql
-- Check if profile exists
SELECT * FROM profiles WHERE id = '338939c3-a7ba-45ce-ad02-6af8126b78fd';

-- If not found, create profile
INSERT INTO profiles (id, email, display_name, referral_code)
VALUES (
  '338939c3-a7ba-45ce-ad02-6af8126b78fd',
  'soueabhkumar8310@gmail.com',
  'Sourabh Kumar',
  'TEST1234'
);
```

### Issue 2: Authentication Timeout / Infinite Loop

**Cause**: AuthContext stuck in loading state

**Fix**:
1. Clear browser cache and cookies
2. Logout completely: `https://freecoino.com/auth/logout`
3. Login again
4. If still having issues, check browser console for specific errors

### Issue 3: Offerwalls Not Loading

**Cause**: Testing on localhost instead of live domain

**Fix**: ✅ Always test offerwalls on `https://freecoino.com`

### Issue 4: Withdrawal API Returns "Insufficient balance"

**Cause**: Race condition or balance not synced

**Fix**:
```sql
-- Check actual balance
SELECT id, email, coins_balance FROM profiles 
WHERE id = '338939c3-a7ba-45ce-ad02-6af8126b78fd';

-- Set balance to 2000
UPDATE profiles SET coins_balance = 2000 
WHERE id = '338939c3-a7ba-45ce-ad02-6af8126b78fd';
```

## 📊 Database Verification Queries

### Check Profile Data
```sql
SELECT id, email, display_name, coins_balance, total_earned, is_banned
FROM profiles 
WHERE email = 'soueabhkumar8310@gmail.com';
```

### Check Withdrawals
```sql
SELECT id, amount, status, crypto_address, created_at
FROM withdrawals
WHERE user_id = '338939c3-a7ba-45ce-ad02-6af8126b78fd'
ORDER BY created_at DESC;
```

### Check Transactions
```sql
SELECT id, type, amount, description, status, created_at
FROM transactions
WHERE user_id = '338939c3-a7ba-45ce-ad02-6af8126b78fd'
ORDER BY created_at DESC
LIMIT 10;
```

## 🎯 Testing Checklist

- [ ] Schema fixed (no `balance_after` errors)
- [ ] 2000 coins added to account
- [ ] Profile shows correct balance on live site
- [ ] Cashout page loads without errors on live site
- [ ] Withdrawal form accepts valid input
- [ ] Withdrawal submission succeeds
- [ ] Balance decreases after withdrawal
- [ ] Withdrawal appears in history with "pending" status
- [ ] Admin panel can view withdrawal
- [ ] Admin can approve withdrawal
- [ ] Email notification sent (if configured)

## 🚀 Next Steps After Testing

1. **Test edge cases**:
   - Withdraw with insufficient balance
   - Withdraw less than minimum (2000 coins)
   - Invalid LTC address
   - Multiple simultaneous withdrawals

2. **Test admin features**:
   - Approve withdrawal
   - Reject withdrawal with reason
   - View all withdrawals
   - Search withdrawals

3. **Test real earning**:
   - Complete offers on offerwalls (live site only)
   - Verify coins are awarded
   - Check postback logging

## 📞 Need Help?

If you encounter any issues:
1. Check browser console for errors
2. Check Supabase logs for API errors
3. Verify database schema matches `schema-v2.sql`
4. Make sure you're testing on `https://freecoino.com` for offerwalls

---

**Remember**: Localhost is for UI testing only. Always test offerwall functionality on the live domain! ✅
