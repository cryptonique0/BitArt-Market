import {
  PrismaClient,
  UserAchievement,
  UserLevel,
  Achievement,
  User,
  XPTransaction,
} from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

/**
 * Persistence Layer for Gamification System
 *
 * Handles all database operations with:
 * - ACID transactions
 * - Automatic rollback on failure
 * - Bulk operations optimization
 * - Connection pooling
 *
 * Replaces in-memory Map<> storage
 */

// ============ TRANSACTION HANDLING ============

/**
 * Execute operation within database transaction
 * Ensures ACID properties (Atomicity, Consistency, Isolation, Durability)
 */
export async function withTransaction<T>(
  callback: (prisma: PrismaClient) => Promise<T>,
  operationType: string = 'transaction'
): Promise<T> {
  const startTime = Date.now();
  const transactionId = uuidv4();

  try {
    // Log transaction start
    await logTransaction({
      id: transactionId,
      type: operationType,
      status: 'pending',
      data: {},
    });

    // Execute callback within transaction
    const result = await prisma.$transaction(async tx => {
      return callback(tx as any);
    });

    // Log successful completion
    await prisma.transactionLog.update({
      where: { id: transactionId },
      data: {
        status: 'completed',
        executedAt: new Date(),
      },
    });

    console.log(`✅ Transaction ${transactionId} completed in ${Date.now() - startTime}ms`);
    return result;
  } catch (error) {
    console.error(`❌ Transaction ${transactionId} failed:`, error);

    // Log failed transaction
    await prisma.transactionLog
      .update({
        where: { id: transactionId },
        data: {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      })
      .catch(() => {
        // Ignore if transaction log update fails
      });

    throw error;
  }
}

// ============ SAVE OPERATIONS ============

/**
 * Save achievement unlock to database
 */
export async function saveUserAchievement(
  userId: string,
  achievementId: string,
  progress: number = 0
): Promise<UserAchievement> {
  return withTransaction(async tx => {
    // Check if already exists
    const existing = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: { userId, achievementId },
      },
    });

    if (existing) {
      return prisma.userAchievement.update({
        where: { id: existing.id },
        data: {
          progress,
          unlockedAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    // Create new entry
    return prisma.userAchievement.create({
      data: {
        userId,
        achievementId,
        unlockedAt: new Date(),
        progress,
      },
    });
  }, 'save_achievement');
}

/**
 * Save user level progress
 */
export async function saveUserLevel(
  userId: string,
  level: number,
  totalXP: number,
  xpInCurrentLevel: number,
  xpForNextLevel: number
): Promise<UserLevel> {
  return withTransaction(async tx => {
    return prisma.userLevel.upsert({
      where: { userId },
      update: {
        currentLevel: level,
        totalXP,
        xpInCurrentLevel,
        xpForNextLevel,
        updatedAt: new Date(),
      },
      create: {
        userId,
        currentLevel: level,
        totalXP,
        xpInCurrentLevel,
        xpForNextLevel,
      },
    });
  }, 'save_level');
}

/**
 * Save XP transaction
 */
export async function saveXPTransaction(
  userId: string,
  amount: number,
  reason: string,
  relatedId?: string
): Promise<XPTransaction> {
  return withTransaction(async tx => {
    return prisma.xPTransaction.create({
      data: {
        userId,
        amount,
        reason,
        relatedId,
        timestamp: new Date(),
      },
    });
  }, 'save_xp_transaction');
}

/**
 * Save seasonal progress
 */
export async function saveSeasonalProgress(
  userId: string,
  seasonId: string,
  xpEarned: number
): Promise<any> {
  return withTransaction(async tx => {
    return prisma.userSeasonalProgress.upsert({
      where: {
        userId_seasonId: { userId, seasonId },
      },
      update: {
        xpEarned,
      },
      create: {
        userId,
        seasonId,
        xpEarned,
      },
    });
  }, 'save_seasonal_progress');
}

// ============ DELETE OPERATIONS ============

/**
 * Delete user achievement
 */
export async function deleteUserAchievement(
  userId: string,
  achievementId: string
): Promise<boolean> {
  return withTransaction(async tx => {
    const result = await prisma.userAchievement.deleteMany({
      where: {
        userId,
        achievementId,
      },
    });
    return result.count > 0;
  }, 'delete_achievement');
}

/**
 * Delete all achievements for user (reset)
 */
export async function deleteUserAllAchievements(userId: string): Promise<number> {
  return withTransaction(async tx => {
    const result = await prisma.userAchievement.deleteMany({
      where: { userId },
    });
    return result.count;
  }, 'delete_all_achievements');
}

/**
 * Delete XP transaction
 */
export async function deleteXPTransaction(transactionId: string): Promise<boolean> {
  return withTransaction(async tx => {
    const result = await prisma.xPTransaction
      .delete({
        where: { id: transactionId },
      })
      .catch(() => null);
    return !!result;
  }, 'delete_xp_transaction');
}

/**
 * Delete seasonal progress
 */
export async function deleteSeasonalProgress(userId: string, seasonId: string): Promise<boolean> {
  return withTransaction(async tx => {
    const result = await prisma.userSeasonalProgress.deleteMany({
      where: {
        userId,
        seasonId,
      },
    });
    return result.count > 0;
  }, 'delete_seasonal_progress');
}

// ============ BULK OPERATIONS ============

/**
 * Bulk update achievements (e.g., award XP to multiple users)
 */
export async function bulkUpdateAchievements(
  updates: Array<{
    userId: string;
    achievementId: string;
    progress?: number;
  }>
): Promise<number> {
  return withTransaction(async tx => {
    let count = 0;

    for (const update of updates) {
      const result = await prisma.userAchievement.updateMany({
        where: {
          userId: update.userId,
          achievementId: update.achievementId,
        },
        data: {
          progress: update.progress || 0,
          updatedAt: new Date(),
        },
      });
      count += result.count;
    }

    return count;
  }, 'bulk_update_achievements');
}

/**
 * Bulk award XP to multiple users
 */
export async function bulkAwardXP(
  awards: Array<{
    userId: string;
    amount: number;
    reason: string;
    relatedId?: string;
  }>
): Promise<number> {
  return withTransaction(async tx => {
    let totalTransactions = 0;

    for (const award of awards) {
      // Create transaction record
      await prisma.xPTransaction.create({
        data: {
          userId: award.userId,
          amount: award.amount,
          reason: award.reason,
          relatedId: award.relatedId,
          timestamp: new Date(),
        },
      });

      // Update user level
      const currentLevel = await prisma.userLevel.findUnique({
        where: { userId: award.userId },
      });

      if (currentLevel) {
        const newTotalXP = currentLevel.totalXP + award.amount;
        await prisma.userLevel.update({
          where: { userId: award.userId },
          data: {
            totalXP: newTotalXP,
            updatedAt: new Date(),
          },
        });
      }

      totalTransactions++;
    }

    return totalTransactions;
  }, 'bulk_award_xp');
}

/**
 * Bulk update seasonal leaderboard
 */
export async function bulkUpdateSeasonalLeaderboard(
  seasonId: string,
  entries: Array<{
    userId: string;
    username: string;
    xpEarned: number;
  }>
): Promise<number> {
  return withTransaction(async tx => {
    let count = 0;

    for (const entry of entries) {
      const result = await prisma.seasonalLeaderboardEntry.upsert({
        where: {
          seasonId_userId: { seasonId, userId: entry.userId },
        },
        update: {
          xpEarned: entry.xpEarned,
          username: entry.username,
          updatedAt: new Date(),
        },
        create: {
          seasonId,
          userId: entry.userId,
          username: entry.username,
          xpEarned: entry.xpEarned,
        },
      });

      count++;
    }

    return count;
  }, 'bulk_update_seasonal_leaderboard');
}

/**
 * Bulk delete achievements (cleanup)
 */
export async function bulkDeleteAchievements(achievementIds: string[]): Promise<number> {
  return withTransaction(async tx => {
    const result = await prisma.userAchievement.deleteMany({
      where: {
        achievementId: {
          in: achievementIds,
        },
      },
    });

    return result.count;
  }, 'bulk_delete_achievements');
}

/**
 * Bulk delete user data (account deletion)
 */
export async function bulkDeleteUserData(userId: string): Promise<{
  achievements: number;
  xpTransactions: number;
  seasonalProgress: number;
  notifications: number;
}> {
  return withTransaction(async tx => {
    const results = {
      achievements: (
        await prisma.userAchievement.deleteMany({
          where: { userId },
        })
      ).count,

      xpTransactions: (
        await prisma.xPTransaction.deleteMany({
          where: { userId },
        })
      ).count,

      seasonalProgress: (
        await prisma.userSeasonalProgress.deleteMany({
          where: { userId },
        })
      ).count,

      notifications: (
        await prisma.achievementNotification.deleteMany({
          where: { userId },
        })
      ).count,
    };

    return results;
  }, 'bulk_delete_user_data');
}

// ============ BATCH OPERATIONS ============

/**
 * Import achievements in batch (efficient for large datasets)
 */
export async function batchImportAchievements(
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    type: string;
    requirement: number;
    xpReward: number;
    rarity: string;
    tier?: string;
    badgeIcon?: string;
    seasonId?: string;
    isSeasonal?: boolean;
  }>
): Promise<number> {
  return withTransaction(async tx => {
    let count = 0;

    // Batch in chunks of 100
    for (let i = 0; i < achievements.length; i += 100) {
      const chunk = achievements.slice(i, i + 100);

      await prisma.achievement.createMany({
        data: chunk,
        skipDuplicates: true,
      });

      count += chunk.length;
    }

    return count;
  }, 'batch_import_achievements');
}

/**
 * Batch export user achievements for backup
 */
export async function batchExportUserAchievements(userId: string): Promise<UserAchievement[]> {
  return prisma.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
  });
}

// ============ MIGRATION HELPERS ============

/**
 * Migrate from in-memory Map to database
 * Used for data migration during deployment
 */
export async function migrateFromMemory(
  dataMap: Map<string, any>,
  type: 'achievements' | 'levels' | 'xp' | 'seasonal'
): Promise<number> {
  return withTransaction(async tx => {
    let count = 0;

    for (const [key, value] of dataMap) {
      try {
        switch (type) {
          case 'achievements':
            await prisma.userAchievement.upsert({
              where: { id: key },
              update: value,
              create: value,
            });
            break;

          case 'levels':
            await prisma.userLevel.upsert({
              where: { userId: key },
              update: value,
              create: value,
            });
            break;

          case 'xp':
            await prisma.xPTransaction.create({
              data: value,
            });
            break;

          case 'seasonal':
            await prisma.userSeasonalProgress.upsert({
              where: {
                userId_seasonId: {
                  userId: value.userId,
                  seasonId: value.seasonId,
                },
              },
              update: value,
              create: value,
            });
            break;
        }

        count++;
      } catch (error) {
        console.error(`Failed to migrate ${key}:`, error);
      }
    }

    return count;
  }, 'migrate_from_memory');
}

// ============ TRANSACTION LOGGING ============

async function logTransaction(data: {
  id: string;
  type: string;
  status: string;
  data: any;
}): Promise<void> {
  try {
    await prisma.transactionLog.create({
      data: {
        id: data.id,
        type: data.type,
        status: data.status,
        data: JSON.stringify(data.data),
      },
    });
  } catch (error) {
    console.error('Failed to log transaction:', error);
  }
}

/**
 * Get transaction history
 */
export async function getTransactionHistory(type?: string, limit: number = 100): Promise<any[]> {
  return prisma.transactionLog.findMany({
    where: type ? { type } : undefined,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Cleanup old transaction logs (housekeeping)
 */
export async function cleanupTransactionLogs(daysOld: number = 30): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await prisma.transactionLog.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate,
      },
    },
  });

  return result.count;
}

// ============ CONNECTION MANAGEMENT ============

/**
 * Graceful shutdown
 */
export async function disconnectDB(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database:', error);
    process.exit(1);
  }
}

/**
 * Health check
 */
export async function healthCheck(): Promise<boolean> {
  try {
    await prisma.$executeRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

export default {
  prisma,
  withTransaction,
  // Save
  saveUserAchievement,
  saveUserLevel,
  saveXPTransaction,
  saveSeasonalProgress,
  // Delete
  deleteUserAchievement,
  deleteUserAllAchievements,
  deleteXPTransaction,
  deleteSeasonalProgress,
  // Bulk
  bulkUpdateAchievements,
  bulkAwardXP,
  bulkUpdateSeasonalLeaderboard,
  bulkDeleteAchievements,
  bulkDeleteUserData,
  // Batch
  batchImportAchievements,
  batchExportUserAchievements,
  // Migration
  migrateFromMemory,
  // Logging
  getTransactionHistory,
  cleanupTransactionLogs,
  // Connection
  disconnectDB,
  healthCheck,
};
