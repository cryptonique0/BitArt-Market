import { Router, Request, Response } from 'express';
import persistenceService from '../services/persistenceService';
import databaseService from '../services/databaseService';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Protect all routes with JWT authentication middleware
router.use(authenticateToken);

// ============ SAVE OPERATIONS ============

/**
 * Save achievement unlock
 * POST /api/persistence/achievements/save
 */
router.post('/achievements/save', async (req: Request, res: Response) => {
  try {
    const { userId, achievementId, progress } = req.body;

    if (!userId || !achievementId) {
      return res.status(400).json({ error: 'userId and achievementId are required' });
    }

    const result = await persistenceService.saveUserAchievement(
      userId,
      achievementId,
      progress || 0
    );

    res.json({
      success: true,
      achievement: result,
      message: 'Achievement saved successfully',
    });
  } catch (error) {
    console.error('Failed to save achievement:', error);
    res.status(500).json({ error: 'Failed to save achievement' });
  }
});

/**
 * Save user level progress
 * POST /api/persistence/level/save
 */
router.post('/level/save', async (req: Request, res: Response) => {
  try {
    const { userId, level, totalXP, xpInCurrentLevel, xpForNextLevel } = req.body;

    if (!userId || level === undefined || totalXP === undefined) {
      return res.status(400).json({
        error: 'userId, level, and totalXP are required',
      });
    }

    const result = await persistenceService.saveUserLevel(
      userId,
      level,
      totalXP,
      xpInCurrentLevel || 0,
      xpForNextLevel || 0
    );

    res.json({
      success: true,
      level: result,
      message: 'User level saved successfully',
    });
  } catch (error) {
    console.error('Failed to save user level:', error);
    res.status(500).json({ error: 'Failed to save user level' });
  }
});

/**
 * Save XP transaction
 * POST /api/persistence/xp/save
 */
router.post('/xp/save', async (req: Request, res: Response) => {
  try {
    const { userId, amount, reason, relatedId } = req.body;

    if (!userId || !amount || !reason) {
      return res.status(400).json({
        error: 'userId, amount, and reason are required',
      });
    }

    const result = await persistenceService.saveXPTransaction(userId, amount, reason, relatedId);

    res.json({
      success: true,
      transaction: result,
      message: 'XP transaction saved successfully',
    });
  } catch (error) {
    console.error('Failed to save XP transaction:', error);
    res.status(500).json({ error: 'Failed to save XP transaction' });
  }
});

/**
 * Save seasonal progress
 * POST /api/persistence/seasonal/save
 */
router.post('/seasonal/save', async (req: Request, res: Response) => {
  try {
    const { userId, seasonId, xpEarned } = req.body;

    if (!userId || !seasonId || xpEarned === undefined) {
      return res.status(400).json({
        error: 'userId, seasonId, and xpEarned are required',
      });
    }

    const result = await persistenceService.saveSeasonalProgress(userId, seasonId, xpEarned);

    res.json({
      success: true,
      progress: result,
      message: 'Seasonal progress saved successfully',
    });
  } catch (error) {
    console.error('Failed to save seasonal progress:', error);
    res.status(500).json({ error: 'Failed to save seasonal progress' });
  }
});

// ============ DELETE OPERATIONS ============

/**
 * Delete achievement
 * DELETE /api/persistence/achievements/:achievementId
 */
router.delete('/achievements/:achievementId', async (req: Request, res: Response) => {
  try {
    const { achievementId } = req.params;
    const { userId } = req.body;

    if (!userId || !achievementId) {
      return res.status(400).json({ error: 'userId and achievementId are required' });
    }

    const deleted = await persistenceService.deleteUserAchievement(userId, achievementId);

    if (deleted) {
      res.json({ success: true, message: 'Achievement deleted successfully' });
    } else {
      res.status(404).json({ error: 'Achievement not found' });
    }
  } catch (error) {
    console.error('Failed to delete achievement:', error);
    res.status(500).json({ error: 'Failed to delete achievement' });
  }
});

/**
 * Delete all user achievements (reset)
 * DELETE /api/persistence/achievements/user/:userId
 */
router.delete('/achievements/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const count = await persistenceService.deleteUserAllAchievements(userId);

    res.json({
      success: true,
      deletedCount: count,
      message: `Deleted ${count} achievements for user ${userId}`,
    });
  } catch (error) {
    console.error('Failed to delete user achievements:', error);
    res.status(500).json({ error: 'Failed to delete user achievements' });
  }
});

/**
 * Delete XP transaction
 * DELETE /api/persistence/xp/:transactionId
 */
router.delete('/xp/:transactionId', async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;

    if (!transactionId) {
      return res.status(400).json({ error: 'transactionId is required' });
    }

    const deleted = await persistenceService.deleteXPTransaction(transactionId);

    if (deleted) {
      res.json({ success: true, message: 'XP transaction deleted successfully' });
    } else {
      res.status(404).json({ error: 'Transaction not found' });
    }
  } catch (error) {
    console.error('Failed to delete XP transaction:', error);
    res.status(500).json({ error: 'Failed to delete XP transaction' });
  }
});

/**
 * Delete seasonal progress
 * DELETE /api/persistence/seasonal/:seasonId
 */
router.delete('/seasonal/:seasonId', async (req: Request, res: Response) => {
  try {
    const { seasonId } = req.params;
    const { userId } = req.body;

    if (!userId || !seasonId) {
      return res.status(400).json({ error: 'userId and seasonId are required' });
    }

    const deleted = await persistenceService.deleteSeasonalProgress(userId, seasonId);

    if (deleted) {
      res.json({ success: true, message: 'Seasonal progress deleted successfully' });
    } else {
      res.status(404).json({ error: 'Seasonal progress not found' });
    }
  } catch (error) {
    console.error('Failed to delete seasonal progress:', error);
    res.status(500).json({ error: 'Failed to delete seasonal progress' });
  }
});

// ============ BULK OPERATIONS ============

/**
 * Bulk update achievements
 * POST /api/persistence/bulk/achievements
 */
router.post('/bulk/achievements', async (req: Request, res: Response) => {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: 'updates array is required' });
    }

    const count = await persistenceService.bulkUpdateAchievements(updates);

    res.json({
      success: true,
      updatedCount: count,
      message: `Bulk updated ${count} achievement records`,
    });
  } catch (error) {
    console.error('Failed to bulk update achievements:', error);
    res.status(500).json({ error: 'Failed to bulk update achievements' });
  }
});

/**
 * Bulk award XP
 * POST /api/persistence/bulk/xp
 */
router.post('/bulk/xp', async (req: Request, res: Response) => {
  try {
    const { awards } = req.body;

    if (!Array.isArray(awards) || awards.length === 0) {
      return res.status(400).json({ error: 'awards array is required' });
    }

    const count = await persistenceService.bulkAwardXP(awards);

    res.json({
      success: true,
      processedCount: count,
      message: `Bulk awarded XP to ${count} users`,
    });
  } catch (error) {
    console.error('Failed to bulk award XP:', error);
    res.status(500).json({ error: 'Failed to bulk award XP' });
  }
});

/**
 * Bulk update seasonal leaderboard
 * POST /api/persistence/bulk/seasonal-leaderboard
 */
router.post('/bulk/seasonal-leaderboard', async (req: Request, res: Response) => {
  try {
    const { seasonId, entries } = req.body;

    if (!seasonId || !Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({
        error: 'seasonId and entries array are required',
      });
    }

    const count = await persistenceService.bulkUpdateSeasonalLeaderboard(seasonId, entries);

    res.json({
      success: true,
      updatedCount: count,
      message: `Bulk updated ${count} leaderboard entries for season ${seasonId}`,
    });
  } catch (error) {
    console.error('Failed to bulk update leaderboard:', error);
    res.status(500).json({ error: 'Failed to bulk update leaderboard' });
  }
});

/**
 * Bulk delete achievements
 * POST /api/persistence/bulk/delete-achievements
 */
router.post('/bulk/delete-achievements', async (req: Request, res: Response) => {
  try {
    const { achievementIds } = req.body;

    if (!Array.isArray(achievementIds) || achievementIds.length === 0) {
      return res.status(400).json({ error: 'achievementIds array is required' });
    }

    const count = await persistenceService.bulkDeleteAchievements(achievementIds);

    res.json({
      success: true,
      deletedCount: count,
      message: `Bulk deleted ${count} achievements`,
    });
  } catch (error) {
    console.error('Failed to bulk delete achievements:', error);
    res.status(500).json({ error: 'Failed to bulk delete achievements' });
  }
});

/**
 * Bulk delete user data (account deletion)
 * POST /api/persistence/bulk/delete-user-data
 */
router.post('/bulk/delete-user-data', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const results = await persistenceService.bulkDeleteUserData(userId);

    res.json({
      success: true,
      deletedData: results,
      message: `Successfully deleted all data for user ${userId}`,
    });
  } catch (error) {
    console.error('Failed to delete user data:', error);
    res.status(500).json({ error: 'Failed to delete user data' });
  }
});

// ============ DATA MANAGEMENT ============

/**
 * Export user achievements (backup)
 * GET /api/persistence/export/:userId
 */
router.get('/export/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const backup = await databaseService.exportUserDataBackup(userId);

    res.json({
      success: true,
      backup,
      message: 'User data exported successfully',
    });
  } catch (error) {
    console.error('Failed to export user data:', error);
    res.status(500).json({ error: 'Failed to export user data' });
  }
});

/**
 * Restore user data from backup
 * POST /api/persistence/restore
 */
router.post('/restore', async (req: Request, res: Response) => {
  try {
    const { backup } = req.body;

    if (!backup || !backup.userId) {
      return res.status(400).json({ error: 'backup object with userId is required' });
    }

    const results = await databaseService.restoreUserDataBackup(backup);

    res.json({
      success: true,
      restored: results,
      message: 'User data restored successfully',
    });
  } catch (error) {
    console.error('Failed to restore user data:', error);
    res.status(500).json({ error: 'Failed to restore user data' });
  }
});

// ============ ADMIN OPERATIONS ============

/**
 * Get transaction history
 * GET /api/persistence/transactions?type=achievement&limit=100
 */
router.get('/transactions', async (req: Request, res: Response) => {
  try {
    const { type, limit } = req.query;
    const parsedLimit = parseInt(limit as string) || 100;

    const history = await persistenceService.getTransactionHistory(
      type as string | undefined,
      parsedLimit
    );

    res.json({
      success: true,
      count: history.length,
      transactions: history,
    });
  } catch (error) {
    console.error('Failed to fetch transaction history:', error);
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
});

/**
 * Run database maintenance
 * POST /api/persistence/admin/maintenance
 */
router.post('/admin/maintenance', async (req: Request, res: Response) => {
  try {
    const results = await databaseService.runMaintenance();

    res.json({
      success: true,
      maintenance: results,
      message: 'Database maintenance completed',
    });
  } catch (error) {
    console.error('Failed to run maintenance:', error);
    res.status(500).json({ error: 'Failed to run maintenance' });
  }
});

/**
 * Get database statistics
 * GET /api/persistence/admin/stats
 */
router.get('/admin/stats', async (req: Request, res: Response) => {
  try {
    const stats = await databaseService.getDatabaseStats();

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Failed to fetch database stats:', error);
    res.status(500).json({ error: 'Failed to fetch database stats' });
  }
});

/**
 * Database health check
 * GET /api/persistence/admin/health
 */
router.get('/admin/health', async (req: Request, res: Response) => {
  try {
    const isHealthy = await persistenceService.healthCheck();

    res.json({
      success: true,
      healthy: isHealthy,
      status: isHealthy ? 'Database connection OK' : 'Database connection failed',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      success: false,
      healthy: false,
      error: 'Health check failed',
    });
  }
});

export default router;
