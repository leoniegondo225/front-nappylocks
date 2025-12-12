"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Plus, Edit, Trash2, Phone, Mail, Scissors } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Client {
  _id?: string
  prenom: string
  nom: string
  email?: string
  telephone: string
  notes?: string
  totalVisits: number
  lastVisit: string
  totalSpent: number
}

interface Service {
  _id: string // ou id selon ton backend
  name: string
  price: number
  duration: number // en minutes
  isActive: boolean
}

export function ClientsTab() {
  const { toast } = useToast()
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  // Modals
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPrestationDialogOpen, setIsPrestationDialogOpen] = useState(false)

  // Formulaires
  const [clientForm, setClientForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    notes: ""
  })

  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [prestationClient, setPrestationClient] = useState<Client | null>(null)
  const [prestationForm, setPrestationForm] = useState({
    serviceId: "",
    employee: "",
    price: "",
    notes: ""
  })

  const employees = ["Amina", "Fatou", "Yasmine", "Sophie", "Lucas"]

  // Chargement clients + services
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, servicesRes] = await Promise.all([
          fetch("http://localhost:3500/api/allclient"),
          fetch("http://localhost:3500/api/allservices"), // À créer côté backend
        ])

        const clientsData: Client[] = await clientsRes.json()
        const servicesData: Service[] = await servicesRes.json()

        setClients(clientsData)
        setServices(servicesData.filter((s: Service) => s.isActive))
      } catch (error) {
        toast({ title: "Erreur", description: "Impossible de charger les données." })
      }
    }
    fetchData()
  }, [])

  // Filtrage
  const filteredClients = clients.filter(
    (c) =>
      `${c.prenom} ${c.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.telephone.includes(searchTerm)
  )

  const handleClientChange = (field: keyof typeof clientForm, value: string) => {
    setClientForm({ ...clientForm, [field]: value })
  }

  // Ajout client
  const handleAddClient = async () => {
    try {
      const res = await fetch("http://localhost:3500/api/createclient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientForm),
      })
      const newClient: Client = await res.json()
      setClients([...clients, newClient])
      toast({ title: "Client ajouté", description: `${newClient.prenom} ${newClient.nom} ajouté avec succès` })
      setClientForm({ prenom: "", nom: "", email: "", telephone: "", notes: "" })
      setIsAddDialogOpen(false)
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible d'ajouter le client." })
    }
  }

  // Suppression client
  const handleDeleteClient = async (id: string) => {
    try {
      await fetch(`http://localhost:3500/api/deleteclient/${id}`, { method: "DELETE" })
      setClients(clients.filter((c) => c._id !== id))
      toast({ title: "Client supprimé" })
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de supprimer le client." })
    }
  }

  // Édition client
  const openEditModal = (client: Client) => {
    setSelectedClient(client)
    setIsEditDialogOpen(true)
  }

  const handleUpdateClient = async () => {
    if (!selectedClient || !selectedClient._id) return
    try {
      const res = await fetch(`http://localhost:3500/api/updateclient/${selectedClient._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedClient),
      })
      const updatedClient: Client = await res.json()
      setClients(clients.map((c) => (c._id === updatedClient._id ? updatedClient : c)))
      toast({ title: "Client mis à jour", description: `${updatedClient.prenom} ${updatedClient.nom} modifié` })
      setIsEditDialogOpen(false)
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de mettre à jour le client." })
    }
  }

  // Nouvelle prestation
  const openPrestationModal = (client: Client) => {
    setPrestationClient(client)
    setPrestationForm({ serviceId: "", employee: "", price: "", notes: "" })
    setIsPrestationDialogOpen(true)
  }

  const selectedService = services.find((s) => s._id === prestationForm.serviceId)

  // Prix auto quand service choisi
  useEffect(() => {
    if (selectedService) {
      setPrestationForm((prev) => ({ ...prev, price: selectedService.price.toString() }))
    } else {
      setPrestationForm((prev) => ({ ...prev, price: "" }))
    }
  }, [selectedService])

  const handleAddPrestation = async () => {
    if (!prestationClient || !prestationForm.serviceId || !prestationForm.employee) {
      toast({ title: "Erreur", description: "Service et employé obligatoires." })
      return
    }

    try {
      // Optionnel : enregistrer la prestation dédiée
      await fetch("http://localhost:3500/api/createprestation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: prestationClient._id,
          serviceId: prestationForm.serviceId,
          employee: prestationForm.employee,
          price: Number(prestationForm.price || 0),
          notes: prestationForm.notes,
          date: new Date().toISOString().split("T")[0],
        }),
      })

      // Mise à jour client
      const updatedClient = {
        ...prestationClient,
        totalVisits: prestationClient.totalVisits + 1,
        totalSpent: prestationClient.totalSpent + Number(prestationForm.price || 0),
        lastVisit: new Date().toISOString().split("T")[0],
      }

      const res = await fetch(`http://localhost:3500/api/updateclient/${prestationClient._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedClient),
      })

      const clientUpdated: Client = await res.json()
      setClients(clients.map((c) => (c._id === clientUpdated._id ? clientUpdated : c)))

      toast({
        title: "Prestation enregistrée !",
        description: `${selectedService?.name} — ${prestationForm.price}€`,
      })

      setIsPrestationDialogOpen(false)
    } catch (error) {
      toast({ title: "Erreur", description: "Échec enregistrement prestation." })
    }
  }

  const getClientBadge = (visits: number) => {
    if (visits >= 15) return <Badge className="bg-yellow-500">⭐ VIP</Badge>
    if (visits >= 10) return <Badge className="bg-blue-500">💎 Fidèle</Badge>
    return <Badge variant="outline" className="bg-green-400">✨ Nouveau</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Gestion des Clients</h2>
          <p className="text-muted-foreground">{clients.length} clients enregistrés</p>
        </div>
        <Button className="bg-cyan-500 hover:bg-cyan-600" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Nouveau client
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Rechercher un client..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left p-4 font-medium">Client</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Téléphone</th>
                <th className="text-left p-4 font-medium hidden lg:table-cell">Email</th>
                <th className="text-left p-4 font-medium text-center">Visites</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredClients.map((client) => (
                <tr key={client._id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-cyan-500 flex items-center justify-center text-white font-semibold text-xs shrink-0">
                        {client.prenom[0].toUpperCase()}{client.nom[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {client.prenom} {client.nom}
                        </div>
                        <div className="text-xs text-muted-foreground md:hidden">
                          {client.telephone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      {client.telephone}
                    </span>
                  </td>
                  <td className="p-4 hidden lg:table-cell text-muted-foreground">
                    {client.email || "-"}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {getClientBadge(client.totalVisits)}
                      <span className="text-xs text-muted-foreground">({client.totalVisits})</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditModal(client)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => openPrestationModal(client)}
                      >
                        <Scissors className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteClient(client._id!)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {searchTerm ? "Aucun client trouvé" : "Aucun client enregistré"}
          </div>
        )}
      </div>

      {/* Modal Ajout Client */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader><DialogTitle>Nouveau client</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Prénom</Label><Input value={clientForm.prenom} onChange={(e) => handleClientChange("prenom", e.target.value)} /></div>
              <div><Label>Nom</Label><Input value={clientForm.nom} onChange={(e) => handleClientChange("nom", e.target.value)} /></div>
            </div>
            <div><Label>Téléphone</Label><Input value={clientForm.telephone} onChange={(e) => handleClientChange("telephone", e.target.value)} /></div>
            <div><Label>Email (facultatif)</Label><Input type="email" value={clientForm.email} onChange={(e) => handleClientChange("email", e.target.value)} /></div>
            <div><Label>Notes</Label><Textarea className="min-h-24" value={clientForm.notes} onChange={(e) => handleClientChange("notes", e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleAddClient}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Édition Client */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader><DialogTitle>Modifier le client</DialogTitle></DialogHeader>
          {selectedClient && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Prénom</Label><Input value={selectedClient.prenom} onChange={(e) => setSelectedClient({ ...selectedClient, prenom: e.target.value })} /></div>
                <div><Label>Nom</Label><Input value={selectedClient.nom} onChange={(e) => setSelectedClient({ ...selectedClient, nom: e.target.value })} /></div>
              </div>
              <div><Label>Téléphone</Label><Input value={selectedClient.telephone} onChange={(e) => setSelectedClient({ ...selectedClient, telephone: e.target.value })} /></div>
              <div><Label>Email (facultatif)</Label><Input type="email" value={selectedClient.email || ""} onChange={(e) => setSelectedClient({ ...selectedClient, email: e.target.value || undefined })} /></div>
              <div><Label>Notes</Label><Textarea className="min-h-24" value={selectedClient.notes || ""} onChange={(e) => setSelectedClient({ ...selectedClient, notes: e.target.value || undefined })} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleUpdateClient}>Mettre à jour</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Nouvelle Prestation */}
      <Dialog open={isPrestationDialogOpen} onOpenChange={setIsPrestationDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Nouvelle prestation — {prestationClient?.prenom} {prestationClient?.nom}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Prestation</Label>
              <Select value={prestationForm.serviceId} onValueChange={(v) => setPrestationForm({ ...prestationForm, serviceId: v })}>
                <SelectTrigger><SelectValue placeholder="Choisir une prestation..." /></SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service._id} value={service._id}>
                      <div className="flex justify-between">
                        <span>{service.name}</span>
                        <span className="text-muted-foreground ml-4">{service.price}€</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedService && (
              <div className="p-3 bg-muted rounded-md text-sm">
                Prix par défaut : <strong>{selectedService.price}€</strong> — Durée : <strong>{selectedService.duration} min</strong>
              </div>
            )}

            <div>
              <Label>Coiffeur/se</Label>
              <Select value={prestationForm.employee} onValueChange={(v) => setPrestationForm({ ...prestationForm, employee: v })}>
                <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                <SelectContent>
                  {employees.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Prix facturé (€)</Label>
              <Input
                type="number"
                value={prestationForm.price}
                onChange={(e) => setPrestationForm({ ...prestationForm, price: e.target.value })}
                placeholder="Prix automatique"
              />
              <p className="text-xs text-muted-foreground mt-1">Modifiable pour remise ou supplément</p>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                className="min-h-24"
                value={prestationForm.notes}
                onChange={(e) => setPrestationForm({ ...prestationForm, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPrestationDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleAddPrestation}>Enregistrer la prestation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}