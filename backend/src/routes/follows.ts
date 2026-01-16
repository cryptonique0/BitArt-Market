import { Router, Request, Response } from 'express';
import { FollowingService } from '../services/following.service';
import { requireAppJWT } from '../middleware/auth';

const router = Router();
const followingService = FollowingService;

/**
 * POST /api/follows
 * Follow a user
 */
router.post('/', requireAppJWT, async (req: Request, res: Response) => {
  try {
    const { followingId } = req.body;
    const followerId = (req as any).user?.id;

    if (!followerId || !followingId) {
      return res.status(400).json({ error: 'User IDs are required' });
    }

    if (followerId === followingId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const result = await followingService.followUser(followerId, followingId);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error following user:', error);
    res.status(400).json({ error: 'Failed to follow user' });
  }
});

/**
 * DELETE /api/follows/:followingId
 * Unfollow a user
 */
router.delete('/:followingId', requireAppJWT, async (req: Request, res: Response) => {
  try {
    const { followingId } = req.params;
    const followerId = (req as any).user?.id;

    if (!followerId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = await followingService.unfollowUser(followerId, followingId);
    res.json({ success: result });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(400).json({ error: 'Failed to unfollow user' });
  }
});

/**
 * GET /api/follows/status/:followingId
 * Check if current user is following a user
 */
router.get('/status/:followingId', requireAppJWT, async (req: Request, res: Response) => {
  try {
    const { followingId } = req.params;
    const followerId = (req as any).user?.id;

    if (!followerId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const isFollowing = await followingService.isFollowing(followerId, followingId);
    res.json({ isFollowing });
  } catch (error) {
    console.error('Error checking follow status:', error);
    res.status(500).json({ error: 'Failed to check follow status' });
  }
});

/**
 * GET /api/follows/followers/:userId
 * Get followers of a user
 */
router.get('/followers/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const followers = await followingService.getFollowers(userId, limit, offset);
    res.json({ followers, count: followers.length });
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ error: 'Failed to get followers' });
  }
});

/**
 * GET /api/follows/following/:userId
 * Get users that a user is following
 */
router.get('/following/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const following = await followingService.getFollowing(userId, limit, offset);
    res.json({ following, count: following.length });
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ error: 'Failed to get following' });
  }
});

/**
 * GET /api/follows/stats/:userId
 * Get follow statistics for a user
 */
router.get('/stats/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const stats = await followingService.getFollowStats(userId);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching follow stats:', error);
    res.status(500).json({ error: 'Failed to get follow stats' });
  }
});

/**
 * GET /api/follows/popular
 * Get popular creators by follower count and XP
 */
router.get('/popular', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const creators = await followingService.getPopularCreators(limit);
    res.json({ creators, count: creators.length });
  } catch (error) {
    console.error('Error fetching popular creators:', error);
    res.status(500).json({ error: 'Failed to get popular creators' });
  }
});

/**
 * GET /api/follows/recommendations/:userId
 * Get follow recommendations for a user
 */
router.get('/recommendations/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

    const recommendations = await followingService.getFollowRecommendations(userId, limit);
    res.json({ recommendations, count: recommendations.length });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Failed to get follow recommendations' });
  }
});

/**
 * GET /api/follows/notifications/:userId
 * Get follow-related notifications for a user
 */
router.get('/notifications/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const notifications = await followingService.getFollowNotifications(userId, limit);
    res.json({ notifications, count: notifications.length });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

/**
 * PUT /api/follows/notifications/:notificationId/read
 * Mark a notification as read
 */
router.put('/notifications/:notificationId/read', async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;

    const success = await followingService.markNotificationAsRead(notificationId);
    res.json({ success });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

/**
 * POST /api/follows/notify-followers
 * Notify all followers about a new NFT drop
 */
router.post('/notify-followers', requireAppJWT, async (req: Request, res: Response) => {
  try {
    const { nftId, nftTitle } = req.body;
    const creatorId = (req as any).user?.id;

    if (!creatorId || !nftId || !nftTitle) {
      return res.status(400).json({ error: 'NFT details are required' });
    }

    await followingService.notifyFollowersAboutDrop(creatorId, nftId, nftTitle);
    res.json({ success: true });
  } catch (error) {
    console.error('Error notifying followers:', error);
    res.status(400).json({ error: 'Failed to notify followers' });
  }
});

export default router;
