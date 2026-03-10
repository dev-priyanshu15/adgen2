import { app, startServer } from "../server/index";

let prometheusRegistered = false;

export default async (req: any, res: any) => {
  // Ensure routes are registered
  // On Vercel, the function might be reused, so we only register once
  if (!prometheusRegistered) {
    // We don't need to call startServer because that starts listening
    // but we DO need registerRoutes(app) and the error handlers
    const { registerRoutes } = await import("../server/routes");
    await registerRoutes(app);
    
    // Add error handler
    app.use((err: any, _req: any, res: any, _next: any) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });
    
    prometheusRegistered = true;
  }

  return app(req, res);
};
