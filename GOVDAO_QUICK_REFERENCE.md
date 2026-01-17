# GovDAO Quick Reference

## Voting Power Criteria

| Criterion         | Weight | Calculation               | Min for Proposal |
| ----------------- | ------ | ------------------------- | ---------------- |
| NFT Holdings      | 40%    | 1 vote per NFT            | 10 total votes   |
| XP Level          | 30%    | 1 vote per 10 levels      |                  |
| Followers         | 20%    | 1 vote per 100 followers  |                  |
| Epic Achievements | 10%    | 1 vote per 5 achievements |                  |

## Key Files

```
GovDAO Files Created:
├── contracts/govdao.clar ......................... Smart contract
├── backend/src/services/govdaoService.ts ........ Core service
├── backend/src/routes/govdao.ts ................. API routes
├── prisma/schema.prisma ......................... Updated with models
├── GOVDAO_IMPLEMENTATION_GUIDE.md ............... Full guide
└── GOVDAO_QUICK_REFERENCE.md .................... This file
```

## API Endpoints Summary

### Voting Power

```
GET    /api/govdao/voting-power/:userId
PUT    /api/govdao/voting-power/:userId/sync
```

### Proposals

```
POST   /api/govdao/proposals
GET    /api/govdao/proposals
GET    /api/govdao/proposals/:proposalId
GET    /api/govdao/proposals/:proposalId/results
```

### Voting

```
POST   /api/govdao/proposals/:proposalId/vote
GET    /api/govdao/proposals/:proposalId/vote/:userId
```

### Statistics

```
GET    /api/govdao/statistics
```

## Smart Contract Functions

### Write Functions (require transaction)

```clarity
update-voter-power(voter, nft-holdings, xp-level, follower-count, epic-achievements)
create-proposal(title, description, proposal-type, voting-period, execution-data)
vote-on-proposal(proposal-id, vote-choice)
set-voting-period(min-period, max-period)
set-quorum-percentage(percentage)
```

### Read Functions (no transaction)

```clarity
get-voter-power(voter) -> uint
get-proposal(proposal-id) -> proposal-data
get-vote(proposal-id, voter) -> vote-data
get-min-voting-period() -> uint
get-max-voting-period() -> uint
get-quorum-percentage() -> uint
get-proposal-counter() -> uint
```

## Database Models

### GovProposal

```typescript
{
  id: string,
  proposerId: string,
  title: string,
  description: string,
  proposalType: 'parameter-change' | 'fund-allocation' | 'feature-request',
  votingPeriodBlocks: number,
  executionData?: string,
  contractProposalId: number,
  status: 'active' | 'passed' | 'failed' | 'executed' | 'cancelled',
  startBlock?: number,
  endBlock?: number,
  createdAt: Date,
  updatedAt: Date
}
```

### GovVote

```typescript
{
  id: string,
  proposalId: string,
  userId: string,
  voteChoice: 'for' | 'against' | 'abstain',
  votingPowerUsed: number,
  createdAt: Date
}
```

## Setup Checklist

- [ ] Deploy smart contract (`contracts/govdao.clar`)
- [ ] Run Prisma migration: `npx prisma migrate dev --name add_govdao_models`
- [ ] Register routes in main backend file
- [ ] Update contract configuration with deployed address
- [ ] Test voting power calculation
- [ ] Test proposal creation
- [ ] Test voting functionality

## Common Tasks

### Calculate User Voting Power

```typescript
import govdaoService from '../services/govdaoService';

const votingPower = await govdaoService.calculateUserVotingPower(userId);
// Returns: { nftHoldings, xpLevel, followers, epicAchievements, totalVotingPower }
```

### Sync Voting Power to Chain

```typescript
const votingPower = await govdaoService.calculateUserVotingPower(userId);
const synced = await govdaoService.updateVoterPowerOnChain(userAddress, votingPower);
```

### Create Proposal

```typescript
const result = await govdaoService.createProposal(
  userId,
  userAddress,
  'Proposal Title',
  'Detailed description',
  'feature-request',
  2880, // voting period in blocks
  '' // execution data (optional)
);
```

### Vote on Proposal

```typescript
const result = await govdaoService.voteOnProposal(
  userId,
  userAddress,
  proposalId,
  'for' // or 'against' or 'abstain'
);
```

### Get Proposal Results

```typescript
const results = await govdaoService.calculateProposalResults(proposalId);
// Returns: { totalVotes, votesFor, votesAgainst, abstained, passed, quorumReached }
```

## Voting Power Example

User Statistics:

- NFTs: 8 holdings
- XP Level: 35
- Followers: 250
- Epic Achievements: 8

Calculation:

- NFT votes: 8 × 0.4 = 3.2
- XP votes: ⌊35÷10⌋ × 0.3 = 3 × 0.3 = 0.9
- Follower votes: ⌊250÷100⌋ × 0.2 = 2 × 0.2 = 0.4
- Achievement votes: ⌊8÷5⌋ × 0.1 = 1 × 0.1 = 0.1

**Total: 4.6 votes (5 when rounded)**

## Error Codes

| Code | Meaning                               |
| ---- | ------------------------------------- |
| 401  | Unauthorized - not contract owner     |
| 402  | Insufficient voting power             |
| 403  | Proposal closed - voting period ended |
| 404  | Not found or already voted            |
| 405  | Invalid proposal                      |
| 406  | Voting not started yet                |
| 407  | Voting period not ended               |

## Proposal Status Flow

```
ACTIVE (can vote)
  ↓ [voting period ends]
PASSED/FAILED (vote counting)
  ↓ [after execution delay]
EXECUTED/CANCELLED (final)
```

## Governance Parameters

| Parameter         | Current Value       | Configurable                  |
| ----------------- | ------------------- | ----------------------------- |
| Min Voting Period | 2,880 blocks (~24h) | ✓ via `set-voting-period`     |
| Max Voting Period | 20,160 blocks (~1w) | ✓ via `set-voting-period`     |
| Quorum Percentage | 20%                 | ✓ via `set-quorum-percentage` |
| Execution Delay   | 1,440 blocks (~10h) | ✗ Requires contract update    |
| Min Voting Power  | 10 votes            | ✗ Requires contract update    |

## Integration Example (React)

```typescript
import { useState, useEffect } from 'react';

export function VotingPowerDisplay({ userId }) {
  const [votingPower, setVotingPower] = useState(null);

  useEffect(() => {
    const fetchVotingPower = async () => {
      const response = await fetch(`/api/govdao/voting-power/${userId}`);
      const data = await response.json();
      setVotingPower(data.data);
    };

    fetchVotingPower();
  }, [userId]);

  if (!votingPower) return <div>Loading...</div>;

  return (
    <div>
      <h3>Your Voting Power: {votingPower.totalVotingPower}</h3>
      <ul>
        <li>NFTs: {votingPower.nftHoldings}</li>
        <li>Level: {votingPower.xpLevel}</li>
        <li>Followers: {votingPower.followers}</li>
        <li>Epic Achievements: {votingPower.epicAchievements}</li>
      </ul>
    </div>
  );
}
```

## Performance Considerations

- Voting power is calculated fresh each time (consider caching for high load)
- Proposal queries use pagination (default: 20 per page)
- Vote uniqueness enforced at database level
- Contract calls are asynchronous - handle errors gracefully

## Security Notes

✓ Only contract owner can update voting power
✓ One vote per user per proposal enforced
✓ All inputs validated before contract calls
✓ Voting power snapshot at proposal creation
✓ No double-voting possible

## Next Steps

1. Deploy contract to testnet first
2. Test all endpoints thoroughly
3. Monitor voting power calculations
4. Set up governance parameter optimization
5. Implement frontend voting UI
6. Launch mainnet when ready
