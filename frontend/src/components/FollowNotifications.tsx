import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, X } from 'lucide-react';

interface FollowNotification {
  id: string;
  type: 'follow' | 'nft_drop' | 'new_collection';
  actorId: string;
  actorUsername: string;
  title: string;
  message: string;
  nftId?: string;
  createdAt: Date;
  read: boolean;
  actionUrl?: string;
}

interface FollowNotificationsProps {
  userId: string;
  limit?: number;
  onNotificationClick?: (notification: FollowNotification) => void;
}

const FollowNotifications: React.FC<FollowNotificationsProps> = ({
  userId,
  limit = 10,
  onNotificationClick,
}) => {
  const [notifications, setNotifications] = useState<FollowNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`/api/follows/notifications/${userId}?limit=${limit}`);
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications);
          setUnreadCount(data.notifications.filter((n: FollowNotification) => !n.read).length);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId, limit]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/follows/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
      setNotifications(
        notifications.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDismiss = (notificationId: string) => {
    setNotifications(notifications.filter(n => n.id !== notificationId));
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'follow':
        return 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500';
      case 'nft_drop':
        return 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500';
      case 'new_collection':
        return 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-l-4 border-gray-500';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow':
        return '👤';
      case 'nft_drop':
        return '🎨';
      case 'new_collection':
        return '📦';
      default:
        return '📬';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin">⏳</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell size={20} className="text-blue-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Notifications{' '}
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full ml-2">
                {unreadCount}
              </span>
            )}
          </h3>
        </div>
      </div>

      {notifications.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">No notifications yet</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {notifications.map(notification => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`p-3 rounded-lg cursor-pointer transition-all ${getNotificationColor(notification.type)} ${
                !notification.read ? 'shadow-md' : 'opacity-75'
              }`}
              onClick={() => {
                onNotificationClick?.(notification);
                handleMarkAsRead(notification.id);
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1">
                  <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleDismiss(notification.id);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              {notification.actionUrl && (
                <a
                  href={notification.actionUrl}
                  className="inline-block mt-2 text-xs bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded transition-colors"
                >
                  View
                </a>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FollowNotifications;
