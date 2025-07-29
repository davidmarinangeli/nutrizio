"use client"

import { Button } from "../../../../components/ui/button"
import { Card, CardContent } from "../../../../components/ui/card"
import { Input } from "../../../../components/ui/input"
import { Label } from "../../../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select"
import { Textarea } from "../../../../components/ui/textarea"
import { ChevronLeft, Moon, Sun } from "lucide-react"

interface Step1BasicInfoProps {
  patientData: {
    name: string
    surname: string
    email: string
    age: string
    gender: string
    height: string
    weight: string
    targetCalories: string
    mainGoal: string
    mealCount: string
    restrictions: string[]
    allergies: string[]
    notes: string
  }
  setPatientData: (data: any) => void
  onNext: () => void
  onBack: () => void
  theme: string | undefined
  setTheme: (theme: string) => void
}

export default function Step1BasicInfo({
  patientData,
  setPatientData,
  onNext,
  onBack,
  theme,
  setTheme
}: Step1BasicInfoProps) {
  const isValid = patientData.name && patientData.surname && patientData.email && 
                 patientData.age && patientData.height && patientData.weight && patientData.mealCount

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="w-full max-w-6xl mx-auto p-4 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-brand-primary"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
            Nuovo Paziente - Informazioni Base
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full bg-card hover:bg-accent-50 shadow-brand-soft border-accent-200"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-accent" />
            ) : (
              <Moon className="h-5 w-5 text-primary" />
            )}
          </Button>
        </div>

        <Card className="w-full bg-card rounded-3xl border-primary-200 shadow-brand-primary">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-primary-foreground mb-2 block">
                    Nome
                  </Label>
                  <Input
                    id="name"
                    value={patientData.name}
                    onChange={(e) => setPatientData((prev: any) => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-2xl h-12"
                    placeholder="Inserisci il nome"
                  />
                </div>

                <div>
                  <Label htmlFor="surname" className="text-sm font-medium text-foreground mb-2 block">
                    Cognome
                  </Label>
                  <Input
                    id="surname"
                    value={patientData.surname}
                    onChange={(e) => setPatientData((prev: any) => ({ ...prev, surname: e.target.value }))}
                    className="w-full rounded-2xl h-12"
                    placeholder="Inserisci il cognome"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-foreground mb-2 block">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={patientData.email}
                  onChange={(e) => setPatientData((prev: any) => ({ ...prev, email: e.target.value }))}
                  className="w-full rounded-2xl h-12"
                  placeholder="email@esempio.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="age" className="text-sm font-medium text-foreground mb-2 block">
                    Età
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={patientData.age}
                    onChange={(e) => setPatientData((prev: any) => ({ ...prev, age: e.target.value }))}
                    className="w-full rounded-2xl h-12"
                    placeholder="25"
                  />
                </div>

                <div>
                  <Label htmlFor="height" className="text-sm font-medium text-foreground mb-2 block">
                    Altezza (cm)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    value={patientData.height}
                    onChange={(e) => setPatientData((prev: any) => ({ ...prev, height: e.target.value }))}
                    className="w-full rounded-2xl h-12"
                    placeholder="170"
                  />
                </div>

                <div>
                  <Label htmlFor="weight" className="text-sm font-medium text-foreground mb-2 block">
                    Peso (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    value={patientData.weight}
                    onChange={(e) => setPatientData((prev: any) => ({ ...prev, weight: e.target.value }))}
                    className="w-full rounded-2xl h-12"
                    placeholder="70"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="gender" className="text-sm font-medium text-foreground mb-2 block">
                    Sesso
                  </Label>
                  <Select value={patientData.gender} onValueChange={(value) => setPatientData((prev: any) => ({ ...prev, gender: value }))}>
                    <SelectTrigger className="w-full rounded-2xl h-12">
                      <SelectValue placeholder="Seleziona il sesso" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Maschio</SelectItem>
                      <SelectItem value="female">Femmina</SelectItem>
                      <SelectItem value="other">Altro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="targetCalories" className="text-sm font-medium text-foreground mb-2 block">
                    Calorie Target
                  </Label>
                  <Input
                    id="targetCalories"
                    type="number"
                    value={patientData.targetCalories}
                    onChange={(e) => setPatientData((prev: any) => ({ ...prev, targetCalories: e.target.value }))}
                    className="w-full rounded-2xl h-12"
                    placeholder="2000"
                  />
                </div>

                <div>
                  <Label htmlFor="mealCount" className="text-sm font-medium text-foreground mb-2 block">
                    Numero Pasti al Giorno
                  </Label>
                  <Select value={patientData.mealCount} onValueChange={(value) => setPatientData((prev: any) => ({ ...prev, mealCount: value }))}>
                    <SelectTrigger className="w-full rounded-2xl h-12">
                      <SelectValue placeholder="Seleziona numero pasti" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 pasti (Colazione, Pranzo, Cena)</SelectItem>
                      <SelectItem value="4">4 pasti (+ 1 spuntino)</SelectItem>
                      <SelectItem value="5">5 pasti (+ 2 spuntini)</SelectItem>
                      <SelectItem value="6">6 pasti (+ 3 spuntini)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="mainGoal" className="text-sm font-medium text-foreground mb-2 block">
                  Obiettivo Principale
                </Label>
                <Select value={patientData.mainGoal} onValueChange={(value) => setPatientData((prev: any) => ({ ...prev, mainGoal: value }))}>
                  <SelectTrigger className="w-full rounded-2xl h-12">
                    <SelectValue placeholder="Seleziona l'obiettivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight-loss">Perdita di peso</SelectItem>
                    <SelectItem value="muscle-gain">Aumento massa muscolare</SelectItem>
                    <SelectItem value="maintenance">Mantenimento</SelectItem>
                    <SelectItem value="health">Salute generale</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes" className="text-sm font-medium text-foreground mb-2 block">
                  Note aggiuntive
                </Label>
                <Textarea
                  id="notes"
                  value={patientData.notes}
                  onChange={(e) => setPatientData((prev: any) => ({ ...prev, notes: e.target.value }))}
                  className="w-full rounded-2xl min-h-[100px]"
                  placeholder="Inserisci eventuali note aggiuntive..."
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={onNext}
                  disabled={!isValid}
                  className="rounded-2xl px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-brand-primary"
                >
                  Continua
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
