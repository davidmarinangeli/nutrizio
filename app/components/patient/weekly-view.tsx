"use client"

import type React from "react"
import { useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Info,
  Check,
  X,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTheme } from "next-themes"
import type { ViewType, Meal } from "../types/patient-types"

interface WeeklyViewProps {
  weeklyPlan: Record<string, Meal[]>
  onViewChange: (view: ViewType) => void
}

export default function WeeklyView({ weeklyPlan, onViewChange }: WeeklyViewProps) {
  const { theme, setTheme } = useTheme()
  
  // Enhanced weekly view state
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date(2025, 6, 7)) // July 7, 2025 (Monday)
  const [isHistoricalView, setIsHistoricalView] = useState(false)

  // Helper functions for weekly navigation
  const formatWeekRange = (weekStart: Date) => {
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    return `${weekStart.getDate()} - ${weekEnd.getDate()} Luglio`
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('it-IT', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    })
  }

  const isCurrentWeek = (weekStart: Date) => {
    const today = new Date()
    const currentWeekStart = new Date(today)
    currentWeekStart.setDate(today.getDate() - today.getDay() + 1) // Monday
    return weekStart.getTime() === currentWeekStart.getTime()
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeekStart)
    newWeek.setDate(currentWeekStart.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentWeekStart(newWeek)
    setIsHistoricalView(!isCurrentWeek(newWeek))
  }

  // Mock functions for calculating week stats
  const calculateWeekCompliance = () => {
    // In real app, this would calculate based on actual diary data
    return isHistoricalView ? Math.floor(Math.random() * 30) + 70 : 92
  }

  const countSubstitutions = () => {
    // In real app, this would count actual substitutions
    return isHistoricalView ? Math.floor(Math.random() * 5) + 1 : 3
  }

  const averageRating = () => {
    // In real app, this would calculate average of all ratings
    return isHistoricalView ? (Math.random() * 2 + 3).toFixed(1) : "4.3"
  }

  const hasDietPlanChange = (weekStart: Date) => {
    // Mock: assume diet plan changed on July 17, 2025
    const changeDate = new Date(2025, 6, 17)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    return changeDate >= weekStart && changeDate <= weekEnd
  }

  const getDietPlanChangeDate = () => {
    return new Date(2025, 6, 17)
  }

  // Calculate compliance for a specific day
  const calculateDayCompliance = (dayMeals: Meal[]) => {
    if (!dayMeals || dayMeals.length === 0) return 0
    
    let totalItems = 0
    let completedItems = 0
    
    dayMeals.forEach(meal => {
      meal.items.forEach(item => {
        totalItems++
        if (item.completed) completedItems++
      })
    })
    
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-primary/10 to-secondary/10">
      <div className="w-full">
        {/* Enhanced Header */}
        <div className="w-full bg-card/80 backdrop-blur-lg sticky top-0 z-10 p-4 md:p-6 rounded-b-3xl shadow-brand-primary border-b border-primary/20">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onViewChange("dashboard")}
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-brand-primary transition-all hover:shadow-brand-glow"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl md:text-2xl font-bold text-primary">
              Piano Settimanale
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full bg-card hover:bg-secondary-50 shadow-brand-soft hover-brand-glow border-tertiary-200"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-accent" />
              ) : (
                <Moon className="h-5 w-5 text-primary" />
              )}
            </Button>
          </div>

          {/* Week Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateWeek('prev')}
              className="rounded-full bg-secondary-100 hover:bg-secondary-200 border-secondary-300"
            >
              <ChevronLeft className="h-4 w-4 text-secondary-600" />
            </Button>
            
            <div className="text-center">
              <h2 className="text-lg font-bold text-primary-foreground">
                {formatWeekRange(currentWeekStart)}
              </h2>
              {isHistoricalView && (
                <Badge className="bg-tertiary-100 text-tertiary-700 border-tertiary-300 mt-1">
                  Storico
                </Badge>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateWeek('next')}
              disabled={isCurrentWeek(currentWeekStart)}
              className="rounded-full bg-secondary-100 hover:bg-secondary-200 border-secondary-300 disabled:bg-muted disabled:text-muted-foreground"
            >
              <ChevronRight className="h-4 w-4 text-secondary-600" />
            </Button>
          </div>

          {/* Week Stats */}
          <div className="grid grid-cols-3 gap-2 text-center mb-4">
            <div className="bg-primary/10 rounded-lg p-2 border border-primary/20">
              <div className="text-2xl font-bold text-primary">
                {calculateWeekCompliance()}%
              </div>
              <div className="text-xs text-muted-foreground">Compliance</div>
            </div>
            <div className="bg-accent-50 rounded-lg p-2 border border-accent-200">
              <div className="text-2xl font-bold text-accent">
                {countSubstitutions()}
              </div>
              <div className="text-xs text-muted-foreground">Sostituzioni</div>
            </div>
            <div className="bg-secondary-50 rounded-lg p-2 border border-secondary-200">
              <div className="text-2xl font-bold text-secondary">
                {averageRating()}
              </div>
              <div className="text-xs text-muted-foreground">Rating Medio</div>
            </div>
          </div>
          
          {/* Diet Plan Change Indicator */}
          {hasDietPlanChange(currentWeekStart) && (
            <Alert className="mt-3 bg-tertiary-50 border-tertiary-200">
              <Info className="h-4 w-4 text-tertiary" />
              <AlertDescription className="text-tertiary-700">
                Il piano alimentare è cambiato il {formatDate(getDietPlanChangeDate())}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Weekly Days with Full Diet and Reviews */}
        <div className="w-full p-4 md:p-6 space-y-6">
          {/* Generate all 7 days of the week */}
          {Array.from({ length: 7 }, (_, index) => {
            const dayDate = new Date(currentWeekStart)
            dayDate.setDate(currentWeekStart.getDate() + index)
            const dayName = dayDate.toLocaleDateString('it-IT', { weekday: 'long' })
            const formattedDate = dayDate.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })
            
            // Get meals for this day (in real app, this would fetch from database)
            const dayKey = dayName.charAt(0).toUpperCase() + dayName.slice(1)
            const dayMeals = weeklyPlan[dayKey as keyof typeof weeklyPlan] || []
            
            return (
              <div key={index} className="space-y-4">
                {/* Day Header */}
                <Card className="w-full bg-brand-gradient text-white rounded-3xl border-0 shadow-brand-gradient">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold capitalize">{dayName}</h3>
                        <p className="text-white/80 text-sm">{formattedDate}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {isHistoricalView ? calculateDayCompliance(dayMeals) : "-"}%
                        </div>
                        {isHistoricalView && (
                          <p className="text-white/80 text-xs">Compliance</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Meals for this day */}
                {dayMeals.length > 0 ? (
                  dayMeals.map((meal) => (
                    <Card
                      key={meal.id}
                      className="w-full bg-card rounded-3xl border-tertiary-200 shadow-brand-soft overflow-hidden hover:shadow-brand-primary transition-all"
                    >
                      <div className={`h-2 w-full ${meal.completed ? "bg-primary" : "bg-muted"}`}></div>
                      
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-bold text-foreground">{meal.name}</h4>
                          <span className="text-sm text-muted-foreground">{meal.time}</span>
                        </div>

                        <div className="space-y-4">
                          {meal.items.map((item) => (
                            <div 
                              key={item.id} 
                              className={`relative w-full bg-muted/50 rounded-2xl p-4 transition-all duration-300 ${
                                item.completed
                                  ? "bg-primary/10 border-2 border-primary/20 shadow-brand-soft"
                                  : ""
                              }`}
                            >
                              <div className="flex items-start justify-between w-full">
                                <div className="flex-1 min-w-0 pr-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="font-semibold text-foreground">
                                      {item.name}
                                    </span>
                                    {item.completed && item.rating && (
                                      <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                          <Star 
                                            key={i} 
                                            className={`h-3 w-3 ${
                                              i < item.rating! 
                                                ? "fill-accent text-accent" 
                                                : "text-muted-foreground"
                                            }`} 
                                          />
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-sm text-secondary-foreground mb-1">
                                    {item.quantity}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {item.calories} kcal
                                  </div>
                                  
                                  {/* Tags if reviewed */}
                                  {item.completed && item.tags && item.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {item.tags.map((tag) => (
                                        <Badge 
                                          key={tag} 
                                          className="bg-secondary-100 text-secondary-700 text-xs rounded-full px-2 py-0.5"
                                        >
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Status indicators */}
                                <div className="flex flex-col items-end gap-2">
                                  {item.completed ? (
                                    <div className="flex items-center gap-2">
                                      <Check className="h-5 w-5 text-primary" />
                                      <span className="text-xs text-primary font-medium">
                                        Completato
                                      </span>
                                    </div>
                                  ) : isHistoricalView ? (
                                    <div className="flex items-center gap-2">
                                      <X className="h-5 w-5 text-destructive" />
                                      <span className="text-xs text-destructive font-medium">
                                        Non consumato
                                      </span>
                                    </div>
                                  ) : (
                                    <Badge className="bg-tertiary-100 text-tertiary-700 border-tertiary-300 text-xs">
                                      Da consumare
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="w-full bg-card rounded-3xl border-secondary-200 shadow-brand-soft">
                    <CardContent className="p-10 text-center">
                      <p className="text-muted-foreground">
                        Nessun piano per questo giorno
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
