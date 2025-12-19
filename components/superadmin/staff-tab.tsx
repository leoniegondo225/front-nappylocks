"use client";

import { useEffect, useState } from "react";
import {
  fetchEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
} from "@/lib/apiEmployees";

import { fetchSalons } from "@/lib/salon";

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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  const [salons, setSalons] = useState<any[]>([]);
  const [selectedSalon, setSelectedSalon] = useState<string>("");
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingSalons, setLoadingSalons] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    role: string;
    status: Employee["status"];
    specialties: string;
    joinDate: string;
  }>({
    name: "",
    email: "",
    phone: "",
    role: "",
    status: "active",
    specialties: "",
    joinDate: "",
  });

  // Charger les salons
  useEffect(() => {
    const loadSalons = async () => {
      setLoadingSalons(true);
      try {
        const data = await fetchSalons();
        setSalons(data);
      } catch (err) {
        console.error("Erreur chargement salons :", err);
        toast({
          title: "Erreur",
          description: "Impossible de charger la liste des salons",
          variant: "destructive",
        });
      } finally {
        setLoadingSalons(false);
      }
    };

    loadSalons();
  }, [toast]);

  // Charger les employés
  useEffect(() => {
    const loadEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const data = await fetchEmployees();
        setEmployees(data);
      } catch (err) {
        console.error("Erreur chargement employés :", err);
        toast({
          title: "Erreur",
          description: "Impossible de charger les employés",
          variant: "destructive",
        });
      } finally {
        setLoadingEmployees(false);
      }
    };

    loadEmployees();
  }, [toast]);

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "",
      status: "active",
      specialties: "",
      joinDate: "",
    });
    setSelectedSalon("");
    setEditingEmployee(null);
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
      joinDate: employee.joinDate,
    });

    // Correction sûre de l'accès à _id (résout l'erreur TypeScript "never")
    const salonIdValue = employee.salonId;
    const salonId = 
      salonIdValue && typeof salonIdValue === "object" && "_id" in salonIdValue
        ? (salonIdValue as any)._id
        : typeof salonIdValue === "string"
        ? salonIdValue
        : "";

    setSelectedSalon(salonId);
    setIsDialogOpen(true);
  };

  const handleAddEmployee = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.role) {
      return toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
    }
    if (!selectedSalon) {
      return toast({
        title: "Erreur",
        description: "Veuillez sélectionner un salon",
        variant: "destructive",
      });
    }
    if (!formData.joinDate) {
  return toast({
    title: "Erreur",
    description: "Veuillez renseigner la date d'embauche",
    variant: "destructive",
  });
}


    const newEmployee = {
      ...formData,
      salonId: selectedSalon,
      specialties: formData.specialties
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    

    try {
      await addEmployee(newEmployee);
      toast({ title: "Succès", description: "Employé ajouté avec succès" });
      setIsDialogOpen(false);
      resetForm();
      const data = await fetchEmployees();
      setEmployees(data);
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'ajout de l'employé",
        variant: "destructive",
      });
    }
  };

  const handleEditEmployee = async () => {
    if (!editingEmployee) return;

    const updatedData = {
      ...formData,
      salonId: selectedSalon || editingEmployee.salonId,
      specialties: formData.specialties
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      await updateEmployee(editingEmployee._id!, updatedData);
      toast({ title: "Succès", description: "Employé modifié avec succès" });
      setIsDialogOpen(false);
      resetForm();
      const data = await fetchEmployees();
      setEmployees(data);
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la modification",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEmployee = async (_id: string) => {
    try {
      await deleteEmployee(_id);
      toast({ title: "Succès", description: "Employé supprimé" });
      const data = await fetchEmployees();
      setEmployees(data);
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const getStatusColor = (status: Employee["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "vacation":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: Employee["status"]) =>
    status === "active" ? "Actif" : status === "inactive" ? "Inactif" : "En congé";

  if (loadingEmployees) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Chargement du personnel...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
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
                <Button className="bg-cyan-500 hover:bg-cyan-600">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Ajouter un employé
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingEmployee ? "Modifier l'employé" : "Ajouter un employé"}
                  </DialogTitle>
                  <DialogDescription>
                    Remplissez les informations de l'employé
                  </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Nom</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Jean Dupont"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="jean@example.com"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Téléphone</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="06 12 34 56 78"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Poste</Label>
                      <Input
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        placeholder="Coiffeur, Esthéticienne..."
                      />
                    </div>
                    <div className="space-y-1">
  <Label>Date d'embauche</Label>
  <Input
    type="date"
    value={formData.joinDate}
    onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
  />
</div>


                    <div className="space-y-1">
                      <Label>Statut</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: Employee["status"]) =>
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
                      <Label>Salon</Label>
                      <Select
                        value={selectedSalon}
                        onValueChange={setSelectedSalon}
                        disabled={loadingSalons}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={loadingSalons ? "Chargement des salons..." : "Sélectionner un salon"}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {salons.map((salon) => (
                            <SelectItem key={salon._id} value={salon._id}>
                              {salon.nom} {salon.ville && `- ${salon.ville}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1">
                    <Label>Spécialités (séparées par des virgules)</Label>
                    <Textarea
                      rows={3}
                      value={formData.specialties}
                      onChange={(e) =>
                        setFormData({ ...formData, specialties: e.target.value })
                      }
                      placeholder="Tresses, Coloration, Soins visage, Manucure..."
                      className="resize-none"
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

      <Card>
        <CardHeader>
          <CardTitle>Liste du personnel ({employees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Employé</th>
                  <th className="text-left py-3 px-4 font-medium">Poste</th>
                  <th className="text-left py-3 px-4 font-medium">Contact</th>
                  <th className="text-left py-3 px-4 font-medium">Embauche</th>
                  <th className="text-left py-3 px-4 font-medium">Statut</th>
                  <th className="text-left py-3 px-4 font-medium">Spécialités</th>
                  <th className="text-center py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                      Aucun employé enregistré pour le moment.
                    </td>
                  </tr>
                ) : (
                  employees.map((employee) => (
                    <tr key={employee._id} className="border-b hover:bg-muted/50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-cyan-100 text-cyan-800 font-medium">
                              {getInitials(employee.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{employee.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">{employee.role}</td>
                      <td className="py-4 px-4">
                        <div className="space-y-1 text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {employee.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {employee.phone}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(employee.joinDate).toLocaleDateString("fr-FR")}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getStatusColor(employee.status)}>
                          {getStatusLabel(employee.status)}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">
                        {employee.specialties.join(", ")}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(employee)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:border-red-300"
                            onClick={() => handleDeleteEmployee(employee._id!)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}