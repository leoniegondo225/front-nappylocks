"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/lib/auth-store"

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
} from "lucide-react"

/* ================= TYPES ================= */

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

/* ================= UTILS ================= */

const getClientBadge = (visits: number) => {
  if (visits >= 15) return <Badge className="bg-yellow-500 text-white">⭐ VIP</Badge>
  if (visits >= 10) return <Badge className="bg-blue-600 text-white">💎 Fidèle</Badge>
  if (visits >= 3) return <Badge className="bg-emerald-600 text-white">✓ Habitué</Badge>
  return <Badge variant="secondary">✨ Nouveau</Badge>
}

/* ================= COMPONENT ================= */

export function ClientsTab() {
  const { toast } = useToast()

  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

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

  /* ================= FETCH DATA (LOGIQUE QUI MARCHE) ================= */

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

  /* ================= FILTER SAFE ================= */

  const safeClients = Array.isArray(clients) ? clients : []

  const filteredClients = safeClients.filter(
    (c) =>
      `${c.prenom} ${c.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.telephone.includes(searchTerm)
  )

  /* ================= EDIT CLIENT ================= */

  const openEditModal = (client: Client) => {
    setSelectedClient({ ...client })
    setIsEditDialogOpen(true)
  }

  const handleUpdateClient = async () => {
    if (!selectedClient || !selectedClient._id) return

    try {
      const token = useAuthStore.getState().token
      if (!token) return

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

      const updatedClient: Client = await res.json()
      setClients((prev) =>
        prev.map((c) => (c._id === updatedClient._id ? updatedClient : c))
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
    if (!prestationClient || !selectedService) return

    try {
      const token = useAuthStore.getState().token
      if (!token) return

      const price = Number(prestationForm.price || 0)

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
          date: new Date().toISOString().split("T")[0],
        }),
      })

      const updatedClient = {
        ...prestationClient,
        totalVisits: prestationClient.totalVisits + 1,
        totalSpent: prestationClient.totalSpent + price,
        lastVisit: new Date().toISOString().split("T")[0],
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

      const finalClient: Client = await res.json()
      setClients((prev) =>
        prev.map((c) => (c._id === finalClient._id ? finalClient : c))
      )

      toast({
        title: "Prestation enregistrée",
        description: `${selectedService.name} — ${price}€`,
      })

      setIsPrestationDialogOpen(false)
    } catch {
      toast({
        title: "Erreur",
        description: "Échec de l'enregistrement",
        variant: "destructive",
      })
    }
  }

  /* ================= UI ================= */

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500" />
        <p className="text-muted-foreground">Chargement des clients...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Gestion des clients</h2>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredClients.map((client) => (
        <div
          key={client._id}
          className="rounded-lg border bg-card p-5 shadow-sm space-y-4"
        >
          <div className="flex justify-between">
            <div>
              <p className="font-semibold text-lg">
                {client.prenom} {client.nom}
              </p>
              <p className="text-xs text-muted-foreground">
                {client.createdBy
                  ? `Créé par ${client.createdBy.username}`
                  : "—"}
              </p>
            </div>
            {getClientBadge(client.totalVisits)}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {client.telephone}
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              {client.totalSpent} €
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {client.lastVisit
                ? new Date(client.lastVisit).toLocaleDateString("fr-FR")
                : "—"}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => openEditModal(client)}
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Modifier
            </Button>
            <Button
              size="sm"
              onClick={() => openPrestationModal(client)}
            >
              Nouvelle prestation
            </Button>
          </div>
        </div>
      ))}

      {filteredClients.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <User className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>Aucun client trouvé</p>
        </div>
      )}

      {/* MODALS (édition + prestation) → identiques à avant */}
      {/* Tu peux les garder tels quels */}
    </div>
  )
}
