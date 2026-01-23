import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Create client even if credentials are missing (will fail gracefully on auth operations)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL and Anon Key not configured. Authentication features will not work.');
  console.warn('Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in client/.env to enable authentication.');
}
