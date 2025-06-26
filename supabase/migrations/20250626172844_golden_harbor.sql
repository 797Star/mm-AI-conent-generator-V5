/*
  # Myanmar Content Creator Initial Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - matches auth.users id
      - `email` (text, unique)
      - `full_name` (text)
      - `tokens` (integer, default 10)
      - `subscription_type` (text, default 'free')
      - `subscription_expires_at` (timestamptz, nullable)
      - `last_daily_token_claim` (timestamptz, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `saved_content`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `title` (text)
      - `content` (text)
      - `content_type` (text)
      - `platform` (text)
      - `created_at` (timestamptz)

    - `promo_codes`
      - `id` (uuid, primary key)
      - `code` (text, unique)
      - `tokens` (integer)
      - `max_uses` (integer)
      - `current_uses` (integer, default 0)
      - `expires_at` (timestamptz, nullable)
      - `active` (boolean, default true)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for promo codes (read-only for users)
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  tokens integer DEFAULT 10,
  subscription_type text DEFAULT 'free' CHECK (subscription_type IN ('free', 'monthly', 'yearly')),
  subscription_expires_at timestamptz,
  last_daily_token_claim timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create saved_content table
CREATE TABLE IF NOT EXISTS saved_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  content_type text NOT NULL,
  platform text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create promo_codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  tokens integer NOT NULL DEFAULT 0,
  max_uses integer NOT NULL DEFAULT 1,
  current_uses integer DEFAULT 0,
  expires_at timestamptz,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Saved content policies
CREATE POLICY "Users can read own saved content"
  ON saved_content
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own saved content"
  ON saved_content
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own saved content"
  ON saved_content
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own saved content"
  ON saved_content
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Promo codes policies (read-only for users)
CREATE POLICY "Users can read active promo codes"
  ON promo_codes
  FOR SELECT
  TO authenticated
  USING (active = true);

-- Function to handle updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample promo codes
INSERT INTO promo_codes (code, tokens, max_uses, expires_at) VALUES
  ('WELCOME2024', 20, 1000, now() + interval '30 days'),
  ('MYANMAR50', 50, 100, now() + interval '60 days'),
  ('NEWUSER', 15, 500, now() + interval '90 days')
ON CONFLICT (code) DO NOTHING;