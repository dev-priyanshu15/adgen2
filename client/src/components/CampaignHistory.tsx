import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Calendar, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Campaign } from '@shared/schema';

interface CampaignHistoryProps {
  onLoadCampaign: (campaign: Campaign) => void;
}

export function CampaignHistory({ onLoadCampaign }: CampaignHistoryProps) {
  const { toast } = useToast();

  const { data: campaigns = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ['/api/campaigns'],
    refetchInterval: false,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/campaigns/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      toast({
        title: 'Campaign Deleted',
        description: 'The campaign has been removed from history.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Delete Failed',
        description: error.message || 'Failed to delete campaign',
        variant: 'destructive',
      });
    },
  });

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this campaign?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm" style={{ color: 'var(--text-dim)' }}>Loading campaigns...</p>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="p-6 text-center">
        <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: 'var(--text-dim)' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No saved campaigns yet</p>
        <p className="mt-1" style={{ fontSize: 11, color: 'var(--text-dim)' }}>
          Generate and save your first campaign to see it here
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-3">
        {campaigns.map((campaign: Campaign) => (
          <div
            key={campaign.id}
            className="p-4 cursor-pointer rounded-lg transition-colors duration-200"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-raw)' }}
            onClick={() => onLoadCampaign(campaign)}
            data-testid={`campaign-history-${campaign.id}`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-semibold text-sm line-clamp-1" style={{ color: 'var(--text)' }}>
                {campaign.productName}
              </h4>
              <button
                data-testid={`button-delete-campaign-${campaign.id}`}
                onClick={(e) => handleDelete(e, campaign.id)}
                className="flex-shrink-0 p-1 rounded transition-colors duration-200"
                style={{ color: 'var(--text-dim)', background: 'transparent', border: 'none' }}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-dim)' }}>
              <Calendar className="w-3 h-3" />
              <span>
                {new Date(campaign.createdAt).toLocaleDateString()}
              </span>
              <span
                className="px-2 py-0.5 rounded text-xs capitalize"
                style={{ background: 'var(--accent-dim)', color: 'var(--accent)', fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}
              >
                {campaign.tone}
              </span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
