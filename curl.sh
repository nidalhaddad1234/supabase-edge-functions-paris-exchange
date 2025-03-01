#!/bin/bash

# Supabase URL and anon key
SUPABASE_URL="https://aipeozkfsbehyzdexmpk.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpcGVvemtmc2JlaHl6ZGV4bXBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4MTEyOTgsImV4cCI6MjA1MzM4NzI5OH0.9QA9ZlNKdI0er_n2mmB2oQHHLqN_zxlnnZxSUhczgwc"

# Edge function endpoint
FUNCTION_ENDPOINT="${SUPABASE_URL}/functions/v1/send-email-notification"

# Create sample JSON payload
PAYLOAD='{
  "to": "haddad.nidal1@gmail.com",
  "subject": "Test Email from Curl",
  "order_data": {
    "order_id": "test-123",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "+33123456789",
    "from_currency": "USD",
    "to_currency": "EUR",
    "from_amount": 100.00,
    "to_amount": 85.23,
    "operation_type": "buy",
    "delivery_method": "retrait"
  }
}'

# Execute curl command
echo "Sending test request to ${FUNCTION_ENDPOINT}..."
curl -v -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -d "${PAYLOAD}" \
  "${FUNCTION_ENDPOINT}"

echo
echo "Request completed."
