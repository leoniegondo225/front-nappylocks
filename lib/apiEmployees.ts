import { Employee } from "@/types/Employee";

// Routes adaptées à ton backend actuel
const BASE_URL = "http://localhost:3500/api";

export async function fetchEmployees(): Promise<Employee[]> {
  try {
    const res = await fetch(`${BASE_URL}/getallemployee`);
    if (!res.ok) {
      console.error("Erreur API fetchEmployees:", res.statusText);
      return [];
    }
    const data = await res.json();

    // Si le backend renvoie { data: [...] }, on retourne data.data
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;

    return [];
  } catch (err) {
    console.error("Erreur fetchEmployees:", err);
    return [];
  }
}

export async function addEmployee(data: Partial<Employee>): Promise<Employee> {
  const res = await fetch(`${BASE_URL}/createemployee`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateEmployee(id: string, data: Partial<Employee>): Promise<Employee> {
  const res = await fetch(`${BASE_URL}/update/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteEmployee(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE_URL}/delete/${id}`, {
    method: "DELETE",
  });
  return res.json();
}
