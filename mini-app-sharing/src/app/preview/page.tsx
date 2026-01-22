'use client';

import { useState } from 'react';

interface PreviewData {
  image?: string;
  title?: string;
  description?: string;
  siteName?: string;
}

export default function PreviewPage() {
  const [url, setUrl] = useState('');
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [error, setError] = useState('');

  const fetchPreview = async () => {
    if (!url) return;

    try {
      setError('');
      const response = await fetch(`/api/preview?url=${encodeURIComponent(url)}`);
      if (!response.ok) throw new Error('Failed to fetch preview');
      const data = await response.json();
      setPreviewData(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load preview';
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">OG Image Preview</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-sm font-medium mb-2">
            Enter Share URL:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://localhost:3000/app/social/share?data=..."
              className="flex-1 px-4 py-2 border rounded-lg"
            />
            <button
              onClick={fetchPreview}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Preview
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {previewData && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Preview Card:</h2>

            <div className="border rounded-lg p-4 mb-4" style={{ maxWidth: '550px' }}>
              {previewData.image && (
                <img
                  src={previewData.image}
                  alt="OG Image"
                  className="w-full rounded-t-lg mb-3"
                  style={{ maxHeight: '290px', objectFit: 'cover' }}
                />
              )}
              <div className="p-3">
                <div className="text-blue-600 text-sm mb-1">{previewData.siteName || 'Move Everything'}</div>
                <div className="font-bold text-lg mb-1">{previewData.title}</div>
                <div className="text-gray-600 text-sm">{previewData.description}</div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-bold mb-2">OG Image URL:</h3>
              <code className="bg-gray-100 p-2 rounded block break-all">
                {previewData.image}
              </code>
            </div>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600">
          <p><strong>Tip:</strong> For Twitter/X preview, use <a href="https://cards-dev.twitter.com/validator" target="_blank" className="text-blue-600 underline">Twitter Card Validator</a></p>
          <p className="mt-2">For localhost URLs, just visit the URL directly in your browser to see the share page.</p>
        </div>
      </div>
    </div>
  );
}

