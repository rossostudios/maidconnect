# High Priority UX Improvements - Implementation Plan

## Overview
Tackling 5 critical user experience improvements to enhance core functionality for both customers and professionals.

---

## 1. Professional Availability Editor

### Goal
Full calendar management interface for professionals to update working hours, block dates, and manage recurring schedules.

### Current State
- Professionals set availability during onboarding only
- Can't easily update calendars for vacations or schedule changes
- No visual calendar interface

### What We'll Build

#### Components
- `AvailabilityEditor` - Main calendar management interface
- `WorkingHoursEditor` - Set daily working hours (e.g., Mon-Fri 9am-5pm)
- `BlockedDatesCalendar` - Visual calendar to block specific dates
- `RecurringScheduleManager` - Set recurring unavailability (e.g., every Sunday)

#### Database
- Use existing `professional_profiles.availability_settings` (JSONB)
- Use existing `professional_profiles.blocked_dates` (text[])

#### Features
- Weekly schedule editor (customize hours for each day)
- Visual calendar to click dates and mark as blocked
- Recurring blocks (weekly/monthly patterns)
- Preset templates (e.g., "Weekdays 9-5", "Weekends only")
- Bulk actions (block entire week, unblock range)

#### Integration Points
- Professional dashboard `/dashboard/pro` - New "Availability" section
- Professional onboarding - Enhanced availability step

---

## 2. Real-Time Messaging Upgrade

### Goal
Replace polling with Supabase Realtime for instant message delivery.

### Current State
- Messages poll every 5-30 seconds (delayed)
- No instant notification when messages arrive
- Higher server load from constant polling

### What We'll Build

#### Technical Changes
- Replace `setInterval` polling with Supabase Realtime subscriptions
- Subscribe to `conversations` table for new conversations
- Subscribe to `messages` table for new messages in active conversation
- Real-time unread count updates

#### Features
- Instant message delivery (< 1 second)
- Live typing indicators (optional)
- Online/offline presence status (optional)
- Automatic reconnection on network issues

#### Files to Update
- `src/components/messaging/messaging-interface.tsx` - Replace polling logic
- `src/hooks/use-realtime-messages.ts` - New custom hook for subscriptions

#### Database Requirements
- Ensure Realtime is enabled on Supabase project
- Verify RLS policies work with Realtime subscriptions

---

## 3. Unread Message Badges

### Goal
Show live unread message counts in dashboard navigation.

### Current State
- No indication of unread messages in navigation
- Users must manually check Messages section
- Missing important communications

### What We'll Build

#### Components
- `UnreadBadge` - Reusable badge component with count
- `useUnreadCount` - Custom hook to fetch and subscribe to unread count

#### API Endpoints
- `GET /api/messages/unread-count` - Already exists, verify it works
- Real-time subscription to update count

#### Features
- Red badge with number on "Messages" nav item
- Updates in real-time when new messages arrive
- Click badge to navigate to Messages section
- Badge disappears when all read

#### Integration Points
- `src/app/dashboard/layout.tsx` - Add badge to nav items
- Customer navigation: "Messages" link
- Professional navigation: "Messages" link

---

## 4. Push Notifications

### Goal
Browser notifications for important events when users aren't actively using the app.

### Current State
- No notifications outside the app
- Users miss time-sensitive updates
- Low engagement for important events

### What We'll Build

#### Technical Setup
- Service worker (`public/sw.js`)
- Push notification permission flow
- Web Push API integration
- Notification subscription storage

#### Notification Types
**For Customers:**
- New booking confirmation
- Booking accepted/declined by professional
- Professional is on the way (check-in)
- Service completed (check-out)
- New message from professional
- Review reminder (48 hours after service)

**For Professionals:**
- New booking request
- Booking canceled by customer
- Payment received
- New message from customer
- Review received

#### Components
- `NotificationPermissionPrompt` - Request permission UI
- `useNotificationPermission` - Hook to manage permission state
- `NotificationSettings` - User preferences (which notifications to receive)

#### API Endpoints
- `POST /api/notifications/subscribe` - Store push subscription
- `POST /api/notifications/send` - Trigger notification (server-side)

#### Database
```sql
-- New table
notification_subscriptions:
  - user_id (UUID)
  - endpoint (text)
  - p256dh (text)
  - auth (text)
  - created_at (timestamp)
```

---

## 5. Portfolio Image Upload

### Goal
Direct image upload to Supabase Storage instead of manual URL entry.

### Current State
- Manual URL entry (cumbersome, error-prone)
- No validation of image quality/format
- Professionals struggle to add work samples

### What We'll Build

#### Technical Setup
- Supabase Storage bucket: `portfolio-images`
- Public access for portfolio images
- Storage policies for upload/delete

#### Components
- `ImageUploadDropzone` - Drag-and-drop file picker
- `ImagePreview` - Show uploaded images with edit/delete
- `ImageCompressor` - Client-side compression before upload

#### Features
- Drag-and-drop or click to upload
- Multiple image upload at once
- Image preview before upload
- Client-side compression (reduce file size)
- Automatic thumbnail generation
- Progress indicators during upload
- Reorder images with drag-and-drop
- Delete confirmation

#### File Types Supported
- JPEG, PNG, WebP
- Max file size: 5MB per image
- Max images: 20 per portfolio

#### Storage Structure
```
portfolio-images/
  {professional_id}/
    {image_id}.jpg
    {image_id}_thumb.jpg  (auto-generated thumbnail)
```

#### Files to Update
- `src/components/portfolio/portfolio-manager.tsx` - Replace URL input
- `src/app/api/professional/portfolio/route.ts` - Add upload endpoint
- Database: `professional_profiles.portfolio_images` - Store Supabase URLs

---

## Implementation Order

### Phase 1 (Days 1-2): Foundation
1. **Push Notifications** (Day 1)
   - Service worker setup
   - Permission flow
   - Database table
   - Basic notifications working

2. **Unread Message Badges** (Day 2)
   - Custom hook
   - Badge component
   - Navigation integration

### Phase 2 (Days 3-4): Real-Time Features
3. **Real-Time Messaging** (Day 3)
   - Supabase Realtime setup
   - Replace polling in messaging
   - Test and verify

4. **Real-Time Badges** (Day 4)
   - Connect badges to Realtime
   - Ensure instant updates
   - Test edge cases

### Phase 3 (Days 5-6): Professional Tools
5. **Portfolio Image Upload** (Day 5)
   - Supabase Storage setup
   - Upload component
   - Integration

6. **Professional Availability Editor** (Day 6)
   - Calendar component
   - Working hours editor
   - Dashboard integration

---

## Success Metrics

### Push Notifications
- [ ] 60%+ users grant notification permission
- [ ] < 2 second notification delivery
- [ ] < 5% notification failure rate

### Real-Time Messaging
- [ ] < 1 second message delivery
- [ ] Zero polling requests
- [ ] 99%+ uptime for Realtime connection

### Unread Badges
- [ ] Badge updates within 1 second of new message
- [ ] Accurate count 100% of the time
- [ ] No flickering or incorrect states

### Portfolio Upload
- [ ] 80%+ professionals upload at least 3 images
- [ ] < 10 second upload time for 5MB image
- [ ] Zero failed uploads

### Availability Editor
- [ ] 90%+ professionals update availability within first month
- [ ] < 2 minutes to set full weekly schedule
- [ ] 50%+ professionals use blocked dates feature

---

## Technical Risks & Mitigations

### Risk 1: Supabase Realtime Limits
**Risk**: Free tier has connection limits
**Mitigation**: Monitor usage, upgrade plan if needed, implement graceful fallback to polling

### Risk 2: Push Notification Permission Denial
**Risk**: Users deny notification permission
**Mitigation**: Explain value clearly, allow re-requesting, graceful degradation

### Risk 3: Storage Costs
**Risk**: Image uploads increase storage costs
**Mitigation**: Image compression, file size limits, thumbnail generation, monitor usage

### Risk 4: Browser Compatibility
**Risk**: Older browsers don't support Push API or Realtime
**Mitigation**: Feature detection, progressive enhancement, fallback UX

---

## Testing Plan

### Manual Testing
- [ ] Test push notifications on Chrome, Firefox, Safari
- [ ] Test messaging on multiple tabs/devices simultaneously
- [ ] Test image upload with various file types and sizes
- [ ] Test availability editor with edge cases (all-day blocks, etc.)

### Automated Testing
- [ ] Unit tests for notification subscription logic
- [ ] Integration tests for Realtime subscriptions
- [ ] E2E tests for image upload flow
- [ ] Snapshot tests for new components

---

## Deployment Checklist

### Database
- [ ] Create `notification_subscriptions` table
- [ ] Create Supabase Storage bucket `portfolio-images`
- [ ] Set storage policies (public read, authenticated write)
- [ ] Enable Realtime on `conversations` and `messages` tables

### Environment Variables
- [ ] `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (Web Push)
- [ ] `VAPID_PRIVATE_KEY` (server-side)
- [ ] Supabase Storage URL already configured

### Service Worker
- [ ] Deploy `public/sw.js`
- [ ] Register service worker in app
- [ ] Test offline functionality

---

## Next Steps

1. Start with Push Notifications (foundational for engagement)
2. Add Unread Badges (quick win, high impact)
3. Upgrade to Real-Time Messaging (technical improvement)
4. Build Portfolio Upload (professional empowerment)
5. Create Availability Editor (professional flexibility)

Ready to begin implementation! 🚀
