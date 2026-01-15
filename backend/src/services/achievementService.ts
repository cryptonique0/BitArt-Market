import {
  Achievement,
  UserAchievement,
  AchievementType,
  AchievementTier,
} from '../types/gamification';

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
};
