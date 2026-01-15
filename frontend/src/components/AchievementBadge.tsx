import { motion } from 'framer-motion';
import { useState } from 'react';

interface AchievementBadgeProps {
  icon: string;
  title: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  progress: number;
  requirement: number;
  onClick?: () => void;
}

const rarityColors = {
  common: {
    bg: 'from-gray-400 to-gray-600',
    glow: 'shadow-gray-500/50',
    border: 'border-gray-400',
  },
  uncommon: {
    bg: 'from-green-400 to-green-600',
    glow: 'shadow-green-500/50',
    border: 'border-green-400',
  },
  rare: {
    bg: 'from-blue-400 to-blue-600',
    glow: 'shadow-blue-500/50',
    border: 'border-blue-400',
  },
  epic: {
    bg: 'from-purple-400 to-purple-600',
    glow: 'shadow-purple-500/50',
    border: 'border-purple-400',
  },
  legendary: {
    bg: 'from-yellow-400 to-orange-600',
    glow: 'shadow-yellow-500/50',
    border: 'border-yellow-400',
  },
};

const AchievementBadge = ({
  icon,
  title,
  description,
  rarity,
  unlocked,
  progress,
  requirement,
  onClick,
}: AchievementBadgeProps) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const colors = rarityColors[rarity];
  const progressPercent = Math.min((progress / requirement) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      className={`relative p-4 rounded-lg border-2 ${
        unlocked
          ? `bg-gradient-to-br ${colors.bg} ${colors.glow} shadow-lg ${colors.border}`
          : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
      } cursor-pointer transition-all`}
    >
      {/* Achievement Icon */}
      <div className="text-5xl text-center mb-3 relative">
        {unlocked ? (
          <>
            {icon}
            {showCelebration && (
              <motion.div
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: 1.5, rotate: 360 }}
                exit={{ scale: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                ⭐
              </motion.div>
            )}
          </>
        ) : (
          <div className="filter grayscale opacity-50">{icon}</div>
        )}
      </div>

      {/* Title */}
      <h3
        className={`text-lg font-bold text-center mb-2 ${
          unlocked ? 'text-white' : 'text-gray-700 dark:text-gray-300'
        }`}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className={`text-sm text-center mb-3 ${
          unlocked ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'
        }`}
      >
        {description}
      </p>

      {/* Progress Bar (for locked achievements) */}
      {!unlocked && (
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>
              {progress}/{requirement}
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            />
          </div>
        </div>
      )}

      {/* Rarity Badge */}
      <div
        className={`text-center text-xs font-semibold uppercase ${
          unlocked ? 'text-white' : 'text-gray-500 dark:text-gray-500'
        }`}
      >
        {rarity}
      </div>

      {/* Lock Icon for Locked Achievements */}
      {!unlocked && (
        <div className="absolute top-2 right-2 text-gray-400 dark:text-gray-600">🔒</div>
      )}
    </motion.div>
  );
};

export default AchievementBadge;
