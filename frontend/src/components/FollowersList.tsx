import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Heart } from 'lucide-react';

interface FollowerProfile {
  userId: string;
  username: string;
  avatar?: string;
  totalAchievements: number;
  currentLevel: number;
  followedAt: Date;
  isCreator: boolean;
}

interface FollowersListProps {
  userId: string;
  limit?: number;
}

const FollowersList: React.FC<FollowersListProps> = ({ userId, limit = 20 }) => {
  const [followers, setFollowers] = useState<FollowerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const response = await fetch(`/api/follows/followers/${userId}?limit=${limit}`);
        if (response.ok) {
          const data = await response.json();
          setFollowers(data.followers);
        }
      } catch (error) {
        console.error('Error fetching followers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, [userId, limit]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin">⏳</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Users size={20} className="text-purple-500" />
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Followers ({followers.length})
        </h3>
      </div>

      {followers.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">No followers yet</p>
      ) : (
        followers.map(follower => (
          <motion.div
            key={follower.userId}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
              {follower.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">{follower.username}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Level {follower.currentLevel} • {follower.totalAchievements} achievements
              </p>
            </div>
            <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
              Following
            </span>
          </motion.div>
        ))
      )}
    </div>
  );
};

export default FollowersList;
