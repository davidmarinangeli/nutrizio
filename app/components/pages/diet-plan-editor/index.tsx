"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "../../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Badge } from "../../../../components/ui/badge"
import { Input } from "../../../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select"
import { ChevronLeft, Moon, Sun, Plus, Edit, Trash2, X, Wand2, Loader2, Check } from "lucide-react"
import { type Patient, type DietPlan, type WeeklyMealPlan, type DietPlanMeal } from "../../../../lib/supabase"

interface DietPlanEditorProps {
  patient: Patient | null
  dietPlan: DietPlan | null
  weeklyMealPlan: WeeklyMealPlan
  setWeeklyMealPlan: (plan: WeeklyMealPlan | ((prev: WeeklyMealPlan) => WeeklyMealPlan)) => void
  onBack: () => void
  onSave: () => void
  theme: string | undefined
  setTheme: (theme: string) => void
}

export default function DietPlanEditor({
  patient,
  dietPlan,
  weeklyMealPlan,
  setWeeklyMealPlan,
  onBack,
  onSave,
  theme,
  setTheme
}: DietPlanEditorProps) {
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
  
  // Component mount tracking for debugging
  useEffect(() => {
    console.log('DietPlanEditor component mounted/re-rendered')
    return () => {
      console.log('DietPlanEditor component unmounting')
    }
  }, [])
  
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

  const dayNamesFull = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"]
  const dayShort = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"]
  const dates = ["5", "6", "7", "8", "9", "10", "11"]

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
    if (creatingMealRef.current || isCreatingMeal || !customMealName.trim() || !dietPlan) {
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
        diet_plan_id: dietPlan.id,
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

    setWeeklyMealPlan((prev: WeeklyMealPlan) => {
      const newPlan = { ...prev }
      const dayName = dayNamesFull[selectedDayIndex]
      newPlan[dayName] = newPlan[dayName].map((meal: DietPlanMeal) =>
        meal.id === mealId
          ? {
              ...meal,
              food_items: meal.food_items.map((food: any) =>
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

    setWeeklyMealPlan((prev: WeeklyMealPlan) => {
      const newPlan = { ...prev }
      const dayName = dayNamesFull[selectedDayIndex]
      newPlan[dayName] = newPlan[dayName].map((meal) =>
        meal.id === mealId
          ? {
              ...meal,
              food_items: meal.food_items.map((food) =>
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

    setWeeklyMealPlan((prev: WeeklyMealPlan) => {
      const newPlan = { ...prev }
      const dayName = dayNamesFull[selectedDayIndex]
      newPlan[dayName] = newPlan[dayName].map((meal) =>
        meal.id === mealId
          ? {
              ...meal,
              food_items: meal.food_items.map((food) =>
                food.id === foodId
                  ? {
                      ...food,
                      alternatives: food.alternatives?.filter((_alt, index) => index !== altIndex) || [],
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

  if (!patient) {
    return <div>Paziente non trovato</div>
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-secondary-50 to-secondary-100">
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-brand-secondary"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-secondary-600 to-secondary-700 bg-clip-text text-transparent">
            Modifica Piano Alimentare - {patient.name} {patient.surname}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full bg-card hover:bg-tertiary-50 shadow-brand-soft border-tertiary-200"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-accent" />
            ) : (
              <Moon className="h-5 w-5 text-secondary" />
            )}
          </Button>
        </div>

        <div className="grid grid-cols-12 gap-4 min-h-[700px]">
          {/* Previous Day */}
          <div className="col-span-12 md:col-span-3">
            <Card
              className="h-full bg-card/80 rounded-3xl border-tertiary-200 shadow-brand-soft cursor-pointer hover:shadow-brand-secondary transition-all hover:scale-105"
              onClick={() => handleDayChange(selectedDayIndex - 1)}
            >
              <CardHeader className="text-center pb-3 border-b border-tertiary-200">
                <CardTitle className="text-lg font-bold text-muted-foreground">
                  {dayNamesFull[prevDayIndex]}
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
                          ? "bg-secondary-100 ring-2 ring-secondary-400 shadow-brand-secondary transform scale-105"
                          : "bg-card/70 border border-secondary-200"
                      }`}
                    >
                      <h4 className="text-sm font-semibold text-secondary-foreground truncate">
                        {meal.meal_name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {meal.food_items.length} alimenti - {meal.total_calories} kcal
                      </p>
                      {index === currentMealIndex && (
                        <div className="mt-2 space-y-1 animate-fade-in-up">
                          {meal.food_items.slice(0, 3).map((food) => (
                            <p key={food.id} className="text-xs text-tertiary-foreground truncate">
                              • {food.name}
                            </p>
                          ))}
                          {meal.food_items.length > 3 && (
                            <p className="text-xs text-secondary-600">
                              +{meal.food_items.length - 3} altri
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-8">Nessun pasto</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Current Day */}
          <div className="col-span-12 md:col-span-6">
            <Card
              className={`h-full bg-secondary rounded-3xl border-secondary-300 shadow-brand-secondary transition-all duration-300 ${
                isTransitioning
                  ? `transform ${transitionDirection === "right" ? "translate-x-4" : "-translate-x-4"} opacity-75`
                  : "translate-x-0 opacity-100"
              }`}
            >
              <CardHeader className="text-center pb-4 border-b border-secondary-300">
                <CardTitle className="text-3xl font-bold text-secondary-foreground">
                  {dayNamesFull[selectedDayIndex]}
                </CardTitle>
                <p className="text-secondary-200 text-lg mt-1">Oggi</p>
              </CardHeader>
              <CardContent className="p-6 space-y-4 max-h-[600px] overflow-y-auto scroll-smooth">
                {currentDayMeals.map((meal, mealIndex) => (
                  <Card
                    key={`${selectedDayIndex}-${meal.id}-${mealIndex}-${meal.created_at || Date.now()}`}
                    data-meal-index={mealIndex}
                    className={`bg-card/95 rounded-2xl border-secondary-200 shadow-brand-soft transition-all duration-300 ${
                      mealIndex === currentMealIndex ? "ring-2 ring-accent shadow-brand-primary" : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-card-foreground">{meal.meal_name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-secondary-100 text-secondary-700 border-secondary-300">
                            {meal.total_calories} kcal
                          </Badge>
                          {mealIndex === currentMealIndex && (
                            <Badge className="bg-accent-100 text-accent-700 border-accent-300 animate-pulse">
                              In Focus
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-3 mb-3">
                        {meal.food_items.map((food) => (
                          <div
                            key={`${selectedDayIndex}-${meal.id}-${food.id}`}
                            className="bg-card/70 rounded-lg p-3 border border-secondary-200"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-card-foreground text-sm">
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
                                  className="h-6 w-6 text-tertiary hover:bg-tertiary-100"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteFood(meal.id, food.id)}
                                  className="h-6 w-6 text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            {food.alternatives && food.alternatives.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-secondary-200">
                                <p className="text-xs text-tertiary-600">
                                  {food.alternatives.length} alternative disponibili
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {showAddFood === meal.id ? (
                        <div className="space-y-3 bg-card/70 rounded-lg p-3 mt-3 border border-secondary-200">
                          <Input
                            placeholder="Nome alimento"
                            value={newFoodName}
                            onChange={(e) => setNewFoodName(e.target.value)}
                            className="h-8 text-sm border-secondary-300 focus:border-secondary"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              placeholder="Quantità"
                              value={newFoodQuantity}
                              onChange={(e) => setNewFoodQuantity(e.target.value)}
                              className="h-8 text-sm border-secondary-300 focus:border-secondary"
                            />
                            <Select value={newFoodUnit} onValueChange={setNewFoodUnit}>
                              <SelectTrigger className="h-8 text-sm border-secondary-300">
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
                              className="flex-1 bg-secondary hover:bg-secondary/90 h-8 text-xs text-secondary-foreground"
                              disabled={!newFoodName || !newFoodQuantity}
                            >
                              Aggiungi
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowAddFood(null)}
                              className="h-8 text-xs border-secondary-300 text-secondary-foreground hover:bg-secondary-50"
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
                  <Card className="bg-card/95 rounded-2xl border-secondary-200">
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
                          className="w-full h-8 text-sm border-secondary-300 focus:border-secondary"
                          disabled={isCreatingMeal}
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              if (!isCreatingMeal && customMealName.trim()) {
                                addCustomMeal()
                              }
                            }}
                            className="flex-1 bg-secondary hover:bg-secondary/90 h-8 text-xs text-secondary-foreground"
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
                            className="h-8 text-xs border-secondary-300 hover:bg-secondary-50"
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
                    className="w-full h-12 border-dashed border-2 border-secondary-300 hover:border-secondary-400 hover:bg-secondary-50 text-secondary-600"
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
              className="h-full bg-card/80 rounded-3xl border-tertiary-200 shadow-brand-soft cursor-pointer hover:shadow-brand-secondary transition-all hover:scale-105"
              onClick={() => handleDayChange(selectedDayIndex + 1)}
            >
              <CardHeader className="text-center pb-3 border-b border-tertiary-200">
                <CardTitle className="text-lg font-bold text-muted-foreground">
                  {dayNamesFull[nextDayIndex]}
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
                          ? "bg-secondary-100 ring-2 ring-secondary-400 shadow-brand-secondary transform scale-105"
                          : "bg-card/70 border border-secondary-200"
                      }`}
                    >
                      <h4 className="text-sm font-semibold text-secondary-foreground truncate">
                        {meal.meal_name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {meal.food_items.length} alimenti - {meal.total_calories} kcal
                      </p>
                      {index === currentMealIndex && (
                        <div className="mt-2 space-y-1 animate-fade-in-up">
                          {meal.food_items.slice(0, 3).map((food) => (
                            <p key={food.id} className="text-xs text-tertiary-foreground truncate">
                              • {food.name}
                            </p>
                          ))}
                          {meal.food_items.length > 3 && (
                            <p className="text-xs text-secondary-600">
                              +{meal.food_items.length - 3} altri
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-8">Nessun pasto</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Meal Navigation Indicator */}
        <div className="mt-4 flex justify-center">
          <div className="flex items-center gap-2 bg-card/80 rounded-full px-4 py-2 shadow-brand-soft border border-secondary-200">
            <span className="text-sm text-muted-foreground">Pasto:</span>
            {currentDayMeals.map((_, index) => (
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
          <Button
            className="h-12 px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
            onClick={onSave}
          >
            Salva Modifiche
          </Button>
        </div>

        {/* Alternatives Sheet */}
        {showAlternativesSheet && selectedFoodForAlternatives && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
            <div className="w-full bg-white dark:bg-gray-900 rounded-t-3xl max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    Alternative per {selectedFoodForAlternatives.food.name}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowAlternativesSheet(false)
                      setSelectedFoodForAlternatives(null)
                      setAiSuggestions([])
                      setShowAISuggestions(false)
                    }}
                    className="rounded-full"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {/* Existing Alternatives */}
                <div className="space-y-3 mb-6">
                  {selectedFoodForAlternatives.food.alternatives?.map((alt: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
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
                        className="text-red-500 hover:bg-red-100"
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
                          ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white border-transparent animate-ai-loading shadow-ai-gradient' 
                          : 'text-blue-600 border-blue-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-emerald-50 hover:border-blue-300 hover:shadow-ai-blue hover:scale-105 hover:text-blue-700'
                      }`}
                    >
                      {isGeneratingAI ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-ai-spin" />
                          Generando...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2 transition-all duration-1200 hover:rotate-12 hover:text-blue-600" />
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
