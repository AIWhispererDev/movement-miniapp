import { fetchPostFromBlockchain } from '@/lib/blockchain';
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

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

export const runtime = 'edge';
export const dynamic = 'force-dynamic'; // Disable caching to always generate fresh images

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dataParam = searchParams.get('data');
    const owner = searchParams.get('owner');
    const index = searchParams.get('index');

    console.log('[OG] Request received, dataParam:', dataParam ? 'present' : 'missing', 'owner:', owner, 'index:', index);

    let shareData: ShareData;

    // Handle new prettier format: ?owner=...&index=...
    // Fetch post data from blockchain to ensure authenticity
    if (owner && index !== null && index !== undefined) {
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
        // If fetch fails, return error
        return new Response('Post not found on blockchain', { status: 404 });
      }
    } else if (dataParam) {
      // Fallback to data parameter format
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
        return new Response('Invalid data parameter', { status: 400 });
      }
    } else {
      return new Response('Missing data parameter', { status: 400 });
    }

    // If image_url is provided, return it (though this shouldn't be called in that case)
    if (shareData.image_url) {
      // Redirect to the provided image
      return Response.redirect(shareData.image_url, 302);
    }

    // Generate OG image based on type
    if (shareData.type === 'post') {
      // Extract and type-check metadata
      const metadata = shareData.metadata as PostMetadata | undefined;
      const author = metadata?.author;
      const reactions = metadata?.reactions;
      const authorStr = typeof author === 'string' ? author : null;
      const reactionsNum = typeof reactions === 'number' ? reactions : null;

      try {
        console.log('[OG] Generating post image, content:', shareData.content?.substring(0, 50));

        // Create ImageResponse - this returns a Response, not a Promise
        // Square format (1200x1200) for better mobile viewing
        const response = new ImageResponse(
          (
            <div
              style={{
                width: '1200px',
                height: '1200px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontFamily: 'system-ui',
                padding: '80px',
                position: 'relative',
              }}
            >
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '32px',
                  padding: '60px',
                  width: '100%',
                  maxWidth: '1040px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '30px',
                  flex: 1,
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '56px',
                    fontWeight: 'bold',
                    marginBottom: '16px',
                    display: 'flex',
                  }}
                >
                  Move Everything
                </div>
                <div
                  style={{
                    fontSize: '40px',
                    fontWeight: '600',
                    marginBottom: '30px',
                    opacity: 0.9,
                    display: 'flex',
                  }}
                >
                  📱 Social Post
                </div>

                <div
                  style={{
                    fontSize: '44px',
                    lineHeight: '1.5',
                    overflow: 'hidden',
                    wordBreak: 'break-word',
                    display: 'flex',
                    marginBottom: '20px',
                  }}
                >
                  {String(shareData.content || 'Shared post from Move Everything').substring(0, 150)}
                </div>

                {(authorStr || reactionsNum !== null) && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '40px',
                      fontSize: '28px',
                      marginTop: '30px',
                    }}
                  >
                    {authorStr !== null && (() => {
                      // We know authorStr is not null from the check above
                      const author = authorStr!;
                      return author.length >= 10 ? (
                        <div style={{ display: 'flex' }}>
                          👤 {author.slice(0, 6)}...{author.slice(-4)}
                        </div>
                      ) : (
                        <div style={{ display: 'flex' }}>👤 {author}</div>
                      );
                    })()}
                    {reactionsNum !== null && (
                      <div style={{ display: 'flex' }}>
                        ❤️ {reactionsNum}
                      </div>
                    )}
                  </div>
                )}

                <div
                  style={{
                    position: 'absolute',
                    bottom: '80px',
                    right: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    fontSize: '24px',
                    fontWeight: '600',
                  }}
                >
                  <div
                    style={{
                      background: 'white',
                      borderRadius: '16px',
                      width: '64px',
                      height: '64px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      color: '#667eea',
                      fontSize: '28px',
                    }}
                  >
                    ME
                  </div>
                  <span>Move Everything</span>
                </div>
              </div>
            </div>
          ),
          {
            width: 1200,
            height: 1200,
          }
        );

        // Return ImageResponse directly - it's already a Response object
        // Set proper headers for social media crawlers (Twitter, Discord, Telegram)
        response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
        response.headers.set('Content-Type', 'image/png');
        // Allow all origins to fetch the image (required for Discord/Twitter)
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        // Override robots tag to allow indexing (Discord/Twitter require this)
        response.headers.set('x-robots-tag', 'index, follow');
        return response;
      } catch (imageError) {
        console.error('[OG] ImageResponse error:', imageError);
        console.error('[OG] Error stack:', imageError instanceof Error ? imageError.stack : 'No stack');
        console.error('[OG] Error details:', JSON.stringify(imageError, Object.getOwnPropertyNames(imageError)));
        // If ImageResponse fails, return a simple error response
        return new Response(`Failed to generate image: ${imageError instanceof Error ? imageError.message : String(imageError)}`, { status: 500 });
      }
    }

    // Generic fallback for other types
    const fallbackResponse = new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '630px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontFamily: 'system-ui',
            padding: '60px',
          }}
        >
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '24px',
              padding: '60px',
              width: '100%',
              maxWidth: '1000px',
              display: 'flex',
              flexDirection: 'column',
              gap: '30px',
            }}
          >
            <div
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                marginBottom: '20px',
              }}
            >
              🎮 Shared Content
            </div>

            <div
              style={{
                fontSize: '36px',
                lineHeight: '1.4',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                wordBreak: 'break-word',
              }}
            >
              {shareData.content || 'Shared from Move Everything'}
            </div>

            <div
              style={{
                position: 'absolute',
                bottom: '40px',
                right: '40px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '20px',
                fontWeight: '600',
              }}
            >
              <div
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  color: '#667eea',
                }}
              >
                ME
              </div>
              <span>Move Everything</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
    // Return ImageResponse directly with cache headers
    fallbackResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    fallbackResponse.headers.set('Pragma', 'no-cache');
    fallbackResponse.headers.set('Expires', '0');
    return fallbackResponse;
  } catch (error: unknown) {
    console.error('Error generating OG image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    // Return a simple error image instead of text
    return new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '630px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontFamily: 'system-ui',
            fontSize: '32px',
          }}
        >
          Error: {errorMessage}
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}

