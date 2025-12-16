# Dine Maison Design Guidelines

## Design Approach

**Reference-Based Luxury Marketplace**: Draw inspiration from Airbnb's trust-building interface patterns combined with Resy/Tock's upscale dining aesthetics. The design must convey sophistication, intimacy, and culinary artistry while maintaining marketplace clarity and ease of booking.

**Brand Aesthetic**: Elegant, warm, and inviting with a focus on candlelit intimacy and artisanal presentation. The existing WordPress site establishes the visual language - embrace the dark/warm tones, soft lighting, and premium food photography.

## Typography System

**Font Families** (via Google Fonts):
- **Primary (Headings)**: Playfair Display or Cormorant Garamond - elegant serif conveying luxury
- **Secondary (Body)**: Inter or DM Sans - clean, readable sans-serif for UI elements and body text
- **Accent (Special)**: Italiana or Great Vibes for tagline "The Art of Intimate Dining" when used decoratively

**Hierarchy**:
- Hero headlines: 3xl to 5xl (48-64px), Playfair Display, medium weight
- Section headers: 2xl to 3xl (32-48px), Playfair Display
- Subheadings: xl to 2xl (24-32px), Inter semibold
- Body text: base to lg (16-20px), Inter regular
- UI labels: sm to base (14-16px), Inter medium
- Captions/metadata: xs to sm (12-14px), Inter regular

## Layout & Spacing

**Container Strategy**:
- Marketing pages: max-w-7xl with full-width hero sections
- Dashboard content: max-w-6xl for optimal readability
- Form layouts: max-w-2xl for focused task completion

**Spacing Primitives** (Tailwind units):
- **Micro spacing**: 1, 2 (4px, 8px) - tight element spacing, icons
- **Standard spacing**: 4, 6, 8 (16px, 24px, 32px) - component padding, card spacing
- **Section spacing**: 12, 16, 20, 24 (48px, 64px, 80px, 96px) - vertical rhythm between sections
- **Desktop sections**: py-20 to py-32
- **Mobile sections**: py-12 to py-16

## Component Library

### Navigation
**Marketing Header**: Fixed/sticky with subtle backdrop blur, logo left, navigation center, "Book Now" CTA right with subtle glow effect. Include "Browse Chefs" and "Become a Chef" links.

**Dashboard Header**: Role-specific navigation with user avatar dropdown, notification bell, quick links to key actions (New Booking for customers, View Requests for chefs, Approvals for admin).

### Hero Section (Marketing)
**Full-screen carousel** (80-90vh) with:
- Large, atmospheric food photography showing intimate dining setups
- Centered headline overlay with blurred card background
- Tagline in accent font below
- Primary CTA button with glow effect
- Carousel indicators and subtle navigation arrows

### Chef Cards (Browse Interface)
**Grid layout** (grid-cols-1 md:grid-cols-2 lg:grid-cols-3):
- Chef profile photo (rounded or subtle border treatment)
- Name and cuisine specialties
- Star rating and review count
- Starting price indicator
- Verification badge (Basic/Verified/Certified) with icon
- "View Profile" button
- Hover: subtle lift effect (translate-y-1) and shadow

### Chef Profile Pages
**Two-column layout**:
- Left: Large profile image, verification badges, quick stats (reviews, completed bookings, years experience)
- Right: Bio, cuisine tags, dietary specialties, pricing details
- Full-width gallery section below with masonry or grid layout
- Review section with star filters and sorting
- Sticky booking CTA in sidebar or bottom bar

### Booking Flow
**Multi-step wizard** with progress indicator:
1. Select date/time with calendar interface
2. Guest count and service selection (dining experience, wine pairing, dessert add-ons)
3. Special requests textarea
4. Payment with Stripe Elements styling to match
5. Confirmation with booking details and calendar add

### Dashboard Components
**Stat Cards**: Large numbers with subtle background, icon, label, and trend indicator where relevant.

**Data Tables**: Sortable columns, status badges (Confirmed, Pending, Completed, Cancelled), action buttons (View Details, Message, Refund).

**Calendar Views**: For chef availability and customer bookings - use library like FullCalendar with custom styling.

**Messaging Interface**: Chat-style layout with conversation list (left) and message thread (right), typing indicators, timestamp grouping.

**Forms**: Consistent input styling with labels, helper text, error states. File uploads with drag-and-drop zones for chef photos and verification documents.

### Reviews & Ratings
Star display with filled/outline states, written review with author info, helpful votes, admin flag/moderate options.

### Admin Verification Flow
**Checklist interface** with:
- Document preview/download
- Approval/rejection buttons
- Badge assignment selector
- Notes/feedback textarea
- Approval history timeline

## Images & Photography Strategy

**Hero Section**: Use large, atmospheric images showing:
- Candlelit table settings with beautiful plating
- Intimate dining scenarios (2-4 people)
- Chef preparation shots with artistic lighting
- Wine/cocktail pairing visuals

**Chef Profiles**: Real chef photography - professional headshots and action shots of them cooking. Gallery showcasing their signature dishes with premium food photography.

**Service Cards**: Icon-based initially, with option for illustrative images showing each service type (private dining setup, wine bottles, artisan desserts, event styling).

**Gallery Section** (Marketing): 3-column masonry grid showcasing diverse dining experiences, various cuisines, different setting types (rooftop, home, private venues).

**Placeholders**: Use blurred or gradient backgrounds with chef hat icons, utensil icons, or dining-related Heroicons until real images are uploaded.

## Dashboard-Specific Patterns

**Customer Dashboard**: Card-based layout for upcoming bookings with chef photo, date/time, status badge, quick actions. Past bookings with review prompt if not yet reviewed.

**Chef Dashboard**: Earnings widget prominent, calendar view of availability, booking requests requiring action at top, completed bookings with payout status.

**Admin Dashboard**: KPI overview with GMV, active bookings, pending verifications. Quick access to moderation queues, user search, market settings.

## Interactive Elements

**Buttons**: 
- Primary: Solid with subtle glow/shadow on hover
- Secondary: Outlined with fill on hover
- Destructive: Red tones for cancellations/deletions
- Ghost: For tertiary actions

**Overlays**: Modals for confirmation actions, sideovers for forms and details, toasts for success/error notifications.

**Icons**: Heroicons throughout for consistency - use outline variant for navigation/secondary actions, solid for active states and primary buttons.

**Status Indicators**: Color-coded badges - green (confirmed/completed), yellow (pending), red (cancelled), blue (in-progress).