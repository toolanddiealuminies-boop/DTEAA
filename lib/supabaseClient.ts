// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Helpful dev-time warning — remove in production if needed
  // eslint-disable-next-line no-console
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment. Check your .env file and restart the dev server.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
