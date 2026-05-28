# Migration from MockAuth to Supabase Auth

## ✅ What's Done:
- Created `lib/hooks/useAuth.ts` - New auth hook
- Updated `app/earn/page.tsx` - Using real auth
- Updated `app/layout.tsx` - Removed MockAuthProvider

## 🔧 What Needs to be Done:

Replace all instances of:
```typescript
import { useMockAuth } from "@/lib/mock-auth";
```

With:
```typescript
import { useAuth } from "@/lib/hooks/useAuth";
```

And change:
```typescript
const { user, isLoading } = useMockAuth();
```

To:
```typescript
const { user, isLoading } = useAuth();
```

## 📁 Files That Need Update:

### Pages:
- ✅ `app/earn/page.tsx` - DONE
- ⏳ `app/daily-bonus/page.tsx`
- ⏳ `app/referrals/page.tsx`
- ⏳ `app/profile/page.tsx`
- ⏳ `app/my-offers/page.tsx`
- ⏳ `app/offers/all/page.tsx`
- ⏳ `app/leaderboard/page.tsx`
- ⏳ `app/history/page.tsx`
- ⏳ `app/cashout/page.tsx`

### Components:
- ⏳ `components/fullscreen-shell.tsx`
- ⏳ `components/balance-updater.tsx`
- ⏳ `components/balance-display.tsx`
- ⏳ `components/app-shell.tsx`

## 🚀 Quick Fix Command:

Run this in PowerShell to update all files at once:

```powershell
# Update imports
Get-ChildItem -Path "app","components" -Recurse -Include *.tsx | ForEach-Object {
    (Get-Content $_.FullName) -replace 'import \{ useMockAuth \} from "@/lib/mock-auth";', 'import { useAuth } from "@/lib/hooks/useAuth";' | Set-Content $_.FullName
    (Get-Content $_.FullName) -replace 'useMockAuth\(\)', 'useAuth()' | Set-Content $_.FullName
}
```

## ⚠️ Important Notes:

### User Object Changes:
MockAuth user had:
- `user.coins_balance`
- `user.display_name`
- `user.avatar_url`

Supabase user has:
- `user.name`
- `user.avatar`
- No coins_balance (need to fetch from database)

### Update User References:
Change:
```typescript
userName={user.display_name}
userAvatar={user.avatar_url}
coins={user.coins_balance}
```

To:
```typescript
userName={user.name}
userAvatar={user.avatar}
coins={0} // TODO: Fetch from database
```

## 📊 Database Schema Needed:

Create a `profiles` table in Supabase:

```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  coins_balance INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 🎯 Testing After Migration:

1. Restart dev server: `npm run dev`
2. Clear browser cache
3. Test login with email
4. Test login with Google
5. Test all protected pages
6. Verify logout works

---

**Status:** Partial migration complete. Need to update remaining files.
