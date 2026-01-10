import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface DailyRewardClaimProps {
  userId: string;
}

interface DailyReward {
  userId: string;
  date: string;
  xpAmount: number;
  claimed: boolean;
  streak: number;
}

const DailyRewardClaim = ({ userId }: DailyRewardClaimProps) => {
  const [reward, setReward] = useState<DailyReward | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDailyReward();
  }, [userId]);

  const fetchDailyReward = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/gamification/rewards/daily/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setReward(data);
        setClaimed(data.claimed);
      }
    } catch (err) {
      setError('Failed to load daily reward');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!reward || claimed) return;

    try {
      setClaiming(true);
      const response = await fetch('/api/gamification/rewards/daily/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        const data = await response.json();
        setClaimed(true);
        setReward(data.reward);
      } else {
        setError('Failed to claim reward');
      }
    } catch (err) {
      setError('Failed to claim reward');
      console.error(err);
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin text-4xl">⭐</div>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Loading reward...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 rounded-lg p-4 text-center">
        <p className="text-red-800 dark:text-red-200">{error}</p>
      </div>
    );
  }

  if (!reward) return null;

  const baseXP = 50;
  const streakBonus = reward.streak * 10;
  const totalXP = baseXP + streakBonus;

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-6 border-2 border-yellow-400 dark:border-yellow-600">
      {claimed ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1 }}
            className="text-6xl mb-4"
          >
            ✅
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Reward Claimed!
          </h3>
          <p className="text-xl text-green-600 dark:text-green-400 font-bold">
            +{totalXP} XP
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Come back tomorrow for more!
          </p>
        </motion.div>
      ) : (
        <div className="text-center">
          <div className="text-6xl mb-4">🎁</div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Daily Reward Available!
          </h3>
          
          <div className="space-y-2 mb-6">
            <div className="flex justify-between items-center p-2 bg-white/50 dark:bg-gray-800/50 rounded">
              <span className="text-gray-700 dark:text-gray-300">Base XP:</span>
              <span className="font-bold text-gray-900 dark:text-white">{baseXP} XP</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white/50 dark:bg-gray-800/50 rounded">
              <span className="text-gray-700 dark:text-gray-300">Streak Bonus:</span>
              <span className="font-bold text-orange-600 dark:text-orange-400">
                +{streakBonus} XP
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
              <span className="font-bold text-white">Total:</span>
              <span className="font-bold text-white text-xl">{totalXP} XP</span>
            </div>
          </div>

          {reward.streak > 0 && (
            <div className="mb-4 inline-block bg-red-500 text-white px-4 py-2 rounded-full">
              🔥 {reward.streak} Day Streak!
            </div>
          )}

          <button
            onClick={handleClaim}
            disabled={claiming}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {claiming ? '⏳ Claiming...' : '🎁 Claim Reward'}
          </button>
        </div>
      )}
    </div>
  );
};

export default DailyRewardClaim;
