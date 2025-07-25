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
      {/* Modern Header with Gradient Background */}
      <div className="w-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 dark:from-emerald-600 dark:via-emerald-700 dark:to-teal-800 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-y-1 scale-110"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
        
        <div className="relative w-full max-w-7xl mx-auto p-4 lg:p-8 py-12 lg:py-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1">
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2 bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
                Ciao, Dr. Nutrizionista! 👋
              </h1>
              <p className="text-emerald-100 text-lg lg:text-xl font-medium">
                Benvenuto nella tua dashboard. Gestisci i tuoi pazienti con facilità.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-0 shadow-lg"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button
                onClick={onCreateNewPatient}
                className="rounded-full bg-white text-emerald-600 hover:bg-white/90 shadow-lg font-semibold px-6 py-2 h-12"
              >
                <Plus className="h-4 w-4 mr-2" /> Nuovo Paziente
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-white">
              <div className="text-3xl font-bold mb-1">{patients.length}</div>
              <div className="text-emerald-100">Pazienti Totali</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-white">
              <div className="text-3xl font-bold mb-1">
                {patients.filter(p => p.status === 'active').length}
              </div>
              <div className="text-emerald-100">Pazienti Attivi</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-white">
              <div className="text-3xl font-bold mb-1">
                {patients.length > 0 ? Math.round(patients.reduce((sum, p) => sum + p.compliance, 0) / patients.length) : 0}%
              </div>
              <div className="text-emerald-100">Compliance Media</div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-md">
            <Input
              type="search"
              placeholder="Cerca paziente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl h-12 bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-emerald-100 focus:bg-white/30 focus:border-white/50"
            />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="w-full max-w-7xl mx-auto p-4 lg:p-8 -mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <Card
              key={patient.id}
              className="bg-white dark:bg-gray-800 rounded-3xl border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm"
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
