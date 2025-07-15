"use client"

import { useState, useTransition } from "react"
import { Button } from "../../../../components/ui/button"
import { type Patient } from "../../../../lib/supabase"
import { generateWeeklyPlan } from "../../../actions/generate-plan"
import { patientService, dietPlanService, dietPlanMealService, generateMockDietPlan } from "../../../../lib/supabase"

import Step1BasicInfo from "./step-1-basic-info"
import Step2Restrictions from "./step-2-restrictions"
import Step3CreationMethod from "./step-3-creation-method"
import Step4PreviewFixed from "./step-4-preview-fixed"

interface NewPatientFlowProps {
  onBack: () => void
  onComplete: () => void
  theme: string | undefined
  setTheme: (theme: string) => void
}

export default function NewPatientFlow({
  onBack,
  onComplete,
  theme,
  setTheme
}: NewPatientFlowProps) {
  const [step, setStep] = useState(1)
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(false)
  
  const [selectedCreationMethod, setSelectedCreationMethod] = useState<"ai" | "pdf" | "template" | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([])
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([])
  const [saveAsTemplate, setSaveAsTemplate] = useState(false)
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
    mealCount: "3",
    restrictions: [] as string[],
    allergies: [] as string[],
    notes: "",
  })

  const dayNamesFull = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"]

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

  const handleProceedToStep3 = async () => {
    setIsLoading(true)
    let generatedPlan: any = {}

    try {
      if (selectedCreationMethod === "ai") {
        console.log("=== AI GENERATION DEBUG ===")
        console.log("Patient data being sent to AI:", patientData)
        console.log("Selected creation method:", selectedCreationMethod)
        console.log("==========================")
        
        const aiResult = await generateWeeklyPlan(patientData)
        console.log("AI generation result:", aiResult)
        
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
      setStep(4)
    } catch (error) {
      console.error("Error generating plan:", error)
      // Still proceed to step 4 with empty plan
      setStep(4)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePatient = async (finalWeeklyPlan?: any) => {
    setIsLoading(true)
    
    // Use the modified weekly plan if provided, otherwise use the original
    const planToUse = finalWeeklyPlan || generatedWeeklyPlan
    
    try {
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

      if (Object.keys(planToUse).length > 0) {
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
          const mealsForDay = planToUse[dayName]
          if (mealsForDay && mealsForDay.length > 0) {
            for (let i = 0; i < mealsForDay.length; i++) {
              const meal = mealsForDay[i]
              await dietPlanMealService.create({
                diet_plan_id: dietPlan.id,
                day_of_week: dayIndex,
                meal_type: meal.meal_type || meal.name?.toLowerCase().replace(/\s+/g, "_") || "meal",
                meal_name: meal.meal_name || meal.name || "Pasto",
                meal_time: meal.meal_time || meal.time || "00:00",
                food_items: meal.food_items?.map((food: any) => ({
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
                })) || [],
                total_calories: meal.total_calories || meal.totalCalories || 0,
                notes: meal.notes || "",
                order_index: meal.order_index || i,
              })
            }
          }
        }
      }

      // Reset form
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
        mealCount: "3",
        restrictions: [],
        allergies: [],
        notes: "",
      })
      setStep(1)
      setSelectedCreationMethod(null)
      setUploadedFile(null)
      setSelectedTemplate(null)
      setGeneratedWeeklyPlan({})
      setSelectedRestrictions([])
      setSelectedAllergies([])
      setSaveAsTemplate(false)
      
      onComplete()
    } catch (error) {
      console.error("Error creating patient:", error)
    } finally {
      setIsLoading(false)
    }
  }

  switch (step) {
    case 1:
      return (
        <Step1BasicInfo
          patientData={patientData}
          setPatientData={setPatientData}
          onNext={() => setStep(2)}
          onBack={onBack}
          theme={theme}
          setTheme={setTheme}
        />
      )
    
    case 2:
      return (
        <Step2Restrictions
          selectedRestrictions={selectedRestrictions}
          selectedAllergies={selectedAllergies}
          toggleRestriction={toggleRestriction}
          toggleAllergy={toggleAllergy}
          patientData={patientData}
          setPatientData={setPatientData}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
          theme={theme}
          setTheme={setTheme}
        />
      )
    
    case 3:
      return (
        <Step3CreationMethod
          selectedCreationMethod={selectedCreationMethod}
          setSelectedCreationMethod={setSelectedCreationMethod}
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={setSelectedTemplate}
          uploadedFile={uploadedFile}
          setUploadedFile={setUploadedFile}
          onNext={handleProceedToStep3}
          onBack={() => setStep(2)}
          isLoading={isLoading}
          theme={theme}
          setTheme={setTheme}
        />
      )
    
    case 4:
      return (
        <Step4PreviewFixed
          generatedWeeklyPlan={generatedWeeklyPlan}
          patientData={patientData}
          saveAsTemplate={saveAsTemplate}
          setSaveAsTemplate={setSaveAsTemplate}
          onComplete={handleCreatePatient}
          onBack={() => setStep(3)}
          isLoading={isLoading}
          theme={theme}
          setTheme={setTheme}
        />
      )
    
    default:
      return <div>Step not found</div>
  }
}
