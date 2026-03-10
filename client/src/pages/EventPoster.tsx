import { useState } from "react";
import { Link } from "wouter";
import { Zap, Calendar, MapPin, Check, Download, RefreshCw, Share2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { EventPosterRequest } from "@shared/schema";
import html2canvas from "html2canvas";

interface EventPosterData {
  headline: string;
  tagline: string;
  dateTimeBlock: string;
  venueBlock: string;
  descriptionBlock: string;
  highlightPoints: string[];
  ctaText: string;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  layoutSuggestion: string;
  backgroundStyle: string;
  imageUrl?: string;
}

export default function EventPoster() {
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [venue, setVenue] = useState("");
  const [description, setDescription] = useState("");
  const [theme, setTheme] = useState<"CORPORATE" | "FESTIVAL" | "CONCERT" | "CONFERENCE">("CORPORATE");
  const [primaryColor, setPrimaryColor] = useState("");
  
  const [posterData, setPosterData] = useState<EventPosterData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [registrationLink, setRegistrationLink] = useState("");

  const generateEventPoster = async () => {
    if (!eventName || !eventDate || !eventTime || !venue || !description || !theme || !primaryColor) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await apiRequest<EventPosterData>("POST", "/api/event/poster", { 
        eventName, 
        eventDate, 
        eventTime, 
        venue, 
        description, 
        theme, 
        primaryColor 
      });
      setPosterData(data);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    const posterEl = document.getElementById("event-poster-preview");
    if (!posterEl) return;
    
    setDownloading(true);
    try {
      const canvas = await html2canvas(posterEl, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
      });
      
      const link = document.createElement("a");
      link.download = `${eventName.replace(/\s+/g, "-").toLowerCase()}-poster.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: eventName,
          text: `Check out this event: ${eventName}`,
          url: window.location.href
        });
      } catch (err) {
        console.log("Share skipped or failed:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowShareTooltip(true);
      setTimeout(() => setShowShareTooltip(false), 2000);
    }
  };

  const THEMES: ("CORPORATE" | "FESTIVAL" | "CONCERT" | "CONFERENCE")[] = [
    "CORPORATE", "FESTIVAL", "CONCERT", "CONFERENCE"
  ];

  const POSTER_IMAGES: Record<string, string> = {
    CORPORATE: 'https://picsum.photos/seed/corporate-office/480/680',
    FESTIVAL: 'https://picsum.photos/seed/festival-lights/480/680',
    CONCERT: 'https://picsum.photos/seed/concert-stage/480/680',
    CONFERENCE: 'https://picsum.photos/seed/conference-hall/480/680',
  }

  const posterImageUrl = posterData?.imageUrl || POSTER_IMAGES[theme?.toUpperCase()] || POSTER_IMAGES.CONFERENCE

  return (
    <div className="min-h-screen p-10 px-6" style={{ background: '#f0f2f5' }}>
      <div className="max-w-[700px] mx-auto">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'white',
            border: '1px solid #e8eaed',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '14px',
            color: '#6b7280',
            cursor: 'pointer',
            marginBottom: '24px',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = '#ea580c'
            e.currentTarget.style.color = '#ea580c'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = '#e8eaed'
            e.currentTarget.style.color = '#6b7280'
          }}
        >
          ← Back
        </button>

        {/* Title Section */}
        <div className="mb-8">
          <div style={{ 
            fontFamily: "'JetBrains Mono', monospace", 
            fontSize: '11px', 
            color: '#ea580c', 
            letterSpacing: '0.1em', 
            fontWeight: 700, 
            marginBottom: '8px', 
            textTransform: 'uppercase' 
          }}>
            EVENT POSTER
          </div>
          <h1 className="text-[28px] font-bold text-[#111827] mb-1">Event Poster Generator</h1>
          <p className="text-[14px] text-[#6b7280]">
            Create professional event posters with AI
          </p>
        </div>

        {/* Input Section */}
        <div 
          className="bg-white p-8 mb-8" 
          style={{ border: '1px solid #e8eaed', borderRadius: '16px' }}
        >
          <div className="space-y-6">
            <div>
              <label style={{ 
                fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 600, 
                letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7280', 
                marginBottom: '8px', display: 'block' 
              }}>
                Event Name
              </label>
              <input
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Annual Tech Summit 2025"
                className="w-full transition-colors"
                style={{ 
                  background: 'white', border: '1px solid #e8eaed', borderRadius: '8px', 
                  padding: '12px', fontSize: '14px', color: '#111827', outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ea580c'}
                onBlur={(e) => e.target.style.borderColor = '#e8eaed'}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={{ 
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 600, 
                  letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7280', 
                  marginBottom: '8px', display: 'block' 
                }}>
                  Event Date
                </label>
                <input
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  placeholder="Saturday, March 15, 2025"
                  className="w-full transition-colors"
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
                  Event Time
                </label>
                <input
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  placeholder="6:00 PM - 10:00 PM IST"
                  className="w-full transition-colors"
                  style={{ 
                    background: 'white', border: '1px solid #e8eaed', borderRadius: '8px', 
                    padding: '12px', fontSize: '14px', color: '#111827', outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#ea580c'}
                  onBlur={(e) => e.target.style.borderColor = '#e8eaed'}
                />
              </div>
            </div>

            <div>
              <label style={{ 
                fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 600, 
                letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7280', 
                marginBottom: '8px', display: 'block' 
              }}>
                Venue
              </label>
              <input
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="The Grand Ballroom, Mumbai"
                className="w-full transition-colors"
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
                Event Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the event..."
                rows={3}
                className="w-full transition-colors resize-none"
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
                Theme / Tone
              </label>
              <div className="flex flex-wrap gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className="px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors"
                    style={{
                      background: theme === t ? '#ea580c' : 'rgba(0,0,0,0.03)',
                      color: theme === t ? '#fff' : '#6b7280',
                      border: `1px solid ${theme === t ? '#ea580c' : '#e8eaed'}`,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ 
                fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 600, 
                letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7280', 
                marginBottom: '8px', display: 'block' 
              }}>
                Primary Color
              </label>
              <input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="Deep Blue, Red, Gold..."
                className="w-full transition-colors"
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
                Registration Link (Google Form)
              </label>
              <input
                value={registrationLink}
                onChange={(e) => setRegistrationLink(e.target.value)}
                placeholder="https://forms.gle/..."
                className="w-full transition-colors"
                style={{ 
                  background: 'white', border: '1px solid #e8eaed', borderRadius: '8px', 
                  padding: '12px', fontSize: '14px', color: '#111827', outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ea580c'}
                onBlur={(e) => e.target.style.borderColor = '#e8eaed'}
              />
            </div>

            <button
              onClick={generateEventPoster}
              disabled={loading}
              className="w-full transition-all flex items-center justify-center gap-2"
              style={{ 
                background: '#ea580c', color: 'white', border: 'none', borderRadius: '8px', 
                padding: '14px', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                opacity: loading ? 0.6 : 1
              }}
              onMouseOver={(e) => { if (!loading) { e.currentTarget.style.background = '#dc4a08'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
              onMouseOut={(e) => { if (!loading) { e.currentTarget.style.background = '#ea580c'; e.currentTarget.style.transform = 'translateY(0)'; } }}
            >
              {loading ? "Generating..." : "Generate Event Poster →"}
            </button>

            {error && <p style={{ color: '#ef4444', fontSize: 13, textAlign: 'center' }}>{error}</p>}
          </div>
        </div>

        {/* Results Section */}
        <div className="flex flex-col items-center">
          {loading && (
            <div 
              className="shimmer-skeleton"
              style={{
                width: '100%',
                maxWidth: '480px',
                height: '680px',
                borderRadius: '16px',
                margin: '0 auto',
              }}
            />
          )}

          {posterData && !loading && (
            <div className="fade-in flex flex-col items-center w-full">
              {/* Visual Poster Container */}
              <div 
                id="event-poster-preview"
                className="flex flex-col"
                style={{
                  width: '100%',
                  maxWidth: '480px',
                  minHeight: '680px',
                  margin: '0 auto',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                  position: 'relative',
                  background: `linear-gradient(135deg, ${posterData.colorScheme?.primary || '#1a1a2e'} 0%, #16213e 100%)`,
                }}
              >
                {/* 1. Background Image */}
                <img
                  src={posterImageUrl}
                  crossOrigin="anonymous"
                  alt=""
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                  style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    zIndex: 0
                  }}
                />

                {/* 2. Dark Overlay */}
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.8) 100%)',
                  zIndex: 1
                }} />

                {/* 3. Content Container */}
                <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%', width: '100%', color: 'white' }}>
                  <div style={{ padding: '40px 36px 32px' }}>
                    <div style={{ 
                      color: 'rgba(255,255,255,0.75)', 
                      fontSize: '11px', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.2em', 
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>
                      EVENT
                    </div>
                    <h2 style={{ 
                      fontSize: '32px', 
                      fontWeight: 800, 
                      color: 'white', 
                      lineHeight: 1.2, 
                      marginTop: '8px',
                      textShadow: '0 2px 8px rgba(0,0,0,0.4)'
                    }}>
                      {posterData.headline}
                    </h2>
                    <p style={{ 
                      fontSize: '14px', 
                      color: 'rgba(255,255,255,0.85)', 
                      marginTop: '12px', 
                      fontWeight: 500,
                    }}>
                      {posterData.tagline}
                    </p>
                    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.25)', margin: '24px 0' }} />
                  </div>

                  <div style={{ padding: '0 36px', flex: 1 }}>
                    <div className="flex items-center gap-3" style={{ marginBottom: '8px' }}>
                      <Calendar className="w-4 h-4 text-white" />
                      <span style={{ fontSize: '15px', fontWeight: 600 }}>{posterData.dateTimeBlock}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-white" />
                      <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)' }}>{posterData.venueBlock}</span>
                    </div>

                    <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {posterData.highlightPoints?.map((pt, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 mt-0.5 text-white" />
                          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)' }}>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ padding: '24px 36px 36px', marginTop: 'auto' }}>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
                      {posterData.descriptionBlock}
                    </p>
                    
                    <button 
                      onClick={() => {
                        if (registrationLink) {
                          window.open(registrationLink.startsWith('http') ? registrationLink : `https://${registrationLink}`, '_blank');
                        }
                      }}
                      style={{ 
                        marginTop: '20px', 
                        width: '100%', 
                        background: 'white', 
                        color: '#111827',
                        borderRadius: '8px', 
                        padding: '12px 28px', 
                        fontSize: '14px', 
                        fontWeight: 700,
                        border: 'none',
                        cursor: registrationLink ? 'pointer' : 'default',
                        display: 'block',
                        textAlign: 'center',
                        transition: 'transform 0.2s',
                      }}
                      onMouseOver={(e) => { if(registrationLink) e.currentTarget.style.transform = 'scale(1.02)'; }}
                      onMouseOut={(e) => { if(registrationLink) e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                      {posterData.ctaText}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 mt-8 relative w-full mb-12">
                <button 
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex items-center gap-2 transition-all"
                  style={{ 
                    background: '#111827', 
                    color: 'white', 
                    borderRadius: '8px', 
                    padding: '12px 24px', 
                    fontSize: '14px', 
                    fontWeight: 600, 
                    border: 'none', 
                    cursor: downloading ? 'not-allowed' : 'pointer'
                  }}
                  onMouseOver={(e) => { if(!downloading) { e.currentTarget.style.background = '#1f2937'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                  onMouseOut={(e) => { if(!downloading) { e.currentTarget.style.background = '#111827'; e.currentTarget.style.transform = 'translateY(0)'; } }}
                >
                  {downloading ? "Downloading..." : "Download Poster"}
                </button>
                
                <button 
                  onClick={handleShare}
                  className="flex items-center gap-2 transition-all"
                  style={{ 
                    background: 'white', 
                    color: '#6b7280', 
                    borderRadius: '8px', 
                    padding: '12px 24px', 
                    fontSize: '14px', 
                    fontWeight: 500, 
                    border: '1px solid #e8eaed', 
                    cursor: 'pointer' 
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = '#ea580c'; e.currentTarget.style.color = '#ea580c'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e8eaed'; e.currentTarget.style.color = '#6b7280'; }}
                >
                  Share
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
