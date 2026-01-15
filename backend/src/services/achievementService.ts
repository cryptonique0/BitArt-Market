import {
  Achievement,
  UserAchievement,
  AchievementType,
  AchievementTier,
  UserXPTracker,
  CategoryLeaderboardEntry,
  UserStreak,
  StreakStats,
  StreakReward,
  AchievementNotification,
  NewAchievementData,
  NearCompletionAchievement,
  AchievementRewardNotification,
  AchievementComparison,
  FriendAchievementData,
  SocialLeaderboardEntry,
  ShareableAchievementBadge,
  UserProfile,
  SeasonConfig,
  SeasonalAchievement,
  SeasonalLeaderboardEntry,
  AchievementStatus,
  AchievementSearchResult,
  AchievementsByStatus,
} from '../types/gamification';

// Track total XP per user
const userXPMap = new Map<string, UserXPTracker>();

// Track user streaks
const userStreakMap = new Map<string, UserStreak>();

// Track achievement notifications
const notificationsMap = new Map<string, AchievementNotification[]>();

// Track last viewed timestamp for each user
const lastNotificationViewMap = new Map<string, Date>();

// Track user friendships (bidirectional)
const friendshipMap = new Map<string, Set<string>>();

// Track user profiles for social features
const userProfileMap = new Map<string, UserProfile>();

// Track seasonal achievements and user progress
const seasonConfigMap = new Map<string, SeasonConfig>();
const userSeasonalProgressMap = new Map<string, Map<string, number>>(); // userId -> seasonId -> XP
const seasonalLeaderboardCache = new Map<string, SeasonalLeaderboardEntry[]>();

// Streak reward configuration
const STREAK_REWARDS: StreakReward[] = [
  { dayThreshold: 7, xpBonus: 50, badge: '🔥', description: 'Week Warrior' },
  { dayThreshold: 14, xpBonus: 100, badge: '⚡', description: 'Two Week Champion' },
  { dayThreshold: 30, xpBonus: 250, badge: '💪', description: 'Monthly Master' },
  { dayThreshold: 60, xpBonus: 500, badge: '👑', description: 'Legendary Contributor' },
  { dayThreshold: 100, xpBonus: 1000, badge: '🌟', description: 'Century Achiever' },
];

// Track category-specific achievements
const categoryAchievementMap = new Map<string, Map<AchievementType, Achievement[]>>();

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_nft',
    title: 'First Creation',
    description: 'Mint your first NFT',
    icon: '✨',
    type: AchievementType.CREATOR,
    requirement: 1,
    xpReward: 50,
    rarity: 'common',
    tier: AchievementTier.BRONZE,
    badgeIcon: '🥉',
  },
  {
    id: 'prolific_creator',
    title: 'Prolific Creator',
    description: 'Create 10 NFTs',
    icon: '🎨',
    type: AchievementType.CREATOR,
    requirement: 10,
    xpReward: 200,
    rarity: 'uncommon',
    tier: AchievementTier.BRONZE,
    badgeIcon: '🥉',
  },
  {
    id: 'milestone_50_creator',
    title: 'Master Creator',
    description: 'Create 50 NFTs',
    icon: '🎯',
    type: AchievementType.MILESTONE,
    requirement: 50,
    xpReward: 500,
    rarity: 'rare',
    tier: AchievementTier.SILVER,
    badgeIcon: '🥈',
    milestone: 50,
  },
  {
    id: 'milestone_100_creator',
    title: 'Legendary Creator',
    description: 'Create 100 NFTs',
    icon: '👑',
    type: AchievementType.MILESTONE,
    requirement: 100,
    xpReward: 1000,
    rarity: 'epic',
    tier: AchievementTier.GOLD,
    badgeIcon: '🥇',
    milestone: 100,
  },
  {
    id: 'milestone_250_creator',
    title: 'Creator Deity',
    description: 'Create 250 NFTs',
    icon: '🌟',
    type: AchievementType.MILESTONE,
    requirement: 250,
    xpReward: 2000,
    rarity: 'legendary',
    tier: AchievementTier.PLATINUM,
    badgeIcon: '💎',
    milestone: 250,
  },
  {
    id: 'first_purchase',
    title: 'Collector',
    description: 'Purchase your first NFT',
    icon: '🛍️',
    type: AchievementType.COLLECTOR,
    requirement: 1,
    xpReward: 50,
    rarity: 'common',
    tier: AchievementTier.BRONZE,
    badgeIcon: '🥉',
  },
  {
    id: 'milestone_50_collector',
    title: 'Serious Collector',
    description: 'Collect 50 NFTs',
    icon: '🏛️',
    type: AchievementType.MILESTONE,
    requirement: 50,
    xpReward: 500,
    rarity: 'rare',
    tier: AchievementTier.SILVER,
    badgeIcon: '🥈',
    milestone: 50,
  },
  {
    id: 'milestone_100_collector',
    title: 'Museum Curator',
    description: 'Collect 100 NFTs',
    icon: '🎭',
    type: AchievementType.MILESTONE,
    requirement: 100,
    xpReward: 1000,
    rarity: 'epic',
    tier: AchievementTier.GOLD,
    badgeIcon: '🥇',
    milestone: 100,
  },
  {
    id: 'first_sale',
    title: 'Trader',
    description: 'Complete your first sale',
    icon: '💰',
    type: AchievementType.TRADER,
    requirement: 1,
    xpReward: 50,
    rarity: 'common',
    tier: AchievementTier.BRONZE,
    badgeIcon: '🥉',
  },
  {
    id: 'milestone_50_trader',
    title: 'Market Veteran',
    description: 'Complete 50 sales',
    icon: '📈',
    type: AchievementType.MILESTONE,
    requirement: 50,
    xpReward: 500,
    rarity: 'rare',
    tier: AchievementTier.SILVER,
    badgeIcon: '🥈',
    milestone: 50,
  },
  {
    id: 'milestone_100_trader',
    title: 'Market Master',
    description: 'Complete 100 sales',
    icon: '🏆',
    type: AchievementType.MILESTONE,
    requirement: 100,
    xpReward: 1000,
    rarity: 'epic',
    tier: AchievementTier.GOLD,
    badgeIcon: '🥇',
    milestone: 100,
  },
  {
    id: 'daily_streak_7',
    title: 'Consistent Creator',
    description: 'Maintain a 7-day daily reward streak',
    icon: '🔥',
    type: AchievementType.SPECIAL,
    requirement: 7,
    xpReward: 150,
    rarity: 'uncommon',
    tier: AchievementTier.BRONZE,
    badgeIcon: '🥉',
  },
  {
    id: 'daily_streak_30',
    title: 'Dedicated Member',
    description: 'Maintain a 30-day daily reward streak',
    icon: '⚡',
    type: AchievementType.SPECIAL,
    requirement: 30,
    xpReward: 500,
    rarity: 'rare',
    tier: AchievementTier.SILVER,
    badgeIcon: '🥈',
  },
  {
    id: 'daily_streak_100',
    title: 'Unstoppable Force',
    description: 'Maintain a 100-day daily reward streak',
    icon: '💪',
    type: AchievementType.SPECIAL,
    requirement: 100,
    xpReward: 1500,
    rarity: 'epic',
    tier: AchievementTier.GOLD,
    badgeIcon: '🥇',
  },
];

const userAchievements = new Map<string, UserAchievement[]>();

// Helper function for string distance calculation
function calculateStringDistance(str1: string, str2: string): number {
  // Levenshtein-like distance but simplified for scoring
  // Returns a value between 0 and 1 where 1 is exact match
  if (str1 === str2) return 1;
  if (str1.startsWith(str2) || str2.startsWith(str1)) return 0.9;

  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  let matches = 0;
  let lastIndex = 0;
  for (const char of shorter) {
    const index = longer.indexOf(char, lastIndex);
    if (index !== -1) {
      matches++;
      lastIndex = index + 1;
    }
  }

  return matches / longer.length;
}

export const achievementService = {
  getAllAchievements(): Achievement[] {
    return ACHIEVEMENTS;
  },

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return userAchievements.get(userId) || [];
  },

  async unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement | null> {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return null;

    const userAchs = userAchievements.get(userId) || [];
    if (userAchs.some(a => a.achievementId === achievementId)) {
      return null;
    }

    const userAchievement: UserAchievement = {
      userId,
      achievementId,
      unlockedAt: new Date(),
      progress: achievement.requirement,
    };

    userAchs.push(userAchievement);
    userAchievements.set(userId, userAchs);

    // Track XP earned
    await this.trackUserXP(userId, achievement.xpReward, 'achievement');

    return userAchievement;
  },

  async updateProgress(
    userId: string,
    achievementId: string,
    progress: number
  ): Promise<UserAchievement | null> {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return null;

    const userAchs = userAchievements.get(userId) || [];
    let userAch = userAchs.find(a => a.achievementId === achievementId);

    if (!userAch) {
      userAch = {
        userId,
        achievementId,
        progress: 0,
        unlockedAt: new Date(0), // Use epoch as placeholder for "not unlocked"
      };
      userAchs.push(userAch);
    }

    userAch.progress = Math.min(progress, achievement.requirement);

    if (userAch.progress >= achievement.requirement && userAch.unlockedAt.getTime() === 0) {
      userAch.unlockedAt = new Date();
      // Track XP when achievement is completed through progress update
      await this.trackUserXP(userId, achievement.xpReward, 'achievement');
    }

    userAchievements.set(userId, userAchs);
    return userAch;
  },

  getAchievementDetails(achievementId: string): Achievement | undefined {
    return ACHIEVEMENTS.find(a => a.id === achievementId);
  },

  async getUnlockedCount(userId: string): Promise<number> {
    const userAchs = await this.getUserAchievements(userId);
    return userAchs.filter(a => a.unlockedAt).length;
  },

  getAchievementsByTier(tier: AchievementTier): Achievement[] {
    return ACHIEVEMENTS.filter(a => a.tier === tier);
  },

  getAllTiers(): AchievementTier[] {
    return Object.values(AchievementTier);
  },

  getTierAchievements(): Record<AchievementTier, Achievement[]> {
    const result: Record<AchievementTier, Achievement[]> = {
      [AchievementTier.BRONZE]: [],
      [AchievementTier.SILVER]: [],
      [AchievementTier.GOLD]: [],
      [AchievementTier.PLATINUM]: [],
    };

    ACHIEVEMENTS.forEach(achievement => {
      const tier = achievement.tier || AchievementTier.BRONZE;
      result[tier].push(achievement);
    });

    return result;
  },

  getMilestoneAchievements(): Achievement[] {
    return ACHIEVEMENTS.filter(a => a.milestone);
  },

  getMilestonesByType(type: AchievementType): Achievement[] {
    return ACHIEVEMENTS.filter(a => a.milestone && a.type === type);
  },

  // ===== COLLECTION MANAGEMENT METHODS =====

  getAchievementsByType(type: AchievementType): Achievement[] {
    return ACHIEVEMENTS.filter(a => a.type === type);
  },

  getAchievementsByRarity(
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  ): Achievement[] {
    return ACHIEVEMENTS.filter(a => a.rarity === rarity);
  },

  getAchievementsByRarityGrouped(): Record<string, Achievement[]> {
    const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'] as const;
    const result: Record<string, Achievement[]> = {};

    rarities.forEach(rarity => {
      result[rarity] = ACHIEVEMENTS.filter(a => a.rarity === rarity);
    });

    return result;
  },

  async getCompletionPercentage(userId: string): Promise<number> {
    const userAchs = await this.getUserAchievements(userId);
    const unlockedCount = userAchs.filter(a => a.unlockedAt && a.unlockedAt.getTime() !== 0).length;
    const totalCount = ACHIEVEMENTS.length;

    return totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;
  },

  async getCompletionStats(userId: string): Promise<{
    totalAchievements: number;
    unlockedAchievements: number;
    completionPercentage: number;
    lockedAchievements: number;
    inProgressAchievements: number;
  }> {
    const userAchs = await this.getUserAchievements(userId);
    const unlockedIds = new Set(
      userAchs.filter(a => a.unlockedAt && a.unlockedAt.getTime() !== 0).map(ua => ua.achievementId)
    );

    const totalAchievements = ACHIEVEMENTS.length;
    const unlockedAchievements = unlockedIds.size;
    const completionPercentage = (unlockedAchievements / totalAchievements) * 100;

    // Count in-progress achievements (have progress but not unlocked)
    const inProgressAchievements = userAchs.filter(
      a => !unlockedIds.has(a.achievementId) && a.progress > 0
    ).length;

    const lockedAchievements = totalAchievements - unlockedAchievements - inProgressAchievements;

    return {
      totalAchievements,
      unlockedAchievements,
      completionPercentage,
      lockedAchievements,
      inProgressAchievements,
    };
  },

  async getCollectionByRarity(
    userId: string
  ): Promise<Record<string, { unlocked: number; total: number; percentage: number }>> {
    const userAchs = await this.getUserAchievements(userId);
    const unlockedIds = new Set(
      userAchs.filter(a => a.unlockedAt && a.unlockedAt.getTime() !== 0).map(ua => ua.achievementId)
    );

    const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'] as const;
    const result: Record<string, { unlocked: number; total: number; percentage: number }> = {};

    rarities.forEach(rarity => {
      const achievements = ACHIEVEMENTS.filter(a => a.rarity === rarity);
      const unlockedCount = achievements.filter(a => unlockedIds.has(a.id)).length;
      const total = achievements.length;

      result[rarity] = {
        unlocked: unlockedCount,
        total,
        percentage: total > 0 ? (unlockedCount / total) * 100 : 0,
      };
    });

    return result;
  },

  async getCollectionByType(
    userId: string
  ): Promise<Record<AchievementType, { unlocked: number; total: number; percentage: number }>> {
    const userAchs = await this.getUserAchievements(userId);
    const unlockedIds = new Set(
      userAchs.filter(a => a.unlockedAt && a.unlockedAt.getTime() !== 0).map(ua => ua.achievementId)
    );

    const types = Object.values(AchievementType);
    const result: Record<AchievementType, { unlocked: number; total: number; percentage: number }> =
      {} as any;

    types.forEach(type => {
      const achievements = ACHIEVEMENTS.filter(a => a.type === type);
      const unlockedCount = achievements.filter(a => unlockedIds.has(a.id)).length;
      const total = achievements.length;

      result[type] = {
        unlocked: unlockedCount,
        total,
        percentage: total > 0 ? (unlockedCount / total) * 100 : 0,
      };
    });

    return result;
  },

  async getCollectionByTier(
    userId: string
  ): Promise<Record<AchievementTier, { unlocked: number; total: number; percentage: number }>> {
    const userAchs = await this.getUserAchievements(userId);
    const unlockedIds = new Set(
      userAchs.filter(a => a.unlockedAt && a.unlockedAt.getTime() !== 0).map(ua => ua.achievementId)
    );

    const tiers = Object.values(AchievementTier);
    const result: Record<AchievementTier, { unlocked: number; total: number; percentage: number }> =
      {} as any;

    tiers.forEach(tier => {
      const achievements = ACHIEVEMENTS.filter(a => a.tier === tier);
      const unlockedCount = achievements.filter(a => unlockedIds.has(a.id)).length;
      const total = achievements.length;

      result[tier] = {
        unlocked: unlockedCount,
        total,
        percentage: total > 0 ? (unlockedCount / total) * 100 : 0,
      };
    });

    return result;
  },

  async getNextUnlockableAchievements(
    userId: string,
    limit: number = 5
  ): Promise<(Achievement & { progress: number; progressPercentage: number })[]> {
    const userAchs = await this.getUserAchievements(userId);
    const userAchMap = new Map(userAchs.map(ua => [ua.achievementId, ua]));

    // Get achievements that are in-progress (not unlocked but have progress)
    const inProgress = ACHIEVEMENTS.filter(ach => {
      const userAch = userAchMap.get(ach.id);
      return (
        userAch &&
        userAch.progress > 0 &&
        (!userAch.unlockedAt || userAch.unlockedAt.getTime() === 0)
      );
    });

    // Sort by progress percentage (closest to unlock first)
    const sorted = inProgress
      .map(ach => {
        const userAch = userAchMap.get(ach.id)!;
        const progressPercentage = (userAch.progress / ach.requirement) * 100;
        return { ...ach, progress: userAch.progress, progressPercentage };
      })
      .sort((a, b) => b.progressPercentage - a.progressPercentage);

    return sorted.slice(0, limit);
  },

  async getMissingAchievements(userId: string, limit: number = 10): Promise<Achievement[]> {
    const userAchs = await this.getUserAchievements(userId);
    const unlockedIds = new Set(
      userAchs.filter(a => a.unlockedAt && a.unlockedAt.getTime() !== 0).map(ua => ua.achievementId)
    );

    const locked = ACHIEVEMENTS.filter(a => !unlockedIds.has(a.id));

    // Return random subset if more than limit
    if (locked.length > limit) {
      return locked.sort(() => Math.random() - 0.5).slice(0, limit);
    }

    return locked;
  },

  async getAchievementProgress(
    userId: string,
    achievementId: string
  ): Promise<{
    achievement: Achievement | null;
    progress: number;
    requirement: number;
    progressPercentage: number;
    isUnlocked: boolean;
  } | null> {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return null;

    const userAchs = await this.getUserAchievements(userId);
    const userAch = userAchs.find(ua => ua.achievementId === achievementId);

    if (!userAch) {
      return {
        achievement,
        progress: 0,
        requirement: achievement.requirement,
        progressPercentage: 0,
        isUnlocked: false,
      };
    }

    const isUnlocked = userAch.unlockedAt && userAch.unlockedAt.getTime() !== 0;
    const progressPercentage = (userAch.progress / achievement.requirement) * 100;

    return {
      achievement,
      progress: userAch.progress,
      requirement: achievement.requirement,
      progressPercentage,
      isUnlocked,
    };
  },

  async getAchievementSummary(userId: string): Promise<{
    totalCount: number;
    completionPercentage: number;
    byRarity: Record<string, { unlocked: number; total: number }>;
    byType: Record<string, { unlocked: number; total: number }>;
    byTier: Record<string, { unlocked: number; total: number }>;
    nextMilestones: (Achievement & { progress: number; progressPercentage: number })[];
  }> {
    const completionStats = await this.getCompletionStats(userId);
    const byRarity = await this.getCollectionByRarity(userId);
    const byType = await this.getCollectionByType(userId);
    const byTier = await this.getCollectionByTier(userId);
    const nextMilestones = await this.getNextUnlockableAchievements(userId, 3);

    return {
      totalCount: completionStats.totalAchievements,
      completionPercentage: completionStats.completionPercentage,
      byRarity: Object.fromEntries(
        Object.entries(byRarity).map(([rarity, data]) => [
          rarity,
          { unlocked: data.unlocked, total: data.total },
        ])
      ),
      byType: Object.fromEntries(
        Object.entries(byType).map(([type, data]) => [
          type,
          { unlocked: data.unlocked, total: data.total },
        ])
      ),
      byTier: Object.fromEntries(
        Object.entries(byTier).map(([tier, data]) => [
          tier,
          { unlocked: data.unlocked, total: data.total },
        ])
      ),
      nextMilestones,
    };
  },

  async getUserAchievementsByRarity(userId: string): Promise<Record<string, Achievement[]>> {
    const userAchs = await this.getUserAchievements(userId);
    const unlockedIds = new Set(
      userAchs.filter(a => a.unlockedAt && a.unlockedAt.getTime() !== 0).map(ua => ua.achievementId)
    );

    const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'] as const;
    const result: Record<string, Achievement[]> = {};

    rarities.forEach(rarity => {
      result[rarity] = ACHIEVEMENTS.filter(a => a.rarity === rarity && unlockedIds.has(a.id));
    });

    return result;
  },

  async getUserAchievementsByType(userId: string): Promise<Record<AchievementType, Achievement[]>> {
    const userAchs = await this.getUserAchievements(userId);
    const unlockedIds = new Set(
      userAchs.filter(a => a.unlockedAt && a.unlockedAt.getTime() !== 0).map(ua => ua.achievementId)
    );

    const types = Object.values(AchievementType);
    const result: Record<AchievementType, Achievement[]> = {} as any;

    types.forEach(type => {
      result[type] = ACHIEVEMENTS.filter(a => a.type === type && unlockedIds.has(a.id));
    });

    return result;
  },

  async getUserAchievementsByTier(userId: string): Promise<Record<AchievementTier, Achievement[]>> {
    const userAchs = await this.getUserAchievements(userId);
    const unlockedIds = new Set(
      userAchs.filter(a => a.unlockedAt && a.unlockedAt.getTime() !== 0).map(ua => ua.achievementId)
    );

    const tiers = Object.values(AchievementTier);
    const result: Record<AchievementTier, Achievement[]> = {} as any;

    tiers.forEach(tier => {
      result[tier] = ACHIEVEMENTS.filter(a => a.tier === tier && unlockedIds.has(a.id));
    });

    return result;
  },

  async getUserBadges(userId: string): Promise<{ tier: AchievementTier; count: number }[]> {
    const userAchs = await this.getUserAchievements(userId);
    const unlockedAchievements = userAchs.filter(a => a.unlockedAt).map(ua => ua.achievementId);

    const badgesByTier: Record<AchievementTier, number> = {
      [AchievementTier.BRONZE]: 0,
      [AchievementTier.SILVER]: 0,
      [AchievementTier.GOLD]: 0,
      [AchievementTier.PLATINUM]: 0,
    };

    ACHIEVEMENTS.forEach(achievement => {
      if (unlockedAchievements.includes(achievement.id) && achievement.tier) {
        badgesByTier[achievement.tier]++;
      }
    });

    return Object.entries(badgesByTier)
      .map(([tier, count]) => ({ tier: tier as AchievementTier, count }))
      .filter(b => b.count > 0);
  },

  async getUserTierProgress(
    userId: string
  ): Promise<Record<AchievementTier, { unlocked: number; total: number }>> {
    const userAchs = await this.getUserAchievements(userId);
    const unlockedIds = new Set(userAchs.filter(a => a.unlockedAt).map(ua => ua.achievementId));

    const progress: Record<AchievementTier, { unlocked: number; total: number }> = {
      [AchievementTier.BRONZE]: { unlocked: 0, total: 0 },
      [AchievementTier.SILVER]: { unlocked: 0, total: 0 },
      [AchievementTier.GOLD]: { unlocked: 0, total: 0 },
      [AchievementTier.PLATINUM]: { unlocked: 0, total: 0 },
    };

    ACHIEVEMENTS.forEach(achievement => {
      const tier = achievement.tier || AchievementTier.BRONZE;
      progress[tier].total++;
      if (unlockedIds.has(achievement.id)) {
        progress[tier].unlocked++;
      }
    });

    return progress;
  },

  getHighestTierUnlocked(achievements: Achievement[]): AchievementTier {
    const unlockedTiers = achievements
      .filter(a => a.tier)
      .map(a => a.tier!)
      .sort((a, b) => {
        const tierOrder = {
          [AchievementTier.BRONZE]: 0,
          [AchievementTier.SILVER]: 1,
          [AchievementTier.GOLD]: 2,
          [AchievementTier.PLATINUM]: 3,
        };
        return tierOrder[b] - tierOrder[a];
      });

    return unlockedTiers[0] || AchievementTier.BRONZE;
  },

  // ===== LEADERBOARD METHODS =====

  async trackUserXP(
    userId: string,
    xpAmount: number,
    source: 'achievement' | 'daily_streak'
  ): Promise<UserXPTracker> {
    let tracker = userXPMap.get(userId);

    if (!tracker) {
      tracker = {
        userId,
        totalXP: 0,
        achievementXP: 0,
        dailyStreakXP: 0,
        lastUpdated: new Date(),
      };
    }

    tracker.totalXP += xpAmount;
    if (source === 'achievement') {
      tracker.achievementXP += xpAmount;
    } else if (source === 'daily_streak') {
      tracker.dailyStreakXP += xpAmount;
    }
    tracker.lastUpdated = new Date();

    userXPMap.set(userId, tracker);
    return tracker;
  },

  getUserXPTracker(userId: string): UserXPTracker | undefined {
    return userXPMap.get(userId);
  },

  getAllUserXP(): Map<string, UserXPTracker> {
    return new Map(userXPMap);
  },

  async getLeaderboard(
    type?: AchievementType,
    limit: number = 10
  ): Promise<CategoryLeaderboardEntry[]> {
    // Get all users and their achievement XP
    const allXPData = this.getAllUserXP();

    const leaderboardData: CategoryLeaderboardEntry[] = [];

    for (const [userId, tracker] of allXPData) {
      const userAchs = await this.getUserAchievements(userId);
      const achievements = ACHIEVEMENTS;

      // Filter achievements by type if specified
      let typeAchievements = achievements;
      if (type) {
        typeAchievements = achievements.filter(a => a.type === type);
      }

      // Count achievements for this user in this category
      const unlockedIds = new Set(userAchs.filter(a => a.unlockedAt).map(ua => ua.achievementId));
      const achievementCount = typeAchievements.filter(a => unlockedIds.has(a.id)).length;

      if (achievementCount > 0 || tracker.totalXP > 0) {
        leaderboardData.push({
          userId,
          username: `User_${userId.substring(0, 8)}`, // Placeholder - should come from user profile
          totalXP: type ? tracker.achievementXP : tracker.totalXP, // Use category XP if type specified
          achievementCount,
          rank: 0, // Will be set below
          type: type || AchievementType.CREATOR, // Default type
        });
      }
    }

    // Sort by XP (descending), then by achievement count
    leaderboardData.sort((a, b) => {
      if (b.totalXP !== a.totalXP) {
        return b.totalXP - a.totalXP;
      }
      return b.achievementCount - a.achievementCount;
    });

    // Assign ranks
    leaderboardData.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return leaderboardData.slice(0, limit);
  },

  async getUserRank(userId: string, type?: AchievementType): Promise<number | null> {
    const leaderboard = await this.getLeaderboard(type, 10000); // Get all users

    const userEntry = leaderboard.find(entry => entry.userId === userId);
    return userEntry ? userEntry.rank : null;
  },

  async getLeaderboardAroundUser(
    userId: string,
    range: number = 5,
    type?: AchievementType
  ): Promise<CategoryLeaderboardEntry[]> {
    const leaderboard = await this.getLeaderboard(type, 10000);
    const userIndex = leaderboard.findIndex(entry => entry.userId === userId);

    if (userIndex === -1) {
      return [];
    }

    const start = Math.max(0, userIndex - range);
    const end = Math.min(leaderboard.length, userIndex + range + 1);

    return leaderboard.slice(start, end);
  },

  async getLeaderboardByType(
    type: AchievementType,
    limit: number = 10
  ): Promise<CategoryLeaderboardEntry[]> {
    return this.getLeaderboard(type, limit);
  },

  async getLeaderboardStats(): Promise<{
    totalPlayers: number;
    totalXPDistributed: number;
    averageUserXP: number;
    topUser: CategoryLeaderboardEntry | null;
  }> {
    const allXPData = this.getAllUserXP();
    const totalPlayers = allXPData.size;
    let totalXPDistributed = 0;

    for (const tracker of allXPData.values()) {
      totalXPDistributed += tracker.totalXP;
    }

    const averageUserXP = totalPlayers > 0 ? totalXPDistributed / totalPlayers : 0;

    const leaderboard = await this.getLeaderboard(undefined, 1);
    const topUser = leaderboard.length > 0 ? leaderboard[0] : null;

    return {
      totalPlayers,
      totalXPDistributed,
      averageUserXP,
      topUser,
    };
  },

  async getUserLeaderboardPosition(userId: string): Promise<{
    userId: string;
    rank: number;
    totalXP: number;
    percentile: number;
    achievementCount: number;
  } | null> {
    const leaderboard = await this.getLeaderboard(undefined, 10000);
    const userEntry = leaderboard.find(entry => entry.userId === userId);

    if (!userEntry) {
      return null;
    }

    const percentile = ((leaderboard.length - userEntry.rank + 1) / leaderboard.length) * 100;

    return {
      userId,
      rank: userEntry.rank,
      totalXP: userEntry.totalXP,
      percentile,
      achievementCount: userEntry.achievementCount,
    };
  },

  // ===== STREAK TRACKING METHODS =====

  async updateStreak(userId: string): Promise<UserStreak> {
    let streak = userStreakMap.get(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!streak) {
      // First time tracking
      streak = {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: today,
        firstStreakDate: today,
        totalStreakDays: 1,
      };
      userStreakMap.set(userId, streak);
      return streak;
    }

    const lastActive = new Date(streak.lastActiveDate);
    lastActive.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if streak is still active
    if (lastActive.getTime() === today.getTime()) {
      // Already updated today - no change
      return streak;
    } else if (lastActive.getTime() === yesterday.getTime()) {
      // Consecutive day - continue streak
      streak.currentStreak++;
      streak.totalStreakDays++;
    } else {
      // Streak broken - reset
      this.resetStreak(userId);
      streak = userStreakMap.get(userId)!;
      streak.currentStreak = 1;
      streak.totalStreakDays++;
    }

    // Update longest streak if current exceeds it
    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
    }

    streak.lastActiveDate = today;

    userStreakMap.set(userId, streak);

    // Award XP for streak continuation
    if (streak.currentStreak > 1) {
      const bonus = this.getStreakXPBonus(streak.currentStreak);
      await this.trackUserXP(userId, bonus, 'daily_streak');
    }

    return streak;
  },

  getActiveStreak(userId: string): number {
    const streak = userStreakMap.get(userId);
    if (!streak) {
      return 0;
    }

    // Check if streak is still active
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActive = new Date(streak.lastActiveDate);
    lastActive.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // If last active was today or yesterday, streak is active
    if (lastActive.getTime() === today.getTime() || lastActive.getTime() === yesterday.getTime()) {
      return streak.currentStreak;
    }

    // Streak is broken
    return 0;
  },

  async getStreakStats(userId: string): Promise<StreakStats | null> {
    const streak = userStreakMap.get(userId);
    if (!streak) {
      return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const millisUntilReset = tomorrow.getTime() - Date.now();
    const daysUntilReset = Math.ceil(millisUntilReset / (1000 * 60 * 60 * 24));

    const lastActive = new Date(streak.lastActiveDate);
    lastActive.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isActiveToday = lastActive.getTime() === today.getTime();
    const xpBonus = this.getStreakXPBonus(streak.currentStreak);
    const milestone = this.getStreakMilestone(streak.currentStreak);

    return {
      userId,
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      isActiveToday,
      daysUntilReset,
      xpBonus,
      milestone,
    };
  },

  resetStreak(userId: string): void {
    const streak = userStreakMap.get(userId);
    if (!streak) return;

    streak.streakBrokenDate = new Date();
    streak.currentStreak = 0;

    userStreakMap.set(userId, streak);
  },

  getStreakXPBonus(currentStreak: number): number {
    // Base bonus increases with streak
    let bonus = 10; // 10 XP per day base

    // Additional bonus for milestones
    for (const reward of STREAK_REWARDS) {
      if (currentStreak >= reward.dayThreshold) {
        bonus = reward.xpBonus;
      }
    }

    return bonus;
  },

  getStreakMilestone(currentStreak: number): number | null {
    for (const reward of STREAK_REWARDS) {
      if (currentStreak === reward.dayThreshold) {
        return reward.dayThreshold;
      }
    }
    return null;
  },

  getUserStreak(userId: string): UserStreak | undefined {
    return userStreakMap.get(userId);
  },

  async getAllStreaks(): Promise<Map<string, UserStreak>> {
    return new Map(userStreakMap);
  },

  async getStreakLeaderboard(
    limit: number = 10
  ): Promise<(UserStreak & { username: string; rank: number })[]> {
    const allStreaks = await this.getAllStreaks();

    const leaderboardData = Array.from(allStreaks.values())
      .sort((a, b) => {
        // Sort by current streak (descending), then by longest streak
        if (b.currentStreak !== a.currentStreak) {
          return b.currentStreak - a.currentStreak;
        }
        return b.longestStreak - a.longestStreak;
      })
      .slice(0, limit)
      .map((streak, index) => ({
        ...streak,
        username: `User_${streak.userId.substring(0, 8)}`,
        rank: index + 1,
      }));

    return leaderboardData;
  },

  getStreakRewardConfig(): StreakReward[] {
    return [...STREAK_REWARDS];
  },

  async checkAndResetExpiredStreaks(): Promise<string[]> {
    const resetUsers: string[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    for (const [userId, streak] of userStreakMap.entries()) {
      const lastActive = new Date(streak.lastActiveDate);
      lastActive.setHours(0, 0, 0, 0);

      // If user hasn't been active since yesterday, reset their streak
      if (lastActive.getTime() < yesterday.getTime() && streak.currentStreak > 0) {
        this.resetStreak(userId);
        resetUsers.push(userId);
      }
    }

    return resetUsers;
  },

  async getStreakInsights(userId: string): Promise<{
    streak: StreakStats | null;
    nextMilestone: StreakReward | null;
    progressToNext: number;
    isRiskOfBreak: boolean;
  } | null> {
    const stats = await this.getStreakStats(userId);
    if (!stats) {
      return null;
    }

    // Find next milestone
    const nextMilestone = STREAK_REWARDS.find(r => r.dayThreshold > stats.currentStreak) || null;

    const progressToNext = nextMilestone
      ? (stats.currentStreak / nextMilestone.dayThreshold) * 100
      : 100;

    // Check if at risk of losing streak (not active today but was active yesterday)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isRiskOfBreak = !stats.isActiveToday && stats.daysUntilReset < 1;

    return {
      streak: stats,
      nextMilestone,
      progressToNext,
      isRiskOfBreak,
    };
  },

  // ===== ACHIEVEMENT NOTIFICATION METHODS =====

  async getNewAchievements(userId: string, since: Date): Promise<NewAchievementData[]> {
    const userAchs = await this.getUserAchievements(userId);

    const newAchs = userAchs
      .filter(ua => ua.unlockedAt && ua.unlockedAt > since && ua.unlockedAt.getTime() !== 0)
      .map(ua => {
        const achievement = ACHIEVEMENTS.find(a => a.id === ua.achievementId);
        return {
          achievement: achievement!,
          unlockedAt: ua.unlockedAt,
          xpReward: achievement?.xpReward || 0,
        };
      })
      .sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime());

    return newAchs;
  },

  async getNearlyCompletedAchievements(
    userId: string,
    threshold: number = 80
  ): Promise<NearCompletionAchievement[]> {
    const userAchs = await this.getUserAchievements(userId);
    const unlockedIds = new Set(
      userAchs.filter(a => a.unlockedAt && a.unlockedAt.getTime() !== 0).map(ua => ua.achievementId)
    );

    const nearlyCompleted = userAchs
      .filter(ua => !unlockedIds.has(ua.achievementId) && ua.progress > 0)
      .map(ua => {
        const achievement = ACHIEVEMENTS.find(a => a.id === ua.achievementId);
        if (!achievement) return null;

        const progressPercentage = (ua.progress / achievement.requirement) * 100;
        if (progressPercentage < threshold) return null;

        return {
          ...achievement,
          progress: ua.progress,
          requirement: achievement.requirement,
          progressPercentage,
        };
      })
      .filter((a): a is NearCompletionAchievement => a !== null)
      .sort((a, b) => b.progressPercentage - a.progressPercentage);

    return nearlyCompleted;
  },

  async createNotification(userId: string, notification: AchievementNotification): Promise<void> {
    const userNotifications = notificationsMap.get(userId) || [];
    userNotifications.push(notification);
    notificationsMap.set(userId, userNotifications);
  },

  async getUnreadNotifications(userId: string): Promise<AchievementNotification[]> {
    const userNotifications = notificationsMap.get(userId) || [];
    return userNotifications.filter(n => !n.read);
  },

  async getAllNotifications(userId: string): Promise<AchievementNotification[]> {
    return notificationsMap.get(userId) || [];
  },

  async markNotificationAsRead(userId: string, achievementId: string): Promise<void> {
    const userNotifications = notificationsMap.get(userId) || [];
    const notification = userNotifications.find(n => n.achievementId === achievementId);
    if (notification) {
      notification.read = true;
    }
  },

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    const userNotifications = notificationsMap.get(userId) || [];
    userNotifications.forEach(n => {
      n.read = true;
    });
  },

  async clearNotifications(userId: string): Promise<void> {
    notificationsMap.delete(userId);
  },

  async createRewardNotification(
    userId: string,
    achievementId: string,
    xpAwarded: number,
    tier?: AchievementTier
  ): Promise<AchievementRewardNotification> {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    const tracker = userXPMap.get(userId);

    const notification: AchievementRewardNotification = {
      userId,
      achievementId,
      achievementTitle: achievement?.title || 'Achievement',
      xpAwarded,
      totalXP: tracker?.totalXP || 0,
      tier,
      timestamp: new Date(),
    };

    return notification;
  },

  async getRecentNotifications(
    userId: string,
    hours: number = 24
  ): Promise<AchievementNotification[]> {
    const userNotifications = notificationsMap.get(userId) || [];
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    return userNotifications
      .filter(n => n.unlockedAt > cutoffTime)
      .sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime());
  },

  async getNotificationsSince(userId: string, since: Date): Promise<AchievementNotification[]> {
    const userNotifications = notificationsMap.get(userId) || [];

    return userNotifications
      .filter(n => n.unlockedAt > since)
      .sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime());
  },

  async getNotificationCount(userId: string): Promise<{ total: number; unread: number }> {
    const userNotifications = notificationsMap.get(userId) || [];
    const unreadCount = userNotifications.filter(n => !n.read).length;

    return {
      total: userNotifications.length,
      unread: unreadCount,
    };
  },

  async triggerAchievementUnlockedNotification(
    userId: string,
    achievementId: string
  ): Promise<AchievementRewardNotification | null> {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return null;

    // Create notification
    const notification: AchievementNotification = {
      userId,
      achievementId,
      type: 'unlocked',
      achievement,
      xpReward: achievement.xpReward,
      unlockedAt: new Date(),
      read: false,
    };

    await this.createNotification(userId, notification);

    // Create reward notification
    return this.createRewardNotification(
      userId,
      achievementId,
      achievement.xpReward,
      achievement.tier
    );
  },

  async triggerNearCompletionNotification(
    userId: string,
    achievementId: string,
    threshold: number = 90
  ): Promise<AchievementNotification | null> {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return null;

    const userAchs = await this.getUserAchievements(userId);
    const userAch = userAchs.find(ua => ua.achievementId === achievementId);

    if (!userAch) return null;

    const progressPercentage = (userAch.progress / achievement.requirement) * 100;
    if (progressPercentage < threshold) return null;

    const notification: AchievementNotification = {
      userId,
      achievementId,
      type: 'near_completion',
      achievement,
      xpReward: achievement.xpReward,
      progress: userAch.progress,
      requirement: achievement.requirement,
      unlockedAt: new Date(),
      read: false,
    };

    await this.createNotification(userId, notification);
    return notification;
  },

  async triggerMilestoneNotification(
    userId: string,
    achievementId: string
  ): Promise<AchievementNotification | null> {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement || !achievement.milestone) return null;

    const notification: AchievementNotification = {
      userId,
      achievementId,
      type: 'milestone',
      achievement,
      xpReward: achievement.xpReward,
      unlockedAt: new Date(),
      read: false,
    };

    await this.createNotification(userId, notification);
    return notification;
  },

  async triggerTierAchievedNotification(
    userId: string,
    tier: AchievementTier
  ): Promise<AchievementNotification | null> {
    const tierAchs = this.getAchievementsByTier(tier);
    if (tierAchs.length === 0) return null;

    // Use the highest XP achievement from the tier
    const topAch = tierAchs.sort((a, b) => b.xpReward - a.xpReward)[0];

    const notification: AchievementNotification = {
      userId,
      achievementId: topAch.id,
      type: 'tier_achieved',
      achievement: topAch,
      xpReward: topAch.xpReward,
      unlockedAt: new Date(),
      read: false,
    };

    await this.createNotification(userId, notification);
    return notification;
  },

  getUnreadCount(userId: string): number {
    const userNotifications = notificationsMap.get(userId) || [];
    return userNotifications.filter(n => !n.read).length;
  },

  setLastNotificationView(userId: string): void {
    lastNotificationViewMap.set(userId, new Date());
  },

  getLastNotificationView(userId: string): Date | undefined {
    return lastNotificationViewMap.get(userId);
  },

  // ===== SOCIAL FEATURES METHODS =====

  async compareAchievements(userId1: string, userId2: string): Promise<AchievementComparison> {
    const user1Achs = await this.getUserAchievements(userId1);
    const user2Achs = await this.getUserAchievements(userId2);

    const user1Unlocked = new Set(
      user1Achs
        .filter(a => a.unlockedAt && a.unlockedAt.getTime() !== 0)
        .map(ua => ua.achievementId)
    );
    const user2Unlocked = new Set(
      user2Achs
        .filter(a => a.unlockedAt && a.unlockedAt.getTime() !== 0)
        .map(ua => ua.achievementId)
    );

    const mutualIds = new Set([...user1Unlocked].filter(id => user2Unlocked.has(id)));
    const user1OnlyIds = new Set([...user1Unlocked].filter(id => !user2Unlocked.has(id)));
    const user2OnlyIds = new Set([...user2Unlocked].filter(id => !user1Unlocked.has(id)));

    const mutualAchievements = ACHIEVEMENTS.filter(a => mutualIds.has(a.id));
    const user1OnlyAchievements = ACHIEVEMENTS.filter(a => user1OnlyIds.has(a.id));
    const user2OnlyAchievements = ACHIEVEMENTS.filter(a => user2OnlyIds.has(a.id));

    const totalPossible = ACHIEVEMENTS.length;
    const mutualCount = mutualIds.size;
    const similarityPercentage = totalPossible > 0 ? (mutualCount / totalPossible) * 100 : 0;

    return {
      user1Id: userId1,
      user2Id: userId2,
      user1Username: `User_${userId1.substring(0, 8)}`,
      user2Username: `User_${userId2.substring(0, 8)}`,
      mutualAchievements,
      user1OnlyAchievements,
      user2OnlyAchievements,
      mutualCount,
      similarityPercentage,
    };
  },

  async getFriendsAchievements(userId: string): Promise<FriendAchievementData[]> {
    const friendIds = friendshipMap.get(userId) || new Set<string>();
    const friendsData: FriendAchievementData[] = [];

    for (const friendId of friendIds) {
      const friendAchs = await this.getUserAchievements(friendId);
      const unlockedCount = friendAchs.filter(
        a => a.unlockedAt && a.unlockedAt.getTime() !== 0
      ).length;
      const completionPercentage =
        ACHIEVEMENTS.length > 0 ? (unlockedCount / ACHIEVEMENTS.length) * 100 : 0;

      // Get recent unlocks (last 5)
      const recentUnlocks = friendAchs
        .filter(a => a.unlockedAt && a.unlockedAt.getTime() !== 0)
        .sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime())
        .slice(0, 5)
        .map(ua => ACHIEVEMENTS.find(a => a.id === ua.achievementId)!)
        .filter(a => a !== undefined);

      // Get highest tier
      const unlockedAchievements = friendAchs
        .filter(a => a.unlockedAt && a.unlockedAt.getTime() !== 0)
        .map(ua => ACHIEVEMENTS.find(a => a.id === ua.achievementId))
        .filter(a => a !== undefined && a.tier) as Achievement[];

      const highestTier =
        unlockedAchievements.length > 0
          ? this.getHighestTierUnlocked(unlockedAchievements)
          : AchievementTier.BRONZE;

      friendsData.push({
        userId: friendId,
        username: `User_${friendId.substring(0, 8)}`,
        totalAchievements: unlockedCount,
        completionPercentage,
        recentUnlocks,
        highestTier,
      });
    }

    return friendsData;
  },

  async getSocialLeaderboard(limit: number = 20): Promise<SocialLeaderboardEntry[]> {
    const allXPData = this.getAllUserXP();
    const leaderboardData: SocialLeaderboardEntry[] = [];

    for (const [userId, tracker] of allXPData) {
      const userAchs = await this.getUserAchievements(userId);
      const unlockedCount = userAchs.filter(
        a => a.unlockedAt && a.unlockedAt.getTime() !== 0
      ).length;
      const completionPercentage =
        ACHIEVEMENTS.length > 0 ? (unlockedCount / ACHIEVEMENTS.length) * 100 : 0;

      leaderboardData.push({
        userId,
        username: `User_${userId.substring(0, 8)}`,
        totalAchievements: unlockedCount,
        completionPercentage,
        totalXP: tracker.totalXP,
        rank: 0,
      });
    }

    // Sort by XP first, then achievement count
    leaderboardData.sort((a, b) => {
      if (b.totalXP !== a.totalXP) return b.totalXP - a.totalXP;
      return b.totalAchievements - a.totalAchievements;
    });

    // Assign ranks
    leaderboardData.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return leaderboardData.slice(0, limit);
  },

  async createShareableAchievementBadge(
    userId: string,
    achievementId: string
  ): Promise<ShareableAchievementBadge | null> {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return null;

    const userAchs = await this.getUserAchievements(userId);
    const userAch = userAchs.find(ua => ua.achievementId === achievementId);

    if (!userAch || !userAch.unlockedAt || userAch.unlockedAt.getTime() === 0) return null;

    // Determine badge color based on rarity
    const rarityColors: Record<string, string> = {
      common: '#CCCCCC',
      uncommon: '#00AA00',
      rare: '#0055FF',
      epic: '#AA00FF',
      legendary: '#FFAA00',
    };

    const badge: ShareableAchievementBadge['badge'] = {
      text: `${achievement.icon} ${achievement.title}`,
      icon: achievement.badgeIcon || achievement.icon,
      color: rarityColors[achievement.rarity] || '#CCCCCC',
    };

    return {
      userId,
      username: `User_${userId.substring(0, 8)}`,
      achievement,
      unlockedAt: userAch.unlockedAt,
      shareUrl: `/achievements/${achievementId}?user=${userId}`,
      badge,
    };
  },

  async addFriend(userId1: string, userId2: string): Promise<boolean> {
    if (userId1 === userId2) return false;

    const user1Friends = friendshipMap.get(userId1) || new Set();
    const user2Friends = friendshipMap.get(userId2) || new Set();

    user1Friends.add(userId2);
    user2Friends.add(userId1);

    friendshipMap.set(userId1, user1Friends);
    friendshipMap.set(userId2, user2Friends);

    return true;
  },

  async removeFriend(userId1: string, userId2: string): Promise<boolean> {
    const user1Friends = friendshipMap.get(userId1);
    const user2Friends = friendshipMap.get(userId2);

    if (!user1Friends || !user2Friends) return false;

    user1Friends.delete(userId2);
    user2Friends.delete(userId1);

    friendshipMap.set(userId1, user1Friends);
    friendshipMap.set(userId2, user2Friends);

    return true;
  },

  getFriends(userId: string): string[] {
    return Array.from(friendshipMap.get(userId) || new Set());
  },

  isFriend(userId1: string, userId2: string): boolean {
    const friends = friendshipMap.get(userId1);
    return friends ? friends.has(userId2) : false;
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const cached = userProfileMap.get(userId);
    if (cached) return cached;

    const userAchs = await this.getUserAchievements(userId);
    const unlockedCount = userAchs.filter(a => a.unlockedAt && a.unlockedAt.getTime() !== 0).length;
    const completionPercentage =
      ACHIEVEMENTS.length > 0 ? (unlockedCount / ACHIEVEMENTS.length) * 100 : 0;
    const tracker = userXPMap.get(userId);

    const unlockedAchievements = userAchs
      .filter(a => a.unlockedAt && a.unlockedAt.getTime() !== 0)
      .map(ua => ACHIEVEMENTS.find(a => a.id === ua.achievementId))
      .filter(a => a !== undefined && a.tier) as Achievement[];

    const highestTier =
      unlockedAchievements.length > 0
        ? this.getHighestTierUnlocked(unlockedAchievements)
        : AchievementTier.BRONZE;

    const profile: UserProfile = {
      userId,
      username: `User_${userId.substring(0, 8)}`,
      totalAchievements: unlockedCount,
      completionPercentage,
      totalXP: tracker?.totalXP || 0,
      highestTier,
      friendsList: this.getFriends(userId),
    };

    userProfileMap.set(userId, profile);
    return profile;
  },

  async updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile | null> {
    const profile = await this.getUserProfile(userId);
    if (!profile) return null;

    const updated = { ...profile, ...updates, userId };
    userProfileMap.set(userId, updated);

    return updated;
  },

  async getMutualFriends(userId1: string, userId2: string): Promise<string[]> {
    const user1Friends = new Set(this.getFriends(userId1));
    const user2Friends = new Set(this.getFriends(userId2));

    return Array.from(user1Friends).filter(id => user2Friends.has(id));
  },

  async getAchievementComparison(
    userId1: string,
    userId2: string
  ): Promise<{
    comparison: AchievementComparison;
    areFriends: boolean;
    mutualFriends: string[];
  } | null> {
    const comparison = await this.compareAchievements(userId1, userId2);
    const areFriends = this.isFriend(userId1, userId2);
    const mutualFriends = await this.getMutualFriends(userId1, userId2);

    return {
      comparison,
      areFriends,
      mutualFriends,
    };
  },

  async getFriendsLeaderboard(
    userId: string,
    limit: number = 20
  ): Promise<SocialLeaderboardEntry[]> {
    const friendIds = this.getFriends(userId);
    const leaderboardData: SocialLeaderboardEntry[] = [];

    for (const friendId of friendIds) {
      const userAchs = await this.getUserAchievements(friendId);
      const unlockedCount = userAchs.filter(
        a => a.unlockedAt && a.unlockedAt.getTime() !== 0
      ).length;
      const completionPercentage =
        ACHIEVEMENTS.length > 0 ? (unlockedCount / ACHIEVEMENTS.length) * 100 : 0;
      const tracker = userXPMap.get(friendId);

      leaderboardData.push({
        userId: friendId,
        username: `User_${friendId.substring(0, 8)}`,
        totalAchievements: unlockedCount,
        completionPercentage,
        totalXP: tracker?.totalXP || 0,
        rank: 0,
        friendsWith: true,
      });
    }

    // Sort by XP
    leaderboardData.sort((a, b) => b.totalXP - a.totalXP);

    // Assign ranks
    leaderboardData.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return leaderboardData.slice(0, limit);
  },

  // ===== SEASONAL ACHIEVEMENT METHODS =====

  async createSeason(season: SeasonConfig): Promise<void> {
    seasonConfigMap.set(season.id, season);
  },

  async getSeason(seasonId: string): Promise<SeasonConfig | undefined> {
    return seasonConfigMap.get(seasonId);
  },

  async getAllSeasons(): Promise<SeasonConfig[]> {
    return Array.from(seasonConfigMap.values());
  },

  async getActiveSeasons(): Promise<SeasonConfig[]> {
    const now = new Date();
    return Array.from(seasonConfigMap.values()).filter(
      s => s.startDate <= now && s.endDate >= now && s.isActive
    );
  },

  async getSeasonalAchievements(seasonId: string): Promise<SeasonalAchievement[]> {
    const season = seasonConfigMap.get(seasonId);
    if (!season) return [];

    const now = new Date();
    const isExpired = now > season.endDate;

    return ACHIEVEMENTS.filter(a => a.seasonId === seasonId).map(ach => ({
      ...ach,
      seasonId: season.id,
      seasonName: season.name,
      seasonStartDate: season.startDate,
      seasonEndDate: season.endDate,
      daysRemaining: Math.ceil((season.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      isExpired,
    })) as SeasonalAchievement[];
  },

  async getActiveSeasonsAchievements(): Promise<Map<string, SeasonalAchievement[]>> {
    const activeSeasons = await this.getActiveSeasons();
    const result = new Map<string, SeasonalAchievement[]>();

    for (const season of activeSeasons) {
      const achievements = await this.getSeasonalAchievements(season.id);
      result.set(season.id, achievements);
    }

    return result;
  },

  async getUserSeasonalAchievements(
    userId: string,
    seasonId: string
  ): Promise<SeasonalAchievement[]> {
    const seasonalAchs = await this.getSeasonalAchievements(seasonId);
    const userAchs = await this.getUserAchievements(userId);
    const unlockedIds = new Set(
      userAchs.filter(a => a.unlockedAt && a.unlockedAt.getTime() !== 0).map(a => a.achievementId)
    );

    return seasonalAchs.map(ach => ({
      ...ach,
      unlockedAt: userAchs.find(ua => ua.achievementId === ach.id)?.unlockedAt,
    }));
  },

  async getSeasonalLeaderboard(
    seasonId: string,
    limit: number = 20
  ): Promise<SeasonalLeaderboardEntry[]> {
    // Check cache first
    const cacheKey = `${seasonId}_${limit}`;
    if (seasonalLeaderboardCache.has(cacheKey)) {
      return seasonalLeaderboardCache.get(cacheKey) || [];
    }

    const leaderboardData: SeasonalLeaderboardEntry[] = [];
    const allUserProgress = userSeasonalProgressMap;

    for (const [userId, seasonMap] of allUserProgress) {
      const seasonalXP = seasonMap.get(seasonId) || 0;
      const userAchs = await this.getUserAchievements(userId);
      const seasonalAchievements = userAchs.filter(ua =>
        ACHIEVEMENTS.find(a => a.id === ua.achievementId && a.seasonId === seasonId)
      );

      const tracker = userXPMap.get(userId);
      leaderboardData.push({
        userId,
        username: `User_${userId.substring(0, 8)}`,
        avatar: '',
        totalXP: tracker?.totalXP || 0,
        level: Math.floor((tracker?.totalXP || 0) / 1000) + 1,
        achievements: userAchs.filter(a => a.unlockedAt && a.unlockedAt.getTime() !== 0).length,
        badges: 0,
        rank: 0,
        seasonId,
        seasonalXP,
        seasonalAchievements: seasonalAchievements.length,
      });
    }

    // Sort by seasonal XP first, then total XP
    leaderboardData.sort((a, b) => {
      if (b.seasonalXP !== a.seasonalXP) return b.seasonalXP - a.seasonalXP;
      return b.totalXP - a.totalXP;
    });

    // Assign ranks
    leaderboardData.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    const result = leaderboardData.slice(0, limit);
    seasonalLeaderboardCache.set(cacheKey, result);
    return result;
  },

  async trackSeasonalXP(userId: string, seasonId: string, amount: number): Promise<void> {
    if (!userSeasonalProgressMap.has(userId)) {
      userSeasonalProgressMap.set(userId, new Map());
    }

    const userSeasonMap = userSeasonalProgressMap.get(userId)!;
    const currentXP = userSeasonMap.get(seasonId) || 0;
    userSeasonMap.set(seasonId, currentXP + amount);

    // Also track in regular XP as achievement XP
    await this.trackUserXP(userId, amount, 'achievement');
  },

  async getUserSeasonalProgress(
    userId: string,
    seasonId: string
  ): Promise<{
    xp: number;
    achievements: number;
    rank?: number;
  }> {
    const userSeasonMap = userSeasonalProgressMap.get(userId);
    const xp = userSeasonMap?.get(seasonId) || 0;

    const userAchs = await this.getUserAchievements(userId);
    const achievements = userAchs.filter(ua =>
      ACHIEVEMENTS.find(a => a.id === ua.achievementId && a.seasonId === seasonId)
    ).length;

    const leaderboard = await this.getSeasonalLeaderboard(seasonId, 1000);
    const userEntry = leaderboard.find(e => e.userId === userId);
    const rank = userEntry?.rank;

    return { xp, achievements, rank };
  },

  async getSeasonTimeline(): Promise<{
    currentSeason?: SeasonConfig;
    upcomingSeason?: SeasonConfig;
    pastSeasons: SeasonConfig[];
  }> {
    const now = new Date();
    const seasons = Array.from(seasonConfigMap.values()).sort(
      (a, b) => b.startDate.getTime() - a.startDate.getTime()
    );

    const currentSeason = seasons.find(s => s.startDate <= now && s.endDate >= now);
    const upcomingSeason = seasons.find(s => s.startDate > now);
    const pastSeasons = seasons.filter(s => s.endDate < now);

    return {
      currentSeason,
      upcomingSeason,
      pastSeasons,
    };
  },

  async getSeasonalAchievementCount(seasonId: string): Promise<number> {
    return ACHIEVEMENTS.filter(a => a.seasonId === seasonId).length;
  },

  async getSeasonalCompletionPercentage(userId: string, seasonId: string): Promise<number> {
    const seasonalAchs = await this.getSeasonalAchievements(seasonId);
    if (seasonalAchs.length === 0) return 0;

    const userAchs = await this.getUserAchievements(userId);
    const unlockedIds = new Set(
      userAchs.filter(a => a.unlockedAt && a.unlockedAt.getTime() !== 0).map(a => a.achievementId)
    );

    const unlockedCount = seasonalAchs.filter(a => unlockedIds.has(a.id)).length;
    return (unlockedCount / seasonalAchs.length) * 100;
  },

  async expireSeasonalAchievements(seasonId: string): Promise<number> {
    const season = seasonConfigMap.get(seasonId);
    if (season) {
      season.isActive = false;
      seasonConfigMap.set(seasonId, season);
    }

    // Clear cache for this season
    Array.from(seasonalLeaderboardCache.keys())
      .filter(key => key.startsWith(seasonId))
      .forEach(key => seasonalLeaderboardCache.delete(key));

    return ACHIEVEMENTS.filter(a => a.seasonId === seasonId).length;
  },

  async getSeasonalRewards(
    userId: string,
    seasonId: string
  ): Promise<{
    totalSeasonalXP: number;
    seasonalAchievements: number;
    bonusXP: number;
    seasonReward?: string;
  }> {
    const progress = await this.getUserSeasonalProgress(userId, seasonId);
    const completion = await this.getSeasonalCompletionPercentage(userId, seasonId);

    // Calculate bonus based on completion
    let bonusXP = 0;
    if (completion === 100)
      bonusXP = 1000; // Perfect season
    else if (completion >= 75)
      bonusXP = 500; // 75%+
    else if (completion >= 50)
      bonusXP = 250; // 50%+
    else if (completion >= 25) bonusXP = 100; // 25%+

    let seasonReward = '';
    if (completion === 100) seasonReward = '👑 Season Master';
    else if (completion >= 75) seasonReward = '🌟 Season Champion';
    else if (completion >= 50) seasonReward = '⭐ Season Participant';

    return {
      totalSeasonalXP: progress.xp,
      seasonalAchievements: progress.achievements,
      bonusXP,
      seasonReward,
    };
  },

  async searchAchievements(query: string): Promise<AchievementSearchResult[]> {
    const lowerQuery = query.toLowerCase().trim();
    if (lowerQuery.length === 0) {
      return [];
    }

    const results: AchievementSearchResult[] = [];

    for (const achievement of ACHIEVEMENTS) {
      let matchScore = 0;
      let matchReason = '';

      const titleMatch = achievement.title
        .toLowerCase()
        .includes(lowerQuery);
      const descriptionMatch = achievement.description
        .toLowerCase()
        .includes(lowerQuery);

      if (titleMatch && descriptionMatch) {
        // Exact title match is weighted higher
        const titleDistance = calculateStringDistance(
          achievement.title.toLowerCase(),
          lowerQuery
        );
        matchScore = Math.min(100, 95 + titleDistance * 5);
        matchReason = 'both';
      } else if (titleMatch) {
        const titleDistance = calculateStringDistance(
          achievement.title.toLowerCase(),
          lowerQuery
        );
        // Boost score for exact/close matches
        matchScore = Math.min(100, 80 + titleDistance * 20);
        matchReason = 'title';
      } else if (descriptionMatch) {
        const descDistance = calculateStringDistance(
          achievement.description.toLowerCase(),
          lowerQuery
        );
        matchScore = Math.min(100, 60 + descDistance * 20);
        matchReason = 'description';
      }

      if (matchScore > 0) {
        results.push({
          achievement,
          matchScore,
          matchReason,
        });
      }
    }

    // Sort by match score (descending)
    return results.sort((a, b) => b.matchScore - a.matchScore);
  },

  async getAchievementsByStatus(
    userId: string,
    status: AchievementStatus
  ): Promise<Achievement[]> {
    const userAchs = userAchievements.get(userId) || [];
    const unlockedIds = new Set(
      userAchs.filter(ua => ua.unlockedAt.getTime() > 0).map(ua => ua.achievementId)
    );

    if (status === 'unlocked') {
      return ACHIEVEMENTS.filter(ach => unlockedIds.has(ach.id));
    } else if (status === 'locked') {
      const inProgressIds = new Set(
        userAchs.filter(ua => ua.progress > 0 && !unlockedIds.has(ua.achievementId))
          .map(ua => ua.achievementId)
      );
      return ACHIEVEMENTS.filter(
        ach => !unlockedIds.has(ach.id) && !inProgressIds.has(ach.id)
      );
    } else if (status === 'in-progress') {
      // Achievement is in progress if user has started it but not completed it
      return ACHIEVEMENTS.filter(ach => {
        const userAch = userAchs.find(ua => ua.achievementId === ach.id);
        return (
          userAch &&
          userAch.progress > 0 &&
          userAch.progress < ach.requirement &&
          !unlockedIds.has(ach.id)
        );
      });
    }

    return [];
  },
};
