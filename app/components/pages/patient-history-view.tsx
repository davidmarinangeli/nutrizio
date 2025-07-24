"use client"

import type React from "react"
import { useState } from "react"
import {
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Info,
  Activity,
  User,
  TrendingUp,
  Star,
  CheckCircle,
  XCircle,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Patient {
  id: string
  name: string
  email: string
}

interface PatientHistoryViewProps {
  patient: Patient
  onBack: () => void
}

interface DiaryEntry {
  id: string
  date: string
  meal_name: string
  food_item: string
  prescribed_food: {
    name: string
    quantity: string
    calories: number
  }
  actual_food: {
    name: string
    quantity: string
    calories: number
    was_substituted: boolean
  }
  rating: number
  tags: string[]
  notes?: string
}

// Mock data for demonstration
const mockDiaryData: { [key: string]: DiaryEntry[] } = {
  "2025-07-14": [
    {
      id: "1",
      date: "2025-07-14",
      meal_name: "Colazione",
      food_item: "Uova strapazzate",
      prescribed_food: { name: "Uova strapazzate", quantity: "3 uova", calories: 210 },
      actual_food: { name: "Uova strapazzate", quantity: "3 uova", calories: 210, was_substituted: false },
      rating: 4,
      tags: ["Delizioso", "Perfetto"],
      notes: "Molto buone!"
    },
    {
      id: "2",
      date: "2025-07-14",
      meal_name: "Colazione",
      food_item: "Avocado",
      prescribed_food: { name: "Avocado", quantity: "1/2 avocado", calories: 160 },
      actual_food: { name: "Yogurt greco", quantity: "200g", calories: 200, was_substituted: true },
      rating: 3,
      tags: ["Troppo dolce"],
      notes: "Non avevo avocado disponibile"
    }
  ],
  "2025-07-15": [
    {
      id: "3",
      date: "2025-07-15",
      meal_name: "Pranzo",
      food_item: "Petto di pollo",
      prescribed_food: { name: "Petto di pollo", quantity: "150g", calories: 250 },
      actual_food: { name: "Petto di pollo", quantity: "150g", calories: 250, was_substituted: false },
      rating: 5,
      tags: ["Delizioso", "Ben cotto"],
    }
  ]
}

export default function PatientHistoryView({ patient, onBack }: PatientHistoryViewProps) {
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 6, 17)) // July 17, 2025
  const [selectedWeekStart, setSelectedWeekStart] = useState(new Date(2025, 6, 14)) // July 14, 2025

  // Helper functions
  const getWeekStart = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    return new Date(d.setDate(diff))
  }

  const formatWeekRange = (weekStart: Date) => {
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    return `${weekStart.getDate()} - ${weekEnd.getDate()} Luglio 2025`
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('it-IT', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    })
  }

  const calculateDayCompliance = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0]
    const entries = mockDiaryData[dateKey] || []
    if (entries.length === 0) return 0
    
    const completedEntries = entries.filter(entry => !entry.actual_food.was_substituted)
    return Math.round((completedEntries.length / entries.length) * 100)
  }

  const countDayFeedbacks = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0]
    const entries = mockDiaryData[dateKey] || []
    return entries.filter(entry => entry.rating > 0 || entry.tags.length > 0).length
  }

  const getEngagementColor = (feedbackCount: number) => {
    if (feedbackCount === 0) return "bg-gray-100 dark:bg-gray-800 text-gray-400"
    if (feedbackCount === 1) return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700"
    if (feedbackCount === 2) return "bg-emerald-200 dark:bg-emerald-900/50 text-emerald-800"
    if (feedbackCount === 3) return "bg-emerald-300 dark:bg-emerald-800/70 text-emerald-900"
    if (feedbackCount === 4) return "bg-emerald-400 dark:bg-emerald-700 text-white"
    return "bg-emerald-500 dark:bg-emerald-600 text-white"
  }

  const hasDietPlanChange = (date: Date) => {
    return date.toDateString() === new Date(2025, 6, 17).toDateString()
  }

  const getDaysInMonth = () => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    
    const days = []
    
    // Add days from previous month to fill the grid
    const startDay = firstDay.getDay()
    const daysFromPrevMonth = startDay === 0 ? 6 : startDay - 1
    
    for (let i = daysFromPrevMonth; i > 0; i--) {
      const day = new Date(year, month, 1 - i)
      days.push(day)
    }
    
    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    
    // Add days from next month to fill the grid
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i))
    }
    
    return days
  }

  const getWeekDays = (weekStart: Date) => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart)
      day.setDate(weekStart.getDate() + i)
      days.push(day)
    }
    return days
  }

  const isInCurrentMonth = (date: Date) => {
    return date.getMonth() === selectedDate.getMonth() && date.getFullYear() === selectedDate.getFullYear()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Storico Paziente - {patient.name}
          </h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* View Mode Toggles */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'month' ? 'default' : 'outline'}
            onClick={() => setViewMode('month')}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Mese
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'outline'}
            onClick={() => setViewMode('week')}
            className="flex items-center gap-2"
          >
            <CalendarDays className="h-4 w-4" />
            Settimana
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {viewMode === 'month' && (
          <MonthHeatmap
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onDayClick={(date: Date) => {
              setSelectedWeekStart(getWeekStart(date))
              setViewMode('week')
            }}
            getDaysInMonth={getDaysInMonth}
            isInCurrentMonth={isInCurrentMonth}
            countDayFeedbacks={countDayFeedbacks}
            getEngagementColor={getEngagementColor}
            hasDietPlanChange={hasDietPlanChange}
          />
        )}

        {viewMode === 'week' && (
          <WeekComparisonView
            weekStart={selectedWeekStart}
            onWeekChange={setSelectedWeekStart}
            patient={patient}
            formatWeekRange={formatWeekRange}
            getWeekDays={getWeekDays}
          />
        )}
      </div>
    </div>
  )
}

// Month Heatmap Component
function MonthHeatmap({ 
  selectedDate, 
  onDateChange, 
  onDayClick, 
  getDaysInMonth, 
  isInCurrentMonth, 
  countDayFeedbacks, 
  getEngagementColor, 
  hasDietPlanChange 
}: any) {
  const days = getDaysInMonth()

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    newDate.setMonth(selectedDate.getMonth() + (direction === 'next' ? 1 : -1))
    onDateChange(newDate)
  }

  return (
    <Card className="p-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth('prev')}
            className="rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-500" />
            {selectedDate.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
          </CardTitle>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth('next')}
            className="rounded-full"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day: Date, index: number) => {
            const feedbackCount = countDayFeedbacks(day)
            const hasSubstitutions = feedbackCount > 0 // Simplified for demo
            const hasPlanChange = hasDietPlanChange(day)
            
            return (
              <div
                key={index}
                onClick={() => onDayClick(day)}
                className={`
                  relative p-3 rounded-lg cursor-pointer transition-all min-h-[60px]
                  ${getEngagementColor(feedbackCount)}
                  hover:ring-2 hover:ring-emerald-400
                  ${!isInCurrentMonth(day) ? 'opacity-30' : ''}
                `}
              >
                <div className="text-sm font-medium">{day.getDate()}</div>
                
                {/* Feedback count indicator */}
                {feedbackCount > 0 && (
                  <div className="absolute bottom-1 right-1 text-xs font-bold">
                    {feedbackCount}
                  </div>
                )}
                
                {/* Special indicators */}
                <div className="absolute top-1 right-1 flex gap-1">
                  {hasSubstitutions && (
                    <div 
                      className="w-2 h-2 bg-orange-400 rounded-full" 
                      title="Sostituzioni effettuate"
                    />
                  )}
                  {hasPlanChange && (
                    <div 
                      className="w-2 h-2 bg-blue-500 rounded-full" 
                      title="Piano modificato"
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Legend */}
        <div className="mt-6 space-y-3">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Legenda Attività
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600" />
              <span>Nessun feedback</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-100 dark:bg-emerald-900/30 rounded" />
              <span>1 feedback</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-200 dark:bg-emerald-900/50 rounded" />
              <span>2 feedback</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-300 dark:bg-emerald-800/70 rounded" />
              <span>3 feedback</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-400 dark:bg-emerald-700 rounded" />
              <span>4 feedback</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-500 dark:bg-emerald-600 rounded" />
              <span>5+ feedback</span>
            </div>
          </div>
          
          <div className="flex gap-4 text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full" />
              <span>Sostituzioni</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>Cambio piano</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Week Comparison View
function WeekComparisonView({ weekStart, onWeekChange, patient, formatWeekRange, getWeekDays }: any) {
  const weekDays = getWeekDays(weekStart)

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(weekStart)
    newWeek.setDate(weekStart.getDate() + (direction === 'next' ? 7 : -7))
    onWeekChange(newWeek)
  }

  const getWeekStats = () => {
    let totalFeedbacks = 0
    let totalSubstitutions = 0
    let totalRatings = 0
    let ratingCount = 0

    weekDays.forEach((day: Date) => {
      const dateKey = day.toISOString().split('T')[0]
      const entries = mockDiaryData[dateKey] || []
      totalFeedbacks += entries.length
      totalSubstitutions += entries.filter(e => e.actual_food.was_substituted).length
      
      entries.forEach(entry => {
        if (entry.rating > 0) {
          totalRatings += entry.rating
          ratingCount++
        }
      })
    })

    return {
      feedbacks: totalFeedbacks,
      substitutions: totalSubstitutions,
      averageRating: ratingCount > 0 ? (totalRatings / ratingCount).toFixed(1) : "N/A"
    }
  }

  const stats = getWeekStats()

  return (
    <div className="space-y-6">
      {/* Week Navigation */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateWeek('prev')}
            className="rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-center">
            <h2 className="text-lg font-bold">{formatWeekRange(weekStart)}</h2>
            <div className="flex gap-4 mt-2 text-sm">
              <Badge className="bg-emerald-100 text-emerald-700">
                {stats.feedbacks} Feedback
              </Badge>
              <Badge className="bg-orange-100 text-orange-700">
                {stats.substitutions} Sostituzioni
              </Badge>
              <Badge className="bg-blue-100 text-blue-700">
                ⭐ {stats.averageRating}
              </Badge>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateWeek('next')}
            className="rounded-full"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Daily Cards */}
      <div className="space-y-4">
        {weekDays.map((day: Date) => (
          <DayDetailCard key={day.toISOString()} day={day} />
        ))}
      </div>
    </div>
  )
}

// Day Detail Card
function DayDetailCard({ day }: { day: Date }) {
  const dateKey = day.toISOString().split('T')[0]
  const entries = mockDiaryData[dateKey] || []

  const formatDayDate = (date: Date) => {
    return date.toLocaleDateString('it-IT', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    })
  }

  if (entries.length === 0) {
    return (
      <Card className="p-4 opacity-50">
        <div className="text-center text-gray-500">
          <h3 className="font-semibold mb-2">{formatDayDate(day)}</h3>
          <p className="text-sm">Nessun dato disponibile</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span>{formatDayDate(day)}</span>
          <Badge className="bg-emerald-100 text-emerald-700">
            {entries.length} elementi
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {entries.map((entry) => (
          <div 
            key={entry.id}
            className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{entry.meal_name}</span>
                {entry.actual_food.was_substituted ? (
                  <XCircle className="h-4 w-4 text-orange-500" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                )}
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <div className="mb-1">
                  <span className="font-medium">Prescritto:</span> {entry.prescribed_food.name} ({entry.prescribed_food.quantity})
                </div>
                <div className="mb-1">
                  <span className="font-medium">Consumato:</span> {entry.actual_food.name} ({entry.actual_food.quantity})
                  {entry.actual_food.was_substituted && (
                    <Badge className="ml-2 bg-orange-100 text-orange-700 text-xs">Sostituito</Badge>
                  )}
                </div>
                
                {entry.rating > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(entry.rating)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                )}
                
                {entry.tags.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {entry.tags.map((tag, index) => (
                      <Badge key={index} className="bg-blue-100 text-blue-700 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {entry.notes && (
                  <div className="text-xs italic mt-1 text-gray-500">
                    "{entry.notes}"
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
