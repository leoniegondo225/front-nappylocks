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
import { Search, Plus, Edit2, Phone, Mail, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/lib/auth-store"

interface CreatedBy {
  _id: string
  username: string
}

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
  createdBy?: CreatedBy
}

interface Service {
  _id: string
  name: string
  price: number
  duration: number
  isActive: boolean
}

export function ClientsTab() {
  const { toast } = useToast()
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const token = useAuthStore.getState().token
        if (!token) throw new Error("Utilisateur non authentifié")

        const [clientsRes, servicesRes] = await Promise.all([
          fetch("http://localhost:3500/api/allclient", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:3500/api/getAllservice", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        if (!clientsRes.ok || !servicesRes.ok) {
          throw new Error("Erreur lors du chargement des données")
        }

        const clientsData = await clientsRes.json()
        const servicesData = await servicesRes.json()

        setClients(Array.isArray(clientsData) ? clientsData : [])
        setServices(
          Array.isArray(servicesData)
            ? servicesData.filter((s: Service) => s.isActive)
            : []
        )
      } catch (error: any) {
        console.error("Erreur chargement données :", error)
        toast({
          title: "Erreur de chargement",
          description: error.message || "Impossible de récupérer les données.",
          variant: "destructive",
        })
        setClients([])
        setServices([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const safeClients = Array.isArray(clients) ? clients : []

  const filteredClients = safeClients.filter(
    (c) =>
      `${c.prenom} ${c.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.telephone.includes(searchTerm)
  )

  const handleClientChange = (field: keyof typeof clientForm, value: string) => {
    setClientForm({ ...clientForm, [field]: value })
  }

  const handleAddClient = async () => {
    const token = useAuthStore.getState().token
    if (!token) return
    try {
      const res = await fetch("http://localhost:3500/api/createclient", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(clientForm),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Erreur lors de l'ajout")
      }

      const result = await res.json()
      const newClient: Client = result.data

      setClients([...clients, newClient])
      toast({ title: "Succès", description: `${newClient.prenom} ${newClient.nom} ajouté avec succès` })

      setClientForm({ prenom: "", nom: "", email: "", telephone: "", notes: "" })
      setIsAddDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le client.",
        variant: "destructive",
      })
    }
  }

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

      if (!res.ok) throw new Error("Erreur mise à jour")

      const updatedClient: Client = await res.json()
      setClients(clients.map((c) => (c._id === updatedClient._id ? updatedClient : c)))
      toast({ title: "Client mis à jour", description: `${updatedClient.prenom} ${updatedClient.nom} modifié` })
      setIsEditDialogOpen(false)
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de mettre à jour le client.", variant: "destructive" })
    }
  }

  const openPrestationModal = (client: Client) => {
    setPrestationClient(client)
    setPrestationForm({ serviceId: "", employee: "", price: "", notes: "" })
    setIsPrestationDialogOpen(true)
  }

  const selectedService = services.find((s) => s._id === prestationForm.serviceId)

  useEffect(() => {
    if (selectedService) {
      setPrestationForm((prev) => ({ ...prev, price: selectedService.price.toString() }))
    } else {
      setPrestationForm((prev) => ({ ...prev, price: "" }))
    }
  }, [selectedService])

  const handleAddPrestation = async () => {
    if (!prestationClient || !prestationForm.serviceId || !prestationForm.employee) {
      toast({ title: "Erreur", description: "Service et employé obligatoires.", variant: "destructive" })
      return
    }

    try {
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

      if (!res.ok) throw new Error("Erreur mise à jour client")

      const clientUpdated: Client = await res.json()
      setClients(clients.map((c) => (c._id === clientUpdated._id ? clientUpdated : c)))

      toast({
        title: "Prestation enregistrée !",
        description: `${selectedService?.name} — ${prestationForm.price}€`,
      })

      setIsPrestationDialogOpen(false)
    } catch (error) {
      toast({ title: "Erreur", description: "Échec enregistrement prestation.", variant: "destructive" })
    }
  }

  const getClientBadge = (visits: number) => {
    if (visits >= 15) return <Badge className="bg-yellow-500 text-white">⭐ VIP</Badge>
    if (visits >= 10) return <Badge className="bg-blue-600 text-white">💎 Fidèle</Badge>
    if (visits >= 3) return <Badge className="bg-emerald-600 text-white">✓ Habitué</Badge>
    return <Badge variant="secondary">✨ Nouveau</Badge>
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        <p className="text-muted-foreground">Chargement des clients...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestion des Clients</h2>
          <p className="text-muted-foreground">{clients.length} client{clients.length > 1 ? "s" : ""} enregistré{clients.length > 1 ? "s" : ""}</p>
        </div>
        <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Nouveau client
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom, téléphone ou email..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Liste des clients - Cartes sur mobile */}
      <div className="grid gap-4 md:hidden">
        {filteredClients.map((client) => (
          <div key={client._id} className="rounded-lg border bg-card p-5 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {(client.prenom?.[0] || "?").toUpperCase()}{(client.nom?.[0] || "?").toUpperCase()}
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-lg">
                    {client.prenom} {client.nom}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    {client.telephone}
                  </div>
                  {client.email && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      {client.email}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                {getClientBadge(client.totalVisits)}
                <span className="text-xs text-muted-foreground">{client.totalVisits} visite{client.totalVisits > 1 ? "s" : ""}</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {client.createdBy ? `Par ${client.createdBy.username}` : "—"}
              </div>
              <div className="flex gap-3">
                <Button size="sm" variant="outline" onClick={() => openEditModal(client)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
                <Button size="sm" variant="default" onClick={() => openPrestationModal(client)}>
                  Nouvelle prestation
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tableau Desktop */}
      <div className="hidden md:block rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/70">
              <tr>
                <th className="text-left px-6 py-4 font-medium">Client</th>
                <th className="text-left px-6 py-4 font-medium">Contact</th>
                <th className="text-center px-6 py-4 font-medium">Statut</th>
                <th className="text-left px-6 py-4 font-medium">Créé par</th>
                <th className="text-right px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredClients.map((client) => (
                <tr key={client._id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold">
                        {(client.prenom?.[0] || "?").toUpperCase()}{(client.nom?.[0] || "?").toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{client.prenom} {client.nom}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        {client.telephone}
                      </div>
                      {client.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          {client.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex flex-col items-center gap-2">
                      {getClientBadge(client.totalVisits)}
                      <span className="text-xs text-muted-foreground">{client.totalVisits} visite{client.totalVisits > 1 ? "s" : ""}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-muted-foreground">
                    {client.createdBy ? client.createdBy.username : "—"}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-3">
                      <Button size="sm" variant="outline" onClick={() => openEditModal(client)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Modifier
                      </Button>
                      <Button size="sm" variant="default" onClick={() => openPrestationModal(client)}>
                        Nouvelle prestation
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <User className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>{searchTerm ? "Aucun client ne correspond à votre recherche" : "Aucun client enregistré pour le moment"}</p>
        </div>
      )}

      {/* Modal Ajout Client */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader><DialogTitle>Ajouter un nouveau client</DialogTitle></DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Prénom</Label>
                <Input value={clientForm.prenom} onChange={(e) => handleClientChange("prenom", e.target.value)} />
              </div>
              <div>
                <Label>Nom</Label>
                <Input value={clientForm.nom} onChange={(e) => handleClientChange("nom", e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input value={clientForm.telephone} onChange={(e) => handleClientChange("telephone", e.target.value)} />
            </div>
            <div>
              <Label>Email (facultatif)</Label>
              <Input type="email" value={clientForm.email} onChange={(e) => handleClientChange("email", e.target.value)} />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea className="min-h-32" value={clientForm.notes} onChange={(e) => handleClientChange("notes", e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleAddClient}>Enregistrer le client</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Édition Client */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader><DialogTitle>Modifier le client</DialogTitle></DialogHeader>
          {selectedClient && (
            <div className="grid gap-5 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Prénom</Label><Input value={selectedClient.prenom} onChange={(e) => setSelectedClient({ ...selectedClient, prenom: e.target.value })} /></div>
                <div><Label>Nom</Label><Input value={selectedClient.nom} onChange={(e) => setSelectedClient({ ...selectedClient, nom: e.target.value })} /></div>
              </div>
              <div><Label>Téléphone</Label><Input value={selectedClient.telephone} onChange={(e) => setSelectedClient({ ...selectedClient, telephone: e.target.value })} /></div>
              <div><Label>Email (facultatif)</Label><Input type="email" value={selectedClient.email || ""} onChange={(e) => setSelectedClient({ ...selectedClient, email: e.target.value || undefined })} /></div>
              <div><Label>Notes</Label><Textarea className="min-h-32" value={selectedClient.notes || ""} onChange={(e) => setSelectedClient({ ...selectedClient, notes: e.target.value || undefined })} /></div>
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
          <div className="grid gap-5 py-4">
            <div>
              <Label>Prestation</Label>
              <Select value={prestationForm.serviceId} onValueChange={(v) => setPrestationForm({ ...prestationForm, serviceId: v })}>
                <SelectTrigger><SelectValue placeholder="Choisir une prestation..." /></SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service._id} value={service._id}>
                      <div className="flex justify-between items-center">
                        <span>{service.name}</span>
                        <span className="text-muted-foreground ml-6">{service.price}€</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedService && (
              <div className="p-4 bg-muted/60 rounded-lg text-sm">
                Prix par défaut : <strong>{selectedService.price}€</strong> • Durée : <strong>{selectedService.duration} min</strong>
              </div>
            )}

            <div>
              <Label>Coiffeur/se</Label>
              <Select value={prestationForm.employee} onValueChange={(v) => setPrestationForm({ ...prestationForm, employee: v })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
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
              <p className="text-xs text-muted-foreground mt-2">Vous pouvez modifier pour une remise ou un supplément</p>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                className="min-h-32"
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