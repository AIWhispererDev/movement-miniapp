import {
  AutomatedReviewResult,
  ReviewCheck,
  ReviewFlag,
  ReviewRecommendation,
  ReviewStatus,
  REVIEW_CHECKS,
  REVIEW_THRESHOLDS,
} from '@/types/review';
import { AppMetadata } from '@/types/app';

// Permission expectations by category
const EXPECTED_PERMISSIONS: Record<string, string[]> = {
  game: ['wallet_read', 'storage_read', 'storage_write'],
  defi: ['wallet_read', 'sign_transaction'],
  social: ['wallet_read', 'storage_read', 'storage_write'],
  utility: ['wallet_read', 'storage_read'],
  nft: ['wallet_read', 'sign_transaction'],
};

// High-risk permissions that need extra scrutiny
const HIGH_RISK_PERMISSIONS = ['sign_transaction', 'camera', 'location'];

/**
 * Run all automated review checks on a mini app
 */
export async function runAutomatedReview(app: AppMetadata): Promise<AutomatedReviewResult> {
  const startTime = Date.now();
  const checks: ReviewCheck[] = [];
  const flags: ReviewFlag[] = [];

  // Run all checks
  checks.push(await checkUrlAccessible(app.url));
  checks.push(await checkSslValid(app.url));
  checks.push(await checkIconLoads(app.icon));
  checks.push(await checkPageLoads(app.url));
  checks.push(await checkResponseTime(app.url));
  checks.push(checkPermissionsReasonable(app.permissions, app.category));

  // Generate flags based on checks and metadata
  flags.push(...generateFlags(app, checks));

  // Calculate overall score
  const overallScore = calculateScore(checks);

  // Determine status and recommendation
  const status = determineStatus(checks, flags);
  const recommendation = determineRecommendation(overallScore, flags);

  return {
    appId: app.app_id ?? -1,
    url: app.url,
    reviewedAt: Date.now(),
    overallScore,
    status,
    checks,
    flags,
    recommendation,
  };
}

/**
 * Check if the app URL is accessible
 */
async function checkUrlAccessible(url: string): Promise<ReviewCheck> {
  const config = REVIEW_CHECKS.URL_ACCESSIBLE;
  const start = Date.now();

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    });

    const duration = Date.now() - start;

    if (response.ok) {
      return {
        name: config.name,
        description: config.description,
        status: 'pass',
        score: 100,
        details: `HTTP ${response.status} - OK`,
        duration,
      };
    } else {
      return {
        name: config.name,
        description: config.description,
        status: 'fail',
        score: 0,
        details: `HTTP ${response.status} - ${response.statusText}`,
        duration,
      };
    }
  } catch (error) {
    return {
      name: config.name,
      description: config.description,
      status: 'fail',
      score: 0,
      details: `Failed to reach URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
      duration: Date.now() - start,
    };
  }
}

/**
 * Check if the URL uses valid HTTPS
 */
async function checkSslValid(url: string): Promise<ReviewCheck> {
  const config = REVIEW_CHECKS.SSL_VALID;

  // Basic check: URL should start with https
  if (!url.startsWith('https://')) {
    return {
      name: config.name,
      description: config.description,
      status: 'fail',
      score: 0,
      details: 'URL does not use HTTPS',
    };
  }

  // Try to fetch to verify certificate
  try {
    await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(10000),
    });

    return {
      name: config.name,
      description: config.description,
      status: 'pass',
      score: 100,
      details: 'Valid HTTPS connection',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Check for SSL-specific errors
    if (errorMessage.includes('certificate') || errorMessage.includes('SSL') || errorMessage.includes('TLS')) {
      return {
        name: config.name,
        description: config.description,
        status: 'fail',
        score: 0,
        details: `SSL certificate issue: ${errorMessage}`,
      };
    }

    // Other errors might not be SSL-related
    return {
      name: config.name,
      description: config.description,
      status: 'warn',
      score: 50,
      details: `Could not verify SSL: ${errorMessage}`,
    };
  }
}

/**
 * Check if the app icon loads
 */
async function checkIconLoads(icon: string): Promise<ReviewCheck> {
  const config = REVIEW_CHECKS.ICON_LOADS;

  // If it's an emoji (not a URL), skip this check
  if (!icon.startsWith('http')) {
    return {
      name: config.name,
      description: config.description,
      status: 'pass',
      score: 100,
      details: 'Using emoji icon',
    };
  }

  try {
    const response = await fetch(icon, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.startsWith('image/')) {
        return {
          name: config.name,
          description: config.description,
          status: 'pass',
          score: 100,
          details: `Icon loads successfully (${contentType})`,
        };
      } else {
        return {
          name: config.name,
          description: config.description,
          status: 'warn',
          score: 50,
          details: `URL returns ${contentType}, expected image`,
        };
      }
    } else {
      return {
        name: config.name,
        description: config.description,
        status: 'fail',
        score: 0,
        details: `Icon URL returned HTTP ${response.status}`,
      };
    }
  } catch (error) {
    return {
      name: config.name,
      description: config.description,
      status: 'fail',
      score: 0,
      details: `Failed to load icon: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Check if the page loads (basic HTML response)
 */
async function checkPageLoads(url: string): Promise<ReviewCheck> {
  const config = REVIEW_CHECKS.PAGE_LOADS;
  const start = Date.now();

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'MovementAppReviewer/1.0',
      },
      signal: AbortSignal.timeout(15000),
    });

    const duration = Date.now() - start;
    const html = await response.text();

    // Basic checks on the HTML
    const hasHtml = html.includes('<html') || html.includes('<!DOCTYPE');
    const hasBody = html.includes('<body') || html.includes('<div');
    const hasScript = html.includes('<script');

    if (!hasHtml && !hasBody) {
      return {
        name: config.name,
        description: config.description,
        status: 'fail',
        score: 0,
        details: 'Response does not appear to be a valid HTML page',
        duration,
      };
    }

    // Check for common error indicators
    const errorPatterns = [
      'application error',
      'server error',
      '500 internal',
      'not found',
      '404',
      'access denied',
      'forbidden',
    ];

    const lowerHtml = html.toLowerCase();
    for (const pattern of errorPatterns) {
      if (lowerHtml.includes(pattern) && html.length < 5000) {
        return {
          name: config.name,
          description: config.description,
          status: 'warn',
          score: 50,
          details: `Page may contain an error: "${pattern}" found`,
          duration,
        };
      }
    }

    return {
      name: config.name,
      description: config.description,
      status: 'pass',
      score: 100,
      details: `Page loaded successfully (${(html.length / 1024).toFixed(1)}KB, has scripts: ${hasScript})`,
      duration,
    };
  } catch (error) {
    return {
      name: config.name,
      description: config.description,
      status: 'fail',
      score: 0,
      details: `Failed to load page: ${error instanceof Error ? error.message : 'Unknown error'}`,
      duration: Date.now() - start,
    };
  }
}

/**
 * Check response time
 */
async function checkResponseTime(url: string): Promise<ReviewCheck> {
  const config = REVIEW_CHECKS.RESPONSE_TIME;
  const start = Date.now();

  try {
    await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(10000),
    });

    const duration = Date.now() - start;

    if (duration < 1000) {
      return {
        name: config.name,
        description: config.description,
        status: 'pass',
        score: 100,
        details: `Response time: ${duration}ms (excellent)`,
        duration,
      };
    } else if (duration < 3000) {
      return {
        name: config.name,
        description: config.description,
        status: 'pass',
        score: 75,
        details: `Response time: ${duration}ms (acceptable)`,
        duration,
      };
    } else if (duration < 5000) {
      return {
        name: config.name,
        description: config.description,
        status: 'warn',
        score: 50,
        details: `Response time: ${duration}ms (slow)`,
        duration,
      };
    } else {
      return {
        name: config.name,
        description: config.description,
        status: 'fail',
        score: 25,
        details: `Response time: ${duration}ms (very slow)`,
        duration,
      };
    }
  } catch (error) {
    return {
      name: config.name,
      description: config.description,
      status: 'fail',
      score: 0,
      details: `Timeout or error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      duration: Date.now() - start,
    };
  }
}

/**
 * Check if permissions are reasonable for the app category
 */
function checkPermissionsReasonable(permissions: string[], category: string): ReviewCheck {
  const config = REVIEW_CHECKS.PERMISSIONS_REASONABLE;
  const expected = EXPECTED_PERMISSIONS[category] || [];

  // Check for unexpected high-risk permissions
  const unexpectedHighRisk = permissions.filter(
    p => HIGH_RISK_PERMISSIONS.includes(p) && !expected.includes(p)
  );

  if (unexpectedHighRisk.length > 0) {
    return {
      name: config.name,
      description: config.description,
      status: 'warn',
      score: 50,
      details: `Unusual high-risk permissions for ${category} app: ${unexpectedHighRisk.join(', ')}`,
    };
  }

  // Check if permissions seem reasonable
  if (permissions.length === 0) {
    return {
      name: config.name,
      description: config.description,
      status: 'pass',
      score: 100,
      details: 'No permissions requested',
    };
  }

  if (permissions.length > 5) {
    return {
      name: config.name,
      description: config.description,
      status: 'warn',
      score: 60,
      details: `Many permissions requested (${permissions.length})`,
    };
  }

  return {
    name: config.name,
    description: config.description,
    status: 'pass',
    score: 100,
    details: `Permissions appear reasonable for ${category} app`,
  };
}

/**
 * Generate flags based on app metadata and check results
 */
function generateFlags(app: AppMetadata, checks: ReviewCheck[]): ReviewFlag[] {
  const flags: ReviewFlag[] = [];

  // Flag critical check failures
  const criticalChecks = ['URL Accessible', 'SSL Certificate', 'Page Loads'];
  for (const check of checks) {
    if (criticalChecks.includes(check.name) && check.status === 'fail') {
      flags.push({
        severity: 'critical',
        code: `FAILED_${check.name.toUpperCase().replace(/\s/g, '_')}`,
        message: `Critical check failed: ${check.name}`,
        details: check.details,
      });
    }
  }

  // Flag high-risk permissions
  const highRiskRequested = app.permissions.filter(p => HIGH_RISK_PERMISSIONS.includes(p));
  if (highRiskRequested.includes('sign_transaction')) {
    flags.push({
      severity: 'warning',
      code: 'HIGH_RISK_PERMISSION_SIGN_TX',
      message: 'App requests transaction signing permission',
      details: 'Verify the app legitimately needs to sign transactions',
    });
  }

  if (highRiskRequested.includes('camera') || highRiskRequested.includes('location')) {
    flags.push({
      severity: 'warning',
      code: 'SENSITIVE_PERMISSION',
      message: `App requests sensitive permission: ${highRiskRequested.filter(p => p !== 'sign_transaction').join(', ')}`,
      details: 'Verify the app has a legitimate need for these permissions',
    });
  }

  // Flag if description is very short
  if (app.description.length < 20) {
    flags.push({
      severity: 'warning',
      code: 'SHORT_DESCRIPTION',
      message: 'App description is very short',
      details: 'Consider requesting a more detailed description',
    });
  }

  // Flag if name contains suspicious keywords
  const suspiciousKeywords = ['free money', 'guaranteed', 'airdrop', 'giveaway', 'double'];
  const lowerName = app.name.toLowerCase();
  const lowerDesc = app.description.toLowerCase();
  for (const keyword of suspiciousKeywords) {
    if (lowerName.includes(keyword) || lowerDesc.includes(keyword)) {
      flags.push({
        severity: 'warning',
        code: 'SUSPICIOUS_KEYWORD',
        message: `Potentially misleading keyword: "${keyword}"`,
        details: 'Review carefully for scam indicators',
      });
      break;
    }
  }

  return flags;
}

/**
 * Calculate overall score from individual checks
 */
function calculateScore(checks: ReviewCheck[]): number {
  let totalWeight = 0;
  let weightedScore = 0;

  for (const check of checks) {
    const checkConfig = Object.values(REVIEW_CHECKS).find(c => c.name === check.name);
    const weight = checkConfig?.weight ?? 10;

    totalWeight += weight;
    weightedScore += (check.score / 100) * weight;
  }

  if (totalWeight === 0) return 0;
  return Math.round((weightedScore / totalWeight) * 100);
}

/**
 * Determine overall status from checks and flags
 */
function determineStatus(checks: ReviewCheck[], flags: ReviewFlag[]): ReviewStatus {
  // Any critical flag = needs review
  if (flags.some(f => f.severity === 'critical')) {
    return ReviewStatus.FAILED;
  }

  // Check for required check failures
  const requiredCheckNames: string[] = Object.values(REVIEW_CHECKS)
    .filter(c => c.required)
    .map(c => c.name);

  for (const check of checks) {
    if (requiredCheckNames.includes(check.name) && check.status === 'fail') {
      return ReviewStatus.FAILED;
    }
  }

  // Any warnings = needs review
  if (flags.some(f => f.severity === 'warning') || checks.some(c => c.status === 'warn')) {
    return ReviewStatus.NEEDS_REVIEW;
  }

  return ReviewStatus.PASSED;
}

/**
 * Determine recommendation based on score and flags
 */
function determineRecommendation(score: number, flags: ReviewFlag[]): ReviewRecommendation {
  // Critical flags = auto reject candidate
  if (flags.some(f => f.severity === 'critical')) {
    return ReviewRecommendation.AUTO_REJECT;
  }

  // Score-based recommendations
  if (score >= REVIEW_THRESHOLDS.ALL_CHECKS_PASSED && !flags.some(f => f.severity === 'warning')) {
    return ReviewRecommendation.ALL_CHECKS_PASSED;
  }

  if (score >= REVIEW_THRESHOLDS.QUICK_REVIEW) {
    return ReviewRecommendation.QUICK_REVIEW;
  }

  if (score >= REVIEW_THRESHOLDS.FULL_REVIEW) {
    return ReviewRecommendation.FULL_REVIEW;
  }

  return ReviewRecommendation.AUTO_REJECT;
}
