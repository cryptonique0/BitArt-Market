import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { RoyaltyPayoutsService } from '../services/royalty-payouts.service';

const router = Router();

// List payouts for current user
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  // @ts-ignore
  const user = req.user;
  try {
    const payouts = await RoyaltyPayoutsService.listPayouts(user.address);
    res.json({ success: true, data: payouts });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Request payout
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  // @ts-ignore
  const user = req.user;
  const { amount, currency = 'STX', notes } = req.body;
  if (!amount || Number(amount) <= 0) return res.status(400).json({ error: 'Amount required' });
  try {
    const payout = await RoyaltyPayoutsService.requestPayout(user.address, Number(amount), currency, notes);
    res.json({ success: true, data: payout });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Cancel payout (if pending)
router.post('/:payoutId/cancel', authenticateToken, async (req: Request, res: Response) => {
  // @ts-ignore
  const user = req.user;
  const { payoutId } = req.params;
  try {
    const updated = await RoyaltyPayoutsService.cancelPayout(String(payoutId), user.address);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;