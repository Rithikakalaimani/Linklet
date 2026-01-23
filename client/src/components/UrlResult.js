import React, { useState } from 'react';
import { downloadQRCode } from '../services/api';
import UrlActions from './UrlActions';

const UrlResult = ({ shortCode, shortUrl, originalUrl, expiresAt, qrCodeUrl }) => {
  const [showQR, setShowQR] = useState(false);
  const [qrLoading, setQrLoading] = useState(true);
  const [qrError, setQrError] = useState(false);
  const [downloading, setDownloading] = useState(false);

  return (
    <div className="bg-gray-900 rounded-lg shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-800">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-100 mb-4 sm:mb-6">Your Short URL is Ready!</h2>
      
      <div className="space-y-3 sm:space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Short URL</label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={shortUrl}
              readOnly
              className="flex-1 px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 font-mono text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Original URL</label>
          <p className="px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-sm text-gray-400 break-all">
            {originalUrl}
          </p>
        </div>

        {expiresAt && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Expires At</label>
            <p className="px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-sm text-gray-400">
              {new Date(expiresAt).toLocaleString()}
            </p>
          </div>
        )}

        <div className="pt-3 sm:pt-4">
          <div className="flex flex-wrap gap-3 sm:gap-4 mb-3 sm:mb-4">
            <button
              onClick={() => setShowQR(!showQR)}
              className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-gray-800 text-gray-200 rounded-lg font-semibold hover:bg-gray-700 transition-colors border border-gray-700"
            >
              {showQR ? 'Hide QR Code' : 'Show QR Code'}
            </button>
            {showQR && (
              <button
                onClick={async () => {
                  setDownloading(true);
                  try {
                    await downloadQRCode(shortCode);
                  } catch (error) {
                    // Silently fail - user can try again
                    console.error('Failed to download QR code:', error);
                  } finally {
                    setDownloading(false);
                  }
                }}
                disabled={downloading}
                className="p-2 rounded-lg bg-primary-600 hover:bg-primary-500 border border-primary-500 transition-colors disabled:opacity-50 flex items-center justify-center text-white"
                title="Download QR Code"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            )}
          </div>
          <UrlActions 
            shortCode={shortCode} 
            shortUrl={shortUrl}
            onDelete={() => window.location.href = '/'}
          />
        </div>

        {showQR && (
          <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-gray-800 rounded-lg text-center border border-gray-700">
            {qrLoading && !qrError && (
              <div className="w-48 h-48 sm:w-64 sm:h-64 mx-auto mb-4 flex items-center justify-center border-2 border-gray-700 rounded-lg bg-gray-900">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
            )}
            {qrError && (
              <div className="w-48 h-48 sm:w-64 sm:h-64 mx-auto mb-4 flex items-center justify-center border-2 border-red-800 rounded-lg bg-red-900/20">
                <p className="text-xs sm:text-sm text-red-300 px-4">Failed to load QR code</p>
              </div>
            )}
            <img
              src={qrCodeUrl}
              alt="QR Code"
              className={`mx-auto mb-4 w-48 h-48 sm:w-64 sm:h-64 object-contain border-2 border-gray-700 rounded-lg bg-white p-2 sm:p-4 ${qrLoading || qrError ? 'hidden' : ''}`}
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
              <p className="text-xs sm:text-sm text-gray-400 mt-2">Scan to open the shortened URL</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UrlResult;
