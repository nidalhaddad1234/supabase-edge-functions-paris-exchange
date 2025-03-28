#!/bin/bash

# This script tests the satisfaction email function with a specific order
# Usage: ./test-satisfaction-email.sh ORDER_ID

# Check if Order ID is provided
if [ -z "$1" ]; then
  echo "Error: Order ID is required"
  echo "Usage: ./test-satisfaction-email.sh ORDER_ID"
  exit 1
fi

# Set Order ID from argument
ORDER_ID="$1"

# Navigate to the project root
cd "$(dirname "$0")"

# Get the function URL
FUNCTION_URL=$(supabase functions url send-satisfaction-emails)

# Call the function with the specified order ID
echo "Sending test satisfaction email for order $ORDER_ID..."
curl -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -d "{\"order_id\": \"$ORDER_ID\", \"test_mode\": true}"

echo ""
echo "Test completed. Check the function logs for details."
