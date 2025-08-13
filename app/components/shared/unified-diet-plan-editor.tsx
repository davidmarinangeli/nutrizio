"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Input } from "../../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { ChevronLeft, Moon, Sun, Plus, Edit, Trash2, X, Wand2, Loader2, Check, Save } from "lucide-react"
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
  const nextDayIndex = (selectedDayIndex + 1) % 7
  const nextDayName = dayNamesFull[nextDayIndex]
  const nextDayMeals = weeklyMealPlan[nextDayName] || []

  // Scroll to meal function
  const scrollToMeal = (container: HTMLElement, mealIndex: number) => {
    const mealElement = container.querySelector(`[data-meal-index="${mealIndex}"]`) as HTMLElement
    if (mealElement) {
      mealElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest'
      })
    }
  }

  // Sync scroll between current day and next day
  useEffect(() => {
    const currentDayContainer = document.getElementById('current-day-container')
    const nextDayContainer = document.getElementById('next-day-container')
    
    if (!currentDayContainer || !nextDayContainer) return

    let isScrolling = false

    const handleScroll = () => {
      if (isScrolling) return
      
      const meals = currentDayContainer.querySelectorAll('[data-meal-index]')
      const containerRect = currentDayContainer.getBoundingClientRect()
      const containerCenter = containerRect.top + containerRect.height / 2

      let closestMealIndex = 0
      let closestDistance = Infinity

      meals.forEach((meal, index) => {
        const mealRect = meal.getBoundingClientRect()
        const mealCenter = mealRect.top + mealRect.height / 2
        const distance = Math.abs(mealCenter - containerCenter)
        
        if (distance < closestDistance) {
          closestDistance = distance
          closestMealIndex = index
        }
      })

      if (closestMealIndex !== currentMealIndex) {
        setCurrentMealIndex(closestMealIndex)
        
        // Sync scroll to next day meal
        const nextDayMeal = nextDayContainer.querySelector(`[data-meal-index="${closestMealIndex}"]`) as HTMLElement
        if (nextDayMeal) {
          isScrolling = true
          nextDayMeal.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          })
          setTimeout(() => { isScrolling = false }, 500)
        }
      }
    }

    currentDayContainer.addEventListener('scroll', handleScroll)
    
    return () => {
      currentDayContainer.removeEventListener('scroll', handleScroll)
    }
  }, [currentMealIndex, currentDayMeals.length])

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

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Abstract background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 dark:bg-emerald-800 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-300 dark:bg-emerald-700 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-200 dark:bg-emerald-800 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-7xl mx-auto p-4 lg:p-8 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-emerald-700 dark:text-emerald-300 hover:bg-white dark:hover:bg-gray-700 shadow-lg hover:shadow-xl transition-all duration-200 font-lexend border border-emerald-200 dark:border-emerald-700"
            disabled={isLoading}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="typography-headline-large bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent font-lexend">
            {title}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>

        {/* Additional content (like patient summary) */}
        {additionalContent}

        {/* Two-Column Diet Plan Editor */}
        <Card className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl border-0 shadow-xl mb-6">
          <CardHeader>
            <CardTitle className="typography-title-large text-gray-800 dark:text-white font-lexend">
              Piano Settimanale
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-12 gap-6 min-h-[700px]">
              {/* Current Day - 60% */}
              <div className="col-span-12 lg:col-span-7">
                <Card
                  className={`h-full bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-gray-800 dark:to-gray-700 rounded-3xl border-0 shadow-2xl transition-all duration-300 relative overflow-hidden ${
                    isTransitioning
                      ? `transform ${transitionDirection === "right" ? "translate-x-4" : "-translate-x-4"} opacity-75`
                      : "translate-x-0 opacity-100"
                  }`}
                >
                  {/* Decorative element */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-300/20 to-emerald-400/20 dark:from-emerald-600/10 dark:to-emerald-500/10 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
                  
                  <CardHeader className="text-center pb-4 border-b border-emerald-200/50 dark:border-gray-600/50 relative z-10">
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDayChange(selectedDayIndex - 1)}
                        className="rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <div>
                        <CardTitle className="typography-display-small text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-emerald-900 dark:from-emerald-300 dark:to-emerald-100 font-lexend">
                          {dayNamesFull[selectedDayIndex]}
                        </CardTitle>
                        {mode === "edit" && (
                          <p className="typography-label-large text-emerald-600 dark:text-emerald-400 mt-1 font-lexend">
                            {currentDayMeals.length} pasti • {currentDayMeals.reduce((acc: number, meal: any) => acc + (meal.total_calories || 0), 0)} kcal totali
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDayChange(selectedDayIndex + 1)}
                        className="rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                      >
                        <ChevronLeft className="h-5 w-5 rotate-180" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent 
                    id="current-day-container"
                    className="p-6 space-y-4 max-h-[600px] overflow-y-auto scroll-smooth relative z-10"
                  >
                    {currentDayMeals.map((meal: any, mealIndex: number) => (
                      <Card
                        key={`${selectedDayIndex}-${meal.id}-${mealIndex}-${meal.created_at || Date.now()}`}
                        data-meal-index={mealIndex}
                        className={`bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-2xl border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                          mealIndex === currentMealIndex ? "ring-2 ring-emerald-400 shadow-xl scale-[1.02]" : ""
                        }`}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="typography-title-medium text-gray-800 dark:text-gray-200 font-lexend">
                              {meal.meal_name || meal.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-gradient-to-r from-emerald-100 to-emerald-200 dark:from-emerald-900/70 dark:to-emerald-800/70 text-emerald-700 dark:text-emerald-200 border-0 shadow-sm font-medium">
                                {meal.total_calories || 0} kcal
                              </Badge>
                              {mealIndex === currentMealIndex && (
                                <Badge className="bg-orange-500 text-white border-0 shadow-sm animate-pulse font-medium">
                                  In Focus
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-3 mb-4">
                            {(meal.food_items || []).map((food: any) => (
                              <div
                                key={`${selectedDayIndex}-${meal.id}-${food.id}`}
                                className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-600 dark:to-gray-700 rounded-xl p-3.5 border-0 shadow-sm hover:shadow-md transition-all duration-200"
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
                                      className="h-7 w-7 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg transition-all duration-200"
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => deleteFood(meal.id, food.id)}
                                      className="h-7 w-7 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>
                                {food.alternatives && food.alternatives.length > 0 && (
                                  <div className="mt-2 pt-2 border-t border-gray-200/50 dark:border-gray-500/50">
                                    <p className="text-xs text-emerald-600 dark:text-emerald-300 font-medium flex items-center">
                                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></span>
                                      {food.alternatives.length} alternative disponibili
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {showAddFood === meal.id ? (
                            <div className="space-y-3 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-gray-600 dark:to-gray-700 rounded-xl p-4 mt-3 border border-emerald-200/50 dark:border-gray-500/50">
                              <Input
                                placeholder="Nome alimento"
                                value={newFoodName}
                                onChange={(e) => setNewFoodName(e.target.value)}
                                className="h-9 text-sm border-emerald-300 dark:border-emerald-600 focus:border-emerald-400 bg-white/80 dark:bg-gray-800/80"
                              />
                              <div className="grid grid-cols-2 gap-3">
                                <Input
                                  placeholder="Quantità"
                                  value={newFoodQuantity}
                                  onChange={(e) => setNewFoodQuantity(e.target.value)}
                                  className="h-9 text-sm border-emerald-300 dark:border-emerald-600 focus:border-emerald-400 bg-white/80 dark:bg-gray-800/80"
                                />
                                <Select value={newFoodUnit} onValueChange={setNewFoodUnit}>
                                  <SelectTrigger className="h-9 text-sm border-emerald-300 dark:border-emerald-600 bg-white/80 dark:bg-gray-800/80">
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
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => addFood(meal.id)}
                                  className="flex-1 bg-orange-500 hover:bg-orange-600 h-10 text-sm text-white hover:text-white font-lexend font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                                  disabled={!newFoodName || !newFoodQuantity}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Aggiungi
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowAddFood(null)}
                                  className="h-10 text-sm border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 font-lexend transition-all duration-200"
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
                              className="w-full mt-3 h-10 text-sm border-dashed border-2 border-orange-300 dark:border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-800/40 hover:border-orange-400 dark:hover:border-orange-400 font-lexend font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Aggiungi Alimento
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}

                    {showAddMeal ? (
                      <Card className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-600">
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
                              className="w-full h-9 text-sm border-gray-300 dark:border-gray-500 focus:border-emerald-400 bg-white/70 dark:bg-gray-800/70"
                              disabled={isCreatingMeal}
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={() => {
                                  if (!isCreatingMeal && customMealName.trim()) {
                                    addCustomMeal()
                                  }
                                }}
                                className="flex-1 bg-orange-500 hover:bg-orange-600 h-10 text-sm text-white hover:text-white font-lexend font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                                disabled={!customMealName.trim() || isCreatingMeal}
                              >
                                {isCreatingMeal ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creando...
                                  </>
                                ) : (
                                  <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Crea Pasto
                                  </>
                                )}
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  if (!isCreatingMeal) {
                                    setShowAddMeal(false)
                                    setCustomMealName("")
                                  }
                                }} 
                                className="h-10 text-sm border-gray-300 dark:border-gray-500 hover:bg-gray-100/70 dark:hover:bg-gray-600/70 font-lexend transition-all duration-200"
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
                        className="w-full h-14 border-dashed border-2 border-emerald-300 dark:border-emerald-500 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 text-emerald-700 dark:text-emerald-300 hover:from-emerald-100 hover:to-emerald-200 dark:hover:from-emerald-800/40 dark:hover:to-emerald-700/40 hover:border-emerald-400 dark:hover:border-emerald-400 font-lexend font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl text-base"
                      >
                        <Plus className="h-5 w-5 mr-3" /> 
                        Aggiungi Nuovo Pasto
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Next Day (40% width) */}
              <div className="col-span-12 md:col-span-4">
                <Card
                  className="h-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] overflow-hidden"
                  onClick={() => handleDayChange(selectedDayIndex + 1)}
                >
                  <div 
                    className="absolute inset-0 opacity-30 dark:opacity-20"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                  />
                  <CardHeader className="text-center pb-3 border-b border-gray-200 dark:border-gray-700 relative z-10">
                    <CardTitle className="typography-title-medium text-gray-600 dark:text-gray-400 font-lexend">
                      {dayNamesFull[nextDayIndex]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent
                    id="next-day-container"
                    className="p-4 space-y-3 max-h-[600px] overflow-y-auto scroll-smooth relative z-10"
                    style={{ scrollBehavior: "smooth" }}
                  >
                    {nextDayMeals.length > 0 ? (
                      nextDayMeals.map((meal: any, index: number) => (
                        <div
                          key={meal.id}
                          data-meal-index={index}
                          className={`transition-all duration-300 rounded-xl p-3 backdrop-blur-sm ${
                            index === currentMealIndex
                              ? "bg-gradient-to-r from-emerald-100/90 to-emerald-200/90 dark:from-emerald-900/50 dark:to-emerald-800/50 ring-2 ring-emerald-400 shadow-lg transform scale-105"
                              : "bg-gray-50/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 hover:bg-gray-100/80 dark:hover:bg-gray-600/80"
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
                                <p className="text-xs text-emerald-600 dark:text-emerald-300 font-medium">
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

        <div className="mt-6 flex justify-center">
          {onSave && (
            <Button
              className="h-12 px-8 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white hover:text-white typography-label-large font-lexend font-semibold mr-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={onSave}
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              Salva Modifiche
            </Button>
          )}
          {onComplete && (
            <Button
              className="h-12 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white hover:text-white typography-label-large font-lexend font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[80vh] bg-white/95 dark:bg-gray-800/95 backdrop-blur-md overflow-hidden rounded-3xl shadow-2xl">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-gray-800 dark:to-gray-900">
                <div className="flex items-center justify-between">
                  <CardTitle className="typography-title-large text-gray-800 dark:text-white font-lexend">
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
                    className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 overflow-y-auto">
                {/* Main Food Editing Section */}
                <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-emerald-800 dark:text-emerald-200">Alimento Principale</h4>
                    <Button
                      onClick={() => setEditingMainFood(!editingMainFood)}
                      size="sm"
                      variant="outline"
                      className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-700 dark:hover:bg-emerald-900/30"
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
                        className="w-full bg-white/70 dark:bg-gray-800/70"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          placeholder="Quantità"
                          value={editedFoodQuantity}
                          onChange={(e) => setEditedFoodQuantity(e.target.value)}
                          className="bg-white/70 dark:bg-gray-800/70"
                        />
                        <Select value={editedFoodUnit} onValueChange={setEditedFoodUnit}>
                          <SelectTrigger className="bg-white/70 dark:bg-gray-800/70">
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
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white hover:text-white"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Salva Modifiche
                      </Button>
                    </div>
                  ) : (
                    <div className="p-3 bg-white/70 dark:bg-gray-700/70 rounded-lg border border-emerald-200 dark:border-emerald-700">
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
                
                {/* Rest of the modal content remains the same but with enhanced styling... */}
                {/* Existing Alternatives */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Alternative Disponibili</h4>
                  <div className="space-y-3">
                    {selectedFoodForAlternatives.food.alternatives?.map((alt: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl"
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
                        className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full"
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
                <div className="space-y-4 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800 dark:text-white">Aggiungi Alternativa</h4>
                    <Button
                      onClick={generateAIAlternatives}
                      disabled={isGeneratingAI}
                      size="sm"
                      variant="outline"
                      className={`transition-all duration-300 font-lexend font-medium ${
                        isGeneratingAI 
                          ? 'bg-orange-500 text-white border-transparent animate-pulse shadow-lg' 
                          : 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-600 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 hover:from-emerald-100 hover:to-emerald-200 dark:hover:from-emerald-800/40 dark:hover:to-emerald-700/40 hover:border-emerald-300 dark:hover:border-emerald-500 hover:shadow-md hover:scale-105 hover:text-emerald-700 dark:hover:text-emerald-300'
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
                    <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                      <h5 className="font-medium text-emerald-800 dark:text-emerald-200 mb-3 flex items-center">
                        <Wand2 className="h-4 w-4 mr-2" />
                        Alternative suggerite dall'AI:
                      </h5>
                      <div className="space-y-2 mb-4">
                        {aiSuggestions.map((suggestion, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white/70 dark:bg-gray-800/70 border border-emerald-200 dark:border-emerald-700 rounded-lg">
                            <div>
                              <span className="font-medium text-emerald-800 dark:text-emerald-200">{suggestion.name}</span>
                              <span className="text-emerald-600 dark:text-emerald-400 ml-2">
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
                          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white hover:text-white typography-label-large font-lexend font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Aggiungi Alternative
                        </Button>
                        <Button
                          onClick={rejectAISuggestions}
                          size="sm"
                          variant="outline"
                          className="flex-1 border-emerald-200 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 font-lexend font-medium transition-all duration-200"
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
                      className="w-full bg-white/70 dark:bg-gray-800/70"
                      disabled={showAISuggestions}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Quantità"
                        value={newAlternativeQuantity}
                        onChange={(e) => setNewAlternativeQuantity(e.target.value)}
                        className="bg-white/70 dark:bg-gray-800/70"
                        disabled={showAISuggestions}
                      />
                      <Select value={newAlternativeUnit} onValueChange={setNewAlternativeUnit} disabled={showAISuggestions}>
                        <SelectTrigger className="bg-white/70 dark:bg-gray-800/70">
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
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white hover:text-white typography-label-large font-lexend font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Plus className="h-4 w-4 mr-2" />
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