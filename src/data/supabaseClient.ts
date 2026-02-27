import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  'https://zmqbkgosebuxehizerwb.supabase.co';

const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptcWJrZ29zZWJ1eGVoaXplcndiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNzk0MzgsImV4cCI6MjA4Nzc1NTQzOH0.N-arZdgDlfM6SPjgTtyKlrLRisSbZaDuy7oZFzse1e8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
