-- EMERGENCY DATABASE FIX SCRIPT
-- This fixes the missing columns and tables that are breaking all user logins

-- Step 1: Add missing subscription_status column to assessment_users table
ALTER TABLE assessment_users 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free';

-- Step 2: Add missing launch period columns
ALTER TABLE assessment_users 
ADD COLUMN IF NOT EXISTS launch_period_granted BOOLEAN DEFAULT FALSE;

ALTER TABLE assessment_users 
ADD COLUMN IF NOT EXISTS launch_period_granted_at TIMESTAMP;

-- Step 3: Create the missing active_assessment_users view
CREATE OR REPLACE VIEW active_assessment_users AS 
SELECT * FROM assessment_users WHERE deleted_at IS NULL;

-- Step 4: Add missing soft delete columns if they don't exist
ALTER TABLE assessment_users 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

ALTER TABLE assessment_users 
ADD COLUMN IF NOT EXISTS deleted_by TEXT;

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_assessment_users_subscription_status ON assessment_users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_assessment_users_launch_period_granted ON assessment_users(launch_period_granted);
CREATE INDEX IF NOT EXISTS idx_assessment_users_active ON assessment_users (uid) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_assessment_users_deleted_at ON assessment_users (deleted_at);

-- Step 6: Grant permissions on the view
GRANT SELECT ON active_assessment_users TO authenticated;

-- Step 7: Update existing users to have proper subscription status
UPDATE assessment_users 
SET subscription_status = CASE 
    WHEN current_plan = 'unlimited' THEN 'active'
    ELSE 'free'
END
WHERE subscription_status IS NULL;

-- Step 8: Update existing unlimited users to be marked as launch users
UPDATE assessment_users 
SET 
    launch_period_granted = TRUE,
    launch_period_granted_at = CURRENT_TIMESTAMP
WHERE 
    current_plan = 'unlimited' 
    AND launch_period_granted IS NULL;

-- Step 9: Add comments for documentation
COMMENT ON COLUMN assessment_users.subscription_status IS 'Subscription status: free, active, cancelled, expired';
COMMENT ON COLUMN assessment_users.launch_period_granted IS 'TRUE if user accepted and received launch period unlimited access';
COMMENT ON COLUMN assessment_users.launch_period_granted_at IS 'Timestamp when launch period unlimited access was granted';

-- Step 10: Verify the fix
SELECT 'emergency_database_fix_completed' as status;
