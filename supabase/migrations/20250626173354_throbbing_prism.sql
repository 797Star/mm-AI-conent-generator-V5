/*
  # Fix profiles table RLS policy for user registration

  1. Security Changes
    - Update INSERT policy to use correct auth.uid() function
    - Ensure users can create their own profiles during registration

  This migration fixes the RLS policy that was preventing user registration
  by using the correct Supabase auth function.
*/

-- Use a DO block to handle the policy recreation safely
DO $$
BEGIN
  -- First, try to drop the existing policy if it exists
  BEGIN
    DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
  EXCEPTION
    WHEN insufficient_privilege THEN
      -- If we don't have permission to drop, that's okay, we'll create with OR REPLACE
      NULL;
  END;

  -- Create the policy with the correct auth.uid() function
  -- Using CREATE OR REPLACE to handle cases where the policy might still exist
  EXECUTE 'CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id)';
  
EXCEPTION
  WHEN duplicate_object THEN
    -- If policy already exists, drop it and recreate
    DROP POLICY "Users can insert own profile" ON profiles;
    CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
END $$;

-- Ensure RLS is enabled on the profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;