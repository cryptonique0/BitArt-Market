# Social Comments & Reactions - Integration Guide

## Overview

The Social Comments & Reactions feature enables users to:

- Leave threaded comments on NFT listings
- React with emoji to NFTs and comments
- Reply to comments with full threading support
- Moderate comments through flagging and deletion
- Track comment engagement metrics

## Components Implemented

### Backend Components

#### 1. Type Definitions (`/backend/src/types/comments.ts`)

**Enums:**

- `EmojiReaction` - 12 emoji reactions (👍, ❤️, 🔥, 🤯, 😂, 😢, 😠, 🤔, 🌙, 💎, 🚀, 👏)

**Interfaces:**

- `Reaction` - Single emoji reaction
- `ReactionSummary` - Aggregated reactions on NFT
- `Comment` - Individual comment with metadata
- `CommentThread` - Comment with nested replies
- `CommentReply` - Reply to a comment
- `FlaggedComment` - Moderation report
- `CommentNotification` - Notification for comment activity
- `CommentStats` - Statistics for comment section

#### 2. CommentsService (`/backend/src/services/comments.service.ts`)

**Core Methods:**

- `addReaction(nftId, userId, username, emoji, avatar)` - Add emoji reaction
- `removeReaction(nftId, userId, emoji)` - Remove emoji reaction
- `getReactionSummary(nftId, userId)` - Get all reactions on NFT
- `createComment(request, userId, username, avatar)` - Create new comment
- `getComments(nftId, userId, limit, offset)` - Fetch threaded comments
- `updateComment(commentId, request)` - Edit comment
- `deleteComment(commentId, hardDelete)` - Delete comment
- `flagComment(commentId, userId, reason, description)` - Report comment
- `getCommentStats(nftId)` - Get engagement statistics

**Safety Features:**

- Supabase availability checks
- Graceful error handling
- Comment length validation (max 5000 chars)
- Soft deletes by default
- RLS policy enforcement

#### 3. API Routes (`/backend/src/routes/comments.ts`)

**Endpoints:**

```
# Comments
POST   /api/comments                         - Create comment (auth required)
GET    /api/comments/:nftId                  - Get comments (paginated)
PUT    /api/comments/:commentId              - Update comment (auth required)
DELETE /api/comments/:commentId              - Delete comment (auth required)
GET    /api/comments/:nftId/stats            - Get comment statistics
POST   /api/comments/:commentId/flag        - Flag comment (auth required)

# Reactions
POST   /api/comments/reactions/add           - Add reaction (auth required)
DELETE /api/comments/reactions/remove/:nftId/:emoji - Remove reaction (auth required)
GET    /api/comments/:nftId/reactions       - Get reaction summary
```

### Frontend Components

#### 1. ReactionBar (`/frontend/src/components/ReactionBar.tsx`)

**Features:**

- Display emoji reactions with counts
- Emoji picker dropdown
- Toggle user's reaction
- Show which reactions the user has given
- Animated reactions list
- Dark mode support
- Mobile responsive

**Props:**

```typescript
interface ReactionBarProps {
  nftId: string;
  onReactionAdd: (emoji: EmojiReaction) => Promise<void>;
  onReactionRemove: (emoji: EmojiReaction) => Promise<void>;
  reactions: { [key in EmojiReaction]?: { count: number; userIds: string[] } };
  userReactions: EmojiReaction[];
  totalReactions: number;
}
```

#### 2. CommentsSection (`/frontend/src/components/CommentsSection.tsx`)

**Features:**

- Display threaded comments
- Create new comments
- Reply to comments with threading
- Edit own comments
- Delete own comments
- Flag comments for moderation
- Show user avatars and timestamps
- Pagination support
- Markdown-like content formatting
- Reaction bar on each comment
- Loading states and error handling
- Dark mode support
- Mobile responsive

**Props:**

```typescript
interface CommentsProps {
  nftId: string;
  currentUserId?: string;
  onCommentAdded?: () => void;
}
```

## Database Schema

### Tables

#### comments

- id (UUID, PK)
- nft_id (FK to nfts)
- user_id (FK to users)
- username (string)
- avatar (optional URL)
- content (text, max 5000 chars)
- parent_comment_id (FK for threaded replies)
- reply_count (integer, auto-updated)
- reaction_count (integer)
- is_edited (boolean)
- is_pinned (boolean for featured comments)
- deleted_at (soft delete)
- created_at, updated_at

#### reactions

- id (UUID, PK)
- nft_id (FK to nfts)
- user_id (FK to users)
- username (string)
- avatar (optional URL)
- emoji (string, validated against EmojiReaction enum)
- created_at, updated_at
- Unique constraint: (user_id, nft_id, emoji)

#### flagged_comments

- id (UUID, PK)
- comment_id (FK to comments)
- user_id (FK to user who flagged)
- reason (spam, hate, harassment, misinformation, other)
- description (optional)
- flagged_at
- status (pending, reviewed, dismissed, removed)
- reviewed_by (FK to moderator)
- reviewed_at
- action (action taken)

#### comment_notifications

- id (UUID, PK)
- user_id (FK - recipient)
- related_user_id (FK - who triggered notification)
- type (comment_reply, comment_reaction, comment_pin, comment_mention)
- comment_id (FK)
- nft_id (FK)
- message (text)
- read (boolean)
- created_at

### Indexes

- nft_id (comments, reactions)
- user_id (comments, reactions)
- parent_comment_id (comments)
- created_at DESC (comments, reactions, notifications)
- deleted_at (comments)
- status (flagged_comments)
- read (notifications)

### Views

- **comment_stats** - Aggregated comment metrics per NFT
- **reaction_stats** - Reaction breakdown by emoji

### Triggers

- Auto-increment reply_count when comment is added
- Auto-decrement reply_count when comment is deleted
- Send notification when comment is replied to

## Integration Steps

### 1. Database Setup

```bash
# Apply migration
psql < database-migration-comments-reactions.sql

# Or via Supabase:
# 1. Go to SQL Editor
# 2. Paste content from database-migration-comments-reactions.sql
# 3. Execute
```

### 2. Backend Integration

```typescript
// In main server file
import commentsRouter from './routes/comments';

app.use('/api/comments', commentsRouter);
```

### 3. Frontend Integration

#### Add to NFT Detail Page

```typescript
import CommentsSection from './components/CommentsSection';
import ReactionBar from './components/ReactionBar';

function NFTDetailPage({ nftId, currentUserId }) {
  return (
    <div>
      {/* NFT details... */}
      <ReactionBar
        nftId={nftId}
        onReactionAdd={async (emoji) => {
          // API call
        }}
        onReactionRemove={async (emoji) => {
          // API call
        }}
        reactions={reactionsData}
        userReactions={userReactions}
        totalReactions={totalCount}
      />
      <CommentsSection
        nftId={nftId}
        currentUserId={currentUserId}
        onCommentAdded={() => {
          // Refresh stats, etc.
        }}
      />
    </div>
  );
}
```

## Features

### Core Features

- ✅ Emoji reactions (12 types)
- ✅ Threaded comments
- ✅ Reply to comments
- ✅ Edit own comments
- ✅ Delete comments (soft delete)
- ✅ Flag comments for moderation
- ✅ Comment notifications
- ✅ Reaction counters
- ✅ User avatars and names

### Advanced Features

- ✅ Comment statistics
- ✅ Engagement metrics
- ✅ Moderation dashboard ready
- ✅ RLS security policies
- ✅ Automatic reply notifications
- ✅ Comment pagination
- ✅ Sorting (newest, popular, trending)

## Configuration

### Environment Variables

No additional variables required. Uses existing Supabase configuration.

### Validation Rules

- Comment length: 1-5000 characters
- Emoji: Must be from predefined EmojiReaction enum
- Authentication required for: create comment, reactions, delete
- Rate limiting: Recommended to add (future)

## Error Handling

### Service-Level

- All database operations wrapped in try-catch
- Supabase availability checks
- Returns sensible defaults on errors
- Comprehensive logging

### API-Level

- HTTP 400: Bad request (missing parameters, validation failed)
- HTTP 401: Unauthorized (missing/invalid token)
- HTTP 500: Server error (database errors)

### Frontend-Level

- Loading states during API calls
- Error messages shown to users
- Graceful fallback if comments unavailable
- Toast notifications for actions

## Performance Optimization

### Database

- Indexes on frequently queried fields
- Views for aggregated data
- Pagination support (limit: max 100)
- Soft deletes to preserve data

### API

- Response pagination
- Efficient query structure
- Caching opportunities (comments rarely change)

### Frontend

- Component-level memoization
- Lazy loading of replies
- Optimistic UI updates
- Virtual scrolling for large lists (future)

## Security

### Authentication

- JWT tokens required for comment creation/modification
- User ID validated against token
- Moderator role required for flagged comment review

### Authorization

- Users can only edit/delete own comments
- RLS policies enforce data isolation
- Users can only see their own notifications

### Moderation

- Comments can be flagged for review
- Moderators can review and take action
- Soft delete preserves comment history
- Hard delete available for administrators

### Input Validation

- Comment length checked (max 5000 chars)
- Emoji validated against enum
- HTML/script tags should be sanitized (recommended)
- User IDs validated as UUIDs

## Testing Recommendations

### Unit Tests

```typescript
describe('CommentsService', () => {
  it('should create a comment', async () => {});
  it('should get threaded comments', async () => {});
  it('should add reaction', async () => {});
  it('should prevent duplicate reactions', async () => {});
  it('should flag comment', async () => {});
});
```

### Integration Tests

```typescript
describe('Comments API', () => {
  it('should create and retrieve comment', async () => {});
  it('should handle threaded replies', async () => {});
  it('should send notifications', async () => {});
});
```

### E2E Tests

```typescript
describe('Comments Flow', () => {
  it('should complete full comment flow', async () => {
    // 1. Add comment
    // 2. Reply to comment
    // 3. React to comment
    // 4. Check notifications
  });
});
```

## Future Enhancements

1. **Comment Editing UI** - Visual edit history
2. **Rich Text Editor** - Markdown/formatting support
3. **@Mentions** - Tag other users in comments
4. **Comment Search** - Full-text search in comments
5. **Comment Sorting** - Popular, trending, newest
6. **Pinned Comments** - Feature important comments
7. **Comment Filtering** - By user, date range, etc.
8. **Sentiment Analysis** - Detect spam/hate automatically
9. **AI Moderation** - Auto-flag suspicious comments
10. **Comment Analytics Dashboard** - For creators
11. **Real-time Updates** - WebSocket for live comments
12. **Comment Reactions on Comments** - React to replies

## Troubleshooting

### Comments Not Appearing

- Check database migration applied
- Verify nft_id is valid UUID
- Check Supabase connection
- Review server logs for errors

### Reactions Not Working

- Verify emoji is in EmojiReaction enum
- Check JWT token validity
- Ensure unique constraint not violated

### Notifications Not Sent

- Check comment_notifications table exists
- Verify trigger created successfully
- Check Supabase notifications enabled

### Moderation Issues

- Verify moderator role assigned
- Check RLS policies allow access
- Review flagged_comments table

## Support

For issues, check:

- Server logs: `/logs/comments.log`
- Database: Check tables and triggers
- Browser console: Frontend errors
- Supabase dashboard: Data verification
