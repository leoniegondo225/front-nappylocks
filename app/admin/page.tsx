"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Menu } from "lucide-react"
import { Sidebar } from "@/components/superadmin/sidebar"
import { StatsCards } from "@/components/superadmin/stats-cards"
import { UsersTab } from "@/components/superadmin/users-tab"
import { ProductsTab } from "@/components/superadmin/products-tab"
import { BookingsTab } from "@/components/superadmin/bookings-tab"
import { SettingsTab } from "@/components/superadmin/settings-tab"
import { OverviewTab } from "@/components/superadmin/overview-tab"
import { LogsTab } from "@/components/superadmin/logs-tab"
import { SalonsTab } from "@/components/superadmin/salons-tab"
import { Header } from "@/components/navigation/header"
import { useAuthSafe } from "@/hooks/useAuthSafe"
import { useAuthStore, type User } from "@/lib/auth-store"
import { Product } from "@/types/product"
import { ServicesTab } from "@/components/superadmin/service-tab"
import { StaffTab } from "@/components/superadmin/staff-tab"
import { ClientsTab } from "@/components/manager/clients-tab"

interface Salon {
  _id: string
  nom: string
  address: string
  pays: string
  ville: string
  telephone: string
  gerantId?: string
  email: string
  status: "active" | "inactive"
  createdAt: string
}

const mockLogs = [
  { id: "1", type: "success" as const, message: "Nouvelle réservation créée", user: "Sophie Admin", timestamp: "2025-12-02 14:23:45" },
  { id: "2", type: "warning" as const, message: "Stock faible détecté", user: "Système", timestamp: "2025-12-02 13:15:22" },
]

export default function SuperAdminDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated, isLoading } = useAuthSafe()

  const [salons, setSalons] = useState<Salon[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  // Nouveaux états pour les statistiques dynamiques
  const [dailyRevenue, setDailyRevenue] = useState(0)
  const [monthlyRevenue, setMonthlyRevenue] = useState(0)
  const [annualRevenue, setAnnualRevenue] = useState(0)
  const [todayBookings, setTodayBookings] = useState(0)
  const [pendingBookings, setPendingBookings] = useState(0)

  // Chargement des utilisateurs
  useEffect(() => {
    const fetchUsers = async () => {
      const token = useAuthStore.getState().token
      if (!token) return

      try {
        const res = await fetch("http://localhost:3500/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()

        if (res.ok) {
          setUsers(data.users || data)
        } else {
          toast({ title: "Erreur", description: data.message || "Impossible de charger les utilisateurs", variant: "destructive" })
        }
      } catch (err) {
        toast({ title: "Erreur réseau", description: "Vérifie que ton serveur est lancé", variant: "destructive" })
      }
    }

    if (isAuthenticated && user?.role === "superadmin") {
      fetchUsers()
    }
  }, [isAuthenticated, user, toast])

  // Chargement des produits
  useEffect(() => {
    const fetchProducts = async () => {
      const token = useAuthStore.getState().token
      if (!token) return

      try {
        const res = await fetch("http://localhost:3500/api/getAllproduit", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()

        if (res.ok) {
          setProducts(Array.isArray(data) ? data : data.produits || [])
        } else {
          toast({ title: "Erreur", description: data.message || "Impossible de charger les produits", variant: "destructive" })
        }
      } catch (err) {
        toast({ title: "Erreur réseau", description: "Vérifie que ton serveur est lancé", variant: "destructive" })
      }
    }

    if (isAuthenticated && user?.role === "superadmin") {
      fetchProducts()
    }
  }, [isAuthenticated, user, toast])

  // Chargement des salons
  useEffect(() => {
    const fetchSalons = async () => {
      const token = useAuthStore.getState().token
      if (!token) return

      try {
        const res = await fetch("http://localhost:3500/api/getallsalons", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()

        if (res.ok) {
          setSalons(data)
        }
      } catch (err) {
        console.error("Erreur chargement salons", err)
      }
    }

    if (isAuthenticated && user?.role === "superadmin") {
      fetchSalons()
    }
  }, [isAuthenticated, user])

  // Nouveau : Chargement des revenus + réservations du jour
  useEffect(() => {
    const fetchStats = async () => {
      const token = useAuthStore.getState().token
      if (!token) return

      try {
        // 1. Revenus (journalier, mensuel, annuel)
        const revenuesRes = await fetch("http://localhost:3500/api/stats/revenues", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (revenuesRes.ok) {
          const rev = await revenuesRes.json()
          setDailyRevenue(rev.dailyRevenue || 0)
          setMonthlyRevenue(rev.monthlyRevenue || 0)
          setAnnualRevenue(rev.annualRevenue || 0)
        }

        // 2. Réservations du jour
        const todayRes = await fetch("http://localhost:3500/api/stats/today-bookings", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (todayRes.ok) {
          const today = await todayRes.json()
          setTodayBookings(today.total || 0)
          setPendingBookings(today.pending || 0)
        }
      } catch (err) {
        console.error("Erreur lors du chargement des statistiques revenus/bookings", err)
        // Pas de toast bloquant ici pour ne pas gêner l'UX si un endpoint échoue temporairement
      }
    }

    if (isAuthenticated && user?.role === "superadmin") {
      fetchStats()
    }
  }, [isAuthenticated, user])

  // Protection + redirection
  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated || user?.role !== "superadmin") {
      router.replace("/auth/login")
    }
  }, [isLoading, isAuthenticated, user, router])

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p._id !== id))
    toast({ title: "Supprimé", description: "Produit supprimé" })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-600"></div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== "superadmin") return null

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        activeTab={activeTab}
        sidebarOpen={sidebarOpen}
        onTabChange={setActiveTab}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col">
        {/* Menu mobile */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold">Tableau de bord SuperAdmin</h1>
              <p className="text-muted-foreground">Gestion complète de la plateforme NappyLocks</p>
            </div>

            {activeTab === "overview" && (
              <>
                <div className="mb-8">
                  <StatsCards
                    users={users}
                    salons={salons}
                    dailyRevenue={dailyRevenue}
                    monthlyRevenue={monthlyRevenue}
                    annualRevenue={annualRevenue}
                    todayBookings={todayBookings}
                    pendingBookings={pendingBookings}
                  />
                </div>
                <OverviewTab />
              </>
            )}

            {activeTab === "users" && (
              <UsersTab
                users={users}
                onAddUser={(user) => setUsers((prev) => [...prev, user])}
                onEditUser={(updated) =>
                  setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)))
                }
                onDeleteUser={(id) => setUsers((prev) => prev.filter((u) => u._id !== id))}
                onExport={() => console.log("Export à implémenter")}
              />
            )}

            {activeTab === "salons" && (
              <SalonsTab
                salons={salons}
                onSalonCreated={(salon) => setSalons((prev) => [...prev, salon])}
                onStatusChanged={(salonId, newStatus) =>
                  setSalons((prev) =>
                    prev.map((s) => (s._id === salonId ? { ...s, status: newStatus } : s))
                  )
                }
                onSalonUpdated={(updatedSalon) =>
                  setSalons((prev) =>
                    prev.map((s) => (s._id === updatedSalon._id ? updatedSalon : s))
                  )
                }
                onSalonDeleted={(salonId) =>
                  setSalons((prev) => prev.filter((s) => s._id !== salonId))
                }
              />
            )}

            {activeTab === "products" && (
              <ProductsTab products={products} onDeleteProduct={handleDeleteProduct} />
            )}

            {activeTab === "services" && <ServicesTab />}
            {activeTab === "staff" && <StaffTab />}
            {activeTab === "clients" && <ClientsTab />}

            {activeTab === "bookings" && <BookingsTab />}

            {activeTab === "logs" && <LogsTab logs={mockLogs} />}
            {activeTab === "settings" && <SettingsTab onRefresh={() => toast({ title: "Rafraîchi !" })} />}
          </div>
        </main>
      </div>
    </div>
  )
}