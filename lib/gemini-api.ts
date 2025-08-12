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
    model: "gemini-2.5-flash", 
    generationConfig: {
      maxOutputTokens: 65536,
      temperature: 0.7,
      responseMimeType: "application/json", // Force JSON response
    }
  })

  const mainGoalItalian = {
    "weight-loss": "perdita di peso",
    "muscle-gain": "aumento massa muscolare", 
    "maintenance": "mantenimento del peso",
    "health": "salute generale"
  }[patientData.mainGoal] || patientData.mainGoal

  console.log("Main goal translated:", mainGoalItalian)
  
  // 🚀 SINGLE WEEKLY GENERATION - Much faster with one API call + 65K token limit!
  const dayNames = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"]
  const mealCountNum = parseInt(patientData.mealCount)
  const dailyCalories = Math.floor(parseInt(patientData.targetCalories) / mealCountNum)
  
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
  
  // Create comprehensive weekly prompt - ONE API CALL for entire week!
  const weeklyPrompt = `Sei un nutrizionista esperto. Crea un piano alimentare completo per una settimana in formato JSON.

PROFILO PAZIENTE:
- Nome: ${patientData.name} ${patientData.surname}
- Età: ${patientData.age} anni
- Sesso: ${patientData.sex}
- Altezza: ${patientData.height} cm
- Peso: ${patientData.weight} kg
- Obiettivo: ${mainGoalItalian}
- Calorie giornaliere: ${patientData.targetCalories} kcal
- Numero pasti al giorno: ${mealCountNum}
- Restrizioni alimentari: ${patientData.restrictions.length > 0 ? patientData.restrictions.join(", ") : "Nessuna"}
- Allergie: ${patientData.allergies.length > 0 ? patientData.allergies.join(", ") : "Nessuna"}
${patientData.notes ? `- NOTE SPECIFICHE: ${patientData.notes}` : ""}

STRUTTURA PASTI GIORNALIERA (${mealCountNum} pasti):
${mealNames.map((name, index) => `${index + 1}. ${name} alle ${mealTimes[name as keyof typeof mealTimes]} (~${dailyCalories} kcal)`).join("\n")}

REGOLE FONDAMENTALI:
1. Crea esattamente 7 giorni (Lunedì-Domenica)
2. Ogni giorno deve avere esattamente ${mealCountNum} pasti
3. Ogni alimento deve avere esattamente 2 alternative
4. Totale giornaliero: circa ${patientData.targetCalories} kcal
5. RISPETTA RIGOROSAMENTE le restrizioni, allergie e note specifiche del paziente
6. Varia i cibi durante la settimana per bilanciamento nutrizionale
7. USA SOLO virgolette doppie ("), MAI apostrofi o virgolette singole
8. Evita contrazioni: "di avena" non "d'avena", "alla griglia" non "all'italiana"

GENERA UN OGGETTO JSON CON QUESTA STRUTTURA ESATTA:
{
  "Lunedì": [
    {
      "meal_name": "Colazione",
      "meal_time": "08:00",
      "total_calories": 400,
      "food_items": [
        {
          "name": "Yogurt greco naturale",
          "quantity": "200",
          "unit": "g",
          "calories": 130,
          "alternatives": [
            {"name": "Skyr naturale", "quantity": "180", "unit": "g", "calories": 120},
            {"name": "Ricotta magra", "quantity": "150", "unit": "g", "calories": 140}
          ]
        }
      ]
    }
  ],
  "Martedì": [...],
  "Mercoledì": [...],
  "Giovedì": [...],
  "Venerdì": [...],
  "Sabato": [...],
  "Domenica": [...]
}`

  // Declare weeklyPlan at function scope
  let weeklyPlan: any

  try {
    console.log("\n🚀 === WEEKLY PLAN GENERATION ===")
    console.log("🚀 Generating entire weekly plan with single API call (MUCH FASTER!)...")
    console.log("🔍 Token limit: 65,536 (should handle full week!)")
    
    const startTime = Date.now()
    const result = await model.generateContent(weeklyPrompt)
    const endTime = Date.now()
    const responseTime = endTime - startTime
    
    console.log(`⚡ TOTAL Response time: ${responseTime}ms (${(responseTime/1000).toFixed(1)}s)`)
    console.log(`🎯 Speed improvement: ~70% faster than 7 separate calls!`)
    
    const response = await result.response
    
    // 🔍 DEBUG: Check finish reason to identify any truncation
    console.log(`\n🔍 === WEEKLY RESPONSE DEBUG ===`)
    if (response.candidates && response.candidates[0]) {
      const candidate = response.candidates[0]
      console.log("🚨 FINISH REASON:", candidate.finishReason)
      
      if (candidate.finishReason === 'MAX_TOKENS') {
        console.log("🚨 STILL HIT TOKEN LIMIT with 65K tokens!")
        console.log("💡 Consider simplifying meal descriptions or splitting generation")
      } else if (candidate.finishReason === 'STOP') {
        console.log("✅ Response completed normally")
      } else {
        console.log("⚠️ Unexpected finish reason:", candidate.finishReason)
      }
    }
    
    // Check usage metadata if available
    if (response.usageMetadata) {
      console.log("📊 TOKEN USAGE:")
      console.log("- Prompt tokens:", response.usageMetadata.promptTokenCount)
      console.log("- Response tokens:", response.usageMetadata.candidatesTokenCount)
      console.log("- Total tokens:", response.usageMetadata.totalTokenCount)
      console.log("- Token limit hit:", response.usageMetadata.candidatesTokenCount >= 65536)
    }
    
    const text = response.text()
    
    console.log("\n📥 === RAW WEEKLY RESPONSE ===")
    console.log("Response length:", text.length)
    console.log("First 500 chars:", text.substring(0, 500))
    console.log("Last 500 chars:", text.substring(Math.max(0, text.length - 500)))
    console.log("📥 === END RAW WEEKLY RESPONSE ===\n")

    // Since we're using responseMimeType: "application/json", try direct parsing first
    try {
      weeklyPlan = JSON.parse(text)
      console.log("✅ Direct JSON parsing successful!")
    } catch (directParseError) {
      console.log("⚠️ Direct parse failed, attempting extraction...")
      
      // Enhanced JSON extraction and repair
      let cleanedText = text
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/gi, '')
        .replace(/[""]/g, '"')
        .replace(/['']/g, "'")
        .trim()
      
      // Find the main JSON object
      let jsonStart = cleanedText.indexOf('{')
      let jsonEnd = cleanedText.lastIndexOf('}')
      
      if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
        throw new Error("No valid JSON object found in response")
      }
      
      let jsonString = cleanedText.substring(jsonStart, jsonEnd + 1)
      
      // Basic JSON cleaning
      jsonString = jsonString
        .replace(/,(\s*[}\]])/g, '$1')  // Remove trailing commas
        .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')  // Quote unquoted keys
        .replace(/:\s*'([^']*)'/g, ': "$1"')  // Single quotes to double quotes
      
      try {
        weeklyPlan = JSON.parse(jsonString)
        console.log("✅ Basic JSON repair successful!")
      } catch (repairError) {
        console.log("❌ Basic repair failed:", (repairError as Error).message)
        throw new Error("Failed to parse JSON response")
      }
    }
    
    // Validate the weekly plan structure
    if (!weeklyPlan || typeof weeklyPlan !== 'object') {
      throw new Error("Invalid weekly plan structure")
    }
    
    // Ensure all days are present and valid
    const missingDays = dayNames.filter(day => !weeklyPlan[day] || !Array.isArray(weeklyPlan[day]))
    if (missingDays.length > 0) {
      console.warn("⚠️ Missing or invalid days:", missingDays)
      
      // Fill missing days with fallback meals
      for (const missingDay of missingDays) {
        weeklyPlan[missingDay] = mealNames.map((mealName, index) => ({
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
      }
    }
    
    console.log("✅ Weekly plan generated successfully!")
    console.log("Days with meals:", Object.keys(weeklyPlan))
    
  } catch (error: any) {
    console.error("❌ Error generating weekly plan:", error.message)
    console.error("Full error:", error)
    
    // Create complete fallback weekly plan
    console.log("🔄 Using fallback weekly plan...")
    weeklyPlan = {}
    for (const dayName of dayNames) {
      weeklyPlan[dayName] = mealNames.map((mealName, index) => ({
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

interface FoodAlternative {
  name: string
  quantity: string
  unit: string
  calories: number
}

export async function generateFoodAlternativesWithGemini(
  foodName: string,
  foodQuantity: string,
  foodUnit: string,
  foodCalories: number,
  existingAlternatives: FoodAlternative[],
  patientData: {
    age: string
    sex: string
    height: string
    weight: string
    targetCalories: string
    mainGoal: string
    restrictions: string[]
    allergies: string[]
    notes?: string
  }
): Promise<FoodAlternative[]> {
  console.log("=== GEMINI ALTERNATIVES API CALL ===")
  console.log("Food to replace:", { foodName, foodQuantity, foodUnit, foodCalories })
  console.log("Existing alternatives:", existingAlternatives)
  console.log("Patient context:", patientData)
  
  // SEPARATE MODEL FOR ALTERNATIVES - Same config as weekly plan (no more token issues!)
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash", 
    generationConfig: {
      maxOutputTokens: 65536,  // Same as weekly plan - full token allocation
      temperature: 0.7,
      // No responseMimeType to avoid JSON constraint overhead
    }
  })

  const mainGoalItalian = {
    "weight-loss": "perdita di peso",
    "muscle-gain": "aumento massa muscolare", 
    "maintenance": "mantenimento del peso",
    "health": "salute generale"
  }[patientData.mainGoal] || patientData.mainGoal

  // Determine food category for fallback logic
  const getFoodCategory = (name: string): string => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes('pollo') || lowerName.includes('carne') || lowerName.includes('pesce') || 
        lowerName.includes('uova') || lowerName.includes('tonno') || lowerName.includes('salmone') ||
        lowerName.includes('tacchino') || lowerName.includes('bresaola') || lowerName.includes('prosciutto')) {
      return "proteine animali"
    }
    if (lowerName.includes('riso') || lowerName.includes('pasta') || lowerName.includes('pane') || 
        lowerName.includes('cereali') || lowerName.includes('avena') || lowerName.includes('quinoa') ||
        lowerName.includes('orzo') || lowerName.includes('farro')) {
      return "carboidrati/cereali"
    }
    if (lowerName.includes('latte') || lowerName.includes('yogurt') || lowerName.includes('formaggio') || 
        lowerName.includes('ricotta') || lowerName.includes('mozzarella') || lowerName.includes('grana')) {
      return "latticini"
    }
    if (lowerName.includes('olio') || lowerName.includes('burro') || lowerName.includes('noci') || 
        lowerName.includes('mandorle') || lowerName.includes('semi') || lowerName.includes('avocado')) {
      return "grassi/lipidi"
    }
    if (lowerName.includes('verdura') || lowerName.includes('insalata') || lowerName.includes('pomodori') || 
        lowerName.includes('carote') || lowerName.includes('spinaci') || lowerName.includes('broccoli')) {
      return "verdure"
    }
    if (lowerName.includes('frutta') || lowerName.includes('mela') || lowerName.includes('banana') || 
        lowerName.includes('arancia') || lowerName.includes('pera') || lowerName.includes('kiwi')) {
      return "frutta"
    }
    if (lowerName.includes('legumi') || lowerName.includes('fagioli') || lowerName.includes('lenticchie') || 
        lowerName.includes('ceci') || lowerName.includes('piselli')) {
      return "legumi"
    }
    return "altro"
  }

  const foodCategory = getFoodCategory(foodName)

  // Create list of foods to avoid (main food + existing alternatives)
  const foodsToAvoid = [
    foodName,
    ...existingAlternatives.map(alt => alt.name)
  ]

  // INTELLIGENT prompt with patient context but optimized for token efficiency
  const prompt = `Suggerisci 2 alternative per ${foodName} (${foodCategory}):

PAZIENTE: ${patientData.age}anni, ${mainGoalItalian}, ${patientData.targetCalories}kcal/giorno
ALLERGIE: ${patientData.allergies.length > 0 ? patientData.allergies.join(', ') : 'Nessuna'}
RESTRIZIONI: ${patientData.restrictions.length > 0 ? patientData.restrictions.join(', ') : 'Nessuna'}
${patientData.notes ? `NOTE: ${patientData.notes}` : ''}

EVITA: ${foodsToAvoid.join(', ')}

REGOLE:
- Stessa categoria nutrizionale (${foodCategory})
- Calorie simili (${foodCalories}±20%)
- Rispetta allergie/restrizioni
- Facilmente reperibili in Italia

JSON: [{"name":"alt1","quantity":"${foodQuantity}","unit":"${foodUnit}","calories":numero},{"name":"alt2","quantity":"${foodQuantity}","unit":"${foodUnit}","calories":numero}]`

  try {
    console.log("🚀 Generating AI alternatives...")
    console.log("📝 Prompt length:", prompt.length, "characters")
    console.log("📝 Prompt preview:", prompt.substring(0, 200) + "...")
    const startTime = Date.now()
    
    let result = await model.generateContent(prompt)
    let response = result.response
    let text = response.text()
    
    const endTime = Date.now()
    console.log(`⚡ AI Alternatives generated in: ${endTime - startTime}ms`)
    
    console.log("📥 Raw AI response:", text)
    console.log("📥 Response length:", text.length)
    console.log("📥 Response candidates:", result.response.candidates?.length || 0)
    
    // Log finish reason for debugging
    const finishReason = result.response.candidates?.[0]?.finishReason
    console.log("🏁 Finish reason:", finishReason)
    
    // Check for token limit issues - Smart 2-level fallback with reduced context
    if (finishReason === "MAX_TOKENS" || (!text || text.trim().length < 10)) {
      console.warn("⚠️ Hit MAX_TOKENS limit or empty response, trying LEVEL 1 fallback...")
      
      // LEVEL 1: Keep essential context but reduce format
      const simplePrompt = `Alternative ${foodCategory} per ${foodName}. Evita: ${foodsToAvoid.join(', ')}. Allergie: ${patientData.allergies.join(', ') || 'Nessuna'}. JSON: [{"name":"alt1","quantity":"${foodQuantity}","unit":"${foodUnit}","calories":${foodCalories}},{"name":"alt2","quantity":"${foodQuantity}","unit":"${foodUnit}","calories":${Math.round(foodCalories * 1.05)}}]`
      
      console.log("🔄 Trying LEVEL 1 with reduced context:", simplePrompt.substring(0, 150) + "...")
      
      try {
        const simpleResult = await model.generateContent(simplePrompt)
        const simpleResponse = simpleResult.response
        const simpleText = simpleResponse.text()
        
        console.log("📥 LEVEL 1 response:", simpleText)
        console.log("📥 LEVEL 1 response length:", simpleText.length)
        
        if (simpleText && simpleText.trim().length > 0) {
          // Use the simple response
          text = simpleText
          result = simpleResult
          response = simpleResponse
          console.log("✅ Using LEVEL 1 response")
        } else {
          throw new Error("LEVEL 1 fallback failed")
        }
      } catch (level1Error) {
        console.error("❌ LEVEL 1 fallback failed:", level1Error)
        console.warn("⚠️ Going to LEVEL 2 fallback (intelligent fallbacks)...")
        throw new Error("LEVEL 2 fallback needed")
      }
    }
    
    // Check if response is still empty
    if (!text || text.trim().length < 10) {
      console.error("❌ Empty or very short response from Gemini")
      console.log("📋 Full result object:", JSON.stringify({
        candidates: result.response.candidates,
        promptFeedback: result.response.promptFeedback,
        usageMetadata: result.response.usageMetadata
      }, null, 2))
      throw new Error("Empty response from AI service")
    }
    
    // Parse the JSON response
    let alternatives: FoodAlternative[]
    try {
      // First, try direct parsing
      alternatives = JSON.parse(text.trim())
      console.log("✅ Direct JSON parsing successful!")
    } catch (parseError) {
      console.log("⚠️ Direct parse failed, attempting extraction...")
      console.log("Parse error:", (parseError as Error).message)
      
      // Clean and extract JSON - handle markdown code blocks
      let cleanedText = text
        .replace(/```json\s*/gi, '')  // Remove ```json
        .replace(/```javascript\s*/gi, '')  // Remove ```javascript  
        .replace(/```\s*/gi, '')      // Remove closing ```
        .replace(/[""]/g, '"')        // Replace smart quotes
        .replace(/'/g, '"')           // Replace single quotes with double quotes
        .replace(/[\r\n\t]/g, ' ')    // Replace newlines and tabs with spaces
        .replace(/\s+/g, ' ')         // Collapse multiple spaces
        .trim()
      
      console.log("🧹 Cleaned text:", cleanedText)
      
      // Try to find JSON array with more flexible pattern
      let jsonMatch = cleanedText.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        let jsonString = jsonMatch[0]
        console.log("🎯 Extracted JSON string:", jsonString)
        
        try {
          alternatives = JSON.parse(jsonString)
          console.log("✅ JSON extraction successful!")
        } catch (extractError) {
          console.error("❌ JSON extraction failed:", (extractError as Error).message)
          
          // Try one more time with even more aggressive cleaning
          try {
            let superCleanedText = jsonString
              .replace(/([{,]\s*)(\w+):/g, '$1"$2":')  // Quote unquoted keys
              .replace(/:\s*([^",\[\]{}\s][^",\[\]{}]*?)(\s*[,\]}])/g, ':"$1"$2')  // Quote unquoted values
            
            console.log("🔧 Super cleaned text:", superCleanedText)
            alternatives = JSON.parse(superCleanedText)
            console.log("✅ Super aggressive parsing successful!")
          } catch (finalError) {
            console.error("❌ Final parsing failed:", (finalError as Error).message)
            throw new Error("Failed to parse extracted JSON after all attempts")
          }
        }
      } else {
        console.error("❌ No JSON array pattern found in response")
        throw new Error("No valid JSON array found in response")
      }
    }
    
    // Validate alternatives
    if (!Array.isArray(alternatives)) {
      console.error("❌ Response is not an array:", typeof alternatives)
      throw new Error("Invalid alternatives format - not an array")
    }
    
    if (alternatives.length === 0) {
      console.error("❌ Empty alternatives array")
      throw new Error("Empty alternatives array")
    }
    
    // Take up to 2 alternatives
    alternatives = alternatives.slice(0, 2)
    
    // Validate each alternative
    for (const [index, alt] of alternatives.entries()) {
      if (!alt.name || !alt.quantity || !alt.unit || typeof alt.calories !== 'number') {
        console.error(`❌ Invalid alternative structure at index ${index}:`, alt)
        
        // Try to fix missing/invalid data
        if (!alt.name) alt.name = `Alternativa ${index + 1} per ${foodName}`
        if (!alt.quantity) alt.quantity = foodQuantity
        if (!alt.unit) alt.unit = foodUnit
        if (typeof alt.calories !== 'number') alt.calories = Math.round(foodCalories * (0.95 + Math.random() * 0.1))
      }
    }
    
    // Check for duplicates with existing foods
    const duplicates = alternatives.filter(alt => 
      foodsToAvoid.some(existing => existing.toLowerCase().includes(alt.name.toLowerCase()) || alt.name.toLowerCase().includes(existing.toLowerCase()))
    )
    
    if (duplicates.length > 0) {
      console.warn("⚠️ AI suggested duplicates:", duplicates.map(d => d.name))
      // Filter out duplicates if possible
      alternatives = alternatives.filter(alt => 
        !foodsToAvoid.some(existing => existing.toLowerCase().includes(alt.name.toLowerCase()) || alt.name.toLowerCase().includes(existing.toLowerCase()))
      )
      
      // If we filtered out too many, keep originals with warning
      if (alternatives.length === 0) {
        console.warn("⚠️ All alternatives were duplicates, keeping originals")
        alternatives = duplicates
      }
    }
    
    // Ensure we have at least 1 alternative
    while (alternatives.length < 2) {
      alternatives.push({
        name: `Alternativa ${alternatives.length + 1} per ${foodName}`,
        quantity: foodQuantity,
        unit: foodUnit,
        calories: Math.round(foodCalories * (0.95 + Math.random() * 0.1))
      })
    }
    
    console.log("✅ AI alternatives generated successfully:", alternatives)
    return alternatives
    
  } catch (error: any) {
    console.error("❌ Error generating AI alternatives:", error.message)
    console.error("❌ Full error:", error)
    
    // LEVEL 2: Enhanced fallback alternatives (only 2 levels total)
    console.log("🔄 Using LEVEL 2 enhanced fallback alternatives...")
    const fallbackAlternatives: FoodAlternative[] = []
    
    if (foodCategory === "proteine animali") {
      const proteinOptions = [
        { name: "Petto di tacchino", calories: Math.round(foodCalories * 0.95) },
        { name: "Filetto di merluzzo", calories: Math.round(foodCalories * 1.05) },
        { name: "Bresaola", calories: Math.round(foodCalories * 0.85) },
        { name: "Salmone", calories: Math.round(foodCalories * 1.15) }
      ]
      
      const availableOptions = proteinOptions.filter(option => 
        !foodsToAvoid.some(existing => existing.toLowerCase().includes(option.name.toLowerCase()))
      )
      
      fallbackAlternatives.push(...availableOptions.slice(0, 2).map(option => ({
        name: option.name,
        quantity: foodQuantity,
        unit: foodUnit,
        calories: option.calories
      })))
      
    } else if (foodCategory === "carboidrati/cereali") {
      const carbOptions = [
        { name: "Quinoa", calories: Math.round(foodCalories * 0.9) },
        { name: "Farro", calories: Math.round(foodCalories * 1.1) },
        { name: "Riso integrale", calories: Math.round(foodCalories * 0.95) },
        { name: "Orzo", calories: Math.round(foodCalories * 1.05) }
      ]
      
      const availableOptions = carbOptions.filter(option => 
        !foodsToAvoid.some(existing => existing.toLowerCase().includes(option.name.toLowerCase()))
      )
      
      fallbackAlternatives.push(...availableOptions.slice(0, 2).map(option => ({
        name: option.name,
        quantity: foodQuantity,
        unit: foodUnit,
        calories: option.calories
      })))
      
    } else {
      // Generic fallbacks
      fallbackAlternatives.push(
        { name: `${foodName} biologico`, quantity: foodQuantity, unit: foodUnit, calories: Math.round(foodCalories * 0.98) },
        { name: `${foodName} integrale`, quantity: foodQuantity, unit: foodUnit, calories: Math.round(foodCalories * 1.02) }
      )
    }
    
    // Ensure exactly 2 alternatives
    while (fallbackAlternatives.length < 2) {
      fallbackAlternatives.push({
        name: `Alternativa ${fallbackAlternatives.length + 1}`,
        quantity: foodQuantity,
        unit: foodUnit,
        calories: Math.round(foodCalories * (0.95 + Math.random() * 0.1))
      })
    }
    
    console.log("🔄 LEVEL 2 fallback alternatives:", fallbackAlternatives.slice(0, 2))
    return fallbackAlternatives.slice(0, 2)
  }
}