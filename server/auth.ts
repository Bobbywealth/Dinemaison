import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import connectPg from "connect-pg-simple";
import MemoryStore from "memorystore";
import type { Express, RequestHandler } from "express";
import { db } from "./db";
import { users } from "@shared/models/auth";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { logger } from "./lib/logger";
import { authRateLimitMiddleware } from "./middleware/rateLimiter";

// Session configuration
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const sessionSecret = process.env.SESSION_SECRET || 'dev-secret-change-in-production';
  
  // Log environment status for debugging
  logger.debug('Auth setup - Environment check', {
    hasSessionSecret: !!process.env.SESSION_SECRET,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    nodeEnv: process.env.NODE_ENV,
  });
  
  let store;
  
  // Use PostgreSQL store in production if DATABASE_URL is available
  if (process.env.DATABASE_URL) {
    try {
      const pgStore = connectPg(session);
      store = new pgStore({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: true,
        ttl: sessionTtl,
        tableName: "sessions",
      });
      logger.info('Using PostgreSQL session store');
    } catch (error) {
      logger.error('Failed to create PostgreSQL session store', error);
      // Fall back to memory store
      const MemStore = MemoryStore(session);
      store = new MemStore({ checkPeriod: sessionTtl });
      logger.warn('Falling back to memory session store');
    }
  } else {
    // Use memory store for development or when DATABASE_URL is not set
    const MemStore = MemoryStore(session);
    store = new MemStore({ checkPeriod: sessionTtl });
    logger.info('Using memory session store (no DATABASE_URL)');
  }
  
  const isProduction = process.env.NODE_ENV === "production";
  
  return session({
    secret: sessionSecret,
    store: store,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction, // HTTPS only in production
      sameSite: "lax", // 'lax' works for same-site requests
      maxAge: sessionTtl,
    },
  });
}

// Setup authentication
export async function setupAuth(app: Express) {
  logger.info('Setting up authentication...');
  
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());
  
  logger.info('Session middleware configured');

  // Passport Local Strategy
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email.toLowerCase()));

          if (!user) {
            return done(null, false, { message: "Invalid email or password" });
          }

          const isValidPassword = await bcrypt.compare(password, user.password);
          if (!isValidPassword) {
            return done(null, false, { message: "Invalid email or password" });
          }

          // Don't send password to client
          const { password: _, ...userWithoutPassword } = user;
          return done(null, userWithoutPassword);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id));

      if (!user) {
        return done(null, false);
      }

      const { password: _, ...userWithoutPassword } = user;
      done(null, userWithoutPassword);
    } catch (error) {
      done(error);
    }
  });
}

// Authentication middleware
export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Auth routes
export function registerAuthRoutes(app: Express) {
  // Apply stricter rate limiting to all auth endpoints
  app.use("/api/auth/signup", authRateLimitMiddleware());
  app.use("/api/auth/login", authRateLimitMiddleware());
  app.use("/api/auth/forgot-password", authRateLimitMiddleware());
  app.use("/api/auth/reset-password", authRateLimitMiddleware());

  // Signup
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Check if user already exists
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()));

      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const [newUser] = await db
        .insert(users)
        .values({
          email: email.toLowerCase(),
          password: hashedPassword,
          firstName,
          lastName,
        })
        .returning();

      // Log user in automatically
      const { password: _, ...userWithoutPassword } = newUser;
      req.login(userWithoutPassword, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error logging in after signup" });
        }
        res.json({ user: userWithoutPassword });
      });
    } catch (error: any) {
      logger.error("Signup error", error);
      res.status(500).json({ message: "Error creating account" });
    }
  });

  // Login
  app.post("/api/auth/login", (req, res, next) => {
    logger.debug('Login attempt', { email: req.body.email });
    
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        logger.error('Login error', err);
        return res.status(500).json({ message: "Error logging in" });
      }
      if (!user) {
        logger.debug('Login failed', { reason: info?.message });
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      req.login(user, (err) => {
        if (err) {
          logger.error('Session error', err);
          return res.status(500).json({ message: "Error logging in" });
        }
        logger.info('Login successful', { email: user.email });
        res.json({ user });
      });
    })(req, res, next);
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get("/api/auth/user", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ user: req.user });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Request password reset
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()));

      if (!user) {
        // Don't reveal if user exists for security
        return res.json({ 
          message: "If an account exists with that email, a password reset link has been sent." 
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      // Save token to database
      await db
        .update(users)
        .set({
          resetPasswordToken: resetToken,
          resetPasswordExpires: resetTokenExpiry,
        })
        .where(eq(users.id, user.id));

      // TODO: Send email with reset link
      // For now, log it to console (replace with actual email service)
      logger.info('Password reset link generated', {
        resetLink: `http://localhost:${process.env.PORT || 5000}/reset-password/${resetToken}`,
        expiresIn: '1 hour',
      });

      res.json({ 
        message: "If an account exists with that email, a password reset link has been sent.",
        // For development only - remove in production:
        resetToken: process.env.NODE_ENV === "development" ? resetToken : undefined
      });
    } catch (error: any) {
      logger.error("Forgot password error", error);
      res.status(500).json({ message: "Error processing request" });
    }
  });

  // Reset password with token
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      // Find user with valid reset token
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.resetPasswordToken, token));

      if (!user || !user.resetPasswordExpires) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      // Check if token is expired
      if (new Date() > user.resetPasswordExpires) {
        return res.status(400).json({ message: "Reset token has expired" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password and clear reset token
      await db
        .update(users)
        .set({
          password: hashedPassword,
          resetPasswordToken: null,
          resetPasswordExpires: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      res.json({ message: "Password has been reset successfully" });
    } catch (error: any) {
      logger.error("Reset password error", error);
      res.status(500).json({ message: "Error resetting password" });
    }
  });
}

