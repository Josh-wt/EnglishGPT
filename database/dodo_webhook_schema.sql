-- Complete database schema for Dodo Payments webhook processing
-- This script creates all necessary tables, indexes, and functions for robust webhook handling

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Enhanced webhook events table with comprehensive tracking
CREATE TABLE IF NOT EXISTS dodo_webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    dodo_event_id VARCHAR(255) UNIQUE NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    payload JSONB NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    original_headers JSONB,
    metadata JSONB DEFAULT '{}',
    processing_result JSONB,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    failed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Orphaned webhooks table for webhooks that couldn't be processed
CREATE TABLE IF NOT EXISTS orphaned_webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_data JSONB NOT NULL,
    reason VARCHAR(255) NOT NULL,
    request_id VARCHAR(255),
    retry_count INTEGER DEFAULT 0,
    last_error TEXT,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- 3. Billing history table for payment and invoice tracking
CREATE TABLE IF NOT EXISTS billing_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    payment_id VARCHAR(255),
    invoice_id VARCHAR(255),
    subscription_id VARCHAR(255),
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE,
    invoice_date TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    payment_method_type VARCHAR(50),
    failure_reason TEXT,
    failure_code VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Invoice history table (separate from payments for clarity)
CREATE TABLE IF NOT EXISTS invoice_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    invoice_id VARCHAR(255) NOT NULL,
    subscription_id VARCHAR(255),
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL,
    invoice_date TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    paid_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Update assessment_users table to include subscription fields (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'assessment_users') THEN
        ALTER TABLE assessment_users 
        ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(255),
        ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'inactive',
        ADD COLUMN IF NOT EXISTS plan_type VARCHAR(20),
        ADD COLUMN IF NOT EXISTS dodo_customer_id VARCHAR(255),
        ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS cancellation_reason VARCHAR(255),
        ADD COLUMN IF NOT EXISTS reactivated_at TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS expired_at TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS paused_at TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS resumed_at TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS has_access BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_dodo_webhook_events_event_id ON dodo_webhook_events(dodo_event_id);
CREATE INDEX IF NOT EXISTS idx_dodo_webhook_events_processed ON dodo_webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_dodo_webhook_events_event_type ON dodo_webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_dodo_webhook_events_created_at ON dodo_webhook_events(created_at);

CREATE INDEX IF NOT EXISTS idx_orphaned_webhooks_retry ON orphaned_webhooks(retry_count, next_retry_at);
CREATE INDEX IF NOT EXISTS idx_orphaned_webhooks_created_at ON orphaned_webhooks(created_at);

CREATE INDEX IF NOT EXISTS idx_billing_history_user_id ON billing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_subscription_id ON billing_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_payment_date ON billing_history(payment_date);

CREATE INDEX IF NOT EXISTS idx_invoice_history_user_id ON invoice_history(user_id);
CREATE INDEX IF NOT EXISTS idx_invoice_history_subscription_id ON invoice_history(subscription_id);

-- Create indexes on assessment_users if table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'assessment_users') THEN
        CREATE INDEX IF NOT EXISTS idx_assessment_users_subscription_id ON assessment_users(subscription_id);
        CREATE INDEX IF NOT EXISTS idx_assessment_users_dodo_customer_id ON assessment_users(dodo_customer_id);
        CREATE INDEX IF NOT EXISTS idx_assessment_users_subscription_status ON assessment_users(subscription_status);
        CREATE INDEX IF NOT EXISTS idx_assessment_users_email_lower ON assessment_users(LOWER(email));
    END IF;
END $$;

-- 7. Create updated_at trigger function
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Apply updated_at trigger to relevant tables
DROP TRIGGER IF EXISTS set_timestamp_dodo_webhook_events ON dodo_webhook_events;
CREATE TRIGGER set_timestamp_dodo_webhook_events
    BEFORE UPDATE ON dodo_webhook_events
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- 9. Function to automatically clean up old webhook events
CREATE OR REPLACE FUNCTION cleanup_old_webhook_events(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM dodo_webhook_events 
    WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep
    AND processed = TRUE;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 10. Function to get user subscription status
CREATE OR REPLACE FUNCTION get_user_subscription_status(user_uid UUID)
RETURNS TABLE (
    has_active_subscription BOOLEAN,
    subscription_id VARCHAR,
    plan_type VARCHAR,
    status VARCHAR,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- Check if assessment_users table exists
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'assessment_users') THEN
        RETURN QUERY
        SELECT 
            CASE 
                WHEN u.subscription_status IN ('active', 'trialing') 
                     AND (u.current_period_end IS NULL OR u.current_period_end > NOW()) 
                THEN TRUE 
                ELSE FALSE 
            END as has_active_subscription,
            u.subscription_id,
            u.plan_type,
            u.subscription_status,
            u.current_period_end,
            u.cancelled_at
        FROM assessment_users u
        WHERE u.uid = user_uid;
    ELSE
        -- Return empty result if table doesn't exist
        RETURN;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 11. Function to get billing history for a user
CREATE OR REPLACE FUNCTION get_user_billing_history(user_uid UUID, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    id UUID,
    amount_cents INTEGER,
    currency VARCHAR,
    status VARCHAR,
    payment_date TIMESTAMP WITH TIME ZONE,
    payment_method_type VARCHAR,
    failure_reason TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bh.id,
        bh.amount_cents,
        bh.currency,
        bh.status,
        bh.payment_date,
        bh.payment_method_type,
        bh.failure_reason
    FROM billing_history bh
    WHERE bh.user_id = user_uid
    ORDER BY bh.payment_date DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 12. View for webhook processing statistics
CREATE OR REPLACE VIEW webhook_processing_stats AS
SELECT 
    event_type,
    COUNT(*) as total_events,
    COUNT(CASE WHEN processed = TRUE THEN 1 END) as processed_events,
    COUNT(CASE WHEN processed = FALSE THEN 1 END) as failed_events,
    AVG(CASE WHEN processed = TRUE THEN retry_count END) as avg_retries,
    MIN(created_at) as first_event,
    MAX(created_at) as last_event
FROM dodo_webhook_events 
GROUP BY event_type;

-- 13. Row Level Security (RLS) policies
ALTER TABLE dodo_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_history ENABLE ROW LEVEL SECURITY;

-- Policy for webhook events (admin access only)
CREATE POLICY "Admin access to webhook events" ON dodo_webhook_events
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Policy for billing history (users can see their own)
CREATE POLICY "Users can view own billing history" ON billing_history
    FOR SELECT USING (user_id = auth.uid());

-- Policy for invoice history (users can see their own)
CREATE POLICY "Users can view own invoice history" ON invoice_history
    FOR SELECT USING (user_id = auth.uid());

-- 14. Insert sample webhook event types for reference (for testing)
INSERT INTO dodo_webhook_events (id, event_type, dodo_event_id, processed, payload, created_at)
VALUES 
    (uuid_generate_v4(), 'subscription.created', 'sample_sub_created', TRUE, '{"sample": true}', NOW()),
    (uuid_generate_v4(), 'payment.succeeded', 'sample_payment_success', TRUE, '{"sample": true}', NOW())
ON CONFLICT (dodo_event_id) DO NOTHING;

-- 15. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 16. Create maintenance job function (for scheduled cleanup)
CREATE OR REPLACE FUNCTION run_webhook_maintenance()
RETURNS TEXT AS $$
DECLARE
    deleted_webhooks INTEGER;
    processed_orphans INTEGER;
    result_text TEXT;
BEGIN
    -- Clean up old processed webhooks
    SELECT cleanup_old_webhook_events(30) INTO deleted_webhooks;
    
    -- Clean up old processed orphaned webhooks
    DELETE FROM orphaned_webhooks 
    WHERE processed_at IS NOT NULL 
    AND processed_at < NOW() - INTERVAL '7 days';
    
    GET DIAGNOSTICS processed_orphans = ROW_COUNT;
    
    result_text := format('Maintenance completed: %s old webhooks deleted, %s orphaned webhooks cleaned up', 
                         deleted_webhooks, processed_orphans);
    
    RETURN result_text;
END;
$$ LANGUAGE plpgsql;

-- Success message
SELECT 'Dodo Payments webhook schema created successfully!' as result;