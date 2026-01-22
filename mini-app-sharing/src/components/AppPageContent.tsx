'use client';

import OpenInAppButton from '@/components/OpenInAppButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AppMetadata } from '@/lib/types';
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from 'movement-design-system';

interface AppPageContentProps {
  app: AppMetadata;
  appId: string;
  formattedRating: string;
  isApproved: boolean;
}

export default function AppPageContent({
  app,
  appId,
  formattedRating,
  isApproved,
}: AppPageContentProps) {
  return (
    <div className="bg-[#00D4AA]/5 h-screen flex flex-col overflow-hidden">
      <ThemeToggle />
      <div className="flex-1 flex items-center justify-center px-4 py-4 overflow-y-auto">
        <div className="max-w-lg w-full">
          <Card className="overflow-hidden border-0 shadow-2xl bg-white dark:bg-gray-900 rounded-2xl">
            {/* Hero Section with Icon */}
            <CardHeader className="bg-[#00D4AA]/10 p-4 md:p-6">
              <div className="text-center">
                {app.icon && (app.icon.startsWith('http://') || app.icon.startsWith('https://') || app.icon.startsWith('/')) ? (
                  <div className="mb-4">
                    <img
                      src={app.icon}
                      alt={`${app.name} icon`}
                      className="w-24 h-24 md:w-32 md:h-32 rounded-2xl shadow-xl mx-auto object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl shadow-xl mx-auto mb-4 bg-[#00D4AA]/20 flex items-center justify-center text-5xl md:text-6xl">
                    {app.icon || '📱'}
                  </div>
                )}

                <CardTitle className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white">
                  {app.name}
                </CardTitle>

                <CardDescription className="text-base md:text-lg mb-4 text-gray-600 dark:text-gray-400">
                  by {app.developer_name}
                </CardDescription>

                <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 rounded-full border border-yellow-500/20">
                    <span className="text-yellow-500 dark:text-yellow-400 text-lg">⭐</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{formattedRating}</span>
                  </div>
                  <Badge variant="outline" className="capitalize px-3 py-1.5 text-sm border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                    {app.category}
                  </Badge>
                  {isApproved && (
                    <Badge className="bg-[#00D4AA] text-white px-3 py-1.5 text-sm border-0">
                      <svg className="w-4 h-4 mr-1 inline" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            {/* Content Section */}
            <CardContent className="p-4 md:p-6">
              <div className="text-center mb-4">
                <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg leading-relaxed mb-4">
                  {app.description}
                </p>
              </div>

              {/* Action Section */}
              <div className="text-center">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Open in Move Everything
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                  Tap the button below to open this mini-app in the Move Everything mobile app.
                </p>

                <OpenInAppButton
                  appId={appId}
                  className="max-w-md mx-auto"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

