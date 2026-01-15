import axios, { AxiosInstance } from 'axios';

// Types
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: string;
  requirement: number;
  xpReward: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  tier?: string;
  unlockedAt?: Date;
  seasonId?: string;
  isSeasonal?: boolean;
}

export interface AchievementSearchResult {
  achievement: Achievement;
  matchScore: number;
  matchReason: 'title' | 'description' | 'both';
}

export interface UserProgress {
  userId: string;
  unlocked: Achievement[];
  inProgress: Achievement[];
  locked: Achievement[];
  totalXP: number;
  completionPercentage: number;
  currentRank: number;
}

export interface SeasonConfig {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  theme: string;
  color: string;
  icon: string;
  isActive: boolean;
}

export interface SeasonalLeaderboardEntry {
  userId: string;
  username: string;
  seasonalXP: number;
  seasonalAchievements: number;
  rank: number;
}

export interface SeasonalRewards {
  totalSeasonalXP: number;
  seasonalAchievements: number;
  bonusXP: number;
  seasonReward?: string;
}

// Custom hook for achievement service
export const useAchievementService = (
  baseURL: string = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
) => {
  const api: AxiosInstance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return {
    // Base Achievements
    getAllAchievements: async (): Promise<Achievement[]> => {
      const response = await api.get('/achievements');
      return response.data;
    },

    getUserAchievements: async (userId: string): Promise<Achievement[]> => {
      const response = await api.get(`/users/${userId}/achievements`);
      return response.data;
    },

    unlockAchievement: async (
      userId: string,
      achievementId: string
    ): Promise<Achievement | null> => {
      const response = await api.post(`/users/${userId}/achievements/${achievementId}/unlock`);
      return response.data;
    },

    // Search & Filter
    searchAchievements: async (query: string): Promise<AchievementSearchResult[]> => {
      const response = await api.get('/achievements/search', { params: { q: query } });
      return response.data;
    },

    getAchievementsByStatus: async (
      userId: string,
      status: 'locked' | 'in-progress' | 'unlocked'
    ): Promise<Achievement[]> => {
      const response = await api.get(`/users/${userId}/achievements/status/${status}`);
      return response.data;
    },

    // Seasonal
    getActiveSeasons: async (): Promise<SeasonConfig[]> => {
      const response = await api.get('/seasons/active');
      return response.data;
    },

    getSeasonalAchievements: async (seasonId: string): Promise<Achievement[]> => {
      const response = await api.get(`/seasons/${seasonId}/achievements`);
      return response.data;
    },

    getSeasonalLeaderboard: async (
      seasonId: string,
      limit: number = 20
    ): Promise<SeasonalLeaderboardEntry[]> => {
      const response = await api.get(`/seasons/${seasonId}/leaderboard`, { params: { limit } });
      return response.data;
    },

    getUserSeasonalProgress: async (userId: string, seasonId: string): Promise<any> => {
      const response = await api.get(`/users/${userId}/seasons/${seasonId}/progress`);
      return response.data;
    },

    getSeasonalRewards: async (userId: string, seasonId: string): Promise<SeasonalRewards> => {
      const response = await api.get(`/users/${userId}/seasons/${seasonId}/rewards`);
      return response.data;
    },

    getSeasonTimeline: async (): Promise<any> => {
      const response = await api.get('/seasons/timeline');
      return response.data;
    },

    // Leaderboards
    getGlobalLeaderboard: async (limit: number = 20): Promise<any[]> => {
      const response = await api.get('/leaderboard/global', { params: { limit } });
      return response.data;
    },

    getUserRank: async (userId: string): Promise<{ rank: number; totalXP: number }> => {
      const response = await api.get(`/leaderboard/user/${userId}`);
      return response.data;
    },

    // Progress
    getUserProgress: async (userId: string): Promise<UserProgress> => {
      const response = await api.get(`/users/${userId}/progress`);
      return response.data;
    },

    getAchievementStats: async (userId: string): Promise<any> => {
      const response = await api.get(`/users/${userId}/achievements/stats`);
      return response.data;
    },
  };
};
