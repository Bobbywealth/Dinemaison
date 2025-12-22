-- Migration: Add AI concierge/support conversations
-- Created: 2025-12-18

CREATE TABLE IF NOT EXISTS ai_conversations (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR,
  kind VARCHAR NOT NULL DEFAULT 'support',
  status VARCHAR NOT NULL DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_ai_conversations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS ai_conversations_user_id_idx ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS ai_conversations_kind_idx ON ai_conversations(kind);

CREATE TABLE IF NOT EXISTS ai_messages (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id VARCHAR NOT NULL,
  role VARCHAR NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_ai_messages_conversation FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ai_messages_conversation_idx ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS ai_messages_role_idx ON ai_messages(role);

COMMENT ON TABLE ai_conversations IS 'AI concierge/support conversations';
COMMENT ON COLUMN ai_conversations.kind IS 'concierge | support';
COMMENT ON COLUMN ai_conversations.status IS 'open | closed';
COMMENT ON TABLE ai_messages IS 'Messages exchanged with AI';
COMMENT ON COLUMN ai_messages.role IS 'user | assistant | system';


