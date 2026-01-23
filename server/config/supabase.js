const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

let supabaseAdmin = null;
let supabaseClient = null;

if (supabaseUrl && supabaseServiceKey) {
  // Use service role key for admin operations (server-side only)
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
} else {
  console.warn('Supabase not fully configured. Authentication features will be limited.');
  console.warn('Set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in .env to enable full authentication.');
}

if (supabaseUrl && supabaseAnonKey) {
  // For verifying user tokens
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

module.exports = {
  supabaseAdmin,
  supabaseClient,
};
