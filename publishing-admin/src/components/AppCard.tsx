'use client';

import { APP_STATUS_COLORS, APP_STATUS_LABELS, AppMetadata, AppStatus, CATEGORY_LABELS, LANGUAGE_LABELS, PERMISSION_LABELS, PendingChange } from '@/types/app';
import { useState } from 'react';
import { AutomatedReviewPanel } from './AutomatedReviewPanel';

interface AppCardProps {
  app: AppMetadata;
  onApprove?: (appId: number) => void;
  onReject?: (appId: number, reason: string) => void;
  onApproveUpdate?: (appId: number) => void;
  onApproveRejected?: (appId: number) => void;
  onRevertToPending?: (appId: number) => void;
  hasPendingUpdate?: boolean;
  pendingChange?: PendingChange | null;
  isAdmin?: boolean;
  isProcessing?: boolean;
}

export function AppCard({
  app,
  onApprove,
  onReject,
  onApproveUpdate,
  onApproveRejected,
  onRevertToPending,
  hasPendingUpdate,
  pendingChange,
  isAdmin = false,
  isProcessing = false,
}: AppCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const statusColor = APP_STATUS_COLORS[app.status as AppStatus];
  const statusLabel = APP_STATUS_LABELS[app.status as AppStatus];

  const handleReject = () => {
    if (rejectReason.trim() && onReject && app.app_id !== undefined) {
      onReject(app.app_id, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-guild-green-500 dark:hover:border-guild-green-500 transition-colors">
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center">
                {/https:\/\/.+\.(png|jpg)$/i.test(app.icon) ? (
                  <img
                    src={app.icon}
                    alt={`${app.name} icon`}
                    className="w-10 h-10 rounded-md object-cover"
                  />
                ) : (
                  <div className="text-4xl">{app.icon}</div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {app.name}
                  </h3>
                  {app.verified && (
                    <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-md font-medium">
                      ✓ Verified
                    </span>
                  )}
                  {hasPendingUpdate && (
                    <span className="text-xs bg-oracle-orange-400 text-white px-2 py-0.5 rounded-md font-medium">
                      Update Pending
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  by {app.developer_name}
                </p>
              </div>
            </div>
            <div
              className="px-2.5 py-1 rounded-md text-xs font-semibold"
              style={{ backgroundColor: statusColor + '20', color: statusColor }}
            >
              {statusLabel}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            {app.description}
          </p>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {app.app_id !== undefined && (
              <div className="text-xs">
                <span className="text-gray-500 dark:text-gray-400">App ID:</span>
                <span className="ml-2 text-gray-900 dark:text-gray-100 font-mono font-bold">
                  #{app.app_id}
                </span>
              </div>
            )}
            <div className="text-xs">
              <span className="text-gray-500 dark:text-gray-400">Slug:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100 font-mono text-[10px]">
                {app.slug || 'N/A'}
              </span>
            </div>
            <div className="text-xs">
              <span className="text-gray-500 dark:text-gray-400">Category:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100 font-medium">
                {CATEGORY_LABELS[app.category] || app.category}
              </span>
            </div>
            <div className="text-xs">
              <span className="text-gray-500 dark:text-gray-400">Language:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100 font-medium">
                {LANGUAGE_LABELS[app.language] || app.language || 'All Languages'}
              </span>
            </div>
            <div className="text-xs">
              <span className="text-gray-500 dark:text-gray-400">Developer:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100 font-mono text-[10px]">
                {app.developer_address.slice(0, 8)}...
              </span>
            </div>
            <div className="text-xs">
              <span className="text-gray-500 dark:text-gray-400">Downloads:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100 font-medium">
                {app.downloads.toLocaleString()}
              </span>
            </div>
            <div className="text-xs">
              <span className="text-gray-500 dark:text-gray-400">Rating:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100 font-medium">
                {(app.rating / 10).toFixed(1)} ⭐
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
            {isAdmin && app.status === AppStatus.PENDING && app.app_id !== undefined ? (
              <button
                onClick={() => setShowDetails(true)}
                className="ml-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Review App →
              </button>
            ) : (
              <button
                onClick={() => setShowDetails(true)}
                className="text-sm text-guild-green-600 dark:text-guild-green-400 hover:text-guild-green-700 dark:hover:text-guild-green-300 font-medium"
              >
                View Details →
              </button>
            )}

            {isAdmin && app.status === AppStatus.REJECTED && app.app_id !== undefined && (
              <button
                onClick={() => onApproveRejected?.(app.app_id!)}
                disabled={isProcessing}
                className="ml-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Approve Anyway'}
              </button>
            )}

            {isAdmin && app.status === AppStatus.APPROVED && app.app_id !== undefined && (
              <button
                onClick={() => onRevertToPending?.(app.app_id!)}
                disabled={isProcessing}
                className="ml-auto px-4 py-2 bg-oracle-orange-500 hover:bg-oracle-orange-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Revert to Pending'}
              </button>
            )}

            {isAdmin && hasPendingUpdate && app.app_id !== undefined && (
              <button
                onClick={() => setShowDetails(true)}
                disabled={isProcessing}
                className="ml-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Review Update →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <AppDetailsModal
          app={app}
          pendingChange={pendingChange}
          hasPendingUpdate={hasPendingUpdate}
          onClose={() => setShowDetails(false)}
          isAdmin={isAdmin}
          isProcessing={isProcessing}
          onApprove={onApprove && app.app_id !== undefined ? () => onApprove(app.app_id!) : undefined}
          onApproveUpdate={onApproveUpdate && app.app_id !== undefined ? () => onApproveUpdate(app.app_id!) : undefined}
          onReject={onReject && app.app_id !== undefined ? (reason: string) => onReject(app.app_id!, reason) : undefined}
        />
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowRejectModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              Reject Application
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Please provide a reason for rejecting <strong>{app.name}</strong>:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Broken functionality, security concerns..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              rows={4}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject App
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AppDetailsModal({
  app,
  pendingChange,
  hasPendingUpdate,
  onClose,
  isAdmin,
  isProcessing,
  onApprove,
  onApproveUpdate,
  onReject,
}: {
  app: AppMetadata;
  pendingChange?: PendingChange | null;
  hasPendingUpdate?: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  isProcessing?: boolean;
  onApprove?: () => void;
  onApproveUpdate?: () => void;
  onReject?: (reason: string) => void;
}) {
  const [reviewCompleted, setReviewCompleted] = useState(false);
  const [checklistCompleted, setChecklistCompleted] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // For pending updates, review the NEW metadata; otherwise review the current app
  const isReviewingUpdate = hasPendingUpdate && pendingChange;
  const reviewApp = isReviewingUpdate ? pendingChange.new_metadata : app;

  const canApprove = reviewCompleted && checklistCompleted;
  const isImageIcon = /https?:\/\/.+\.(png|jpg|jpeg|gif|webp|svg)(\?.*)?$/i.test(reviewApp.icon);

  // Helper to check if a field changed (for update reviews)
  const hasChanged = (field: keyof AppMetadata) => {
    if (!isReviewingUpdate) return false;
    return JSON.stringify(app[field]) !== JSON.stringify(pendingChange.new_metadata[field]);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Update Review Banner */}
        {isReviewingUpdate && (
          <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-3 mb-4">
            <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">
              Reviewing Update Request
            </p>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              Showing the NEW version. Fields marked with <span className="text-orange-600 dark:text-orange-400 font-semibold">(Changed)</span> differ from the current live version.
            </p>
          </div>
        )}

        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Icon Thumbnail */}
            <div className="w-14 h-14 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 flex-shrink-0">
              {isImageIcon ? (
                <img
                  src={reviewApp.icon}
                  alt={`${reviewApp.name} icon`}
                  className="w-full h-full rounded-lg object-cover"
                  onError={(e) => {
                    // Fallback to emoji if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    if (target.parentElement) {
                      target.parentElement.innerHTML = `<div class="text-3xl">${reviewApp.icon}</div>`;
                    }
                  }}
                />
              ) : (
                <div className="text-3xl">{reviewApp.icon}</div>
              )}
              {hasChanged('icon') && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full" title="Changed" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {reviewApp.name}
                  {hasChanged('name') && <span className="text-orange-600 dark:text-orange-400 text-sm ml-2">(Changed)</span>}
                </h2>
                {app.verified && (
                  <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-md font-medium">
                    ✓ Verified
                  </span>
                )}
                {isReviewingUpdate && (
                  <span className="text-xs bg-oracle-orange-400 text-white px-2 py-0.5 rounded-md font-medium">
                    Update
                  </span>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {reviewApp.developer_name}
                {hasChanged('developer_name') && <span className="text-orange-600 dark:text-orange-400 text-xs ml-2">(Changed)</span>}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className="px-2.5 py-1 rounded-md text-xs font-semibold"
                  style={{
                    backgroundColor: APP_STATUS_COLORS[app.status as AppStatus] + '20',
                    color: APP_STATUS_COLORS[app.status as AppStatus],
                  }}
                >
                  {APP_STATUS_LABELS[app.status as AppStatus]}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {CATEGORY_LABELS[reviewApp.category] || reviewApp.category}
                  {hasChanged('category') && <span className="text-orange-600 dark:text-orange-400 ml-1">(Changed)</span>}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Description
              {hasChanged('description') && <span className="text-orange-600 dark:text-orange-400 ml-2">(Changed)</span>}
            </h3>
            <p className="text-gray-900 dark:text-gray-100 leading-relaxed">{reviewApp.description}</p>
          </div>

          {/* App URL */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              App URL
              {hasChanged('url') && <span className="text-orange-600 dark:text-orange-400 ml-2">(Changed)</span>}
            </h3>
            <a
              href={reviewApp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 break-all inline-flex items-center gap-1"
            >
              {reviewApp.url}
              <span className="text-xs">↗</span>
            </a>
          </div>

          {/* Automated Review - runs against the version being reviewed (new for updates) */}
          {(app.status === AppStatus.PENDING || isReviewingUpdate) && (
            <AutomatedReviewPanel
              app={reviewApp}
              onReviewComplete={() => setReviewCompleted(true)}
              onChecklistComplete={(complete) => setChecklistCompleted(complete)}
            />
          )}

          {/* Permissions */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Permissions ({reviewApp.permissions.length})
              {hasChanged('permissions') && <span className="text-orange-600 dark:text-orange-400 ml-2">(Changed)</span>}
            </h3>
            {reviewApp.permissions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {reviewApp.permissions.map((perm) => (
                  <span
                    key={perm}
                    className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-3 py-1.5 rounded-full font-medium border border-blue-200 dark:border-blue-800"
                  >
                    {PERMISSION_LABELS[perm] || perm}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">No permissions required</p>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4">
            {app.app_id !== undefined && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  App ID
                </h3>
                <code className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded font-mono font-bold text-gray-900 dark:text-gray-100">
                  #{app.app_id}
                </code>
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Slug
              </h3>
              <code className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded font-mono text-gray-900 dark:text-gray-100">
                {reviewApp.slug || 'N/A'}
              </code>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Category
                {hasChanged('category') && <span className="text-orange-600 dark:text-orange-400 ml-2">(Changed)</span>}
              </h3>
              <p className="text-gray-900 dark:text-gray-100 font-medium">
                {CATEGORY_LABELS[reviewApp.category] || reviewApp.category}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Language
                {hasChanged('language') && <span className="text-orange-600 dark:text-orange-400 ml-2">(Changed)</span>}
              </h3>
              <p className="text-gray-900 dark:text-gray-100 font-medium">
                {LANGUAGE_LABELS[reviewApp.language] || reviewApp.language || 'All Languages'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Status
              </h3>
              <span
                className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold"
                style={{
                  backgroundColor: APP_STATUS_COLORS[app.status as AppStatus] + '20',
                  color: APP_STATUS_COLORS[app.status as AppStatus],
                }}
              >
                {APP_STATUS_LABELS[app.status as AppStatus]}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Downloads
              </h3>
              <p className="text-gray-900 dark:text-gray-100 font-medium">
                {app.downloads.toLocaleString()}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Rating
              </h3>
              <p className="text-gray-900 dark:text-gray-100 font-medium">
                {(app.rating / 10).toFixed(1)} ⭐
              </p>
            </div>
          </div>

          {/* Developer Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Developer
            </h3>
            <div className="space-y-1">
              <p className="text-gray-900 dark:text-gray-100">
                <span className="font-medium">Name:</span> {app.developer_name}
              </p>
              <p className="text-gray-900 dark:text-gray-100">
                <span className="font-medium">Address:</span>{' '}
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">
                  {app.developer_address}
                </code>
              </p>
            </div>
          </div>

          {/* Timestamps */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Timestamps
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>
                <span className="font-medium">Submitted:</span>{' '}
                {new Date(app.submitted_at * 1000).toLocaleString()}
              </p>
              <p>
                <span className="font-medium">Updated:</span>{' '}
                {new Date(app.updated_at * 1000).toLocaleString()}
              </p>
              {app.approved_at > 0 && (
                <p>
                  <span className="font-medium">Approved:</span>{' '}
                  {new Date(app.approved_at * 1000).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Admin Actions for Pending Apps or Pending Updates */}
          {isAdmin && (app.status === AppStatus.PENDING || isReviewingUpdate) && (onApprove || onApproveUpdate) && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              {!canApprove && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    {!reviewCompleted && !checklistCompleted && (
                      <>Run automated checks and complete the manual review checklist before approving.</>
                    )}
                    {reviewCompleted && !checklistCompleted && (
                      <>Complete all required items in the manual review checklist before approving.</>
                    )}
                    {!reviewCompleted && checklistCompleted && (
                      <>Run automated checks before approving.</>
                    )}
                  </p>
                </div>
              )}

              {showRejectInput ? (
                <div className="space-y-3">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Reason for rejection..."
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowRejectInput(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (rejectReason.trim() && onReject) {
                          onReject(rejectReason);
                          onClose();
                        }
                      }}
                      disabled={!rejectReason.trim() || isProcessing || !onReject}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? 'Rejecting...' : 'Confirm Reject'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  {onReject && app.status === AppStatus.PENDING && (
                    <button
                      onClick={() => setShowRejectInput(true)}
                      disabled={isProcessing}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reject
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (isReviewingUpdate && onApproveUpdate) {
                        onApproveUpdate();
                      } else if (onApprove) {
                        onApprove();
                      }
                      onClose();
                    }}
                    disabled={!canApprove || isProcessing}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Approving...' : canApprove ? (isReviewingUpdate ? 'Approve Update' : 'Approve') : 'Complete Review to Approve'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

