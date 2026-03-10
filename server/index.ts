import 'dotenv/config';
import { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { log } from "./utils";
import app from "./app";

// IMPORTANT: We move the logic into a function that can be called or run
export async function startServer() {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  // Only serve frontend in development mode (local dev with Vite)
  // On Render/production, this is an API-only server
  if (process.env.NODE_ENV === "development") {
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  } else if (!process.env.RENDER) {
    // Only serve static files if NOT on Render (since Render = API only)
    try {
      const { serveStatic } = await import("./vite");
      serveStatic(app);
    } catch (e) {
      log("Static file serving skipped (API-only mode)");
    }
  }

  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({ port, host: "0.0.0.0" }, () => {
    log(`serving on port ${port}`);
  });
  
  return server;
}

// Always start the server (Render, local dev, etc.)
startServer();

export { app };