import { Router, Request, Response } from 'express';
import analyticsService from '../services/analyticsService';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Protect all routes with JWT authentication
router.use(authenticateToken);

// ============ USER STATISTICS ============

/**
 * Get user achievement statistics
 * GET /api/analytics/user/:userId/achievements
 */
router.get('/user/:userId/achievements', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const stats = await analyticsService.getUserAchievementStats(userId);

    res.json({
      success: true,
      data: stats,
      message: 'User achievement statistics retrieved successfully',
    });
  } catch (error) {
    console.error('Failed to get user stats:', error);
    res.status(500).json({ error: 'Failed to retrieve user statistics' });
  }
});

/**
 * Get summary of user stats
 * GET /api/analytics/user/:userId/summary
 */
router.get('/user/:userId/summary', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const stats = await analyticsService.getUserAchievementStats(userId);

    res.json({
      success: true,
      data: {
        userId,
        totalXP: stats.totalXP,
        currentLevel: stats.currentLevel,
        totalAchievementsUnlocked: stats.totalAchievementsUnlocked,
        totalAchievementsAvailable: stats.totalAchievementsAvailable,
        overallUnlockRate: stats.overallUnlockRate,
        recentUnlocksCount: stats.recentUnlocksCount,
        achievements: stats.achievements,
        lastActivityDate: stats.lastActivityDate,
      },
      message: 'User summary retrieved successfully',
    });
  } catch (error) {
    console.error('Failed to get user summary:', error);
    res.status(500).json({ error: 'Failed to retrieve user summary' });
  }
});

// ============ ACHIEVEMENT POPULARITY ============

/**
 * Get popularity metrics for an achievement
 * GET /api/analytics/achievements/:achievementId/popularity
 */
router.get('/achievements/:achievementId/popularity', async (req: Request, res: Response) => {
  try {
    const { achievementId } = req.params;

    if (!achievementId) {
      return res.status(400).json({ error: 'achievementId is required' });
    }

    const popularity = await analyticsService.getAchievementPopularity(achievementId);

    res.json({
      success: true,
      data: popularity,
      message: 'Achievement popularity retrieved successfully',
    });
  } catch (error) {
    console.error('Failed to get achievement popularity:', error);
    res.status(500).json({ error: 'Failed to retrieve achievement popularity' });
  }
});

/**
 * Get unlock rate for an achievement
 * GET /api/analytics/achievements/:achievementId/unlock-rate
 */
router.get('/achievements/:achievementId/unlock-rate', async (req: Request, res: Response) => {
  try {
    const { achievementId } = req.params;

    if (!achievementId) {
      return res.status(400).json({ error: 'achievementId is required' });
    }

    const unlockRate = await analyticsService.getAchievementUnlockRate(achievementId);

    res.json({
      success: true,
      data: unlockRate,
      message: 'Achievement unlock rate retrieved successfully',
    });
  } catch (error) {
    console.error('Failed to get unlock rate:', error);
    res.status(500).json({ error: 'Failed to retrieve unlock rate' });
  }
});

/**
 * Get unlock rates for all achievements
 * GET /api/analytics/achievements/unlock-rates?sort=asc&limit=50
 */
router.get('/achievements-rates', async (req: Request, res: Response) => {
  try {
    const { sort = 'desc', limit = '50' } = req.query;

    const unlockRates = await analyticsService.getAchievementUnlockRates();

    // Apply sort
    let sorted = unlockRates;
    if (sort === 'asc') {
      sorted = unlockRates.sort((a, b) => a.unlockRate - b.unlockRate);
    }

    // Apply limit
    const limitNum = parseInt(limit as string);
    const limited = sorted.slice(0, limitNum);

    res.json({
      success: true,
      count: limited.length,
      total: unlockRates.length,
      data: limited,
      message: `Retrieved ${limited.length} achievement unlock rates`,
    });
  } catch (error) {
    console.error('Failed to get unlock rates:', error);
    res.status(500).json({ error: 'Failed to retrieve unlock rates' });
  }
});

/**
 * Get engagement metrics for an achievement
 * GET /api/analytics/achievements/:achievementId/engagement
 */
router.get('/achievements/:achievementId/engagement', async (req: Request, res: Response) => {
  try {
    const { achievementId } = req.params;

    if (!achievementId) {
      return res.status(400).json({ error: 'achievementId is required' });
    }

    const metrics = await analyticsService.getAchievementEngagementMetrics(achievementId);

    res.json({
      success: true,
      data: metrics,
      message: 'Achievement engagement metrics retrieved successfully',
    });
  } catch (error) {
    console.error('Failed to get engagement metrics:', error);
    res.status(500).json({ error: 'Failed to retrieve engagement metrics' });
  }
});

// ============ SYSTEM-WIDE STATISTICS ============

/**
 * Get comprehensive system statistics
 * GET /api/analytics/system/stats
 */
router.get('/system/stats', async (req: Request, res: Response) => {
  try {
    const stats = await analyticsService.getSystemwideStats();

    res.json({
      success: true,
      data: stats,
      message: 'System-wide statistics retrieved successfully',
    });
  } catch (error) {
    console.error('Failed to get system stats:', error);
    res.status(500).json({ error: 'Failed to retrieve system statistics' });
  }
});

/**
 * Get dashboard overview
 * GET /api/analytics/dashboard/overview
 */
router.get('/dashboard/overview', async (req: Request, res: Response) => {
  try {
    const stats = await analyticsService.getSystemwideStats();

    res.json({
      success: true,
      data: {
        summary: {
          totalUsers: stats.totalUsers,
          totalAchievements: stats.totalUnlockedAchievements,
          totalXPDistributed: stats.totalXPDistributed,
          averageUserLevel: stats.averageUserLevel,
        },
        topMetrics: {
          mostPopular: stats.mostPopularAchievement,
          rarest: stats.rarestAchievement,
          averageXPPerUser: stats.averageXPPerUser,
          averageAchievementsPerUser: stats.averageAchievementsPerUser,
        },
        seasonal: {
          totalSeasonalAchievements: stats.totalSeasonalAchievements,
          activeSeasons: stats.activeSeasons,
        },
        distribution: {
          byRarity: stats.unlockRateByRarity,
          byType: stats.unlockRateByType,
        },
      },
      message: 'Dashboard overview retrieved successfully',
    });
  } catch (error) {
    console.error('Failed to get dashboard overview:', error);
    res.status(500).json({ error: 'Failed to retrieve dashboard overview' });
  }
});

// ============ COMPARISON & RANKINGS ============

/**
 * Get most unlocked achievements
 * GET /api/analytics/achievements/top-unlocked?limit=10
 */
router.get('/achievements/top-unlocked', async (req: Request, res: Response) => {
  try {
    const { limit = '10' } = req.query;

    const unlockRates = await analyticsService.getAchievementUnlockRates();
    const topUnlocked = unlockRates.slice(0, parseInt(limit as string));

    res.json({
      success: true,
      count: topUnlocked.length,
      data: topUnlocked,
      message: `Retrieved top ${topUnlocked.length} most unlocked achievements`,
    });
  } catch (error) {
    console.error('Failed to get top unlocked achievements:', error);
    res.status(500).json({ error: 'Failed to retrieve top unlocked achievements' });
  }
});

/**
 * Get rarest achievements
 * GET /api/analytics/achievements/rarest?limit=10
 */
router.get('/achievements/rarest', async (req: Request, res: Response) => {
  try {
    const { limit = '10' } = req.query;

    const unlockRates = await analyticsService.getAchievementUnlockRates();
    const rarest = unlockRates.reverse().slice(0, parseInt(limit as string));

    res.json({
      success: true,
      count: rarest.length,
      data: rarest,
      message: `Retrieved ${rarest.length} rarest achievements`,
    });
  } catch (error) {
    console.error('Failed to get rarest achievements:', error);
    res.status(500).json({ error: 'Failed to retrieve rarest achievements' });
  }
});

/**
 * Get trending achievements (high engagement)
 * GET /api/analytics/achievements/trending?limit=10
 */
router.get('/achievements/trending', async (req: Request, res: Response) => {
  try {
    const { limit = '10' } = req.query;

    const unlockRates = await analyticsService.getAchievementUnlockRates();

    // Sort by recent unlock activity
    const trending = unlockRates
      .filter(a => a.trend === 'increasing')
      .slice(0, parseInt(limit as string));

    res.json({
      success: true,
      count: trending.length,
      data: trending,
      message: `Retrieved ${trending.length} trending achievements`,
    });
  } catch (error) {
    console.error('Failed to get trending achievements:', error);
    res.status(500).json({ error: 'Failed to retrieve trending achievements' });
  }
});

export default router;
