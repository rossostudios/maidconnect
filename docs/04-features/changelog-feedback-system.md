# Changelog & Feedback System

## Overview

Casaora's Changelog & Feedback system provides two key features for user engagement:
1. **Changelog System** - Communicate sprint updates and new features to users
2. **Feedback System** - Collect user feedback, bug reports, and feature requests

Both systems are built with Next.js 16, React 19, Supabase, and full bilingual support (English/Spanish).

---

## Table of Contents

- [Architecture](#architecture)
- [Changelog System](#changelog-system)
- [Feedback System](#feedback-system)
- [Admin Interfaces](#admin-interfaces)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Integration Points](#integration-points)
- [Testing Guide](#testing-guide)

---

## Architecture

### Tech Stack
- **Framework**: Next.js 16 with App Router
- **Runtime**: Edge runtime for optimal performance
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth
- **i18n**: next-intl for bilingual support
- **Rate Limiting**: Upstash Redis with in-memory fallback
- **Icons**: Lucide React

### Design System
- Primary Color: `#ff5d46` (coral/red)
- Background: `#fbfaf9` (warm white)
- Text: `#211f1a` (dark brown)
- Secondary: `#5d574b` (medium brown)
- Border: `#ebe5d8` (light beige)
- Rounded corners: `rounded-[28px]` for modals

---

## Changelog System

### User Flow

1. **Admin creates changelog** → Sets sprint number, title, categories, content
2. **Published** → Users see ChangelogBanner at top of pages
3. **User clicks banner** → ChangelogModal opens with full content
4. **Mark as read** → Banner disappears, tracked in `changelog_views` table
5. **Browse all** → `/changelog` page shows all published changelogs

### Components

#### ChangelogBanner
**Location**: `src/components/changelog/changelog-banner.tsx`

Sticky top banner that appears when new changelogs are published.

```typescript
import { ChangelogBanner } from "@/components/changelog/changelog-banner";

// Usage in layout
<ChangelogBanner />
```

**Features**:
- Auto-fetches latest unread changelog
- Dismissible with smooth animation
- Gradient background (purple-50 to blue-50)
- Mobile responsive

#### ChangelogModal
**Location**: `src/components/changelog/changelog-modal.tsx`

Rich modal for displaying changelog content.

**Features**:
- Category badges (Features, Fixes, Improvements, Security, Design)
- Sprint number display
- Mark as read button
- Full content with HTML/Markdown support
- "View all updates" link to `/changelog`

#### Custom Hooks

**useLatestChangelog**
```typescript
const { changelog, hasViewed, isLoading, error, markAsRead, refresh } = useLatestChangelog();
```

**useChangelogUnreadCount**
```typescript
const { unreadCount, isLoading } = useChangelogUnreadCount();
// Polls every 5 minutes for new changelogs
```

### Pages

#### Changelog List Page
**Route**: `/changelog`
**File**: `src/app/[locale]/changelog/page.tsx`

Displays all published changelogs with:
- Sprint numbers
- Category badges
- Summary previews
- Skeleton loading states
- Server-side rendering with Suspense

#### Changelog Detail Page
**Route**: `/changelog/[slug]`
**File**: `src/app/[locale]/changelog/[slug]/page.tsx`

Individual changelog page with:
- Full content display
- Featured images
- Categories and tags
- 404 handling
- SEO-friendly slugs

### Database Tables

#### changelogs
```sql
- id (uuid, primary key)
- sprint_number (integer)
- title (text)
- slug (text, unique)
- summary (text, nullable)
- content (text)
- published_at (timestamptz)
- updated_at (timestamptz)
- created_by (uuid, foreign key → profiles)
- categories (text[]) -- ['features', 'fixes', 'improvements', 'security', 'design']
- tags (text[])
- target_audience (text[]) -- ['all', 'customer', 'professional', 'admin']
- featured_image_url (text, nullable)
- visibility (text) -- 'draft' | 'published' | 'archived'
- metadata (jsonb)
- created_at (timestamptz)
```

#### changelog_views
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key → profiles)
- changelog_id (uuid, foreign key → changelogs)
- viewed_at (timestamptz)
- dismissed_at (timestamptz, nullable)
- created_at (timestamptz)
- UNIQUE(user_id, changelog_id)
```

### API Endpoints

#### GET /api/changelog/latest
Returns the latest published changelog and whether the current user has viewed it.

**Response**:
```json
{
  "changelog": {
    "id": "uuid",
    "sprint_number": 12,
    "title": "Enhanced Search and New Dashboard",
    "slug": "enhanced-search-new-dashboard",
    "summary": "...",
    "content": "<p>...</p>",
    "categories": ["features", "improvements"],
    "published_at": "2025-01-05T00:00:00Z"
  },
  "hasViewed": false
}
```

#### POST /api/changelog/mark-read
Marks a changelog as read for the current user.

**Request**:
```json
{
  "changelogId": "uuid"
}
```

**Response**:
```json
{
  "success": true
}
```

#### GET /api/changelog/unread-count
Returns the number of unread changelogs for the current user.

**Response**:
```json
{
  "count": 1
}
```

---

## Feedback System

### User Flow

1. **User clicks Feedback button** → Floating button or footer link
2. **Modal opens** → Select feedback type and write message
3. **Auto-capture context** → Page URL, user agent, viewport size
4. **Submit with consent** → Colombian data protection (Ley 1581) compliant
5. **Admin review** → Admins see all feedback in dashboard
6. **Status management** → new → in_review → resolved → closed

### Components

#### FeedbackButton
**Location**: `src/components/feedback/feedback-button.tsx`

Floating action button fixed at bottom-right.

```typescript
<FeedbackButton />
```

**Features**:
- Always visible (z-index: 40)
- Responsive design (icon-only on mobile)
- Data attribute for programmatic triggering
- Opens FeedbackModal on click

#### FeedbackModal
**Location**: `src/components/feedback/feedback-modal.tsx`

Comprehensive feedback form.

**Features**:
- 6 feedback types: Bug, Feature Request, Improvement, Complaint, Praise, Other
- Optional subject line
- Required message field
- Optional email for anonymous users
- Auto-populated technical context:
  - Page URL
  - Page path
  - User agent
  - Viewport size (width, height, pixel ratio)
- Data consent checkbox (Colombian compliance)
- Privacy notice
- Rate limited (5 submissions per hour)

**Feedback Types**:
```typescript
type FeedbackType =
  | 'bug'               // Bug reports
  | 'feature_request'   // New feature ideas
  | 'improvement'       // Enhancement suggestions
  | 'complaint'         // Service complaints
  | 'praise'            // Positive feedback
  | 'other'            // Miscellaneous
```

### Database Table

#### feedback_submissions
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key → auth.users, nullable)
- user_email (text, nullable)
- user_role (text) -- 'customer' | 'professional' | 'admin' | 'anonymous'
- feedback_type (text)
- subject (text, nullable)
- message (text)
- page_url (text)
- page_path (text)
- user_agent (text, nullable)
- viewport_size (jsonb, nullable)
- screenshot_url (text, nullable)
- status (text) -- 'new' | 'in_review' | 'resolved' | 'closed' | 'spam'
- priority (text) -- 'low' | 'medium' | 'high' | 'critical'
- assigned_to (uuid, foreign key → profiles, nullable)
- admin_notes (text, nullable)
- resolved_at (timestamptz, nullable)
- resolved_by (uuid, foreign key → profiles, nullable)
- created_at (timestamptz)
- updated_at (timestamptz)
```

### API Endpoint

#### POST /api/feedback
Submit new feedback.

**Rate Limit**: 5 submissions per hour per IP/user

**Request**:
```json
{
  "feedback_type": "bug",
  "subject": "Search not working",
  "message": "When I search for cleaners, nothing shows up",
  "user_email": "user@example.com",
  "page_url": "https://casaora.co/professionals",
  "page_path": "/professionals",
  "user_agent": "Mozilla/5.0...",
  "viewport_size": {
    "width": 1920,
    "height": 1080,
    "pixelRatio": 2
  }
}
```

**Response**:
```json
{
  "success": true,
  "submissionId": "uuid"
}
```

**Rate Limit Response** (429):
```json
{
  "error": "Too many feedback submissions. Please try again in 1 hour."
}
```

---

## Admin Interfaces

### Changelog Management

#### Admin Changelog List
**Route**: `/admin/changelog`
**File**: `src/app/[locale]/admin/changelog/page.tsx`

**Features**:
- Filter by status (All, Draft, Published, Archived)
- View count badges
- Preview and Edit buttons
- Create new changelog button
- Status badges with colors

#### Changelog Editor
**Component**: `src/components/admin/changelog/changelog-editor.tsx`

**Features**:
- Sprint number input
- Title with auto-generated slug
- Summary textarea
- Rich content editor with HTML support
- Live preview toggle
- Category selection (multi-select)
- Tags input (comma-separated)
- Target audience selection
- Featured image URL
- Published date picker
- Save as Draft or Publish buttons

#### Create Changelog
**Route**: `/admin/changelog/new`
**File**: `src/app/[locale]/admin/changelog/new/page.tsx`

Uses ChangelogEditor component in "create" mode.

#### Edit Changelog
**Route**: `/admin/changelog/[id]/edit`
**File**: `src/app/[locale]/admin/changelog/[id]/edit/page.tsx`

Uses ChangelogEditor component in "edit" mode with pre-populated data.

### Feedback Management

#### Admin Feedback Dashboard
**Route**: `/admin/feedback`
**File**: `src/app/[locale]/admin/feedback/page.tsx`

**Features**:
- Filter by status (All, New, In Review, Resolved)
- Type badges with icons
- Status and priority badges
- Submission timestamp
- User info (email, role)
- Page path
- View button for details

#### Feedback Detail View
**Route**: `/admin/feedback/[id]`
**File**: `src/app/[locale]/admin/feedback/[id]/page.tsx`

**Features**:
- Full message display
- User information section
- Submission timestamp
- Technical context (URL, user agent, viewport)
- Admin actions component
- Admin notes history

#### Feedback Actions Component
**Component**: `src/components/admin/feedback/feedback-actions.tsx`

**Features**:
- Status dropdown (New, In Review, Resolved, Closed, Spam)
- Priority dropdown (Low, Medium, High, Critical)
- Admin notes textarea (timestamped, appended)
- Save button with loading state

### Admin API Endpoints

#### POST /api/admin/changelog
Create new changelog (admin only).

#### PATCH /api/admin/changelog/[id]
Update existing changelog (admin only).

#### DELETE /api/admin/changelog/[id]
Archive changelog (admin only).

#### PATCH /api/admin/feedback/[id]
Update feedback status, priority, or notes (admin only).

---

## Integration Points

### Root Layout
**File**: `src/app/[locale]/layout.tsx`

```typescript
<ChangelogBanner />           // Sticky top banner for new updates
<FeedbackButton />            // Floating bottom-right button
```

### Dashboard Footer
**File**: `src/components/navigation/dashboard-footer.tsx`

```typescript
<Link href="/changelog">
  What's New
  {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
</Link>
<button onClick={triggerFeedbackModal}>
  Feedback
</button>
```

### Site Footer
**File**: `src/components/sections/site-footer.tsx`

```typescript
<Link href="/changelog">What's New</Link>
```

### Admin Dashboard
**File**: `src/app/[locale]/admin/page.tsx`

Navigation cards for:
- Changelog Management
- Feedback Management

---

## Testing Guide

### Manual Testing Checklist

#### Changelog System
- [ ] Create draft changelog as admin
- [ ] Preview changelog content
- [ ] Publish changelog
- [ ] Verify ChangelogBanner appears for users
- [ ] Click banner to open modal
- [ ] Mark as read
- [ ] Verify banner disappears
- [ ] Check unread badge in footer
- [ ] Browse `/changelog` page
- [ ] View individual changelog at `/changelog/[slug]`
- [ ] Test with different categories
- [ ] Verify bilingual content (en/es)

#### Feedback System
- [ ] Click floating feedback button
- [ ] Fill out feedback form
- [ ] Try all 6 feedback types
- [ ] Submit without consent (should fail)
- [ ] Submit with consent (should succeed)
- [ ] Submit 6 times rapidly (6th should hit rate limit)
- [ ] Check admin dashboard shows feedback
- [ ] View feedback detail page
- [ ] Update status and priority
- [ ] Add admin notes
- [ ] Verify notes are timestamped

#### Admin Interfaces
- [ ] Access `/admin/changelog` (requires admin role)
- [ ] Filter by status (Draft, Published, Archived)
- [ ] Create new changelog
- [ ] Edit existing changelog
- [ ] Preview before publishing
- [ ] Access `/admin/feedback`
- [ ] Filter by status (New, In Review, Resolved)
- [ ] View feedback details
- [ ] Update feedback status
- [ ] Add admin notes

### Automated Testing Recommendations

#### Unit Tests
```typescript
// Hooks
describe('useLatestChangelog', () => {
  it('fetches latest changelog');
  it('tracks viewed status');
  it('marks changelog as read');
});

// Components
describe('ChangelogBanner', () => {
  it('renders when changelog exists and not viewed');
  it('hides when changelog is viewed');
  it('dismisses on X click');
});

describe('FeedbackModal', () => {
  it('validates required fields');
  it('requires consent checkbox');
  it('auto-populates technical context');
});
```

#### Integration Tests
```typescript
// API Routes
describe('POST /api/feedback', () => {
  it('accepts valid feedback submission');
  it('rejects without required fields');
  it('enforces rate limiting');
  it('captures user context');
});

describe('POST /api/changelog/mark-read', () => {
  it('creates changelog_views entry');
  it('prevents duplicate entries');
});
```

#### E2E Tests (Playwright)
```typescript
test('Complete changelog flow', async ({ page }) => {
  // 1. Admin creates changelog
  // 2. User sees banner
  // 3. User marks as read
  // 4. Banner disappears
});

test('Complete feedback flow', async ({ page }) => {
  // 1. User clicks feedback button
  // 2. Fills form
  // 3. Submits feedback
  // 4. Admin sees feedback
  // 5. Admin updates status
});
```

---

## Security Considerations

### Row Level Security (RLS)

All tables have RLS policies:

**changelogs**:
- Public read access for published changelogs
- Admin-only write access

**changelog_views**:
- Users can only read/write their own views
- Admin read access to all views

**feedback_submissions**:
- Users can only read/write their own submissions
- Admin read/write access to all submissions

### Rate Limiting

Implemented using Upstash Redis with in-memory fallback:
- Feedback: 5 submissions per hour per IP/user
- Prevents spam and abuse
- Configurable limits in `src/lib/rate-limit.ts`

### Data Protection

Compliant with Colombian data protection (Ley 1581):
- Explicit consent checkbox required
- Privacy notice explaining data collection
- Optional email for anonymous submissions
- User agent and viewport collection disclosed

### Authentication

All admin routes require:
```typescript
await requireUser({ allowedRoles: ["admin"] });
```

Admin API endpoints verify role before processing requests.

---

## Deployment Checklist

- [ ] Run database migrations (3 SQL files in `supabase/migrations/`)
- [ ] Verify RLS policies are enabled
- [ ] Configure rate limiting (Upstash Redis or in-memory)
- [ ] Add translations to `messages/en.json` and `messages/es.json`
- [ ] Test admin access permissions
- [ ] Verify feedback email notifications (if implemented)
- [ ] Configure Better Stack logging (optional)
- [ ] Test on staging environment
- [ ] Monitor error rates in production

---

## Future Enhancements

### Changelog System
- [ ] Email notifications for new changelogs
- [ ] RSS feed for changelog updates
- [ ] Markdown editor with preview
- [ ] Image upload for featured images
- [ ] Scheduled publishing
- [ ] Draft collaborative editing
- [ ] Changelog templates
- [ ] Export changelogs to PDF

### Feedback System
- [ ] Screenshot upload capability
- [ ] Email notifications to admins on new feedback
- [ ] User feedback history page
- [ ] Feedback status email updates
- [ ] Voting system for feature requests
- [ ] Roadmap integration
- [ ] Slack/Discord notifications
- [ ] Auto-categorization using AI

---

## Support

For questions or issues:
- **Technical**: Check `src/lib/logger.ts` for error logs
- **Database**: Review RLS policies in Supabase dashboard
- **Rate Limiting**: Check Redis logs or in-memory counter
- **Admin Access**: Verify user role in `profiles` table

---

## License

Copyright © 2025 Casaora. All rights reserved.
