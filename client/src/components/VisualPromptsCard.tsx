import { Copy, Check, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';

interface VisualPromptsCardProps {
  prompts: string[];
  delay?: number;
}

export function VisualPromptsCard({ prompts, delay = 0 }: VisualPromptsCardProps) {
  const [copied, setCopied] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number[]>([]);

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleExpand = (index: number) => {
    setExpanded((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div
      className="p-6 rounded-lg animate-fade-in"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-raw)',
        animationDelay: `${delay}ms`,
      }}
      data-testid="card-visual-prompts"
    >
      <h3 className="text-lg font-semibold mb-5" style={{ color: 'var(--text)' }}>Visual Creative Prompts</h3>
      <div className="space-y-3">
        {prompts.map((prompt, index) => {
          const isLong = prompt.length > 150;
          const isExpanded = expanded.includes(index);
          const displayText = isLong && !isExpanded ? prompt.slice(0, 150) + '...' : prompt;

          return (
            <div
              key={index}
              className="group p-4 rounded-md transition-colors"
              style={{ background: 'var(--surface2)' }}
              data-testid={`prompt-${index}`}
            >
              <div className="flex items-start gap-3 mb-2">
                <div
                  className="p-1.5 rounded-md"
                  style={{ background: 'var(--accent-dim)' }}
                >
                  <ImageIcon className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                </div>
                <div className="flex-1">
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase' as const,
                    color: 'var(--text-dim)',
                  }}>
                    PROMPT {index + 1}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(prompt, index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded flex-shrink-0"
                  style={{ color: 'var(--text-dim)' }}
                  data-testid={`button-copy-prompt-${index}`}
                >
                  {copied === index ? (
                    <Check className="w-3.5 h-3.5" style={{ color: '#22c55e' }} />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <p className="text-sm leading-relaxed ml-9" style={{ color: 'var(--text-muted)' }}>
                {displayText}
              </p>
              {isLong && (
                <button
                  onClick={() => toggleExpand(index)}
                  className="text-xs mt-2 ml-9 font-medium"
                  style={{ color: 'var(--accent)' }}
                  data-testid={`button-expand-${index}`}
                >
                  {isExpanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
