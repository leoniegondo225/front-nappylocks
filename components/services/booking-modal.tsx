"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Clock, User, Mail, Phone } from "lucide-react"

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  service: {
    name: string
    duration: string
    price: string
  }
}

export function BookingModal({ isOpen, onClose, service }: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState("")

  const availableTimeSlots = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle booking submission
    alert("Réservation confirmée!")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Réserver: {service.name}</DialogTitle>
          <DialogDescription className="text-base">
            Durée: {service.duration} • Prix: {service.price}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Personal Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-base mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Nom complet
              </Label>
              <Input id="name" placeholder="Votre nom" required className="h-12" />
            </div>

            <div>
              <Label htmlFor="email" className="text-base mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input id="email" type="email" placeholder="votre@email.com" required className="h-12" />
            </div>

            <div>
              <Label htmlFor="phone" className="text-base mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Téléphone
              </Label>
              <Input id="phone" type="tel" placeholder="+33 6 12 34 56 78" required className="h-12" />
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <Label className="text-base mb-3 block">Choisir une date</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date() || date.getDay() === 0}
              className="rounded-md border w-full"
            />
          </div>

          {/* Time Selection */}
          <div>
            <Label className="text-base mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Horaire disponible
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {availableTimeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTime(time)}
                  className={`p-3 text-sm border rounded-md transition-colors ${
                    selectedTime === time
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background hover:bg-muted"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-12 bg-transparent">
              Annuler
            </Button>
            <Button type="submit" className="flex-1 h-12" disabled={!selectedDate || !selectedTime}>
              Confirmer la réservation
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
