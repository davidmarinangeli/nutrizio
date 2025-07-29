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
    if (compliance >= 90) return "bg-primary"
    if (compliance >= 70) return "bg-accent"
    return "bg-destructive"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-primary-100 text-primary-700 rounded-full">
            Attivo
          </Badge>
        )
      case "inactive":
        return (
          <Badge className="bg-muted text-muted-foreground rounded-full">
            Inattivo
          </Badge>
        )
      case "new":
        return (
          <Badge className="bg-accent-100 text-accent-700 rounded-full">
            Nuovo
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen w-full bg-background animate-fade-in-up">
      {/* Modern Header with Brand Gradient Background */}
      <div className="w-full bg-brand-gradient relative overflow-hidden animate-fade-in-down">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/10 to-transparent transform -skew-y-1 scale-110 animate-pulse-glow"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/5 rounded-full -translate-y-32 translate-x-32 animate-bounce-gentle"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-foreground/5 rounded-full translate-y-24 -translate-x-24 animate-bounce-gentle" style={{animationDelay: '1s'}}></div>
        
        {/* Content container with backdrop blur for better contrast */}
        <div className="relative w-full max-w-7xl mx-auto p-4 lg:p-8 py-12 lg:py-16">
          <div className="backdrop-blur-sm bg-primary-foreground/10 rounded-3xl p-6 lg:p-8 border border-primary-foreground/20 shadow-brand-soft">
            <div className="flex items-center justify-between mb-8">
              <div className="flex-1 animate-fade-in-left">
                <h1 className="text-4xl lg:text-5xl font-bold text-primary-foreground mb-2 drop-shadow-sm">
                  Ciao, Dr. Nutrizionista! 👋
                </h1>
                <p className="text-primary-foreground/90 text-lg lg:text-xl font-medium drop-shadow-sm">
                  Benvenuto nella tua dashboard. Gestisci i tuoi pazienti con facilità.
                </p>
              </div>
              <div className="flex items-center gap-4 animate-fade-in-right">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 backdrop-blur-sm text-primary-foreground border-0 shadow-brand-soft transition-all duration-300 hover:scale-110 hover:rotate-180"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button
                onClick={onCreateNewPatient}
                className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-brand-accent font-semibold px-6 py-2 h-12 transition-all duration-300 hover:scale-105 hover:shadow-brand-glow"
              >
                <Plus className="h-4 w-4 mr-2" /> Nuovo Paziente
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-primary-foreground/20 backdrop-blur-sm rounded-2xl p-6 text-primary-foreground animate-scale-in" style={{animationDelay: '0.1s'}}>
              <div className="text-3xl font-bold mb-1">{patients.length}</div>
              <div className="text-primary-foreground/80">Pazienti Totali</div>
            </div>
            <div className="bg-primary-foreground/20 backdrop-blur-sm rounded-2xl p-6 text-primary-foreground animate-scale-in" style={{animationDelay: '0.2s'}}>
              <div className="text-3xl font-bold mb-1 text-accent-foreground">
                {patients.filter(p => p.status === 'active').length}
              </div>
              <div className="text-primary-foreground/80">Pazienti Attivi</div>
            </div>
            <div className="bg-primary-foreground/20 backdrop-blur-sm rounded-2xl p-6 text-primary-foreground animate-scale-in" style={{animationDelay: '0.3s'}}>
              <div className="text-3xl font-bold mb-1 text-primary-foreground">
                {patients.length > 0 ? Math.round(patients.reduce((sum, p) => sum + p.compliance, 0) / patients.length) : 0}%
              </div>
              <div className="text-primary-foreground/80">Compliance Media</div>
            </div>
          </div>

          {/* Search Bar */}
                    {/* Search Bar */}
          <div className="max-w-md animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <Input
              placeholder="Cerca pazienti..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl h-12 bg-primary-foreground/20 backdrop-blur-sm border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/60 focus:bg-primary-foreground/30 focus:border-primary-foreground/50"
            />
          </div>
        </div>
      </div>
      </div>

      {/* Content Area with better padding below header */}
      <div className="w-full max-w-7xl mx-auto p-4 lg:p-8 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient, index) => (
            <Card
              key={patient.id}
              className="bg-card rounded-3xl border-tertiary-200 shadow-brand-soft cursor-pointer hover:shadow-brand-primary transition-all duration-300 hover:scale-105"
              onClick={() => onSelectPatient(patient)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <CardTitle className="text-lg font-semibold text-foreground">
                      {patient.name} {patient.surname}
                    </CardTitle>
                    <p className="text-muted-foreground text-sm">{patient.email}</p>
                  </div>
                  <div>
                    {getStatusBadge(patient.status)}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Età: <span className="font-medium text-foreground">{patient.age} anni</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Peso: <span className="font-medium text-foreground">{patient.weight} kg</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">Compliance:</p>
                    <Badge className={`${getComplianceColor(patient.compliance)} text-white rounded-full shadow-sm`}>
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
