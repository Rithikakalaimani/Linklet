import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteUrl, downloadQRCode } from '../services/api';
import DeleteConfirmationModal from './DeleteConfirmationModal';

// SVG Icons as placeholders - replace with actual PNG files when available
const CopyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const DeleteIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const AnalysisIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const UrlActions = ({ shortCode, shortUrl, onDelete, showAnalytics = true }) => {
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shortUrl;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        // Fallback: show a temporary message
        const fallbackCopied = true;
        setCopied(fallbackCopied);
        setTimeout(() => setCopied(false), 2000);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleDownloadQR = async () => {
    setDownloading(true);
    try {
      await downloadQRCode(shortCode);
    } catch (error) {
      // Silently fail - user can try again
      console.error('Failed to download QR code:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteUrl(shortCode);
      setShowDeleteModal(false);
      if (onDelete) {
        onDelete(shortCode);
      } else {
        window.location.reload();
      }
    } catch (error) {
      setDeleteError(error.response?.data?.error || 'Failed to delete URL. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteError(null);
  };

  return (
    <div className='flex items-center flex-wrap gap-2 sm:gap-3'>
      <button
        onClick={handleCopy}
        className={`p-2 rounded-lg transition-colors flex items-center justify-center border ${
          copied
            ? "bg-green-900/30 border-green-800 hover:bg-green-900/40"
            : "bg-gray-800 border-gray-700 hover:bg-gray-700"
        }`}
        title={copied ? "Copied!" : "Copy URL"}
      >
        <CopyIcon />
      </button>

      <button
        onClick={handleDownloadQR}
        disabled={downloading}
        className='p-2 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-colors flex items-center justify-center disabled:opacity-50 text-gray-300'
        title='Download QR Code'
      >
        <DownloadIcon />
      </button>

      {showAnalytics && (
        <Link
          to={`/analytics/${shortCode}`}
          className='p-2 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-colors flex items-center justify-center text-gray-300'
          title='View Analytics'
        >
          <AnalysisIcon />
        </Link>
      )}

      <button
        onClick={handleDeleteClick}
        disabled={deleting}
        className='p-2 rounded-lg bg-red-900/20 border border-red-800 hover:bg-red-900/30 transition-colors flex items-center justify-center disabled:opacity-50 text-red-300'
        title='Delete URL'
      >
        <DeleteIcon />
      </button>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        shortCode={shortCode}
        shortUrl={shortUrl}
        isLoading={deleting}
        error={deleteError}
      />
    </div>
  );
};

export default UrlActions;
