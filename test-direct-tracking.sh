#!/bin/bash

# Get the completed order ID to test with
echo "Fetching a completed order to use for testing..."
ORDER_ID=$(supabase db query 'SELECT order_id FROM orders WHERE status = '"'"'completed'"'"' AND satisfaction_email_sent = false LIMIT 1;' --csv -q | tail -n 1)

if [ -z "$ORDER_ID" ]; then
  echo "No completed orders found with satisfaction_email_sent = false."
  echo "Creating a test order for demonstration..."
  
  # Create a test order with satisfaction_email_sent = false
  TEST_ORDER_ID="TEST-$(date +%s)"
  supabase db query "
    INSERT INTO orders (
      order_id, first_name, last_name, email, phone, 
      operation_type, delivery_method, from_currency, to_currency,
      from_amount, to_amount, status, satisfaction_email_sent
    ) VALUES (
      '$TEST_ORDER_ID', 'Test', 'User', 'your-email@example.com', '+33612345678',
      'Achat', 'Retrait en agence', 'EUR', 'USD',
      100.00, 110.00, 'completed', false
    );
  "
  
  ORDER_ID=$TEST_ORDER_ID
  echo "Created test order: $ORDER_ID"
else
  echo "Found existing order: $ORDER_ID"
fi

# Now run the test with this order ID
echo "Testing satisfaction email for order: $ORDER_ID"
echo "Running in test mode (no emails will be sent)"

# Create a test configuration
TEST_CONFIG="/tmp/test-satisfaction-config.json"
cat > $TEST_CONFIG << EOF
{
  "order_id": "$ORDER_ID",
  "test_mode": true
}
EOF

# Get the Supabase project URL
PROJECT_URL=$(supabase status --output json | jq -r '.api_url' | sed 's|http://||')

# Call the function directly using curl
echo "Calling function at: http://$PROJECT_URL/functions/v1/send-satisfaction-emails"

curl -X POST \
  -H "Content-Type: application/json" \
  -d @$TEST_CONFIG \
  "http://$PROJECT_URL/functions/v1/send-satisfaction-emails"

rm $TEST_CONFIG

echo ""
echo "====================================================="
echo "Test complete. Check the output above for results."
echo "====================================================="
