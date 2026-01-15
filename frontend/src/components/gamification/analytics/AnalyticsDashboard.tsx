import React, { useState } from 'react';
import { UserStatsCard } from './UserStatsCard';
import { SystemOverviewCard } from './SystemOverviewCard';
import { AchievementRankings } from './AchievementRankings';
import { EngagementChart } from './EngagementChart';

interface AnalyticsDashboardProps {
  userId?: string;
  selectedAchievementId?: string;
  onAchievementSelect?: (achievementId: string) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  userId,
  selectedAchievementId,
  onAchievementSelect,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'rankings' | 'user'>('overview');
  const [selectedAchievement, setSelectedAchievement] = useState<string>(selectedAchievementId || '');

  const handleAchievementSelect = (id: string) => {
    setSelectedAchievement(id);
    onAchievementSelect?.(id);
    setActiveTab('overview');
  };

  return (
    <div className="w-full bg-gray-900 text-white rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 p-6 border-b border-gray-800">
        <h1 className="text-3xl font-bold mb-2">Gamification Analytics</h1>
        <p className="text-gray-300">Monitor achievement statistics, engagement metrics, and user progress</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800 bg-gray-800/50 sticky top-0 z-10">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-6 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-900/20'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            System Overview
          </button>
          <button
            onClick={() => setActiveTab('rankings')}
            className={`flex-1 px-6 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'rankings'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-900/20'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Achievement Rankings
          </button>
          {userId && (
            <button
              onClick={() => setActiveTab('user')}
              className={`flex-1 px-6 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'user'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-900/20'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              User Stats
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* System Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <SystemOverviewCard refreshInterval={60000} />

            {/* Achievement Engagement Details */}
            {selectedAchievement && (
              <div className="border-t border-gray-700 pt-6">
                <h2 className="text-2xl font-bold mb-4">Selected Achievement Details</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <EngagementChart achievementId={selectedAchievement} />
                  </div>
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-3">About This Achievement</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Selected achievement ID: {selectedAchievement}
                    </p>
                    <button
                      onClick={() => setSelectedAchievement('')}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded transition-colors"
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rankings Tab */}
        {activeTab === 'rankings' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <AchievementRankings type="popular" limit={10} />
              </div>
              <div className="lg:col-span-1">
                <AchievementRankings type="rarest" limit={10} />
              </div>
              <div className="lg:col-span-1">
                <AchievementRankings type="trending" limit={10} />
              </div>
            </div>
          </div>
        )}

        {/* User Stats Tab */}
        {activeTab === 'user' && userId && (
          <div className="space-y-6">
            <UserStatsCard userId={userId} compact={false} />

            {/* User Stats Summary */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4">About This User</h3>
              <p className="text-gray-400 text-sm">
                View detailed achievement statistics, progress tracking, and performance metrics for user {userId}.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-800/50 border-t border-gray-800 p-4 text-center text-gray-400 text-sm">
        <p>Analytics data is cached and refreshes every 5 minutes. Last updated: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
};
