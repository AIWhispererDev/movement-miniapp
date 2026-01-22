'use client';

import { Button } from 'movement-design-system';
import { DeepLinkOptions, deepLinkService } from '@/lib/deep-link';
import { useState } from 'react';

interface OpenInAppButtonProps {
  appId: string;
  path?: string;
  params?: Record<string, string>;
  className?: string;
  children?: React.ReactNode;
}

export default function OpenInAppButton({
  appId,
  path,
  params,
  className = '',
  children
}: OpenInAppButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenApp = async () => {
    setIsLoading(true);

    try {
      const options: DeepLinkOptions = { appId, path, params };
      await deepLinkService.openApp(options);
    } catch (error) {
      console.error('Failed to open app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isMobile = deepLinkService.isDeepLinkSupported();

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Primary Open in App Button */}
      <Button
        onClick={handleOpenApp}
        disabled={isLoading}
        variant="default"
        size="lg"
        className="w-full bg-[#00D4AA] hover:bg-[#00C49A] text-white border-0"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Opening...
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18l9-5-9-5-9 5 9 5z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9l9-5-9-5-9 5 9 5z"
              />
            </svg>
            {children || 'Open in Move Everything'}
          </>
        )}
      </Button>

      {/* Instructions for desktop users */}
      {!isMobile && (
        <p className="text-sm text-gray-400 text-center">
          This mini-app requires the Move Everything mobile app. Open this page on your phone to use the app.
        </p>
      )}
    </div>
  );
}
