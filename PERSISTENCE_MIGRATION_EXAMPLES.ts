// Integration Example: How to Update Existing Services to Use Persistence Layer
// This file shows how to refactor achievementService and other services

// ============ BEFORE: In-Memory Storage ============
// In old achievementService.ts:
/*
const userAchievementsMap = new Map<string, UserAchievement[]>();
const userLevelMap = new Map<string, UserLevel>();
const userXPMap = new Map<string, UserXPTracker>();

export const achievementService = {
  getUserAchievements: async (userId: string) => {
    return userAchievementsMap.get(userId) || [];
  },

  unlockAchievement: async (userId: string, achievementId: string) => {
    if (!userAchievementsMap.has(userId)) {
      userAchievementsMap.set(userId, []);
    }
    const achievements = userAchievementsMap.get(userId)!;
    achievements.push({
      userId,
      achievementId,
      unlockedAt: new Date(),
      progress: 100,
    });
    return achievements;
  },
};
*/

// ============ AFTER: Using Persistence Layer ============

import persistenceService from './persistenceService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const achievementService = {
  /**
   * Get user achievements from database
   */
  getUserAchievements: async (userId: string) => {
    try {
      return await prisma.userAchievement.findMany({
        where: { userId },
        include: { achievement: true },
      });
    } catch (error) {
      console.error('Failed to fetch user achievements:', error);
      throw error;
    }
  },

  /**
   * Unlock achievement (with transaction)
   */
  unlockAchievement: async (userId: string, achievementId: string) => {
    try {
      return await persistenceService.saveUserAchievement(
        userId,
        achievementId,
        100 // 100% progress for unlocked
      );
    } catch (error) {
      console.error('Failed to unlock achievement:', error);
      throw error;
    }
  },

  /**
   * Award XP (with transaction)
   */
  awardXP: async (userId: string, amount: number, reason: string, relatedId?: string) => {
    try {
      // Save XP transaction
      await persistenceService.saveXPTransaction(userId, amount, reason, relatedId);

      // Update user level
      const currentLevel = await prisma.userLevel.findUnique({
        where: { userId },
      });

      if (!currentLevel) {
        throw new Error('User level not found');
      }

      const newTotalXP = currentLevel.totalXP + amount;
      const newLevel = Math.floor(newTotalXP / 500) + 1;
      const xpForNextLevel = newLevel * 500;
      const xpInCurrentLevel = newTotalXP - (newLevel - 1) * 500;

      return await persistenceService.saveUserLevel(
        userId,
        newLevel,
        newTotalXP,
        xpInCurrentLevel,
        xpForNextLevel
      );
    } catch (error) {
      console.error('Failed to award XP:', error);
      throw error;
    }
  },

  /**
   * Get user XP
   */
  getUserXP: async (userId: string) => {
    try {
      return await prisma.userLevel.findUnique({
        where: { userId },
      });
    } catch (error) {
      console.error('Failed to fetch user XP:', error);
      throw error;
    }
  },

  /**
   * Get leaderboard
   */
  getLeaderboard: async (limit: number = 10) => {
    try {
      return await prisma.userLevel.findMany({
        orderBy: { totalXP: 'desc' },
        take: limit,
      });
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      throw error;
    }
  },

  /**
   * Bulk unlock achievements (for events)
   */
  bulkUnlockAchievements: async (
    updates: Array<{
      userId: string;
      achievementId: string;
    }>
  ) => {
    try {
      const persistenceUpdates = updates.map(u => ({
        userId: u.userId,
        achievementId: u.achievementId,
        progress: 100,
      }));

      return await persistenceService.bulkUpdateAchievements(persistenceUpdates);
    } catch (error) {
      console.error('Failed to bulk unlock achievements:', error);
      throw error;
    }
  },

  /**
   * Bulk award XP (for seasonal bonuses)
   */
  bulkAwardXP: async (
    awards: Array<{
      userId: string;
      amount: number;
      reason: string;
      relatedId?: string;
    }>
  ) => {
    try {
      return await persistenceService.bulkAwardXP(awards);
    } catch (error) {
      console.error('Failed to bulk award XP:', error);
      throw error;
    }
  },

  /**
   * Reset user achievements (admin only)
   */
  resetUserAchievements: async (userId: string) => {
    try {
      return await persistenceService.deleteUserAllAchievements(userId);
    } catch (error) {
      console.error('Failed to reset user achievements:', error);
      throw error;
    }
  },

  /**
   * Get achievement progress
   */
  getAchievementProgress: async (userId: string, achievementId: string) => {
    try {
      return await prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: { userId, achievementId },
        },
        include: { achievement: true },
      });
    } catch (error) {
      console.error('Failed to fetch achievement progress:', error);
      throw error;
    }
  },

  /**
   * Search achievements
   */
  searchAchievements: async (query: string) => {
    try {
      // Search in database
      const achievements = await prisma.achievement.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
      });

      // Sort by relevance
      return achievements
        .map(a => {
          const titleMatch = a.title.toLowerCase().includes(query.toLowerCase()) ? 50 : 0;
          const descMatch = a.description.toLowerCase().includes(query.toLowerCase()) ? 25 : 0;
          return { ...a, relevance: titleMatch + descMatch };
        })
        .sort((a, b) => b.relevance - a.relevance);
    } catch (error) {
      console.error('Failed to search achievements:', error);
      throw error;
    }
  },

  /**
   * Get achievements by status
   */
  getAchievementsByStatus: async (
    userId: string,
    status: 'locked' | 'in-progress' | 'unlocked'
  ) => {
    try {
      const allAchievements = await prisma.achievement.findMany();
      const userAchievements = await prisma.userAchievement.findMany({
        where: { userId },
      });

      const unlockedIds = new Set(userAchievements.map(a => a.achievementId));

      let filtered = allAchievements;

      if (status === 'unlocked') {
        filtered = allAchievements.filter(a => unlockedIds.has(a.id));
      } else if (status === 'locked') {
        filtered = allAchievements.filter(a => !unlockedIds.has(a.id));
      } else if (status === 'in-progress') {
        filtered = userAchievements
          .filter(ua => ua.progress > 0 && ua.progress < 100)
          .map(ua => allAchievements.find(a => a.id === ua.achievementId))
          .filter(Boolean) as typeof allAchievements;
      }

      return filtered;
    } catch (error) {
      console.error('Failed to get achievements by status:', error);
      throw error;
    }
  },

  /**
   * Get seasonal achievements
   */
  getSeasonalAchievements: async (seasonId: string) => {
    try {
      return await prisma.achievement.findMany({
        where: {
          seasonId,
          isSeasonal: true,
        },
      });
    } catch (error) {
      console.error('Failed to fetch seasonal achievements:', error);
      throw error;
    }
  },

  /**
   * Update seasonal progress
   */
  updateSeasonalProgress: async (userId: string, seasonId: string, xpEarned: number) => {
    try {
      return await persistenceService.saveSeasonalProgress(userId, seasonId, xpEarned);
    } catch (error) {
      console.error('Failed to update seasonal progress:', error);
      throw error;
    }
  },

  /**
   * Export user achievement backup
   */
  exportUserAchievements: async (userId: string) => {
    try {
      return await persistenceService.batchExportUserAchievements(userId);
    } catch (error) {
      console.error('Failed to export achievements:', error);
      throw error;
    }
  },
};

// ============ EXAMPLE: Refactored XP Service ============

export const xpService = {
  /**
   * Get user level
   */
  getUserLevel: async (userId: string) => {
    try {
      let level = await prisma.userLevel.findUnique({
        where: { userId },
      });

      if (!level) {
        // Create if doesn't exist
        level = await prisma.userLevel.create({
          data: {
            userId,
            currentLevel: 1,
            totalXP: 0,
            xpForNextLevel: 500,
            xpInCurrentLevel: 0,
          },
        });
      }

      return level;
    } catch (error) {
      console.error('Failed to get user level:', error);
      throw error;
    }
  },

  /**
   * Award XP with transaction
   */
  awardXP: async (userId: string, amount: number, reason: string, relatedId?: string) => {
    try {
      return await persistenceService.withTransaction(async tx => {
        // Save transaction
        const transaction = await tx.xPTransaction.create({
          data: {
            userId,
            amount,
            reason,
            relatedId,
            timestamp: new Date(),
          },
        });

        // Update user level
        const currentLevel = await tx.userLevel.findUnique({
          where: { userId },
        });

        if (!currentLevel) {
          throw new Error('User level not found');
        }

        const newTotalXP = currentLevel.totalXP + amount;
        const newLevel = Math.floor(newTotalXP / 500) + 1;
        const xpForNextLevel = newLevel * 500;
        const xpInCurrentLevel = newTotalXP - (newLevel - 1) * 500;

        const updatedLevel = await tx.userLevel.update({
          where: { userId },
          data: {
            currentLevel: newLevel,
            totalXP: newTotalXP,
            xpForNextLevel,
            xpInCurrentLevel,
            updatedAt: new Date(),
          },
        });

        return { transaction, level: updatedLevel };
      }, 'award_xp');
    } catch (error) {
      console.error('Failed to award XP:', error);
      throw error;
    }
  },

  /**
   * Get XP history
   */
  getXPHistory: async (userId: string, limit: number = 20) => {
    try {
      return await prisma.xPTransaction.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: limit,
      });
    } catch (error) {
      console.error('Failed to fetch XP history:', error);
      throw error;
    }
  },

  /**
   * Get leaderboard
   */
  getLeaderboard: async (limit: number = 10) => {
    try {
      return await prisma.userLevel.findMany({
        orderBy: { totalXP: 'desc' },
        take: limit,
      });
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      throw error;
    }
  },
};

// ============ EXAMPLE: Routes Integration ============

// In your routes file:
import { Router } from 'express';

const router = Router();

// Get user achievements (from database)
router.get('/achievements/user/:userId', async (req, res) => {
  try {
    const achievements = await achievementService.getUserAchievements(req.params.userId);
    res.json({ success: true, achievements });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// Unlock achievement (with transaction)
router.post('/achievements/unlock', async (req, res) => {
  try {
    const { userId, achievementId } = req.body;
    const result = await achievementService.unlockAchievement(userId, achievementId);
    res.json({ success: true, achievement: result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unlock achievement' });
  }
});

// Award XP (with transaction)
router.post('/xp/award', async (req, res) => {
  try {
    const { userId, amount, reason } = req.body;
    const result = await xpService.awardXP(userId, amount, reason);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to award XP' });
  }
});

// Bulk operations
router.post('/achievements/bulk-unlock', async (req, res) => {
  try {
    const { updates } = req.body;
    const count = await achievementService.bulkUnlockAchievements(updates);
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to bulk unlock achievements' });
  }
});

export default router;

// ============ KEY CHANGES SUMMARY ============
/*
1. STORAGE:
   - FROM: Map<string, UserAchievement[]>
   - TO:   PostgreSQL database via Prisma

2. TRANSACTIONS:
   - FROM: No transaction support
   - TO:   Full ACID transactions with rollback

3. PERSISTENCE:
   - FROM: Data lost on server restart
   - TO:   Persistent storage on disk

4. PERFORMANCE:
   - FROM: Linear memory usage
   - TO:   Optimized with indexes and connection pooling

5. SCALABILITY:
   - FROM: Limited by server memory
   - TO:   Scales to millions of records

6. BACKUP:
   - FROM: Manual snapshots
   - TO:   Automated backup/restore endpoints

7. AUDIT:
   - FROM: No audit trail
   - TO:   Full transaction logging

8. MONITORING:
   - FROM: No metrics
   - TO:   Database statistics and health checks
*/
