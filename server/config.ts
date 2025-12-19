import { z } from 'zod';

// Environment configuration schema with validation
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  
  // Database
  DATABASE_URL: z.string().optional(),
  
  // Authentication
  REPL_ID: z.string().optional(),
  SESSION_SECRET: z.string().optional(),
  ISSUER_URL: z.string().default('https://replit.com/oidc'),
  
  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),

  // AI
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  OPENAI_BASE_URL: z.string().optional(),
  
  // App URLs
  APP_URL: z.string().optional(),
  REPLIT_DOMAINS: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

// Parse and validate environment variables
function parseEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment variables:', error);
    throw new Error('Environment configuration is invalid');
  }
}

export const env = parseEnv();

// Application configuration
export const config = {
  // Server
  server: {
    port: parseInt(env.PORT, 10),
    host: env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1',
    env: env.NODE_ENV,
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',
  },

  // Database
  database: {
    url: env.DATABASE_URL,
  },

  // Authentication
  auth: {
    replId: env.REPL_ID,
    sessionSecret: env.SESSION_SECRET,
    issuerUrl: env.ISSUER_URL,
    sessionTtl: 7 * 24 * 60 * 60 * 1000, // 1 week
    cookieMaxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
  },

  // Stripe
  stripe: {
    secretKey: env.STRIPE_SECRET_KEY,
    publishableKey: env.STRIPE_PUBLISHABLE_KEY,
    currency: 'usd',
    webhookTolerance: 300, // 5 minutes
  },

  // AI
  ai: {
    apiKey: env.OPENAI_API_KEY,
    model: env.OPENAI_MODEL,
    baseUrl: env.OPENAI_BASE_URL,
    maxTokens: 400,
    temperature: 0.4,
  },

  // URLs
  urls: {
    app: env.APP_URL,
    replitDomains: env.REPLIT_DOMAINS?.split(',') || [],
  },

  // Platform settings
  platform: {
    defaultCommissionRate: 15, // percentage
    serviceFeeRate: 5, // percentage
    refundPolicy: {
      fullRefundHours: 48,
      partialRefundHours: 24,
      partialRefundPercentage: 50,
    },
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // requests per window - increased for SPAs
    standardDelay: 0,
    delayAfter: 500,
    delayMs: 500,
  },

  // File uploads
  uploads: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    allowedDocumentTypes: ['application/pdf', 'image/jpeg', 'image/png'],
  },

  // Logging
  logging: {
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: env.NODE_ENV === 'production' ? 'json' : 'pretty',
  },

  // WebSocket
  websocket: {
    enabled: true,
    path: '/ws',
    pingInterval: 30000, // 30 seconds
    pingTimeout: 5000, // 5 seconds
  },
} as const;

// Helper function to get base URL
export function getBaseUrl(): string {
  if (config.urls.app) {
    return config.urls.app;
  }
  
  if (config.urls.replitDomains.length > 0) {
    return `https://${config.urls.replitDomains[0]}`;
  }
  
  return `http://localhost:${config.server.port}`;
}

// Helper function to check if feature is enabled
export function isFeatureEnabled(feature: 'auth' | 'stripe' | 'websocket' | 'ai'): boolean {
  switch (feature) {
    case 'auth':
      return !!(env.REPL_ID && env.SESSION_SECRET && env.DATABASE_URL);
    case 'stripe':
      return !!(env.STRIPE_SECRET_KEY);
    case 'websocket':
      return config.websocket.enabled;
    case 'ai':
      return Boolean(env.OPENAI_API_KEY);
    default:
      return false;
  }
}

