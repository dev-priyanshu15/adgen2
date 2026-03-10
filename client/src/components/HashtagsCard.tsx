import { Download, Hash } from 'lucide-react';
import type { AdCampaign } from '@shared/schema';

interface HashtagsCardProps {
  hashtags: string[];
  campaign?: AdCampaign;
  delay?: number;
}

export function HashtagsCard({ hashtags, campaign, delay = 0 }: HashtagsCardProps) {
  const downloadJSON = () => {
    if (!campaign) return;
    
    const dataStr = JSON.stringify(campaign, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ad-campaign-${campaign.productName.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="p-6 rounded-lg animate-fade-in"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-raw)',
        animationDelay: `${delay}ms`,
      }}
      data-testid="card-hashtags"
    >
      <h3 className="text-lg font-semibold mb-5" style={{ color: 'var(--text)' }}>Hashtags & Export</h3>
      
      <div className="space-y-5">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Hash className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
              color: 'var(--text-dim)',
            }}>Recommended Hashtags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {hashtags.map((hashtag, index) => (
              <span
                key={index}
                className="px-3 py-1.5 rounded-full"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  fontWeight: 500,
                  background: 'var(--surface2)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-raw)',
                }}
                data-testid={`hashtag-${index}`}
              >
                #{hashtag}
              </span>
            ))}
          </div>
        </div>

        {campaign && (
          <div className="pt-4" style={{ borderTop: '1px solid var(--border-raw)' }}>
            <button
              onClick={downloadJSON}
              data-testid="button-download-json"
              className="w-full py-3 rounded-md flex items-center justify-center gap-2 text-sm font-medium transition-colors"
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--border-raw)',
                color: 'var(--text)',
              }}
            >
              <Download className="w-4 h-4" />
              Download Complete Campaign (JSON)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
