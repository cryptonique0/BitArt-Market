/**
 * GovDAO Service
 * Manages governance DAO operations including voting power calculation,
 * proposal management, and voting
 */

import { PrismaClient } from '@prisma/client';
import { contractInteraction } from './contractInteraction';

const prisma = new PrismaClient();

// ============ TYPES ============

interface VotingPowerBreakdown {
  nftHoldings: number;
  xpLevel: number;
  followers: number;
  epicAchievements: number;
  totalVotingPower: number;
}

interface ProposalData {
  proposalId: number;
  proposer: string;
  title: string;
  description: string;
  proposalType: 'parameter-change' | 'fund-allocation' | 'feature-request';
  votesFor: number;
  votesAgainst: number;
  abstained: number;
  startBlock: number;
  endBlock: number;
  status: 'active' | 'passed' | 'failed' | 'executed' | 'cancelled';
  executionData: string;
  createdAt: number;
}

interface VoteData {
  proposalId: number;
  voter: string;
  voteChoice: 'for' | 'against' | 'abstain';
  votingPowerUsed: number;
  votedAt: number;
}

// ============ VOTING POWER WEIGHTS ============
const VOTING_WEIGHTS = {
  NFT_HOLDING: 0.4, // 40% - 1 vote per NFT
  XP_LEVEL: 0.3, // 30% - 1 vote per 10 levels
  FOLLOWERS: 0.2, // 20% - 1 vote per 100 followers
  ACHIEVEMENTS: 0.1, // 10% - 1 vote per 5 epic achievements
};

// ============ VOTING POWER CALCULATION ============

/**
 * Calculate user's voting power based on multiple criteria
 */
export async function calculateUserVotingPower(userId: string): Promise<VotingPowerBreakdown> {
  // Get user level data
  const userLevel = await prisma.userLevel.findUnique({
    where: { userId },
  });

  // Get NFT holdings count
  const nftCount = await prisma.nft.count({
    where: { ownerId: userId },
  });

  // Get follower count
  const followerCount = await prisma.userProfile.findFirst({
    where: { userId },
    select: { followersCount: true },
  });

  // Get epic achievements count
  const epicAchievements = await prisma.userAchievement.count({
    where: {
      userId,
      achievement: {
        rarity: 'epic',
      },
    },
  });

  const xpLevel = userLevel?.currentLevel || 0;
  const followers = followerCount?.followersCount || 0;
  const epicCount = epicAchievements || 0;

  // Calculate voting power
  const nftVotes = nftCount * VOTING_WEIGHTS.NFT_HOLDING;
  const xpVotes = Math.floor(xpLevel / 10) * VOTING_WEIGHTS.XP_LEVEL;
  const followerVotes = Math.floor(followers / 100) * VOTING_WEIGHTS.FOLLOWERS;
  const achievementVotes = Math.floor(epicCount / 5) * VOTING_WEIGHTS.ACHIEVEMENTS;

  const totalVotingPower = Math.floor(nftVotes + xpVotes + followerVotes + achievementVotes);

  return {
    nftHoldings: nftCount,
    xpLevel,
    followers,
    epicAchievements: epicCount,
    totalVotingPower,
  };
}

/**
 * Update voter power in smart contract
 */
export async function updateVoterPowerOnChain(
  userAddress: string,
  votingPowerData: VotingPowerBreakdown
): Promise<boolean> {
  try {
    const result = await contractInteraction.callContract({
      contractName: 'govdao',
      functionName: 'update-voter-power',
      args: [
        { type: 'principal', value: userAddress },
        { type: 'uint', value: votingPowerData.nftHoldings.toString() },
        { type: 'uint', value: votingPowerData.xpLevel.toString() },
        { type: 'uint', value: votingPowerData.followers.toString() },
        { type: 'uint', value: votingPowerData.epicAchievements.toString() },
      ],
    });

    return result.success;
  } catch (error) {
    console.error('Error updating voter power on chain:', error);
    return false;
  }
}

/**
 * Get voter's voting power from smart contract
 */
export async function getVoterPower(userAddress: string): Promise<number> {
  try {
    const result = await contractInteraction.callReadOnly({
      contractName: 'govdao',
      functionName: 'get-voter-power',
      args: [{ type: 'principal', value: userAddress }],
    });

    if (result.success && typeof result.value === 'number') {
      return result.value;
    }
    return 0;
  } catch (error) {
    console.error('Error getting voter power:', error);
    return 0;
  }
}

// ============ PROPOSAL MANAGEMENT ============

/**
 * Create a new governance proposal
 */
export async function createProposal(
  proposerId: string,
  proposerAddress: string,
  title: string,
  description: string,
  proposalType: 'parameter-change' | 'fund-allocation' | 'feature-request',
  votingPeriodBlocks: number = 2880, // Default ~24 hours
  executionData: string = ''
): Promise<{ success: boolean; proposalId?: number; error?: string }> {
  try {
    // Check proposer has sufficient voting power
    const votingPower = await getVoterPower(proposerAddress);
    if (votingPower < 10) {
      return {
        success: false,
        error: 'Insufficient voting power to create proposal',
      };
    }

    // Create proposal on chain
    const result = await contractInteraction.callContract({
      contractName: 'govdao',
      functionName: 'create-proposal',
      args: [
        { type: 'string-ascii', value: title },
        { type: 'string-utf8', value: description },
        { type: 'string-ascii', value: proposalType },
        { type: 'uint', value: votingPeriodBlocks.toString() },
        { type: 'string-utf8', value: executionData },
      ],
    });

    if (result.success && typeof result.value === 'number') {
      // Store proposal metadata in database
      const proposal = await prisma.govProposal.create({
        data: {
          proposerId,
          title,
          description,
          proposalType,
          votingPeriodBlocks,
          executionData,
          contractProposalId: result.value,
          status: 'active',
        },
      });

      return {
        success: true,
        proposalId: proposal.id,
      };
    }

    return { success: false, error: 'Failed to create proposal on chain' };
  } catch (error) {
    console.error('Error creating proposal:', error);
    return { success: false, error: 'Error creating proposal' };
  }
}

/**
 * Vote on a proposal
 */
export async function voteOnProposal(
  userId: string,
  userAddress: string,
  proposalId: number,
  voteChoice: 'for' | 'against' | 'abstain'
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get contract proposal ID
    const dbProposal = await prisma.govProposal.findUnique({
      where: { id: proposalId },
    });

    if (!dbProposal) {
      return { success: false, error: 'Proposal not found' };
    }

    // Check user hasn't already voted
    const existingVote = await prisma.govVote.findUnique({
      where: {
        proposalId_userId: {
          proposalId,
          userId,
        },
      },
    });

    if (existingVote) {
      return { success: false, error: 'User has already voted on this proposal' };
    }

    // Cast vote on chain
    const result = await contractInteraction.callContract({
      contractName: 'govdao',
      functionName: 'vote-on-proposal',
      args: [
        { type: 'uint', value: dbProposal.contractProposalId.toString() },
        { type: 'string-ascii', value: voteChoice },
      ],
    });

    if (result.success) {
      // Get voter's voting power
      const votingPower = await getVoterPower(userAddress);

      // Record vote in database
      await prisma.govVote.create({
        data: {
          proposalId,
          userId,
          voteChoice,
          votingPowerUsed: votingPower,
        },
      });

      return { success: true };
    }

    return { success: false, error: 'Failed to cast vote on chain' };
  } catch (error) {
    console.error('Error voting on proposal:', error);
    return { success: false, error: 'Error casting vote' };
  }
}

/**
 * Get proposal details
 */
export async function getProposal(proposalId: number): Promise<any> {
  try {
    const proposal = await prisma.govProposal.findUnique({
      where: { id: proposalId },
      include: {
        proposer: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        votes: {
          select: {
            id: true,
            voteChoice: true,
            votingPowerUsed: true,
            createdAt: true,
          },
        },
      },
    });

    if (!proposal) {
      return null;
    }

    // Get on-chain data
    const chainData = await contractInteraction.callReadOnly({
      contractName: 'govdao',
      functionName: 'get-proposal',
      args: [{ type: 'uint', value: proposal.contractProposalId.toString() }],
    });

    return {
      ...proposal,
      chainData: chainData.value,
    };
  } catch (error) {
    console.error('Error getting proposal:', error);
    return null;
  }
}

/**
 * Get user's vote on a proposal
 */
export async function getUserVote(proposalId: number, userId: string): Promise<any> {
  try {
    return await prisma.govVote.findUnique({
      where: {
        proposalId_userId: {
          proposalId,
          userId,
        },
      },
    });
  } catch (error) {
    console.error('Error getting user vote:', error);
    return null;
  }
}

/**
 * Get all proposals (with pagination)
 */
export async function getAllProposals(
  skip: number = 0,
  take: number = 20,
  status?: string
): Promise<any[]> {
  try {
    const proposals = await prisma.govProposal.findMany({
      where: status ? { status } : {},
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        proposer: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            votes: true,
          },
        },
      },
    });

    return proposals;
  } catch (error) {
    console.error('Error getting proposals:', error);
    return [];
  }
}

/**
 * Calculate proposal results
 */
export async function calculateProposalResults(proposalId: number): Promise<{
  totalVotes: number;
  votesFor: number;
  votesAgainst: number;
  abstained: number;
  passed: boolean;
  quorumReached: boolean;
}> {
  try {
    const votes = await prisma.govVote.findMany({
      where: { proposalId },
    });

    const votesFor = votes
      .filter(v => v.voteChoice === 'for')
      .reduce((sum, v) => sum + v.votingPowerUsed, 0);

    const votesAgainst = votes
      .filter(v => v.voteChoice === 'against')
      .reduce((sum, v) => sum + v.votingPowerUsed, 0);

    const abstained = votes
      .filter(v => v.voteChoice === 'abstain')
      .reduce((sum, v) => sum + v.votingPowerUsed, 0);

    const totalVotes = votesFor + votesAgainst + abstained;

    return {
      totalVotes,
      votesFor,
      votesAgainst,
      abstained,
      passed: votesFor > votesAgainst,
      quorumReached: totalVotes > 0,
    };
  } catch (error) {
    console.error('Error calculating proposal results:', error);
    return {
      totalVotes: 0,
      votesFor: 0,
      votesAgainst: 0,
      abstained: 0,
      passed: false,
      quorumReached: false,
    };
  }
}

export default {
  calculateUserVotingPower,
  updateVoterPowerOnChain,
  getVoterPower,
  createProposal,
  voteOnProposal,
  getProposal,
  getUserVote,
  getAllProposals,
  calculateProposalResults,
};
