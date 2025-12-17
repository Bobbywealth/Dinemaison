# Deployment Guide - Dine Maison

## ✅ Authentication System Updated

The app now uses **email/password authentication** instead of Replit Auth. This means it will work on **any platform** (Render, Vercel, AWS, etc.).

---

## 🔧 Required Environment Variables on Render

Set these in your Render dashboard under **Environment** tab:

### **Required:**
```bash
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_random_secret_key_here_min_32_chars
NODE_ENV=production
PORT=5000
```

### **Optional (for Stripe):**
```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

## 📦 Before First Deployment

### 1. **Install Dependencies**
```bash
npm install
```

### 2. **Update Database Schema**
```bash
npm run db:push
```

This will:
- Add the `password` field to users table
- Make `email` required and unique
- Update all schema changes

### 3. **Build the App**
```bash
npm run build
```

---

## 🚀 Deploying to Render

1. **Create PostgreSQL Database:**
   - In Render dashboard, create a new PostgreSQL database
   - Copy the **Internal Database URL**

2. **Create Web Service:**
   - Connect your GitHub repository
   - Set **Build Command:** `npm run build`
   - Set **Start Command:** `npm run start`
   - Add environment variables (see above)

3. **Deploy:**
   - Click "Manual Deploy" or push to your repo
   - Render will automatically build and deploy

---

## 🔐 Authentication Endpoints

- **Sign Up:** `POST /api/auth/signup`
- **Login:** `POST /api/auth/login`
- **Logout:** `POST /api/auth/logout`
- **Get Current User:** `GET /api/auth/user`

---

## 🎨 New Pages Added

- `/login` - Login page
- `/signup` - Sign up page

Both pages have:
- Form validation with Zod
- Error handling
- Beautiful UI with shadcn components
- Mobile responsive design

---

## ⚡ What Changed from Replit Auth

### **Removed:**
- ❌ Replit OpenID Connect integration
- ❌ `stripe-replit-sync` auto-configuration
- ❌ `X_REPLIT_TOKEN` dependency

### **Added:**
- ✅ Passport.js Local Strategy (email/password)
- ✅ bcrypt password hashing
- ✅ PostgreSQL session storage
- ✅ Custom auth routes and middleware
- ✅ Login and signup pages

---

## 🐛 Troubleshooting

### **"SESSION_SECRET is required"**
- Add `SESSION_SECRET` to your environment variables
- Generate a secure random string (min 32 characters)

### **"DATABASE_URL must be set"**
- Ensure your PostgreSQL database is provisioned
- Copy the connection string to Render environment variables

### **Build succeeds but app crashes on start**
- Check Render logs for specific error messages
- Verify all required environment variables are set
- Make sure database schema is up to date (`npm run db:push`)

---

## 📝 Migration for Existing Users

If you have existing users from Replit Auth:

1. They won't have passwords set
2. Options:
   - Implement "Forgot Password" flow
   - Manually set passwords via SQL:
     ```sql
     UPDATE users SET password = '$2a$10$...' WHERE email = 'user@example.com';
     ```
   - Let users re-register

---

## 🎯 Next Steps

1. ✅ Deploy to Render
2. ✅ Test signup/login flow
3. ⚠️ Configure Stripe webhooks in Stripe Dashboard
4. ⚠️ Set up email service for password resets (optional)
5. ⚠️ Add OAuth providers (Google, GitHub) if needed (optional)

---

## 🔗 Useful Links

- [Render Documentation](https://render.com/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Passport.js Documentation](https://www.passportjs.org/)

