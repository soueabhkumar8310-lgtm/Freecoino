import { supabase } from './client'
import type { Provider } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  name: string
  avatar?: string
  coins_balance?: number
}

// Sign up with email and password
export async function signUpWithEmail(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: name,
      },
    },
  })

  if (error) throw error
  return data
}

// Sign in with email and password
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

// Sign in with OAuth (Google)
export async function signInWithOAuth(provider: Provider) {
  // Get the correct origin (works for both local and production)
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://freecoino.vercel.app'
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback`,
      // Skip email confirmation for OAuth
      skipBrowserRedirect: false,
    },
  })

  if (error) throw error
  return data
}

// Sign out
export async function signOut() {
  clearAuthCache(); // Clear cache before logout
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// In-memory cache to prevent multiple simultaneous calls
let authCache: { user: AuthUser | null; timestamp: number } | null = null;
const CACHE_DURATION = 5000; // 5 seconds

// Get current user
export async function getCurrentUser(): Promise<AuthUser | null> {
  // Return cached value if still fresh
  if (authCache && (Date.now() - authCache.timestamp) < CACHE_DURATION) {
    return authCache.user;
  }

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      authCache = { user: null, timestamp: Date.now() };
      return null
    }

    // Try to fetch profile data including coins_balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('coins_balance')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.warn('⚠️ Profile fetch failed:', profileError.message)
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.display_name || user.email!.split('@')[0],
      avatar: user.user_metadata?.avatar_url,
      coins_balance: profile?.coins_balance || 0,
    };

    // Cache the result
    authCache = { user: authUser, timestamp: Date.now() };
    return authUser;
  } catch (error) {
    console.error('❌ Error getting current user:', error)
    authCache = { user: null, timestamp: Date.now() };
    return null
  }
}

// Clear auth cache (call after login/logout)
export function clearAuthCache() {
  authCache = null;
}

// Listen to auth state changes
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      try {
        // Try to fetch profile data including coins_balance
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('coins_balance')
          .eq('id', session.user.id)
          .single()

        if (profileError) {
          console.warn('⚠️ Profile fetch error:', profileError.message)
        }

        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.display_name || session.user.email!.split('@')[0],
          avatar: session.user.user_metadata?.avatar_url,
          coins_balance: profile?.coins_balance || 0,
        }
        callback(authUser)
      } catch (error) {
        console.error('❌ Error in auth state change:', error)
        // Still callback with basic user info
        callback({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.display_name || session.user.email!.split('@')[0],
          avatar: session.user.user_metadata?.avatar_url,
          coins_balance: 0,
        })
      }
    } else {
      callback(null)
    }
  })
}

// Reset password
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })

  if (error) throw error
}

// Update password
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) throw error
}
