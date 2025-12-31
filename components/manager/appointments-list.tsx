"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe, Store } from "lucide-react"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/lib/auth-store"

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

const mapStatus = (status: string): Appointment["status"] => {
  switch (status.toUpperCase()) {
    case "CONFIRMED":
      return "confirmed"
    case "PENDING":
    case "ARRIVED":
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

  // Récupération propre du token via ton store
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
            "Content-Type": "application/json",
          },
        })

        // Gestion d’erreur si pas 200
        if (!res.ok) {
          const data = await res.json()
          // console.error("Réponse erreur RDV :", res.status, text.substring(0, 300))
          // throw new Error(`Erreur ${res.status} : Impossible de charger les rendez-vous`)
        }

        const data = await res.json()

        if (!Array.isArray(data)) {
          console.warn("Données RDV inattendues :", data)
          setAppointments([])
          return
        }

        const formatted: Appointment[] = data.map((rdv: any) => ({
          id: rdv._id || rdv.id,
          time: rdv.time || "Heure inconnue",
          client: rdv.clientId
            ? `${rdv.clientId.prenom || ""} ${rdv.clientId.nom || ""}`.trim() || "Client inconnu"
            : "Client inconnu",
          service: rdv.service || rdv.serviceId?.nom || "Service inconnu",
          stylist: rdv.coiffeur || rdv.employee || "-",
          status: mapStatus(rdv.status || "CONFIRMED"),
          origin: mapOrigin(rdv.source || "INSTORE"),
        }))

        setAppointments(formatted)
      } catch (error: any) {
        console.error("Erreur chargement RDV", error)
        toast({
          title: "Erreur de chargement",
          description: error.message || "Impossible de récupérer les rendez-vous.",
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
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Chargement des rendez-vous...</p>
        </CardContent>
      </Card>
    )
  }

  if (appointments.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Aucun rendez-vous pour le moment.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Liste des rendez-vous</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Version Desktop */}
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

        {/* Version Mobile */}
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