#!/bin/bash

# Check if email parameter is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <recipient-email>"
  echo "Example: $0 client@example.com"
  exit 1
fi

EMAIL=$1
FUNCTION_URL="http://localhost:54321/functions/v1/handle-order-confirmed-email"

echo "====================================================="
echo "Testing order confirmation email with Supabase Edge Function"
echo "====================================================="
echo "Sending test email to: $EMAIL"
echo "Function URL: $FUNCTION_URL"
echo "====================================================="

# Create JSON payload for the request
JSON_PAYLOAD=$(cat <<EOF
{
  "to": "$EMAIL",
  "subject": "Votre commande #TEST456 est confirmée",
  "order_data": {
    "order_id": "TEST456",
    "first_name": "Marie",
    "last_name": "Martin",
    "operation_type": "Vente",
    "from_amount": "200",
    "from_currency": "USD",
    "to_amount": "180",
    "to_currency": "EUR",
    "taux": "0.90",
    "email": "$EMAIL",
    "phone": "+33 6 98 76 54 32",
    "remarques": "Ceci est un test de l'email de confirmation"
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
