import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SmilePlus, X } from 'lucide-react';
import { EmojiReaction } from '../types/comments';

interface ReactionBarProps {
  nftId: string;
  onReactionAdd: (emoji: EmojiReaction) => Promise<void>;
  onReactionRemove: (emoji: EmojiReaction) => Promise<void>;
  reactions: {
    [key in EmojiReaction]?: {
      count: number;
      userIds: string[];
    };
  };
  userReactions: EmojiReaction[];
  totalReactions: number;
}

const EMOJI_REACTIONS: EmojiReaction[] = [
  '👍',
  '❤️',
  '🔥',
  '🤯',
  '😂',
  '😢',
  '😠',
  '🤔',
  '🌙',
  '💎',
  '🚀',
  '👏',
] as EmojiReaction[];

const ReactionBar: React.FC<ReactionBarProps> = ({
  nftId,
  onReactionAdd,
  onReactionRemove,
  reactions,
  userReactions,
  totalReactions,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReactionClick = useCallback(
    async (emoji: EmojiReaction) => {
      setLoading(true);
      try {
        if (userReactions.includes(emoji)) {
          await onReactionRemove(emoji);
        } else {
          await onReactionAdd(emoji);
        }
      } finally {
        setLoading(false);
      }
    },
    [userReactions, onReactionAdd, onReactionRemove]
  );

  return (
    <div className="flex items-center gap-2 py-3 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="flex items-center gap-1 flex-wrap">
        {/* Display existing reactions */}
        <AnimatePresence>
          {EMOJI_REACTIONS.map(emoji => {
            const count = reactions[emoji]?.count || 0;
            const isUserReaction = userReactions.includes(emoji);

            if (count === 0) return null;

            return (
              <motion.button
                key={emoji}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                onClick={() => handleReactionClick(emoji)}
                disabled={loading}
                className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all ${
                  isUserReaction
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                }`}
                title={`${count} ${isUserReaction ? '(you)' : ''}`}
              >
                <span className="text-lg">{emoji}</span>
                <span className="text-sm font-medium">{count}</span>
              </motion.button>
            );
          })}
        </AnimatePresence>

        {/* Add reaction button */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowPicker(!showPicker)}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            title="Add reaction"
          >
            <SmilePlus size={18} />
            <span className="text-xs">Add</span>
          </motion.button>

          {/* Emoji Picker Dropdown */}
          <AnimatePresence>
            {showPicker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 z-50"
              >
                <div className="grid grid-cols-6 gap-2">
                  {EMOJI_REACTIONS.map(emoji => (
                    <motion.button
                      key={emoji}
                      whileHover={{ scale: 1.2 }}
                      onClick={() => {
                        handleReactionClick(emoji);
                        setShowPicker(false);
                      }}
                      disabled={loading}
                      className="text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded transition-colors"
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Total reactions count */}
      {totalReactions > 0 && (
        <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
          {totalReactions} reaction{totalReactions !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default ReactionBar;
