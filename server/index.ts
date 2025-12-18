// Log environment variables FIRST before any imports that might fail
console.log('=== DINE MAISON SERVER STARTUP ===');
console.log('Environment variables check:');
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  PORT:', process.env.PORT);
console.log('  DATABASE_URL:', process.env.DATABASE_URL ? '✅ SET' : '❌ NOT SET');
console.log('  SESSION_SECRET:', process.env.SESSION_SECRET ? '✅ SET' : '❌ NOT SET');
console.log('================================');

import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { setupAuth, registerAuthRoutes } from "./auth";
import { config, getBaseUrl } from "./config";
import { logger } from "./lib/logger";
import { rateLimitMiddleware } from "./middleware/rateLimiter";
import { requestLoggerMiddleware } from "./middleware/requestLogger";
import { setupSwagger } from "./swagger";
import { wsManager } from "./websocket";
import { registerUploadRoutes } from "./routes/upload";

const app = express();
const httpServer = createServer(app);

// Security: Set various HTTP headers for protection
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https://fonts.googleapis.com",
        "https://fonts.gstatic.com"
      ],
      fontSrc: [
        "'self'", 
        "https://fonts.gstatic.com", 
        "https://fonts.googleapis.com",
        "data:"
      ],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      mediaSrc: ["'self'", "https:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      connectSrc: [
        "'self'",
        "wss:",
        "ws:",
        "https://api.stripe.com",
        "https://fonts.googleapis.com",
        "https://fonts.gstatic.com",
      ],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow embedding images from CDNs
}));

// Performance: Compress all responses
app.use(compression());

// CORS: Allow cross-origin requests (configure as needed)
app.use(cors({
  origin: config.server.isProduction 
    ? ['https://dine-maison-official-site.onrender.com', 'https://dinemaison.com']
    : true,
  credentials: true,
}));

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

async function initStripe() {
  // Stripe initialization removed - will be set up manually via Stripe Dashboard
  // For production, configure webhooks directly in Stripe Dashboard pointing to:
  // https://your-domain.com/api/stripe/webhook
  console.log('Stripe initialization skipped - configure webhooks in Stripe Dashboard');
}

// Stripe webhook endpoint - configure this URL in your Stripe Dashboard
app.post(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const signature = req.headers['stripe-signature'];
    if (!signature) return res.status(400).json({ error: 'Missing signature' });

    try {
      // TODO: Implement Stripe webhook handling here
      // const sig = Array.isArray(signature) ? signature[0] : signature;
      // Process webhook events based on your needs
      console.log('Stripe webhook received');
      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error.message);
      res.status(400).json({ error: 'Webhook processing error' });
    }
  }
);

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

// Apply rate limiting
app.use(rateLimitMiddleware);

// Request logging middleware
app.use(requestLoggerMiddleware);

(async () => {
  try {
    logger.info('Starting Dine Maison server...', {
      environment: config.server.env,
      port: config.server.port,
    });

    await initStripe();
    await setupAuth(app);
    registerAuthRoutes(app);
    
    // Setup API documentation
    setupSwagger(app);
    logger.info('API documentation available at /api/docs');

    // Register all routes
    await registerRoutes(httpServer, app);
    registerUploadRoutes(app);

    // Setup WebSocket
    wsManager.setup(httpServer);

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      logger.error('Request error', err, {
        status,
        url: _req.url,
        method: _req.method,
      });

      res.status(status).json({ message });
    });

    // Setup vite in development or serve static files in production
    if (config.server.isProduction) {
      serveStatic(app);
    } else {
      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
    }

    // Start server
    httpServer.listen(
      config.server.port,
      config.server.host,
      () => {
        logger.info('Server started successfully', {
          port: config.server.port,
          host: config.server.host,
          environment: config.server.env,
        });
      },
    );

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      httpServer.close(() => {
        logger.info('Server closed');
        wsManager.destroy();
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      httpServer.close(() => {
        logger.info('Server closed');
        wsManager.destroy();
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
})();
