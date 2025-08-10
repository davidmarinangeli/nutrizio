"use client"

import type React from "react"
import { useState, useRef } from "react"
import {
  User,
  Wand2,
  MoreHorizontal,
  Check,
  X,
  Star,
  Plus,
  Moon,
  Sun,
  TrendingUp,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { ratingTags } from "../../data"
import { useTheme } from "next-themes"
import type { Meal, MealItem } from "../types/patient-types"

interface DashboardViewProps {
  meals: Meal[]
  setMeals: React.Dispatch<React.SetStateAction<Meal[]>>
  onViewChange: (view: "dashboard" | "compliance" | "weekly") => void
}

export default function DashboardView({ meals, setMeals, onViewChange }: DashboardViewProps) {
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

  return (
    <div className="min-h-screen w-full bg-background animate-fade-in-up">
      <div className="w-full">
        {/* Header */}
        <div className="w-full bg-card/80 backdrop-blur-lg sticky top-0 z-10 p-4 md:p-6 rounded-b-3xl shadow-brand-primary border-b border-border animate-fade-in-down">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-primary text-primary-foreground shadow-brand-primary transition-all hover:shadow-brand-glow hover:scale-110 animate-scale-in"
            >
              <User className="h-5 w-5" />
            </Button>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full bg-muted hover:bg-muted/80 shadow-brand-soft transition-all hover:scale-110 hover:rotate-180 animate-fade-in-right"
                style={{animationDelay: '0.1s'}}
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5 text-accent" />
                ) : (
                  <Moon className="h-5 w-5 text-secondary" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onViewChange("compliance")}
                className="rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-brand-secondary transition-all hover:shadow-brand-glow hover:scale-110 animate-fade-in-right"
                style={{animationDelay: '0.2s'}}
              >
                <TrendingUp className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onViewChange("weekly")}
                className="rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-brand-secondary transition-all hover:shadow-brand-glow hover:scale-110 animate-fade-in-right"
                style={{animationDelay: '0.3s'}}
              >
                <Calendar className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Date */}
          <div className="text-center animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <h1 className="text-2xl md:text-3xl font-bold text-primary">
              Mercoledì, 7 Luglio
            </h1>
          </div>
        </div>

        {/* Meals */}
        <div className="w-full p-4 md:p-6 space-y-6">
          {meals.map((meal, index) => (
            <Card
              key={meal.id}
              className="w-full bg-card rounded-3xl border-0 shadow-lg overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`h-2 w-full ${meal.completed ? "bg-primary" : "bg-primary/40"}`}></div>

              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{meal.name}</h3>
                  </div>
                </div>

                <div className="space-y-4 w-full">
                  {meal.items.map((item) => (
                    <div key={item.id} className="relative w-full overflow-hidden">
                      <div
                        className={`w-full bg-muted dark:bg-muted/50 rounded-2xl p-4 transition-all duration-300 relative z-10 ${
                          'completed' in item && item.completed
                            ? "bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-200 dark:border-primary-700"
                            : ""
                        } ${swipedItem === item.id ? "transform -translate-x-40" : ""}`}
                        onTouchStart={(e) => handleTouchStart(e, item.id)}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={() => handleTouchEnd(item.id)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-foreground truncate">
                                {item.name}
                              </span>
                              {'completed' in item && item.completed && (
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  {[...Array(('rating' in item ? item.rating : 0) || 0)].map((_, i) => (
                                    <Star key={i} className="h-3 w-3 fill-accent text-accent" />
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground mb-1">{item.quantity}</div>
                            <div className="text-xs text-muted-foreground/70">{item.calories} kcal</div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Magic Wand */}
                            <Sheet open={isAlternativeSheetOpen} onOpenChange={setIsAlternativeSheetOpen}>
                              <SheetTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10 rounded-2xl bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-brand-secondary transition-all hover:shadow-brand-glow"
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
                                className="h-[550px] rounded-t-3xl border-0 w-full bg-background"
                              >
                                <SheetHeader className="mb-6">
                                  <SheetTitle className="text-xl font-bold text-center text-foreground">
                                    Alternative per {item.name}
                                  </SheetTitle>
                                </SheetHeader>
                                <div className="space-y-3 max-h-[400px] overflow-y-auto w-full">
                                  {item.alternatives?.map((alt, index) => (
                                    <Card
                                      key={index}
                                      className="w-full p-4 cursor-pointer bg-muted hover:bg-muted/80 rounded-2xl border-2 border-transparent hover:border-primary-400 transition-all"
                                      onClick={() => selectAlternative(alt)}
                                    >
                                      <div className="flex items-center justify-between w-full">
                                        <div className="flex-1 min-w-0 pr-4">
                                          <div className="font-semibold text-foreground truncate">
                                            {alt.name}
                                          </div>
                                          <div className="text-sm text-muted-foreground">{alt.quantity}</div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                          <div className="text-sm font-medium text-primary-600 dark:text-primary-400">
                                            {alt.calories} kcal
                                          </div>
                                          <Badge className="bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 rounded-full text-xs">
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
                              className="h-10 w-10 rounded-2xl bg-muted hover:bg-muted/80"
                              onClick={() => setSwipedItem(swipedItem === item.id ? null : item.id)}
                            >
                              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Swipe Actions - slide in from right (behind the card) */}
                      <div className={`absolute top-0 right-0 h-full transition-all duration-300 z-0 flex items-center gap-2 pr-4 ${
                        swipedItem === item.id ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
                      }`}>
                        {/* Rating */}
                        <Sheet open={isRatingSheetOpen} onOpenChange={setIsRatingSheetOpen}>
                          <SheetTrigger asChild>
                            <Button
                              size="icon"
                              className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 w-12 rounded-2xl shadow-brand-primary"
                              onClick={() => {
                                setSelectedItem(item)
                                setSelectedMeal(meal)
                                setIsRatingSheetOpen(true)
                              }}
                            >
                              <Check className="h-6 w-6" />
                            </Button>
                          </SheetTrigger>
                          <SheetContent
                            side="bottom"
                            className="h-[550px] rounded-t-3xl border-0 w-full bg-background"
                          >
                            <SheetHeader className="mb-6">
                              <SheetTitle className="text-xl font-bold text-center text-foreground">
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
                                            ? "fill-accent text-accent"
                                            : "text-muted-foreground/50"
                                        }`}
                                      />
                                    </Button>
                                  ))}
                                </div>
                              </div>

                              {/* Tags */}
                              <div className="w-full">
                                <h4 className="font-semibold mb-4 text-center text-foreground">
                                  Aggiungi dettagli
                                </h4>
                                <div className="flex flex-wrap gap-2 justify-center max-h-[200px] overflow-y-auto w-full">
                                  {ratingTags.map((tag) => (
                                    <Badge
                                      key={tag}
                                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                                      className={`cursor-pointer rounded-full px-4 py-2 ${
                                        selectedTags.includes(tag)
                                          ? "bg-primary text-primary-foreground border-0"
                                          : "border-2 border-border hover:border-primary-300 text-muted-foreground"
                                      }`}
                                      onClick={() => toggleTag(tag)}
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <Button
                                className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
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
                              className="bg-destructive hover:bg-destructive/90 h-12 w-12 rounded-2xl shadow-lg"
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
                            className="h-[550px] rounded-t-3xl border-0 w-full bg-background"
                          >
                            <SheetHeader className="mb-6">
                              <SheetTitle className="text-xl font-bold text-center text-foreground">
                                Cosa hai mangiato invece?
                              </SheetTitle>
                            </SheetHeader>
                            <div className="space-y-6 w-full">
                              <div className="space-y-4 w-full">
                                <div className="w-full">
                                  <label className="block text-sm font-medium text-foreground mb-2">
                                    Nome alimento
                                  </label>
                                  <Input
                                    placeholder="es. Yogurt greco"
                                    value={alternativeFood}
                                    onChange={(e) => setAlternativeFood(e.target.value)}
                                    className="w-full rounded-2xl border-2 border-border focus:border-primary-400 h-12"
                                  />
                                </div>
                                <div className="w-full">
                                  <label className="block text-sm font-medium text-foreground mb-2">
                                    Quantità
                                  </label>
                                  <Input
                                    placeholder="es. 200g"
                                    value={alternativeQuantity}
                                    onChange={(e) => setAlternativeQuantity(e.target.value)}
                                    className="w-full rounded-2xl border-2 border-border focus:border-primary-400 h-12"
                                  />
                                </div>
                              </div>

                              <div className="w-full bg-muted rounded-2xl p-4">
                                <h4 className="font-medium mb-3 text-foreground">
                                  Suggerimenti rapidi:
                                </h4>
                                <div className="space-y-2 w-full">
                                  {item.alternatives?.slice(0, 3).map((alt, index) => (
                                    <Button
                                      key={index}
                                      variant="ghost"
                                      className="w-full justify-start rounded-xl hover:bg-background text-left text-foreground"
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
                                className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                                onClick={handleAlternativeSubmit}
                                disabled={!alternativeFood || !alternativeQuantity}
                              >
                                Conferma Sostituzione
                              </Button>
                            </div>
                          </SheetContent>
                        </Sheet>
                      </div>
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
