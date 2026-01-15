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
