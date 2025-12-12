"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BarChart3, Users, Building2, ShoppingBag, Calendar, Activity, Settings, X, UsersRound } from "lucide-react"
import type { User } from "@/lib/auth-store"
import { useAuthSafe } from "@/hooks/useAuthSafe"

interface SidebarProps {
  activeTab: string
  sidebarOpen: boolean
  onTabChange: (tab: string) => void
  onClose: () => void
}

export function Sidebar({ activeTab, sidebarOpen, onTabChange, onClose }: SidebarProps) {
  const { user, isLoading } = useAuthSafe() // Token + user + isLoading en sécurité

  // Pendant l'hydratation → on affiche rien ou un squelette
  if (isLoading) {
    return (
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-border lg:static lg:inset-0">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 animate-pulse" />
              <div className="space-y-2">
                <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                <div className="h-3 w-20 bg-muted/70 rounded animate-pulse" />
              </div>
            </div>
          </div>
          <div className="flex-1 p-4 space-y-2">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-10 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </aside>
    )
  }

  return (
    <aside
      className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-border transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
    >
      <div className="flex h-full flex-col">
        {/* Header Sidebar */}
        <div className="flex h-16 items-center justify-between px-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
              NL
            </div>
            <div>
              <h1 className="text-xl font-bold">NappyLocks</h1>
              <p className="text-xs text-muted-foreground">SuperAdmin</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {[
            { id: "overview", label: "Dashboard", icon: BarChart3 },
            { id: "users", label: "Utilisateurs", icon: Users },
            { id: "salons", label: "Salons", icon: Building2 },
            { id: "services", label: "Prestation", icon: Building2 },
            { id: "staff", label: "Personnel", icon: UsersRound },
            { id: "products", label: "Boutique", icon: ShoppingBag },
            { id: "bookings", label: "Réservations", icon: Calendar },
            { id: "logs", label: "Logs système", icon: Activity },
            { id: "settings", label: "Paramètres", icon: Settings },
          ].map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={activeTab === id ? "secondary" : "ghost"}
              className="w-full justify-start gap-3 h-11"
              onClick={() => onTabChange(id)}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Button>
          ))}
        </nav>

        {/* Profil utilisateur */}
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user?.avatar || undefined} alt={user?.username} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {user?.username?.[0]?.toUpperCase() || "S"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.username || "SuperAdmin"}</p>
              <p className="text-xs text-muted-foreground">Super administrateur</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}