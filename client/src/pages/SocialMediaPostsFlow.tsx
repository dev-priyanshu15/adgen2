import { useState, useRef } from "react";
import { LoadingState } from "@/components/LoadingState";
import { ArrowLeft, Copy, Check, Share2, Download } from "lucide-react";

interface SocialMediaPostsFlowProps {
  adCopy: any;
  productName?: string;
  onBack: () => void;
  onNext: () => void;
}

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

export default function SocialMediaPostsFlow({ adCopy, productName, onBack, onNext }: SocialMediaPostsFlowProps) {
  const [posts, setPosts] = useState<SocialPost | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  const generatePosts = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/social/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: productName || "Premium Product",
          headline: adCopy.headline,
          description: adCopy.description,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate posts");

      const data = await response.json();
      setPosts(data);

      // Generate banner image
      const bannerResponse = await fetch("/api/social/banner-ad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: productName || "Premium Product",
          headline: adCopy.headline,
          description: adCopy.description,
        }),
      });

      if (bannerResponse.ok) {
        const bannerData = await bannerResponse.json();
        setBannerImage(bannerData.bannerImage);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadBanner = async () => {
    if (!bannerImage) {
      console.error("No banner image available");
      return;
    }
    try {
      const link = document.createElement("a");
      link.href = bannerImage;
      link.download = `${productName || "social"}-banner.jpg`;
      link.click();
    } catch (err) {
      console.error("Failed to download banner:", err);
    }
  };

  const downloadBannerAsImage = async () => {
    if (!bannerRef.current) return;
    try {
      // Try using html2canvas if available
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
      script.onload = async () => {
        const html2canvas = (window as any).html2canvas;
        if (html2canvas) {
          const canvas = await html2canvas(bannerRef.current, {
            backgroundColor: "#ffffff",
            scale: 2,
          });
          const link = document.createElement("a");
          link.href = canvas.toDataURL("image/png");
          link.download = `${productName || "social"}-banner.png`;
          link.click();
        } else {
          downloadBanner();
        }
      };
      document.body.appendChild(script);
    } catch (err) {
      console.error("Failed to download banner as image:", err);
      // Fallback
      downloadBanner();
    }
  };

  const formatTwitterPost = (post: SocialPost["twitter"]) => {
    const hashtags = post.hashtags.map(tag => `#${tag}`).join(" ");
    return `${post.content}\n\n${hashtags}`;
  };

  const formatInstagramPost = (post: SocialPost["instagram"]) => {
    const hashtags = post.hashtags.map(tag => `#${tag}`).join(" ");
    return `${post.caption}\n\n${hashtags}\n\n${post.call_to_action}`;
  };

  const formatLinkedInPost = (post: SocialPost["linkedin"]) => {
    const hashtags = post.hashtags.map(tag => `#${tag}`).join(" ");
    return `${post.content}\n\n${hashtags}\n\n${post.call_to_action}`;
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
            <Share2 className="w-6 h-6 inline-block mr-2" style={{ color: 'var(--accent)' }} />
            Social Media Posts & Banner Ad
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>Professional banner ads with platform-specific posts</p>
        </div>

        {!posts && !loading && (
          <div className="rounded-lg p-8 mb-8" style={{ background: 'var(--surface)', border: '1px solid var(--border-raw)' }}>
            <p className="mb-6" style={{ color: 'var(--text-muted)', fontSize: 14 }}>Generate a professional social media banner with platform-specific posts.</p>
            <button
              onClick={generatePosts}
              className="btn-cta inline-flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Generate Banner & Posts
            </button>
            {error && <p className="mt-4 text-sm" style={{ color: '#ef4444' }}>{error}</p>}
          </div>
        )}

        {loading && <LoadingState />}

        {posts && (
          <>
            {/* Banner Ad Display - Newspaper Style White Banner */}
            {bannerImage ? (
              <div className="mb-12">
                {/* Main Banner Ad - This is the printable banner */}
                <div ref={bannerRef} className="bg-white border-4 border-black p-16 shadow-2xl rounded-lg">
                  {/* Decorative Top Border */}
                  <div className="mb-8 flex items-center justify-center">
                    <div className="flex gap-3">
                      <div className="w-4 h-4 bg-black rounded-full"></div>
                      <div className="w-4 h-4 bg-black rounded-full"></div>
                      <div className="w-4 h-4 bg-black rounded-full"></div>
                    </div>
                  </div>

                  {/* Main Headline - Bold and Large */}
                  <h1 className="text-center text-5xl md:text-6xl font-black text-black mb-4 leading-tight tracking-tight">
                    {adCopy.headline}
                  </h1>

                  {/* Subheadline - Italic */}
                  <p className="text-center text-xl md:text-2xl text-gray-800 italic font-light mb-10">
                    {adCopy.description}
                  </p>

                  {/* Decorative Divider */}
                  <div className="border-t-4 border-black my-8"></div>

                  {/* Banner Image - Full Width */}
                  {bannerImage && (
                    <div className="relative rounded-sm overflow-hidden mb-8 border-4 border-black">
                      <img 
                        src={bannerImage} 
                        alt="Social Media Banner Ad" 
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  )}

                  {/* Decorative Divider */}
                  <div className="border-b-4 border-black my-8"></div>

                  {/* CTA Section */}
                  <div className="text-center">
                    <p className="text-3xl md:text-4xl font-black text-black mb-4">
                      Ready to get started?
                    </p>
                    <p className="text-base md:text-lg text-gray-700 font-semibold">
                      Share this banner on your social media • Visit our website • Order now
                    </p>
                  </div>
                </div>

                {/* Download Banner Buttons */}
                <div className="flex justify-center my-8 gap-4 flex-wrap">
                  <button
                    onClick={downloadBannerAsImage}
                    className="btn-cta inline-flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download as PNG
                  </button>
                  <button
                    onClick={downloadBanner}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-colors duration-200"
                    style={{ background: 'var(--surface2)', border: '1px solid var(--border-raw)', color: 'var(--text)' }}
                  >
                    <Download className="w-4 h-4" />
                    Download Original
                  </button>
                </div>

                {/* Hashtags Section Below Banner */}
                <div className="bg-gray-50 border-b-4 border-black p-8 mt-0">
                  <h3 className="text-sm font-black text-black mb-6 uppercase tracking-widest">
                    📱 Recommended Hashtags
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Twitter Hashtags */}
                    <div>
                      <p className="text-xs font-black text-blue-700 mb-3 uppercase">𝕏 TWITTER</p>
                      <div className="flex flex-wrap gap-2">
                        {posts.twitter.hashtags.map((tag, i) => (
                          <span key={i} className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded border border-blue-700">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Instagram Hashtags */}
                    <div>
                      <p className="text-xs font-black text-pink-700 mb-3 uppercase">📸 INSTAGRAM</p>
                      <div className="flex flex-wrap gap-2">
                        {posts.instagram.hashtags.map((tag, i) => (
                          <span key={i} className="bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded border border-pink-700">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* LinkedIn Hashtags */}
                    <div>
                      <p className="text-xs font-black text-blue-700 mb-3 uppercase">💼 LINKEDIN</p>
                      <div className="flex flex-wrap gap-2">
                        {posts.linkedin.hashtags.map((tag, i) => (
                          <span key={i} className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded border border-blue-700">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border-2 border-yellow-200 p-6 mb-8 rounded">
                <p className="text-yellow-800 font-semibold">Banner image is generating. Please check back in a moment.</p>
              </div>
            )}

            {/* Platform Posts - Grid Layout */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--text)' }}>Platform-Specific Posts</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Twitter */}
                <div className="rounded-lg overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border-raw)' }}>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-dim)', border: '1px solid var(--border-raw)' }}>
                        <span className="text-lg" style={{ color: 'var(--text)' }}>𝕏</span>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold" style={{ color: 'var(--text)' }}>Twitter/X</h3>
                        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-dim)' }}>280 CHARACTERS</p>
                      </div>
                    </div>

                    <div className="rounded-lg p-4 min-h-40 mb-4" style={{ background: 'var(--surface2)', border: '1px solid var(--border-raw)' }}>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{posts.twitter.content}</p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {posts.twitter.hashtags.slice(0, 4).map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--border-raw)' }}>#{tag}</span>
                      ))}
                    </div>

                    <button
                      onClick={() => copyToClipboard(formatTwitterPost(posts.twitter), "twitter")}
                      className="w-full py-2 rounded-md text-sm font-medium transition-colors duration-200 inline-flex items-center justify-center gap-2"
                      style={{ background: 'var(--surface2)', border: '1px solid var(--border-raw)', color: 'var(--text)' }}
                    >
                      {copied === "twitter" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied === "twitter" ? "Copied!" : "Copy Post"}
                    </button>
                  </div>
                </div>

                {/* Instagram */}
                <div className="rounded-lg overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border-raw)' }}>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-dim)', border: '1px solid var(--border-raw)' }}>
                        <span className="text-lg">📸</span>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold" style={{ color: 'var(--text)' }}>Instagram</h3>
                        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-dim)' }}>2,200 CHARACTERS</p>
                      </div>
                    </div>

                    <div className="rounded-lg p-4 min-h-40 mb-4" style={{ background: 'var(--surface2)', border: '1px solid var(--border-raw)' }}>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{posts.instagram.caption}</p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {posts.instagram.hashtags.slice(0, 4).map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--border-raw)' }}>#{tag}</span>
                      ))}
                    </div>

                    <button
                      onClick={() => copyToClipboard(formatInstagramPost(posts.instagram), "instagram")}
                      className="w-full py-2 rounded-md text-sm font-medium transition-colors duration-200 inline-flex items-center justify-center gap-2"
                      style={{ background: 'var(--surface2)', border: '1px solid var(--border-raw)', color: 'var(--text)' }}
                    >
                      {copied === "instagram" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied === "instagram" ? "Copied!" : "Copy Caption"}
                    </button>
                  </div>
                </div>

                {/* LinkedIn */}
                <div className="rounded-lg overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border-raw)' }}>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-dim)', border: '1px solid var(--border-raw)' }}>
                        <span className="text-lg">💼</span>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold" style={{ color: 'var(--text)' }}>LinkedIn</h3>
                        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-dim)' }}>3,000 CHARACTERS</p>
                      </div>
                    </div>

                    <div className="rounded-lg p-4 min-h-40 mb-4" style={{ background: 'var(--surface2)', border: '1px solid var(--border-raw)' }}>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{posts.linkedin.content}</p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {posts.linkedin.hashtags.slice(0, 4).map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--border-raw)' }}>#{tag}</span>
                      ))}
                    </div>

                    <button
                      onClick={() => copyToClipboard(formatLinkedInPost(posts.linkedin), "linkedin")}
                      className="w-full py-2 rounded-md text-sm font-medium transition-colors duration-200 inline-flex items-center justify-center gap-2"
                      style={{ background: 'var(--surface2)', border: '1px solid var(--border-raw)', color: 'var(--text)' }}
                    >
                      {copied === "linkedin" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied === "linkedin" ? "Copied!" : "Copy Post"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Navigation */}
        {posts && (
          <div className="flex gap-4 pt-8">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-colors duration-200"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-raw)', color: 'var(--text)' }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
