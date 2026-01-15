// Achievement Types
export enum AchievementType {
  CREATOR = 'creator',
  COLLECTOR = 'collector',
  TRADER = 'trader',
  SOCIAL = 'social',
  MILESTONE = 'milestone',
  SPECIAL = 'special',
}

export enum AchievementTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: AchievementType;
  requirement: number;
  xpReward: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  tier?: AchievementTier;
  badgeIcon?: string;
  milestone?: number;
  unlockedAt?: Date;
  seasonId?: string; // Seasonal achievement identifier
  seasonStartDate?: Date; // When the seasonal achievement period starts
  seasonEndDate?: Date; // When the seasonal achievement expires
  isSeasonal?: boolean; // Mark as seasonal achievement
}

export interface UserAchievement {
  userId: string;
  achievementId: string;
  unlockedAt: Date;
  progress: number;
}

export interface UserLevel {
  userId: string;
  currentLevel: number;
  totalXP: number;
  xpForNextLevel: number;
  xpInCurrentLevel: number;
}

export interface LevelConfig {
  level: number;
  minXP: number;
  maxXP: number;
  title: string;
  color: string;
}

export interface XPTransaction {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  relatedId?: string;
  timestamp: Date;
}

export interface AchievementComparison {
  user1Id: string;
  user2Id: string;
  user1Username: string;
  user2Username: string;
  mutualAchievements: Achievement[];
  user1OnlyAchievements: Achievement[];
  user2OnlyAchievements: Achievement[];
  mutualCount: number;
  similarityPercentage: number;
}

export interface FriendAchievementData {
  userId: string;
  username: string;
  avatar?: string;
  totalAchievements: number;
  completionPercentage: number;
  recentUnlocks: Achievement[];
  highestTier: AchievementTier;
}

export interface SocialLeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  totalAchievements: number;
  completionPercentage: number;
  totalXP: number;
  rank: number;
  friendsWith?: boolean;
}

export interface ShareableAchievementBadge {
  userId: string;
  username: string;
  achievement: Achievement;
  unlockedAt: Date;
  shareUrl: string;
  badge: {
    text: string;
    icon: string;
    color: string;
  };
}

export interface UserProfile {
  userId: string;
  username: string;
  avatar?: string;
  totalAchievements: number;
  completionPercentage: number;
  totalXP: number;
  highestTier: AchievementTier;
  friendsList: string[];
}
export interface DailyReward {
  id: string;
  userId: string;
  date: Date;
  xpAmount: number;
  claimed: boolean;
  claimedAt?: Date;
  streak: number;
}

export interface DailyRewardConfig {
  baseXP: number;
  streakBonus: number;
  maxStreak: number;
  resetTime: string;
}

export enum LuckyDrawPrize {
  XP_100 = 'xp_100',
  XP_250 = 'xp_250',
  XP_500 = 'xp_500',
  XP_1000 = 'xp_1000',
  BADGE_RARE = 'badge_rare',
  BADGE_EPIC = 'badge_epic',
  NFT_DISCOUNT = 'nft_discount_10',
  FEATURE_BOOST = 'feature_boost',
}

export interface LuckyDrawPrizeConfig {
  id: string;
  type: LuckyDrawPrize;
  label: string;
  probability: number;
  icon: string;
  color: string;
}

export interface LuckyDrawEntry {
  id: string;
  userId: string;
  drawnAt?: Date;
  prizeType?: LuckyDrawPrize;
  prizeValue?: number;
  claimed: boolean;
  claimedAt?: Date;
  eligibleAfter: Date;
}

export interface Reward {
  id: string;
  type: 'xp' | 'badge' | 'discount' | 'feature_boost';
  value: number | string;
  description: string;
  icon: string;
  expiresAt?: Date;
}

export interface UserReward {
  id: string;
  userId: string;
  rewardId: string;
  earnedAt: Date;
  usedAt?: Date;
  expiresAt?: Date;
}

export interface GamificationStats {
  userId: string;
  totalXP: number;
  currentLevel: number;
  achievementsUnlocked: number;
  badgesEarned: number;
  rewardsEarned: number;
  dailyStreakDays: number;
  lastActivityDate: Date;
  levelPercentage: number;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar: string;
  totalXP: number;
  level: number;
  achievements: number;
  badges: number;
  rank: number;
}

export interface UserXPTracker {
  userId: string;
  totalXP: number;
  achievementXP: number;
  dailyStreakXP: number;
  lastUpdated: Date;
}

export interface CategoryLeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  totalXP: number;
  achievementCount: number;
  rank: number;
  type: AchievementType;
}
export interface UserStreak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
  firstStreakDate: Date;
  streakBrokenDate?: Date;
  totalStreakDays: number; // Total consecutive days tracked
}

export interface StreakStats {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  isActiveToday: boolean;
  daysUntilReset: number;
  xpBonus: number;
  milestone: number | null;
}

export interface StreakReward {
  dayThreshold: number;
  xpBonus: number;
  badge?: string;
  description: string;
}
export interface AchievementNotification {
  userId: string;
  achievementId: string;
  type: 'unlocked' | 'near_completion' | 'milestone' | 'tier_achieved';
  achievement: Achievement;
  xpReward: number;
  progress?: number;
  requirement?: number;
  unlockedAt: Date;
  read: boolean;
}

export interface NewAchievementData {
  achievement: Achievement;
  unlockedAt: Date;
  xpReward: number;
}

export interface NearCompletionAchievement extends Achievement {
  progress: number;
  requirement: number;
  progressPercentage: number;
  daysEstimated?: number;
}

export interface AchievementRewardNotification {
  userId: string;
  achievementId: string;
  achievementTitle: string;
  xpAwarded: number;
  totalXP: number;
  newLevel?: number;
  tier?: AchievementTier;
  timestamp: Date;
}
export interface SeasonConfig {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  theme: string;
  color: string;
  icon: string;
  isActive: boolean;
}

export interface SeasonalAchievement extends Achievement {
  seasonId: string;
  seasonName: string;
  seasonStartDate: Date;
  seasonEndDate: Date;
  daysRemaining?: number;
  isExpired?: boolean;
}

export interface SeasonalLeaderboardEntry extends LeaderboardEntry {
  seasonId: string;
  seasonalXP: number;
  seasonalAchievements: number;
}

export type AchievementStatus = 'locked' | 'in-progress' | 'unlocked';

export interface AchievementSearchResult {
  achievement: Achievement;
  matchScore: number; // 0-100, higher = better match
  matchReason: string; // 'title' | 'description' | 'both'
}

export interface AchievementsByStatus {
  locked: Achievement[];
  inProgress: Achievement[];
  unlocked: Achievement[];
}
