import React, { useState } from 'react';
import { shortenUrl } from '../services/api';
import UrlResult from '../components/UrlResult';
import { getQRCodeUrl } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresInDays, setExpiresInDays] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const data = await shortenUrl(
        originalUrl,
        customAlias || null,
        expiresInDays ? parseInt(expiresInDays) : null
      );
      setResult(data.data);
      setOriginalUrl('');
      setCustomAlias('');
      setExpiresInDays('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to shorten URL. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
          Shorten Your URLs
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-gray-300">
          Create short, memorable links that are easy to share
        </p>
        {user && (
          <p className="text-xs sm:text-sm text-gray-400 mt-2">
            Welcome, {user.user_metadata?.full_name || user.email}!
          </p>
        )}
      </div>

      <div className="bg-gray-900 rounded-lg shadow-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-gray-800">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-2">
              Enter URL to Shorten
            </label>
            <input
              type="url"
              id="url"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              placeholder="https://example.com/very/long/url"
              required
              className="w-full px-4 py-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-gray-800 text-gray-100 placeholder-gray-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="alias" className="block text-sm font-medium text-gray-300 mb-2">
                Custom Alias (Optional)
              </label>
              <input
                type="text"
                id="alias"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
                placeholder="my-custom-link"
                pattern="[a-zA-Z0-9-]{3,20}"
                className="w-full px-4 py-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-gray-800 text-gray-100 placeholder-gray-400"
              />
              <p className="mt-1 text-xs text-gray-400">3-20 characters, letters, numbers, and hyphens only</p>
            </div>

            <div>
              <label htmlFor="expires" className="block text-sm font-medium text-gray-300 mb-2">
                Expires In (Days, Optional)
              </label>
              <input
                type="number"
                id="expires"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(e.target.value)}
                placeholder="30"
                min="1"
                className="w-full px-4 py-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-gray-800 text-gray-100 placeholder-gray-400"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-800 text-red-300 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full border-2 border-primary-500 text-primary-400 bg-transparent py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base font-semibold hover:bg-primary-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-primary-400 transition-colors"
          >
            {loading ? 'Shortening...' : 'Shorten URL'}
          </button>
        </form>
      </div>

      {result && (
        <UrlResult
          shortCode={result.shortCode}
          shortUrl={result.shortUrl}
          originalUrl={result.originalUrl}
          expiresAt={result.expiresAt}
          qrCodeUrl={getQRCodeUrl(result.shortCode)}
        />
      )}
    </div>
  );
};

export default Home;
