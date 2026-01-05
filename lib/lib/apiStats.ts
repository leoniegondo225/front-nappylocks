import { useAuthStore } from "@/lib/auth-store";

const BASE_URL = "http://localhost:3500/api";

const getToken = () => useAuthStore.getState().token || "";

export async function fetchRevenueStats(): Promise<{
  dailyRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
}> {
  const token = getToken();
  if (!token) throw new Error("Non authentifié");

  const res = await fetch(`${BASE_URL}/stats/revenue`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Erreur chargement stats revenus");

  return await res.json();
}