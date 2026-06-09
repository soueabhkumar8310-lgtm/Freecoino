# Login Debug Test

## Test in Browser Console:

1. Open browser console (F12)
2. Go to login page: http://localhost:3000/auth/login
3. Paste this code in console:

```javascript
// Test 1: Check if Supabase is configured
console.log('Supabase URL:', 'https://fiagdlauajqzotxizmpc.supabase.co')
console.log('Has Anon Key:', !!localStorage.getItem('sb-fiagdlauajqzotxizmpc-auth-token'))

// Test 2: Try login directly
async function testLogin() {
  const response = await fetch('/api/test-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'sourabhkumar8310@gmail.com',
      password: 'Test@123456'
    })
  })
  const data = await response.json()
  console.log('Login Test Result:', data)
  return data
}

testLogin()
```

## Expected Results:

**If SUCCESS:**
```json
{
  "success": true,
  "user": { ... },
  "session": { ... }
}
```

**If FAIL:**
```json
{
  "success": false,
  "error": "Invalid login credentials"
}
```

## Next Steps Based on Result:

### If API login works but UI login fails:
- Problem is in login-client.tsx
- Issue with redirect or state management

### If API login also fails:
- Check password is correct
- Try creating fresh user
- Check Supabase auth settings

## Manual Test:

1. Create user in Supabase dashboard directly
2. Set known password
3. Try login with that
