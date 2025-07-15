"use client"

import { useState, useTransition, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from "next-themes"
import { Moon, Sun, Plus, ChevronLeft, Trash2, Edit, X, Loader2, Check } from "lucide-react"
import {
  patientService,
  dietPlanService,
  dietPlanMealService,
  generateMockDietPlan,
  type Patient,
  type DietPlan,
  type DietPlanMeal,
  type WeeklyMealPlan,
} from "@/lib/supabase"
import { seedDatabase } from "@/app/actions/db-actions"
import { generateWeeklyPlan } from "@/app/actions/generate-plan"

const dietaryRestrictions = [
  "Vegetariano",
  "Vegano",
  "Senza Glutine",
  "Senza Lattosio",
  "Diabetico",
  "Ipertensione",
  "Colesterolo Alto",
  "Dieta Mediterranea",
  "Keto",
  "Paleo",
]

const commonAllergies = [
  "Noci",
  "Arachidi",
  "Latticini",
  "Uova",
  "Pesce",
  "Crostacei",
  "Soia",
  "Sesamo",
  "Sedano",
  "Senape",
  "Lupini",
  "Molluschi",
]

const initialTemplates = [
  { id: "template1", name: "Mediterranea Bilanciata" },
  { id: "template2", name: "Aumento Massa Muscolare" },
  { id: "template3", name: "Vegana Detox" },
]

export default function DietitiansAppComponent() {
  const [currentView, setCurrentView] = useState<"patients" | "new-patient" | "patient-detail" | "edit-plan">(
    "patients",
  )
  const [newPatientStep, setNewPatientStep] = useState(1)
  const [selectedCreationMethod, setSelectedCreationMethod] = useState<"ai" | "pdf" | "template" | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [selectedDietPlan, setSelectedDietPlan] = useState<DietPlan | null>(null)
  const [patientDietPlans, setPatientDietPlans] = useState<DietPlan[]>([])
  const [weeklyMealPlan, setWeeklyMealPlan] = useState<WeeklyMealPlan>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [saveAsTemplate, setSaveAsTemplate] = useState(false)
  const [mockTemplates, setMockTemplates] = useState(initialTemplates)
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([])
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([])

  const [expandedMeal, setExpandedMeal] = useState<string | null>(null)
  const [expandedFood, setExpandedFood] = useState<string | null>(null)
  const [newFoodName, setNewFoodName] = useState("")
  const [newFoodQuantity, setNewFoodQuantity] = useState("")
  const [newFoodUnit, setNewFoodUnit] = useState("g")
  const [showAddFood, setShowAddFood] = useState<string | null>(null)

  const [currentDayMeals, setCurrentDayMeals] = useState<DietPlanMeal[]>([])
  const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay())

  const [customMealName, setCustomMealName] = useState("")
  const [showAddMeal, setShowAddMeal] = useState(false)

  const [generatedWeeklyPlan, setGeneratedWeeklyPlan] = useState<any>({})

  const [patientData, setPatientData] = useState({
    name: "",
    surname: "",
    email: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    targetCalories: "2000",
    mainGoal: "weight-loss",
    restrictions: [] as string[],
    allergies: [] as string[],
    notes: "",
  })

  const { theme, setTheme } = useTheme()

  const dayNamesFull = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"]
  const dayShort = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"]
  const dates = ["5", "6", "7", "8", "9", "10", "11"]

  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionDirection, setTransitionDirection] = useState<"left" | "right">("right")

  const [selectedFoodForAlternatives, setSelectedFoodForAlternatives] = useState<{
    mealId: string
    foodId: number
    food: any
  } | null>(null)
  const [showAlternativesSheet, setShowAlternativesSheet] = useState(false)
  const [newAlternativeName, setNewAlternativeName] = useState("")
  const [newAlternativeQuantity, setNewAlternativeQuantity] = useState("")
  const [newAlternativeUnit, setNewAlternativeUnit] = useState("g")

  const [currentMealIndex, setCurrentMealIndex] = useState(0)
  const [mealScrollContainer, setMealScrollContainer] = useState<HTMLDivElement | null>(null)

  // States for editing existing food items
  const [editingFood, setEditingFood] = useState<{mealId: string, foodId: number} | null>(null)
  const [editFoodName, setEditFoodName] = useState("")
  const [editFoodQuantity, setEditFoodQuantity] = useState("")
  const [editFoodUnit, setEditFoodUnit] = useState("g")

  // States for editing meal names
  const [editingMeal, setEditingMeal] = useState<string | null>(null)
  const [editMealName, setEditMealName] = useState("")

  const [initializeApp] = useState(async () => {})

  // Helper function to sync generated plan with weekly meal plan
  const syncGeneratedPlan = () => {
    const updatedPlan: any = {}
    Object.entries(weeklyMealPlan).forEach(([dayName, meals]) => {
      updatedPlan[dayName] = meals.map((meal) => ({
        id: meal.id,
        name: meal.meal_name,
        time: meal.meal_time,
        totalCalories: meal.total_calories,
        foods: meal.food_items.map((food) => ({
          id: food.id,
          name: food.name,
          quantity: food.quantity,
          unit: food.unit,
          calories: food.calories,
          alternatives: food.alternatives,
        })),
      }))
    })
    setGeneratedWeeklyPlan(updatedPlan)
  }

  useEffect(() => {
    const initializeAppAsync = async () => {
      setIsLoading(true)
      setError(null) // Clear any previous errors
      try {
        const seedResult = await seedDatabase()
        if (!seedResult.success) {
          throw new Error(seedResult.error || "Failed to seed database.")
        }
        await loadPatients()
      } catch (err) {
        console.error("Initialization error:", err)
        setError((err as Error).message || "An unknown error occurred during initialization.")
      } finally {
        setIsLoading(false)
      }
    }
    initializeAppAsync()
  }, [])

  useEffect(() => {
    if (selectedPatient) {
      loadPatientDietPlans(selectedPatient.id)
    }
  }, [selectedPatient])

  useEffect(() => {
    if (selectedDietPlan) {
      loadWeeklyMealPlan(selectedDietPlan.id)
    }
  }, [selectedDietPlan])

  useEffect(() => {
    const dayName = dayNamesFull[selectedDayIndex]
    setCurrentDayMeals(weeklyMealPlan[dayName] || [])
  }, [weeklyMealPlan, selectedDayIndex])

  // Sync changes back to generated plan when in step 4
  useEffect(() => {
    if (newPatientStep === 4 && Object.keys(weeklyMealPlan).length > 0) {
      syncGeneratedPlan()
    }
  }, [weeklyMealPlan, newPatientStep])

  const loadPatients = async () => {
    const patientsData = await patientService.getAll()
    setPatients(patientsData)
  }

  const loadPatientDietPlans = async (patientId: string) => {
    const plans = await dietPlanService.getByPatientId(patientId)
    setPatientDietPlans(plans)
    const activePlan = plans.find((plan) => plan.is_active) || plans[0]
    setSelectedDietPlan(activePlan || null)
  }

  const loadWeeklyMealPlan = async (dietPlanId: string) => {
    const weeklyPlan = await dietPlanMealService.getWeeklyPlanByDietPlanId(dietPlanId)
    setWeeklyMealPlan(weeklyPlan)
  }

  const handleProceedToStep3 = async () => {
    setIsLoading(true)
    let generatedPlan: any = {}

    try {
      if (selectedCreationMethod === "ai") {
        const aiResult = await generateWeeklyPlan(patientData)
        if (aiResult.success && aiResult.plan) {
          generatedPlan = aiResult.plan
        }
      } else if (selectedCreationMethod === "template") {
        // Generate plan based on selected template
        generatedPlan = generateMockDietPlan()
        // Customize based on template selection
        if (selectedTemplate === "template2") {
          // Muscle gain template - higher protein
          Object.keys(generatedPlan).forEach((day) => {
            generatedPlan[day]?.forEach((meal: any) => {
              meal.foods?.forEach((food: any) => {
                if (food.name.includes("proteico") || food.name.includes("pollo") || food.name.includes("uova")) {
                  food.calories = Math.round(food.calories * 1.2)
                }
              })
            })
          })
        } else if (selectedTemplate === "template3") {
          // Vegan detox template
          Object.keys(generatedPlan).forEach((day) => {
            generatedPlan[day]?.forEach((meal: any) => {
              meal.foods = meal.foods?.filter(
                (food: any) =>
                  !food.name.includes("pollo") && !food.name.includes("uova") && !food.name.includes("latte"),
              )
            })
          })
        }
      } else if (selectedCreationMethod === "pdf") {
        // For PDF upload, use mock data for now
        generatedPlan = generateMockDietPlan()
      }

      setGeneratedWeeklyPlan(generatedPlan)
      setNewPatientStep(4)
    } catch (error) {
      console.error("Error generating plan:", error)
      // Still proceed to step 4 with empty plan
      setNewPatientStep(4)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePatient = async () => {
    setIsLoading(true)
    const newPatient = await patientService.create({
      name: patientData.name,
      surname: patientData.surname,
      email: patientData.email,
      age: Number.parseInt(patientData.age),
      height: Number.parseInt(patientData.height),
      weight: Number.parseFloat(patientData.weight),
      target_calories: Number.parseInt(patientData.targetCalories),
      main_goal: patientData.mainGoal,
      restrictions: patientData.restrictions,
      allergies: patientData.allergies,
      notes: patientData.notes,
      compliance: 0,
      last_access: "Mai",
      status: "new",
    })

    if (Object.keys(generatedWeeklyPlan).length > 0) {
      const dietPlan = await dietPlanService.create({
        patient_id: newPatient.id,
        name: `Piano Alimentare - ${new Date().toLocaleDateString()}`,
        description: `Piano personalizzato per ${newPatient.name} ${newPatient.surname}`,
        start_date: new Date().toISOString().split("T")[0],
        is_active: true,
        total_calories: Number.parseInt(patientData.targetCalories),
        created_by: "Dietista",
      })

      for (let dayIndex = 0; dayIndex < dayNamesFull.length; dayIndex++) {
        const dayName = dayNamesFull[dayIndex]
        const mealsForDay = generatedWeeklyPlan[dayName]
        if (mealsForDay && mealsForDay.length > 0) {
          for (let i = 0; i < mealsForDay.length; i++) {
            const meal = mealsForDay[i]
            await dietPlanMealService.create({
              diet_plan_id: dietPlan.id,
              day_of_week: dayIndex,
              meal_type: meal.name.toLowerCase().replace(/\s+/g, "_"),
              meal_name: meal.name,
              meal_time: meal.time || "00:00",
              food_items: meal.foods.map((food: any) => ({
                id: food.id,
                name: food.name,
                quantity: food.quantity,
                unit: food.unit,
                calories: food.calories || 0,
                alternatives:
                  food.alternatives?.map((alt: any) => ({
                    name: alt.name,
                    quantity: alt.quantity,
                    unit: alt.unit,
                    calories: alt.calories || 0,
                  })) || [],
              })),
              total_calories: meal.totalCalories || 0,
              notes: "",
              order_index: i,
            })
          }
        }
      }
    }

    if (saveAsTemplate) {
      const newTemplate = {
        id: `template-${Date.now()}`,
        name: `Modello di ${patientData.name} ${patientData.surname}`,
      }
      setMockTemplates((prev) => [...prev, newTemplate])
    }

    setPatientData({
      name: "",
      surname: "",
      email: "",
      age: "",
      gender: "",
      height: "",
      weight: "",
      targetCalories: "2000",
      mainGoal: "weight-loss",
      restrictions: [],
      allergies: [],
      notes: "",
    })
    setNewPatientStep(1)
    setSelectedCreationMethod(null)
    setUploadedFile(null)
    setSelectedTemplate(null)
    setGeneratedWeeklyPlan({})
    setSelectedRestrictions([])
    setSelectedAllergies([])
    setSaveAsTemplate(false)
    setCurrentView("patients")
    await loadPatients()
    setIsLoading(false)
  }

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

  const addFood = (mealId: string) => {
    const foodData = {
      name: newFoodName,
      quantity: newFoodQuantity,
      unit: newFoodUnit,
      calories: 0, // Default to 0, can be calculated later
    }
    setWeeklyMealPlan((prev) => {
      const newPlan = { ...prev }
      const dayName = dayNamesFull[selectedDayIndex]
      newPlan[dayName] = newPlan[dayName].map((meal) =>
        meal.id === mealId
          ? {
              ...meal,
              food_items: [...meal.food_items, { id: Date.now(), alternatives: [], ...foodData }],
            }
          : meal,
      )
      return newPlan
    })
    setNewFoodName("")
    setNewFoodQuantity("")
    setNewFoodUnit("g")
    setShowAddFood(null)
  }

  const deleteFood = (mealId: string, foodId: number) => {
    setWeeklyMealPlan((prev) => {
      const newPlan = { ...prev }
      const dayName = dayNamesFull[selectedDayIndex]
      newPlan[dayName] = newPlan[dayName].map((meal) =>
        meal.id === mealId ? { ...meal, food_items: meal.food_items.filter((food) => food.id !== foodId) } : meal,
      )
      return newPlan
    })
  }

  const deleteMeal = (mealId: string) => {
    setWeeklyMealPlan((prev) => {
      const newPlan = { ...prev }
      const dayName = dayNamesFull[selectedDayIndex]
      newPlan[dayName] = newPlan[dayName].filter((meal) => meal.id !== mealId)
      return newPlan
    })
  }

  const startEditingFood = (mealId: string, foodId: number) => {
    const dayName = dayNamesFull[selectedDayIndex]
    const meal = weeklyMealPlan[dayName]?.find(m => m.id === mealId)
    const food = meal?.food_items.find(f => f.id === foodId)
    
    if (food) {
      setEditingFood({ mealId, foodId })
      setEditFoodName(food.name)
      setEditFoodQuantity(food.quantity)
      setEditFoodUnit(food.unit)
    }
  }

  const saveEditFood = () => {
    if (!editingFood) return

    setWeeklyMealPlan((prev) => {
      const newPlan = { ...prev }
      const dayName = dayNamesFull[selectedDayIndex]
      newPlan[dayName] = newPlan[dayName].map((meal) =>
        meal.id === editingFood.mealId
          ? {
              ...meal,
              food_items: meal.food_items.map((food) =>
                food.id === editingFood.foodId
                  ? {
                      ...food,
                      name: editFoodName,
                      quantity: editFoodQuantity,
                      unit: editFoodUnit,
                    }
                  : food,
              ),
            }
          : meal,
      )
      return newPlan
    })

    setEditingFood(null)
    setEditFoodName("")
    setEditFoodQuantity("")
    setEditFoodUnit("g")
  }

  const cancelEditFood = () => {
    setEditingFood(null)
    setEditFoodName("")
    setEditFoodQuantity("")
    setEditFoodUnit("g")
  }

  const startEditingMeal = (mealId: string, currentName: string) => {
    setEditingMeal(mealId)
    setEditMealName(currentName)
  }

  const saveEditMeal = () => {
    if (!editingMeal) return

    setWeeklyMealPlan((prev) => {
      const newPlan = { ...prev }
      const dayName = dayNamesFull[selectedDayIndex]
      newPlan[dayName] = newPlan[dayName].map((meal) =>
        meal.id === editingMeal
          ? {
              ...meal,
              meal_name: editMealName,
              meal_type: editMealName.toLowerCase().replace(/\s+/g, "_"),
            }
          : meal,
      )
      return newPlan
    })

    setEditingMeal(null)
    setEditMealName("")
  }

  const cancelEditMeal = () => {
    setEditingMeal(null)
    setEditMealName("")
  }

  const addCustomMeal = () => {
    if (customMealName.trim() && selectedDietPlan) {
      const newMeal: DietPlanMeal = {
        id: `custom-meal-${Date.now()}`,
        diet_plan_id: selectedDietPlan.id,
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
      setWeeklyMealPlan((prev) => {
        const newPlan = { ...prev }
        const dayName = dayNamesFull[selectedDayIndex]
        if (!newPlan[dayName]) newPlan[dayName] = []
        newPlan[dayName].push(newMeal)
        return newPlan
      })
      setCustomMealName("")
      setShowAddMeal(false)
    }
  }

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getComplianceColor = (compliance: number) => {
    if (compliance >= 90) return "bg-emerald-400"
    if (compliance >= 70) return "bg-yellow-400"
    return "bg-red-400"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 rounded-full">
            Attivo
          </Badge>
        )
      case "inactive":
        return (
          <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-full">Inattivo</Badge>
        )
      case "new":
        return (
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full">Nuovo</Badge>
        )
      default:
        return null
    }
  }

  const toggleRestriction = (restriction: string) => {
    const newRestrictions = selectedRestrictions.includes(restriction)
      ? selectedRestrictions.filter((r) => r !== restriction)
      : [...selectedRestrictions, restriction]
    setSelectedRestrictions(newRestrictions)
    setPatientData((prev) => ({ ...prev, restrictions: newRestrictions }))
  }

  const toggleAllergy = (allergy: string) => {
    const newAllergies = selectedAllergies.includes(allergy)
      ? selectedAllergies.filter((a) => a !== allergy)
      : [...selectedAllergies, allergy]
    setSelectedAllergies(newAllergies)
    setPatientData((prev) => ({ ...prev, allergies: newAllergies }))
  }

  const handleCreationMethodSelect = (method: "ai" | "pdf" | "template") => {
    setSelectedCreationMethod(method)
  }

  const addAlternative = () => {
    if (!selectedFoodForAlternatives || !newAlternativeName || !newAlternativeQuantity) return

    const { mealId, foodId } = selectedFoodForAlternatives

    setWeeklyMealPlan((prev) => {
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

    setNewAlternativeName("")
    setNewAlternativeQuantity("")
    setNewAlternativeUnit("g")
  }

  const deleteAlternative = (altIndex: number) => {
    if (!selectedFoodForAlternatives) return

    const { mealId, foodId } = selectedFoodForAlternatives

    setWeeklyMealPlan((prev) => {
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
                      alternatives: food.alternatives?.filter((_, index) => index !== altIndex) || [],
                    }
                  : food,
              ),
            }
          : meal,
      )
      return newPlan
    })
  }

  const handleMealScroll = (container: HTMLDivElement) => {
    if (!container) return

    const scrollTop = container.scrollTop
    const containerHeight = container.clientHeight
    const scrollHeight = container.scrollHeight

    // Calculate which meal is currently in view
    const mealElements = container.querySelectorAll("[data-meal-index]")
    let visibleMealIndex = 0

    mealElements.forEach((element, index) => {
      const rect = element.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()

      // Check if meal is in the center of the viewport
      if (
        rect.top <= containerRect.top + containerRect.height / 2 &&
        rect.bottom >= containerRect.top + containerRect.height / 2
      ) {
        visibleMealIndex = index
      }
    })

    if (visibleMealIndex !== currentMealIndex) {
      setCurrentMealIndex(visibleMealIndex)
    }
  }

  const scrollToMeal = (container: HTMLDivElement | null, mealIndex: number) => {
    if (!container) return

    const mealElement = container.querySelector(`[data-meal-index="${mealIndex}"]`) as HTMLElement
    if (mealElement) {
      const containerRect = container.getBoundingClientRect()
      const elementRect = mealElement.getBoundingClientRect()
      const scrollTop = container.scrollTop

      // Calculate the position to center the meal in the container
      const targetScrollTop =
        scrollTop + elementRect.top - containerRect.top - containerRect.height / 2 + elementRect.height / 2

      container.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: "smooth",
      })
    }
  }

  let contentToRender

  if (currentView === "edit-plan") {
    const prevDayIndex = (selectedDayIndex - 1 + 7) % 7
    const nextDayIndex = (selectedDayIndex + 1) % 7
    const prevDayName = dayNamesFull[prevDayIndex]
    const nextDayName = dayNamesFull[nextDayIndex]
    const prevDayMeals = weeklyMealPlan[prevDayName] || []
    const nextDayMeals = weeklyMealPlan[nextDayName] || []

    contentToRender = (
      <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentView("patient-detail")}
              className="rounded-full bg-emerald-400 text-white hover:bg-emerald-500 shadow-md"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
              Modifica Piano Alimentare
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

          <div className="grid grid-cols-12 gap-4 min-h-[700px]">
            {/* Previous Day */}
            <div className="col-span-12 md:col-span-3">
              <Card
                className="h-full bg-white/80 dark:bg-gray-800/80 rounded-3xl border-0 shadow-md cursor-pointer hover:shadow-lg transition-all"
                onClick={() => handleDayChange(selectedDayIndex - 1)}
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

            {/* Current Day */}
            <div className="col-span-12 md:col-span-6">
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
                  <p className="text-emerald-100 text-lg mt-1">Oggi</p>
                </CardHeader>
                <CardContent
                  className="p-6 space-y-4 max-h-[600px] overflow-y-auto scroll-smooth"
                  onScroll={(e) => handleMealScroll(e.currentTarget)}
                  style={{ scrollBehavior: "smooth" }}
                >
                  {currentDayMeals.map((meal, mealIndex) => (
                    <Card
                      key={meal.id}
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
                              key={food.id}
                              className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-800 dark:text-white text-sm">
                                  {food.name} - {food.quantity}
                                  {food.unit}
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
                        <Input
                          placeholder="Nome del pasto"
                          value={customMealName}
                          onChange={(e) => setCustomMealName(e.target.value)}
                          className="w-full h-8 text-sm mb-2"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={addCustomMeal}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 h-8 text-xs"
                            disabled={!customMealName.trim()}
                          >
                            Crea Pasto
                          </Button>
                          <Button variant="outline" onClick={() => setShowAddMeal(false)} className="h-8 text-xs">
                            Annulla
                          </Button>
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
            <div className="col-span-12 md:col-span-3">
              <Card
                className="h-full bg-white/80 dark:bg-gray-800/80 rounded-3xl border-0 shadow-md cursor-pointer hover:shadow-lg transition-all"
                onClick={() => handleDayChange(selectedDayIndex + 1)}
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
          </div>

          {/* Meal Navigation Indicator */}
          <div className="mt-4 flex justify-center">
            <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 rounded-full px-4 py-2 shadow-lg">
              <span className="text-sm text-gray-600 dark:text-gray-300">Pasto:</span>
              {currentDayMeals.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentMealIndex(index)
                    // Scroll current day to the selected meal
                    const currentContainer = document.querySelector("[data-meal-index]")?.parentElement
                      ?.parentElement as HTMLDivElement
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
              onClick={() => setCurrentView("patient-detail")}
            >
              Salva Modifiche
            </Button>
          </div>

          {/* Rest of the alternatives sheet code remains the same */}
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
                            {alt.quantity}
                            {alt.unit}
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
                    <h4 className="font-semibold text-gray-800 dark:text-white">Aggiungi Alternativa</h4>
                    <Input
                      placeholder="Nome alternativa"
                      value={newAlternativeName}
                      onChange={(e) => setNewAlternativeName(e.target.value)}
                      className="w-full"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Quantità"
                        value={newAlternativeQuantity}
                        onChange={(e) => setNewAlternativeQuantity(e.target.value)}
                      />
                      <Select value={newAlternativeUnit} onValueChange={setNewAlternativeUnit}>
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
                      disabled={!newAlternativeName || !newAlternativeQuantity}
                      className="w-full bg-emerald-500 hover:bg-emerald-600"
                    >
                      Aggiungi Alternativa
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
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

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Caricamento in corso...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200 p-4">
        <h2 className="text-xl font-bold mb-4">Errore di Caricamento</h2>
        <p className="text-center mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 text-white">
          Riprova
        </Button>
      </div>
    )
  }

  // Main content rendering based on current view
  if (currentView === "edit-plan") {
    return contentToRender
  } else if (currentView === "patient-detail" && selectedPatient) {
    const todayName = dayNamesFull[new Date().getDay()]
    const todaysMeals = weeklyMealPlan[todayName] || []

    return (
      <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-7xl mx-auto p-4 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentView("patients")}
              className="rounded-full bg-emerald-400 text-white hover:bg-emerald-500 shadow-md"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
              Dettaglio Paziente
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full bg-gray-100 dark:bg-gray-800"
            >
              <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </Button>
          </div>

          <Card className="w-full bg-white dark:bg-gray-800 rounded-3xl border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    {selectedPatient.name} {selectedPatient.surname}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{selectedPatient.email}</p>
                  {getStatusBadge(selectedPatient.status)}
                </div>
                <div className="space-y-3">
                  <p>
                    <span className="text-sm text-gray-500">Età:</span>{" "}
                    <span className="font-semibold">{selectedPatient.age} anni</span>
                  </p>
                  <p>
                    <span className="text-sm text-gray-500">Altezza/Peso:</span>{" "}
                    <span className="font-semibold">
                      {selectedPatient.height}cm / {selectedPatient.weight}kg
                    </span>
                  </p>
                </div>
                <div className="space-y-3">
                  <p>
                    <span className="text-sm text-gray-500">Compliance:</span>{" "}
                    <span className="text-2xl font-bold text-emerald-600">{selectedPatient.compliance}%</span>
                  </p>
                  <p>
                    <span className="text-sm text-gray-500">Ultimo accesso:</span>{" "}
                    <span className="font-semibold">{selectedPatient.last_access}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Plan View */}
          <Card className="w-full bg-white dark:bg-gray-800 rounded-3xl border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">
                  Piano Settimanale Completo
                </CardTitle>
                <Button onClick={() => setCurrentView("edit-plan")} variant="outline" className="rounded-full">
                  <Edit className="h-4 w-4 mr-2" /> Modifica Piano
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {Object.keys(weeklyMealPlan).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-4 lg:gap-6">
                  {dayNamesFull.map((dayName, dayIndex) => {
                    const dayMeals = weeklyMealPlan[dayName] || []
                    const isToday = dayIndex === new Date().getDay()
                    const totalDayCalories = dayMeals.reduce((sum, meal) => sum + meal.total_calories, 0)
                    
                    return (
                      <Card 
                        key={dayName} 
                        className={`transition-all duration-300 hover:shadow-md ${
                          isToday 
                            ? 'ring-2 ring-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' 
                            : 'bg-gray-50 dark:bg-gray-700/50'
                        }`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className={`text-lg font-bold ${
                              isToday 
                                ? 'text-emerald-700 dark:text-emerald-300' 
                                : 'text-gray-800 dark:text-white'
                            }`}>
                              {dayName}
                              {isToday && <span className="ml-2 text-sm font-normal">(Oggi)</span>}
                            </CardTitle>
                            <Badge className={`${
                              isToday 
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200' 
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-200'
                            }`}>
                              {totalDayCalories} kcal
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                          {dayMeals.length > 0 ? (
                            dayMeals.map((meal) => (
                              <div 
                                key={meal.id} 
                                className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                              >
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="font-semibold text-gray-800 dark:text-white text-sm">
                                    {meal.meal_name}
                                  </h4>
                                  <span className="text-xs text-emerald-600 dark:text-emerald-400">
                                    {meal.total_calories} kcal
                                  </span>
                                </div>
                                <div className="space-y-1">
                                  {meal.food_items.slice(0, 3).map((food) => (
                                    <p key={food.id} className="text-xs text-gray-600 dark:text-gray-400">
                                      • {food.name} - {food.quantity}{food.unit}
                                    </p>
                                  ))}
                                  {meal.food_items.length > 3 && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                                      +{meal.food_items.length - 3} altri alimenti
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Nessun pasto programmato
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">Nessun piano alimentare disponibile.</p>
                  <Button onClick={() => setCurrentView("edit-plan")} className="bg-emerald-500 hover:bg-emerald-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Crea Piano Alimentare
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  } else if (currentView === "new-patient") {
    if (newPatientStep === 1) {
      return (
        <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900">
          <div className="w-full max-w-6xl mx-auto p-4 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentView("patients")}
                className="rounded-full bg-emerald-400 text-white hover:bg-emerald-500 shadow-md"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                Nuovo Paziente - Informazioni Base
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

            <Card className="w-full bg-white dark:bg-gray-800 rounded-3xl border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nome *</label>
                      <Input
                        value={patientData.name}
                        onChange={(e) => setPatientData((prev) => ({ ...prev, name: e.target.value }))}
                        className="w-full rounded-2xl h-12"
                        placeholder="Inserisci il nome"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Cognome *
                      </label>
                      <Input
                        value={patientData.surname}
                        onChange={(e) => setPatientData((prev) => ({ ...prev, surname: e.target.value }))}
                        className="w-full rounded-2xl h-12"
                        placeholder="Inserisci il cognome"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email *</label>
                    <Input
                      type="email"
                      value={patientData.email}
                      onChange={(e) => setPatientData((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full rounded-2xl h-12"
                      placeholder="email@esempio.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Età *</label>
                      <Input
                        type="number"
                        value={patientData.age}
                        onChange={(e) => setPatientData((prev) => ({ ...prev, age: e.target.value }))}
                        className="w-full rounded-2xl h-12"
                        placeholder="25"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Altezza (cm) *
                      </label>
                      <Input
                        type="number"
                        value={patientData.height}
                        onChange={(e) => setPatientData((prev) => ({ ...prev, height: e.target.value }))}
                        className="w-full rounded-2xl h-12"
                        placeholder="170"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Peso (kg) *
                      </label>
                      <Input
                        type="number"
                        step="0.1"
                        value={patientData.weight}
                        onChange={(e) => setPatientData((prev) => ({ ...prev, weight: e.target.value }))}
                        className="w-full rounded-2xl h-12"
                        placeholder="70.5"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Calorie Target
                      </label>
                      <Input
                        type="number"
                        value={patientData.targetCalories}
                        onChange={(e) => setPatientData((prev) => ({ ...prev, targetCalories: e.target.value }))}
                        className="w-full rounded-2xl h-12"
                        placeholder="2000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Obiettivo Principale
                      </label>
                      <Select
                        value={patientData.mainGoal}
                        onValueChange={(value) => setPatientData((prev) => ({ ...prev, mainGoal: value }))}
                      >
                        <SelectTrigger className="w-full rounded-2xl h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weight-loss">Perdita di peso</SelectItem>
                          <SelectItem value="weight-gain">Aumento di peso</SelectItem>
                          <SelectItem value="muscle-gain">Aumento massa muscolare</SelectItem>
                          <SelectItem value="maintenance">Mantenimento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Note aggiuntive
                    </label>
                    <textarea
                      value={patientData.notes}
                      onChange={(e) => setPatientData((prev) => ({ ...prev, notes: e.target.value }))}
                      className="w-full rounded-2xl p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                      rows={3}
                      placeholder="Inserisci eventuali note o osservazioni..."
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setNewPatientStep(2)}
                      disabled={
                        !patientData.name ||
                        !patientData.surname ||
                        !patientData.email ||
                        !patientData.age ||
                        !patientData.height ||
                        !patientData.weight
                      }
                      className="h-12 px-8 rounded-2xl bg-emerald-400 hover:bg-emerald-500 text-white font-semibold"
                    >
                      Continua
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    } else if (newPatientStep === 2) {
      return (
        <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900">
          <div className="w-full max-w-6xl mx-auto p-4 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setNewPatientStep(1)}
                className="rounded-full bg-emerald-400 text-white hover:bg-emerald-500 shadow-md"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                Nuovo Paziente - Restrizioni e Allergie
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

            <Card className="w-full bg-white dark:bg-gray-800 rounded-3xl border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="space-y-8">
                  {/* Dietary Restrictions */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Restrizioni Alimentari</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {dietaryRestrictions.map((restriction) => (
                        <Badge
                          key={restriction}
                          variant={selectedRestrictions.includes(restriction) ? "default" : "outline"}
                          className={`cursor-pointer rounded-full px-4 py-2 text-center justify-center transition-all ${
                            selectedRestrictions.includes(restriction)
                              ? "bg-emerald-400 text-white border-0 hover:bg-emerald-500"
                              : "border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-300 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                          }`}
                          onClick={() => toggleRestriction(restriction)}
                        >
                          {restriction}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Allergies */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                      Allergie e Intolleranze
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {commonAllergies.map((allergy) => (
                        <Badge
                          key={allergy}
                          variant={selectedAllergies.includes(allergy) ? "default" : "outline"}
                          className={`cursor-pointer rounded-full px-4 py-2 text-center justify-center transition-all ${
                            selectedAllergies.includes(allergy)
                              ? "bg-red-400 text-white border-0 hover:bg-red-500"
                              : "border-2 border-gray-200 dark:border-gray-700 hover:border-red-300 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                          }`}
                          onClick={() => toggleAllergy(allergy)}
                        >
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  {(selectedRestrictions.length > 0 || selectedAllergies.length > 0) && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-6">
                      <h4 className="font-semibold text-emerald-700 dark:text-emerald-300 mb-3">Riepilogo Selezioni</h4>
                      {selectedRestrictions.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-2">Restrizioni:</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedRestrictions.map((restriction) => (
                              <Badge
                                key={restriction}
                                className="bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200"
                              >
                                {restriction}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedAllergies.length > 0 && (
                        <div>
                          <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-2">Allergie:</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedAllergies.map((allergy) => (
                              <Badge
                                key={allergy}
                                className="bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200"
                              >
                                {allergy}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setNewPatientStep(1)} className="h-12 px-8 rounded-2xl">
                      Indietro
                    </Button>
                    <Button
                      onClick={() => setNewPatientStep(3)}
                      className="h-12 px-8 rounded-2xl bg-emerald-400 hover:bg-emerald-500 text-white font-semibold"
                    >
                      Continua
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    } else if (newPatientStep === 3) {
      return (
        <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900">
          <div className="w-full max-w-6xl mx-auto p-4 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setNewPatientStep(2)}
                className="rounded-full bg-emerald-400 text-white hover:bg-emerald-500 shadow-md"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                Nuovo Paziente - Metodo Creazione Piano
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

            <Card className="w-full bg-white dark:bg-gray-800 rounded-3xl border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                      Come vuoi creare il piano alimentare?
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Scegli il metodo più adatto per generare il piano personalizzato
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* AI Generation */}
                    <Card
                      className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                        selectedCreationMethod === "ai"
                          ? "ring-2 ring-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
                          : "hover:shadow-md"
                      }`}
                      onClick={() => handleCreationMethodSelect("ai")}
                    >
                      <CardContent className="p-6 text-center">
                        <div className="w-16 h-16 bg-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Loader2 className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Generazione AI</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Crea automaticamente un piano personalizzato basato sui dati del paziente
                        </p>
                        {selectedCreationMethod === "ai" && (
                          <Badge className="mt-3 bg-emerald-400 text-white">Selezionato</Badge>
                        )}
                      </CardContent>
                    </Card>

                    {/* Template */}
                    <Card
                      className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                        selectedCreationMethod === "template"
                          ? "ring-2 ring-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
                          : "hover:shadow-md"
                      }`}
                      onClick={() => handleCreationMethodSelect("template")}
                    >
                      <CardContent className="p-6 text-center">
                        <div className="w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Plus className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Da Template</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Utilizza un modello predefinito e personalizzalo
                        </p>
                        {selectedCreationMethod === "template" && (
                          <Badge className="mt-3 bg-emerald-400 text-white">Selezionato</Badge>
                        )}
                      </CardContent>
                    </Card>

                    {/* PDF Upload */}
                    <Card
                      className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                        selectedCreationMethod === "pdf"
                          ? "ring-2 ring-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
                          : "hover:shadow-md"
                      }`}
                      onClick={() => handleCreationMethodSelect("pdf")}
                    >
                      <CardContent className="p-6 text-center">
                        <div className="w-16 h-16 bg-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Plus className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Carica PDF</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Importa un piano esistente da file PDF
                        </p>
                        {selectedCreationMethod === "pdf" && (
                          <Badge className="mt-3 bg-emerald-400 text-white">Selezionato</Badge>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Template Selection */}
                  {selectedCreationMethod === "template" && (
                    <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                      <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-4">Seleziona Template</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {mockTemplates.map((template) => (
                          <Card
                            key={template.id}
                            className={`cursor-pointer transition-all ${
                              selectedTemplate === template.id
                                ? "ring-2 ring-blue-400 bg-blue-100 dark:bg-blue-800"
                                : "hover:bg-blue-50 dark:hover:bg-blue-900/30"
                            }`}
                            onClick={() => setSelectedTemplate(template.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-800 dark:text-white">{template.name}</span>
                                {selectedTemplate === template.id && (
                                  <Badge className="bg-blue-400 text-white">✓</Badge>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PDF Upload */}
                  {selectedCreationMethod === "pdf" && (
                    <div className="mt-8 p-6 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
                      <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-4">Carica File PDF</h4>
                      <div className="border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-xl p-8 text-center">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                          className="hidden"
                          id="pdf-upload"
                        />
                        <label htmlFor="pdf-upload" className="cursor-pointer">
                          <div className="w-16 h-16 bg-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Plus className="h-8 w-8 text-white" />
                          </div>
                          <p className="text-purple-600 dark:text-purple-400 font-medium mb-2">
                            Clicca per caricare un PDF
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">Formati supportati: PDF (max 10MB)</p>
                        </label>
                        {uploadedFile && (
                          <div className="mt-4 p-3 bg-purple-100 dark:bg-purple-800 rounded-lg">
                            <p className="text-purple-700 dark:text-purple-300 font-medium">
                              File caricato: {uploadedFile.name}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setNewPatientStep(2)} className="h-12 px-8 rounded-2xl">
                      Indietro
                    </Button>
                    <Button
                      onClick={handleProceedToStep3}
                      disabled={!selectedCreationMethod || (selectedCreationMethod === "template" && !selectedTemplate)}
                      className="h-12 px-8 rounded-2xl bg-emerald-400 hover:bg-emerald-500 text-white font-semibold"
                    >
                      Continua
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    } else if (newPatientStep === 4) {
      // Convert generated plan to the format expected by the three-column editor
      const convertGeneratedPlanToWeeklyMealPlan = () => {
        const weeklyPlan: WeeklyMealPlan = {}

        Object.entries(generatedWeeklyPlan).forEach(([dayName, meals]: [string, any]) => {
          const dayIndex = dayNamesFull.indexOf(dayName)
          if (dayIndex !== -1 && meals) {
            weeklyPlan[dayName] = meals.map((meal: any, index: number) => ({
              id: `preview-meal-${dayName}-${index}`,
              diet_plan_id: "preview-plan",
              day_of_week: dayIndex,
              meal_type: meal.name.toLowerCase().replace(/\s+/g, "_"),
              meal_name: meal.name,
              meal_time: meal.time || "12:00",
              food_items:
                meal.foods?.map((food: any) => ({
                  id: food.id || Date.now() + Math.random(),
                  name: food.name,
                  quantity: food.quantity,
                  unit: food.unit,
                  calories: food.calories || 0,
                  alternatives: food.alternatives || [],
                })) || [],
              total_calories: meal.totalCalories || 0,
              notes: "",
              order_index: index,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }))
          }
        })

        return weeklyPlan
      }

      // Initialize preview weekly plan if not already set
      if (Object.keys(weeklyMealPlan).length === 0 && Object.keys(generatedWeeklyPlan).length > 0) {
        setWeeklyMealPlan(convertGeneratedPlanToWeeklyMealPlan())
      }

      const prevDayIndex = (selectedDayIndex - 1 + 7) % 7
      const nextDayIndex = (selectedDayIndex + 1) % 7
      const prevDayName = dayNamesFull[prevDayIndex]
      const nextDayName = dayNamesFull[nextDayIndex]
      const currentDayName = dayNamesFull[selectedDayIndex]
      const prevDayMeals = weeklyMealPlan[prevDayName] || []
      const nextDayMeals = weeklyMealPlan[nextDayName] || []
      const currentDayMealsPreview = weeklyMealPlan[currentDayName] || []

      return (
        <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
          <div className="w-full max-w-7xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setNewPatientStep(3)}
                className="rounded-full bg-emerald-400 text-white hover:bg-emerald-500 shadow-md"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                Nuovo Paziente - Anteprima Piano Alimentare
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

            {/* Patient Summary Card */}
            <Card className="w-full bg-white dark:bg-gray-800 rounded-3xl border-0 shadow-lg mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                      {patientData.name} {patientData.surname}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{patientData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Età/Obiettivo</p>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {patientData.age} anni - {patientData.mainGoal}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fisico</p>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {patientData.height}cm / {patientData.weight}kg
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Calorie Target</p>
                    <p className="font-semibold text-emerald-600">{patientData.targetCalories} kcal</p>
                  </div>
                </div>
                {(selectedRestrictions.length > 0 || selectedAllergies.length > 0) && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-wrap gap-2">
                      {selectedRestrictions.map((restriction) => (
                        <Badge
                          key={restriction}
                          className="bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200"
                        >
                          {restriction}
                        </Badge>
                      ))}
                      {selectedAllergies.map((allergy) => (
                        <Badge key={allergy} className="bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200">
                          ⚠️ {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Three-Column Layout */}
            <div className="grid grid-cols-12 gap-4 min-h-[700px] mb-6">
              {/* Previous Day Column */}
              <div className="col-span-12 md:col-span-3">
                <Card
                  className="h-full bg-white/80 dark:bg-gray-800/80 rounded-3xl border-0 shadow-md cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => handleDayChange(selectedDayIndex - 1)}
                >
                  <CardHeader className="text-center pb-3 border-b border-gray-200 dark:border-gray-700">
                    <CardTitle className="text-lg font-bold text-gray-700 dark:text-gray-300">
                      {dayShort[prevDayIndex]} {dates[prevDayIndex]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3 max-h-[600px] overflow-y-auto scroll-smooth">
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

              {/* Current Day Column (Main Editor) */}
              <div className="col-span-12 md:col-span-6">
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
                    <p className="text-emerald-100 text-lg mt-1">{dayNamesFull[selectedDayIndex]}</p>
                  </CardHeader>
                  <CardContent
                    className="p-6 space-y-4 max-h-[600px] overflow-y-auto scroll-smooth"
                    onScroll={(e) => handleMealScroll(e.currentTarget)}
                    style={{ scrollBehavior: "smooth" }}
                  >
                    {currentDayMealsPreview.map((meal, mealIndex) => (
                      <Card
                        key={meal.id}
                        data-meal-index={mealIndex}
                        className={`bg-white/95 dark:bg-gray-800/95 rounded-2xl border-0 shadow-lg transition-all duration-300 ${
                          mealIndex === currentMealIndex ? "ring-2 ring-white shadow-2xl" : ""
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            {editingMeal === meal.id ? (
                              <div className="flex items-center gap-2 flex-1">
                                <Input
                                  value={editMealName}
                                  onChange={(e) => setEditMealName(e.target.value)}
                                  className="h-8 text-sm flex-1"
                                  placeholder="Nome del pasto"
                                />
                                <Button
                                  size="sm"
                                  onClick={saveEditMeal}
                                  disabled={!editMealName.trim()}
                                  className="h-8 px-2 bg-emerald-500 hover:bg-emerald-600"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={cancelEditMeal}
                                  className="h-8 px-2"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <h3 
                                className="text-lg font-bold text-gray-800 dark:text-white cursor-pointer hover:text-emerald-600 transition-colors"
                                onClick={() => startEditingMeal(meal.id, meal.meal_name)}
                                title="Clicca per modificare il nome"
                              >
                                {meal.meal_name}
                              </h3>
                            )}
                            <div className="flex items-center gap-2 ml-2">
                              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                                {meal.total_calories} kcal
                              </Badge>
                              {mealIndex === currentMealIndex && (
                                <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 animate-pulse">
                                  In Focus
                                </Badge>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteMeal(meal.id)}
                                className="h-6 w-6 text-red-500 hover:bg-red-100"
                                title="Elimina pasto"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-3 mb-3">
                            {meal.food_items.map((food) => (
                              <div
                                key={food.id}
                                className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                              >
                                {editingFood?.mealId === meal.id && editingFood?.foodId === food.id ? (
                                  <div className="space-y-3">
                                    <Input
                                      value={editFoodName}
                                      onChange={(e) => setEditFoodName(e.target.value)}
                                      placeholder="Nome alimento"
                                      className="h-8 text-sm"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                      <Input
                                        value={editFoodQuantity}
                                        onChange={(e) => setEditFoodQuantity(e.target.value)}
                                        placeholder="Quantità"
                                        className="h-8 text-sm"
                                      />
                                      <Select value={editFoodUnit} onValueChange={setEditFoodUnit}>
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
                                        onClick={saveEditFood}
                                        disabled={!editFoodName || !editFoodQuantity}
                                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 h-8 text-xs"
                                      >
                                        <Check className="h-3 w-3 mr-1" />
                                        Salva
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={cancelEditFood}
                                        className="h-8 text-xs"
                                      >
                                        <X className="h-3 w-3 mr-1" />
                                        Annulla
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-center justify-between">
                                      <span 
                                        className="font-medium text-gray-800 dark:text-white text-sm cursor-pointer hover:text-emerald-600 transition-colors"
                                        onClick={() => startEditingFood(meal.id, food.id)}
                                        title="Clicca per modificare"
                                      >
                                        {food.name} - {food.quantity}
                                        {food.unit}
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => startEditingFood(meal.id, food.id)}
                                          className="h-6 w-6 text-blue-500 hover:bg-blue-100"
                                          title="Modifica alimento"
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => {
                                            setSelectedFoodForAlternatives({ mealId: meal.id, foodId: food.id, food })
                                            setShowAlternativesSheet(true)
                                          }}
                                          className="h-6 w-6 text-purple-500 hover:bg-purple-100"
                                          title="Gestisci alternative"
                                        >
                                          <Plus className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => deleteFood(meal.id, food.id)}
                                          className="h-6 w-6 text-red-500 hover:bg-red-100"
                                          title="Elimina alimento"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                    {food.alternatives && food.alternatives.length > 0 && (
                                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                                        <p className="text-xs text-purple-600 dark:text-purple-400">
                                          {food.alternatives.length} alternative disponibili
                                        </p>
                                      </div>
                                    )}
                                  </>
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
                          <Input
                            placeholder="Nome del pasto"
                            value={customMealName}
                            onChange={(e) => setCustomMealName(e.target.value)}
                            className="w-full h-8 text-sm mb-2"
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                if (customMealName.trim()) {
                                  const newMeal = {
                                    id: `custom-meal-${Date.now()}`,
                                    diet_plan_id: "preview-plan",
                                    day_of_week: selectedDayIndex,
                                    meal_type: customMealName.toLowerCase().replace(/\s+/g, "_"),
                                    meal_name: customMealName,
                                    meal_time: "12:00",
                                    food_items: [],
                                    total_calories: 0,
                                    notes: "",
                                    order_index: currentDayMealsPreview.length + 1,
                                    created_at: new Date().toISOString(),
                                    updated_at: new Date().toISOString(),
                                  }
                                  setWeeklyMealPlan((prev) => {
                                    const newPlan = { ...prev }
                                    const dayName = dayNamesFull[selectedDayIndex]
                                    if (!newPlan[dayName]) newPlan[dayName] = []
                                    newPlan[dayName].push(newMeal)
                                    return newPlan
                                  })
                                  setCustomMealName("")
                                  setShowAddMeal(false)
                                }
                              }}
                              className="flex-1 bg-emerald-500 hover:bg-emerald-600 h-8 text-xs"
                              disabled={!customMealName.trim()}
                            >
                              Crea Pasto
                            </Button>
                            <Button variant="outline" onClick={() => setShowAddMeal(false)} className="h-8 text-xs">
                              Annulla
                            </Button>
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

              {/* Next Day Column */}
              <div className="col-span-12 md:col-span-3">
                <Card
                  className="h-full bg-white/80 dark:bg-gray-800/80 rounded-3xl border-0 shadow-md cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => handleDayChange(selectedDayIndex + 1)}
                >
                  <CardHeader className="text-center pb-3 border-b border-gray-200 dark:border-gray-700">
                    <CardTitle className="text-lg font-bold text-gray-700 dark:text-gray-300">
                      {dayShort[nextDayIndex]} {dates[nextDayIndex]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3 max-h-[600px] overflow-y-auto scroll-smooth">
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
            </div>

            {/* Meal Navigation Indicator */}
            <div className="mb-6 flex justify-center">
              <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 rounded-full px-4 py-2 shadow-lg">
                <span className="text-sm text-gray-600 dark:text-gray-300">Pasto:</span>
                {currentDayMealsPreview.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentMealIndex(index)
                      const currentContainer = document.querySelector("[data-meal-index]")?.parentElement
                        ?.parentElement as HTMLDivElement
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

            {/* Save Options */}
            <Card className="w-full bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-300">Opzioni di Salvataggio</h3>
                    <p className="text-emerald-600 dark:text-emerald-400 text-sm">
                      Configura come salvare questo piano
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="save-template"
                      checked={saveAsTemplate}
                      onChange={(e) => setSaveAsTemplate(e.target.checked)}
                      className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="save-template" className="text-sm text-emerald-700 dark:text-emerald-300">
                      Salva anche come template per futuri pazienti
                    </label>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setNewPatientStep(3)}
                    className="h-12 px-8 rounded-2xl border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                  >
                    Modifica Metodo
                  </Button>
                  <Button
                    onClick={handleCreatePatient}
                    disabled={isLoading}
                    className="h-12 px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creando Paziente...
                      </>
                    ) : (
                      "Crea Paziente e Piano"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

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
                              {alt.quantity}
                              {alt.unit}
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
                      <h4 className="font-semibold text-gray-800 dark:text-white">Aggiungi Alternativa</h4>
                      <Input
                        placeholder="Nome alternativa"
                        value={newAlternativeName}
                        onChange={(e) => setNewAlternativeName(e.target.value)}
                        className="w-full"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          placeholder="Quantità"
                          value={newAlternativeQuantity}
                          onChange={(e) => setNewAlternativeQuantity(e.target.value)}
                        />
                        <Select value={newAlternativeUnit} onValueChange={setNewAlternativeUnit}>
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
                        disabled={!newAlternativeName || !newAlternativeQuantity}
                        className="w-full bg-emerald-500 hover:bg-emerald-600"
                      >
                        Aggiungi Alternativa
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )
    } else {
      return <div className="text-center">Step non valido</div>
    }
  } else {
    return (
      <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-7xl mx-auto p-4 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
              Gestione Pazienti
            </h1>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full bg-gray-100 dark:bg-gray-800"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button
                onClick={() => setCurrentView("new-patient")}
                className="rounded-full bg-emerald-400 text-white hover:bg-emerald-500 shadow-md"
              >
                <Plus className="h-4 w-4 mr-2" /> Nuovo Paziente
              </Button>
            </div>
          </div>

          <div className="mb-4">
            <Input
              type="search"
              placeholder="Cerca paziente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl h-12"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => (
              <Card
                key={patient.id}
                className="bg-white dark:bg-gray-800 rounded-3xl border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => {
                  setSelectedPatient(patient)
                  setCurrentView("patient-detail")
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">
                        {patient.name} {patient.surname}
                      </CardTitle>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{patient.email}</p>
                    </div>
                    {getStatusBadge(patient.status)}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Età: <span className="font-medium">{patient.age} anni</span>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Peso: <span className="font-medium">{patient.weight} kg</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Compliance:</p>
                      <Badge className={`${getComplianceColor(patient.compliance)} rounded-full`}>
                        {patient.compliance}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }
}
