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

const revenueData = [
  { name: "Jan", revenue: 4500 },
  { name: "Fév", revenue: 5200 },
  { name: "Mar", revenue: 4800 },
  { name: "Avr", revenue: 6100 },
  { name: "Mai", revenue: 7200 },
  { name: "Juin", revenue: 6800 },
  { name: "Juil", revenue: 8500 },
]

const serviceDistributionData = [
  { name: "Tresses", value: 35, color: "#06b6d4" },
  { name: "Coupe", value: 25, color: "#8b5cf6" },
  { name: "Coloration", value: 20, color: "#ec4899" },
  { name: "Soin", value: 15, color: "#10b981" },
  { name: "Défrisage", value: 5, color: "#f59e0b" },
]

const occupancyData = [
  { day: "Lun", rate: 75 },
  { day: "Mar", rate: 82 },
  { day: "Mer", rate: 68 },
  { day: "Jeu", rate: 90 },
  { day: "Ven", rate: 95 },
  { day: "Sam", rate: 88 },
  { day: "Dim", rate: 45 },
]

export function AnalyticsTab() {
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
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `€${value}`} />
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
                <div className="text-3xl font-bold">€43,100</div>
                <p className="text-sm text-green-600">+23% vs période précédente</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Revenu moyen/jour</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">€850</div>
                <p className="text-sm text-green-600">+15% vs mois dernier</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Ticket moyen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">€65</div>
                <p className="text-sm text-muted-foreground">Stable</p>
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
                      data={serviceDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {serviceDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
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
                  {[
                    { name: "Tresses Africaines", revenue: 15000, bookings: 120 },
                    { name: "Coloration", revenue: 12000, bookings: 80 },
                    { name: "Coupe Homme", revenue: 8500, bookings: 200 },
                    { name: "Soin Profond", revenue: 7600, bookings: 95 },
                  ].map((service, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">{service.bookings} réservations</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">€{service.revenue.toLocaleString()}</p>
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
                <BarChart data={occupancyData}>
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
                  <div className="flex justify-between items-center">
                    <span>10:00 - 12:00</span>
                    <span className="font-bold text-green-600">95%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>14:00 - 16:00</span>
                    <span className="font-bold text-green-600">88%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>16:00 - 18:00</span>
                    <span className="font-bold text-yellow-600">72%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>18:00 - 20:00</span>
                    <span className="font-bold text-red-600">45%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommandations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex gap-2">
                    <span className="text-green-600">✓</span>
                    <p>Excellent taux de réservation le jeudi et vendredi</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-yellow-600">⚠</span>
                    <p>Proposer des promotions pour le mercredi</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-blue-600">ℹ</span>
                    <p>Envisager des horaires réduits le dimanche</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
