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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

export default function PatientAppComponent() {
  const [currentView, setCurrentView] = useState<"dashboard" | "compliance" | "weekly">("dashboard")
  const [meals, setMeals] = useState(mockWeeklyPlan["Mercoledì"])
  const [weeklyPlan] = useState(mockWeeklyPlan)
  const [selectedDay, setSelectedDay] = useState(weekDays.find((d) => d.isToday) || weekDays[0])

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

  const handleDayClick = (day) => {
    setSelectedDay(day)
    setMeals(weeklyPlan[day.key] || [])
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
          {/* Header */}
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
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" size="icon" className="rounded-full bg-gray-100 dark:bg-gray-800">
                <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </Button>
              <span className="font-semibold text-gray-700 dark:text-gray-200">5 - 11 Luglio</span>
              <Button variant="ghost" size="icon" className="rounded-full bg-gray-100 dark:bg-gray-800">
                <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </Button>
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-2 w-full">
              {weekDays.map((day, index) => (
                <div key={index} className="text-center cursor-pointer" onClick={() => handleDayClick(day)}>
                  <div
                    className={`w-full aspect-square max-w-12 mx-auto rounded-2xl flex items-center justify-center mb-2 transition-all duration-300 hover:scale-105 ${
                      selectedDay.date === day.date
                        ? "bg-emerald-400 text-white shadow-lg"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    <span className="font-bold text-sm">{day.date}</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{day.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Overview */}
          <div className="w-full p-4 md:p-6 space-y-6">
            <Card className="w-full bg-emerald-400 text-white rounded-3xl border-0 shadow-xl animate-fade-in-up">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">Piano del Giorno</h3>
                    <p className="text-emerald-100">
                      {selectedDay.day}, {selectedDay.date} Luglio
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-emerald-100" />
                </div>
              </CardContent>
            </Card>

            {/* Daily Summary Cards */}
            {meals.length > 0 ? (
              meals.map((meal, index) => (
                <Card
                  key={meal.id}
                  className="w-full bg-white dark:bg-gray-800 rounded-3xl border-0 shadow-lg animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`h-2 w-full ${meal.completed ? "bg-emerald-400" : "bg-emerald-300"}`}></div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">{meal.name}</h3>
                    <div className="space-y-3">
                      {meal.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                          <span className="font-medium text-gray-500 dark:text-gray-400">{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="w-full bg-white dark:bg-gray-800 rounded-3xl border-0 shadow-lg animate-fade-in-up">
                <CardContent className="p-10 text-center">
                  <p className="text-gray-500 dark:text-gray-400">Nessun piano per questo giorno.</p>
                </CardContent>
              </Card>
            )}
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
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900">
      <div className="w-full">
        {/* Header */}
        <div className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg sticky top-0 z-10 p-4 md:p-6 rounded-b-3xl shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-emerald-400 text-white shadow-md transition-all hover:shadow-glow"
            >
              <User className="h-5 w-5" />
            </Button>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 shadow-md transition-all"
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
                className="rounded-full bg-emerald-400 text-white hover:bg-emerald-500 shadow-md transition-all hover:shadow-glow"
              >
                <TrendingUp className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentView("weekly")}
                className="rounded-full bg-emerald-400 text-white hover:bg-emerald-500 shadow-md transition-all hover:shadow-glow"
              >
                <Calendar className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Date */}
          <div className="text-center animate-fade-in-up">
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
                          item.completed
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
                              {item.completed && (
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  {[...Array(item.rating || 0)].map((_, i) => (
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
