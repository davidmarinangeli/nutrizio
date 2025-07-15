"use server"

import { generateDietPlanWithGemini, type PatientProfile } from "../../lib/gemini-api"

// Keep the existing mock function as fallback
async function generateMockPlan(patientData: any) {
  // Simulated AI delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const dayNames = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"]
  const weeklyPlan: any = {}

  for (let dayIndex = 0; dayIndex < dayNames.length; dayIndex++) {
    const dayName = dayNames[dayIndex]
    weeklyPlan[dayName] = [
      {
        id: `${dayName.toLowerCase()}-colazione-${Date.now()}`,
        diet_plan_id: "",
        day_of_week: dayIndex + 1,
        meal_type: "colazione",
        meal_name: "Colazione",
        meal_time: "08:00",
        food_items: [
          {
            id: Date.now() + 1,
            name: "Yogurt greco",
            quantity: "150",
            unit: "g",
            calories: 90,
            alternatives: [
              { name: "Latte scremato", quantity: "200", unit: "ml", calories: 80 },
              { name: "Skyr", quantity: "150", unit: "g", calories: 85 }
            ],
          },
          {
            id: Date.now() + 2,
            name: "Fette biscottate integrali",
            quantity: "4",
            unit: "pezzi",
            calories: 120,
            alternatives: [
              { name: "Pane integrale", quantity: "50", unit: "g", calories: 115 },
              { name: "Cereali integrali", quantity: "40", unit: "g", calories: 130 }
            ],
          },
        ],
        total_calories: 210,
        notes: "",
        order_index: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: `${dayName.toLowerCase()}-pranzo-${Date.now()}`,
        diet_plan_id: "",
        day_of_week: dayIndex + 1,
        meal_type: "pranzo",
        meal_name: "Pranzo",
        meal_time: "13:00",
        food_items: [
          {
            id: Date.now() + 3,
            name: "Pasta integrale",
            quantity: "80",
            unit: "g",
            calories: 280,
            alternatives: [
              { name: "Riso integrale", quantity: "80", unit: "g", calories: 290 },
              { name: "Quinoa", quantity: "80", unit: "g", calories: 300 }
            ],
          },
          {
            id: Date.now() + 4,
            name: "Pomodoro",
            quantity: "100",
            unit: "g",
            calories: 20,
            alternatives: [
              { name: "Zucchine", quantity: "150", unit: "g", calories: 25 },
              { name: "Melanzane", quantity: "150", unit: "g", calories: 30 }
            ],
          },
        ],
        total_calories: 300,
        notes: "",
        order_index: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: `${dayName.toLowerCase()}-cena-${Date.now()}`,
        diet_plan_id: "",
        day_of_week: dayIndex + 1,
        meal_type: "cena",
        meal_name: "Cena",
        meal_time: "20:00",
        food_items: [
          {
            id: Date.now() + 5,
            name: "Petto di pollo",
            quantity: "150",
            unit: "g",
            calories: 165,
            alternatives: [
              { name: "Merluzzo", quantity: "200", unit: "g", calories: 160 },
              { name: "Tofu", quantity: "200", unit: "g", calories: 170 }
            ],
          },
          {
            id: Date.now() + 6,
            name: "Insalata mista",
            quantity: "100",
            unit: "g",
            calories: 20,
            alternatives: [
              { name: "Spinaci", quantity: "100", unit: "g", calories: 25 },
              { name: "Rucola", quantity: "80", unit: "g", calories: 20 }
            ],
          },
        ],
        total_calories: 185,
        notes: "",
        order_index: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]
  }

  return weeklyPlan
}

export async function generateWeeklyPlan(patientData: any) {
  console.log("=== GENERATE WEEKLY PLAN DEBUG ===")
  console.log("Received patient data:", JSON.stringify(patientData, null, 2))
  console.log("Environment API key exists:", !!process.env.GOOGLE_API_KEY)
  console.log("API key length:", process.env.GOOGLE_API_KEY?.length || 0)
  console.log("================================")
  
  try {
    // Try to use Gemini API first if API key exists
    if (process.env.GOOGLE_API_KEY) {
      console.log("Using Gemini API to generate diet plan...")
      
      const patientProfile: PatientProfile = {
        name: patientData.name,
        surname: patientData.surname,
        age: patientData.age,
        sex: patientData.gender || "non_specificato",
        height: patientData.height,
        weight: patientData.weight,
        targetCalories: patientData.targetCalories,
        mainGoal: patientData.mainGoal,
        mealCount: patientData.mealCount || "3",
        restrictions: patientData.restrictions || [],
        allergies: patientData.allergies || [],
        notes: patientData.notes
      }
      
      console.log("Prepared patient profile for Gemini:", JSON.stringify(patientProfile, null, 2))
      
      try {
        const geminiPlan = await generateDietPlanWithGemini(patientProfile)
        console.log("Gemini plan generated successfully!")
        console.log("Plan structure:", Object.keys(geminiPlan))
        return { success: true, plan: geminiPlan }
      } catch (geminiError) {
        console.error("Gemini API error, falling back to mock data:", geminiError)
        const mockPlan = await generateMockPlan(patientData)
        return { success: true, plan: mockPlan }
      }
    } else {
      console.log("No Gemini API key found, using mock data...")
      const mockPlan = await generateMockPlan(patientData)
      return { success: true, plan: mockPlan }
    }
  } catch (error) {
    console.error("Error generating plan:", error)
    // Fallback to mock data if any error occurs
    const mockPlan = await generateMockPlan(patientData)
    return { success: true, plan: mockPlan }
  }
}