"use client"

import { useState } from "react"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Input } from "../../../components/ui/input"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { type WeeklyMealPlan } from "../../../lib/supabase"

interface DietPlanEditorSimpleProps {
  weeklyMealPlan: WeeklyMealPlan
  setWeeklyMealPlan: (plan: WeeklyMealPlan | ((prev: WeeklyMealPlan) => WeeklyMealPlan)) => void
  selectedDayIndex: number
  currentMealIndex: number
  setCurrentMealIndex: (index: number) => void
  isTransitioning?: boolean
  transitionDirection?: "left" | "right"
  showPrevNext?: boolean
  onDayChange?: (dayIndex: number) => void
  prevDayIndex?: number
  nextDayIndex?: number
  className?: string
}

export default function DietPlanEditorSimple({
  weeklyMealPlan,
  setWeeklyMealPlan,
  selectedDayIndex,
  currentMealIndex,
  setCurrentMealIndex,
  isTransitioning = false,
  transitionDirection = "right",
  showPrevNext = true,
  onDayChange,
  prevDayIndex,
  nextDayIndex,
  className = ""
}: DietPlanEditorSimpleProps) {
  const dayNamesFull = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"]
  const dayShort = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"]
  const dates = ["5", "6", "7", "8", "9", "10", "11"]

  const currentDayMeals = weeklyMealPlan[dayNamesFull[selectedDayIndex]] || []
  const prevDayMeals = prevDayIndex !== undefined ? weeklyMealPlan[dayNamesFull[prevDayIndex]] || [] : []
  const nextDayMeals = nextDayIndex !== undefined ? weeklyMealPlan[dayNamesFull[nextDayIndex]] || [] : []

  const [showAddMeal, setShowAddMeal] = useState(false)
  const [customMealName, setCustomMealName] = useState("")

  const addCustomMeal = () => {
    if (!customMealName.trim()) return

    const uniqueId = `custom-meal-${Date.now()}-${Math.floor(Math.random() * 1000000)}`
    
    const newMeal = {
      id: uniqueId,
      meal_name: customMealName,
      meal_type: customMealName.toLowerCase().replace(/\s+/g, "_"),
      meal_time: "12:00",
      food_items: [],
      total_calories: 0,
      notes: "",
      order_index: currentDayMeals.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      day_of_week: selectedDayIndex,
      diet_plan_id: ""
    }
    
    setWeeklyMealPlan((prev: WeeklyMealPlan) => {
      const newPlan = { ...prev }
      const dayName = dayNamesFull[selectedDayIndex]
      if (!newPlan[dayName]) newPlan[dayName] = []
      newPlan[dayName].push(newMeal)
      return newPlan
    })
    
    setCustomMealName("")
    setShowAddMeal(false)
  }

  return (
    <div className={`grid grid-cols-12 gap-4 h-full ${className}`}>
      {/* Previous Day */}
      {showPrevNext && prevDayIndex !== undefined && (
        <div className="col-span-12 md:col-span-3">
          <Card className="h-full bg-gray-100 dark:bg-gray-700 rounded-3xl border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDayChange?.(prevDayIndex)}
                  className="h-6 w-6 rounded-full"
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                {dayShort[prevDayIndex]} {dates[prevDayIndex]}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {prevDayMeals.length > 0 ? (
                prevDayMeals.slice(0, 3).map((meal, index) => (
                  <div key={meal.id || index} className="mb-2 p-2 bg-gray-50 dark:bg-gray-600 rounded-lg">
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                      {meal.meal_name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {meal.food_items?.length || 0} alimenti
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-xs text-gray-500 dark:text-gray-400">Nessun pasto</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Current Day */}
      <div className={`col-span-12 ${showPrevNext ? "md:col-span-6" : "md:col-span-12"}`}>
        <Card className="h-full bg-emerald-400 text-white rounded-3xl border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              {dayNamesFull[selectedDayIndex]} {dates[selectedDayIndex]}
            </CardTitle>
            <p className="text-emerald-100 text-lg mt-1">Oggi</p>
          </CardHeader>
          <CardContent className="p-6 space-y-4 max-h-[600px] overflow-y-auto scroll-smooth">
            {currentDayMeals.map((meal, mealIndex) => (
              <Card
                key={`${selectedDayIndex}-${meal.id}-${mealIndex}`}
                className="bg-white/95 dark:bg-gray-800/95 rounded-2xl border-0 shadow-lg"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                      {meal.meal_name}
                    </h3>
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                      {meal.total_calories || 0} kcal
                    </Badge>
                  </div>
                  
                  <div className="space-y-3 mb-3">
                    {meal.food_items?.map((food, foodIndex) => (
                      <div
                        key={`${meal.id}-${food.id || foodIndex}`}
                        className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-800 dark:text-white text-sm">
                            {food.name} - {food.quantity}{food.unit}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {food.calories || 0} kcal
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                  >
                    <Plus className="h-3 w-3 mr-1" /> Aggiungi Alimento
                  </Button>
                </CardContent>
              </Card>
            ))}

            {showAddMeal ? (
              <Card className="bg-white/95 dark:bg-gray-800/95 rounded-2xl">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <Input
                      placeholder="Nome del pasto"
                      value={customMealName}
                      onChange={(e) => setCustomMealName(e.target.value)}
                      className="w-full h-8 text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={addCustomMeal}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 h-8 text-xs"
                        disabled={!customMealName.trim()}
                      >
                        Crea Pasto
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowAddMeal(false)} 
                        className="h-8 text-xs"
                      >
                        Annulla
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Button
                onClick={() => setShowAddMeal(true)}
                variant="outline"
                className="w-full h-12 border-dashed border-2 border-emerald-300 hover:border-emerald-400 hover:bg-emerald-50 text-emerald-600"
              >
                <Plus className="h-4 w-4 mr-2" /> Aggiungi Nuovo Pasto
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Next Day */}
      {showPrevNext && nextDayIndex !== undefined && (
        <div className="col-span-12 md:col-span-3">
          <Card className="h-full bg-gray-100 dark:bg-gray-700 rounded-3xl border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                {dayShort[nextDayIndex]} {dates[nextDayIndex]}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDayChange?.(nextDayIndex)}
                  className="h-6 w-6 rounded-full"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {nextDayMeals.length > 0 ? (
                nextDayMeals.slice(0, 3).map((meal, index) => (
                  <div key={meal.id || index} className="mb-2 p-2 bg-gray-50 dark:bg-gray-600 rounded-lg">
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                      {meal.meal_name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {meal.food_items?.length || 0} alimenti
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-xs text-gray-500 dark:text-gray-400">Nessun pasto</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
