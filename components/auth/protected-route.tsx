"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { type UserRole } from "@/lib/auth-store"
import { useAuthSafe } from "@/hooks/useAuthSafe"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuthSafe()  // ← + isLoading !

  useEffect(() => {
    // On attend que l’hydratation soit terminée
    if (isLoading) return

    if (!isAuthenticated) {
      router.push("/auth/login")
      return
    }

    if (requiredRole && user?.role !== requiredRole) {
      router.push("/")
    }
  }, [isLoading, isAuthenticated, user, requiredRole, router])

  // Pendant l’hydratation → on affiche rien (ou un loader si tu veux)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-gold"></div>
      </div>
    )
  }

  // Si pas connecté → on laisse le useEffect rediriger
  if (!isAuthenticated) return null

  // Si rôle insuffisant → on laisse le useEffect rediriger
  if (requiredRole && user?.role !== requiredRole) return null

  return <>{children}</>
}