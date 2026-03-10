import { useState } from 'react';
import { Sparkles, Zap } from 'lucide-react';
import type { Tone } from '@shared/schema';

interface AdInputSectionProps {
  onGenerate: (productName: string, tone: Tone) => void;
  isGenerating: boolean;
}

const tones: { value: Tone; label: string }[] = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'luxury', label: 'Luxury' },
];

export function AdInputSection({ onGenerate, isGenerating }: AdInputSectionProps) {
  const [productName, setProductName] = useState('');
  const [tone, setTone] = useState<Tone>('professional');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (productName.trim()) {
      onGenerate(productName.trim(), tone);
    }
  };

  return (
    <div className="w-full bg-[#f5f7fa] py-24" style={{ borderTop: '1px solid #e8eaed' }}>
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#ea580c', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '10px' }}>GENERATE CAMPAIGN</h2>
          <h3 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', marginBottom: '8px', letterSpacing: '-0.02em' }}>Build your ad campaign</h3>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>Product name in. Full campaign out.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            className="bg-white rounded-2xl"
            style={{
              maxWidth: '680px',
              margin: '0 auto',
              border: '1px solid #e8eaed',
              padding: '36px 40px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              background: '#ffffff'
            }}
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="product-name"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                  }}
                >
                  PRODUCT NAME
                </label>
                <input
                  id="product-name"
                  data-testid="input-product-name"
                  placeholder="e.g., Smart Fitness Watch, Eco-Friendly Water Bottle"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full h-14 text-base px-4 rounded-lg outline-none transition-colors"
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e8eaed',
                    color: 'var(--text)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#ea580c';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e8eaed';
                  }}
                  disabled={isGenerating}
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                  }}
                >
                  AD TONE
                </label>
                <div className="grid grid-cols-2 gap-2" data-testid="select-tone">
                  {tones.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setTone(t.value)}
                      disabled={isGenerating}
                      className="py-2.5 px-3 rounded-md transition-all text-center"
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 12,
                        fontWeight: 500,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        background: tone === t.value ? '#ea580c' : 'white',
                        border: tone === t.value ? '1px solid #ea580c' : '1px solid #e8eaed',
                        color: tone === t.value ? 'white' : '#374151',
                        cursor: isGenerating ? 'not-allowed' : 'pointer',
                      }}
                      onMouseOver={(e) => {
                        if (tone !== t.value && !isGenerating) {
                          e.currentTarget.style.borderColor = '#ea580c';
                          e.currentTarget.style.color = '#ea580c';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (tone !== t.value && !isGenerating) {
                          e.currentTarget.style.borderColor = '#e8eaed';
                          e.currentTarget.style.color = '#374151';
                        }
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                data-testid="button-generate"
                disabled={isGenerating || !productName.trim()}
                className="btn-cta w-full h-14 text-base font-semibold rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: '#ea580c',
                  color: 'white',
                  opacity: 1
                }}
              >
                {isGenerating ? (
                  <>
                    <Zap className="w-5 h-5 animate-pulse" />
                    Generating Campaign...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Ad Campaign
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
