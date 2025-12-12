import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface Service {
  name: string
  bookings: number
  maxBookings: number
}

const services: Service[] = [
  { name: "Tresses Africaines", bookings: 4, maxBookings: 5 },
  { name: "Coloration", bookings: 3, maxBookings: 5 },
  { name: "Coupe Homme", bookings: 2, maxBookings: 5 },
  { name: "Soin Profond", bookings: 2, maxBookings: 5 },
  { name: "Défrisage", bookings: 1, maxBookings: 5 },
]

export function PopularServices() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Services Populaires</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {services.map((service) => (
          <div key={service.name}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">{service.name}</span>
              <span className="text-sm text-muted-foreground">{service.bookings} réservations</span>
            </div>
            <Progress value={(service.bookings / service.maxBookings) * 100} className="h-2 bg-gray-200">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-full transition-all" />
            </Progress>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
