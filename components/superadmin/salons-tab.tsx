"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Mail, MapPin, Phone, Plus } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import type { User } from "@/lib/auth-store"
import { useAuthSafe } from "@/hooks/useAuthSafe"
import { useToast } from "@/hooks/use-toast"

// Type Salon SANS gérant
export interface Salon {
  _id?: string
  nom: string
  address: string
  ville: string
  pays: string
  telephone: string
  email: string
  status: "active" | "inactive"
  createdAt: string
}

interface SalonsTabProps {
  users: User[]
  salons?: Salon[]
  onSalonCreated?: (salon: Salon) => void
}

export function SalonsTab({ salons: externalSalons = [], onSalonCreated }: SalonsTabProps) {
  const [salons, setSalons] = useState<Salon[]>(externalSalons)

  const [newSalon, setNewSalon] = useState({
    nom: "",
    address: "",
    ville: "",
    pays: "",
    telephone: "",
    email: "",
  })

  const { toast } = useToast()
  const { token } = useAuthSafe()

  // Charger tous les salons
  useEffect(() => {
    const loadSalons = async () => {
      try {
        const res = await fetch("http://localhost:3500/api/getallsalons", {
          headers: { Authorization: `Bearer ${token}` }
        })

        const data = await res.json()
        if (res.ok) setSalons(data)
      } catch (err) {
        console.log("Erreur chargement salons :", err)
      }
    }

    if (token) loadSalons()
  }, [token])

  // Sync si parent met à jour la liste
  useEffect(() => {
    if (externalSalons.length > 0) {
      setSalons(externalSalons)
    }
  }, [externalSalons])

  // Création d’un salon (SANS gérant)
  const handleAddSalon = async () => {
    if (!newSalon.nom.trim()) {
      toast({ title: "Erreur", description: "Le nom du salon est obligatoire", variant: "destructive" })
      return
    }

    try {
      const res = await fetch("http://localhost:3500/api/salons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newSalon,
          status: "inactive",
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message || "Échec de la création du salon")

      const createdSalon: Salon = data.salon

      setSalons(prev => [...prev, createdSalon])
      onSalonCreated?.(createdSalon)

      toast({ title: "Succès", description: "Salon créé avec succès !" })

      setNewSalon({ nom: "", address: "", ville: "", pays: "", telephone: "", email: "" })
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" })
    }
  }

  // Toggle statut
  const toggleSalonStatus = async (salonId: string, newStatus: "active" | "inactive") => {
    try {
      const res = await fetch(`http://localhost:3500/api/salons/${salonId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error("Impossible de mettre à jour le statut")

      setSalons(prev =>
        prev.map(s => s._id === salonId ? { ...s, status: newStatus } : s)
      )

      toast({
        title: "Succès",
        description: `Salon passé en ${newStatus === "active" ? "actif" : "inactif"}`,
      })
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message,
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status: "active" | "inactive") => (
    <Badge variant={status === "active" ? "default" : "secondary"}>
      {status === "active" ? "Actif" : "Inactif"}
    </Badge>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des salons</h2>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un salon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ajouter un salon</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label>Nom du salon *</Label>
                <Input
                  value={newSalon.nom}
                  onChange={e => setNewSalon(s => ({ ...s, nom: e.target.value }))}
                />
              </div>
              <div>
                <Label>Adresse</Label>
                <Input
                  value={newSalon.address}
                  onChange={e => setNewSalon(s => ({ ...s, address: e.target.value }))}
                />
              </div>
              <div>
                <Label>Ville</Label>
                <Input
                  value={newSalon.ville}
                  onChange={e => setNewSalon(s => ({ ...s, ville: e.target.value }))}
                />
              </div>
              <div>
                <Label>Pays</Label>
                <Input
                  value={newSalon.pays}
                  onChange={e => setNewSalon(s => ({ ...s, pays: e.target.value }))}
                />
              </div>
              <div>
                <Label>Téléphone</Label>
                <Input
                  value={newSalon.telephone}
                  onChange={e => setNewSalon(s => ({ ...s, telephone: e.target.value }))}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newSalon.email}
                  onChange={e => setNewSalon(s => ({ ...s, email: e.target.value }))}
                />
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleAddSalon}>Créer le salon</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* LISTE DES SALONS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {salons.length === 0 ? (
          <p className="text-center text-muted-foreground col-span-full py-12">
            Aucun salon enregistré
          </p>
        ) : (
          salons.map(salon => (
            <Card key={salon._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg truncate">{salon.nom}</h3>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(salon.status)}
                    <Switch
                      checked={salon.status === "active"}
                      onCheckedChange={checked =>
                        toggleSalonStatus(salon._id!, checked ? "active" : "inactive")
                      }
                    />
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{salon.address}, {salon.ville}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{salon.telephone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{salon.email}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                  Créé le {new Date(salon.createdAt).toLocaleDateString("fr-FR")}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
