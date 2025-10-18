import { createClient } from 'https://aistudiocdn.com/@supabase/supabase-js@^2.75.1';

// IMPORTANT: Supabase credentials are now read from environment variables for security.
// You must set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.
// FIX: Cast `import.meta` to `any` to resolve TypeScript error when Vite's env types are not available.
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = "Supabase URL or Anon Key is missing. Please create a .env file and add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.";
  console.error(errorMessage);
  alert(errorMessage);
  // We throw an error to prevent the app from running with an invalid configuration.
  throw new Error(errorMessage);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);