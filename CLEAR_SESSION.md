# Clear Browser Session - Manual Logout

Agar aap automatically login ho ja rahe ho aur logout button kaam nahi kar raha, toh ye steps follow karo:

## Method 1: Browser Console se Clear karo

1. **Browser mein** http://localhost:3000 kholo
2. **F12** press karo (Developer Tools open hoga)
3. **Console** tab pe jao
4. Ye command paste karo aur **Enter** press karo:

```javascript
// Clear all Supabase auth data
localStorage.clear();
sessionStorage.clear();
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
console.log("✅ Session cleared! Refresh the page.");
```

5. **Page refresh** karo (Ctrl+R ya F5)
6. Ab aap logged out ho, signup/login page pe ja sakte ho

---

## Method 2: Browser Settings se Cookies Clear karo

### Chrome:
1. **Settings** → **Privacy and security** → **Clear browsing data**
2. **Cookies and other site data** check karo
3. **Time range**: "Last hour" select karo
4. **Clear data** click karo

### Firefox:
1. **Settings** → **Privacy & Security** → **Cookies and Site Data**
2. **Clear Data** click karo
3. **Cookies and Site Data** check karo
4. **Clear** click karo

### Edge:
1. **Settings** → **Privacy, search, and services** → **Clear browsing data**
2. **Choose what to clear** → **Cookies and other site data**
3. **Clear now** click karo

---

## Method 3: Incognito/Private Window Use karo

Sabse aasan tarika:

1. **Incognito/Private window** kholo:
   - Chrome: `Ctrl + Shift + N`
   - Firefox: `Ctrl + Shift + P`
   - Edge: `Ctrl + Shift + N`

2. http://localhost:3000 kholo
3. Ab aap fresh session mein ho, koi purana login nahi hoga

---

## Method 4: Direct Logout API Call

Browser console mein ye command run karo:

```javascript
fetch('/api/auth/signout', { method: 'POST' })
  .then(() => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/auth/login';
  });
```

---

## Verification

Logout successful hai ya nahi check karne ke liye:

1. http://localhost:3000/earn pe jao
2. Agar login page pe redirect ho gaye, toh **logout successful** ✅
3. Agar earn page dikha, toh **still logged in** ❌ (upar ke methods phir se try karo)

---

## Testing New Signup

Logout ke baad:

1. http://localhost:3000/auth/signup pe jao
2. **Email** ya **Phone** method select karo
3. Details fill karo:
   - Display Name: `Test User`
   - Email: `test@example.com` (ya phone: `+919876543210`)
   - Password: `test123` (minimum 6 characters)
4. **Terms** checkbox check karo
5. **Create Account** click karo
6. Success message aayega
7. Login page pe redirect hoga
8. Login karo aur test karo

---

## Quick Command (Copy-Paste Ready)

Browser console mein ye ek command paste karo:

```javascript
(async () => {
  try {
    await fetch('/api/auth/signout', { method: 'POST' });
  } catch(e) {}
  localStorage.clear();
  sessionStorage.clear();
  document.cookie.split(";").forEach(c => {
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
  alert("✅ Logged out! Page will refresh.");
  setTimeout(() => window.location.href = '/auth/login', 1000);
})();
```

Ye command:
- Logout API call karega
- LocalStorage clear karega
- SessionStorage clear karega
- Cookies clear karega
- Login page pe redirect karega

---

## Prevention: Auto-login Disable karna

Agar aap chahte ho ki signup/login pages pe auto-redirect na ho (testing ke liye), toh main code mein change kar sakta hoon. Batao agar chahiye!
