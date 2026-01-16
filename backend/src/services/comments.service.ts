import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import {
  Comment,
  CommentThread,
  Reaction,
  ReactionSummary,
  EmojiReaction,
  FlaggedComment,
  CommentNotification,
  CreateCommentRequest,
  UpdateCommentRequest,
  CommentListResponse,
  CommentStats,
} from '../types/comments';
import { isSupabaseAvailable } from '../utils/database';

/**
 * Service for managing comments and reactions on NFT listings
 */
export class CommentsService {
  /**
   * Add a reaction to an NFT or comment
   */
  async addReaction(
    nftId: string,
    userId: string,
    username: string,
    emoji: EmojiReaction,
    avatar?: string
  ): Promise<Reaction> {
    try {
      if (!isSupabaseAvailable()) {
        return {
          id: `reaction-${Date.now()}`,
          nftId,
          userId,
          username,
          avatar,
          emoji,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

      const { data, error } = await supabase
        .from('reactions')
        .upsert(
          {
            nft_id: nftId,
            user_id: userId,
            username,
            avatar,
            emoji,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,nft_id' }
        )
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        nftId: data.nft_id,
        userId: data.user_id,
        username: data.username,
        avatar: data.avatar,
        emoji: data.emoji,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      logger.error('Error adding reaction:', error);
      throw error;
    }
  }

  /**
   * Remove a reaction from an NFT
   */
  async removeReaction(nftId: string, userId: string, emoji: EmojiReaction): Promise<boolean> {
    try {
      if (!isSupabaseAvailable()) {
        return true;
      }

      const { error } = await supabase
        .from('reactions')
        .delete()
        .eq('nft_id', nftId)
        .eq('user_id', userId)
        .eq('emoji', emoji);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Error removing reaction:', error);
      return false;
    }
  }

  /**
   * Get reaction summary for an NFT
   */
  async getReactionSummary(nftId: string, userId?: string): Promise<ReactionSummary> {
    try {
      if (!isSupabaseAvailable()) {
        return {
          nftId,
          totalReactions: 0,
          byEmoji: {},
          userReactions: [],
        };
      }

      const { data, error } = await supabase
        .from('reactions')
        .select('emoji, user_id')
        .eq('nft_id', nftId);

      if (error) throw error;

      const summary: ReactionSummary = {
        nftId,
        totalReactions: data?.length || 0,
        byEmoji: {},
        userReactions: [],
      };

      // Group by emoji
      if (data) {
        data.forEach(reaction => {
          const emoji = reaction.emoji as EmojiReaction;
          if (!summary.byEmoji[emoji]) {
            summary.byEmoji[emoji] = {
              count: 0,
              userIds: [],
            };
          }
          summary.byEmoji[emoji].count++;
          summary.byEmoji[emoji].userIds.push(reaction.user_id);

          // Add to user reactions if userId provided
          if (userId && reaction.user_id === userId && !summary.userReactions.includes(emoji)) {
            summary.userReactions.push(emoji);
          }
        });
      }

      return summary;
    } catch (error) {
      logger.error('Error getting reaction summary:', error);
      return {
        nftId,
        totalReactions: 0,
        byEmoji: {},
        userReactions: [],
      };
    }
  }

  /**
   * Create a new comment on an NFT
   */
  async createComment(
    request: CreateCommentRequest,
    userId: string,
    username: string,
    avatar?: string
  ): Promise<Comment> {
    try {
      if (!isSupabaseAvailable()) {
        return {
          id: `comment-${Date.now()}`,
          nftId: request.nftId,
          userId,
          username,
          avatar,
          content: request.content,
          parentCommentId: request.parentCommentId,
          replyCount: 0,
          reactionCount: 0,
          isEdited: false,
          isPinned: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

      const { data, error } = await supabase
        .from('comments')
        .insert({
          nft_id: request.nftId,
          user_id: userId,
          username,
          avatar,
          content: request.content,
          parent_comment_id: request.parentCommentId,
          reply_count: 0,
          reaction_count: 0,
          is_edited: false,
          is_pinned: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        nftId: data.nft_id,
        userId: data.user_id,
        username: data.username,
        avatar: data.avatar,
        content: data.content,
        parentCommentId: data.parent_comment_id,
        replyCount: data.reply_count,
        reactionCount: data.reaction_count,
        isEdited: data.is_edited,
        isPinned: data.is_pinned,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      logger.error('Error creating comment:', error);
      throw error;
    }
  }

  /**
   * Get comments for an NFT (threaded)
   */
  async getComments(
    nftId: string,
    userId?: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<CommentListResponse> {
    try {
      if (!isSupabaseAvailable()) {
        return {
          nftId,
          comments: [],
          totalCount: 0,
          hasMore: false,
          pageInfo: { page: 1, pageSize: limit, totalPages: 0 },
        };
      }

      // Get total count
      const { count } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('nft_id', nftId)
        .is('parent_comment_id', null)
        .is('deleted_at', null);

      // Get root comments
      const { data: rootComments, error: rootError } = await supabase
        .from('comments')
        .select('*')
        .eq('nft_id', nftId)
        .is('parent_comment_id', null)
        .is('deleted_at', null)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (rootError) throw rootError;

      const comments: CommentThread[] = [];

      for (const rootComment of rootComments || []) {
        // Get replies for each root comment
        const { data: replies } = await supabase
          .from('comments')
          .select('*')
          .eq('parent_comment_id', rootComment.id)
          .is('deleted_at', null)
          .order('created_at', { ascending: true });

        // Get reactions for root comment
        const reactions = await this.getReactionSummary(nftId, userId);

        comments.push({
          id: rootComment.id,
          nftId: rootComment.nft_id,
          userId: rootComment.user_id,
          username: rootComment.username,
          avatar: rootComment.avatar,
          content: rootComment.content,
          replyCount: replies?.length || 0,
          reactions,
          isEdited: rootComment.is_edited,
          isPinned: rootComment.is_pinned,
          createdAt: new Date(rootComment.created_at),
          updatedAt: new Date(rootComment.updated_at),
          replies: (replies || []).map(reply => ({
            id: reply.id,
            nftId: reply.nft_id,
            userId: reply.user_id,
            username: reply.username,
            avatar: reply.avatar,
            content: reply.content,
            parentCommentId: reply.parent_comment_id,
            replyCount: 0,
            reactionCount: 0,
            isEdited: reply.is_edited,
            isPinned: reply.is_pinned,
            createdAt: new Date(reply.created_at),
            updatedAt: new Date(reply.updated_at),
          })),
        });
      }

      return {
        nftId,
        comments,
        totalCount: count || 0,
        hasMore: offset + limit < (count || 0),
        pageInfo: {
          page: Math.floor(offset / limit) + 1,
          pageSize: limit,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      logger.error('Error getting comments:', error);
      return {
        nftId,
        comments: [],
        totalCount: 0,
        hasMore: false,
        pageInfo: { page: 1, pageSize: limit, totalPages: 0 },
      };
    }
  }

  /**
   * Update a comment
   */
  async updateComment(commentId: string, request: UpdateCommentRequest): Promise<Comment> {
    try {
      if (!isSupabaseAvailable()) {
        throw new Error('Database not available');
      }

      const { data, error } = await supabase
        .from('comments')
        .update({
          content: request.content,
          is_edited: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', commentId)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        nftId: data.nft_id,
        userId: data.user_id,
        username: data.username,
        avatar: data.avatar,
        content: data.content,
        parentCommentId: data.parent_comment_id,
        replyCount: data.reply_count,
        reactionCount: data.reaction_count,
        isEdited: data.is_edited,
        isPinned: data.is_pinned,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      logger.error('Error updating comment:', error);
      throw error;
    }
  }

  /**
   * Delete a comment (soft delete by default)
   */
  async deleteComment(commentId: string, hardDelete: boolean = false): Promise<boolean> {
    try {
      if (!isSupabaseAvailable()) {
        return true;
      }

      if (hardDelete) {
        const { error } = await supabase.from('comments').delete().eq('id', commentId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('comments')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', commentId);
        if (error) throw error;
      }

      return true;
    } catch (error) {
      logger.error('Error deleting comment:', error);
      return false;
    }
  }

  /**
   * Flag a comment for moderation
   */
  async flagComment(
    commentId: string,
    userId: string,
    reason: 'spam' | 'hate' | 'harassment' | 'misinformation' | 'other',
    description?: string
  ): Promise<FlaggedComment> {
    try {
      if (!isSupabaseAvailable()) {
        return {
          id: `flag-${Date.now()}`,
          commentId,
          userId,
          reason,
          description,
          flaggedAt: new Date(),
          status: 'pending',
        };
      }

      const { data, error } = await supabase
        .from('flagged_comments')
        .insert({
          comment_id: commentId,
          user_id: userId,
          reason,
          description,
          flagged_at: new Date().toISOString(),
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        commentId: data.comment_id,
        userId: data.user_id,
        reason: data.reason,
        description: data.description,
        flaggedAt: new Date(data.flagged_at),
        status: data.status,
      };
    } catch (error) {
      logger.error('Error flagging comment:', error);
      throw error;
    }
  }

  /**
   * Get comment statistics for an NFT
   */
  async getCommentStats(nftId: string): Promise<CommentStats> {
    try {
      if (!isSupabaseAvailable()) {
        return {
          nftId,
          totalComments: 0,
          totalReplies: 0,
          totalReactions: 0,
          averageCommentLength: 0,
          uniqueCommenters: 0,
          engagementScore: 0,
          mostActiveCommenter: { userId: '', username: '', commentCount: 0 },
        };
      }

      // Get all comments
      const { data: comments } = await supabase
        .from('comments')
        .select('*')
        .eq('nft_id', nftId)
        .is('deleted_at', null);

      const { data: reactions } = await supabase.from('reactions').select('*').eq('nft_id', nftId);

      const rootComments = comments?.filter(c => !c.parent_comment_id) || [];
      const replies = comments?.filter(c => c.parent_comment_id) || [];
      const uniqueUsers = new Set(comments?.map(c => c.user_id) || []).size;

      const averageLength =
        comments && comments.length > 0
          ? comments.reduce((sum, c) => sum + (c.content?.length || 0), 0) / comments.length
          : 0;

      // Find most active commenter
      const commentCounts: Record<string, { count: number; username: string; userId: string }> = {};
      comments?.forEach(c => {
        if (!commentCounts[c.user_id]) {
          commentCounts[c.user_id] = { count: 0, username: c.username, userId: c.user_id };
        }
        commentCounts[c.user_id].count++;
      });

      const mostActiveCommenter = Object.values(commentCounts).reduce(
        (max, current) => (current.count > max.count ? current : max),
        { count: 0, username: '', userId: '' }
      );

      const totalEngagements = rootComments.length + replies.length + (reactions?.length || 0);
      const engagementScore = Math.min(100, totalEngagements * 10);

      return {
        nftId,
        totalComments: rootComments.length,
        totalReplies: replies.length,
        totalReactions: reactions?.length || 0,
        averageCommentLength: Math.round(averageLength),
        uniqueCommenters: uniqueUsers,
        engagementScore,
        mostActiveCommenter: {
          userId: mostActiveCommenter.userId,
          username: mostActiveCommenter.username,
          commentCount: mostActiveCommenter.count,
        },
        lastCommentAt: comments?.length
          ? new Date(comments[comments.length - 1].created_at)
          : undefined,
      };
    } catch (error) {
      logger.error('Error getting comment stats:', error);
      return {
        nftId,
        totalComments: 0,
        totalReplies: 0,
        totalReactions: 0,
        averageCommentLength: 0,
        uniqueCommenters: 0,
        engagementScore: 0,
        mostActiveCommenter: { userId: '', username: '', commentCount: 0 },
      };
    }
  }

  /**
   * Send notification for comment reply
   */
  async notifyCommentReply(
    commentId: string,
    parentCommentAuthorId: string,
    replyAuthorId: string,
    replyAuthorUsername: string,
    nftId: string
  ): Promise<void> {
    try {
      if (!isSupabaseAvailable()) {
        return;
      }

      await supabase.from('comment_notifications').insert({
        user_id: parentCommentAuthorId,
        related_user_id: replyAuthorId,
        type: 'comment_reply',
        comment_id: commentId,
        nft_id: nftId,
        message: `${replyAuthorUsername} replied to your comment`,
        read: false,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error sending comment reply notification:', error);
    }
  }
}
