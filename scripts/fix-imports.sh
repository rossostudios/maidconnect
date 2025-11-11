#!/bin/bash

# MaidConnect - Import Path Fixer
# Updates all import paths to match new lib structure

set -e

echo "🔧 Fixing import paths..."

# Function to replace imports in all TS/TSX files
fix_imports() {
    local old_path=$1
    local new_path=$2
    echo "  Updating: $old_path -> $new_path"

    find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec \
        perl -pi -e "s|from ['\"]@/lib/${old_path}['\"]|from '@/lib/${new_path}'|g" {} \;
}

# Fix integrations paths
echo "🔌 Fixing integration imports..."
fix_imports "amara" "integrations/amara"
fix_imports "background-checks" "integrations/background-checks"
fix_imports "email" "integrations/email"
fix_imports "sanity" "integrations/sanity"
fix_imports "stripe" "integrations/stripe"
fix_imports "supabase" "integrations/supabase"

# Fix specific sub-paths for integrations
fix_imports "sanity/client" "integrations/sanity/client"
fix_imports "sanity/live" "integrations/sanity/live"
fix_imports "sanity/queries" "integrations/sanity/queries"
fix_imports "sanity/image" "integrations/sanity/image"
fix_imports "sanity/image-url" "integrations/sanity/image-url"
fix_imports "sanity/portable-text" "integrations/sanity/portable-text"
fix_imports "supabase/server-client" "integrations/supabase/server-client"
fix_imports "supabase/browser-client" "integrations/supabase/browser-client"
fix_imports "supabase/admin-client" "integrations/supabase/admin-client"
fix_imports "stripe/client" "integrations/stripe/client"
fix_imports "email/send" "integrations/email/send"
fix_imports "email/client" "integrations/email/client"
fix_imports "email/templates" "integrations/email/templates"

# Fix shared paths
echo "🌐 Fixing shared imports..."
fix_imports "auth" "shared/auth"
fix_imports "auth/session" "shared/auth/session"
fix_imports "auth/routes" "shared/auth/routes"
fix_imports "auth/types" "shared/auth/types"
fix_imports "api" "shared/api"
fix_imports "api/auth" "shared/api/auth"
fix_imports "api/middleware" "shared/api/middleware"
fix_imports "api/response" "shared/api/response"
fix_imports "api/with-auth-or-guest" "shared/api/with-auth-or-guest"
fix_imports "validations" "shared/validations"
fix_imports "content" "shared/config/content"
fix_imports "design-system" "shared/config/design-system"
fix_imports "design-tokens" "shared/config/design-tokens"
fix_imports "feature-flags" "shared/config/feature-flags"
fix_imports "motion" "shared/config/motion"
fix_imports "error-handler" "shared/error-handler"
fix_imports "errors" "shared/errors"
fix_imports "expo-push" "shared/expo-push"
fix_imports "logger" "shared/logger"
fix_imports "monitoring" "shared/monitoring"
fix_imports "notifications" "shared/notifications"
fix_imports "rate-limit" "shared/rate-limit"
fix_imports "web-vitals" "shared/web-vitals"

# Fix service paths
echo "📦 Fixing service imports..."
fix_imports "account/data-export-service" "services/account/data-export-service"
fix_imports "admin/background-checks-service" "services/admin/background-checks-service"
fix_imports "admin/professional-queue-helpers" "services/admin/professional-queue-helpers"
fix_imports "admin/professional-review-service" "services/admin/professional-review-service"
fix_imports "admin/user-details-service" "services/admin/user-details-service"
fix_imports "admin/user-management-service" "services/admin/user-management-service"
fix_imports "analytics/analytics-calculations" "services/analytics/analytics-calculations"
fix_imports "bookings/addon-service" "services/bookings/addon-service"
fix_imports "bookings/booking-creation-service" "services/bookings/booking-creation-service"
fix_imports "bookings/booking-workflow-service" "services/bookings/booking-workflow-service"
fix_imports "bookings/cancellation-service" "services/bookings/cancellation-service"
fix_imports "bookings/check-out-service" "services/bookings/check-out-service"
fix_imports "bookings/pricing-service" "services/bookings/pricing-service"
fix_imports "feedback/feedback-admin-service" "services/feedback/feedback-admin-service"
fix_imports "feedback/feedback-submission-service" "services/feedback/feedback-submission-service"
fix_imports "notifications/arrival-alert-service" "services/notifications/arrival-alert-service"
fix_imports "notifications/notification-send-service" "services/notifications/notification-send-service"
fix_imports "reviews/review-validation-service" "services/reviews/review-validation-service"
fix_imports "roadmap/roadmap-list-service" "services/roadmap/roadmap-list-service"
fix_imports "search/sanity-search-service" "services/search/sanity-search-service"

# Fix repository paths
echo "📊 Fixing repository imports..."
fix_imports "professionals/queries" "repositories/professionals/queries"

# Fix utility paths
echo "🛠️ Fixing utility imports..."
fix_imports "admin-helpers" "utils/admin/admin-helpers"
fix_imports "admin-utils" "utils/admin/admin-utils"
fix_imports "analytics/metrics-transformer" "utils/analytics/metrics-transformer"
fix_imports "analytics/track-event" "utils/analytics/track-event"
fix_imports "booking-utils" "utils/bookings/booking-utils"
fix_imports "bookings/booking-field-mapper" "utils/bookings/booking-field-mapper"
fix_imports "bookings/booking-insert-builder" "utils/bookings/booking-insert-builder"
fix_imports "calendar/calendar-health-calculator" "utils/calendar/calendar-health-calculator"
fix_imports "matching/smart-match" "utils/matching/smart-match"
fix_imports "onboarding/completion-calculator" "utils/onboarding/completion-calculator"
fix_imports "onboarding/profile-data-transformer" "utils/onboarding/profile-data-transformer"
fix_imports "professionals/mapper-helpers" "utils/professionals/mapper-helpers"
fix_imports "professionals/transformers" "utils/professionals/transformers"
fix_imports "roadmap/roadmap-field-mapper" "utils/roadmap/roadmap-field-mapper"
fix_imports "availability" "utils/availability"
fix_imports "block-editor-utils" "utils/block-editor-utils"
fix_imports "cancellation-policy" "utils/cancellation-policy"
fix_imports "format" "utils/format"
fix_imports "gps-verification" "utils/gps-verification"
fix_imports "guest-checkout" "utils/guest-checkout"
fix_imports "keyboard-shortcuts" "utils/keyboard-shortcuts"
fix_imports "messaging-utils" "utils/messaging-utils"
fix_imports "payout-calculator" "utils/payout-calculator"
fix_imports "sanitize" "utils/sanitize"
fix_imports "subscription-pricing" "utils/subscription-pricing"
fix_imports "toast" "utils/toast"
fix_imports "translation" "utils/translation"
fix_imports "utils" "utils/core"

# Special case: service-field-mapper
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec \
    perl -pi -e "s|from ['\"]@/lib/services/service-field-mapper['\"]|from '@/lib/utils/service-field-mapper'|g" {} \;

echo "✅ Import paths fixed!"
echo ""
echo "⚠️  Next: Run 'bun run check' to verify imports"
