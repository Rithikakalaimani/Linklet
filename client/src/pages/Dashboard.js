import React, { useState, useEffect } from 'react';
import { getDashboardAnalytics } from '../services/api';
import UrlActions from '../components/UrlActions';
import urlIcon from '../icons/url.png';
import clickIcon from '../icons/click.png';
import activeIcon from '../icons/active.png';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleDelete = (shortCode) => {
    // Remove from local state
    if (analytics) {
      setAnalytics({
        ...analytics,
        recentUrls: analytics.recentUrls.filter(url => url.shortCode !== shortCode),
        topUrls: analytics.topUrls.filter(url => url.shortCode !== shortCode),
        totalUrls: analytics.totalUrls - 1,
      });
    }
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await getDashboardAnalytics();
        setAnalytics(data.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load dashboard analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const clicksByDay = analytics.clicksByDay || {};
  const clicksByReferer = analytics.clicksByReferer || {};
  const baseUrl = process.env.REACT_APP_BASE_URL || (process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:5000');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-2">Analytics Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-400">Overview of all your shortened URLs</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total URLs</p>
              <p className="text-3xl font-bold text-gray-100">{analytics.totalUrls}</p>
            </div>
            <img 
              src={urlIcon}
              alt="Total URLs" 
              className="h-12 w-12 object-contain"
            />
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Clicks</p>
              <p className="text-3xl font-bold text-gray-100">{analytics.totalClicks}</p>
            </div>
            <img 
              src={clickIcon}
              alt="Total Clicks" 
              className="h-12 w-12 object-contain"
            />
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active URLs</p>
              <p className="text-3xl font-bold text-gray-100">{analytics.recentUrls?.length || 0}</p>
            </div>
            <img 
              src={activeIcon}
              alt="Active URLs" 
              className="h-12 w-12 object-contain"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Clicks by Day */}
        <div className="bg-gray-900 rounded-lg shadow-lg p-4 sm:p-6 border border-gray-800">
          <h2 className="text-lg sm:text-xl font-bold text-gray-100 mb-3 sm:mb-4">Clicks by Day</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {Object.keys(clicksByDay).length > 0 ? (
              Object.entries(clicksByDay)
                .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                .slice(0, 30)
                .map(([day, count]) => (
                  <div key={day} className="flex items-center justify-between py-2 border-b border-gray-800">
                    <span className="text-sm text-gray-400">{day}</span>
                    <span className="font-semibold text-gray-100">{count}</span>
                  </div>
                ))
            ) : (
              <p className="text-gray-500 text-sm">No clicks yet</p>
            )}
          </div>
        </div>

        {/* Clicks by Referer */}
        <div className="bg-gray-900 rounded-lg shadow-lg p-4 sm:p-6 border border-gray-800">
          <h2 className="text-lg sm:text-xl font-bold text-gray-100 mb-3 sm:mb-4">Clicks by Referer</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {Object.keys(clicksByReferer).length > 0 ? (
              Object.entries(clicksByReferer)
                .sort((a, b) => b[1] - a[1])
                .map(([referer, count]) => (
                  <div key={referer} className="flex items-center justify-between py-2 border-b border-gray-800">
                    <span className="text-sm text-gray-400 truncate flex-1 mr-2">
                      {referer === 'direct' ? '🔗 Direct' : referer}
                    </span>
                    <span className="font-semibold text-gray-100">{count}</span>
                  </div>
                ))
            ) : (
              <p className="text-gray-500 text-sm">No referer data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Performing URLs */}
      <div className="bg-gray-900 rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-800">
        <h2 className="text-lg sm:text-xl font-bold text-gray-100 mb-3 sm:mb-4">Top Performing URLs</h2>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle sm:px-0">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase">Short Code</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase hidden md:table-cell">Original URL</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase">Clicks</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase hidden lg:table-cell">Created</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase hidden xl:table-cell">Last Accessed</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-800">
                  {analytics.topUrls && analytics.topUrls.length > 0 ? (
                    analytics.topUrls.map((url) => (
                      <tr key={url.shortCode} className="hover:bg-gray-800/50 transition-colors">
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-mono text-gray-100 break-all">
                          {url.shortCode}
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-400 truncate max-w-xs hidden md:table-cell">
                          {url.originalUrl}
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-gray-100">
                          {url.clickCount}
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-400 hidden lg:table-cell">
                          {new Date(url.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-400 hidden xl:table-cell">
                          {url.lastAccessed
                            ? new Date(url.lastAccessed).toLocaleString()
                            : 'Never'}
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                          <UrlActions 
                            shortCode={url.shortCode} 
                            shortUrl={`${baseUrl}/${url.shortCode}`}
                            onDelete={handleDelete}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-gray-500 text-sm">
                        No URLs found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Recent URLs */}
      <div className="bg-gray-900 rounded-lg shadow-lg p-4 sm:p-6 border border-gray-800">
        <h2 className="text-lg sm:text-xl font-bold text-gray-100 mb-3 sm:mb-4">Recent URLs</h2>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle sm:px-0">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase">Short Code</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase hidden md:table-cell">Original URL</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase">Clicks</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase hidden lg:table-cell">Created</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-800">
                  {analytics.recentUrls && analytics.recentUrls.length > 0 ? (
                    analytics.recentUrls.slice(0, 20).map((url) => (
                      <tr key={url.shortCode} className="hover:bg-gray-800/50 transition-colors">
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-mono text-gray-100 break-all">
                          <a
                            href={`${baseUrl}/${url.shortCode}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-400 hover:text-primary-300 hover:underline"
                          >
                            {url.shortCode}
                          </a>
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-400 truncate max-w-xs hidden md:table-cell">
                          {url.originalUrl}
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-gray-100">
                          {url.clickCount}
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-400 hidden lg:table-cell">
                          {new Date(url.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                          <UrlActions 
                            shortCode={url.shortCode} 
                            shortUrl={`${baseUrl}/${url.shortCode}`}
                            onDelete={handleDelete}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-gray-500 text-sm">
                        No URLs found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
