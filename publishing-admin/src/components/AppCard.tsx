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
  const [showUpdateDetails, setShowUpdateDetails] = useState(false);
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
                onClick={() => onApproveUpdate?.(app.app_id!)}
                disabled={isProcessing}
                className="ml-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Approve Update'}
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
          onShowUpdateDetails={() => {
            setShowDetails(false);
            setShowUpdateDetails(true);
          }}
          isAdmin={isAdmin}
          isProcessing={isProcessing}
          onApprove={onApprove && app.app_id !== undefined ? () => onApprove(app.app_id!) : undefined}
          onReject={onReject && app.app_id !== undefined ? (reason: string) => onReject(app.app_id!, reason) : undefined}
        />
      )}

      {/* Update Details Modal */}
      {showUpdateDetails && pendingChange && (
        <UpdateDetailsModal
          currentApp={app}
          pendingChange={pendingChange}
          onClose={() => setShowUpdateDetails(false)}
          onApproveUpdate={app.app_id !== undefined && onApproveUpdate ? () => {
            setShowUpdateDetails(false);
            onApproveUpdate(app.app_id!);
          } : undefined}
          isProcessing={isProcessing}
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
  onShowUpdateDetails,
  isAdmin,
  isProcessing,
  onApprove,
  onReject,
}: {
  app: AppMetadata;
  pendingChange?: PendingChange | null;
  hasPendingUpdate?: boolean;
  onClose: () => void;
  onShowUpdateDetails?: () => void;
  isAdmin?: boolean;
  isProcessing?: boolean;
  onApprove?: () => void;
  onReject?: (reason: string) => void;
}) {
  const [reviewCompleted, setReviewCompleted] = useState(false);
  const [checklistCompleted, setChecklistCompleted] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const canApprove = reviewCompleted && checklistCompleted;
  const isImageIcon = /https?:\/\/.+\.(png|jpg|jpeg|gif|webp|svg)(\?.*)?$/i.test(app.icon);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Icon Thumbnail */}
            <div className="w-14 h-14 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 flex-shrink-0">
              {isImageIcon ? (
                <img
                  src={app.icon}
                  alt={`${app.name} icon`}
                  className="w-full h-full rounded-lg object-cover"
                  onError={(e) => {
                    // Fallback to emoji if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    if (target.parentElement) {
                      target.parentElement.innerHTML = `<div class="text-3xl">${app.icon}</div>`;
                    }
                  }}
                />
              ) : (
                <div className="text-3xl">{app.icon}</div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {app.name}
                </h2>
                {app.verified && (
                  <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-md font-medium">
                    ✓ Verified
                  </span>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{app.developer_name}</p>
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
                  {CATEGORY_LABELS[app.category] || app.category}
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
            </h3>
            <p className="text-gray-900 dark:text-gray-100 leading-relaxed">{app.description}</p>
          </div>

          {/* App URL */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              App URL
            </h3>
            <a
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 break-all inline-flex items-center gap-1"
            >
              {app.url}
              <span className="text-xs">↗</span>
            </a>
          </div>

          {/* Automated Review */}
          {app.status === AppStatus.PENDING && (
            <AutomatedReviewPanel
              app={app}
              onReviewComplete={() => setReviewCompleted(true)}
              onChecklistComplete={(complete) => setChecklistCompleted(complete)}
            />
          )}

          {/* Permissions */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Permissions ({app.permissions.length})
            </h3>
            {app.permissions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {app.permissions.map((perm) => (
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

          {/* Pending Update Notice */}
          {hasPendingUpdate && pendingChange && onShowUpdateDetails && (
            <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-orange-900 dark:text-orange-200 mb-1">
                    Update Pending
                  </h3>
                  <p className="text-xs text-orange-700 dark:text-orange-300 mb-3">
                    This app has a pending update request. Review the changes before approving.
                  </p>
                  <button
                    onClick={onShowUpdateDetails}
                    className="text-sm text-orange-700 dark:text-orange-300 hover:text-orange-900 dark:hover:text-orange-100 font-medium underline"
                  >
                    View Update Details →
                  </button>
                </div>
              </div>
            </div>
          )}

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
                {app.slug || 'N/A'}
              </code>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Category
              </h3>
              <p className="text-gray-900 dark:text-gray-100 font-medium">
                {CATEGORY_LABELS[app.category] || app.category}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Language
              </h3>
              <p className="text-gray-900 dark:text-gray-100 font-medium">
                {LANGUAGE_LABELS[app.language] || app.language || 'All Languages'}
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

          {/* Admin Actions for Pending Apps */}
          {isAdmin && app.status === AppStatus.PENDING && onApprove && onReject && (
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
                        if (rejectReason.trim()) {
                          onReject(rejectReason);
                          onClose();
                        }
                      }}
                      disabled={!rejectReason.trim() || isProcessing}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? 'Rejecting...' : 'Confirm Reject'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRejectInput(true)}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      onApprove();
                      onClose();
                    }}
                    disabled={!canApprove || isProcessing}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Approving...' : canApprove ? 'Approve' : 'Complete Review to Approve'}
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

function UpdateDetailsModal({
  currentApp,
  pendingChange,
  onClose,
  onApproveUpdate,
  isProcessing = false
}: {
  currentApp: AppMetadata;
  pendingChange: PendingChange;
  onClose: () => void;
  onApproveUpdate?: () => void;
  isProcessing?: boolean;
}) {
  const newMetadata = pendingChange.new_metadata;
  const isImageIcon = /https?:\/\/.+\.(png|jpg|jpeg|gif|webp|svg)(\?.*)?$/i.test(newMetadata.icon);

  // Helper to check if a field changed
  const hasChanged = (field: keyof AppMetadata) => {
    return JSON.stringify(currentApp[field]) !== JSON.stringify(newMetadata[field]);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-4xl w-full shadow-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Update Details
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Requested: {new Date(pendingChange.requested_at * 1000).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* New Icon Preview */}
          {hasChanged('icon') && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                New App Icon {hasChanged('icon') && <span className="text-orange-600 dark:text-orange-400">(Changed)</span>}
              </h3>
              <div className="w-32 h-32 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                {isImageIcon ? (
                  <img
                    src={newMetadata.icon}
                    alt={`${newMetadata.name} icon`}
                    className="w-full h-full rounded-lg object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      if (target.parentElement) {
                        target.parentElement.innerHTML = `<div class="text-6xl">${newMetadata.icon}</div>`;
                      }
                    }}
                  />
                ) : (
                  <div className="text-6xl">{newMetadata.icon}</div>
                )}
              </div>
            </div>
          )}

          {/* Name */}
          {hasChanged('name') && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Name <span className="text-orange-600 dark:text-orange-400">(Changed)</span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current</p>
                  <p className="text-gray-900 dark:text-gray-100">{currentApp.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">New</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{newMetadata.name}</p>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {hasChanged('description') && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Description <span className="text-orange-600 dark:text-orange-400">(Changed)</span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{currentApp.description}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">New</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">{newMetadata.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* URL */}
          {hasChanged('url') && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                App URL <span className="text-orange-600 dark:text-orange-400">(Changed)</span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current</p>
                  <a href={currentApp.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 break-all">
                    {currentApp.url}
                  </a>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">New</p>
                  <a href={newMetadata.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 break-all font-medium">
                    {newMetadata.url}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Permissions */}
          {hasChanged('permissions') && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Permissions <span className="text-orange-600 dark:text-orange-400">(Changed)</span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Current ({currentApp.permissions.length})</p>
                  {currentApp.permissions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {currentApp.permissions.map((perm) => (
                        <span
                          key={perm}
                          className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full"
                        >
                          {PERMISSION_LABELS[perm] || perm}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">No permissions</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">New ({newMetadata.permissions.length})</p>
                  {newMetadata.permissions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {newMetadata.permissions.map((perm) => (
                        <span
                          key={perm}
                          className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full font-medium"
                        >
                          {PERMISSION_LABELS[perm] || perm}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">No permissions</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Category */}
          {hasChanged('category') && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Category <span className="text-orange-600 dark:text-orange-400">(Changed)</span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current</p>
                  <p className="text-gray-900 dark:text-gray-100">{CATEGORY_LABELS[currentApp.category] || currentApp.category}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">New</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{CATEGORY_LABELS[newMetadata.category] || newMetadata.category}</p>
                </div>
              </div>
            </div>
          )}

          {/* Language */}
          {hasChanged('language') && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Language <span className="text-orange-600 dark:text-orange-400">(Changed)</span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current</p>
                  <p className="text-gray-900 dark:text-gray-100">{LANGUAGE_LABELS[currentApp.language] || currentApp.language || 'All Languages'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">New</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{LANGUAGE_LABELS[newMetadata.language] || newMetadata.language || 'All Languages'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Slug */}
          {hasChanged('slug') && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Slug <span className="text-orange-600 dark:text-orange-400">(Changed)</span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current</p>
                  <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">{currentApp.slug}</code>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">New</p>
                  <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono font-medium">{newMetadata.slug}</code>
                </div>
              </div>
            </div>
          )}

          {/* Developer Name */}
          {hasChanged('developer_name') && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Developer Name <span className="text-orange-600 dark:text-orange-400">(Changed)</span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current</p>
                  <p className="text-gray-900 dark:text-gray-100">{currentApp.developer_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">New</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{newMetadata.developer_name}</p>
                </div>
              </div>
            </div>
          )}

          {/* Show message if no changes */}
          {!hasChanged('name') && !hasChanged('description') && !hasChanged('url') &&
            !hasChanged('permissions') && !hasChanged('category') && !hasChanged('language') &&
            !hasChanged('slug') && !hasChanged('developer_name') && !hasChanged('icon') && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No changes detected in this update request.</p>
              </div>
            )}
        </div>

        {/* Action Buttons */}
        {onApproveUpdate && (
          <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Close
            </button>
            <button
              onClick={onApproveUpdate}
              disabled={isProcessing}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : 'Approve Update'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
