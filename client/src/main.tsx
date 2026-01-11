import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Suppress AbortError from video play/pause (harmless browser behavior)
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.name === 'AbortError') {
    event.preventDefault();
    console.log('[MAIN] Suppressed AbortError from video play/pause');
    return;
  }
});

createRoot(document.getElementById("root")!).render(<App />);
