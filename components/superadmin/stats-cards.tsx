import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building2, TrendingUp, Calendar } from "lucide-react"
import type { User } from "@/lib/auth-store"

interface Salon {
  id: string
  status: "active" | "inactive"
}

interface StatsCardsProps {
  users: User[]
  salons: Salon[]
  monthlyRevenue: number
  todayBookings: number
}

export function StatsCards({ users, salons, monthlyRevenue, todayBookings }: StatsCardsProps) {
  const activeSalons = salons.filter((s) => s.status === "active").length

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Utilisateurs total</CardTitle>
          <Users className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{users.length}</div>
          <p className="text-xs text-muted-foreground">+2 ce mois</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Salons actifs</CardTitle>
          <Building2 className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeSalons}</div>
          <p className="text-xs text-muted-foreground">Sur {salons.length} total</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Revenu mensuel</CardTitle>
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">€{monthlyRevenue.toLocaleString()}</div>
          <p className="text-xs text-green-600">+18% vs mois dernier</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Réservations aujourd'hui</CardTitle>
          <Calendar className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{todayBookings}</div>
          <p className="text-xs text-muted-foreground">+12 en attente</p>
        </CardContent>
      </Card>
    </div>
  )
}
