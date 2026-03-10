import 'dotenv/config';
import { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { log } from "./utils";
import app from "./app";

// IMPORTANT: We move the logic into a function that can be called or run
export async function startServer() {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || '5000', 10);
  const listenOpts: any = {
    port,
    host: "0.0.0.0",
  };

  if (process.platform !== "win32") {
    listenOpts.reusePort = true;
  }

  server.listen(listenOpts, () => {
    log(`serving on port ${port}`);
  });
  
  return server;
}

// Only run automatically if not on Vercel and not being imported
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  startServer();
}

export { app };
