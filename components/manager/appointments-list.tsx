import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe, Store } from "lucide-react"
import { useEffect, useState } from "react"


interface Appointment {
  id: string
  time: string
  client: string
  service: string
  stylist: string
  status: "confirmed" | "arrived" | "inprogress" | "completed"
  origin: "online" | "instore"
}

const statusConfig = {
  confirmed: { label: "Confirmé", color: "bg-blue-100 text-blue-800" },
  arrived: { label: "En attente", color: "bg-green-100 text-green-800" },
  inprogress: { label: "En cours", color: "bg-yellow-100 text-yellow-800" },
  completed: { label: "Terminé", color: "bg-gray-100 text-gray-800" },
}



const mapStatus = (status: string) => {
  switch (status) {
    case "CONFIRMED":
      return "confirmed"
    case "PENDING":
      return "arrived"
    case "CANCELLED":
      return "completed"
    default:
      return "confirmed"
  }
}
const mapOrigin = (source: string) =>
  source === "ONLINE" ? "online" : "instore"


export function AppointmentsList() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)


   useEffect(() => {
    const fetchRdvs = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/rdv/gerant`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        const data = await res.json()

        const formatted: Appointment[] = data.map((rdv: any) => ({
          id: rdv._id,
          time: rdv.time,
          client: `${rdv.clientId?.prenom} ${rdv.clientId?.nom}`,
          service: rdv.service,
          stylist: rdv.coiffeur || "-",
          status: mapStatus(rdv.status),
          origin: mapOrigin(rdv.source),
        }))

          setAppointments(formatted)
      } catch (error) {
        console.error("Erreur chargement RDV", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRdvs()
  }, [])

    if (loading) {
    return <p className="text-sm text-muted-foreground">Chargement...</p>
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Liste des rendez-vous</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="pb-3 font-medium">HEURE</th>
                <th className="pb-3 font-medium">CLIENT</th>
                <th className="pb-3 font-medium">SERVICE</th>
                <th className="pb-3 font-medium">COIFFEUR/SE</th>
                <th className="pb-3 font-medium">STATUT</th>
                <th className="pb-3 font-medium">ORIGINE</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt.id} className="border-b last:border-0">
                  <td className="py-4 font-medium">{apt.time}</td>
                  <td className="py-4">{apt.client}</td>
                  <td className="py-4">{apt.service}</td>
                  <td className="py-4">{apt.stylist}</td>
                  <td className="py-4">
                    <Badge variant="secondary" className={statusConfig[apt.status].color}>
                      {statusConfig[apt.status].label}
                    </Badge>
                  </td>
                  <td className="py-4">
                    {apt.origin === "online" ? (
                      <Globe className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Store className="w-5 h-5 text-gray-600" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-3">
          {appointments.map((apt) => (
            <div key={apt.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{apt.client}</p>
                  <p className="text-sm text-muted-foreground">{apt.service}</p>
                </div>
                <Badge variant="secondary" className={statusConfig[apt.status].color}>
                  {statusConfig[apt.status].label}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">{apt.time}</span>
                <span className="text-muted-foreground">{apt.stylist}</span>
              </div>
              <div className="flex justify-end">
                {apt.origin === "online" ? (
                  <div className="flex items-center gap-1 text-xs text-blue-600">
                    <Globe className="w-4 h-4" />
                    <span>En ligne</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Store className="w-4 h-4" />
                    <span>Sur place</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
