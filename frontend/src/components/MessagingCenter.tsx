import React, { useState, useEffect } from 'react';
import { ConversationList } from './ConversationList';
import { MessageThread } from './MessageThread';
import { type ConversationSummary } from '../../services/messaging';

/**
 * MessagingCenter Component
 * Main container for user messaging interface
 */
export const MessagingCenter: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      // Conversations will be loaded by ConversationList component
    } finally {
      setLoading(false);
    }
  };

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversation(conversationId);
  };

  const handleConversationClose = () => {
    setSelectedConversation(null);
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* Conversations List */}
      <div
        className={`w-full md:w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col ${
          selectedConversation ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Messages</h2>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <ConversationList
          onSelectConversation={handleConversationSelect}
          selectedConversationId={selectedConversation}
          searchQuery={searchQuery}
          onUnreadCountChange={setUnreadCount}
        />
      </div>

      {/* Message Thread */}
      {selectedConversation && (
        <div className="flex-1 flex flex-col">
          <MessageThread
            conversationId={selectedConversation}
            onClose={handleConversationClose}
            onConversationUpdate={loadConversations}
          />
        </div>
      )}

      {/* Empty State */}
      {!selectedConversation && (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50 dark:bg-gray-800">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
              No conversation selected
            </h3>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Select a conversation to start messaging
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingCenter;
