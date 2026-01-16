-- Create comments table for storing NFT comments
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_id UUID NOT NULL REFERENCES nfts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(255) NOT NULL,
  avatar TEXT,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  reply_count INTEGER DEFAULT 0,
  reaction_count INTEGER DEFAULT 0,
  is_edited BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reactions table for emoji reactions
CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_id UUID NOT NULL REFERENCES nfts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(255) NOT NULL,
  avatar TEXT,
  emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, nft_id, emoji)
);

-- Create flagged_comments table for moderation
CREATE TABLE IF NOT EXISTS flagged_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason VARCHAR(50) NOT NULL, -- spam, hate, harassment, misinformation, other
  description TEXT,
  flagged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'pending', -- pending, reviewed, dismissed, removed
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  action TEXT
);

-- Create comment_notifications table
CREATE TABLE IF NOT EXISTS comment_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  related_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- comment_reply, comment_reaction, comment_pin, comment_mention
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  nft_id UUID NOT NULL REFERENCES nfts(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_comments_nft_id ON comments(nft_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_deleted_at ON comments(deleted_at);

CREATE INDEX IF NOT EXISTS idx_reactions_nft_id ON reactions(nft_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_reactions_emoji ON reactions(emoji);
CREATE INDEX IF NOT EXISTS idx_reactions_created_at ON reactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_flagged_comments_status ON flagged_comments(status);
CREATE INDEX IF NOT EXISTS idx_flagged_comments_created_at ON flagged_comments(flagged_at DESC);

CREATE INDEX IF NOT EXISTS idx_comment_notifications_user_id ON comment_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_notifications_read ON comment_notifications(read);
CREATE INDEX IF NOT EXISTS idx_comment_notifications_created_at ON comment_notifications(created_at DESC);

-- Create view for comment statistics
CREATE OR REPLACE VIEW comment_stats AS
SELECT 
  c.nft_id,
  COUNT(DISTINCT CASE WHEN c.parent_comment_id IS NULL THEN c.id END) as total_comments,
  COUNT(DISTINCT CASE WHEN c.parent_comment_id IS NOT NULL THEN c.id END) as total_replies,
  COUNT(DISTINCT c.user_id) as unique_commenters,
  AVG(LENGTH(c.content)) as avg_comment_length,
  MAX(c.created_at) as last_comment_at
FROM comments c
WHERE c.deleted_at IS NULL
GROUP BY c.nft_id;

-- Create view for reaction statistics
CREATE OR REPLACE VIEW reaction_stats AS
SELECT 
  r.nft_id,
  r.emoji,
  COUNT(*) as reaction_count,
  COUNT(DISTINCT r.user_id) as unique_users,
  ROUND(100.0 * COUNT(DISTINCT r.user_id) / (
    SELECT COUNT(DISTINCT user_id) FROM reactions WHERE nft_id = r.nft_id
  ), 2) as percentage
FROM reactions r
GROUP BY r.nft_id, r.emoji;

-- Enable RLS (Row Level Security)
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE flagged_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comments
CREATE POLICY "Users can view all comments"
  ON comments FOR SELECT
  USING (deleted_at IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can create their own comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for reactions
CREATE POLICY "Anyone can view reactions"
  ON reactions FOR SELECT
  USING (true);

CREATE POLICY "Users can add their own reactions"
  ON reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own reactions"
  ON reactions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for flagged_comments
CREATE POLICY "Users can flag comments"
  ON flagged_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Moderators can view flagged comments"
  ON flagged_comments FOR SELECT
  USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'moderator');

CREATE POLICY "Moderators can update flagged comments"
  ON flagged_comments FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'moderator');

-- RLS Policies for comment_notifications
CREATE POLICY "Users can view their own notifications"
  ON comment_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can create notifications"
  ON comment_notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON comment_notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to increment reply count when comment is replied to
CREATE OR REPLACE FUNCTION increment_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_comment_id IS NOT NULL THEN
    UPDATE comments
    SET reply_count = reply_count + 1
    WHERE id = NEW.parent_comment_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to decrement reply count when reply is deleted
CREATE OR REPLACE FUNCTION decrement_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.parent_comment_id IS NOT NULL THEN
    UPDATE comments
    SET reply_count = GREATEST(reply_count - 1, 0)
    WHERE id = OLD.parent_comment_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for reply counting
DROP TRIGGER IF EXISTS comment_reply_insert_trigger ON comments;
CREATE TRIGGER comment_reply_insert_trigger
AFTER INSERT ON comments
FOR EACH ROW
EXECUTE FUNCTION increment_reply_count();

DROP TRIGGER IF EXISTS comment_reply_delete_trigger ON comments;
CREATE TRIGGER comment_reply_delete_trigger
AFTER DELETE ON comments
FOR EACH ROW
EXECUTE FUNCTION decrement_reply_count();

-- Create function to send notification on comment reply
CREATE OR REPLACE FUNCTION notify_on_comment_reply()
RETURNS TRIGGER AS $$
DECLARE
  parent_author_id UUID;
  parent_nft_id UUID;
BEGIN
  IF NEW.parent_comment_id IS NOT NULL THEN
    SELECT user_id, nft_id INTO parent_author_id, parent_nft_id
    FROM comments
    WHERE id = NEW.parent_comment_id;

    -- Only notify if replier is different from parent author
    IF parent_author_id IS NOT NULL AND parent_author_id != NEW.user_id THEN
      INSERT INTO comment_notifications (
        user_id,
        related_user_id,
        type,
        comment_id,
        nft_id,
        message,
        read,
        created_at
      ) VALUES (
        parent_author_id,
        NEW.user_id,
        'comment_reply',
        NEW.id,
        parent_nft_id,
        NEW.username || ' replied to your comment',
        FALSE,
        NOW()
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS comment_reply_notification_trigger ON comments;
CREATE TRIGGER comment_reply_notification_trigger
AFTER INSERT ON comments
FOR EACH ROW
WHEN (NEW.parent_comment_id IS NOT NULL)
EXECUTE FUNCTION notify_on_comment_reply();
