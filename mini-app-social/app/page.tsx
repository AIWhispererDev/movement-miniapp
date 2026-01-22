"use client";

import { useEffect, useState } from "react";
import { useMovementSDK, type MovementSDK } from "@movement-labs/miniapp-sdk";
import { SOCIAL_MODULE_ADDRESS } from "../constants";

type Post = {
  id: string;
  author: string;
  content: string;
  image_url: string; // Image URL or empty string
  timestamp: number;
  reactions: number;
  owner: string; // canonical owner for reactions
  ownerIndex: number; // index in owner's feed
};

export default function SocialPage() {
  // Use the SDK hook for proper types and state management
  const { sdk, isConnected, address, isLoading: sdkLoading } = useMovementSDK();

  const [posts, setPosts] = useState<Post[]>([]);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string>("");
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);
  const [globalCount, setGlobalCount] = useState<number>(0);

  // Local cache for global feed - include contract address to clear old cache when address changes
  const storageKey = `social_posts_global_${SOCIAL_MODULE_ADDRESS}`;

  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setPosts(JSON.parse(raw));
    } catch { }
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(posts));
    } catch { }
  }, [posts, storageKey]);

  const fetchFeed = async () => {
    try {
      setIsLoadingFeed(true);

      // Wait for SDK to be ready
      if (!sdk) {
        console.error("[Social] SDK not available yet");
        setPosts([]);
        return;
      }

      console.log("[Social] Using SDK view function");

      // Read global count using Movement SDK
      const countResult = await sdk.view({
        function: `${SOCIAL_MODULE_ADDRESS}::social::get_global_count`,
        type_arguments: [],
        function_arguments: [],
      });

      // SDK view returns the result directly, which may be an array
      const count = Array.isArray(countResult) ? countResult[0] : countResult;
      const total = Number(count || 0);
      setGlobalCount(total);

      if (total === 0) {
        setPosts([]);
        return;
      }

      const indices = Array.from({ length: total }, (_, i) => i);
      const results = await Promise.all(
        indices.map(async (i) => {
          try {
            // 1) get pointer (owner, index) using Movement SDK
            if (!sdk) return null;

            const ptrResult = await sdk.view({
              function: `${SOCIAL_MODULE_ADDRESS}::social::get_global_pointer`,
              type_arguments: [],
              function_arguments: [`${i}`],
            });

            // SDK view returns the result directly, which may be an array
            // get_global_pointer returns a tuple (owner, index)
            let ptrData: any;
            if (Array.isArray(ptrResult)) {
              // If it's an array, check if it's wrapped: [[owner, idx]] or [owner, idx]
              if (ptrResult.length === 1 && Array.isArray(ptrResult[0])) {
                ptrData = ptrResult[0]; // Unwrap: [[owner, idx]] -> [owner, idx]
              } else {
                ptrData = ptrResult; // Already [owner, idx]
              }
            } else {
              ptrData = [ptrResult];
            }

            const [owner, idx] = ptrData;

            if (!owner || idx === undefined) {
              console.warn("[Social] get_global_pointer returned invalid data", i, "result:", ptrResult, "parsed:", ptrData);
              return null;
            }

            // 2) get post for that owner/index using Movement SDK
            const postResult = await sdk.view({
              function: `${SOCIAL_MODULE_ADDRESS}::social::get_post`,
              type_arguments: [],
              function_arguments: [owner, `${idx}`],
            });

            // SDK view returns the result directly, which may be an array
            // get_post returns a Post struct
            let postData: any;
            if (Array.isArray(postResult)) {
              // If it's an array, check if it's wrapped: [[Post]] or [Post]
              if (postResult.length === 1 && typeof postResult[0] === 'object' && !Array.isArray(postResult[0])) {
                postData = postResult[0]; // Unwrap: [{...}] -> {...}
              } else if (postResult.length > 0 && typeof postResult[0] === 'object') {
                postData = postResult[0]; // Already [{...}]
              } else {
                postData = postResult;
              }
            } else {
              postData = postResult;
            }

            if (!postData || !postData.author || !postData.content) {
              console.warn("[Social] get_post failed for", owner, idx, "result:", postResult, "parsed:", postData);
              return null;
            }

            console.log("[Social] Fetched post", i, postData);

            return {
              id: `global-${i}`,
              author: postData.author,
              content: postData.content,
              image_url: "", // Images not supported
              timestamp: Number(postData.timestamp_ms || 0),
              reactions: Number(postData.reactions || 0),
              owner,
              ownerIndex: Number(idx || 0),
            } as Post;
          } catch (e) {
            console.warn("[Social] Failed to fetch post", i, e);
            return null;
          }
        }),
      );
      const cleaned = results.filter(Boolean) as Post[];
      console.log("[Social] Fetched feed:", cleaned.length, "posts", cleaned);
      setPosts(cleaned.reverse());
    } catch (e) {
      console.error("[Social] Failed to fetch feed", e);
    } finally {
      setIsLoadingFeed(false);
    }
  };

  const handlePost = async () => {
    if (!sdk || !address) {
      setError("Connect wallet first");
      return;
    }
    const trimmed = message.trim();
    if (!trimmed) {
      setError("Write something to post");
      return;
    }

    setIsSending(true);
    setError("");

    try {
      // Call deployed Move module: <MODULE_ADDRESS>::social::post(string)
      await sdk.haptic?.({ type: "impact", style: "light" });
      const result = await sdk.sendTransaction({
        function: `${SOCIAL_MODULE_ADDRESS}::social::post`,
        type_arguments: [],
        arguments: [trimmed],
        title: "Social: Post",
        description: "Publish a post to the Social feed",
        useFeePayer: true,
        feePayerUrl: (sdk as any)?.config?.feePayerUrl,
        gasLimit: "Sponsored",
      });
      console.log("[Social] Tx hash:", result?.hash);
      setMessage("");
      await fetchFeed();
      await sdk.notify?.({
        title: "Posted on Social",
        body: "Your message is recorded",
      });
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Failed to post";
      setError(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const addReaction = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, reactions: p.reactions + 1 } : p,
      ),
    );
  };

  const handleReact = async (owner: string, ownerIndex: number) => {
    if (!sdk || !address) {
      setError("Connect wallet first");
      return;
    }
    try {
      const result = await sdk.sendTransaction({
        function: `${SOCIAL_MODULE_ADDRESS}::social::react`,
        type_arguments: [],
        arguments: [owner, `${ownerIndex}`],
        title: "React",
        description: "Add a reaction",
        useFeePayer: true,
        feePayerUrl: (sdk as any)?.config?.feePayerUrl,
        gasLimit: "Sponsored",
      });
      console.log("[Social] React tx:", result?.hash);
      await fetchFeed();
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Failed to react";
      setError(errorMessage);
    }
  };

  const handleShare = async (post: Post) => {
    try {
      // Create share data
      const shareData = {
        type: "post",
        content: post.content,
        owner: post.owner,
        index: post.ownerIndex,
        image_url: "",
        metadata: {
          author: post.author,
          reactions: post.reactions,
          timestamp: post.timestamp,
        },
      };

      // Generate share URL - use cleaner ?owner=&index= format
      // This is shorter, works on all platforms, and fetches from blockchain for authenticity
      const baseUrl =
        process.env.NEXT_PUBLIC_SHARING_URL ||
        "https://mini-app-sharing.vercel.app";

      // Use prettier URL format for posts: /app/social/share?owner=0x...&index=3
      // Only pass owner and index - content/reactions will be fetched from blockchain
      const params = new URLSearchParams({
        owner: shareData.owner,
        index: shareData.index.toString(),
      });
      const shareUrl = `${baseUrl}/app/social/share?${params.toString()}`;

      // Try using SDK share method if available
      if (sdk?.share && typeof sdk.share === "function") {
        try {
          console.log("[Share] Attempting SDK share with URL:", shareUrl);
          await sdk.share({
            title: "Social Post from Move Everything",
            message: shareUrl, // Share the URL, not the post text - the URL contains all the data
            url: shareUrl,
          });
          console.log("[Share] SDK share completed successfully");
          setError("");
          return;
        } catch (shareError) {
          console.error("[Share] SDK share failed:", shareError);
          console.warn(
            "SDK share failed, falling back to clipboard:",
            shareError,
          );
          // Fall through to clipboard fallback
        }
      } else {
        console.log(
          "[Share] SDK share not available, using clipboard fallback",
        );
      }

      // Fallback: Copy to clipboard if SDK share not available
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(shareUrl)
          .then(() => {
            setError("");
            // Show success notification
            if (sdk?.notify) {
              sdk.notify({
                title: "Link Copied!",
                body: "Share link copied to clipboard",
              });
            } else {
              alert("Share link copied to clipboard!");
            }
            console.log("Share URL:", shareUrl);
          })
          .catch((err) => {
            console.error("Clipboard error:", err);
            // Fallback: show URL in alert
            alert(`Share URL:\n${shareUrl}`);
            setError("");
          });
      } else {
        // Fallback if clipboard API not available
        alert(`Share URL:\n${shareUrl}`);
        setError("");
        console.log("Share URL:", shareUrl);
      }
    } catch (error: unknown) {
      console.error("Share error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setError(`Failed to share: ${errorMessage}`);
    }
  };

  const shorten = (addr: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  useEffect(() => {
    fetchFeed();
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0F1E] p-4">
      <div className="max-w-md w-full mx-auto py-4">
        <div className="bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#06B6D4] rounded-2xl p-6 mb-4 shadow-xl">
          <div className="text-white/80 text-sm mb-1">Social on Movement</div>
          <div className="text-3xl font-bold text-white mb-2">
            Say it onchain
          </div>
          {address && (
            <div className="text-white/80 text-xs font-mono">
              {shorten(address)}
            </div>
          )}
          <div className="text-white/80 text-xs font-mono mt-2">
            Network: {sdk?.network || "unknown"}
          </div>
        </div>

        <div className="bg-[#1A1F2E] rounded-2xl overflow-hidden shadow-2xl mb-4">
          <div className="bg-gradient-to-r from-[#06B6D4]/20 to-[#6366F1]/20 px-5 py-4 border-b border-gray-700">
            <h1 className="text-xl font-bold text-white">Create Post</h1>
            <p className="text-sm text-gray-400">What do you want to say?</p>
          </div>
          <div className="p-5">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your thoughts..."
              rows={4}
              className="w-full px-4 py-3 bg-[#0A0F1E] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent text-base"
            />

            {error && (
              <div className="mt-3 bg-red-100 border border-red-400 rounded-lg p-3 text-sm text-red-900 font-semibold">
                {error}
              </div>
            )}
            <button
              onClick={handlePost}
              disabled={!isConnected || isSending}
              className={`mt-4 w-full font-semibold py-4 px-6 rounded-xl transition-all shadow-lg ${!isConnected || isSending
                ? "bg-gray-700 text-gray-400 cursor-not-allowed opacity-50"
                : "bg-[#06B6D4] hover:bg-[#0891B2] text-black cursor-pointer active:scale-95"
                }`}
            >
              {isSending
                ? "Posting..."
                : isConnected
                  ? "Post to Social"
                  : "Connect Wallet First"}
            </button>
          </div>
        </div>

        <div className="bg-[#1A1F2E] rounded-2xl p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <p className="text-base font-semibold text-white">Recent Posts</p>
            <span className="text-xs text-gray-400">
              Global count: {globalCount}
            </span>
          </div>
          <div className="space-y-3">
            {isLoadingFeed && (
              <p className="text-sm text-gray-500">Loading feed…</p>
            )}
            {!isLoadingFeed && posts.length === 0 && (
              <p className="text-sm text-gray-500">
                No posts yet. Be the first!
              </p>
            )}
            {posts.map((p) => (
              <div
                key={p.id}
                className="bg-[#0A0F1E] rounded-xl p-4 border border-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400 font-mono">
                    {shorten(p.author)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(p.timestamp).toLocaleString()}
                  </span>
                </div>
                {p.content && (
                  <p className="text-sm text-gray-200 whitespace-pre-wrap mb-3">
                    {p.content}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-3">
                  <button
                    onClick={() => handleReact(p.owner, p.ownerIndex)}
                    className="text-xs px-3 py-1 rounded-lg bg-[#06B6D4]/10 text-[#06B6D4] hover:bg-[#06B6D4]/20 font-bold"
                  >
                    ❤️ {p.reactions}
                  </button>
                  <button
                    onClick={() => handleShare(p)}
                    className="text-xs px-3 py-1 rounded-lg bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 font-bold"
                  >
                    🔗 Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
