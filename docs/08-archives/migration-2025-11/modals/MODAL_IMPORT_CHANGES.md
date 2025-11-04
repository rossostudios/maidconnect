# Modal Import Changes Quick Reference

When replacing the original modals with refactored versions, update imports in consuming components.

---

## Import Changes by Modal

### 1. Reschedule Booking Modal

**Original Import**:
```tsx
import { RescheduleBookingModal } from "@/components/bookings/reschedule-booking-modal";
```

**Refactored Import** (after moving from `/refactored`):
```tsx
import { RescheduleBookingModal } from "@/components/bookings/reschedule-booking-modal";
// Same path - no import changes needed after file replacement!
```

**Props**: ✅ No changes - fully compatible

---

### 2. Rebook Modal

**Original Import**:
```tsx
import { RebookModal } from "@/components/bookings/rebook-modal";
```

**Refactored Import**:
```tsx
import { RebookModal } from "@/components/bookings/rebook-modal";
// Same path - no import changes needed!
```

**Props**: ✅ No changes - fully compatible

---

### 3. Professional Review Modal

**Original Import**:
```tsx
import { ProfessionalReviewModal } from "@/components/admin/professional-review-modal";
```

**Refactored Import**:
```tsx
import { ProfessionalReviewModal } from "@/components/admin/professional-review-modal";
// Same path - no import changes needed!
```

**Props**: ✅ No changes - fully compatible

---

### 4. Feedback Modal

**Original Import**:
```tsx
import { FeedbackModal } from "@/components/feedback/feedback-modal";
```

**Refactored Import**:
```tsx
import { FeedbackModal } from "@/components/feedback/feedback-modal";
// Same path - no import changes needed!
```

**Props**: ✅ No changes - fully compatible

---

### 5. Changelog Modal

**Original Import**:
```tsx
import { ChangelogModal } from "@/components/changelog/changelog-modal";
```

**Refactored Import**:
```tsx
import { ChangelogModal } from "@/components/changelog/changelog-modal";
// Same path - no import changes needed!
```

**Props**: ✅ No changes - fully compatible

---

### 6. Rating Prompt Modal

**Original Import**:
```tsx
import { RatingPromptModal } from "@/components/reviews/rating-prompt-modal";
```

**Refactored Import**:
```tsx
import { RatingPromptModal } from "@/components/reviews/rating-prompt-modal";
// Same path - no import changes needed!
```

**Props**: ✅ No changes - fully compatible

---

## Deployment Strategy

### Option 1: Direct Replacement (Recommended for Production)

```bash
# For each modal, move refactored version to main location

# Reschedule Booking Modal
mv src/components/bookings/reschedule-booking-modal.tsx src/components/bookings/reschedule-booking-modal.backup.tsx
mv src/components/bookings/refactored/reschedule-booking-modal.tsx src/components/bookings/reschedule-booking-modal.tsx

# Rebook Modal
mv src/components/bookings/rebook-modal.tsx src/components/bookings/rebook-modal.backup.tsx
mv src/components/bookings/refactored/rebook-modal.tsx src/components/bookings/rebook-modal.tsx

# Professional Review Modal
mv src/components/admin/professional-review-modal.tsx src/components/admin/professional-review-modal.backup.tsx
mv src/components/admin/refactored/professional-review-modal.tsx src/components/admin/professional-review-modal.tsx

# Feedback Modal
mv src/components/feedback/feedback-modal.tsx src/components/feedback/feedback-modal.backup.tsx
mv src/components/feedback/refactored/feedback-modal.tsx src/components/feedback/feedback-modal.tsx

# Changelog Modal
mv src/components/changelog/changelog-modal.tsx src/components/changelog/changelog-modal.backup.tsx
mv src/components/changelog/refactored/changelog-modal.tsx src/components/changelog/changelog-modal.tsx

# Rating Prompt Modal
mv src/components/reviews/rating-prompt-modal.tsx src/components/reviews/rating-prompt-modal.backup.tsx
mv src/components/reviews/refactored/rating-prompt-modal.tsx src/components/reviews/rating-prompt-modal.tsx

# Clean up refactored directories
rm -rf src/components/bookings/refactored
rm -rf src/components/admin/refactored
rm -rf src/components/feedback/refactored
rm -rf src/components/changelog/refactored
rm -rf src/components/reviews/refactored
```

**Benefits**:
- ✅ Zero import changes needed
- ✅ Drop-in replacement
- ✅ Easy to rollback (keep .backup files temporarily)
- ✅ No downstream changes required

### Option 2: Temporary Coexistence (For Testing)

Keep both versions and update imports gradually:

```tsx
// Old import
import { RescheduleBookingModal } from "@/components/bookings/reschedule-booking-modal";

// New import (while testing)
import { RescheduleBookingModal } from "@/components/bookings/refactored/reschedule-booking-modal";
```

Then switch back to Option 1 once testing is complete.

---

## Verification After Deployment

### 1. Check for Import Errors

```bash
# Search for any broken imports
grep -r "from.*refactored" src/
```

Should return nothing if all imports updated correctly.

### 2. TypeScript Check

```bash
npm run type-check
# or
pnpm type-check
```

Should pass with no errors.

### 3. Build Check

```bash
npm run build
# or
pnpm build
```

Should build successfully.

---

## Consuming Components to Check

These files likely import the modals (search to verify):

### Reschedule Booking Modal
- Booking detail pages
- Customer dashboard
- Booking management screens

**Find usage**:
```bash
grep -r "RescheduleBookingModal" src/ --include="*.tsx" --include="*.ts"
```

### Rebook Modal
- Booking history
- Customer dashboard
- Completed bookings list

**Find usage**:
```bash
grep -r "RebookModal" src/ --include="*.tsx" --include="*.ts"
```

### Professional Review Modal
- Admin dashboard
- Professional approval queue
- Review management

**Find usage**:
```bash
grep -r "ProfessionalReviewModal" src/ --include="*.tsx" --include="*.ts"
```

### Feedback Modal
- Header/navigation
- Help sections
- Settings pages

**Find usage**:
```bash
grep -r "FeedbackModal" src/ --include="*.tsx" --include="*.ts"
```

### Changelog Modal
- Dashboard
- App layout
- Notification system

**Find usage**:
```bash
grep -r "ChangelogModal" src/ --include="*.tsx" --include="*.ts"
```

### Rating Prompt Modal
- Booking completion flow
- Professional dashboard
- Review management

**Find usage**:
```bash
grep -r "RatingPromptModal" src/ --include="*.tsx" --include="*.ts"
```

---

## Rollback Plan

If issues are discovered after deployment:

### Quick Rollback (Per Modal)

```bash
# Example: Rollback reschedule modal
mv src/components/bookings/reschedule-booking-modal.tsx src/components/bookings/reschedule-booking-modal.new.tsx
mv src/components/bookings/reschedule-booking-modal.backup.tsx src/components/bookings/reschedule-booking-modal.tsx
```

### Full Rollback (All Modals)

```bash
# Restore all backups
for file in src/components/**/*.backup.tsx; do
  original="${file%.backup.tsx}.tsx"
  mv "$original" "${original%.tsx}.new.tsx"
  mv "$file" "$original"
done
```

---

## Post-Deployment Cleanup

After confirming everything works (recommend 1-2 weeks):

```bash
# Remove backup files
find src/components -name "*.backup.tsx" -delete

# Remove .new files if rollback wasn't needed
find src/components -name "*.new.tsx" -delete
```

---

## Testing Checklist

Before marking deployment complete, test each modal:

### Reschedule Booking Modal
- [ ] Opens correctly
- [ ] Displays current booking info
- [ ] Date/time inputs work
- [ ] Validation works (future date check)
- [ ] Submit button works
- [ ] Success message displays
- [ ] Modal closes after success
- [ ] Error handling works
- [ ] Escape key closes modal

### Rebook Modal
- [ ] Opens correctly
- [ ] Shows service details
- [ ] Pre-fills suggested date
- [ ] DateTime picker works
- [ ] End time calculates correctly
- [ ] Submit creates new booking
- [ ] Navigates to bookings page
- [ ] Error handling works

### Professional Review Modal
- [ ] Opens correctly
- [ ] Displays professional info
- [ ] Action buttons toggle correctly
- [ ] Checkboxes work
- [ ] Text areas work
- [ ] Rejection reason required for reject
- [ ] Submit button works
- [ ] Success callback fires
- [ ] Error handling works

### Feedback Modal
- [ ] Opens correctly
- [ ] Type selection works
- [ ] All input fields work
- [ ] Character counter updates
- [ ] Validation works (min 10 chars)
- [ ] Consent checkbox required
- [ ] Submit button works
- [ ] Success state shows
- [ ] Auto-closes after success

### Changelog Modal
- [ ] Opens correctly
- [ ] Displays changelog content
- [ ] HTML renders correctly
- [ ] Images load
- [ ] Categories display
- [ ] Mark as read works
- [ ] View all button navigates
- [ ] Modal closes correctly

### Rating Prompt Modal
- [ ] Opens correctly
- [ ] Star ratings work
- [ ] Hover effects work
- [ ] Category ratings work
- [ ] Text inputs work
- [ ] Validation works (rating required)
- [ ] Submit button works
- [ ] Success message shows
- [ ] Modal closes after success

---

## Summary

✅ **Zero Breaking Changes**: All refactored modals use the same exports and prop signatures
✅ **Drop-in Replacement**: Simply move files to replace originals
✅ **Easy Rollback**: Keep backups for safety
✅ **No Import Changes**: Same paths maintain compatibility

**Deployment Confidence**: HIGH - All refactored modals are fully compatible with existing code.

---

Last updated: 2025-11-03
