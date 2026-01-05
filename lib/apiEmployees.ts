import { Employee } from "@/types/Employee";
import { useAuthStore } from "@/lib/auth-store";

const BASE_URL = "http://localhost:3500/api";

// Récupère le token depuis le store Zustand (fiable à 100%)
const getToken = () => {
  return useAuthStore.getState().token || "";
};

export async function fetchEmployees(): Promise<Employee[]> {
  try {
    const token = getToken();
    if (!token) {
      console.warn("Token manquant - redirection vers login recommandée");
      return [];
    }

    const res = await fetch(`${BASE_URL}/getallemployee`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorText = await res.json().catch(() => ({}));
      console.error("Erreur API fetchEmployees:", res.status, errorText);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : data.employees || data.data || [];
  } catch (err) {
    console.error("Erreur réseau fetchEmployees:", err);
    return [];
  }
}

export async function addEmployee(data: Partial<Employee>): Promise<Employee | null> {
  try {
    const token = getToken();
    if (!token) {
      console.warn("Impossible d'ajouter : token manquant");
      return null;
    }

    const res = await fetch(`${BASE_URL}/createemployee`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      console.error("Erreur création employé:", error);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error("Erreur addEmployee:", err);
    return null;
  }
}

export async function updateEmployee(id: string, data: Partial<Employee>): Promise<Employee | null> {
  try {
    const token = getToken();
    if (!token) return null;

    const res = await fetch(`${BASE_URL}/update-employees/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      console.error("Erreur mise à jour:", await res.json().catch(() => ({})));
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error("Erreur updateEmployee:", err);
    return null;
  }
}

export async function deleteEmployee(id: string): Promise<{ success: boolean } | null> {
  try {
    const token = getToken();
    if (!token) return null;

    const res = await fetch(`${BASE_URL}/delete-employees/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Erreur deleteEmployee:", err);
    return null;
  }
}