import { TrendingUp, Users, Target, Eye } from 'lucide-react';
import type { AdCopy } from '@shared/schema';

interface ComparisonViewProps {
  adCopy: AdCopy;
  onClose: () => void;
}

export function ComparisonView({ adCopy, onClose }: ComparisonViewProps) {
  const getMockMetrics = () => {
    const baselineMetrics = {
      ctr: 2.1 + Math.random() * 1.5,
      engagement: 15 + Math.random() * 10,
      conversion: 3.5 + Math.random() * 2,
      views: 10000 + Math.floor(Math.random() * 5000),
    };

    const variantMetrics = adCopy.variations.map(() => ({
      ctr: 2.1 + Math.random() * 1.5,
      engagement: 15 + Math.random() * 10,
      conversion: 3.5 + Math.random() * 2,
      views: 10000 + Math.floor(Math.random() * 5000),
    }));

    return { baselineMetrics, variantMetrics };
  };

  const { baselineMetrics, variantMetrics } = getMockMetrics();

  const MetricCard = ({ icon: Icon, label, value, isWinner }: any) => (
    <div
      className="p-3 rounded-md transition-colors"
      style={{
        background: isWinner ? 'var(--accent-dim)' : 'var(--surface2)',
        border: isWinner ? '1px solid var(--accent)' : '1px solid transparent',
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-3 h-3" style={{ color: 'var(--text-dim)' }} />
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase' as const,
          color: 'var(--text-dim)',
        }}>{label}</span>
        {isWinner && (
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            color: 'var(--accent)',
            marginLeft: 'auto',
          }}>WINNER</span>
        )}
      </div>
      <p style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: isWinner ? 28 : 18,
        fontWeight: 700,
        color: isWinner ? 'var(--accent)' : 'var(--text)',
      }}>{value}</p>
    </div>
  );

  const findWinner = (baselineVal: number, variantVals: number[]) => {
    const allVals = [baselineVal, ...variantVals];
    const maxVal = Math.max(...allVals);
    return allVals.indexOf(maxVal);
  };

  const ctrWinner = findWinner(baselineMetrics.ctr, variantMetrics.map(v => v.ctr));
  const engagementWinner = findWinner(baselineMetrics.engagement, variantMetrics.map(v => v.engagement));
  const conversionWinner = findWinner(baselineMetrics.conversion, variantMetrics.map(v => v.conversion));
  const viewsWinner = findWinner(baselineMetrics.views, variantMetrics.map(v => v.views));

  return (
    <div className="animate-fade-in">
      <div className="w-full">
        <div className="w-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text)' }}>A/B Test Comparison</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Compare performance metrics across variations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 mb-6" style={{ gap: '4%' }}>
            <div
              className="p-6 rounded-lg"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-raw)' }}
              data-testid="card-baseline"
            >
              <div className="mb-4">
                <span
                  className="inline-block px-2 py-1 rounded text-xs mb-2"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    background: 'var(--accent-dim)',
                    color: 'var(--accent)',
                  }}
                >BASELINE</span>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>{adCopy.headline}</h3>
                <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>{adCopy.description}</p>
                <span
                  className="inline-block px-3 py-1.5 rounded-md text-sm font-medium"
                  style={{ background: 'var(--accent)', color: '#fff' }}
                >
                  {adCopy.callToAction}
                </span>
              </div>

              <div className="space-y-2 mt-6">
                <MetricCard icon={TrendingUp} label="CTR" value={`${baselineMetrics.ctr.toFixed(2)}%`} isWinner={ctrWinner === 0} />
                <MetricCard icon={Users} label="Engagement" value={`${baselineMetrics.engagement.toFixed(1)}%`} isWinner={engagementWinner === 0} />
                <MetricCard icon={Target} label="Conversion" value={`${baselineMetrics.conversion.toFixed(2)}%`} isWinner={conversionWinner === 0} />
                <MetricCard icon={Eye} label="Total Views" value={baselineMetrics.views.toLocaleString()} isWinner={viewsWinner === 0} />
              </div>
            </div>

            {adCopy.variations.map((variation, index) => (
              <div
                key={index}
                className="p-6 rounded-lg"
                style={{ background: 'var(--surface)', border: '1px solid var(--border-raw)' }}
                data-testid={`card-variation-${index}`}
              >
                <div className="mb-4">
                  <span
                    className="inline-block px-2 py-1 rounded text-xs mb-2"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10,
                      background: 'var(--surface2)',
                      color: 'var(--text-muted)',
                    }}
                  >VARIATION {index + 1}</span>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>{variation}</h3>
                  <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>{adCopy.description}</p>
                  <span
                    className="inline-block px-3 py-1.5 rounded-md text-sm font-medium"
                    style={{ background: 'var(--accent)', color: '#fff' }}
                  >
                    {adCopy.callToAction}
                  </span>
                </div>

                <div className="space-y-2 mt-6">
                  <MetricCard icon={TrendingUp} label="CTR" value={`${variantMetrics[index].ctr.toFixed(2)}%`} isWinner={ctrWinner === index + 1} />
                  <MetricCard icon={Users} label="Engagement" value={`${variantMetrics[index].engagement.toFixed(1)}%`} isWinner={engagementWinner === index + 1} />
                  <MetricCard icon={Target} label="Conversion" value={`${variantMetrics[index].conversion.toFixed(2)}%`} isWinner={conversionWinner === index + 1} />
                  <MetricCard icon={Eye} label="Total Views" value={variantMetrics[index].views.toLocaleString()} isWinner={viewsWinner === index + 1} />
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-6">
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.04em' }}>
              * METRICS ARE SIMULATED FOR DEMONSTRATION PURPOSES
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
