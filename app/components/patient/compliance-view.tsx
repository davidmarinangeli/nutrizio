"use client"

import type React from "react"
import { ChevronLeft, Award, Check, Star, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import type { ViewType } from "../types/patient-types"

interface ComplianceViewProps {
  onViewChange: (view: ViewType) => void
}

export default function ComplianceView({ onViewChange }: ComplianceViewProps) {
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="w-full">
        {/* Header */}
        <div className="w-full bg-card/80 backdrop-blur-lg sticky top-0 z-10 p-4 md:p-6 rounded-b-3xl shadow-brand-secondary border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onViewChange("dashboard")}
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-brand-primary transition-all hover:shadow-brand-glow"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">
              La Tua Compliance
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full bg-muted hover:bg-muted/80 shadow-brand-soft"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-accent" />
              ) : (
                <Moon className="h-5 w-5 text-secondary" />
              )}
            </Button>
          </div>
        </div>

        <div className="w-full p-4 md:p-6 space-y-6">
          {/* Main Score */}
          <Card className="w-full bg-secondary text-secondary-foreground rounded-3xl shadow-brand-secondary">
            <CardContent className="p-8 text-center">
              <Award className="h-16 w-16 mx-auto mb-4 text-secondary-200" />
              <div className="text-6xl font-bold mb-2">92</div>
              <div className="text-secondary-200 text-lg mb-4">Punteggio Compliance</div>
              <div className="bg-card/20 rounded-2xl p-4">
                <div className="text-sm text-secondary-200">Ottimo lavoro questa settimana!</div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 w-full">
            <Card className="bg-card rounded-3xl border-border shadow-brand-soft">
              <CardContent className="p-6 text-center">
                <Check className="h-8 w-8 mx-auto mb-3 text-primary" />
                <div className="text-2xl font-bold mb-1 text-foreground">18</div>
                <div className="text-muted-foreground text-sm">Pasti completati</div>
              </CardContent>
            </Card>

            <Card className="bg-card rounded-3xl border-border shadow-brand-soft">
              <CardContent className="p-6 text-center">
                <Star className="h-8 w-8 mx-auto mb-3 text-accent" />
                <div className="text-2xl font-bold mb-1 text-foreground">4.3</div>
                <div className="text-muted-foreground text-sm">Rating medio</div>
              </CardContent>
            </Card>
          </div>

          {/* Achievements */}
          <Card className="w-full bg-card rounded-3xl border-border shadow-brand-soft">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2 text-secondary-400" />
                Obiettivi Raggiunti
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-primary/10 dark:bg-primary/20 rounded-2xl border border-primary/20 dark:border-primary/30">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-primary rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-foreground">7 giorni consecutivi</span>
                  </div>
                  <Badge className="bg-primary-400 text-white rounded-full">Completato</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-900/20 rounded-2xl border border-secondary-200 dark:border-secondary-700">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-secondary-400 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-foreground">Tutte le colazioni</span>
                  </div>
                  <Badge className="bg-secondary-400 text-white rounded-full">Completato</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-accent-50 dark:bg-accent-900/20 rounded-2xl border border-accent-200 dark:border-accent-700">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-accent-400 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-foreground">
                      Rating &gt;4 per 5 giorni
                    </span>
                  </div>
                  <Badge className="bg-muted text-muted-foreground rounded-full">3/5</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Suggestions */}
          <Card className="w-full bg-secondary-100 rounded-3xl border-secondary-200 shadow-brand-soft">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4 text-secondary-700">
                💡 Suggerimenti Personalizzati
              </h3>
              <div className="space-y-3">
                <div className="bg-card/60 rounded-2xl p-4">
                  <p className="text-sm font-medium mb-1 text-secondary-700">Idratazione</p>
                  <p className="text-xs text-secondary-600">
                    Bevi più acqua durante i pasti principali
                  </p>
                </div>
                <div className="bg-card/60 rounded-2xl p-4">
                  <p className="text-sm font-medium mb-1 text-secondary-700">Timing</p>
                  <p className="text-xs text-secondary-600">
                    Prova a cenare 2 ore prima di dormire
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
