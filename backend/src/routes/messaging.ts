/**
 * Messaging Routes
 * REST API endpoints for user messaging and conversations
 */

import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { messagingService } from '../services/messaging.service';
import {
  CreateMessageInput,
  UpdateMessageInput,
  BlockUserInput,
  UnblockUserInput,
  MessageSearchFilter,
} from '../types/messaging';

const router = Router();

/**
 * POST /messages
 * Send a new message
 */
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userAddress = (req as any).userAddress;
    const input: CreateMessageInput = req.body;

    // Validation
    if (!input.recipientAddress || !input.content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (input.content.trim().length === 0 || input.content.length > 5000) {
      return res.status(400).json({ error: 'Message must be 1-5000 characters' });
    }

    const message = await messagingService.sendMessage(userAddress, input);
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res
      .status(500)
      .json({ error: error instanceof Error ? error.message : 'Failed to send message' });
  }
});

/**
 * GET /messages/conversations
 * Get all conversations for current user
 */
router.get('/conversations', authenticate, async (req: Request, res: Response) => {
  try {
    const userAddress = (req as any).userAddress;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;

    const result = await messagingService.getConversations(userAddress, page, pageSize);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

/**
 * GET /messages/conversations/:conversationId
 * Get conversation details
 */
router.get('/conversations/:conversationId', authenticate, async (req: Request, res: Response) => {
  try {
    const userAddress = (req as any).userAddress;
    const { conversationId } = req.params;

    const conversation = await messagingService.getConversationDetail(conversationId, userAddress);
    res.status(200).json(conversation);
  } catch (error) {
    console.error('Error fetching conversation detail:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

/**
 * GET /messages/conversations/:conversationId/thread
 * Get message thread for a conversation
 */
router.get(
  '/conversations/:conversationId/thread',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const userAddress = (req as any).userAddress;
      const { conversationId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 50;

      const result = await messagingService.getMessageThread(
        conversationId,
        userAddress,
        page,
        pageSize
      );
      res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching message thread:', error);
      res.status(500).json({ error: 'Failed to fetch message thread' });
    }
  }
);

/**
 * PATCH /messages/:messageId
 * Update a message
 */
router.patch('/:messageId', authenticate, async (req: Request, res: Response) => {
  try {
    const userAddress = (req as any).userAddress;
    const { messageId } = req.params;
    const input: UpdateMessageInput = { messageId, ...req.body };

    // Validation
    if (!input.content || input.content.trim().length === 0 || input.content.length > 5000) {
      return res.status(400).json({ error: 'Message must be 1-5000 characters' });
    }

    const message = await messagingService.updateMessage(userAddress, input);
    res.status(200).json(message);
  } catch (error) {
    console.error('Error updating message:', error);
    res
      .status(500)
      .json({ error: error instanceof Error ? error.message : 'Failed to update message' });
  }
});

/**
 * DELETE /messages/:messageId
 * Delete a message
 */
router.delete('/:messageId', authenticate, async (req: Request, res: Response) => {
  try {
    const userAddress = (req as any).userAddress;
    const { messageId } = req.params;

    await messagingService.deleteMessage(userAddress, messageId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting message:', error);
    res
      .status(500)
      .json({ error: error instanceof Error ? error.message : 'Failed to delete message' });
  }
});

/**
 * POST /messages/block
 * Block a user
 */
router.post('/block', authenticate, async (req: Request, res: Response) => {
  try {
    const userAddress = (req as any).userAddress;
    const input: BlockUserInput = req.body;

    if (!input.userAddressToBlock) {
      return res.status(400).json({ error: 'Missing userAddressToBlock' });
    }

    await messagingService.blockUser(userAddress, input);
    res.status(200).json({ message: 'User blocked successfully' });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ error: 'Failed to block user' });
  }
});

/**
 * POST /messages/unblock
 * Unblock a user
 */
router.post('/unblock', authenticate, async (req: Request, res: Response) => {
  try {
    const userAddress = (req as any).userAddress;
    const input: UnblockUserInput = req.body;

    if (!input.userAddressToUnblock) {
      return res.status(400).json({ error: 'Missing userAddressToUnblock' });
    }

    await messagingService.unblockUser(userAddress, input);
    res.status(200).json({ message: 'User unblocked successfully' });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ error: 'Failed to unblock user' });
  }
});

/**
 * GET /messages/search
 * Search messages
 */
router.get('/search', authenticate, async (req: Request, res: Response) => {
  try {
    const userAddress = (req as any).userAddress;
    const filter: MessageSearchFilter = {
      conversationId: req.query.conversationId as string,
      searchText: req.query.q as string,
      status: req.query.status as any,
      limit: parseInt(req.query.limit as string) || 50,
      offset: parseInt(req.query.offset as string) || 0,
    };

    const messages = await messagingService.searchMessages(userAddress, filter);
    res.status(200).json({ messages, total: messages.length });
  } catch (error) {
    console.error('Error searching messages:', error);
    res.status(500).json({ error: 'Failed to search messages' });
  }
});

/**
 * GET /messages/:conversationId/transactions
 * Get transaction history for a conversation
 */
router.get('/:conversationId/transactions', authenticate, async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    const transactions = await messagingService.getConversationTransactionHistory(conversationId);
    res.status(200).json({ transactions, total: transactions.length });
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
});

export default router;
