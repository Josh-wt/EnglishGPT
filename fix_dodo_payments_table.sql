-- Clean up the dodo_payments table by removing duplicate/unnecessary columns
-- and fixing data types

-- First, let's see if there are any records
SELECT COUNT(*) as total_records FROM dodo_payments;

-- Remove the duplicate 'amount' column (we'll keep amount_cents)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dodo_payments' AND column_name = 'amount'
    ) THEN
        -- If there's data in 'amount' but not in 'amount_cents', copy it first
        UPDATE dodo_payments 
        SET amount_cents = COALESCE(amount_cents, amount, 0)
        WHERE amount_cents IS NULL OR amount_cents = 0;
        
        -- Now drop the duplicate column
        ALTER TABLE dodo_payments DROP COLUMN amount;
        RAISE NOTICE 'Dropped duplicate amount column';
    END IF;
END
$$;

-- Fix user_id data type to UUID if assessment_users exists
DO $$
BEGIN
    -- Check if assessment_users exists and has uid as UUID
    IF EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'assessment_users'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assessment_users' AND column_name = 'uid' AND data_type = 'uuid'
    ) THEN
        -- Check if user_id is currently TEXT
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'dodo_payments' AND column_name = 'user_id' AND data_type = 'text'
        ) THEN
            -- Try to convert user_id from TEXT to UUID
            -- First, check if all existing user_id values are valid UUIDs
            PERFORM user_id::uuid FROM dodo_payments WHERE user_id IS NOT NULL LIMIT 1;
            
            -- If no error, proceed with conversion
            ALTER TABLE dodo_payments ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
            RAISE NOTICE 'Converted user_id from TEXT to UUID';
        END IF;
    ELSE
        RAISE NOTICE 'assessment_users table not found or uid is not UUID, keeping user_id as TEXT';
    END IF;
EXCEPTION
    WHEN invalid_text_representation THEN
        RAISE NOTICE 'Cannot convert user_id to UUID - contains invalid UUID values, keeping as TEXT';
    WHEN others THEN
        RAISE NOTICE 'Error converting user_id: %, keeping as TEXT', SQLERRM;
END
$$;

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_dodo_payments_user_id ON dodo_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_dodo_payments_status ON dodo_payments(status);
CREATE INDEX IF NOT EXISTS idx_dodo_payments_created_at ON dodo_payments(created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_dodo_payments_dodo_id ON dodo_payments(dodo_payment_id);

-- Show final table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'dodo_payments'
ORDER BY ordinal_position;