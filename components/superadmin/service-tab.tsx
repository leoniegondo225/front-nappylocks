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
import { Edit, Trash2, Scissors, Clock, Euro, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Category {
  _id?: string
  name: string
}

interface Prestation {
  _id?: string
  name: string
  categoryId: {
    _id?: string
    name: string
  }
  prices: number[]
  description?: string
  isActive: boolean
}

export function ServicesTab() {
  const { toast } = useToast()
  
  const [prestations, setPrestations] = useState<Prestation[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  
  // Formulaire nouvelle prestation
  const [newService, setNewService] = useState({
    name: "",
    categoryId: "", // on envoie le nom de la catégorie
    prices: [""],
    description: "",
  })
  
  // Formulaire nouvelle catégorie
  const [newCategoryName, setNewCategoryName] = useState("")
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)

  // Chargement initial
  useEffect(() => {
    fetchPrestations()
    fetchCategories()
  }, [])

  const fetchPrestations = async () => {
    try {
      const res = await fetch("http://localhost:3500/api/allprestations") // ajuste le chemin selon ta route
      if (res.ok) {
        const data = await res.json()
        setPrestations(data)
      }
    } catch (err) {
      toast({ title: "Erreur", description: "Impossible de charger les prestations", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:3500/api/allcategory") // tu devras créer cette route (GET toutes les catégories)
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddService = async () => {
    if (!newService.name || !newService.categoryId || newService.prices.length === 0) {
      toast({ title: "Erreur", description: "Champs obligatoires manquants", variant: "destructive" })
      return
    }

    try {
      const res = await fetch("http://localhost:3500/api/addprestation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newService.name,
          categoryId: newService.categoryId, // on envoie le nom
          prices: newService.prices.map((p) => Number(p)),
          description: newService.description || undefined,
        }),
      })

      if (res.ok) {
        const created = await res.json()
        setPrestations([created, ...prestations])
        toast({ title: "Succès", description: "Prestation ajoutée" })
        setNewService({ name: "", categoryId: "", prices: [""], description: "" })
      } else {
        const error = await res.json()
        toast({ title: "Erreur", description: error.error || "Échec de l'ajout", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Erreur", description: "Problème de connexion", variant: "destructive" })
    }
  }

  const handleDeleteService = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3500/api/putprestation/${id}`, { method: "DELETE" })
      if (res.ok) {
        setPrestations(prestations.filter(p => p._id !== id))
        toast({ title: "Supprimée", description: "Prestation supprimée" })
      }
    } catch (err) {
      toast({ title: "Erreur", description: "Échec de la suppression", variant: "destructive" })
    }
  }

  const handleToggleActive = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3500/api/toggleprestation/${id}/toggle`, { method: "PATCH" })
      if (res.ok) {
        const updated = await res.json()
        setPrestations(prestations.map(p => p._id === id ? updated : p))
      }
    } catch (err) {
      toast({ title: "Erreur", description: "Échec de la modification du statut", variant: "destructive" })
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return

    try {
      const res = await fetch("http://localhost:3500/api/addcategory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      })

      if (res.ok) {
        const created = await res.json()
        setCategories([...categories, created])
        toast({ title: "Catégorie créée", description: newCategoryName })
        setNewCategoryName("")
        setIsCategoryDialogOpen(false)
      } else {
        const error = await res.json()
        toast({ title: "Erreur", description: error.error || "Échec création catégorie", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Erreur", description: "Problème de connexion", variant: "destructive" })
    }
  }

  

  if (loading) {
    return <div className="text-center py-10">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold">Gestion des Prestations</h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          {prestations.filter(p => p.isActive).length} prestations actives sur {prestations.length}
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
              <Select value={newService.categoryId} onValueChange={(v) => setNewService({ ...newService, categoryId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat, index) => (
                    <SelectItem key={cat._id || `cat-${index}`} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="link" size="sm" className="mt-2 pl-0">
                    <Plus className="w-4 h-4 mr-1" />
                    Créer une nouvelle catégorie
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nouvelle catégorie</DialogTitle>
                    <DialogDescription>Créez une catégorie qui pourra être utilisée pour les prestations</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label htmlFor="catname">Nom de la catégorie</Label>
                      <Input
                        id="catname"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Ex: Extensions"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreateCategory}>Créer</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>


            <div>
  <Label>Prix (€) *</Label>
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
            const newPrices = [...newService.prices];
            newPrices[i] = e.target.value;
            setNewService({ ...newService, prices: newPrices });
          }}
          placeholder="50.00"
        />
      </div>
      {newService.prices.length > 1 && (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            const newPrices = newService.prices.filter((_, idx) => idx !== i);
            setNewService({ ...newService, prices: newPrices });
          }}
        >
          Supprimer
        </Button>
      )}
    </div>
  ))}
  <Button
    size="sm"
    variant="outline"
    onClick={() =>
      setNewService({ ...newService, prices: [...newService.prices, ""] })
    }
  >
    Ajouter un prix
  </Button>
</div>


            <div className="sm:col-span-2 lg:col-span-3">
              <Label htmlFor="description">Description</Label>
              <Textarea
                value={newService.description}
                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                placeholder="Description optionnelle..."
                rows={2}
              />
            </div>

            <div className="flex items-end">
              <Button onClick={handleAddService} className="w-full bg-cyan-500 hover:bg-cyan-600">
                Enregistrer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des prestations */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des prestations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prestation</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prestations.map((service,index) => (
                  <TableRow key={service._id || `service-${index}`}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{service.name}</p>
                        {service.description && <p className="text-sm text-muted-foreground">{service.description}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{service.categoryId.name}</Badge>
                    </TableCell>
                    
                    <TableCell>
  {service.prices.map((p, idx) => (
    <Badge key={idx} className="mr-1">€{p}</Badge>
  ))}
</TableCell>

                    <TableCell>
                      <Badge variant={service.isActive ? "default" : "secondary"} className={service.isActive ? "bg-green-500" : ""}>
                        {service.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleToggleActive(service._id!)}>
                          {service.isActive ? <Edit className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                          <span className="sr-only">Activer/Désactiver</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteService(service._id!)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Version mobile (simplifiée) */}
          <div className="md:hidden space-y-4">
            {prestations.map((service, index) => (
              <Card key={service._id || `service-mobile-${index}`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{service.name}</h3>
                      <Badge variant="outline" className="mt-1">{service.categoryId.name}</Badge>
                    </div>
                    <Badge variant={service.isActive ? "default" : "secondary"} className={service.isActive ? "bg-green-500" : ""}>
                      {service.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  {service.description && <p className="text-sm text-muted-foreground mb-3">{service.description}</p>}
                  <div className="flex justify-between mb-4">
                    
                    <div className="flex flex-wrap gap-1">
  {service.prices.map((p, idx) => (
    <Badge key={idx}>€{p}</Badge>
  ))}
</div>

                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleToggleActive(service._id!)}>
                      <Edit className="w-4 h-4 mr-2" />
                      {service.isActive ? "Désactiver" : "Activer"}
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleDeleteService(service._id!)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}