import { useState } from 'react';
import { LoadingState } from '@/components/LoadingState';
import { Copy, Check, Twitter, Instagram, Linkedin } from 'lucide-react';
import { apiRequest } from "@/lib/queryClient";

interface SocialPost {
  twitter: {
    content: string;
    hashtags: string[];
  };
  instagram: {
    caption: string;
    hashtags: string[];
    call_to_action: string;
  };
  linkedin: {
    content: string;
    hashtags: string[];
    call_to_action: string;
  };
}

interface SocialMediaAdsProps {
  onBack?: () => void;
  params?: any;
  path?: string;
}

export default function SocialMediaAds(props: SocialMediaAdsProps = {}) {
  const { onBack } = props;
  const [productName, setProductName] = useState('');
  const [headline, setHeadline] = useState('');
  const [description, setDescription] = useState('');
  const [posts, setPosts] = useState<SocialPost | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const generatePosts = async () => {
    if (!productName || !headline || !description) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Generate posts
      const postsData = await apiRequest<SocialPost>('POST', '/api/social/posts', { productName, headline, description });
      setPosts(postsData);

      // Generate banner ad
      try {
        const bannerData = await apiRequest<any>('POST', '/api/social/banner-ad', { productName, headline, description });
        setBannerImage(bannerData.bannerImage);
      } catch (bannerErr) {
        console.warn("Banner generation failed:", bannerErr);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatTwitterPost = (post: SocialPost['twitter']) => {
    const hashtags = post.hashtags.map(tag => `#${tag}`).join(' ');
    return `${post.content}\n\n${hashtags}`;
  };

  const formatInstagramPost = (post: SocialPost['instagram']) => {
    const hashtags = post.hashtags.map(tag => `#${tag}`).join(' ');
    return `${post.caption}\n\n${hashtags}\n\n${post.call_to_action}`;
  };

  const formatLinkedInPost = (post: SocialPost['linkedin']) => {
    const hashtags = post.hashtags.map(tag => `#${tag}`).join(' ');
    return `${post.content}\n\n${hashtags}\n\n${post.call_to_action}`;
  };

  return (
    <div className="min-h-screen p-10 px-6" style={{ background: '#f0f2f5' }}>
      <div className="max-w-[700px] mx-auto">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'white',
            border: '1px solid #e8eaed',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '14px',
            color: '#6b7280',
            cursor: 'pointer',
            marginBottom: '24px',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = '#ea580c'
            e.currentTarget.style.color = '#ea580c'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = '#e8eaed'
            e.currentTarget.style.color = '#6b7280'
          }}
        >
          ← Back
        </button>

        {/* Title Section */}
        <div className="mb-8">
          <div style={{ 
            fontFamily: "'JetBrains Mono', monospace", 
            fontSize: '11px', 
            color: '#ea580c', 
            letterSpacing: '0.1em', 
            fontWeight: 700, 
            marginBottom: '8px', 
            textTransform: 'uppercase' 
          }}>
            SOCIAL MEDIA
          </div>
          <h1 className="text-[28px] font-bold text-[#111827] mb-1">Social Media Ad Generator</h1>
          <p className="text-[14px] text-[#6b7280]">
            Create platform-specific posts for Twitter, Instagram, and LinkedIn with banner ads
          </p>
        </div>

        {/* Input Section */}
        <div 
          className="bg-white p-8 mb-8" 
          style={{ border: '1px solid #e8eaed', borderRadius: '16px' }}
        >
          <div className="space-y-6">
            <div>
              <label style={{ 
                fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 600, 
                letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7280', 
                marginBottom: '8px', display: 'block' 
              }}>
                Product Name
              </label>
              <input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g., Premium Coffee Maker"
                className="w-full transition-colors"
                style={{ 
                  background: 'white', border: '1px solid #e8eaed', borderRadius: '8px', 
                  padding: '12px', fontSize: '14px', color: '#111827', outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ea580c'}
                onBlur={(e) => e.target.style.borderColor = '#e8eaed'}
              />
            </div>

            <div>
              <label style={{ 
                fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 600, 
                letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7280', 
                marginBottom: '8px', display: 'block' 
              }}>
                Headline
              </label>
              <input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g., Brew Perfect Coffee Every Time"
                className="w-full transition-colors"
                style={{ 
                  background: 'white', border: '1px solid #e8eaed', borderRadius: '8px', 
                  padding: '12px', fontSize: '14px', color: '#111827', outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ea580c'}
                onBlur={(e) => e.target.style.borderColor = '#e8eaed'}
              />
            </div>

            <div>
              <label style={{ 
                fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 600, 
                letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7280', 
                marginBottom: '8px', display: 'block' 
              }}>
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Advanced brewing technology with smart temperature control"
                rows={3}
                className="w-full transition-colors resize-none"
                style={{ 
                  background: 'white', border: '1px solid #e8eaed', borderRadius: '8px', 
                  padding: '12px', fontSize: '14px', color: '#111827', outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ea580c'}
                onBlur={(e) => e.target.style.borderColor = '#e8eaed'}
              />
            </div>

            <button
              onClick={generatePosts}
              disabled={loading}
              className="w-full transition-all flex items-center justify-center gap-2"
              style={{ 
                background: '#ea580c', color: 'white', border: 'none', borderRadius: '8px', 
                padding: '14px', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                opacity: loading ? 0.6 : 1
              }}
              onMouseOver={(e) => { if (!loading) { e.currentTarget.style.background = '#dc4a08'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
              onMouseOut={(e) => { if (!loading) { e.currentTarget.style.background = '#ea580c'; e.currentTarget.style.transform = 'translateY(0)'; } }}
            >
              {loading ? 'Generating...' : 'Generate Social Media Posts & Banner'}
            </button>

            {error && <p style={{ color: '#ef4444', fontSize: 13, textAlign: 'center' }}>{error}</p>}
          </div>
        </div>

        {loading && <LoadingState />}
      </div>

      <div className="max-w-7xl mx-auto mt-12 px-6">
        {/* Banner Image Display */}
        {bannerImage && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>Banner Ad Image</h2>
            <div className="rounded-lg p-4" style={{ background: 'white', border: '1px solid #e8eaed' }}>
              <img
                src={bannerImage}
                alt="Social Media Banner Ad"
                className="w-full rounded-lg max-h-96 object-cover"
              />
            </div>
          </div>
        )}

        {/* Social Media Posts Display */}
        {posts && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Twitter Post */}
            <div className="rounded-lg p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border-raw)' }}>
              <div className="flex items-center gap-2 mb-4">
                <Twitter className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                <h3 className="text-base font-semibold" style={{ color: 'var(--text)' }}>Twitter/X</h3>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg p-4 min-h-32" style={{ background: 'var(--surface2)', border: '1px solid var(--border-raw)' }}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {posts.twitter.content}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {posts.twitter.hashtags.map((tag, i) => (
                    <span key={i} className="text-xs" style={{ color: 'var(--accent)', fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>#{tag}</span>
                  ))}
                </div>

                <button
                  onClick={() => copyToClipboard(formatTwitterPost(posts.twitter), 'twitter')}
                  className="w-full py-2 rounded-md text-sm font-medium transition-colors duration-200 inline-flex items-center justify-center gap-2"
                  style={{ background: 'var(--surface2)', border: '1px solid var(--border-raw)', color: 'var(--text)' }}
                >
                  {copied === 'twitter' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied === 'twitter' ? 'Copied!' : 'Copy Post'}
                </button>
              </div>
            </div>

            {/* Instagram Post */}
            <div className="rounded-lg p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border-raw)' }}>
              <div className="flex items-center gap-2 mb-4">
                <Instagram className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                <h3 className="text-base font-semibold" style={{ color: 'var(--text)' }}>Instagram</h3>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg p-4 min-h-32" style={{ background: 'var(--surface2)', border: '1px solid var(--border-raw)' }}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {posts.instagram.caption}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {posts.instagram.hashtags.map((tag, i) => (
                    <span key={i} className="text-xs" style={{ color: 'var(--accent)', fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>#{tag}</span>
                  ))}
                </div>

                <button
                  onClick={() => copyToClipboard(formatInstagramPost(posts.instagram), 'instagram')}
                  className="w-full py-2 rounded-md text-sm font-medium transition-colors duration-200 inline-flex items-center justify-center gap-2"
                  style={{ background: 'var(--surface2)', border: '1px solid var(--border-raw)', color: 'var(--text)' }}
                >
                  {copied === 'instagram' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied === 'instagram' ? 'Copied!' : 'Copy Caption'}
                </button>
              </div>
            </div>

            {/* LinkedIn Post */}
            <div className="rounded-lg p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border-raw)' }}>
              <div className="flex items-center gap-2 mb-4">
                <Linkedin className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                <h3 className="text-base font-semibold" style={{ color: 'var(--text)' }}>LinkedIn</h3>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg p-4 min-h-32" style={{ background: 'var(--surface2)', border: '1px solid var(--border-raw)' }}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {posts.linkedin.content}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {posts.linkedin.hashtags.map((tag, i) => (
                    <span key={i} className="text-xs" style={{ color: 'var(--accent)', fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>#{tag}</span>
                  ))}
                </div>

                <button
                  onClick={() => copyToClipboard(formatLinkedInPost(posts.linkedin), 'linkedin')}
                  className="w-full py-2 rounded-md text-sm font-medium transition-colors duration-200 inline-flex items-center justify-center gap-2"
                  style={{ background: 'var(--surface2)', border: '1px solid var(--border-raw)', color: 'var(--text)' }}
                >
                  {copied === 'linkedin' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied === 'linkedin' ? 'Copied!' : 'Copy Post'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
