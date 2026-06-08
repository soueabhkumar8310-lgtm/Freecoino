# Clear Browser Session - Fix Login Issues

Agar login nahi ho raha, automatic redirect ho raha hai, ya purana session problem de raha hai, toh ye steps follow karo:

## 🚀 QUICKEST FIX: Visit Clear Session Page

**Sabse aasan tarika** (recommended):

1. Ye URL kholo: **https://freecoino.vercel.app/clear-session**
2. 2 seconds wait karo
3. Automatically login page pe redirect hoga
4. Ab login try karo

Ye page automatically:
- ✅ LocalStorage clear karega
- ✅ SessionStorage clear karega  
- ✅ Cookies clear karega
- ✅ Login page pe redirect karega

---

## Method 2: Incognito/Private Window (Testing ke liye)

Sabse aasan testing tarika:

1. **Incognito/Private window** kholo:
   - Chrome: `Ctrl + Shift + N`
   - Firefox: `Ctrl + Shift + P`
   - Edge: `Ctrl + Shift + N`

2. https://freecoino.vercel.app kholo
3. Ab aap fresh session mein ho, koi purana login nahi hoga
4. Login/Signup test karo

---

## Method 3: Browser Console se Clear karo

1. **Browser mein** https://freecoino.vercel.app kholo
2. **F12** press karo (Developer Tools open hoga)
3. **Console** tab pe jao
4. Ye command paste karo aur **Enter** press karo:

```javascript
// Clear all auth data
localStorage.clear();
sessionStorage.clear();
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
console.log("✅ Session cleared! Refresh the page.");
location.reload();
```

---

## Method 4: Browser Settings se Clear karo

### Chrome:
1. **Settings** → **Privacy and security** → **Clear browsing data**
2. **Cookies and other site data** check karo
3. **Time range**: "Last hour" select karo
4. **Clear data** click karo
5. Page refresh karo

### Firefox:
1. **Settings** → **Privacy & Security** → **Cookies and Site Data**
2. **Clear Data** click karo
3. **Cookies and Site Data** check karo
4. **Clear** click karo
5. Page refresh karo

### Edge:
1. **Settings** → **Privacy, search, and services** → **Clear browsing data**
2. **Choose what to clear** → **Cookies and other site data**
3. **Clear now** click karo
4. Page refresh karo

---

## 🔍 Troubleshooting Login Issues

### Problem: "Wrong email or password" error

**Solution:**
1. Clear session using Method 1 above (`/clear-session` page)
2. Double-check email spelling
3. Try "Forgot password?" link agar password yaad nahi
4. Check Caps Lock is OFF

### Problem: Page reloads but doesn't login

**Solution:**
1. Clear ALL browser cache & cookies
2. Use incognito mode for testing
3. Check browser console for errors (F12 → Console tab)
4. Try different browser (Chrome, Firefox, Edge)

### Problem: Automatic redirect to login page

**Solution:**
1. Visit https://freecoino.vercel.app/clear-session
2. Wait for redirect
3. Try fresh login

---

## ✅ Verification

Login successful hai ya nahi check karne ke liye:

1. https://freecoino.vercel.app/earn pe jao
2. Agar **Earn page** dikha with offers, toh **login successful** ✅
3. Agar **login page** pe redirect ho gaye, toh try:
   - Clear session using Method 1
   - Check email/password correct hai
   - Try Google login

---

## 📧 Test Account (If Needed)

Agar test karna hai:

**Email:** testuser2026@gmail.com  
**Password:** Test@123456

(Admin manually create karega agar chahiye)

---

## Quick One-Liner Command

Browser console mein ye paste karo (Ctrl+Shift+J → Console):

```javascript
(async()=>{localStorage.clear();sessionStorage.clear();document.cookie.split(";").forEach(c=>document.cookie=c.replace(/^ +/,"").replace(/=.*/,"=;expires="+new Date().toUTCString()+";path=/"));alert("✅ Cleared! Redirecting...");setTimeout(()=>location.href='/auth/login',1000)})();
```

---

## 🛠️ For Developers

### Latest Changes (Fix Implementation):

1. **Removed custom storage key** - Now using default Supabase auth keys for consistency
2. **Fixed middleware** - Properly detecting auth cookies (checks all `auth-token` cookies)
3. **Removed auto-redirect** - Login page won't automatically redirect on mount
4. **Enhanced clear-session** - Now clears localStorage, sessionStorage, AND cookies

### Files Changed:
- `lib/supabase/client.ts` - Removed custom `storageKey`
- `middleware.ts` - Fixed cookie detection logic
- `components/login-client.tsx` - Removed useEffect auto-redirect
- `app/clear-session/page.tsx` - Added cookie clearing

---

## Need More Help?

Agar phir bhi problem hai, toh:

1. Browser console screenshot bhejo (F12 → Console)
2. Error message batao
3. Exact steps batao kya kiya tha

Contact: sourabhkumar8310@gmail.com

