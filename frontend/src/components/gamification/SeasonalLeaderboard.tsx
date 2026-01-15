import React, { useState, useEffect } from 'react';
import { useAchievementService, SeasonalLeaderboardEntry } from './useAchievementService';

interface SeasonalLeaderboardProps {
  seasonId: string;
  limit?: number;
  className?: string;
}

export const SeasonalLeaderboard: React.FC<SeasonalLeaderboardProps> = ({
  seasonId,
  limit = 20,
  className = '',
}) => {
  const [leaderboard, setLeaderboard] = useState<SeasonalLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const service = useAchievementService();

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      try {
        const data = await service.getSeasonalLeaderboard(seasonId, limit);
        setLeaderboard(data);
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [seasonId, limit, service]);

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '⭐';
  };

  return (
    <div className={`w-full ${className}`}>
      <h3 className="text-2xl font-bold mb-4">Seasonal Leaderboard</h3>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      )}

      {!loading && leaderboard.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Rank</th>
                <th className="px-4 py-3 text-left font-semibold">Player</th>
                <th className="px-4 py-3 text-right font-semibold">Seasonal XP</th>
                <th className="px-4 py-3 text-right font-semibold">Achievements</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {leaderboard.map((entry, index) => (
                <tr
                  key={entry.userId}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    index < 3 ? 'bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <span className="text-lg font-bold">{getMedalEmoji(entry.rank)}</span>
                    <span className="ml-2 font-semibold">#{entry.rank}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold">{entry.username}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {entry.seasonalXP.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold">{entry.seasonalAchievements} 🏆</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && leaderboard.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600 dark:text-gray-400">No leaderboard data available.</p>
        </div>
      )}
    </div>
  );
};

export default SeasonalLeaderboard;
