import { useState } from "react"
import type { Meal, MealItem, ViewType, WeekDay } from "../types/patient-types"
import { mockWeeklyPlan, weekDays } from "../../data"

export function usePatientState() {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard")
  const [meals, setMeals] = useState<Meal[]>(mockWeeklyPlan["Mercoledì"])
  const [weeklyPlan] = useState(mockWeeklyPlan)
  const [selectedDay, setSelectedDay] = useState<WeekDay>(weekDays.find((d) => d.isToday) || weekDays[0])

  const handleDayClick = (day: WeekDay) => {
    setSelectedDay(day)
    setMeals(weeklyPlan[day.key as keyof typeof weeklyPlan] || [])
  }

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view)
  }

  return {
    currentView,
    meals,
    setMeals,
    weeklyPlan,
    selectedDay,
    handleDayClick,
    handleViewChange,
  }
}
