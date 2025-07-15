"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Input } from "../../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Plus, Edit, Trash2 } from "lucide-react"
import { type DietPlan, type WeeklyMealPlan, type DietPlanMeal } from "../../../lib/supabase"

interface DietPlanEditorCoreProps {
  weeklyMealPlan: WeeklyMealPlan
  setWeeklyMealPlan: (plan: WeeklyMealPlan | ((prev: WeeklyMealPlan) => WeeklyMealPlan)) => void
  selectedDayIndex: number
  currentMealIndex: number
  setCurrentMealIndex: (index: number) => void
  dietPlan?: DietPlan | null
  isTransitioning?: boolean
  transitionDirection?: "left" | "right"
  showPrevNext?: boolean
  onDayChange?: (dayIndex: number) => void
  prevDayIndex?: number
  nextDayIndex?: number
  className?: string
}

export default function DietPlanEditorCore({
  weeklyMealPlan,
  setWeeklyMealPlan,
  selectedDayIndex,
  currentMealIndex,
  setCurrentMealIndex,
  dietPlan,
  isTransitioning = false,
  transitionDirection = "right",
  showPrevNext = true,
  onDayChange,
  prevDayIndex,
  nextDayIndex,
  className = ""
}: DietPlanEditorCoreProps) {
  // Add counters to ensure unique IDs
  const [mealCounter, setMealCounter] = useState(0)
  const [foodCounter, setFoodCounter] = useState(0)
  
  // Ref to prevent duplicate executions
  const creatingMealRef = useRef(false)
  const lastMealCreationTime = useRef(0)
  
  // Food editing states
  const [showAddFood, setShowAddFood] = useState<string | null>(null)
  const [newFoodName, setNewFoodName] = useState("")
  const [newFoodQuantity, setNewFoodQuantity] = useState("")
  const [newFoodUnit, setNewFoodUnit] = useState("g")
  
  // Meal editing states
  const [showAddMeal, setShowAddMeal] = useState(false)
  const [customMealName, setCustomMealName] = useState("")
  const [isCreatingMeal, setIsCreatingMeal] = useState(false)
  
  // Alternatives states
  const [showAlternativesSheet, setShowAlternativesSheet] = useState(false)
  const [selectedFoodForAlternatives, setSelectedFoodForAlternatives] = useState<{
    mealId: string
    foodId: number
    food: any
  } | null>(null)
  const [newAlternativeName, setNewAlternativeName] = useState("")
  const [newAlternativeQuantity, setNewAlternativeQuantity] = useState("")
  const [newAlternativeUnit, setNewAlternativeUnit] = useState("g")

  const dayNamesFull = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"]
  const dayShort = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"]
  const dates = ["5", "6", "7", "8", "9", "10", "11"]

  const currentDayMeals = weeklyMealPlan[dayNamesFull[selectedDayIndex]] || []
  const prevDayMeals = prevDayIndex !== undefined ? weeklyMealPlan[dayNamesFull[prevDayIndex]] || [] : []
  const nextDayMeals = nextDayIndex !== undefined ? weeklyMealPlan[dayNamesFull[nextDayIndex]] || [] : []

  const addFood = useCallback((mealId: string) => {
    const foodData = {
      name: newFoodName,
      quantity: newFoodQuantity,
      unit: newFoodUnit,
      calories: 0,
    }
    setWeeklyMealPlan((prev: WeeklyMealPlan) => {
      const newPlan = { ...prev }
      const dayName = dayNamesFull[selectedDayIndex]
      newPlan[dayName] = newPlan[dayName].map((meal) =>
        meal.id === mealId
          ? {
              ...meal,
              food_items: [...meal.food_items, { 
                id: Date.now() + foodCounter + meal.food_items.length * 10000 + Math.floor(Math.random() * 1000000), 
                alternatives: [], 
                ...foodData 
              }],
            }
          : meal,
      )
      return newPlan
    })
    
    // Increment food counter and reset form
    setFoodCounter(prev => prev + 1)
    setNewFoodName("")
    setNewFoodQuantity("")
    setNewFoodUnit("g")
    setShowAddFood(null)
  }, [newFoodName, newFoodQuantity, newFoodUnit, selectedDayIndex, foodCounter, setWeeklyMealPlan])

  const deleteFood = (mealId: string, foodId: number) => {
    setWeeklyMealPlan((prev: WeeklyMealPlan) => {
      const newPlan = { ...prev }
      const dayName = dayNamesFull[selectedDayIndex]
      newPlan[dayName] = newPlan[dayName].map((meal) =>
        meal.id === mealId ? { ...meal, food_items: meal.food_items.filter((food) => food.id !== foodId) } : meal,
      )
      return newPlan
    })
  }

  const addCustomMeal = useCallback(() => {
    // Prevent multiple executions with debouncing and ref check
    const now = Date.now()
    if (creatingMealRef.current || isCreatingMeal || !customMealName.trim()) {
      console.log('Blocking meal creation - already creating or missing data')
      return
    }
    
    // Additional debounce check - prevent rapid successive calls
    if (now - lastMealCreationTime.current < 500) {
      console.log('Blocking meal creation - too soon after last creation')
      return
    }
    
    console.log('Starting meal creation process...')
    lastMealCreationTime.current = now
    creatingMealRef.current = true
    setIsCreatingMeal(true)
    
    try {
      // Generate a highly unique ID using multiple entropy sources
      const timestamp = Date.now()
      const random1 = Math.floor(Math.random() * 1000000)
      const random2 = Math.floor(Math.random() * 1000000)
      const uniqueId = `custom-meal-${timestamp}-${mealCounter}-${currentDayMeals.length}-${random1}-${random2}`
      
      console.log('Creating meal with ID:', uniqueId, 'Name:', customMealName)
      
      const newMeal: DietPlanMeal = {
        id: uniqueId,
        diet_plan_id: dietPlan?.id || 'temp-plan',
        day_of_week: selectedDayIndex,
        meal_type: customMealName.toLowerCase().replace(/\s+/g, "_"),
        meal_name: customMealName,
        meal_time: "12:00",
        food_items: [],
        total_calories: 0,
        notes: "",
        order_index: currentDayMeals.length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      
      setWeeklyMealPlan((prev: WeeklyMealPlan) => {
        const newPlan = { ...prev }
        const dayName = dayNamesFull[selectedDayIndex]
        if (!newPlan[dayName]) newPlan[dayName] = []
        
        // Double-check that we're not adding a duplicate
        const existingIds = newPlan[dayName].map(meal => meal.id)
        if (existingIds.includes(uniqueId)) {
          console.warn('Meal with ID already exists, skipping addition:', uniqueId)
          return prev
        }
        
        newPlan[dayName].push(newMeal)
        console.log('Meal added successfully to plan')
        return newPlan
      })
      
      // Increment meal counter and reset form
      setMealCounter(prev => prev + 1)
      setCustomMealName("")
      setShowAddMeal(false)
    } catch (error) {
      console.error("Error creating meal:", error)
    } finally {
      // Delay before allowing next creation
      setTimeout(() => {
        setIsCreatingMeal(false)
        creatingMealRef.current = false
        console.log('Meal creation process completed')
      }, 100)
    }
  }, [isCreatingMeal, customMealName, dietPlan, mealCounter, currentDayMeals.length, selectedDayIndex, setWeeklyMealPlan])

  const scrollToMeal = (container: HTMLElement | null, mealIndex: number) => {
    if (!container) return

    const element = container.querySelector(`[data-meal-index="${mealIndex}"]`) as HTMLElement
    if (element) {
      const containerRect = container.getBoundingClientRect()
      const elementRect = element.getBoundingClientRect()
      const scrollTop = container.scrollTop

      const targetScrollTop =
        scrollTop + elementRect.top - containerRect.top - containerRect.height / 2 + elementRect.height / 2

      container.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: "smooth",
      })
    }
  }

  // Effect to sync side column scrolling when current meal index changes
  useEffect(() => {
    if (showPrevNext) {
      const prevContainer = document.getElementById("prev-day-container") as HTMLDivElement
      const nextContainer = document.getElementById("next-day-container") as HTMLDivElement

      if (currentMealIndex >= 0) {
        scrollToMeal(prevContainer, currentMealIndex)
        scrollToMeal(nextContainer, currentMealIndex)
      }
    }
  }, [currentMealIndex, showPrevNext])

  return (
    <div className={`grid gap-4 min-h-[700px] ${showPrevNext ? 'grid-cols-12' : 'grid-cols-1'} ${className}`}>
      {/* Previous Day */}
      {showPrevNext && prevDayIndex !== undefined && (
        <div className="col-span-12 md:col-span-3">
          <Card
            className="h-full bg-white/80 dark:bg-gray-800/80 rounded-3xl border-0 shadow-md cursor-pointer hover:shadow-lg transition-all"
            onClick={() => onDayChange?.(selectedDayIndex - 1)}
          >
            <CardHeader className="text-center pb-3 border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-lg font-bold text-gray-700 dark:text-gray-300">
                {dayShort[prevDayIndex]} {dates[prevDayIndex]}
              </CardTitle>
            </CardHeader>
            <CardContent
              id="prev-day-container"
              className="p-4 space-y-3 max-h-[600px] overflow-y-auto scroll-smooth"
              style={{ scrollBehavior: "smooth" }}
            >
              {prevDayMeals.length > 0 ? (
                prevDayMeals.map((meal, index) => (
                  <div
                    key={meal.id}
                    data-meal-index={index}
                    className={`transition-all duration-300 rounded-xl p-3 ${
                      index === currentMealIndex
                        ? "bg-emerald-100 dark:bg-emerald-900/30 ring-2 ring-emerald-400 shadow-lg transform scale-105"
                        : "bg-gray-50 dark:bg-gray-700/50"
                    }`}
                  >
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                      {meal.meal_name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {meal.food_items.length} alimenti - {meal.total_calories} kcal
                    </p>
                    {index === currentMealIndex && (
                      <div className="mt-2 space-y-1 animate-fade-in-up">
                        {meal.food_items.slice(0, 3).map((food) => (
                          <p key={food.id} className="text-xs text-gray-600 dark:text-gray-300 truncate">
                            • {food.name}
                          </p>
                        ))}
                        {meal.food_items.length > 3 && (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400">
                            +{meal.food_items.length - 3} altri
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">Nessun pasto</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Current Day */}
      <div className={showPrevNext ? "col-span-12 md:col-span-6" : "col-span-1"}>
        <Card
          className={`h-full bg-emerald-400 text-white rounded-3xl border-0 shadow-xl transition-all duration-300 ${
            isTransitioning
              ? `transform ${transitionDirection === "right" ? "translate-x-4" : "-translate-x-4"} opacity-75`
              : "translate-x-0 opacity-100"
          }`}
        >
          <CardHeader className="text-center pb-4 border-b border-emerald-300">
            <CardTitle className="text-3xl font-bold">
              {dayShort[selectedDayIndex]} {dates[selectedDayIndex]}
            </CardTitle>
            <p className="text-emerald-100 text-lg mt-1">
              {showPrevNext ? "Oggi" : dayNamesFull[selectedDayIndex]}
            </p>
          </CardHeader>
          <CardContent className="p-6 space-y-4 max-h-[600px] overflow-y-auto scroll-smooth">
            {currentDayMeals.map((meal, mealIndex) => (
              <Card
                key={`${selectedDayIndex}-${meal.id}-${mealIndex}-${meal.created_at || Date.now()}`}
                data-meal-index={mealIndex}
                className={`bg-white/95 dark:bg-gray-800/95 rounded-2xl border-0 shadow-lg transition-all duration-300 ${
                  mealIndex === currentMealIndex ? "ring-2 ring-white shadow-2xl" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">{meal.meal_name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                        {meal.total_calories} kcal
                      </Badge>
                      {mealIndex === currentMealIndex && (
                        <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 animate-pulse">
                          In Focus
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-3">
                    {meal.food_items.map((food) => (
                      <div
                        key={`${selectedDayIndex}-${meal.id}-${food.id}`}
                        className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-800 dark:text-white text-sm">
                            {food.name} - {food.quantity}{food.unit}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedFoodForAlternatives({ mealId: meal.id, foodId: food.id, food })
                                setShowAlternativesSheet(true)
                              }}
                              className="h-6 w-6 text-blue-500 hover:bg-blue-100"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteFood(meal.id, food.id)}
                              className="h-6 w-6 text-red-500 hover:bg-red-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {food.alternatives && food.alternatives.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                              {food.alternatives.length} alternative disponibili
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {showAddFood === meal.id ? (
                    <div className="space-y-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mt-3">
                      <Input
                        placeholder="Nome alimento"
                        value={newFoodName}
                        onChange={(e) => setNewFoodName(e.target.value)}
                        className="h-8 text-sm"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Quantità"
                          value={newFoodQuantity}
                          onChange={(e) => setNewFoodQuantity(e.target.value)}
                          className="h-8 text-sm"
                        />
                        <Select value={newFoodUnit} onValueChange={setNewFoodUnit}>
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="g">g</SelectItem>
                            <SelectItem value="ml">ml</SelectItem>
                            <SelectItem value="pezzi">pezzi</SelectItem>
                            <SelectItem value="porzione">porzione</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => addFood(meal.id)}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 h-8 text-xs"
                          disabled={!newFoodName || !newFoodQuantity}
                        >
                          Aggiungi
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAddFood(null)}
                          className="h-8 text-xs"
                        >
                          Annulla
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddFood(meal.id)}
                      className="w-full mt-3 h-8 text-xs border-dashed"
                    >
                      Aggiungi Alimento
                    </Button>
                  )}
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
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isCreatingMeal && customMealName.trim()) {
                          e.preventDefault()
                          addCustomMeal()
                        }
                      }}
                      className="w-full h-8 text-sm"
                      disabled={isCreatingMeal}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          if (!isCreatingMeal && customMealName.trim()) {
                            addCustomMeal()
                          }
                        }}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 h-8 text-xs"
                        disabled={!customMealName.trim() || isCreatingMeal}
                      >
                        {isCreatingMeal ? "Creando..." : "Crea Pasto"}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          if (!isCreatingMeal) {
                            setShowAddMeal(false)
                            setCustomMealName("")
                          }
                        }} 
                        className="h-8 text-xs"
                        disabled={isCreatingMeal}
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
          <Card
            className="h-full bg-white/80 dark:bg-gray-800/80 rounded-3xl border-0 shadow-md cursor-pointer hover:shadow-lg transition-all"
            onClick={() => onDayChange?.(selectedDayIndex + 1)}
          >
            <CardHeader className="text-center pb-3 border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-lg font-bold text-gray-700 dark:text-gray-300">
                {dayShort[nextDayIndex]} {dates[nextDayIndex]}
              </CardTitle>
            </CardHeader>
            <CardContent
              id="next-day-container"
              className="p-4 space-y-3 max-h-[600px] overflow-y-auto scroll-smooth"
              style={{ scrollBehavior: "smooth" }}
            >
              {nextDayMeals.length > 0 ? (
                nextDayMeals.map((meal, index) => (
                  <div
                    key={meal.id}
                    data-meal-index={index}
                    className={`transition-all duration-300 rounded-xl p-3 ${
                      index === currentMealIndex
                        ? "bg-emerald-100 dark:bg-emerald-900/30 ring-2 ring-emerald-400 shadow-lg transform scale-105"
                        : "bg-gray-50 dark:bg-gray-700/50"
                    }`}
                  >
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                      {meal.meal_name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {meal.food_items.length} alimenti - {meal.total_calories} kcal
                    </p>
                    {index === currentMealIndex && (
                      <div className="mt-2 space-y-1 animate-fade-in-up">
                        {meal.food_items.slice(0, 3).map((food) => (
                          <p key={food.id} className="text-xs text-gray-600 dark:text-gray-300 truncate">
                            • {food.name}
                          </p>
                        ))}
                        {meal.food_items.length > 3 && (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400">
                            +{meal.food_items.length - 3} altri
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">Nessun pasto</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
