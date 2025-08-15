# Backend Setup Instructions

## Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=https://kvuzryhwszngcddetala.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2dXpyeWh3c3puZ2NkZGV0YWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjM0MTYsImV4cCI6MjA3MDczOTQxNn0.GqkJ8fIQ3vJMbnBtYs6y9oiXHDMOqsA2aZHC01MR8Og

# DeepSeek API Configuration
DEEPSEEK_API_KEY=your_actual_deepseek_api_key_here
DEEPSEEK_ENDPOINT=https://api.deepseek.com/v1/chat/completions

# Qwen API Configuration  
QWEN_API_KEY=your_actual_qwen_api_key_here
QWEN_ENDPOINT=https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation

# PayU Configuration (optional for payment features)
PAYU_CLIENT_ID=1b2ae685415b08874b4924b352d69bdfb9dfb01fc15cdb963923411fc1c4aa9f
PAYU_CLIENT_SECRET=changeme
PAYU_MERCHANT_KEY=7HvROB
PAYU_NOTIFY_URL=https://yourdomain.com/api/payment/webhook
```

## Getting API Keys

### DeepSeek API
1. Go to https://platform.deepseek.com/
2. Sign up for an account
3. Get your API key from the dashboard
4. Replace `your_actual_deepseek_api_key_here` with your real API key

### Qwen API (Optional - for file processing)
1. Go to https://dashscope.aliyun.com/
2. Sign up for an account
3. Get your API key from the dashboard
4. Replace `your_actual_qwen_api_key_here` with your real API key

## Running the Backend

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Start the server:
```bash
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 5000
```

## Testing

Once the backend is running, you can test it by visiting:
- http://localhost:5000/api/test - Should return "Backend is working!" and "supabase_connected": true
- http://localhost:5000/api/hello - Should return "Hello from FastAPI!"

## Database Setup

This application now uses Supabase instead of Firebase. You need to:

1. Run the SQL schema in your Supabase dashboard (see `supabase_schema.sql`)
2. Ensure the environment variables are set correctly
3. The Supabase URL and key are already configured for the provided project

## Troubleshooting

### "DeepSeek API key not configured" Error
- Make sure you have created the `.env` file
- Make sure you have replaced the placeholder API key with your actual API key
- Restart the server after making changes to the `.env` file

### "DeepSeek API authentication failed" Error
- Check that your API key is correct
- Make sure your DeepSeek account has sufficient credits
- Verify the API endpoint is correct

### Supabase Connection Issues
- Verify the SUPABASE_URL and SUPABASE_KEY are correct in your `.env` file
- Check that the database schema has been created (run `supabase_schema.sql`)
- Ensure your Supabase project is active and accessible 