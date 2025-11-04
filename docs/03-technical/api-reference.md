# API Reference

Comprehensive API documentation for Casaora covering all 42 endpoints.

## Table of Contents

- [Overview](#overview)
- [Authentication & Account Management](#authentication--account-management)
- [Bookings](#bookings)
- [Payments](#payments)
- [Messages & Conversations](#messages--conversations)
- [Notifications](#notifications)
- [Professionals](#professionals)
- [Payouts & Stripe Connect](#payouts--stripe-connect)
- [Customer](#customer)
- [Admin Endpoints](#admin-endpoints)
- [Webhooks](#webhooks)
- [Cron Jobs](#cron-jobs)
- [Common Patterns](#common-patterns)

---

## Overview

### Base URL
- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.com`

### Authentication
Most endpoints require authentication via Supabase JWT token passed in cookies or headers.

### Runtime
- **Edge Runtime**: 41 endpoints (faster, globally distributed)
- **Node.js Runtime**: 1 endpoint (`/api/notifications/send`)

### Rate Limiting
Applied to sensitive operations (account deletion, data export, etc.)

### Response Format
All responses are JSON with standard patterns:
- **Success**: `{ success: true, ...data }` or direct data object
- **Error**: `{ error: "message" }` with appropriate HTTP status code

---

## Authentication & Account Management

### Delete Account
**`DELETE /api/account/delete`**

Delete user account permanently (Colombian Law 1581 de 2012 compliance).

**Authentication**: Required (User)

**Request Body**:
```json
{
  "confirmText": "DELETE MY ACCOUNT"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Account deletion scheduled for 30 days from now"
}
```

**Status Codes**:
- `200` - Success (30-day grace period)
- `400` - Active bookings or pending payouts exist
- `401` - Not authenticated
- `500` - Server error

**Notes**:
- Soft delete with 30-day grace period
- Blocks deletion if active bookings or pending payouts exist
- Complies with Colombian data protection law

---

### Check Account Deletion Eligibility
**`GET /api/account/delete`**

Check if account deletion is currently possible.

**Authentication**: Required (User)

**Response**:
```json
{
  "canDelete": false,
  "blockers": {
    "activeBookings": 2,
    "pendingPayouts": 1
  }
}
```

---

### Export User Data
**`GET /api/account/export-data`**

Export all user data in JSON format (Colombian Law 1581 compliance).

**Authentication**: Required (User)

**Rate Limit**: Sensitive operation

**Response**: JSON file containing:
- Profile data with consent records
- Customer/Professional profile data
- All bookings (as customer and professional)
- Reviews written and received
- Messages and conversations
- Payouts and notification history
- Auth metadata

**Content-Type**: `application/json`

**Response Example**:
```json
{
  "exportDate": "2025-01-15T10:30:00Z",
  "userId": "abc123",
  "profile": { ... },
  "bookings": [ ... ],
  "reviews": [ ... ],
  "messages": [ ... ]
}
```

---

## Bookings

### Create Booking
**`POST /api/bookings`**

Create new booking with payment authorization.

**Authentication**: Required (Customer)

**Runtime**: Edge

**Request Body**:
```json
{
  "professionalId": "uuid",
  "scheduledStart": "2025-02-01T14:00:00Z",
  "scheduledEnd": "2025-02-01T16:00:00Z",
  "durationMinutes": 120,
  "amount": 50000,
  "currency": "cop",
  "specialInstructions": "Please bring eco-friendly products",
  "address": {
    "street": "Calle 123",
    "city": "Bogotá",
    "postalCode": "110111"
  },
  "serviceName": "Deep Cleaning",
  "serviceHourlyRate": 25000
}
```

**Required Fields**: `professionalId`, `amount`

**Response**:
```json
{
  "bookingId": "uuid",
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

**Process**:
1. Creates booking in `pending_payment` status
2. Initializes Stripe PaymentIntent with "manual" capture
3. Returns client secret for payment setup

**Status Codes**:
- `200` - Success
- `400` - Invalid request body
- `401` - Not authenticated
- `500` - Server error

---

### Authorize Booking
**`POST /api/bookings/authorize`**

Transition booking from `pending_payment` to `authorized` after payment setup.

**Authentication**: Required (Customer)

**Request Body**:
```json
{
  "bookingId": "uuid",
  "paymentIntentId": "pi_xxx"
}
```

**Response**:
```json
{
  "success": true
}
```

**Side Effects**:
- Email sent to professional
- Push notifications to both parties

---

### Accept Booking
**`POST /api/bookings/accept`**

Professional accepts a booking request.

**Authentication**: Required (Professional)

**Request Body**:
```json
{
  "bookingId": "uuid"
}
```

**Prerequisites**: Booking must be in `authorized` status

**Response**:
```json
{
  "success": true,
  "booking": {
    "id": "uuid",
    "status": "confirmed"
  }
}
```

**Side Effects**:
- Confirmation email to customer
- Push notification to customer

---

### Decline Booking
**`POST /api/bookings/decline`**

Professional declines a booking request.

**Authentication**: Required (Professional)

**Request Body**:
```json
{
  "bookingId": "uuid",
  "reason": "Not available on this date"
}
```

**Prerequisites**: Booking in `authorized` or `pending_payment` status

**Response**:
```json
{
  "success": true,
  "booking": {
    "id": "uuid",
    "status": "declined"
  }
}
```

**Side Effects**:
- Cancels Stripe PaymentIntent
- Decline email to customer
- Push notification to customer

---

### Cancel Booking
**`POST /api/bookings/cancel`**

Customer cancels a confirmed/authorized booking.

**Authentication**: Required (Customer)

**Request Body**:
```json
{
  "bookingId": "uuid",
  "reason": "Change of plans"
}
```

**Prerequisites**: Booking in `pending_payment`, `authorized`, or `confirmed` status

**Response**:
```json
{
  "success": true,
  "booking": {
    "id": "uuid",
    "status": "canceled",
    "canceled_at": "2025-01-15T10:30:00Z"
  },
  "refund": {
    "policy": "full_refund",
    "refund_percentage": 100,
    "refund_amount": 50000,
    "formatted_refund": "$50,000 COP",
    "stripe_status": "succeeded"
  }
}
```

**Refund Logic**: Based on cancellation policy (days until appointment)

---

### Reschedule Booking
**`POST /api/bookings/reschedule`**

Customer reschedules a confirmed/authorized booking to new datetime.

**Authentication**: Required (Customer)

**Request Body**:
```json
{
  "bookingId": "uuid",
  "newScheduledStart": "2025-02-05T14:00:00Z",
  "newDurationMinutes": 120
}
```

**Prerequisites**:
- Booking in `authorized` or `confirmed` status
- New datetime must be in the future

**Response**:
```json
{
  "success": true,
  "booking": {
    "id": "uuid",
    "status": "authorized",
    "scheduled_start": "2025-02-05T14:00:00Z",
    "scheduled_end": "2025-02-05T16:00:00Z",
    "duration_minutes": 120
  }
}
```

**Behavior**: Resets booking to `authorized` status requiring professional re-confirmation

**Side Effects**: Email to professional about reschedule request

---

### Extend Time
**`POST /api/bookings/extend-time`**

Request time extension during active service.

**Authentication**: Required (Professional)

**Request Body**:
```json
{
  "bookingId": "uuid",
  "additionalMinutes": 60
}
```

**Constraints**:
- `additionalMinutes`: 1-240 minutes
- Max extension: 240 minutes (4 hours) at a time

**Prerequisites**:
- Booking in `in_progress` status
- Must have hourly rate defined

**Response**:
```json
{
  "success": true,
  "booking": {
    "id": "uuid",
    "time_extension_minutes": 60,
    "time_extension_amount": 25000,
    "new_total_amount": 75000
  },
  "extension": {
    "additional_minutes": 60,
    "additional_amount": 25000,
    "formatted_amount": "$25,000 COP"
  }
}
```

**Side Effects**: Updates Stripe PaymentIntent amount

---

### Check In
**`POST /api/bookings/check-in`**

Professional checks in to start a service with GPS verification.

**Authentication**: Required (Professional)

**Request Body**:
```json
{
  "bookingId": "uuid",
  "latitude": 4.6097,
  "longitude": -74.0817
}
```

**Constraints**:
- `latitude`: -90 to 90
- `longitude`: -180 to 180

**Prerequisites**: Booking in `confirmed` status

**Response**:
```json
{
  "success": true,
  "booking": {
    "id": "uuid",
    "status": "in_progress",
    "checked_in_at": "2025-02-01T14:05:00Z"
  }
}
```

**GPS Verification**: Soft enforcement (150m tolerance), logged as warnings

**Side Effects**: Push notification to customer

---

### Check Out
**`POST /api/bookings/check-out`**

Professional checks out after completing service, captures payment.

**Authentication**: Required (Professional)

**Runtime**: Edge

**Request Body**:
```json
{
  "bookingId": "uuid",
  "latitude": 4.6097,
  "longitude": -74.0817,
  "completionNotes": "All tasks completed successfully"
}
```

**Prerequisites**: Booking in `in_progress` status

**Response**:
```json
{
  "success": true,
  "booking": {
    "id": "uuid",
    "status": "completed",
    "checked_out_at": "2025-02-01T16:10:00Z",
    "actual_duration_minutes": 125,
    "amount_captured": 52083
  }
}
```

**Process**:
1. Validates GPS location
2. Calculates actual duration
3. Captures Stripe payment (base + extensions)
4. Records completion
5. Sends emails and notifications

**Side Effects**:
- Service completion emails to both parties
- Push notifications to both parties

**Critical Errors**: Payment capture failures logged for manual review

---

### Create Dispute
**`POST /api/bookings/disputes`**

Submit dispute for completed booking within 48-hour window.

**Authentication**: Required (Customer or Professional)

**Request Body**:
```json
{
  "bookingId": "uuid",
  "reason": "service_not_completed",
  "description": "The cleaning was not completed as agreed upon. Only half the house was cleaned."
}
```

**Constraints**:
- `description`: Minimum 20 characters
- Must be within 48 hours of booking completion

**Prerequisites**: Booking in `completed` status

**Response**:
```json
{
  "success": true,
  "dispute": {
    "id": "uuid",
    "created_at": "2025-02-01T16:30:00Z"
  }
}
```

---

### Get Disputes
**`GET /api/bookings/disputes`**

Get disputes for current user.

**Authentication**: Required

**Response**:
```json
{
  "disputes": [
    {
      "id": "uuid",
      "booking_id": "uuid",
      "reason": "service_not_completed",
      "description": "...",
      "status": "open",
      "created_at": "2025-02-01T16:30:00Z"
    }
  ]
}
```

**Filtering**: Based on user role (admin sees all, professionals see their disputes as pro, customers as customer)

---

## Payments

### Create Payment Intent
**`POST /api/payments/create-intent`**

Initialize Stripe payment intent for booking.

**Authentication**: Required

**Runtime**: Edge

**Request Body**:
```json
{
  "amount": 50000,
  "currency": "cop",
  "bookingId": "uuid",
  "customerName": "Juan Pérez",
  "customerEmail": "juan@example.com"
}
```

**Required**: `amount`

**Response**:
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

**Features**: Manual capture method, automatic payment methods enabled

---

### Capture Payment
**`POST /api/payments/capture-intent`**

Capture payment for payment intent.

**Authentication**: Required

**Runtime**: Edge

**Request Body**:
```json
{
  "paymentIntentId": "pi_xxx",
  "amountToCapture": 50000
}
```

**Required**: `paymentIntentId`

**Response**:
```json
{
  "paymentIntent": {
    "id": "pi_xxx",
    "amount": 50000,
    "status": "succeeded"
  }
}
```

**Authorization**: Both customer and professional can capture

---

### Void/Cancel Payment
**`POST /api/payments/void-intent`**

Cancel a payment intent.

**Authentication**: Required

**Runtime**: Edge

**Request Body**:
```json
{
  "paymentIntentId": "pi_xxx"
}
```

**Response**:
```json
{
  "success": true,
  "paymentIntent": {
    "id": "pi_xxx",
    "status": "canceled"
  }
}
```

**Authorization**: Both customer and professional can cancel

---

## Messages & Conversations

### Get Conversations
**`GET /api/messages/conversations`**

Get all conversations for current user.

**Authentication**: Required

**Runtime**: Edge

**Response**:
```json
{
  "conversations": [
    {
      "id": "uuid",
      "booking": { ... },
      "customer": { ... },
      "professional": { ... },
      "last_message_at": "2025-02-01T10:30:00Z",
      "customer_unread_count": 0,
      "professional_unread_count": 2
    }
  ]
}
```

**Includes**: Related booking data and user profiles

**Ordering**: By `last_message_at` descending, then `created_at`

---

### Create/Get Conversation
**`POST /api/messages/conversations`**

Create conversation for booking (or get existing).

**Authentication**: Required

**Runtime**: Edge

**Request Body**:
```json
{
  "bookingId": "uuid"
}
```

**Response**:
```json
{
  "conversationId": "uuid"
}
```

**Behavior**: Returns existing conversation if already created

---

### Get Messages
**`GET /api/messages/conversations/[id]`**

Get all messages in a conversation.

**Authentication**: Required

**Runtime**: Edge

**Response**:
```json
{
  "messages": [
    {
      "id": "uuid",
      "sender_id": "uuid",
      "message": "Hello, I have a question about the service",
      "attachments": [],
      "created_at": "2025-02-01T10:30:00Z",
      "read_at": null,
      "sender": {
        "full_name": "Juan Pérez",
        "avatar_url": "https://..."
      }
    }
  ]
}
```

**Includes**: Sender profile information

---

### Send Message
**`POST /api/messages/conversations/[id]`**

Send message in conversation.

**Authentication**: Required

**Runtime**: Edge

**Request Body**:
```json
{
  "message": "Hello, I have a question",
  "attachments": []
}
```

**Required**: `message` (non-empty string)

**Response**:
```json
{
  "message": {
    "id": "uuid",
    "sender_id": "uuid",
    "message": "Hello, I have a question",
    "created_at": "2025-02-01T10:30:00Z"
  }
}
```

**Side Effects**:
- Updates conversation `last_message_at`
- Increments recipient's unread count

---

### Mark Messages as Read
**`POST /api/messages/conversations/[id]/read`**

Mark all unread messages in conversation as read.

**Authentication**: Required

**Runtime**: Edge

**Response**:
```json
{
  "success": true
}
```

**Side Effects**: Resets unread count to 0 for current user

---

### Get Unread Count
**`GET /api/messages/unread-count`**

Get total unread message count.

**Authentication**: Required

**Runtime**: Edge

**Response**:
```json
{
  "unreadCount": 5
}
```

**Logic**: Sums appropriate unread counts based on user role

---

## Notifications

### Send Push Notification
**`POST /api/notifications/send`**

Send push notifications to user's devices.

**Authentication**: Required

**Runtime**: Node.js (not Edge - requires web-push)

**Request Body**:
```json
{
  "userId": "uuid",
  "title": "New Booking Request",
  "body": "You have a new booking request from Juan",
  "url": "/dashboard/pro/bookings",
  "tag": "booking_123",
  "requireInteraction": false
}
```

**Required**: `userId`, `title`, `body`

**Response**:
```json
{
  "success": true,
  "sent": 2,
  "total": 2,
  "results": [
    { "endpoint": "...", "success": true },
    { "endpoint": "...", "success": true }
  ]
}
```

**Features**:
- Sends to all user subscriptions via web-push
- Handles invalid subscriptions (410 Gone)
- Saves notification to history

**Environment Variables Required**:
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`

---

### Subscribe to Push Notifications
**`POST /api/notifications/subscribe`**

Register device for push notifications.

**Authentication**: Required

**Runtime**: Edge

**Request Body**:
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "p256dh": "BN...",
  "auth": "dG...",
  "userAgent": "Mozilla/5.0..."
}
```

**Required**: `endpoint`, `p256dh`, `auth`

**Response**:
```json
{
  "success": true,
  "subscription": {
    "id": "uuid",
    "endpoint": "...",
    "created_at": "2025-02-01T10:30:00Z"
  }
}
```

**Behavior**: Upserts subscription (creates new or updates existing)

---

### Get Subscriptions
**`GET /api/notifications/subscribe`**

Get all notification subscriptions for user.

**Authentication**: Required

**Runtime**: Edge

**Response**:
```json
{
  "success": true,
  "subscriptions": [
    {
      "id": "uuid",
      "endpoint": "...",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2025-02-01T10:30:00Z"
    }
  ]
}
```

---

### Unsubscribe
**`DELETE /api/notifications/subscribe`**

Delete all push notification subscriptions.

**Authentication**: Required

**Runtime**: Edge

**Response**:
```json
{
  "success": true
}
```

---

### Get Unread Count
**`GET /api/notifications/unread-count`**

Get count of unread notifications.

**Authentication**: Required

**Runtime**: Edge

**Response**:
```json
{
  "unreadCount": 12
}
```

---

### Get History
**`GET /api/notifications/history?limit=50&offset=0&unreadOnly=false`**

Get paginated notification history.

**Authentication**: Required

**Runtime**: Edge

**Query Parameters**:
- `limit`: Number of results (default 50)
- `offset`: Pagination offset (default 0)
- `unreadOnly`: Filter to unread only (optional)

**Response**:
```json
{
  "notifications": [
    {
      "id": "uuid",
      "title": "New Booking",
      "body": "...",
      "url": "/dashboard/bookings",
      "read_at": null,
      "created_at": "2025-02-01T10:30:00Z"
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

---

### Mark as Read
**`POST /api/notifications/mark-read`**

Mark notification(s) as read.

**Authentication**: Required

**Runtime**: Edge

**Request Body**:
```json
{
  "notificationIds": ["uuid1", "uuid2"]
}
```

**OR**:
```json
{
  "markAllRead": true
}
```

**Response**:
```json
{
  "success": true,
  "marked": 2
}
```

**OR**:
```json
{
  "success": true,
  "markedAll": true
}
```

---

## Professionals

### Get Profile
**`GET /api/professional/profile`**

Get current professional's profile.

**Authentication**: Required (Professional)

**Runtime**: Edge

**Response**:
```json
{
  "profile": {
    "full_name": "María García",
    "bio": "Experienced cleaner with 5+ years...",
    "languages": ["es", "en"],
    "phone_number": "+57 300 123 4567",
    "avatar_url": "https://...",
    "primary_services": ["deep_cleaning", "regular_cleaning"]
  }
}
```

---

### Update Profile
**`PUT /api/professional/profile`**

Update professional profile fields.

**Authentication**: Required (Professional)

**Runtime**: Edge

**Request Body** (all fields optional):
```json
{
  "full_name": "María García",
  "bio": "Experienced cleaner...",
  "languages": ["es", "en"],
  "phone_number": "+57 300 123 4567",
  "avatar_url": "https://...",
  "primary_services": ["deep_cleaning"]
}
```

**Response**:
```json
{
  "success": true
}
```

---

### Get Availability
**`GET /api/professional/availability`**

Get professional's availability schedule.

**Authentication**: Required (Professional)

**Runtime**: Edge

**Response**:
```json
{
  "availability_settings": {
    "weeklyHours": [
      { "day": "monday", "enabled": true, "start": "09:00", "end": "17:00" }
    ]
  },
  "blocked_dates": ["2025-01-01", "2025-12-25"]
}
```

---

### Update Availability
**`PUT /api/professional/availability`**

Update availability settings and blocked dates.

**Authentication**: Required (Professional)

**Runtime**: Edge

**Request Body**:
```json
{
  "weeklyHours": [
    { "day": "monday", "enabled": true, "start": "09:00", "end": "17:00" },
    { "day": "tuesday", "enabled": true, "start": "09:00", "end": "17:00" }
  ],
  "blockedDates": ["2025-01-01", "2025-12-25"]
}
```

**Response**:
```json
{
  "success": true
}
```

---

### Get Add-ons
**`GET /api/professional/addons`**

Get all service add-ons for current professional.

**Authentication**: Required (Professional)

**Runtime**: Edge

**Response**:
```json
{
  "addons": [
    {
      "id": "uuid",
      "name": "Window Cleaning",
      "description": "Clean all windows inside and out",
      "price_cop": 20000,
      "duration_minutes": 30,
      "is_active": true
    }
  ]
}
```

---

### Create Add-on
**`POST /api/professional/addons`**

Create new service add-on.

**Authentication**: Required (Professional)

**Runtime**: Edge

**Request Body**:
```json
{
  "name": "Window Cleaning",
  "description": "Clean all windows",
  "price_cop": 20000,
  "duration_minutes": 30,
  "is_active": true
}
```

**Required**: `name`, `price_cop`

**Response**:
```json
{
  "addon": {
    "id": "uuid",
    "name": "Window Cleaning",
    "price_cop": 20000
  }
}
```

---

### Update Add-ons (Bulk)
**`PUT /api/professional/addons`**

Bulk update/upsert add-ons.

**Authentication**: Required (Professional)

**Runtime**: Edge

**Request Body**:
```json
{
  "addons": [
    { "id": "uuid", "name": "Updated Name", "price_cop": 25000 }
  ]
}
```

**Response**:
```json
{
  "addons": [ ... ]
}
```

**Behavior**: Deletes add-ons not in request, upserts all incoming

---

### Update Add-on (Single)
**`PATCH /api/professional/addons/[id]`**

Update a specific add-on.

**Authentication**: Required (Professional)

**Runtime**: Edge

**Request Body**: Partial addon fields

**Response**:
```json
{
  "addon": { ... }
}
```

---

### Delete Add-on
**`DELETE /api/professional/addons/[id]`**

Delete a specific add-on.

**Authentication**: Required (Professional)

**Runtime**: Edge

**Response**:
```json
{
  "success": true
}
```

---

### Get Portfolio
**`GET /api/professional/portfolio`**

Get professional's portfolio images.

**Authentication**: Required (Professional)

**Runtime**: Edge

**Response**:
```json
{
  "images": [
    {
      "id": "uuid",
      "url": "https://...",
      "thumbnail_url": "https://...",
      "caption": "Before and after",
      "order": 0
    }
  ],
  "featuredWork": "Before and after of living room deep clean"
}
```

---

### Update Portfolio
**`PUT /api/professional/portfolio`**

Update portfolio images and featured work.

**Authentication**: Required (Professional)

**Runtime**: Edge

**Request Body**:
```json
{
  "images": [
    { "id": "uuid", "url": "https://...", "order": 0 }
  ],
  "featuredWork": "Description of featured work"
}
```

**Response**:
```json
{
  "success": true,
  "images": [ ... ],
  "featuredWork": "..."
}
```

---

### Add Portfolio Image
**`POST /api/professional/portfolio`**

Add new portfolio image.

**Authentication**: Required (Professional)

**Runtime**: Edge

**Request Body**:
```json
{
  "url": "https://...",
  "thumbnailUrl": "https://...",
  "caption": "Kitchen deep clean"
}
```

**Required**: `url`

**Response**:
```json
{
  "image": {
    "id": "uuid",
    "url": "https://...",
    "order": 5
  }
}
```

---

### Upload Portfolio Image
**`POST /api/professional/portfolio/upload`**

Upload image to Supabase Storage.

**Authentication**: Required (Professional)

**Runtime**: Edge

**Request Body**: FormData with file
- `file`: File (image only, max 5MB)

**Response**:
```json
{
  "success": true,
  "url": "https://supabase.../storage/...",
  "path": "portfolio/user-id/image.jpg"
}
```

**Constraints**: Image only, max 5MB, stored in user directory

---

### Delete Portfolio Image
**`DELETE /api/professional/portfolio/upload?path=string`**

Delete portfolio image from storage.

**Authentication**: Required (Professional)

**Runtime**: Edge

**Query Parameters**: `path` (required, must belong to user)

**Response**:
```json
{
  "success": true
}
```

---

### Get Public Add-ons
**`GET /api/professionals/[id]/addons`** (Public)

Get active add-ons for specific professional (customer view).

**Authentication**: Not required

**Runtime**: Edge

**Response**:
```json
{
  "addons": [
    {
      "id": "uuid",
      "name": "Window Cleaning",
      "price_cop": 20000
    }
  ]
}
```

**Filtering**: Only active add-ons

---

### Get Public Availability
**`GET /api/professionals/[id]/availability?startDate=2025-02-01&endDate=2025-02-28`** (Public)

Get professional's availability for date range.

**Authentication**: Not required

**Runtime**: Edge

**Query Parameters**:
- `startDate`: Start date (required, YYYY-MM-DD)
- `endDate`: End date (required, YYYY-MM-DD)

**Response**:
```json
{
  "professionalId": "uuid",
  "startDate": "2025-02-01",
  "endDate": "2025-02-28",
  "availability": [
    {
      "date": "2025-02-01",
      "status": "available"
    },
    {
      "date": "2025-02-02",
      "status": "limited"
    }
  ],
  "instantBooking": {
    "enabled": true,
    "requiresApproval": false
  }
}
```

**Availability States**: `available`, `limited`, `booked`, `blocked`

---

## Payouts & Stripe Connect

### Get Pending Payouts
**`GET /api/pro/payouts/pending`**

Get pending payout information for current period.

**Authentication**: Required (Professional)

**Runtime**: Edge

**Response**:
```json
{
  "currentPeriod": {
    "periodStart": "2025-01-28",
    "periodEnd": "2025-02-10",
    "nextPayoutDate": "2025-02-11",
    "grossAmount": 250000,
    "commissionAmount": 37500,
    "netAmount": 212500,
    "currency": "cop",
    "bookingCount": 5,
    "bookings": [ ... ]
  },
  "allPending": { ... },
  "recentPayouts": [ ... ]
}
```

**Calculation**: Based on completed bookings with `amount_captured`

**Period**: Current bi-weekly payout cycle (Tuesday to Monday)

---

### Initialize Stripe Connect
**`POST /api/pro/stripe/connect`**

Start Stripe Connect onboarding flow.

**Authentication**: Required (Professional)

**Runtime**: Node.js

**Response**:
```json
{
  "url": "https://connect.stripe.com/setup/..."
}
```

**Creates**: Express account if not exists

**Redirect URLs**: Return URL and refresh URL configured

---

### Check Stripe Connect Status
**`GET /api/pro/stripe/connect-status`**

Get Stripe Connect account status.

**Authentication**: Required (Professional)

**Runtime**: Edge

**Response**:
```json
{
  "status": "complete",
  "charges_enabled": true,
  "payouts_enabled": true,
  "details_submitted": true,
  "requirements": {
    "currently_due": [],
    "eventually_due": [],
    "past_due": []
  }
}
```

**Status Values**: `not_started`, `pending`, `submitted`, `complete`

**Updates**: Syncs latest status from Stripe to database

---

## Customer

### Get Favorite Professionals
**`GET /api/customer/favorites`**

Get customer's favorite professionals.

**Authentication**: Required (Customer)

**Runtime**: Edge

**Response**:
```json
{
  "favorites": [
    {
      "id": "uuid",
      "professional_id": "uuid",
      "professional": {
        "full_name": "María García",
        "bio": "...",
        "avatar_url": "https://..."
      }
    }
  ]
}
```

**Includes**: Full professional profiles

---

### Add/Remove Favorite
**`POST /api/customer/favorites`**

Add or remove professional from favorites.

**Authentication**: Required (Customer)

**Runtime**: Edge

**Request Body**:
```json
{
  "professionalId": "uuid",
  "action": "add"
}
```

**Actions**: `add` or `remove`

**Response**:
```json
{
  "success": true,
  "favorites": [ ... ],
  "isFavorite": true
}
```

---

### Get Saved Addresses
**`GET /api/customer/addresses`**

Get customer's saved addresses.

**Authentication**: Required (Customer)

**Runtime**: Edge

**Response**:
```json
{
  "addresses": [
    {
      "id": "uuid",
      "nickname": "Home",
      "street": "Calle 123",
      "city": "Bogotá",
      "is_default": true
    }
  ]
}
```

---

### Update Saved Addresses
**`PUT /api/customer/addresses`**

Update customer's saved addresses.

**Authentication**: Required (Customer)

**Runtime**: Edge

**Request Body**:
```json
{
  "addresses": [
    {
      "nickname": "Home",
      "street": "Calle 123",
      "city": "Bogotá"
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "addresses": [ ... ]
}
```

---

## Admin Endpoints

### Review Professional Application
**`POST /api/admin/professionals/review`**

Review and approve/reject professional application.

**Authentication**: Required (Admin)

**Runtime**: Edge

**Request Body**:
```json
{
  "professionalId": "uuid",
  "action": "approve",
  "notes": "Documents verified successfully",
  "internalNotes": "Background check clear",
  "documentsVerified": true,
  "backgroundCheckPassed": true,
  "referencesVerified": true
}
```

**Actions**: `approve`, `reject`, `request_info`

**Required**: `professionalId`, `action`

**Required if reject**: `rejectionReason`

**Response**:
```json
{
  "success": true,
  "review": { ... },
  "newStatus": "approved"
}
```

**Side Effects**:
- Email notifications to professional
- Creates audit log

---

### Get Vetting Queue
**`GET /api/admin/professionals/queue?status=application_in_review`**

Get professionals awaiting review.

**Authentication**: Required (Admin)

**Runtime**: Edge

**Query Parameters**: `status` (optional filter)

**Response**:
```json
{
  "professionals": [ ... ],
  "grouped": {
    "application_in_review": [ ... ],
    "approved": [ ... ],
    "application_pending": [ ... ]
  },
  "counts": {
    "application_in_review": 5,
    "approved": 23,
    "application_pending": 2
  }
}
```

**Includes**: Documents, reviews, and requirements

---

### Moderate User Account
**`POST /api/admin/users/moderate`**

Suspend, ban, or unsuspend user account.

**Authentication**: Required (Admin)

**Runtime**: Edge

**Request Body**:
```json
{
  "userId": "uuid",
  "action": "suspend",
  "reason": "Violation of terms of service",
  "durationDays": 14,
  "details": {
    "violationType": "spam"
  }
}
```

**Actions**: `suspend`, `ban`, `unsuspend`

**Required**: `userId`, `action`, `reason` (for suspend/ban)

**Response**:
```json
{
  "success": true,
  "result": { ... },
  "message": "User suspended for 14 days"
}
```

**Side Effects**:
- Email notifications to user
- Creates audit log

**Constraints**: Cannot suspend other admins or yourself

---

### Process Payouts
**`POST /api/admin/payouts/process`**

Process payouts for professionals.

**Authentication**: Required (Admin OR Cron with CRON_SECRET)

**Runtime**: Edge

**Request Body**:
```json
{
  "professionalId": "uuid",
  "dryRun": true
}
```

**Optional Fields**: All fields optional

**Response**:
```json
{
  "message": "Processed payouts for 15 professionals",
  "periodStart": "2025-01-28",
  "periodEnd": "2025-02-10",
  "dryRun": false,
  "results": [
    {
      "professionalId": "uuid",
      "success": true,
      "grossAmount": 250000,
      "netAmount": 212500,
      "transferId": "tr_xxx"
    }
  ]
}
```

**Process**:
1. Fetches professionals with complete Stripe Connect
2. Calculates pending bookings for period
3. Creates payout record
4. Creates Stripe transfer
5. Marks bookings as included

**Creates**: Audit log

---

## Webhooks

### Stripe Webhooks
**`POST /api/webhooks/stripe`**

Handle Stripe webhook events.

**Authentication**: Stripe signature verification

**Runtime**: Edge

**Events Handled**:
- `payment_intent.succeeded`: Mark booking as completed
- `payment_intent.canceled`: Mark booking as canceled
- `payment_intent.payment_failed`: Mark booking as payment_failed
- `charge.refunded`: Update booking payment status

**Response**:
```json
{
  "received": true
}
```

**Signature Header**: `stripe-signature`

**Environment Variable Required**: `STRIPE_WEBHOOK_SECRET`

---

## Cron Jobs

### Auto-Decline Expired Bookings
**`GET /api/cron/auto-decline-bookings`**

Auto-decline bookings in "authorized" status for > 24 hours.

**Authentication**: Bearer token with `CRON_SECRET`

**Runtime**: Edge

**Frequency**: Should be called by Vercel Cron hourly

**Response**:
```json
{
  "success": true,
  "message": "Auto-declined 3 expired booking(s)",
  "declined": 3,
  "failed": 0,
  "errors": []
}
```

**Side Effects**: Decline emails to customers

**Header Required**: `Authorization: Bearer ${CRON_SECRET}`

---

### Process Payouts (Cron)
**`GET /api/cron/process-payouts`**

Automated payout processing.

**Authentication**: Bearer token with `CRON_SECRET`

**Runtime**: Edge

**Schedule**: Tuesday and Friday at 10:00 AM Colombia time (15:00 UTC)

**Response**: Returns payout processing results

**Calls**: `/api/admin/payouts/process` internally

**Header Required**: `Authorization: Bearer ${CRON_SECRET}`

---

## Common Patterns

### Error Response Format

All errors follow this format:

```json
{
  "error": "Error message here"
}
```

**Status Codes**:
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not authorized)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

---

### Authentication Pattern

Most endpoints verify authentication:

```typescript
const { data: { user }, error } = await supabase.auth.getUser();

if (!user) {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
```

---

### Authorization Patterns

**Role-Based**:
```typescript
if (user.role !== 'admin') {
  return Response.json({ error: "Forbidden" }, { status: 403 });
}
```

**Owner-Based**:
```typescript
if (booking.customer_id !== user.id) {
  return Response.json({ error: "Forbidden" }, { status: 403 });
}
```

**Booking Participants**:
```typescript
if (booking.customer_id !== user.id && booking.professional_id !== user.id) {
  return Response.json({ error: "Forbidden" }, { status: 403 });
}
```

---

### Timestamps

All timestamps are in ISO 8601 format:
```
2025-02-01T14:00:00Z
```

Stored as UTC in database.

---

### Currency

Default: **COP** (Colombian Peso)

Amounts stored in cents:
- 100,000 cents = 1,000 COP
- 50,000 cents = 500 COP

---

### Booking Status Flow

```
pending_payment → authorized → confirmed → in_progress → completed
     ↓              ↓           ↓           ↓
   declined      declined    canceled      (final)
```

---

### Professional Onboarding Status

```
application_pending → application_in_review → approved → active
                           ↓
                        rejected
```

---

### Payout Calculation

- **Gross Amount**: Sum of all captured booking amounts
- **Commission**: Platform percentage
- **Net Amount**: Gross - Commission (what professional receives)
- **Period**: Bi-weekly (Tuesday to Monday)
- **Payout Date**: Following Tuesday or Friday

---

### GPS Verification

**Check-in/Check-out**:
- Soft enforcement with 150m tolerance
- All verifications logged for fraud detection
- Can be upgraded to hard enforcement

---

## Rate Limiting

Applied to sensitive operations via `checkRateLimit()`:

- Account deletion
- Data export
- Sensitive admin operations

See [security-best-practices.md](../06-operations/security-best-practices.md#rate-limiting) for details.

---

## Testing

### Development
```bash
curl http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"professionalId":"uuid","amount":50000}'
```

### Production
```bash
curl https://your-domain.com/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{"professionalId":"uuid","amount":50000}'
```

---

## Resources

- [Deployment Guide](../05-deployment/deployment-guide.md)
- [Security Best Practices](../06-operations/security-best-practices.md)
- [Database Schema](./database-schema.md)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)

---

**Total Endpoints**: 42

**Last Updated**: January 2025

**Version**: 1.0.0
