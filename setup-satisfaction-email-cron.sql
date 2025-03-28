-- First, create a table to store email tracking information if it doesn't exist
CREATE TABLE IF NOT EXISTS public.email_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracking_id TEXT NOT NULL UNIQUE,
    order_id TEXT NOT NULL,
    email_type TEXT NOT NULL,
    recipient TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL,
    opens INTEGER NOT NULL DEFAULT 0,
    clicks INTEGER NOT NULL DEFAULT 0,
    rating SMALLINT NULL,
    last_open_at TIMESTAMPTZ NULL,
    last_click_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add comment to the table
COMMENT ON TABLE public.email_tracking IS 'Tracks email delivery, opens, clicks, and satisfaction ratings';

-- Create an index on tracking_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_email_tracking_tracking_id ON public.email_tracking(tracking_id);

-- Create an index on order_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_email_tracking_order_id ON public.email_tracking(order_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at column
DROP TRIGGER IF EXISTS set_updated_at ON public.email_tracking;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.email_tracking
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Add a new cron job that will run every day at 8:00 PM Paris time (UTC+2 during summer, UTC+1 during winter)
-- We'll use 18:00 UTC which will be 20:00 in Paris during summer time (most of the year)
SELECT cron.schedule(
    'daily-satisfaction-emails',  -- job name
    '0 18 * * *',  -- job schedule (every day at 18:00 UTC / 20:00 Paris time)
    $$
    -- Make an HTTP request to the edge function
    SELECT
      net.http_post(
          url:='https://' || (SELECT value FROM secrets.secret WHERE name = 'project_ref') || '.supabase.co/functions/v1/send-satisfaction-emails',
          headers:=jsonb_build_object(
              'Content-Type', 'application/json',
              'Authorization', 'Bearer ' || (SELECT value FROM secrets.secret WHERE name = 'anon_key')
          ),
          body:=jsonb_build_object(
              'batch_size', 50,  -- Process up to 50 orders at a time
              'test_mode', false  -- Set to true for testing, false for production
          ),
          timeout_milliseconds:=30000  -- 30 second timeout
      );
    $$
);
