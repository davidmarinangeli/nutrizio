"use client"

import type React from "react"

import DashboardView from "./patient/dashboard-view"
import ComplianceView from "./patient/compliance-view"
import WeeklyView from "./patient/weekly-view"
import { usePatientState } from "./hooks/use-patient-state"

export default function PatientAppComponent() {
  const {
    currentView,
    meals,
    setMeals,
    weeklyPlan,
    handleViewChange,
  } = usePatientState()

  if (currentView === "weekly") {
    return <WeeklyView weeklyPlan={weeklyPlan} onViewChange={handleViewChange} />
  }

  if (currentView === "compliance") {
    return <ComplianceView onViewChange={handleViewChange} />
  }

  return (
    <DashboardView
      meals={meals}
      setMeals={setMeals}
      onViewChange={handleViewChange}
    />
  )
}
