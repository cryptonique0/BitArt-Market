/**
 * GovDAO Routes
 * API endpoints for governance DAO operations
 */

import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import govdaoService from '../services/govdaoService';
import { validationMiddleware } from '../middleware/validation';

const router = Router();

// ============ VOTING POWER ENDPOINTS ============

/**
 * GET /api/govdao/voting-power/:userId
 * Get user's voting power breakdown
 */
router.get('/voting-power/:userId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const votingPower = await govdaoService.calculateUserVotingPower(userId);

    res.json({
      success: true,
      data: votingPower,
    });
  } catch (error) {
    console.error('Error fetching voting power:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch voting power',
    });
  }
});

/**
 * PUT /api/govdao/voting-power/:userId/sync
 * Sync voting power to blockchain
 */
router.put('/voting-power/:userId/sync', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { userAddress } = req.body;

    // Calculate voting power
    const votingPower = await govdaoService.calculateUserVotingPower(userId);

    // Update on blockchain
    const success = await govdaoService.updateVoterPowerOnChain(userAddress, votingPower);

    if (!success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to sync voting power to blockchain',
      });
    }

    res.json({
      success: true,
      data: votingPower,
    });
  } catch (error) {
    console.error('Error syncing voting power:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync voting power',
    });
  }
});

// ============ PROPOSAL ENDPOINTS ============

/**
 * POST /api/govdao/proposals
 * Create a new governance proposal
 */
router.post(
  '/proposals',
  authMiddleware,
  validationMiddleware({
    body: {
      title: { type: 'string', required: true, maxLength: 100 },
      description: { type: 'string', required: true, maxLength: 500 },
      proposalType: {
        type: 'enum',
        required: true,
        enum: ['parameter-change', 'fund-allocation', 'feature-request'],
      },
      votingPeriodBlocks: { type: 'number', required: false },
      executionData: { type: 'string', required: false },
      userAddress: { type: 'string', required: true },
    },
  }),
  async (req: Request, res: Response) => {
    try {
      const {
        title,
        description,
        proposalType,
        votingPeriodBlocks = 2880,
        executionData = '',
        userAddress,
      } = req.body;

      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
      }

      const result = await govdaoService.createProposal(
        userId,
        userAddress,
        title,
        description,
        proposalType,
        votingPeriodBlocks,
        executionData
      );

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      res.status(201).json({
        success: true,
        data: {
          proposalId: result.proposalId,
        },
      });
    } catch (error) {
      console.error('Error creating proposal:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create proposal',
      });
    }
  }
);

/**
 * GET /api/govdao/proposals
 * Get all proposals with pagination
 */
router.get('/proposals', async (req: Request, res: Response) => {
  try {
    const skip = Math.max(0, parseInt(req.query.skip as string) || 0);
    const take = Math.min(100, parseInt(req.query.take as string) || 20);
    const status = req.query.status as string | undefined;

    const proposals = await govdaoService.getAllProposals(skip, take, status);

    res.json({
      success: true,
      data: proposals,
      pagination: {
        skip,
        take,
      },
    });
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch proposals',
    });
  }
});

/**
 * GET /api/govdao/proposals/:proposalId
 * Get proposal details
 */
router.get('/proposals/:proposalId', async (req: Request, res: Response) => {
  try {
    const { proposalId } = req.params;
    const id = parseInt(proposalId);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid proposal ID',
      });
    }

    const proposal = await govdaoService.getProposal(id);

    if (!proposal) {
      return res.status(404).json({
        success: false,
        error: 'Proposal not found',
      });
    }

    res.json({
      success: true,
      data: proposal,
    });
  } catch (error) {
    console.error('Error fetching proposal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch proposal',
    });
  }
});

/**
 * GET /api/govdao/proposals/:proposalId/results
 * Get proposal voting results
 */
router.get('/proposals/:proposalId/results', async (req: Request, res: Response) => {
  try {
    const { proposalId } = req.params;
    const id = parseInt(proposalId);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid proposal ID',
      });
    }

    const results = await govdaoService.calculateProposalResults(id);

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Error fetching proposal results:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch proposal results',
    });
  }
});

// ============ VOTING ENDPOINTS ============

/**
 * POST /api/govdao/proposals/:proposalId/vote
 * Cast a vote on a proposal
 */
router.post(
  '/proposals/:proposalId/vote',
  authMiddleware,
  validationMiddleware({
    body: {
      voteChoice: { type: 'enum', required: true, enum: ['for', 'against', 'abstain'] },
      userAddress: { type: 'string', required: true },
    },
  }),
  async (req: Request, res: Response) => {
    try {
      const { proposalId } = req.params;
      const { voteChoice, userAddress } = req.body;

      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
      }

      const id = parseInt(proposalId);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid proposal ID',
        });
      }

      const result = await govdaoService.voteOnProposal(userId, userAddress, id, voteChoice);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      res.json({
        success: true,
        message: 'Vote recorded successfully',
      });
    } catch (error) {
      console.error('Error voting on proposal:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to vote on proposal',
      });
    }
  }
);

/**
 * GET /api/govdao/proposals/:proposalId/vote/:userId
 * Get user's vote on a proposal
 */
router.get(
  '/proposals/:proposalId/vote/:userId',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { proposalId, userId } = req.params;
      const id = parseInt(proposalId);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid proposal ID',
        });
      }

      const vote = await govdaoService.getUserVote(id, userId);

      if (!vote) {
        return res.status(404).json({
          success: false,
          error: 'User has not voted on this proposal',
        });
      }

      res.json({
        success: true,
        data: vote,
      });
    } catch (error) {
      console.error('Error fetching user vote:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user vote',
      });
    }
  }
);

// ============ STATISTICS ENDPOINTS ============

/**
 * GET /api/govdao/statistics
 * Get governance statistics
 */
router.get('/statistics', async (req: Request, res: Response) => {
  try {
    // Get all proposals and votes
    const proposals = await govdaoService.getAllProposals(0, 1000);

    const totalProposals = proposals.length;
    const activeProposals = proposals.filter(p => p.status === 'active').length;
    const passedProposals = proposals.filter(p => p.status === 'passed').length;

    res.json({
      success: true,
      data: {
        totalProposals,
        activeProposals,
        passedProposals,
        votingWeights: {
          nftHolding: 40,
          xpLevel: 30,
          followers: 20,
          achievements: 10,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
    });
  }
});

export default router;
