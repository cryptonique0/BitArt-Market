-- Create user_follows table
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- Create follow_notifications table
CREATE TABLE IF NOT EXISTS follow_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL DEFAULT 'follow', -- follow, nft_drop, new_collection
  title VARCHAR(255) NOT NULL,
  message TEXT,
  nft_id UUID REFERENCES nfts(id) ON DELETE SET NULL,
  action_url VARCHAR(255),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_created_at ON user_follows(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_follow_notifications_user_id ON follow_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_follow_notifications_actor_id ON follow_notifications(actor_id);
CREATE INDEX IF NOT EXISTS idx_follow_notifications_read ON follow_notifications(read);
CREATE INDEX IF NOT EXISTS idx_follow_notifications_created_at ON follow_notifications(created_at DESC);

-- Create view for follower statistics
CREATE OR REPLACE VIEW follower_stats AS
SELECT 
  u.id,
  COALESCE(COUNT(DISTINCT uf.follower_id), 0) as follower_count,
  COALESCE(COUNT(DISTINCT uf2.following_id), 0) as following_count
FROM auth.users u
LEFT JOIN user_follows uf ON u.id = uf.following_id
LEFT JOIN user_follows uf2 ON u.id = uf2.follower_id
GROUP BY u.id;

-- Create function to notify followers on new NFT
CREATE OR REPLACE FUNCTION notify_followers_on_nft_drop()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO follow_notifications (user_id, actor_id, type, title, message, nft_id, action_url)
  SELECT 
    uf.follower_id,
    NEW.creator_id,
    'nft_drop',
    'New NFT Drop',
    'Your followed creator ' || COALESCE(u.username, 'Creator') || ' just dropped a new NFT: ' || NEW.title,
    NEW.id,
    '/nft/' || NEW.id
  FROM user_follows uf
  JOIN auth.users u ON NEW.creator_id = u.id
  WHERE uf.following_id = NEW.creator_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for NFT drops
DROP TRIGGER IF EXISTS nft_drop_notification_trigger ON nfts;
CREATE TRIGGER nft_drop_notification_trigger
AFTER INSERT ON nfts
FOR EACH ROW
EXECUTE FUNCTION notify_followers_on_nft_drop();

-- Enable RLS (Row Level Security)
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_follows
CREATE POLICY "Users can view all follows"
  ON user_follows FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own follows"
  ON user_follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows"
  ON user_follows FOR DELETE
  USING (auth.uid() = follower_id);

-- RLS Policies for follow_notifications
CREATE POLICY "Users can view their own notifications"
  ON follow_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create notifications"
  ON follow_notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON follow_notifications FOR UPDATE
  USING (auth.uid() = user_id);
