-- GovDAO Schema Migration
-- Adds Governance DAO models for voting system

-- GovProposal Table
CREATE TABLE "GovProposal" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "proposerId" TEXT NOT NULL,
  "title" VARCHAR(100) NOT NULL,
  "description" TEXT NOT NULL,
  "proposalType" TEXT NOT NULL,
  "votingPeriodBlocks" INTEGER NOT NULL,
  "executionData" TEXT,
  "contractProposalId" INTEGER NOT NULL UNIQUE,
  "status" TEXT NOT NULL DEFAULT 'active',
  "startBlock" INTEGER,
  "endBlock" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GovProposal_proposerId_fkey" FOREIGN KEY ("proposerId") REFERENCES "User" ("id") ON DELETE CASCADE
);

-- GovVote Table
CREATE TABLE "GovVote" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "proposalId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "voteChoice" TEXT NOT NULL,
  "votingPowerUsed" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GovVote_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "GovProposal" ("id") ON DELETE CASCADE,
  CONSTRAINT "GovVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE,
  CONSTRAINT "GovVote_proposalId_userId_key" UNIQUE ("proposalId", "userId")
);

-- Indexes
CREATE INDEX "GovProposal_proposerId_idx" ON "GovProposal"("proposerId");
CREATE INDEX "GovProposal_status_idx" ON "GovProposal"("status");
CREATE INDEX "GovProposal_createdAt_idx" ON "GovProposal"("createdAt");
CREATE INDEX "GovVote_proposalId_idx" ON "GovVote"("proposalId");
CREATE INDEX "GovVote_userId_idx" ON "GovVote"("userId");

-- Comment
COMMENT ON TABLE "GovProposal" IS 'Governance proposals for DAO voting';
COMMENT ON TABLE "GovVote" IS 'User votes on governance proposals';
