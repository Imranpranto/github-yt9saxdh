import { supabase } from '../lib/supabase';

// Basic profiles table only
const TABLES_SQL = `
CREATE TABLE IF NOT EXISTS credits_calculation_and_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  display_name text,
  plan text DEFAULT 'Trial' NOT NULL,
  total_credits integer DEFAULT 250 NOT NULL,
  used_credits integer DEFAULT 0 NOT NULL,
  credits_left integer DEFAULT 250 NOT NULL,
  subscription_start_at timestamptz,
  subscription_end_at timestamptz,
  trial_ends_at timestamptz DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);`;

export async function initializeDatabase() {
  try {
    const { error } = await supabase.rpc('execute_ddl', { ddl: TABLES_SQL });
    if (error) {
      console.error('Error creating tables:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
}