import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Enhanced types for our database
export interface Patient {
  id: string
  name: string
  surname: string
  email: string
  age: number
  height: number
  weight: number
  target_calories: number
  main_goal: string
  restrictions: string[]
  allergies: string[]
  notes: string
  compliance: number
  last_access: string
  status: "active" | "inactive" | "new"
  created_at: string
  updated_at: string
}

export interface DietPlan {
  id: string
  patient_id: string
  name: string
  description?: string
  start_date: string
  end_date?: string
  is_active: boolean
  total_calories?: number
  created_by: string
  created_at: string
  updated_at: string
}

export interface FoodItem {
  id: number
  name: string
  quantity: string
  unit: string
  calories: number
  alternatives: FoodAlternative[]
}

export interface FoodAlternative {
  name: string
  quantity: string
  unit: string
  calories: number
}

export interface DietPlanMeal {
  id: string
  diet_plan_id: string
  day_of_week: number // 0=Sunday, 1=Monday, etc.
  meal_type: string
  meal_name: string
  meal_time?: string
  food_items: FoodItem[]
  total_calories: number
  notes?: string
  order_index: number
  created_at: string
  updated_at: string
}

export interface WeeklyMealPlan {
  [dayName: string]: DietPlanMeal[]
}

// Enhanced database operations
export const patientService = {
  async getAll(): Promise<Patient[]> {
    try {
      const { data, error } = await supabase.from("patients").select("*").order("created_at", { ascending: false })

      if (error) {
        console.warn("Database not ready, using mock data:", error.message)
        return getMockPatients()
      }
      return data || []
    } catch (error) {
      console.warn("Database error, using mock data:", error)
      return getMockPatients()
    }
  },

  async getById(id: string): Promise<Patient | null> {
    try {
      const { data, error } = await supabase.from("patients").select("*").eq("id", id).single()

      if (error) {
        console.warn("Database not ready, using mock data:", error.message)
        const mockPatients = getMockPatients()
        return mockPatients.find((p) => p.id === id) || null
      }
      return data
    } catch (error) {
      console.warn("Database error, using mock data:", error)
      const mockPatients = getMockPatients()
      return mockPatients.find((p) => p.id === id) || null
    }
  },

  async create(patient: Omit<Patient, "id" | "created_at" | "updated_at">): Promise<Patient> {
    try {
      const { data, error } = await supabase.from("patients").insert([patient]).select().single()

      if (error) {
        console.warn("Database not ready, simulating creation:", error.message)
        const newPatient: Patient = {
          ...patient,
          id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        return newPatient
      }
      return data
    } catch (error) {
      console.warn("Database error, simulating creation:", error)
      const newPatient: Patient = {
        ...patient,
        id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      return newPatient
    }
  },

  async update(id: string, updates: Partial<Patient>): Promise<Patient> {
    try {
      const { data, error } = await supabase
        .from("patients")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.warn("Database not ready, simulating update:", error.message)
        const mockPatients = getMockPatients()
        const existing = mockPatients.find((p) => p.id === id)
        if (existing) {
          return { ...existing, ...updates, updated_at: new Date().toISOString() }
        }
        throw new Error("Patient not found")
      }
      return data
    } catch (error) {
      console.warn("Database error, simulating update:", error)
      const mockPatients = getMockPatients()
      const existing = mockPatients.find((p) => p.id === id)
      if (existing) {
        return { ...existing, ...updates, updated_at: new Date().toISOString() }
      }
      throw new Error("Patient not found")
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("patients").delete().eq("id", id)

      if (error) {
        console.warn("Database not ready, simulating deletion:", error.message)
        return
      }
    } catch (error) {
      console.warn("Database error, simulating deletion:", error)
    }
  },
}

export const dietPlanService = {
  async getByPatientId(patientId: string): Promise<DietPlan[]> {
    try {
      const { data, error } = await supabase
        .from("diet_plans")
        .select("*")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false })

      if (error) {
        console.warn("Database not ready, using mock diet plans:", error.message)
        return getMockDietPlans(patientId)
      }
      return data || []
    } catch (error) {
      console.warn("Database error, using mock diet plans:", error)
      return getMockDietPlans(patientId)
    }
  },

  async getActivePlanByPatientId(patientId: string): Promise<DietPlan | null> {
    try {
      const { data, error } = await supabase
        .from("diet_plans")
        .select("*")
        .eq("patient_id", patientId)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (error) {
        console.warn("Database not ready, using mock active plan:", error.message)
        const mockPlans = getMockDietPlans(patientId)
        return mockPlans.find((plan) => plan.is_active) || mockPlans[0] || null
      }
      return data
    } catch (error) {
      console.warn("Database error, using mock active plan:", error)
      const mockPlans = getMockDietPlans(patientId)
      return mockPlans.find((plan) => plan.is_active) || mockPlans[0] || null
    }
  },

  async create(dietPlan: Omit<DietPlan, "id" | "created_at" | "updated_at">): Promise<DietPlan> {
    try {
      const { data, error } = await supabase.from("diet_plans").insert([dietPlan]).select().single()

      if (error) {
        console.warn("Database not ready, simulating diet plan creation:", error.message)
        const newPlan: DietPlan = {
          ...dietPlan,
          id: `mock-plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        return newPlan
      }
      return data
    } catch (error) {
      console.warn("Database error, simulating diet plan creation:", error)
      const newPlan: DietPlan = {
        ...dietPlan,
        id: `mock-plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      return newPlan
    }
  },

  async update(id: string, updates: Partial<DietPlan>): Promise<DietPlan> {
    try {
      const { data, error } = await supabase
        .from("diet_plans")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.warn("Database not ready, simulating diet plan update:", error.message)
        const mockPlans = getMockDietPlans("")
        const existing = mockPlans.find((p) => p.id === id)
        if (existing) {
          return { ...existing, ...updates, updated_at: new Date().toISOString() }
        }
        throw new Error("Diet plan not found")
      }
      return data
    } catch (error) {
      console.warn("Database error, simulating diet plan update:", error)
      const mockPlans = getMockDietPlans("")
      const existing = mockPlans.find((p) => p.id === id)
      if (existing) {
        return { ...existing, ...updates, updated_at: new Date().toISOString() }
      }
      throw new Error("Diet plan not found")
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("diet_plans").delete().eq("id", id)

      if (error) {
        console.warn("Database not ready, simulating diet plan deletion:", error.message)
        return
      }
    } catch (error) {
      console.warn("Database error, simulating diet plan deletion:", error)
    }
  },
}

export const dietPlanMealService = {
  async getByDietPlanId(dietPlanId: string): Promise<DietPlanMeal[]> {
    try {
      const { data, error } = await supabase
        .from("diet_plan_meals")
        .select("*")
        .eq("diet_plan_id", dietPlanId)
        .order("day_of_week", { ascending: true })
        .order("order_index", { ascending: true })

      if (error) {
        console.warn("Database not ready, using mock meals:", error.message)
        return getMockDietPlanMeals(dietPlanId)
      }
      return data || []
    } catch (error) {
      console.warn("Database error, using mock meals:", error)
      return getMockDietPlanMeals(dietPlanId)
    }
  },

  async getWeeklyPlanByDietPlanId(dietPlanId: string): Promise<WeeklyMealPlan> {
    try {
      const meals = await this.getByDietPlanId(dietPlanId)
      return this.convertMealsToWeeklyPlan(meals)
    } catch (error) {
      console.warn("Error getting weekly plan:", error)
      return {}
    }
  },

  convertMealsToWeeklyPlan(meals: DietPlanMeal[]): WeeklyMealPlan {
    const dayNames = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"]
    const weeklyPlan: WeeklyMealPlan = {}

    // Initialize all days
    dayNames.forEach((day) => {
      weeklyPlan[day] = []
    })

    // Group meals by day
    meals.forEach((meal) => {
      const dayName = dayNames[meal.day_of_week]
      if (dayName) {
        weeklyPlan[dayName].push(meal)
      }
    })

    return weeklyPlan
  },

  async create(meal: Omit<DietPlanMeal, "id" | "created_at" | "updated_at">): Promise<DietPlanMeal> {
    try {
      const { data, error } = await supabase.from("diet_plan_meals").insert([meal]).select().single()

      if (error) {
        console.warn("Database not ready, simulating meal creation:", error.message)
        const newMeal: DietPlanMeal = {
          ...meal,
          id: `mock-meal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        return newMeal
      }
      return data
    } catch (error) {
      console.warn("Database error, simulating meal creation:", error)
      const newMeal: DietPlanMeal = {
        ...meal,
        id: `mock-meal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      return newMeal
    }
  },

  async update(id: string, updates: Partial<DietPlanMeal>): Promise<DietPlanMeal> {
    try {
      const { data, error } = await supabase
        .from("diet_plan_meals")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.warn("Database not ready, simulating meal update:", error.message)
        const mockMeals = getMockDietPlanMeals("")
        const existing = mockMeals.find((m) => m.id === id)
        if (existing) {
          return { ...existing, ...updates, updated_at: new Date().toISOString() }
        }
        throw new Error("Meal not found")
      }
      return data
    } catch (error) {
      console.warn("Database error, simulating meal update:", error)
      const mockMeals = getMockDietPlanMeals("")
      const existing = mockMeals.find((m) => m.id === id)
      if (existing) {
        return { ...existing, ...updates, updated_at: new Date().toISOString() }
      }
      throw new Error("Meal not found")
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("diet_plan_meals").delete().eq("id", id)

      if (error) {
        console.warn("Database not ready, simulating meal deletion:", error.message)
        return
      }
    } catch (error) {
      console.warn("Database error, simulating meal deletion:", error)
    }
  },
}

// Mock data functions with enhanced structure
function getMockPatients(): Patient[] {
  return [
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
      name: "Mario",
      surname: "Rossi",
      email: "mario.rossi@email.com",
      age: 35,
      height: 180,
      weight: 75.5,
      target_calories: 2200,
      main_goal: "weight-loss",
      restrictions: ["Vegetariano"],
      allergies: ["Noci"],
      notes: "Preferisce pasti leggeri a cena. Molto attivo nel weekend.",
      compliance: 92,
      last_access: "2 ore fa",
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440002",
      name: "Giulia",
      surname: "Bianchi",
      email: "giulia.bianchi@email.com",
      age: 28,
      height: 165,
      weight: 58.0,
      target_calories: 1800,
      main_goal: "muscle-gain",
      restrictions: ["Senza Glutine"],
      allergies: ["Latticini"],
      notes: "Atleta professionista, necessita di proteine extra post-allenamento.",
      compliance: 87,
      last_access: "1 giorno fa",
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440003",
      name: "Luca",
      surname: "Verdi",
      email: "luca.verdi@email.com",
      age: 42,
      height: 175,
      weight: 82.0,
      target_calories: 2000,
      main_goal: "weight-loss",
      restrictions: [],
      allergies: [],
      notes: "Controllo glicemico importante. Evitare zuccheri semplici.",
      compliance: 76,
      last_access: "3 giorni fa",
      status: "inactive",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440004",
      name: "Anna",
      surname: "Neri",
      email: "anna.neri@email.com",
      age: 31,
      height: 170,
      weight: 65.0,
      target_calories: 1900,
      main_goal: "maintenance",
      restrictions: ["Vegano"],
      allergies: ["Soia"],
      notes: "Molto attiva, pratica yoga quotidianamente. Preferisce cibi biologici.",
      compliance: 95,
      last_access: "1 ora fa",
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440005",
      name: "Francesco",
      surname: "Blu",
      email: "francesco.blu@email.com",
      age: 26,
      height: 185,
      weight: 70.0,
      target_calories: 2400,
      main_goal: "weight-gain",
      restrictions: [],
      allergies: ["Pesce"],
      notes: "Nuovo paziente, primo approccio alla dieta strutturata.",
      compliance: 0,
      last_access: "Mai",
      status: "new",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]
}

function getMockDietPlans(patientId: string): DietPlan[] {
  const plans: { [key: string]: DietPlan } = {
    "550e8400-e29b-41d4-a716-446655440001": {
      id: "660e8400-e29b-41d4-a716-446655440001",
      patient_id: "550e8400-e29b-41d4-a716-446655440001",
      name: "Piano Vegetariano Dimagrante",
      description: "Piano alimentare vegetariano per perdita di peso graduale",
      start_date: "2024-01-01",
      end_date: "2024-03-31",
      is_active: true,
      total_calories: 2200,
      created_by: "Dr. Nutritionist",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    "550e8400-e29b-41d4-a716-446655440002": {
      id: "660e8400-e29b-41d4-a716-446655440002",
      patient_id: "550e8400-e29b-41d4-a716-446655440002",
      name: "Piano Proteico Atleta",
      description: "Piano ad alto contenuto proteico per aumento massa muscolare",
      start_date: "2024-01-15",
      end_date: "2024-06-15",
      is_active: true,
      total_calories: 1800,
      created_by: "Dr. Nutritionist",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    "550e8400-e29b-41d4-a716-446655440003": {
      id: "660e8400-e29b-41d4-a716-446655440003",
      patient_id: "550e8400-e29b-41d4-a716-446655440003",
      name: "Piano Diabetico Controllato",
      description: "Piano per controllo glicemico e perdita di peso",
      start_date: "2023-12-01",
      end_date: "2024-05-31",
      is_active: true,
      total_calories: 2000,
      created_by: "Dr. Nutritionist",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    "550e8400-e29b-41d4-a716-446655440004": {
      id: "660e8400-e29b-41d4-a716-446655440004",
      patient_id: "550e8400-e29b-41d4-a716-446655440004",
      name: "Piano Vegano Bilanciato",
      description: "Piano vegano per mantenimento peso forma",
      start_date: "2024-02-01",
      end_date: "2024-07-31",
      is_active: true,
      total_calories: 1900,
      created_by: "Dr. Nutritionist",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    "550e8400-e29b-41d4-a716-446655440005": {
      id: "660e8400-e29b-41d4-a716-446655440005",
      patient_id: "550e8400-e29b-41d4-a716-446655440005",
      name: "Piano Aumento Peso",
      description: "Piano ipercalorico per aumento di peso sano",
      start_date: "2024-03-01",
      end_date: "2024-08-31",
      is_active: true,
      total_calories: 2400,
      created_by: "Dr. Nutritionist",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  }

  return patientId && plans[patientId] ? [plans[patientId]] : Object.values(plans)
}

function getMockDietPlanMeals(dietPlanId: string): DietPlanMeal[] {
  // Return sample meals for Mario's plan
  if (dietPlanId === "660e8400-e29b-41d4-a716-446655440001") {
    return [
      {
        id: "meal-1",
        diet_plan_id: dietPlanId,
        day_of_week: 1, // Monday
        meal_type: "colazione",
        meal_name: "Colazione Proteica",
        meal_time: "08:00",
        food_items: [
          {
            id: 1,
            name: "Yogurt greco 0%",
            quantity: "200",
            unit: "g",
            calories: 130,
            alternatives: [
              { name: "Skyr naturale", quantity: "180", unit: "g", calories: 120 },
              { name: "Ricotta magra", quantity: "150", unit: "g", calories: 140 },
            ],
          },
          {
            id: 2,
            name: "Frutti di bosco misti",
            quantity: "100",
            unit: "g",
            calories: 50,
            alternatives: [
              { name: "Fragole fresche", quantity: "150", unit: "g", calories: 45 },
              { name: "Mirtilli", quantity: "80", unit: "g", calories: 55 },
            ],
          },
        ],
        total_calories: 390,
        notes: "Ricca di proteine per iniziare la giornata",
        order_index: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]
  }
  return []
}

// Generate comprehensive diet plan data (keeping for compatibility)
export const generateMockDietPlan = () => {
  return {
    Lunedì: [
      {
        id: "colazione_lun",
        name: "Colazione",
        foods: [
          {
            id: 1001,
            name: "Avena con frutti di bosco",
            quantity: "50",
            unit: "g",
            calories: 190,
            alternatives: [
              { name: "Yogurt greco", quantity: "200", unit: "g", calories: 200 },
              { name: "Cereali integrali", quantity: "40", unit: "g", calories: 150 },
              { name: "Porridge di quinoa", quantity: "45", unit: "g", calories: 170 },
              { name: "Muesli senza zucchero", quantity: "35", unit: "g", calories: 140 },
            ],
          },
          {
            id: 1002,
            name: "Latte di mandorla",
            quantity: "250",
            unit: "ml",
            calories: 60,
            alternatives: [
              { name: "Latte scremato", quantity: "250", unit: "ml", calories: 85 },
              { name: "Latte di soia", quantity: "250", unit: "ml", calories: 80 },
              { name: "Latte di avena", quantity: "250", unit: "ml", calories: 120 },
              { name: "Latte di cocco", quantity: "200", unit: "ml", calories: 45 },
            ],
          },
        ],
      },
    ],
    Martedì: [],
    Mercoledì: [],
    Giovedì: [],
    Venerdì: [],
    Sabato: [],
    Domenica: [],
  }
}
