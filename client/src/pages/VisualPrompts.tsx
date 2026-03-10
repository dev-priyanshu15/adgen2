import { VisualPromptsCard } from '@/components/VisualPromptsCard';
import { ArrowLeft } from 'lucide-react';
import type { AdCopy } from '@shared/schema';

interface VisualPromptsPageProps {
  adCopy: AdCopy;
  onBack: () => void;
  onNext?: () => void;
}

export function VisualPromptsPage({ adCopy, onBack, onNext }: VisualPromptsPageProps) {
  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: 'var(--bg)' }}>
      <div className="relative z-10">
        <div className="w-full max-w-7xl mx-auto px-6 pt-6 pb-6">
          <div className="flex gap-3 items-center">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-colors duration-200"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-raw)', color: 'var(--text)' }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div
              className="ml-auto px-4 py-2 rounded-lg flex items-center gap-2"
              style={{ background: 'var(--accent-dim)', border: '1px solid var(--border-raw)' }}
            >
              <span className="text-sm font-medium" style={{ color: 'var(--accent)', fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>✓ CAMPAIGN COMPLETE</span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-7xl mx-auto px-6 pb-20">
          <h1 className="text-2xl font-semibold mb-8" style={{ color: 'var(--text)' }}>Visual Prompts</h1>
          <VisualPromptsCard prompts={adCopy.visualPrompts} delay={100} />
        </div>
      </div>
    </div>
  );
}
