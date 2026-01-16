-- Database Migration: User Messaging System
-- Creates tables for direct messaging between buyers and sellers with transaction history

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant1_address VARCHAR(255) NOT NULL,
  participant2_address VARCHAR(255) NOT NULL,
  participant1_blocked BOOLEAN DEFAULT FALSE,
  participant2_blocked BOOLEAN DEFAULT FALSE,
  last_message_at TIMESTAMP,
  last_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_conversation UNIQUE (participant1_address, participant2_address),
  CONSTRAINT addresses_not_equal CHECK (participant1_address != participant2_address)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_address VARCHAR(255) NOT NULL,
  recipient_address VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'sent',
  is_edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  read_at TIMESTAMP,
  edited_at TIMESTAMP,
  deleted_at TIMESTAMP,
  CONSTRAINT content_length CHECK (LENGTH(content) > 0 AND LENGTH(content) <= 5000),
  CONSTRAINT valid_status CHECK (status IN ('sent', 'delivered', 'read', 'failed'))
);

-- Message attachments table
CREATE TABLE IF NOT EXISTS message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  file_type VARCHAR(100),
  file_size BIGINT NOT NULL,
  uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- User blocks table
CREATE TABLE IF NOT EXISTS user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_address VARCHAR(255) NOT NULL,
  blocked_address VARCHAR(255) NOT NULL,
  reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_block UNIQUE (blocker_address, blocked_address),
  CONSTRAINT blocker_blocked_not_equal CHECK (blocker_address != blocked_address)
);

-- Transaction messages junction table (links transactions to messages)
CREATE TABLE IF NOT EXISTS transaction_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  transaction_hash VARCHAR(255) NOT NULL,
  nft_id VARCHAR(255) NOT NULL,
  nft_name VARCHAR(255),
  nft_image TEXT,
  transaction_type VARCHAR(50) NOT NULL,
  transaction_amount VARCHAR(100),
  transaction_date TIMESTAMP NOT NULL,
  buyer_address VARCHAR(255) NOT NULL,
  seller_address VARCHAR(255) NOT NULL,
  context TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_transaction_type CHECK (transaction_type IN ('purchase', 'sale', 'offer', 'inquiry')),
  CONSTRAINT unique_transaction_message UNIQUE (transaction_hash, conversation_id)
);

-- Message notifications table
CREATE TABLE IF NOT EXISTS message_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  sender_address VARCHAR(255) NOT NULL,
  recipient_address VARCHAR(255) NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  read_at TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_conversations_participant1 ON conversations(participant1_address);
CREATE INDEX idx_conversations_participant2 ON conversations(participant2_address);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_address ON messages(sender_address);
CREATE INDEX idx_messages_recipient_address ON messages(recipient_address);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_deleted_at ON messages(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_message_attachments_message_id ON message_attachments(message_id);
CREATE INDEX idx_user_blocks_blocker ON user_blocks(blocker_address);
CREATE INDEX idx_user_blocks_blocked ON user_blocks(blocked_address);
CREATE INDEX idx_transaction_messages_conversation_id ON transaction_messages(conversation_id);
CREATE INDEX idx_transaction_messages_transaction_hash ON transaction_messages(transaction_hash);
CREATE INDEX idx_message_notifications_recipient ON message_notifications(recipient_address);
CREATE INDEX idx_message_notifications_read ON message_notifications(read);

-- Enable RLS (Row Level Security)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY conversations_select_policy ON conversations
  FOR SELECT
  USING (
    auth.jwt() ->> 'sub' = participant1_address OR 
    auth.jwt() ->> 'sub' = participant2_address
  );

CREATE POLICY conversations_insert_policy ON conversations
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY conversations_update_policy ON conversations
  FOR UPDATE
  USING (
    auth.jwt() ->> 'sub' = participant1_address OR 
    auth.jwt() ->> 'sub' = participant2_address
  );

-- RLS Policies for messages
CREATE POLICY messages_select_policy ON messages
  FOR SELECT
  USING (
    auth.jwt() ->> 'sub' = sender_address OR 
    auth.jwt() ->> 'sub' = recipient_address
  );

CREATE POLICY messages_insert_policy ON messages
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'sub' = sender_address);

CREATE POLICY messages_update_policy ON messages
  FOR UPDATE
  USING (auth.jwt() ->> 'sub' = sender_address);

CREATE POLICY messages_delete_policy ON messages
  FOR DELETE
  USING (auth.jwt() ->> 'sub' = sender_address);

-- RLS Policies for message_attachments
CREATE POLICY message_attachments_select_policy ON message_attachments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM messages m 
      WHERE m.id = message_attachments.message_id 
      AND (auth.jwt() ->> 'sub' = m.sender_address OR auth.jwt() ->> 'sub' = m.recipient_address)
    )
  );

-- RLS Policies for user_blocks
CREATE POLICY user_blocks_select_policy ON user_blocks
  FOR SELECT
  USING (
    auth.jwt() ->> 'sub' = blocker_address OR 
    auth.jwt() ->> 'sub' = blocked_address
  );

CREATE POLICY user_blocks_insert_policy ON user_blocks
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'sub' = blocker_address);

CREATE POLICY user_blocks_delete_policy ON user_blocks
  FOR DELETE
  USING (auth.jwt() ->> 'sub' = blocker_address);

-- RLS Policies for transaction_messages
CREATE POLICY transaction_messages_select_policy ON transaction_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c 
      WHERE c.id = transaction_messages.conversation_id 
      AND (auth.jwt() ->> 'sub' = c.participant1_address OR auth.jwt() ->> 'sub' = c.participant2_address)
    )
  );

-- RLS Policies for message_notifications
CREATE POLICY message_notifications_select_policy ON message_notifications
  FOR SELECT
  USING (auth.jwt() ->> 'sub' = recipient_address);

CREATE POLICY message_notifications_update_policy ON message_notifications
  FOR UPDATE
  USING (auth.jwt() ->> 'sub' = recipient_address);

-- Create function to update conversation's last message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at,
      last_message = NEW.content,
      updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for messages
DROP TRIGGER IF EXISTS update_conversation_last_message_trigger ON messages;
CREATE TRIGGER update_conversation_last_message_trigger
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_last_message();

-- Create function to mark conversation as updated
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for conversation updates
DROP TRIGGER IF EXISTS update_conversation_timestamp_trigger ON messages;
CREATE TRIGGER update_conversation_timestamp_trigger
AFTER UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp();
