import { HashtagsCard } from '@/components/HashtagsCard';
import { ArrowLeft, ArrowRight, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { AdCopy } from '@shared/schema';

interface HashtagsPageProps {
  adCopy: AdCopy;
  campaign: any;
  onBack: () => void;
  onNext: () => void;
}

export function HashtagsPage({ adCopy, campaign, onBack, onNext }: HashtagsPageProps) {
  const [copied, setCopied] = useState(false);
  const hashtagText = adCopy.hashtags?.join(' ') || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(hashtagText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: 'var(--bg)' }}>
      <div className="relative z-10">
        <div className="w-full max-w-7xl mx-auto px-6 pt-6 pb-6">
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-raw)', color: 'var(--text)' }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={onNext}
              className="btn-cta px-6 py-2 rounded-md text-sm font-semibold flex items-center gap-2 ml-auto"
            >
              <ArrowRight className="w-4 h-4" />
              Next: Generated Images
            </button>
          </div>
        </div>

        <div className="w-full max-w-7xl mx-auto px-6 pb-20">
          <h1 className="text-2xl font-semibold mb-8" style={{ color: 'var(--text)' }}>Hashtags</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <HashtagsCard hashtags={adCopy.hashtags} campaign={campaign} delay={0} />
            </div>

            <div className="p-6 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border-raw)' }}>
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text)' }}>Copy Hashtags</h3>
              <div className="p-4 rounded-md mb-4 max-h-96 overflow-y-auto" style={{ background: 'var(--surface2)' }}>
                <p className="text-sm break-words" style={{ color: 'var(--text-muted)' }}>{hashtagText}</p>
              </div>
              <button
                onClick={handleCopy}
                className="w-full py-2.5 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                style={{ background: 'var(--surface2)', border: '1px solid var(--border-raw)', color: 'var(--text)' }}
              >
                {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy All</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
