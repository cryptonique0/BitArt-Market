import { Achievement, UserAchievement, AchievementType } from '../types/gamification';

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_nft',
    title: 'First Creation',
    description: 'Mint your first NFT',
    icon: '✨',
    type: AchievementType.CREATOR,
    requirement: 1,
    xpReward: 50,
    rarity: 'common'
  },
  {
    id: 'prolific_creator',
    title: 'Prolific Creator',
    description: 'Create 10 NFTs',
    icon: '🎨',
    type: AchievementType.CREATOR,
    requirement: 10,
    xpReward: 200,
    rarity: 'uncommon'
  },
  {
    id: 'first_purchase',
    title: 'Collector',
    description: 'Purchase your first NFT',
    icon: '🛍️',
    type: AchievementType.COLLECTOR,
    requirement: 1,
    xpReward: 50,
    rarity: 'common'
  },
  {
    id: 'first_sale',
    title: 'Trader',
    description: 'Complete your first sale',
    icon: '💰',
    type: AchievementType.TRADER,
    requirement: 1,
    xpReward: 50,
    rarity: 'common'
  },
  {
    id: 'daily_streak_7',
    title: 'Consistent Creator',
    description: 'Maintain a 7-day daily reward streak',
    icon: '🔥',
    type: AchievementType.SPECIAL,
    requirement: 7,
    xpReward: 150,
    rarity: 'uncommon'
  }
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
      progress: achievement.requirement
    };

    userAchs.push(userAchievement);
    userAchievements.set(userId, userAchs);
    return userAchievement;
  },

  async updateProgress(userId: string, achievementId: string, progress: number): Promise<UserAchievement | null> {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return null;

    const userAchs = userAchievements.get(userId) || [];
    let userAch = userAchs.find(a => a.achievementId === achievementId);

    if (!userAch) {
      userAch = {
        userId,
        achievementId,
        progress: 0
      };
      userAchs.push(userAch);
    }

    userAch.progress = Math.min(progress, achievement.requirement);

    if (userAch.progress >= achievement.requirement && !userAch.unlockedAt) {
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
  }
};
