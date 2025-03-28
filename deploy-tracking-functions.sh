#!/bin/bash

# This script deploys the satisfaction email and tracking functions
# Usage: ./deploy-tracking-functions.sh "https://g.page/r/YOUR-GOOGLE-BUSINESS-ID/review"

# Check if Google Review URL is provided
if [ -z "$1" ]; then
  echo "Error: Google Review URL is required"
  echo "Usage: ./deploy-tracking-functions.sh \"https://g.page/r/YOUR-GOOGLE-BUSINESS-ID/review\""
  exit 1
fi

# Set Google Review URL from argument
GOOGLE_REVIEW_URL="$1"

# Navigate to the project root
cd "$(dirname "$0")"

# Set environment variables
echo "Setting environment variables..."
supabase secrets set GOOGLE_REVIEW_URL="$GOOGLE_REVIEW_URL"

# Deploy the functions
echo "Deploying satisfaction email function..."
supabase functions deploy send-satisfaction-emails

echo "Deploying email tracking function..."
supabase functions deploy email-tracking

echo "Deployment completed successfully!"
echo "Functions deployed:"
echo "- send-satisfaction-emails"
echo "- email-tracking"
echo ""
echo "Google Review URL set to: $GOOGLE_REVIEW_URL"
