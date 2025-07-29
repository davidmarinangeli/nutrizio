"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Loader2 } from "lucide-react"
import { Button } from "../../components/ui/button"
import {
  patientService,
  dietPlanService,
  dietPlanMealService,
  type Patient,
  type DietPlan,
  type WeeklyMealPlan,
} from "../../lib/supabase"
import { seedDatabase } from "../actions/db-actions"

// Import all the page components
import PatientsListPage from "./pages/patients-list-page"
import PatientDetailPage from "./pages/patient-detail-page"
import NewPatientFlow from "./pages/new-patient-flow/index"
import DietPlanEditor from "./pages/diet-plan-editor"

export type ViewType = "patients" | "new-patient" | "patient-detail" | "edit-plan"

export default function DietitiansAppRouter() {
  const [currentView, setCurrentView] = useState<ViewType>("patients")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [selectedDietPlan, setSelectedDietPlan] = useState<DietPlan | null>(null)
  const [patientDietPlans, setPatientDietPlans] = useState<DietPlan[]>([])
  const [weeklyMealPlan, setWeeklyMealPlan] = useState<WeeklyMealPlan>({})
  
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true)
      setError(null)
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
    initializeApp()
  }, [])

  const loadPatients = async () => {
    const patientsData = await patientService.getAll()
    setPatients(patientsData)
  }

  const loadPatientDietPlans = async (patientId: string) => {
    const plans = await dietPlanService.getByPatientId(patientId)
    setPatientDietPlans(plans)
    const activePlan = plans.find((plan) => plan.is_active) || plans[0]
    setSelectedDietPlan(activePlan || null)
    
    // Also load the weekly meal plan for the active diet plan
    if (activePlan) {
      await loadWeeklyMealPlan(activePlan.id)
    }
  }

  const loadWeeklyMealPlan = async (dietPlanId: string) => {
    const weeklyPlan = await dietPlanMealService.getWeeklyPlanByDietPlanId(dietPlanId)
    setWeeklyMealPlan(weeklyPlan)
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Caricamento in corso...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-destructive/5 text-destructive p-4">
        <h2 className="text-xl font-bold mb-4">Errore di Caricamento</h2>
        <p className="text-center mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
          Riprova
        </Button>
      </div>
    )
  }

  // Route to the appropriate page component
  switch (currentView) {
    case "patients":
      return (
        <PatientsListPage
          patients={patients}
          onSelectPatient={async (patient: Patient) => {
            setSelectedPatient(patient)
            await loadPatientDietPlans(patient.id)
            setCurrentView("patient-detail")
          }}
          onCreateNewPatient={() => setCurrentView("new-patient")}
          theme={theme}
          setTheme={setTheme}
        />
      )
    
    case "patient-detail":
      return (
        <PatientDetailPage
          patient={selectedPatient}
          dietPlans={patientDietPlans}
          selectedDietPlan={selectedDietPlan}
          weeklyMealPlan={weeklyMealPlan}
          onBack={() => setCurrentView("patients")}
          onEditPlan={async () => {
            if (selectedDietPlan) {
              await loadWeeklyMealPlan(selectedDietPlan.id)
            }
            setCurrentView("edit-plan")
          }}
          theme={theme}
          setTheme={setTheme}
        />
      )
    
    case "new-patient":
      return (
        <NewPatientFlow
          onBack={() => setCurrentView("patients")}
          onComplete={async () => {
            await loadPatients()
            setCurrentView("patients")
          }}
          theme={theme}
          setTheme={setTheme}
        />
      )
    
    case "edit-plan":
      return (
        <DietPlanEditor
          patient={selectedPatient}
          dietPlan={selectedDietPlan}
          weeklyMealPlan={weeklyMealPlan}
          setWeeklyMealPlan={setWeeklyMealPlan}
          onBack={async () => {
            if (selectedDietPlan) {
              await loadWeeklyMealPlan(selectedDietPlan.id)
            }
            setCurrentView("patient-detail")
          }}
          onSave={async () => {
            if (selectedDietPlan) {
              await loadWeeklyMealPlan(selectedDietPlan.id)
            }
            setCurrentView("patient-detail")
          }}
          theme={theme}
          setTheme={setTheme}
        />
      )
    
    default:
      return <div>View not found</div>
  }
}
