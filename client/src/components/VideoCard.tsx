import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Video as VideoIcon } from 'lucide-react';

interface VideoCardProps {
  videoUrl?: string;
  isLoading: boolean;
  delay?: number;
}

export function VideoCard({ videoUrl, isLoading, delay = 0 }: VideoCardProps) {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  console.log('VideoCard render:', { videoUrl, isLoading, videoLoaded, videoError });

  // Handle video element cleanup to prevent play/pause errors
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Suppress AbortError from play/pause interruptions
    const handleError = (e: Event) => {
      const error = (e.target as HTMLVideoElement)?.error;
      if (error && error.code === MediaError.MEDIA_ERR_ABORTED) {
        // Suppress abort errors (they're harmless)
        return;
      }
    };

    // Handle play promise errors globally for this video
    const handlePlay = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // Suppress AbortError (harmless interruption from pause/unmount)
          if (error.name !== 'AbortError') {
            console.error('[VideoCard] Play error:', error);
          }
        });
      }
    };

    video.addEventListener('error', handleError);
    video.addEventListener('play', handlePlay);

    return () => {
      video.removeEventListener('error', handleError);
      video.removeEventListener('play', handlePlay);
      // Pause video on unmount to prevent play() promise issues
      if (video && !video.paused) {
        try {
          video.pause();
        } catch (e) {
          // Ignore pause errors during cleanup
        }
      }
    };
  }, [videoUrl]);
  
  const handleDownload = () => {
    if (!videoUrl) return;
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = 'ad-video.mp4';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card
      className="p-8 backdrop-blur-xl bg-card/80 border-card-border shadow-2xl shadow-primary/10 hover:shadow-primary/20 transition-all duration-500 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
      data-testid="card-video"
      data-video-url={videoUrl}
      data-is-loading={isLoading}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-foreground">Generated Video</h3>
        {videoUrl && (
          <Button
            size="sm"
            variant="ghost"
            data-testid="button-download-video"
            onClick={handleDownload}
            className="hover-elevate active-elevate-2"
          >
            <Download className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="relative aspect-video rounded-lg overflow-hidden bg-background/50 border border-border">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Generating video ad...</p>
            <p className="text-xs text-muted-foreground/70">This may take 1-2 minutes</p>
          </div>
        ) : videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            preload="metadata"
            className="w-full h-full object-cover"
            data-testid="video-generated"
            onLoadedData={() => {
              console.log('[VideoCard] Video loaded successfully:', videoUrl);
              setVideoLoaded(true);
            }}
            onError={(e) => {
              const error = (e.target as HTMLVideoElement)?.error;
              // Suppress AbortError (harmless interruption)
              if (error && error.code === MediaError.MEDIA_ERR_ABORTED) {
                console.log('[VideoCard] Video load aborted (harmless)');
                return;
              }
              console.error('[VideoCard] Video failed to load:', videoUrl, e);
              setVideoError(true);
            }}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <VideoIcon className="w-12 h-12 opacity-50" />
            <p className="text-sm">Video will appear here</p>
          </div>
        )}
      </div>
    </Card>
  );
}
