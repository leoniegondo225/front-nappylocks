"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Mail, MapPin, Phone, Plus, User2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import type { User } from "@/lib/auth-store"
import { useAuthSafe } from "@/hooks/useAuthSafe"
import { useToast } from "@/hooks/use-toast"

// Type Salon unifié — compatible avec le dashboard et l'API
export interface Salon {
  _id?: string
  nom: string
  address: string
  ville: string
  pays: string
  telephone: string
  gerantId: string
  email: string
  status: "active" | "inactive"
  createdAt: string
}

interface SalonsTabProps {
  users: User[]
  salons?: Salon[]
  onSalonCreated?: (salon: Salon) => void
}

export function SalonsTab({ users, salons: externalSalons = [], onSalonCreated }: SalonsTabProps) {
  const [salons, setSalons] = useState<Salon[]>(externalSalons)
  const [newSalon, setNewSalon] = useState({
    nom: "",
    address: "",
    ville: "",
    pays: "",
    telephone: "",
    email: "",
    gerantId: ""
  })
const [managers, setManagers] = useState<User[]>([]);



  const { toast } = useToast()
  const { token } = useAuthSafe() // Token sécurisé, pas de bug au refresh



useEffect(() => {
  const fetchGerants = async () => {
    if (!token) return; // sécuriser l'appel

    try {
      const res = await fetch("http://localhost:3500/api/users/gerants", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erreur lors de la récupération des gérants");
      }

      const data = await res.json();
      // Remplir les managers pour le select
      setManagers(data);
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  fetchGerants();
}, [token]);



useEffect(() => {
  const loadSalons = async () => {
    try {
      const res = await fetch("http://localhost:3500/api/getallsalons", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await res.json()

      if (res.ok) setSalons(data)
    } catch (err) {
      console.log("Erreur chargement salons :", err)
    }
  }

  if (token) loadSalons()
}, [token])

  
  // Synchro avec le parent (dashboard)
  useEffect(() => {
    if (externalSalons.length > 0) {
      setSalons(externalSalons)
    }
  }, [externalSalons])

  const handleAddSalon = async () => {
    if (!newSalon.nom.trim()) {
      toast({ title: "Erreur", description: "Le nom du salon est obligatoire", variant: "destructive" })
      return
    }
    if (!newSalon.gerantId) {
      toast({ title: "Erreur", description: "Veuillez sélectionner un gérant", variant: "destructive" })
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
          status: "inactive" // ON FORCE INACTIF À LA CRÉATION !
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Échec de la création du salon")
      }

      const createdSalon: Salon = {
        _id: data.salon._id,
        nom: data.salon.nom,
        address: data.salon.address,
        ville: data.salon.ville,
        pays: data.salon.pays,
        telephone: data.salon.telephone,
        gerantId: data.salon.gerantId,
        email: data.salon.email,
        status: data.salon.status || "active",
        createdAt: data.salon.createdAt,
      }

      // Mise à jour locale + notification au dashboard
      setSalons(prev => [...prev, createdSalon])
      onSalonCreated?.(createdSalon)

      toast({ title: "Succès", description: "Salon créé avec succès !" })
      setNewSalon({ nom: "", address: "", ville: "", pays: "", telephone: "", email: "", gerantId: "" })
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Impossible de créer le salon", variant: "destructive" })
    }
  }
// NOUVELLE FONCTION : toggle status
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

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || "Impossible de mettre à jour le statut")
    }

    // Mise à jour locale
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
      description: err.message || "Échec de la mise à jour",
      variant: "destructive"
    })
    // Optionnel : rollback si tu veux
  }
}
  const getStatusBadge = (status: "active" | "inactive") => (
    <Badge variant={status === "active" ? "default" : "secondary"}>
      {status === "active" ? "Actif" : "Inactif"}
    </Badge>
  )

  const getStatusColor = (status: "active" | "inactive") =>
    status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"

 const getManagerName = (gerantId: string) =>
    managers.find(m => m._id === gerantId)?.username || "Gérant inconnu"
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
                  placeholder="NappyLocks Paris"
                />
              </div>
              <div>
                <Label>Adresse</Label>
                <Input
                  value={newSalon.address}
                  onChange={e => setNewSalon(s => ({ ...s, address: e.target.value }))}
                  placeholder="12 rue des Coiffeurs"
                />
              </div>
              <div>
                <Label>Ville</Label>
                <Input
                  value={newSalon.ville}
                  onChange={e => setNewSalon(s => ({ ...s, ville: e.target.value }))}
                  placeholder="Paris"
                />
              </div>
              <div>
                <Label>Pays</Label>
                <Input
                  value={newSalon.pays}
                  onChange={e => setNewSalon(s => ({ ...s, pays: e.target.value }))}
                  placeholder="France"
                />
              </div>
              <div>
                <Label>Téléphone</Label>
                <Input
                  value={newSalon.telephone}
                  onChange={e => setNewSalon(s => ({ ...s, telephone: e.target.value }))}
                  placeholder="01 23 45 67 89"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newSalon.email}
                  onChange={e => setNewSalon(s => ({ ...s, email: e.target.value }))}
                  placeholder="contact@paris.nappylocks.com"
                />
              </div>
              <div className="col-span-2">
                <Label>Gérant *</Label>
                <Select value={newSalon.gerantId} onValueChange={v => setNewSalon(s => ({ ...s, gerantId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un gérant" />
                  </SelectTrigger>
                  <SelectContent>
                    {managers.length === 0 ? (
                      <SelectItem value="none" disabled>Aucun gérant disponible</SelectItem>
                    ) : (
                      managers.map(m => (
                        <SelectItem key={m._id} value={m._id!}>
                          {m.username} ({m.email})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddSalon}>Créer le salon</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Liste des salons */}
      {/* Liste des salons - VERSION PROPRE & COMPACTE */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {salons.length === 0 ? (
          <p className="text-center text-muted-foreground col-span-full py-12">
            Aucun salon enregistré
          </p>
        ) : (
          salons.map((salon) => (
            <Card key={salon._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg truncate pr-2">{salon.nom}</h3>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(salon.status)}
                    <Switch
  checked={salon.status === "active"}
  onCheckedChange={(checked) =>
    toggleSalonStatus(salon._id!, checked ? "active" : "inactive")
  }
/>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{salon.address}, {salon.ville}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{salon.telephone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{salon.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User2 className="w-4 h-4" />
                    <span>{getManagerName(salon.gerantId)}</span>
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