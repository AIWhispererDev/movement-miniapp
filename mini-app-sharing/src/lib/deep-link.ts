export interface DeepLinkOptions {
  appId: string;
  path?: string;
  params?: Record<string, string>;
}

export class DeepLinkService {
  private readonly appScheme = 'moveeverything://';
  private readonly appStoreUrl = 'https://apps.apple.com/app/move-everything'; // Replace with actual App Store URL
  private readonly playStoreUrl = 'https://play.google.com/store/apps/details?id=com.moveeverything.app'; // Replace with actual Play Store URL

  /**
   * Detect if user is on iOS
   */
  isIOS(): boolean {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  /**
   * Detect if user is on Android
   */
  isAndroid(): boolean {
    if (typeof window === 'undefined') return false;
    return /Android/.test(navigator.userAgent);
  }

  /**
   * Get the appropriate app store URL based on device
   */
  getStoreUrl(): string {
    if (this.isAndroid()) {
      return this.playStoreUrl;
    } else if (this.isIOS()) {
      return this.appStoreUrl;
    }
    // Default to App Store for desktop/unknown
    return this.appStoreUrl;
  }

  /**
   * Generate deep link URL for opening a mini-app
   */
  generateDeepLink(options: DeepLinkOptions): string {
    const { appId, path, params } = options;

    // Base deep link: moveeverything://app/{appId}
    let deepLink = `${this.appScheme}app/${appId}`;

    // Add path if provided: moveeverything://app/{appId}/{path}
    if (path) {
      deepLink += `/${path}`;
    }

    // Add query parameters if provided
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams(params);
      deepLink += `?${searchParams.toString()}`;
    }

    return deepLink;
  }

  /**
   * Generate universal link (web URL that can open app or redirect to store)
   */
  generateUniversalLink(options: DeepLinkOptions): string {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mini-app-sharing.vercel.app';
    const { appId, path, params } = options;

    let universalLink = `${baseUrl}/app/${appId}`;

    if (path) {
      universalLink += `/${path}`;
    }

    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams(params);
      universalLink += `?${searchParams.toString()}`;
    }

    return universalLink;
  }

  /**
   * Generate share URL for social media
   */
  generateShareUrl(options: DeepLinkOptions): string {
    return this.generateUniversalLink(options);
  }

  /**
   * Check if the current environment supports deep linking
   */
  isDeepLinkSupported(): boolean {
    // Check if we're in a mobile environment
    if (typeof window === 'undefined') return false;

    const userAgent = window.navigator.userAgent;
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

    return isMobile;
  }

  /**
   * Attempt to open the app via deep link
   * Falls back to App Store if app is not installed
   */
  async openApp(options: DeepLinkOptions): Promise<void> {
    const deepLink = this.generateDeepLink(options);

    if (typeof window === 'undefined') return;

    try {
      // Create a hidden iframe to test if the app opens
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = deepLink;
      document.body.appendChild(iframe);

      // Remove iframe after a short delay
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);

      // Try to open the deep link directly as well
      window.location.href = deepLink;

      // Only redirect to app store if the page is still visible after 3 seconds
      // This means the app didn't open and the user is still on the web page
      const redirectTimer: NodeJS.Timeout = setTimeout(() => {
        // Only redirect if the page is still visible (app didn't open)
        if (!document.hidden) {
          window.location.href = this.getStoreUrl();
        }
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }, 3000);
      const handleVisibilityChange = () => {
        if (document.hidden) {
          // App opened successfully, clear the redirect timer
          clearTimeout(redirectTimer);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

    } catch (error) {
      console.error('Failed to open deep link:', error);
      // Fallback to appropriate app store
      window.location.href = this.getStoreUrl();
    }
  }

  /**
   * Copy share URL to clipboard
   */
  async copyShareUrl(options: DeepLinkOptions): Promise<boolean> {
    const shareUrl = this.generateShareUrl(options);

    if (typeof window === 'undefined') return false;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const result = document.execCommand('copy');
        textArea.remove();
        return result;
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  /**
   * Parse deep link URL to extract app ID and path
   */
  parseDeepLink(url: string): DeepLinkOptions | null {
    try {
      const urlObj = new URL(url);

      // Check if it's a deep link
      if (urlObj.protocol === 'moveeverything:') {
        const pathParts = urlObj.pathname.split('/').filter(Boolean);

        if (pathParts.length >= 2 && pathParts[0] === 'app') {
          const appId = pathParts[1];
          const path = pathParts.slice(2).join('/');
          const params: Record<string, string> = {};

          // Parse query parameters
          urlObj.searchParams.forEach((value, key) => {
            params[key] = value;
          });

          return { appId, path: path || undefined, params };
        }
      }

      return null;
    } catch (error) {
      console.error('Failed to parse deep link:', error);
      return null;
    }
  }
}

// Export singleton instance
export const deepLinkService = new DeepLinkService();
