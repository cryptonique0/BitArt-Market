import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Reward,
  useGamificationStore
} from '../../store/gamification';

const formatTimeLeft = (ms: number) => {
  if (ms <= 0) return 'Ready';
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours > 0) return `${hours}h ${remainingMinutes}m`;
  return `${remainingMinutes}m`;
};

const StatCard: React.FC<{ title: string; value: string; accent?: string; helper?: string }> = ({
  title,
  value,
  accent = 'from-blue-500 to-indigo-600',
  helper
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{title}</p>
    <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
    {helper && <p className="text-xs text-gray-500 mt-2">{helper}</p>}
    <div className={`h-1 mt-4 rounded-full bg-gradient-to-r ${accent}`}></div>
  </div>
);

const ProgressBar: React.FC<{ value: number }> = ({ value }) => (
  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
    <div
      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all"
      style={{ width: `${Math.min(100, value)}%` }}
    />
  </div>
);

const AchievementCard: React.FC<{
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  unlocked: boolean;
}> = ({ id, title, description, icon, progress, target, unlocked }) => {
  const percent = Math.min(100, Math.round((progress / target) * 100));

  return (
    <motion.div
      layoutId={id}
      whileHover={{ y: -4, scale: 1.01 }}
      className={`rounded-2xl p-4 border shadow-sm ${
        unlocked
          ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-200 dark:border-emerald-600'
          : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 flex items-center justify-center text-xl bg-gray-100 dark:bg-gray-700 rounded-xl">
          {icon}
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
      <ProgressBar value={percent} />
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{progress}/{target}</span>
        <span>{percent}%</span>
      </div>
    </motion.div>
  );
};

const BadgePill: React.FC<{ label: string; icon: string; rarity: string; earnedAt?: number }> = ({
  label,
  icon,
  rarity,
  earnedAt
}) => (
  <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
    <span>{icon}</span>
    <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">{label}</span>
    <span className="text-xs text-gray-500 capitalize">{rarity}</span>
    {earnedAt && <span className="text-[10px] text-gray-400">{new Date(earnedAt).toLocaleDateString()}</span>}
  </div>
);

export const GamificationDashboard: React.FC = () => {
  const {
    level,
    xp,
    xpIntoLevel,
    xpForNext,
    streak,
    lastDailyClaim,
    luckyDrawCooldownEnds,
    achievements,
    badges,
    rewardHistory,
    addXP,
    claimDailyReward,
    performLuckyDraw,
    updateAchievementProgress
  } = useGamificationStore();

  const [lastReward, setLastReward] = useState<Reward | null>(null);

  const canClaimDaily = useMemo(() => {
    if (!lastDailyClaim) return true;
    return Date.now() - lastDailyClaim >= ONE_DAY_MS;
  }, [lastDailyClaim]);

  const dailyTimeLeft = useMemo(() => {
    if (!lastDailyClaim) return 0;
    return Math.max(0, lastDailyClaim + ONE_DAY_MS - Date.now());
  }, [lastDailyClaim]);

  const canSpin = useMemo(() => {
    if (!luckyDrawCooldownEnds) return true;
    return Date.now() >= luckyDrawCooldownEnds;
  }, [luckyDrawCooldownEnds]);

  const spinTimeLeft = useMemo(() => {
    if (!luckyDrawCooldownEnds) return 0;
    return Math.max(0, luckyDrawCooldownEnds - Date.now());
  }, [luckyDrawCooldownEnds]);

  const levelProgress = Math.min(100, Math.round((xpIntoLevel / xpForNext) * 100));

  const quickActions = [
    { id: 'trade', label: 'Complete a trade', xp: 120, achievementId: 'first-trade' },
    { id: 'list', label: 'List an NFT', xp: 60, achievementId: 'collector' },
    { id: 'share', label: 'Share a drop', xp: 30 }
  ];

  const handleDaily = () => {
    const reward = claimDailyReward();
    if (reward) {
      setLastReward(reward);
    }
  };

  const handleSpin = () => {
    const reward = performLuckyDraw();
    if (reward) {
      setLastReward(reward);
    }
  };

  const handleQuickAction = (actionId: string, xpAmount: number, achievementId?: string) => {
    const reward = addXP(xpAmount, actionId);
    if (achievementId) {
      updateAchievementProgress(achievementId, 1);
    }
    setLastReward(reward);
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Level" value={`Lv ${level}`} helper={`Progress ${levelProgress}%`} />
        <StatCard title="Total XP" value={`${xp.toLocaleString()} XP`} />
        <StatCard title="Daily Streak" value={`${streak} days`} helper={canClaimDaily ? 'Claim ready' : `Next in ${formatTimeLeft(dailyTimeLeft)}`} />
        <StatCard title="Achievements" value={`${unlockedCount}/${achievements.length}`} accent="from-emerald-500 to-teal-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">XP Progress</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">Level {level}</p>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{xpIntoLevel}/{xpForNext} XP to next</p>
            </div>
            <ProgressBar value={levelProgress} />
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {quickActions.map((action) => (
                <motion.button
                  key={action.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm font-semibold"
                  onClick={() => handleQuickAction(action.id, action.xp, action.achievementId)}
                >
                  {action.label} (+{action.xp} XP)
                </motion.button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Achievements</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">Track your progress</p>
              </div>
              <span className="text-sm text-gray-500">{unlockedCount} unlocked</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((ach) => (
                <AchievementCard
                  key={ach.id}
                  id={ach.id}
                  title={ach.title}
                  description={ach.description}
                  icon={ach.icon}
                  progress={ach.progress}
                  target={ach.target}
                  unlocked={ach.unlocked}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-gray-900 dark:text-white">Daily Reward</p>
              <span className="text-xs text-gray-500">Streak: {streak}</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Claim once per day to grow your streak.</p>
            <motion.button
              whileHover={{ scale: canClaimDaily ? 1.02 : 1 }}
              whileTap={{ scale: canClaimDaily ? 0.98 : 1 }}
              disabled={!canClaimDaily}
              onClick={handleDaily}
              className={`w-full py-3 rounded-xl font-semibold text-white ${
                canClaimDaily ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {canClaimDaily ? 'Claim Daily Reward' : `Available in ${formatTimeLeft(dailyTimeLeft)}`}
            </motion.button>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-gray-900 dark:text-white">Lucky Draw</p>
              <span className="text-xs text-gray-500">Cooldown</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Spin for XP, badges, and surprises.</p>
            <motion.button
              whileHover={{ scale: canSpin ? 1.02 : 1 }}
              whileTap={{ scale: canSpin ? 0.98 : 1 }}
              disabled={!canSpin}
              onClick={handleSpin}
              className={`w-full py-3 rounded-xl font-semibold text-white ${
                canSpin ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {canSpin ? 'Spin the wheel' : `Ready in ${formatTimeLeft(spinTimeLeft)}`}
            </motion.button>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-md">
            <p className="font-semibold text-gray-900 dark:text-white mb-3">Badges</p>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge) => (
                <BadgePill
                  key={badge.id}
                  label={badge.name}
                  icon={badge.icon}
                  rarity={badge.rarity}
                  earnedAt={badge.earnedAt}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold text-gray-900 dark:text-white">Recent Rewards</p>
          <span className="text-xs text-gray-500">Latest 8</span>
        </div>
        <div className="space-y-3">
          {rewardHistory.slice(-8).reverse().map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{entry.badgeId ? '🏅' : '✨'}</span>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{entry.label}</p>
                  <p className="text-xs text-gray-500">{new Date(entry.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
              {entry.amount && <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">+{entry.amount} XP</span>}
            </div>
          ))}
          {rewardHistory.length === 0 && (
            <p className="text-sm text-gray-500">No rewards yet. Start by claiming your daily reward.</p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {lastReward && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-2xl p-4 max-w-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-xl">
                {lastReward.badgeId ? '🏅' : '✨'}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Reward received</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{lastReward.label}</p>
              </div>
            </div>
            {lastReward.amount && (
              <p className="mt-2 text-sm font-semibold text-blue-600 dark:text-blue-400">+{lastReward.amount} XP</p>
            )}
            <button
              className="mt-3 text-xs text-gray-500 hover:text-gray-700"
              onClick={() => setLastReward(null)}
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export default GamificationDashboard;
