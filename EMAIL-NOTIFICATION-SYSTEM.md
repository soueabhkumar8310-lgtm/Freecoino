# Email Notification System - Documentation

## Overview
The email notification system automatically sends emails to users when their withdrawal requests are approved or rejected by admins.

## ✅ Current Implementation Status

### **COMPLETE** - Email notifications are fully implemented and working!

---

## 🔧 Setup

### 1. Environment Variables
The following environment variable is already configured in `.env.local`:

```env
RESEND_API_KEY=re_b6wv427H_8auMEFcHndquMDWrZ3wwxRua
```

### 2. Dependencies
Resend package is installed in `package.json`:
```json
"resend": "^6.12.4"
```

---

## 📧 Email Functions

### Location: `lib/email.ts`

### 1. **Withdrawal Approved Email**
```typescript
sendWithdrawalApprovedEmail(
  userEmail: string,
  userName: string,
  amount: number,
  amountUsd: number,
  txHash: string
)
```

**Sends when:**
- Admin clicks "Approve" button
- Admin enters transaction hash
- Withdrawal status changes to "paid"

**Email includes:**
- ✅ Success notification
- 💰 Coin amount and USD value
- 🔗 Transaction hash with blockchain link
- 📊 Network information (Litecoin)
- 🔗 Link to withdrawal history

### 2. **Withdrawal Rejected Email**
```typescript
sendWithdrawalRejectedEmail(
  userEmail: string,
  userName: string,
  amount: number,
  amountUsd: number,
  reason: string
)
```

**Sends when:**
- Admin clicks "Reject" button
- Admin provides rejection reason (optional)
- Withdrawal status changes to "failed"
- Coins are refunded to user

**Email includes:**
- ❌ Rejection notification
- 💰 Coin amount and USD value
- 📝 Rejection reason provided by admin
- ✅ Confirmation that coins were refunded
- 🔗 Links to contact support and retry withdrawal

---

## 🔄 Workflow

### Admin Approval Process:

1. **Admin Panel**: `/admin/withdrawals`
2. **User requests withdrawal**: Status = "pending"
3. **Admin clicks "Approve"**:
   - Dialog opens asking for transaction hash
   - Admin enters TX hash
   - Click "Confirm Approval"
4. **Backend API**: `/api/admin/withdrawals/approve/route.ts`
   - Updates withdrawal status to "paid"
   - Saves transaction hash
   - Fetches user email and name from profiles
   - Calls `sendWithdrawalApprovedEmail()`
5. **User receives email** with:
   - Success confirmation
   - Transaction details
   - Blockchain link

### Admin Rejection Process:

1. **Admin Panel**: `/admin/withdrawals`
2. **User requests withdrawal**: Status = "pending"
3. **Admin clicks "Reject"**:
   - Dialog opens asking for rejection reason
   - Admin enters reason (optional)
   - Click "Confirm Rejection"
4. **Backend API**: `/api/admin/withdrawals/reject/route.ts`
   - Refunds coins to user's balance
   - Updates withdrawal status to "failed"
   - Saves rejection reason
   - Fetches user email and name from profiles
   - Calls `sendWithdrawalRejectedEmail()`
5. **User receives email** with:
   - Rejection notification
   - Reason for rejection
   - Confirmation of refund

---

## 🎨 Email Design

### Approval Email Features:
- ✅ Green gradient header
- 📊 Clean, professional layout
- 💳 Detailed transaction box with:
  - Coin amount
  - USD value
  - Network (Litecoin)
  - Clickable transaction hash
- 🔗 Call-to-action button: "View Withdrawal History"
- 📧 Support contact information

### Rejection Email Features:
- ❌ Red gradient header
- 📊 Clean, professional layout
- 💳 Transaction details box with:
  - Coin amount
  - USD value
  - Rejection reason
- ✅ Green refund confirmation box
- 🔗 Two call-to-action buttons:
  - "Contact Support"
  - "Try Again"
- 📧 Support contact information

---

## 📁 File Structure

```
/lib
  └── email.ts                                    # Email service functions

/app/api/admin/withdrawals
  ├── approve/route.ts                           # Approval API (sends email)
  └── reject/route.ts                            # Rejection API (sends email)

/components
  └── admin-withdrawals-client.tsx              # Admin UI with approve/reject dialogs

/app/admin/withdrawals
  └── page.tsx                                   # Admin withdrawals page
```

---

## 🧪 Testing

### Test Approval Flow:
1. Login as admin: `soueabhkumar8310@gmail.com`
2. Go to: `http://localhost:3000/admin/withdrawals`
3. Find a "pending" withdrawal
4. Click "Approve"
5. Enter any transaction hash (e.g., `abc123def456`)
6. Click "Confirm Approval"
7. ✅ Check user's email inbox

### Test Rejection Flow:
1. Login as admin: `soueabhkumar8310@gmail.com`
2. Go to: `http://localhost:3000/admin/withdrawals`
3. Find a "pending" withdrawal
4. Click "Reject"
5. Enter reason (e.g., "Invalid wallet address")
6. Click "Confirm Rejection"
7. ✅ Check user's email inbox
8. ✅ Verify coins were refunded to user balance

---

## 🔍 Database Schema

### Withdrawals Table Fields:
```sql
id                  UUID PRIMARY KEY
user_id             UUID (references profiles)
amount              INTEGER (in coins)
wallet_address      TEXT
status              TEXT ('pending', 'paid', 'failed')
tx_hash             TEXT (transaction hash)
rejection_reason    TEXT (reason for rejection)
created_at          TIMESTAMP
processed_at        TIMESTAMP
```

### Profiles Table Fields (used for email):
```sql
id                  UUID PRIMARY KEY
email               TEXT
display_name        TEXT
coins_balance       INTEGER
```

---

## 🚨 Error Handling

### Email Send Failures:
- Errors are logged to console
- Returns `{ success: false, error }` object
- Does NOT block the withdrawal approval/rejection
- User's withdrawal status is still updated correctly

### API Error Responses:
```typescript
// Missing withdrawal ID
{ error: 'Missing withdrawal ID' } - 400

// Withdrawal not found
{ error: 'Withdrawal not found' } - 404

// Withdrawal not pending
{ error: 'Withdrawal is not pending' } - 400

// Failed to approve/reject
{ error: 'Failed to approve withdrawal' } - 500
```

---

## 🔐 Security Features

1. **Admin Authentication**: Only `soueabhkumar8310@gmail.com` can access admin panel
2. **Service Role Key**: Uses Supabase service role for admin operations
3. **Transaction Validation**: Requires TX hash for approvals
4. **Atomic Operations**: Refunds are rolled back if rejection fails
5. **Email Privacy**: Emails sent from `noreply@freecoino.com`

---

## 📱 User Experience

### What Users See:

#### After Approval:
1. ✅ Email arrives in inbox
2. 📧 Subject: "✅ Your Withdrawal Has Been Approved"
3. 💰 See exact amount in coins and USD
4. 🔗 Click transaction hash to view on blockchain
5. 📊 View withdrawal history on website

#### After Rejection:
1. ❌ Email arrives in inbox
2. 📧 Subject: "❌ Withdrawal Request Rejected"
3. 📝 Read reason for rejection
4. ✅ Confirmed coins were refunded
5. 🔗 Contact support or try again

---

## 🎯 Key Features

✅ **Automatic Email Sending**
✅ **Professional HTML Design**
✅ **Mobile-Responsive Templates**
✅ **Transaction Hash Links**
✅ **Refund Notifications**
✅ **Support Contact Links**
✅ **Error Handling**
✅ **Success Confirmations**

---

## 🔧 Configuration

### Resend Configuration:
- **From Address**: `noreply@freecoino.com`
- **Service**: Resend API
- **API Key**: Set in `.env.local`

### Email Links:
- **Blockchain Explorer**: `https://litecoin.info/tx/[txHash]`
- **Withdrawal History**: `https://freecoino.com/history`
- **Contact Support**: `https://freecoino.com/contact`
- **Try Again**: `https://freecoino.com/cashout`
- **Support Email**: `support@freecoino.com`

---

## ✨ Summary

The email notification system is **fully functional** and integrated into the admin withdrawal management workflow. When admins approve or reject withdrawals:

1. ✅ User gets instant email notification
2. ✅ Professional, branded email design
3. ✅ All transaction details included
4. ✅ Helpful links and support information
5. ✅ Mobile-friendly responsive layout

**No additional setup required - everything is ready to use!** 🚀
