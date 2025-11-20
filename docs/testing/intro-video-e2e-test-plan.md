# Intro Video Feature - E2E Testing Guide

**Status**: Ready for testing
**Created**: 2025-11-20
**Feature**: Professional Intro Videos (Phase 2.1-2.3)

---

## Overview

This guide covers end-to-end testing of the professional intro video feature, including:
- Professional video upload workflow
- Admin review and approval workflow
- Customer video viewing experience

---

## Prerequisites

### Required Test Accounts

1. **Professional Account**
   - Role: `professional`
   - Access: `/dashboard/pro/profile`
   - Purpose: Test video upload

2. **Admin Account**
   - Role: `admin`
   - Access: `/admin/intro-videos`
   - Purpose: Test video review/approval

3. **Customer Account** (Optional)
   - Role: `customer`
   - Access: `/professionals` and `/professionals/[id]`
   - Purpose: Test video viewing

### Required Test Assets

1. **Valid Video File**
   - Format: MP4, WebM, QuickTime, AVI, or MKV
   - Size: Under 100MB
   - Duration: 15-90 seconds (ideal: 30-60 seconds)
   - Content: Professional introduction

2. **Invalid Test Files** (for error validation)
   - Over 100MB video file
   - Wrong format (e.g., .txt, .jpg)
   - Too short (<5 seconds)
   - Too long (>90 seconds)

---

## Phase 2.1: Professional Upload Workflow

### Test Environment Setup

```bash
# Start development server
bun run dev

# Server runs on http://localhost:3000
```

### Test Cases

#### TC-1.1: Access Upload Interface

**Steps:**
1. Log in as professional
2. Navigate to `/dashboard/pro/profile`
3. Scroll to "Intro Video" section

**Expected Results:**
- ✅ Intro Video section is visible
- ✅ Upload interface shows current status ("No video uploaded" or existing video status)
- ✅ Upload button or form is accessible

---

#### TC-1.2: Upload Valid Video

**Steps:**
1. Click "Upload Video" or similar button
2. Select valid video file (MP4, <100MB, 30-60 seconds)
3. Wait for upload progress

**Expected Results:**
- ✅ File validation passes immediately
- ✅ Upload progress indicator appears
- ✅ Success message displays: "Video uploaded successfully. Pending admin review."
- ✅ Video status changes to "Pending Review"
- ✅ Upload form is hidden or disabled during processing

**Database Verification:**
```sql
-- Check professional_profiles table
SELECT
  profile_id,
  intro_video_path,
  intro_video_status,
  intro_video_duration_seconds,
  intro_video_uploaded_at
FROM professional_profiles
WHERE profile_id = '[YOUR_PROFESSIONAL_ID]';

-- Expected:
-- intro_video_status = 'pending_review'
-- intro_video_path = '[user_id]/[timestamp].[ext]'
-- intro_video_uploaded_at = recent timestamp
```

**PostHog Verification:**
- Event: `videoEvents.uploaded`
- Properties:
  - `professionalId`: Professional's user ID
  - `country_code`: Professional's country (CO/PY/UY/AR)
  - `role`: "professional"
  - `videoPath`: Storage path
  - `durationSeconds`: Video duration

---

#### TC-1.3: Validation - File Too Large

**Steps:**
1. Attempt to upload video file > 100MB

**Expected Results:**
- ✅ Error message: "File too large. Maximum size: 100MB"
- ✅ Upload blocked before API call
- ✅ No changes to database

---

#### TC-1.4: Validation - Invalid File Type

**Steps:**
1. Attempt to upload non-video file (e.g., .txt, .jpg)

**Expected Results:**
- ✅ Error message: "Invalid file type. Allowed types: video/mp4, video/webm, video/quicktime, video/x-msvideo, video/x-matroska"
- ✅ Upload blocked before API call
- ✅ No changes to database

---

#### TC-1.5: Validation - Video Too Long

**Steps:**
1. Attempt to upload video > 90 seconds

**Expected Results:**
- ✅ Error message: "Video too long. Maximum duration: 90 seconds"
- ✅ Upload blocked after client-side duration check
- ✅ No changes to database

---

#### TC-1.6: View Pending Status

**Steps:**
1. After successful upload, refresh page
2. Navigate back to `/dashboard/pro/profile`

**Expected Results:**
- ✅ Status badge shows "Pending Review"
- ✅ Upload form is disabled or shows "Video pending review"
- ✅ Professional cannot upload another video while one is pending

---

## Phase 2.2: Admin Review Workflow

### Test Cases

#### TC-2.1: Access Review Queue

**Steps:**
1. Log in as admin
2. Navigate to `/admin/intro-videos`

**Expected Results:**
- ✅ Page displays three sections: Pending Review, Approved, Rejected
- ✅ Stats cards show correct counts
- ✅ Pending section includes recently uploaded video (from TC-1.2)
- ✅ Professional name, country, services, duration, and upload date are visible

---

#### TC-2.2: Access Review Detail Page

**Steps:**
1. From review queue, click "Review" button on pending video
2. Navigate to `/admin/intro-videos/[professionalId]`

**Expected Results:**
- ✅ Page displays professional details
- ✅ Video player area is present (may show placeholder)
- ✅ Quality guidelines are visible
- ✅ "Approve Video" and "Reject Video" buttons are enabled

**⚠️ Known Issue**: Video player shows placeholder. Admin must manually fetch signed URL from Supabase Storage to watch video.

**Manual Playback Workaround:**
```sql
-- Get video path from database
SELECT intro_video_path FROM professional_profiles
WHERE profile_id = '[professionalId]';

-- Then construct URL:
-- https://[project].supabase.co/storage/v1/object/public/intro-videos/[intro_video_path]
```

---

#### TC-2.3: Approve Video

**Steps:**
1. On review detail page, click "Approve Video"
2. Wait for confirmation

**Expected Results:**
- ✅ Success confirmation
- ✅ Redirect to `/admin/intro-videos`
- ✅ Video moves from "Pending" to "Approved" section
- ✅ Badge shows green "Approved" status

**Database Verification:**
```sql
SELECT
  intro_video_status,
  intro_video_reviewed_at,
  intro_video_reviewed_by,
  intro_video_rejection_reason
FROM professional_profiles
WHERE profile_id = '[professionalId]';

-- Expected:
-- intro_video_status = 'approved'
-- intro_video_reviewed_at = recent timestamp
-- intro_video_reviewed_by = admin user ID
-- intro_video_rejection_reason = NULL
```

**PostHog Verification:**
- Event: `videoEvents.approved`
- Properties:
  - `professionalId`
  - `reviewedBy`: Admin's user ID
  - `reviewTimeMinutes`: Time between upload and approval
  - `country_code`
  - `role`: "admin"

---

#### TC-2.4: Reject Video

**Steps:**
1. On review detail page, click "Reject Video"
2. Rejection form appears
3. Enter rejection reason: "Background noise is too loud, please re-record in a quiet environment"
4. Click "Confirm Rejection"

**Expected Results:**
- ✅ Success confirmation
- ✅ Redirect to `/admin/intro-videos`
- ✅ Video moves from "Pending" to "Rejected" section
- ✅ Badge shows red "Rejected" status

**Database Verification:**
```sql
SELECT
  intro_video_status,
  intro_video_reviewed_at,
  intro_video_reviewed_by,
  intro_video_rejection_reason
FROM professional_profiles
WHERE profile_id = '[professionalId]';

-- Expected:
-- intro_video_status = 'rejected'
-- intro_video_reviewed_at = recent timestamp
-- intro_video_reviewed_by = admin user ID
-- intro_video_rejection_reason = rejection text
```

**PostHog Verification:**
- Event: `videoEvents.rejected`
- Properties:
  - `professionalId`
  - `reviewedBy`: Admin's user ID
  - `rejectionReason`: Entered text
  - `reviewTimeMinutes`
  - `country_code`
  - `role`: "admin"

---

#### TC-2.5: Professional Receives Rejection Feedback

**Steps:**
1. Log back in as professional (whose video was rejected)
2. Navigate to `/dashboard/pro/profile`
3. View Intro Video section

**Expected Results:**
- ✅ Status badge shows "Rejected"
- ✅ Rejection reason is displayed
- ✅ Professional can upload a new video

---

## Phase 2.3: Customer Viewing Experience

### Test Cases

#### TC-3.1: Video Badge on Search Results

**Steps:**
1. Approve at least one professional's intro video (as admin)
2. Log in as customer (or browse anonymously)
3. Navigate to `/professionals` (search/directory page)
4. Locate professional with approved video

**Expected Results:**
- ✅ Professional card shows orange "Intro video" badge
- ✅ Badge uses Lia Design System styling:
  - Background: `bg-orange-50`
  - Border: `border-orange-200`
  - Text: `text-orange-600`
  - Border radius: `rounded-lg`
- ✅ Badge includes video icon
- ✅ Badge only appears for professionals with `intro_video_status = 'approved'`

**Badge Verification (Spanish):**
- Switch language to Spanish
- Badge text changes to "Video de presentación"

---

#### TC-3.2: Video Player on Professional Detail Page

**Steps:**
1. From search results, click on professional with approved intro video
2. Navigate to `/professionals/[professionalId]`
3. Scroll to intro video section

**Expected Results:**
- ✅ Video player section is visible
- ✅ Video loads automatically (fetches signed URL)
- ✅ Video controls are functional (play, pause, volume, fullscreen)
- ✅ Loading spinner appears while fetching signed URL
- ✅ Error message displays if video fetch fails

**PostHog Verification:**
- Event: `videoEvents.viewed`
- Properties:
  - `professionalId`
  - `country_code`
  - `role`: "customer" or "anonymous"

---

#### TC-3.3: Video Only Shows for Approved Status

**Steps:**
1. Browse to professional profile with `intro_video_status = 'pending_review'` or `'rejected'`

**Expected Results:**
- ✅ No video badge on search results
- ✅ No video player on detail page
- ✅ Professional profile displays normally without video

---

## Common Issues and Troubleshooting

### Issue: "Unauthorized" Error on Upload

**Symptoms:**
- API returns 401 Unauthorized
- Video upload fails immediately

**Resolution:**
1. Verify professional is logged in
2. Check session is valid
3. Verify user has `role = 'professional'`

---

### Issue: Video Not Appearing in Admin Queue

**Symptoms:**
- Professional uploaded video successfully
- Admin queue shows 0 pending videos

**Resolution:**
1. Check database:
   ```sql
   SELECT * FROM professional_profiles
   WHERE intro_video_path IS NOT NULL;
   ```
2. Verify `intro_video_status = 'pending_review'`
3. Refresh admin page (hard refresh: Cmd+Shift+R / Ctrl+Shift+F5)

---

### Issue: Video Badge Not Showing on Search Results

**Symptoms:**
- Video approved by admin
- Professional detail page shows video
- Search results don't show badge

**Resolution:**
1. Verify search query includes intro video fields:
   ```typescript
   // In list_active_professionals RPC or search query
   intro_video_path,
   intro_video_status,
   intro_video_duration_seconds
   ```
2. Check professional has `intro_video_status = 'approved'`
3. Hard refresh search page

---

### Issue: "Video Player Placeholder" in Admin Review

**Status:** Known limitation
**Workaround:** Admin must manually construct signed URL to view video before approval

**Future Enhancement:** Integrate video player in admin review detail page

---

## Test Completion Checklist

### Phase 2.1: Professional Upload
- [ ] TC-1.1: Access upload interface ✓
- [ ] TC-1.2: Upload valid video ✓
- [ ] TC-1.3: Validation - file too large ✓
- [ ] TC-1.4: Validation - invalid file type ✓
- [ ] TC-1.5: Validation - video too long ✓
- [ ] TC-1.6: View pending status ✓

### Phase 2.2: Admin Review
- [ ] TC-2.1: Access review queue ✓
- [ ] TC-2.2: Access review detail page ✓
- [ ] TC-2.3: Approve video ✓
- [ ] TC-2.4: Reject video ✓
- [ ] TC-2.5: Professional receives rejection feedback ✓

### Phase 2.3: Customer Viewing
- [ ] TC-3.1: Video badge on search results ✓
- [ ] TC-3.2: Video player on detail page ✓
- [ ] TC-3.3: Video only shows for approved status ✓

---

## PostHog Event Tracking Summary

All events use `videoEvents` namespace:

| Event | Trigger | Required Properties |
|-------|---------|---------------------|
| `videoEvents.uploaded` | Professional uploads video | `professionalId`, `country_code`, `role`, `videoPath`, `durationSeconds` |
| `videoEvents.approved` | Admin approves video | `professionalId`, `reviewedBy`, `reviewTimeMinutes`, `country_code`, `role` |
| `videoEvents.rejected` | Admin rejects video | `professionalId`, `reviewedBy`, `rejectionReason`, `reviewTimeMinutes`, `country_code`, `role` |
| `videoEvents.viewed` | Customer views video | `professionalId`, `country_code`, `role` |

---

## Database Schema Reference

### professional_profiles Table

```sql
-- Intro video fields (Phase 2)
intro_video_path TEXT,                      -- Supabase Storage path
intro_video_status TEXT DEFAULT 'none',     -- 'none' | 'pending_review' | 'approved' | 'rejected'
intro_video_duration_seconds INTEGER,       -- Video length in seconds
intro_video_thumbnail_path TEXT,            -- Thumbnail storage path (future)
intro_video_uploaded_at TIMESTAMPTZ,        -- Upload timestamp
intro_video_reviewed_at TIMESTAMPTZ,        -- Review timestamp
intro_video_reviewed_by UUID,               -- Admin user ID
intro_video_rejection_reason TEXT,          -- Feedback for rejected videos
```

---

## Next Steps

After completing all test cases:

1. **Document Test Results**
   - Create test execution report
   - Note any bugs or issues found
   - Capture screenshots/videos of key workflows

2. **Production Readiness**
   - [ ] All test cases pass
   - [ ] PostHog events tracking correctly
   - [ ] Database migrations applied
   - [ ] Supabase Storage bucket configured
   - [ ] RLS policies verified

3. **Future Enhancements**
   - [ ] Integrate video player in admin review page (replace placeholder)
   - [ ] Thumbnail generation service
   - [ ] Video compression/optimization
   - [ ] Batch approval/rejection for admins
   - [ ] Email notifications for professionals

---

**Testing Contact**: Development Team
**Last Updated**: 2025-11-20
