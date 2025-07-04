/*
  # Fix profiles table INSERT policy

  1. Security Changes
    - Drop the existing INSERT policy that uses uid()
    - Create a new INSERT policy that uses auth.uid()
    - This ensures users can create their own profile during registration

  The issue was that the policy was using uid() instead of auth.uid(),
  which caused RLS violations during user registration.
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create a new INSERT policy with the correct auth.uid() function
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);