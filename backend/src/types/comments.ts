/**
 * Types for Social Comments & Reactions System
 * Enables threaded comments and emoji reactions on NFT listings
 */

// ============ EMOJI REACTIONS ============

export enum EmojiReaction {
  LIKE = '👍',
  HEART = '❤️',
  FIRE = '🔥',
  AMAZING = '🤯',
  LAUGH = '😂',
  SAD = '😢',
  ANGRY = '😠',
  THINKING = '🤔',
  MOON = '🌙',
  DIAMOND = '💎',
  ROCKET = '🚀',
  CLAP = '👏',
}

export interface Reaction {
  id: string;
  nftId: string;
  userId: string;
  username: string;
  avatar?: string;
  emoji: EmojiReaction;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReactionSummary {
  nftId: string;
  totalReactions: number;
  byEmoji: {
    [key in EmojiReaction]?: {
      count: number;
      userIds: string[];
    };
  };
  userReactions: EmojiReaction[]; // Current user's reactions
}

export interface ReactionStats {
  nftId: string;
  totalCount: number;
  mostPopularEmoji: {
    emoji: EmojiReaction;
    count: number;
  };
  uniqueUsers: number;
}

// ============ COMMENTS ============

export interface Comment {
  id: string;
  nftId: string;
  userId: string;
  username: string;
  avatar?: string;
  content: string;
  parentCommentId?: string; // For threaded replies
  replyCount: number;
  reactionCount: number;
  isEdited: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date; // Soft delete
}

export interface CommentThread {
  id: string;
  nftId: string;
  userId: string;
  username: string;
  avatar?: string;
  content: string;
  replyCount: number;
  reactions: ReactionSummary;
  isEdited: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  replies: Comment[]; // Threaded replies
}

export interface CommentReply {
  id: string;
  parentCommentId: string;
  nftId: string;
  userId: string;
  username: string;
  avatar?: string;
  content: string;
  reactionCount: number;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CreateCommentRequest {
  nftId: string;
  content: string;
  parentCommentId?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface DeleteCommentRequest {
  commentId: string;
  hardDelete?: boolean; // If true, permanently delete; if false, soft delete
}

// ============ MODERATION ============

export interface FlaggedComment {
  id: string;
  commentId: string;
  userId: string;
  reason: 'spam' | 'hate' | 'harassment' | 'misinformation' | 'other';
  description?: string;
  flaggedAt: Date;
  status: 'pending' | 'reviewed' | 'dismissed' | 'removed';
  reviewedBy?: string;
  reviewedAt?: Date;
  action?: string; // Action taken (e.g., removed, warned user)
}

export interface CommentModerationStats {
  nftId: string;
  totalComments: number;
  totalFlaggedComments: number;
  flaggedByReason: {
    spam: number;
    hate: number;
    harassment: number;
    misinformation: number;
    other: number;
  };
  approvalRate: number; // % of comments that weren't flagged
}

// ============ NOTIFICATIONS ============

export interface CommentNotification {
  id: string;
  userId: string;
  relatedUserId: string;
  type: 'comment_reply' | 'comment_reaction' | 'comment_pin' | 'comment_mention';
  commentId: string;
  nftId: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

// ============ ANALYTICS ============

export interface CommentStats {
  nftId: string;
  totalComments: number;
  totalReplies: number;
  totalReactions: number;
  averageCommentLength: number;
  uniqueCommenters: number;
  engagementScore: number; // 0-100
  mostActiveCommenter: {
    userId: string;
    username: string;
    commentCount: number;
  };
  lastCommentAt?: Date;
}

export interface UserCommentActivity {
  userId: string;
  totalComments: number;
  totalReplies: number;
  totalReactionsGiven: number;
  averageCommentLength: number;
  nftsCommentedOn: number;
  mostActiveCategory?: string;
  lastCommentDate?: Date;
  accountCreatedDate: Date;
}

export interface CommentEngagementMetrics {
  nftId: string;
  commentingEnabled: boolean;
  totalEngagements: number; // comments + reactions
  commentDensity: number; // comments per day since listing
  reactionDensity: number; // reactions per day since listing
  engagementRate: number; // % of viewers who commented/reacted
  sentimentScore: number; // -100 (negative) to +100 (positive)
  trending: boolean; // true if engagement > threshold
}

// ============ UI/DISPLAY ============

export interface CommentDisplayOptions {
  sortBy: 'newest' | 'oldest' | 'popular' | 'trending';
  filterBy: 'all' | 'replies' | 'questions' | 'mentions';
  pageSize: number;
  showDeleted: boolean;
}

export interface CommentListResponse {
  nftId: string;
  comments: CommentThread[];
  totalCount: number;
  hasMore: boolean;
  pageInfo: {
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface CommentThreadResponse {
  comment: Comment;
  replies: Comment[];
  reactionsSummary: ReactionSummary;
  userIsAuthor: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canReply: boolean;
}
