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
  Edit2, 
  Phone, 
  Mail, 
  User, 
  Calendar,
  DollarSign,
  Eye
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

/* ================= TYPES ================= */

interface CreatedBy {
  _id: string
  username: string
}

interface Service {
  _id: string
  name: string
  price: number
  duration: number
  isActive: boolean
}

interface Client {
  _id: string
  prenom: string
  nom: string
  email?: string
  telephone: string
  notes?: string
  totalVisits: number
  lastVisit?: string
  totalSpent: number
  createdBy?: CreatedBy
}

interface Employee {
  _id: string
  name: string
  role: string
}

interface PrestationRealisee {
  _id: string
  date: string
  price: number
  notes?: string
  serviceId: {
    _id: string
    name: string
    price: number
  }
  employee: string // nom de l'employé (comme dans ton ancien code)
}

/* ================= UTILS ================= */

const getClientBadge = (visits: number) => {
  if (visits >= 15) return <Badge className="bg-yellow-500 text-white">⭐ VIP</Badge>
  if (visits >= 10) return <Badge className="bg-blue-600 text-white">💎 Fidèle</Badge>
  if (visits >= 3) return <Badge className="bg-emerald-600 text-white">✓ Habitué</Badge>
  return <Badge variant="secondary">✨ Nouveau</Badge>
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "—"
  return new Date(dateString).toLocaleDateString("fr-FR")
}

/* ================= COMPONENT ================= */

export function ClientsTab() {
  const { toast } = useToast()
  const token = useAuthStore((state) => state.token)

  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  // Modal détails client + prestations
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedClientDetails, setSelectedClientDetails] = useState<Client | null>(null)
  const [clientPrestations, setClientPrestations] = useState<PrestationRealisee[]>([])
  const [loadingPrestations, setLoadingPrestations] = useState(false)

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPrestationDialogOpen, setIsPrestationDialogOpen] = useState(false)

  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [prestationClient, setPrestationClient] = useState<Client | null>(null)

  const [prestationForm, setPrestationForm] = useState({
    serviceId: "",
    employee: "",
    price: "",
    notes: "",
  })

  const employees = ["Amina", "Fatou", "Yasmine", "Sophie", "Lucas"]

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    if (!token) return

    const fetchData = async () => {
      setLoading(true)
      try {
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
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token, toast])

  /* ================= FILTER ================= */

  const filteredClients = clients.filter(
    (c) =>
      `${c.prenom} ${c.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.telephone.includes(searchTerm) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  /* ================= EDIT CLIENT ================= */

  const openEditModal = (client: Client) => {
    setSelectedClient({ ...client })
    setIsEditDialogOpen(true)
  }

  const handleUpdateClient = async () => {
    if (!selectedClient || !token) return

    try {
      const res = await fetch(
        `http://localhost:3500/api/updateclient/${selectedClient._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(selectedClient),
        }
      )

      if (!res.ok) throw new Error()

      const updated = await res.json()
      setClients((prev) =>
        prev.map((c) => (c._id === updated._id ? updated : c))
      )

      toast({ title: "Client mis à jour" })
      setIsEditDialogOpen(false)
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le client",
        variant: "destructive",
      })
    }
  }

  /* ================= PRESTATION ================= */

  const openPrestationModal = (client: Client) => {
    setPrestationClient(client)
    setPrestationForm({ serviceId: "", employee: "", price: "", notes: "" })
    setIsPrestationDialogOpen(true)
  }

  const selectedService = services.find(
    (s) => s._id === prestationForm.serviceId
  )

  useEffect(() => {
    if (selectedService) {
      setPrestationForm((p) => ({
        ...p,
        price: selectedService.price.toString(),
      }))
    }
  }, [selectedService])

  const handleAddPrestation = async () => {
    if (!prestationClient || !selectedService || !token) return

    const price = Number(prestationForm.price) || 0

    try {
      await fetch("http://localhost:3500/api/createprestation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clientId: prestationClient._id,
          serviceId: selectedService._id,
          employee: prestationForm.employee,
          price,
          notes: prestationForm.notes,
        }),
      })

      const updatedClient = {
        ...prestationClient,
        totalVisits: prestationClient.totalVisits + 1,
        totalSpent: prestationClient.totalSpent + price,
        lastVisit: new Date().toISOString(),
      }

      const res = await fetch(
        `http://localhost:3500/api/updateclient/${prestationClient._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedClient),
        }
      )

      const finalClient = await res.json()

      setClients((prev) =>
        prev.map((c) => (c._id === finalClient._id ? finalClient : c))
      )

      toast({ title: "Prestation enregistrée" })
      setIsPrestationDialogOpen(false)
    } catch {
      toast({
        title: "Erreur",
        description: "Échec de l'enregistrement",
        variant: "destructive",
      })
    }
  }

  /* ================= DETAILS MODAL ================= */

  const openDetails = async (client: Client) => {
    setSelectedClientDetails(client)
    setIsDetailsOpen(true)
    setLoadingPrestations(true)
    setClientPrestations([])

    try {
      const res = await fetch(`http://localhost:3500/api/prestations/client/${client._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setClientPrestations(Array.isArray(data) ? data : [])
      }
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique",
        variant: "destructive",
      })
    } finally {
      setLoadingPrestations(false)
    }
  }

  /* ================= UI ================= */

  if (loading) {
    return <p className="text-center py-20">Chargement...</p>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Gestion des clients</h2>

      <Input
        placeholder="Rechercher..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {filteredClients.map((client) => (
        <div key={client._id} className="border rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-lg">
                {client.prenom} {client.nom}
              </p>
              <p className="text-sm text-muted-foreground">
                {client.createdBy
                  ? `Créé par ${client.createdBy.username}`
                  : "—"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getClientBadge(client.totalVisits)}
              {/* Icône œil pour voir les détails */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openDetails(client)}
              >
                <Eye className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="text-sm space-y-1">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {client.telephone}
            </div>
            {client.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {client.email}
              </div>
            )}
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Total dépensé : {client.totalSpent} €
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Dernière visite : {formatDate(client.lastVisit)}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => openEditModal(client)}>
              <Edit2 className="w-4 h-4 mr-2" /> Modifier
            </Button>
            <Button size="sm" onClick={() => openPrestationModal(client)}>
              Nouvelle prestation
            </Button>
          </div>
        </div>
      ))}

      {/* Modal Détails Client */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Détails — {selectedClientDetails?.prenom} {selectedClientDetails?.nom}
            </DialogTitle>
          </DialogHeader>

          {selectedClientDetails && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Téléphone :</strong> {selectedClientDetails.telephone}</div>
                <div><strong>Email :</strong> {selectedClientDetails.email || "—"}</div>
                <div><strong>Total visites :</strong> {selectedClientDetails.totalVisits}</div>
                <div><strong>Total dépensé :</strong> {selectedClientDetails.totalSpent} €</div>
                <div><strong>Dernière visite :</strong> {formatDate(selectedClientDetails.lastVisit)}</div>
                <div><strong>Créé le :</strong> {formatDate(selectedClientDetails.createdAt)}</div>
              </div>

              {selectedClientDetails.notes && (
                <div>
                  <strong>Notes :</strong>
                  <p className="text-sm text-muted-foreground mt-1">{selectedClientDetails.notes}</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-3">Historique des prestations ({clientPrestations.length})</h3>
                {loadingPrestations ? (
                  <p className="text-muted-foreground">Chargement...</p>
                ) : clientPrestations.length === 0 ? (
                  <p className="text-muted-foreground">Aucune prestation enregistrée</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Prix</TableHead>
                          <TableHead>Employé</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clientPrestations.map((p) => (
                          <TableRow key={p._id}>
                            <TableCell>{formatDate(p.date)}</TableCell>
                            <TableCell>{p.serviceId.name}</TableCell>
                            <TableCell>{p.price} €</TableCell>
                            <TableCell>{p.employee || "—"}</TableCell>
                            <TableCell className="text-muted-foreground">{p.notes || "—"}</TableCell>
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
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le client</DialogTitle>
          </DialogHeader>

          {selectedClient && (
            <div className="space-y-4">
              <div>
                <Label>Prénom</Label>
                <Input
                  value={selectedClient.prenom}
                  onChange={(e) =>
                    setSelectedClient({ ...selectedClient, prenom: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Nom</Label>
                <Input
                  value={selectedClient.nom}
                  onChange={(e) =>
                    setSelectedClient({ ...selectedClient, nom: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Téléphone</Label>
                <Input
                  value={selectedClient.telephone}
                  onChange={(e) =>
                    setSelectedClient({ ...selectedClient, telephone: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={selectedClient.email || ""}
                  onChange={(e) =>
                    setSelectedClient({ ...selectedClient, email: e.target.value || undefined })
                  }
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={selectedClient.notes || ""}
                  onChange={(e) =>
                    setSelectedClient({ ...selectedClient, notes: e.target.value || undefined })
                  }
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={handleUpdateClient}>Mettre à jour</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PRESTATION */}
      <Dialog
        open={isPrestationDialogOpen}
        onOpenChange={setIsPrestationDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle prestation</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Service</Label>
              <Select
                value={prestationForm.serviceId}
                onValueChange={(v) =>
                  setPrestationForm({ ...prestationForm, serviceId: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.name} — {s.price}€
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Employé(e)</Label>
              <Select
                value={prestationForm.employee}
                onValueChange={(v) =>
                  setPrestationForm({ ...prestationForm, employee: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un employé" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp} value={emp}>
                      {emp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Prix facturé (€)</Label>
              <Input
                type="number"
                value={prestationForm.price}
                onChange={(e) =>
                  setPrestationForm({ ...prestationForm, price: e.target.value })
                }
                placeholder="Prix automatique"
              />
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={prestationForm.notes}
                onChange={(e) =>
                  setPrestationForm({ ...prestationForm, notes: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleAddPrestation}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}