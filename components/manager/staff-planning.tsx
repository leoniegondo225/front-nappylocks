"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Edit } from "lucide-react"

interface DaySchedule {
  day: string
  date: string
  schedule: string
  status: "working" | "休" | "休息" | "congé"
}

interface EmployeeSchedule {
  name: string
  schedule: DaySchedule[]
}

const mockSchedule: EmployeeSchedule[] = [
  {
    name: "Amina",
    schedule: [
      { day: "LUN. 15", date: "2024-07-15", schedule: "09:00 - 17:00", status: "working" },
      { day: "MAR. 16", date: "2024-07-16", schedule: "09:00 - 17:00", status: "working" },
      { day: "MER. 17", date: "2024-07-17", schedule: "Repos", status: "休" },
      { day: "JEU. 18", date: "2024-07-18", schedule: "10:00 - 18:00", status: "working" },
      { day: "VEN. 19", date: "2024-07-19", schedule: "10:00 - 18:00", status: "working" },
      { day: "SAM. 20", date: "2024-07-20", schedule: "09:00 - 15:00", status: "working" },
      { day: "DIM. 21", date: "2024-07-21", schedule: "Repos", status: "休" },
    ],
  },
  {
    name: "Fatou",
    schedule: [
      { day: "LUN. 15", date: "2024-07-15", schedule: "Repos", status: "休" },
      { day: "MAR. 16", date: "2024-07-16", schedule: "11:00 - 19:00", status: "working" },
      { day: "MER. 17", date: "2024-07-17", schedule: "11:00 - 19:00", status: "working" },
      { day: "JEU. 18", date: "2024-07-18", schedule: "11:00 - 19:00", status: "working" },
      { day: "VEN. 19", date: "2024-07-19", schedule: "12:00 - 20:00", status: "working" },
      { day: "SAM. 20", date: "2024-07-20", schedule: "10:00 - 18:00", status: "working" },
      { day: "DIM. 21", date: "2024-07-21", schedule: "Repos", status: "休" },
    ],
  },
  {
    name: "Yasmine",
    schedule: [
      { day: "LUN. 15", date: "2024-07-15", schedule: "10:00 - 16:00", status: "working" },
      { day: "MAR. 16", date: "2024-07-16", schedule: "10:00 - 16:00", status: "working" },
      { day: "MER. 17", date: "2024-07-17", schedule: "10:00 - 16:00", status: "working" },
      { day: "JEU. 18", date: "2024-07-18", schedule: "Repos", status: "休" },
      { day: "VEN. 19", date: "2024-07-19", schedule: "Repos", status: "休" },
      { day: "SAM. 20", date: "2024-07-20", schedule: "Congé", status: "congé" },
      { day: "DIM. 21", date: "2024-07-21", schedule: "Repos", status: "休" },
    ],
  },
]

export function StaffPlanning() {
  const [weekOffset, setWeekOffset] = useState(0)

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-lg md:text-xl">Planning du Personnel</CardTitle>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setWeekOffset(weekOffset - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs sm:text-sm font-medium whitespace-nowrap">15 - 21 Juillet 2024</span>
              <Button variant="outline" size="icon" onClick={() => setWeekOffset(weekOffset + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <Button className="bg-cyan-500 hover:bg-cyan-600 w-full sm:w-auto">
              <Edit className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Modifier le planning</span>
              <span className="sm:hidden">Modifier</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-2 px-2">
          <div className="min-w-max">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-3 pr-4 md:pr-8 text-xs md:text-sm font-medium text-muted-foreground sticky left-0 bg-white dark:bg-gray-900">
                    EMPLOYÉ
                  </th>
                  {mockSchedule[0].schedule.map((day) => (
                    <th
                      key={day.day}
                      className="text-left pb-3 px-2 md:px-3 text-xs md:text-sm font-medium text-muted-foreground min-w-[100px] md:min-w-[120px]"
                    >
                      {day.day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockSchedule.map((emp) => (
                  <tr key={emp.name} className="border-b last:border-0">
                    <td className="py-3 md:py-4 pr-4 md:pr-8 font-medium text-sm md:text-base sticky left-0 bg-white dark:bg-gray-900">
                      {emp.name}
                    </td>
                    {emp.schedule.map((day) => (
                      <td key={day.date} className="py-3 md:py-4 px-2 md:px-3">
                        {day.status === "working" ? (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800 hover:bg-green-100 font-normal text-xs whitespace-nowrap"
                          >
                            {day.schedule}
                          </Badge>
                        ) : day.status === "congé" ? (
                          <Badge
                            variant="secondary"
                            className="bg-orange-100 text-orange-800 hover:bg-orange-100 font-normal text-xs whitespace-nowrap"
                          >
                            {day.schedule}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs md:text-sm">{day.schedule}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
