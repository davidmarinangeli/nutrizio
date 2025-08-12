"use client"

import { useState } from "react"
import { Button } from "../../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Badge } from "../../../../components/ui/badge"
import { Switch } from "../../../../components/ui/switch"
import { Label } from "../../../../components/ui/label"
import { ChevronLeft, Moon, Sun, Loader2, Check } from "lucide-react"
import UnifiedDietPlanEditor from "../../shared/unified-diet-plan-editor"
import { Checkbox } from "../../../../components/ui/checkbox"

interface Step4PreviewFixedProps {
  generatedWeeklyPlan: any
  patientData: any
  saveAsTemplate: boolean
  setSaveAsTemplate: (value: boolean) => void
  onComplete: (finalWeeklyPlan?: any) => void
  onBack: () => void
  isLoading?: boolean
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
  isLoading = false,
  theme,
  setTheme
}: Step4PreviewFixedProps) {
  const [weeklyMealPlan, setWeeklyMealPlan] = useState(generatedWeeklyPlan)

  // Patient summary content to display at the top
  const patientSummaryContent = (
    <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-lg">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Riepilogo Paziente</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-gray-600 dark:text-gray-400">Nome</p>
          <p className="font-semibold text-gray-800 dark:text-white">
            {patientData.name} {patientData.surname}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-gray-600 dark:text-gray-400">Età / Sesso</p>
          <p className="font-semibold text-gray-800 dark:text-white">
            {patientData.age} anni / {patientData.sex === 'M' ? 'Maschio' : 'Femmina'}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-gray-600 dark:text-gray-400">Obiettivo</p>
          <p className="font-semibold text-gray-800 dark:text-white">
            {patientData.mainGoal === 'weight-loss' ? 'Perdita di peso' :
             patientData.mainGoal === 'muscle-gain' ? 'Aumento massa muscolare' :
             patientData.mainGoal === 'maintenance' ? 'Mantenimento' :
             'Salute generale'}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-gray-600 dark:text-gray-400">Target Calorico</p>
          <p className="font-semibold text-gray-800 dark:text-white">
            {patientData.targetCalories} kcal/giorno
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-gray-600 dark:text-gray-400">Restrizioni</p>
          <p className="font-semibold text-gray-800 dark:text-white">
            {patientData.restrictions && patientData.restrictions.length > 0 
              ? patientData.restrictions.join(', ') 
              : 'Nessuna'}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-gray-600 dark:text-gray-400">Allergie</p>
          <p className="font-semibold text-gray-800 dark:text-white">
            {patientData.allergies && patientData.allergies.length > 0 
              ? patientData.allergies.join(', ') 
              : 'Nessuna'}
          </p>
        </div>
      </div>
      
      {/* Save as Template Option */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="save-template"
            checked={saveAsTemplate}
            onCheckedChange={setSaveAsTemplate}
            className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
          />
          <Label
            htmlFor="save-template"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
          >
            Salva come template per futuri pazienti simili
          </Label>
        </div>
      </div>
    </div>
  )

  return (
    <UnifiedDietPlanEditor
      weeklyMealPlan={weeklyMealPlan}
      setWeeklyMealPlan={setWeeklyMealPlan}
      patientData={patientData}
      title={`Piano Alimentare per ${patientData.name} ${patientData.surname}`}
      onBack={onBack}
      onComplete={onComplete}
      theme={theme}
      setTheme={setTheme}
      additionalContent={patientSummaryContent}
      isLoading={isLoading}
      mode="create"
    />
  )
}