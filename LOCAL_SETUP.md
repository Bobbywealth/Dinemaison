# 🔧 Local Development Setup

## Prerequisites

1. **PostgreSQL** installed and running
2. **Node.js** v18+ installed
3. **npm** package manager

---

## Step 1: Create Database

```bash
# Create PostgreSQL database
createdb dinemaison

# Or using psql
psql -U postgres
CREATE DATABASE dinemaison;
```

---

## Step 2: Create `.env` File

Create a `.env` file in the project root with:

```bash
# Database Configuration
DATABASE_URL=postgresql://localhost:5432/dinemaison

# Session Secret (use a random string)
SESSION_SECRET=dev_secret_key_change_in_production_min_32_chars_long

# App Configuration
NODE_ENV=development
PORT=5000
```

> **Note:** The `.env` file is gitignored for security

---

## Step 3: Install Dependencies

```bash
npm install
```

---

## Step 4: Push Database Schema

```bash
npm run db:push
```

This will create all necessary tables in your database.

---

## Step 5: Seed Test Accounts (Optional)

```bash
npm run db:seed
```

This creates test accounts for development:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@dinemaison.com | admin123 |
| **Chef** | chef@dinemaison.com | chef123 |
| **Customer** | customer@dinemaison.com | customer123 |

---

## Step 6: Start Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:5000**

---

## 🧪 Testing Authentication

### Test Signup Flow:

1. Go to http://localhost:5000
2. Click **"Sign Up"** in the header
3. Fill in the form:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Password: password123
   - Confirm Password: password123
4. Click **"Create account"**
5. You should be automatically logged in and redirected to `/dashboard`

### Test Login Flow:

1. Click your avatar and **"Sign Out"**
2. Click **"Sign In"** in the header
3. Enter your credentials:
   - Email: test@example.com
   - Password: password123
4. Click **"Log in"**
5. You should be redirected to `/dashboard`

### Test Protected Routes:

Try accessing `/dashboard` without being logged in - you should get a 401 error.

---

## 🐛 Troubleshooting

### "DATABASE_URL must be set"
- Make sure you created the `.env` file
- Check that PostgreSQL is running: `pg_isready`

### "Error: connect ECONNREFUSED"
- PostgreSQL is not running
- Start it: `brew services start postgresql` (macOS) or `sudo service postgresql start` (Linux)

### "relation does not exist"
- Run `npm run db:push` to create database tables

### Port 5000 already in use
- Change PORT in `.env` to another port (e.g., 3000)

---

## 📝 Quick Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Push database schema
npm run db:push

# Build for production
npm run build

# Start production server
npm start

# Type check
npm run check
```

---

## 🗄️ Database Access

```bash
# Connect to database
psql dinemaison

# View all tables
\dt

# View users table
SELECT * FROM users;

# View sessions
SELECT * FROM sessions;
```

---

## 🔐 Test User Credentials

After running through signup, you can use these to test:
- **Email:** test@example.com
- **Password:** password123

---

## ✅ Everything Working?

You should see:
- ✅ Server running on port 5000
- ✅ Database connected
- ✅ No errors in console
- ✅ Able to signup/login/logout
- ✅ Session persists on page refresh




