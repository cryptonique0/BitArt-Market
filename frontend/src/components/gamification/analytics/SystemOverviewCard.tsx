import React, { useEffect } from 'react';
import { useGameificationAnalytics } from '../../hooks/useGameificationAnalytics';
import { SystemwideStats } from '../../../backend/src/types/gamification';

interface SystemOverviewCardProps {
  refreshInterval?: number; // milliseconds
}

export const SystemOverviewCard: React.FC<SystemOverviewCardProps> = ({
  refreshInterval = 60000,
}) => {
  const { systemStats, getSystemStats, loading, error } = useGameificationAnalytics();

  useEffect(() => {
    getSystemStats();
    if (refreshInterval > 0) {
      const interval = setInterval(getSystemStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, getSystemStats]);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 animate-pulse">
        <div className="h-8 bg-gray-700 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
        <p className="text-red-400 font-semibold">Error Loading System Stats</p>
        <p className="text-red-300 text-sm mt-2">{error}</p>
      </div>
    );
  }

  if (!systemStats) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-gray-400">No system stats available</div>
    );
  }

  const StatBox: React.FC<{ label: string; value: string | number; color: string }> = ({
    label,
    value,
    color,
  }) => (
    <div className={`bg-gradient-to-br ${color} rounded-lg p-4`}>
      <p className="text-gray-300 text-sm">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">
        {typeof value === 'number' && value > 1000 ? `${(value / 1000).toFixed(1)}k` : value}
      </p>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 space-y-4">
      <div className="border-b border-gray-700 pb-4">
        <h3 className="text-2xl font-bold text-white">System Overview</h3>
        <p className="text-gray-400 text-sm mt-1">Gamification Analytics Dashboard</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox
          label="Total Users"
          value={systemStats.totalUsers}
          color="from-blue-900 to-blue-800"
        />
        <StatBox
          label="Achievements Unlocked"
          value={systemStats.totalUnlockedAchievements}
          color="from-green-900 to-green-800"
        />
        <StatBox
          label="XP Distributed"
          value={systemStats.totalXPDistributed}
          color="from-amber-900 to-amber-800"
        />
        <StatBox
          label="Avg User Level"
          value={systemStats.averageUserLevel.toFixed(1)}
          color="from-purple-900 to-purple-800"
        />
      </div>

      {/* Averages */}
      <div className="bg-gray-700/50 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-white mb-3">Average Metrics per User</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Avg XP per User</p>
            <p className="text-xl font-bold text-amber-400 mt-1">
              {systemStats.averageXPPerUser.toFixed(0)}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Avg Achievements per User</p>
            <p className="text-xl font-bold text-green-400 mt-1">
              {systemStats.averageAchievementsPerUser.toFixed(1)}
            </p>
          </div>
        </div>
      </div>

      {/* Featured Achievements */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-green-900/20 to-green-800/20 border border-green-700 rounded-lg p-4">
          <p className="text-green-400 text-sm font-semibold">Most Popular</p>
          <p className="text-white font-bold mt-2">
            {systemStats.mostPopularAchievement?.title || 'N/A'}
          </p>
          <p className="text-green-300 text-sm mt-1">
            {systemStats.mostPopularAchievement?.totalUnlocks} unlocks
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border border-purple-700 rounded-lg p-4">
          <p className="text-purple-400 text-sm font-semibold">Rarest Achievement</p>
          <p className="text-white font-bold mt-2">
            {systemStats.rarestAchievement?.title || 'N/A'}
          </p>
          <p className="text-purple-300 text-sm mt-1">
            {systemStats.rarestAchievement?.totalUnlocks} unlocks
          </p>
        </div>
      </div>

      {/* Unlock Rates by Type */}
      {Object.keys(systemStats.unlockRateByType || {}).length > 0 && (
        <div className="bg-gray-700/50 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-white mb-3">Unlock Rates by Type</h4>
          <div className="space-y-2">
            {Object.entries(systemStats.unlockRateByType).map(([type, rate]: any) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-gray-300 capitalize">{type}</span>
                <div className="flex items-center gap-2 flex-1 ml-4">
                  <div className="flex-1 bg-gray-600 rounded h-2 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full transition-all duration-300"
                      style={{ width: `${Math.min(rate, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-indigo-400 font-semibold text-sm w-12 text-right">
                    {rate.toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seasonal Info */}
      {(systemStats.totalSeasonalAchievements || 0) > 0 && (
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
          <p className="text-yellow-400 text-sm font-semibold">Seasonal Achievements</p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <p className="text-gray-400 text-xs">Total Seasonal</p>
              <p className="text-xl font-bold text-yellow-300">
                {systemStats.totalSeasonalAchievements}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Active Seasons</p>
              <p className="text-xl font-bold text-yellow-300">{systemStats.activeSeasons}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
