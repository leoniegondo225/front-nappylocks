"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Scissors, Euro, Plus, ToggleLeft, ToggleRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/lib/auth-store"

interface CategoryPrestation {
  _id: string
  name: string
}

interface Prestation {
  _id: string
  name: string
  categoryPrestationId: {
    _id: string
    name: string
  }
  prices: number[]
  description?: string
  isActive: boolean
}

export function ServicesTab() {
  const { toast } = useToast()
  const token = useAuthStore((state) => state.token)

  const [prestations, setPrestations] = useState<Prestation[]>([])
  const [categoriesprestation, setCategoriesprestation] = useState<CategoryPrestation[]>([])
  const [loading, setLoading] = useState(true)

  // États pour l'édition
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Formulaire partagé (création et édition)
  const [newService, setNewService] = useState({
    name: "",
    categoryprestationId: "",
    prices: [""],
    description: "",
  })

  // Formulaire nouvelle catégorie
  const [newCategoryprestationName, setNewCategoryprestationName] = useState("")
  const [isCategoryprestationDialogOpen, setIsCategoryprestationDialogOpen] = useState(false)

  // Chargement initial
  useEffect(() => {
    if (token) {
      fetchPrestations()
      fetchCategoriesprestation()
    }
  }, [token])

  const fetchPrestations = async () => {
    if (!token) return
    try {
      setLoading(true)
      const res = await fetch("http://localhost:3500/api/allprestations", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setPrestations(Array.isArray(data) ? data : [])
      } else {
        toast({ title: "Erreur", description: "Impossible de charger les prestations", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Erreur", description: "Problème de connexion", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const fetchCategoriesprestation = async () => {
    if (!token) return
    try {
      const res = await fetch("http://localhost:3500/api/prestation-categories", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        const cleaned = Array.isArray(data)
          ? data.filter((cat: any) => cat && cat._id && cat.name).map((cat: any) => ({ _id: cat._id, name: cat.name }))
          : []
        setCategoriesprestation(cleaned)
      } else {
        toast({ title: "Erreur", description: "Impossible de charger les catégories", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Erreur", description: "Problème de connexion", variant: "destructive" })
    }
  }

  const handleAddService = async () => {
    if (!newService.name.trim() || !newService.categoryprestationId) {
      toast({ title: "Erreur", description: "Nom et catégorie sont obligatoires", variant: "destructive" })
      return
    }

    const validPrices = newService.prices
      .map(p => p.trim())
      .filter(p => p !== "")
      .map(p => Number(p))

    if (validPrices.length === 0 || validPrices.some(p => isNaN(p) || p <= 0)) {
      toast({ title: "Erreur", description: "Au moins un prix positif requis", variant: "destructive" })
      return
    }

    try {
      const res = await fetch("http://localhost:3500/api/addprestation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newService.name.trim(),
          categoryPrestationId: newService.categoryprestationId,
          prices: validPrices,
          description: newService.description?.trim() || undefined,
        }),
      })

      if (res.ok) {
        await fetchPrestations()
        toast({ title: "Succès", description: "Prestation ajoutée avec succès" })
        setNewService({ name: "", categoryprestationId: "", prices: [""], description: "" })
      } else {
        const error = await res.json()
        toast({ title: "Erreur", description: error.error || error.message || "Échec de l'ajout", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Erreur", description: "Problème de connexion", variant: "destructive" })
    }
  }

  const handleEditService = (service: Prestation) => {
    setNewService({
      name: service.name,
      categoryprestationId: service.categoryPrestationId._id,
      prices: service.prices.map(p => String(p)),
      description: service.description || "",
    })
    setEditingServiceId(service._id)
    setIsEditMode(true)
    setIsEditDialogOpen(true)
  }

  const handleUpdateService = async () => {
    if (!editingServiceId) return

    const trimmedName = newService.name.trim()
    if (!trimmedName || !newService.categoryprestationId) {
      toast({ title: "Erreur", description: "Nom et catégorie obligatoires", variant: "destructive" })
      return
    }

    const validPrices = newService.prices
      .map(p => p.trim())
      .filter(p => p !== "")
      .map(p => Number(p))

    if (validPrices.length === 0 || validPrices.some(p => isNaN(p) || p <= 0)) {
      toast({ title: "Erreur", description: "Au moins un prix positif requis", variant: "destructive" })
      return
    }

    try {
      const res = await fetch(`http://localhost:3500/api/put-prestation/${editingServiceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: trimmedName,
          categoryPrestationId: newService.categoryprestationId,
          prices: validPrices,
          description: newService.description.trim() || undefined,
        }),
      })

      if (res.ok) {
        await fetchPrestations()
        toast({ title: "Succès", description: "Prestation modifiée avec succès" })
        setNewService({ name: "", categoryprestationId: "", prices: [""], description: "" })
        setIsEditMode(false)
        setEditingServiceId(null)
        setIsEditDialogOpen(false)
      } else {
        const error = await res.json()
        toast({ title: "Erreur", description: error.error || error.message || "Échec modification", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Erreur", description: "Problème de connexion", variant: "destructive" })
    }
  }

  const handleDeleteService = async (id: string) => {
    if (!confirm("Supprimer définitivement cette prestation ?")) return

    if (!token) {
      toast({ title: "Erreur", description: "Vous n'êtes pas authentifié", variant: "destructive" })
      return
    }

    try {
      const res = await fetch(`http://localhost:3500/api/delete-prestation/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        await fetchPrestations()
        toast({ title: "Supprimée", description: "Prestation supprimée avec succès" })
      } else {
        const error = await res.json()
        toast({ title: "Erreur", description: error.message || "Impossible de supprimer la prestation", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Erreur", description: "Problème de connexion", variant: "destructive" })
    }
  }

  // TOGGLE actif/inactif avec mise à jour optimiste (pas de rechargement complet)
  const handleToggleActive = async (id: string) => {
    if (!token) return

    // Mise à jour optimiste : change immédiatement l'état local
    const originalPrestations = [...prestations]
    setPrestations(prestations.map(p => 
      p._id === id ? { ...p, isActive: !p.isActive } : p
    ))

    try {
      const res = await fetch(`http://localhost:3500/api/toggleprestation/${id}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        // En cas d'erreur : rollback
        setPrestations(originalPrestations)
        toast({ title: "Erreur", description: "Échec de la modification du statut", variant: "destructive" })
      } else {
        toast({ title: "Succès", description: "Statut modifié" })
      }
    } catch (err) {
      // Rollback en cas d'erreur réseau
      setPrestations(originalPrestations)
      toast({ title: "Erreur", description: "Problème de connexion", variant: "destructive" })
    }
  }

  const handleCreateCategoryprestation = async () => {
    const name = newCategoryprestationName.trim()
    if (!name) {
      toast({ title: "Erreur", description: "Le nom est obligatoire", variant: "destructive" })
      return
    }

    try {
      const res = await fetch("http://localhost:3500/api/addcategory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      })

      if (res.ok) {
        await fetchCategoriesprestation()
        setNewCategoryprestationName("")
        setIsCategoryprestationDialogOpen(false)
        toast({ title: "Succès", description: `Catégorie "${name}" créée !` })
      } else {
        toast({ title: "Erreur", description: "Échec création catégorie", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Erreur", description: "Problème de connexion", variant: "destructive" })
    }
  }

  if (loading) {
    return <div className="text-center py-10 text-muted-foreground">Chargement des prestations...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold">Gestion des Prestations</h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          {prestations.filter(p => p.isActive).length} active(s) sur {prestations.length}
        </p>
      </div>

      {/* Formulaire ajout prestation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scissors className="w-5 h-5" />
            Nouvelle prestation
          </CardTitle>
          <CardDescription>Ajoutez un service à votre catalogue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                value={newService.name}
                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                placeholder="Ex: Tresses Africaines"
              />
            </div>

            <div>
              <Label>Catégorie *</Label>
              <div className="space-y-2">
                <Select
                  value={newService.categoryprestationId}
                  onValueChange={(v) => setNewService({ ...newService, categoryprestationId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une catégorie..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesprestation.length === 0 ? (
                      <SelectItem disabled value="none">
                        Aucune catégorie disponible
                      </SelectItem>
                    ) : (
                      categoriesprestation.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                <Dialog open={isCategoryprestationDialogOpen} onOpenChange={setIsCategoryprestationDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="link" size="sm" className="pl-0">
                      <Plus className="w-4 h-4 mr-1" />
                      Créer une nouvelle catégorie
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nouvelle catégorie</DialogTitle>
                      <DialogDescription>
                        Créez une catégorie pour organiser vos prestations
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label>Nom de la catégorie *</Label>
                        <Input
                          value={newCategoryprestationName}
                          onChange={(e) => setNewCategoryprestationName(e.target.value)}
                          placeholder="Ex: Tresses, Colorations, Soins..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCategoryprestationDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleCreateCategoryprestation}>Créer</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div>
              <Label>Prix (FCFA) *</Label>
              {newService.prices.map((p, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <div className="relative flex-1">
                    <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.01"
                      className="pl-10"
                      value={p}
                      onChange={(e) => {
                        const newPrices = [...newService.prices]
                        newPrices[i] = e.target.value
                        setNewService({ ...newService, prices: newPrices })
                      }}
                      placeholder="50.00"
                    />
                  </div>
                  {newService.prices.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setNewService({
                          ...newService,
                          prices: newService.prices.filter((_, idx) => idx !== i),
                        })
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                disabled={newService.prices.some(p => !p.trim()) || newService.prices[newService.prices.length - 1] === ""}
                onClick={() => setNewService({ ...newService, prices: [...newService.prices, ""] })}
              >
                + Prix
              </Button>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <Label>Description</Label>
              <Textarea
                value={newService.description}
                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                placeholder="Description optionnelle..."
                rows={3}
              />
            </div>

            <div className="flex items-end">
              <Button onClick={handleAddService} className="w-full bg-cyan-500 hover:bg-cyan-600">
                Enregistrer la prestation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de modification */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier la prestation</DialogTitle>
            <DialogDescription>Modifiez les informations de la prestation puis enregistrez.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-4">
            <div className="sm:col-span-2">
              <Label htmlFor="edit-name">Nom *</Label>
              <Input
                id="edit-name"
                value={newService.name}
                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                placeholder="Ex: Tresses Africaines"
              />
            </div>

            <div>
              <Label>Catégorie *</Label>
              <Select
                value={newService.categoryprestationId}
                onValueChange={(v) => setNewService({ ...newService, categoryprestationId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une catégorie..." />
                </SelectTrigger>
                <SelectContent>
                  {categoriesprestation.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Prix (FCFA) *</Label>
              {newService.prices.map((p, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <div className="relative flex-1">
                    <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.01"
                      className="pl-10"
                      value={p}
                      onChange={(e) => {
                        const newPrices = [...newService.prices]
                        newPrices[i] = e.target.value
                        setNewService({ ...newService, prices: newPrices })
                      }}
                      placeholder="50.00"
                    />
                  </div>
                  {newService.prices.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setNewService({
                          ...newService,
                          prices: newService.prices.filter((_, idx) => idx !== i),
                        })
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                disabled={newService.prices.some(p => !p.trim()) || newService.prices[newService.prices.length - 1] === ""}
                onClick={() => setNewService({ ...newService, prices: [...newService.prices, ""] })}
              >
                + Prix
              </Button>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <Label>Description</Label>
              <Textarea
                value={newService.description}
                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                placeholder="Description optionnelle..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false)
                setIsEditMode(false)
                setNewService({ name: "", categoryprestationId: "", prices: [""], description: "" })
              }}
            >
              Annuler
            </Button>
            <Button onClick={handleUpdateService} className="bg-cyan-500 hover:bg-cyan-600">
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Liste des prestations */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des prestations</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prestation</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prestations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Aucune prestation enregistrée
                    </TableCell>
                  </TableRow>
                ) : (
                  prestations.map((service) => (
                    <TableRow key={service._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{service.name}</p>
                          {service.description && <p className="text-sm text-muted-foreground">{service.description}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{service.categoryPrestationId.name}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {service.prices.map((p, i) => (
                            <Badge key={i} variant="secondary">
                              FCFA  {p}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={service.isActive ? "default" : "secondary"} className={service.isActive ? "bg-green-600" : ""}>
                          {service.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {/* Bouton Modifier */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditService(service)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>

                          {/* Bouton Activer/Désactiver */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActive(service._id)}
                            className={service.isActive ? "text-green-600" : "text-red-600"}
                          >
                            {service.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                          </Button>

                          {/* Bouton Supprimer */}
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteService(service._id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-5">
            {prestations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Aucune prestation enregistrée
              </div>
            ) : (
              prestations.map((service) => (
                <Card key={service._id} className="overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 pr-4">
                        <h3 className="font-bold text-lg text-foreground">{service.name}</h3>
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            {service.categoryPrestationId.name}
                          </Badge>
                        </div>
                      </div>
                      <Badge variant={service.isActive ? "default" : "secondary"} className={service.isActive ? "bg-green-600" : ""}>
                        {service.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    {service.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{service.description}</p>
                    )}

                    <div className="mb-5">
                      <Label className="text-xs text-muted-foreground">Prix</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {service.prices.map((p, i) => (
                          <Badge key={i} variant="secondary" className="font-medium">
                            FCFA {p}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Boutons d'action sur mobile */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Bouton Modifier */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEditService(service)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Modifier
                      </Button>

                      {/* Bouton Activer/Désactiver */}
                      <Button
                        variant="outline"
                        size="sm"
                        className={`flex-1 ${service.isActive ? "text-green-600 border-green-600" : "text-red-600 border-red-600"}`}
                        onClick={() => handleToggleActive(service._id)}
                      >
                        {service.isActive ? <ToggleRight className="w-4 h-4 mr-2" /> : <ToggleLeft className="w-4 h-4 mr-2" />}
                        {service.isActive ? "Désactiver" : "Activer"}
                      </Button>
                    </div>

                    {/* Bouton Supprimer */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 text-destructive border-destructive"
                      onClick={() => handleDeleteService(service._id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </Button>
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