"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import { useAuthSafe } from "@/hooks/useAuthSafe"
import { useEffect, useState } from "react"

interface RevenueData {
  name: string
  revenue: number
}

interface ServiceDistributionData {
  name: string
  value: number
  color: string
}

interface OccupancyData {
  day: string
  rate: number
}

interface TopService {
  name: string
  revenue: number
  bookings: number
}

interface PeakHour {
  time: string
  rate: number
  colorClass: string
}

interface Recommendation {
  type: 'positive' | 'warning' | 'info'
  text: string
  icon: string
  color: string
}

interface AnalyticsData {
  revenueData: RevenueData[]
  totalRevenue: number
  averageDailyRevenue: number
  averageTicket: number
  changeTotal: string
  changeDaily: string
  changeTicket: string
  serviceDistributionData: ServiceDistributionData[]
  topServices: TopService[]
  occupancyData: OccupancyData[]
  peakHours: PeakHour[]
  recommendations: Recommendation[]
}

export function AnalyticsTab() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { token, isAuthenticated, isLoading: isAuthLoading } = useAuthSafe()

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (isAuthLoading) return

      if (!isAuthenticated || !token) {
        setError("Connexion requise pour voir les analytics")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch('http://localhost:3500/api/analytics', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          if (response.status === 401) {
            setError("Session expirée. Reconnectez-vous.")
            return
          }
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || "Erreur lors du chargement des analytics")
        }

        const data = await response.json()
        setAnalytics(data)
      } catch (err: any) {
        console.error("Erreur fetch analytics:", err)
        setError(err.message || "Impossible de charger les analytics")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [token, isAuthenticated, isAuthLoading])

  if (isLoading || isAuthLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Analytics</h2>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
        <div className="h-96 bg-muted rounded-lg animate-pulse" />
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Analytics</h2>
          <p className="text-destructive">{error || "Aucune donnée disponible"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Analytics</h2>
        <p className="text-muted-foreground">Analyse détaillée des performances de votre salon</p>
      </div>

      <Tabs defaultValue="revenue" className="w-full">
        <TabsList>
          <TabsTrigger value="revenue">Revenus</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="occupancy">Taux d'occupation</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Évolution du chiffre d'affaires</CardTitle>
              <CardDescription>Revenus mensuels sur les 7 derniers mois</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analytics.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  {/* Tooltip avec FCFA */}
                  <Tooltip formatter={(value: number) => `FCFA ${value.toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" name="Revenus" stroke="#06b6d4" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Revenu total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">FCFA {analytics.totalRevenue.toLocaleString()}</div>
                <p className="text-sm text-green-600">{analytics.changeTotal}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Revenu moyen/jour</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">FCFA {analytics.averageDailyRevenue.toLocaleString()}</div>
                <p className="text-sm text-green-600">{analytics.changeDaily}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Ticket moyen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">FCFA {analytics.averageTicket.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">{analytics.changeTicket}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Répartition des services</CardTitle>
                <CardDescription>Distribution par type de prestation</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.serviceDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.serviceDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    {/* Tooltip du PieChart sans € */}
                    <Tooltip formatter={(value: number) => `${value} réservations`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top services par revenu</CardTitle>
                <CardDescription>Services les plus rentables</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topServices.map((service, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">{service.bookings} réservations</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">FCFA {service.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="occupancy" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Taux d'occupation hebdomadaire</CardTitle>
              <CardDescription>Pourcentage de créneaux réservés par jour</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.occupancyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                  <Bar dataKey="rate" name="Taux d'occupation" fill="#06b6d4" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Heures de pointe</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.peakHours.map((hour, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span>{hour.time}</span>
                      <span className={`font-bold ${hour.colorClass}`}>{hour.rate}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommandations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {analytics.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className={rec.color}>{rec.icon}</span>
                      <p>{rec.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}