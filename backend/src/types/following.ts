// Following & Social System Types

export interface UserFollow {
  id: string;
  followerId: string;
  followingId: string;
  followedAt: Date;
  notificationsEnabled: boolean;
}

export interface UserFollowStats {
  userId: string;
  username: string;
  avatar?: string;
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
  isFollowedBy?: boolean;
}

export interface FollowerProfile {
  userId: string;
  username: string;
  avatar?: string;
  bio?: string;
  totalAchievements: number;
  currentLevel: number;
  followedAt: Date;
  isCreator: boolean;
  nftCount?: number;
}

export interface FollowingProfile extends FollowerProfile {
  lastDropDate?: Date;
  upcomingDropCount?: number;
}

export interface FollowNotification {
  id: string;
  followerId: string;
  followingId: string;
  type: 'new_drop' | 'new_listing' | 'user_follow' | 'achievement_unlocked';
  title: string;
  message: string;
  relatedId?: string; // NFT ID, listing ID, etc.
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface FollowingNotificationPreferences {
  userId: string;
  notifyNewDrops: boolean;
  notifyNewListings: boolean;
  notifyNewFollowers: boolean;
  notifyAchievements: boolean;
  digestFrequency: 'instant' | 'daily' | 'weekly' | 'never';
  emailNotifications: boolean;
}

export interface FollowStats {
  userId: string;
  followers: number;
  following: number;
  mutualFollows: number;
  influence: number; // Calculated based on followers + achievements
}

export interface UserFollowTimeline {
  userId: string;
  username: string;
  followers: FollowerProfile[];
  following: FollowingProfile[];
  mutualFollows: string[]; // User IDs of mutual follows
  joinedDate: Date;
}

export interface PopularCreators {
  creators: Array<{
    userId: string;
    username: string;
    avatar?: string;
    followersCount: number;
    totalXP: number;
    currentLevel: number;
    nftCount: number;
    rank: number;
  }>;
}

export interface FollowRecommendation {
  userId: string;
  username: string;
  avatar?: string;
  followersCount: number;
  reason: string; // 'popular', 'similar_interests', 'mutual_followers', etc.
  matchScore: number; // 0-100
}
