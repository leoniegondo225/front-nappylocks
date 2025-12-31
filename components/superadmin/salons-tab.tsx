"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Mail, MapPin, Phone, Plus, Edit2, Trash2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/lib/auth-store"

export interface Salon {
  _id: string
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
  salons: Salon[]
  onSalonCreated?: (salon: Salon) => void
  onStatusChanged?: (salonId: string, newStatus: "active" | "inactive") => void
  onSalonUpdated?: (salon: Salon) => void
  onSalonDeleted?: (salonId: string) => void
}

export function SalonsTab({
  salons,
  onSalonCreated,
  onStatusChanged,
  onSalonUpdated,
  onSalonDeleted,
}: SalonsTabProps) {
  const [newSalon, setNewSalon] = useState({
    nom: "",
    address: "",
    ville: "",
    pays: "",
    telephone: "",
    email: "",
  })

  const [editingSalon, setEditingSalon] = useState<Salon | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const { toast } = useToast()
  const { token } = useAuthStore()

  // Création d’un salon
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

      onSalonCreated?.(createdSalon)

      toast({ title: "Succès", description: "Salon créé avec succès !" })

      setNewSalon({ nom: "", address: "", ville: "", pays: "", telephone: "", email: "" })
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" })
    }
  }

  // Modification d’un salon
  const handleUpdateSalon = async () => {
    if (!editingSalon) return
    console.log("existe : ", editingSalon)

    try {
      const res = await fetch(`http://localhost:3500/api/salons/${editingSalon._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nom: editingSalon.nom,
          address: editingSalon.address,
          ville: editingSalon.ville,
          pays: editingSalon.pays,
          telephone: editingSalon.telephone,
          email: editingSalon.email,
          status: editingSalon.status,
        }),
      })

      const data = await res.json()
      console.log("data : ",data)

      if (!res.ok) throw new Error(data.message || "Échec de la mise à jour")

      const updatedSalon: Salon = data.salon

      onSalonUpdated?.(updatedSalon)
      toast({ title: "Succès", description: "Salon mis à jour avec succès !" })
      setEditingSalon(null)
      setEditDialogOpen(false)
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" })
    }
  }

  // Suppression d’un salon
  const handleDeleteSalon = async (salonId: string, salonName: string) => {
    try {
      const res = await fetch(`http://localhost:3500/api/deletesalons/${salonId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Échec de la suppression")
      }

      onSalonDeleted?.(salonId)
      toast({ title: "Succès", description: `Salon "${salonName}" supprimé avec succès !` })
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

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Impossible de mettre à jour le statut")
      }

      onStatusChanged?.(salonId, newStatus)
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
                  <h3 className="font-bold text-lg truncate pr-2">{salon.nom}</h3>
                  <div className="flex items-center gap-2">
                    {/* Bouton Modifier */}
                    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setEditingSalon(salon)
                            setEditDialogOpen(true)
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Modifier le salon</DialogTitle>
                        </DialogHeader>
                        {editingSalon && (
                          <div className="grid grid-cols-2 gap-4 py-4">
                            <div>
                              <Label>Nom du salon</Label>
                              <Input
                                value={editingSalon.nom}
                                onChange={e => setEditingSalon(s => ({ ...s!, nom: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label>Adresse</Label>
                              <Input
                                value={editingSalon.address}
                                onChange={e => setEditingSalon(s => ({ ...s!, address: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label>Ville</Label>
                              <Input
                                value={editingSalon.ville}
                                onChange={e => setEditingSalon(s => ({ ...s!, ville: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label>Pays</Label>
                              <Input
                                value={editingSalon.pays}
                                onChange={e => setEditingSalon(s => ({ ...s!, pays: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label>Téléphone</Label>
                              <Input
                                value={editingSalon.telephone}
                                onChange={e => setEditingSalon(s => ({ ...s!, telephone: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label>Email</Label>
                              <Input
                                type="email"
                                value={editingSalon.email}
                                onChange={e => setEditingSalon(s => ({ ...s!, email: e.target.value }))}
                              />
                            </div>
                          </div>
                        )}
                        <DialogFooter>
                          <Button onClick={handleUpdateSalon}>Enregistrer les modifications</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* Bouton Supprimer */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer le salon ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer <strong>{salon.nom}</strong> ?<br />
                            Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground"
                            onClick={() => handleDeleteSalon(salon._id, salon.nom)}
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    {getStatusBadge(salon.status)}
                    <Switch
                      checked={salon.status === "active"}
                      onCheckedChange={checked =>
                        toggleSalonStatus(salon._id, checked ? "active" : "inactive")
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