"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/auth-store";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Search,
  Edit2,
  Phone,
  Mail,
  User,
  Calendar,
  DollarSign,
} from "lucide-react";

/* ================= TYPES ================= */

interface CreatedBy {
  _id: string;
  username: string;
}

interface Service {
  _id: string;
  name: string;
  price: number;
  duration: number;
  isActive: boolean;
}

interface Client {
  _id: string;
  prenom: string;
  nom: string;
  email?: string;
  telephone: string;
  notes?: string;
  totalVisits: number;
  lastVisit?: string;
  totalSpent: number;
  createdBy?: CreatedBy;
}

/* ================= UTILS ================= */

const getClientBadge = (visits: number) => {
  if (visits >= 15) return <Badge className="bg-yellow-500 text-white">⭐ VIP</Badge>;
  if (visits >= 10) return <Badge className="bg-blue-600 text-white">💎 Fidèle</Badge>;
  if (visits >= 3) return <Badge className="bg-emerald-600 text-white">✓ Habitué</Badge>;
  return <Badge variant="secondary">✨ Nouveau</Badge>;
};

/* ================= COMPONENT ================= */

export function ClientsTab() {
  const { toast } = useToast();
  const token = useAuthStore((state) => state.token);

  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPrestationDialogOpen, setIsPrestationDialogOpen] = useState(false);

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [prestationClient, setPrestationClient] = useState<Client | null>(null);

  const [prestationForm, setPrestationForm] = useState({
    serviceId: "",
    employee: "",
    price: "",
    notes: "",
  });

  const employees = ["Amina", "Fatou", "Yasmine", "Sophie", "Lucas"];

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [clientsRes, servicesRes] = await Promise.all([
          fetch("http://localhost:3500/api/allclient", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:3500/api/getAllservice", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!clientsRes.ok || !servicesRes.ok) {
          throw new Error("Erreur lors du chargement des données");
        }

        const clientsData = await clientsRes.json();
        const servicesData = await servicesRes.json();

        setClients(Array.isArray(clientsData) ? clientsData : []);
        setServices(
          Array.isArray(servicesData)
            ? servicesData.filter((s: Service) => s.isActive)
            : []
        );
      } catch (error: any) {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, toast]);

  /* ================= FILTER ================= */

  const filteredClients = clients.filter(
    (c) =>
      `${c.prenom} ${c.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.telephone.includes(searchTerm) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  /* ================= EDIT CLIENT ================= */

  const openEditModal = (client: Client) => {
    setSelectedClient({ ...client });
    setIsEditDialogOpen(true);
  };

  const handleUpdateClient = async () => {
    if (!selectedClient || !token) return;

    try {
      const res = await fetch(
        `http://localhost:3500/api/updateclient/${selectedClient._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(selectedClient),
        }
      );

      if (!res.ok) throw new Error();

      const updated = await res.json();
      setClients((prev) =>
        prev.map((c) => (c._id === updated._id ? updated : c))
      );

      toast({ title: "Client mis à jour" });
      setIsEditDialogOpen(false);
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le client",
        variant: "destructive",
      });
    }
  };

  /* ================= PRESTATION ================= */

  const openPrestationModal = (client: Client) => {
    setPrestationClient(client);
    setPrestationForm({ serviceId: "", employee: "", price: "", notes: "" });
    setIsPrestationDialogOpen(true);
  };

  const selectedService = services.find(
    (s) => s._id === prestationForm.serviceId
  );

  useEffect(() => {
    if (selectedService) {
      setPrestationForm((p) => ({
        ...p,
        price: selectedService.price.toString(),
      }));
    }
  }, [selectedService]);

  const handleAddPrestation = async () => {
    if (!prestationClient || !selectedService || !token) return;

    const price = Number(prestationForm.price) || 0;

    try {
      await fetch("http://localhost:3500/api/createprestation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clientId: prestationClient._id,
          serviceId: selectedService._id,
          employee: prestationForm.employee,
          price,
          notes: prestationForm.notes,
        }),
      });

      const updatedClient = {
        ...prestationClient,
        totalVisits: prestationClient.totalVisits + 1,
        totalSpent: prestationClient.totalSpent + price,
        lastVisit: new Date().toISOString(),
      };

      const res = await fetch(
        `http://localhost:3500/api/updateclient/${prestationClient._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedClient),
        }
      );

      const finalClient = await res.json();

      setClients((prev) =>
        prev.map((c) => (c._id === finalClient._id ? finalClient : c))
      );

      toast({ title: "Prestation enregistrée" });
      setIsPrestationDialogOpen(false);
    } catch {
      toast({
        title: "Erreur",
        description: "Échec de l'enregistrement",
        variant: "destructive",
      });
    }
  };

  /* ================= UI ================= */

  if (loading) {
    return <p className="text-center py-20">Chargement...</p>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Gestion des clients</h2>

      <Input
        placeholder="Rechercher..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {filteredClients.map((client) => (
        <div key={client._id} className="border rounded-lg p-4 space-y-3">
          <div className="flex justify-between">
            <div>
              <p className="font-semibold text-lg">
                {client.prenom} {client.nom}
              </p>
              <p className="text-sm text-muted-foreground">
                {client.createdBy
                  ? `Créé par ${client.createdBy.username}`
                  : "—"}
              </p>
            </div>
            {getClientBadge(client.totalVisits)}
          </div>

          <div className="text-sm">
            Total dépensé : {client.totalSpent} €
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => openEditModal(client)}>
              <Edit2 className="w-4 h-4 mr-2" /> Modifier
            </Button>
            <Button size="sm" onClick={() => openPrestationModal(client)}>
              Nouvelle prestation
            </Button>
          </div>
        </div>
      ))}

      {/* EDIT */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le client</DialogTitle>
          </DialogHeader>

          {selectedClient && (
            <>
              <Input
                value={selectedClient.prenom}
                onChange={(e) =>
                  setSelectedClient({ ...selectedClient, prenom: e.target.value })
                }
              />
              <Input
                value={selectedClient.nom}
                onChange={(e) =>
                  setSelectedClient({ ...selectedClient, nom: e.target.value })
                }
              />
            </>
          )}

          <DialogFooter>
            <Button onClick={handleUpdateClient}>Mettre à jour</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PRESTATION */}
      <Dialog
        open={isPrestationDialogOpen}
        onOpenChange={setIsPrestationDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle prestation</DialogTitle>
          </DialogHeader>

          <Select
            value={prestationForm.serviceId}
            onValueChange={(v) =>
              setPrestationForm({ ...prestationForm, serviceId: v })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir une prestation" />
            </SelectTrigger>
            <SelectContent>
              {services.map((s) => (
                <SelectItem key={s._id} value={s._id}>
                  {s.name} — {s.price}€
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleAddPrestation}>
            Enregistrer
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
