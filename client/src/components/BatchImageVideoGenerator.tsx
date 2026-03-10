import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2, Play, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import type { AdCopy } from '@shared/schema';

interface GeneratedBatch {
  images: any[];
  caption: string;
  videoUrl?: string;
}

interface BatchImageVideoGeneratorProps {
  campaign?: {
    adCopy: AdCopy;
    productName: string;
    tone: string;
  } | null;
}

export function BatchImageVideoGenerator({ campaign }: BatchImageVideoGeneratorProps) {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState(
    campaign?.adCopy?.description || 
    `Beautiful ${campaign?.productName || 'product'} photography`
  );
  const [caption, setCaption] = useState(
    campaign?.adCopy?.headline || 'Amazing Product'
  );
  const [batch, setBatch] = useState<GeneratedBatch | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showImages, setShowImages] = useState(false);

  const generateImagesMutation = useMutation({
    mutationFn: async () => {
      if (!prompt.trim()) {
        throw new Error('Please enter a prompt');
      }
      console.log('[BATCH] Sending request to generate 10 images...');
      console.log('[BATCH] Prompt:', prompt);
      console.log('[BATCH] Campaign data:', campaign);
      
      const response = await apiRequest<any>('POST', '/api/batch/generate-images-video', {
        prompt: prompt,
        caption: caption,
        productName: campaign?.productName,
        tone: campaign?.tone,
        headline: campaign?.adCopy?.headline,
        description: campaign?.adCopy?.description,
        visualPrompts: campaign?.adCopy?.visualPrompts || [],
      });
      console.log('[BATCH] Response received:', response);
      return response;
    },
    onSuccess: (data) => {
      console.log('[BATCH] Success! Generated', data.images?.length, 'images');
      setBatch({
        images: data.images || [],
        caption: data.caption || caption,
      });
      setShowImages(true);
      setSelectedImage(0);
      toast({
        title: 'Success!',
        description: `Generated ${data.images?.length || 10} images using DALL-E 3`,
      });
    },
    onError: (error: Error) => {
      console.error('[BATCH] Error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate images',
        variant: 'destructive',
      });
    },
  });

  const createVideoMutation = useMutation({
    mutationFn: async () => {
      if (!batch?.images) throw new Error('No images available');
      console.log('[BATCH] Creating video from', batch.images.length, 'images...');
      const response = await apiRequest<any>('POST', '/api/batch/create-video', {
        images: batch.images,
        caption: batch.caption,
      });
      console.log('[BATCH] Video created:', response);
      return response;
    },
    onSuccess: (data) => {
      console.log('[BATCH] Video created successfully');
      setBatch((prev) => (prev ? { ...prev, videoUrl: data.videoUrl } : prev));
      toast({
        title: 'Video Created!',
        description: 'Your slideshow is ready',
      });
    },
    onError: (error: Error) => {
      console.error('[BATCH] Video error:', error);
      toast({
        title: 'Video Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  if (showImages && batch) {
    return (
      <div className="w-full min-h-screen p-10 px-6" style={{ background: '#f0f2f5' }}>
        <div className="max-w-[640px] mx-auto">
          <button
            onClick={() => {
              setShowImages(false);
              setBatch(null);
            }}
            className="mb-6 flex items-center transition-colors"
            style={{ 
              background: 'white', border: '1px solid #e8eaed', color: '#6b7280', 
              borderRadius: '8px', padding: '8px 16px', fontSize: '14px', cursor: 'pointer' 
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = '#ea580c'; e.currentTarget.style.color = '#ea580c'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e8eaed'; e.currentTarget.style.color = '#6b7280'; }}
          >
            ← Back to Generator
          </button>

          <div className="space-y-6">
            {/* Main Image */}
            <Card className="p-8 bg-white border-[#e8eaed] rounded-[16px]">
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-[20px] font-bold text-[#111827]">Generated Images</h2>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#6b7280' }}>
                  {batch.images.length}/10 images ready
                </div>
              </div>

              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black mb-4">
                {batch.images[selectedImage] ? (
                  <img
                    src={batch.images[selectedImage]}
                    alt={`Image ${selectedImage + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">Loading...</div>
                )}
                <div 
                  className="absolute top-4 right-4 text-white"
                  style={{ background: 'rgba(0,0,0,0.7)', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', borderRadius: '4px', padding: '4px 8px' }}
                >
                  {selectedImage + 1}/{batch.images.length}
                </div>

                {/* Navigation */}
                <button
                  onClick={() => setSelectedImage(Math.max(0, selectedImage - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 p-2 rounded transition-colors"
                  title="Previous image"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={() => setSelectedImage(Math.min(batch.images.length - 1, selectedImage + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 p-2 rounded transition-colors"
                  title="Next image"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Thumbnail Strip */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {batch.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-md border-2 overflow-hidden transition-all ${
                      selectedImage === idx ? 'border-[#ea580c] scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </Card>

            {/* Create Video Button */}
            <Card className="p-8 bg-white border-[#e8eaed] rounded-[16px]">
              <button
                onClick={() => {}}
                disabled={true}
                className="w-full py-4 text-[15px] font-semibold transition-all cursor-not-allowed"
                style={{ 
                  background: '#ea580c', color: 'white', border: 'none', borderRadius: '8px', 
                  opacity: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <div className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Create Video Slideshow
                </div>
                <span style={{ 
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', 
                  fontWeight: 700, letterSpacing: '0.1em', color: '#fff', marginTop: '4px' 
                }}>COMING SOON</span>
              </button>
            </Card>

            {/* Video Preview (Still keeping logic if it ever works) */}
            {batch.videoUrl && (
              <Card className="p-8 bg-white border-[#e8eaed] rounded-[16px]">
                <h3 className="text-xl font-bold mb-4 text-[#111827]">Your Video</h3>
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black mb-4">
                  <video src={batch.videoUrl} controls className="w-full h-full" />
                </div>
                <button
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = batch.videoUrl!;
                    a.download = 'slideshow.mp4';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                  className="w-full py-3 flex items-center justify-center gap-2 transition-all hover:translate-y-[-1px]"
                  style={{ background: '#111827', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600 }}
                >
                  <Download className="w-4 h-4" />
                  Download Video
                </button>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-10 px-6" style={{ background: '#f0f2f5' }}>
      <div 
        className="max-w-[640px] mx-auto p-10 bg-white" 
        style={{ border: '1px solid #e8eaed', borderRadius: '16px' }}
      >
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#ea580c', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>
          BATCH GENERATOR
        </div>
        <h1 className="text-[28px] font-bold text-[#111827] mb-1">Image & Video Generator</h1>
        <p className="text-[14px] text-[#6b7280] mb-8">Generate 10 professional images for your campaign</p>

        <div className="space-y-6">
          <div>
            <label style={{ 
              fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 600, 
              letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7280', 
              marginBottom: '8px', display: 'block' 
            }}>
              What do you want to create?
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g. 'Beautiful sunset over mountains', 'Modern office workspace'..."
              className="w-full h-32 transition-colors border-[#e8eaed] focus:border-[#ea580c]"
              style={{ 
                background: 'white', border: '1px solid #e8eaed', borderRadius: '8px', 
                padding: '12px', fontSize: '14px', color: '#111827', outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#ea580c'}
              onBlur={(e) => e.target.style.borderColor = '#e8eaed'}
            />
          </div>

          <div>
            <label style={{ 
              fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 600, 
              letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7280', 
              marginBottom: '8px', display: 'block' 
            }}>
              Video Caption
            </label>
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="E.g. 'Amazing Product Showcase'"
              className="w-full transition-colors border-[#e8eaed] focus:border-[#ea580c]"
              style={{ 
                background: 'white', border: '1px solid #e8eaed', borderRadius: '8px', 
                padding: '12px', fontSize: '14px', color: '#111827', outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#ea580c'}
              onBlur={(e) => e.target.style.borderColor = '#e8eaed'}
            />
          </div>

          <button
            onClick={() => generateImagesMutation.mutate()}
            disabled={generateImagesMutation.isPending || !prompt.trim()}
            className="w-full transition-all flex items-center justify-center gap-2"
            style={{ 
              background: '#ea580c', color: 'white', border: 'none', borderRadius: '8px', 
              padding: '14px', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
              opacity: (generateImagesMutation.isPending || !prompt.trim()) ? 0.5 : 1
            }}
            onMouseOver={(e) => { if (!generateImagesMutation.isPending) { e.currentTarget.style.background = '#dc4a08'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
            onMouseOut={(e) => { if (!generateImagesMutation.isPending) { e.currentTarget.style.background = '#ea580c'; e.currentTarget.style.transform = 'translateY(0)'; } }}
          >
            {generateImagesMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating 10 Images...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Generate 10 Images
              </>
            )}
          </button>

          <div 
            style={{ 
              background: '#fffaf8', border: '1px solid #fed7aa', borderRadius: '8px', 
              padding: '12px 16px', fontSize: '13px', color: '#6b7280', marginTop: '16px' 
            }}
          >
            <p>
              💡 <strong>Tip:</strong> The more detailed your description, the better the images will be!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
