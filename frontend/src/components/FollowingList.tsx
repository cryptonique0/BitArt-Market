import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users2, Star } from 'lucide-react';

interface FollowingProfile {
  userId: string;
  username: string;
  avatar?: string;
  isCreator: boolean;
  creatorStats?: {
    followers: number;
    nftsCreated: number;
    floorPrice?: number;
  };
  followedAt: Date;
}

interface FollowingListProps {
  userId: string;
  limit?: number;
}

const FollowingList: React.FC<FollowingListProps> = ({ userId, limit = 20 }) => {
  const [following, setFollowing] = useState<FollowingProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const response = await fetch(`/api/follows/following/${userId}?limit=${limit}`);
        if (response.ok) {
          const data = await response.json();
          setFollowing(data.following);
        }
      } catch (error) {
        console.error('Error fetching following:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowing();
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
        <Users2 size={20} className="text-blue-500" />
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Following ({following.length})
        </h3>
      </div>

      {following.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          You are not following anyone yet
        </p>
      ) : (
        following.map(profile => (
          <motion.div
            key={profile.userId}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold">
              {profile.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900 dark:text-white">{profile.username}</p>
                {profile.isCreator && (
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                )}
              </div>
              {profile.creatorStats && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {profile.creatorStats.nftsCreated} NFTs • {profile.creatorStats.followers}{' '}
                  followers
                </p>
              )}
            </div>
            <button
              onClick={() => {
                // Unfollow handler would go here
                setFollowing(following.filter(f => f.userId !== profile.userId));
              }}
              className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            >
              Unfollow
            </button>
          </motion.div>
        ))
      )}
    </div>
  );
};

export default FollowingList;
