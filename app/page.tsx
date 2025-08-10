"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { User, Stethoscope, Palette } from "lucide-react"
import PatientAppComponent from "./components/patient-app"
import DietitiansAppComponent from "./components/dietitians-app"
import BrandShowcase from "./components/brand-showcase"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AppSelector() {
  const [selectedApp, setSelectedApp] = useState<"patient" | "dietitian" | "brand" | null>(null)
  const { theme, setTheme } = useTheme()

  if (selectedApp === "patient") {
    return <PatientAppComponent />
  }

  if (selectedApp === "dietitian") {
    return <DietitiansAppComponent />
  }

  if (selectedApp === "brand") {
    return <BrandShowcase onBack={() => setSelectedApp(null)} />
  }

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in-up">
        {/* Theme Toggle */}
        <div className="flex justify-end mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full bg-card hover:bg-secondary-50 shadow-brand-soft hover-brand-glow"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-accent" />
            ) : (
              <Moon className="h-5 w-5 text-primary" />
            )}
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">
            Sprout 🌱
          </h1>
          <p className="text-muted-foreground">Scegli la tua modalità di accesso</p>
        </div>

        <div className="space-y-4">
          <Card
            className="w-full bg-card rounded-3xl border-tertiary-200 shadow-brand-soft cursor-pointer transition-all duration-300 hover:shadow-brand-primary hover:scale-105 hover:border-primary-300"
            onClick={() => setSelectedApp("patient")}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-brand-primary animate-pulse-glow">
                <User className="h-8 w-8 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Paziente</h2>
              <p className="text-muted-foreground text-sm">Accedi al tuo piano alimentare personalizzato</p>
            </CardContent>
          </Card>

          <Card
            className="w-full bg-card rounded-3xl border-tertiary-200 shadow-brand-soft cursor-pointer transition-all duration-300 hover:shadow-brand-secondary hover:scale-105 hover:border-secondary-300"
            onClick={() => setSelectedApp("dietitian")}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 shadow-brand-secondary">
                <Stethoscope className="h-8 w-8 text-secondary-foreground" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Dietista</h2>
              <p className="text-muted-foreground text-sm">
                Gestisci i tuoi pazienti e crea piani alimentari
              </p>
            </CardContent>
          </Card>

          <Card
            className="w-full bg-card rounded-3xl border-tertiary-200 shadow-brand-soft cursor-pointer transition-all duration-300 hover:shadow-brand-accent hover:scale-105 hover:border-accent-300"
            onClick={() => setSelectedApp("brand")}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 shadow-brand-accent animate-accent-pulse">
                <Palette className="h-8 w-8 text-accent-foreground" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Brand Colors</h2>
              <p className="text-muted-foreground text-sm">
                Visualizza la palette colori del brand
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
