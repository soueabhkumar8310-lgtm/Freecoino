'use client'

import { useState, useEffect, useRef } from 'react'
import { getCurrentUser, onAuthStateChange, signOut, type AuthUser } from '@/lib/supabase/auth'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const authCheckInProgress = useRef(false)
  const initialCheckDone = useRef(false)

  useEffect(() => {
    // Prevent multiple simultaneous auth checks
    if (authCheckInProgress.current) {
      console.log('⏸️ Auth check already in progress, skipping...')
      return
    }

    let mounted = true
    authCheckInProgress.current = true
    
    async function initAuth() {
      try {
        // Only do initial check once
        if (!initialCheckDone.current) {
          console.log('🔍 Initial auth check...')
          const currentUser = await getCurrentUser()
          
          if (mounted) {
            console.log('✅ Auth check complete:', currentUser ? currentUser.email : 'No user')
            setUser(currentUser)
            setIsLoading(false)
            initialCheckDone.current = true
          }
        }
      } catch (error) {
        console.error('❌ Auth check failed:', error)
        if (mounted) {
          setUser(null)
          setIsLoading(false)
        }
      } finally {
        authCheckInProgress.current = false
      }
    }
    
    // Safety timeout - force loading to false after 3 seconds
    const timeout = setTimeout(() => {
      if (mounted && isLoading) {
        console.warn('⚠️ Auth timeout - forcing loading to false')
        setIsLoading(false)
        authCheckInProgress.current = false
      }
    }, 3000)

    // Initial auth check
    initAuth()

    // Listen for auth changes (login/logout events ONLY)
    const { data: { subscription } } = onAuthStateChange((authUser) => {
      if (mounted && initialCheckDone.current) {
        // Only update if there's an actual change
        console.log('🔄 Auth state changed:', authUser ? authUser.email : 'Logged out')
        setUser(authUser)
        if (isLoading) setIsLoading(false)
      }
    })

    return () => {
      mounted = false
      clearTimeout(timeout)
      subscription.unsubscribe()
      authCheckInProgress.current = false
    }
  }, []) // Empty dependency - runs only once

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
