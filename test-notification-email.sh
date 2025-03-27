#!/bin/bash

# Check if email parameter is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <recipient-email>"
  echo "Example: $0 admin@example.com"
  exit 1
fi

EMAIL=$1
FUNCTION_URL="http://localhost:54321/functions/v1/send-email-notification"

echo "====================================================="
echo "Testing admin notification email with Supabase Edge Function"
echo "====================================================="
echo "Sending test email to: $EMAIL"
echo "Function URL: $FUNCTION_URL"
echo "====================================================="

# Create JSON payload for the request
JSON_PAYLOAD=$(cat <<EOF
{
  "to": "$EMAIL",
  "subject": "TEST - Nouvelle commande de devise #TEST123",
  "order_data": {
    "order_id": "TEST123",
    "first_name": "Jean",
    "last_name": "Dupont",
    "email": "client@example.com",
    "phone": "+33 6 12 34 56 78",
    "operation_type": "Achat",
    "from_amount": "100",
    "from_currency": "EUR",
    "to_amount": "110",
    "to_currency": "USD",
    "taux": "1.10",
    "remarques": "Ceci est un test de l'email administratif"
  }
}
EOF
)

# Send the request
curl -X POST \
  -H "Content-Type: application/json" \
  -d "$JSON_PAYLOAD" \
  "$FUNCTION_URL"

echo ""
echo "====================================================="
echo "Request sent. Check your email at: $EMAIL"
echo "====================================================="
