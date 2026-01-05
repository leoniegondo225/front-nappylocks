"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthSafe } from "@/hooks/useAuthSafe"
import { useEffect, useState } from "react"

interface EmployeePerformanceData {
  name: string
  appointments: number
  occupancy: string
  revenue: string
}

export function EmployeePerformance() {
  const [employees, setEmployees] = useState<EmployeePerformanceData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { token, isAuthenticated, isLoading: isAuthLoading } = useAuthSafe()

  useEffect(() => {
    const fetchPerformances = async () => {
      // Attendre que l'auth soit prête
      if (isAuthLoading) return

      if (!isAuthenticated || !token) {
        setError("Vous devez être connecté pour voir les performances.")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch('http://localhost:3500/api/employee-performances', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Ton token JWT
          },
        })

        if (!response.ok) {
          if (response.status === 401) {
            setError("Session expirée. Veuillez vous reconnecter.")
            // Optionnel : déclencher logout automatique
            // useAuthStore.getState().logout()
            return
          }
          if (response.status === 403) {
            setError("Accès refusé.")
            return
          }
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || "Erreur lors du chargement des données")
        }

        const data = await response.json()
        setEmployees(data)
      } catch (err: any) {
        console.error("Erreur fetch performances:", err)
        setError(err.message || "Impossible de charger les performances des employés.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPerformances()
  }, [token, isAuthenticated, isAuthLoading]) // Dépendances critiques

  // Chargement initial (auth ou données)
  if (isAuthLoading || (isLoading && isAuthenticated)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Performance des Employés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-10 text-center text-muted-foreground">
            Chargement des performances...
          </div>
        </CardContent>
      </Card>
    )
  }

  // Erreur
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Performance des Employés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-10 text-center text-destructive">
            {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Succès : affichage des données
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Performance des Employés</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop : Tableau */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="pb-3 font-medium">EMPLOYÉ</th>
                <th className="pb-3 font-medium">RENDEZ-VOUS</th>
                <th className="pb-3 font-medium">TAUX D'OCCUPATION</th>
                <th className="pb-3 font-medium">CHIFFRE D'AFFAIRES GÉNÉRÉ</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.name} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="py-4 font-medium">{emp.name}</td>
                  <td className="py-4">{emp.appointments}</td>
                  <td className="py-4">{emp.occupancy}</td>
                  <td className="py-4 font-semibold">{emp.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile : Cartes */}
        <div className="md:hidden space-y-4">
          {employees.map((emp) => (
            <div key={emp.name} className="border rounded-lg p-5 bg-card">
              <p className="font-semibold text-lg mb-4">{emp.name}</p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rendez-vous</span>
                  <span className="font-medium">{emp.appointments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taux d'occupation</span>
                  <span className="font-medium">{emp.occupancy}</span>
                </div>
                <div className="flex justify-between pt-3 border-t">
                  <span className="text-muted-foreground">Chiffre d'affaires</span>
                  <span className="font-semibold text-lg">{emp.revenue}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Aucun employé */}
        {employees.length === 0 && !isLoading && (
          <div className="text-center py-10 text-muted-foreground">
            Aucun employé trouvé pour ce salon.
          </div>
        )}
      </CardContent>
    </Card>
  )
}