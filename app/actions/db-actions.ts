"use server"

import { createServerClient } from "@/utils/supabase/server"
import { promises as fs } from "fs"
import path from "path"

export async function seedDatabase() {
  try {
    console.log("Attempting to seed database...")
    
    // Try to create server client
    const supabase = createServerClient()

    // Check if data already exists to prevent re-seeding on every load
    const { data: existingPatients, error: checkError } = await supabase.from("patients").select("id").limit(1)

    if (checkError) {
      console.error("Error checking for existing data:", checkError.message)
      // If there's an error checking, it might mean tables don't exist, so proceed with creation
    } else if (existingPatients && existingPatients.length > 0) {
      console.log("Database already contains data, skipping seed.")
      return { success: true, message: "Database already seeded." }
    }

    // Read SQL files
    const createTablesSqlPath = path.join(process.cwd(), "scripts", "create-tables-v2.sql")
    const seedDataSqlPath = path.join(process.cwd(), "scripts", "seed-mock-data.sql")

    const createTablesSql = await fs.readFile(createTablesSqlPath, "utf-8")
    const seedDataSql = await fs.readFile(seedDataSqlPath, "utf-8")

    // Execute create tables script
    console.log("Executing create-tables-v2.sql...")
    const { error: createError } = await supabase.rpc("execute_sql", { sql_query: createTablesSql })
    if (createError) {
      console.error("Error executing create-tables-v2.sql:", createError.message)
      return { success: false, error: createError.message }
    }
    console.log("create-tables-v2.sql executed successfully.")

    // Execute seed data script
    console.log("Executing seed-mock-data.sql...")
    const { error: seedError } = await supabase.rpc("execute_sql", { sql_query: seedDataSql })
    if (seedError) {
      console.error("Error executing seed-mock-data.sql:", seedError.message)
      return { success: false, error: seedError.message }
    }
    console.log("seed-mock-data.sql executed successfully.")

    console.log("Database seeded successfully!")
    return { success: true, message: "Database seeded successfully!" }
  } catch (error) {
    console.error("Failed to seed database:", error)
    
    // If it's a Supabase configuration error, provide helpful guidance
    if ((error as Error).message.includes("Supabase configuration missing")) {
      return { 
        success: false, 
        error: "Supabase non configurato. L'applicazione funzionerà con dati mock. Per configurare Supabase, modifica il file .env.local con le tue credenziali." 
      }
    }
    
    return { success: false, error: (error as Error).message }
  }
}
