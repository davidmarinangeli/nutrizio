import { generateWeeklyPlan } from './app/actions/generate-plan.js'

// Test patient data
const testPatientData = {
  name: "Mario",
  surname: "Rossi", 
  email: "mario.rossi@email.com",
  age: "30",
  gender: "maschio",
  height: "175",
  weight: "75",
  targetCalories: "2200",
  mainGoal: "weight-loss",
  restrictions: ["vegetariano"],
  allergies: ["noci"],
  notes: "Preferisce cibi mediterranei"
}

async function testAIGeneration() {
  console.log("Testing AI generation with patient data:", testPatientData)
  
  try {
    const result = await generateWeeklyPlan(testPatientData)
    console.log("AI generation result:", JSON.stringify(result, null, 2))
  } catch (error) {
    console.error("Error testing AI generation:", error)
  }
}

testAIGeneration()
