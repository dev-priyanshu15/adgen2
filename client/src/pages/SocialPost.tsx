import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { PostGeneratorCard } from '@/components/PostGeneratorCard';
import { ArrowLeft, ArrowRight, Copy, Check } from 'lucide-react';
import type { AdCopy, Tone } from '@shared/schema';

interface SocialPostPageProps {
  adCopy: AdCopy;
  productName: string;
  tone: Tone;
  onBack: () => void;
  onNext: () => void;
}

export function SocialPostPage({ adCopy, productName, tone, onBack, onNext }: SocialPostPageProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [post, setPost] = useState<string>('');

  const postMutation = useMutation({
    mutationFn: async () => {
      const result = await apiRequest<{ post: string }>('POST', '/api/post/generate', {
        prompt: `Create a social media post for ${productName} with tone ${tone}`,
      });
      return result.post;
    },
    onSuccess: (data) => {
      setPost(data);
      toast({
        title: 'Post Generated!',
        description: 'Your social post is ready to copy.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Generation Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleCopy = () => {
    if (post) {
      navigator.clipboard.writeText(post);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Copied!',
        description: 'Post copied to clipboard',
      });
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: 'var(--bg)' }}>
      <div className="relative z-10">
        <div className="w-full max-w-7xl mx-auto px-6 pt-6 pb-6">
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-colors duration-200"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-raw)', color: 'var(--text)' }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={onNext}
              className="btn-cta ml-auto inline-flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              Next: Visual Prompts
            </button>
          </div>
        </div>

        <div className="w-full max-w-7xl mx-auto px-6 pb-20">
          <h1 className="text-2xl font-semibold mb-8" style={{ color: 'var(--text)' }}>Social Media Post</h1>
          
          <div className="rounded-lg p-8" style={{ background: 'var(--surface)', border: '1px solid var(--border-raw)' }}>
            <button
              onClick={() => postMutation.mutate()}
              disabled={postMutation.isPending}
              className="btn-cta w-full mb-6"
              style={{ opacity: postMutation.isPending ? 0.6 : 1 }}
            >
              {postMutation.isPending ? 'Generating...' : 'Generate Social Post'}
            </button>

            {post && (
              <div className="space-y-4">
                <div className="p-6 rounded-lg" style={{ background: 'var(--surface2)', border: '1px solid var(--border-raw)' }}>
                  <p className="whitespace-pre-wrap" style={{ color: 'var(--text-muted)' }}>{post}</p>
                </div>
                <button
                  onClick={handleCopy}
                  className="w-full py-2.5 rounded-md text-sm font-medium transition-colors duration-200 inline-flex items-center justify-center gap-2"
                  style={{ background: 'var(--surface2)', border: '1px solid var(--border-raw)', color: 'var(--text)' }}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy to Clipboard
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="mt-12">
            <PostGeneratorCard productName={productName} tone={tone} adCopy={adCopy} delay={0} />
          </div>
        </div>
      </div>
    </div>
  );
}
