-- Add push subscriptions table for PWA notifications
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS push_subscriptions_user_id_idx ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS push_subscriptions_endpoint_idx ON push_subscriptions(endpoint);

-- Ensure no duplicate subscriptions per user
CREATE UNIQUE INDEX IF NOT EXISTS push_subscriptions_user_endpoint_idx ON push_subscriptions(user_id, endpoint);



