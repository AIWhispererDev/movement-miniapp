// Blockchain interaction utilities for fetching post data

const MOVEMENT_RPC_URL = 'https://testnet.movementnetwork.xyz/v1/view';
const SOCIAL_MODULE_ADDRESS = '0xe08098cd9db04d38b7962a4e2653c2b7362477943c47e976ed55c624b759580f';

export interface PostData {
  author: string;
  content: string;
  timestamp_ms: number;
  reactions: number;
}

/**
 * Fetches a post from the blockchain using owner address and index
 */
export async function fetchPostFromBlockchain(owner: string, index: number): Promise<PostData | null> {
  try {
    console.log('[Blockchain] Fetching post:', { owner, index, url: MOVEMENT_RPC_URL });

    const response = await fetch(MOVEMENT_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        function: `${SOCIAL_MODULE_ADDRESS}::social::get_post`,
        type_arguments: [],
        arguments: [owner, index.toString()],
      }),
    });

    if (!response.ok) {
      console.error('[Blockchain] Failed to fetch post:', response.status, response.statusText);
      const errorText = await response.text().catch(() => 'Could not read error');
      console.error('[Blockchain] Error response:', errorText);
      return null;
    }

    const result = await response.json();
    console.log('[Blockchain] Fetch result:', JSON.stringify(result));

    // Response is an array with the post as first element (same as social app)
    const post = Array.isArray(result) ? result[0] : result;

    if (!post) {
      console.error('[Blockchain] No post in result:', result);
      return null;
    }

    // Validate that post has required fields (content can be empty string)
    if (typeof post.content !== 'string') {
      console.error('[Blockchain] Post missing or invalid content:', post);
      return null;
    }

    const postData = {
      author: post.author || owner,
      content: post.content || '',
      timestamp_ms: Number(post.timestamp_ms || 0),
      reactions: Number(post.reactions || 0),
    };

    console.log('[Blockchain] Returning post data:', postData);
    return postData;
  } catch (error) {
    console.error('[Blockchain] Error fetching post:', error);
    if (error instanceof Error) {
      console.error('[Blockchain] Error message:', error.message);
      console.error('[Blockchain] Error stack:', error.stack);
    }
    return null;
  }
}

