import { Router, Request, Response } from 'express';
import { CommentsService } from '../services/comments.service';
import { requireAppJWT } from '../middleware/auth';
import { EmojiReaction } from '../types/comments';

const router = Router();
const commentsService = new CommentsService();

/**
 * POST /api/comments
 * Create a new comment on an NFT
 */
router.post('/', requireAppJWT, async (req: Request, res: Response) => {
  try {
    const { nftId, content, parentCommentId } = req.body;
    const userId = (req as any).user?.id;
    const username = (req as any).user?.username;
    const avatar = (req as any).user?.avatar;

    if (!userId || !nftId || !content) {
      return res.status(400).json({ error: 'NFT ID and content are required' });
    }

    if (content.length > 5000) {
      return res.status(400).json({ error: 'Comment too long (max 5000 characters)' });
    }

    const comment = await commentsService.createComment(
      { nftId, content, parentCommentId },
      userId,
      username,
      avatar
    );

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(400).json({ error: 'Failed to create comment' });
  }
});

/**
 * GET /api/comments/:nftId
 * Get comments for an NFT (threaded)
 */
router.get('/:nftId', async (req: Request, res: Response) => {
  try {
    const { nftId } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    const userId = (req as any).user?.id;

    const response = await commentsService.getComments(nftId, userId, limit, offset);
    res.json(response);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

/**
 * PUT /api/comments/:commentId
 * Update a comment
 */
router.put('/:commentId', requireAppJWT, async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = (req as any).user?.id;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const comment = await commentsService.updateComment(commentId, { content });
    res.json(comment);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(400).json({ error: 'Failed to update comment' });
  }
});

/**
 * DELETE /api/comments/:commentId
 * Delete a comment
 */
router.delete('/:commentId', requireAppJWT, async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const hardDelete = req.query.hardDelete === 'true';

    const success = await commentsService.deleteComment(commentId, hardDelete);
    res.json({ success });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(400).json({ error: 'Failed to delete comment' });
  }
});

/**
 * POST /api/comments/:commentId/flag
 * Flag a comment for moderation
 */
router.post('/:commentId/flag', requireAppJWT, async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { reason, description } = req.body;
    const userId = (req as any).user?.id;

    if (!reason) {
      return res.status(400).json({ error: 'Flag reason is required' });
    }

    const flagged = await commentsService.flagComment(commentId, userId, reason, description);
    res.status(201).json(flagged);
  } catch (error) {
    console.error('Error flagging comment:', error);
    res.status(400).json({ error: 'Failed to flag comment' });
  }
});

/**
 * GET /api/comments/:nftId/stats
 * Get comment statistics for an NFT
 */
router.get('/:nftId/stats', async (req: Request, res: Response) => {
  try {
    const { nftId } = req.params;
    const stats = await commentsService.getCommentStats(nftId);
    res.json(stats);
  } catch (error) {
    console.error('Error getting comment stats:', error);
    res.status(500).json({ error: 'Failed to get comment stats' });
  }
});

// ============ REACTIONS ============

/**
 * POST /api/comments/reactions
 * Add a reaction to an NFT
 */
router.post('/reactions/add', requireAppJWT, async (req: Request, res: Response) => {
  try {
    const { nftId, emoji } = req.body;
    const userId = (req as any).user?.id;
    const username = (req as any).user?.username;
    const avatar = (req as any).user?.avatar;

    if (!nftId || !emoji) {
      return res.status(400).json({ error: 'NFT ID and emoji are required' });
    }

    if (!Object.values(EmojiReaction).includes(emoji)) {
      return res.status(400).json({ error: 'Invalid emoji' });
    }

    const reaction = await commentsService.addReaction(nftId, userId, username, emoji, avatar);
    res.status(201).json(reaction);
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(400).json({ error: 'Failed to add reaction' });
  }
});

/**
 * DELETE /api/comments/reactions/:nftId/:emoji
 * Remove a reaction from an NFT
 */
router.delete(
  '/reactions/remove/:nftId/:emoji',
  requireAppJWT,
  async (req: Request, res: Response) => {
    try {
      const { nftId, emoji } = req.params;
      const userId = (req as any).user?.id;

      if (!Object.values(EmojiReaction).includes(emoji as EmojiReaction)) {
        return res.status(400).json({ error: 'Invalid emoji' });
      }

      const success = await commentsService.removeReaction(nftId, userId, emoji as EmojiReaction);
      res.json({ success });
    } catch (error) {
      console.error('Error removing reaction:', error);
      res.status(400).json({ error: 'Failed to remove reaction' });
    }
  }
);

/**
 * GET /api/comments/:nftId/reactions
 * Get reaction summary for an NFT
 */
router.get('/:nftId/reactions', async (req: Request, res: Response) => {
  try {
    const { nftId } = req.params;
    const userId = (req as any).user?.id;

    const summary = await commentsService.getReactionSummary(nftId, userId);
    res.json(summary);
  } catch (error) {
    console.error('Error getting reactions:', error);
    res.status(500).json({ error: 'Failed to get reactions' });
  }
});

export default router;
