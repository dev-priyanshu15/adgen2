import 'dotenv/config';
import { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, log } from "./vite";
import app from "./app";

// Dev server entry point - includes Vite HMR
async function startDevServer() {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  await setupVite(app, server);

  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({ port, host: "0.0.0.0" }, () => {
    log(`Dev server running on port ${port}`);
  });
}

startDevServer();
