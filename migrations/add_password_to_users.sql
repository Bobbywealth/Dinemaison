-- Migration: Add password field to users table
-- This migration adds password authentication support

-- Add password column (nullable initially to allow existing users)
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Make email required
ALTER TABLE users ALTER COLUMN email SET NOT NULL;

-- Add unique constraint on email if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_email_unique'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
    END IF;
END $$;

-- Note: Existing users will need to reset their password or be migrated separately
-- New users will have password set during signup




