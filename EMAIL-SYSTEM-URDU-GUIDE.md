# Email Notification System - Urdu/Hindi Guide

## 📧 Email Notification System Complete Hai! ✅

### Kya Hai Ye System?

Jab aap admin panel se kisi user ki withdrawal **approve** ya **reject** karte ho, to automatically user ko email jayega.

---

## 🎯 Kaise Kaam Karta Hai?

### 1️⃣ **APPROVAL** (Success) ke liye:

1. Admin panel me jao: `http://localhost:3000/admin/withdrawals`
2. Kisi pending withdrawal pe **"Approve"** button click karo
3. Dialog box khulega - usme **Transaction Hash** daalo
4. **"Confirm Approval"** click karo
5. ✅ **User ko email jayega!**

**Email me kya hoga:**
- ✅ Approval success message
- 💰 Coins aur USD amount
- 🔗 Transaction hash with blockchain link
- 📊 Network info (Litecoin)
- 🔗 "View Withdrawal History" button

---

### 2️⃣ **REJECTION** (Reject) ke liye:

1. Admin panel me jao: `http://localhost:3000/admin/withdrawals`
2. Kisi pending withdrawal pe **"Reject"** button click karo
3. Dialog box khulega - usme **Rejection Reason** likho
   - Example: "Invalid wallet address"
   - Example: "Suspicious activity"
   - Example: "Account verification pending"
4. **"Confirm Rejection"** click karo
5. ✅ **User ko email jayega!**
6. ✅ **Coins automatically refund ho jayenge!**

**Email me kya hoga:**
- ❌ Rejection notification
- 💰 Coins aur USD amount
- 📝 Rejection ka reason (jo aapne likha)
- ✅ Confirmation ki coins refund ho gaye
- 🔗 "Contact Support" button
- 🔗 "Try Again" button

---

## 🖥️ Admin Panel Guide

### Pending Withdrawals:

**Desktop View:**
```
User | Date | Coins | USD | Address | Status | TX Hash | Actions
-----|------|-------|-----|---------|--------|---------|--------
user@email.com | Feb 10, 2025 | 2,000 | $2.00 | LTC:abc... | pending | — | [Approve] [Reject]
```

**Mobile View:**
- Card format me dikhta hai
- Swipe karke dekhna
- Same buttons: Approve / Reject

---

## ⚙️ Setup (Already Done!) ✅

### 1. Environment Variable
`.env.local` file me already add hai:
```env
RESEND_API_KEY=re_b6wv427H_8auMEFcHndquMDWrZ3wwxRua
```

### 2. Email Functions
`lib/email.ts` me 2 functions hai:
- `sendWithdrawalApprovedEmail()` - Success email ke liye
- `sendWithdrawalRejectedEmail()` - Rejection email ke liye

### 3. API Routes
Already connected hai:
- `/api/admin/withdrawals/approve/route.ts` - Approval email send karta hai
- `/api/admin/withdrawals/reject/route.ts` - Rejection email send karta hai

---

## 🧪 Testing Kaise Kare?

### Test 1: Approval Email
1. Dev server chalu karo: `npm run dev`
2. Admin login karo: `soueabhkumar8310@gmail.com`
3. Withdrawals page pe jao
4. Kisi pending withdrawal ko approve karo
5. TX hash daalo (kuch bhi, example: `abc123xyz`)
6. Confirm karo
7. ✅ User ke email me check karo - email aaya hoga!

### Test 2: Rejection Email
1. Dev server chalu karo: `npm run dev`
2. Admin login karo: `soueabhkumar8310@gmail.com`
3. Withdrawals page pe jao
4. Kisi pending withdrawal ko reject karo
5. Reason likho (example: "Invalid address")
6. Confirm karo
7. ✅ User ke email me check karo - email aaya hoga!
8. ✅ User ki profile check karo - coins refund ho gaye honge!

---

## 📱 User Ko Kya Dikhta Hai?

### Approval ke baad:
1. 📧 Email inbox me message aayega
2. 📋 Subject: "✅ Your Withdrawal Has Been Approved"
3. 💰 Coins aur USD amount dikhai dega
4. 🔗 Transaction hash clickable hoga (blockchain pe dekh sakte)
5. 📊 Withdrawal history ka link

### Rejection ke baad:
1. 📧 Email inbox me message aayega
2. 📋 Subject: "❌ Withdrawal Request Rejected"
3. 📝 Rejection reason padhega
4. ✅ "Coins refunded" confirmation
5. 🔗 Support contact ka link
6. 🔗 "Try Again" button

---

## 🎨 Email Design

### Features:
- ✅ Professional design
- ✅ Mobile-friendly (phone pe bhi acha dikhta)
- ✅ Branded colors (green gradient)
- ✅ Clean layout
- ✅ Clickable links
- ✅ Support information

---

## 🔄 Complete Workflow

```
User requests withdrawal
         ↓
Status: "pending"
         ↓
Admin dekta hai admin panel me
         ↓
    ┌────────┴────────┐
    ↓                 ↓
APPROVE           REJECT
    ↓                 ↓
TX hash enter    Reason enter
    ↓                 ↓
Confirm          Confirm
    ↓                 ↓
Status: "paid"   Status: "failed"
    ↓                 ↓
Email send 📧    Email send 📧
                      ↓
                Coins refund ✅
```

---

## 🔐 Security

1. **Admin Only**: Sirf `soueabhkumar8310@gmail.com` access kar sakta
2. **Service Role**: Supabase admin key use hoti hai
3. **Validation**: TX hash required for approval
4. **Atomic Refund**: Agar reject fail ho to rollback hota hai
5. **Email From**: `noreply@freecoino.com` se send hota

---

## 🚨 Common Issues & Solutions

### Problem 1: Email nahi aa raha
**Solution:**
- Check `.env.local` me `RESEND_API_KEY` hai ya nahi
- Server restart karo: Stop (Ctrl+C) aur phir `npm run dev`
- Console me error check karo

### Problem 2: Approve button kaam nahi kar raha
**Solution:**
- TX hash zaroor daalo (empty nahi)
- Minimum 5 characters required
- Status "pending" hona chahiye

### Problem 3: Reject karne pe coins refund nahi ho rahe
**Solution:**
- Database check karo
- Console me errors dekho
- User ka balance verify karo

---

## 📊 Database Schema

### Withdrawals Table:
```
- id (UUID)
- user_id (UUID)
- amount (INTEGER) - coins me
- wallet_address (TEXT)
- status (TEXT) - 'pending', 'paid', 'failed'
- tx_hash (TEXT) - approval ke baad
- rejection_reason (TEXT) - rejection ke baad
- created_at (TIMESTAMP)
- processed_at (TIMESTAMP)
```

### Profiles Table:
```
- id (UUID)
- email (TEXT) - email bhejne ke liye
- display_name (TEXT) - email me name
- coins_balance (INTEGER) - refund yaha hota
```

---

## ✅ Checklist

Ye sab already complete hai:

- [x] Resend API key configured
- [x] Email functions created
- [x] Approval API integrated
- [x] Rejection API integrated
- [x] Refund system working
- [x] Admin UI with dialogs
- [x] Professional email templates
- [x] Mobile responsive emails
- [x] Error handling
- [x] Success notifications

---

## 🚀 Ready to Use!

System bilkul ready hai! Bas:
1. Server chalu karo: `npm run dev`
2. Admin login karo
3. Withdrawals approve/reject karo
4. Users ko automatic emails jayenge! 📧

**Koi additional setup ki zarurat nahi hai!** ✨

---

## 📞 Support

Agar koi problem ho to:
- Console logs check karo
- Database verify karo
- Email service (Resend) check karo
- `.env.local` file verify karo

**Sabkuch working hai! Test karke dekho!** 🎉
