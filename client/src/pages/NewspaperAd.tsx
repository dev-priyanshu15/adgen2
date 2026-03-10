import { useState } from "react";
import { Link } from "wouter";
import { LoadingState } from "@/components/LoadingState";
import { Zap, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface NewspaperAdData {
  publication_style: string;
  section: string;
  headline: string;
  subheading: string;
  body_text: string;
  article_content: string;
  key_features: string[];
  call_to_action: string;
  price_point: string;
  border_style: string;
  layout: string;
}

export default function NewspaperAd() {
  const [productName, setProductName] = useState("");
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [adData, setAdData] = useState<NewspaperAdData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateNewspaperAd = async () => {
    if (!productName || !headline || !description) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await apiRequest<NewspaperAdData>("POST", "/api/newspaper/ad", { productName, headline, description });
      setAdData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
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
            NEWSPAPER AD
          </div>
          <h1 className="text-[28px] font-bold text-[#111827] mb-1">Newspaper Ad Generator</h1>
          <p className="text-[14px] text-[#6b7280]">
            Create professional newspaper-style advertisements
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
              onClick={generateNewspaperAd}
              disabled={loading}
              className="w-full transition-all"
              style={{ 
                background: '#ea580c', color: 'white', border: 'none', borderRadius: '8px', 
                padding: '14px', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                opacity: loading ? 0.6 : 1
              }}
              onMouseOver={(e) => { if (!loading) e.currentTarget.style.background = '#dc4a08'; }}
              onMouseOut={(e) => { if (!loading) e.currentTarget.style.background = '#ea580c'; }}
            >
              {loading ? "Generating..." : "Generate Newspaper Ad →"}
            </button>

            {error && <p style={{ color: '#ef4444', fontSize: 13, textAlign: 'center' }}>{error}</p>}
          </div>
        </div>

        {/* Newspaper Display */}
        {loading && <LoadingState />}

        {adData && !loading && (
          <div className="bg-white text-black p-12 shadow-2xl mb-20" style={{ fontFamily: "Georgia, serif" }}>
            {/* Newspaper Header */}
            <div className="border-b-4 border-black pb-4 mb-6 text-center">
              <h1 className="text-5xl font-bold tracking-wider" style={{ letterSpacing: "0.15em" }}>
                DAINIK JAGRAN
              </h1>
              <p className="text-sm mt-2 text-gray-700">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <div className="flex justify-around mt-2 text-xs text-gray-600">
                <span>VOL. 156</span>
                <span>NO. 45673</span>
                <span>PRICE $1.50</span>
              </div>
            </div>

            {/* Section Label */}
            <div className="mb-6 border-l-4 border-black pl-3">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-widest">★ {adData.section} ★</p>
            </div>

            {/* Advertisement Container with Border */}
            <div className="border-4 border-black p-8 mb-8 bg-gray-50">
              {/* Ad Headline */}
              <h2 className="text-4xl font-bold text-center mb-2 leading-tight">{adData.headline}</h2>

              {/* Ad Subheading */}
              <p className="text-center text-lg font-semibold text-gray-800 mb-6 italic">{adData.subheading}</p>

              {/* Decorative Separator */}
              <div className="flex justify-center mb-6">
                <span className="text-2xl text-gray-400">✦ ✦ ✦</span>
              </div>

              {/* Advertisement Body */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                <div className="text-justify text-sm leading-relaxed">{adData.body_text}</div>

                {/* Key Features Box */}
                <div className="border-2 border-black p-4 bg-white">
                  <h4 className="font-bold mb-3 text-center underline">KEY FEATURES</h4>
                  <ul className="space-y-2 text-sm">
                    {adData.key_features?.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <span className="mr-2">▪</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Price and CTA */}
              <div className="text-center border-t-2 border-black pt-4">
                <p className="text-lg font-bold">{adData.price_point}</p>
                <p className="text-sm mt-2 font-semibold">{adData.call_to_action}</p>
              </div>
            </div>

            {/* Editorial Article Section */}
            <div className="mb-8">
              <div className="border-b-2 border-black mb-4">
                <h3 className="text-2xl font-bold">FEATURED ARTICLE</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 text-justify text-sm leading-relaxed whitespace-pre-wrap first-letter:font-bold first-letter:text-2xl first-letter:float-left first-letter:mr-1 first-letter:mt-1">
                  {adData.article_content}
                </div>

                {/* Right Column - Additional Info */}
                <div className="border-l-0 md:border-l-2 border-gray-400 md:pl-4 space-y-4">
                  <div>
                    <h4 className="font-bold text-sm uppercase mb-1">Publication</h4>
                    <p className="text-xs text-gray-600">{adData.publication_style}</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm uppercase mb-1">Layout</h4>
                    <p className="text-xs text-gray-600">{adData.layout}</p>
                  </div>

                  <div className="bg-yellow-100 p-3 border border-yellow-400 text-xs">
                    <p className="font-bold mb-1">SPECIAL OFFER</p>
                    <p>Limited time availability. Contact advertiser for details.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-black pt-4 text-center text-xs text-gray-600">
              <p>© 2025 The Daily Tribune | All Rights Reserved</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
