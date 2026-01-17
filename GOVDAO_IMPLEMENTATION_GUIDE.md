# GovDAO Implementation Guide

## Overview

GovDAO is a decentralized governance system where users gain voting power based on multiple criteria:

- **NFT Holdings** (40% weight): 1 vote per NFT owned
- **XP Level** (30% weight): 1 vote per 10 levels achieved
- **Followers** (20% weight): 1 vote per 100 followers
- **Epic Achievements** (10% weight): 1 vote per 5 epic achievements unlocked

## Architecture

### Smart Contract (Clarity)

File: `contracts/govdao.clar`

**Key Functions:**

- `update-voter-power`: Update user's voting power on-chain
- `create-proposal`: Create a new governance proposal
- `vote-on-proposal`: Cast a vote on an active proposal
- `get-voter-power`: Read-only function to get voting power
- `get-proposal`: Get proposal details

**Proposal Types:**

- `parameter-change`: Changes to governance parameters
- `fund-allocation`: Treasury or fund allocation proposals
- `feature-request`: New feature requests for the platform

### Backend Service

File: `backend/src/services/govdaoService.ts`

**Main Functions:**

```typescript
// Calculate voting power
calculateUserVotingPower(userId: string): Promise<VotingPowerBreakdown>

// Update on-chain voting power
updateVoterPowerOnChain(userAddress: string, votingPowerData: VotingPowerBreakdown): Promise<boolean>

// Create governance proposal
createProposal(
  proposerId: string,
  proposerAddress: string,
  title: string,
  description: string,
  proposalType: 'parameter-change' | 'fund-allocation' | 'feature-request',
  votingPeriodBlocks?: number,
  executionData?: string
): Promise<{ success: boolean; proposalId?: number; error?: string }>

// Vote on proposal
voteOnProposal(
  userId: string,
  userAddress: string,
  proposalId: number,
  voteChoice: 'for' | 'against' | 'abstain'
): Promise<{ success: boolean; error?: string }>

// Get proposal results
calculateProposalResults(proposalId: number): Promise<ProposalResults>
```

### API Routes

File: `backend/src/routes/govdao.ts`

**Endpoints:**

#### Voting Power

```
GET /api/govdao/voting-power/:userId
- Get user's voting power breakdown
- Returns: nftHoldings, xpLevel, followers, epicAchievements, totalVotingPower

PUT /api/govdao/voting-power/:userId/sync
- Sync voting power to blockchain
- Body: { userAddress: string }
- Returns: Updated voting power breakdown
```

#### Proposals

```
POST /api/govdao/proposals
- Create new proposal
- Body: {
    title: string,
    description: string,
    proposalType: 'parameter-change' | 'fund-allocation' | 'feature-request',
    votingPeriodBlocks?: number,
    executionData?: string,
    userAddress: string
  }
- Returns: { proposalId: number }

GET /api/govdao/proposals
- List all proposals with pagination
- Query: skip, take, status
- Returns: Array of proposals

GET /api/govdao/proposals/:proposalId
- Get proposal details
- Returns: Full proposal data with vote counts

GET /api/govdao/proposals/:proposalId/results
- Get proposal voting results
- Returns: {
    totalVotes: number,
    votesFor: number,
    votesAgainst: number,
    abstained: number,
    passed: boolean,
    quorumReached: boolean
  }
```

#### Voting

```
POST /api/govdao/proposals/:proposalId/vote
- Cast a vote on proposal
- Body: {
    voteChoice: 'for' | 'against' | 'abstain',
    userAddress: string
  }
- Returns: { success: true, message: string }

GET /api/govdao/proposals/:proposalId/vote/:userId
- Get user's vote on a proposal
- Returns: Vote details or 404 if not voted
```

#### Statistics

```
GET /api/govdao/statistics
- Get governance statistics
- Returns: {
    totalProposals: number,
    activeProposals: number,
    passedProposals: number,
    votingWeights: { ... }
  }
```

## Database Schema

### GovProposal

```prisma
model GovProposal {
  id                 String   @id @default(cuid())
  proposerId         String   // User who created proposal
  title              String   @db.VarChar(100)
  description        String   @db.Text
  proposalType       String   // 'parameter-change' | 'fund-allocation' | 'feature-request'
  votingPeriodBlocks Int      // Duration in blocks
  executionData      String?  @db.Text
  contractProposalId Int      @unique  // Reference to on-chain proposal ID
  status             String   @default("active") // 'active' | 'passed' | 'failed' | 'executed' | 'cancelled'
  startBlock         Int?     // When voting starts
  endBlock           Int?     // When voting ends
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  // Relations
  proposer User       @relation(fields: [proposerId], references: [id], onDelete: Cascade)
  votes    GovVote[]
}

model GovVote {
  id              String   @id @default(cuid())
  proposalId      String
  userId          String
  voteChoice      String   // 'for' | 'against' | 'abstain'
  votingPowerUsed Int      // Amount of voting power used
  createdAt       DateTime @default(now())

  // Relations
  proposal GovProposal @relation(fields: [proposalId], references: [id], onDelete: Cascade)
  user     User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([proposalId, userId])  // User can only vote once per proposal
}
```

## Installation & Setup

### 1. Deploy Smart Contract

```bash
# Deploy the GovDAO contract
cd contracts/
stx deploy govdao.clar --network mainnet
# Or for testing
stx deploy govdao.clar --network testnet
```

### 2. Run Prisma Migration

```bash
cd /home/web3joker/Documents/SAMAD_V2/BitArt\ Market/
npx prisma migrate dev --name add_govdao_models
```

### 3. Register Routes

Add this to your main backend file (e.g., `backend/src/index.ts`):

```typescript
import govdaoRoutes from './routes/govdao';

// After other route registrations
app.use('/api/govdao', govdaoRoutes);
```

### 4. Initialize Contract Address

Update your contract configuration with the deployed GovDAO contract address:

```typescript
// backend/src/config/contracts.ts
export const CONTRACT_ADDRESSES = {
  GOVDAO: 'SP...', // Your deployed contract address
  // ... other contracts
};
```

## Voting Power Calculation Formula

```
Total Voting Power = (NFT Count × 0.4)
                   + (⌊XP Level / 10⌋ × 0.3)
                   + (⌊Followers / 100⌋ × 0.2)
                   + (⌊Epic Achievements / 5⌋ × 0.1)
```

### Example:

- User has 10 NFTs: 10 × 0.4 = 4 votes
- User is level 45: ⌊45 / 10⌋ × 0.3 = 1.2 votes
- User has 500 followers: ⌊500 / 100⌋ × 0.2 = 1 vote
- User has 10 epic achievements: ⌊10 / 5⌋ × 0.1 = 0.2 votes

**Total Voting Power = 6.4 votes (6 when rounded)**

## Proposal Lifecycle

1. **Creation**: User with sufficient voting power (≥10) creates proposal
2. **Voting Period**: Defined in blocks (~24 hours default, adjustable)
3. **Results Calculation**: After voting ends
   - Passed: votesFor > votesAgainst
   - Failed: Otherwise
4. **Execution Delay**: 10 hours before proposal can be executed
5. **Execution**: Execute based on execution data

## Security Considerations

1. **Voting Power Verification**: All voting power updates are verified against user data
2. **One Vote Per User Per Proposal**: Enforced via unique constraint in database
3. **Snapshot Voting**: Voting power is calculated at proposal creation time
4. **Authorization**: Only contract owner can update voter power
5. **Input Validation**: All proposal and vote data is validated

## Integration Example

### Frontend

```typescript
import { govdaoService } from './services/govdaoService';

// Get user's voting power
const votingPower = await govdaoService.calculateUserVotingPower(userId);
console.log(`User has ${votingPower.totalVotingPower} votes`);

// Create proposal
const result = await govdaoService.createProposal(
  userId,
  userAddress,
  'Add Feature X',
  'Description of feature X',
  'feature-request'
);

// Vote on proposal
await govdaoService.voteOnProposal(userId, userAddress, proposalId, 'for');

// Get results
const results = await govdaoService.calculateProposalResults(proposalId);
console.log(`Votes For: ${results.votesFor}, Against: ${results.votesAgainst}`);
```

## Governance Parameters (Configurable)

| Parameter         | Value                    | Function                       |
| ----------------- | ------------------------ | ------------------------------ |
| Min Voting Period | 2,880 blocks (~24 hours) | `set-voting-period`            |
| Max Voting Period | 20,160 blocks (~1 week)  | `set-voting-period`            |
| Quorum Percentage | 20%                      | `set-quorum-percentage`        |
| Execution Delay   | 1,440 blocks (~10 hours) | Hardcoded (update in contract) |
| Min Voting Power  | 10 votes                 | Hardcoded (update in contract) |

## Testing

### Test Voting Power Calculation

```bash
cd backend
npm test -- govdaoService.test.ts
```

### Test API Endpoints

```bash
# Get voting power
curl http://localhost:3001/api/govdao/voting-power/user123

# Create proposal
curl -X POST http://localhost:3001/api/govdao/proposals \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Proposal Title",
    "description": "Proposal description",
    "proposalType": "feature-request",
    "userAddress": "SP123..."
  }'

# Vote on proposal
curl -X POST http://localhost:3001/api/govdao/proposals/1/vote \
  -H "Content-Type: application/json" \
  -d '{
    "voteChoice": "for",
    "userAddress": "SP123..."
  }'
```

## Future Enhancements

1. **Weighted Voting**: Different voting weights based on achievement tier
2. **Delegated Voting**: Allow users to delegate voting power
3. **Governance Tokens**: Introduce dedicated governance token
4. **Treasury Management**: Automated fund allocation based on proposals
5. **Multi-sig Execution**: Require multiple signatures to execute proposals
6. **Time-locked Execution**: Minimum time after vote passage before execution
7. **Proposal Amendments**: Allow proposers to modify proposals during voting

## Troubleshooting

### Issue: Voting power shows 0

**Solution**:

- Ensure voting power is synced to blockchain: `PUT /api/govdao/voting-power/:userId/sync`
- Check user has achievements, followers, or NFTs

### Issue: Cannot create proposal

**Solution**:

- Ensure user has voting power ≥ 10
- Check user has synced voting power to blockchain

### Issue: Vote not recorded

**Solution**:

- Ensure voting period is still active
- Check user hasn't already voted
- Verify contract deployment

## Support

For issues or questions:

1. Check blockchain transaction logs: `stx get-tx-status <tx-id>`
2. Review database for GovProposal and GovVote records
3. Check service logs for contract interaction errors
