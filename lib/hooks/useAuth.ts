'use client'

import { useState, useEffect } from 'react'
import { getCurrentUser, onAuthStateChange, signOut, type AuthUser } from '@/lib/supabase/auth'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    let retryCount = 0
    const MAX_RETRIES = 2
    
    async function checkAuth() {
      try {
        const currentUser = await getCurrentUser()
        if (mounted) {
          console.log('✅ Auth check complete:', currentUser ? 'User found' : 'No user')
          setUser(currentUser)
          setIsLoading(false)
          return true
        }
      } catch (error) {
        console.error('❌ Auth check failed:', error)
        if (mounted && retryCount < MAX_RETRIES) {
          retryCount++
          console.log(`🔄 Retrying auth check (${retryCount}/${MAX_RETRIES})...`)
          // Wait a bit before retry
          await new Promise(resolve => setTimeout(resolve, 1000))
          return checkAuth()
        }
        if (mounted) {
          setUser(null)
          setIsLoading(false)
        }
      }
      return false
    }
    
    // Set timeout to prevent infinite loading (increased to 5 seconds)
    const timeout = setTimeout(() => {
      if (mounted && isLoading) {
        console.warn('⚠️ Auth timeout - forcing loading to false')
        setIsLoading(false)
        setUser(null)
      }
    }, 5000)

    // Get initial user with retry logic
    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((authUser) => {
      if (mounted) {
        console.log('🔄 Auth state changed:', authUser ? 'User logged in' : 'User logged out')
        setUser(authUser)
        setIsLoading(false)
        clearTimeout(timeout)
      }
    })

    return () => {
      mounted = false
      clearTimeout(timeout)
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
