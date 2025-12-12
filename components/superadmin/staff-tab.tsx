"use client";

import { useEffect, useState } from "react";
import {
  fetchEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
} from "@/lib/apiEmployees";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Textarea } from "@/components/ui/textarea";
import { UserPlus, Edit, Trash2, Mail, Phone, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Employee } from "@/types/Employee";



export function StaffTab() {
  const { toast } = useToast();
const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);


 const [formData, setFormData] = useState<{
  name: string;
  email: string;
  phone: string;
  role: string;
  status: Employee["status"]; // ✅ utilise le type exact
  specialties: string;
}>({
  name: "",
  email: "",
  phone: "",
  role: "",
  status: "active", // OK
  specialties: "",
});

  // 📌 Charger depuis le backend
  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    const data = await fetchEmployees();
    setEmployees(data);
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "",
      status: "active",
      specialties: "",
    });
    setEditingEmployee(null);
  };

  // 📌 Ajouter
  const handleAddEmployee = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.role) {
      return toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
    }

    const newEmployee = {
      ...formData,
      specialties: formData.specialties.split(",").map((s) => s.trim()),
    };

    await addEmployee(newEmployee);
    toast({ title: "Succès", description: "Employé ajouté avec succès" });

    setIsDialogOpen(false);
    resetForm();
    loadEmployees();
  };

  // 📌 Modifier
 const handleEditEmployee = async () => {
  if (!editingEmployee) return; // 🚀 empêche les erreurs

  await updateEmployee(editingEmployee._id!, {
    ...formData,
    specialties: formData.specialties.split(",").map((s) => s.trim()),
  });

  toast({ title: "Succès", description: "Employé modifié" });
  setIsDialogOpen(false);
  loadEmployees();
};


  // 📌 Supprimer
  const handleDeleteEmployee = async (_id: string) => {
    await deleteEmployee(_id);
    toast({ title: "Supprimé", description: "Employé supprimé" });
    loadEmployees();
  };

  const openEditDialog = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      role: employee.role,
      status: employee.status,
      specialties: employee.specialties.join(", "),
    });
    setIsDialogOpen(true);
  };

  const getStatusColor = (status : Employee["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "vacation":
        return "bg-orange-100 text-orange-800";
    }
  };

  const getStatusLabel = (status:Employee["status"] ) => {
    return status === "active"
      ? "Actif"
      : status === "inactive"
      ? "Inactif"
      : "En congé";
  };

  if (loading)
    return (
      <div className="text-center py-10 text-muted-foreground">
        Chargement du personnel...
      </div>
    );

  return (
    <div className="space-y-4 md:space-y-6">
      {/* --- Header --- */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between">
            <div>
              <CardTitle>Gestion du Personnel</CardTitle>
              <CardDescription>Ajoutez et gérez votre équipe</CardDescription>
            </div>

            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button className="bg-cyan-500 hover:bg-cyan-600 mt-4 sm:mt-0">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Ajouter un employé
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingEmployee ? "Modifier l'employé" : "Ajouter un employé"}
                  </DialogTitle>
                  <DialogDescription>Remplissez les informations</DialogDescription>
                </DialogHeader>

                {/* Formulaire */}
                <div className="space-y-3 py-3">
                 
  {(["name", "email", "phone", "role"] as const).map((field) => (
    <div key={field} className="space-y-1">
      <Label>{field.toUpperCase()}</Label>
      <Input
        value={formData[field as keyof typeof formData]}
        onChange={(e) =>
          setFormData({ ...formData, [field]: e.target.value })
        }
      />
    </div>
  ))}



                  <div className="space-y-1">
                    <Label>Statut</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value : Employee["status"]) =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="inactive">Inactif</SelectItem>
                        <SelectItem value="vacation">En congé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label>Spécialités</Label>
                    <Textarea
                      rows={3}
                      value={formData.specialties}
                      onChange={(e) =>
                        setFormData({ ...formData, specialties: e.target.value })
                      }
                      placeholder="Tresses, Coloration..."
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>

                  <Button
                    className="bg-cyan-500 hover:bg-cyan-600"
                    onClick={editingEmployee ? handleEditEmployee : handleAddEmployee}
                  >
                    {editingEmployee ? "Modifier" : "Ajouter"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* --- Liste des employés --- */}
      <div className="grid gap-4">
        {employees.map((employee) => (
          <Card key={employee._id}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <Avatar>
                  <AvatarImage src={employee.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {employee.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className="font-semibold">{employee.name}</h3>
                    <Badge className={getStatusColor(employee.status)}>
                      {getStatusLabel(employee.status)}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">{employee.role}</p>

                  <div className="mt-2 text-sm text-muted-foreground space-y-1">
                    <div className="flex gap-2 items-center">
                      <Mail className="w-4 h-4" />
                      {employee.email}
                    </div>

                    <div className="flex gap-2 items-center">
                      <Phone className="w-4 h-4" />
                      {employee.phone}
                    </div>

                    <div className="flex gap-2 items-center">
                      <Calendar className="w-4 h-4" />
                      Embauché le{" "}
                      {new Date(employee.joinDate).toLocaleDateString("fr-FR")}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(employee)}
                    >
                      <Edit className="w-4 h-4 mr-2" /> Modifier
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500"
                      onClick={() => handleDeleteEmployee(employee._id!)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
