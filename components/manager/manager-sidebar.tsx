"use client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  X,
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  BarChart3,
  Settings,
  LogOut,
  HelpCircle,
  Moon,
  Sun,
  UsersRound,
} from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import { useThemeStore } from "@/lib/theme-store"
import { useRouter } from "next/navigation"

interface ManagerSidebarProps {
  isOpen: boolean
  onClose: () => void
  activeTab?: string
  onTabChange?: (tab: string) => void
}

export function ManagerSidebar({ isOpen, onClose, activeTab = "dashboard", onTabChange }: ManagerSidebarProps) {
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/auth/login")
  }

  // Initiale basée uniquement sur la première lettre de l'email
  const emailInitial = user?.email ? user.email[0].toUpperCase() : "?"

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "planning", label: "Planning", icon: Calendar },
    { id: "clients", label: "Clients", icon: Users },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Paramètres", icon: Settings },
  ]

  return (
    <aside
      className={`${isOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-border transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-20 items-center justify-between px-6 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback 
                className="bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90"
              >
                {emailInitial}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-sm font-bold">Gérant du Salon</h1>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "secondary" : "ghost"}
              className="w-full justify-start gap-3"
              onClick={() => onTabChange?.(item.id)}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Button>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-3" onClick={toggleTheme}>
            {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            {theme === "light" ? "Mode sombre" : "Mode clair"}
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3">
            <HelpCircle className="w-5 h-5" />
            Aide
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-destructive" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
            Déconnexion
          </Button>
        </div>
      </div>
    </aside>
  )
}
