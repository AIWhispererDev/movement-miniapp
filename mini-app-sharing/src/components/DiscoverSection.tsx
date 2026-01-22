'use client';

import { appRegistryService } from '@/lib/app-registry';
import { AppMetadata } from '@/lib/types';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from 'movement-design-system';
import { useEffect, useState } from 'react';

export default function DiscoverSection() {
  const [apps, setApps] = useState<AppMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApps() {
      try {
        const allApps = await appRegistryService.getAllApps();
        setApps(allApps);
      } catch (error) {
        console.error('Error fetching apps:', error);
        setApps([]);
      } finally {
        setLoading(false);
      }
    }
    fetchApps();
  }, []);


  return (
    <div className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Discover Apps
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Explore the growing ecosystem of mini-apps on Movement
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <Card key={app.slug || app.name} className="overflow-hidden border-0 shadow-2xl bg-white dark:bg-gray-900 rounded-2xl hover:shadow-2xl transition-shadow duration-300">
              <CardHeader className="bg-[#00D4AA]/10 p-4 md:p-6">
                <div className="text-center">
                  {app.icon && (app.icon.startsWith('http://') || app.icon.startsWith('https://') || app.icon.startsWith('/')) ? (
                    <div className="mb-4">
                      <img
                        src={app.icon}
                        alt={`${app.name} icon`}
                        className="w-20 h-20 md:w-24 md:h-24 rounded-2xl shadow-xl mx-auto object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl shadow-xl mx-auto mb-4 bg-[#00D4AA]/20 flex items-center justify-center text-4xl md:text-5xl">
                      {app.icon || '📱'}
                    </div>
                  )}

                  <CardTitle className="text-xl md:text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                    {app.name}
                  </CardTitle>

                  <CardDescription className="text-sm md:text-base mb-3 text-gray-600 dark:text-gray-400">
                    by {app.developer_name}
                  </CardDescription>

                  <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 rounded-full border border-yellow-500/20">
                      <span className="text-yellow-500 dark:text-yellow-400 text-sm">⭐</span>
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">{(app.rating / 10).toFixed(1)}</span>
                    </div>
                    <Badge variant="outline" className="capitalize px-3 py-1.5 text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                      {app.category}
                    </Badge>
                    {app.verified && (
                      <Badge className="bg-[#00D4AA] text-white px-3 py-1.5 text-xs border-0">
                        <svg className="w-3 h-3 mr-1 inline" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-2 text-center">
                  {app.description}
                </p>

                <div className="text-center">
                  <Button asChild variant="default" size="sm" className="bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-white">
                    <a href={`/app/${app.slug || 'unknown'}`}>
                      View Details
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Loading apps...</h3>
            <p className="text-gray-600 dark:text-gray-400">Fetching from blockchain</p>
          </div>
        )}

        {!loading && apps.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800 dark:bg-gray-800 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400 dark:text-gray-400 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No apps available</h3>
            <p className="text-gray-600 dark:text-gray-400">Check back later for new mini-apps!</p>
          </div>
        )}
      </div>
    </div>
  );
}
