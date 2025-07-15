"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { User, Stethoscope } from "lucide-react"
import PatientAppComponent from "./components/patient-app"
import DietitiansAppComponent from "./components/dietitians-app"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AppSelector() {
  const [selectedApp, setSelectedApp] = useState<"patient" | "dietitian" | null>(null)
  const { theme, setTheme } = useTheme()

  if (selectedApp === "patient") {
    return <PatientAppComponent />
  }

  if (selectedApp === "dietitian") {
    return <DietitiansAppComponent />
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in-up">
        {/* Theme Toggle */}
        <div className="flex justify-end mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-md"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            )}
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent mb-2">
            NutriApp
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Scegli la tua modalità di accesso</p>
        </div>

        <div className="space-y-4">
          <Card
            className="w-full bg-white dark:bg-gray-800 rounded-3xl border-0 shadow-lg cursor-pointer transition-all duration-300 hover:shadow-glow hover:scale-105"
            onClick={() => setSelectedApp("patient")}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Paziente</h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Accedi al tuo piano alimentare personalizzato</p>
            </CardContent>
          </Card>

          <Card
            className="w-full bg-white dark:bg-gray-800 rounded-3xl border-0 shadow-lg cursor-pointer transition-all duration-300 hover:shadow-glow hover:scale-105"
            onClick={() => setSelectedApp("dietitian")}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Dietista</h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Gestisci i tuoi pazienti e crea piani alimentari
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
