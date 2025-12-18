# Environment Configuration Guide

## Quick Setup (Development)

### 1. Copy Environment Template
```bash
cp .env.example .env
```

### 2. Generate Session Secret
```bash
# On macOS/Linux:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Copy the output and paste it as `SESSION_SECRET` in your `.env` file.

### 3. Set Up Database

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database
createdb dinemaison

# Update .env with connection string
DATABASE_URL=postgresql://localhost:5432/dinemaison
```

**Option B: Hosted PostgreSQL (Recommended)**
- [Neon](https://neon.tech) - Free tier, instant setup
- [Supabase](https://supabase.com) - Free tier with additional features
- [Railway](https://railway.app) - Free PostgreSQL hosting

Get your connection string and set it as `DATABASE_URL` in `.env`

### 4. Set Up Stripe (For Payments)

1. Create a free account at [stripe.com](https://stripe.com)
2. Go to [Developers > API Keys](https://dashboard.stripe.com/apikeys)
3. Copy your **Test mode** keys:
   - Secret key (starts with `sk_test_`)
   - Publishable key (starts with `pk_test_`)
4. Add to `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_your_key_here
   STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
   ```

### 5. Start Application
```bash
npm install
npm run db:push  # Set up database schema
npm run seed     # Add sample data (if seed script exists)
npm run dev      # Start development server
```

---

## Required Environment Variables

### ✅ CRITICAL (Must be set)

#### `DATABASE_URL`
- **Required:** Yes
- **Purpose:** PostgreSQL database connection
- **Impact if missing:** App won't start, data can't be stored
- **Format:** `postgresql://user:password@host:port/database`
- **Example:** `postgresql://localhost:5432/dinemaison`

#### `SESSION_SECRET`
- **Required:** Yes (for production)
- **Purpose:** Encrypt session cookies
- **Impact if missing:** Sessions won't persist, users get logged out constantly
- **How to generate:** `openssl rand -base64 32`
- **Example:** `a8f5f167f44f4964e6c998dee827110c`

#### `STRIPE_SECRET_KEY`
- **Required:** For payment features
- **Purpose:** Process payments and payouts
- **Impact if missing:** Payment setup fails, chefs can't receive earnings
- **Format:** `sk_test_...` (test) or `sk_live_...` (production)
- **Get from:** https://dashboard.stripe.com/apikeys

#### `STRIPE_PUBLISHABLE_KEY`
- **Required:** For payment features
- **Purpose:** Initialize Stripe on frontend
- **Impact if missing:** Payment forms won't load
- **Format:** `pk_test_...` (test) or `pk_live_...` (production)
- **Get from:** https://dashboard.stripe.com/apikeys

---

## Optional Environment Variables

### `APP_URL`
- **Default:** `http://localhost:5000`
- **Purpose:** Base URL for email links, OAuth callbacks
- **Production Example:** `https://dinemaison.com`

### `PORT`
- **Default:** `5000`
- **Purpose:** Server port number
- **Example:** `3000`, `8080`

### `NODE_ENV`
- **Default:** `development`
- **Options:** `development`, `production`, `test`
- **Purpose:** Controls logging, debugging, optimizations

### `STRIPE_WEBHOOK_SECRET`
- **Purpose:** Verify Stripe webhook signatures
- **Format:** `whsec_...`
- **Get from:** https://dashboard.stripe.com/webhooks
- **Note:** Only needed if setting up webhook endpoints

---

## Environment-Specific Configurations

### Development (.env)
```bash
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/dinemaison
SESSION_SECRET=dev-secret-DO-NOT-USE-IN-PRODUCTION
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
APP_URL=http://localhost:5000
PORT=5000
```

### Production (.env.production)
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@production-host.com:5432/dinemaison?sslmode=require
SESSION_SECRET=<strong-random-32-character-secret>
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
APP_URL=https://dinemaison.com
PORT=5000
```

---

## Troubleshooting

### "Session expires immediately after login"
**Cause:** Missing or weak `SESSION_SECRET`, or `DATABASE_URL` not set  
**Fix:**
1. Set strong `SESSION_SECRET`: `openssl rand -base64 32`
2. Verify `DATABASE_URL` points to accessible PostgreSQL instance
3. Check database connection: `npm run db:check` (if script exists)
4. Clear browser cookies and try again

### "Failed to start payment setup"
**Cause:** Missing Stripe API keys  
**Fix:**
1. Set `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY`
2. Verify keys are valid (test vs live mode)
3. Check Stripe account is active
4. Restart server after adding keys

### "0 chefs found" on browse page
**Cause:** No markets configured in database  
**Fix:**
1. Run market seed script: `npm run seed:markets` (to be created)
2. Or manually add via admin dashboard: Markets > Add Market
3. Assign chefs to markets

### Database connection errors
**Cause:** Invalid `DATABASE_URL` or database not accessible  
**Fix:**
1. Verify PostgreSQL is running: `pg_isready`
2. Test connection string format
3. Check firewall/network settings for hosted databases
4. Verify SSL mode matches database requirements

### Port already in use
**Cause:** Another process using port 5000  
**Fix:**
1. Change `PORT` in `.env` to different number (e.g., 3000, 8080)
2. Or kill process: `lsof -ti:5000 | xargs kill -9`

---

## Security Best Practices

### ✅ DO:
- Use strong random `SESSION_SECRET` (min 32 characters)
- Keep `.env` files out of version control (in `.gitignore`)
- Use different secrets for dev/staging/production
- Rotate secrets periodically (every 90 days)
- Use environment variables for all secrets (never hardcode)
- Use SSL/TLS in production (`DATABASE_URL` with `sslmode=require`)

### ❌ DON'T:
- Commit `.env` files to Git
- Share secrets via email/Slack
- Use default/weak secrets in production
- Hardcode secrets in source code
- Use production keys in development
- Leave test mode Stripe keys in production

---

## Deployment Checklist

Before deploying to production:

- [ ] Set strong `SESSION_SECRET` (32+ random characters)
- [ ] Set production `DATABASE_URL` with SSL mode
- [ ] Use Stripe **live mode** keys (not test mode)
- [ ] Set `NODE_ENV=production`
- [ ] Set correct `APP_URL` for your domain
- [ ] Configure Stripe webhooks for production URL
- [ ] Test all environment variables are loaded correctly
- [ ] Verify database migrations are applied
- [ ] Test login/logout functionality
- [ ] Test payment flow end-to-end
- [ ] Set up database backups
- [ ] Configure error monitoring (Sentry, etc.)
- [ ] Set up logging and monitoring
- [ ] Review and rotate all secrets

---

## Getting Help

If you're stuck with environment setup:

1. Check the logs: `npm run dev` will show detailed error messages
2. Verify `.env` file exists and is in project root
3. Ensure no syntax errors in `.env` (no quotes needed for values)
4. Restart server after changing environment variables
5. Check `ROOT_CAUSE_ANALYSIS.md` for specific issue debugging

For Stripe setup help: https://stripe.com/docs/keys
For database setup help: See `LOCAL_SETUP.md`

