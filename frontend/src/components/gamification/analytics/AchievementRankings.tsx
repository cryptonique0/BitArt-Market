import React, { useEffect } from 'react';
import { useGameificationAnalytics } from '../../hooks/useGameificationAnalytics';
import { AchievementUnlockRate } from '../../../backend/src/types/gamification';

interface AchievementRankingsProps {
  type?: 'popular' | 'rarest' | 'trending';
  limit?: number;
}

export const AchievementRankings: React.FC<AchievementRankingsProps> = ({
  type = 'popular',
  limit = 10,
}) => {
  const {
    topAchievements,
    rariestAchievements,
    trendingAchievements,
    getTopAchievements,
    getRariestAchievements,
    getTrendingAchievements,
    loading,
    error,
  } = useGameificationAnalytics();

  useEffect(() => {
    if (type === 'popular') {
      getTopAchievements(limit);
    } else if (type === 'rarest') {
      getRariestAchievements(limit);
    } else if (type === 'trending') {
      getTrendingAchievements(limit);
    }
  }, [type, limit, getTopAchievements, getRariestAchievements, getTrendingAchievements]);

  const getAchievements = (): AchievementUnlockRate[] => {
    if (type === 'popular') return topAchievements;
    if (type === 'rarest') return rariestAchievements;
    if (type === 'trending') return trendingAchievements;
    return [];
  };

  const getRarityColor = (popularity: string): string => {
    switch (popularity.toLowerCase()) {
      case 'legendary':
        return 'from-yellow-900 to-yellow-800 border-yellow-600';
      case 'epic':
        return 'from-purple-900 to-purple-800 border-purple-600';
      case 'rare':
        return 'from-blue-900 to-blue-800 border-blue-600';
      case 'uncommon':
        return 'from-green-900 to-green-800 border-green-600';
      default:
        return 'from-gray-900 to-gray-800 border-gray-600';
    }
  };

  const getRarityBadgeColor = (popularity: string): string => {
    switch (popularity.toLowerCase()) {
      case 'legendary':
        return 'bg-yellow-600 text-yellow-100';
      case 'epic':
        return 'bg-purple-600 text-purple-100';
      case 'rare':
        return 'bg-blue-600 text-blue-100';
      case 'uncommon':
        return 'bg-green-600 text-green-100';
      default:
        return 'bg-gray-600 text-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="bg-gray-700 rounded h-16 animate-pulse"></div>
          ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
        <p className="text-red-400 font-semibold">Error Loading Rankings</p>
        <p className="text-red-300 text-sm mt-2">{error}</p>
      </div>
    );
  }

  const achievements = getAchievements();

  const titles = {
    popular: 'Most Popular Achievements',
    rarest: 'Rarest Achievements',
    trending: 'Trending Achievements',
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-gray-700 pb-4">
        <h3 className="text-xl font-bold text-white">{titles[type]}</h3>
        <p className="text-gray-400 text-sm mt-1">Top {achievements.length} achievements</p>
      </div>

      {achievements.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">No achievements found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {achievements.map((achievement, index) => (
            <div
              key={achievement.achievementId}
              className={`bg-gradient-to-r ${getRarityColor(
                achievement.popularity
              )} border rounded-lg p-4 flex items-center justify-between group hover:shadow-lg transition-shadow`}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="text-2xl font-bold text-gray-400 w-8">{index + 1}</div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold">{achievement.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${getRarityBadgeColor(achievement.popularity)}`}
                    >
                      {achievement.popularity}
                    </span>
                    <span className="text-gray-300 text-sm">
                      {achievement.totalUnlocks} unlocks
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-lg font-bold text-white">{achievement.unlockRate.toFixed(1)}%</p>
                <p className="text-gray-300 text-xs mt-1">
                  {achievement.trend === 'increasing' && '📈 Rising'}
                  {achievement.trend === 'stable' && '➡️ Stable'}
                  {achievement.trend === 'decreasing' && '📉 Falling'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
