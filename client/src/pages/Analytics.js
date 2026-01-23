import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAnalytics, getQRCodeUrl, downloadQRCode } from '../services/api';
import UrlActions from '../components/UrlActions';
import VisitsChart from '../components/VisitsChart';
import AnalyticsPieChart from '../components/AnalyticsPieChart';
import LocationMap from '../components/LocationMap';
import { parseUserAgent } from '../utils/userAgentParser';
import clickIcon from '../icons/click.png';
import visitorIcon from '../icons/visitor.png';
import createdIcon from '../icons/created.png';
import lastIcon from '../icons/last.png';

// Download icon - using SVG placeholder until PNG is available
const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const Analytics = () => {
  const { shortCode } = useParams();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrLoading, setQrLoading] = useState(true);
  const [qrError, setQrError] = useState(false);
  
  const baseUrl = process.env.REACT_APP_BASE_URL || (process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:5000');
  const shortUrl = `${baseUrl}/${shortCode}`;

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await getAnalytics(shortCode);
        setAnalytics(data.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [shortCode]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
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
  const clicksByBrowser = analytics.clicksByBrowser || {};
  const clicksByOS = analytics.clicksByOS || {};
  const clicksByDevice = analytics.clicksByDevice || {};
  const clicksByCountry = analytics.clicksByCountry || {};
  const recentClicks = analytics.clicks?.slice(-3).reverse() || [];
  const visitsAndVisitorsByDay = analytics.visitsAndVisitorsByDay || {};
  const uniqueVisitors = analytics.uniqueVisitors || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-2">Analytics Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-400">Short Code: <span className="font-mono font-semibold text-gray-200 break-all">{analytics.shortCode}</span></p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-gray-900 rounded-lg shadow-lg p-4 sm:p-6 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-400">Total Clicks</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-100">{analytics.clickCount}</p>
            </div>
            <img 
              src={clickIcon}
              alt="Clicks" 
              className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
            />
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg shadow-lg p-4 sm:p-6 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-400">Unique Visitors</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-100">{uniqueVisitors}</p>
            </div>
            <img 
              src={visitorIcon}
              alt="Visitors" 
              className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
            />
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg shadow-lg p-4 sm:p-6 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-400">Created</p>
              <p className="text-base sm:text-lg font-semibold text-gray-100">
                {new Date(analytics.createdAt).toLocaleDateString()}
              </p>
            </div>
            <img 
              src={createdIcon}
              alt="Created" 
              className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
            />
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg shadow-lg p-4 sm:p-6 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-400">Last Accessed</p>
              <p className="text-base sm:text-lg font-semibold text-gray-100">
                {analytics.lastAccessed
                  ? new Date(analytics.lastAccessed).toLocaleString()
                  : 'Never'}
              </p>
            </div>
            <img 
              src={lastIcon}
              alt="Last Accessed" 
              className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
            />
          </div>
        </div>
      </div>

      {/* Visits and Visitors Chart */}
      <div className="bg-gray-900 rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-800">
        <h2 className="text-lg sm:text-xl font-bold text-gray-100 mb-4 sm:mb-6">Visits & Visitors Analysis</h2>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="px-4 sm:px-0">
            <VisitsChart visitsAndVisitorsByDay={visitsAndVisitorsByDay} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-gray-900 rounded-lg shadow-lg p-4 sm:p-6 border border-gray-800">
          <h2 className="text-lg sm:text-xl font-bold text-gray-100 mb-3 sm:mb-4">Clicks by Day</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {Object.keys(clicksByDay).length > 0 ? (
              Object.entries(clicksByDay)
                .sort((a, b) => new Date(b[0]) - new Date(a[0]))
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="h-full">
          <AnalyticsPieChart 
            data={clicksByBrowser} 
            title="Clicks by Browser" 
          />
        </div>

        <div className="h-full">
          <AnalyticsPieChart 
            data={clicksByOS} 
            title="Clicks by OS" 
          />
        </div>

        <div className="h-full md:col-span-2 lg:col-span-1">
          <AnalyticsPieChart 
            data={clicksByDevice} 
            title="Clicks by Device" 
          />
        </div>
      </div>

      {/* Location Map */}
      <div className="bg-gray-900 rounded-lg shadow-lg p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 lg:mb-8 border border-gray-800">
        <div className="h-[200px] sm:h-[300px] md:h-[350px] lg:h-[400px] xl:h-[500px]">
          <LocationMap data={clicksByCountry} />
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-800">
        <h2 className="text-lg sm:text-xl font-bold text-gray-100 mb-3 sm:mb-4">Recent Clicks</h2>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle sm:px-0">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase">Timestamp</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase hidden md:table-cell">Browser</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase hidden lg:table-cell">OS</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase">Device</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase hidden xl:table-cell">Location</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase hidden lg:table-cell">Referer</th>
                  </tr>
                </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-800">
              {recentClicks.length > 0 ? (
                recentClicks.map((click, index) => {
                  // Parse user agent if browser/os/device not already parsed (backward compatibility)
                  const parsed = click.browser && click.os && click.device 
                    ? { browser: click.browser, os: click.os, device: click.device }
                    : parseUserAgent(click.userAgent);
                  
                  return (
                    <tr key={index} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-100">
                        {new Date(click.timestamp).toLocaleString()}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-400 hidden md:table-cell">
                        {parsed.browser}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-400 hidden lg:table-cell">
                        {parsed.os}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-400">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          parsed.device === 'Mobile' ? 'bg-blue-900/30 text-blue-300 border border-blue-800' :
                          parsed.device === 'Tablet' ? 'bg-purple-900/30 text-purple-300 border border-purple-800' :
                          'bg-gray-800 text-gray-300 border border-gray-700'
                        }`}>
                          {parsed.device}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-400 hidden xl:table-cell">
                        {click.country ? `${click.region || ''}, ${click.country}` : 'Unknown'}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-400 hidden lg:table-cell">
                        {click.referer === 'direct' ? '🔗 Direct' : click.referer || 'direct'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500 text-sm">
                    No clicks recorded yet
                  </td>
                </tr>
              )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-800">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-100">QR Code</h2>
          <button
            onClick={async () => {
              try {
                await downloadQRCode(shortCode);
              } catch (error) {
                alert('Failed to download QR code. Please try again.');
              }
            }}
            className="p-2 rounded-lg bg-primary-600 hover:bg-primary-500 border border-primary-500 transition-colors flex items-center justify-center text-white"
            title="Download QR Code"
          >
            <DownloadIcon />
          </button>
        </div>
        <div className="text-center">
          {qrLoading && !qrError && (
            <div className="w-64 h-64 mx-auto mb-4 flex items-center justify-center border-2 border-gray-700 rounded-lg bg-gray-800">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          )}
          {qrError && (
            <div className="w-64 h-64 mx-auto mb-4 flex items-center justify-center border-2 border-red-800 rounded-lg bg-red-900/20">
              <p className="text-sm text-red-300">Failed to load QR code</p>
            </div>
          )}
          <img
            src={getQRCodeUrl(shortCode)}
            alt="QR Code"
            className={`mx-auto mb-4 w-64 h-64 object-contain border-2 border-gray-700 rounded-lg bg-white p-4 ${qrLoading || qrError ? 'hidden' : ''}`}
            onLoad={() => {
              setQrLoading(false);
              setQrError(false);
            }}
            onError={() => {
              setQrLoading(false);
              setQrError(true);
            }}
          />
          {!qrError && (
            <p className="text-sm text-gray-400">Scan to open the shortened URL</p>
          )}
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg shadow-lg p-4 sm:p-6 border border-gray-800">
        <h2 className="text-lg sm:text-xl font-bold text-gray-100 mb-3 sm:mb-4">Quick Actions</h2>
        <UrlActions 
          shortCode={shortCode} 
          shortUrl={shortUrl}
          onDelete={() => navigate('/dashboard')}
        />
      </div>
    </div>
  );
};

export default Analytics;
