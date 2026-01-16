import { prisma } from '../utils/prismaClient';
import {
  UserAchievementStats,
  AchievementPopularity,
  AchievementUnlockRate,
  SystemwideStats,
  AchievementEngagementMetrics,
  UserProgressTimeline,
  ComparisonStats,
  AchievementRarity,
  DemographicStats,
} from '../types/gamification';

/**
 * Analytics Service for Gamification System
 *
 * Provides comprehensive statistics and analytics:
 * - User achievement statistics
 * - Achievement popularity metrics
 * - System-wide analytics
 * - Engagement metrics
 * - Comparative analysis
 *
 * All queries optimized with indexes
 */

// ============ USER STATISTICS ============

/**
 * Get comprehensive achievement statistics for a user
 */
export async function getUserAchievementStats(userId: string): Promise<UserAchievementStats> {
  try {
    // Get all achievements
    const allAchievements = await prisma.achievement.findMany();
    const totalAvailable = allAchievements.length;

    // Get user's achievements
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
    });

    // Get user's level
    const userLevel = await prisma.userLevel.findUnique({
      where: { userId },
    });

    // Get user's streak
    const userStreak = await prisma.userStreak.findUnique({
      where: { userId },
    });

    // Separate by status
    const unlocked = userAchievements.filter((ua: any) => ua.unlockedAt);
    const inProgress = userAchievements.filter((ua: any) => ua.progress > 0 && ua.progress < 100);
    const locked = totalAvailable - userAchievements.length;

    // Calculate unlock rate
    const overallUnlockRate = totalAvailable > 0 ? (unlocked.length / totalAvailable) * 100 : 0;

    // Calculate average progress on locked
    const lockedProgress = userAchievements.filter((ua: any) => ua.progress < 100);
    const averageProgressOnLocked =
      lockedProgress.length > 0
        ? lockedProgress.reduce((sum: number, ua: any) => sum + ua.progress, 0) /
          lockedProgress.length
        : 0;

    // Get recent unlocks (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUnlocks = unlocked.filter((ua: any) => ua.unlockedAt! > thirtyDaysAgo);

    // Calculate by type
    const byType: Record<string, any> = {};
    const typeGroups = allAchievements.reduce(
      (acc: Record<string, any[]>, ach: any) => {
        if (!acc[ach.type]) acc[ach.type] = [];
        acc[ach.type].push(ach);
        return acc;
      },
      {} as Record<string, any[]>
    );

    for (const [type, achievements] of Object.entries(typeGroups)) {
      const unlockedCount = userAchievements.filter(
        (ua: any) =>
          (achievements).map((a: any) => a.id).includes(ua.achievementId) && ua.unlockedAt
      ).length;
      byType[type] = {
        unlocked: unlockedCount,
        total: achievements.length,
        unlockedRate: (unlockedCount / achievements.length) * 100,
      };
    }

    // Calculate by rarity
    const byRarity: Record<string, any> = {};
    const rarityGroups = allAchievements.reduce(
      (acc: Record<string, any[]>, ach: any) => {
        if (!acc[ach.rarity]) acc[ach.rarity] = [];
        acc[ach.rarity].push(ach);
        return acc;
      },
      {} as Record<string, any[]>
    );

    for (const [rarity, achievements] of Object.entries(rarityGroups)) {
      const unlockedCount = userAchievements.filter(
        (ua: any) =>
          (achievements).map((a: any) => a.id).includes(ua.achievementId) && ua.unlockedAt
      ).length;
      byRarity[rarity] = {
        unlocked: unlockedCount,
        total: achievements.length,
        unlockedRate: (unlockedCount / achievements.length) * 100,
      };
    }

    // Calculate by tier
    const byTier: Record<string, any> = {};
    const tierGroups = allAchievements.reduce(
      (acc: Record<string, any[]>, ach: any) => {
        if (!acc[ach.tier || 'unassigned']) acc[ach.tier || 'unassigned'] = [];
        acc[ach.tier || 'unassigned'].push(ach);
        return acc;
      },
      {} as Record<string, any[]>
    );

    for (const [tier, achievements] of Object.entries(tierGroups)) {
      const unlockedCount = userAchievements.filter(
        (ua: any) =>
          (achievements).map((a: any) => a.id).includes(ua.achievementId) && ua.unlockedAt
      ).length;
      byTier[tier] = {
        unlocked: unlockedCount,
        total: achievements.length,
        unlockedRate: (unlockedCount / achievements.length) * 100,
      };
    }

    // Get first and last unlock dates
    const sortedUnlocks = unlocked.sort(
      (a: any, b: any) => a.unlockedAt!.getTime() - b.unlockedAt!.getTime()
    );
    const firstUnlockDate = sortedUnlocks.length > 0 ? sortedUnlocks[0].unlockedAt : undefined;
    const lastUnlockDate =
      sortedUnlocks.length > 0 ? sortedUnlocks[sortedUnlocks.length - 1].unlockedAt : undefined;

    // Calculate average days to unlock
    let averageDaysToUnlock: number | undefined;
    if (firstUnlockDate && lastUnlockDate) {
      const totalDays =
        (lastUnlockDate.getTime() - firstUnlockDate.getTime()) / (1000 * 60 * 60 * 24);
      averageDaysToUnlock = unlocked.length > 0 ? totalDays / unlocked.length : 0;
    }

    return {
      userId,
      totalXP: userLevel?.totalXP || 0,
      currentLevel: userLevel?.currentLevel || 1,
      totalAchievementsUnlocked: unlocked.length,
      totalAchievementsAvailable: totalAvailable,
      overallUnlockRate: Math.round(overallUnlockRate * 100) / 100,
      averageProgressOnLockedAchievements: Math.round(averageProgressOnLocked * 100) / 100,
      recentUnlocksCount: recentUnlocks.length,
      achievements: {
        locked,
        inProgress: inProgress.length,
        unlocked: unlocked.length,
      },
      byType,
      byRarity,
      byTier,
      streakStats: {
        currentStreak: userStreak?.currentStreak || 0,
        longestStreak: userStreak?.longestStreak || 0,
        totalStreakDays: userStreak?.totalStreakDays || 0,
      },
      lastActivityDate: new Date(),
      firstUnlockDate,
      averageDaysToUnlock,
    };
  } catch (error) {
    console.error('Failed to get user achievement stats:', error);
    throw error;
  }
}

// ============ ACHIEVEMENT POPULARITY ============

/**
 * Get popularity metrics for an achievement
 */
export async function getAchievementPopularity(
  achievementId: string
): Promise<AchievementPopularity> {
  try {
    // Get achievement
    const achievement = await prisma.achievement.findUnique({
      where: { id: achievementId },
    });

    if (!achievement) {
      throw new Error(`Achievement ${achievementId} not found`);
    }

    // Get total unlocks
    const unlockedRecords = await prisma.userAchievement.findMany({
      where: {
        achievementId,
        unlockedAt: { not: null },
      },
    });

    const totalUnlocks = unlockedRecords.length;
    const uniqueUsers = new Set(unlockedRecords.map((r: any) => r.userId)).size;

    // Get total users
    const totalUsers = await prisma.user.count();

    // Calculate unlock rate
    const unlockRate = totalUsers > 0 ? (totalUnlocks / totalUsers) * 100 : 0;

    // Get all records (locked and unlocked)
    const allRecords = await prisma.userAchievement.findMany({
      where: { achievementId },
    });

    // Get locked user average progress
    const lockedRecords = allRecords.filter((r: any) => !r.unlockedAt);
    const averageProgressByLockedUsers =
      lockedRecords.length > 0
        ? lockedRecords.reduce((sum: number, r: any) => sum + r.progress, 0) / lockedRecords.length
        : 0;

    // Calculate days to unlock median
    const timesToUnlock = unlockedRecords
      .map((r: any) => {
        const createdDate = r.unlockedAt || new Date();
        const days = Math.ceil(createdDate.getTime() / (1000 * 60 * 60 * 24));
        return days;
      })
      .sort((a: number, b: number) => a - b);

    const daysToUnlockMedian =
      timesToUnlock.length > 0 ? timesToUnlock[Math.floor(timesToUnlock.length / 2)] : undefined;

    // Calculate trending score (popularity over time)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUnlocks = unlockedRecords.filter(r => r.unlockedAt > thirtyDaysAgo);
    const trendingScore = Math.min(100, (recentUnlocks.length / Math.max(1, totalUnlocks)) * 100);

    // Determine popularity level
    const isPopular = unlockRate > 50;
    const isRare = unlockRate < 10;

    return {
      achievementId,
      achievement,
      totalUnlocks,
      uniqueUsers,
      unlockRate: Math.round(unlockRate * 100) / 100,
      averageProgressByLockedUsers: Math.round(averageProgressByLockedUsers * 100) / 100,
      daysToUnlockMedian,
      trendingScore: Math.round(trendingScore * 100) / 100,
      isPopular,
      isRare,
    };
  } catch (error) {
    console.error('Failed to get achievement popularity:', error);
    throw error;
  }
}

// ============ UNLOCK RATES ============

/**
 * Get unlock rate for all achievements
 */
export async function getAchievementUnlockRates(): Promise<AchievementUnlockRate[]> {
  try {
    const achievements = await prisma.achievement.findMany();
    const totalUsers = await prisma.user.count();

    const rates: AchievementUnlockRate[] = [];

    for (const achievement of achievements) {
      const unlockCount = await prisma.userAchievement.count({
        where: {
          achievementId: achievement.id,
          unlockedAt: { not: null },
        },
      });

      const unlockRate = totalUsers > 0 ? (unlockCount / totalUsers) * 100 : 0;

      // Determine popularity level
      let popularity: 'legendary' | 'rare' | 'uncommon' | 'common' = 'common';
      if (unlockRate < 5) popularity = 'legendary';
      else if (unlockRate < 15) popularity = 'rare';
      else if (unlockRate < 40) popularity = 'uncommon';

      // Determine trend (simplified - would compare with previous data)
      const trend: 'increasing' | 'stable' | 'decreasing' = 'stable';

      rates.push({
        achievementId: achievement.id,
        title: achievement.title,
        unlockRate: Math.round(unlockRate * 100) / 100,
        totalUnlocks: unlockCount,
        totalUsers,
        popularity,
        trend,
      });
    }

    // Sort by unlock rate
    return rates.sort((a, b) => b.unlockRate - a.unlockRate);
  } catch (error) {
    console.error('Failed to get achievement unlock rates:', error);
    throw error;
  }
}

/**
 * Get unlock rate for a specific achievement
 */
export async function getAchievementUnlockRate(
  achievementId: string
): Promise<AchievementUnlockRate> {
  try {
    const achievement = await prisma.achievement.findUnique({
      where: { id: achievementId },
    });

    if (!achievement) {
      throw new Error(`Achievement ${achievementId} not found`);
    }

    const totalUsers = await prisma.user.count();
    const unlockedCount = await prisma.userAchievement.count({
      where: {
        achievementId,
        unlockedAt: { not: null },
      },
    });

    const unlockRate = totalUsers > 0 ? (unlockedCount / totalUsers) * 100 : 0;

    let popularity: 'legendary' | 'rare' | 'uncommon' | 'common' = 'common';
    if (unlockRate < 5) popularity = 'legendary';
    else if (unlockRate < 15) popularity = 'rare';
    else if (unlockRate < 40) popularity = 'uncommon';

    return {
      achievementId,
      title: achievement.title,
      unlockRate: Math.round(unlockRate * 100) / 100,
      totalUnlocks: unlockedCount,
      totalUsers,
      popularity,
      trend: 'stable',
    };
  } catch (error) {
    console.error('Failed to get unlock rate:', error);
    throw error;
  }
}

// ============ SYSTEM-WIDE STATISTICS ============

/**
 * Get comprehensive system-wide statistics
 */
export async function getSystemwideStats(): Promise<SystemwideStats> {
  try {
    // Count users
    const totalUsers = await prisma.user.count();

    // Count total unlocked achievements
    const totalUnlockedCount = await prisma.userAchievement.count({
      where: { unlockedAt: { not: null } },
    });

    // Sum total XP
    const xpResult = await prisma.xPTransaction.aggregate({
      _sum: { amount: true },
    });
    const totalXPDistributed = xpResult._sum.amount || 0;

    // Calculate averages
    const averageXPPerUser = totalUsers > 0 ? totalXPDistributed / totalUsers : 0;
    const averageAchievementsPerUser = totalUsers > 0 ? totalUnlockedCount / totalUsers : 0;

    // Get level data
    const levels = await prisma.userLevel.aggregate({
      _avg: { currentLevel: true },
    });
    const averageUserLevel = levels._avg.currentLevel || 1;

    // Get all achievements
    const allAchievements = await prisma.achievement.findMany();

    // Calculate unlock rates by type
    const unlockRateByType: Record<string, number> = {};
    const typeGroups = allAchievements.reduce(
      (acc, ach) => {
        if (!acc[ach.type]) acc[ach.type] = [];
        acc[ach.type].push(ach);
        return acc;
      },
      {} as Record<string, any[]>
    );

    for (const [type, achievements] of Object.entries(typeGroups)) {
      const unlockedCount = await prisma.userAchievement.count({
        where: {
          achievementId: { in: achievements.map(a => a.id) },
          unlockedAt: { not: null },
        },
      });
      const totalCount = achievements.length * totalUsers;
      unlockRateByType[type] = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;
    }

    // Calculate unlock rates by rarity
    const unlockRateByRarity: Record<string, number> = {};
    const rarityGroups = allAchievements.reduce(
      (acc, ach) => {
        if (!acc[ach.rarity]) acc[ach.rarity] = [];
        acc[ach.rarity].push(ach);
        return acc;
      },
      {} as Record<string, any[]>
    );

    for (const [rarity, achievements] of Object.entries(rarityGroups)) {
      const unlockedCount = await prisma.userAchievement.count({
        where: {
          achievementId: { in: achievements.map(a => a.id) },
          unlockedAt: { not: null },
        },
      });
      const totalCount = achievements.length * totalUsers;
      unlockRateByRarity[rarity] = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;
    }

    // Get most and least popular achievements
    const unlockRates = await getAchievementUnlockRates();
    const mostPopular = unlockRates[0];
    const rarest = unlockRates[unlockRates.length - 1];

    // Count seasonal achievements
    const totalSeasonalAchievements = allAchievements.filter(a => a.isSeasonal).length;

    // Count active seasons
    const now = new Date();
    const activeSeasons = await prisma.seasonConfig.count({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    return {
      totalUsers,
      totalUnlockedAchievements: totalUnlockedCount,
      totalXPDistributed,
      averageXPPerUser: Math.round(averageXPPerUser * 100) / 100,
      averageAchievementsPerUser: Math.round(averageAchievementsPerUser * 100) / 100,
      mostPopularAchievement: mostPopular,
      rarestAchievement: rarest,
      averageUserLevel: Math.round(averageUserLevel * 100) / 100,
      unlockRateByType,
      unlockRateByRarity,
      totalSeasonalAchievements,
      activeSeasons,
    };
  } catch (error) {
    console.error('Failed to get system-wide stats:', error);
    throw error;
  }
}

// ============ ENGAGEMENT METRICS ============

/**
 * Get engagement metrics for an achievement
 */
export async function getAchievementEngagementMetrics(
  achievementId: string
): Promise<AchievementEngagementMetrics> {
  try {
    const achievement = await prisma.achievement.findUnique({
      where: { id: achievementId },
    });

    if (!achievement) {
      throw new Error(`Achievement ${achievementId} not found`);
    }

    // Get recent unlocks (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUnlocks = await prisma.userAchievement.count({
      where: {
        achievementId,
        unlockedAt: { gte: sevenDaysAgo },
      },
    });

    // Get total unlocks
    const totalUnlocks = await prisma.userAchievement.count({
      where: {
        achievementId,
        unlockedAt: { not: null },
      },
    });

    // Calculate unlock velocity (unlocks per day)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const unlocksLast30Days = await prisma.userAchievement.count({
      where: {
        achievementId,
        unlockedAt: { gte: thirtyDaysAgo },
      },
    });

    const unlockVelocity = unlocksLast30Days / 30;

    // Get users in progress
    const usersInProgress = await prisma.userAchievement.count({
      where: {
        achievementId,
        progress: { gt: 0, lt: 100 },
      },
    });

    // Get average progress
    const progressResult = await prisma.userAchievement.aggregate({
      where: { achievementId },
      _avg: { progress: true },
    });

    const averageProgressPercentage = progressResult._avg.progress || 0;

    // Calculate engagement score
    const engagementScore = Math.min(
      100,
      (unlockVelocity * 10 +
        (usersInProgress / Math.max(1, totalUnlocks)) * 50 +
        averageProgressPercentage) /
        3
    );

    const isEngaging = engagementScore > 50;

    return {
      achievementId,
      unlockVelocity: Math.round(unlockVelocity * 100) / 100,
      recentUnlocks,
      engagementScore: Math.round(engagementScore * 100) / 100,
      isEngaging,
      usersInProgress,
      averageProgressPercentage: Math.round(averageProgressPercentage * 100) / 100,
    };
  } catch (error) {
    console.error('Failed to get engagement metrics:', error);
    throw error;
  }
}

export default {
  getUserAchievementStats,
  getAchievementPopularity,
  getAchievementUnlockRates,
  getAchievementUnlockRate,
  getSystemwideStats,
  getAchievementEngagementMetrics,
};
