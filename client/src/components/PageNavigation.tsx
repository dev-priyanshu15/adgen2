import { ChevronRight, Home, FileText, Zap, Video, Newspaper, Image, Hash, Share2, Sparkles } from 'lucide-react';

type PageType = 'adcopy' | 'abtest' | 'video' | 'newspaper-ad' | 'images' | 'hashtags' | 'social-media-ads' | 'social-media-posts';

interface PageNavigationProps {
  currentPage: PageType;
  onPageSelect: (page: PageType) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const pages = [
  { id: 'adcopy', label: 'Ad Copy', icon: FileText },
  { id: 'abtest', label: 'A/B Test', icon: Zap },
  { id: 'video', label: 'Video Script (Soon)', icon: Video },
  { id: 'newspaper-ad', label: 'Newspaper Ad', icon: Newspaper },
  { id: 'images', label: 'Generated Images', icon: Image },
  { id: 'hashtags', label: 'Hashtags', icon: Hash },
  { id: 'social-media-ads', label: 'Social Media Ads', icon: Share2 },
  { id: 'social-media-posts', label: 'Social Media Posts', icon: Sparkles },
];

export function PageNavigation({ currentPage, onPageSelect, isOpen, onToggle }: PageNavigationProps) {
  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="fixed left-6 top-6 z-50 p-3 rounded-md transition-colors"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-raw)',
        }}
        title="Toggle Navigation"
      >
        <ChevronRight className={`w-5 h-5 transition-transform`} style={{ color: 'var(--text)' , transform: isOpen ? 'rotate(180deg)' : 'none' }} />
      </button>

      {/* Navigation Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full z-40 transition-transform duration-200 overflow-y-auto`}
        style={{
          width: 220,
          background: 'var(--surface)',
          borderRight: '1px solid var(--border-raw)',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {/* Header */}
        <div className="p-5 pb-4" style={{ borderBottom: '1px solid var(--border-raw)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center"
              style={{ background: 'var(--accent-dim)' }}
            >
              <Home className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Campaign Flow</h2>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.06em' }}>8 STEPS</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="p-3 space-y-1">
          {pages.map((page, index) => {
            const Icon = page.icon;
            const isActive = currentPage === page.id;
            return (
              <button
                key={page.id}
                onClick={() => onPageSelect(page.id as PageType)}
                className="w-full px-3 py-2.5 rounded-md transition-colors flex items-center gap-3 text-left"
                style={{
                  background: isActive ? 'var(--accent-dim)' : 'transparent',
                  borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                  color: isActive ? 'var(--text)' : 'var(--text-muted)',
                }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color: isActive ? 'var(--accent)' : 'var(--text-dim)' }} />
                <div className="flex-1 min-w-0">
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10,
                      letterSpacing: '0.04em',
                      color: isActive ? 'var(--accent)' : 'var(--text-dim)',
                    }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <p className="text-xs font-medium truncate" style={{ color: isActive ? 'var(--text)' : 'var(--text-muted)' }}>
                    {page.label}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="absolute bottom-0 left-0 right-0 p-3" style={{ borderTop: '1px solid var(--border-raw)' }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-dim)', textAlign: 'center', letterSpacing: '0.04em' }}>
            STEP {pages.findIndex(p => p.id === currentPage) + 1} OF 8
          </p>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
}
