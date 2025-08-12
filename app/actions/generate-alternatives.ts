"use server"

import { generateFoodAlternativesWithGemini } from "../../lib/gemini-api"

export interface GenerateAlternativesRequest {
  foodName: string
  foodQuantity: string
  foodUnit: string
  foodCalories: number
  existingAlternatives: Array<{
    name: string
    quantity: string
    unit: string
    calories: number
  }>
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
}

export async function generateAlternatives(request: GenerateAlternativesRequest) {
  try {
    console.log("=== GENERATE ALTERNATIVES ACTION ===")
    console.log("Request:", JSON.stringify(request, null, 2))
    
    const alternatives = await generateFoodAlternativesWithGemini(
      request.foodName,
      request.foodQuantity,
      request.foodUnit,
      request.foodCalories,
      request.existingAlternatives,
      request.patientData
    )
    
    console.log("✅ Alternatives generated successfully")
    return { success: true, alternatives }
    
  } catch (error: any) {
    console.error("❌ Error in generateAlternatives action:", error.message)
    return { 
      success: false, 
      error: error.message,
      alternatives: []
    }
  }
}
