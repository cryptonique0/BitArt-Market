import React, { useEffect } from 'react';
import { useGameificationAnalytics } from '../../hooks/useGameificationAnalytics';
import { UserAchievementStats } from '../../../backend/src/types/gamification';

interface UserStatsCardProps {
  userId: string;
  compact?: boolean;
}

export const UserStatsCard: React.FC<UserStatsCardProps> = ({ userId, compact = false }) => {
  const { userStats, getUserStats, loading, error } = useGameificationAnalytics();

  useEffect(() => {
    getUserStats(userId);
  }, [userId, getUserStats]);

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
        <p className="text-red-400 font-semibold">Error Loading Stats</p>
        <p className="text-red-300 text-sm mt-2">{error}</p>
      </div>
    );
  }

  if (!userStats) {
    return <div className="bg-gray-800 rounded-lg p-6 text-gray-400">No stats available</div>;
  }

  const levelProgress = (userStats.totalXP % 1000) / 1000; // Assuming 1000 XP per level

  if (compact) {
    return (
      <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-lg p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-gray-300 text-sm">Level</p>
            <p className="text-3xl font-bold text-white">{userStats.currentLevel}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-300 text-sm">Total XP</p>
            <p className="text-2xl font-bold text-amber-400">
              {userStats.totalXP.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-300">
            Achievements: {userStats.totalAchievementsUnlocked}/
            {userStats.totalAchievementsAvailable}
          </span>
          <span className="text-indigo-300">{userStats.overallUnlockRate.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-400 to-purple-400 h-full transition-all duration-300"
            style={{ width: `${levelProgress * 100}%` }}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-lg p-6 space-y-4">
      <div className="border-b border-indigo-700 pb-4">
        <h3 className="text-xl font-bold text-white mb-2">Achievement Stats</h3>
        <p className="text-gray-300 text-sm">User ID: {userId}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-indigo-800/50 rounded p-3">
          <p className="text-gray-400 text-sm">Current Level</p>
          <p className="text-3xl font-bold text-white mt-1">{userStats.currentLevel}</p>
        </div>
        <div className="bg-indigo-800/50 rounded p-3">
          <p className="text-gray-400 text-sm">Total XP</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">
            {userStats.totalXP.toLocaleString()}
          </p>
        </div>
      </div>

      <div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-300">Overall Unlock Rate</span>
          <span className="text-indigo-300 font-semibold">
            {userStats.overallUnlockRate.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-400 to-purple-400 h-full transition-all duration-300"
            style={{ width: `${userStats.overallUnlockRate}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-2">
        <div className="text-center">
          <p className="text-gray-400 text-xs">Unlocked</p>
          <p className="text-2xl font-bold text-green-400">{userStats.totalAchievementsUnlocked}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-xs">In Progress</p>
          <p className="text-2xl font-bold text-yellow-400">{userStats.achievements.inProgress}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-xs">Locked</p>
          <p className="text-2xl font-bold text-red-400">{userStats.achievements.locked}</p>
        </div>
      </div>

      <div className="pt-4 border-t border-indigo-700">
        <p className="text-gray-400 text-xs mb-2">By Status</p>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(userStats.byRarity || {}).map(([rarity, data]: any) => (
            <div key={rarity} className="bg-gray-700 rounded p-2 text-center text-xs">
              <p className="text-gray-400 capitalize">{rarity}</p>
              <p className="text-white font-semibold">{data.unlocked || 0}</p>
            </div>
          ))}
        </div>
      </div>

      {userStats.lastActivityDate && (
        <div className="pt-4 border-t border-indigo-700">
          <p className="text-gray-400 text-xs">
            Last Activity: {new Date(userStats.lastActivityDate).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
};
