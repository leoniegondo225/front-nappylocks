"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useAuthSafe } from "@/hooks/useAuthSafe"
import { useEffect, useState } from "react"

interface PopularService {
  name: string
  bookings: number
}

export function PopularServices() {
  const [services, setServices] = useState<PopularService[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { token, isAuthenticated, isLoading: isAuthLoading } = useAuthSafe()

  // Max de réservations pour la jauge (tu peux changer cette valeur)
  const MAX_BOOKINGS = 5

  useEffect(() => {
    const fetchPopularServices = async () => {
      if (isAuthLoading) return

      if (!isAuthenticated || !token) {
        setError("Connexion requise")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch('http://localhost:3500/api/popular-services', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          if (response.status === 401) {
            setError("Session expirée")
            return
          }
          throw new Error("Erreur lors du chargement des services populaires")
        }

        const data = await response.json()
        setServices(data)
      } catch (err: any) {
        console.error("Erreur fetch popular services:", err)
        setError("Impossible de charger les services populaires")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPopularServices()
  }, [token, isAuthenticated, isAuthLoading])

  // Chargement
  if (isLoading || isAuthLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Services Populaires</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            Chargement des services...
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
          <CardTitle>Services Populaires</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-destructive">
            {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Pas de données
  if (services.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Services Populaires</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            Aucun service réservé pour le moment
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Services Populaires</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {services.map((service,index) => {
          const progressValue = (service.bookings / MAX_BOOKINGS) * 100

          return (
            <div key={index}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">{service.name}</span>
                <span className="text-sm text-muted-foreground">
                  {service.bookings} réservations
                </span>
              </div>
              <Progress value={progressValue} className="h-2 bg-gray-200">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressValue}%` }}
                />
              </Progress>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}