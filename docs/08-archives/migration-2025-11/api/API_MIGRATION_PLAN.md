# API Routes Migration Plan

## Overview

This document outlines the migration plan for refactoring 68+ API routes to use the new middleware system. The migration will reduce code duplication by ~3,600 lines and standardize error handling, authentication, and response formatting.

## Migration Strategy

### Phase 1: Foundation (Completed)

- [x] Create `/src/lib/api/auth.ts` - Authentication utilities
- [x] Create `/src/lib/api/response.ts` - Response helpers
- [x] Create `/src/lib/api/middleware.ts` - Middleware functions
- [x] Create `/src/lib/api/index.ts` - Unified exports
- [x] Create proof-of-concept refactored routes (5 routes)
- [x] Create comprehensive documentation

### Phase 2: Booking Routes (Priority 1)

**Estimated effort:** 2-3 hours
**Impact:** High - Most critical user-facing routes

- [ ] `/api/bookings/accept` - Professional accepts booking
- [ ] `/api/bookings/authorize` - Authorize payment for booking
- [ ] `/api/bookings/cancel` - Customer cancels booking
- [ ] `/api/bookings/check-in` - Professional checks in
- [ ] `/api/bookings/check-out` - Professional checks out
- [ ] `/api/bookings/decline` - Professional declines booking
- [ ] `/api/bookings/disputes` - Handle booking disputes
- [ ] `/api/bookings/extend-time` - Extend booking time
- [ ] `/api/bookings/rebook` - Rebook a service
- [ ] `/api/bookings/reschedule` - Reschedule booking
- [ ] `/api/bookings/recurring` - Manage recurring bookings
- [ ] `/api/bookings/route` - Get bookings list

**Common patterns:**
- All require authentication
- All need ownership verification (professional or customer)
- All have similar error handling
- All return structured booking data

### Phase 3: Professional Routes (Priority 2)

**Estimated effort:** 2-3 hours
**Impact:** High - Professional management features

- [ ] `/api/professional/addons` - Manage add-on services
- [ ] `/api/professional/addons/[id]` - Update/delete specific addon
- [ ] `/api/professional/availability` - Manage availability schedule
- [ ] `/api/professional/portfolio` - Manage portfolio items
- [ ] `/api/professional/portfolio/upload` - Upload portfolio images
- [ ] `/api/professional/profile` - Get/update profile
- [ ] `/api/professionals/[id]/addons` - Get professional's addons
- [ ] `/api/professionals/[id]/availability` - Get professional's availability
- [ ] `/api/professionals/search` - Search professionals

**Common patterns:**
- Professional routes require `withProfessional` middleware
- Public viewing routes use `getOptionalAuth`
- All need professional profile verification
- All have CRUD operations

### Phase 4: Customer Routes (Priority 2)

**Estimated effort:** 1-2 hours
**Impact:** Medium - Customer-specific features

- [ ] `/api/customer/addresses` - Manage customer addresses
- [ ] `/api/customer/favorites` - Manage favorite professionals

**Common patterns:**
- All require `withCustomer` middleware
- All need customer profile verification
- Simple CRUD operations

### Phase 5: Admin Routes (Priority 3)

**Estimated effort:** 2-3 hours
**Impact:** Medium - Admin management features

- [ ] `/api/admin/changelog` - Manage changelog entries
- [ ] `/api/admin/changelog/[id]` - Update/delete changelog
- [ ] `/api/admin/changelog/create` - Create changelog
- [ ] `/api/admin/changelog/list` - List changelogs
- [ ] `/api/admin/feedback/[id]` - Manage feedback
- [ ] `/api/admin/payouts/process` - Process payouts
- [ ] `/api/admin/professionals/queue` - Review queue
- [ ] `/api/admin/professionals/review` - Review professionals
- [ ] `/api/admin/roadmap` - Manage roadmap
- [ ] `/api/admin/roadmap/[id]` - Update/delete roadmap item
- [ ] `/api/admin/roadmap/list` - List roadmap items
- [ ] `/api/admin/users` - Manage users
- [ ] `/api/admin/users/moderate` - User moderation

**Common patterns:**
- All require `withAdmin` middleware
- Many involve data management operations
- Some have complex business logic

### Phase 6: Notification & Messaging Routes (Priority 2)

**Estimated effort:** 2 hours
**Impact:** Medium - Communication features

- [ ] `/api/messages/conversations` - List conversations
- [ ] `/api/messages/conversations/[id]` - Get conversation
- [ ] `/api/messages/conversations/[id]/read` - Mark as read
- [ ] `/api/messages/translate` - Translate message
- [ ] `/api/messages/unread-count` - Get unread count
- [ ] `/api/notifications/arrival-alert` - Send arrival alert
- [ ] `/api/notifications/history` - Get notification history
- [ ] `/api/notifications/mark-read` - Mark notifications as read
- [ ] `/api/notifications/send` - Send notification
- [ ] `/api/notifications/subscribe` - Subscribe to push
- [ ] `/api/notifications/unread-count` - Get unread count

**Common patterns:**
- All require authentication
- Many have user-specific filtering
- Real-time updates

### Phase 7: Payment Routes (Priority 1)

**Estimated effort:** 2 hours
**Impact:** High - Critical payment functionality

- [ ] `/api/payments/capture-intent` - Capture payment
- [ ] `/api/payments/create-intent` - Create payment intent
- [ ] `/api/payments/process-tip` - Process tip payment
- [ ] `/api/payments/void-intent` - Void payment intent
- [ ] `/api/pro/payouts/pending` - Get pending payouts
- [ ] `/api/pro/stripe/connect` - Stripe Connect onboarding
- [ ] `/api/pro/stripe/connect-status` - Check Connect status

**Common patterns:**
- Complex error handling for Stripe
- Transaction safety critical
- Ownership verification essential

### Phase 8: Account & Misc Routes (Priority 3)

**Estimated effort:** 2 hours
**Impact:** Low-Medium - Various features

- [ ] `/api/account/delete` - Delete account
- [ ] `/api/account/export-data` - Export user data
- [ ] `/api/amara/chat` - Amara AI chat
- [ ] `/api/amara/feedback` - Amara feedback
- [ ] `/api/changelog/latest` - Get latest changelog
- [ ] `/api/changelog/list` - List changelogs
- [ ] `/api/changelog/mark-read` - Mark changelog as read
- [ ] `/api/feedback` - Submit feedback
- [ ] `/api/feedback/[id]` - Manage feedback
- [ ] `/api/feedback/admin/list` - Admin feedback list
- [ ] `/api/pricing/plans` - Get pricing plans
- [ ] `/api/referrals/generate-code` - Generate referral code
- [ ] `/api/roadmap/[slug]` - Get roadmap item
- [ ] `/api/roadmap/list` - List roadmap items
- [ ] `/api/roadmap/vote` - Vote on roadmap item
- [ ] `/api/stats/platform` - Platform statistics

**Common patterns:**
- Mix of public and authenticated routes
- Various permission levels
- Some read-only, some CRUD

### Phase 9: Cron & Webhooks (Priority 4)

**Estimated effort:** 1 hour
**Impact:** Low - Background tasks

- [ ] `/api/cron/auto-decline-bookings` - Auto-decline expired bookings
- [ ] `/api/cron/process-payouts` - Process scheduled payouts
- [ ] `/api/webhooks/stripe` - Stripe webhook handler

**Common patterns:**
- Special authentication (API keys, webhook signatures)
- May need custom middleware
- Critical error handling

---

## Migration Process

### For Each Route:

1. **Analyze Current Implementation** (5 min)
   - Identify auth pattern
   - Identify ownership checks
   - Identify error handling
   - Note business logic complexity

2. **Create Refactored Version** (15-30 min)
   - Import utilities from `@/lib/api`
   - Replace auth with appropriate middleware
   - Replace ownership checks with helpers
   - Add Zod validation
   - Replace response formatting
   - Remove try-catch blocks

3. **Test Thoroughly** (10-15 min)
   - Test happy path
   - Test authentication failures
   - Test authorization failures
   - Test validation errors
   - Test edge cases

4. **Deploy** (2 min)
   - Replace original file with refactored version
   - Keep backup for 1 sprint
   - Monitor error logs

5. **Document** (2 min)
   - Add to migration tracker
   - Note any issues or gotchas

### Total time per route: 30-50 minutes

---

## Risk Mitigation

### Testing Strategy

1. **Unit Tests** (If applicable)
   - Test middleware functions
   - Test auth helpers
   - Test response helpers

2. **Integration Tests**
   - Test each migrated route
   - Test error scenarios
   - Test edge cases

3. **Manual Testing**
   - Smoke test each route after migration
   - Test in development environment first
   - Monitor production logs after deployment

### Rollback Plan

If issues arise:

1. Keep original files as `.original.ts` for 1 sprint
2. Can quickly revert by renaming files
3. Monitor error logs closely after each phase
4. Deploy phases during low-traffic periods

### Common Pitfalls

1. **Missing await** on auth helpers
   ```typescript
   // Bad
   const { user, supabase } = requireAuth(request);

   // Good
   const { user, supabase } = await requireAuth(request);
   ```

2. **Not throwing errors**
   ```typescript
   // Bad
   return badRequest("Invalid input");

   // Good
   throw new ValidationError("Invalid input");
   ```

3. **Wrong middleware for route**
   ```typescript
   // Bad - customer trying to accept booking
   export const POST = withCustomer(async ({ user, supabase }, request) => {
     const booking = await requireProfessionalOwnership(supabase, user.id, bookingId);
   });

   // Good
   export const POST = withProfessional(async ({ user, supabase }, request) => {
     const booking = await requireProfessionalOwnership(supabase, user.id, bookingId);
   });
   ```

---

## Progress Tracking

### Summary

- **Total routes:** 68
- **Migrated:** 0 (5 proof-of-concept)
- **Remaining:** 68
- **Estimated total effort:** 20-30 hours
- **Expected completion:** 2-3 weeks (with testing)

### By Phase

| Phase | Routes | Status | Priority | Estimated Hours |
|-------|--------|--------|----------|-----------------|
| 1. Foundation | - | ✅ Complete | - | - |
| 2. Booking | 12 | 🔴 Not Started | P1 | 2-3h |
| 3. Professional | 9 | 🔴 Not Started | P2 | 2-3h |
| 4. Customer | 2 | 🔴 Not Started | P2 | 1-2h |
| 5. Admin | 13 | 🔴 Not Started | P3 | 2-3h |
| 6. Notification/Messaging | 11 | 🔴 Not Started | P2 | 2h |
| 7. Payment | 7 | 🔴 Not Started | P1 | 2h |
| 8. Account/Misc | 16 | 🔴 Not Started | P3 | 2h |
| 9. Cron/Webhooks | 3 | 🔴 Not Started | P4 | 1h |

---

## Post-Migration Tasks

After all routes are migrated:

1. **Cleanup**
   - [ ] Remove all `.original.ts` backup files
   - [ ] Remove unused imports
   - [ ] Update any related documentation

2. **Performance Analysis**
   - [ ] Measure response times before/after
   - [ ] Check bundle size impact
   - [ ] Analyze error rates

3. **Documentation**
   - [ ] Update API documentation
   - [ ] Create video walkthrough for team
   - [ ] Update onboarding docs for new developers

4. **Future Enhancements**
   - [ ] Implement rate limiting middleware
   - [ ] Add request/response logging
   - [ ] Add performance monitoring
   - [ ] Generate OpenAPI/Swagger docs automatically

---

## Team Assignments (Suggested)

### Week 1
- **Developer A:** Phase 2 (Booking routes) - P1
- **Developer B:** Phase 7 (Payment routes) - P1

### Week 2
- **Developer A:** Phase 3 (Professional routes) - P2
- **Developer B:** Phase 6 (Notification/Messaging routes) - P2

### Week 3
- **Developer A:** Phase 4 (Customer routes) + Phase 8 (Account/Misc) - P2/P3
- **Developer B:** Phase 5 (Admin routes) - P3

### Week 4
- **Developer A:** Phase 9 (Cron/Webhooks) - P4
- **Developer B:** Testing & Documentation

---

## Success Metrics

### Code Quality
- **Target:** 45-50% line reduction per route
- **Target:** 0 duplicated auth/error handling code
- **Target:** 100% routes use typed errors

### Reliability
- **Target:** No increase in error rates
- **Target:** Same or better response times
- **Target:** 100% test coverage on middleware

### Developer Experience
- **Target:** 50% faster to write new routes
- **Target:** Easier onboarding for new developers
- **Target:** Consistent patterns across all routes

---

## Questions & Answers

### Q: What if a route has unique requirements?

**A:** The middleware system is flexible. You can:
- Use `withAuth` and add custom checks
- Create custom middleware for that route
- Use the helper functions standalone without middleware

### Q: Do we need to migrate all routes at once?

**A:** No! The new system works alongside existing routes. Migrate incrementally, testing each phase thoroughly.

### Q: What about backward compatibility?

**A:** The response format remains the same:
```json
{
  "success": true,
  "data": { ... }
}
```

Clients won't need any changes.

### Q: How do we handle route-specific context?

**A:** Pass context to middleware:
```typescript
export const POST = withAuth(
  async ({ user, supabase }, request) => { ... },
  { routeName: "acceptBooking", version: "v1" }
);
```

---

## Resources

- [API Middleware Guide](./API_MIDDLEWARE_GUIDE.md) - Complete reference
- [Proof-of-Concept Examples](../src/app/api/**/route.refactored.ts) - Working examples
- [Error Classes](../src/lib/errors.ts) - All error types
- [Zod Documentation](https://zod.dev/) - Validation schemas

---

## Support

For questions during migration:
- Slack: #backend-help
- Email: backend-team@example.com
- This document: Keep updated as we learn

---

**Last Updated:** 2025-11-03
**Status:** Ready for Phase 2 implementation
