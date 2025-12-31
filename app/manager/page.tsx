"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Bell, Menu, Plus, Search, Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ManagerSidebar } from "@/components/manager/manager-sidebar"
import { DashboardStats } from "@/components/manager/dashboard-stats"
import { AppointmentsList } from "@/components/manager/appointments-list"
import { PopularServices } from "@/components/manager/popular-services"
import { StaffPlanning } from "@/components/manager/staff-planning"
import { AnalyticsTab } from "@/components/manager/analytics-tab"
import { ClientsTab } from "@/components/manager/clients-tab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmployeePerformance } from "@/components/manager/employee-perfomance"
import { ServicesTab } from "@/components/superadmin/service-tab"
import { StaffTab } from "@/components/superadmin/staff-tab"
import { useToast } from "@/components/ui/use-toast"
import { useAuthSafe } from "@/hooks/useAuthSafe"
import { useAuthStore } from "@/lib/auth-store"

interface Service {
  _id: string
  name: string
  price: number
  duration: number
  isActive: boolean
}

export default function ManagerDashboard() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuthSafe()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const { toast } = useToast()
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState<Service[]>([])
  const salonId = user?.salonId
  const [rdvForm, setRdvForm] = useState({
    clientId: "",
    date: "",
    time: "",
    service: "",
    coiffeur: "",
    notes: "",
  })

  // États des modals
  const [openClientModal, setOpenClientModal] = useState(false)
  const [openRdvModal, setOpenRdvModal] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [clientForm, setClientForm] = useState({
    prenom: "",
    nom: "",
    telephone: "",
    email: "",
    notes: "",
  })

  const updateRdvForm = (key: string, value: string) => {
    setRdvForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleClientChange = (key: keyof typeof clientForm, value: string) => {
    setClientForm((prev) => ({ ...prev, [key]: value }))
  }

  // Protection d'accès
  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated || (user?.role !== "gerant" && user?.role !== "admin")) {
      router.push("/auth/login")
    }
  }, [isAuthenticated, user, router, isLoading])

  // Chargement des données (clients + services/prestations)
  useEffect(() => {
    const fetchData = async () => {
      const token = useAuthStore.getState().token
      if (!token) {
        toast({
          title: "Erreur",
          description: "Token manquant. Veuillez vous reconnecter.",
          variant: "destructive",
        })
        return
      }

      setLoading(true)
      try {
        const [clientsRes, servicesRes] = await Promise.all([
          fetch("http://localhost:3500/api/allclient", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:3500/api/getAllservice", { // ou /allprestations si c'est le même
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        if (!clientsRes.ok) throw new Error("Erreur chargement clients")
        if (!servicesRes.ok) throw new Error("Erreur chargement services")

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

    if (isAuthenticated && user) {
      fetchData()
    }
  }, [isAuthenticated, user, toast])

  // Chargement des créneaux disponibles
  useEffect(() => {
    if (!rdvForm.date || !user?.salonId) {
      setAvailableSlots([])
      return
    }

    const loadSlots = async () => {
      try {
        const res = await fetch(
          `http://localhost:3500/api/slots?date=${rdvForm.date}&salonId=${user.salonId}`
        )
        const data = await res.json()
        setAvailableSlots(data.availableSlots || [])
      } catch (e) {
        console.error("Erreur slots", e)
        setAvailableSlots([])
      }
    }

    loadSlots()
  }, [rdvForm.date, user?.salonId])

  // Création client
  const handleCreateClient = async () => {
    const token = useAuthStore.getState().token
    if (!token) {
      toast({
        title: "Erreur",
        description: "Vous n'êtes pas authentifié.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("http://localhost:3500/api/createclient", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(clientForm),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.message || "Erreur lors de l'ajout")

      toast({ title: "Succès", description: "Client enregistré !" })

      setClientForm({
        prenom: "",
        nom: "",
        telephone: "",
        email: "",
        notes: "",
      })

      setOpenClientModal(false)
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le client",
        variant: "destructive",
      })
    }
  }

  // Création RDV
  const handleCreateRdv = async () => {
    const token = useAuthStore.getState().token
    if (!token) {
      toast({ title: "Erreur", description: "Token manquant", variant: "destructive" })
      return
    }

    try {
      const res = await fetch("http://localhost:3500/api/rdv/salon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...rdvForm,
          salonId: user?.salonId,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Échec création RDV")
      }

      toast({ title: "Succès", description: "Rendez-vous créé avec succès" })
      setOpenRdvModal(false)
      setRdvForm({ clientId: "", date: "", time: "", service: "", coiffeur: "", notes: "" })
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: e.message || "Impossible de créer le rendez-vous",
        variant: "destructive",
      })
    }
  }

  if (isLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Chargement...</p>
      </div>
    )
  }

  if (!isAuthenticated || (user?.role !== "gerant" && user?.role !== "admin")) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <ManagerSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-900 border-b min-h-16 md:h-20 flex items-center justify-between px-4 md:px-6 gap-2">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <Button variant="ghost" size="icon" className="lg:hidden shrink-0" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg md:text-2xl font-bold truncate">Tableau de bord</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <Button
              variant="outline"
              className="hidden sm:flex bg-cyan-500 hover:bg-cyan-600 text-white border-cyan-500"
              onClick={() => setOpenClientModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Enregistrer un client</span>
              <span className="md:hidden">Client</span>
            </Button>

            <Button
              className="bg-cyan-500 hover:bg-cyan-600"
              onClick={() => setOpenRdvModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Ajouter un rendez-vous</span>
              <span className="md:hidden">RDV</span>
            </Button>

            <Button variant="ghost" size="icon" className="shrink-0">
              <Bell className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Modal Client */}
        <Dialog open={openClientModal} onOpenChange={setOpenClientModal}>
          <DialogContent className="sm:max-w-xl rounded-2xl shadow-xl p-6 bg-white dark:bg-gray-900">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Nouveau client
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-5 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Prénom</Label>
                  <Input
                    placeholder="Marie"
                    value={clientForm.prenom}
                    onChange={(e) => handleClientChange("prenom", e.target.value)}
                    className="border-gray-300 dark:border-gray-700 focus:ring-cyan-400"
                  />
                </div>
                <div>
                  <Label>Nom</Label>
                  <Input
                    placeholder="Dubois"
                    value={clientForm.nom}
                    onChange={(e) => handleClientChange("nom", e.target.value)}
                    className="border-gray-300 dark:border-gray-700 focus:ring-cyan-400"
                  />
                </div>
              </div>
              <div>
                <Label>Téléphone</Label>
                <Input
                  placeholder="06 12 34 56 78"
                  value={clientForm.telephone}
                  onChange={(e) => handleClientChange("telephone", e.target.value)}
                  className="border-gray-300 dark:border-gray-700 focus:ring-cyan-400"
                />
              </div>
              <div>
                <Label>Email (facultatif)</Label>
                <Input
                  type="email"
                  placeholder="marie@example.com"
                  value={clientForm.email}
                  onChange={(e) => handleClientChange("email", e.target.value)}
                  className="border-gray-300 dark:border-gray-700 focus:ring-cyan-400"
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  placeholder="Allergies, préférences..."
                  className="min-h-24 border-gray-300 dark:border-gray-700 focus:ring-cyan-400"
                  value={clientForm.notes}
                  onChange={(e) => handleClientChange("notes", e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-3">
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                onClick={() => setOpenClientModal(false)}
              >
                Annuler
              </Button>
              <Button className="bg-cyan-500 hover:bg-cyan-600 text-white" onClick={handleCreateClient}>
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal RDV */}
        <Dialog open={openRdvModal} onOpenChange={setOpenRdvModal}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl p-6 bg-white dark:bg-gray-900">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Ajouter un rendez-vous
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-5 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Client</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <Select
                      value={rdvForm.clientId}
                      onValueChange={(v) => updateRdvForm("clientId", v)}
                    >
                      <SelectTrigger className="pl-9 border-gray-300 dark:border-gray-700 focus:ring-cyan-400">
                        <SelectValue placeholder="Choisir un client" />
                      </SelectTrigger>
                      <SelectContent>
                        {(Array.isArray(clients) ? clients : []).map((c) => (
                          <SelectItem key={c._id} value={c._id}>
                            {c.prenom} {c.nom} ({c.telephone})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={rdvForm.date}
                    onChange={(e) => { updateRdvForm("date", e.target.value); updateRdvForm("time", ""); }}
                    className="border-gray-300 dark:border-gray-700 focus:ring-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Heure</Label>
                  <Select
                    value={rdvForm.time}
                    disabled={!rdvForm.date || availableSlots.length === 0}
                    onValueChange={(v) => updateRdvForm("time", v)}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          !rdvForm.date
                            ? "Choisissez d'abord une date"
                            : availableSlots.length === 0
                              ? "Aucun créneau disponible"
                              : "Heure disponible"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSlots.length === 0 && rdvForm.date && (
                        <SelectItem disabled value="none">
                          Aucun créneau disponible ce jour
                        </SelectItem>
                      )}
                      {availableSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Service</Label>
                  <Select
                    value={rdvForm.service}
                    onValueChange={(v) => updateRdvForm("service", v)}
                  >
                    <SelectTrigger className="border-gray-300 dark:border-gray-700 focus:ring-cyan-400">
                      <SelectValue placeholder="Choisir un service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.length === 0 ? (
                        <SelectItem disabled value="none">
                          Aucun service disponible
                        </SelectItem>
                      ) : (
                        services.map((s) => (
                          <SelectItem key={s._id} value={s._id}>
                            {s.name} – {s.price} FCFA
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Coiffeur/se</Label>
                <Input disabled placeholder="Assigné automatiquement" className="border-gray-300 dark:border-gray-700" />
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  value={rdvForm.notes}
                  onChange={(e) => updateRdvForm("notes", e.target.value)}
                  className="min-h-24 border-gray-300 dark:border-gray-700 focus:ring-cyan-400"
                />
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-3">
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                onClick={() => setOpenRdvModal(false)}
              >
                Annuler
              </Button>
              <Button className="bg-cyan-500 hover:bg-cyan-600 text-white" onClick={handleCreateRdv}>
                Créer le rendez-vous
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
            {activeTab === "dashboard" && (
              <>
                <DashboardStats />

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="w-full justify-start overflow-x-auto">
                    <TabsTrigger value="overview" className="whitespace-nowrap">
                      Vue d'ensemble
                    </TabsTrigger>
                    <TabsTrigger value="appointments" className="whitespace-nowrap">
                      Rendez-vous
                    </TabsTrigger>
                    <TabsTrigger value="planning" className="whitespace-nowrap">
                      Planning
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4 md:space-y-6 mt-4 md:mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                      <div className="lg:col-span-2">
                        <EmployeePerformance />
                      </div>
                      <div>
                        <PopularServices />
                      </div>
                    </div>
                    {salonId && <StaffPlanning salonId={salonId} />}
                    <AppointmentsList />
                  </TabsContent>

                  <TabsContent value="appointments" className="mt-4 md:mt-6">
                    <AppointmentsList />
                  </TabsContent>

                  <TabsContent value="planning" className="mt-4 md:mt-6">
                    {salonId && <StaffPlanning salonId={salonId} />}
                  </TabsContent>
                </Tabs>
              </>
            )}

            {activeTab === "planning" && (
              <div className="space-y-4 md:space-y-6">
                {salonId && <StaffPlanning salonId={salonId} />}
                <AppointmentsList />
              </div>
            )}

            {activeTab === "clients" && <ClientsTab />}
            {activeTab === "staff" && <StaffTab />}
            {activeTab === "services" && <ServicesTab />}
            {activeTab === "analytics" && <AnalyticsTab />}

            {activeTab === "settings" && (
              <div className="text-center py-12">
                <h2 className="text-xl md:text-2xl font-bold mb-2">Paramètres</h2>
                <p className="text-muted-foreground">Cette section sera bientôt disponible</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}