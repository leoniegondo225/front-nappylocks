"use client"

import React, { useEffect, useState } from "react"
import { Header } from "@/components/navigation/header"
import { MobileNav } from "@/components/navigation/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { useThemeStore } from "@/lib/theme-store"
import {
  User,
  Package,
  Calendar,
  Heart,
  Settings,
  LogOut,
  Mail,
  Phone,
  Edit2,
  Check,
  X,
  ShoppingBag,
  Clock,
  Loader2,
} from "lucide-react"
import { useAuthSafe } from "@/hooks/useAuthSafe"

export default function AccountPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated, isLoading } = useAuthSafe()
  const { logout, updateProfile } = useAuthStore()
  const { theme } = useThemeStore()

  const isDark = theme === "dark"

  const [activeSection, setActiveSection] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    telephone: "",
  })

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) {
      router.push("/auth/login")
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        telephone: user.telephone || "",
      })
    }
  }, [user])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const success = await updateProfile({
        username: formData.username.trim(),
        email: formData.email.trim(),
        telephone: formData.telephone.trim() || undefined,
      })

      if (success) {
        toast({
          title: "Profil mis à jour !",
          description: "Vos informations ont été enregistrées avec succès.",
        })
        setIsEditing(false)
      } else {
        toast({
          title: "Échec",
          description: "La mise à jour a échoué. Veuillez réessayer.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        telephone: user.telephone || "",
      })
    }
    setIsEditing(false)
  }

  const handleLogout = () => {
    logout()
    toast({ title: "Déconnexion réussie", description: "À bientôt sur NappyLocks !" })
    router.push("/")
  }

  // Données mock
  const orders = [
    { _id: "CMD-001", date: "15 Jan 2025", status: "Livrée", total: 47.99, items: 2 },
    { _id: "CMD-002", date: "10 Jan 2025", status: "En cours", total: 35.0, items: 1 },
  ]

  const appointments = [
    { _id: "RDV-001", date: "25 Jan 2025", time: "14:00", service: "Tresses Box Braids", status: "Confirmé" },
    { _id: "RDV-002", date: "10 Fév 2025", time: "10:00", service: "Locks Naturelles", status: "Confirmé" },
  ]

  const navItems = [
    { id: "profile", label: "Profil", icon: User },
    { id: "orders", label: "Commandes", icon: Package },
    { id: "appointments", label: "Rendez-vous", icon: Calendar },
    { id: "favorites", label: "Favoris", icon: Heart },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-foreground" />
      </div>
    )
  }

  if (!isAuthenticated || !user) return null

  return (
    <div className={`min-h-screen ${isDark ? "bg-black text-white" : "bg-white text-black"} transition-colors duration-500`}>
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* En-tête */}
        <div className="mb-12 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-28 h-28 border-4 border-background shadow-2xl">
              <AvatarFallback className={`text-3xl font-bold ${isDark ? "bg-white text-black" : "bg-black text-white"}`}>
                {user.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-4xl font-bold">
                Bonjour, {user.username.split(" ")[0]} !
              </h1>
              <p className="text-muted-foreground text-lg mt-2">Gérez votre compte et vos réservations</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Desktop */}
          <aside className="hidden lg:block">
            <Card className={`sticky top-24 shadow-xl border ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
              <CardContent className="p-6">
                <nav className="space-y-2">
                  {navItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={activeSection === item.id ? "default" : "ghost"}
                      className={`w-full justify-start h-12 font-medium ${
                        activeSection === item.id
                          ? isDark
                            ? "bg-white text-black hover:bg-gray-200"
                            : "bg-black text-white hover:bg-gray-800"
                          : ""
                      }`}
                      onClick={() => setActiveSection(item.id)}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.label}
                    </Button>
                  ))}
                </nav>

                <Separator className="my-6" />

                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start h-12">
                    <Settings className="w-5 h-5 mr-3" />
                    Paramètres avancés
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-12 text-destructive hover:text-red-400"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Se déconnecter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Contenu principal */}
          <div className="lg:col-span-3">
            {/* Tabs Mobile */}
            <div className="lg:hidden mb-8">
              <Tabs value={activeSection} onValueChange={setActiveSection}>
                <TabsList className={`grid grid-cols-4 w-full rounded-xl ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                  {navItems.map((item) => (
                    <TabsTrigger key={item.id} value={item.id} className="flex flex-col py-4 text-xs font-medium">
                      <item.icon className="w-5 h-5 mb-1" />
                      {item.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* === PROFIL === */}
            {activeSection === "profile" && (
              <Card className={`overflow-hidden shadow-2xl border ${isDark ? "border-gray-800" : "border-gray-200"}`}>
                <div className={`p-6 ${isDark ? "bg-gray-900" : "bg-gray-100"}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">Informations personnelles</CardTitle>
                      <CardDescription className="mt-1">
                        Mettez à jour vos coordonnées
                      </CardDescription>
                    </div>
                    {!isEditing ? (
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Modifier
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={handleCancel} disabled={isSaving}>
                          <X className="w-5 h-5" />
                        </Button>
                        <Button
                          size="sm"
                          className={isDark ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-800"}
                          onClick={handleSave}
                          disabled={isSaving}
                        >
                          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <CardContent className="p-8 space-y-8">
                  {isEditing ? (
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="username">Nom complet</Label>
                        <Input
                          id="username"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          className="mt-2 h-12"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="mt-2 h-12"
                        />
                      </div>
                      <div>
                        <Label htmlFor="telephone">Téléphone (optionnel)</Label>
                        <Input
                          id="telephone"
                          type="tel"
                          value={formData.telephone}
                          onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                          className="mt-2 h-12"
                          placeholder="+225 ..."
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="flex items-center gap-5">
                        <div className={`p-3 rounded-full ${isDark ? "bg-white" : "bg-black"}`}>
                          <User className={`w-6 h-6 ${isDark ? "text-black" : "text-white"}`} />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Nom complet</p>
                          <p className="text-xl font-semibold">{user.username}</p>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-center gap-5">
                        <div className={`p-3 rounded-full ${isDark ? "bg-white" : "bg-black"}`}>
                          <Mail className={`w-6 h-6 ${isDark ? "text-black" : "text-white"}`} />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="text-xl font-semibold">{user.email}</p>
                        </div>
                      </div>
                      {user.telephone && (
                        <>
                          <Separator />
                          <div className="flex items-center gap-5">
                            <div className={`p-3 rounded-full ${isDark ? "bg-white" : "bg-black"}`}>
                              <Phone className={`w-6 h-6 ${isDark ? "text-black" : "text-white"}`} />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Téléphone</p>
                              <p className="text-xl font-semibold">{user.telephone}</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Tu peux appliquer le même principe aux autres sections (commandes, rdv, favoris) */}
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  )
}