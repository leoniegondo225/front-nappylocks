"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreVertical } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/lib/auth-store"
interface CreatedBy {
  _id: string
  username: string
}

interface Booking {
  _id: string
  clientName: string
  clientEmail?: string
  service: string          // on garde "service" pour compatibilité avec backend
  salonName: string
  date: string
  time: string
  createdBy?: CreatedBy
  createdAt?: string        // ← Ajouté (grâce à timestamps: true)
  updatedAt?: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  price: number
}

export function BookingsTab() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [bookingFilter, setBookingFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  const { toast } = useToast()
  const token = useAuthStore((state) => state.token)

  useEffect(() => {
    const fetchBookings = async () => {
      if (!token) {
        toast({
          title: "Non authentifié",
          description: "Veuillez vous reconnecter",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const res = await fetch("http://localhost:3500/api/bookings/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          throw new Error(errorData.message || "Erreur lors du chargement des réservations")
        }

        const data: any[] = await res.json()

        const formatted = data.map((rdv) => ({
          _id: rdv._id,
          clientName: rdv.clientName || "Client inconnu",
          clientEmail: rdv.clientEmail,
          service: rdv.service || "Prestation inconnue",
          salonName: rdv.salonName || "Salon inconnu",
          date: rdv.date,
          time: rdv.time,
          status: (rdv.status?.toLowerCase?.() || "pending") as Booking["status"],
          price: Number(rdv.price) || 0,
            createdBy: rdv.createdBy
    ? {
        _id: rdv.createdBy._id,
        username: rdv.createdBy.username,
      }
    : undefined,

  createdAt: rdv.createdAt,
        }))

        setBookings(formatted)
        setFilteredBookings(formatted)
      } catch (error: any) {
        console.error("Erreur chargement réservations :", error)
        toast({
          title: "Erreur",
          description: error.message || "Impossible de récupérer les réservations",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [token, toast])

  useEffect(() => {
    if (bookingFilter === "all") {
      setFilteredBookings(bookings)
    } else {
      setFilteredBookings(bookings.filter((b) => b.status === bookingFilter))
    }
  }, [bookingFilter, bookings])
 const formatDateTime = (date?: string | null) => {
    if (!date) return "—"
    const parsed = new Date(date)
    if (isNaN(parsed.getTime())) return "—"
    return parsed.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }


  const handleUpdateStatus = async (id: string, newStatus: Booking["status"]) => {
    try {
      const res = await fetch(`http://localhost:3500/api/rdv/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus.toUpperCase() }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || "Échec de la mise à jour du statut")
      }

      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: newStatus } : b))
      )

      toast({
        title: "Succès",
        description: "Statut mis à jour",
      })
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || "Impossible de mettre à jour le statut",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: "bg-green-100 text-green-800",
      completed: "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
    }
    return colors[status] ?? "bg-gray-100 text-gray-800"
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      confirmed: "Confirmée",
      completed: "Terminée",
      pending: "En attente",
      cancelled: "Annulée",
    }
    return labels[status] ?? status
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Chargement des réservations...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Gestion des réservations</CardTitle>
              <CardDescription>Vue d'ensemble de toutes les réservations de la plateforme</CardDescription>
            </div>
            <Select value={bookingFilter} onValueChange={setBookingFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="confirmed">Confirmées</SelectItem>
                <SelectItem value="completed">Terminées</SelectItem>
                <SelectItem value="cancelled">Annulées</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {/* Version Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Prestation</TableHead>
                  <TableHead>Salon</TableHead>
                  <TableHead>Date & Heure</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Créé par</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Aucune réservation trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.clientName}</p>
                          {booking.clientEmail && (
                            <p className="text-sm text-muted-foreground">{booking.clientEmail}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{booking.service}</TableCell>
                      <TableCell>{booking.salonName}</TableCell>
                      <TableCell>
                        <div>
                          <p>{new Date(booking.date).toLocaleDateString("fr-FR")}</p>
                          <p className="text-sm text-muted-foreground">{booking.time}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {booking.price.toLocaleString("fr-FR")} FCFA
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(booking.status)}>
                          {getStatusLabel(booking.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{booking.createdBy ? `Par ${booking.createdBy.username}` : "—"}</TableCell>
                <TableCell>Créé le {formatDateTime(booking.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleUpdateStatus(booking._id, "confirmed")}>
                              Confirmer
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(booking._id, "completed")}>
                              Marquer comme terminée
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(booking._id, "cancelled")}
                              className="text-destructive"
                            >
                              Annuler
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Version Mobile */}
          <div className="md:hidden space-y-4">
            {filteredBookings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucune réservation trouvée
              </p>
            ) : (
              filteredBookings.map((booking) => (
                <Card key={booking._id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-bold">{booking.clientName}</p>
                        <p className="text-sm text-muted-foreground">{booking.service}</p>
                        <p className="text-sm text-muted-foreground">{booking.salonName}</p>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {getStatusLabel(booking.status)}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Date :</strong> {new Date(booking.date).toLocaleDateString("fr-FR")}
                      </p>
                      <p>
                        <strong>Heure :</strong> {booking.time}
                      </p>
                      <p>
                        <strong>Prix :</strong> {booking.price.toLocaleString("fr-FR")} FCFA
                      </p>
                      {booking.clientEmail && (
                        <p>
                          <strong>Email :</strong> {booking.clientEmail}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleUpdateStatus(booking._id, "confirmed")}>
                            Confirmer
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(booking._id, "completed")}>
                            Terminer
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateStatus(booking._id, "cancelled")}
                            className="text-destructive"
                          >
                            Annuler
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}