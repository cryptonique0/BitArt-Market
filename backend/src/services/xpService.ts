import { UserLevel, LevelConfig, XPTransaction } from '../types/gamification';

const LEVEL_CONFIGS: LevelConfig[] = [
  { level: 1, minXP: 0, maxXP: 100, title: 'Novice', color: '#6B7280' },
  { level: 2, minXP: 100, maxXP: 250, title: 'Apprentice', color: '#3B82F6' },
  { level: 3, minXP: 250, maxXP: 500, title: 'Craftsman', color: '#8B5CF6' },
  { level: 4, minXP: 500, maxXP: 1000, title: 'Master', color: '#EC4899' },
  { level: 5, minXP: 1000, maxXP: 2000, title: 'Legend', color: '#F59E0B' },
  { level: 6, minXP: 2000, maxXP: 4000, title: 'Mythic', color: '#EF4444' },
  { level: 7, minXP: 4000, maxXP: 8000, title: 'Eternal', color: '#A78BFA' },
  { level: 8, minXP: 8000, maxXP: 20000, title: 'Celestial', color: '#06B6D4' },
  { level: 9, minXP: 20000, maxXP: 50000, title: 'Transcendent', color: '#10B981' },
  { level: 10, minXP: 50000, maxXP: 100000, title: 'Ascendant', color: '#FFD700' }
];

const userLevels = new Map<string, UserLevel>();
const xpTransactions: XPTransaction[] = [];

export const xpService = {
  async awardXP(userId: string, amount: number, reason: string, relatedId?: string): Promise<UserLevel> {
    let userLevel = userLevels.get(userId) || {
      userId,
      currentLevel: 1,
      totalXP: 0,
      xpForNextLevel: 100,
      xpInCurrentLevel: 0
    };

    const transaction: XPTransaction = {
      id: `xp_${Date.now()}`,
      userId,
      amount,
      reason,
      relatedId,
      timestamp: new Date()
    };
    xpTransactions.push(transaction);

    userLevel.totalXP += amount;
    userLevel.xpInCurrentLevel += amount;

    while (userLevel.xpInCurrentLevel >= userLevel.xpForNextLevel) {
      userLevel.xpInCurrentLevel -= userLevel.xpForNextLevel;
      userLevel.currentLevel += 1;

      if (userLevel.currentLevel <= LEVEL_CONFIGS.length) {
        const nextLevelConfig = LEVEL_CONFIGS[userLevel.currentLevel - 1];
        userLevel.xpForNextLevel = nextLevelConfig.maxXP - nextLevelConfig.minXP;
      }
    }

    userLevels.set(userId, userLevel);
    return userLevel;
  },

  async getUserLevel(userId: string): Promise<UserLevel> {
    return userLevels.get(userId) || {
      userId,
      currentLevel: 1,
      totalXP: 0,
      xpForNextLevel: 100,
      xpInCurrentLevel: 0
    };
  },

  getLevelConfig(level: number): LevelConfig {
    return LEVEL_CONFIGS[level - 1] || LEVEL_CONFIGS[LEVEL_CONFIGS.length - 1];
  },

  getAllLevelConfigs(): LevelConfig[] {
    return LEVEL_CONFIGS;
  },

  async getLevelProgress(userId: string): Promise<number> {
    const userLevel = await this.getUserLevel(userId);
    if (userLevel.xpForNextLevel === 0) return 100;
    return Math.round((userLevel.xpInCurrentLevel / userLevel.xpForNextLevel) * 100);
  },

  async getXPHistory(userId: string, limit = 20): Promise<XPTransaction[]> {
    return xpTransactions
      .filter(t => t.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  },

  getLeaderboard(limit = 10) {
    return Array.from(userLevels.values())
      .sort((a, b) => b.totalXP - a.totalXP)
      .slice(0, limit)
      .map((level, index) => ({
        rank: index + 1,
        userId: level.userId,
        totalXP: level.totalXP,
        level: level.currentLevel
      }));
  }
};
