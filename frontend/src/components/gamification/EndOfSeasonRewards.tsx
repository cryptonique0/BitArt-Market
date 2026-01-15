import React, { useState, useEffect } from 'react';
import { useAchievementService, SeasonalRewards } from './useAchievementService';

interface EndOfSeasonRewardsProps {
  userId: string;
  seasonId: string;
  className?: string;
}

export const EndOfSeasonRewards: React.FC<EndOfSeasonRewardsProps> = ({
  userId,
  seasonId,
  className = '',
}) => {
  const [rewards, setRewards] = useState<SeasonalRewards | null>(null);
  const [loading, setLoading] = useState(false);
  const service = useAchievementService();

  useEffect(() => {
    const loadRewards = async () => {
      setLoading(true);
      try {
        const data = await service.getSeasonalRewards(userId, seasonId);
        setRewards(data);
      } catch (error) {
        console.error('Failed to load rewards:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRewards();
  }, [userId, seasonId, service]);

  const completionPercentage =
    rewards && rewards.seasonalAchievements > 0
      ? (rewards.seasonalAchievements / (rewards.seasonalAchievements + 5)) * 100
      : 0;

  const getRewardColor = (reward?: string) => {
    if (!reward) return 'bg-gray-100 dark:bg-gray-800';
    if (reward.includes('Master')) return 'bg-yellow-100 dark:bg-yellow-900';
    if (reward.includes('Champion')) return 'bg-purple-100 dark:bg-purple-900';
    if (reward.includes('Participant')) return 'bg-blue-100 dark:bg-blue-900';
    return 'bg-gray-100 dark:bg-gray-800';
  };

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      )}

      {!loading && rewards && (
        <div className={`rounded-lg p-8 text-center ${getRewardColor(rewards.seasonReward)}`}>
          {/* Reward Title */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">Season Complete!</h2>
            {rewards.seasonReward && (
              <p className="text-5xl mb-3">{rewards.seasonReward.split(' ')[0]}</p>
            )}
            <p className="text-lg font-semibold">{rewards.seasonReward || 'Season Participant'}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-300">Seasonal XP</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {rewards.totalSeasonalXP.toLocaleString()}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-300">Achievements</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {rewards.seasonalAchievements}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-300">Bonus XP</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                +{rewards.bonusXP}
              </div>
            </div>
          </div>

          {/* Completion Percentage */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Season Completion</span>
              <span className="font-bold text-lg">{Math.round(completionPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full h-4 transition-all"
                style={{ width: `${Math.min(100, completionPercentage)}%` }}
              />
            </div>
          </div>

          {/* Bonus Tier Info */}
          {rewards.bonusXP > 0 && (
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 mb-4 text-left">
              <h3 className="font-bold mb-2">Bonus Tiers</h3>
              <div className="space-y-2 text-sm">
                {completionPercentage >= 100 && (
                  <div className="text-yellow-600 dark:text-yellow-400 font-semibold">
                    👑 100% Completion: +1000 XP (Season Master)
                  </div>
                )}
                {completionPercentage >= 75 && completionPercentage < 100 && (
                  <div className="text-purple-600 dark:text-purple-400 font-semibold">
                    🌟 75%+ Completion: +500 XP (Season Champion)
                  </div>
                )}
                {completionPercentage >= 50 && completionPercentage < 75 && (
                  <div className="text-blue-600 dark:text-blue-400 font-semibold">
                    ⭐ 50%+ Completion: +250 XP (Season Participant)
                  </div>
                )}
                {completionPercentage >= 25 && completionPercentage < 50 && (
                  <div className="text-gray-600 dark:text-gray-400 font-semibold">
                    💫 25%+ Completion: +100 XP (Season Explorer)
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Total Reward */}
          <div className="bg-green-100 dark:bg-green-900 rounded-lg p-4">
            <div className="text-sm text-green-700 dark:text-green-300 mb-1">Total Reward</div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              +{(rewards.totalSeasonalXP + rewards.bonusXP).toLocaleString()} XP
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EndOfSeasonRewards;
