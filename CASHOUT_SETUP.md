# Cashout System Setup Guide

## Overview
Freecoino ka cashout system **manual withdrawal approval** ke saath setup hai. Users withdrawal request submit karte hain, aur admin manually approve/reject karta hai.

## How It Works

### 1. User Withdrawal Flow
1. User `/cashout` page pe jata hai
2. Minimum 2000 coins (= $2 USD) withdraw kar sakta hai
3. LTC wallet address enter karta hai
4. Submit karne pe:
   - Coins user ke balance se deduct ho jate hain
   - Withdrawal request `pending` status ke saath create hoti hai
   - Transaction record banta hai
   - User ko confirmation message milta hai

### 2. Admin Approval Flow (Manual)
Admin ko manually withdrawals process karni hoti hain:

#### Option A: Direct Database Access (Supabase Dashboard)
1. Supabase Dashboard → Table Editor → `withdrawals` table
2. Pending withdrawals dekho
3. LTC payment manually process karo
4. Update withdrawal:
   - `status` = `completed`
   - `tx_hash` = transaction hash from blockchain
   - `processed_at` = current timestamp

#### Option B: API Endpoint (Future Admin Panel)
```bash
PATCH /api/admin/withdrawals/[id]
{
  "status": "completed",
  "tx_hash": "abc123...",
  "admin_notes": "Processed successfully"
}
```

### 3. Rejection Flow
Agar withdrawal reject karni hai:
1. Update withdrawal:
   - `status` = `rejected`
   - `rejection_reason` = "Reason for rejection"
2. Coins automatically user ke balance mein refund ho jayenge

## Database Schema

### Withdrawals Table
```sql
CREATE TABLE public.withdrawals (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  amount INTEGER NOT NULL,
  method TEXT NOT NULL, -- 'litecoin'
  wallet_address TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, rejected
  tx_hash TEXT, -- Blockchain transaction hash
  rejection_reason TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP,
  processed_at TIMESTAMP,
  processed_by UUID
);
```

## Environment Variables

### Local Development (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://uqxxpeirvnuphabkbvnc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Production (Vercel)
Same environment variables ko Vercel dashboard mein add karo:
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (Important!)

## Getting Service Role Key

1. Supabase Dashboard pe jao: https://supabase.com/dashboard
2. Project select karo
3. Settings → API
4. "service_role" key copy karo
5. `.env.local` mein paste karo
6. **IMPORTANT**: Ye key kabhi git mein commit mat karo!

## API Endpoints

### 1. Submit Withdrawal
```
POST /api/withdraw
Body: {
  "amount_coins": 2000,
  "address": "LTC_wallet_address"
}
```

### 2. Get Withdrawal History
```
GET /api/withdrawals?page=0&pageSize=5
```

### 3. Update Withdrawal (Admin Only)
```
PATCH /api/admin/withdrawals/[id]
Body: {
  "status": "completed",
  "tx_hash": "blockchain_tx_hash",
  "admin_notes": "Optional notes"
}
```

## Withdrawal Statuses

- **pending**: User ne request submit ki hai, admin approval pending
- **processing**: Admin ne process karna start kiya
- **completed**: Payment successfully process ho gayi, tx_hash available
- **rejected**: Admin ne reject kar diya, coins refunded

## Security Features

1. **Email Verification**: User ko email verify karna mandatory hai withdrawal ke liye
2. **Minimum Balance**: Minimum 2000 coins (= $2 USD) required
3. **Balance Check**: Real-time balance verification
4. **Transaction Logging**: Har withdrawal ka transaction record
5. **Refund on Rejection**: Rejected withdrawals automatically refund ho jati hain

## Testing

### Test Withdrawal Flow
1. Login karo
2. `/cashout` page pe jao
3. Test withdrawal submit karo:
   - Amount: 2000 coins
   - Address: `LTC_test_address_123456789`
4. Supabase Dashboard mein check karo ki withdrawal create hui ya nahi

### Verify in Database
```sql
-- Check pending withdrawals
SELECT * FROM withdrawals WHERE status = 'pending' ORDER BY created_at DESC;

-- Check user balance
SELECT id, display_name, coins_balance FROM profiles WHERE id = 'user_id';

-- Check transactions
SELECT * FROM transactions WHERE user_id = 'user_id' ORDER BY created_at DESC;
```

## Manual Processing Steps

### Daily Withdrawal Processing
1. Supabase Dashboard → `withdrawals` table
2. Filter: `status = 'pending'`
3. For each withdrawal:
   - Copy `wallet_address`
   - Calculate amount: `amount / 1000` = USD value
   - Send LTC payment manually
   - Get transaction hash from blockchain
   - Update withdrawal:
     ```sql
     UPDATE withdrawals 
     SET 
       status = 'completed',
       tx_hash = 'your_tx_hash',
       processed_at = NOW()
     WHERE id = 'withdrawal_id';
     ```

## Future Enhancements

1. **Admin Dashboard**: Web-based admin panel for managing withdrawals
2. **Automated Payments**: Integration with LTC payment gateway
3. **Email Notifications**: Auto-email users when withdrawal is processed
4. **Withdrawal Limits**: Daily/weekly withdrawal limits per user
5. **KYC Integration**: Identity verification for large withdrawals

## Troubleshooting

### Issue: Withdrawal not creating
- Check browser console for errors
- Verify environment variables are set
- Check Supabase logs for API errors

### Issue: Balance not updating
- Check if transaction was created
- Verify RLS policies on `profiles` table
- Check Supabase logs

### Issue: Service Role Key error
- Verify key is correct in `.env.local`
- Restart dev server after adding key
- Check Vercel environment variables for production

## Support

For issues or questions:
- Email: sourabhkumar8310@gmail.com
- Check Supabase logs for detailed errors
- Review API response in browser Network tab
