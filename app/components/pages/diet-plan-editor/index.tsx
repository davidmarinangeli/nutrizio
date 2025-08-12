"use client"

import { type Patient, type DietPlan, type WeeklyMealPlan } from "../../../../lib/supabase"
import UnifiedDietPlanEditor from "../../shared/unified-diet-plan-editor"

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
  if (!patient) {
    return <div>Paziente non trovato</div>
  }

  return (
    <UnifiedDietPlanEditor
      weeklyMealPlan={weeklyMealPlan}
      setWeeklyMealPlan={setWeeklyMealPlan}
      patientData={patient}
      title={`Modifica Piano Alimentare - ${patient.name} ${patient.surname}`}
      onBack={onBack}
      onSave={onSave}
      theme={theme}
      setTheme={setTheme}
      mode="edit"
    />
  )
}
