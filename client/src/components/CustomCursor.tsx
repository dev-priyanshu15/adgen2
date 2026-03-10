import { useEffect, useRef, useState } from 'react';

export function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const lerped = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Disable on touch / mobile
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768) {
      setIsTouchDevice(true);
      return;
    }

    let raf: number;
    const updatePosition = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const tick = () => {
      lerped.current.x += (pos.current.x - lerped.current.x) * 0.15;
      lerped.current.y += (pos.current.y - lerped.current.y) * 0.15;
      if (outerRef.current) {
        outerRef.current.style.transform = `translate(${lerped.current.x - 8}px, ${lerped.current.y - 8}px)`;
      }
      if (innerRef.current) {
        innerRef.current.style.transform = `translate(${pos.current.x - 3}px, ${pos.current.y - 3}px)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', updatePosition);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(raf);
    };
  }, [isVisible]);

  if (isTouchDevice || !isVisible) return null;

  return (
    <>
      <div
        ref={outerRef}
        className="fixed top-0 left-0 pointer-events-none z-50"
        style={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)',
          boxShadow: '0 0 8px rgba(124,58,237,0.25)',
          willChange: 'transform',
        }}
      />
      <div
        ref={innerRef}
        className="fixed top-0 left-0 pointer-events-none z-50"
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'var(--text)',
          willChange: 'transform',
        }}
      />
    </>
  );
}
