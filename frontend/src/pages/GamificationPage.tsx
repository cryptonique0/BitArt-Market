import React from 'react';
import GamificationDashboard from '../components/gamification/GamificationDashboard';

const GamificationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-wide text-blue-600 dark:text-blue-400 font-semibold">Engagement</p>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mt-2">Gamification Center</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
            Achievements, badges, XP, daily rewards, and lucky draws to keep collectors engaged.
          </p>
        </div>
        <GamificationDashboard />
      </div>
    </div>
  );
};

export default GamificationPage;
