import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatsCardProps {
  title: string
  value: string | number
  change: string
  changeType: "positive" | "negative" | "neutral"
}

function StatsCard({ title, value, change, changeType }: StatsCardProps) {
  const changeColor =
    changeType === "positive" ? "text-green-600" : changeType === "negative" ? "text-red-600" : "text-gray-600"

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

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatsCard title="Rendez-vous aujourd'hui" value={12} change="+2% depuis hier" changeType="positive" />
      <StatsCard
        title="Réservations à venir (7j)"
        value={34}
        change="+5% depuis la semaine passée"
        changeType="positive"
      />
      <StatsCard title="Chiffre d'affaires du jour" value="€850" change="+15% depuis hier" changeType="positive" />
    </div>
  )
}
