-- Complete Database Schema for EnglishGPT Assessment Feature
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Assessment Users table
CREATE TABLE assessment_users (
  uid text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  display_name text,
  photo_url text,
  academic_level text DEFAULT 'N/A',
  questions_marked integer DEFAULT 0,
  credits integer DEFAULT 3,
  current_plan text DEFAULT 'free',
  dark_mode boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Assessment Evaluations table
CREATE TABLE assessment_evaluations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  short_id text UNIQUE,
  user_id text NOT NULL REFERENCES assessment_users(uid) ON DELETE CASCADE,
  question_type text NOT NULL,
  student_response text NOT NULL,
  feedback text NOT NULL,
  grade text NOT NULL,
  reading_marks text,
  writing_marks text,
  ao1_marks text,
  ao2_marks text,
  improvement_suggestions text[],
  strengths text[],
  full_chat text,
  timestamp timestamp with time zone DEFAULT now()
);

ALTER TABLE assessment_evaluations ADD COLUMN short_id text UNIQUE;
CREATE INDEX IF NOT EXISTS idx_assessment_evaluations_short_id ON assessment_evaluations(short_id);

-- Assessment Badges table
CREATE TABLE assessment_badges (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id text NOT NULL REFERENCES assessment_users(uid) ON DELETE CASCADE,
  badge_type text NOT NULL,
  badge_name text NOT NULL,
  badge_description text NOT NULL,
  badge_icon text NOT NULL,
  tier text DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold')),
  earned_at timestamp with time zone DEFAULT now(),
  progress integer DEFAULT 0,
  requirement integer DEFAULT 0
);

-- Assessment Transactions table
CREATE TABLE assessment_transactions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id text NOT NULL UNIQUE,
  user_email text NOT NULL,
  amount_inr integer NOT NULL,
  status text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Assessment Follow-ups table
CREATE TABLE assessment_follow_ups (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  evaluation_id text NOT NULL,
  user_id text NOT NULL REFERENCES assessment_users(uid) ON DELETE CASCADE,
  question text NOT NULL,
  response text NOT NULL,
  timestamp timestamp with time zone DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_assessment_evaluations_user_id ON assessment_evaluations(user_id);
CREATE INDEX idx_assessment_evaluations_timestamp ON assessment_evaluations(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_assessment_evaluations_short_id ON assessment_evaluations(short_id);
CREATE INDEX idx_assessment_badges_user_id ON assessment_badges(user_id);
CREATE INDEX idx_assessment_badges_earned_at ON assessment_badges(earned_at DESC);
CREATE INDEX idx_assessment_transactions_order_id ON assessment_transactions(order_id);
CREATE INDEX idx_assessment_transactions_user_email ON assessment_transactions(user_email);
CREATE INDEX idx_assessment_follow_ups_evaluation_id ON assessment_follow_ups(evaluation_id);
CREATE INDEX idx_assessment_follow_ups_user_id ON assessment_follow_ups(user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE assessment_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_follow_ups ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own data
CREATE POLICY "Assessment users can view own data" ON assessment_users
  FOR SELECT USING (auth.uid()::text = uid);

CREATE POLICY "Assessment users can update own data" ON assessment_users
  FOR UPDATE USING (auth.uid()::text = uid);

-- Users can view their own evaluations
CREATE POLICY "Assessment users can view own evaluations" ON assessment_evaluations
  FOR SELECT USING (auth.uid()::text = user_id);

-- Users can view their own badges
CREATE POLICY "Assessment users can view own badges" ON assessment_badges
  FOR SELECT USING (auth.uid()::text = user_id);

-- Users can view their own transactions
CREATE POLICY "Assessment users can view own transactions" ON assessment_transactions
  FOR SELECT USING (auth.uid()::text = (SELECT uid FROM assessment_users WHERE email = user_email));

-- Users can view their own follow-ups
CREATE POLICY "Assessment users can view own follow_ups" ON assessment_follow_ups
  FOR SELECT USING (auth.uid()::text = user_id);

-- Service role can do everything (for backend operations)
CREATE POLICY "Service role full access assessment_users" ON assessment_users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access assessment_evaluations" ON assessment_evaluations
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access assessment_badges" ON assessment_badges
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access assessment_transactions" ON assessment_transactions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access assessment_follow_ups" ON assessment_follow_ups
  FOR ALL USING (auth.role() = 'service_role');