"use client"

import { Button } from "../../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Badge } from "../../../../components/ui/badge"
import { ChevronLeft, Moon, Sun } from "lucide-react"

interface Step2RestrictionsProps {
  selectedRestrictions: string[]
  selectedAllergies: string[]
  toggleRestriction: (restriction: string) => void
  toggleAllergy: (allergy: string) => void
  patientData: any
  setPatientData: (data: any) => void
  onNext: () => void
  onBack: () => void
  theme: string | undefined
  setTheme: (theme: string) => void
}

export default function Step2Restrictions({
  selectedRestrictions,
  selectedAllergies,
  toggleRestriction,
  toggleAllergy,
  patientData,
  setPatientData,
  onNext,
  onBack,
  theme,
  setTheme
}: Step2RestrictionsProps) {
  const dietaryRestrictions = [
    "Vegetariano",
    "Vegano",
    "Senza glutine",
    "Senza lattosio",
    "Keto",
    "Paleo",
    "Mediterranea",
    "Low-carb",
    "Diabetico",
    "Ipertensione"
  ]

  const commonAllergies = [
    "Arachidi",
    "Frutta secca",
    "Latte",
    "Uova",
    "Pesce",
    "Crostacei",
    "Soia",
    "Glutine",
    "Sesamo",
    "Pomodori"
  ]

  return (
        <div className="min-h-screen w-full bg-background">
      <div className="w-full max-w-6xl mx-auto p-4 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-full bg-emerald-400 text-white hover:bg-emerald-500 shadow-md"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
            Nuovo Paziente - Restrizioni e Allergie
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full bg-gray-100 dark:bg-gray-800"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dietary Restrictions */}
          <Card className="w-full bg-white dark:bg-gray-800 rounded-3xl border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">
                Restrizioni Alimentari
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400">
                Seleziona le restrizioni alimentari del paziente
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-3">
                {dietaryRestrictions.map((restriction) => (
                  <Badge
                    key={restriction}
                    variant={selectedRestrictions.includes(restriction) ? "default" : "outline"}
                    className={`cursor-pointer p-3 text-center justify-center transition-all ${
                      selectedRestrictions.includes(restriction)
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                        : "border-2 border-gray-200 dark:border-gray-600 hover:border-emerald-400"
                    }`}
                    onClick={() => toggleRestriction(restriction)}
                  >
                    {restriction}
                  </Badge>
                ))}
              </div>
              
              {selectedRestrictions.length > 0 && (
                <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-2">
                    Restrizioni selezionate:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRestrictions.map((restriction) => (
                      <Badge key={restriction} className="bg-emerald-500 text-white">
                        {restriction}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Allergies */}
          <Card className="w-full bg-white dark:bg-gray-800 rounded-3xl border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">
                Allergie Alimentari
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400">
                Seleziona le allergie del paziente
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-3">
                {commonAllergies.map((allergy) => (
                  <Badge
                    key={allergy}
                    variant={selectedAllergies.includes(allergy) ? "default" : "outline"}
                    className={`cursor-pointer p-3 text-center justify-center transition-all ${
                      selectedAllergies.includes(allergy)
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "border-2 border-gray-200 dark:border-gray-600 hover:border-red-400"
                    }`}
                    onClick={() => toggleAllergy(allergy)}
                  >
                    {allergy}
                  </Badge>
                ))}
              </div>
              
              {selectedAllergies.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                    Allergie selezionate:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAllergies.map((allergy) => (
                      <Badge key={allergy} className="bg-red-500 text-white">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={onBack}
            className="rounded-2xl px-8 py-3"
          >
            Indietro
          </Button>
          <Button
            onClick={onNext}
            className="rounded-2xl px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
          >
            Continua
          </Button>
        </div>
      </div>
    </div>
  )
}
