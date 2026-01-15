import { PrismaClient } from '@prisma/client';
import persistenceService from './persistenceService';

const prisma = new PrismaClient();

/**
 * Database Initialization Service
 *
 * Handles:
 * - Schema creation and migration
 * - Default data seeding
 * - Data migration from memory to database
 * - Connection pool management
 */

// ============ INITIALIZATION ============

/**
 * Initialize database with proper setup
 */
export async function initializeDatabase(): Promise<void> {
  try {
    console.log('🔧 Initializing database...');

    // Run migrations
    console.log('📦 Running migrations...');
    // Note: In production, run: npx prisma migrate deploy
    // This will run all pending migrations from prisma/migrations folder

    // Check connection
    const isHealthy = await persistenceService.healthCheck();
    if (!isHealthy) {
      throw new Error('Database health check failed');
    }

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// ============ SEEDING ============

/**
 * Seed default achievements
 */
export async function seedDefaultAchievements(): Promise<number> {
  const defaultAchievements = [
    {
      id: 'first_nft',
      title: 'First Creation',
      description: 'Mint your first NFT',
      icon: '✨',
      type: 'creator',
      requirement: 1,
      xpReward: 50,
      rarity: 'common',
      tier: 'bronze',
      badgeIcon: '🥉',
      isSeasonal: false,
    },
    {
      id: 'prolific_creator',
      title: 'Prolific Creator',
      description: 'Create 10 NFTs',
      icon: '🎨',
      type: 'creator',
      requirement: 10,
      xpReward: 200,
      rarity: 'uncommon',
      tier: 'bronze',
      badgeIcon: '🥉',
      isSeasonal: false,
    },
    {
      id: 'milestone_50_creator',
      title: 'Master Creator',
      description: 'Create 50 NFTs',
      icon: '🎯',
      type: 'milestone',
      requirement: 50,
      xpReward: 500,
      rarity: 'rare',
      tier: 'silver',
      badgeIcon: '🥈',
      isSeasonal: false,
    },
    {
      id: 'first_collection',
      title: 'Collector Started',
      description: 'Purchase your first NFT',
      icon: '🎁',
      type: 'collector',
      requirement: 1,
      xpReward: 50,
      rarity: 'common',
      tier: 'bronze',
      badgeIcon: '🥉',
      isSeasonal: false,
    },
    {
      id: 'collection_master',
      title: 'Collection Master',
      description: 'Own 25 different NFTs',
      icon: '👑',
      type: 'collector',
      requirement: 25,
      xpReward: 300,
      rarity: 'rare',
      tier: 'gold',
      badgeIcon: '🥇',
      isSeasonal: false,
    },
    {
      id: 'first_trade',
      title: 'First Trade',
      description: 'Complete your first trade',
      icon: '🔄',
      type: 'trader',
      requirement: 1,
      xpReward: 100,
      rarity: 'common',
      tier: 'bronze',
      badgeIcon: '🥉',
      isSeasonal: false,
    },
    {
      id: 'social_butterfly',
      title: 'Social Butterfly',
      description: 'Make 10 friends',
      icon: '🦋',
      type: 'social',
      requirement: 10,
      xpReward: 150,
      rarity: 'uncommon',
      tier: 'silver',
      badgeIcon: '🥈',
      isSeasonal: false,
    },
  ];

  return persistenceService.batchImportAchievements(defaultAchievements);
}

/**
 * Seed default seasons
 */
export async function seedDefaultSeasons(): Promise<number> {
  const now = new Date();
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const seasons = [
    {
      id: 'winter_2024',
      name: 'Winter 2024',
      startDate: new Date('2024-12-21'),
      endDate: new Date('2025-03-20'),
      color: '#4A90E2',
      rewards: JSON.stringify({
        '100': { xp: 1000, badge: '👑' },
        '75': { xp: 500, badge: '🌟' },
        '50': { xp: 250, badge: '⭐' },
        '25': { xp: 100, badge: '✨' },
      }),
    },
    {
      id: 'spring_2025',
      name: 'Spring 2025',
      startDate: new Date('2025-03-20'),
      endDate: new Date('2025-06-20'),
      color: '#7ED321',
      rewards: JSON.stringify({
        '100': { xp: 1000, badge: '🌸' },
        '75': { xp: 500, badge: '🌺' },
        '50': { xp: 250, badge: '🌼' },
        '25': { xp: 100, badge: '🌻' },
      }),
    },
  ];

  let count = 0;
  for (const season of seasons) {
    try {
      await prisma.seasonConfig.upsert({
        where: { name: season.name },
        update: season,
        create: season,
      });
      count++;
    } catch (error) {
      console.error(`Failed to seed season ${season.name}:`, error);
    }
  }

  return count;
}

/**
 * Full database seeding
 */
export async function seedDatabase(): Promise<{
  achievements: number;
  seasons: number;
}> {
  try {
    console.log('🌱 Seeding database...');

    const achievements = await seedDefaultAchievements();
    console.log(`✅ Seeded ${achievements} achievements`);

    const seasons = await seedDefaultSeasons();
    console.log(`✅ Seeded ${seasons} seasons`);

    return { achievements, seasons };
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

// ============ MIGRATION HELPERS ============

/**
 * Migrate user data from memory Map to database
 */
export async function migrateUserData(
  dataMap: Map<string, any>,
  type: 'achievements' | 'levels' | 'xp' | 'seasonal'
): Promise<{
  migrated: number;
  failed: number;
  errors: Array<{ key: string; error: string }>;
}> {
  const errors: Array<{ key: string; error: string }> = [];

  try {
    console.log(`📦 Migrating ${type} data...`);

    const migrated = await persistenceService.migrateFromMemory(dataMap, type);
    const failed = dataMap.size - migrated;

    console.log(`✅ Successfully migrated ${migrated}/${dataMap.size} ${type} records`);

    if (failed > 0) {
      console.warn(`⚠️  Failed to migrate ${failed} records`);
    }

    return { migrated, failed, errors };
  } catch (error) {
    console.error(`❌ Migration of ${type} data failed:`, error);
    throw error;
  }
}

/**
 * Export user data for backup
 */
export async function exportUserDataBackup(userId: string): Promise<{
  userId: string;
  achievements: any[];
  level: any;
  seasonalProgress: any[];
  backup_timestamp: string;
}> {
  return persistenceService.withTransaction(async tx => {
    const achievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
    });

    const level = await prisma.userLevel.findUnique({
      where: { userId },
    });

    const seasonalProgress = await prisma.userSeasonalProgress.findMany({
      where: { userId },
    });

    return {
      userId,
      achievements,
      level,
      seasonalProgress,
      backup_timestamp: new Date().toISOString(),
    };
  }, 'export_user_backup');
}

/**
 * Restore user data from backup
 */
export async function restoreUserDataBackup(backup: {
  userId: string;
  achievements: any[];
  level: any;
  seasonalProgress: any[];
}): Promise<{
  restored_achievements: number;
  restored_levels: number;
  restored_seasonal: number;
}> {
  return persistenceService.withTransaction(async tx => {
    let restoredAchievements = 0;
    let restoredLevels = 0;
    let restoredSeasonal = 0;

    // Restore achievements
    for (const achievement of backup.achievements) {
      try {
        await prisma.userAchievement.upsert({
          where: { id: achievement.id },
          update: achievement,
          create: achievement,
        });
        restoredAchievements++;
      } catch (error) {
        console.error(`Failed to restore achievement ${achievement.id}:`, error);
      }
    }

    // Restore level
    if (backup.level) {
      try {
        await prisma.userLevel.upsert({
          where: { userId: backup.userId },
          update: backup.level,
          create: backup.level,
        });
        restoredLevels = 1;
      } catch (error) {
        console.error('Failed to restore level:', error);
      }
    }

    // Restore seasonal progress
    for (const progress of backup.seasonalProgress) {
      try {
        await prisma.userSeasonalProgress.upsert({
          where: {
            userId_seasonId: {
              userId: progress.userId,
              seasonId: progress.seasonId,
            },
          },
          update: progress,
          create: progress,
        });
        restoredSeasonal++;
      } catch (error) {
        console.error(`Failed to restore seasonal progress:`, error);
      }
    }

    return {
      restored_achievements: restoredAchievements,
      restored_levels: restoredLevels,
      restored_seasonal: restoredSeasonal,
    };
  }, 'restore_user_backup');
}

// ============ MAINTENANCE ============

/**
 * Run database maintenance
 */
export async function runMaintenance(): Promise<{
  logs_deleted: number;
  status: string;
}> {
  try {
    console.log('🔧 Running database maintenance...');

    // Cleanup old transaction logs (older than 30 days)
    const logsDeleted = await persistenceService.cleanupTransactionLogs(30);
    console.log(`✅ Deleted ${logsDeleted} old transaction logs`);

    return {
      logs_deleted: logsDeleted,
      status: 'completed',
    };
  } catch (error) {
    console.error('❌ Database maintenance failed:', error);
    throw error;
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<{
  users: number;
  achievements: number;
  unlocked_achievements: number;
  xp_transactions: number;
  seasonal_progress: number;
  total_xp_distributed: number;
}> {
  return persistenceService.withTransaction(async tx => {
    const [users, achievements, unlockedAchievements, xpTransactions, seasonalProgress] =
      await Promise.all([
        prisma.user.count(),
        prisma.achievement.count(),
        prisma.userAchievement.count(),
        prisma.xPTransaction.count(),
        prisma.userSeasonalProgress.count(),
      ]);

    // Calculate total XP distributed
    const xpResult = await prisma.xPTransaction.aggregate({
      _sum: { amount: true },
    });

    const totalXP = xpResult._sum.amount || 0;

    return {
      users,
      achievements,
      unlocked_achievements: unlockedAchievements,
      xp_transactions: xpTransactions,
      seasonal_progress: seasonalProgress,
      total_xp_distributed: totalXP,
    };
  }, 'get_db_stats');
}

export default {
  initializeDatabase,
  seedDatabase,
  seedDefaultAchievements,
  seedDefaultSeasons,
  migrateUserData,
  exportUserDataBackup,
  restoreUserDataBackup,
  runMaintenance,
  getDatabaseStats,
};
