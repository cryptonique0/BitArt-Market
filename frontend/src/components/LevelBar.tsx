import { motion } from 'framer-motion';

interface LevelBarProps {
  currentLevel: number;
  totalXP: number;
  xpInCurrentLevel: number;
  xpForNextLevel: number;
  levelTitle: string;
  levelColor: string;
}

const LevelBar = ({
  currentLevel,
  totalXP,
  xpInCurrentLevel,
  xpForNextLevel,
  levelTitle,
  levelColor,
}: LevelBarProps) => {
  const progressPercent = (xpInCurrentLevel / xpForNextLevel) * 100;

  return (
    <div className="space-y-4">
      {/* Level Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div
            className="px-6 py-3 rounded-lg font-bold text-2xl text-white shadow-lg"
            style={{ backgroundColor: levelColor }}
          >
            Lv. {currentLevel}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{levelTitle}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total XP: {totalXP.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>
            {xpInCurrentLevel.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
          </span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden"
          >
            <motion.div
              animate={{
                x: ['0%', '100%'],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
            />
          </motion.div>
        </div>
      </div>

      {/* Next Level Info */}
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        {xpForNextLevel - xpInCurrentLevel} XP needed for Level {currentLevel + 1}
      </div>
    </div>
  );
};

export default LevelBar;
