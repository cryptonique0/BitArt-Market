import React, { useState, useEffect } from 'react';
import { messagingService } from '../services/messaging';
import { type ConversationSummary } from '../services/messaging';

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId: string | null;
  searchQuery: string;
  onUnreadCountChange: (count: number) => void;
}

/**
 * ConversationList Component
 * Displays list of conversations for the current user
 */
export const ConversationList: React.FC<ConversationListProps> = ({
  onSelectConversation,
  selectedConversationId,
  searchQuery,
  onUnreadCountChange,
}) => {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    const unreadTotal = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
    onUnreadCountChange(unreadTotal);
  }, [conversations, onUnreadCountChange]);

  const loadConversations = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await messagingService.getConversations(pageNum, 20);
      setConversations(response.conversations);
      setHasMore(pageNum * 20 < response.total);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      conv.otherParticipantAddress.toLowerCase().includes(query) ||
      (conv.lastMessage?.toLowerCase().includes(query) ?? false)
    );
  });

  return (
    <div className="flex-1 overflow-y-auto">
      {loading && conversations.length === 0 ? (
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredConversations.length > 0 ? (
        <div className="space-y-1 p-2">
          {filteredConversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={`w-full p-3 rounded-lg text-left transition-colors ${
                selectedConversationId === conv.id
                  ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {conv.otherParticipantUsername ||
                      `${conv.otherParticipantAddress.slice(0, 6)}...${conv.otherParticipantAddress.slice(-4)}`}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate line-clamp-1">
                    {conv.lastMessageBy === ''
                      ? 'No messages'
                      : `${conv.lastMessage?.slice(0, 50) || 'Message'}`}
                  </p>
                </div>
                <div className="ml-2 flex items-center gap-2">
                  {conv.unreadCount > 0 && (
                    <span className="inline-block px-2 py-1 text-xs font-bold text-white bg-blue-600 rounded-full">
                      {conv.unreadCount}
                    </span>
                  )}
                  {conv.isBlocked && (
                    <span className="text-xs text-red-600 dark:text-red-400">Blocked</span>
                  )}
                </div>
              </div>
              {conv.lastMessageAt && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {formatTimeAgo(new Date(conv.lastMessageAt))}
                </p>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery ? 'No conversations match your search' : 'No conversations yet'}
          </p>
        </div>
      )}

      {hasMore && (
        <div className="p-4 text-center">
          <button
            onClick={() => loadConversations(page + 1)}
            disabled={loading}
            className="text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Format time ago
 */
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}
