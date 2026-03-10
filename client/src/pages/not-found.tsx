import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-md mx-4 rounded-lg p-8" style={{ background: 'var(--surface)', border: '1px solid var(--border-raw)' }}>
        <div className="flex mb-4 gap-3 items-center">
          <AlertCircle className="h-6 w-6" style={{ color: 'var(--accent)' }} />
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>404 Page Not Found</h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Did you forget to add the page to the router?
        </p>
      </div>
    </div>
  );
}
