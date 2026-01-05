"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/lib/auth-store"

export const useAuthSafe = () => {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setIsHydrated(true)
    })

    if (useAuthStore.persist.hasHydrated()) {
      setIsHydrated(true)
    }

    return unsub
  }, [])

  const user = useAuthStore(s => s.user)
  const token = useAuthStore(s => s.token)
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)

  return {
    user,
    token,
    isAuthenticated: isHydrated ? isAuthenticated : false,
    isLoading: !isHydrated,
  }
}