// components/superadmin/stats-cards.tsx  ← Ne change RIEN ici, il est bon !
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building2, TrendingUp, Calendar, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import jsPDF from "jspdf"

interface Salon {
  _id: string
  status: "active" | "inactive"
}

interface StatsCardsProps {
  users: any[]
  salons: Salon[]
  dailyRevenue: number
  monthlyRevenue: number
  annualRevenue: number
  todayBookings: number
  pendingBookings: number
}

export function StatsCards({ 
  users, 
  salons, 
  dailyRevenue, 
  monthlyRevenue, 
  annualRevenue, 
  todayBookings,
  pendingBookings 
}: StatsCardsProps) {
  const activeSalons = salons.filter((s) => s.status === "active").length

  const handleDownloadPDF = () => {
    const doc = new jsPDF()
    
    doc.setFontSize(20)
    doc.setTextColor(30, 64, 175)
    doc.text("Rapport Statistiques NappyLocks", 105, 30, { align: "center" })
    
    doc.setFontSize(12)
    doc.setTextColor(100, 100, 100)
    doc.text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, 105, 40, { align: "center" })
    
    doc.setDrawColor(30, 64, 175)
    doc.setLineWidth(0.8)
    doc.line(20, 50, 190, 50)
    
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    let y = 70
    doc.text(`Utilisateurs total : ${users.length}`, 30, y); y += 15
    doc.text(`Salons actifs : ${activeSalons} (sur ${salons.length})`, 30, y); y += 20
    doc.text(`Revenu journalier : FCFA ${dailyRevenue.toLocaleString("fr-FR")}`, 30, y); y += 15
    doc.text(`Revenu mensuel : FCFA ${monthlyRevenue.toLocaleString("fr-FR")}`, 30, y); y += 15
    doc.text(`Revenu annuel : FCFA ${annualRevenue.toLocaleString("fr-FR")}`, 30, y); y += 20
    doc.text(`Réservations aujourd'hui : ${todayBookings} (${pendingBookings} en attente)`, 30, y)
    
    doc.setFontSize(10)
    doc.setTextColor(128, 128, 128)
    doc.text("Rapport confidentiel • Plateforme NappyLocks", 105, 280, { align: "center" })
    
    doc.save("rapport-statistiques-nappylocks.pdf")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleDownloadPDF} variant="default" className="gap-2">
          <Download className="w-4 h-4" />
          Télécharger le rapport PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs total</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">Inscrits plateforme</p>
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
            <CardTitle className="text-sm font-medium">Revenu journalier</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">FCFA {dailyRevenue.toLocaleString("fr-FR")}</div>
            <p className="text-xs text-green-600">Aujourd'hui</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenu mensuel</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">FCFA {monthlyRevenue.toLocaleString("fr-FR")}</div>
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
            <p className="text-xs text-muted-foreground">{pendingBookings} en attente</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}