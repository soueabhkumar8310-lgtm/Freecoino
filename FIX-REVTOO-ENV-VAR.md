# 🔧 Fix Revtoo Environment Variable

## Problem:
Revtoo iframe needs `NEXT_PUBLIC_REVTOO_API_KEY` but we only have `REVTOO_API_KEY` (server-side only).

## Solution:
Add `NEXT_PUBLIC_REVTOO_API_KEY` to Vercel environment variables.

## Steps:

### Go to Vercel Dashboard:
https://vercel.com/sourabhkumar-s-projects/freecoino/settings/environment-variables

### Add New Variable:
- **Name**: `NEXT_PUBLIC_REVTOO_API_KEY`
- **Value**: `lmtx1hoinv2rvigke7z15bn7pe20fh`
- **Environments**: Check ✅ Production, Preview, Development
- Click **Save**

### Redeploy:
1. Go to Deployments tab
2. Click latest deployment
3. Click "..." → Redeploy

---

**After this, Revtoo iframe will load properly!** 🚀

## Why NEXT_PUBLIC_?

Variables starting with `NEXT_PUBLIC_` are accessible in browser (client-side).
Iframe embedding needs client-side access to API key.

This is safe for Revtoo because the API key is meant to be used in iframes (public-facing).
