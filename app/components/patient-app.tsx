"use client"

import type React from "react"

import { useState, useRef } from "react"
import {
  Calendar,
  TrendingUp,
  User,
  Wand2,
  MoreHorizontal,
  Check,
  X,
  Star,
  Plus,
  ChevronLeft,
  ChevronRight,
  Target,
  Award,
  Moon,
  Sun,
  Info,
  Activity,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { mockWeeklyPlan, weekDays, ratingTags } from "../data"
import { useTheme } from "next-themes"

interface MealItem {
  id: string
  name: string
  quantity: string
  calories: number
  alternatives?: { name: string; quantity: string; calories: number }[]
  completed?: boolean
  rating?: number
  tags?: string[]
}

interface Meal {
  id: string
  name: string
  time: string
  items: MealItem[]
  totalCalories: number
  completed: boolean
}

interface WeekDay {
  day: string
  date: string
  isToday: boolean
  key: string
}

export default function PatientAppComponent() {
  const [currentView, setCurrentView] = useState<"dashboard" | "compliance" | "weekly">("dashboard")
  const [meals, setMeals] = useState(mockWeeklyPlan["Mercoledì"])
  const [weeklyPlan] = useState(mockWeeklyPlan)
  const [selectedDay, setSelectedDay] = useState(weekDays.find((d) => d.isToday) || weekDays[0])
  
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

  const [selectedItem, setSelectedItem] = useState<MealItem | null>(null)
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null)
  const [rating, setRating] = useState(0)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [alternativeFood, setAlternativeFood] = useState("")
  const [alternativeQuantity, setAlternativeQuantity] = useState("")
  const [swipedItem, setSwipedItem] = useState<string | null>(null)
  const [isAlternativeSheetOpen, setIsAlternativeSheetOpen] = useState(false)
  const [isRatingSheetOpen, setIsRatingSheetOpen] = useState(false)
  const [isReplacementSheetOpen, setIsReplacementSheetOpen] = useState(false)
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)

  const { theme, setTheme } = useTheme()

  const handleDayClick = (day: WeekDay) => {
    setSelectedDay(day)
    setMeals(weeklyPlan[day.key as keyof typeof weeklyPlan] || [])
  }

  const handleTouchStart = (e: React.TouchEvent, itemId: string) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = (itemId: string) => {
    if (!touchStartX.current || !touchEndX.current) return

    const distance = touchStartX.current - touchEndX.current
    const isLeftSwipe = distance > 50

    if (isLeftSwipe) {
      setSwipedItem(swipedItem === itemId ? null : itemId)
    }

    touchStartX.current = 0
    touchEndX.current = 0
  }

  const handleRatingSubmit = () => {
    if (selectedItem && selectedMeal) {
      setMeals((prev) =>
        prev.map((meal) =>
          meal.id === selectedMeal.id
            ? {
                ...meal,
                items: meal.items.map((item) =>
                  item.id === selectedItem.id ? { ...item, completed: true, rating, tags: selectedTags } : item,
                ),
              }
            : meal,
        ),
      )
    }
    setRating(0)
    setSelectedTags([])
    setSelectedItem(null)
    setSelectedMeal(null)
    setIsRatingSheetOpen(false)
  }

  const handleAlternativeSubmit = () => {
    if (selectedItem && selectedMeal && alternativeFood && alternativeQuantity) {
      setMeals((prev) =>
        prev.map((meal) =>
          meal.id === selectedMeal.id
            ? {
                ...meal,
                items: meal.items.map((item) =>
                  item.id === selectedItem.id
                    ? {
                        ...item,
                        name: alternativeFood,
                        quantity: alternativeQuantity,
                        completed: true,
                      }
                    : item,
                ),
              }
            : meal,
        ),
      )
    }
    setAlternativeFood("")
    setAlternativeQuantity("")
    setSelectedItem(null)
    setSelectedMeal(null)
    setIsReplacementSheetOpen(false)
  }

  const selectAlternative = (alternative: { name: string; quantity: string; calories: number }) => {
    if (selectedItem && selectedMeal) {
      setMeals((prev) =>
        prev.map((meal) =>
          meal.id === selectedMeal.id
            ? {
                ...meal,
                items: meal.items.map((item) =>
                  item.id === selectedItem.id
                    ? {
                        ...item,
                        name: alternative.name,
                        quantity: alternative.quantity,
                        calories: alternative.calories,
                      }
                    : item,
                ),
              }
            : meal,
        ),
      )
    }
    setSelectedItem(null)
    setSelectedMeal(null)
    setIsAlternativeSheetOpen(false)
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  if (currentView === "weekly") {
    return (
      <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900">
        <div className="w-full">
          {/* Enhanced Header */}
          <div className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg sticky top-0 z-10 p-4 md:p-6 rounded-b-3xl shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentView("dashboard")}
                className="rounded-full bg-emerald-400 text-white hover:bg-emerald-500 shadow-md transition-all hover:shadow-glow"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                Piano Settimanale
              </h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                )}
              </Button>
            </div>

            {/* Week Navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateWeek('prev')}
                className="rounded-full bg-gray-100 dark:bg-gray-800"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </Button>
              
              <div className="text-center">
                <h2 className="text-lg font-bold text-gray-700 dark:text-gray-200">
                  {formatWeekRange(currentWeekStart)}
                </h2>
                {isHistoricalView && (
                  <Badge className="bg-blue-100 text-blue-700 mt-1">
                    Storico
                  </Badge>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateWeek('next')}
                disabled={isCurrentWeek(currentWeekStart)}
                className="rounded-full bg-gray-100 dark:bg-gray-800"
              >
                <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </Button>
            </div>

            {/* Week Stats */}
            <div className="grid grid-cols-3 gap-2 text-center mb-4">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2">
                <div className="text-2xl font-bold text-emerald-600">
                  {calculateWeekCompliance()}%
                </div>
                <div className="text-xs text-gray-600">Compliance</div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-2">
                <div className="text-2xl font-bold text-orange-600">
                  {countSubstitutions()}
                </div>
                <div className="text-xs text-gray-600">Sostituzioni</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                <div className="text-2xl font-bold text-blue-600">
                  {averageRating()}
                </div>
                <div className="text-xs text-gray-600">Rating Medio</div>
              </div>
            </div>
            
            {/* Diet Plan Change Indicator */}
            {hasDietPlanChange(currentWeekStart) && (
              <Alert className="mt-3 bg-blue-50 border-blue-200">
                <Info className="h-4 w-4" />
                <AlertDescription>
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
                  <Card className="w-full bg-emerald-400 text-white rounded-3xl border-0 shadow-xl">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold capitalize">{dayName}</h3>
                          <p className="text-emerald-100 text-sm">{formattedDate}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            {isHistoricalView ? calculateDayCompliance(dayMeals) : "-"}%
                          </div>
                          {isHistoricalView && (
                            <p className="text-emerald-100 text-xs">Compliance</p>
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
                        className="w-full bg-white dark:bg-gray-800 rounded-3xl border-0 shadow-lg overflow-hidden"
                      >
                        <div className={`h-2 w-full ${meal.completed ? "bg-emerald-400" : "bg-gray-300"}`}></div>
                        
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-bold text-gray-800 dark:text-white">{meal.name}</h4>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{meal.time}</span>
                          </div>

                          <div className="space-y-4">
                            {meal.items.map((item) => (
                              <div 
                                key={item.id} 
                                className={`relative w-full bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 transition-all duration-300 ${
                                  (item as any).completed
                                    ? "bg-emerald-50 dark:bg-emerald-900/50 border-2 border-emerald-200 dark:border-emerald-700"
                                    : ""
                                }`}
                              >
                                <div className="flex items-start justify-between w-full">
                                  <div className="flex-1 min-w-0 pr-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="font-semibold text-gray-800 dark:text-gray-100">
                                        {item.name}
                                      </span>
                                      {(item as any).completed && (item as any).rating && (
                                        <div className="flex items-center gap-1">
                                          {[...Array(5)].map((_, i) => (
                                            <Star 
                                              key={i} 
                                              className={`h-3 w-3 ${
                                                i < (item as any).rating! 
                                                  ? "fill-yellow-400 text-yellow-400" 
                                                  : "text-gray-300 dark:text-gray-600"
                                              }`} 
                                            />
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                                      {item.quantity}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {item.calories} kcal
                                    </div>
                                    
                                    {/* Tags if reviewed */}
                                    {(item as any).completed && (item as any).tags && (item as any).tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {(item as any).tags.map((tag: string) => (
                                          <Badge 
                                            key={tag} 
                                            className="bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200 text-xs rounded-full px-2 py-0.5"
                                          >
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  {/* Status indicators */}
                                  <div className="flex flex-col items-end gap-2">
                                    {(item as any).completed ? (
                                      <div className="flex items-center gap-2">
                                        <Check className="h-5 w-5 text-emerald-500" />
                                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                          Completato
                                        </span>
                                      </div>
                                    ) : isHistoricalView ? (
                                      <div className="flex items-center gap-2">
                                        <X className="h-5 w-5 text-red-500" />
                                        <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                                          Non consumato
                                        </span>
                                      </div>
                                    ) : (
                                      <Badge className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs">
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
                    <Card className="w-full bg-white dark:bg-gray-800 rounded-3xl border-0 shadow-lg">
                      <CardContent className="p-10 text-center">
                        <p className="text-gray-500 dark:text-gray-400">
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

  if (currentView === "compliance") {
    return (
      <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900">
        <div className="w-full">
          {/* Header */}
          <div className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg sticky top-0 z-10 p-4 md:p-6 rounded-b-3xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentView("dashboard")}
                className="rounded-full bg-emerald-400 text-white hover:bg-emerald-500 shadow-md transition-all hover:shadow-glow"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                La Tua Compliance
              </h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                )}
              </Button>
            </div>
          </div>

          <div className="w-full p-4 md:p-6 space-y-6">
            {/* Main Score */}
            <Card className="w-full bg-emerald-400 text-white rounded-3xl border-0 shadow-2xl">
              <CardContent className="p-8 text-center">
                <Award className="h-16 w-16 mx-auto mb-4 text-emerald-100" />
                <div className="text-6xl font-bold mb-2">92</div>
                <div className="text-emerald-100 text-lg mb-4">Punteggio Compliance</div>
                <div className="bg-white/20 rounded-2xl p-4">
                  <div className="text-sm text-emerald-100">Ottimo lavoro questa settimana!</div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 w-full">
              <Card className="bg-white dark:bg-gray-800 rounded-3xl border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <Check className="h-8 w-8 mx-auto mb-3 text-emerald-400" />
                  <div className="text-2xl font-bold mb-1 text-gray-800 dark:text-white">18</div>
                  <div className="text-gray-600 dark:text-gray-300 text-sm">Pasti completati</div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 rounded-3xl border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <Star className="h-8 w-8 mx-auto mb-3 text-emerald-400" />
                  <div className="text-2xl font-bold mb-1 text-gray-800 dark:text-white">4.3</div>
                  <div className="text-gray-600 dark:text-gray-300 text-sm">Rating medio</div>
                </CardContent>
              </Card>
            </div>

            {/* Achievements */}
            <Card className="w-full bg-white dark:bg-gray-800 rounded-3xl border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                  <Award className="h-5 w-5 mr-2 text-emerald-400" />
                  Obiettivi Raggiunti
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-emerald-400 rounded-full mr-3"></div>
                      <span className="text-sm font-medium text-gray-800 dark:text-white">7 giorni consecutivi</span>
                    </div>
                    <Badge className="bg-emerald-400 text-white rounded-full">Completato</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-emerald-400 rounded-full mr-3"></div>
                      <span className="text-sm font-medium text-gray-800 dark:text-white">Tutte le colazioni</span>
                    </div>
                    <Badge className="bg-emerald-400 text-white rounded-full">Completato</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-emerald-300 rounded-full mr-3"></div>
                      <span className="text-sm font-medium text-gray-800 dark:text-white">
                        Rating &gt;4 per 5 giorni
                      </span>
                    </div>
                    <Badge className="bg-emerald-300 text-white rounded-full">3/5</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Suggestions */}
            <Card className="w-full bg-emerald-100 dark:bg-emerald-900/30 rounded-3xl border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4 text-emerald-700 dark:text-emerald-300">
                  💡 Suggerimenti Personalizzati
                </h3>
                <div className="space-y-3">
                  <div className="bg-white/60 dark:bg-gray-800/60 rounded-2xl p-4">
                    <p className="text-sm font-medium mb-1 text-emerald-700 dark:text-emerald-300">Idratazione</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      Bevi più acqua durante i pasti principali
                    </p>
                  </div>
                  <div className="bg-white/60 dark:bg-gray-800/60 rounded-2xl p-4">
                    <p className="text-sm font-medium mb-1 text-emerald-700 dark:text-emerald-300">Timing</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
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

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 animate-fade-in-up">
      <div className="w-full">
        {/* Header */}
        <div className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg sticky top-0 z-10 p-4 md:p-6 rounded-b-3xl shadow-lg animate-fade-in-down">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-emerald-400 text-white shadow-md transition-all hover:shadow-glow hover:scale-110 animate-scale-in"
            >
              <User className="h-5 w-5" />
            </Button>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 shadow-md transition-all hover:scale-110 hover:rotate-180 animate-fade-in-right"
                style={{animationDelay: '0.1s'}}
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentView("compliance")}
                className="rounded-full bg-emerald-400 text-white hover:bg-emerald-500 shadow-md transition-all hover:shadow-glow hover:scale-110 animate-fade-in-right"
                style={{animationDelay: '0.2s'}}
              >
                <TrendingUp className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentView("weekly")}
                className="rounded-full bg-emerald-400 text-white hover:bg-emerald-500 shadow-md transition-all hover:shadow-glow hover:scale-110 animate-fade-in-right"
                style={{animationDelay: '0.3s'}}
              >
                <Calendar className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Date */}
          <div className="text-center animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
              Mercoledì, 7 Luglio
            </h1>
          </div>
        </div>

        {/* Meals */}
        <div className="w-full p-4 md:p-6 space-y-6">
          {meals.map((meal, index) => (
            <Card
              key={meal.id}
              className="w-full bg-white dark:bg-gray-800 rounded-3xl border-0 shadow-lg overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`h-2 w-full ${meal.completed ? "bg-emerald-400" : "bg-emerald-300"}`}></div>

              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">{meal.name}</h3>
                  </div>
                </div>

                <div className="space-y-4 w-full">
                  {meal.items.map((item) => (
                    <div key={item.id} className="relative w-full">
                      <div
                        className={`w-full bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 transition-all duration-300 ${
                          'completed' in item && item.completed
                            ? "bg-emerald-50 dark:bg-emerald-900/50 border-2 border-emerald-200 dark:border-emerald-700"
                            : ""
                        } ${swipedItem === item.id ? "transform -translate-x-20" : ""}`}
                        onTouchStart={(e) => handleTouchStart(e, item.id)}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={() => handleTouchEnd(item.id)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                                {item.name}
                              </span>
                              {'completed' in item && item.completed && (
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  {[...Array(('rating' in item ? item.rating : 0) || 0)].map((_, i) => (
                                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">{item.quantity}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{item.calories} kcal</div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Magic Wand */}
                            <Sheet open={isAlternativeSheetOpen} onOpenChange={setIsAlternativeSheetOpen}>
                              <SheetTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10 rounded-2xl bg-emerald-400 text-white hover:bg-emerald-500 shadow-md transition-all hover:shadow-glow"
                                  onClick={() => {
                                    setSelectedItem(item)
                                    setSelectedMeal(meal)
                                    setIsAlternativeSheetOpen(true)
                                  }}
                                >
                                  <Wand2 className="h-4 w-4" />
                                </Button>
                              </SheetTrigger>
                              <SheetContent
                                side="bottom"
                                className="h-[550px] rounded-t-3xl border-0 w-full bg-white dark:bg-gray-900"
                              >
                                <SheetHeader className="mb-6">
                                  <SheetTitle className="text-xl font-bold text-center text-gray-800 dark:text-white">
                                    Alternative per {item.name}
                                  </SheetTitle>
                                </SheetHeader>
                                <div className="space-y-3 max-h-[400px] overflow-y-auto w-full">
                                  {item.alternatives?.map((alt, index) => (
                                    <Card
                                      key={index}
                                      className="w-full p-4 cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl border-2 border-transparent hover:border-emerald-400 transition-all"
                                      onClick={() => selectAlternative(alt)}
                                    >
                                      <div className="flex items-center justify-between w-full">
                                        <div className="flex-1 min-w-0 pr-4">
                                          <div className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                                            {alt.name}
                                          </div>
                                          <div className="text-sm text-gray-600 dark:text-gray-300">{alt.quantity}</div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                          <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                            {alt.calories} kcal
                                          </div>
                                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 rounded-full text-xs">
                                            Seleziona
                                          </Badge>
                                        </div>
                                      </div>
                                    </Card>
                                  ))}
                                </div>
                              </SheetContent>
                            </Sheet>

                            {/* More Options */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 rounded-2xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                              onClick={() => setSwipedItem(swipedItem === item.id ? null : item.id)}
                            >
                              <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Swipe Actions */}
                      {swipedItem === item.id && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex gap-2">
                          {/* Rating */}
                          <Sheet open={isRatingSheetOpen} onOpenChange={setIsRatingSheetOpen}>
                            <SheetTrigger asChild>
                              <Button
                                size="icon"
                                className="bg-emerald-400 hover:bg-emerald-500 h-12 w-12 rounded-2xl shadow-lg"
                                onClick={() => {
                                  setSelectedItem(item)
                                  setSelectedMeal(meal)
                                  setIsRatingSheetOpen(true)
                                }}
                              >
                                <Check className="h-6 w-6 text-white" />
                              </Button>
                            </SheetTrigger>
                            <SheetContent
                              side="bottom"
                              className="h-[550px] rounded-t-3xl border-0 w-full bg-white dark:bg-gray-900"
                            >
                              <SheetHeader className="mb-6">
                                <SheetTitle className="text-xl font-bold text-center text-gray-800 dark:text-white">
                                  Come è stato {item.name}?
                                </SheetTitle>
                              </SheetHeader>
                              <div className="space-y-6 w-full">
                                {/* Star Rating */}
                                <div className="text-center">
                                  <div className="flex justify-center gap-2 mb-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Button
                                        key={star}
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setRating(star)}
                                        className="h-14 w-14 rounded-2xl"
                                      >
                                        <Star
                                          className={`h-8 w-8 ${
                                            star <= rating
                                              ? "fill-yellow-400 text-yellow-400"
                                              : "text-gray-300 dark:text-gray-600"
                                          }`}
                                        />
                                      </Button>
                                    ))}
                                  </div>
                                </div>

                                {/* Tags */}
                                <div className="w-full">
                                  <h4 className="font-semibold mb-4 text-center text-gray-800 dark:text-white">
                                    Aggiungi dettagli
                                  </h4>
                                  <div className="flex flex-wrap gap-2 justify-center max-h-[200px] overflow-y-auto w-full">
                                    {ratingTags.map((tag) => (
                                      <Badge
                                        key={tag}
                                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                                        className={`cursor-pointer rounded-full px-4 py-2 ${
                                          selectedTags.includes(tag)
                                            ? "bg-emerald-400 text-white border-0"
                                            : "border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-300 text-gray-700 dark:text-gray-300"
                                        }`}
                                        onClick={() => toggleTag(tag)}
                                      >
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>

                                <Button
                                  className="w-full h-12 rounded-2xl bg-emerald-400 hover:bg-emerald-500 text-white font-semibold"
                                  onClick={handleRatingSubmit}
                                  disabled={rating === 0}
                                >
                                  Conferma Valutazione
                                </Button>
                              </div>
                            </SheetContent>
                          </Sheet>

                          {/* Alternative */}
                          <Sheet open={isReplacementSheetOpen} onOpenChange={setIsReplacementSheetOpen}>
                            <SheetTrigger asChild>
                              <Button
                                size="icon"
                                className="bg-red-400 hover:bg-red-500 h-12 w-12 rounded-2xl shadow-lg"
                                onClick={() => {
                                  setSelectedItem(item)
                                  setSelectedMeal(meal)
                                  setIsReplacementSheetOpen(true)
                                }}
                              >
                                <X className="h-6 w-6 text-white" />
                              </Button>
                            </SheetTrigger>
                            <SheetContent
                              side="bottom"
                              className="h-[550px] rounded-t-3xl border-0 w-full bg-white dark:bg-gray-900"
                            >
                              <SheetHeader className="mb-6">
                                <SheetTitle className="text-xl font-bold text-center text-gray-800 dark:text-white">
                                  Cosa hai mangiato invece?
                                </SheetTitle>
                              </SheetHeader>
                              <div className="space-y-6 w-full">
                                <div className="space-y-4 w-full">
                                  <div className="w-full">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                      Nome alimento
                                    </label>
                                    <Input
                                      placeholder="es. Yogurt greco"
                                      value={alternativeFood}
                                      onChange={(e) => setAlternativeFood(e.target.value)}
                                      className="w-full rounded-2xl border-2 border-gray-200 dark:border-gray-700 focus:border-emerald-400 h-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    />
                                  </div>
                                  <div className="w-full">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                      Quantità
                                    </label>
                                    <Input
                                      placeholder="es. 200g"
                                      value={alternativeQuantity}
                                      onChange={(e) => setAlternativeQuantity(e.target.value)}
                                      className="w-full rounded-2xl border-2 border-gray-200 dark:border-gray-700 focus:border-emerald-400 h-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    />
                                  </div>
                                </div>

                                <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
                                  <h4 className="font-medium mb-3 text-gray-800 dark:text-white">
                                    Suggerimenti rapidi:
                                  </h4>
                                  <div className="space-y-2 w-full">
                                    {item.alternatives?.slice(0, 3).map((alt, index) => (
                                      <Button
                                        key={index}
                                        variant="ghost"
                                        className="w-full justify-start rounded-xl hover:bg-white dark:hover:bg-gray-700 text-left text-gray-800 dark:text-white"
                                        onClick={() => {
                                          setAlternativeFood(alt.name)
                                          setAlternativeQuantity(alt.quantity)
                                        }}
                                      >
                                        <Plus className="h-4 w-4 mr-2 flex-shrink-0" />
                                        <span className="truncate">
                                          {alt.name} - {alt.quantity}
                                        </span>
                                      </Button>
                                    ))}
                                  </div>
                                </div>

                                <Button
                                  className="w-full h-12 rounded-2xl bg-emerald-400 hover:bg-emerald-500 text-white font-semibold"
                                  onClick={handleAlternativeSubmit}
                                  disabled={!alternativeFood || !alternativeQuantity}
                                >
                                  Conferma Sostituzione
                                </Button>
                              </div>
                            </SheetContent>
                          </Sheet>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
