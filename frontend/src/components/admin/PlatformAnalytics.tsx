import React from 'react';
import { useAdminStats } from '../hooks/useAdmin';

export const PlatformAnalytics: React.FC = () => {
  const { stats, loading } = useAdminStats();

  if (loading || !stats) {
    return <div className="p-4">Loading analytics...</div>;
  }

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'bg-blue-100' },
    { label: 'Banned Users', value: stats.bannedUsers, icon: '🚫', color: 'bg-red-100' },
    { label: 'Suspended Users', value: stats.suspendedUsers, icon: '⏸', color: 'bg-yellow-100' },
    { label: 'Pending Moderation', value: stats.moderationCases, icon: '🚨', color: 'bg-orange-100' },
    { label: 'Total Admin Actions', value: stats.totalAdminActions, icon: '📋', color: 'bg-purple-100' },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">📊 Platform Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className={`${card.color} rounded-lg p-4 border`}>
            <div className="text-2xl mb-2">{card.icon}</div>
            <p className="text-xs text-gray-600 mb-1">{card.label}</p>
            <p className="text-2xl font-bold">{card.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border p-4 mt-4">
        <h3 className="font-bold mb-3">Quick Insights</h3>
        <div className="space-y-2 text-sm">
          <p className="text-gray-600">
            <span className="font-medium">Ban Rate:</span> {((stats.bannedUsers / stats.totalUsers) * 100).toFixed(2)}% of users
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Suspension Rate:</span> {((stats.suspendedUsers / stats.totalUsers) * 100).toFixed(2)}% of users
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Moderation Queue:</span> {stats.moderationCases} cases pending review
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlatformAnalytics;
scm-history-item:/home/web3joker/Documents/SAMAD%20V2/BitArt%20Market?%7B%22repositoryId%22%3A%22scm0%22%2C%22historyItemId%22%3A%2297f0c1ae6689bcb5e8d2c74f62e95cb66f5d51c5%22%2C%22historyItemParentId%22%3A%22761eb9bd50ab10ab7e5b1d3f5fc964d8e9a28b4e%22%2C%22historyItemDisplayId%22%3A%2297f0c1a%22%7D