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
import { MobileNav } from "@/components/navigation/mobile-nav"




interface Salon {
  _id: string
  nom: string
  address: string
  pays: string
  ville: string
  telephone: string
  gerantId?: string  // optionnel
  email: string
  status: "active" | "inactive"
  createdAt: string
}


const mockBookings = [
  { id: "1", clientName: "Marie Dubois", service: "Coupe + Coloration", salonName: "NappyLocks - Centre Ville", date: "2025-12-05", time: "14:00", status: "confirmed" as const, price: 85 },
  { id: "2", clientName: "Paul Martin", service: "Coiffure Locks", salonName: "NappyLocks - Le Marais", date: "2025-12-05", time: "15:30", status: "pending" as const, price: 120 },
  { id: "3", clientName: "Sophie Laurent", service: "Défrisage", salonName: "NappyLocks - Centre Ville", date: "2025-12-04", time: "10:00", status: "completed" as const, price: 95 },
]

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
  const [bookings] = useState(mockBookings)
  const [logs] = useState(mockLogs)
  const [users, setUsers] = useState<User[]>([]) // Temporaire, en attendant le vrai type
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  // Charger les utilisateurs au montage (une seule fois)
  useEffect(() => {
    const fetchUsers = async () => {
      const token = useAuthStore.getState().token
      if (!token) return
      try {
        const res = await fetch("http://localhost:3500/api/admin/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await res.json()

        if (res.ok) {
          setUsers(data.users || data) // selon la structure de ta réponse
        } else {
          toast({
            title: "Erreur",
            description: data.message || "Impossible de charger les utilisateurs",
            variant: "destructive",
          })
        }
      } catch (err) {
        toast({
          title: "Erreur réseau",
          description: "Vérifie que ton serveur est lancé",
          variant: "destructive",
        })
      }
    }
    if (isAuthenticated && user?.role === "superadmin") {
      fetchUsers()
    }
  }, [isAuthenticated, user, toast])

  // Protection + redirection
  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated || user?.role !== "superadmin") {
      router.replace("/auth/login")
    }
  }, [isLoading, isAuthenticated, user, router])

  useEffect(() => {
    const fetchProducts = async () => {
      const token = useAuthStore.getState().token
      if (!token) return

      try {
        const res = await fetch("http://localhost:3500/api/getAllproduit", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await res.json()

        if (res.ok) {
          // Assurez-vous que data.produits est un tableau
          setProducts(Array.isArray(data) ? data : [])
        } else {
          toast({
            title: "Erreur",
            description: data.message || "Impossible de charger les produits",
            variant: "destructive",
          })
        }
      } catch (err) {
        toast({
          title: "Erreur réseau",
          description: "Vérifie que ton serveur est lancé",
          variant: "destructive",
        })
      }
    }

    if (isAuthenticated && user?.role === "superadmin") {
      fetchProducts()
    }
  }, [isAuthenticated, user, toast])

  // Ajoute ce useEffect pour charger les salons au démarrage
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



  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p._id !== id))
    toast({ title: "Supprimé", description: "Produit supprimé" })
  }

  // Loader pendant hydratation
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-600"></div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== "superadmin") return null

  // Loader
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar sans prop user → il utilise useAuthSafe à l'intérieur */}
      <Sidebar
        activeTab={activeTab}
        sidebarOpen={sidebarOpen}
        onTabChange={setActiveTab}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col">
        {/* Bouton menu mobile */}
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
                  <StatsCards users={users} salons={salons} monthlyRevenue={48520} todayBookings={87} />
                </div>
                <OverviewTab />
              </>
            )}

            {activeTab === "users" && (
              <UsersTab
                users={users}
                onAddUser={(user) => setUsers(prev => [...prev, user])}
                onEditUser={(updated) => setUsers(prev => prev.map(u => u._id === updated._id ? updated : u))}
                onDeleteUser={(id) => setUsers(prev => prev.filter(u => u._id !== id))}
                onExport={() => console.log("Export à implémenter")}
              />
            )}

            {activeTab === "salons" && (
              <SalonsTab
                salons={salons}
                onSalonCreated={(salon) => setSalons(prev => [...prev, salon])}
                onStatusChanged={(salonId, newStatus) =>
                  setSalons(prev =>
                    prev.map(s => s._id === salonId ? { ...s, status: newStatus } : s)
                  )
                }
                onSalonUpdated={(updatedSalon) =>
                  setSalons(prev =>
                    prev.map(s => s._id === updatedSalon._id ? updatedSalon : s)
                  )
                }
                onSalonDeleted={(salonId) =>
                  setSalons(prev => prev.filter(s => s._id !== salonId))
                }
              />
            )}

            {activeTab === "products" && (
              <ProductsTab products={products} onDeleteProduct={handleDeleteProduct} />
            )}

            {activeTab === "services" && <ServicesTab />}
            {activeTab === "staff" && <StaffTab />}
            {activeTab === "clients" && <ClientsTab />}

            {activeTab === "bookings" && <BookingsTab bookings={bookings} onUpdateStatus={() => { }} />}
            {activeTab === "logs" && <LogsTab logs={logs} />}
            {activeTab === "settings" && <SettingsTab onRefresh={() => toast({ title: "Rafraîchi !" })} />}
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}