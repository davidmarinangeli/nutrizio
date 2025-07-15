"use client"

import { useState } from "react"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Input } from "../../../components/ui/input"
import { Moon, Sun, Plus } from "lucide-react"
import { type Patient } from "../../../lib/supabase"

interface PatientsListPageProps {
  patients: Patient[]
  onSelectPatient: (patient: Patient) => void
  onCreateNewPatient: () => void
  theme: string | undefined
  setTheme: (theme: string) => void
}

export default function PatientsListPage({
  patients,
  onSelectPatient,
  onCreateNewPatient,
  theme,
  setTheme
}: PatientsListPageProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getComplianceColor = (compliance: number) => {
    if (compliance >= 90) return "bg-emerald-400"
    if (compliance >= 70) return "bg-yellow-400"
    return "bg-red-400"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 rounded-full">
            Attivo
          </Badge>
        )
      case "inactive":
        return (
          <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-full">
            Inattivo
          </Badge>
        )
      case "new":
        return (
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full">
            Nuovo
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-7xl mx-auto p-4 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
            Gestione Pazienti
          </h1>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full bg-gray-100 dark:bg-gray-800"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button
              onClick={onCreateNewPatient}
              className="rounded-full bg-emerald-400 text-white hover:bg-emerald-500 shadow-md"
            >
              <Plus className="h-4 w-4 mr-2" /> Nuovo Paziente
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <Input
            type="search"
            placeholder="Cerca paziente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl h-12"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <Card
              key={patient.id}
              className="bg-white dark:bg-gray-800 rounded-3xl border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => onSelectPatient(patient)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">
                      {patient.name} {patient.surname}
                    </CardTitle>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{patient.email}</p>
                  </div>
                  {getStatusBadge(patient.status)}
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Età: <span className="font-medium">{patient.age} anni</span>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Peso: <span className="font-medium">{patient.weight} kg</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Compliance:</p>
                    <Badge className={`${getComplianceColor(patient.compliance)} text-white rounded-full`}>
                      {patient.compliance}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
