"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "../../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Badge } from "../../../../components/ui/badge"
import { Switch } from "../../../../components/ui/switch"
import { Label } from "../../../../components/ui/label"
import { ChevronLeft, Moon, Sun, Loader2, Check, Plus, Edit, Trash2, X, Wand2 } from "lucide-react"
import { Input } from "../../../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select"

interface Step4PreviewFixedProps {
  generatedWeeklyPlan: any
  patientData: any
  saveAsTemplate: boolean
  setSaveAsTemplate: (value: boolean) => void
  onComplete: (finalWeeklyPlan?: any) => void
  onBack: () => void
  isLoading: boolean
  theme: string | undefined
  setTheme: (theme: string) => void
}

export default function Step4PreviewFixed({
  generatedWeeklyPlan,
  patientData,
  saveAsTemplate,
  setSaveAsTemplate,
  onComplete,
  onBack,
  isLoading,
  theme,
  setTheme
}: Step4PreviewFixedProps) {
  const dayNamesFull = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"]
  const dayShort = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"]
  const dates = ["5", "6", "7", "8", "9", "10", "11"]
  
  // State for the editable meal plan
  const [weeklyMealPlan, setWeeklyMealPlan] = useState(generatedWeeklyPlan)
  const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay())
  const [currentMealIndex, setCurrentMealIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionDirection, setTransitionDirection] = useState<"left" | "right">("right")
  
  // Counters for unique IDs
  const [mealCounter, setMealCounter] = useState(0)
  const [foodCounter, setFoodCounter] = useState(0)
  
  // Refs to prevent duplicate executions
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
  
  // AI suggestions states
  const [aiSuggestions, setAiSuggestions] = useState<Array<{
    name: string
    quantity: string
    unit: string
    calories: number
  }>>([])
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [showAISuggestions, setShowAISuggestions] = useState(false)

  const currentDayMeals = weeklyMealPlan[dayNamesFull[selectedDayIndex]] || []
  const prevDayIndex = (selectedDayIndex - 1 + 7) % 7
  const nextDayIndex = (selectedDayIndex + 1) % 7
  const prevDayName = dayNamesFull[prevDayIndex]
  const nextDayName = dayNamesFull[nextDayIndex]
  const prevDayMeals = weeklyMealPlan[prevDayName] || []
  const nextDayMeals = weeklyMealPlan[nextDayName] || []

  const handleDayChange = async (newDayIndex: number) => {
    const currentIndex = selectedDayIndex
    const targetIndex = (newDayIndex + 7) % 7

    if (currentIndex !== targetIndex) {
      setTransitionDirection(targetIndex > currentIndex ? "right" : "left")
      setIsTransitioning(true)

      // Wait for animation to start
      await new Promise((resolve) => setTimeout(resolve, 150))
      setSelectedDayIndex(targetIndex)

      // Complete animation
      setTimeout(() => setIsTransitioning(false), 300)
    }
  }

  const addFood = useCallback((mealId: string) => {
    const foodData = {
      name: newFoodName,
      quantity: newFoodQuantity,
      unit: newFoodUnit,
      calories: 0,
    }
    setWeeklyMealPlan((prev: any) => {
      const newPlan = { ...prev }
      const dayName = dayNamesFull[selectedDayIndex]
      
      // Safety check: ensure the day exists and has meals
      if (!newPlan[dayName] || !Array.isArray(newPlan[dayName])) {
        console.warn(`Day ${dayName} not found or not an array in meal plan`)
        return prev
      }
      
      newPlan[dayName] = newPlan[dayName].map((meal: any) =>
        meal.id === mealId
          ? {
              ...meal,
              food_items: [...(meal.food_items || []), { 
                id: Date.now() + foodCounter + (meal.food_items?.length || 0) * 10000 + Math.floor(Math.random() * 1000000), 
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
  }, [newFoodName, newFoodQuantity, newFoodUnit, selectedDayIndex, foodCounter])

  const deleteFood = (mealId: string, foodId: number) => {
    setWeeklyMealPlan((prev: any) => {
      if (!prev) return prev
      
      const newPlan = { ...prev }
      const dayName = dayNamesFull[selectedDayIndex]
      
      // Safety check: ensure day exists and is an array
      if (!newPlan[dayName] || !Array.isArray(newPlan[dayName])) {
        return newPlan
      }
      
      newPlan[dayName] = newPlan[dayName].map((meal: any) =>
        meal.id === mealId && meal.food_items && Array.isArray(meal.food_items) 
          ? { ...meal, food_items: meal.food_items.filter((food: any) => food.id !== foodId) } 
          : meal,
      )
      return newPlan
    })
  }

  const generateAIAlternatives = async () => {
    if (!selectedFoodForAlternatives) return
    
    setIsGeneratingAI(true)
    
    try {
      // Simulate AI generation - in a real app this would call an AI service
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API call
      
      const foodName = selectedFoodForAlternatives.food.name.toLowerCase()
      const quantity = selectedFoodForAlternatives.food.quantity
      const unit = selectedFoodForAlternatives.food.unit
      
      // Mock AI-generated alternatives based on food type
      let suggestions = []
      
      if (foodName.includes('riso') || foodName.includes('pasta')) {
        suggestions = [
          { name: 'Quinoa', quantity, unit, calories: Math.round(Math.random() * 50 + 150) },
          { name: 'Orzo perlato', quantity, unit, calories: Math.round(Math.random() * 50 + 140) }
        ]
      } else if (foodName.includes('pollo') || foodName.includes('carne')) {
        suggestions = [
          { name: 'Tofu marinato', quantity, unit, calories: Math.round(Math.random() * 50 + 120) },
          { name: 'Tempeh', quantity, unit, calories: Math.round(Math.random() * 50 + 160) }
        ]
      } else if (foodName.includes('latte') || foodName.includes('yogurt')) {
        suggestions = [
          { name: 'Latte di avena', quantity, unit, calories: Math.round(Math.random() * 30 + 50) },
          { name: 'Yogurt greco proteico', quantity, unit, calories: Math.round(Math.random() * 40 + 80) }
        ]
      } else if (foodName.includes('pane')) {
        suggestions = [
          { name: 'Pane integrale ai cereali', quantity, unit, calories: Math.round(Math.random() * 50 + 200) },
          { name: 'Crackers di riso', quantity, unit, calories: Math.round(Math.random() * 40 + 180) }
        ]
      } else {
        // Generic alternatives
        suggestions = [
          { name: `${foodName} biologico`, quantity, unit, calories: Math.round(Math.random() * 50 + 100) },
          { name: `${foodName} integrale`, quantity, unit, calories: Math.round(Math.random() * 40 + 120) }
        ]
      }
      
      setAiSuggestions(suggestions)
      setShowAISuggestions(true)
      
    } catch (error) {
      console.error('Error generating AI alternatives:', error)
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const acceptAISuggestions = () => {
    if (!selectedFoodForAlternatives || aiSuggestions.length === 0) return

    const { mealId, foodId } = selectedFoodForAlternatives

    setWeeklyMealPlan((prev: any) => {
      const newPlan = { ...prev }
      const dayName = dayNamesFull[selectedDayIndex]
      
      // Safety check: ensure the day exists and has meals
      if (!newPlan[dayName] || !Array.isArray(newPlan[dayName])) {
        console.warn(`Day ${dayName} not found or not an array in meal plan`)
        return prev
      }
      
      newPlan[dayName] = newPlan[dayName].map((meal: any) =>
        meal.id === mealId
          ? {
              ...meal,
              food_items: (meal.food_items || []).map((food: any) =>
                food.id === foodId
                  ? {
                      ...food,
                      alternatives: [
                        ...(food.alternatives || []),
                        ...aiSuggestions
                      ],
                    }
                  : food,
              ),
            }
          : meal,
      )
      return newPlan
    })

    // Reset AI suggestions and close modal
    setAiSuggestions([])
    setShowAISuggestions(false)
    setSelectedFoodForAlternatives(null)
  }

  const rejectAISuggestions = () => {
    setAiSuggestions([])
    setShowAISuggestions(false)
  }

  const addAlternative = () => {
    if (!selectedFoodForAlternatives || !newAlternativeName || !newAlternativeQuantity) return

    const { mealId, foodId } = selectedFoodForAlternatives

    setWeeklyMealPlan((prev: any) => {
      const newPlan = { ...prev }
      const dayName = dayNamesFull[selectedDayIndex]
      
      // Safety check: ensure the day exists and has meals
      if (!newPlan[dayName] || !Array.isArray(newPlan[dayName])) {
        console.warn(`Day ${dayName} not found or not an array in meal plan`)
        return prev
      }
      
      newPlan[dayName] = newPlan[dayName].map((meal: any) =>
        meal.id === mealId
          ? {
              ...meal,
              food_items: (meal.food_items || []).map((food: any) =>
                food.id === foodId
                  ? {
                      ...food,
                      alternatives: [
                        ...(food.alternatives || []),
                        {
                          name: newAlternativeName,
                          quantity: newAlternativeQuantity,
                          unit: newAlternativeUnit,
                          calories: 0,
                        },
                      ],
                    }
                  : food,
              ),
            }
          : meal,
      )
      return newPlan
    })

    // Reset form and close modal
    setNewAlternativeName("")
    setNewAlternativeQuantity("")
    setNewAlternativeUnit("g")
    setSelectedFoodForAlternatives(null)
  }

  const deleteAlternative = (altIndex: number) => {
    if (!selectedFoodForAlternatives) return

    const { mealId, foodId } = selectedFoodForAlternatives

    setWeeklyMealPlan((prev: any) => {
      const newPlan = { ...prev }
      const dayName = dayNamesFull[selectedDayIndex]
      
      // Safety check: ensure the day exists and has meals
      if (!newPlan[dayName] || !Array.isArray(newPlan[dayName])) {
        console.warn(`Day ${dayName} not found or not an array in meal plan`)
        return prev
      }
      
      newPlan[dayName] = newPlan[dayName].map((meal: any) =>
        meal.id === mealId
          ? {
              ...meal,
              food_items: (meal.food_items || []).map((food: any) =>
                food.id === foodId
                  ? {
                      ...food,
                      alternatives: food.alternatives?.filter((_alt: any, index: number) => index !== altIndex) || [],
                    }
                  : food,
              ),
            }
          : meal,
      )
      return newPlan
    })
  }

  const scrollToMeal = (container: HTMLDivElement | null, mealIndex: number) => {
    if (!container) return

    const mealElement = container.querySelector(`[data-meal-index="${mealIndex}"]`) as HTMLElement
    if (mealElement) {
      const containerRect = container.getBoundingClientRect()
      const elementRect = mealElement.getBoundingClientRect()
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
    const prevContainer = document.getElementById("prev-day-container") as HTMLDivElement
    const nextContainer = document.getElementById("next-day-container") as HTMLDivElement

    if (currentMealIndex >= 0) {
      scrollToMeal(prevContainer, currentMealIndex)
      scrollToMeal(nextContainer, currentMealIndex)
    }
  }, [currentMealIndex])

  const addCustomMeal = useCallback(() => {
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
  }, [customMealName, selectedDayIndex, mealCounter])

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-7xl mx-auto p-4 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-full bg-emerald-400 text-white hover:bg-emerald-500 shadow-md"
            disabled={isLoading}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
            Nuovo Paziente - Anteprima Piano
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full bg-gray-100 dark:bg-gray-800"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>

        {/* Patient Summary */}
        <Card className="w-full bg-white dark:bg-gray-800 rounded-3xl border-0 shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">
              Riepilogo Paziente
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                  {patientData.name} {patientData.surname}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{patientData.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Età: <span className="font-medium text-gray-800 dark:text-white">{patientData.age} anni</span>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Peso/Altezza: <span className="font-medium text-gray-800 dark:text-white">{patientData.weight}kg / {patientData.height}cm</span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Calorie Target: <span className="font-medium text-emerald-600">{patientData.targetCalories} kcal</span>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Obiettivo: <span className="font-medium text-gray-800 dark:text-white">{patientData.mainGoal}</span>
                </p>
              </div>
            </div>
            
            {(patientData.restrictions.length > 0 || patientData.allergies.length > 0) && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {patientData.restrictions.length > 0 && (
                  <div className="mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Restrizioni:</span>
                    {patientData.restrictions.map((restriction: string) => (
                      <Badge key={restriction} className="bg-emerald-500 text-white mr-1">
                        {restriction}
                      </Badge>
                    ))}
                  </div>
                )}
                {patientData.allergies.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Allergie:</span>
                    {patientData.allergies.map((allergy: string) => (
                      <Badge key={allergy} className="bg-red-500 text-white mr-1">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Three-Card Diet Plan Editor */}
        <Card className="w-full bg-white dark:bg-gray-800 rounded-3xl border-0 shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">
              Piano Settimanale Generato
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {Object.keys(weeklyMealPlan).length > 0 ? (
              <div className="space-y-6">
                {/* Day Navigation Controls */}
                <div className="flex items-center justify-center gap-4 mb-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDayChange(selectedDayIndex - 1)}
                    className="w-32"
                  >
                    ← Giorno Precedente
                  </Button>
                  
                  <div className="text-center min-w-48">
                    <div className="text-2xl font-bold text-emerald-600">
                      {dayNamesFull[selectedDayIndex]}
                    </div>
                    <div className="text-sm text-gray-500">
                      {currentDayMeals.length} pasti configurati
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDayChange(selectedDayIndex + 1)}
                    className="w-32"
                  >
                    Giorno Successivo →
                  </Button>
                </div>

                {/* Three-Card Layout */}
                <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-all duration-300 ${
                  isTransitioning ? 'opacity-75 scale-95' : 'opacity-100 scale-100'
                }`}>
                  
                  {/* Previous Day Card */}
                  <div className="lg:block hidden">
                    <Card className="bg-emerald-50 border border-emerald-200 h-full">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-emerald-700 text-center">
                          {dayNamesFull[prevDayIndex]}
                        </CardTitle>
                        <p className="text-sm text-emerald-600 text-center">
                          {prevDayMeals.length} pasti
                        </p>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div 
                          id="prev-day-container"
                          className="space-y-3 max-h-96 overflow-y-auto"
                        >
                          {prevDayMeals.length > 0 ? (
                            prevDayMeals.map((meal: any, index: number) => (
                              <Card 
                                key={meal.id || index} 
                                className={`bg-white border border-emerald-300 transition-all duration-200 ${
                                  index === currentMealIndex ? 'ring-2 ring-emerald-500 shadow-lg bg-emerald-50' : ''
                                }`}
                                data-meal-index={index}
                              >
                                <CardContent className="p-3">
                                  <h6 className="font-medium text-emerald-800 text-sm mb-2">
                                    {meal.meal_name || meal.name || meal.type}
                                  </h6>
                                  <div className="space-y-1">
                                    {(meal.food_items || meal.foods || []).map((food: any, foodIdx: number) => (
                                      <div key={food.id || foodIdx} className="text-xs text-emerald-700 bg-emerald-100 p-1 rounded">
                                        {food.name} - {food.quantity}{food.unit}
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            ))
                          ) : (
                            <div className="text-center py-8 text-emerald-400 text-sm">
                              Nessun pasto configurato
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Current Day Card - Main Editor */}
                  <div className="lg:col-span-1 col-span-1">
                    <Card className="bg-white border-2 border-emerald-400 h-full shadow-lg">
                      <CardHeader className="pb-3 bg-emerald-50">
                        <CardTitle className="text-lg text-emerald-700 text-center font-bold">
                          {dayNamesFull[selectedDayIndex]}
                        </CardTitle>
                        <p className="text-sm text-emerald-600 text-center">
                          {currentDayMeals.length} pasti • Modifica attiva
                        </p>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          {currentDayMeals.length > 0 ? (
                            currentDayMeals.map((meal: any, index: number) => (
                              <Card 
                                key={meal.id || index} 
                                className="bg-emerald-50 border border-emerald-200 hover:shadow-md transition-shadow"
                                data-meal-index={index}
                                onMouseEnter={() => setCurrentMealIndex(index)}
                                onMouseLeave={() => setCurrentMealIndex(-1)}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <h5 className="font-semibold text-gray-800">
                                      {meal.meal_name || meal.name || meal.type}
                                    </h5>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-emerald-600 font-medium">
                                        {meal.total_calories || meal.totalCalories || 0} kcal
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700"
                                        onClick={() => setShowAddFood(showAddFood === meal.id ? null : meal.id)}
                                      >
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2 mb-3">
                                    {(meal.food_items || meal.foods || []).map((food: any, foodIndex: number) => (
                                      <div key={food.id || foodIndex} className="bg-white p-3 rounded border group">
                                        <div className="flex items-center justify-between">
                                          <div className="flex-1">
                                            <span className="text-sm font-medium">
                                              {food.name} - {food.quantity}{food.unit}
                                            </span>
                                            <div className="text-xs text-gray-500">
                                              {food.calories || 0} kcal
                                              {food.alternatives && food.alternatives.length > 0 && (
                                                <span className="ml-2 text-emerald-600">
                                                  • {food.alternatives.length} alternative
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                                              onClick={() => setSelectedFoodForAlternatives({ mealId: meal.id, foodId: food.id, food })}
                                            >
                                              <Edit className="h-3 w-3" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                              onClick={() => deleteFood(meal.id, food.id)}
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Add Food Form */}
                                  {showAddFood === meal.id && (
                                    <Card className="bg-white border border-emerald-200 mt-3">
                                      <CardContent className="p-3">
                                        <div className="space-y-3">
                                          <Input
                                            placeholder="Nome alimento"
                                            value={newFoodName}
                                            onChange={(e) => setNewFoodName(e.target.value)}
                                          />
                                          <div className="flex gap-2">
                                            <Input
                                              placeholder="Quantità"
                                              value={newFoodQuantity}
                                              onChange={(e) => setNewFoodQuantity(e.target.value)}
                                              className="flex-1"
                                            />
                                            <Select value={newFoodUnit} onValueChange={setNewFoodUnit}>
                                              <SelectTrigger className="w-20">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="g">g</SelectItem>
                                                <SelectItem value="ml">ml</SelectItem>
                                                <SelectItem value="pz">pz</SelectItem>
                                                <SelectItem value="cucchiai">cucchiai</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div className="flex gap-2">
                                            <Button
                                              onClick={() => addFood(meal.id)}
                                              size="sm"
                                              className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                                              disabled={!newFoodName.trim() || !newFoodQuantity.trim()}
                                            >
                                              Aggiungi
                                            </Button>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => setShowAddFood(null)}
                                            >
                                              <X className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )}
                                </CardContent>
                              </Card>
                            ))
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              Nessun pasto per questo giorno
                            </div>
                          )}
                          
                          {/* Add Meal Section */}
                          {showAddMeal ? (
                            <Card className="bg-white border border-emerald-200">
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  <Input
                                    placeholder="Nome del pasto"
                                    value={customMealName}
                                    onChange={(e) => setCustomMealName(e.target.value)}
                                    className="w-full"
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={addCustomMeal}
                                      className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                                      disabled={!customMealName.trim()}
                                    >
                                      Crea Pasto
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      onClick={() => setShowAddMeal(false)}
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
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Next Day Card */}
                  <div className="lg:block hidden">
                    <Card className="bg-emerald-50 border border-emerald-200 h-full">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-emerald-700 text-center">
                          {dayNamesFull[nextDayIndex]}
                        </CardTitle>
                        <p className="text-sm text-emerald-600 text-center">
                          {nextDayMeals.length} pasti
                        </p>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div 
                          id="next-day-container"
                          className="space-y-3 max-h-96 overflow-y-auto"
                        >
                          {nextDayMeals.length > 0 ? (
                            nextDayMeals.map((meal: any, index: number) => (
                              <Card 
                                key={meal.id || index} 
                                className={`bg-white border border-emerald-300 transition-all duration-200 ${
                                  index === currentMealIndex ? 'ring-2 ring-emerald-500 shadow-lg bg-emerald-50' : ''
                                }`}
                                data-meal-index={index}
                              >
                                <CardContent className="p-3">
                                  <h6 className="font-medium text-emerald-800 text-sm mb-2">
                                    {meal.meal_name || meal.name || meal.type}
                                  </h6>
                                  <div className="space-y-1">
                                    {(meal.food_items || meal.foods || []).map((food: any, foodIdx: number) => (
                                      <div key={food.id || foodIdx} className="text-xs text-emerald-700 bg-emerald-100 p-1 rounded">
                                        {food.name} - {food.quantity}{food.unit}
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            ))
                          ) : (
                            <div className="text-center py-8 text-emerald-400 text-sm">
                              Nessun pasto configurato
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Nessun piano generato. Torna indietro per generare un piano.
                </p>
                <Button onClick={onBack} variant="outline">
                  Torna Indietro
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alternatives Modal */}
        {selectedFoodForAlternatives && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[80vh] bg-white overflow-hidden">
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-gray-800">
                    Alternative per: {selectedFoodForAlternatives.food.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedFoodForAlternatives(null)
                      setAiSuggestions([])
                      setShowAISuggestions(false)
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  Quantità originale: {selectedFoodForAlternatives.food.quantity}{selectedFoodForAlternatives.food.unit} 
                  • {selectedFoodForAlternatives.food.calories || 0} kcal
                </p>
              </CardHeader>
              
              <CardContent className="p-6 overflow-y-auto">
                {/* Current Alternatives */}
                {selectedFoodForAlternatives.food.alternatives && selectedFoodForAlternatives.food.alternatives.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Alternative attuali:</h4>
                    <div className="space-y-2">
                      {selectedFoodForAlternatives.food.alternatives.map((alt: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-medium">{alt.name}</span>
                            <span className="text-gray-600 ml-2">
                              {alt.quantity}{alt.unit} • {alt.calories || 0} kcal
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteAlternative(index)}
                            className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add New Alternative */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800">Aggiungi nuova alternativa:</h4>
                    <Button
                      onClick={generateAIAlternatives}
                      disabled={isGeneratingAI}
                      size="sm"
                      variant="outline"
                      className="text-purple-600 border-purple-200 hover:bg-purple-50 hover:border-purple-300"
                    >
                      {isGeneratingAI ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generando...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" />
                          Suggerisci con AI
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {/* AI Suggestions */}
                  {showAISuggestions && aiSuggestions.length > 0 && (
                    <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <h5 className="font-medium text-purple-800 mb-3 flex items-center">
                        <Wand2 className="h-4 w-4 mr-2" />
                        Alternative suggerite dall'AI:
                      </h5>
                      <div className="space-y-2 mb-4">
                        {aiSuggestions.map((suggestion, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white border border-purple-200 rounded-lg">
                            <div>
                              <span className="font-medium text-purple-800">{suggestion.name}</span>
                              <span className="text-purple-600 ml-2">
                                {suggestion.quantity}{suggestion.unit} • {suggestion.calories} kcal
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={acceptAISuggestions}
                          size="sm"
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Aggiungi Alternative
                        </Button>
                        <Button
                          onClick={rejectAISuggestions}
                          size="sm"
                          variant="outline"
                          className="flex-1 border-purple-200 text-purple-600 hover:bg-purple-50"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Rifiuta
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Manual Alternative Input */}
                  <div className={`space-y-4 ${showAISuggestions ? 'opacity-50' : ''}`}>
                    <Input
                      placeholder="Nome alternativa"
                      value={newAlternativeName}
                      onChange={(e) => setNewAlternativeName(e.target.value)}
                      disabled={showAISuggestions}
                    />
                    <div className="flex gap-3">
                      <Input
                        placeholder="Quantità"
                        value={newAlternativeQuantity}
                        onChange={(e) => setNewAlternativeQuantity(e.target.value)}
                        className="flex-1"
                        disabled={showAISuggestions}
                      />
                      <Select value={newAlternativeUnit} onValueChange={setNewAlternativeUnit} disabled={showAISuggestions}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="g">g</SelectItem>
                          <SelectItem value="ml">ml</SelectItem>
                          <SelectItem value="pz">pz</SelectItem>
                          <SelectItem value="cucchiai">cucchiai</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={addAlternative}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                        disabled={!newAlternativeName.trim() || !newAlternativeQuantity.trim() || showAISuggestions}
                      >
                        Aggiungi Alternativa
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedFoodForAlternatives(null)
                          setAiSuggestions([])
                          setShowAISuggestions(false)
                        }}
                        className="flex-1"
                      >
                        Chiudi
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Options */}
        <Card className="w-full bg-white dark:bg-gray-800 rounded-3xl border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Switch
                id="save-template"
                checked={saveAsTemplate}
                onCheckedChange={setSaveAsTemplate}
              />
              <Label htmlFor="save-template" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Salva questo piano come template per futuri pazienti
              </Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={onBack}
            className="rounded-2xl px-8 py-3"
            disabled={isLoading}
          >
            Indietro
          </Button>
          <Button
            onClick={() => onComplete(weeklyMealPlan)}
            disabled={isLoading}
            className="rounded-2xl px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creando Paziente...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Crea Paziente
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
