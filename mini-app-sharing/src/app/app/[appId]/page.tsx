import AppPageContent from '@/components/AppPageContent';
import { appRegistryService } from '@/lib/app-registry';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface AppPageProps {
  params: Promise<{
    appId: string;
  }>;
}

export async function generateMetadata({ params }: AppPageProps): Promise<Metadata> {
  const { appId } = await params;
  const app = await appRegistryService.getApp(appId);

  if (!app) {
    return {
      title: 'App Not Found - Move Everything',
      description: 'The requested mini-app could not be found.',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mini-app-sharing.vercel.app';
  const shareUrl = `${baseUrl}/app/${appId}`;
  const ogImageUrl = app.icon; // Use the app icon directly as OG image

  return {
    title: `${app.name} - Move Everything Mini-App`,
    description: app.description,
    keywords: [
      'Move Everything',
      'mini-app',
      app.category,
      app.name,
      'blockchain',
      'Web3',
      'Move',
    ],
    authors: [{ name: app.developer_name }],
    openGraph: {
      title: `${app.name} - Move Everything Mini-App`,
      description: app.description,
      url: shareUrl,
      siteName: 'Move Everything',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${app.name} - Move Everything Mini-App`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${app.name} - Move Everything Mini-App`,
      description: app.description,
      images: [ogImageUrl],
      creator: '@moveeverything',
      site: '@moveeverything',
    },
    alternates: {
      canonical: shareUrl,
    },
  };
}

export default async function AppPage({ params }: AppPageProps) {
  const { appId } = await params;
  const app = await appRegistryService.getApp(appId);

  if (!app) {
    notFound();
  }

  const formattedRating = appRegistryService.formatAppRating(app);
  const isApproved = appRegistryService.isAppApproved(app);

  return (
    <AppPageContent
      app={app}
      appId={appId}
      formattedRating={formattedRating}
      isApproved={isApproved}
    />
  );
}
