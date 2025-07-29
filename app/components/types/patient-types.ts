export interface MealItem {
  id: string
  name: string
  quantity: string
  calories: number
  alternatives?: { name: string; quantity: string; calories: number }[]
  completed?: boolean
  rating?: number
  tags?: string[]
}

export interface Meal {
  id: string
  name: string
  time: string
  items: MealItem[]
  totalCalories: number
  completed: boolean
}

export interface WeekDay {
  day: string
  date: string
  isToday: boolean
  key: string
}

export type ViewType = "dashboard" | "compliance" | "weekly"
