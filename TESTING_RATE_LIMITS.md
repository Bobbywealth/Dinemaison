# Testing Rate Limit Fixes

## Quick Test Commands

### 1. Start the Server
```bash
cd "/Users/bobbyc/Dine Maison/Dinemaison"
npm run dev
```

### 2. Test Normal Login (Should Work)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dinemaison.com","password":"admin123"}' \
  -c cookies.txt -v
```

Look for these response headers:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 2024-01-01T12:15:00.000Z
```

### 3. Test Auth Rate Limiting (Should Block After 10 Attempts)
```bash
# Run this 11 times - the 11th should fail with 429
for i in {1..11}; do 
  echo "Attempt $i:"
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrongpassword"}' \
    -w "\nStatus: %{http_code}\n\n"
done
```

**Expected result**: First 10 attempts return 401 (invalid credentials), 11th returns 429 (rate limited)

### 4. Test Static Assets (Should Never Rate Limit)
```bash
# This should work even after 1000 requests
for i in {1..1500}; do 
  curl -s http://localhost:5000/public/favicon.png > /dev/null
  if [ $((i % 100)) -eq 0 ]; then
    echo "Request $i: OK"
  fi
done
echo "✅ All static asset requests succeeded!"
```

### 5. Check Rate Limit Info in Browser DevTools

1. Open your browser DevTools (F12)
2. Go to Network tab
3. Try to login at http://localhost:5000/login
4. Click on the `login` request
5. Check Response Headers:
   - `X-RateLimit-Limit`: Should be `10`
   - `X-RateLimit-Remaining`: Should decrease with each attempt
   - `X-RateLimit-Reset`: Shows when limit resets

### 6. Test Rate Limit Error UI

1. Open http://localhost:5000/login in browser
2. Enter wrong credentials 10 times quickly
3. On 11th attempt, you should see:
   - Error message: "Too many login attempts. Please try again in X minutes."
   - Toast notification with retry time
   - Button disabled

### 7. Test General API Rate Limit (1000 req/15min)

```bash
# This should succeed for all 1000 requests
time for i in {1..1000}; do 
  curl -s http://localhost:5000/api/auth/user > /dev/null
done

echo "✅ 1000 API requests completed successfully"
```

## What to Look For

### ✅ Success Indicators:
- Login works normally with correct credentials
- Rate limit headers appear in all API responses
- Static assets never trigger rate limits
- Clear error messages when rate limited
- Logs are clean and structured (no console.log spam)

### ❌ Problems to Watch For:
- Getting 429 errors during normal usage
- Missing `X-RateLimit-*` headers
- Static assets counting against rate limits
- Console showing excessive logging noise
- Rate limits not resetting after 15 minutes

## Monitoring in Production

### Check Rate Limit Status
```bash
# Any API request will show rate limit info
curl -I http://localhost:5000/api/auth/user
```

### View Structured Logs
Server logs now include structured data:
```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "level": "INFO",
  "message": "Login successful",
  "email": "user@example.com",
  "environment": "production"
}
```

## Troubleshooting

### Problem: Still getting 429 errors during normal use
**Solution**: Increase rate limits in `server/config.ts`:
```typescript
rateLimit: {
  max: 2000, // Increase from 1000
}
```

### Problem: Auth rate limit too strict
**Solution**: Adjust in `server/middleware/rateLimiter.ts`:
```typescript
const maxRequests = 20; // Increase from 10
```

### Problem: Rate limits not working
**Solution**: 
1. Check that server restarted after changes
2. Verify middleware is applied in `server/index.ts`
3. Check browser is not caching responses

### Problem: Excessive logging
**Solution**: Increase log level in `server/config.ts`:
```typescript
logging: {
  level: 'info', // Change from 'debug'
}
```

## Next Steps

After testing locally:
1. ✅ Verify all tests pass
2. ✅ Check logs are clean
3. ✅ Test on mobile browser
4. ✅ Deploy to staging environment
5. ✅ Monitor rate limit headers in production
6. ✅ Set up alerts for excessive 429 responses

## Additional Resources

- Full documentation: `RATE_LIMIT_FIXES.md`
- Feature overview: `README_FEATURES.md`
- Production setup: `DEPLOYMENT.md`
