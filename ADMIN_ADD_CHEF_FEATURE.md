# Admin Add Chef Feature

## Overview
Added the ability for administrators to create new chef accounts directly from the admin dashboard's "Chefs" tab.

## What Was Added

### Backend API (`server/routes.ts`)
- **New Endpoint**: `POST /api/admin/chefs`
  - Protected route (admin authentication required)
  - Creates a new user account with chef role
  - Creates associated chef profile
  - Validates input and checks for duplicate emails
  - Returns both user and profile data

**Request Body:**
```json
{
  "email": "chef@example.com",
  "password": "secure_password",
  "firstName": "John",
  "lastName": "Doe",
  "chefProfile": {
    "displayName": "Chef John Doe",
    "bio": "Award-winning chef...",
    "profileImageUrl": "https://...",
    "yearsExperience": 10,
    "cuisines": ["Italian", "French"],
    "dietarySpecialties": ["Vegan", "Gluten-Free"],
    "servicesOffered": ["Private Dinner", "Catering"],
    "minimumSpend": "300",
    "minimumGuests": 2,
    "maximumGuests": 12,
    "hourlyRate": "150",
    "verificationLevel": "basic",
    "isCertified": false,
    "isActive": true,
    "commissionRate": "15"
  }
}
```

### Frontend UI (`client/src/pages/dashboard/admin-dashboard.tsx`)

#### 1. **Add Chef Button**
- Located in the Chefs tab header next to the search bar
- Opens a dialog form to create new chefs

#### 2. **Add Chef Dialog Form**
Comprehensive form with fields for:
- **Account Info**: First name, last name, email, password
- **Profile Info**: Display name, bio, profile image URL
- **Experience**: Years of experience, hourly rate
- **Booking Settings**: Min spend, min/max guests
- **Specialties**: Cuisines, dietary specialties, services offered

#### 3. **Quick Template Button**
- "Load Ameer Natson Template" button in the dialog
- Pre-fills the form with Chef Ameer Natson's information
- Makes it easy to add the specific chef you requested!

#### 4. **Form Validation**
- Required fields: email, password, first name, last name, display name
- Real-time validation
- Error handling with toast notifications

## How to Use

### Adding Chef Ameer Natson (Easy Way):
1. Log in as admin at your app
2. Navigate to "Chefs" tab in admin dashboard
3. Click "Add Chef" button
4. Click "Load Ameer Natson Template" button
5. Click "Create Chef"
6. Done! ✅

### Adding Any Chef (Manual Way):
1. Log in as admin
2. Navigate to "Chefs" tab
3. Click "Add Chef" button
4. Fill in all required fields:
   - Email, password
   - First name, last name
   - Display name
   - Bio, profile image URL
   - Experience, rates, specialties
5. Click "Create Chef"

## Features

✅ **Admin-only access** - Only users with admin role can create chefs
✅ **Full profile creation** - Creates both user account and chef profile
✅ **Email validation** - Prevents duplicate accounts
✅ **Password hashing** - Secure password storage with bcrypt
✅ **Real-time updates** - Chef list refreshes immediately after creation
✅ **Error handling** - Clear error messages for validation failures
✅ **Template feature** - Quick-fill for Chef Ameer Natson

## Updated Files

1. **server/routes.ts**
   - Added `POST /api/admin/chefs` endpoint
   - Added bcrypt import

2. **client/src/pages/dashboard/admin-dashboard.tsx**
   - Added Add Chef button in header
   - Added comprehensive create chef dialog
   - Added form state management
   - Added createChef mutation
   - Added template quick-fill button

3. **server/seed.ts** (from earlier)
   - Added Chef Ameer Natson to seed data

## Testing

To test the feature:
1. Start your dev server: `npm run dev`
2. Log in with admin credentials
3. Go to Admin Dashboard → Chefs tab
4. Click "Add Chef" button
5. Use the template button or fill manually
6. Submit and verify chef appears in list

## Next Steps

To actually add Chef Ameer Natson to your database, you have 3 options:

1. **Use the Admin UI** (Easiest):
   - Navigate to Chefs tab
   - Click "Add Chef"
   - Click "Load Ameer Natson Template"
   - Click "Create Chef"

2. **Run the seed script** (when database is accessible):
   ```bash
   npx tsx server/seed.ts
   ```

3. **Sign up manually** via the app's signup page

## Notes

- The database connection timeout issue from earlier needs to be resolved separately
- Once database is accessible, the admin can add chefs through the UI
- All chef data is validated before insertion
- Passwords are securely hashed before storage
