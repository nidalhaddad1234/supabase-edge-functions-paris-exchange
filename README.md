# Paris Exchange - Supabase Edge Functions

This repository contains the Supabase Edge Functions for the Paris Exchange currency exchange service. These edge functions handle various aspects of the application, including email notifications, currency data synchronization, and tracking.

## Edge Functions

The following edge functions are implemented in this project:

### 1. `get-currencies`

This function fetches currency exchange rate data from the YODA API and stores it in the Supabase database.

**Features:**
- Retrieves real-time currency exchange rates from the external YODA API
- Processes and formats the data (rounds exchange rates to 4 decimal places)
- Clears existing currency data and inserts the updated information
- Provides error handling and appropriate responses

**Environment Variables Required:**
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `YODA_API_URL`: URL for the YODA currency data API
- `YODA_API_KEY`: API key for the YODA service

### 2. `handle-order-confirmed-email`

This function sends order confirmation emails to customers when an order is confirmed.

**Features:**
- Generates personalized order confirmation emails using a template
- Includes order details, expiration times, and next steps
- Handles error cases and provides appropriate responses

**Environment Variables Required:**
- `SMTP_HOST`: Email server host address
- `SMTP_PORT`: Email server port (typically 465 for SSL)
- `SMTP_USER`: Email account username/address
- `SMTP_PASS`: Email account password
- `WEBSITE_URL`: Base URL of your website

### 3. `send-email-notification`

This function sends notification emails to administrators when a new order is placed.

**Features:**
- Sends detailed order notifications to administrators
- Includes customer and transaction information
- Provides action links for order processing

**Environment Variables Required:**
- Same SMTP variables as the `handle-order-confirmed-email` function
- `ADMIN_URL`: URL for the admin dashboard

### 4. `email-tracking`

This function tracks email opens and clicks, and stores interaction data in the Supabase database.

**Features:**
- Tracks email opens using a transparent tracking pixel
- Tracks clicks on links within emails
- Supports customer satisfaction ratings collection
- Stores all tracking data in a Supabase table

**URL Parameters:**
- `id`: The tracking ID (unique identifier for the email)
- `e`: Event type (`open` or `click`)
- `rating`: Optional parameter for customer rating (1-5)
- `redirect`: URL to redirect to after click tracking (for click events)

### 5. `send-satisfaction-emails`

This function sends follow-up satisfaction survey emails to customers after their orders are completed.

**Features:**
- Automatically sends emails to eligible customers (orders completed 1-7 days ago)
- Includes satisfaction rating system with click tracking
- Links to Google reviews for additional feedback
- Option for test mode to preview emails without sending
- Batch processing to handle large volumes efficiently

**Environment Variables Required:**
- Same SMTP variables as other email functions
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- `WEBSITE_URL`: Base URL of your website
- `GOOGLE_REVIEW_URL`: URL for your Google Business review page

## Database Triggers

The application relies on several database triggers to automate workflows:

### Order Processing Triggers

1. **`on_order_created`**: Triggers when a new order is inserted into the `orders` table
   - Sends admin notification email via the `send-email-notification` function
   - Updates order status timestamps

2. **`on_order_status_change`**: Triggers when an order's status is updated
   - If status changes to `confirmed`, sends a confirmation email to the customer
   - Records status change in the order history for tracking
   - Updates relevant timestamps

3. **`order_history_trigger`**: Maintains a history of all order status changes
   - Creates entries in the `order_status_history` table
   - Includes timestamps and user information

### Currency Update Trigger

1. **`currency_update_schedule`**: A scheduled function that runs every hour
   - Invokes the `get-currencies` edge function to refresh currency rates
   - Ensures exchange rates are always up-to-date

## Email Tracking System

The application includes a comprehensive email tracking system:

1. **Tables:**
   - `email_tracking`: Stores tracking information for all sent emails
   - Fields include tracking_id, email_type, recipient, opens, clicks, and ratings

2. **Workflow:**
   - Each outgoing email contains a unique tracking pixel and instrumented links
   - When customers open emails or click links, data is collected via the `email-tracking` function
   - Customer satisfaction ratings are recorded when provided
   - All data is available for analysis in the Supabase database

## Setting Up

1. Deploy these edge functions to your Supabase project
2. Configure the required environment variables in the Supabase dashboard
3. Set up the database tables and triggers as described above
4. Test each function to ensure proper operation

## Development

To work on these functions locally:

```bash
# Install Supabase CLI
npm install -g supabase

# Start the local development server
supabase start

# Run a specific function locally
supabase functions serve get-currencies
```
