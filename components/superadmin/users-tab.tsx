"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuthSafe } from "@/hooks/useAuthSafe"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, UserPlus, Shield, Trash2, Edit, Download } from "lucide-react"
import { useAuthStore, type User, type UserRole } from "@/lib/auth-store"

interface UsersTabProps {
  users: User[]
  onAddUser: (user: User) => void
  onEditUser: (user: User) => void
  onDeleteUser: (id: string) => void
  onExport: () => void
}

export function UsersTab({ users: propUsers, onAddUser, onEditUser, onDeleteUser, onExport }: UsersTabProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [userFilter, setUserFilter] = useState<string>("all")
  const [newUser, setNewUser] = useState({ username: "", email: "", password: "", telephone: "", role: "gerant" as UserRole ,salonId: "" })
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const { toast } = useToast()
  
const [salons, setSalons] = useState([])
  const { user: currentUser } = useAuthSafe() // Pour vérifier que seul superadmin voit tout

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




useEffect(() => {
  const fetchSalons = async () => {
    const token = useAuthStore.getState().token

    const res = await fetch("http://localhost:3500/api/getallsalons", {
      headers: { Authorization: `Bearer ${token}` }
    })

    const data = await res.json()
    setSalons(data)
  }

  fetchSalons()
}, [])


  const handleAddUser = async () => {
  if (!newUser.username || !newUser.email || !newUser.password) {
    toast({ title: "Erreur", description: "Tous les champs obligatoires doivent être remplis", variant: "destructive" })
    return
  }

  const token = useAuthStore.getState().token
  if (!token) {
    toast({ title: "Erreur", description: "Vous n'êtes pas connecté", variant: "destructive" })
    return
  }

  try {
    const res = await fetch("http://localhost:3500/api/admin/create-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newUser),
    })
console.log("Token utilisé :", token)

    const data = await res.json()
    console.log("Réponse:", data)

    if (!res.ok) {
      throw new Error(data.message || "Erreur lors de la création")
    }

    onAddUser(data.user)
    toast({ title: "Succès", description: "Utilisateur ajouté avec succès" })
    setNewUser({ username: "", email: "", password: "", telephone: "", role: "gerant" })
  } catch (error: any) {
    toast({ title: "Erreur", description: error.message || "Impossible d'ajouter l'utilisateur", variant: "destructive" })
  }
}

  const handleUpdateUser = async () => {
    if (!editingUser) return

    try {
      const res = await fetch(`http://localhost:3500/api/admin/users/${editingUser._id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          username: editingUser.username,
          email: editingUser.email,
          telephone: editingUser.telephone,
          role: editingUser.role,
        }),
      })

      if (!res.ok) throw new Error("Erreur lors de la mise à jour")

      onEditUser(editingUser)
      toast({ title: "Succès", description: "Utilisateur mis à jour" })
      setEditingUser(null)
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message || "Échec de la mise à jour", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      {/* Barre de recherche et filtres */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Rechercher un utilisateur..."
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

        <div className="flex gap-2">
          <Button variant="outline" onClick={onExport}>
            <Download className="w-4 h-4 mr-2" /> Exporter
          </Button>

          {currentUser?.role === "superadmin" && (
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" /> Ajouter un utilisateur
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Ajouter un utilisateur</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Nom complet</Label>
                    <Input value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                  </div>
                  <div>
                    <Label>Téléphone (optionnel)</Label>
                    <Input value={newUser.telephone} onChange={(e) => setNewUser({ ...newUser, telephone: e.target.value })} />
                  </div>
                  <div>
                    <Label>Mot de passe</Label>
                    <Input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
                  </div>
                  <div>
                    <Label>Rôle</Label>
                    <Select value={newUser.role} onValueChange={(v: UserRole) => setNewUser({ ...newUser, role: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gerant">Gérant</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddUser}>Créer l'utilisateur</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div className="grid gap-4">
        {filteredUsers.map((u) => (
          <Card key={u._id}>
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback className="font-medium">{u.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">{u.username}</p>
                  <p className="text-sm text-muted-foreground">{u.email}</p>
                  {u.telephone && <p className="text-xs text-muted-foreground mt-1">{u.telephone}</p>}
                </div>
                <Badge className={getRoleColor(u.role)} variant="outline">
                  <Shield className="w-3 h-3 mr-1" />
                  {getRoleLabel(u.role)}
                </Badge>
              </div>

              {currentUser?.role === "superadmin" && u.role !== "superadmin" && (
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => setEditingUser(u)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Modifier l'utilisateur</DialogTitle></DialogHeader>
                      {editingUser && (
                        <div className="space-y-4 py-4">
                          <div><Label>Nom complet</Label><Input value={editingUser.username} onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })} /></div>
                          <div><Label>Email</Label><Input type="email" value={editingUser.email} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} /></div>
                          <div><Label>Téléphone</Label><Input value={editingUser.telephone || ""} onChange={(e) => setEditingUser({ ...editingUser, telephone: e.target.value })} /></div>
                          <div>
                            <Label>Rôle</Label>
                            <Select value={editingUser.role} onValueChange={(v: UserRole) => setEditingUser({ ...editingUser, role: v })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="gerant">Gérant</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                      <DialogFooter>
                        <Button onClick={handleUpdateUser}>Enregistrer</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button variant="ghost" size="icon" onClick={() => onDeleteUser(u._id!)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
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