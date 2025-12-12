import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe, Store } from "lucide-react"

interface Appointment {
  id: string
  time: string
  client: string
  service: string
  stylist: string
  status: "confirmed" | "arrived" | "inprogress" | "completed"
  origin: "online" | "instore"
}


const appointments: Appointment[] = [
  {
    id: "1",
    time: "09:00",
    client: "Marie Dubois",
    service: "Tresses Africaines",
    stylist: "Amina",
    status: "confirmed",
    origin: "online",
  },
  {
    id: "2",
    time: "10:30",
    client: "Julien Martin",
    service: "Coupe Homme",
    stylist: "Fatou",
    status: "arrived",
    origin: "instore",
  },
  {
    id: "3",
    time: "11:00",
    client: "Carole Lefebvre",
    service: "Soin Profond",
    stylist: "Amina",
    status: "confirmed",
    origin: "online",
  },
  {
    id: "4",
    time: "12:30",
    client: "David Bernard",
    service: "Défrisage",
    stylist: "Yasmine",
    status: "inprogress",
    origin: "online",
  },
  {
    id: "5",
    time: "14:00",
    client: "Sophie Petit",
    service: "Coloration",
    stylist: "Fatou",
    status: "confirmed",
    origin: "instore",
  },
]

const statusConfig = {
  confirmed: { label: "Confirmé", color: "bg-blue-100 text-blue-800" },
  arrived: { label: "Arrivé", color: "bg-green-100 text-green-800" },
  inprogress: { label: "En cours", color: "bg-yellow-100 text-yellow-800" },
  completed: { label: "Terminé", color: "bg-gray-100 text-gray-800" },
}

export function AppointmentsList() {
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
