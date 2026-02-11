// Automated review types

export interface AutomatedReviewResult {
  appId: number;
  url: string;
  reviewedAt: number;
  overallScore: number; // 0-100
  status: ReviewStatus;
  checks: ReviewCheck[];
  flags: ReviewFlag[];
  recommendation: ReviewRecommendation;
}

export enum ReviewStatus {
  PASSED = 'passed',
  FAILED = 'failed',
  NEEDS_REVIEW = 'needs_review',
  ERROR = 'error',
}

export enum ReviewRecommendation {
  AUTO_APPROVE = 'auto_approve',
  QUICK_REVIEW = 'quick_review',
  FULL_REVIEW = 'full_review',
  AUTO_REJECT = 'auto_reject',
}

export interface ReviewCheck {
  name: string;
  description: string;
  status: 'pass' | 'fail' | 'warn' | 'skip';
  score: number; // 0-100
  details?: string;
  duration?: number; // ms
}

export interface ReviewFlag {
  severity: 'info' | 'warning' | 'critical';
  code: string;
  message: string;
  details?: string;
}

// Check configuration
export const REVIEW_CHECKS = {
  URL_ACCESSIBLE: {
    name: 'URL Accessible',
    description: 'App URL returns a successful response',
    weight: 20,
    required: true,
  },
  SSL_VALID: {
    name: 'SSL Certificate',
    description: 'URL uses valid HTTPS',
    weight: 15,
    required: true,
  },
  ICON_LOADS: {
    name: 'Icon Loads',
    description: 'App icon URL loads successfully',
    weight: 10,
    required: false,
  },
  PAGE_LOADS: {
    name: 'Page Loads',
    description: 'Page loads without critical errors',
    weight: 20,
    required: true,
  },
  SDK_DETECTED: {
    name: 'SDK Integration',
    description: 'Movement SDK usage detected',
    weight: 15,
    required: false,
  },
  RESPONSE_TIME: {
    name: 'Response Time',
    description: 'Page loads within acceptable time',
    weight: 10,
    required: false,
  },
  NO_CONSOLE_ERRORS: {
    name: 'No Console Errors',
    description: 'No critical JavaScript errors',
    weight: 5,
    required: false,
  },
  PERMISSIONS_REASONABLE: {
    name: 'Permissions Reasonable',
    description: 'Requested permissions match app category',
    weight: 5,
    required: false,
  },
} as const;

// Thresholds for recommendations
export const REVIEW_THRESHOLDS = {
  AUTO_APPROVE: 90,
  QUICK_REVIEW: 70,
  FULL_REVIEW: 50,
  // Below 50 = AUTO_REJECT
};

// Status display helpers
export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  [ReviewStatus.PASSED]: 'Passed',
  [ReviewStatus.FAILED]: 'Failed',
  [ReviewStatus.NEEDS_REVIEW]: 'Needs Review',
  [ReviewStatus.ERROR]: 'Error',
};

export const REVIEW_STATUS_COLORS: Record<ReviewStatus, string> = {
  [ReviewStatus.PASSED]: '#10b981',
  [ReviewStatus.FAILED]: '#ef4444',
  [ReviewStatus.NEEDS_REVIEW]: '#f59e0b',
  [ReviewStatus.ERROR]: '#6b7280',
};

export const RECOMMENDATION_LABELS: Record<ReviewRecommendation, string> = {
  [ReviewRecommendation.AUTO_APPROVE]: 'Auto-Approve Candidate',
  [ReviewRecommendation.QUICK_REVIEW]: 'Quick Review',
  [ReviewRecommendation.FULL_REVIEW]: 'Full Review Required',
  [ReviewRecommendation.AUTO_REJECT]: 'Auto-Reject Candidate',
};

export const RECOMMENDATION_COLORS: Record<ReviewRecommendation, string> = {
  [ReviewRecommendation.AUTO_APPROVE]: '#10b981',
  [ReviewRecommendation.QUICK_REVIEW]: '#3b82f6',
  [ReviewRecommendation.FULL_REVIEW]: '#f59e0b',
  [ReviewRecommendation.AUTO_REJECT]: '#ef4444',
};
