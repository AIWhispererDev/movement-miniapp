'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'movement-design-system';
import DiscoverSection from '@/components/DiscoverSection';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Home() {
  return (
    <div className="bg-[#00D4AA]/5 min-h-screen">
      <ThemeToggle />
      <div className="flex items-center justify-center py-16 px-4">
        <div className="max-w-lg w-full">
          <Card className="overflow-hidden border-0 shadow-2xl bg-white dark:bg-gray-900 rounded-2xl">
            <CardHeader className="bg-[#00D4AA]/10 p-6">
              <div className="text-center">
                <CardTitle className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  Move Everything
                </CardTitle>
                <CardDescription className="text-lg text-gray-600 dark:text-gray-400">
                  Mini-App Sharing Service
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                How it works
              </h2>
              <div className="space-y-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#00D4AA] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white font-semibold text-sm">1</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    Share a mini-app link on social media with beautiful previews
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#00D4AA] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white font-semibold text-sm">2</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    When someone clicks the link, they see the app info and can open it
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#00D4AA] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white font-semibold text-sm">3</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    The app opens directly in Move Everything or redirects to download
                  </p>
                </div>
              </div>
              <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-6">
                This service handles all mini-app sharing links for the Move Everything ecosystem
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <DiscoverSection />
    </div>
  );
}