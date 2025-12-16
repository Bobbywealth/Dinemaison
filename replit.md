# Dine Maison

## Overview

Dine Maison is a two-sided marketplace platform connecting customers with private chefs for intimate dining experiences. The platform follows an Airbnb-style trust model combined with upscale dining aesthetics, enabling customers to discover, book, and pay for private chef services while allowing chefs to manage their profiles, availability, and earnings.

The application is built as a full-stack TypeScript monorepo with a React frontend and Express backend, using PostgreSQL for data persistence and Stripe for payment processing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens for luxury brand aesthetic
- **Theme System**: Dark/light mode with CSS custom properties
- **Build Tool**: Vite with path aliases (@/ for client, @shared/ for shared code)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Pattern**: RESTful JSON APIs under /api prefix
- **Authentication**: Replit Auth via OpenID Connect with Passport.js
- **Session Management**: PostgreSQL-backed sessions via connect-pg-simple
- **File Storage**: Google Cloud Storage with custom ACL policies

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: shared/schema.ts (shared between frontend and backend)
- **Migrations**: Drizzle Kit with push command (npm run db:push)
- **Key Entities**: Users, ChefProfiles, Bookings, Reviews, Markets, UserRoles

### Authentication & Authorization
- **Provider**: Replit Auth (OpenID Connect)
- **Session Storage**: PostgreSQL sessions table
- **Role System**: UserRoles table with customer/chef/admin roles
- **Protected Routes**: isAuthenticated middleware for API endpoints

### Code Organization
```
├── client/src/          # React frontend
│   ├── components/      # UI components (shadcn + custom)
│   ├── pages/           # Route pages
│   ├── hooks/           # Custom React hooks
│   └── lib/             # Utilities and providers
├── server/              # Express backend
│   ├── routes.ts        # API route definitions
│   ├── storage.ts       # Database access layer
│   └── replit_integrations/  # Auth integration
├── shared/              # Shared types and schemas
│   └── schema.ts        # Drizzle schema definitions
```

## External Dependencies

### Payment Processing
- **Stripe**: Full integration via stripe-replit-sync package
- **Stripe Connect**: For chef payouts (stripeConnectAccountId on chef profiles)
- **Webhook Handling**: Managed webhooks with automatic sync

### Database
- **PostgreSQL**: Primary database via DATABASE_URL environment variable
- **Drizzle ORM**: Type-safe database queries and schema management

### Authentication
- **Replit Auth**: OIDC-based authentication
- **Environment Variables**: ISSUER_URL, REPL_ID, SESSION_SECRET required

### File Storage
- **Google Cloud Storage**: For user uploads and media assets
- **Object ACL**: Custom access control layer for file permissions

### Frontend Libraries
- **Radix UI**: Accessible component primitives
- **TanStack Query**: Data fetching and caching
- **date-fns**: Date manipulation
- **Embla Carousel**: Image carousels
- **Zod**: Runtime validation (shared with backend via drizzle-zod)

### Design Assets
- **Google Fonts**: Playfair Display (headings), Inter (body text)
- **Custom Video**: Hero section video in attached_assets
- **Stock Images**: Professional chef and food photography