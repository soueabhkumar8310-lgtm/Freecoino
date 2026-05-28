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

// Sign in with OAuth (Google, Facebook, etc.)
export async function signInWithOAuth(provider: Provider) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) throw error
  return data
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Get current user
export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Fetch profile data including coins_balance
  const { data: profile } = await supabase
    .from('profiles')
    .select('coins_balance')
    .eq('id', user.id)
    .single()

  return {
    id: user.id,
    email: user.email!,
    name: user.user_metadata?.display_name || user.email!.split('@')[0],
    avatar: user.user_metadata?.avatar_url,
    coins_balance: profile?.coins_balance || 0,
  }
}

// Listen to auth state changes
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      // Fetch profile data including coins_balance
      const { data: profile } = await supabase
        .from('profiles')
        .select('coins_balance')
        .eq('id', session.user.id)
        .single()

      const authUser: AuthUser = {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.user_metadata?.display_name || session.user.email!.split('@')[0],
        avatar: session.user.user_metadata?.avatar_url,
        coins_balance: profile?.coins_balance || 0,
      }
      callback(authUser)
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
