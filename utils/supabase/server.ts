import { createClient } from "@supabase/supabase-js"

export const createServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  // Check if Supabase is configured
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase configuration missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.")
  }

  // Use service role key if available, otherwise use anon key
  const keyToUse = supabaseServiceRoleKey || supabaseAnonKey

  return createClient(supabaseUrl, keyToUse, {
    auth: {
      persistSession: false,
    },
  })
}
