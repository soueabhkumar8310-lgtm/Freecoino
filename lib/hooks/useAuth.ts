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
    await signOut()
    setUser(null)
    router.push('/auth/login')
  }

  return { user, isLoading, logout }
}
