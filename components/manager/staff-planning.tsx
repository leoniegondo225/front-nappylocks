"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Edit } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/lib/auth-store"

interface DaySchedule {
  date: string
  dayLabel: string
  hours?: string
  status: "working" | "repos" | "congé" | "autre"
  note?: string
}

interface Employee {
  _id: string
  name: string
  schedule?: DaySchedule[]
}

export function StaffPlanning({ salonId }: { salonId: string }) {
  const [weekOffset, setWeekOffset] = useState(0)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("")
  const [editedSchedule, setEditedSchedule] = useState<DaySchedule[]>([])

  const { toast } = useToast()
  const token = useAuthStore((state) => state.token)

  // Génère les 7 jours de la semaine actuelle en fonction du weekOffset
  const generateCurrentWeek = (): DaySchedule[] => {
    const days: DaySchedule[] = []
    const start = new Date()
    start.setDate(start.getDate() + weekOffset * 7)
    start.setHours(0, 0, 0, 0)

    for (let i = 0; i < 7; i++) {
      const date = new Date(start)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split("T")[0]
      const dayLabel = date
        .toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" })
        .toUpperCase()
        .replace(".", "")

      days.push({
        date: dateStr,
        dayLabel,
        status: "working",
        hours: "09:00 - 18:00",
        note: "",
      })
    }
    return days
  }

  // Récupère le planning d'un employé pour la semaine courante
  const getEmployeeWeekSchedule = (employee: Employee): DaySchedule[] => {
    const currentWeek = generateCurrentWeek()
    const savedSchedule = employee.schedule || []

    return currentWeek.map((defaultDay) => {
      const savedDay = savedSchedule.find((d) => d.date === defaultDay.date)
      return savedDay || defaultDay
    })
  }

  // Chargement des employés
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!token || !salonId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const res = await fetch(`http://localhost:3500/api/employees/salon/${salonId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!res.ok) {
          const error = await res.json().catch(() => ({}))
          throw new Error(error.message || "Erreur serveur")
        }

        const data = await res.json()
        setEmployees(Array.isArray(data) ? data : [])
      } catch (err: any) {
        console.error("Erreur chargement employés :", err)
        toast({
          title: "Erreur",
          description: err.message || "Impossible de charger les employés",
          variant: "destructive",
        })
        setEmployees([])
      } finally {
        setLoading(false)
      }
    }

    fetchEmployees()
  }, [salonId, token, toast])

  // Réinitialise le planning édité quand on sélectionne un employé
  useEffect(() => {
    if (selectedEmployeeId && employees.length > 0) {
      const employee = employees.find((e) => e._id === selectedEmployeeId)
      if (employee) {
        const weekSchedule = getEmployeeWeekSchedule(employee)
        setEditedSchedule(weekSchedule)
      }
    }
  }, [selectedEmployeeId, employees, weekOffset])

  // Sauvegarde d'un jour individuel
  const handleSaveDay = async (employeeId: string, dayIndex: number, updatedDay: DaySchedule) => {
    const employee = employees.find((e) => e._id === employeeId)
    if (!employee) return

    const currentWeekSchedule = getEmployeeWeekSchedule(employee)
    currentWeekSchedule[dayIndex] = updatedDay

    // Fusionner avec le planning existant (hors semaine courante)
    const allOtherDays = (employee.schedule || []).filter(
      (d) => !currentWeekSchedule.some((wd) => wd.date === d.date)
    )

    const newFullSchedule = [...allOtherDays, ...currentWeekSchedule]

    try {
      const res = await fetch(`http://localhost:3500/api/employees/${employeeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ schedule: newFullSchedule }),
      })

      if (!res.ok) throw new Error("Échec mise à jour")

      setEmployees((prev) =>
        prev.map((emp) =>
          emp._id === employeeId ? { ...emp, schedule: newFullSchedule } : emp
        )
      )

      toast({ title: "Succès", description: "Jour mis à jour" })
    } catch (err) {
      toast({ title: "Erreur", description: "Échec de la sauvegarde", variant: "destructive" })
    }
  }

  // Sauvegarde du planning complet (modal global)
  const handleSaveGlobalPlanning = async () => {
    if (!selectedEmployeeId || !token) return

    const employee = employees.find((e) => e._id === selectedEmployeeId)
    if (!employee) return

    const allOtherDays = (employee.schedule || []).filter(
      (d) => !editedSchedule.some((wd) => wd.date === d.date)
    )

    const newFullSchedule = [...allOtherDays, ...editedSchedule]

    try {
      const res = await fetch(`http://localhost:3500/api/employees/${selectedEmployeeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ schedule: newFullSchedule }),
      })

      if (!res.ok) throw new Error("Échec mise à jour")

      setEmployees((prev) =>
        prev.map((emp) =>
          emp._id === selectedEmployeeId ? { ...emp, schedule: newFullSchedule } : emp
        )
      )

      toast({ title: "Succès", description: "Planning complet mis à jour" })
      setIsEditModalOpen(false)
    } catch (err) {
      toast({ title: "Erreur", description: "Échec de la sauvegarde", variant: "destructive" })
    }
  }

  // Libellé de la semaine
  const getWeekLabel = () => {
    const start = new Date()
    start.setDate(start.getDate() + weekOffset * 7)
    const end = new Date(start)
    end.setDate(end.getDate() + 6)

    const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }
    return `${start.toLocaleDateString("fr-FR", options)} - ${end.toLocaleDateString("fr-FR", options)}`
  }

  const currentWeekDays = generateCurrentWeek()

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Chargement des employés du salon...
        </CardContent>
      </Card>
    )
  }

  if (employees.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Aucun employé trouvé pour ce salon.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-lg md:text-xl">Planning du Personnel</CardTitle>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setWeekOffset(weekOffset - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium whitespace-nowrap">{getWeekLabel()}</span>
              <Button variant="outline" size="icon" onClick={() => setWeekOffset(weekOffset + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-cyan-500 hover:bg-cyan-600">
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier le planning
                </Button>
              </DialogTrigger>
              <DialogContent className="w-full max-w-lg sm:max-w-2xl md:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl sm:text-2xl">Modifier le planning complet</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div>
                    <Label className="text-base">Employé</Label>
                    <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Sélectionner un employé" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((emp) => (
                          <SelectItem key={emp._id} value={emp._id}>
                            {emp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedEmployeeId && editedSchedule.length > 0 && (
                    <div className="space-y-6">
                      {editedSchedule.map((day, index) => (
                        <div key={day.date} className="border rounded-lg p-4 space-y-4 bg-muted/30">
                          <h4 className="font-semibold text-lg">{day.dayLabel}</h4>

                          <div>
                            <Label>Statut</Label>
                            <Select
                              value={day.status}
                              onValueChange={(v) => {
                                const newSch = [...editedSchedule]
                                newSch[index].status = v as DaySchedule["status"]
                                if (v !== "working" && v !== "autre") {
                                  newSch[index].hours = undefined
                                }
                                setEditedSchedule(newSch)
                              }}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="working">Travail</SelectItem>
                                <SelectItem value="repos">Repos</SelectItem>
                                <SelectItem value="congé">Congé</SelectItem>
                                <SelectItem value="autre">Autre</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {(day.status === "working" || day.status === "autre") && (
                            <div>
                              <Label>Heures</Label>
                              <Input
                                className="mt-1"
                                value={day.hours || ""}
                                onChange={(e) => {
                                  const newSch = [...editedSchedule]
                                  newSch[index].hours = e.target.value || undefined
                                  setEditedSchedule(newSch)
                                }}
                                placeholder="ex: 09:00 - 17:00"
                              />
                            </div>
                          )}

                          <div>
                            <Label>Note</Label>
                            <Textarea
                              className="mt-1"
                              value={day.note || ""}
                              onChange={(e) => {
                                const newSch = [...editedSchedule]
                                newSch[index].note = e.target.value || undefined
                                setEditedSchedule(newSch)
                              }}
                              rows={3}
                              placeholder="Pause, raison du congé, etc."
                            />
                          </div>
                        </div>
                      ))}

                      <Button onClick={handleSaveGlobalPlanning} size="lg" className="w-full bg-cyan-500 hover:bg-cyan-600">
                        Enregistrer tout le planning
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-max border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 pr-8 text-sm font-medium text-muted-foreground sticky left-0 bg-background z-10">
                  EMPLOYÉ
                </th>
                {currentWeekDays.map((day) => (
                  <th key={day.date} className="text-center py-3 px-3 text-sm font-medium text-muted-foreground min-w-[130px]">
                    {day.dayLabel}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => {
                const weekSchedule = getEmployeeWeekSchedule(emp)

                return (
                  <tr key={emp._id} className="border-b last:border-0">
                    <td className="py-4 pr-8 font-medium sticky left-0 bg-background z-10">
                      {emp.name}
                    </td>
                    {weekSchedule.map((day, dayIndex) => {
                      const isWorking = day.status === "working"
                      const isCongé = day.status === "congé"
                      const isRepos = day.status === "repos"

                      return (
                        <td key={day.date} className="py-4 px-3 text-center">
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="w-full text-left block">
                                {isWorking ? (
                                  <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                                    {day.hours || "Horaire à définir"}
                                  </Badge>
                                ) : isCongé ? (
                                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-200">
                                    Congé
                                  </Badge>
                                ) : isRepos ? (
                                  <span className="text-muted-foreground text-sm font-medium">Repos</span>
                                ) : (
                                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                                    {day.hours || day.note || "Autre"}
                                  </Badge>
                                )}
                                {day.note && <p className="text-xs text-muted-foreground mt-1">{day.note}</p>}
                              </button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{emp.name} - {day.dayLabel}</DialogTitle>
                              </DialogHeader>
                              <DayEditForm
                                day={day}
                                onSave={(updated) => handleSaveDay(emp._id, dayIndex, updated)}
                                onCancel={() => {}}
                              />
                            </DialogContent>
                          </Dialog>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

// Formulaire d'édition d'un seul jour
function DayEditForm({
  day,
  onSave,
  onCancel,
}: {
  day: DaySchedule
  onSave: (day: DaySchedule) => void
  onCancel: () => void
}) {
  const [status, setStatus] = useState(day.status)
  const [hours, setHours] = useState(day.hours || "")
  const [note, setNote] = useState(day.note || "")

  const handleSubmit = () => {
    onSave({
      ...day,
      status,
      hours: hours.trim() || undefined,
      note: note.trim() || undefined,
    })
    onCancel()
  }

  return (
    <div className="space-y-4 pt-4">
      <div>
        <Label>Statut</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as any)}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="working">Travail</SelectItem>
            <SelectItem value="repos">Repos</SelectItem>
            <SelectItem value="congé">Congé</SelectItem>
            <SelectItem value="autre">Autre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(status === "working" || status === "autre") && (
        <div>
          <Label>Heures de travail</Label>
          <Input
            placeholder="ex: 09:00 - 17:00"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="mt-1"
          />
        </div>
      )}

      <div>
        <Label>Note</Label>
        <Textarea
          placeholder="Ex: Pause déjeuner, congé maladie..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="mt-1"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button onClick={handleSubmit} className="bg-cyan-500 hover:bg-cyan-600">
          Enregistrer
        </Button>
      </div>
    </div>
  )
}