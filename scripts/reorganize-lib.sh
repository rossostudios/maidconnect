#!/bin/bash

# MaidConnect - Lib Folder Reorganization Script
# This script safely reorganizes src/lib/ into a more maintainable structure

set -e

echo "🔄 Starting lib folder reorganization..."

# Create new directory structure
echo "📁 Creating new directory structure..."

mkdir -p src/lib/services/{account,admin,analytics,bookings,feedback,notifications,reviews,roadmap,search}
mkdir -p src/lib/repositories/{professionals,bookings,users}
mkdir -p src/lib/integrations
mkdir -p src/lib/utils/{admin,analytics,bookings,calendar,matching,onboarding,professionals,roadmap}
mkdir -p src/lib/shared/{api,auth,config,validations}

# Move services (business logic)
echo "📦 Moving service files..."

# Account services
[ -f src/lib/account/data-export-service.ts ] && mv src/lib/account/data-export-service.ts src/lib/services/account/

# Admin services
[ -f src/lib/admin/background-checks-service.ts ] && mv src/lib/admin/background-checks-service.ts src/lib/services/admin/
[ -f src/lib/admin/professional-queue-helpers.ts ] && mv src/lib/admin/professional-queue-helpers.ts src/lib/services/admin/
[ -f src/lib/admin/professional-review-service.ts ] && mv src/lib/admin/professional-review-service.ts src/lib/services/admin/
[ -f src/lib/admin/user-details-service.ts ] && mv src/lib/admin/user-details-service.ts src/lib/services/admin/
[ -f src/lib/admin/user-management-service.ts ] && mv src/lib/admin/user-management-service.ts src/lib/services/admin/

# Analytics services
[ -f src/lib/analytics/analytics-calculations.ts ] && mv src/lib/analytics/analytics-calculations.ts src/lib/services/analytics/

# Booking services
[ -f src/lib/bookings/addon-service.ts ] && mv src/lib/bookings/addon-service.ts src/lib/services/bookings/
[ -f src/lib/bookings/booking-creation-service.ts ] && mv src/lib/bookings/booking-creation-service.ts src/lib/services/bookings/
[ -f src/lib/bookings/booking-workflow-service.ts ] && mv src/lib/bookings/booking-workflow-service.ts src/lib/services/bookings/
[ -f src/lib/bookings/cancellation-service.ts ] && mv src/lib/bookings/cancellation-service.ts src/lib/services/bookings/
[ -f src/lib/bookings/check-out-service.ts ] && mv src/lib/bookings/check-out-service.ts src/lib/services/bookings/
[ -f src/lib/bookings/pricing-service.ts ] && mv src/lib/bookings/pricing-service.ts src/lib/services/bookings/

# Feedback services
[ -f src/lib/feedback/feedback-admin-service.ts ] && mv src/lib/feedback/feedback-admin-service.ts src/lib/services/feedback/
[ -f src/lib/feedback/feedback-submission-service.ts ] && mv src/lib/feedback/feedback-submission-service.ts src/lib/services/feedback/

# Notification services
[ -f src/lib/notifications/arrival-alert-service.ts ] && mv src/lib/notifications/arrival-alert-service.ts src/lib/services/notifications/
[ -f src/lib/notifications/notification-send-service.ts ] && mv src/lib/notifications/notification-send-service.ts src/lib/services/notifications/

# Review services
[ -f src/lib/reviews/review-validation-service.ts ] && mv src/lib/reviews/review-validation-service.ts src/lib/services/reviews/

# Roadmap services
[ -f src/lib/roadmap/roadmap-list-service.ts ] && mv src/lib/roadmap/roadmap-list-service.ts src/lib/services/roadmap/

# Search services
[ -f src/lib/search/sanity-search-service.ts ] && mv src/lib/search/sanity-search-service.ts src/lib/services/search/

# Move repositories (data access)
echo "📊 Moving repository files..."
[ -f src/lib/professionals/queries.ts ] && mv src/lib/professionals/queries.ts src/lib/repositories/professionals/

# Move integrations (external services)
echo "🔌 Moving integration files..."
[ -d src/lib/amara ] && mv src/lib/amara src/lib/integrations/
[ -d src/lib/background-checks ] && mv src/lib/background-checks src/lib/integrations/
[ -d src/lib/email ] && mv src/lib/email src/lib/integrations/
[ -d src/lib/sanity ] && mv src/lib/sanity src/lib/integrations/
[ -d src/lib/stripe ] && mv src/lib/stripe src/lib/integrations/
[ -d src/lib/supabase ] && mv src/lib/supabase src/lib/integrations/

# Move utilities (helpers)
echo "🛠️ Moving utility files..."

# Admin utils
[ -f src/lib/admin-helpers.ts ] && mv src/lib/admin-helpers.ts src/lib/utils/admin/
[ -f src/lib/admin-utils.ts ] && mv src/lib/admin-utils.ts src/lib/utils/admin/

# Analytics utils
[ -f src/lib/analytics/metrics-transformer.ts ] && mv src/lib/analytics/metrics-transformer.ts src/lib/utils/analytics/
[ -f src/lib/analytics/track-event.ts ] && mv src/lib/analytics/track-event.ts src/lib/utils/analytics/

# Booking utils
[ -f src/lib/booking-utils.ts ] && mv src/lib/booking-utils.ts src/lib/utils/bookings/
[ -f src/lib/bookings/booking-field-mapper.ts ] && mv src/lib/bookings/booking-field-mapper.ts src/lib/utils/bookings/
[ -f src/lib/bookings/booking-insert-builder.ts ] && mv src/lib/bookings/booking-insert-builder.ts src/lib/utils/bookings/

# Calendar utils
[ -f src/lib/calendar/calendar-health-calculator.ts ] && mv src/lib/calendar/calendar-health-calculator.ts src/lib/utils/calendar/

# Other utils
[ -f src/lib/availability.ts ] && mv src/lib/availability.ts src/lib/utils/
[ -f src/lib/block-editor-utils.ts ] && mv src/lib/block-editor-utils.ts src/lib/utils/
[ -f src/lib/cancellation-policy.ts ] && mv src/lib/cancellation-policy.ts src/lib/utils/
[ -f src/lib/format.ts ] && mv src/lib/format.ts src/lib/utils/
[ -f src/lib/gps-verification.ts ] && mv src/lib/gps-verification.ts src/lib/utils/
[ -f src/lib/guest-checkout.ts ] && mv src/lib/guest-checkout.ts src/lib/utils/
[ -f src/lib/keyboard-shortcuts.ts ] && mv src/lib/keyboard-shortcuts.ts src/lib/utils/
[ -f src/lib/messaging-utils.ts ] && mv src/lib/messaging-utils.ts src/lib/utils/
[ -f src/lib/payout-calculator.ts ] && mv src/lib/payout-calculator.ts src/lib/utils/
[ -f src/lib/sanitize.ts ] && mv src/lib/sanitize.ts src/lib/utils/
[ -f src/lib/subscription-pricing.ts ] && mv src/lib/subscription-pricing.ts src/lib/utils/
[ -f src/lib/toast.ts ] && mv src/lib/toast.ts src/lib/utils/
[ -f src/lib/translation.ts ] && mv src/lib/translation.ts src/lib/utils/
[ -f src/lib/utils.ts ] && mv src/lib/utils.ts src/lib/utils/core.ts

# Matching utils
[ -d src/lib/matching ] && mv src/lib/matching src/lib/utils/

# Onboarding utils
[ -d src/lib/onboarding ] && mv src/lib/onboarding src/lib/utils/

# Professional utils
[ -f src/lib/professionals/mapper-helpers.ts ] && mv src/lib/professionals/mapper-helpers.ts src/lib/utils/professionals/
[ -f src/lib/professionals/transformers.ts ] && mv src/lib/professionals/transformers.ts src/lib/utils/professionals/

# Roadmap utils
[ -f src/lib/roadmap/roadmap-field-mapper.ts ] && mv src/lib/roadmap/roadmap-field-mapper.ts src/lib/utils/roadmap/

# Services utils
[ -d src/lib/services ] && mv src/lib/services/service-field-mapper.ts src/lib/utils/ 2>/dev/null || true

# Move shared (cross-cutting)
echo "🌐 Moving shared files..."
[ -d src/lib/api ] && mv src/lib/api src/lib/shared/
[ -d src/lib/auth ] && mv src/lib/auth src/lib/shared/
[ -d src/lib/validations ] && mv src/lib/validations src/lib/shared/

[ -f src/lib/content.ts ] && mv src/lib/content.ts src/lib/shared/config/
[ -f src/lib/design-system.ts ] && mv src/lib/design-system.ts src/lib/shared/config/
[ -f src/lib/design-tokens.ts ] && mv src/lib/design-tokens.ts src/lib/shared/config/
[ -f src/lib/error-handler.ts ] && mv src/lib/error-handler.ts src/lib/shared/
[ -f src/lib/errors.ts ] && mv src/lib/errors.ts src/lib/shared/
[ -f src/lib/expo-push.ts ] && mv src/lib/expo-push.ts src/lib/shared/
[ -f src/lib/feature-flags.ts ] && mv src/lib/feature-flags.ts src/lib/shared/config/
[ -f src/lib/logger.ts ] && mv src/lib/logger.ts src/lib/shared/
[ -f src/lib/monitoring.ts ] && mv src/lib/monitoring.ts src/lib/shared/
[ -f src/lib/motion.ts ] && mv src/lib/motion.ts src/lib/shared/config/
[ -f src/lib/notifications.ts ] && mv src/lib/notifications.ts src/lib/shared/
[ -f src/lib/rate-limit.ts ] && mv src/lib/rate-limit.ts src/lib/shared/
[ -f src/lib/web-vitals.ts ] && mv src/lib/web-vitals.ts src/lib/shared/

# Move design-system folder
[ -d src/lib/design-system ] && mv src/lib/design-system src/lib/shared/config/

# Clean up empty directories
echo "🧹 Cleaning up empty directories..."
find src/lib -type d -empty -delete 2>/dev/null || true

# Remove old directory structure (if empty)
rmdir src/lib/account 2>/dev/null || true
rmdir src/lib/admin 2>/dev/null || true
rmdir src/lib/analytics 2>/dev/null || true
rmdir src/lib/bookings 2>/dev/null || true
rmdir src/lib/calendar 2>/dev/null || true
rmdir src/lib/feedback 2>/dev/null || true
rmdir src/lib/notifications 2>/dev/null || true
rmdir src/lib/professionals 2>/dev/null || true
rmdir src/lib/reviews 2>/dev/null || true
rmdir src/lib/roadmap 2>/dev/null || true
rmdir src/lib/search 2>/dev/null || true
rmdir src/lib/services 2>/dev/null || true
rmdir src/lib/stats 2>/dev/null || true

echo "✅ Reorganization complete!"
echo ""
echo "📊 New structure:"
echo "   src/lib/services/      - Business logic"
echo "   src/lib/repositories/  - Data access"
echo "   src/lib/integrations/  - External services"
echo "   src/lib/utils/         - Helper functions"
echo "   src/lib/shared/        - Cross-cutting concerns"
echo ""
echo "⚠️  Next steps:"
echo "   1. Run: bun run check (fix import paths)"
echo "   2. Update imports in consuming files"
echo "   3. Test build: bun run build"
