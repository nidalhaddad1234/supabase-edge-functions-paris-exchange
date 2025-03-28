# Managing Application Settings in Supabase

This document provides instructions on how to manage your application settings and environment variables that are used by your database trigger functions.

## About the New Environment Variable System

We've moved hardcoded secrets out of your database trigger functions into a secure settings table. This provides several benefits:

1. **Security:** Sensitive values are no longer directly visible in function code
2. **Maintainability:** Update values in one place without modifying function code
3. **Flexibility:** Easy to have different settings for different environments
4. **Reusability:** The same settings can be used across multiple functions

## How It Works

1. Environment variables are stored in the `app_settings` table
2. A secure function `get_setting(key)` retrieves these values
3. Database triggers use this function instead of hardcoded values
4. Row Level Security (RLS) protects the settings table

## Managing Settings via SQL

### View Current Settings

```sql
-- View all non-secret settings (if you're authenticated)
SELECT key, value, description, is_secret, updated_at 
FROM app_settings
WHERE NOT is_secret
ORDER BY key;

-- View all settings (requires service_role access)
SELECT key, value, description, is_secret, updated_at 
FROM app_settings
ORDER BY key;
```

### Add New Settings

```sql
INSERT INTO app_settings (key, value, description, is_secret)
VALUES 
    ('NEW_SETTING_NAME', 'setting-value', 'What this setting does', false)
ON CONFLICT (key) 
DO UPDATE SET 
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    is_secret = EXCLUDED.is_secret,
    updated_at = NOW();
```

### Update Existing Settings

```sql
UPDATE app_settings
SET value = 'new-value',
    updated_at = NOW()
WHERE key = 'SETTING_NAME';
```

### Delete Settings (Use with Caution)

```sql
DELETE FROM app_settings
WHERE key = 'SETTING_NAME';
```

## Currently Available Settings

| Key | Description | Is Secret |
|-----|-------------|-----------|
| SUPABASE_URL | Supabase project URL | No |
| SUPABASE_ANON_KEY | Supabase anonymous key | Yes |
| ADMIN_EMAIL | Admin email for notifications | No |

## Using Settings in New Functions

When creating new PostgreSQL functions that need to access these settings, use the following pattern:

```sql
CREATE OR REPLACE FUNCTION your_new_function()
RETURNS some_return_type
LANGUAGE plpgsql
AS $$
DECLARE
  some_setting TEXT;
BEGIN
  -- Retrieve environment variables
  some_setting := get_setting('SETTING_NAME');
  
  -- Use the setting in your function logic
  -- ...
  
  RETURN result;
END;
$$;
```

## Security Considerations

- The `app_settings` table is protected by Row Level Security (RLS)
- Regular authenticated users can only view non-secret settings
- Service role access is required to manage settings
- The `get_setting` function uses SECURITY DEFINER to safely access secrets

## Migrating Additional Hardcoded Values

If you find other hardcoded values or secrets in your codebase, follow these steps to migrate them:

1. Identify the hardcoded value
2. Add it to the `app_settings` table with an appropriate key
3. Modify the function to use `get_setting('YOUR_KEY')` instead
4. Test to ensure functionality works as expected

## Troubleshooting

If you encounter issues with settings not being found, check:

1. The exact key name (case-sensitive)
2. That the setting exists in the `app_settings` table
3. That your function has the necessary permissions to call `get_setting`
4. Database logs for specific error messages
