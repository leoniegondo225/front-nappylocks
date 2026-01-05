"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe, Store } from "lucide-react"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/lib/auth-store"

interface Appointment {
  _id: string
  time: string
  client: string
  service: string
  employee: string
  status: "confirmed" | "arrived" | "inprogress" | "completed"
  origin: "online" | "instore"
}

const statusConfig = {
  confirmed: { label: "Confirmé", color: "bg-blue-100 text-blue-800" },
  arrived: { label: "En attente", color: "bg-green-100 text-green-800" },
  inprogress: { label: "En cours", color: "bg-yellow-100 text-yellow-800" },
  completed: { label: "Terminé", color: "bg-gray-100 text-gray-800" },
}

const mapStatus = (status: string): Appointment["status"] => {
  switch (status.toUpperCase()) {
    case "CONFIRMED":
      return "confirmed"
    case "PENDING":
      return "arrived"
    case "IN_PROGRESS":
      return "inprogress"
    case "COMPLETED":
    case "CANCELLED":
      return "completed"
    default:
      return "confirmed"
  }
}

const mapOrigin = (source: string): Appointment["origin"] =>
  source.toUpperCase() === "ONLINE" ? "online" : "instore"

export function AppointmentsList() {
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const token = useAuthStore((state) => state.token)

  useEffect(() => {
    const fetchRdvs = async () => {
      if (!token) {
        toast({
          title: "Non authentifié",
          description: "Vous devez être connecté pour voir les rendez-vous.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const res = await fetch("http://localhost:3500/api/gerant", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.message || "Impossible de charger les rendez-vous")
        }

        const data = await res.json()
        

        if (!Array.isArray(data)) {
          console.warn("Données RDV inattendues :", data)
          setAppointments([])
          return
        }

        const formatted: Appointment[] = data.map((rdv: any) => ({
          _id: rdv._id,
          time: rdv.time || "Heure inconnue",
          client: rdv.clientId
            ? `${rdv.clientId.prenom || ""} ${rdv.clientId.nom || ""}`.trim() || "Client inconnu"
            : "Client inconnu",
          service: rdv.serviceId?.name || rdv.service || "Service inconnu",
          employee: rdv.employeeId
            ? `${rdv.employeeId.name} (${rdv.employeeId.role})`
            : rdv.coiffeur || "Employé inconnu",
          status: mapStatus(rdv.status || "PENDING"),
          origin: mapOrigin(rdv.source || "SALON"),
        }))

        setAppointments(formatted)
      } catch (error: any) {
        console.error("Erreur chargement RDV :", error)
        toast({
          title: "Erreur de chargement",
          description: error.message || "Impossible de récupérer les rendez-vous du jour.",
          variant: "destructive",
        })
        setAppointments([])
      } finally {
        setLoading(false)
      }
    }

    fetchRdvs()
  }, [token, toast])

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">Chargement des rendez-vous du jour...</p>
        </CardContent>
      </Card>
    )
  }

  if (appointments.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">Aucun rendez-vous prévu aujourd'hui.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Rendez-vous du jour ({appointments.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Version Desktop - Tableau scrollable */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left py-3 px-2 font-medium">Heure</th>
                <th className="text-left py-3 px-2 font-medium">Client</th>
                <th className="text-left py-3 px-2 font-medium">Service</th>
                <th className="text-left py-3 px-2 font-medium">Employé(e)</th>
                <th className="text-left py-3 px-2 font-medium">Statut</th>
                <th className="text-left py-3 px-2 font-medium">Origine</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt._id} className="border-b hover:bg-muted/30">
                  <td className="py-4 px-2 font-medium">{apt.time}</td>
                  <td className="py-4 px-2">{apt.client}</td>
                  <td className="py-4 px-2">{apt.service}</td>
                  <td className="py-4 px-2">{apt.employee}</td>
                  <td className="py-4 px-2">
                    <Badge className={statusConfig[apt.status].color}>
                      {statusConfig[apt.status].label}
                    </Badge>
                  </td>
                  <td className="py-4 px-2">
                    {apt.origin === "online" ? (
                      <div className="flex items-center gap-1 text-blue-600">
                        <Globe className="w-4 h-4" />
                        <span className="text-xs">En ligne</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-gray-600">
                        <Store className="w-4 h-4" />
                        <span className="text-xs">Au salon</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Version Mobile - Cards */}
        <div className="md:hidden space-y-4">
          {appointments.map((apt) => (
            <div key={apt._id} className="border rounded-lg p-4 bg-card">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold text-lg">{apt.time}</p>
                  <p className="font-medium">{apt.client}</p>
                  <p className="text-sm text-muted-foreground mt-1">{apt.service}</p>
                </div>
                <Badge className={statusConfig[apt.status].color}>
                  {statusConfig[apt.status].label}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <p><strong>Employé(e) :</strong> {apt.employee}</p>
                <div className="flex items-center gap-2">
                  <strong>Origine :</strong>
                  {apt.origin === "online" ? (
                    <div className="flex items-center gap-1 text-blue-600">
                      <Globe className="w-4 h-4" />
                      <span>En ligne</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-gray-600">
                      <Store className="w-4 h-4" />
                      <span>Au salon</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}