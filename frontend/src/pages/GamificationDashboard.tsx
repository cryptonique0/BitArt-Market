import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AchievementBadge from '../components/AchievementBadge';
import LevelBar from '../components/LevelBar';
import DailyRewardClaim from '../components/DailyRewardClaim';
import LuckyDrawWheel from '../components/LuckyDrawWheel';

interface UserLevel {
  userId: string;
  currentLevel: number;
  totalXP: number;
  xpInCurrentLevel: number;
  xpForNextLevel: number;
  levelTitle: string;
  levelColor: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category: string;
  xpReward: number;
  requirement: number;
}

interface UserAchievement {
  achievementId: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  currentLevel: number;
  totalXP: number;
  levelTitle: string;
}

interface XPActivity {
  userId: string;
  amount: number;
  reason: string;
  timestamp: string;
}

const GamificationDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'leaderboard'>('overview');
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [xpActivity, setXpActivity] = useState<XPActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = 'demo_user_001'; // Replace with actual user ID from auth

  useEffect(() => {
    fetchGamificationData();
  }, []);

  const fetchGamificationData = async () => {
    try {
      setLoading(true);
      
      // Fetch user level
      const levelRes = await fetch(`/api/gamification/xp/user/${userId}`);
      if (levelRes.ok) {
        const levelData = await levelRes.json();
        setUserLevel(levelData);
      }

      // Fetch all achievements
      const achievementsRes = await fetch('/api/gamification/achievements');
      if (achievementsRes.ok) {
        const achievementsData = await achievementsRes.json();
        setAchievements(achievementsData);
      }

      // Fetch user achievements
      const userAchievementsRes = await fetch(`/api/gamification/achievements/user/${userId}`);
      if (userAchievementsRes.ok) {
        const userAchievementsData = await userAchievementsRes.json();
        setUserAchievements(userAchievementsData);
      }

      // Fetch leaderboard
      const leaderboardRes = await fetch('/api/gamification/xp/leaderboard');
      if (leaderboardRes.ok) {
        const leaderboardData = await leaderboardRes.json();
        setLeaderboard(leaderboardData);
      }

      // Fetch XP history
      const xpHistoryRes = await fetch(`/api/gamification/xp/history/${userId}`);
      if (xpHistoryRes.ok) {
        const xpHistoryData = await xpHistoryRes.json();
        setXpActivity(xpHistoryData.slice(0, 10)); // Last 10 activities
      }
    } catch (error) {
      console.error('Failed to fetch gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const unlockedAchievements = userAchievements.filter(ua => ua.unlocked);
  const nextLevelXP = userLevel ? userLevel.xpForNextLevel - userLevel.xpInCurrentLevel : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🏆 Gamification Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Level up, earn achievements, and compete with others!
          </p>
        </motion.div>

        {/* Stats Cards */}
        {!loading && userLevel && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              icon="🎯"
              label="Current Level"
              value={userLevel.currentLevel}
              subtitle={userLevel.levelTitle}
              color="bg-gradient-to-br from-blue-500 to-purple-600"
            />
            <StatsCard
              icon="⭐"
              label="Total XP"
              value={userLevel.totalXP.toLocaleString()}
              subtitle="Experience Points"
              color="bg-gradient-to-br from-yellow-500 to-orange-600"
            />
            <StatsCard
              icon="🏅"
              label="Achievements"
              value={`${unlockedAchievements.length}/${achievements.length}`}
              subtitle="Unlocked"
              color="bg-gradient-to-br from-green-500 to-teal-600"
            />
            <StatsCard
              icon="🚀"
              label="Next Level In"
              value={`${nextLevelXP} XP`}
              subtitle="Keep grinding!"
              color="bg-gradient-to-br from-pink-500 to-rose-600"
            />
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-md">
          <TabButton
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            icon="📊"
            label="Overview"
          />
          <TabButton
            active={activeTab === 'achievements'}
            onClick={() => setActiveTab('achievements')}
            icon="🏆"
            label="Achievements"
          />
          <TabButton
            active={activeTab === 'leaderboard'}
            onClick={() => setActiveTab('leaderboard')}
            icon="👑"
            label="Leaderboard"
          />
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Level Progress */}
              {userLevel && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Level Progress
                  </h2>
                  <LevelBar
                    currentLevel={userLevel.currentLevel}
                    totalXP={userLevel.totalXP}
                    xpInCurrentLevel={userLevel.xpInCurrentLevel}
                    xpForNextLevel={userLevel.xpForNextLevel}
                    levelTitle={userLevel.levelTitle}
                    levelColor={userLevel.levelColor}
                  />
                </div>
              )}

              {/* Daily Rewards & Lucky Draw */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    🎁 Daily Reward
                  </h2>
                  <DailyRewardClaim userId={userId} />
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    🎰 Lucky Draw
                  </h2>
                  <LuckyDrawWheel userId={userId} />
                </div>
              </div>

              {/* Recent XP Activity */}
              {xpActivity.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Recent Activity
                  </h2>
                  <div className="space-y-2">
                    {xpActivity.map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">⭐</span>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {activity.reason}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <span className="text-green-600 dark:text-green-400 font-bold">
                          +{activity.amount} XP
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                All Achievements
              </h2>
              
              {/* Unlocked Achievements */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  🏆 Unlocked ({unlockedAchievements.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map(achievement => {
                    const userAch = userAchievements.find(ua => ua.achievementId === achievement.id);
                    if (userAch?.unlocked) {
                      return (
                        <AchievementBadge
                          key={achievement.id}
                          icon={achievement.icon}
                          title={achievement.title}
                          description={achievement.description}
                          rarity={achievement.rarity}
                          unlocked={true}
                          progress={achievement.requirement}
                          requirement={achievement.requirement}
                        />
                      );
                    }
                    return null;
                  })}
                </div>
              </div>

              {/* Locked Achievements */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  🔒 Locked ({achievements.length - unlockedAchievements.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map(achievement => {
                    const userAch = userAchievements.find(ua => ua.achievementId === achievement.id);
                    if (!userAch?.unlocked) {
                      return (
                        <AchievementBadge
                          key={achievement.id}
                          icon={achievement.icon}
                          title={achievement.title}
                          description={achievement.description}
                          rarity={achievement.rarity}
                          unlocked={false}
                          progress={userAch?.progress || 0}
                          requirement={achievement.requirement}
                        />
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                👑 Top Players
              </h2>
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <motion.div
                    key={entry.userId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      entry.userId === userId
                        ? 'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-500'
                        : 'bg-gray-50 dark:bg-gray-700'
                    } hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl font-bold w-8">
                        {entry.rank === 1 && '🥇'}
                        {entry.rank === 2 && '🥈'}
                        {entry.rank === 3 && '🥉'}
                        {entry.rank > 3 && `#${entry.rank}`}
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                        {entry.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {entry.username || entry.userId}
                          {entry.userId === userId && (
                            <span className="ml-2 text-xs bg-purple-500 text-white px-2 py-1 rounded">
                              You
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Level {entry.currentLevel} • {entry.levelTitle}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {entry.totalXP.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">XP</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Helper Components
const StatsCard = ({ icon, label, value, subtitle, color }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ scale: 1.05 }}
    className={`${color} rounded-lg p-6 text-white shadow-lg`}
  >
    <div className="text-3xl mb-2">{icon}</div>
    <div className="text-sm opacity-90 mb-1">{label}</div>
    <div className="text-2xl font-bold mb-1">{value}</div>
    <div className="text-xs opacity-75">{subtitle}</div>
  </motion.div>
);

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
      active
        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
    }`}
  >
    <span className="mr-2">{icon}</span>
    {label}
  </button>
);

export default GamificationDashboard;
