export type Salon = {
  _id: string;
  nom: string;
};

const BASE_URL = "http://localhost:3500/api";

export async function fetchSalons(): Promise<Salon[]> {
  const res = await fetch(`${BASE_URL}/getallsalons`);
  if (!res.ok) return [];
  return res.json();
}
