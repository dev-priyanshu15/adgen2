import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface VariationsCardProps {
  variations: string[];
  delay?: number;
}

export function VariationsCard({ variations, delay = 0 }: VariationsCardProps) {
  const [copied, setCopied] = useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div
      className="p-6 rounded-lg animate-fade-in"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-raw)',
        animationDelay: `${delay}ms`,
      }}
      data-testid="card-variations"
    >
      <h3 className="text-lg font-semibold mb-5" style={{ color: 'var(--text)' }}>A/B Test Variations</h3>
      <div className="space-y-3">
        {variations.map((variation, index) => (
          <div
            key={index}
            className="group p-4 rounded-md transition-colors"
            style={{
              background: 'var(--surface2)',
              borderLeft: '2px solid var(--border-raw)',
            }}
            data-testid={`variation-${index}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-1">
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase' as const,
                  color: 'var(--text-dim)',
                }}>
                  VARIATION {index + 1}
                </span>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{variation}</p>
              </div>
              <button
                onClick={() => copyToClipboard(variation, index)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded flex-shrink-0"
                style={{ color: 'var(--text-dim)' }}
                data-testid={`button-copy-variation-${index}`}
              >
                {copied === index ? (
                  <Check className="w-4 h-4" style={{ color: '#22c55e' }} />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
