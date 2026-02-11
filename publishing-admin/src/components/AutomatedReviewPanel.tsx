'use client';

import { useState } from 'react';
import { AppMetadata } from '@/types/app';
import {
  AutomatedReviewResult,
  ReviewStatus,
  ReviewRecommendation,
  REVIEW_STATUS_COLORS,
  REVIEW_STATUS_LABELS,
  RECOMMENDATION_COLORS,
  RECOMMENDATION_LABELS,
} from '@/types/review';

interface AutomatedReviewPanelProps {
  app: AppMetadata;
  onReviewComplete?: (result: AutomatedReviewResult) => void;
}

// Generate checklist items based on app metadata
function getManualChecklistItems(app: AppMetadata): ChecklistItem[] {
  const items: ChecklistItem[] = [
    // Always required
    { id: 'app_loads', label: 'App loads in browser', required: true },
    { id: 'functionality_works', label: 'Main functionality works as described', required: true },
    { id: 'matches_description', label: 'App matches its description', required: true },
  ];

  // Permission-specific checks
  if (app.permissions.includes('sign_transaction')) {
    items.push(
      { id: 'tx_legitimate', label: 'Transaction requests are legitimate', required: true },
      { id: 'tx_amounts_reasonable', label: 'Transaction amounts are reasonable', required: true },
      { id: 'contracts_verified', label: 'Interacts with known/verified contracts', required: false },
    );
  }

  if (app.permissions.includes('camera') || app.permissions.includes('location')) {
    items.push(
      { id: 'sensitive_justified', label: 'Sensitive permissions are justified by functionality', required: true },
    );
  }

  // Category-specific checks
  if (app.category === 'defi') {
    items.push(
      { id: 'no_rug_indicators', label: 'No suspicious token approvals or drain patterns', required: true },
      { id: 'clear_tx_ui', label: 'Users can understand what they are signing', required: true },
    );
  }

  if (app.category === 'game') {
    items.push(
      { id: 'game_playable', label: 'Game is actually playable', required: true },
      { id: 'no_hidden_fees', label: 'No hidden fees or costs', required: false },
    );
  }

  if (app.category === 'nft') {
    items.push(
      { id: 'nft_legitimate', label: 'NFT collection/marketplace is legitimate', required: true },
    );
  }

  // General quality checks
  items.push(
    { id: 'no_inappropriate', label: 'No inappropriate or offensive content', required: true },
    { id: 'professional_quality', label: 'Professional quality (no placeholder content)', required: false },
  );

  return items;
}

interface ChecklistItem {
  id: string;
  label: string;
  required: boolean;
}

export function AutomatedReviewPanel({ app, onReviewComplete }: AutomatedReviewPanelProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<AutomatedReviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [showChecklist, setShowChecklist] = useState(false);

  const checklistItems = getManualChecklistItems(app);
  const requiredItems = checklistItems.filter(item => item.required);
  const checkedRequiredCount = requiredItems.filter(item => checkedItems[item.id]).length;
  const allRequiredChecked = checkedRequiredCount === requiredItems.length;

  const toggleChecked = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const runReview = async () => {
    setIsRunning(true);
    setError(null);

    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to run review');
      }

      const reviewResult: AutomatedReviewResult = await response.json();
      setResult(reviewResult);
      onReviewComplete?.(reviewResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Automated Review
        </h3>
        <button
          onClick={runReview}
          disabled={isRunning}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? 'Running...' : result ? 'Re-run Checks' : 'Run Checks'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {isRunning && (
        <div className="flex items-center gap-3 py-4">
          <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Running automated checks...</span>
        </div>
      )}

      {result && !isRunning && (
        <div className="space-y-4">
          {/* Score and Recommendation */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {result.overallScore}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">/ 100</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${result.overallScore}%`,
                    backgroundColor: getScoreColor(result.overallScore),
                  }}
                />
              </div>
            </div>
            <div className="text-right">
              <span
                className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold"
                style={{
                  backgroundColor: REVIEW_STATUS_COLORS[result.status] + '20',
                  color: REVIEW_STATUS_COLORS[result.status],
                }}
              >
                {REVIEW_STATUS_LABELS[result.status]}
              </span>
            </div>
          </div>

          {/* Recommendation Badge */}
          <div
            className="rounded-lg p-3 border"
            style={{
              backgroundColor: RECOMMENDATION_COLORS[result.recommendation] + '10',
              borderColor: RECOMMENDATION_COLORS[result.recommendation] + '40',
            }}
          >
            <div className="flex items-center gap-2">
              <RecommendationIcon recommendation={result.recommendation} />
              <span
                className="text-sm font-semibold"
                style={{ color: RECOMMENDATION_COLORS[result.recommendation] }}
              >
                {RECOMMENDATION_LABELS[result.recommendation]}
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {getRecommendationDescription(result.recommendation)}
            </p>
          </div>

          {/* Flags */}
          {result.flags.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                Flags ({result.flags.length})
              </h4>
              <div className="space-y-2">
                {result.flags.map((flag, i) => (
                  <div
                    key={i}
                    className={`rounded-lg p-2 text-xs ${
                      flag.severity === 'critical'
                        ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                        : flag.severity === 'warning'
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                        : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FlagIcon severity={flag.severity} />
                      <span
                        className={`font-medium ${
                          flag.severity === 'critical'
                            ? 'text-red-700 dark:text-red-300'
                            : flag.severity === 'warning'
                            ? 'text-yellow-700 dark:text-yellow-300'
                            : 'text-blue-700 dark:text-blue-300'
                        }`}
                      >
                        {flag.message}
                      </span>
                    </div>
                    {flag.details && (
                      <p className="text-gray-600 dark:text-gray-400 mt-1 ml-5">{flag.details}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Individual Checks */}
          <div>
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
              Checks ({result.checks.filter(c => c.status === 'pass').length}/{result.checks.length} passed)
            </h4>
            <div className="space-y-1">
              {result.checks.map((check, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700/50"
                >
                  <div className="flex items-center gap-2">
                    <CheckIcon status={check.status} />
                    <span className="text-xs text-gray-700 dark:text-gray-300">{check.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {check.duration && (
                      <span className="text-xs text-gray-400">{check.duration}ms</span>
                    )}
                    <span
                      className={`text-xs font-medium ${
                        check.status === 'pass'
                          ? 'text-green-600 dark:text-green-400'
                          : check.status === 'fail'
                          ? 'text-red-600 dark:text-red-400'
                          : check.status === 'warn'
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-gray-400'
                      }`}
                    >
                      {check.score}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timestamp */}
          <p className="text-xs text-gray-400 text-right">
            Reviewed: {new Date(result.reviewedAt).toLocaleString()}
          </p>
        </div>
      )}

      {!result && !isRunning && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          Click "Run Checks" to perform automated review
        </p>
      )}

      {/* Manual Review Checklist */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowChecklist(!showChecklist)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Manual Review Checklist
            </h3>
            {checkedRequiredCount > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                allRequiredChecked
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
              }`}>
                {checkedRequiredCount}/{requiredItems.length} required
              </span>
            )}
          </div>
          <span className="text-gray-400 text-sm">
            {showChecklist ? '▼' : '▶'}
          </span>
        </button>

        {showChecklist && (
          <div className="mt-3 space-y-2">
            {checklistItems.map((item) => (
              <label
                key={item.id}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={checkedItems[item.id] || false}
                  onChange={() => toggleChecked(item.id)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className={`text-sm ${
                  checkedItems[item.id]
                    ? 'text-gray-400 dark:text-gray-500 line-through'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {item.label}
                  {item.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </span>
              </label>
            ))}

            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <span className="text-red-500">*</span> Required checks before approval
              </p>
              {allRequiredChecked && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
                  All required checks completed - ready to approve
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckIcon({ status }: { status: string }) {
  if (status === 'pass') {
    return <span className="text-green-500">&#10003;</span>;
  }
  if (status === 'fail') {
    return <span className="text-red-500">&#10007;</span>;
  }
  if (status === 'warn') {
    return <span className="text-yellow-500">&#9888;</span>;
  }
  return <span className="text-gray-400">&#8212;</span>;
}

function FlagIcon({ severity }: { severity: string }) {
  if (severity === 'critical') {
    return <span className="text-red-500">&#9888;</span>;
  }
  if (severity === 'warning') {
    return <span className="text-yellow-500">&#9888;</span>;
  }
  return <span className="text-blue-500">&#9432;</span>;
}

function RecommendationIcon({ recommendation }: { recommendation: ReviewRecommendation }) {
  switch (recommendation) {
    case ReviewRecommendation.AUTO_APPROVE:
      return <span>&#10003;</span>;
    case ReviewRecommendation.QUICK_REVIEW:
      return <span>&#128269;</span>;
    case ReviewRecommendation.FULL_REVIEW:
      return <span>&#128221;</span>;
    case ReviewRecommendation.AUTO_REJECT:
      return <span>&#10007;</span>;
  }
}

function getScoreColor(score: number): string {
  if (score >= 90) return '#10b981';
  if (score >= 70) return '#3b82f6';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

function getRecommendationDescription(recommendation: ReviewRecommendation): string {
  switch (recommendation) {
    case ReviewRecommendation.AUTO_APPROVE:
      return 'All automated checks passed. Safe to approve with minimal manual review.';
    case ReviewRecommendation.QUICK_REVIEW:
      return 'Most checks passed. Quick manual verification recommended before approval.';
    case ReviewRecommendation.FULL_REVIEW:
      return 'Some concerns detected. Full manual review required before making a decision.';
    case ReviewRecommendation.AUTO_REJECT:
      return 'Critical issues detected. Consider rejecting unless issues can be explained.';
  }
}
