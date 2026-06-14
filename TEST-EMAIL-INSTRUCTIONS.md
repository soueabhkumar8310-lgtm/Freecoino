# 🧪 Email System Testing - Step by Step

## ⚠️ IMPORTANT: Server Restart Required!

Kyunki humne `.env.local` file me `RESEND_API_KEY` add kiya hai, to **server ko restart karna zaroori hai**.

---

## 📋 Testing Steps

### Step 1: Server Restart Karo

Agar server chal raha hai to **stop** karo (Ctrl+C), phir:

```bash
npm run dev
```

### Step 2: Test Email API Use Karo

Server start hone ke baad, browser me ye URLs kholo:

#### Test Approval Email:
```
http://localhost:3000/api/test-withdrawal-email?type=approve
```

**Expected Response:**
```json
{
  "success": true,
  "type": "approval",
  "message": "Approval email sent! Check your inbox: soueabhkumar8310@gmail.com"
}
```

#### Test Rejection Email:
```
http://localhost:3000/api/test-withdrawal-email?type=reject
```

**Expected Response:**
```json
{
  "success": true,
  "type": "rejection",
  "message": "Rejection email sent! Check your inbox: soueabhkumar8310@gmail.com"
}
```

### Step 3: Email Check Karo

Apne email inbox check karo: **soueabhkumar8310@gmail.com**

Tum ko 2 emails milne chahiye:
1. ✅ "Your Withdrawal Has Been Approved"
2. ❌ "Withdrawal Request Rejected"

---

## 🔧 Agar Email Nahi Aaya To:

### 1. Check Console Logs

Terminal/console me dekho koi error to nahi:
```
❌ Email send error: ...
```

### 2. Check Environment Variable

Browser me ye API call karo:
```
http://localhost:3000/api/test-env
```

Dekhna chahiye:
- `RESEND_API_KEY` defined hai

### 3. Check Spam Folder

Kabhi kabhi emails **spam** folder me chale jate hain.

### 4. Resend API Key Verify Karo

Resend dashboard me login karke check karo ki API key valid hai:
- https://resend.com/api-keys

---

## 🎯 Real Withdrawal Testing

Agar test emails aa gaye, to ab **real admin panel** se test karo:

### Approval Test:

1. Login as admin: `http://localhost:3000/auth/login`
2. Go to withdrawals: `http://localhost:3000/admin/withdrawals`
3. Find a **pending** withdrawal
4. Click **"Approve"**
5. Enter TX hash: `test_tx_abc123`
6. Click **"Confirm Approval"**
7. ✅ Check email!

### Rejection Test:

1. Login as admin: `http://localhost:3000/auth/login`
2. Go to withdrawals: `http://localhost:3000/admin/withdrawals`
3. Find a **pending** withdrawal
4. Click **"Reject"**
5. Enter reason: `Testing rejection email`
6. Click **"Confirm Rejection"**
7. ✅ Check email!
8. ✅ Check coins refunded in database

---

## 🐛 Debugging

### Check Logs in Terminal:

Jab approval/rejection karo, terminal me ye logs dikhne chahiye:

**Success:**
```
POST /api/admin/withdrawals/approve 200 in 350ms
```

**Error:**
```
Email send error: { ... }
```

### Check Database:

Approval ke baad:
```sql
SELECT * FROM withdrawals WHERE status = 'paid';
-- Should have tx_hash filled
```

Rejection ke baad:
```sql
SELECT * FROM withdrawals WHERE status = 'failed';
-- Should have rejection_reason filled
```

Refund check:
```sql
SELECT coins_balance FROM profiles WHERE id = 'user_id';
-- Coins should be returned
```

---

## ✅ Success Checklist

- [ ] Server restarted with new `.env.local`
- [ ] Test API returns success
- [ ] Approval email received in inbox
- [ ] Rejection email received in inbox
- [ ] Real approval from admin panel works
- [ ] Real rejection from admin panel works
- [ ] Coins refunded on rejection
- [ ] No console errors

---

## 🚨 Common Issues

### Issue 1: "Cannot find module 'resend'"
**Solution:** 
```bash
npm install resend
```

### Issue 2: "RESEND_API_KEY is undefined"
**Solution:**
1. Check `.env.local` file has the key
2. Restart server (very important!)
3. Try `npm run dev` again

### Issue 3: "403 Forbidden" from Resend
**Solution:**
- API key invalid ya expired
- Resend dashboard me new key generate karo
- `.env.local` me update karo
- Server restart karo

### Issue 4: Email nahi aa raha but no error
**Solution:**
1. Spam folder check karo
2. Resend dashboard me "Logs" section dekho
3. Rate limit hit ho sakta hai (5 emails per minute)
4. Wait karo 1 minute, phir retry karo

---

## 📊 Expected Flow

```
Admin clicks Approve
       ↓
API: /api/admin/withdrawals/approve
       ↓
Database Update (status = 'paid')
       ↓
sendWithdrawalApprovedEmail()
       ↓
Resend API Call
       ↓
✅ Email Sent!
       ↓
User receives email in inbox
```

---

## 🎉 Next Steps

Agar sab kaam kar gaya to:

1. **Test API route delete** kar sakte ho (optional):
   - `app/api/test-withdrawal-email/route.ts`
   - `test-email.js`

2. **Production deployment** ke liye:
   - `.env.production` me RESEND_API_KEY add karo
   - Domain verification karo on Resend
   - `from` address update karo from `onboarding@resend.dev` to `noreply@freecoino.com`

3. **Monitor emails**:
   - Resend dashboard me logs dekho
   - Track delivery rates
   - Check bounce rates

---

## 📞 Help

Agar problem aa rahi hai to:
1. Terminal logs screenshot share karo
2. Browser console errors share karo
3. Test API ka response share karo

**Happy Testing! 🚀**
