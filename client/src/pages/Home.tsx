import { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

import { AdInputSection } from '@/components/AdInputSection';
import { AdCopyCard } from '@/components/AdCopyCard';
import { LoadingState } from '@/components/LoadingState';
import { VariationsCard } from '@/components/VariationsCard';
import { ComparisonView } from '@/components/ComparisonView';
import { HashtagsCard } from '@/components/HashtagsCard';
import { ImageCard } from '@/components/ImageCard';
import { VisualPromptsCard } from '@/components/VisualPromptsCard';
import { BatchImageVideoGenerator } from '@/components/BatchImageVideoGenerator';

import { Zap, PenTool, BarChart3, Image, Sparkles, Newspaper, X, ArrowRight, Check, FileText, Share2 } from 'lucide-react';
import type { Tone, AdCopy, AdCampaign } from '@shared/schema';

/* terminal lines for hero card */
const terminalLines = [
  { text: '$ generate --product "Smart Watch"', color: '#9ca3af' },
  { text: '$ --tone professional --format campaign', color: '#9ca3af' },
  { text: '$ loading creative models...', color: '#d97706' },
  { text: '$ generating ad copy...', color: '#d97706' },
  { text: '$ generating visuals...', color: '#d97706' },
  { text: '$ AI Campaign Ready! \u2713', color: '#16a34a' },
];

/* Improved "How It Works" steps from screenshot */
const howItWorks = [
  { step: '01', icon: PenTool, title: 'Input Product', desc: 'Tell us what you are selling and choose your brand tone.' },
  { step: '02', icon: FileText, title: 'Generate Copy', desc: 'AI creates high-converting ad copy variations.' },
  { step: '03', icon: Image, title: 'Create Visuals', desc: 'Stunning product images are generated automatically.' },
  { step: '04', icon: Share2, title: 'Export Ads', desc: 'Download ready-to-run campaigns for any platform.' },
];

/* "Everything you need for ads" features */
const keyFeatures = [
  { icon: Sparkles, title: 'A/B Testing variations', desc: 'Generate multiple angles automatically.' },
  { icon: Zap, title: 'Multi-platform support', desc: 'Formats for Facebook, Instagram, and Print.' },
  { icon: Image, title: 'Video script generation (Coming Soon)', desc: 'Complete scripts with visual directions.' },
];

/* Partner Logos for "Powered by the best" (Restored original style) */
const partnerLogos = [
  { name: 'Groq', color: '#ff4d4d', initial: 'G' },
  { name: 'Pollinations', color: '#10b981', initial: '✨' },
  { name: 'Lexica', color: '#8b5cf6', initial: 'L' },
  { name: 'Unsplash', color: '#111827', initial: 'U+' },
  { name: 'Replicate', color: '#3b82f6', initial: 'R' },
  { name: 'Neon DB', color: '#00e599', initial: 'N' },
  { name: 'Drizzle ORM', color: '#c5f200', initial: '~' },
  { name: 'LLaMA/Groq', color: '#f97316', initial: '🔥' },
];

export default function Home() {
  const { toast } = useToast();
  const [showBatchGenerator, setShowBatchGenerator] = useState(false);

  const [campaign, setCampaign] = useState<AdCampaign | null>(null);

  const [imageUrl, setImageUrl] = useState<string>('');

  const adCopyRef = useRef<HTMLDivElement>(null);
  const abTestRef = useRef<HTMLDivElement>(null);
  const hashtagsRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLDivElement>(null);
  const visualsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  /* ad copy mutation */
  const adMutation = useMutation({
    mutationFn: async ({ productName, tone }: { productName: string; tone: Tone }) => {
      const data = await apiRequest<AdCopy>('POST', '/api/ad/generate', { productName, tone });
      return { productName, tone, adCopy: data, generatedAt: new Date().toISOString() };
    },
    onSuccess: (data) => {
      setCampaign(data);
      setImageUrl('');
      imageTriggered.current = false;
      toast({ title: 'Ad Copy Generated!', description: 'Your campaign copy is ready.' });
      setTimeout(() => adCopyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
    },
    onError: (error: Error) => {
      toast({ title: 'Generation Failed', description: error.message, variant: 'destructive' });
    },
  });

  /* image mutation */
  const imageMutation = useMutation({
    mutationFn: async (prompt: string) => {
      // Always send productName for best image relevance
      const pName = campaign?.productName || '';
      const result = await apiRequest<any>('POST', '/api/image/generate', { prompt, productName: pName });
      return result.imageUrl;
    },
    onSuccess: (url) => {
      setImageUrl(url);
      toast({ title: 'Image Generated!', description: 'Your image is ready.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Image Generation Failed', description: error.message, variant: 'destructive' });
    },
  });

  /* auto-generate image once campaign exists */
  const imageTriggered = useRef(false);
  useEffect(() => {
    if (campaign && !imageUrl && !imageMutation.isPending && !imageTriggered.current) {
      imageTriggered.current = true;
      const prompt = campaign.adCopy.description || campaign.adCopy.headline || 'professional product photography';
      imageMutation.mutate(prompt);
    }
  }, [campaign]);

  /* terminal typing animation */
  const [visibleLines, setVisibleLines] = useState(0);
  useEffect(() => {
    if (visibleLines < terminalLines.length) {
      const t = setTimeout(() => setVisibleLines(v => v + 1), 600);
      return () => clearTimeout(t);
    }
  }, [visibleLines]);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Dot Grid Background */}
      <div className="dot-grid fixed inset-0 pointer-events-none z-0" />

      <section className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-20 pb-16 flex flex-col md:flex-row items-center gap-12">
        {/* Left — text */}
        <div className="flex-1 min-w-0 md:max-w-[55%]">
          <div
            className="hero-line inline-block px-3 py-1 rounded-full text-xs font-semibold mb-6"
            style={{ background: 'var(--accent-dim)', color: 'var(--accent-raw)', animationDelay: '0ms', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}
          >
            AI-POWERED AD CAMPAIGNS
          </div>
          <h1 className="hero-line text-4xl md:text-5xl font-bold mb-5 leading-tight" style={{ animationDelay: '80ms', color: 'var(--text)' }}>
            Generate complete<br />ad campaigns in<br />
            <span style={{ color: 'var(--accent-raw)' }}>seconds.</span>
          </h1>
          <p className="hero-line text-base mb-8" style={{ color: 'var(--text-muted)', animationDelay: '160ms', maxWidth: 440, lineHeight: 1.7 }}>
            From headlines to visuals, A/B tests to social posts — one AI engine, every format, ready to publish.
          </p>
          <div className="hero-line flex gap-3" style={{ animationDelay: '240ms' }}>
            <button onClick={() => scrollTo(inputRef)} className="btn-cta flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Start Creating
            </button>
            <Link href="/newspaper-ad">
              <button className="px-5 py-3 rounded-lg text-sm font-medium transition-colors" style={{ border: '1px solid var(--border-raw)', color: 'var(--text)', background: 'var(--surface)' }}>
                <Newspaper className="w-4 h-4 inline mr-2" />
                Newspaper Ad
              </button>
            </Link>
          </div>
        </div>

        {/* Right — Terminal Card */}
        <div className="hero-terminal flex-1 min-w-0 md:max-w-[45%] w-full">
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--code-bg)', boxShadow: '0 16px 48px rgba(0,0,0,0.18)' }}>
            {/* Traffic lights */}
            <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#eab308' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#22c55e' }} />
              <span className="ml-3 text-xs" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-mono)' }}>adgenius-cli</span>
            </div>
            {/* Terminal body */}
            <div className="p-5 space-y-2" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, minHeight: 200 }}>
              {terminalLines.slice(0, visibleLines).map((line, i) => (
                <div key={i} style={{ color: line.color }}>{line.text}</div>
              ))}
              {visibleLines < terminalLines.length && (
                <span className="cursor-blink inline-block w-2 h-4" style={{ background: 'var(--accent-raw)' }} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══════ HOW IT WORKS (Restored AdGenius Style) ══════ */}
      <section className="relative z-10 w-full py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="mb-16">
            <div className="text-[10px] uppercase font-bold tracking-widest mb-4" style={{ color: '#ea580c', fontFamily: 'var(--font-mono)' }}>HOW IT WORKS</div>
            <h2 className="text-3xl md:text-4xl font-extrabold" style={{ color: '#111827' }}>Four steps to campaign success</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {howItWorks.map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center" style={{ background: '#ea580c' }}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{item.step}</div>
                <h3 className="text-base font-bold mb-2" style={{ color: 'var(--text)' }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)', maxWidth: 200 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full max-w-5xl mx-auto px-6"><div style={{ height: 1, background: 'var(--border-raw)' }} /></div>

      {/* ══════ KEY FEATURES (Restored AdGenius Style) ══════ */}
      <section className="relative z-10 w-full py-24" style={{ background: '#f8f9fa' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-[10px] uppercase font-bold tracking-widest mb-4" style={{ color: '#ea580c', fontFamily: 'var(--font-mono)' }}>KEY FEATURES</div>
            <h2 className="text-3xl md:text-4xl font-extrabold" style={{ color: '#111827' }}>Everything you need for ads</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {keyFeatures.map((feat, i) => (
              <div key={i} className="p-8 rounded-2xl bg-white transition-all hover:shadow-xl group" style={{ border: '1px solid #e5e7eb' }}>
                <div className="w-12 h-12 rounded-xl mb-6 flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: '#ea580c' }}>
                  <feat.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-bold mb-3" style={{ color: '#111827' }}>{feat.title}</h4>
                <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ POWERED BY (Restored AdGenius Style) ══════ */}
      <section className="relative z-10 w-full py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-center text-3xl font-extrabold mb-16" style={{ color: '#111827' }}>Powered by the best</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8">
            {partnerLogos.map((logo, i) => (
              <div key={i} className="flex flex-col items-center group">
                <div 
                  className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center text-2xl font-black text-white transition-all group-hover:-translate-y-2 group-hover:shadow-lg"
                  style={{ background: logo.color }}
                >
                  {logo.initial}
                </div>
                <span className="text-xs font-bold tracking-wide text-gray-400 uppercase" style={{ fontFamily: 'var(--font-mono)' }}>{logo.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>





      {/* ══════ BATCH GENERATOR (overlay) ══════ */}
      {showBatchGenerator && (
        <div className="fixed inset-0 z-40 overflow-y-auto" style={{ background: 'var(--bg)', paddingTop: 56 }}>
          <div className="w-full max-w-6xl mx-auto px-6 py-8">
            <div className="flex justify-end mb-4">
              <button onClick={() => setShowBatchGenerator(false)} className="p-2 rounded-md transition-colors" style={{ color: 'var(--text-muted)', border: '1px solid var(--border-raw)', background: 'var(--surface)', cursor: 'pointer' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <BatchImageVideoGenerator campaign={campaign} />
          </div>
        </div>
      )}

      {/* ══════ STEP 1 — AD INPUT ══════ */}
      <div id="generator-section" ref={inputRef} className="relative z-10 pt-16 pb-8">

        <AdInputSection
          onGenerate={(productName, tone) => adMutation.mutate({ productName, tone })}
          isGenerating={adMutation.isPending}
        />
        {adMutation.isPending && <LoadingState />}
      </div>

      {/* ══════ STEP 2 — AD COPY ══════ */}
      {campaign && !adMutation.isPending && (
        <div ref={adCopyRef} className="step-reveal relative z-10 pb-8">
          <StepDivider />
          <StepHeader step="02" label="AD COPY" done={true} />
          <div className="w-full max-w-[860px] mx-auto px-6">
            <AdCopyCard adCopy={campaign.adCopy} delay={100} />
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => scrollTo(abTestRef)} 
                className="flex items-center gap-2 text-sm transition-transform"
                style={{ background: '#ea580c', color: 'white', borderRadius: '8px', padding: '10px 24px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#dc4a08'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = '#ea580c'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Next: A/B Testing <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════ STEP 3 — A/B TEST ══════ */}
      {campaign && !adMutation.isPending && (
        <div ref={abTestRef} className="step-reveal relative z-10 pb-8">
          <StepDivider />
          <StepHeader step="03" label="A/B VARIATIONS" done={true} />
          <div className="w-full max-w-[860px] mx-auto px-6">
            <VariationsCard variations={campaign.adCopy.variations} delay={100} />
            <div className="mt-8">
              <ComparisonView adCopy={campaign.adCopy} onClose={() => {}} />
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => scrollTo(hashtagsRef)} 
                className="flex items-center gap-2 text-sm transition-transform"
                style={{ background: '#ea580c', color: 'white', borderRadius: '8px', padding: '10px 24px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#dc4a08'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = '#ea580c'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Next: Hashtags <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════ STEP 4 — HASHTAGS ══════ */}
      {campaign && !adMutation.isPending && (
        <div ref={hashtagsRef} className="step-reveal relative z-10 pb-8">
          <StepDivider />
          <StepHeader step="04" label="HASHTAGS" done={true} />
          <div className="w-full max-w-[860px] mx-auto px-6">
            <HashtagsCard hashtags={campaign.adCopy.hashtags} campaign={campaign} delay={0} />
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => scrollTo(imagesRef)} 
                className="flex items-center gap-2 text-sm transition-transform"
                style={{ background: '#ea580c', color: 'white', borderRadius: '8px', padding: '10px 24px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#dc4a08'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = '#ea580c'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Next: Images <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════ STEP 5 — IMAGES ══════ */}
      {campaign && !adMutation.isPending && (
        <div ref={imagesRef} className="step-reveal relative z-10 pb-8">
          <StepDivider />
          <StepHeader step="05" label="GENERATED IMAGES" done={!!imageUrl} />
          <div className="w-full max-w-[860px] mx-auto px-6">
            {imageMutation.isPending ? (
              <div className="space-y-4">
                <div style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: '12px',
                  background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite'
                }} />
                <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>Generating image...</p>
              </div>
            ) : imageUrl ? (
              <div className="space-y-4">
                <ImageCard imageUrl={imageUrl} isLoading={false} delay={0} />
                <button
                  onClick={() => {
                    const prompt = campaign.adCopy.description || campaign.adCopy.headline || 'professional product photography';
                    imageMutation.mutate(prompt);
                  }}
                  className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border-raw)', color: 'var(--text)', cursor: 'pointer' }}
                >
                  Regenerate Image
                </button>
              </div>
            ) : null}
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => scrollTo(visualsRef)} 
                className="flex items-center gap-2 text-sm transition-transform"
                style={{ background: '#ea580c', color: 'white', borderRadius: '8px', padding: '10px 24px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#dc4a08'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = '#ea580c'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Next: Visual Prompts <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════ STEP 6 — VISUAL PROMPTS ══════ */}
      {campaign && !adMutation.isPending && (
        <div ref={visualsRef} className="step-reveal relative z-10 pb-8">
          <StepDivider />
          <StepHeader step="06" label="VISUAL PROMPTS" done={true} />
          <div className="w-full max-w-[860px] mx-auto px-6">
            <VisualPromptsCard prompts={campaign.adCopy.visualPrompts} delay={100} />
            <div className="mt-8 flex items-center justify-center">
              <div 
                className="inline-flex items-center gap-2" 
                style={{ 
                  background: 'rgba(234,88,12,0.1)', 
                  border: '1px solid rgba(234,88,12,0.3)', 
                  borderRadius: '6px',
                  padding: '10px 20px',
                  cursor: 'default'
                }}
              >
                <Check className="w-4 h-4" style={{ color: '#ea580c' }} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#ea580c', textTransform: 'uppercase', fontWeight: 600 }}>CAMPAIGN COMPLETE</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════ STEP 7 — EVENT POSTER ══════ */}
      {campaign && !adMutation.isPending && (
        <div className="step-reveal relative z-10 pb-8">
          <StepDivider />
          <StepHeader step="07" label="EVENT POSTER" done={false} />
          <div className="w-full max-w-[860px] mx-auto px-6 text-center flex justify-center">
            <Link href={`/event-poster?product=${encodeURIComponent(campaign.productName)}`}>
              <button 
                className="transition-colors transition-transform"
                style={{ 
                  background: 'transparent', border: '1px solid #e8eaed', color: '#6b7280', 
                  borderRadius: '8px', padding: '12px 28px', fontSize: '14px', fontWeight: 600, 
                  cursor: 'pointer' 
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#ea580c'; e.currentTarget.style.color = '#ea580c'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e8eaed'; e.currentTarget.style.color = '#6b7280'; }}
              >
                Generate Event Poster for this campaign →
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Spacer before footer */}
      <div style={{ height: 80 }} />

      {/* DARK FOOTER STRIP */}
      <div className="w-full relative z-10" style={{ background: '#1a1f2e', padding: '60px 48px' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Left Col (55%) */}
          <div className="w-full md:w-[55%]">
            <h2 style={{ fontSize: '30px', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', lineHeight: 1.2 }}>Stop wasting hours on ad copy</h2>
            <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '12px' }}>AdGenius automates the tedious parts of campaign creation so you can launch faster.</p>
            
            <div className="flex gap-9 mt-7">
              <div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '26px', fontWeight: 700, color: '#ea580c' }}>30s</div>
                <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>Campaign time</div>
              </div>
              <div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '26px', fontWeight: 700, color: '#ea580c' }}>5</div>
                <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>Ad formats</div>
              </div>
              <div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '26px', fontWeight: 700, color: '#ea580c' }}>₹0</div>
                <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>To start</div>
              </div>
            </div>
          </div>
          
          {/* Right Col (45%) */}
          <div className="w-full md:w-[45%] flex justify-end">
            <div style={{ background: 'white', borderRadius: '14px', padding: '28px 32px', width: '100%', maxWidth: '380px', boxShadow: '0 4px 24px rgba(0,0,0,0.25)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>Start your free campaign</h3>
              <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px', marginBottom: '20px' }}>No credit card required.</p>
              
              <button style={{ width: '100%', background: '#111827', color: 'white', borderRadius: '8px', padding: '12px 0', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                Get Started →
              </button>
              
              <div style={{ textAlign: 'center', fontSize: '12px', color: '#6b7280', marginTop: '14px' }}>
                Questions? <a href="#" style={{ color: '#ea580c', textDecoration: 'none' }}>Contact support</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════ FOOTER ══════ */}
      <footer className="relative z-10 py-6 px-6" style={{ background: '#0f1117' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" style={{ color: 'var(--accent-raw)' }} />
            <span className="font-semibold text-sm" style={{ color: '#ffffff' }}>AdGenius</span>
          </div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em' }}>
            &copy; 2025 Adgenous &mdash; Built with &#10084; by Priyanshu
          </p>
        </div>
      </footer>
    </div>
  );
}

/* Step Header sub-component */
function StepHeader({ step, label, done }: { step: string; label: string; done: boolean }) {
  return (
    <div className="w-full max-w-[860px] mx-auto px-6 mb-6 flex items-center gap-3">
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em' }}>
        {step} &mdash; {label}
      </span>
      {done && (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a', fontFamily: 'var(--font-mono)' }}>
          DONE
        </span>
      )}
    </div>
  );
}

/* Step Divider */
function StepDivider() {
  return (
    <div className="w-full max-w-[860px] mx-auto px-6 py-10">
      <div style={{ height: 1, background: 'var(--border-raw)' }} />
    </div>
  );
}
