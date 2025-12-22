# Troubleshooting Guide - Dine Maison

## Common Issues and Solutions

### 1. Loading Spinner Stuck on Homepage

If the homepage shows only a loading spinner and doesn't load the application:

#### Diagnostic Steps:

1. **Check the Browser Console**
   - Open Developer Tools (F12)
   - Look for any JavaScript errors in the Console tab
   - Type `dineMaisonDebug.getLogs()` to see debug information

2. **Test API Health**
   - Visit: `https://dine-maison-official-site.onrender.com/api/health`
   - Should return JSON with status "healthy"
   - If not accessible, the server may not be running properly

3. **Check Debug Info**
   - Visit: `https://dine-maison-official-site.onrender.com/api/debug/info`
   - Verify all environment variables are set

4. **Verify Build Output**
   - Check Render deployment logs for build errors
   - Ensure the build completes successfully

#### Common Causes & Solutions:

##### A. JavaScript Bundle Not Loading
**Symptoms:** 
- Network tab shows 404 for main JS/CSS files
- Console shows "Failed to load module script"

**Solution:**
```bash
# Rebuild the application
npm run build

# Check if dist folder exists
ls -la dist/public/
```

##### B. Environment Variables Missing
**Symptoms:**
- API calls fail with 500 errors
- Health check returns "unhealthy"

**Solution:**
In Render Dashboard, ensure these are set:
```
DATABASE_URL=postgresql://...
SESSION_SECRET=<random-32-char-string>
NODE_ENV=production
PORT=5000
```

##### C. Database Connection Issues
**Symptoms:**
- Health check shows database: "disconnected"
- Server logs show "DATABASE_URL must be set"

**Solution:**
1. Check DATABASE_URL is correctly set in Render
2. Verify PostgreSQL instance is running
3. Check connection string format

##### D. React App Not Mounting
**Symptoms:**
- Loading spinner stays indefinitely
- Console shows no errors
- `dineMaisonDebug.getLogs()` shows app initialization but no mount

**Solution:**
1. Clear browser cache and cookies
2. Try incognito/private browsing mode
3. Check for browser extensions blocking JavaScript

### 2. Deployment Fails on Render

#### Build Command Issues
Ensure your build command in Render is:
```bash
npm run build
```

#### Start Command Issues
Ensure your start command in Render is:
```bash
npm run start
```

### 3. Local Development Issues

#### Running Locally
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Push database schema
npm run db:push

# Run development server
npm run dev
```

### 4. Quick Fixes to Try

1. **Force Rebuild on Render**
   - Go to Render Dashboard
   - Click "Manual Deploy" > "Clear build cache & deploy"

2. **Clear Browser Cache**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Clear site data in DevTools > Application > Storage

3. **Check Server Logs**
   - In Render Dashboard, go to "Logs" tab
   - Look for error messages during startup

### 5. Debug Commands

Run these in the browser console when the site is loaded:

```javascript
// Get all debug logs
dineMaisonDebug.getLogs()

// Check if React mounted
document.querySelector('#root').children.length > 1

// Test API connectivity
fetch('/api/health').then(r => r.json()).then(console.log)

// Clear debug logs
dineMaisonDebug.clear()
```

### 6. Emergency Rollback

If the latest deployment broke the site:
1. Go to Render Dashboard
2. Click on "Events" tab
3. Find the last working deployment
4. Click "Rollback to this deploy"

### 7. Contact Support

If issues persist after trying these solutions:
1. Collect debug information:
   - Browser console errors
   - Network tab failures
   - Server logs from Render
   - Output of `dineMaisonDebug.getLogs()`
   
2. Document:
   - What you expected to happen
   - What actually happened
   - Steps to reproduce
   - Browser and OS version

### Prevention Tips

1. **Test Locally First**
   - Always run `npm run build` locally before deploying
   - Test the production build: `npm run start`

2. **Use Staging Environment**
   - Consider setting up a staging instance on Render
   - Test deployments there first

3. **Monitor After Deployment**
   - Check the site immediately after deployment
   - Monitor the health endpoint
   - Watch server logs for errors

## Still Having Issues?

The debug utilities added to the application will help diagnose problems:
- All errors are logged to sessionStorage
- Health check endpoint provides system status
- Debug info endpoint shows configuration

Remember to check both client-side (browser console) and server-side (Render logs) for complete error information.


