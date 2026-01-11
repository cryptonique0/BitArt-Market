import { Achievement, UserAchievement, AchievementType } from '../types/gamification';
<<<<<<< HEAD
=======
import jwt from 'jsonwebtoken';
>>>>>>> 2caf294 (Initial commit with API documentation and features)

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
<<<<<<< HEAD
=======
    id: 'master_creator',
    title: 'Master Creator',
    description: 'Create 50 NFTs',
    icon: '👑',
    type: AchievementType.CREATOR,
    requirement: 50,
    xpReward: 500,
    rarity: 'rare'
  },
  {
>>>>>>> 2caf294 (Initial commit with API documentation and features)
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
<<<<<<< HEAD
=======
    id: 'collector_10',
    title: 'Avid Collector',
    description: 'Collect 10 NFTs',
    icon: '💎',
    type: AchievementType.COLLECTOR,
    requirement: 10,
    xpReward: 200,
    rarity: 'uncommon'
  },
  {
    id: 'collector_50',
    title: 'Museum Owner',
    description: 'Collect 50 NFTs',
    icon: '🏛️',
    type: AchievementType.COLLECTOR,
    requirement: 50,
    xpReward: 500,
    rarity: 'rare'
  },
  {
>>>>>>> 2caf294 (Initial commit with API documentation and features)
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
<<<<<<< HEAD
=======
    id: 'trader_100',
    title: 'Veteran Trader',
    description: 'Complete 100 trades',
    icon: '📈',
    type: AchievementType.TRADER,
    requirement: 100,
    xpReward: 500,
    rarity: 'rare'
  },
  {
    id: 'first_bid',
    title: 'Auctioneer',
    description: 'Place your first bid',
    icon: '🎯',
    type: AchievementType.TRADER,
    requirement: 1,
    xpReward: 30,
    rarity: 'common'
  },
  {
    id: 'social_butterfly',
    title: 'Social Butterfly',
    description: 'Follow 10 creators',
    icon: '🦋',
    type: AchievementType.SOCIAL,
    requirement: 10,
    xpReward: 100,
    rarity: 'uncommon'
  },
  {
    id: 'popular_creator',
    title: 'Popular Creator',
    description: 'Get 100 followers',
    icon: '⭐',
    type: AchievementType.SOCIAL,
    requirement: 100,
    xpReward: 300,
    rarity: 'rare'
  },
  {
    id: 'milestone_level5',
    title: 'Milestone Master',
    description: 'Reach Level 5',
    icon: '🏆',
    type: AchievementType.MILESTONE,
    requirement: 5,
    xpReward: 250,
    rarity: 'rare'
  },
  {
    id: 'milestone_level10',
    title: 'Legendary Status',
    description: 'Reach Level 10',
    icon: '👑',
    type: AchievementType.MILESTONE,
    requirement: 10,
    xpReward: 1000,
    rarity: 'legendary'
  },
  {
>>>>>>> 2caf294 (Initial commit with API documentation and features)
    id: 'daily_streak_7',
    title: 'Consistent Creator',
    description: 'Maintain a 7-day daily reward streak',
    icon: '🔥',
    type: AchievementType.SPECIAL,
    requirement: 7,
    xpReward: 150,
    rarity: 'uncommon'
<<<<<<< HEAD
  }
];

const userAchievements = new Map<string, UserAchievement[]>();

export const achievementService = {
=======
  },
  {
    id: 'daily_streak_30',
    title: 'Dedicated',
    description: 'Maintain a 30-day daily reward streak',
    icon: '💪',
    type: AchievementType.SPECIAL,
    requirement: 30,
    xpReward: 500,
    rarity: 'epic'
  }
];

// In-memory storage for demo purposes
const userAchievements = new Map<string, UserAchievement[]>();

export const achievementService = {
  // Get all achievements
>>>>>>> 2caf294 (Initial commit with API documentation and features)
  getAllAchievements(): Achievement[] {
    return ACHIEVEMENTS;
  },

<<<<<<< HEAD
=======
  // Get user achievements
>>>>>>> 2caf294 (Initial commit with API documentation and features)
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return userAchievements.get(userId) || [];
  },

<<<<<<< HEAD
=======
  // Unlock achievement
>>>>>>> 2caf294 (Initial commit with API documentation and features)
  async unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement | null> {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return null;

    const userAchs = userAchievements.get(userId) || [];
<<<<<<< HEAD
=======

    // Check if already unlocked
>>>>>>> 2caf294 (Initial commit with API documentation and features)
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
<<<<<<< HEAD
    return userAchievement;
  },

=======

    return userAchievement;
  },

  // Update achievement progress
>>>>>>> 2caf294 (Initial commit with API documentation and features)
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

<<<<<<< HEAD
=======
    // Auto-unlock if requirement met
>>>>>>> 2caf294 (Initial commit with API documentation and features)
    if (userAch.progress >= achievement.requirement && !userAch.unlockedAt) {
      userAch.unlockedAt = new Date();
    }

    userAchievements.set(userId, userAchs);
    return userAch;
  },

<<<<<<< HEAD
=======
  // Get achievement details
>>>>>>> 2caf294 (Initial commit with API documentation and features)
  getAchievementDetails(achievementId: string): Achievement | undefined {
    return ACHIEVEMENTS.find(a => a.id === achievementId);
  },

<<<<<<< HEAD
  async getUnlockedCount(userId: string): Promise<number> {
    const userAchs = await this.getUserAchievements(userId);
    return userAchs.filter(a => a.unlockedAt).length;
  }
};
=======
  // Get achievements by type
  getAchievementsByType(type: AchievementType): Achievement[] {
    return ACHIEVEMENTS.filter(a => a.type === type);
  },

  // Count unlocked achievements
  async getUnlockedCount(userId: string): Promise<number> {
    const userAchs = await this.getUserAchievements(userId);
    return userAchs.filter(a => a.unlockedAt).length;
  },

  // Get achievement progress
  async getProgress(userId: string, achievementId: string): Promise<number> {
    const userAchs = await this.getUserAchievements(userId);
    const userAch = userAchs.find(a => a.achievementId === achievementId);
    return userAch?.progress || 0;
  }
};

// Authentication middleware
export const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
>>>>>>> 2caf294 (Initial commit with API documentation and features)
