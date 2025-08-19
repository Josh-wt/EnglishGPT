-- Dodo Payments Integration Database Schema
-- Run this in your Supabase SQL Editor to add subscription management

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add subscription-related columns to existing assessment_users table
ALTER TABLE assessment_users 
ADD COLUMN IF NOT EXISTS dodo_customer_id text,
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_start_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS subscription_end_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS trial_end_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean DEFAULT false;

-- Create index on dodo_customer_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_assessment_users_dodo_customer_id ON assessment_users(dodo_customer_id);

-- Subscriptions table for managing Dodo Payments subscriptions
CREATE TABLE IF NOT EXISTS dodo_subscriptions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id text NOT NULL REFERENCES assessment_users(uid) ON DELETE CASCADE,
  dodo_subscription_id text UNIQUE NOT NULL,
  dodo_product_id text NOT NULL,
  dodo_customer_id text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'on_hold', 'failed', 'trialing')),
  plan_type text NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
  current_period_start timestamp with time zone NOT NULL,
  current_period_end timestamp with time zone NOT NULL,
  cancel_at_period_end boolean DEFAULT false,
  cancelled_at timestamp with time zone,
  trial_start timestamp with time zone,
  trial_end timestamp with time zone,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_dodo_subscriptions_user_id ON dodo_subscriptions(user_id);
CREATE INDEX idx_dodo_subscriptions_dodo_subscription_id ON dodo_subscriptions(dodo_subscription_id);
CREATE INDEX idx_dodo_subscriptions_status ON dodo_subscriptions(status);
CREATE INDEX idx_dodo_subscriptions_current_period_end ON dodo_subscriptions(current_period_end);

-- Payments table for tracking individual payments
CREATE TABLE IF NOT EXISTS dodo_payments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  subscription_id uuid REFERENCES dodo_subscriptions(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES assessment_users(uid) ON DELETE CASCADE,
  dodo_payment_id text UNIQUE NOT NULL,
  dodo_invoice_id text,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL CHECK (status IN ('succeeded', 'failed', 'processing', 'cancelled', 'refunded')),
  payment_method_type text,
  failure_reason text,
  refund_amount_cents integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes for payments
CREATE INDEX idx_dodo_payments_subscription_id ON dodo_payments(subscription_id);
CREATE INDEX idx_dodo_payments_user_id ON dodo_payments(user_id);
CREATE INDEX idx_dodo_payments_dodo_payment_id ON dodo_payments(dodo_payment_id);
CREATE INDEX idx_dodo_payments_status ON dodo_payments(status);
CREATE INDEX idx_dodo_payments_created_at ON dodo_payments(created_at DESC);

-- Webhook events table for audit trail and debugging
CREATE TABLE IF NOT EXISTS dodo_webhook_events (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_type text NOT NULL,
  dodo_event_id text UNIQUE NOT NULL,
  processed boolean DEFAULT false,
  payload jsonb NOT NULL,
  processed_at timestamp with time zone,
  error_message text,
  retry_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Create indexes for webhook events
CREATE INDEX idx_dodo_webhook_events_event_type ON dodo_webhook_events(event_type);
CREATE INDEX idx_dodo_webhook_events_dodo_event_id ON dodo_webhook_events(dodo_event_id);
CREATE INDEX idx_dodo_webhook_events_processed ON dodo_webhook_events(processed);
CREATE INDEX idx_dodo_webhook_events_created_at ON dodo_webhook_events(created_at DESC);

-- Customer portal sessions for managing payment methods
CREATE TABLE IF NOT EXISTS dodo_customer_portal_sessions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id text NOT NULL REFERENCES assessment_users(uid) ON DELETE CASCADE,
  dodo_session_id text UNIQUE NOT NULL,
  session_url text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Create indexes for portal sessions
CREATE INDEX idx_dodo_portal_sessions_user_id ON dodo_customer_portal_sessions(user_id);
CREATE INDEX idx_dodo_portal_sessions_expires_at ON dodo_customer_portal_sessions(expires_at);

-- Update trigger for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_dodo_subscriptions_updated_at BEFORE UPDATE ON dodo_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dodo_payments_updated_at BEFORE UPDATE ON dodo_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE dodo_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dodo_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE dodo_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE dodo_customer_portal_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON dodo_subscriptions
  FOR SELECT USING (auth.uid()::text = user_id);

-- Users can view their own payments
CREATE POLICY "Users can view own payments" ON dodo_payments
  FOR SELECT USING (auth.uid()::text = user_id);

-- Users can view their own portal sessions
CREATE POLICY "Users can view own portal sessions" ON dodo_customer_portal_sessions
  FOR SELECT USING (auth.uid()::text = user_id);

-- Service role can do everything (for backend operations)
CREATE POLICY "Service role full access dodo_subscriptions" ON dodo_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access dodo_payments" ON dodo_payments
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access dodo_webhook_events" ON dodo_webhook_events
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access dodo_portal_sessions" ON dodo_customer_portal_sessions
  FOR ALL USING (auth.role() = 'service_role');

-- Function to get user's active subscription
CREATE OR REPLACE FUNCTION get_user_active_subscription(user_uid text)
RETURNS TABLE (
  subscription_id uuid,
  plan_type text,
  status text,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean,
  trial_end timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ds.id,
    ds.plan_type,
    ds.status,
    ds.current_period_end,
    ds.cancel_at_period_end,
    ds.trial_end
  FROM dodo_subscriptions ds
  WHERE ds.user_id = user_uid 
    AND ds.status IN ('active', 'trialing')
  ORDER BY ds.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has active subscription
CREATE OR REPLACE FUNCTION user_has_active_subscription(user_uid text)
RETURNS boolean AS $$
DECLARE
  has_subscription boolean := false;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM dodo_subscriptions 
    WHERE user_id = user_uid 
      AND status IN ('active', 'trialing')
      AND current_period_end > now()
  ) INTO has_subscription;
  
  RETURN has_subscription;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to sync user subscription status
CREATE OR REPLACE FUNCTION sync_user_subscription_status(user_uid text)
RETURNS void AS $$
DECLARE
  subscription_record RECORD;
  new_status text := 'free';
  new_tier text := 'free';
BEGIN
  -- Get the most recent active subscription
  SELECT * INTO subscription_record
  FROM dodo_subscriptions 
  WHERE user_id = user_uid 
    AND status IN ('active', 'trialing')
  ORDER BY created_at DESC 
  LIMIT 1;
  
  IF subscription_record IS NOT NULL THEN
    -- Check if subscription is still valid
    IF subscription_record.current_period_end > now() THEN
      new_status := subscription_record.status;
      new_tier := 'unlimited';
    END IF;
  END IF;
  
  -- Update user's subscription status
  UPDATE assessment_users 
  SET 
    subscription_status = new_status,
    subscription_tier = new_tier,
    current_plan = new_tier,
    updated_at = now()
  WHERE uid = user_uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
