import { createClient } from '@supabase/supabase-js'


const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env'
  )
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  }
})

const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

export const supabaseAuth = createClient(
  supabaseUrl,
  supabaseAnonKey || supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    }
  }
)