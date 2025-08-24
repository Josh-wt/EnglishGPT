# Subscription Endpoints Documentation

## Overview
This document describes the Dodo Payments subscription endpoints added to the FastAPI backend.

## Endpoints

### 1. Create Subscription Checkout
**Endpoint:** `POST /api/subscriptions/create`

Creates a Dodo Payments checkout session for subscription.

**Request Body:**
```json
{
  "plan": "monthly",  // or "yearly"
  "user_id": "08ac58a5-0cfe-4f69-a4d1-e50d9d9b678e",
  "success_url": "https://example.com/success",  // optional
  "cancel_url": "https://example.com/cancel"     // optional
}
```

**Response:**
```json
{
  "success": true,
  "checkout_url": "https://checkout.dodopayments.com/...",
  "session_id": "cs_...",
  "message": "Checkout session created successfully",
  "error": null
}
```

### 2. Get Subscription Status
**Endpoint:** `GET /api/subscriptions/status/{user_id}`

Returns detailed subscription information for a user.

**Response:**
```json
{
  "has_active_subscription": true,
  "subscription_status": "active",
  "current_plan": "monthly",
  "subscription_start_date": "2024-01-01T00:00:00",
  "subscription_end_date": "2024-02-01T00:00:00",
  "subscription_type": "recurring",
  "dodo_customer_id": "cus_...",
  "cancel_at_period_end": false
}
```

### 3. Subscription Actions
**Endpoint:** `POST /api/subscriptions/action`

Perform actions on subscriptions (cancel, reactivate).

**Request Body:**
```json
{
  "user_id": "08ac58a5-0cfe-4f69-a4d1-e50d9d9b678e",
  "action": "cancel"  // or "reactivate"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription cancelled successfully"
}
```

### 4. Get Subscription Plans
**Endpoint:** `GET /api/subscriptions/plans`

Returns available subscription plans with pricing.

**Response:**
```json
{
  "plans": [
    {
      "id": "monthly",
      "name": "Monthly Plan",
      "price": 4.99,
      "currency": "USD",
      "interval": "month",
      "product_id": "pdt_...",
      "features": [
        "Unlimited assessments",
        "Advanced analytics",
        "Priority support",
        "Export results"
      ]
    },
    {
      "id": "yearly",
      "name": "Yearly Plan",
      "price": 49.00,
      "currency": "USD",
      "interval": "year",
      "product_id": "pdt_...",
      "features": [
        "Unlimited assessments",
        "Advanced analytics",
        "Priority support",
        "Export results",
        "Save 17% annually"
      ],
      "popular": true
    }
  ]
}
```

## Environment Variables

The following environment variables must be configured in `/backend/.env`:

```bash
# Dodo Payments Configuration
DODO_PAYMENTS_API_KEY=your_api_key_here
DODO_PAYMENTS_BASE_URL=https://test.dodopayments.com
DODO_MONTHLY_PRODUCT_ID=pdt_LOhuvCIgbeo2qflVuaAty
DODO_YEARLY_PRODUCT_ID=pdt_R9BBFdK801119u9r3r6jyL

# Redirect URLs
SUCCESS_REDIRECT_URL=https://englishgpt.everythingenglish.xyz/dashboard/payment-success
CANCEL_REDIRECT_URL=https://englishgpt.everythingenglish.xyz/pricing
```

## Testing

### Using curl
```bash
# Test subscription creation
curl -X POST https://englishgpt.everythingenglish.xyz/api/subscriptions/create \
  -H "Content-Type: application/json" \
  -d '{"plan": "monthly", "user_id": "08ac58a5-0cfe-4f69-a4d1-e50d9d9b678e"}'

# Test subscription status
curl https://englishgpt.everythingenglish.xyz/api/subscriptions/status/08ac58a5-0cfe-4f69-a4d1-e50d9d9b678e

# Test available plans
curl https://englishgpt.everythingenglish.xyz/api/subscriptions/plans
```

### Using the test script
```bash
cd /backend
chmod +x test_subscription_api.sh
./test_subscription_api.sh
```

## Implementation Details

### Customer Management
- Automatically creates Dodo customer if not exists
- Stores `dodo_customer_id` in the database for future use
- Uses user email and display name for customer creation

### Checkout Flow
1. Validates user exists in database
2. Creates/retrieves Dodo customer
3. Attempts checkout session creation via `/checkout-sessions`
4. Falls back to `/subscriptions` endpoint if needed
5. Returns checkout URL for payment

### Error Handling
- Comprehensive error logging
- Meaningful error messages
- Graceful fallback mechanisms
- HTTP status codes for different error types

## Deployment

1. Update `/backend/.env` with actual API keys
2. Restart the backend service:
   ```bash
   docker-compose restart python-backend
   ```
3. Test endpoints using the provided curl commands
4. Monitor logs for any issues:
   ```bash
   docker-compose logs -f python-backend
   ```

## Security Considerations

- API keys stored in environment variables
- Service role key used for database operations
- Input validation on all endpoints
- User authentication should be added for production

## Troubleshooting

### "Method Not Allowed" Error
- Ensure the exact path is used (e.g., `/api/subscriptions/create` not `/subscriptions/create`)
- Check that the HTTP method is correct (POST vs GET)

### "Payment system not configured" Error
- Verify `DODO_PAYMENTS_API_KEY` is set in `.env`
- Check that the `.env` file is loaded properly

### "User not found" Error
- Ensure the user_id exists in the `assessment_users` table
- Verify the UUID format is correct

### Checkout URL not returned
- Check Dodo Payments API credentials
- Verify product IDs are correct
- Review server logs for detailed error messages