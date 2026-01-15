import React, { useState, useEffect } from 'react';
import { useAchievementService, SeasonConfig } from './useAchievementService';

interface SeasonalAchievementsProps {
  className?: string;
}

export const SeasonalAchievements: React.FC<SeasonalAchievementsProps> = ({ className = '' }) => {
  const [seasons, setSeasons] = useState<SeasonConfig[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const service = useAchievementService();

  useEffect(() => {
    const loadSeasons = async () => {
      setLoading(true);
      try {
        const activeSeasons = await service.getActiveSeasons();
        setSeasons(activeSeasons);
        if (activeSeasons.length > 0) {
          setSelectedSeason(activeSeasons[0].id);
        }
      } catch (error) {
        console.error('Failed to load seasons:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSeasons();
  }, [service]);

  useEffect(() => {
    const loadSeasonalAchievements = async () => {
      if (!selectedSeason) return;

      setLoading(true);
      try {
        const achs = await service.getSeasonalAchievements(selectedSeason);
        setAchievements(achs);
      } catch (error) {
        console.error('Failed to load seasonal achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSeasonalAchievements();
  }, [selectedSeason, service]);

  const calculateDaysRemaining = (season: SeasonConfig) => {
    const now = new Date();
    const endDate = new Date(season.endDate);
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysLeft);
  };

  const selectedSeasonData = seasons.find(s => s.id === selectedSeason);
  const daysRemaining = selectedSeasonData ? calculateDaysRemaining(selectedSeasonData) : 0;

  return (
    <div className={`w-full ${className}`}>
      {/* Season Banner */}
      {selectedSeasonData && (
        <div
          className="rounded-lg p-6 mb-6 text-white relative overflow-hidden"
          style={{ backgroundColor: selectedSeasonData.color }}
        >
          <div className="absolute top-0 right-0 text-6xl opacity-20">
            {selectedSeasonData.icon}
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2">{selectedSeasonData.name}</h2>
            <p className="text-white text-opacity-90 mb-4">{selectedSeasonData.description}</p>
            <div className="flex items-center gap-4">
              <div className="bg-white bg-opacity-20 rounded px-3 py-2">
                <div className="text-sm opacity-75">Time Remaining</div>
                <div className="text-xl font-bold">
                  {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
                </div>
              </div>
              <div className="flex-1">
                <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                  <div
                    className="bg-white rounded-full h-2 transition-all"
                    style={{
                      width: `${Math.max(0, 100 - (daysRemaining / 90) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Season Selector */}
      {seasons.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">Select Season</label>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {seasons.map(season => (
              <button
                key={season.id}
                onClick={() => setSelectedSeason(season.id)}
                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  selectedSeason === season.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {season.icon} {season.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Achievements Grid */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      )}

      {!loading && achievements.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map(achievement => {
            const isExpired = achievement.isExpired;
            return (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border-2 border-yellow-300 bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-30 transition-transform hover:scale-105 ${
                  isExpired ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-3xl">{achievement.icon}</span>
                  {isExpired && <span className="text-xs font-bold text-red-500">EXPIRED</span>}
                  {!isExpired && achievement.daysRemaining && (
                    <span className="text-xs font-bold text-orange-500">
                      ⏱️ {achievement.daysRemaining}d
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-lg mb-1">{achievement.title}</h3>
                <p className="text-sm opacity-75 mb-2">{achievement.description}</p>
                <div className="text-xs font-semibold uppercase mb-3 text-yellow-700 dark:text-yellow-300">
                  {achievement.rarity}
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-yellow-300 border-opacity-50">
                  <span className="text-sm">Requirement: {achievement.requirement}</span>
                  <span className="font-bold">+{achievement.xpReward} XP</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && achievements.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600 dark:text-gray-400">
            No seasonal achievements available.
          </p>
        </div>
      )}
    </div>
  );
};

export default SeasonalAchievements;
