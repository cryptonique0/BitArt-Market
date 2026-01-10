/**
 * Auth Routes
 * - MetaMask wallet auth (nonce + verify)
 * - Supabase token auth proxy (me)
 */

import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { requireAppJWT, requireSupabaseAuth } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/auth/nonce?address=0x...
 * Generate nonce for wallet signature
 */
router.get('/nonce', async (req: Request, res: Response) => {
  try {
    const { address } = req.query;
    if (!address || typeof address !== 'string') {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    const nonce = await AuthService.getOrCreateNonce(address);
    if (!nonce) return res.status(500).json({ error: 'Failed to generate nonce' });

    res.json({ address, ...nonce, message: `Sign in to BitArt Market\n\nNonce: ${nonce.nonce}` });
  } catch (error) {
    logger.error('Error generating nonce:', error);
    res.status(500).json({ error: 'Failed to generate nonce' });
  }
});

/**
 * POST /api/auth/verify
 * Verify signature and issue app JWT
 */
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { address, signature } = req.body;
    if (!address || !signature) {
      return res.status(400).json({ error: 'Address and signature required' });
    }

    const result = await AuthService.verifySignatureAndIssueToken(address, signature);
    if (!result) return res.status(401).json({ error: 'Invalid signature' });

    res.json({ token: result.token, userId: result.userId });
  } catch (error) {
    logger.error('Error verifying signature:', error);
    res.status(500).json({ error: 'Failed to verify signature' });
  }
});

/**
 * GET /api/auth/me
 * Return current user via App JWT or Supabase JWT
 */
router.get('/me', requireAppJWT, async (req: Request, res: Response) => {
  try {
    res.json({ user: req.authUser });
  } catch (error) {
    logger.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Failed to fetch current user' });
  }
});

/**
 * GET /api/auth/me/supabase
 * Return current user via Supabase JWT
 */
router.get('/me/supabase', requireSupabaseAuth, async (req: Request, res: Response) => {
  try {
    res.json({ user: req.authUser });
  } catch (error) {
    logger.error('Error fetching supabase user:', error);
    res.status(500).json({ error: 'Failed to fetch supabase user' });
  }
});

export default router;
