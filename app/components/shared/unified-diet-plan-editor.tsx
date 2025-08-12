"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Input } from "../../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { ChevronLeft, Moon, Sun, Plus, Edit, Trash2, X, Wand2, Loader2, Check } from "lucide-react"
import { generateAlternatives, type GenerateAlternativesRequest } from "../../actions/generate-alternatives"

interface UnifiedDietPlanEditorProps {
  weeklyMealPlan: any
  setWeeklyMealPlan: (plan: any | ((prev: any) => any)) => void
  patientData: any
  title: string
  onBack: () => void
  onSave?: () => void
  onComplete?: (finalPlan?: any) => void
  theme: string | undefined
  setTheme: (theme: string) => void
  additionalContent?: React.ReactNode
  isLoading?: boolean
  mode?: "edit" | "create"
}

export default function UnifiedDietPlanEditor({
  weeklyMealPlan,
  setWeeklyMealPlan,
  patientData,
  title,
  onBack,
  onSave,
  onComplete,
  theme,
  setTheme,
  additionalContent,
  isLoading = false,
  mode = "edit"
}: UnifiedDietPlanEditorProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay())
  const [currentMealIndex, setCurrentMealIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionDirection, setTransitionDirection] = useState<"left" | "right">("right")
  
  // Add a counter to ensure unique IDs
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
  
  // Main food editing states
  const [editingMainFood, setEditingMainFood] = useState(false)
  const [editedFoodName, setEditedFoodName] = useState("")
  const [editedFoodQuantity, setEditedFoodQuantity] = useState("")
  const [editedFoodUnit, setEditedFoodUnit] = useState("g")
  
  // AI suggestions states
  const [aiSuggestions, setAiSuggestions] = useState<Array<{
    name: string
    quantity: string
    unit: string
    calories: number
  }>>([])
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [showAISuggestions, setShowAISuggestions] = useState(false)

  const dayNamesFull = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"]

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
  }, [newFoodName, newFoodQuantity, newFoodUnit, selectedDayIndex, foodCounter, setWeeklyMealPlan])

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

  const updateMainFood = () => {
    if (!selectedFoodForAlternatives || !editedFoodName || !editedFoodQuantity) return

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
                      name: editedFoodName,
                      quantity: editedFoodQuantity,
                      unit: editedFoodUnit,
                    }
                  : food,
              ),
            }
          : meal,
      )
      return newPlan
    })

    // Reset editing state
    setEditingMainFood(false)
    setEditedFoodName("")
    setEditedFoodQuantity("")
    setEditedFoodUnit("g")
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
      
      const newMeal: any = {
        id: uniqueId,
        diet_plan_id: mode === "edit" ? "existing-plan" : "",
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
      
      setWeeklyMealPlan((prev: any) => {
        const newPlan = { ...prev }
        const dayName = dayNamesFull[selectedDayIndex]
        if (!newPlan[dayName]) newPlan[dayName] = []
        
        // Double-check that we're not adding a duplicate
        const existingIds = newPlan[dayName].map((meal: any) => meal.id)
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
  }, [isCreatingMeal, customMealName, mealCounter, currentDayMeals.length, selectedDayIndex, setWeeklyMealPlan, mode])

  const generateAIAlternatives = async () => {
    if (!selectedFoodForAlternatives || !patientData) return
    
    setIsGeneratingAI(true)
    
    try {
      console.log("🚀 Generating AI alternatives with Gemini...")
      
      // Get existing alternatives for this food
      const existingAlternatives = selectedFoodForAlternatives.food.alternatives || []
      
      // Prepare the request with patient context and existing alternatives
      const request: GenerateAlternativesRequest = {
        foodName: selectedFoodForAlternatives.food.name,
        foodQuantity: selectedFoodForAlternatives.food.quantity,
        foodUnit: selectedFoodForAlternatives.food.unit,
        foodCalories: selectedFoodForAlternatives.food.calories || 0,
        existingAlternatives: existingAlternatives.map((alt: any) => ({
          name: alt.name,
          quantity: alt.quantity,
          unit: alt.unit,
          calories: alt.calories || 0
        })),
        patientData: {
          age: patientData.age?.toString() || "30",
          sex: patientData.sex || "F",
          height: patientData.height?.toString() || "170",
          weight: patientData.weight?.toString() || "70",
          targetCalories: (patientData.targetCalories || patientData.target_calories)?.toString() || "2000",
          mainGoal: patientData.mainGoal || patientData.main_goal || "health",
          restrictions: patientData.restrictions || [],
          allergies: patientData.allergies || [],
          notes: patientData.notes || ""
        }
      }
      
      console.log("📤 Sending request with existing alternatives:", request.existingAlternatives)
      
      // Call the server action
      const response = await generateAlternatives(request)
      
      if (response.success && response.alternatives) {
        console.log("✅ AI alternatives received:", response.alternatives)
        setAiSuggestions(response.alternatives)
        setShowAISuggestions(true)
      } else {
        console.error("❌ Failed to generate alternatives:", response.error)
        // Fallback to simple alternatives
        const fallbackSuggestions = [
          { 
            name: `${selectedFoodForAlternatives.food.name} biologico`, 
            quantity: selectedFoodForAlternatives.food.quantity, 
            unit: selectedFoodForAlternatives.food.unit, 
            calories: selectedFoodForAlternatives.food.calories || 0 
          },
          { 
            name: `${selectedFoodForAlternatives.food.name} integrale`, 
            quantity: selectedFoodForAlternatives.food.quantity, 
            unit: selectedFoodForAlternatives.food.unit, 
            calories: Math.round((selectedFoodForAlternatives.food.calories || 0) * 1.05) 
          }
        ]
        setAiSuggestions(fallbackSuggestions)
        setShowAISuggestions(true)
      }
      
    } catch (error) {
      console.error('❌ Error generating AI alternatives:', error)
      
      // Fallback alternatives
      const fallbackSuggestions = [
        { 
          name: `${selectedFoodForAlternatives.food.name} biologico`, 
          quantity: selectedFoodForAlternatives.food.quantity, 
          unit: selectedFoodForAlternatives.food.unit, 
          calories: selectedFoodForAlternatives.food.calories || 0 
        },
        { 
          name: `${selectedFoodForAlternatives.food.name} integrale`, 
          quantity: selectedFoodForAlternatives.food.quantity, 
          unit: selectedFoodForAlternatives.food.unit, 
          calories: Math.round((selectedFoodForAlternatives.food.calories || 0) * 1.05) 
        }
      ]
      setAiSuggestions(fallbackSuggestions)
      setShowAISuggestions(true)
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

    // Reset AI suggestions and close sheet
    setAiSuggestions([])
    setShowAISuggestions(false)
    setShowAlternativesSheet(false)
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

    // Reset form and close sheet
    setNewAlternativeName("")
    setNewAlternativeQuantity("")
    setNewAlternativeUnit("g")
    setShowAlternativesSheet(false)
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
            {title}
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

        {/* Additional content (like patient summary) */}
        {additionalContent}

        {/* Three-Card Diet Plan Editor */}
        <Card className="w-full bg-white dark:bg-gray-800 rounded-3xl border-0 shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">
              Piano Settimanale
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-12 gap-4 min-h-[700px]">
              {/* Previous Day */}
              <div className="col-span-12 md:col-span-3">
                <Card
                  className="h-full bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer hover:shadow-md transition-all hover:scale-105"
                  onClick={() => handleDayChange(selectedDayIndex - 1)}
                >
                  <CardHeader className="text-center pb-3 border-b border-gray-200 dark:border-gray-700">
                    <CardTitle className="text-lg font-bold text-gray-600 dark:text-gray-400">
                      {dayNamesFull[prevDayIndex]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent
                    id="prev-day-container"
                    className="p-4 space-y-3 max-h-[600px] overflow-y-auto scroll-smooth"
                    style={{ scrollBehavior: "smooth" }}
                  >
                    {prevDayMeals.length > 0 ? (
                      prevDayMeals.map((meal: any, index: number) => (
                        <div
                          key={meal.id}
                          data-meal-index={index}
                          className={`transition-all duration-300 rounded-xl p-3 ${
                            index === currentMealIndex
                              ? "bg-emerald-100 dark:bg-emerald-900/30 ring-2 ring-emerald-400 shadow-md transform scale-105"
                              : "bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                          }`}
                        >
                          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                            {meal.meal_name || meal.name}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {(meal.food_items || []).length} alimenti - {meal.total_calories || 0} kcal
                          </p>
                          {index === currentMealIndex && (
                            <div className="mt-2 space-y-1 animate-fade-in-up">
                              {(meal.food_items || []).slice(0, 3).map((food: any) => (
                                <p key={food.id} className="text-xs text-gray-700 dark:text-gray-300 truncate">
                                  • {food.name}
                                </p>
                              ))}
                              {(meal.food_items || []).length > 3 && (
                                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                  +{(meal.food_items || []).length - 3} altri
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

              {/* Current Day */}
              <div className="col-span-12 md:col-span-6">
                <Card
                  className={`h-full bg-emerald-50 dark:bg-gray-800 rounded-3xl border border-emerald-200 dark:border-gray-700 shadow-lg transition-all duration-300 ${
                    isTransitioning
                      ? `transform ${transitionDirection === "right" ? "translate-x-4" : "-translate-x-4"} opacity-75`
                      : "translate-x-0 opacity-100"
                  }`}
                >
                  <CardHeader className="text-center pb-4 border-b border-emerald-200 dark:border-gray-700">
                    <CardTitle className="text-3xl font-bold text-emerald-800 dark:text-emerald-200">
                      {dayNamesFull[selectedDayIndex]}
                    </CardTitle>
                    <p className="text-emerald-600 dark:text-emerald-400 text-lg mt-1">
                      {mode === "edit" ? "Modifica Attiva" : "Anteprima"}
                    </p>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4 max-h-[600px] overflow-y-auto scroll-smooth">
                    {currentDayMeals.map((meal: any, mealIndex: number) => (
                      <Card
                        key={`${selectedDayIndex}-${meal.id}-${mealIndex}-${meal.created_at || Date.now()}`}
                        data-meal-index={mealIndex}
                        className={`bg-white dark:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-sm transition-all duration-300 ${
                          mealIndex === currentMealIndex ? "ring-2 ring-emerald-400 shadow-md" : ""
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                              {meal.meal_name || meal.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border-emerald-300">
                                {meal.total_calories || 0} kcal
                              </Badge>
                              {mealIndex === currentMealIndex && (
                                <Badge className="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border-orange-300 animate-pulse">
                                  In Focus
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-3 mb-3">
                            {(meal.food_items || []).map((food: any) => (
                              <div
                                key={`${selectedDayIndex}-${meal.id}-${food.id}`}
                                className="bg-gray-50 dark:bg-gray-600 rounded-lg p-3 border border-gray-200 dark:border-gray-500"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                                    {food.name} - {food.quantity}{food.unit}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        setSelectedFoodForAlternatives({ mealId: meal.id, foodId: food.id, food })
                                        setEditedFoodName(food.name)
                                        setEditedFoodQuantity(food.quantity)
                                        setEditedFoodUnit(food.unit)
                                        setShowAlternativesSheet(true)
                                      }}
                                      className="h-6 w-6 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-500"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => deleteFood(meal.id, food.id)}
                                      className="h-6 w-6 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                {food.alternatives && food.alternatives.length > 0 && (
                                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-500">
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                      {food.alternatives.length} alternative disponibili
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {showAddFood === meal.id ? (
                            <div className="space-y-3 bg-gray-50 dark:bg-gray-600 rounded-lg p-3 mt-3 border border-gray-200 dark:border-gray-500">
                              <Input
                                placeholder="Nome alimento"
                                value={newFoodName}
                                onChange={(e) => setNewFoodName(e.target.value)}
                                className="h-8 text-sm border-gray-300 dark:border-gray-500 focus:border-emerald-400"
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <Input
                                  placeholder="Quantità"
                                  value={newFoodQuantity}
                                  onChange={(e) => setNewFoodQuantity(e.target.value)}
                                  className="h-8 text-sm border-gray-300 dark:border-gray-500 focus:border-emerald-400"
                                />
                                <Select value={newFoodUnit} onValueChange={setNewFoodUnit}>
                                  <SelectTrigger className="h-8 text-sm border-gray-300 dark:border-gray-500">
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
                                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 h-8 text-xs text-white"
                                  disabled={!newFoodName || !newFoodQuantity}
                                >
                                  Aggiungi
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowAddFood(null)}
                                  className="h-8 text-xs border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
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
                              className="w-full mt-3 h-8 text-xs border-dashed border-gray-300 dark:border-gray-500 text-gray-600 dark:text-gray-400"
                            >
                              Aggiungi Alimento
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}

                    {showAddMeal ? (
                      <Card className="bg-white dark:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-600">
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
                              className="w-full h-8 text-sm border-gray-300 dark:border-gray-500 focus:border-emerald-400"
                              disabled={isCreatingMeal}
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={() => {
                                  if (!isCreatingMeal && customMealName.trim()) {
                                    addCustomMeal()
                                  }
                                }}
                                className="flex-1 bg-emerald-500 hover:bg-emerald-600 h-8 text-xs text-white"
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
                                className="h-8 text-xs border-gray-300 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600"
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
                        className="w-full h-12 border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-600 dark:text-gray-400"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Aggiungi Nuovo Pasto
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Next Day */}
              <div className="col-span-12 md:col-span-3">
                <Card
                  className="h-full bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer hover:shadow-md transition-all hover:scale-105"
                  onClick={() => handleDayChange(selectedDayIndex + 1)}
                >
                  <CardHeader className="text-center pb-3 border-b border-gray-200 dark:border-gray-700">
                    <CardTitle className="text-lg font-bold text-gray-600 dark:text-gray-400">
                      {dayNamesFull[nextDayIndex]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent
                    id="next-day-container"
                    className="p-4 space-y-3 max-h-[600px] overflow-y-auto scroll-smooth"
                    style={{ scrollBehavior: "smooth" }}
                  >
                    {nextDayMeals.length > 0 ? (
                      nextDayMeals.map((meal: any, index: number) => (
                        <div
                          key={meal.id}
                          data-meal-index={index}
                          className={`transition-all duration-300 rounded-xl p-3 ${
                            index === currentMealIndex
                              ? "bg-emerald-100 dark:bg-emerald-900/30 ring-2 ring-emerald-400 shadow-md transform scale-105"
                              : "bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                          }`}
                        >
                          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                            {meal.meal_name || meal.name}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {(meal.food_items || []).length} alimenti - {meal.total_calories || 0} kcal
                          </p>
                          {index === currentMealIndex && (
                            <div className="mt-2 space-y-1 animate-fade-in-up">
                              {(meal.food_items || []).slice(0, 3).map((food: any) => (
                                <p key={food.id} className="text-xs text-gray-700 dark:text-gray-300 truncate">
                                  • {food.name}
                                </p>
                              ))}
                              {(meal.food_items || []).length > 3 && (
                                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                  +{(meal.food_items || []).length - 3} altri
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
            </div>
          </CardContent>
        </Card>

        {/* Meal Navigation Indicator */}
        <div className="mt-4 flex justify-center">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-lg border border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-600 dark:text-gray-400">Pasto:</span>
            {currentDayMeals.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentMealIndex(index)
                  const currentContainer = document.querySelector("[data-meal-index]")?.parentElement?.parentElement as HTMLDivElement
                  if (currentContainer) {
                    scrollToMeal(currentContainer, index)
                  }
                }}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentMealIndex
                    ? "bg-emerald-400 scale-125"
                    : "bg-gray-300 dark:bg-gray-600 hover:bg-emerald-300"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          {onSave && (
            <Button
              className="h-12 px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold mr-4"
              onClick={onSave}
              disabled={isLoading}
            >
              Salva Modifiche
            </Button>
          )}
          {onComplete && (
            <Button
              className="h-12 px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
              onClick={() => onComplete(weeklyMealPlan)}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Completando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Completa
                </>
              )}
            </Button>
          )}
        </div>

        {/* Alternatives Modal */}
        {selectedFoodForAlternatives && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[80vh] bg-white dark:bg-gray-800 overflow-hidden">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">
                    Modifica: {selectedFoodForAlternatives.food.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowAlternativesSheet(false)
                      setSelectedFoodForAlternatives(null)
                      setAiSuggestions([])
                      setShowAISuggestions(false)
                      setEditingMainFood(false)
                      setEditedFoodName("")
                      setEditedFoodQuantity("")
                      setEditedFoodUnit("g")
                    }}
                    className="rounded-full"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 overflow-y-auto">
                {/* Main Food Editing Section */}
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200">Alimento Principale</h4>
                    <Button
                      onClick={() => setEditingMainFood(!editingMainFood)}
                      size="sm"
                      variant="outline"
                      className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-700 dark:hover:bg-blue-900/30"
                    >
                      {editingMainFood ? (
                        <>
                          <X className="h-4 w-4 mr-2" />
                          Annulla
                        </>
                      ) : (
                        <>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifica
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {editingMainFood ? (
                    <div className="space-y-3">
                      <Input
                        placeholder="Nome alimento"
                        value={editedFoodName}
                        onChange={(e) => setEditedFoodName(e.target.value)}
                        className="w-full"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          placeholder="Quantità"
                          value={editedFoodQuantity}
                          onChange={(e) => setEditedFoodQuantity(e.target.value)}
                        />
                        <Select value={editedFoodUnit} onValueChange={setEditedFoodUnit}>
                          <SelectTrigger>
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
                      <Button
                        onClick={updateMainFood}
                        disabled={!editedFoodName || !editedFoodQuantity}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Salva Modifiche
                      </Button>
                    </div>
                  ) : (
                    <div className="p-3 bg-white dark:bg-gray-700 rounded-lg border border-blue-200 dark:border-blue-700">
                      <p className="font-medium text-gray-800 dark:text-white">
                        {selectedFoodForAlternatives.food.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedFoodForAlternatives.food.quantity}{selectedFoodForAlternatives.food.unit}
                        {selectedFoodForAlternatives.food.calories > 0 && ` • ${selectedFoodForAlternatives.food.calories} kcal`}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Existing Alternatives */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Alternative Disponibili</h4>
                  <div className="space-y-3">
                    {selectedFoodForAlternatives.food.alternatives?.map((alt: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl"
                    >
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">{alt.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {alt.quantity}{alt.unit}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteAlternative(index)}
                        className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )) || (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      Nessuna alternativa disponibile
                    </p>
                  )}
                  </div>
                </div>

                {/* Add New Alternative */}
                <div className="space-y-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800 dark:text-white">Aggiungi Alternativa</h4>
                    <Button
                      onClick={generateAIAlternatives}
                      disabled={isGeneratingAI}
                      size="sm"
                      variant="outline"
                      className={`transition-all duration-300 ${
                        isGeneratingAI 
                          ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white border-transparent animate-pulse shadow-lg' 
                          : 'text-blue-600 border-blue-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-emerald-50 hover:border-blue-300 hover:shadow-md hover:scale-105 hover:text-blue-700'
                      }`}
                    >
                      {isGeneratingAI ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generando...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2 transition-all duration-300 hover:rotate-12" />
                          Suggerisci con AI
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {/* AI Suggestions */}
                  {showAISuggestions && aiSuggestions.length > 0 && (
                    <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                      <h5 className="font-medium text-purple-800 dark:text-purple-200 mb-3 flex items-center">
                        <Wand2 className="h-4 w-4 mr-2" />
                        Alternative suggerite dall'AI:
                      </h5>
                      <div className="space-y-2 mb-4">
                        {aiSuggestions.map((suggestion, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 rounded-lg">
                            <div>
                              <span className="font-medium text-purple-800 dark:text-purple-200">{suggestion.name}</span>
                              <span className="text-purple-600 dark:text-purple-400 ml-2">
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
                          className="flex-1 border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30"
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
                      className="w-full"
                      disabled={showAISuggestions}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Quantità"
                        value={newAlternativeQuantity}
                        onChange={(e) => setNewAlternativeQuantity(e.target.value)}
                        disabled={showAISuggestions}
                      />
                      <Select value={newAlternativeUnit} onValueChange={setNewAlternativeUnit} disabled={showAISuggestions}>
                        <SelectTrigger>
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
                    <Button
                      onClick={addAlternative}
                      disabled={!newAlternativeName || !newAlternativeQuantity || showAISuggestions}
                      className="w-full bg-emerald-500 hover:bg-emerald-600"
                    >
                      Aggiungi Alternativa
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
