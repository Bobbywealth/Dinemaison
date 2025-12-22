# Dine Maison - Quick Start Guide

## 🚀 Get Running in 10 Minutes

### Step 1: Environment Setup (3 minutes)

Create a `.env` file in the project root:

```bash
# Copy this template
cat > .env << 'EOF'
# Database (REQUIRED)
DATABASE_URL=your_postgresql_url_here

# Session Secret (REQUIRED - generate with: openssl rand -base64 32)
SESSION_SECRET=your_32_character_random_string_here

# Stripe Keys (REQUIRED for payments)
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# Server Config
PORT=5000
NODE_ENV=development
APP_URL=http://localhost:5000
EOF
```

**Generate session secret:**
```bash
openssl rand -base64 32
```

### Step 2: Database Setup (2 minutes)

```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Add default markets
psql $DATABASE_URL -f migrations/add_default_markets.sql
```

### Step 3: Start Development Server (1 minute)

```bash
npm run dev
```

Visit http://localhost:5000

### Step 4: Test the Platform (4 minutes)

**Test Accounts** (if seed data exists):
- Admin: admin@dinemaison.com / admin123
- Chef: chef@dinemaison.com / chef123  
- Customer: customer@dinemaison.com / customer123

**Quick Tests:**
1. Sign up as new customer
2. Browse chefs at `/chefs` (should see results!)
3. View `/terms`, `/privacy`, `/about`, `/faq` pages
4. Log in as admin → Markets tab → Add Market
5. Log in as chef → Edit Profile

---

## ✅ What's Fixed

### Critical Issues Resolved:
- ✅ Environment configuration documented
- ✅ Market system implemented
- ✅ Chef profile edit page created
- ✅ Legal pages (Terms, Privacy, About, FAQ) created
- ✅ Admin markets management UI improved
- ✅ Market filtering in chef search

### Pages Created (5 new pages):
1. `/chef/profile/edit` - Chef profile editor
2. `/terms` - Terms of Service
3. `/privacy` - Privacy Policy
4. `/about` - About Us
5. `/faq` - FAQ page

### Key Improvements:
- Professional Dialog for adding markets (replaced prompt)
- Comprehensive environment setup guide
- Database migration for 10 default US markets
- Proper form validation and error handling
- Complete legal page templates

---

## 🐛 Known Issues (Require Configuration)

These aren't bugs - they're missing configuration:

1. **Session expires immediately**
   - **Fix:** Set `SESSION_SECRET` and `DATABASE_URL` in `.env`

2. **Stripe payment fails**
   - **Fix:** Set `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` in `.env`
   - Get keys from: https://dashboard.stripe.com/apikeys

3. **Chef browse shows "0 chefs"**
   - **Fix:** Run `migrations/add_default_markets.sql`

---

## 📁 Important Files

- `ENVIRONMENT_SETUP.md` - Full environment configuration guide
- `ROOT_CAUSE_ANALYSIS.md` - Detailed analysis of all issues
- `FIXES_SUMMARY.md` - Complete list of fixes implemented
- `MIGRATION_GUIDE.md` - Database migration instructions
- `migrations/add_default_markets.sql` - Market seed data

---

## 🆘 Troubleshooting

### "Module not found" errors
```bash
npm install
```

### "Database does not exist"
```bash
npm run db:push
```

### "0 chefs found" on browse page
```bash
psql $DATABASE_URL -f migrations/add_default_markets.sql
```

### Session/logout issues
Check that `SESSION_SECRET` is set in `.env`

### Payment setup fails
Check that `STRIPE_SECRET_KEY` is set in `.env`

---

## 📚 Documentation Structure

```
/
├── QUICK_START.md          ← You are here (start here!)
├── ENVIRONMENT_SETUP.md    ← Detailed environment config
├── ROOT_CAUSE_ANALYSIS.md  ← Deep dive into all issues
├── FIXES_SUMMARY.md        ← What was fixed and how
├── MIGRATION_GUIDE.md      ← Database migration help
└── migrations/
    └── add_default_markets.sql  ← Run this to add markets
```

**Read in this order:**
1. QUICK_START.md (this file) - Get running fast
2. ENVIRONMENT_SETUP.md - If you have config issues
3. MIGRATION_GUIDE.md - If you have database issues
4. ROOT_CAUSE_ANALYSIS.md - To understand the codebase
5. FIXES_SUMMARY.md - To see what changed

---

## 🎯 Next Steps After Setup

1. **Configure Stripe** (for payments)
   - Create Stripe account
   - Get API keys
   - Set up webhook endpoint

2. **Customize Legal Pages**
   - Review `/terms` and `/privacy` with attorney
   - Update with your business details
   - Add actual company info to `/about`

3. **Add More Markets**
   - Admin Dashboard → Markets → Add Market
   - Or edit `migrations/add_default_markets.sql`

4. **Set Up Production**
   - Use production database
   - Use Stripe live mode keys
   - Set strong `SESSION_SECRET`
   - Set `NODE_ENV=production`
   - Configure error monitoring

---

## 💡 Pro Tips

- All passwords are hashed with bcrypt
- Sessions use PostgreSQL for persistence
- Payments processed securely via Stripe
- Market filtering now works properly
- Admin can manage markets through UI
- Legal pages are templates (customize before launch)

---

## 🚨 Before Production Launch

- [ ] Set production `SESSION_SECRET`
- [ ] Use production `DATABASE_URL`
- [ ] Switch to Stripe live keys
- [ ] Review legal pages with attorney
- [ ] Test complete booking flow
- [ ] Set up error monitoring
- [ ] Configure email service
- [ ] Set up database backups
- [ ] Test on mobile devices
- [ ] Load test the platform

---

## 📞 Need Help?

1. Check `ENVIRONMENT_SETUP.md` for detailed config help
2. Check `TROUBLESHOOTING.md` (if exists)
3. Review `ROOT_CAUSE_ANALYSIS.md` for technical details
4. Contact support: support@dinemaison.com

---

**Status:** ✅ Platform ready for configuration and testing  
**Time to Launch:** 4-6 hours (configuration + testing)

Happy cooking! 👨‍🍳👩‍🍳



