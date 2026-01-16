import React, { useState, useEffect, useRef } from 'react';
import { messagingService } from '../services/messaging';
import { type Message, type TransactionHistoryItem } from '../services/messaging';
import { TransactionHistory } from './TransactionHistory';

interface MessageThreadProps {
  conversationId: string;
  onClose: () => void;
  onConversationUpdate: () => void;
}

/**
 * MessageThread Component
 * Displays message thread and handles sending messages
 */
export const MessageThread: React.FC<MessageThreadProps> = ({
  conversationId,
  onClose,
  onConversationUpdate,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [transactionHistory, setTransactionHistory] = useState<TransactionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);
  const [otherParticipant, setOtherParticipant] = useState<string>('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessageThread();
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessageThread = async () => {
    try {
      setLoading(true);
      const response = await messagingService.getMessageThread(conversationId, 1, 50);
      setMessages(response.messages);
      setTransactionHistory(response.transactionHistory);
      setOtherParticipant(response.conversation.otherParticipant.address);
    } catch (error) {
      console.error('Failed to load message thread:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim()) return;

    try {
      setSending(true);

      if (editingMessageId) {
        await messagingService.updateMessage(editingMessageId, messageContent);
        setEditingMessageId(null);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === editingMessageId
              ? { ...m, content: messageContent, isEdited: true }
              : m
          )
        );
      } else {
        const newMessage = await messagingService.sendMessage({
          conversationId,
          recipientAddress: otherParticipant,
          content: messageContent,
        });
        setMessages((prev) => [...prev, newMessage]);
      }

      setMessageContent('');
      onConversationUpdate();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm('Delete this message?')) return;

    try {
      await messagingService.deleteMessage(messageId);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const handleBlockUser = async () => {
    if (!window.confirm('Block this user?')) return;

    try {
      await messagingService.blockUser(otherParticipant);
      alert('User blocked');
      onClose();
    } catch (error) {
      console.error('Failed to block user:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {otherParticipant.slice(0, 6)}...{otherParticipant.slice(-4)}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTransactionHistory(!showTransactionHistory)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            title="Transaction history"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
          <button
            onClick={handleBlockUser}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600"
            title="Block user"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 0H9m3 0h3m-3 0V9m3 0V7a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 7a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        ) : messages.length > 0 ? (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwnMessage={false}
              onEdit={() => {
                setEditingMessageId(message.id);
                setMessageContent(message.content);
              }}
              onDelete={() => handleDeleteMessage(message.id)}
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600 dark:text-gray-400">No messages yet. Start the conversation!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Transaction History */}
      {showTransactionHistory && transactionHistory.length > 0 && (
        <TransactionHistory transactions={transactionHistory} />
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {editingMessageId && (
          <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded flex items-center justify-between">
            <span className="text-sm text-blue-700 dark:text-blue-300">Editing message</span>
            <button
              onClick={() => {
                setEditingMessageId(null);
                setMessageContent('');
              }}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Cancel
            </button>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            placeholder="Type a message..."
            maxLength={5000}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!messageContent.trim() || sending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? '...' : editingMessageId ? 'Update' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

/**
 * MessageBubble Component
 */
interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  onEdit,
  onDelete,
}) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isOwnMessage
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none'
        }`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <p className="break-words">{message.content}</p>
        <div className="flex items-center justify-between gap-2 mt-1">
          <span className="text-xs opacity-70">
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
            {message.isEdited && ' (edited)'}
          </span>
          {showActions && isOwnMessage && (
            <div className="flex gap-1">
              <button
                onClick={onEdit}
                className="text-xs hover:opacity-70"
                title="Edit"
              >
                ✏️
              </button>
              <button
                onClick={onDelete}
                className="text-xs hover:opacity-70"
                title="Delete"
              >
                🗑️
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
