#!/bin/bash

# Display header
echo "====================================================="
echo "Paris Exchange Email Functions Deployment Script"
echo "====================================================="

# Check if project is linked
if ! supabase status >/dev/null 2>&1; then
  echo "Project is not linked to Supabase. Attempting to link..."
  
  # Prompt for project reference
  read -p "Enter your Supabase project reference: " PROJECT_REF
  
  # Link the project
  supabase link --project-ref "$PROJECT_REF"
  
  if [ $? -ne 0 ]; then
    echo "Failed to link project. Please run 'supabase link' manually."
    exit 1
  fi
  
  echo "Project linked successfully."
fi

# Set environment variables
echo "Setting environment variables..."
WEBSITE_URL=${1:-"http://localhost:3000"}
echo "Using WEBSITE_URL: $WEBSITE_URL"

# Set secrets
supabase secrets set WEBSITE_URL="$WEBSITE_URL"

# Deploy functions
echo "Deploying email functions..."
supabase functions deploy handle-order-confirmed-email
supabase functions deploy send-email-notification

echo "====================================================="
echo "Deployment complete! Functions are ready to use."
echo "====================================================="
