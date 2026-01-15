import { useState, useCallback, useEffect } from 'react';
import {
  UserAchievementStats,
  AchievementPopularity,
  AchievementUnlockRate,
  SystemwideStats,
  AchievementEngagementMetrics,
} from '../../../backend/src/types/gamification';

interface UseGameificationAnalyticsOptions {
  autoFetch?: boolean;
  cacheDuration?: number; // in milliseconds
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export function useGameificationAnalytics(options: UseGameificationAnalyticsOptions = {}) {
  const { autoFetch = false, cacheDuration = 5 * 60 * 1000 } = options;

  // State
  const [userStats, setUserStats] = useState<UserAchievementStats | null>(null);
  const [systemStats, setSystemStats] = useState<SystemwideStats | null>(null);
  const [achievementMetrics, setAchievementMetrics] = useState<
    Record<string, AchievementEngagementMetrics>
  >({});
  const [unlockRates, setUnlockRates] = useState<AchievementUnlockRate[]>([]);
  const [trendingAchievements, setTrendingAchievements] = useState<AchievementUnlockRate[]>([]);
  const [topAchievements, setTopAchievements] = useState<AchievementUnlockRate[]>([]);
  const [rariestAchievements, setRariestAchievements] = useState<AchievementUnlockRate[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cache
  const cache = new Map<string, CacheEntry<any>>();

  const isCacheValid = useCallback(
    (key: string): boolean => {
      const entry = cache.get(key);
      if (!entry) return false;
      return Date.now() - entry.timestamp < cacheDuration;
    },
    [cacheDuration]
  );

  const getFromCache = useCallback(
    <T>(key: string): T | null => {
      if (!isCacheValid(key)) {
        cache.delete(key);
        return null;
      }
      return cache.get(key)?.data || null;
    },
    [isCacheValid]
  );

  const setInCache = useCallback(<T>(key: string, data: T): void => {
    cache.set(key, { data, timestamp: Date.now() });
  }, []);

  // API calls
  const getUserStats = useCallback(
    async (userId: string) => {
      try {
        const cached = getFromCache<UserAchievementStats>(`user-stats-${userId}`);
        if (cached) {
          setUserStats(cached);
          return cached;
        }

        setLoading(true);
        const response = await fetch(`/api/gamification/analytics/user/${userId}/achievements`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        });

        if (!response.ok) throw new Error(`Failed to fetch user stats: ${response.statusText}`);
        const data = await response.json();
        const stats = data.data as UserAchievementStats;

        setInCache(`user-stats-${userId}`, stats);
        setUserStats(stats);
        setError(null);
        return stats;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Failed to get user stats:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [getFromCache, setInCache]
  );

  const getSystemStats = useCallback(async () => {
    try {
      const cached = getFromCache<SystemwideStats>('system-stats');
      if (cached) {
        setSystemStats(cached);
        return cached;
      }

      setLoading(true);
      const response = await fetch('/api/gamification/analytics/system/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });

      if (!response.ok) throw new Error(`Failed to fetch system stats: ${response.statusText}`);
      const data = await response.json();
      const stats = data.data as SystemwideStats;

      setInCache('system-stats', stats);
      setSystemStats(stats);
      setError(null);
      return stats;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Failed to get system stats:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getFromCache, setInCache]);

  const getAchievementEngagement = useCallback(
    async (achievementId: string) => {
      try {
        const cached = getFromCache<AchievementEngagementMetrics>(`engagement-${achievementId}`);
        if (cached) return cached;

        setLoading(true);
        const response = await fetch(
          `/api/gamification/analytics/achievements/${achievementId}/engagement`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
          }
        );

        if (!response.ok)
          throw new Error(`Failed to fetch engagement metrics: ${response.statusText}`);
        const data = await response.json();
        const metrics = data.data as AchievementEngagementMetrics;

        setInCache(`engagement-${achievementId}`, metrics);
        setAchievementMetrics(prev => ({ ...prev, [achievementId]: metrics }));
        setError(null);
        return metrics;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Failed to get engagement metrics:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [getFromCache, setInCache]
  );

  const getUnlockRates = useCallback(
    async (limit = 50) => {
      try {
        const cached = getFromCache<AchievementUnlockRate[]>(`unlock-rates-${limit}`);
        if (cached) {
          setUnlockRates(cached);
          return cached;
        }

        setLoading(true);
        const response = await fetch(
          `/api/gamification/analytics/achievements-rates?limit=${limit}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
          }
        );

        if (!response.ok) throw new Error(`Failed to fetch unlock rates: ${response.statusText}`);
        const data = await response.json();
        const rates = data.data as AchievementUnlockRate[];

        setInCache(`unlock-rates-${limit}`, rates);
        setUnlockRates(rates);
        setError(null);
        return rates;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Failed to get unlock rates:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [getFromCache, setInCache]
  );

  const getTrendingAchievements = useCallback(
    async (limit = 10) => {
      try {
        const cached = getFromCache<AchievementUnlockRate[]>(`trending-${limit}`);
        if (cached) {
          setTrendingAchievements(cached);
          return cached;
        }

        setLoading(true);
        const response = await fetch(
          `/api/gamification/analytics/achievements/trending?limit=${limit}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
          }
        );

        if (!response.ok)
          throw new Error(`Failed to fetch trending achievements: ${response.statusText}`);
        const data = await response.json();
        const achievements = data.data as AchievementUnlockRate[];

        setInCache(`trending-${limit}`, achievements);
        setTrendingAchievements(achievements);
        setError(null);
        return achievements;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Failed to get trending achievements:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [getFromCache, setInCache]
  );

  const getTopAchievements = useCallback(
    async (limit = 10) => {
      try {
        const cached = getFromCache<AchievementUnlockRate[]>(`top-${limit}`);
        if (cached) {
          setTopAchievements(cached);
          return cached;
        }

        setLoading(true);
        const response = await fetch(
          `/api/gamification/analytics/achievements/top-unlocked?limit=${limit}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
          }
        );

        if (!response.ok)
          throw new Error(`Failed to fetch top achievements: ${response.statusText}`);
        const data = await response.json();
        const achievements = data.data as AchievementUnlockRate[];

        setInCache(`top-${limit}`, achievements);
        setTopAchievements(achievements);
        setError(null);
        return achievements;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Failed to get top achievements:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [getFromCache, setInCache]
  );

  const getRariestAchievements = useCallback(
    async (limit = 10) => {
      try {
        const cached = getFromCache<AchievementUnlockRate[]>(`rarest-${limit}`);
        if (cached) {
          setRariestAchievements(cached);
          return cached;
        }

        setLoading(true);
        const response = await fetch(
          `/api/gamification/analytics/achievements/rarest?limit=${limit}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
          }
        );

        if (!response.ok)
          throw new Error(`Failed to fetch rarest achievements: ${response.statusText}`);
        const data = await response.json();
        const achievements = data.data as AchievementUnlockRate[];

        setInCache(`rarest-${limit}`, achievements);
        setRariestAchievements(achievements);
        setError(null);
        return achievements;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Failed to get rarest achievements:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [getFromCache, setInCache]
  );

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      getSystemStats();
      getTrendingAchievements();
      getTopAchievements();
    }
  }, [autoFetch, getSystemStats, getTrendingAchievements, getTopAchievements]);

  // Clear cache on unmount
  useEffect(() => {
    return () => {
      cache.clear();
    };
  }, []);

  return {
    // State
    userStats,
    systemStats,
    achievementMetrics,
    unlockRates,
    trendingAchievements,
    topAchievements,
    rariestAchievements,
    loading,
    error,

    // Methods
    getUserStats,
    getSystemStats,
    getAchievementEngagement,
    getUnlockRates,
    getTrendingAchievements,
    getTopAchievements,
    getRariestAchievements,

    // Cache control
    clearCache: () => cache.clear(),
  };
}
