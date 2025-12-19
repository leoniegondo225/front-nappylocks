"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/lib/auth-store" // adapte le chemin si besoin

export default function Hydration() {
  useEffect(() => {
    // Force la réhydration du store depuis localStorage
    useAuthStore.persist.rehydrate()
  }, [])

  return null
}