"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthSafe } from "@/hooks/useAuthSafe"
import { useEffect, useState } from "react"

interface StatsCardProps {
  title: string
  value: string | number
  change: string
  changeType: "positive" | "negative" | "neutral"
}

function StatsCard({ title, value, change, changeType }: StatsCardProps) {
  const changeColor =
    changeType === "positive" ? "text-green-600" : 
    changeType === "negative" ? "text-red-600" : "text-gray-600"

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className={`text-xs ${changeColor} mt-1`}>{change}</p>
      </CardContent>
    </Card>
  )
}

interface DashboardStatsData {
  todayAppointments: number
  upcomingAppointments: number
  todayRevenue: string
  changeToday: string
  changeWeek: string
  changeRevenue: string
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { token, isAuthenticated, isLoading: isAuthLoading } = useAuthSafe()

  useEffect(() => {
    const fetchStats = async () => {
      if (isAuthLoading) return

      if (!isAuthenticated || !token) {
        setError("Connexion requise")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch('http://localhost:3500/api/dashboard-stats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          if (response.status === 401) throw new Error("Session expirée")
          throw new Error("Erreur lors du chargement des statistiques")
        }

        const data = await response.json()
        setStats(data)
      } catch (err: any) {
        setError(err.message || "Impossible de charger les statistiques")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [token, isAuthenticated, isAuthLoading])

  if (isLoading || isAuthLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-10 bg-gray-200 rounded w-24 animate-pulse mb-2" />
              <div className="h-3 bg-gray-200 rounded w-32 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="text-center py-10 text-destructive">
        {error || "Aucune statistique disponible"}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatsCard
        title="Rendez-vous aujourd'hui"
        value={stats.todayAppointments}
        change={stats.changeToday}
        changeType="positive"
      />
      <StatsCard
        title="Réservations à venir (7j)"
        value={stats.upcomingAppointments}
        change={stats.changeWeek}
        changeType="positive"
      />
      <StatsCard
        title="Chiffre d'affaires du jour"
        value={`FCFA ${stats.todayRevenue}`}
        change={stats.changeRevenue}
        changeType="positive"
      />
    </div>
  )
}