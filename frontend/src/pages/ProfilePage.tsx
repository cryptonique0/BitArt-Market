import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { userService } from '../services/api';
import { UserProfile, NFT } from '../types';

export const ProfilePage: React.FC = () => {
  const { address } = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('owned');

  useEffect(() => {
    const fetchData = async () => {
      if (!address) return;

      try {
        setLoading(true);
        const profileData = await userService.getProfile(address);
        setProfile(profileData);

        const nftsData = await userService.getNFTs(address);
        setNfts(nftsData.nfts);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [address]);

  if (loading) {
    return <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4 animate-pulse" />;
  }

  if (!profile) {
    return <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4">Profile not found</div>;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Banner */}
      <div className="h-48 bg-gradient-to-r from-purple-500 to-pink-500" />

      {/* Profile */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8 -mt-24 mb-12">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-white dark:border-gray-900">
              {address?.substring(0, 2).toUpperCase()}
            </div>
          </div>

          {/* Info */}
          <div className="pt-8 flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {profile.address}
            </h1>
            {profile.verified && (
              <span className="inline-block mt-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-semibold">
                ✓ Verified
              </span>
            )}
            {profile.bio && (
              <p className="text-gray-600 dark:text-gray-400 mt-4">{profile.bio}</p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mt-8">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.stats.nftsOwned}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">NFTs Owned</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.stats.nftsCreated}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.stats.totalSales}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sales</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.stats.followers}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Followers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('owned')}
              className={`py-4 font-semibold border-b-2 transition-colors ${
                activeTab === 'owned'
                  ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Owned NFTs
            </button>
            <button
              onClick={() => setActiveTab('created')}
              className={`py-4 font-semibold border-b-2 transition-colors ${
                activeTab === 'created'
                  ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Created
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-4 font-semibold border-b-2 transition-colors ${
                activeTab === 'activity'
                  ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Activity
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="pb-12">
          {activeTab === 'owned' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {nfts.length === 0 ? (
                <p className="col-span-full text-gray-600 dark:text-gray-400">
                  No NFTs owned yet
                </p>
              ) : (
                nfts.map((nft) => (
                  <div
                    key={nft.id}
                    className="rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow hover:shadow-lg transition-shadow"
                  >
                    <div className="h-40 bg-gray-200 dark:bg-gray-700">
                      <img
                        src={nft.image}
                        alt={nft.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {nft.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {nft.category}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'created' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {nfts.filter((nft) => nft.creator === address).length === 0 ? (
                <p className="col-span-full text-gray-600 dark:text-gray-400">
                  No NFTs created yet
                </p>
              ) : (
                nfts
                  .filter((nft) => nft.creator === address)
                  .map((nft) => (
                    <div
                      key={nft.id}
                      className="rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow"
                    >
                      <div className="h-40 bg-gray-200 dark:bg-gray-700">
                        <img
                          src={nft.image}
                          alt={nft.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {nft.name}
                        </h3>
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <p className="text-gray-600 dark:text-gray-400">
              Activity history coming soon
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
