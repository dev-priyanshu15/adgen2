import { useMemo } from 'react';

import { VariationsCard } from '@/components/VariationsCard';
import { ComparisonView } from '@/components/ComparisonView';
import { ArrowLeft, ArrowRight, BarChart3 } from 'lucide-react';
import type { AdCopy } from '@shared/schema';

interface ABTestPageProps {
  adCopy: AdCopy;
  onBack: () => void;
  onNext: () => void;
}

export function ABTestPage({ adCopy, onBack, onNext }: ABTestPageProps) {
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
              Next: Hashtags
            </button>
          </div>
        </div>

        <div className="w-full max-w-7xl mx-auto px-6 pb-20">
          <h1 className="text-2xl font-semibold mb-8" style={{ color: 'var(--text)' }}>A/B Test Variations</h1>
          <VariationsCard variations={adCopy.variations} delay={100} />
          
          <div className="mt-12">
            <ComparisonView adCopy={adCopy} onClose={() => {}} />
          </div>
        </div>
      </div>
    </div>
  );
}
