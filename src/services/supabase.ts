import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const isConfigValid = !!supabaseUrl && !!supabaseAnonKey

if (!isConfigValid) {
  console.error('Supabase config incompleta. Faltan VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY')
}

export const supabase = isConfigValid ? createClient(supabaseUrl!, supabaseAnonKey!) : null
export { isConfigValid }
