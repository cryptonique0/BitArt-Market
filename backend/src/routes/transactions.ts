/**
 * Transaction API Routes
 * Endpoints for transaction history and management
 */

import { Router, Request, Response } from 'express';
import { TransactionService } from '../services/transaction.service';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/transactions
 * Get recent transactions
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { limit = '50', offset = '0' } = req.query;

    const transactions = await TransactionService.getRecentSales(Number(limit));
    res.json(transactions);
  } catch (error) {
    logger.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

/**
 * GET /api/transactions/:transactionId
 * Get transaction details
 */
router.get('/:transactionId', async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;

    const transaction = await TransactionService.getTransactionDetails(transactionId);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    logger.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

/**
 * GET /api/transactions/user/:userId
 * Get user's transaction history
 */
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = '50', offset = '0' } = req.query;

    const transactions = await TransactionService.getUserTransactionHistory(
      userId,
      Number(limit),
      Number(offset)
    );

    res.json(transactions);
  } catch (error) {
    logger.error('Error fetching user transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

/**
 * GET /api/transactions/user/:userId/sales
 * Get user's sales
 */
router.get('/user/:userId/sales', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = '50', offset = '0' } = req.query;

    const sales = await TransactionService.getUserSales(
      userId,
      Number(limit),
      Number(offset)
    );

    res.json(sales);
  } catch (error) {
    logger.error('Error fetching user sales:', error);
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

/**
 * GET /api/transactions/user/:userId/purchases
 * Get user's purchases
 */
router.get('/user/:userId/purchases', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = '50', offset = '0' } = req.query;

    const purchases = await TransactionService.getUserPurchases(
      userId,
      Number(limit),
      Number(offset)
    );

    res.json(purchases);
  } catch (error) {
    logger.error('Error fetching user purchases:', error);
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
});

/**
 * GET /api/transactions/nft/:nftId
 * Get NFT transaction history
 */
router.get('/nft/:nftId', async (req: Request, res: Response) => {
  try {
    const { nftId } = req.params;
    const { limit = '50', offset = '0' } = req.query;

    const transactions = await TransactionService.getNFTTransactionHistory(
      nftId,
      Number(limit),
      Number(offset)
    );

    res.json(transactions);
  } catch (error) {
    logger.error('Error fetching NFT transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

/**
 * GET /api/transactions/stats/volume
 * Get platform volume stats
 */
router.get('/stats/volume', async (req: Request, res: Response) => {
  try {
    const volume = await TransactionService.getPlatformVolume();
    res.json({ volume });
  } catch (error) {
    logger.error('Error fetching volume stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * GET /api/transactions/stats/user/:userId
 * Get user transaction volume
 */
router.get('/stats/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const volume = await TransactionService.getUserVolume(userId);
    res.json({ volume });
  } catch (error) {
    logger.error('Error fetching user volume:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
