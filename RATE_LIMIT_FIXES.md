# Rate Limiting & Logging Fixes

## Issues Fixed

### 1. **Too Many Requests Error (429)**
**Problem**: Users were getting "Too many requests" errors when trying to sign in.

**Root Causes**:
- Global rate limit was too restrictive (100 requests per 15 minutes)
- Modern SPAs make many API calls on page load (auth checks, data fetching, etc.)
- Static assets were counting against rate limits
- Auth endpoints had a stricter rate limiter defined but it wasn't being applied

**Solutions Implemented**:

#### a) Increased Global Rate Limit
- **File**: `server/config.ts`
- **Change**: Increased from 100 to 1000 requests per 15 minutes
- **Reason**: Modern SPAs need more headroom for legitimate usage

```typescript
// Before
max: 100, // requests per window

// After
max: 1000, // requests per window - increased for SPAs
```

#### b) Excluded Static Assets from Rate Limiting
- **File**: `server/middleware/rateLimiter.ts`
- **Change**: Added logic to skip rate limiting for static assets
- **Impact**: Images, CSS, JS, fonts no longer count against rate limits

```typescript
// Skip rate limiting for static assets
if (req.path.match(/\.(jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf|eot)$/i) || 
    req.path.startsWith('/public/') ||
    req.path.startsWith('/assets/')) {
  return next();
}
```

#### c) Applied Stricter Auth Rate Limiting
- **File**: `server/auth.ts`
- **Change**: Applied `authRateLimitMiddleware` to auth endpoints
- **Details**: 
  - Login: 10 attempts per 15 minutes per IP
  - Signup: 10 attempts per 15 minutes per IP
  - Password reset: 10 attempts per 15 minutes per IP
  - Forgot password: 10 attempts per 15 minutes per IP

```typescript
// Apply stricter rate limiting to all auth endpoints
app.use("/api/auth/signup", authRateLimitMiddleware());
app.use("/api/auth/login", authRateLimitMiddleware());
app.use("/api/auth/forgot-password", authRateLimitMiddleware());
app.use("/api/auth/reset-password", authRateLimitMiddleware());
```

### 2. **Logging Errors Everywhere**
**Problem**: Console.log statements were causing excessive logging noise and weren't using the proper logging system.

**Solution**: Replaced all `console.log` statements with proper structured logging

#### Changes in `server/auth.ts`:
- ✅ Replaced `console.log` with `logger.debug()`, `logger.info()`
- ✅ Replaced `console.error` with `logger.error()`
- ✅ Added proper context objects to all log statements
- ✅ Used appropriate log levels (debug for verbose, info for important events, error for failures)

**Benefits**:
- Structured logging with context
- Proper log levels for filtering
- Better debugging in production
- JSON format in production, pretty format in development

### 3. **Client-Side Rate Limit Handling**
**Problem**: Users didn't get clear feedback when rate limited.

**Solution**: Added user-friendly error messages for rate limit errors

#### Changes in `client/src/pages/login.tsx` and `signup.tsx`:
- ✅ Detect 429 status codes
- ✅ Display human-readable retry time
- ✅ Show toast notification with clear instructions

```typescript
if (response.status === 429) {
  const retryAfter = result.retryAfter ? Math.ceil(result.retryAfter / 60) : 15;
  setError(`Too many login attempts. Please try again in ${retryAfter} minutes.`);
  toast({
    title: "Rate limit exceeded",
    description: `Please wait ${retryAfter} minutes before trying again.`,
    variant: "destructive",
  });
}
```

## Testing

### Test Rate Limits:

1. **General API Rate Limit** (1000 requests / 15 min):
   ```bash
   # Should succeed for first 1000 requests
   for i in {1..1000}; do curl http://localhost:5000/api/health; done
   
   # Should get 429 on request 1001
   curl http://localhost:5000/api/health
   ```

2. **Auth Rate Limit** (10 attempts / 15 min):
   ```bash
   # Should succeed for first 10 attempts
   for i in {1..10}; do 
     curl -X POST http://localhost:5000/api/auth/login \
       -H "Content-Type: application/json" \
       -d '{"email":"test@example.com","password":"wrong"}' 
   done
   
   # Should get 429 on 11th attempt
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"wrong"}'
   ```

3. **Static Assets** (no rate limit):
   ```bash
   # Should never get rate limited
   for i in {1..2000}; do curl http://localhost:5000/public/logo.png; done
   ```

### Expected Response Headers:
Every API response includes rate limit information:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: When the limit resets (ISO timestamp)

### 429 Response Format:
```json
{
  "message": "Too many authentication attempts, please try again later.",
  "retryAfter": 892  // seconds until rate limit resets
}
```

## Configuration

You can adjust rate limits in `server/config.ts`:

```typescript
// Global rate limit
rateLimit: {
  windowMs: 15 * 60 * 1000,  // Time window
  max: 1000,                  // Max requests per window
}

// Auth rate limit (in middleware/rateLimiter.ts)
const windowMs = 15 * 60 * 1000;  // 15 minutes
const maxRequests = 10;            // Only 10 auth attempts per 15 minutes
```

## Production Recommendations

1. **Use Redis for Rate Limiting**:
   - Current implementation uses in-memory storage
   - For multi-server deployments, use Redis to share rate limit data
   - See: `README_FEATURES.md` for Redis setup instructions

2. **Monitor Rate Limit Headers**:
   - Track `X-RateLimit-*` headers in your monitoring system
   - Alert when users frequently hit limits (might indicate an attack or bug)

3. **Adjust Limits Based on Usage**:
   - Monitor actual API usage patterns
   - Adjust limits if legitimate users are being blocked
   - Consider different limits for authenticated vs anonymous users

4. **Implement Rate Limit Bypass for Admin/Internal Services**:
   - Add IP whitelist for trusted sources
   - Use API keys with higher limits for integrations

## Files Modified

### Server:
- ✅ `server/config.ts` - Increased rate limits
- ✅ `server/middleware/rateLimiter.ts` - Excluded static assets, improved logic
- ✅ `server/auth.ts` - Replaced console.log with logger, applied auth rate limiter

### Client:
- ✅ `client/src/pages/login.tsx` - Added rate limit error handling
- ✅ `client/src/pages/signup.tsx` - Added rate limit error handling

## Summary

✅ **Rate limit increased** from 100 to 1000 requests/15min for general API  
✅ **Static assets excluded** from rate limiting  
✅ **Auth endpoints protected** with stricter 10 attempts/15min limit  
✅ **Logging improved** with structured logger throughout auth system  
✅ **User experience enhanced** with clear rate limit error messages  
✅ **No breaking changes** - backward compatible  

The app should now handle normal usage patterns without triggering rate limits, while still protecting against abuse and attacks.

