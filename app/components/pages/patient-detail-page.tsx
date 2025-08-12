"use client"

import { useState } from "react"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { ChevronLeft, Moon, Sun, Edit, Plus, History, Calendar, Award, Check, Star } from "lucide-react"
import { type Patient, type DietPlan, type WeeklyMealPlan } from "../../../lib/supabase"
import PatientHistoryView from "./patient-history-view"

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
  const [showHistoryView, setShowHistoryView] = useState(false)
  const dayNamesFull = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"]

  // If showing history view, render that component
  if (showHistoryView && patient) {
    return (
      <PatientHistoryView 
        patient={patient} 
        onBack={() => setShowHistoryView(false)} 
      />
    )
  }

  // Debugging: log the weeklyMealPlan data
  console.log('PatientDetailPage - weeklyMealPlan:', weeklyMealPlan)
  console.log('PatientDetailPage - weeklyMealPlan keys:', weeklyMealPlan ? Object.keys(weeklyMealPlan) : 'null/undefined')
  console.log('PatientDetailPage - selectedDietPlan:', selectedDietPlan)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-primary-100 text-primary-700 rounded-full">
            Attivo
          </Badge>
        )
      case "inactive":
        return (
          <Badge className="bg-muted text-muted-foreground rounded-full">
            Inattivo
          </Badge>
        )
      case "new":
        return (
          <Badge className="bg-accent-100 text-accent-700 rounded-full">
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
    <div className="min-h-screen w-full bg-background animate-fade-in-up">
      <div className="w-full max-w-7xl mx-auto p-4 lg:p-8">
        <div className="flex items-center justify-between mb-6 animate-fade-in-down">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-brand-primary transition-all duration-300 hover:scale-110 hover:-translate-x-1"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-scale-in">
            Dettaglio Paziente
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowHistoryView(true)}
              className="rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-brand-secondary transition-all duration-300 hover:scale-110 animate-fade-in-right"
              title="Visualizza storico paziente"
              style={{animationDelay: '0.1s'}}
            >
              <History className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full bg-muted hover:bg-muted/80 transition-all duration-300 hover:scale-110 hover:rotate-180 animate-fade-in-right"
              style={{animationDelay: '0.2s'}}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Patient Info Card */}
        <Card className="w-full bg-card rounded-3xl border-0 shadow-lg mb-6 animate-fade-in-up">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {patient.name} {patient.surname}
                </h2>
                <p className="text-muted-foreground mb-4">{patient.email}</p>
                <div className="flex items-center gap-4 mb-4">
                  {getStatusBadge(patient.status)}
                </div>
                <div className="space-y-3">
                  <p>
                    <span className="text-sm text-muted-foreground">Età:</span>{" "}
                    <span className="font-semibold">{patient.age} anni</span>
                  </p>
                  <p>
                    <span className="text-sm text-muted-foreground">Altezza/Peso:</span>{" "}
                    <span className="font-semibold">
                      {patient.height}cm / {patient.weight}kg
                    </span>
                  </p>
                  <p>
                    <span className="text-sm text-muted-foreground">Ultimo accesso:</span>{" "}
                    <span className="font-semibold">{patient.last_access}</span>
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center">
                  <Award className="h-5 w-5 mr-2 text-primary" />
                  Compliance del Paziente
                </h3>
                <div className="space-y-4">
                  {/* Main Score */}
                  <Card className="bg-brand-gradient text-primary-foreground rounded-2xl border-0 shadow-brand-primary">
                    <CardContent className="p-6 text-center">
                      <Award className="h-12 w-12 mx-auto mb-3 text-primary-foreground/80" />
                      <div className="text-4xl font-bold mb-1">{patient.compliance}</div>
                      <div className="text-primary-foreground/80 text-sm">Punteggio Compliance</div>
                    </CardContent>
                  </Card>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-muted rounded-xl p-3 text-center">
                      <Check className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <div className="text-lg font-bold text-foreground">18</div>
                      <div className="text-xs text-muted-foreground">Pasti completati</div>
                    </div>
                    <div className="bg-muted rounded-xl p-3 text-center">
                      <Star className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <div className="text-lg font-bold text-foreground">4.3</div>
                      <div className="text-xs text-muted-foreground">Rating medio</div>
                    </div>
                    <div className="bg-muted rounded-xl p-3 text-center">
                      <Award className="h-6 w-6 mx-auto mb-2 text-primary-400" />
                      <div className="text-lg font-bold text-foreground">3</div>
                      <div className="text-xs text-muted-foreground">Target raggiunti</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Plan View */}
        <Card className="w-full bg-card rounded-3xl border-0 shadow-lg animate-fade-in-up">
          <CardHeader className="animate-fade-in-down pb-8">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-foreground">
                Piano Settimanale Completo
              </CardTitle>
              <Button onClick={onEditPlan} variant="outline" className="rounded-full transition-all duration-300 hover:scale-105 hover:bg-primary/10 hover:border-primary hover:text-primary">
                <Edit className="h-4 w-4 mr-2" /> Modifica Piano
              </Button>
            </div>
          </CardHeader>
          {/* Patient Summary Information */}
            <div className="mr-6 ml-6 p-4 bg-muted rounded-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Target Calories */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Target Calorico</p>
                    <p className="font-semibold text-foreground">{patient.target_calories} kcal/giorno</p>
                  </div>
                </div>
                
                {/* Main Goal */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                    <Award className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Obiettivo</p>
                    <p className="font-semibold text-foreground">
                      {patient.main_goal === 'weight-loss' ? 'Perdita di peso' :
                       patient.main_goal === 'muscle-gain' ? 'Aumento massa muscolare' :
                       patient.main_goal === 'maintenance' ? 'Mantenimento' :
                       patient.main_goal}
                    </p>
                  </div>
                </div>
                
                {/* Allergies */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                    <Badge className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Allergie</p>
                    <p className="font-semibold text-foreground">
                      {patient.allergies && patient.allergies.length > 0 ? 
                        patient.allergies.join(', ') : 
                        'Nessuna'
                      }
                    </p>
                  </div>
                </div>
                
                {/* Dietary Restrictions */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                    <Star className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Restrizioni</p>
                    <p className="font-semibold text-foreground">
                      {patient.restrictions && patient.restrictions.length > 0 ? 
                        patient.restrictions.join(', ') : 
                        'Nessuna'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          <CardContent className="px-6 pb-6 pt-12">
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
                        className={`${
                          isToday 
                            ? 'ring-2 ring-primary bg-primary/10 dark:bg-primary/20 animate-pulse-glow' 
                            : 'bg-muted'
                        }`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className={`text-lg font-bold ${
                              isToday 
                                ? 'text-primary dark:text-primary' 
                                : 'text-foreground'
                            }`}>
                              {dayName}
                              {isToday && <span className="ml-2 text-sm font-normal">(Oggi)</span>}
                            </CardTitle>
                            <Badge className={`${
                              isToday 
                                ? 'bg-primary/20 text-primary dark:bg-primary/30 dark:text-primary' 
                                : 'bg-muted-foreground/20 text-muted-foreground'
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
                        className={`${
                          isToday 
                            ? 'ring-2 ring-primary bg-primary/10 dark:bg-primary/20 animate-pulse-glow' 
                            : 'bg-muted'
                        }`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className={`text-lg font-bold ${
                              isToday 
                                ? 'text-primary dark:text-primary' 
                                : 'text-foreground'
                            }`}>
                              {dayName}
                              {isToday && <span className="ml-2 text-sm font-normal">(Oggi)</span>}
                            </CardTitle>
                            <Badge className={`${
                              isToday 
                                ? 'bg-primary/20 text-primary dark:bg-primary/30 dark:text-primary' 
                                : 'bg-muted-foreground/20 text-muted-foreground'
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
                        className={`${
                          isToday 
                            ? 'ring-2 ring-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 animate-pulse-glow' 
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
                          className={`${
                            isToday 
                              ? 'ring-2 ring-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 animate-pulse-glow' 
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
                <Button onClick={onEditPlan} className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-brand-accent transition-all duration-300 hover:scale-105">
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
