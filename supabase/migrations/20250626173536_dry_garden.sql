/*
  # Fix profiles RLS policies for user registration

  1. Security Updates
    - Drop existing conflicting policies
    - Create proper RLS policies for profiles table
    - Allow authenticated users to insert, select, and update their own profiles
    - Ensure auth.uid() is used correctly for user identification

  2. Policy Changes
    - INSERT policy: Allow users to create their own profile during sign-up
    - SELECT policy: Allow users to read their own profile data
    - UPDATE policy: Allow users to update their own profile data
*/

-- Ensure RLS is enabled on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON profiles;

-- Create new policies with correct auth.uid() usage
CREATE POLICY "Enable insert for authenticated users on own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable select for authenticated users on own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable update for authenticated users on own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);