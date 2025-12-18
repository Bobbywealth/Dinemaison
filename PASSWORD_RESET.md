# 🔑 Password Reset System

## Overview

The password reset system allows users to securely reset their password via email. The system uses:
- ✅ Secure random tokens (32 bytes, cryptographically strong)
- ✅ Token expiration (1 hour)
- ✅ One-time use tokens (cleared after use)
- ✅ Security best practices (no user enumeration)

---

## 🔄 User Flow

1. **User clicks "Forgot password?" on login page**
2. **Enters their email address**
3. **Receives email with reset link** (if account exists)
4. **Clicks link in email** → redirected to reset password page
5. **Enters new password**
6. **Password is updated** → redirected to login

---

## 🛠️ How It Works

### 1. Request Reset (`POST /api/auth/forgot-password`)

```json
{
  "email": "user@example.com"
}
```

**What happens:**
- System looks up user by email
- Generates secure random token
- Stores token with 1-hour expiration
- Sends email with reset link (or logs to console in dev)
- Returns success message (even if user doesn't exist - security)

**Response:**
```json
{
  "message": "If an account exists with that email, a password reset link has been sent.",
  "resetToken": "abc123..." // Only in development
}
```

### 2. Reset Password (`POST /api/auth/reset-password`)

```json
{
  "token": "abc123...",
  "newPassword": "newSecurePassword123"
}
```

**What happens:**
- Validates token exists and hasn't expired
- Hashes new password with bcrypt
- Updates user password
- Clears reset token (one-time use)
- Returns success message

**Response:**
```json
{
  "message": "Password has been reset successfully"
}
```

---

## 📧 Email Integration

### Development Mode

In development, reset links are **logged to the console**:

```
🔐 Password Reset Link:
http://localhost:5000/reset-password/abc123...

This link expires in 1 hour.
```

### Production Mode

You need to integrate an email service. Popular options:

#### **Option 1: SendGrid**
```bash
npm install @sendgrid/mail
```

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const msg = {
  to: user.email,
  from: 'noreply@dinemaison.com',
  subject: 'Reset your password',
  text: `Reset your password: ${resetLink}`,
  html: `<a href="${resetLink}">Reset Password</a>`,
};

await sgMail.send(msg);
```

#### **Option 2: Resend**
```bash
npm install resend
```

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'Dine Maison <noreply@dinemaison.com>',
  to: user.email,
  subject: 'Reset your password',
  html: `<a href="${resetLink}">Reset Password</a>`,
});
```

#### **Option 3: Nodemailer (SMTP)**
```bash
npm install nodemailer
```

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

await transporter.sendMail({
  from: '"Dine Maison" <noreply@dinemaison.com>',
  to: user.email,
  subject: 'Reset your password',
  html: `<a href="${resetLink}">Reset Password</a>`,
});
```

---

## 🗄️ Database Schema

Added columns to `users` table:

```sql
ALTER TABLE users ADD COLUMN reset_password_token VARCHAR(255);
ALTER TABLE users ADD COLUMN reset_password_expires TIMESTAMP;
```

Run migration:
```bash
npm run db:push
```

---

## 🔐 Security Features

### ✅ **No User Enumeration**
- Same response whether email exists or not
- Attackers can't determine valid emails

### ✅ **Token Expiration**
- Tokens expire after 1 hour
- Old tokens are automatically invalid

### ✅ **One-Time Use**
- Token is cleared after successful reset
- Can't be reused

### ✅ **Secure Random Tokens**
- 32 bytes of cryptographically strong randomness
- 64 characters hex string

### ✅ **Password Hashing**
- bcrypt with 10 rounds
- Industry-standard security

---

## 🧪 Testing Locally

### 1. Request Password Reset
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### 2. Check Console for Reset Link
```
🔐 Password Reset Link:
http://localhost:5000/reset-password/abc123...
```

### 3. Visit Link in Browser
- Enter new password
- Confirm password
- Click "Reset password"

### 4. Login with New Password
- Go to `/login`
- Use new password

---

## 📱 UI Pages

### `/forgot-password`
- Email input field
- "Send reset link" button
- Link back to login
- Success confirmation

### `/reset-password/:token`
- New password field
- Confirm password field
- "Reset password" button
- Success confirmation with redirect

---

## 🚀 Production Checklist

- [ ] Set up email service (SendGrid/Resend/SMTP)
- [ ] Configure email templates
- [ ] Update reset link domain in email
- [ ] Remove `resetToken` from API response
- [ ] Test full flow end-to-end
- [ ] Monitor for expired tokens
- [ ] Set up email delivery monitoring

---

## 🎨 Customization

### Email Template

Create a beautiful HTML email template:

```typescript
const emailTemplate = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .button {
      background-color: #4CAF50;
      color: white;
      padding: 15px 32px;
      text-decoration: none;
      display: inline-block;
    }
  </style>
</head>
<body>
  <h2>Reset Your Password</h2>
  <p>Click the button below to reset your password:</p>
  <a href="${resetLink}" class="button">Reset Password</a>
  <p>This link will expire in 1 hour.</p>
  <p>If you didn't request this, please ignore this email.</p>
</body>
</html>
`;
```

### Token Expiration Time

Change in `server/auth.ts`:

```typescript
// Current: 1 hour
const resetTokenExpiry = new Date(Date.now() + 3600000);

// Change to 30 minutes:
const resetTokenExpiry = new Date(Date.now() + 1800000);

// Change to 24 hours:
const resetTokenExpiry = new Date(Date.now() + 86400000);
```

---

## 🐛 Troubleshooting

### "Invalid or expired reset token"
- Token has expired (> 1 hour)
- Token was already used
- Token doesn't exist in database

### Email not received
- Check spam folder
- Verify email service is configured
- Check console logs for errors
- Verify user email exists in database

### Reset link doesn't work
- Check token in URL matches database
- Verify token hasn't expired
- Check database column exists

---

## 📚 Additional Resources

- [OWASP Password Reset Guide](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)
- [SendGrid Email API](https://docs.sendgrid.com/)
- [Resend Documentation](https://resend.com/docs)
- [Nodemailer Guide](https://nodemailer.com/)


