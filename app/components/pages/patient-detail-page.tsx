"use client"

import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { ChevronLeft, Moon, Sun, Edit, Plus } from "lucide-react"
import { type Patient, type DietPlan, type WeeklyMealPlan } from "../../../lib/supabase"

interface PatientDetailPageProps {
  patient: Patient | null
  dietPlans: DietPlan[]
  selectedDietPlan: DietPlan | null
  weeklyMealPlan: WeeklyMealPlan
  onBack: () => void
  onEditPlan: () => void
  theme: string | undefined
  setTheme: (theme: string) => void
}

export default function PatientDetailPage({
  patient,
  dietPlans,
  selectedDietPlan,
  weeklyMealPlan,
  onBack,
  onEditPlan,
  theme,
  setTheme
}: PatientDetailPageProps) {
  const dayNamesFull = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"]

  // Debugging: log the weeklyMealPlan data
  console.log('PatientDetailPage - weeklyMealPlan:', weeklyMealPlan)
  console.log('PatientDetailPage - weeklyMealPlan keys:', weeklyMealPlan ? Object.keys(weeklyMealPlan) : 'null/undefined')
  console.log('PatientDetailPage - selectedDietPlan:', selectedDietPlan)

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
          <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-full">
            Inattivo
          </Badge>
        )
      case "new":
        return (
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full">
            Nuovo
          </Badge>
        )
      default:
        return null
    }
  }

  if (!patient) {
    return <div>Paziente non trovato</div>
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-7xl mx-auto p-4 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
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
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>

        <Card className="w-full bg-white dark:bg-gray-800 rounded-3xl border-0 shadow-lg mb-6">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  {patient.name} {patient.surname}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{patient.email}</p>
                {getStatusBadge(patient.status)}
              </div>
              <div className="space-y-3">
                <p>
                  <span className="text-sm text-gray-500">Età:</span>{" "}
                  <span className="font-semibold">{patient.age} anni</span>
                </p>
                <p>
                  <span className="text-sm text-gray-500">Altezza/Peso:</span>{" "}
                  <span className="font-semibold">
                    {patient.height}cm / {patient.weight}kg
                  </span>
                </p>
              </div>
              <div className="space-y-3">
                <p>
                  <span className="text-sm text-gray-500">Compliance:</span>{" "}
                  <span className="text-2xl font-bold text-emerald-600">{patient.compliance}%</span>
                </p>
                <p>
                  <span className="text-sm text-gray-500">Ultimo accesso:</span>{" "}
                  <span className="font-semibold">{patient.last_access}</span>
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
              <Button onClick={onEditPlan} variant="outline" className="rounded-full">
                <Edit className="h-4 w-4 mr-2" /> Modifica Piano
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {weeklyMealPlan && Object.keys(weeklyMealPlan).length > 0 ? (
              <div className="space-y-6">
                {/* Row 1: Monday and Tuesday */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {dayNamesFull.slice(1, 3).map((dayName, arrayIndex) => {
                    const dayIndex = arrayIndex + 1  // Adjust for Monday=1, Tuesday=2
                    const dayMeals = weeklyMealPlan[dayName] || []
                    const isToday = dayIndex === new Date().getDay()
                    const totalDayCalories = dayMeals.reduce((sum, meal) => sum + (meal.total_calories || 0), 0)
                  
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
                                    {meal.total_calories || 0} kcal
                                  </span>
                                </div>
                                <div className="space-y-1">
                                  {(meal.food_items || []).slice(0, 3).map((food) => (
                                    <p key={food.id} className="text-xs text-gray-600 dark:text-gray-400">
                                      • {food.name} - {food.quantity}{food.unit}
                                    </p>
                                  ))}
                                  {(meal.food_items || []).length > 3 && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                                      +{(meal.food_items || []).length - 3} altri alimenti
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
                
                {/* Row 2: Wednesday and Thursday */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {dayNamesFull.slice(3, 5).map((dayName, arrayIndex) => {
                    const dayIndex = arrayIndex + 3  // Adjust for Wednesday=3, Thursday=4
                    const dayMeals = weeklyMealPlan[dayName] || []
                    const isToday = dayIndex === new Date().getDay()
                    const totalDayCalories = dayMeals.reduce((sum, meal) => sum + (meal.total_calories || 0), 0)
                  
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
                                    {meal.total_calories || 0} kcal
                                  </span>
                                </div>
                                <div className="space-y-1">
                                  {(meal.food_items || []).slice(0, 3).map((food) => (
                                    <p key={food.id} className="text-xs text-gray-600 dark:text-gray-400">
                                      • {food.name} - {food.quantity}{food.unit}
                                    </p>
                                  ))}
                                  {(meal.food_items || []).length > 3 && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                                      +{(meal.food_items || []).length - 3} altri alimenti
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
                
                {/* Row 3: Friday and Saturday */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {dayNamesFull.slice(5, 7).map((dayName, arrayIndex) => {
                    const dayIndex = arrayIndex + 5  // Adjust for Friday=5, Saturday=6
                    const dayMeals = weeklyMealPlan[dayName] || []
                    const isToday = dayIndex === new Date().getDay()
                    const totalDayCalories = dayMeals.reduce((sum, meal) => sum + (meal.total_calories || 0), 0)
                  
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
                                    {meal.total_calories || 0} kcal
                                  </span>
                                </div>
                                <div className="space-y-1">
                                  {(meal.food_items || []).slice(0, 3).map((food) => (
                                    <p key={food.id} className="text-xs text-gray-600 dark:text-gray-400">
                                      • {food.name} - {food.quantity}{food.unit}
                                    </p>
                                  ))}
                                  {(meal.food_items || []).length > 3 && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                                      +{(meal.food_items || []).length - 3} altri alimenti
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
                
                {/* Row 4: Sunday (half width, centered) */}
                <div className="flex justify-center">
                  <div className="w-full md:w-1/2">
                    {(() => {
                      const dayName = dayNamesFull[0] // Sunday
                      const dayIndex = 0
                      const dayMeals = weeklyMealPlan[dayName] || []
                      const isToday = dayIndex === new Date().getDay()
                      const totalDayCalories = dayMeals.reduce((sum, meal) => sum + (meal.total_calories || 0), 0)
                    
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
                                      {meal.total_calories || 0} kcal
                                    </span>
                                  </div>
                                  <div className="space-y-1">
                                    {(meal.food_items || []).slice(0, 3).map((food) => (
                                      <p key={food.id} className="text-xs text-gray-600 dark:text-gray-400">
                                        • {food.name} - {food.quantity}{food.unit}
                                      </p>
                                    ))}
                                    {(meal.food_items || []).length > 3 && (
                                      <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                                        +{(meal.food_items || []).length - 3} altri alimenti
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
                    })()}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {!weeklyMealPlan ? 
                    "Dati del piano alimentare non disponibili." : 
                    "Nessun piano alimentare disponibile."
                  }
                </p>
                <Button onClick={onEditPlan} className="bg-emerald-500 hover:bg-emerald-600">
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
}
