#!/bin/bash

# Get the Supabase project URL
PROJECT_URL=$(supabase status --output json | jq -r '.api_url' | sed 's|http://||')

# Generate a test tracking ID
TRACKING_ID="test-$(date +%s)"

# Create a test tracking record
echo "Creating a test tracking record with ID: $TRACKING_ID"
supabase db query "
  INSERT INTO email_tracking (
    tracking_id, order_id, email_type, recipient, sent_at, opens, clicks
  ) VALUES (
    '$TRACKING_ID', 'TEST-ORDER', 'satisfaction', 'test@example.com', now(), 0, 0
  );
"

# Test open tracking
echo "Testing open tracking..."
curl -v "http://$PROJECT_URL/functions/v1/email-tracking?id=$TRACKING_ID&e=open"

# Check the record
echo "Checking the tracking record after open..."
supabase db query "SELECT * FROM email_tracking WHERE tracking_id = '$TRACKING_ID';" --output json

# Test click tracking
echo "Testing click tracking with rating 5..."
curl -v "http://$PROJECT_URL/functions/v1/email-tracking?id=$TRACKING_ID&e=click&rating=5&redirect=https://example.com" -I

# Final check of the record
echo "Checking the tracking record after click..."
supabase db query "SELECT * FROM email_tracking WHERE tracking_id = '$TRACKING_ID';" --output json

echo "====================================================="
echo "Test complete. Check the output above for results."
echo "====================================================="
