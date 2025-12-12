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

export default function ManagerDashboard() {
  const router = useRouter()
 const { user, isAuthenticated, isLoading } = useAuthSafe()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const { toast } = useToast()

  // États des modals
  const [openClientModal, setOpenClientModal] = useState(false)
  const [openRdvModal, setOpenRdvModal] = useState(false)
  const [clientForm, setClientForm] = useState({
  prenom: "",
  nom: "",
  telephone: "",
  email: "",
  notes: "",
})
const handleClientChange = (key: keyof typeof clientForm, value: string) => {
  setClientForm((prev) => ({ ...prev, [key]: value }))
}

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated || (user?.role !== "gerant" && user?.role !== "admin")) {
      router.push("/auth/login")
    }
  }, [isAuthenticated, user, router, isLoading])

  if (isLoading) {
  return (
    <div className="flex h-screen items-center justify-center">
      <p>Chargement...</p>
    </div>
  )
}

  if (!isAuthenticated || (user?.role !== "gerant" && user?.role !== "admin")) {
    return null
  }
  const handleCreateClient = async () => {
  try {
    const response = await fetch("http://localhost:3500/api/createclient", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clientForm),
    })

    const data = await response.json()

    if (!response.ok) throw new Error(data.message || "Erreur lors de l'ajout")

    toast({ title: "Client enregistré !" })

    // Reset du form
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
      description: error.message,
      variant: "destructive",
    })
  }
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
        {/* Header - Identique à ton code original */}
        <header className="bg-white dark:bg-gray-900 border-b min-h-16 md:h-20 flex items-center justify-between px-4 md:px-6 gap-2">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <Button variant="ghost" size="icon" className="lg:hidden shrink-0" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg md:text-2xl font-bold truncate">Tableau de bord</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {/* Bouton Client → ouvre le modal */}
            <Button
              variant="outline"
              className="hidden sm:flex bg-cyan-500 hover:bg-cyan-600 text-white border-cyan-500"
              onClick={() => setOpenClientModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Enregistrer un client</span>
              <span className="md:hidden">Client</span>
            </Button>

            {/* Bouton RDV → ouvre le modal */}
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

        {/* ======================= MODAL CLIENT ======================= */}
        <Dialog open={openClientModal} onOpenChange={setOpenClientModal}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Nouveau client</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prénom</Label>
                  <Input placeholder="Marie" value={clientForm.prenom}
            onChange={(e) => handleClientChange("prenom", e.target.value)}/>
                </div>
                <div>
                  <Label>Nom</Label>
                  <Input placeholder="Dubois"  value={clientForm.nom}
            onChange={(e) => handleClientChange("nom", e.target.value)}/>
                </div>
              </div>
              <div>
                <Label>Téléphone</Label>
                <Input placeholder="06 12 34 56 78 " value={clientForm.telephone}
          onChange={(e) => handleClientChange("telephone", e.target.value)}/>
              </div>
              <div>
                <Label>Email (facultatif)</Label>
                <Input type="email" placeholder="marie@example.com" value={clientForm.email}
  onChange={(e) => handleClientChange("email", e.target.value)}/>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea placeholder="Allergies, préférences..." className="min-h-24"  value={clientForm.notes}
          onChange={(e) => handleClientChange("notes", e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenClientModal(false)}>Annuler</Button>
              <Button onClick={handleCreateClient}>Enregistrer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ======================= MODAL RDV ======================= */}
        <Dialog open={openRdvModal} onOpenChange={setOpenRdvModal}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ajouter un rendez-vous</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Client</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-10" placeholder="Rechercher un client..." />
                  </div>
                </div>
                <div>
                  <Label>Date</Label>
                  <Input type="date" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Heure</Label>
                  <Input type="time" />
                </div>
                <div>
                  <Label>Service</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coupe">Coupe</SelectItem>
                      <SelectItem value="couleur">Couleur</SelectItem>
                      <SelectItem value="tresses">Tresses Africaines</SelectItem>
                      <SelectItem value="soin">Soin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Coiffeur/se</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un employé" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amina">Amina</SelectItem>
                    <SelectItem value="fatou">Fatou</SelectItem>
                    <SelectItem value="yasmine">Yasmine</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea placeholder="Détails supplémentaires..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenRdvModal(false)}>Annuler</Button>
              <Button onClick={() => {
                toast({ title: "Rendez-vous ajouté !" })
                setOpenRdvModal(false)
              }}>Créer le rendez-vous</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ======================= TON CONTENU ORIGINAL INTACT ======================= */}
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
                    <StaffPlanning />
                    <AppointmentsList />
                  </TabsContent>

                  <TabsContent value="appointments" className="mt-4 md:mt-6">
                    <AppointmentsList />
                  </TabsContent>

                  <TabsContent value="planning" className="mt-4 md:mt-6">
                    <StaffPlanning />
                  </TabsContent>
                </Tabs>
              </>
            )}

            {activeTab === "planning" && (
              <div className="space-y-4 md:space-y-6">
                <StaffPlanning />
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