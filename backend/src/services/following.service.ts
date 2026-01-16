import { supabase, isSupabaseAvailable } from '../config/supabase';
import { logger } from '../utils/logger';
import {
  UserFollow,
  UserFollowStats,
  FollowerProfile,
  FollowingProfile,
  FollowNotification,
  PopularCreators,
  FollowRecommendation,
} from '../types/following';

class FollowingServiceClass {
  /**
   * Follow a user
   */
  async followUser(followerId: string, followingId: string): Promise<UserFollow | null> {
    try {
      if (!isSupabaseAvailable()) {
        logger.warn('Supabase not configured for following');
        return null;
      }

      // Check if already following
      const { data: existing } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .single();

      if (existing) {
        return null; // Already following
      }

      // Create follow relationship
      const { data, error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: followerId,
          following_id: followingId,
          followed_at: new Date(),
          notifications_enabled: true,
        })
        .select()
        .single();

      if (error) {
        logger.error('Error following user:', error);
        return null;
      }

      // Send notification to the followed user
      await this.sendFollowNotification(followerId, followingId);

      return data as UserFollow;
    } catch (error) {
      if (!isSupabaseAvailable()) return null;
      logger.error('Error in followUser:', error);
      return null;
    }
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    try {
      if (!isSupabaseAvailable()) return false;

      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);

      if (error) {
        logger.error('Error unfollowing user:', error);
        return false;
      }

      return true;
    } catch (error) {
      if (!isSupabaseAvailable()) return false;
      logger.error('Error in unfollowUser:', error);
      return false;
    }
  }

  /**
   * Get followers of a user
   */
  async getFollowers(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<FollowerProfile[]> {
    try {
      if (!isSupabaseAvailable()) return [];

      const { data, error } = await supabase
        .from('user_follows')
        .select(
          `
          follower_id,
          followers:follower_id(user_id, username, avatar, bio, current_level, total_achievements),
          followed_at
          `
        )
        .eq('following_id', userId)
        .range(offset, offset + limit - 1);

      if (error) {
        logger.error('Error fetching followers:', error);
        return [];
      }

      return (data || []).map((follow: Record<string, unknown>) => ({
        userId: String(follow.follower_id),
        username: String(
          follow.followers && typeof follow.followers === 'object' && 'username' in follow.followers
            ? (follow.followers as Record<string, unknown>).username
            : 'Unknown'
        ),
        avatar:
          follow.followers && typeof follow.followers === 'object' && 'avatar' in follow.followers
            ? String((follow.followers as Record<string, unknown>).avatar)
            : undefined,
        bio:
          follow.followers && typeof follow.followers === 'object' && 'bio' in follow.followers
            ? String((follow.followers as Record<string, unknown>).bio)
            : undefined,
        totalAchievements:
          follow.followers &&
          typeof follow.followers === 'object' &&
          'total_achievements' in follow.followers
            ? Number((follow.followers as Record<string, unknown>).total_achievements)
            : 0,
        currentLevel:
          follow.followers &&
          typeof follow.followers === 'object' &&
          'current_level' in follow.followers
            ? Number((follow.followers as Record<string, unknown>).current_level)
            : 1,
        followedAt: new Date(String(follow.followed_at)),
        isCreator: false,
      }));
    } catch (error) {
      if (!isSupabaseAvailable()) return [];
      logger.error('Error in getFollowers:', error);
      return [];
    }
  }

  /**
   * Get users that a user is following
   */
  async getFollowing(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<FollowingProfile[]> {
    try {
      if (!isSupabaseAvailable()) return [];

      const { data, error } = await supabase
        .from('user_follows')
        .select(
          `
          following_id,
          following_user:following_id(user_id, username, avatar, bio, current_level, total_achievements, nft_count),
          followed_at
          `
        )
        .eq('follower_id', userId)
        .range(offset, offset + limit - 1);

      if (error) {
        logger.error('Error fetching following:', error);
        return [];
      }

      return (data || []).map((follow: Record<string, unknown>) => ({
        userId: String(follow.following_id),
        username: String(
          follow.following_user &&
            typeof follow.following_user === 'object' &&
            'username' in follow.following_user
            ? (follow.following_user as Record<string, unknown>).username
            : 'Unknown'
        ),
        avatar:
          follow.following_user &&
          typeof follow.following_user === 'object' &&
          'avatar' in follow.following_user
            ? String((follow.following_user as Record<string, unknown>).avatar)
            : undefined,
        bio:
          follow.following_user &&
          typeof follow.following_user === 'object' &&
          'bio' in follow.following_user
            ? String((follow.following_user as Record<string, unknown>).bio)
            : undefined,
        totalAchievements:
          follow.following_user &&
          typeof follow.following_user === 'object' &&
          'total_achievements' in follow.following_user
            ? Number((follow.following_user as Record<string, unknown>).total_achievements)
            : 0,
        currentLevel:
          follow.following_user &&
          typeof follow.following_user === 'object' &&
          'current_level' in follow.following_user
            ? Number((follow.following_user as Record<string, unknown>).current_level)
            : 1,
        followedAt: new Date(String(follow.followed_at)),
        isCreator: true,
        nftCount:
          follow.following_user &&
          typeof follow.following_user === 'object' &&
          'nft_count' in follow.following_user
            ? Number((follow.following_user as Record<string, unknown>).nft_count)
            : 0,
      }));
    } catch (error) {
      if (!isSupabaseAvailable()) return [];
      logger.error('Error in getFollowing:', error);
      return [];
    }
  }

  /**
   * Check if user is following another user
   */
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
      if (!isSupabaseAvailable()) return false;

      const { data } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .single();

      return !!data;
    } catch (error) {
      if (!isSupabaseAvailable()) return false;
      return false;
    }
  }

  /**
   * Get follow statistics for a user
   */
  async getFollowStats(userId: string): Promise<UserFollowStats | null> {
    try {
      if (!isSupabaseAvailable()) return null;

      // Get follower count
      const { count: followersCount } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

      // Get following count
      const { count: followingCount } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);

      // Get user info
      const { data: user } = await supabase
        .from('users')
        .select('username, avatar')
        .eq('user_id', userId)
        .single();

      return {
        userId,
        username: user?.username || 'Unknown',
        avatar: user?.avatar,
        followersCount: followersCount || 0,
        followingCount: followingCount || 0,
      };
    } catch (error) {
      if (!isSupabaseAvailable()) return null;
      logger.error('Error in getFollowStats:', error);
      return null;
    }
  }

  /**
   * Get popular creators
   */
  async getPopularCreators(limit: number = 10): Promise<PopularCreators> {
    try {
      if (!isSupabaseAvailable()) return { creators: [] };

      const { data, error } = await supabase
        .from('users')
        .select(
          `
          user_id,
          username,
          avatar,
          current_level,
          total_xp,
          nft_count,
          followers:user_follows!following_id(id)
          `
        )
        .order('total_xp', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Error fetching popular creators:', error);
        return { creators: [] };
      }

      const creators = (data || []).map((user: Record<string, unknown>, index: number) => ({
        userId: String(user.user_id),
        username: String(user.username),
        avatar: user.avatar ? String(user.avatar) : undefined,
        followersCount: Array.isArray(user.followers) ? user.followers.length : 0,
        totalXP: user.total_xp ? Number(user.total_xp) : 0,
        currentLevel: user.current_level ? Number(user.current_level) : 1,
        nftCount: user.nft_count ? Number(user.nft_count) : 0,
        rank: index + 1,
      }));

      return { creators };
    } catch (error) {
      if (!isSupabaseAvailable()) return { creators: [] };
      logger.error('Error in getPopularCreators:', error);
      return { creators: [] };
    }
  }

  /**
   * Send follow notification
   */
  private async sendFollowNotification(followerId: string, followingId: string): Promise<void> {
    try {
      if (!isSupabaseAvailable()) return;

      const { data: follower } = await supabase
        .from('users')
        .select('username')
        .eq('user_id', followerId)
        .single();

      await supabase.from('follow_notifications').insert({
        follower_id: followerId,
        following_id: followingId,
        type: 'user_follow',
        title: `${follower?.username} started following you`,
        message: `${follower?.username} is now following your NFTs and updates`,
        read: false,
        created_at: new Date(),
      });
    } catch (error) {
      if (!isSupabaseAvailable()) return;
      logger.error('Error sending follow notification:', error);
    }
  }

  /**
   * Notify followers about new drop
   */
  async notifyFollowersAboutDrop(
    creatorId: string,
    nftId: string,
    nftTitle: string
  ): Promise<void> {
    try {
      if (!isSupabaseAvailable()) return;

      // Get all followers
      const followers = await this.getFollowers(creatorId, 1000);

      // Create notifications for all followers
      const notifications = followers.map(follower => ({
        follower_id: follower.userId,
        following_id: creatorId,
        type: 'new_drop',
        title: `New NFT: ${nftTitle}`,
        message: `${nftTitle} was just listed by a creator you follow`,
        related_id: nftId,
        read: false,
        created_at: new Date(),
      }));

      if (notifications.length > 0) {
        await supabase.from('follow_notifications').insert(notifications);
      }
    } catch (error) {
      if (!isSupabaseAvailable()) return;
      logger.error('Error notifying followers about drop:', error);
    }
  }

  /**
   * Get follow notifications for user
   */
  async getFollowNotifications(userId: string, limit: number = 20): Promise<FollowNotification[]> {
    try {
      if (!isSupabaseAvailable()) return [];

      const { data, error } = await supabase
        .from('follow_notifications')
        .select('*')
        .eq('following_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Error fetching notifications:', error);
        return [];
      }

      return (data || []) as FollowNotification[];
    } catch (error) {
      if (!isSupabaseAvailable()) return [];
      logger.error('Error in getFollowNotifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      if (!isSupabaseAvailable()) return false;

      const { error } = await supabase
        .from('follow_notifications')
        .update({ read: true })
        .eq('id', notificationId);

      return !error;
    } catch (error) {
      if (!isSupabaseAvailable()) return false;
      return false;
    }
  }

  /**
   * Get recommendation suggestions
   */
  async getFollowRecommendations(
    userId: string,
    limit: number = 5
  ): Promise<FollowRecommendation[]> {
    try {
      if (!isSupabaseAvailable()) return [];

      // Get users with similar interests (by achievements, XP level)
      const { data: userAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId);

      if (!userAchievements || userAchievements.length === 0) {
        return [];
      }

      const achievementIds = userAchievements.map(a => a.achievement_id);

      // Find other users with similar achievements
      const { data: similarUsers } = await supabase
        .from('user_achievements')
        .select('user_id')
        .in('achievement_id', achievementIds)
        .neq('user_id', userId)
        .limit(limit);

      if (!similarUsers) return [];

      const recommendations: FollowRecommendation[] = [];
      for (const similar of similarUsers) {
        const stats = await this.getFollowStats(similar.user_id);
        if (stats) {
          recommendations.push({
            userId: stats.userId,
            username: stats.username,
            avatar: stats.avatar,
            followersCount: stats.followersCount,
            reason: 'similar_interests',
            matchScore: 75,
          });
        }
      }

      return recommendations.slice(0, limit);
    } catch (error) {
      if (!isSupabaseAvailable()) return [];
      logger.error('Error in getFollowRecommendations:', error);
      return [];
    }
  }
}

export const FollowingService = new FollowingServiceClass();
