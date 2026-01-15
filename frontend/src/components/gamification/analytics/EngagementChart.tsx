import React, { useEffect, useState } from 'react';
import { useGameificationAnalytics } from '../../hooks/useGameificationAnalytics';
import { AchievementEngagementMetrics } from '../../../backend/src/types/gamification';

interface EngagementChartProps {
  achievementId: string;
  compact?: boolean;
}

export const EngagementChart: React.FC<EngagementChartProps> = ({
  achievementId,
  compact = false,
}) => {
  const { achievementMetrics, getAchievementEngagement, loading, error } =
    useGameificationAnalytics();
  const [metrics, setMetrics] = useState<AchievementEngagementMetrics | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      const result = await getAchievementEngagement(achievementId);
      setMetrics(result);
    };
    fetchMetrics();
  }, [achievementId, getAchievementEngagement]);

  useEffect(() => {
    if (achievementMetrics[achievementId]) {
      setMetrics(achievementMetrics[achievementId]);
    }
  }, [achievementMetrics, achievementId]);

  if (loading) {
    return <div className="bg-gray-700 rounded h-20 animate-pulse"></div>;
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (!metrics) {
    return <div className="text-gray-400 text-sm">No engagement data</div>;
  }

  const getEngagementColor = (): string => {
    if (metrics.engagementScore >= 75) return 'from-green-500 to-green-600';
    if (metrics.engagementScore >= 50) return 'from-yellow-500 to-yellow-600';
    if (metrics.engagementScore >= 25) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  const getEngagementStatus = (): string => {
    if (metrics.engagementScore >= 75) return 'Very High';
    if (metrics.engagementScore >= 50) return 'High';
    if (metrics.engagementScore >= 25) return 'Moderate';
    return 'Low';
  };

  if (compact) {
    return (
      <div className={`bg-gradient-to-r ${getEngagementColor()} rounded-lg p-3`}>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-white text-xs font-semibold">Engagement</p>
            <p className="text-white text-lg font-bold">{getEngagementStatus()}</p>
          </div>
          <p className="text-2xl font-bold text-white">{metrics.engagementScore.toFixed(0)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 space-y-4">
      <div className="border-b border-gray-700 pb-4">
        <h3 className="text-lg font-bold text-white">Engagement Metrics</h3>
        <p className="text-gray-400 text-sm mt-1">Achievement ID: {achievementId}</p>
      </div>

      {/* Main Engagement Score */}
      <div className={`bg-gradient-to-r ${getEngagementColor()} rounded-lg p-6`}>
        <p className="text-gray-100 text-sm font-semibold mb-2">Overall Engagement Score</p>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-5xl font-bold text-white">{metrics.engagementScore.toFixed(0)}</p>
            <p className="text-gray-100 text-sm mt-2">{getEngagementStatus()} Engagement</p>
          </div>
          <div className="text-right">
            <p className="text-gray-100 text-xs">Status</p>
            <p className="text-white font-semibold mt-1">
              {metrics.isEngaging ? '✓ Active' : '✗ Inactive'}
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
          <p className="text-blue-400 text-sm font-semibold">Unlock Velocity</p>
          <p className="text-2xl font-bold text-blue-300 mt-2">
            {metrics.unlockVelocity.toFixed(2)}
          </p>
          <p className="text-blue-400 text-xs mt-1">unlocks/day</p>
        </div>

        <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
          <p className="text-green-400 text-sm font-semibold">Recent Unlocks</p>
          <p className="text-2xl font-bold text-green-300 mt-2">{metrics.recentUnlocks}</p>
          <p className="text-green-400 text-xs mt-1">last 7 days</p>
        </div>
      </div>

      {/* Progress Metrics */}
      <div className="bg-gray-700/50 rounded-lg p-4 space-y-3">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-300 text-sm">Users in Progress</span>
            <span className="text-gray-400 font-semibold">{metrics.usersInProgress}</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-300 text-sm">Average Progress</span>
            <span className="text-amber-400 font-semibold">
              {metrics.averageProgressPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-600 rounded h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-400 to-amber-500 h-full transition-all duration-300"
              style={{ width: `${metrics.averageProgressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2 p-3 bg-gray-700/50 rounded-lg">
        <div
          className={`w-3 h-3 rounded-full ${metrics.isEngaging ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}
        ></div>
        <span className="text-gray-300 text-sm">
          {metrics.isEngaging
            ? 'This achievement is actively engaging users'
            : 'This achievement has low engagement'}
        </span>
      </div>
    </div>
  );
};
