import { Router, Request, Response } from 'express';
import { xpService } from '../services/xpService';
import { achievementService } from '../services/achievementService';
import { rewardsService } from '../services/rewardsService';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Protect all routes with JWT authentication middleware
router.use(authenticateToken);

// XP Routes
router.get('/xp/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const userLevel = await xpService.getUserLevel(userId);
    const progress = await xpService.getLevelProgress(userId);
    const levelConfig = xpService.getLevelConfig(userLevel.currentLevel);

    res.json({
      level: userLevel.currentLevel,
      totalXP: userLevel.totalXP,
      xpInCurrentLevel: userLevel.xpInCurrentLevel,
      xpForNextLevel: userLevel.xpForNextLevel,
      progressPercentage: progress,
      levelTitle: levelConfig.title,
      levelColor: levelConfig.color,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user level' });
  }
});

router.get('/xp/levels', (req: Request, res: Response) => {
  try {
    const levels = xpService.getAllLevelConfigs();
    res.json(levels);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch level configs' });
  }
});

router.get('/xp/history/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    const history = await xpService.getXPHistory(userId, limit);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch XP history' });
  }
});

router.post('/xp/award', async (req: Request, res: Response) => {
  try {
    const { userId, amount, reason, relatedId } = req.body;
    const result = await xpService.awardXP(userId, amount, reason, relatedId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to award XP' });
  }
});

router.get('/xp/leaderboard', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const leaderboard = xpService.getLeaderboard(limit);
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Achievement Routes
router.get('/achievements', (req: Request, res: Response) => {
  try {
    const achievements = achievementService.getAllAchievements();
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

router.get('/achievements/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const achievements = await achievementService.getUserAchievements(userId);
    const unlocked = achievements.filter(a => a.unlockedAt);

    res.json({
      total: achievementService.getAllAchievements().length,
      unlockedCount: unlocked.length,
      unlockedAchievements: unlocked,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user achievements' });
  }
});

// Daily Rewards Routes
router.get('/rewards/daily/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const reward = await rewardsService.getDailyReward(userId);
    const canClaim = !reward.claimed;

    res.json({
      ...reward,
      canClaim,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch daily reward' });
  }
});

router.post('/rewards/daily/claim', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const result = await rewardsService.claimDailyReward(userId);
    if (result) {
      res.json({ success: true, reward: result });
    } else {
      res.status(400).json({ error: 'Reward already claimed or not available' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to claim daily reward' });
  }
});

// Lucky Draw Routes
router.get('/rewards/lucky-draw/prizes', (req: Request, res: Response) => {
  try {
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prize configs' });
  }
});

router.post('/rewards/lucky-draw/spin', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const canDraw = await rewardsService.canUserDraw(userId);
    if (!canDraw) {
      return res.status(400).json({ error: 'You can only draw once per day' });
    }

    const entry = await rewardsService.createLuckyDrawEntry(userId);
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create lucky draw entry' });
  }
});

router.post('/rewards/lucky-draw/claim', async (req: Request, res: Response) => {
  try {
    const { userId, drawId } = req.body;
    const result = await rewardsService.claimLuckyDrawPrize(userId, drawId);
    if (result) {
      res.json({ success: true, prize: result });
    } else {
      res.status(400).json({ error: 'Prize not found or already claimed' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to claim prize' });
  }
});

router.get('/rewards/lucky-draw/can-draw/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const canDraw = await rewardsService.canUserDraw(userId);
    res.json({ canDraw });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check draw eligibility' });
  }
});

// ============ SEARCH & FILTER (NEW FEATURES) ============

// Search achievements by title/description
router.get('/achievements/search', async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Query parameter (q) is required' });
    }

    const results = await achievementService.searchAchievements(q);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search achievements' });
  }
});

// Get achievements by status (locked/in-progress/unlocked)
router.get('/users/:userId/achievements/status/:status', async (req: Request, res: Response) => {
  try {
    const { userId, status } = req.params;

    if (!['locked', 'in-progress', 'unlocked'].includes(status)) {
      return res
        .status(400)
        .json({ error: 'Invalid status. Must be: locked, in-progress, or unlocked' });
    }

    const achievements = await achievementService.getAchievementsByStatus(
      userId,
      status as 'locked' | 'in-progress' | 'unlocked'
    );
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch achievements by status' });
  }
});

// ============ SEASONAL ACHIEVEMENTS (NEW FEATURE) ============

// Get active seasons
router.get('/seasons/active', async (req: Request, res: Response) => {
  try {
    const seasons = await achievementService.getActiveSeasons();
    res.json(seasons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active seasons' });
  }
});

// Get all seasons
router.get('/seasons', async (req: Request, res: Response) => {
  try {
    const seasons = await achievementService.getAllSeasons();
    res.json(seasons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch seasons' });
  }
});

// Get season by ID
router.get('/seasons/:seasonId', async (req: Request, res: Response) => {
  try {
    const { seasonId } = req.params;
    const season = await achievementService.getSeason(seasonId);
    if (!season) {
      return res.status(404).json({ error: 'Season not found' });
    }
    res.json(season);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch season' });
  }
});

// Get seasonal achievements
router.get('/seasons/:seasonId/achievements', async (req: Request, res: Response) => {
  try {
    const { seasonId } = req.params;
    const achievements = await achievementService.getSeasonalAchievements(seasonId);
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch seasonal achievements' });
  }
});

// Get seasonal leaderboard
router.get('/seasons/:seasonId/leaderboard', async (req: Request, res: Response) => {
  try {
    const { seasonId } = req.params;
    const { limit = '20' } = req.query;
    const numLimit = Math.min(parseInt(limit as string) || 20, 100);
    const leaderboard = await achievementService.getSeasonalLeaderboard(seasonId, numLimit);
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch seasonal leaderboard' });
  }
});

// Get user seasonal progress
router.get('/users/:userId/seasons/:seasonId/progress', async (req: Request, res: Response) => {
  try {
    const { userId, seasonId } = req.params;
    const progress = await achievementService.getUserSeasonalProgress(userId, seasonId);
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch seasonal progress' });
  }
});

// Get user seasonal achievements
router.get('/users/:userId/seasons/:seasonId/achievements', async (req: Request, res: Response) => {
  try {
    const { userId, seasonId } = req.params;
    const achievements = await achievementService.getUserSeasonalAchievements(userId, seasonId);
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user seasonal achievements' });
  }
});

// Get seasonal rewards
router.get('/users/:userId/seasons/:seasonId/rewards', async (req: Request, res: Response) => {
  try {
    const { userId, seasonId } = req.params;
    const rewards = await achievementService.getSeasonalRewards(userId, seasonId);
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch seasonal rewards' });
  }
});

// Get season timeline
router.get('/seasons/timeline', async (req: Request, res: Response) => {
  try {
    const timeline = await achievementService.getSeasonTimeline();
    res.json(timeline);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch season timeline' });
  }
});

export default router;
