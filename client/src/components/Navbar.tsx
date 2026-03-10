import { Link, useLocation } from "wouter";
import { Zap } from "lucide-react";

export default function Navbar() {
  const [location] = useLocation();

  const scrollTo = (id: string) => {
    if (location === "/") {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
  };

  const navLinks = [
    { href: "/", label: "Create", id: "generator-section" },
    { href: "/newspaper-ad", label: "Newspaper Ad" },
    { href: "/event-poster", label: "Event Poster" },
    { href: "/social-media-ads", label: "Social Media" },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-10"
      style={{
        height: 60,
        background: '#ffffff',
        borderBottom: '1px solid #e8eaed',
      }}
    >
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5" style={{ color: 'var(--accent-raw)' }} />
        <Link href="/">
           <span className="font-bold text-base cursor-pointer" style={{ color: 'var(--text)' }}>AdGenius</span>
        </Link>
      </div>

      <div className="hidden md:flex items-center gap-6">
        {navLinks.map((link) => (
          link.href === "/" && location === "/" ? (
            <span 
              key={link.label}
              onClick={() => scrollTo(link.id!)}
              className="text-sm font-medium transition-colors hover:opacity-70 cursor-pointer" 
              style={{ color: '#111827' }}
            >
              {link.label}
            </span>
          ) : (
            <Link key={link.href} href={link.href}>
              <span 
                className="text-sm font-medium transition-colors hover:opacity-70 cursor-pointer" 
                style={{ color: location === link.href ? '#111827' : 'var(--text-muted)' }}
              >
                {link.label}
              </span>
            </Link>
          )
        ))}
      </div>

      <button 
        onClick={() => location === "/" ? scrollTo("generator-section") : window.location.href = "/"}
        className="btn-dark px-6 py-2 rounded-lg text-sm font-semibold bg-[#111827] text-white border-none cursor-pointer hover:bg-zinc-800 transition-colors"
      >
        Get Started
      </button>
    </nav>
  );
}
