"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuthSafe } from "@/hooks/useAuthSafe"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Search,
  UserPlus,
  Shield,
  Trash2,
  Edit,
  Download,
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  Building2,
} from "lucide-react"
import { useAuthStore, type UserRole } from "@/lib/auth-store"
import type { User } from "@/lib/auth-store"

interface UsersTabProps {
  users: User[]
  onAddUser: (user: User) => void
  onEditUser: (user: User) => void
  onDeleteUser: (id: string) => void
  onExport: () => void
}

export function UsersTab({
  users: propUsers,
  onAddUser,
  onEditUser,
  onDeleteUser,
  onExport,
}: UsersTabProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [userFilter, setUserFilter] = useState<string>("all")

  // Formulaire création
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    telephone: "",
    role: "gerant" as UserRole,
    salonId: "",
  })

  // Formulaire modification
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const [salons, setSalons] = useState<any[]>([])

  const { toast } = useToast()
  const { user: currentUser } = useAuthSafe()

  // Chargement des salons
  useEffect(() => {
    const fetchSalons = async () => {
      const token = useAuthStore.getState().token
      if (!token) return

      try {
        const res = await fetch("http://localhost:3500/api/getallsalons", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setSalons(data)
        }
      } catch (err) {
        console.error("Erreur chargement salons", err)
      }
    }

    if (currentUser?.role === "superadmin") {
      fetchSalons()
    }
  }, [currentUser?.role])

  // Filtrage local
  const filteredUsers = propUsers.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = userFilter === "all" || u.role === userFilter
    return matchesSearch && matchesFilter
  })

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "superadmin": return "bg-purple-100 text-purple-800 border-purple-200"
      case "admin": return "bg-blue-100 text-blue-800 border-blue-200"
      case "gerant": return "bg-green-100 text-green-800 border-green-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "superadmin": return "SuperAdmin"
      case "admin": return "Admin"
      case "gerant": return "Gérant"
      default: return role
    }
  }

  // Création utilisateur
  const handleAddUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      toast({ title: "Erreur", description: "Username, email et mot de passe obligatoires", variant: "destructive" })
      return
    }

    const token = useAuthStore.getState().token
    if (!token) {
      toast({ title: "Erreur", description: "Non authentifié", variant: "destructive" })
      return
    }

    try {
      const body: any = {
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
        telephone: newUser.telephone || undefined,
        role: newUser.role,
      }

      if (newUser.salonId) {
        body.salonId = newUser.salonId
      }

      const res = await fetch("http://localhost:3500/api/admin/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de la création")
      }

      onAddUser(data.user)
      toast({ title: "Succès", description: "Utilisateur créé avec succès" })

      setNewUser({
        username: "",
        email: "",
        password: "",
        telephone: "",
        role: "gerant",
        salonId: "",
      })
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message || "Échec de la création", variant: "destructive" })
    }
  }

  // Mise à jour utilisateur
  const handleUpdateUser = async () => {
    if (!editingUser) return

    const token = useAuthStore.getState().token
    if (!token) return

    try {
      const res = await fetch(`http://localhost:3500/api/admin/users/${editingUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: editingUser.username,
          email: editingUser.email,
          telephone: editingUser.telephone || null,
          role: editingUser.role,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Échec mise à jour")
      }

      const updated = await res.json()
      onEditUser(updated.user || editingUser)
      toast({ title: "Succès", description: "Utilisateur mis à jour" })

      setEditingUser(null)
      setEditDialogOpen(false) // Ferme le modal
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" })
    }
  }


  // Suppression d'un utilisateur
  // Fonction de suppression – même style que handleUpdateUser
  const handleDeleteUser = async (userId: string, username: string) => {
    const token = useAuthStore.getState().token
    if (!token) {
      toast({ title: "Erreur", description: "Non authentifié", variant: "destructive" })
      return
    }

    try {
      const res = await fetch(`http://localhost:3500/api/admin/users/delete/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Échec de la suppression")
      }

      // Suppression réussie
      onDeleteUser(userId) // Met à jour la liste localement (via la prop passée depuis le dashboard)
      toast({ title: "Succès", description: `Utilisateur ${username} supprimé` })

    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" })
    }
  }


  return (
    <div className="space-y-8">
      {/* Barre de recherche et actions */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou email..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              <SelectItem value="superadmin">SuperAdmin</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="gerant">Gérant</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onExport}>
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>

          {/* Dialog Ajouter un utilisateur */}
          {currentUser?.role === "superadmin" && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="shadow-md">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Ajouter un utilisateur
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">
                    Créer un nouvel utilisateur
                  </DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="add-username" className="text-base">
                        <UserIcon className="w-4 h-4 inline mr-2 text-muted-foreground" />
                        Nom d'utilisateur
                      </Label>
                      <Input
                        id="add-username"
                        placeholder="ex: johndoe"
                        value={newUser.username}
                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="add-email" className="text-base">
                        <Mail className="w-4 h-4 inline mr-2 text-muted-foreground" />
                        Adresse email
                      </Label>
                      <Input
                        id="add-email"
                        type="email"
                        placeholder="ex: john@exemple.com"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="add-phone" className="text-base">
                        <Phone className="w-4 h-4 inline mr-2 text-muted-foreground" />
                        Téléphone <span className="text-muted-foreground text-sm">(optionnel)</span>
                      </Label>
                      <Input
                        id="add-phone"
                        placeholder="06 12 34 56 78"
                        value={newUser.telephone}
                        onChange={(e) => setNewUser({ ...newUser, telephone: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="add-password" className="text-base">
                        <Lock className="w-4 h-4 inline mr-2 text-muted-foreground" />
                        Mot de passe
                      </Label>
                      <Input
                        id="add-password"
                        type="password"
                        placeholder="••••••••••"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="add-role" className="text-base">
                        <Shield className="w-4 h-4 inline mr-2 text-muted-foreground" />
                        Rôle
                      </Label>
                      <Select
                        value={newUser.role}
                        onValueChange={(v: UserRole) =>
                          setNewUser({ ...newUser, role: v, salonId: v === "gerant" ? newUser.salonId : "" })
                        }
                      >
                        <SelectTrigger id="add-role">
                          <SelectValue placeholder="Sélectionner un rôle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gerant">Gérant</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {newUser.role === "gerant" && (
                      <div className="space-y-2 animate-in fade-in-0 zoom-in-95 duration-300">
                        <Label htmlFor="add-salon" className="text-base">
                          <Building2 className="w-4 h-4 inline mr-2 text-muted-foreground" />
                          Salon associé
                        </Label>
                        <Select
                          value={newUser.salonId}
                          onValueChange={(v) => setNewUser({ ...newUser, salonId: v })}
                          disabled={salons.length === 0}
                        >
                          <SelectTrigger id="add-salon">
                            <SelectValue
                              placeholder={
                                salons.length === 0
                                  ? "Aucun salon disponible"
                                  : "Choisir un salon"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {salons.map((salon) => (
                              <SelectItem key={salon._id} value={salon._id}>
                                {salon.nom}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button size="lg" className="w-full sm:w-auto" onClick={handleAddUser}>
                    Créer l'utilisateur
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div className="grid gap-5">
        {filteredUsers.map((u) => (
          <Card key={u._id} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-5">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-lg font-semibold">
                    {u.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-xl">{u.username}</p>
                  <p className="text-sm text-muted-foreground">{u.email}</p>
                  {u.telephone && (
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {u.telephone}
                    </p>
                  )}
                </div>
                <Badge className={`${getRoleColor(u.role)} font-medium`} variant="outline">
                  <Shield className="w-3.5 h-3.5 mr-1" />
                  {getRoleLabel(u.role)}
                </Badge>
              </div>

              {currentUser?.role === "superadmin" && u.role !== "superadmin" && (
                <div className="flex gap-3">
                  {/* Dialog Modifier */}
                  <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingUser(u)
                          setEditDialogOpen(true)
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Modifier
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-xl">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">
                          Modifier {editingUser?.username || "l'utilisateur"}
                        </DialogTitle>
                      </DialogHeader>

                      {editingUser && (
                        <div className="grid gap-6 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label>
                                <UserIcon className="w-4 h-4 inline mr-2 text-muted-foreground" />
                                Nom d'utilisateur
                              </Label>
                              <Input
                                value={editingUser.username}
                                onChange={(e) =>
                                  setEditingUser({ ...editingUser, username: e.target.value })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>
                                <Mail className="w-4 h-4 inline mr-2 text-muted-foreground" />
                                Email
                              </Label>
                              <Input
                                type="email"
                                value={editingUser.email}
                                onChange={(e) =>
                                  setEditingUser({ ...editingUser, email: e.target.value })
                                }
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label>
                                <Phone className="w-4 h-4 inline mr-2 text-muted-foreground" />
                                Téléphone
                              </Label>
                              <Input
                                value={editingUser.telephone || ""}
                                onChange={(e) =>
                                  setEditingUser({
                                    ...editingUser,
                                    telephone: e.target.value || undefined,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>
                                <Shield className="w-4 h-4 inline mr-2 text-muted-foreground" />
                                Rôle
                              </Label>
                              <Select
                                value={editingUser.role}
                                onValueChange={(v: UserRole) =>
                                  setEditingUser({ ...editingUser, role: v })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="gerant">Gérant</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      )}

                      <DialogFooter>
                        <Button size="lg" onClick={handleUpdateUser}>
                          Enregistrer les modifications
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive hover:bg-destructive hover:text-white"
                    onClick={() => handleDeleteUser(u._id!, u.username)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}