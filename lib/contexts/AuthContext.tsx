'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getCurrentUser, signOut as supabaseSignOut, type AuthUser } from '@/lib/supabase/auth'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Failed to refresh user:', error)
      setUser(null)
    }
  }, [])

  // Initial auth check - runs ONCE
  useEffect(() => {
    if (isInitialized) return

    let mounted = true

    getCurrentUser()
      .then((currentUser) => {
        if (mounted) {
          setUser(currentUser)
          setIsLoading(false)
          setIsInitialized(true)
        }
      })
      .catch((error) => {
        console.error('Auth initialization failed:', error)
        if (mounted) {
          setUser(null)
          setIsLoading(false)
          setIsInitialized(true)
        }
      })

    return () => {
      mounted = false
    }
  }, [isInitialized])

  const logout = async () => {
    try {
      await supabaseSignOut()
      setUser(null)
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }
      router.push('/auth/login?logout=true')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      setUser(null)
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }
      router.push('/auth/login?logout=true')
      router.refresh()
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
