# Admin Settings Guide

## Overview

The admin settings page has been significantly enhanced with comprehensive configuration options to control all aspects of your Dine Maison platform. Settings are now organized into 5 intuitive tabs for easy navigation.

## Accessing Settings

1. Log in as an administrator
2. Navigate to the Admin Dashboard
3. Click on "Settings" in the navigation menu
4. Use the tabs to navigate between different settings categories

## Settings Categories

### 1. General Settings 🌐

Configure basic site information and branding.

#### Site Information
- **Site Name**: The name of your platform (e.g., "Dine Maison")
- **Site Tagline**: Short description shown in headers (e.g., "Premium Private Chef Services")
- **Site Description**: Used for SEO and social media sharing
- **Contact Email**: Main contact email for support inquiries
- **Support Phone**: Customer support phone number
- **Logo URL**: URL to your site logo image
- **Favicon URL**: URL to your site favicon

#### Maintenance Mode
- **Enable/Disable**: Temporarily disable public access for maintenance
- **Maintenance Message**: Custom message shown to users during maintenance
- Note: Admins can still access the site during maintenance mode

---

### 2. Email Settings 📧

Configure email delivery and notifications.

#### SMTP Configuration
- **SMTP Host**: Email server hostname (e.g., smtp.gmail.com)
- **SMTP Port**: Server port (typically 587 for TLS or 465 for SSL)
- **Use TLS/SSL**: Security protocol for email transmission
- **SMTP Username**: Authentication username
- **SMTP Password**: Authentication password (stored securely)

#### Email Sender Settings
- **From Email**: Email address shown as sender
- **From Name**: Name shown as sender
- **Reply-To Email**: Where user replies should go

#### Email Notifications
Toggle automatic emails for:
- **Welcome Emails**: Sent to new users upon registration
- **Booking Confirmations**: Sent when bookings are created/confirmed
- **Reminder Emails**: Sent before upcoming bookings

#### Actions
- **Send Test Email**: Verify your SMTP configuration works correctly
- **Save Configuration**: Save all email settings

---

### 3. Members Settings 👥

Control user registration, permissions, and chef onboarding.

#### User Registration
- **Allow New Registrations**: Enable/disable new user signups
- **Require Email Verification**: Users must verify email before access
- **Allow Social Login**: Enable Google, Facebook authentication

#### Chef Registration
- **Chef Registration Open**: Allow new chefs to register
- **Auto-Approve Chefs**: New chefs are active immediately (vs. manual review)
- **Require Chef Background Check**: Chefs must complete background verification
- **Minimum Chef Experience**: Required years of professional experience

#### Member Permissions
- **Allow Reviews**: Customers can leave reviews for chefs
- **Moderate Reviews**: Reviews require admin approval before publishing
- **Allow Direct Messaging**: Enable member-to-member messaging

---

### 4. Platform Settings ⚙️

Configure financial, booking, and search settings.

#### Financial Settings
- **Platform Fee (%)**: Commission taken from each booking
- **Service Fee (%)**: Fee charged to customers
- **Minimum Booking Amount**: Minimum order value required
- **Currency**: Platform currency (USD, EUR, GBP, CAD)

#### Booking Policies
- **Payout Delay (days)**: Days after completion before chef payout
- **Cancellation Window (hours)**: Hours before event for free cancellation
- **Booking Lead Time (hours)**: Minimum time before event for new bookings
- **Max Booking Advance (days)**: How far in advance bookings can be made

#### Search & Discovery
- **Default Search Radius (miles)**: Default distance for chef search
- **Results Per Page**: Number of chefs shown per page
- **Featured Chefs**: Show featured chefs at top of results

---

### 5. Features Settings ⚡

Enable or disable platform features and integrations.

#### Platform Features
- **Real-time Notifications**: Push notifications and live updates
- **Chef Verification System**: Badge system for verified chefs
- **Chef Analytics**: Performance metrics dashboard for chefs
- **Customer Favorites**: Allow saving favorite chefs
- **Promotional Codes**: Discount and promo code system
- **Gift Cards**: Platform gift card purchases
- **Referral Program**: Reward users for referrals
- **Blog/Content System**: Platform blog and articles

#### Integration Features
- **Google Analytics**: Track site analytics with GA tracking ID
- **Live Chat Support**: Intercom, Zendesk, or similar
- **SMS Notifications**: Twilio SMS integration

#### Export Data
Quick export buttons for:
- Bookings
- Chefs
- Users
- Transactions

---

## How Settings Are Saved

- **Auto-save**: Most input fields save automatically when you click away (on blur)
- **Toggle Buttons**: Click to immediately toggle on/off
- **Dropdowns**: Selection is saved automatically
- **Toast Notifications**: You'll see a confirmation when settings are updated

---

## Important Notes

### Security Considerations
- **SMTP Password**: While stored securely in the database, consider using environment variables for production
- **Maintenance Mode**: Only affects non-admin users
- **Background Checks**: Ensure you have proper verification processes in place

### Best Practices
1. **Test Email Settings**: Always send a test email after configuring SMTP
2. **Review Before Launch**: Configure all general settings before going live
3. **Commission Rates**: Ensure platform fee + service fee align with your business model
4. **Booking Policies**: Set cancellation windows that balance customer flexibility with chef protection
5. **Regular Backups**: Export data regularly for backup purposes

### Member Management
- **Registration Controls**: Close registration if you need to manage growth
- **Auto-Approve**: Disable for quality control, enable for faster onboarding
- **Email Verification**: Recommended to prevent spam accounts
- **Reviews**: Moderate if you want to maintain quality, auto-publish for transparency

---

## API Endpoints

Settings are managed through the following API endpoints:

- `GET /api/admin/settings` - Fetch all settings
- `POST /api/admin/settings` - Update a setting (body: `{ key, value }`)

All settings are stored in the `platform_settings` table with:
- `key`: Unique setting identifier
- `value`: Setting value (JSON)
- `description`: Optional description
- `updatedAt`: Last update timestamp

---

## Troubleshooting

### Email Not Sending
1. Verify SMTP host and port are correct
2. Check username/password authentication
3. Ensure TLS/SSL setting matches your provider
4. Try the "Send Test Email" button
5. Check server logs for detailed error messages

### Settings Not Saving
1. Check browser console for errors
2. Verify you're logged in as admin
3. Ensure database connection is active
4. Check server logs for API errors

### Feature Not Working
1. Verify the feature toggle is enabled in Features tab
2. Check if any dependencies are required
3. Review browser console for client-side errors
4. Check if additional configuration is needed

---

## Future Enhancements

Potential additions to settings:
- Multi-language support
- Custom email templates
- Advanced pricing rules
- Tax configuration per region
- Custom fields for chef profiles
- Webhook configurations
- API key management
- Advanced search filters configuration

---

## Support

For questions or issues with settings configuration, contact your development team or refer to the main documentation.

Last Updated: December 2024
