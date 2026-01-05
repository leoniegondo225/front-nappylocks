"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { useAuthStore } from "@/lib/auth-store"
import { useToast } from "@/hooks/use-toast"

// Types pour les données attendues du backend
interface RevenueMonth {
  month: string
  revenue: number
}

interface BookingStatus {
  name: string
  value: number
  color: string  // ← Important : la couleur est ici
}

interface TopService {
  service: string
  bookings: number
}

export function OverviewTab() {
  const [revenueData, setRevenueData] = useState<RevenueMonth[]>([])
  const [bookingsByStatus, setBookingsByStatus] = useState<BookingStatus[]>([])
  const [topServices, setTopServices] = useState<TopService[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const token = useAuthStore((state) => state.token)

  useEffect(() => {
    if (!token) {
      toast({
        title: "Non authentifié",
        description: "Veuillez vous reconnecter",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)

        // Revenus mensuels
        const revenueRes = await fetch("http://localhost:3500/api/stats/revenue-by-month", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!revenueRes.ok) throw new Error("Erreur revenus mensuels")
        const revenueData: RevenueMonth[] = await revenueRes.json()
        setRevenueData(revenueData)

        // Répartition par statut
        const statusRes = await fetch("http://localhost:3500/api/stats/bookings-by-status", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!statusRes.ok) throw new Error("Erreur statuts réservations")
        const statusData: BookingStatus[] = await statusRes.json()
        setBookingsByStatus(statusData)

        // Top services
        const topRes = await fetch("http://localhost:3500/api/stats/top-services", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!topRes.ok) throw new Error("Erreur top services")
        const topData: TopService[] = await topRes.json()
        setTopServices(topData)
      } catch (error: any) {
        toast({
          title: "Erreur",
          description: error.message || "Impossible de charger les données",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token, toast])

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Chargement des graphiques...</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution du revenu */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution du revenu</CardTitle>
            <CardDescription>Revenus mensuels des 5 derniers mois</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `FCFA ${value.toLocaleString()}`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: "#8b5cf6" }}
                  name="Revenu"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition des réservations */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition des réservations</CardTitle>
            <CardDescription>Par statut actuel</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={bookingsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {bookingsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value} réservations`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top 5 services */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 des services</CardTitle>
          <CardDescription>Les prestations les plus demandées</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topServices}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="service" angle={-15} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value} réservations`} />
              <Legend />
              <Bar dataKey="bookings" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Réservations" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}