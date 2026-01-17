/**
 * GovDAO TypeScript Types
 * Type definitions for governance DAO system
 */

// ============ VOTING POWER TYPES ============

export interface VotingPowerBreakdown {
  nftHoldings: number;
  xpLevel: number;
  followers: number;
  epicAchievements: number;
  totalVotingPower: number;
}

export interface VotingPowerSnapshot {
  voter: string;
  totalVotingPower: number;
  nftHoldings: number;
  xpLevel: number;
  followers: number;
  epicAchievements: number;
  lastUpdated: number; // Block height
}

export interface VotingWeights {
  NFT_HOLDING: number;
  XP_LEVEL: number;
  FOLLOWERS: number;
  ACHIEVEMENTS: number;
}

// ============ PROPOSAL TYPES ============

export type ProposalType = 'parameter-change' | 'fund-allocation' | 'feature-request';
export type ProposalStatus = 'active' | 'passed' | 'failed' | 'executed' | 'cancelled';
export type VoteChoice = 'for' | 'against' | 'abstain';

export interface Proposal {
  id: string; // Database ID
  proposerId: string;
  proposer?: {
    id: string;
    username: string;
    avatar?: string;
  };
  title: string;
  description: string;
  proposalType: ProposalType;
  votingPeriodBlocks: number;
  executionData?: string;
  contractProposalId: number; // On-chain proposal ID
  status: ProposalStatus;
  startBlock?: number;
  endBlock?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProposalDetail extends Proposal {
  votes?: Vote[];
  _count?: {
    votes: number;
  };
  chainData?: ProposalChainData;
}

export interface ProposalChainData {
  proposer: string;
  title: string;
  description: string;
  proposalType: string;
  votesFor: number;
  votesAgainst: number;
  abstained: number;
  startBlock: number;
  endBlock: number;
  status: string;
  executionData: string;
  createdAt: number;
}

export interface CreateProposalRequest {
  title: string;
  description: string;
  proposalType: ProposalType;
  votingPeriodBlocks?: number;
  executionData?: string;
  userAddress: string;
}

export interface CreateProposalResponse {
  success: boolean;
  proposalId?: number;
  error?: string;
}

// ============ VOTE TYPES ============

export interface Vote {
  id: string;
  proposalId: string;
  userId: string;
  voteChoice: VoteChoice;
  votingPowerUsed: number;
  createdAt: Date;
}

export interface VoteRequest {
  voteChoice: VoteChoice;
  userAddress: string;
}

export interface VoteResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// ============ RESULTS TYPES ============

export interface ProposalResults {
  totalVotes: number;
  votesFor: number;
  votesAgainst: number;
  abstained: number;
  passed: boolean;
  quorumReached: boolean;
  percentFor?: number;
  percentAgainst?: number;
  percentAbstained?: number;
}

export interface ProposalStats {
  proposalId: string;
  totalParticipants: number;
  turnout: number; // Percentage
  consensus: number; // Percentage for
  decision: 'passed' | 'failed' | 'pending';
}

// ============ API RESPONSE TYPES ============

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    skip: number;
    take: number;
    total?: number;
  };
}

// ============ STATISTICS TYPES ============

export interface GovernanceStats {
  totalProposals: number;
  activeProposals: number;
  passedProposals: number;
  failedProposals: number;
  totalVoters: number;
  averageParticipation: number; // Percentage
  votingWeights: VotingWeights;
}

export interface UserGovernanceStats {
  userId: string;
  votingPower: number;
  proposalsCreated: number;
  proposalsVotedOn: number;
  participationRate: number; // Percentage
}

// ============ CONTRACT TYPES ============

export interface ContractCallArgs {
  type: string; // 'principal' | 'uint' | 'string-ascii' | 'string-utf8'
  value: string;
}

export interface ContractInteractionResult {
  success: boolean;
  value?: any;
  error?: string;
  txId?: string;
}

// ============ ERROR TYPES ============

export enum GovDAOErrorCode {
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  INVALID_INPUT = 400,
  INSUFFICIENT_VOTING_POWER = 402,
  PROPOSAL_CLOSED = 403,
  ALREADY_VOTED = 404,
  INVALID_PROPOSAL = 405,
  VOTING_NOT_STARTED = 406,
  VOTING_NOT_ENDED = 407,
}

export interface GovDAOError extends Error {
  code: GovDAOErrorCode;
  details?: any;
}

// ============ DATABASE TYPES ============

export interface GovProposalRecord {
  id: string;
  proposerId: string;
  title: string;
  description: string;
  proposalType: ProposalType;
  votingPeriodBlocks: number;
  executionData?: string;
  contractProposalId: number;
  status: ProposalStatus;
  startBlock?: number;
  endBlock?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GovVoteRecord {
  id: string;
  proposalId: string;
  userId: string;
  voteChoice: VoteChoice;
  votingPowerUsed: number;
  createdAt: Date;
}

// ============ QUERY TYPES ============

export interface ProposalQueryOptions {
  skip?: number;
  take?: number;
  status?: ProposalStatus;
  proposerId?: string;
  sortBy?: 'createdAt' | 'votesFor' | 'votesAgainst';
  sortOrder?: 'asc' | 'desc';
}

export interface VoteQueryOptions {
  proposalId: string;
  userId?: string;
  voteChoice?: VoteChoice;
}

// ============ REQUEST TYPES ============

export interface SyncVotingPowerRequest {
  userAddress: string;
}

export interface UpdateGovernanceParametersRequest {
  minVotingPeriod?: number;
  maxVotingPeriod?: number;
  quorumPercentage?: number;
}

// ============ BLOCKCHAIN INTERACTION TYPES ============

export interface UpdateVoterPowerParams {
  voter: string;
  nftHoldings: number;
  xpLevel: number;
  followerCount: number;
  epicAchievements: number;
}

export interface ProposalCreationData {
  title: string;
  description: string;
  proposalType: ProposalType;
  votingPeriodBlocks: number;
  executionData: string;
}

// ============ VALIDATION TYPES ============

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
}

// ============ CONFIGURATION TYPES ============

export interface GovDAOConfig {
  CONTRACT_ADDRESS: string;
  VOTING_WEIGHTS: VotingWeights;
  MIN_VOTING_POWER: number;
  MIN_VOTING_PERIOD_BLOCKS: number;
  MAX_VOTING_PERIOD_BLOCKS: number;
  DEFAULT_VOTING_PERIOD_BLOCKS: number;
  QUORUM_PERCENTAGE: number;
  EXECUTION_DELAY_BLOCKS: number;
}

// ============ SERVICE RESPONSE TYPES ============

export interface CalculateVotingPowerResponse {
  success: boolean;
  data?: VotingPowerBreakdown;
  error?: string;
}

export interface GetVoterPowerResponse {
  success: boolean;
  votingPower: number;
}

export interface ProposalListResponse {
  success: boolean;
  data: ProposalDetail[];
  pagination: {
    skip: number;
    take: number;
    total: number;
  };
}

export interface ProposalDetailResponse {
  success: boolean;
  data?: ProposalDetail;
  error?: string;
}

export interface ProposalResultsResponse {
  success: boolean;
  data?: ProposalResults;
  error?: string;
}

// ============ EVENT TYPES ============

export interface ProposalCreatedEvent {
  proposalId: number;
  proposer: string;
  title: string;
  proposalType: ProposalType;
  startBlock: number;
  endBlock: number;
  timestamp: Date;
}

export interface VoteCastEvent {
  proposalId: string;
  voter: string;
  voteChoice: VoteChoice;
  votingPowerUsed: number;
  timestamp: Date;
}

export interface ProposalClosedEvent {
  proposalId: string;
  status: ProposalStatus;
  votesFor: number;
  votesAgainst: number;
  abstained: number;
  timestamp: Date;
}

// ============ UTILITY TYPES ============

export type ProposalFilter = {
  [K in keyof Partial<Proposal>]: Proposal[K];
};

export type ProposalUpdate = Partial<Omit<Proposal, 'id' | 'createdAt'>>;

export interface PaginationOptions {
  skip: number;
  take: number;
}

export interface SortOptions {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}
