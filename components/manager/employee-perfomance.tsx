import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Employee {
  name: string
  appointments: number
  occupancy: string
  revenue: string
}

const employees: Employee[] = [
  { name: "Amina", appointments: 4, occupancy: "75%", revenue: "€350" },
  { name: "Fatou", appointments: 5, occupancy: "80%", revenue: "€400" },
  { name: "Yasmine", appointments: 3, occupancy: "60%", revenue: "€100" },
]

export function EmployeePerformance() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Performance des Employés</CardTitle>
      </CardHeader>
      <CardContent>
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
                <tr key={emp.name} className="border-b last:border-0">
                  <td className="py-4 font-medium">{emp.name}</td>
                  <td className="py-4">{emp.appointments}</td>
                  <td className="py-4">{emp.occupancy}</td>
                  <td className="py-4 font-semibold">{emp.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-3">
          {employees.map((emp) => (
            <div key={emp.name} className="border rounded-lg p-4">
              <p className="font-semibold mb-3">{emp.name}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Rendez-vous</p>
                  <p className="font-medium">{emp.appointments}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Taux d'occupation</p>
                  <p className="font-medium">{emp.occupancy}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Chiffre d'affaires</p>
                  <p className="font-semibold text-lg">{emp.revenue}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
