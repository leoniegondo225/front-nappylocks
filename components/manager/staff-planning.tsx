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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DaySchedule {
  date: string
  dayLabel: string // ex: "LUN. 15"
  hours?: string
  status: "working" | "repos" | "congé" | "autre"
  note?: string
}

interface Employee {
  id: string
  name: string
  // On suppose que tu as un champ schedule dans ton modèle Employee
  // Si ce n'est pas le cas, on pourra adapter avec un endpoint séparé
  schedule?: DaySchedule[]
}

export function StaffPlanning({ salonId }: { salonId: string }) {
  const [weekOffset, setWeekOffset] = useState(0)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<{ employeeId: string; dayIndex: number } | null>(null)

  // Chargement des employés du salon + leur planning
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true)

        // 1. Récupère les employés du salon actuel via ta route
        const res = await fetch(`http://localhost:3500/api/employees/salon/${salonId}`)
        if (!res.ok) throw new Error("Erreur lors du chargement des employés")

        const data = await res.json() // { employees: [...] }

        // 2. Si le planning n'est pas inclus dans l'employé,
        //    tu peux faire un appel séparé ici, par exemple :
        // const planningRes = await fetch(`/api/planning?salonId=${salonId}&weekOffset=${weekOffset}`)

        // Pour l'instant, on suppose que chaque employé a déjà son schedule pour la semaine
        // (soit calculé côté serveur, soit stocké)
        setEmployees(data.employees || data || [])
      } catch (err) {
        console.error(err)
        setEmployees([])
      } finally {
        setLoading(false)
      }
    }

    if (salonId) {
      fetchEmployees()
    }
  }, [salonId, weekOffset]) // Recharger quand on change de semaine

  // Sauvegarde d'une modification sur un jour
  const handleSaveDay = async (employeeId: string, dayIndex: number, updatedDay: DaySchedule) => {
    // Mise à jour optimiste
    setEmployees(prev =>
      prev.map(emp =>
        emp.id === employeeId
          ? {
              ...emp,
              schedule: emp.schedule?.map((d, i) => (i === dayIndex ? updatedDay : d)),
            }
          : emp
      )
    )

    // Appel à ton endpoint de mise à jour employé (ou un endpoint dédié planning)
    try {
      await fetch(`http://localhost:3500/api/employees/update/${employeeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // On envoie seulement le jour modifié ou tout le schedule selon ton modèle
          schedule: employees
            .find(e => e.id === employeeId)
            ?.schedule?.map((d, i) => (i === dayIndex ? updatedDay : d)),
        }),
      })
    } catch (err) {
      console.error("Erreur lors de la sauvegarde:", err)
      // Optionnel : rollback en cas d'erreur
    }

    setSelectedDay(null)
  }

  // Calcul du libellé de la semaine courante
  const getWeekLabel = () => {
    const start = new Date()
    start.setDate(start.getDate() + weekOffset * 7)
    const end = new Date(start)
    end.setDate(end.getDate() + 6)

    const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }
    return `${start.toLocaleDateString("fr-FR", options)} - ${end.toLocaleDateString("fr-FR", options)}`
  }

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

  // On prend les jours de la première employé (tous ont la même structure)
  const days = employees[0]?.schedule || []

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
            <Button className="bg-cyan-500 hover:bg-cyan-600">
              <Edit className="w-4 h-4 mr-2" />
              Modifier le planning
            </Button>
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
                {days.map((day) => (
                  <th key={day.date} className="text-left py-3 px-3 text-sm font-medium text-muted-foreground min-w-[120px]">
                    {day.dayLabel}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b last:border-0">
                  <td className="py-4 pr-8 font-medium sticky left-0 bg-background z-10">
                    {emp.name}
                  </td>
                  {(emp.schedule || []).map((day, dayIndex) => {
                    const isWorking = day.status === "working"
                    const isCongé = day.status === "congé"
                    const isRepos = day.status === "repos"

                    return (
                      <td key={day.date} className="py-4 px-3">
                        <Dialog
                          open={selectedDay?.employeeId === emp.id && selectedDay?.dayIndex === dayIndex}
                          onOpenChange={(open) =>
                            open
                              ? setSelectedDay({ employeeId: emp.id, dayIndex })
                              : setSelectedDay(null)
                          }
                        >
                          <DialogTrigger asChild>
                            <button className="w-full text-left">
                              {isWorking ? (
                                <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                                  {day.hours || "Horaire à définir"}
                                </Badge>
                              ) : isCongé ? (
                                <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-200">
                                  {day.hours || "Congé"}
                                </Badge>
                              ) : isRepos ? (
                                <span className="text-muted-foreground text-sm">Repos</span>
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
                              onSave={(updated) => handleSaveDay(emp.id, dayIndex, updated)}
                              onCancel={() => setSelectedDay(null)}
                            />
                          </DialogContent>
                        </Dialog>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

// Formulaire d'édition d'un jour (inchangé)
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
  }

  return (
    <div className="space-y-4 pt-4">
      <div>
        <Label>Statut</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as any)}>
          <SelectTrigger>
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
          <Input placeholder="ex: 09:00 - 17:00" value={hours} onChange={(e) => setHours(e.target.value)} />
        </div>
      )}

      <div>
        <Label>Note (pause, raison congé, etc.)</Label>
        <Textarea
          placeholder="Ex: Pause déjeuner de 13h à 14h, Congé maladie..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>Annuler</Button>
        <Button onClick={handleSubmit}>Enregistrer</Button>
      </div>
    </div>
  )
}