import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { AdCopy } from '@shared/schema';

interface AdCopyCardProps {
  adCopy: AdCopy;
  delay?: number;
}

export function AdCopyCard({ adCopy, delay = 0 }: AdCopyCardProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const CopyBtn = ({ id, text }: { id: string; text: string }) => (
    <button
      onClick={() => copyToClipboard(text, id)}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
      style={{ color: 'var(--text-dim)' }}
      data-testid={`button-copy-${id}`}
    >
      {copied === id ? <Check className="w-3 h-3" style={{ color: '#22c55e' }} /> : <Copy className="w-3 h-3" />}
    </button>
  );

  return (
    <div
      className="group p-6 rounded-lg lg:col-span-2 animate-fade-in"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-raw)',
        animationDelay: `${delay}ms`,
      }}
      data-testid="card-ad-copy"
    >
      <div className="flex items-start justify-between mb-5">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Main Ad Copy</h3>
        <button
          onClick={() => copyToClipboard(
            `${adCopy.headline}\n\n${adCopy.description}\n\n${adCopy.callToAction}`,
            'all'
          )}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded"
          style={{ color: 'var(--text-dim)' }}
          data-testid="button-copy-all"
        >
          {copied === 'all' ? <Check className="w-4 h-4" style={{ color: '#22c55e' }} /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      <div className="space-y-5">
        <div className="space-y-1.5 group">
          <div className="flex items-center justify-between">
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
              color: 'var(--text-dim)',
            }}>Headline</span>
            <CopyBtn id="headline" text={adCopy.headline} />
          </div>
          <p className="text-xl font-semibold leading-tight" style={{ color: 'var(--text)' }} data-testid="text-headline">
            {adCopy.headline}
          </p>
        </div>

        <div className="space-y-1.5 group">
          <div className="flex items-center justify-between">
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
              color: 'var(--text-dim)',
            }}>Description</span>
            <CopyBtn id="description" text={adCopy.description} />
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }} data-testid="text-description">
            {adCopy.description}
          </p>
        </div>

        <div className="space-y-1.5 group">
          <div className="flex items-center justify-between">
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
              color: 'var(--text-dim)',
            }}>Call to Action</span>
            <CopyBtn id="cta" text={adCopy.callToAction} />
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }} data-testid="text-cta">
            {adCopy.callToAction}
          </p>
        </div>
      </div>
    </div>
  );
}
