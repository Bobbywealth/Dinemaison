-- Migration: Add comprehensive notification system tables
-- Created: 2025-12-18

-- ============== NOTIFICATIONS TABLE ==============
-- Stores all notification records with metadata
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL,
  type VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  category VARCHAR DEFAULT 'system',
  priority VARCHAR DEFAULT 'normal',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at);
CREATE INDEX IF NOT EXISTS notifications_type_idx ON notifications(type);

-- ============== NOTIFICATION PREFERENCES TABLE ==============
-- User preferences for notification delivery per type and channel
CREATE TABLE IF NOT EXISTS notification_preferences (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL,
  notification_type VARCHAR NOT NULL,
  channel_push BOOLEAN DEFAULT true,
  channel_email BOOLEAN DEFAULT true,
  channel_sms BOOLEAN DEFAULT false,
  channel_in_app BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notification_preferences_user_id_idx ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS notification_preferences_user_type_idx ON notification_preferences(user_id, notification_type);

-- Create unique constraint to prevent duplicate preferences
CREATE UNIQUE INDEX IF NOT EXISTS notification_preferences_unique_idx ON notification_preferences(user_id, notification_type);

-- ============== DEVICE TOKENS TABLE ==============
-- Mobile and web device tokens for push notifications
CREATE TABLE IF NOT EXISTS device_tokens (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL,
  platform VARCHAR NOT NULL,
  token TEXT NOT NULL,
  device_id VARCHAR,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS device_tokens_user_id_idx ON device_tokens(user_id);
CREATE INDEX IF NOT EXISTS device_tokens_token_idx ON device_tokens(token);
CREATE INDEX IF NOT EXISTS device_tokens_platform_idx ON device_tokens(platform);

-- Create unique constraint for tokens
CREATE UNIQUE INDEX IF NOT EXISTS device_tokens_token_unique_idx ON device_tokens(token);

-- ============== NOTIFICATION DELIVERY LOG TABLE ==============
-- Track notification delivery status across channels
CREATE TABLE IF NOT EXISTS notification_delivery_log (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id VARCHAR,
  channel VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'pending',
  error_message TEXT,
  sent_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notification_delivery_log_notification_id_idx ON notification_delivery_log(notification_id);
CREATE INDEX IF NOT EXISTS notification_delivery_log_channel_idx ON notification_delivery_log(channel);
CREATE INDEX IF NOT EXISTS notification_delivery_log_status_idx ON notification_delivery_log(status);

-- ============== UPDATE USERS TABLE ==============
-- Add phone number and notification preferences columns if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone_number') THEN
    ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone_verified') THEN
    ALTER TABLE users ADD COLUMN phone_verified BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'notifications_enabled') THEN
    ALTER TABLE users ADD COLUMN notifications_enabled BOOLEAN DEFAULT true;
  END IF;
END $$;

-- ============== COMMENTS ==============
COMMENT ON TABLE notifications IS 'Core notification records for in-app display';
COMMENT ON TABLE notification_preferences IS 'User preferences for notification delivery channels';
COMMENT ON TABLE device_tokens IS 'Mobile and web device tokens for push notifications';
COMMENT ON TABLE notification_delivery_log IS 'Audit log for notification delivery attempts';

COMMENT ON COLUMN notifications.type IS 'Notification type: booking_requested, booking_confirmed, etc.';
COMMENT ON COLUMN notifications.category IS 'Category: booking, payment, message, system';
COMMENT ON COLUMN notifications.priority IS 'Priority: low, normal, high, urgent';
COMMENT ON COLUMN device_tokens.platform IS 'Platform: ios, android, web';
COMMENT ON COLUMN notification_delivery_log.channel IS 'Channel: push, email, sms, websocket, in_app';
COMMENT ON COLUMN notification_delivery_log.status IS 'Status: pending, sent, failed, delivered';

