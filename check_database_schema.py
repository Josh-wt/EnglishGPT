#!/usr/bin/env python3
"""
Script to check and fix database schema for billing tables
"""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client
import json

# Load environment variables
load_dotenv('/opt/englishgpt/backend/.env')

# Initialize Supabase client
SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://zwrwtqspeyajttnuzwkl.supabase.co')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY') or os.environ.get('SUPABASE_KEY')

if not SUPABASE_KEY:
    print("ERROR: SUPABASE_SERVICE_ROLE_KEY not found in environment")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def check_table_exists(table_name):
    """Check if a table exists"""
    try:
        # Try to select from the table with limit 0
        response = supabase.table(table_name).select('*').limit(0).execute()
        return True
    except Exception as e:
        print(f"Table '{table_name}' check failed: {e}")
        return False

def check_dodo_payments_table():
    """Check and potentially create the dodo_payments table"""
    print("\n=== Checking dodo_payments table ===")
    
    if not check_table_exists('dodo_payments'):
        print("Table 'dodo_payments' does not exist!")
        print("\nTo create it, run this SQL in Supabase:")
        print("""
CREATE TABLE IF NOT EXISTS dodo_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES assessment_users(uid),
    dodo_payment_id VARCHAR(255) UNIQUE NOT NULL,
    dodo_subscription_id VARCHAR(255),
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL,
    payment_method_type VARCHAR(50),
    failure_reason TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dodo_payments_user_id ON dodo_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_dodo_payments_created_at ON dodo_payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dodo_payments_status ON dodo_payments(status);
        """)
        return False
    
    # Check for sample data
    try:
        response = supabase.table('dodo_payments').select('*').limit(5).execute()
        print(f"Table exists with {len(response.data)} sample records")
        
        if response.data:
            print("\nSample record structure:")
            print(json.dumps(response.data[0], indent=2, default=str))
        else:
            print("No payment records found in the table")
            
    except Exception as e:
        print(f"Error querying dodo_payments: {e}")
    
    return True

def check_dodo_subscriptions_table():
    """Check the dodo_subscriptions table"""
    print("\n=== Checking dodo_subscriptions table ===")
    
    if not check_table_exists('dodo_subscriptions'):
        print("Table 'dodo_subscriptions' does not exist!")
        print("\nTo create it, run this SQL in Supabase:")
        print("""
CREATE TABLE IF NOT EXISTS dodo_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES assessment_users(uid),
    dodo_subscription_id VARCHAR(255) UNIQUE NOT NULL,
    dodo_customer_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    plan_type VARCHAR(100),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    next_billing_date TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_dodo_subscriptions_user_id ON dodo_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_dodo_subscriptions_status ON dodo_subscriptions(status);
        """)
        return False
    
    # Check for sample data
    try:
        response = supabase.table('dodo_subscriptions').select('*').limit(5).execute()
        print(f"Table exists with {len(response.data)} sample records")
        
        if response.data:
            print("\nSample record structure:")
            print(json.dumps(response.data[0], indent=2, default=str))
        else:
            print("No subscription records found in the table")
            
    except Exception as e:
        print(f"Error querying dodo_subscriptions: {e}")
    
    return True

def check_user_data(user_id):
    """Check specific user's subscription data"""
    print(f"\n=== Checking data for user {user_id} ===")
    
    # Check user record
    try:
        user_response = supabase.table('assessment_users').select('*').eq('uid', user_id).execute()
        if user_response.data:
            user = user_response.data[0]
            print(f"User found: {user.get('email', 'No email')}")
            print(f"Current plan: {user.get('current_plan', 'Not set')}")
            print(f"Subscription status: {user.get('subscription_status', 'Not set')}")
            print(f"Dodo customer ID: {user.get('dodo_customer_id', 'Not set')}")
        else:
            print("User not found!")
            return
    except Exception as e:
        print(f"Error fetching user: {e}")
        return
    
    # Check subscriptions
    try:
        sub_response = supabase.table('dodo_subscriptions').select('*').eq('user_id', user_id).execute()
        print(f"\nSubscriptions found: {len(sub_response.data)}")
        for sub in sub_response.data:
            print(f"  - ID: {sub.get('dodo_subscription_id')}, Status: {sub.get('status')}")
    except Exception as e:
        print(f"Error fetching subscriptions: {e}")
    
    # Check payments
    try:
        pay_response = supabase.table('dodo_payments').select('*').eq('user_id', user_id).limit(5).execute()
        print(f"\nPayments found: {len(pay_response.data)}")
        for payment in pay_response.data:
            print(f"  - Amount: {payment.get('amount_cents')}, Status: {payment.get('status')}, Date: {payment.get('created_at')}")
    except Exception as e:
        print(f"Error fetching payments: {e}")

def main():
    print("=" * 60)
    print("Database Schema Check")
    print("=" * 60)
    
    # Check tables
    payments_ok = check_dodo_payments_table()
    subscriptions_ok = check_dodo_subscriptions_table()
    
    # Check specific user data
    user_id = "df3831b0-ff4b-40b9-b296-373eccc272bf"
    check_user_data(user_id)
    
    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    
    if not payments_ok or not subscriptions_ok:
        print("\n⚠️  Database schema issues detected!")
        print("Please create the missing tables using the SQL provided above.")
    else:
        print("\n✓ Database schema looks correct")
        print("\nIf billing history is still failing, check:")
        print("1. The API logs for specific error messages")
        print("2. Whether the user has any payment records")
        print("3. Network connectivity to Supabase")

if __name__ == "__main__":
    main()