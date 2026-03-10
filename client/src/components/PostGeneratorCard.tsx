import React, { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';

export function PostGeneratorCard({ productName, tone, adCopy, delay = 100 }: any) {
  const [post, setPost] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generatePost = async () => {
    setLoading(true);
    try {
      const payload: any = {};
      if (productName) payload.productName = productName;
      if (tone) payload.tone = tone;
      if (adCopy) payload.adCopy = adCopy;

      const result = await apiRequest<{ post: string }>('POST', '/api/post/generate', payload);
      setPost(result.post);
    } catch (err: any) {
      setPost('Failed to generate post: ' + (err?.message || 'Unknown'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="p-5 rounded-lg animate-fade-in"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-raw)',
        animationDelay: `${delay}ms`,
      }}
    >
      <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text)' }}>Social Post</h3>
      <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>Generate a short social post based on the ad copy.</p>

      <div className="mb-3">
        <button
          onClick={generatePost}
          disabled={loading}
          className="w-full py-2.5 rounded-md text-sm font-medium transition-colors disabled:opacity-40"
          style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border-raw)',
            color: 'var(--text)',
          }}
        >
          {loading ? 'Generating...' : 'Generate Post'}
        </button>
      </div>

      {post && (
        <div
          className="mt-2 p-3 rounded-md text-sm break-words"
          style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border-raw)',
            color: 'var(--text-muted)',
          }}
        >
          {post}
        </div>
      )}
    </div>
  );
}
