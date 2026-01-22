import OpenInAppButton from '@/components/OpenInAppButton';
import { fetchPostFromBlockchain } from '@/lib/blockchain';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface SharePageProps {
  params: Promise<{
    appId: string;
  }>;
  searchParams: Promise<{
    data?: string;
    owner?: string;
    index?: string;
  }>;
}

interface PostMetadata {
  author?: string;
  reactions?: number;
  timestamp?: number;
}

interface ShareData {
  type: string;
  content: string;
  image_url?: string;
  owner?: string;
  index?: number;
  metadata?: PostMetadata | Record<string, unknown>;
}

export async function generateMetadata({ params, searchParams }: SharePageProps): Promise<Metadata> {
  const { appId } = await params;
  const searchParamsObj = await searchParams;
  const { data: dataParam, owner, index } = searchParamsObj;

  let shareData: ShareData;

  // Handle new prettier format: ?owner=...&index=...
  // Fetch post data from blockchain to ensure authenticity
  if (owner && index !== undefined && appId === 'social') {
    const postData = await fetchPostFromBlockchain(owner, parseInt(index, 10));
    if (postData) {
      shareData = {
        type: 'post',
        content: postData.content,
        owner: owner,
        index: parseInt(index, 10),
        image_url: '', // Images not stored on-chain
        metadata: {
          author: postData.author,
          reactions: postData.reactions,
          timestamp: postData.timestamp_ms,
        },
      };
    } else {
      // If fetch fails, return default metadata
      return {
        title: 'Share - Move Everything',
        description: 'Share content from Move Everything mini-apps',
      };
    }
  } else if (dataParam) {
    // Fallback to data parameter format
    try {
      // Decode UTF-8 safe base64 (modern approach using TextDecoder)
      const binaryString = atob(dataParam);
      const utf8Bytes = Uint8Array.from(binaryString, (c) => c.charCodeAt(0));
      const decodedString = new TextDecoder().decode(utf8Bytes);
      shareData = JSON.parse(decodedString);
    } catch {
      return {
        title: 'Share - Move Everything',
        description: 'Share content from Move Everything mini-apps',
      };
    }
  } else {
    return {
      title: 'Share - Move Everything',
      description: 'Share content from Move Everything mini-apps',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mini-app-sharing.vercel.app';

  // Generate share URL - use prettier format if possible
  let shareUrl: string;
  if (owner && index !== undefined) {
    const params = new URLSearchParams({
      owner: owner,
      index: index.toString(),
    });
    shareUrl = `${baseUrl}/app/${appId}/share?${params.toString()}`;
  } else if (dataParam) {
    shareUrl = `${baseUrl}/app/${appId}/share?data=${dataParam}`;
  } else {
    shareUrl = `${baseUrl}/app/${appId}/share`;
  }

  // OG image URL - use provided image_url or generate dynamically
  // For Telegram compatibility: if we have owner/index from decoded data, use that format
  // instead of passing data parameter (Telegram doesn't like query params in OG image URLs)
  let ogImageUrl: string;
  if (shareData.image_url) {
    ogImageUrl = shareData.image_url;
  } else if (owner && index !== undefined) {
    // Use prettier format for OG image URL (only owner and index)
    const params = new URLSearchParams({
      owner: owner,
      index: index.toString(),
    });
    ogImageUrl = `${baseUrl}/api/og/share.png?${params.toString()}`;
  } else if (dataParam && shareData.owner && shareData.index !== undefined && appId === 'social') {
    // Decode data parameter and use owner/index for OG image (better Telegram compatibility)
    const params = new URLSearchParams({
      owner: shareData.owner,
      index: shareData.index.toString(),
    });
    ogImageUrl = `${baseUrl}/api/og/share.png?${params.toString()}`;
  } else if (dataParam) {
    ogImageUrl = `${baseUrl}/api/og/share.png?data=${encodeURIComponent(dataParam)}`;
  } else {
    ogImageUrl = `${baseUrl}/api/og/share.png?data=`;
  }

  // Better title format: Site Name - Post Preview
  const contentPreview = shareData.content ? `${shareData.content.substring(0, 60)}${shareData.content.length > 60 ? '...' : ''}` : 'Shared post';
  const title = `Move Everything - ${contentPreview}`;

  return {
    title: title,
    description: shareData.content || 'Share content from Move Everything mini-apps',
    openGraph: {
      title: title,
      description: shareData.content || 'Share content from Move Everything mini-apps',
      url: shareUrl,
      siteName: 'Move Everything',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 1200,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: shareData.content || 'Share content from Move Everything mini-apps',
      images: [ogImageUrl],
      creator: '@moveeverything',
      site: '@moveeverything',
    },
    alternates: {
      canonical: shareUrl,
    },
  };
}

export default async function SharePage({ params, searchParams }: SharePageProps) {
  const { appId } = await params;
  const searchParamsObj = await searchParams;
  const { data: dataParam, owner, index } = searchParamsObj;

  let shareData: ShareData;

  // Handle new prettier format: ?owner=...&index=...
  // Fetch post data from blockchain to ensure authenticity
  if (owner && index !== undefined && appId === 'social') {
    console.log('[Share] Fetching post from blockchain:', { owner, index: parseInt(index, 10) });
    const postData = await fetchPostFromBlockchain(owner, parseInt(index, 10));
    console.log('[Share] Post data received:', postData ? 'success' : 'null');
    if (postData) {
      shareData = {
        type: 'post',
        content: postData.content,
        owner: owner,
        index: parseInt(index, 10),
        image_url: '', // Images not stored on-chain
        metadata: {
          author: postData.author,
          reactions: postData.reactions,
          timestamp: postData.timestamp_ms,
        },
      };
    } else {
      // If fetch fails, return 404
      console.error('[Share] Failed to fetch post from blockchain, returning 404');
      notFound();
    }
  } else if (dataParam) {
    // Decode data parameter format
    try {
      // Decode UTF-8 safe base64 (modern approach using TextDecoder)
      const binaryString = atob(dataParam);
      const utf8Bytes = Uint8Array.from(binaryString, (c) => c.charCodeAt(0));
      const decodedString = new TextDecoder().decode(utf8Bytes);
      shareData = JSON.parse(decodedString);

      // Ensure content is a string
      if (!shareData.content || typeof shareData.content !== 'string') {
        shareData.content = 'Shared post from Move Everything';
      }
    } catch {
      notFound();
    }
  } else {
    notFound();
  }

  const shorten = (addr: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

  // Generate OG image URL if no image_url provided
  // Use absolute URL for the image so it works correctly
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mini-app-sharing.vercel.app';

  let ogImageUrl: string;
  if (shareData.image_url) {
    ogImageUrl = shareData.image_url;
  } else if (owner && index !== undefined) {
    // Use prettier format for OG image URL (only owner and index)
    const params = new URLSearchParams({
      owner: owner,
      index: index.toString(),
    });
    ogImageUrl = `${baseUrl}/api/og/share?${params.toString()}`;
  } else if (dataParam) {
    ogImageUrl = `${baseUrl}/api/og/share?data=${encodeURIComponent(dataParam)}`;
  } else {
    ogImageUrl = `${baseUrl}/api/og/share?data=`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            {/* Content */}
            {shareData.type === 'post' && (() => {
              const metadata = shareData.metadata as PostMetadata | undefined;

              return (
                <>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Social Post
                  </h1>

                  {/* Display generated OG image */}
                  {(!shareData.image_url || shareData.image_url === '') && ogImageUrl && (
                    <div className="mb-6 rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-100">
                      <img
                        src={ogImageUrl}
                        alt="Share preview"
                        className="w-full object-cover"
                        style={{ minHeight: '300px' }}
                      />
                    </div>
                  )}

                  {shareData.content && (
                    <div className="bg-gray-50 rounded-xl p-6 mb-6">
                      <p className="text-gray-800 text-lg whitespace-pre-wrap leading-relaxed">
                        {shareData.content}
                      </p>
                    </div>
                  )}

                  {shareData.image_url && (
                    <div className="mb-6 rounded-xl overflow-hidden">
                      <img
                        src={shareData.image_url}
                        alt="Post image"
                        className="w-full max-h-96 object-cover"
                      />
                    </div>
                  )}

                  {metadata && (metadata.author || metadata.reactions !== undefined) && (
                    <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
                      {metadata.author && (
                        <span>Author: {shorten(metadata.author)}</span>
                      )}
                      {metadata.reactions !== undefined && (
                        <span>❤️ {metadata.reactions}</span>
                      )}
                    </div>
                  )}
                </>
              );
            })()}

            {/* Generic content for other types */}
            {shareData.type !== 'post' && (
              <>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Shared Content
                </h1>

                {shareData.content && (
                  <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <p className="text-gray-800 text-lg whitespace-pre-wrap leading-relaxed">
                      {shareData.content}
                    </p>
                  </div>
                )}

                {shareData.image_url && (
                  <div className="mb-6 rounded-xl overflow-hidden">
                    <img
                      src={shareData.image_url}
                      alt="Shared image"
                      className="w-full max-h-96 object-cover"
                    />
                  </div>
                )}
              </>
            )}

            {/* Open in App Button */}
            <div className="mt-8">
              <OpenInAppButton
                appId={appId}
                params={{
                  owner: shareData.owner || '',
                  index: shareData.index?.toString() || '',
                }}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

