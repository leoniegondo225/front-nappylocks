"use client"

import { useState } from "react"
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

export interface Booking {
  id: string
  clientName: string
  clientEmail?: string
  service: string
  salonName: string
  date: string
  time: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  price: number
}

interface BookingsTabProps {
  bookings: Booking[]
  onUpdateStatus: (id: string, status: Booking["status"]) => void
}

export function BookingsTab({ bookings, onUpdateStatus }: BookingsTabProps) {
  const [bookingFilter, setBookingFilter] = useState<string>("all")

  const filteredBookings = bookings.filter((b) => bookingFilter === "all" || b.status === bookingFilter)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmée"
      case "completed":
        return "Terminée"
      case "pending":
        return "En attente"
      case "cancelled":
        return "Annulée"
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestion des réservations</CardTitle>
              <CardDescription>Vue d'ensemble de toutes les réservations</CardDescription>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Salon</TableHead>
                <TableHead>Date & Heure</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{b.clientName}</p>
                      <p className="text-sm text-muted-foreground">{b.clientEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>{b.service}</TableCell>
                  <TableCell>{b.salonName}</TableCell>
                  <TableCell>
                    <div>
                      <p>{new Date(b.date).toLocaleDateString("fr-FR")}</p>
                      <p className="text-sm text-muted-foreground">{b.time}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">€{b.price}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(b.status)}>{getStatusLabel(b.status)}</Badge>
                  </TableCell>
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
                        <DropdownMenuItem onClick={() => onUpdateStatus(b.id, "confirmed")}>Confirmer</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onUpdateStatus(b.id, "completed")}>
                          Marquer comme terminée
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onUpdateStatus(b.id, "cancelled")}
                          className="text-destructive"
                        >
                          Annuler
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
