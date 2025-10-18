import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Supabase credentials are now read from environment variables for security.
// You must set SUPABASE_URL and SUPABASE_ANON_KEY in your application's environment.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = "Supabase URL or Anon Key is missing. Please make sure SUPABASE_URL and SUPABASE_ANON_KEY are set as environment variables.";
  console.error(errorMessage);
  alert(errorMessage);
  // We throw an error to prevent the app from running with an invalid configuration.
  throw new Error(errorMessage);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
