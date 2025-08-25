-- Migration: Add assessment_feedback table if it doesn't exist
-- Run this in Supabase SQL Editor if the table is missing

-- Check and create the assessment_feedback table
CREATE TABLE IF NOT EXISTS assessment_feedback (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  evaluation_id text NOT NULL,
  user_id text NOT NULL,
  category text NOT NULL CHECK (category IN ('overall', 'strengths', 'improvements')),
  accurate boolean NOT NULL,
  comments text,
  created_at timestamp with time zone DEFAULT now()
);

-- Add foreign key constraint if assessment_users table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assessment_users') THEN
    -- Check if the foreign key constraint already exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'assessment_feedback_user_id_fkey'
      AND table_name = 'assessment_feedback'
    ) THEN
      ALTER TABLE assessment_feedback 
      ADD CONSTRAINT assessment_feedback_user_id_fkey 
      FOREIGN KEY (user_id) 
      REFERENCES assessment_users(uid) 
      ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_assessment_feedback_evaluation_id ON assessment_feedback(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_assessment_feedback_user_id ON assessment_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_feedback_created_at ON assessment_feedback(created_at);

-- Grant permissions
GRANT ALL ON assessment_feedback TO authenticated;
GRANT SELECT ON assessment_feedback TO anon;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'assessment_feedback table created/verified successfully';
END $$;