"use client"

import { useState } from "react"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Plus } from "lucide-react"

interface DietPlanEditorMinimalProps {
  weeklyMealPlan: any
  setWeeklyMealPlan: (plan: any) => void
  selectedDayIndex: number
  className?: string
}

export default function DietPlanEditorMinimal({
  weeklyMealPlan,
  setWeeklyMealPlan,
  selectedDayIndex,
  className = ""
}: DietPlanEditorMinimalProps) {
  const dayNamesFull = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"]
  const currentDayMeals = weeklyMealPlan[dayNamesFull[selectedDayIndex]] || []
  
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
    
    setWeeklyMealPlan((prev: any) => {
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
    <div className={`h-full ${className}`}>
      <Card className="h-full bg-emerald-400 text-white rounded-3xl border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            {dayNamesFull[selectedDayIndex]}
          </CardTitle>
          <p className="text-emerald-100 text-lg mt-1">Piano Alimentare</p>
        </CardHeader>
        <CardContent className="p-6 space-y-4 max-h-[600px] overflow-y-auto scroll-smooth">
          {currentDayMeals.map((meal: any, mealIndex: number) => (
            <Card
              key={`${selectedDayIndex}-${meal.id}-${mealIndex}`}
              className="bg-white/95 dark:bg-gray-800/95 rounded-2xl border-0 shadow-lg"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    {meal.meal_name || meal.name}
                  </h3>
                  <span className="text-sm text-emerald-600 font-medium">
                    {meal.total_calories || meal.totalCalories || 0} kcal
                  </span>
                </div>
                
                <div className="space-y-2 mb-3">
                  {(meal.food_items || meal.foods || []).map((food: any, foodIndex: number) => (
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
  )
}
