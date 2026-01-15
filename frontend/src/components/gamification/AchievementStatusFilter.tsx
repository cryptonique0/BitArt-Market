import React, { useState, useEffect } from 'react';
import { useAchievementService } from './useAchievementService';

interface AchievementStatusFilterProps {
  userId: string;
  className?: string;
}

export const AchievementStatusFilter: React.FC<AchievementStatusFilterProps> = ({
  userId,
  className = '',
}) => {
  const [status, setStatus] = useState<'locked' | 'in-progress' | 'unlocked'>('unlocked');
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({ locked: 0, 'in-progress': 0, unlocked: 0 });
  const service = useAchievementService();

  useEffect(() => {
    const loadAchievements = async () => {
      setLoading(true);
      try {
        const result = await service.getAchievementsByStatus(userId, status);
        setAchievements(result);
      } catch (error) {
        console.error('Failed to load achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAchievements();
  }, [userId, status, service]);

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const [locked, inProgress, unlocked] = await Promise.all([
          service.getAchievementsByStatus(userId, 'locked'),
          service.getAchievementsByStatus(userId, 'in-progress'),
          service.getAchievementsByStatus(userId, 'unlocked'),
        ]);
        setCounts({
          locked: locked.length,
          'in-progress': inProgress.length,
          unlocked: unlocked.length,
        });
      } catch (error) {
        console.error('Failed to load counts:', error);
      }
    };

    loadCounts();
  }, [userId, service]);

  const getRarityBgColor = (rarity: string) => {
    const colors: Record<string, string> = {
      common: 'bg-gray-100 dark:bg-gray-700',
      uncommon: 'bg-green-100 dark:bg-green-900',
      rare: 'bg-blue-100 dark:bg-blue-900',
      epic: 'bg-purple-100 dark:bg-purple-900',
      legendary: 'bg-yellow-100 dark:bg-yellow-900',
    };
    return colors[rarity] || 'bg-gray-100 dark:bg-gray-700';
  };

  const getRarityTextColor = (rarity: string) => {
    const colors: Record<string, string> = {
      common: 'text-gray-700 dark:text-gray-300',
      uncommon: 'text-green-700 dark:text-green-300',
      rare: 'text-blue-700 dark:text-blue-300',
      epic: 'text-purple-700 dark:text-purple-300',
      legendary: 'text-yellow-700 dark:text-yellow-300',
    };
    return colors[rarity] || 'text-gray-700 dark:text-gray-300';
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['unlocked', 'in-progress', 'locked'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              status === s
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {s === 'unlocked' && '✅'} {s === 'in-progress' && '🔄'} {s === 'locked' && '🔒'}{' '}
            {s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')} ({counts[s]})
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      )}

      {!loading && achievements.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map(achievement => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border-2 ${getRarityBgColor(
                achievement.rarity
              )} ${getRarityTextColor(achievement.rarity)} transition-transform hover:scale-105`}
            >
              <div className="flex items-start gap-3 mb-2">
                <span className="text-3xl">{achievement.icon}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{achievement.title}</h3>
                  <p className="text-sm opacity-75">{achievement.description}</p>
                </div>
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-current border-opacity-20">
                <span className="text-sm font-semibold uppercase tracking-wide">
                  {achievement.rarity}
                </span>
                <span className="font-bold">+{achievement.xpReward} XP</span>
              </div>
              {achievement.tier && (
                <div className="mt-2 text-xs font-semibold uppercase">Tier: {achievement.tier}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && achievements.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {status === 'unlocked' && "You haven't unlocked any achievements yet. Get started! 🚀"}
            {status === 'in-progress' && "You haven't started any achievements yet. 🎯"}
            {status === 'locked' && 'All achievements are available!'}
          </p>
        </div>
      )}
    </div>
  );
};

export default AchievementStatusFilter;
