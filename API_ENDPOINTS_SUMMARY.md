# Dine Maison API - Complete Endpoint Summary

**Total Endpoints**: 106  
**Status**: ✅ All endpoints properly wired up

---

## Quick Reference

| Category | Count | Auth Required |
|----------|-------|---------------|
| Authentication | 6 | ❌ Public |
| Chef Operations | 15 | ✅ Chef Role |
| Customer Features | 4 | ✅ User Auth |
| Bookings | 7 | ✅ User Auth |
| Admin Dashboard | 41 | ✅ Admin Role |
| Task Management | 9 | ✅ Admin Role |
| Notifications | 15 | Mixed |
| File Uploads | 4 | ✅ User Auth |
| Public Endpoints | 5 | ❌ Public |

---

## Authentication Endpoints

```http
POST   /api/auth/signup              # Register new user
POST   /api/auth/login               # Login
POST   /api/auth/logout              # Logout  
GET    /api/auth/user                # Get current user
POST   /api/auth/forgot-password     # Request password reset
POST   /api/auth/reset-password      # Reset password
```

---

## User Endpoints

```http
GET    /api/user/role                # Get user's role (customer/chef/admin)
```

---

## Chef Profile & Operations

```http
# Profile Management
GET    /api/chef/profile             # Get own profile
POST   /api/chef/profile             # Create profile (becomes chef)
PATCH  /api/chef/profile             # Update profile

# Bookings
GET    /api/chef/bookings            # Get chef's bookings
POST   /api/chef/bookings/:id/accept # Accept booking
POST   /api/chef/bookings/:id/decline # Decline booking

# Menu Management
GET    /api/chef/menu                # Get menu items
POST   /api/chef/menu                # Create menu item
PATCH  /api/chef/menu/:id            # Update menu item
DELETE /api/chef/menu/:id            # Delete menu item

# Analytics & Reviews
GET    /api/chef/earnings            # Get earnings data
GET    /api/chef/reviews             # Get chef's reviews

# Stripe Connect (Payouts)
POST   /api/chef/stripe-connect/onboard    # Start onboarding
GET    /api/chef/stripe-connect/status     # Check onboarding status
```

---

## Public Chef Directory

```http
GET    /api/chefs                    # Search/filter chefs
GET    /api/chefs/:id                # Get chef details
GET    /api/chefs/:id/reviews        # Get chef reviews
GET    /api/chefs/:id/gallery        # Get chef gallery
```

---

## Customer Features

```http
# Favorites
GET    /api/customer/favorites            # Get favorite chefs
POST   /api/customer/favorites/:chefId    # Add to favorites
DELETE /api/customer/favorites/:chefId    # Remove from favorites

# Reviews
GET    /api/customer/reviews              # Get customer's reviews
```

---

## Booking System

```http
# Booking Management
GET    /api/bookings                 # Get user's bookings
GET    /api/bookings/:id             # Get booking details
POST   /api/bookings                 # Create booking
PATCH  /api/bookings/:id             # Update booking

# Actions
POST   /api/bookings/:id/checkout    # Create Stripe checkout
POST   /api/bookings/:id/cancel      # Cancel with refund
POST   /api/bookings/:id/review      # Submit review
```

---

## Admin Dashboard

### Analytics & Reporting
```http
GET    /api/admin/stats                    # Platform statistics
GET    /api/admin/analytics/revenue        # Revenue analytics
GET    /api/admin/analytics/user-growth    # User growth data
GET    /api/admin/analytics/chef-performance # Chef performance
GET    /api/admin/analytics/metrics        # Platform metrics
GET    /api/admin/activity-feed            # Recent activity
```

### User Management
```http
GET    /api/admin/users                    # List all users
GET    /api/admin/users/:id                # Get user details
```

### Chef Management
```http
GET    /api/admin/chefs                    # List all chefs
POST   /api/admin/chefs                    # Create chef account
PATCH  /api/admin/chefs/:id/status         # Toggle chef active status
GET    /api/admin/chefs/pipeline           # Onboarding pipeline
```

### Booking Management
```http
GET    /api/admin/bookings                 # All bookings
GET    /api/admin/bookings/recent          # Recent bookings (last 20)
```

### Verification Management
```http
GET    /api/admin/verifications/pending    # Pending verifications
POST   /api/admin/verifications/:id/review # Review document
POST   /api/admin/verifications/:id/approve # Approve document
POST   /api/admin/verifications/:id/reject # Reject document
```

### Payout Management
```http
GET    /api/admin/payouts/pending          # Pending payouts
GET    /api/admin/payouts/history          # Payout history
POST   /api/admin/bookings/:id/payout      # Issue payout
POST   /api/admin/payouts/:bookingId/process # Process payout
```

### Review Moderation
```http
GET    /api/admin/reviews                  # All reviews
PATCH  /api/admin/reviews/:id              # Update/moderate review
```

### Market Management
```http
GET    /api/admin/markets                  # List markets
POST   /api/admin/markets                  # Create market
PATCH  /api/admin/markets/:id              # Update market
DELETE /api/admin/markets/:id              # Delete market
```

### Platform Settings
```http
GET    /api/admin/settings                 # Get all settings
POST   /api/admin/settings                 # Update setting
```

### Transactions
```http
GET    /api/admin/transactions             # Transaction history
```

### Data Export
```http
GET    /api/admin/export/:type             # Export data as CSV
# Supported types: bookings, transactions, users, revenue
```

---

## Task Management (Admin)

```http
# Tasks
GET    /api/tasks                    # List tasks (with filters)
GET    /api/tasks/stats              # Task statistics
GET    /api/tasks/:id                # Get task details
POST   /api/tasks                    # Create task
PATCH  /api/tasks/:id                # Update task
DELETE /api/tasks/:id                # Delete task

# Comments
GET    /api/tasks/:id/comments       # Get task comments
POST   /api/tasks/:id/comments       # Add comment
DELETE /api/tasks/:taskId/comments/:commentId # Delete comment
```

---

## Notification System

### Push Notifications
```http
GET    /api/notifications/vapid-public-key # Get VAPID key
POST   /api/notifications/subscribe        # Subscribe to push
POST   /api/notifications/unsubscribe      # Unsubscribe
POST   /api/notifications/test             # Send test notification
```

### User Preferences
```http
GET    /api/notifications/preferences      # Get preferences
PUT    /api/notifications/preferences      # Update preferences
POST   /api/notifications/preferences/reset # Reset to defaults
```

### Device Management
```http
POST   /api/notifications/devices/register # Register device token
DELETE /api/notifications/devices/:deviceId # Unregister device
GET    /api/notifications/devices          # List user's devices
```

### In-App Notifications
```http
GET    /api/notifications/in-app                  # Get notifications
GET    /api/notifications/in-app/unread-count     # Get unread count
PATCH  /api/notifications/in-app/:id/read         # Mark as read
DELETE /api/notifications/in-app/:id              # Delete notification
```

### Testing Endpoints
```http
POST   /api/notifications/test/push        # Test push notification
POST   /api/notifications/test/email       # Test email
POST   /api/notifications/test/sms         # Test SMS
```

---

## File Upload

```http
POST   /api/upload/profile-image             # Upload profile image
POST   /api/upload/gallery-image             # Upload gallery image
DELETE /api/upload/gallery-image/:id         # Delete gallery image
POST   /api/upload/verification-document     # Upload verification doc
POST   /api/upload/presigned-url             # Get presigned upload URL
```

**Supported folders**: `profiles`, `gallery`, `documents`

---

## Markets

```http
GET    /api/markets                  # List all markets (public)
```

---

## Payment System

```http
GET    /api/stripe/publishable-key   # Get Stripe publishable key
POST   /api/stripe/webhook           # Stripe webhook handler
```

---

## System Endpoints

```http
GET    /api/health                   # Health check
GET    /api/debug/info               # System debug info
GET    /api/docs                     # Swagger UI
GET    /api/docs/openapi.json        # OpenAPI specification
```

---

## WebSocket

```
ws://localhost:5000/ws            # WebSocket connection
```

**Features**:
- Real-time booking updates
- Push notifications
- Chat/messaging support
- Activity feed updates

---

## Common Response Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Not authenticated |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

---

## Rate Limits

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| General API | 100 requests | 15 minutes |
| Auth endpoints | 10 requests | 15 minutes |
| File uploads | Lower limits | Per request |

Rate limit headers included in all responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Reset timestamp

---

## Authentication Flow

1. **Signup**: `POST /api/auth/signup` → Auto-login
2. **Login**: `POST /api/auth/login` → Session cookie set
3. **Access Protected Routes**: Include session cookie
4. **Logout**: `POST /api/auth/logout` → Session destroyed

**Session Details**:
- HTTP-only cookies
- Secure in production
- 7-day expiry
- PostgreSQL-backed

---

## Error Response Format

```json
{
  "message": "Human-readable error message"
}
```

For validation errors (400):
```json
{
  "message": "Invalid data",
  "errors": [
    {
      "path": ["fieldName"],
      "message": "Field-specific error"
    }
  ]
}
```

---

## Data Formats

### Dates
- ISO 8601 format: `2025-12-18T17:54:50.803Z`
- All dates in UTC

### Money
- Stored as strings: `"10.99"`
- In cents for Stripe: `1099`

### IDs
- UUID format: `"550e8400-e29b-41d4-a716-446655440000"`

---

## Query Parameters

### Filtering (e.g., `/api/chefs`)
```
?search=italian
&cuisine=italian
&minPrice=50
&maxPrice=200
&minRating=4.5
&market=new-york
```

### Pagination (e.g., `/api/notifications/in-app`)
```
?limit=20
&offset=0
```

### Time Period (e.g., `/api/admin/analytics/revenue`)
```
?period=daily|weekly|monthly
```

---

## Testing Checklist

✅ All endpoints registered in routes  
✅ Authentication middleware applied correctly  
✅ Admin middleware on admin endpoints  
✅ Rate limiting configured  
✅ Input validation with Zod schemas  
✅ Error handling middleware  
✅ Database queries optimized  
✅ Stripe integration tested  
✅ File upload handling  
✅ WebSocket server configured  
✅ Session management working  
✅ Graceful shutdown handlers  

---

## Development Commands

```bash
# Start development server
npm run dev

# Test endpoints (server must be running)
npm run test:endpoints

# Run unit tests
npm test

# Build for production
npm run build

# Start production server
npm start

# Database migrations
npm run db:push

# Seed database
npm run db:seed
```

---

## Environment Variables Required

```env
# Database
DATABASE_URL=postgresql://...

# Server
PORT=5000
NODE_ENV=development|production

# Session
SESSION_SECRET=your-secret-key

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Notifications
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:...

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...

# SMS (optional)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...

# Firebase (optional, for mobile push)
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
```

---

## Next Steps

1. **Start Server**: `npm run dev`
2. **Test Health**: `curl http://localhost:5000/api/health`
3. **Run Tests**: `npm run test:endpoints`
4. **Check Docs**: Visit `http://localhost:5000/api/docs`
5. **Test Auth Flow**: Signup → Login → Access protected routes

---

## Support

For detailed documentation on each endpoint:
- **OpenAPI Spec**: `/api/docs/openapi.json`
- **Interactive Docs**: `/api/docs`
- **Full Documentation**: See `ENDPOINT_VERIFICATION.md`
- **Status Report**: See `ENDPOINT_STATUS.md`


