import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "")

export interface PatientProfile {
  name: string
  surname: string
  age: string
  sex: string
  height: string
  weight: string
  targetCalories: string
  mainGoal: string
  mealCount: string
  restrictions: string[]
  allergies: string[]
  notes?: string
}

interface FoodItem {
  name: string
  quantity: string
  unit: string
  calories: number
  alternatives: Array<{
    name: string
    quantity: string
    unit: string
    calories: number
  }>
}

interface Meal {
  meal_name: string
  meal_time: string
  total_calories: number
  food_items: FoodItem[]
}

export async function generateDietPlanWithGemini(patientData: PatientProfile): Promise<any> {
  console.log("=== GEMINI API CALL DEBUG ===")
  console.log("Patient data received:", JSON.stringify(patientData, null, 2))
  
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 0.7,
    }
  })

  const mainGoalItalian = {
    "weight-loss": "perdita di peso",
    "muscle-gain": "aumento massa muscolare", 
    "maintenance": "mantenimento del peso",
    "health": "salute generale"
  }[patientData.mainGoal] || patientData.mainGoal

  console.log("Main goal translated:", mainGoalItalian)
  
  // Generate one day at a time to avoid token limits
  const dayNames = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"]
  const weeklyPlan: any = {}
  const mealCountNum = parseInt(patientData.mealCount)
  const dailyCalories = Math.floor(parseInt(patientData.targetCalories) / mealCountNum) // Divide by meal count
  
  // Define meal names based on meal count
  const getMealNames = (count: number): string[] => {
    const baseMeals = ["Colazione", "Pranzo", "Cena"]
    const snacks = ["Spuntino Mattina", "Spuntino Pomeriggio", "Spuntino Sera"]
    
    if (count <= 3) return baseMeals.slice(0, count)
    
    // For more than 3 meals, add snacks
    const meals = [...baseMeals]
    const additionalSnacks = snacks.slice(0, count - 3)
    
    // Insert snacks in appropriate positions
    if (additionalSnacks.includes("Spuntino Mattina")) {
      meals.splice(1, 0, "Spuntino Mattina")
    }
    if (additionalSnacks.includes("Spuntino Pomeriggio")) {
      meals.splice(-1, 0, "Spuntino Pomeriggio")
    }
    if (additionalSnacks.includes("Spuntino Sera")) {
      meals.push("Spuntino Sera")
    }
    
    return meals
  }
  
  const mealNames = getMealNames(mealCountNum)
  const mealTimes = {
    "Colazione": "08:00",
    "Spuntino Mattina": "10:30", 
    "Pranzo": "13:00",
    "Spuntino Pomeriggio": "16:00",
    "Cena": "20:00",
    "Spuntino Sera": "22:00"
  }
  
  for (const dayName of dayNames) {
    const prompt = `Sei un nutrizionista esperto. Crea SOLO i pasti per ${dayName} in formato JSON valido.

PROFILO: ${patientData.name}, ${patientData.age} anni, ${patientData.sex}, ${patientData.height}cm, ${patientData.weight}kg
OBIETTIVO: ${mainGoalItalian}, ${patientData.targetCalories} kcal/giorno
RESTRIZIONI: ${patientData.restrictions.join(", ") || "Nessuna"}
ALLERGIE: ${patientData.allergies.join(", ") || "Nessuna"}

Crea esattamente ${mealCountNum} pasti con questi nomi e orari:
${mealNames.map((name, index) => `- ${name} (~${dailyCalories} kcal) alle ${mealTimes[name as keyof typeof mealTimes]}`).join("\n")}

IMPORTANTE: 
- Ogni alimento deve avere 2 alternative
- USA SOLO virgolette doppie (") nel JSON, MAI apostrofi (') o virgolette singole
- Per contrazioni italiane usa "di avena" invece di "d'avena", "alla italiana" invece di "all'italiana"
- NON usare caratteri speciali o simboli che potrebbero causare errori
- Genera JSON valido senza commenti o testo extra

RISPOSTA FORMATO JSON (SENZA TESTO AGGIUNTIVO):
[
  {
    "meal_name": "Colazione",
    "meal_time": "08:00",
    "total_calories": 400,
    "food_items": [
      {
        "name": "Yogurt greco",
        "quantity": "200",
        "unit": "g", 
        "calories": 130,
        "alternatives": [
          {"name": "Skyr", "quantity": "180", "unit": "g", "calories": 120},
          {"name": "Ricotta", "quantity": "150", "unit": "g", "calories": 140}
        ]
      }
    ]
  }
]`

    try {
      console.log(`Generating ${dayName}...`)
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      // Clean up smart quotes and formatting issues
      let cleanedText = text
        .replace(/[""]/g, '"')  // Smart quotes to regular quotes
        .replace(/['']/g, "'")  // Smart apostrophes to regular apostrophes  
        .replace(/['']/g, "'")  // More smart apostrophes
      
      // Extract JSON array
      const arrayMatch = cleanedText.match(/\[[\s\S]*\]/)
      if (!arrayMatch) {
        console.error(`Failed to extract JSON array for ${dayName}. Response:`, cleanedText)
        throw new Error(`Failed to extract JSON for ${dayName}`)
      }
      
      let cleanedJson = arrayMatch[0]
      
      // More robust JSON cleaning - handle apostrophes carefully
      cleanedJson = cleanedJson
        .replace(/\/\/.*$/gm, '')  // Remove comments
        .replace(/,(\s*[}\]])/g, '$1')  // Fix trailing commas
        .replace(/([^\\])'/g, '$1\\"')  // Replace single quotes with double quotes (except escaped ones)
        .replace(/\\'/g, "\\'")  // Keep escaped apostrophes as is
      
      let dayMeals
      try {
        dayMeals = JSON.parse(cleanedJson)
      } catch (parseError) {
        console.error(`JSON Parse Error for ${dayName}:`, parseError)
        console.error(`Problematic JSON:`, cleanedJson.substring(0, 200) + '...')
        
        // Try alternative cleaning approach
        let alternativeJson = arrayMatch[0]
          .replace(/\/\/.*$/gm, '')
          .replace(/,(\s*[}\]])/g, '$1')
          .replace(/'/g, '"')  // Simply replace all single quotes with double quotes
        
        try {
          dayMeals = JSON.parse(alternativeJson)
          console.log(`✓ Alternative parsing worked for ${dayName}`)
        } catch (secondError) {
          console.error(`Second parse attempt failed for ${dayName}:`, secondError)
          throw new Error(`Failed to parse JSON for ${dayName}`)
        }
      }
      weeklyPlan[dayName] = dayMeals
      
      console.log(`✓ Generated ${dayName} with ${dayMeals.length} meals`)
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100))
      
    } catch (error) {
      console.error(`Error generating ${dayName}:`, error)
      // Fallback to simple meals for this day using the specified meal count
      const fallbackMeals = mealNames.map((mealName, index) => ({
        meal_name: mealName,
        meal_time: mealTimes[mealName as keyof typeof mealTimes],
        total_calories: dailyCalories,
        food_items: [{
          name: `Pasto ${index + 1} - ${mealName}`,
          quantity: "1",
          unit: "porzione",
          calories: dailyCalories,
          alternatives: [
            {name: `Alternativa 1 - ${mealName}`, quantity: "1", unit: "porzione", calories: dailyCalories},
            {name: `Alternativa 2 - ${mealName}`, quantity: "1", unit: "porzione", calories: dailyCalories}
          ]
        }]
      }))
      
      weeklyPlan[dayName] = fallbackMeals
    }
  }
  
  // Convert to our WeeklyMealPlan format
  const finalWeeklyPlan: any = {}
  
  for (const dayName of dayNames) {
    if (weeklyPlan[dayName]) {
      finalWeeklyPlan[dayName] = weeklyPlan[dayName].map((meal: Meal, index: number) => ({
        id: `${dayName.toLowerCase()}-meal-${index}-${Date.now()}`,
        diet_plan_id: "", // Will be set when saving
        day_of_week: dayNames.indexOf(dayName) + 1, // 1-7 (Monday to Sunday)
        meal_type: meal.meal_name.toLowerCase().replace(/\s+/g, "_"),
        meal_name: meal.meal_name,
        meal_time: meal.meal_time || getDefaultMealTime(meal.meal_name),
        food_items: meal.food_items.map((food: FoodItem, foodIndex: number) => ({
          id: Date.now() + foodIndex,
          name: food.name,
          quantity: food.quantity,
          unit: food.unit,
          calories: food.calories || 0,
          alternatives: food.alternatives || []
        })),
        total_calories: meal.total_calories || calculateMealCalories(meal.food_items),
        notes: "",
        order_index: index,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))
    }
  }
  
  console.log("=== FINAL WEEKLY PLAN GENERATED ===")
  console.log("Days generated:", Object.keys(finalWeeklyPlan))
  console.log("====================================")
  
  return finalWeeklyPlan
}

function getDefaultMealTime(mealName: string): string {
  const mealTimes: Record<string, string> = {
    "colazione": "08:00",
    "spuntino mattina": "10:30",
    "pranzo": "13:00",
    "spuntino pomeriggio": "16:00",
    "cena": "20:00"
  }
  return mealTimes[mealName.toLowerCase()] || "12:00"
}

function calculateMealCalories(foodItems: FoodItem[]): number {
  return foodItems.reduce((total, food) => total + (food.calories || 0), 0)
}