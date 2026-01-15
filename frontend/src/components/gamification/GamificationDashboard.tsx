import React, { useState, useEffect } from 'react';
import SearchAchievements from './SearchAchievements';
import AchievementStatusFilter from './AchievementStatusFilter';
import SeasonalAchievements from './SeasonalAchievements';
import SeasonalLeaderboard from './SeasonalLeaderboard';
import { useAchievementService } from './useAchievementService';

interface GamificationDashboardProps {
  userId: string;
  className?: string;
}

export const GamificationDashboard: React.FC<GamificationDashboardProps> = ({
  userId,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'search' | 'achievements' | 'seasonal' | 'leaderboard'
  >('overview');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const service = useAchievementService();

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const userStats = await service.getAchievementStats(userId);
        const userRank = await service.getUserRank(userId);
        setStats({ ...userStats, ...userRank });
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [userId, service]);

  return (
    <div className={`w-full min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">🏆 Gamification Hub</h1>
          <p className="text-blue-100">
            Unlock achievements, climb the leaderboards, and earn exclusive rewards!
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        {!loading && stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <div className="text-sm text-gray-600 dark:text-gray-400">Total XP</div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.totalXP?.toLocaleString() || '0'}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <div className="text-sm text-gray-600 dark:text-gray-400">Achievements</div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.unlockedAchievements || '0'}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <div className="text-sm text-gray-600 dark:text-gray-400">Current Rank</div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                #{stats.rank || '—'}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <div className="text-sm text-gray-600 dark:text-gray-400">Completion</div>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {stats.completionPercentage || '0'}%
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 border-b dark:border-gray-700 pb-4">
          {[
            { id: 'overview', label: '📊 Overview', icon: '📊' },
            { id: 'search', label: '🔍 Search', icon: '🔍' },
            { id: 'achievements', label: '⭐ Achievements', icon: '⭐' },
            { id: 'seasonal', label: '🌟 Seasonal', icon: '🌟' },
            { id: 'leaderboard', label: '🏅 Leaderboard', icon: '🏅' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">📊 Your Achievement Overview</h2>
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded p-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
                        <div className="text-2xl font-bold">
                          {stats.inProgressAchievements || 0}
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded p-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Locked</div>
                        <div className="text-2xl font-bold">{stats.lockedAchievements || 0}</div>
                      </div>
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                    <h3 className="font-bold mb-2">💡 Tips to Earn More</h3>
                    <ul className="text-sm space-y-1">
                      <li>✨ Create and sell NFTs to unlock Creator achievements</li>
                      <li>🛍️ Buy and collect NFTs to unlock Collector achievements</li>
                      <li>💱 Trade and swap NFTs to unlock Trader achievements</li>
                      <li>👥 Share and promote your work to unlock Social achievements</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Search Tab */}
          {activeTab === 'search' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">🔍 Search Achievements</h2>
              <SearchAchievements
                onSelectAchievement={ach => {
                  setActiveTab('achievements');
                }}
              />
              <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  Search for achievements by title or description. Results are ranked by relevance.
                </p>
              </div>
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">⭐ Your Achievements</h2>
              <AchievementStatusFilter userId={userId} />
            </div>
          )}

          {/* Seasonal Tab */}
          {activeTab === 'seasonal' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">🌟 Seasonal Achievements</h2>
              <SeasonalAchievements />
            </div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">🏅 Global Leaderboard</h2>
              <div className="mb-6">
                <button
                  onClick={() => setSelectedSeason('global')}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    selectedSeason === 'global'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  Global Leaderboard
                </button>
              </div>
              {/* Leaderboard Component */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Rank</th>
                      <th className="px-4 py-3 text-left font-semibold">User</th>
                      <th className="px-4 py-3 text-right font-semibold">Total XP</th>
                      <th className="px-4 py-3 text-right font-semibold">Achievements</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    {/* Placeholder - will be populated from backend */}
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-center text-gray-500">
                        Loading leaderboard...
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GamificationDashboard;
