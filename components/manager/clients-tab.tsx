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
import { 
  Search, 
  Plus, 
  Edit2, 
  Phone, 
  Mail, 
  User, 
  Eye,
  Calendar 
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/lib/auth-store"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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
  createdAt?: string
  updatedAt?: string
  salonId?: { _id: string; nom: string }
}

interface PrestationItem {
  _id: string
  name: string
  prices: number[]
  isActive: boolean
}

interface Employee {
  _id: string
  name: string
  role: string
  status: "active" | "inactive" | "vacation"
}

interface PrestationRealisee {
  _id: string
  date: string
  price: number
  notes?: string
  prestationId: {
    _id: string
    name: string
    prices: number[]
  }
  employeeId: {
    _id: string
    name: string
    role: string
  }
}

export function ClientsTab() {
  const { toast } = useToast()
  const [clients, setClients] = useState<Client[]>([])
  const [prestations, setPrestations] = useState<PrestationItem[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [loadingEmployees, setLoadingEmployees] = useState(true)

  // Modal détails client + prestations
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedClientDetails, setSelectedClientDetails] = useState<Client | null>(null)
  const [clientPrestations, setClientPrestations] = useState<PrestationRealisee[]>([])
  const [loadingClientPrestations, setLoadingClientPrestations] = useState(false)

  const user = useAuthStore((state) => state.user)
  const isSuperAdmin = user?.role === "superadmin"
  const canEdit = !isSuperAdmin

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPrestationDialogOpen, setIsPrestationDialogOpen] = useState(false)

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

  const formatDateTime = (date?: string) => {
    if (!date) return "—"
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Chargement des données
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const token = useAuthStore.getState().token
        if (!token) throw new Error("Utilisateur non authentifié")

        const [clientsRes, prestationsRes, employeesRes] = await Promise.all([
          fetch("http://localhost:3500/api/allclient", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:3500/api/allprestations", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:3500/api/getallemployee", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        if (!clientsRes.ok || !prestationsRes.ok || !employeesRes.ok) {
          throw new Error("Erreur lors du chargement des données")
        }

        const [clientsData, prestationsData, employeesData] = await Promise.all([
          clientsRes.json(),
          prestationsRes.json(),
          employeesRes.json(),
        ])

        setClients(Array.isArray(clientsData) ? clientsData : [])
        setPrestations(
          Array.isArray(prestationsData)
            ? prestationsData.filter((p: PrestationItem) => p.isActive)
            : []
        )
        setEmployees(Array.isArray(employeesData) ? employeesData : [])
      } catch (error: any) {
        toast({
          title: "Erreur de chargement",
          description: error.message || "Impossible de récupérer les données.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
        setLoadingEmployees(false)
      }
    }

    fetchData()
  }, [toast])

  // Ouvrir le modal détails et charger les prestations du client
  const openDetailsModal = async (client: Client) => {
    setSelectedClientDetails(client)
    setIsDetailsDialogOpen(true)
    setLoadingClientPrestations(true)
    setClientPrestations([])

    try {
      const token = useAuthStore.getState().token
      const res = await fetch(`http://localhost:3500/api/prestations/client/${client._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setClientPrestations(Array.isArray(data) ? data : [])
      } else {
        setClientPrestations([])
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les prestations du client",
        variant: "destructive",
      })
      setClientPrestations([])
    } finally {
      setLoadingClientPrestations(false)
    }
  }

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

    const token = useAuthStore.getState().token

    try {
      const res = await fetch(`http://localhost:3500/api/updateclient/${selectedClient._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(selectedClient),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Erreur mise à jour")
      }

      const refreshRes = await fetch("http://localhost:3500/api/allclient", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!refreshRes.ok) {
        throw new Error("Erreur lors du rafraîchissement de la liste")
      }

      const freshClients = await refreshRes.json()
      setClients(Array.isArray(freshClients) ? freshClients : [])

      toast({ title: "Succès", description: "Client mis à jour avec succès" })
      setIsEditDialogOpen(false)
      setSelectedClient(null)
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le client.",
        variant: "destructive",
      })
    }
  }

  const openPrestationModal = (client: Client) => {
    setPrestationClient(client)
    setPrestationForm({ serviceId: "", employee: "", price: "", notes: "" })
    setIsPrestationDialogOpen(true)
  }

  const selectedPrestation = prestations.find((p) => p._id === prestationForm.serviceId)

  useEffect(() => {
    if (selectedPrestation && selectedPrestation.prices.length > 0) {
      setPrestationForm((prev) => ({ ...prev, price: selectedPrestation.prices[0].toString() }))
    } else {
      setPrestationForm((prev) => ({ ...prev, price: "" }))
    }
  }, [selectedPrestation])

  const handleAddPrestation = async () => {
    if (!prestationClient || !prestationForm.serviceId || !prestationForm.employee) {
      toast({ title: "Erreur", description: "Prestation et employé obligatoires.", variant: "destructive" })
      return
    }

    try {
      const token = useAuthStore.getState().token

      const prestationRes = await fetch("http://localhost:3500/api/createprestation", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          clientId: prestationClient._id,
          serviceId: prestationForm.serviceId,
          employee: prestationForm.employee,
          price: Number(prestationForm.price || 0),
          notes: prestationForm.notes,
          date: new Date().toISOString().split("T")[0],
        }),
      })

      if (!prestationRes.ok) {
        const err = await prestationRes.json()
        throw new Error(err.message || "Échec création prestation")
      }

      const updatedClient = {
        ...prestationClient,
        totalVisits: prestationClient.totalVisits + 1,
        totalSpent: prestationClient.totalSpent + Number(prestationForm.price || 0),
        lastVisit: new Date().toISOString().split("T")[0],
      }

      const clientRes = await fetch(`http://localhost:3500/api/updateclient/${prestationClient._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updatedClient),
      })

      if (!clientRes.ok) {
        const err = await clientRes.json()
        throw new Error(err.message || "Erreur mise à jour client")
      }

      const clientUpdated: Client = await clientRes.json()
      setClients(clients.map((c) => (c._id === clientUpdated._id ? clientUpdated : c)))

      toast({
        title: "Prestation enregistrée !",
        description: `${selectedPrestation?.name} — ${prestationForm.price} FCFA`,
      })

      setIsPrestationDialogOpen(false)
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message || "Échec enregistrement prestation.", variant: "destructive" })
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
      {isSuperAdmin && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-amber-800 dark:text-amber-200 font-medium flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Mode SuperAdmin : Vue globale de tous les salons (lecture seule)
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestion des Clients</h2>
          <p className="text-muted-foreground">
            {clients.length} client{clients.length > 1 ? "s" : ""} enregistré{clients.length > 1 ? "s" : ""}
          </p>
        </div>
        {canEdit && (
          <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Nouveau client
          </Button>
        )}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom, téléphone ou email..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Mobile */}
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
                    {isSuperAdmin && client.salonId && (
                      <span className="block text-xs text-muted-foreground">
                        Salon : {client.salonId.nom || "Inconnu"}
                      </span>
                    )}
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
              <div className="text-xs text-muted-foreground space-y-1">
                <div>{client.createdBy ? `Par ${client.createdBy.username}` : "—"}</div>
                <div>Créé le {formatDateTime(client.createdAt)}</div>
              </div>
              <div className="flex gap-3">
                {/* Icône œil pour voir les détails */}
                <Button size="sm" variant="outline" onClick={() => openDetailsModal(client)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Voir
                </Button>

                {canEdit && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => openEditModal(client)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                    <Button size="sm" variant="default" onClick={() => openPrestationModal(client)}>
                      Nouvelle prestation
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop */}
      <div className="hidden md:block rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/70">
              <tr>
                <th className="text-left px-6 py-4 font-medium">Client</th>
                <th className="text-left px-6 py-4 font-medium">Contact</th>
                <th className="text-center px-6 py-4 font-medium">Statut</th>
                <th className="text-left px-6 py-4 font-medium">Créé par</th>
                <th className="text-left px-6 py-4 font-medium">Créé le</th>
                {isSuperAdmin && <th className="text-left px-6 py-4 font-medium">Salon</th>}
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
                  <td className="px-6 py-5 text-muted-foreground text-sm">
                    {formatDateTime(client.createdAt)}
                  </td>
                  {isSuperAdmin && (
                    <td className="px-6 py-5 text-muted-foreground text-sm">
                      {client.salonId?.nom || "—"}
                    </td>
                  )}
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-3">
                      {/* Icône œil pour voir les détails */}
                      <Button size="sm" variant="ghost" onClick={() => openDetailsModal(client)}>
                        <Eye className="w-4 h-4" />
                      </Button>

                      {canEdit && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => openEditModal(client)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Modifier
                          </Button>
                          <Button size="sm" variant="default" onClick={() => openPrestationModal(client)}>
                            Nouvelle prestation
                          </Button>
                        </>
                      )}
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

      {/* Modal Détails Client + Prestations */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Détails du client — {selectedClientDetails?.prenom} {selectedClientDetails?.nom}
            </DialogTitle>
          </DialogHeader>

          {selectedClientDetails && (
            <div className="space-y-8 py-4">
              {/* Infos générales du client */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-3">
                  <div><strong>Téléphone :</strong> {selectedClientDetails.telephone}</div>
                  <div><strong>Email :</strong> {selectedClientDetails.email || "—"}</div>
                  <div><strong>Total visites :</strong> {selectedClientDetails.totalVisits}</div>
                  <div><strong>Total dépensé :</strong> {selectedClientDetails.totalSpent} FCFA</div>
                </div>
                <div className="space-y-3">
                  <div><strong>Dernière visite :</strong> {formatDateTime(selectedClientDetails.lastVisit)}</div>
                  <div><strong>Inscrit le :</strong> {formatDateTime(selectedClientDetails.createdAt)}</div>
                  <div><strong>Créé par :</strong> {selectedClientDetails.createdBy?.username || "—"}</div>
                  {selectedClientDetails.notes && (
                    <div><strong>Notes :</strong> <span className="text-muted-foreground">{selectedClientDetails.notes}</span></div>
                  )}
                </div>
              </div>

              {/* Historique des prestations */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Historique des prestations ({clientPrestations.length})
                </h3>

                {loadingClientPrestations ? (
                  <p className="text-center text-muted-foreground py-8">Chargement des prestations...</p>
                ) : clientPrestations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Aucune prestation enregistrée pour ce client</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Prestation</TableHead>
                          <TableHead>Prix</TableHead>
                          <TableHead>Employé</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clientPrestations.map((p) => (
                          <TableRow key={p._id}>
                            <TableCell className="whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                {formatDateTime(p.date)}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{p.prestationId.name}</TableCell>
                            <TableCell>{p.price} FCFA</TableCell>
                            <TableCell>{p.employeeId.name} ({p.employeeId.role})</TableCell>
                            <TableCell className="text-muted-foreground max-w-xs truncate">
                              {p.notes || "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                  {prestations.map((presta) => (
                    <SelectItem key={presta._id} value={presta._id}>
                      <div className="flex justify-between items-center w-full">
                        <span>{presta.name}</span>
                        <span className="text-muted-foreground ml-6">
                          {presta.prices.length > 1
                            ? `${presta.prices[0]} - ${presta.prices[presta.prices.length - 1]} FCFA`
                            : `${presta.prices[0]} FCFA`}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPrestation && (
              <div className="p-4 bg-muted/60 rounded-lg text-sm">
                Prix par défaut : <strong>{selectedPrestation.prices[0]} FCFA</strong>
                {selectedPrestation.prices.length > 1 && (
                  <span> (plage : {selectedPrestation.prices[0]} à {selectedPrestation.prices[selectedPrestation.prices.length - 1]} FCFA)</span>
                )}
              </div>
            )}

            <div>
              <Label>Employé(e)</Label>
              <Select value={prestationForm.employee} onValueChange={(v) => setPrestationForm({ ...prestationForm, employee: v })}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingEmployees ? "Chargement du personnel..." : "Sélectionner un employé..."} />
                </SelectTrigger>
                <SelectContent>
                  {employees.length === 0 ? (
                    <SelectItem disabled value="none">
                      Aucun employé disponible
                    </SelectItem>
                  ) : (
                    employees.map((emp) => (
                      <SelectItem key={emp._id} value={emp._id}>
                        {emp.name} — {emp.role}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Prix facturé (FCFA)</Label>
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