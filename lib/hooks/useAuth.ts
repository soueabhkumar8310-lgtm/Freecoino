'use client'

import { useState, useEffect } from 'react'
import { getCurrentUser, signOut, type AuthUser } from '@/lib/supabase/auth'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    
    // Simple one-time auth check
    getCurrentUser()
      .then((currentUser) => {
        if (mounted) {
          setUser(currentUser)
          setIsLoading(false)
        }
      })
      .catch((error) => {
        console.error('Auth check failed:', error)
        if (mounted) {
          setUser(null)
          setIsLoading(false)
        }
      })

    // Cleanup
    return () => {
      mounted = false
    }
  }, []) // Run once on mount

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
