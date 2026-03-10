import app from "../server/app";
import { registerRoutes } from "../server/routes";

let routesRegistered = false;

export default async (req: any, res: any) => {
  if (!routesRegistered) {
    try {
      await registerRoutes(app);
      
      // Add a simple error handler for the API
      app.use((err: any, _req: any, res: any, _next: any) => {
        console.error("Vercel API Error:", err);
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        res.status(status).json({ message });
      });
      
      routesRegistered = true;
    } catch (e) {
      console.error("Failed to register routes:", e);
      return res.status(500).json({ error: "Failed to initialize application" });
    }
  }

  return app(req, res);
};
