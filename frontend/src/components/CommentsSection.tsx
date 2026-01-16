import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle, Flag, Trash2, Edit2 } from 'lucide-react';
import { Comment, CommentThread, EmojiReaction } from '../types/comments';
import ReactionBar from './ReactionBar';

interface CommentsProps {
  nftId: string;
  currentUserId?: string;
  onCommentAdded?: () => void;
}

interface CommentDisplayProps {
  comment: CommentThread;
  isReply?: boolean;
  currentUserId?: string;
  onReply?: (parentCommentId: string) => void;
  onEdit?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  onFlag?: (commentId: string) => void;
}

const CommentDisplay: React.FC<CommentDisplayProps> = ({
  comment,
  isReply = false,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onFlag,
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const isAuthor = currentUserId === comment.userId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isReply ? 'ml-10 mt-2' : 'mt-4'}`}
    >
      {/* Avatar */}
      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
        {comment.username?.charAt(0).toUpperCase() || 'U'}
      </div>

      {/* Comment content */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">
              {comment.username}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(comment.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Options menu */}
          <div className="relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            >
              <span className="text-xl">⋮</span>
            </button>

            {showOptions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50"
              >
                {isAuthor && (
                  <>
                    <button
                      onClick={() => {
                        onEdit?.(comment.id);
                        setShowOptions(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full"
                    >
                      <Edit2 size={16} /> Edit
                    </button>
                    <button
                      onClick={() => {
                        onDelete?.(comment.id);
                        setShowOptions(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    onFlag?.(comment.id);
                    setShowOptions(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 w-full"
                >
                  <Flag size={16} /> Report
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Comment text */}
        <p className="mt-2 text-gray-800 dark:text-gray-200 text-sm break-words">
          {comment.content}
        </p>

        {comment.isEdited && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">(edited)</p>
        )}

        {/* Reaction bar */}
        <div className="mt-2">
          <ReactionBar
            nftId={comment.nftId}
            onReactionAdd={async (emoji: EmojiReaction) => {
              // Handle reaction add
            }}
            onReactionRemove={async (emoji: EmojiReaction) => {
              // Handle reaction remove
            }}
            reactions={comment.reactions.byEmoji}
            userReactions={comment.reactions.userReactions}
            totalReactions={comment.reactions.totalReactions}
          />
        </div>

        {/* Reply button and stats */}
        <div className="flex items-center gap-3 mt-3 text-xs text-gray-500 dark:text-gray-400">
          {!isReply && (
            <button
              onClick={() => onReply?.(comment.id)}
              className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <MessageCircle size={14} /> Reply
            </button>
          )}
          {comment.replyCount > 0 && !isReply && <span>{comment.replyCount} replies</span>}
        </div>
      </div>
    </motion.div>
  );
};

const CommentsSection: React.FC<CommentsProps> = ({ nftId, currentUserId, onCommentAdded }) => {
  const [comments, setComments] = useState<CommentThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, [nftId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/comments/${nftId}?limit=20`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUserId) return;

    try {
      setSubmitting(true);
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          nftId,
          content: newComment,
          parentCommentId: replyingTo,
        }),
      });

      if (response.ok) {
        setNewComment('');
        setReplyingTo(null);
        await fetchComments();
        onCommentAdded?.();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        await fetchComments();
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleFlagComment = async (commentId: string) => {
    try {
      const reason = prompt('Why are you reporting this comment?');
      if (!reason) return;

      const response = await fetch(`/api/comments/${commentId}/flag`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ reason: 'other', description: reason }),
      });

      if (response.ok) {
        alert('Comment reported. Thank you for helping keep our community safe.');
      }
    } catch (error) {
      console.error('Error flagging comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin">⏳</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Comments ({comments.length})
      </h3>

      {/* Comment input */}
      {currentUserId ? (
        <form onSubmit={handleAddComment} className="mb-6">
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder={replyingTo ? 'Write a reply...' : 'Write a comment...'}
            className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            rows={3}
            maxLength={5000}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {newComment.length}/5000
            </span>
            <div className="flex gap-2">
              {replyingTo && (
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Send size={16} /> Post
              </button>
            </div>
          </div>
        </form>
      ) : (
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">Sign in to comment</p>
      )}

      {/* Comments list */}
      <AnimatePresence>
        {comments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          <div className="space-y-1">
            {comments.map(comment => (
              <div key={comment.id}>
                <CommentDisplay
                  comment={comment}
                  currentUserId={currentUserId}
                  onReply={() => setReplyingTo(comment.id)}
                  onDelete={handleDeleteComment}
                  onFlag={handleFlagComment}
                />

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="space-y-1">
                    {comment.replies.map(reply => (
                      <CommentDisplay
                        key={reply.id}
                        comment={
                          {
                            ...reply,
                            reactions: { nftId, totalReactions: 0, byEmoji: {}, userReactions: [] },
                            replyCount: 0,
                          } as CommentThread
                        }
                        isReply
                        currentUserId={currentUserId}
                        onDelete={handleDeleteComment}
                        onFlag={handleFlagComment}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommentsSection;
