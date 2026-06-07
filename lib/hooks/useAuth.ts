'use client'

import { useState, useEffect } from 'react'
import { getCurrentUser, onAuthStateChange, signOut, type AuthUser } from '@/lib/supabase/auth'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get initial user
    getCurrentUser().then((currentUser) => {
      setUser(currentUser)
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((authUser) => {
      setUser(authUser)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const logout = async () => {
    try {
      await signOut()
      setUser(null)
      // Clear all browser storage
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }
      router.push('/auth/login?logout=true')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      // Force logout even if API fails
      setUser(null)
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }
      router.push('/auth/login?logout=true')
      router.refresh()
    }
  }

  return { user, isLoading, logout }
}
