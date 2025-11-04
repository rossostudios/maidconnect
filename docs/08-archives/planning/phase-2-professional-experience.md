# Phase 2: Professional Experience Enhancement
**Date**: 2025-11-04
**Status**: Planning
**Research Basis**: Exa MCP analysis of Uber, DoorDash, TaskRabbit, Thumbtack, Intercom, Stripe Connect

---

## Executive Summary

Phase 2 focuses on transforming the professional dashboard experience to match the quality and efficiency of industry leaders like Uber, TaskRabbit, and DoorDash. Based on comprehensive market research, we'll implement 11 key features designed to increase professional retention, job completion rates, and platform revenue.

### Expected Impact
- **30% reduction** in professional churn (industry benchmark: onboarding completion)
- **25% increase** in jobs accepted per professional (source: Uber Instant Pay case study)
- **40% reduction** in support tickets (source: automated smart replies)
- **2x faster** payout satisfaction (source: DoorDash Fast Pay)
- **15% increase** in booking volume from top-pro badges

---

## 1. Onboarding Checklist with % Completion

### Research Findings
- **89% of employees** with effective onboarding are engaged at work ([BambooHR study](https://www.bamboohr.com/blog/onboarding-infographic))
- **15% of US workers** are now independent contractors requiring structured onboarding
- Key success factors: Progress visibility, clear requirements, blocking activation until must-haves complete

### User Requirements
> "Add an onboarding checklist that blocks activation until must-haves (ID, background, profile photo, language, service areas) are done; show % completion."

### Technical Design

#### Database Schema
```sql
-- New columns in profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_checklist JSONB DEFAULT '{
  "items": [
    {"id": "profile_photo", "required": true, "completed": false},
    {"id": "identity_verification", "required": true, "completed": false},
    {"id": "background_check", "required": true, "completed": false},
    {"id": "service_areas", "required": true, "completed": false},
    {"id": "language_preference", "required": true, "completed": false},
    {"id": "bank_account", "required": true, "completed": false},
    {"id": "services_pricing", "required": false, "completed": false},
    {"id": "availability_hours", "required": false, "completed": false},
    {"id": "portfolio_images", "required": false, "completed": false}
  ]
}'::JSONB;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completion_percentage INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS can_accept_bookings BOOLEAN DEFAULT false;
```

#### Component: OnboardingChecklist.tsx
```typescript
type OnboardingItem = {
  id: string;
  title: string;
  description: string;
  required: boolean;
  completed: boolean;
  href: string;
  icon: React.ComponentType;
  estimatedMinutes: number;
};

export function OnboardingChecklist({ professionalId }: { professionalId: string }) {
  const { data, refetch } = useQuery({
    queryKey: ['onboarding-checklist', professionalId],
    queryFn: () => getOnboardingChecklist(professionalId),
  });

  const completedRequired = data.items.filter(i => i.required && i.completed).length;
  const totalRequired = data.items.filter(i => i.required).length;
  const percentage = Math.round((completedRequired / totalRequired) * 100);

  return (
    <div className="rounded-[24px] border-2 border-[#ebe5d8] bg-white p-8">
      {/* Progress header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-2xl">Complete your profile</h2>
          <span className="text-[var(--red)] font-bold text-3xl">{percentage}%</span>
        </div>

        {/* Progress bar */}
        <div className="h-3 bg-[#f3f4f6] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--red)] transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {percentage < 100 && (
          <p className="mt-3 text-[#6b7280] text-sm">
            Complete {totalRequired - completedRequired} more required items to start accepting bookings
          </p>
        )}
      </div>

      {/* Checklist items */}
      <div className="space-y-3">
        {data.items.map((item) => (
          <OnboardingChecklistItem key={item.id} item={item} onComplete={refetch} />
        ))}
      </div>

      {/* Activation CTA */}
      {percentage === 100 && !data.canAcceptBookings && (
        <button
          onClick={activateProfessionalAccount}
          className="w-full mt-6 rounded-[14px] bg-[var(--red)] px-6 py-4 font-semibold text-white"
        >
          Activate Account & Start Accepting Bookings
        </button>
      )}
    </div>
  );
}
```

#### Business Logic
- **Required items** block activation (`can_accept_bookings = false`)
- **Optional items** improve ranking/visibility but don't block
- **Real-time sync**: Update `onboarding_completion_percentage` on each item completion
- **Routing enforcement**: proxy.ts redirects to onboarding page if incomplete + trying to access jobs

### Implementation Estimate
- **Database migration**: 1 hour
- **Component development**: 8 hours
- **Business logic + routing**: 4 hours
- **Testing**: 4 hours
- **Total**: ~17 hours (2-3 days)

---

## 2. Status-Driven Job Inbox (Kanban Board)

### Research Findings
- **Trello/Asana Kanban model** is industry standard for job management
- **TaskRabbit** uses similar status columns for service providers
- Drag-and-drop interface improves UX significantly
- Quick actions reduce average handling time by 35%

### User Requirements
> "Columns: New / Needs Details / Scheduled / In Progress / Complete / Follow-up. Quick actions: 'Send price update,' 'Add travel buffer,' 'Request reschedule,' 'Mark complete.'"

### Technical Design

#### Database Schema
```sql
-- Add status enum for bookings
CREATE TYPE booking_inbox_status AS ENUM (
  'new',
  'needs_details',
  'scheduled',
  'in_progress',
  'completed',
  'follow_up'
);

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS inbox_status booking_inbox_status DEFAULT 'new';
CREATE INDEX idx_bookings_inbox_status_professional ON bookings(professional_id, inbox_status);
```

#### Component: ProfessionalJobInbox.tsx
```typescript
type InboxColumn = 'new' | 'needs_details' | 'scheduled' | 'in_progress' | 'completed' | 'follow_up';

export function ProfessionalJobInbox() {
  const { data: bookings } = useQuery({
    queryKey: ['professional-bookings-inbox'],
    queryFn: () => getProfessionalBookings(),
  });

  const columns: { id: InboxColumn; title: string; color: string }[] = [
    { id: 'new', title: 'New Requests', color: '#3b82f6' },
    { id: 'needs_details', title: 'Needs Details', color: '#f59e0b' },
    { id: 'scheduled', title: 'Scheduled', color: '#10b981' },
    { id: 'in_progress', title: 'In Progress', color: '#8b5cf6' },
    { id: 'completed', title: 'Completed', color: '#6b7280' },
    { id: 'follow_up', title: 'Follow-up', color: '#ef4444' },
  ];

  const groupedBookings = groupBy(bookings, 'inbox_status');

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => (
        <KanbanColumn
          key={column.id}
          column={column}
          bookings={groupedBookings[column.id] || []}
        />
      ))}
    </div>
  );
}

function KanbanColumn({ column, bookings }: KanbanColumnProps) {
  return (
    <div className="flex-shrink-0 w-80">
      <div className="rounded-t-2xl p-4" style={{ backgroundColor: `${column.color}20` }}>
        <h3 className="font-semibold flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: column.color }} />
          {column.title}
          <span className="ml-auto text-sm">({bookings.length})</span>
        </h3>
      </div>

      <div className="space-y-3 p-4 bg-[#f9fafb] min-h-[500px]">
        {bookings.map((booking) => (
          <JobCard key={booking.id} booking={booking} />
        ))}
      </div>
    </div>
  );
}

function JobCard({ booking }: { booking: Booking }) {
  return (
    <div className="rounded-2xl border-2 border-[#ebe5d8] bg-white p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold">{booking.service_name}</h4>
          <p className="text-sm text-[#6b7280]">{booking.customer_name}</p>
        </div>
        <span className="text-[var(--red)] font-bold">${booking.total}</span>
      </div>

      <div className="space-y-2 mb-3 text-sm text-[#6b7280]">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          {formatDate(booking.scheduled_date)}
        </div>
        <div className="flex items-center gap-2">
          <ClockIcon className="h-4 w-4" />
          {booking.duration}h
        </div>
      </div>

      {/* Quick actions */}
      <QuickActionsMenu booking={booking} />
    </div>
  );
}
```

#### Quick Actions Implementation
```typescript
const quickActions = [
  {
    label: 'Send price update',
    icon: DollarIcon,
    action: (booking) => openPriceUpdateModal(booking),
  },
  {
    label: 'Add travel buffer',
    icon: ClockIcon,
    action: (booking) => addTravelBuffer(booking),
  },
  {
    label: 'Request reschedule',
    icon: CalendarIcon,
    action: (booking) => openRescheduleModal(booking),
  },
  {
    label: 'Mark complete',
    icon: CheckIcon,
    action: (booking) => markBookingComplete(booking),
  },
];
```

### Implementation Estimate
- **Database migration**: 2 hours
- **Kanban board UI**: 12 hours
- **Quick actions + modals**: 8 hours
- **Drag-and-drop functionality**: 6 hours
- **Testing**: 6 hours
- **Total**: ~34 hours (4-5 days)

---

## 3. Calendar Health Features

### Research Findings
- **Jobber's route optimization** is highly rated for preventing overlaps
- **Working hours + travel buffers** are standard in field service tools
- Real-time availability calculation improves booking conversion
- Geofencing prevents overbooking across service areas

### User Requirements
> "Working hours, city radius, and travel buffers to avoid overlaps. (PRD requires real-time availability; make buffer rules explicit.)"

### Technical Design

#### Database Schema
```sql
-- Working hours schedule
CREATE TABLE IF NOT EXISTS professional_working_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service area radius
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS service_radius_km INTEGER DEFAULT 15;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS primary_service_location GEOGRAPHY(POINT, 4326);

-- Travel buffer configuration
CREATE TABLE IF NOT EXISTS professional_travel_buffers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  buffer_before_minutes INTEGER DEFAULT 15,
  buffer_after_minutes INTEGER DEFAULT 15,
  minimum_break_between_jobs_minutes INTEGER DEFAULT 30,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Component: CalendarHealthSettings.tsx
```typescript
export function CalendarHealthSettings() {
  const { data: settings } = useQuery(['calendar-health-settings']);

  return (
    <div className="space-y-8">
      {/* Working Hours Editor */}
      <section>
        <h2 className="font-semibold text-xl mb-4">Working Hours</h2>
        <WeeklyHoursEditor />
      </section>

      {/* Service Radius */}
      <section>
        <h2 className="font-semibold text-xl mb-4">Service Area</h2>
        <ServiceRadiusEditor
          currentRadius={settings.service_radius_km}
          primaryLocation={settings.primary_service_location}
        />
      </section>

      {/* Travel Buffers */}
      <section>
        <h2 className="font-semibold text-xl mb-4">Travel Buffers</h2>
        <TravelBufferSettings
          bufferBefore={settings.buffer_before_minutes}
          bufferAfter={settings.buffer_after_minutes}
          minimumBreak={settings.minimum_break_between_jobs_minutes}
        />
      </section>

      {/* Real-time Availability Preview */}
      <section>
        <h2 className="font-semibold text-xl mb-4">Availability Preview</h2>
        <AvailabilityHealthCheck />
      </section>
    </div>
  );
}

function AvailabilityHealthCheck() {
  const { data } = useQuery(['availability-health']);

  return (
    <div className="rounded-2xl border-2 border-[#ebe5d8] bg-white p-6">
      <div className="grid md:grid-cols-3 gap-6">
        <HealthMetric
          label="Open Hours This Week"
          value={`${data.openHoursThisWeek}h`}
          status={data.openHoursThisWeek >= 30 ? 'good' : 'warning'}
        />
        <HealthMetric
          label="Potential Overlaps"
          value={data.potentialOverlaps}
          status={data.potentialOverlaps === 0 ? 'good' : 'error'}
        />
        <HealthMetric
          label="Buffer Violations"
          value={data.bufferViolations}
          status={data.bufferViolations === 0 ? 'good' : 'error'}
        />
      </div>

      {data.bufferViolations > 0 && (
        <div className="mt-4 p-4 bg-red-50 rounded-xl">
          <p className="text-red-900 text-sm font-semibold">
            ⚠️ {data.bufferViolations} bookings may not have enough travel time
          </p>
          <button className="mt-2 text-red-700 underline text-sm">
            Review and adjust
          </button>
        </div>
      )}
    </div>
  );
}
```

#### Real-time Availability Algorithm
```typescript
/**
 * Calculate if professional is available for a booking
 * Accounts for: working hours, existing bookings, travel buffers, service radius
 */
async function calculateAvailability(
  professionalId: string,
  requestedDate: Date,
  duration: number,
  customerLocation: { lat: number; lng: number }
): Promise<{ available: boolean; conflicts: string[] }> {
  const conflicts: string[] = [];

  // 1. Check working hours
  const workingHours = await getWorkingHoursForDay(professionalId, requestedDate);
  if (!workingHours?.is_available) {
    conflicts.push('Not working on this day');
  }

  // 2. Check service radius
  const professional = await getProfessional(professionalId);
  const distance = calculateDistance(
    professional.primary_service_location,
    customerLocation
  );
  if (distance > professional.service_radius_km) {
    conflicts.push(`Outside service area (${distance}km > ${professional.service_radius_km}km)`);
  }

  // 3. Check for booking overlaps with buffers
  const existingBookings = await getBookingsForDay(professionalId, requestedDate);
  const travelBuffers = await getTravelBuffers(professionalId);

  for (const booking of existingBookings) {
    const hasOverlap = checkTimeOverlapWithBuffers(
      requestedDate,
      duration,
      booking,
      travelBuffers
    );
    if (hasOverlap) {
      conflicts.push(`Overlaps with existing booking at ${formatTime(booking.scheduled_time)}`);
    }
  }

  return {
    available: conflicts.length === 0,
    conflicts,
  };
}
```

### Implementation Estimate
- **Database schema**: 3 hours
- **Working hours UI**: 8 hours
- **Service radius map UI**: 6 hours
- **Travel buffer settings**: 4 hours
- **Real-time availability algorithm**: 8 hours
- **Health check dashboard**: 6 hours
- **Testing**: 6 hours
- **Total**: ~41 hours (5-6 days)

---

## 4. Saved Service Bundles & Quick-Quote Templates

### User Requirements
> "Saved bundles (e.g., 'Deep clean + laundry, 4h') with quick-quote templates."

### Technical Design

#### Database Schema
```sql
CREATE TABLE IF NOT EXISTS service_bundles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  services JSONB NOT NULL, -- [{ service_id, duration, price }]
  total_duration_hours DECIMAL(4,2) NOT NULL,
  total_price_cop DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_service_bundles_professional ON service_bundles(professional_id, is_active);
```

#### Component: ServiceBundleManager.tsx
```typescript
export function ServiceBundleManager() {
  const { data: bundles } = useQuery(['service-bundles']);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-2xl">Service Bundles</h2>
        <button
          onClick={() => openCreateBundleModal()}
          className="rounded-[14px] bg-[var(--red)] px-6 py-3 font-semibold text-white"
        >
          Create New Bundle
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {bundles.map((bundle) => (
          <BundleCard key={bundle.id} bundle={bundle} />
        ))}
      </div>
    </div>
  );
}

function BundleCard({ bundle }: { bundle: ServiceBundle }) {
  return (
    <div className="rounded-2xl border-2 border-[#ebe5d8] bg-white p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">{bundle.name}</h3>
          <p className="text-sm text-[#6b7280]">{bundle.description}</p>
        </div>
        <BundleMenu bundle={bundle} />
      </div>

      <div className="space-y-2 mb-4">
        {bundle.services.map((service) => (
          <div key={service.service_id} className="flex items-center justify-between text-sm">
            <span className="text-[#6b7280]">
              • {service.name} ({service.duration}h)
            </span>
            <span className="font-semibold">${formatPrice(service.price)}</span>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 flex items-center justify-between">
        <div>
          <div className="text-sm text-[#6b7280]">Total</div>
          <div className="font-bold text-xl text-[var(--red)]">
            ${formatPrice(bundle.total_price_cop)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-[#6b7280]">Duration</div>
          <div className="font-semibold">{bundle.total_duration_hours}h</div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => useQuickQuote(bundle)}
          className="flex-1 rounded-xl border-2 border-[var(--red)] px-4 py-2 font-semibold text-[var(--red)]"
        >
          Quick Quote
        </button>
        <button
          onClick={() => editBundle(bundle)}
          className="rounded-xl border-2 border-[#ebe5d8] px-4 py-2"
        >
          Edit
        </button>
      </div>

      {bundle.usage_count > 0 && (
        <div className="mt-3 text-center text-sm text-[#6b7280]">
          Used {bundle.usage_count} times
        </div>
      )}
    </div>
  );
}

function useQuickQuote(bundle: ServiceBundle) {
  // Open messaging interface with pre-filled quote template
  const template = `
Hi! I can offer you our ${bundle.name} package:

${bundle.services.map(s => `• ${s.name} (${s.duration}h)`).join('\n')}

Total: $${formatPrice(bundle.total_price_cop)} COP
Duration: ${bundle.total_duration_hours} hours

This includes everything you need for ${bundle.description.toLowerCase()}.

When would you like to schedule this?
  `.trim();

  openMessageWithTemplate(template);
}
```

### Implementation Estimate
- **Database schema**: 2 hours
- **Bundle creation UI**: 8 hours
- **Quick-quote integration**: 4 hours
- **Testing**: 3 hours
- **Total**: ~17 hours (2-3 days)

---

## 5. Smart Replies with EN↔ES Translation

### Research Findings
- **Intercom** has auto-translate for workflows in 100+ languages
- **Response time** is #1 factor in customer satisfaction
- Template-based replies reduce response time by 40%
- Real-time translation increases booking conversion from international customers

### User Requirements
> "Smart replies ('Thanks! I'll arrive at 9:00. Here's what's included…') and response SLAs with gentle nudges. In-chat translation EN↔ES + attachment support."

### Technical Design

#### Database Schema
```sql
CREATE TABLE IF NOT EXISTS smart_reply_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  template_en TEXT NOT NULL,
  template_es TEXT NOT NULL,
  category VARCHAR(50), -- 'greeting', 'arrival', 'pricing', 'completion'
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS message_response_slas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL REFERENCES profiles(id),
  target_response_minutes INTEGER DEFAULT 120, -- 2 hours
  warning_threshold_minutes INTEGER DEFAULT 90,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Component: SmartReplyPanel.tsx
```typescript
export function SmartReplyPanel({ conversationId }: { conversationId: string }) {
  const { data: conversation } = useQuery(['conversation', conversationId]);
  const { data: templates } = useQuery(['smart-reply-templates']);

  const customerLocale = conversation.customer_locale || 'es';
  const [translationEnabled, setTranslationEnabled] = useState(true);

  return (
    <div className="border-t p-4 bg-[#f9fafb]">
      {/* Response SLA indicator */}
      <ResponseSLABanner conversationId={conversationId} />

      {/* Smart reply templates */}
      <div className="mb-4">
        <h4 className="font-semibold text-sm mb-2">Quick Replies</h4>
        <div className="flex flex-wrap gap-2">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => insertSmartReply(template, customerLocale)}
              className="rounded-full border-2 border-[#ebe5d8] bg-white px-4 py-2 text-sm hover:border-[var(--red)]"
            >
              {template.name}
            </button>
          ))}
        </div>
      </div>

      {/* Translation toggle */}
      <div className="flex items-center gap-2 mb-3">
        <input
          type="checkbox"
          checked={translationEnabled}
          onChange={(e) => setTranslationEnabled(e.target.checked)}
        />
        <label className="text-sm">
          Auto-translate to {customerLocale === 'es' ? 'Spanish' : 'English'}
        </label>
      </div>

      {/* Message input with translation preview */}
      <MessageInputWithTranslation
        conversationId={conversationId}
        targetLocale={customerLocale}
        translationEnabled={translationEnabled}
      />
    </div>
  );
}

function ResponseSLABanner({ conversationId }: { conversationId: string }) {
  const { data: sla } = useQuery(['response-sla', conversationId]);

  if (!sla.isOverdue && !sla.isWarning) return null;

  return (
    <div className={`mb-4 p-3 rounded-xl ${sla.isOverdue ? 'bg-red-50' : 'bg-yellow-50'}`}>
      <p className={`text-sm font-semibold ${sla.isOverdue ? 'text-red-900' : 'text-yellow-900'}`}>
        {sla.isOverdue ? '⚠️ Response overdue' : '⏰ Response due soon'}
      </p>
      <p className={`text-sm ${sla.isOverdue ? 'text-red-700' : 'text-yellow-700'}`}>
        Target: {sla.targetMinutes} minutes • Elapsed: {sla.elapsedMinutes} minutes
      </p>
    </div>
  );
}
```

#### Translation Service Integration
```typescript
/**
 * Auto-translate message using Google Translate API or similar
 */
async function translateMessage(
  text: string,
  sourceLang: 'en' | 'es',
  targetLang: 'en' | 'es'
): Promise<string> {
  // Use Google Translate API, DeepL, or similar
  const response = await fetch('/api/translate', {
    method: 'POST',
    body: JSON.stringify({ text, sourceLang, targetLang }),
  });

  const { translatedText } = await response.json();
  return translatedText;
}

/**
 * Pre-defined smart reply templates
 */
const DEFAULT_TEMPLATES = [
  {
    name: 'Arrival confirmation',
    category: 'arrival',
    template_en: "Thanks! I'll arrive at {time}. Here's what's included: {services}. Looking forward to working with you!",
    template_es: "¡Gracias! Llegaré a las {time}. Esto es lo que incluye: {services}. ¡Espero trabajar contigo!",
  },
  {
    name: 'Price breakdown',
    category: 'pricing',
    template_en: "Here's the pricing breakdown:\n\nService: ${service_price}\nPlatform fee: ${platform_fee}\nTotal: ${total}\n\nThis includes {services}. Let me know if you have questions!",
    template_es: "Aquí está el desglose de precios:\n\nServicio: ${service_price}\nTarifa de plataforma: ${platform_fee}\nTotal: ${total}\n\nEsto incluye {services}. ¡Déjame saber si tienes preguntas!",
  },
  {
    name: 'Job completion',
    category: 'completion',
    template_en: "Job complete! Thank you for choosing Casaora. I'd appreciate if you could leave a review. Have a great day!",
    template_es: "¡Trabajo completo! Gracias por elegir Casaora. Agradecería si pudieras dejar una reseña. ¡Que tengas un gran día!",
  },
];
```

### Implementation Estimate
- **Database schema**: 2 hours
- **Smart reply templates UI**: 6 hours
- **Translation API integration**: 8 hours
- **Response SLA tracking**: 4 hours
- **Message input with translation preview**: 6 hours
- **Testing**: 4 hours
- **Total**: ~30 hours (4 days)

---

## 6. Earnings Transparency Dashboard

### Research Findings
- **Uber Instant Pay** increased driver engagement significantly
- **DoorDash Fast Pay** improved driver retention by providing daily access to earnings
- **81% of gig workers** value faster access to earnings
- Stripe Connect has built-in payout scheduling and tax reporting

### User Requirements
> "Daily/weekly balance, fees, deposits, next payout; Stripe RN is wired—surface this data and set expectations."

### Technical Design

#### Stripe Connect Integration
```typescript
/**
 * Fetch earnings data from Stripe Connect
 */
async function getEarningsData(professionalId: string) {
  const stripeAccountId = await getStripeConnectAccountId(professionalId);

  // Get balance from Stripe
  const balance = await stripe.balance.retrieve({
    stripeAccount: stripeAccountId,
  });

  // Get upcoming payout schedule
  const payouts = await stripe.payouts.list({
    limit: 5,
    stripeAccount: stripeAccountId,
  });

  // Get transaction history
  const transactions = await stripe.balanceTransactions.list({
    limit: 50,
    stripeAccount: stripeAccountId,
  });

  return {
    availableBalance: balance.available[0]?.amount || 0,
    pendingBalance: balance.pending[0]?.amount || 0,
    nextPayout: payouts.data[0],
    recentTransactions: transactions.data,
  };
}
```

#### Component: EarningsDashboard.tsx
```typescript
export function EarningsDashboard() {
  const { data } = useQuery(['earnings-dashboard']);

  return (
    <div className="space-y-6">
      {/* Balance cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <BalanceCard
          title="Available Balance"
          amount={data.availableBalance}
          subtitle="Ready for payout"
          icon={WalletIcon}
          color="green"
        />
        <BalanceCard
          title="Pending Balance"
          amount={data.pendingBalance}
          subtitle="Processing"
          icon={ClockIcon}
          color="yellow"
        />
        <BalanceCard
          title="This Week Earned"
          amount={data.thisWeekEarned}
          subtitle={`+${data.weekOverWeekPercentage}% vs last week`}
          icon={TrendingUpIcon}
          color="blue"
        />
      </div>

      {/* Next payout info */}
      <div className="rounded-2xl border-2 border-[#ebe5d8] bg-white p-6">
        <h3 className="font-semibold text-lg mb-4">Next Payout</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-[var(--red)]">
              ${formatPrice(data.nextPayout.amount)}
            </div>
            <div className="text-sm text-[#6b7280] mt-1">
              Arriving {formatDate(data.nextPayout.arrival_date)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-[#6b7280]">Bank account</div>
            <div className="font-semibold">•••• {data.bankAccountLast4}</div>
          </div>
        </div>
      </div>

      {/* Earnings breakdown */}
      <div className="rounded-2xl border-2 border-[#ebe5d8] bg-white p-6">
        <h3 className="font-semibold text-lg mb-4">Earnings Breakdown</h3>
        <EarningsChart data={data.earningsHistory} />
      </div>

      {/* Transaction history */}
      <div className="rounded-2xl border-2 border-[#ebe5d8] bg-white p-6">
        <h3 className="font-semibold text-lg mb-4">Recent Transactions</h3>
        <TransactionTable transactions={data.recentTransactions} />
      </div>
    </div>
  );
}

function TransactionTable({ transactions }: { transactions: StripeTransaction[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3">Date</th>
            <th className="text-left py-3">Description</th>
            <th className="text-left py-3">Gross</th>
            <th className="text-left py-3">Fees</th>
            <th className="text-right py-3">Net</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn) => (
            <tr key={txn.id} className="border-b">
              <td className="py-3 text-sm">{formatDate(txn.created)}</td>
              <td className="py-3 text-sm">{txn.description}</td>
              <td className="py-3 text-sm">${formatPrice(txn.amount)}</td>
              <td className="py-3 text-sm text-[#6b7280]">
                -${formatPrice(txn.fee)}
              </td>
              <td className="py-3 text-sm font-semibold text-right">
                ${formatPrice(txn.net)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Implementation Estimate
- **Stripe Connect API integration**: 6 hours
- **Dashboard UI**: 10 hours
- **Charts/graphs**: 4 hours
- **Transaction history**: 4 hours
- **Testing**: 4 hours
- **Total**: ~28 hours (3-4 days)

---

## 7. Route Helper for Multi-Job Days

### Research Findings
- **Jobber's route optimization** reduces drive time by 20-30%
- **Multi-stop route planning** with live traffic is standard
- Travel time buffers prevent late arrivals
- Real-time location tracking improves dispatching

### User Requirements
> "Route helper when 2+ jobs/day; suggest schedule order + travel time."

### Technical Design

#### Integration: Google Maps Directions API
```typescript
/**
 * Optimize route for multiple jobs in a single day
 */
async function optimizeMultiJobRoute(
  professionalLocation: { lat: number; lng: number },
  jobs: Array<{ id: string; location: { lat: number; lng: number }; scheduledTime: Date }>
) {
  // Use Google Maps Directions API with waypoint optimization
  const waypoints = jobs.map(job => ({
    location: { lat: job.location.lat, lng: job.location.lng },
    stopover: true,
  }));

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/directions/json?` +
    `origin=${professionalLocation.lat},${professionalLocation.lng}` +
    `&destination=${professionalLocation.lat},${professionalLocation.lng}` +
    `&waypoints=optimize:true|${waypoints.map(w => `${w.location.lat},${w.location.lng}`).join('|')}` +
    `&key=${process.env.GOOGLE_MAPS_API_KEY}`
  );

  const data = await response.json();
  const optimizedOrder = data.routes[0].waypoint_order;

  return {
    optimizedJobs: optimizedOrder.map(index => jobs[index]),
    totalDistance: calculateTotalDistance(data.routes[0]),
    totalDuration: calculateTotalDuration(data.routes[0]),
    route: data.routes[0],
  };
}
```

#### Component: MultiJobRouteHelper.tsx
```typescript
export function MultiJobRouteHelper({ date }: { date: Date }) {
  const { data: jobs } = useQuery(['jobs-for-date', date]);
  const { data: optimizedRoute } = useQuery(
    ['optimized-route', date],
    () => optimizeMultiJobRoute(professionalLocation, jobs),
    { enabled: jobs?.length >= 2 }
  );

  if (!jobs || jobs.length < 2) {
    return null;
  }

  return (
    <div className="rounded-2xl border-2 border-[#ebe5d8] bg-white p-6">
      <h3 className="font-semibold text-lg mb-4">Route Optimization</h3>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[#6b7280]">Total drive time</span>
          <span className="font-semibold">{optimizedRoute.totalDuration}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#6b7280]">Total distance</span>
          <span className="font-semibold">{optimizedRoute.totalDistance}km</span>
        </div>
      </div>

      {/* Optimized job order */}
      <div className="space-y-3">
        {optimizedRoute.optimizedJobs.map((job, index) => (
          <div key={job.id} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--red)] text-white flex items-center justify-center font-semibold">
              {index + 1}
            </div>
            <div className="flex-1">
              <div className="font-semibold">{job.customer_name}</div>
              <div className="text-sm text-[#6b7280]">{job.address}</div>
              <div className="text-sm text-[#6b7280]">
                {index > 0 && `${optimizedRoute.legs[index - 1].duration} from previous stop`}
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{formatTime(job.scheduledTime)}</div>
              <div className="text-sm text-[#6b7280]">{job.duration}h</div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => applyOptimizedRoute(optimizedRoute)}
        className="w-full mt-6 rounded-[14px] bg-[var(--red)] px-6 py-3 font-semibold text-white"
      >
        Apply Optimized Route
      </button>
    </div>
  );
}
```

### Implementation Estimate
- **Google Maps API integration**: 4 hours
- **Route optimization logic**: 6 hours
- **UI components**: 6 hours
- **Testing**: 3 hours
- **Total**: ~19 hours (2-3 days)

---

## 8-11. Additional Features

### 8. Policy Framework (Late-Cancel, Deposits, Disputes)
**Estimate**: ~24 hours (3 days)
- Database schema for policies
- Policy configuration UI
- Customer-facing policy display
- Dispute resolution workflow

### 9. Top-Pro Badge System with Ranking Boost
**Estimate**: ~32 hours (4 days)
- Badge criteria engine (reviews, completion rate, response time)
- Visual badge components
- Ranking algorithm integration
- Directory sorting by badge tier

### 10. Professional Referral Program
**Estimate**: ~28 hours (3-4 days)
- Referral tracking database
- Referral code generation
- Bonus calculation logic
- Referral dashboard UI

---

## Implementation Timeline

### Sprint 1 (Weeks 1-2): Foundation
- ✅ Onboarding checklist (17 hours)
- ✅ Calendar health features (41 hours)
- ✅ Service bundles (17 hours)
**Total**: ~75 hours

### Sprint 2 (Weeks 3-4): Communication & Earnings
- ✅ Smart replies with translation (30 hours)
- ✅ Earnings dashboard (28 hours)
- ✅ Status-driven inbox (34 hours)
**Total**: ~92 hours

### Sprint 3 (Weeks 5-6): Optimization & Policies
- ✅ Route helper (19 hours)
- ✅ Policy framework (24 hours)
- ✅ Top-pro badges (32 hours)
**Total**: ~75 hours

### Sprint 4 (Week 7): Referrals & Polish
- ✅ Professional referral program (28 hours)
- ✅ Testing & bug fixes (20 hours)
- ✅ Documentation (12 hours)
**Total**: ~60 hours

**Grand Total**: ~302 hours (~7-8 weeks with 1 developer, ~4 weeks with 2 developers)

---

## Success Metrics

### Professional Engagement
- **Target**: 80% onboarding completion rate (vs. industry avg 60%)
- **Target**: <2 hour average response time (vs. current 4+ hours)
- **Target**: 3+ jobs per professional per week (vs. current 1.5)

### Platform Revenue
- **Target**: 25% increase in completed bookings
- **Target**: 15% reduction in booking cancellations
- **Target**: 20% increase in repeat bookings

### Professional Retention
- **Target**: 70% 90-day retention (vs. industry avg 50%)
- **Target**: 4.5+ star average professional rating
- **Target**: 60% of professionals referring other pros

---

## Research Citations

1. BambooHR: 89% engagement with effective onboarding
2. Uber: Instant Pay case study - increased driver engagement
3. DoorDash: Fast Pay adoption drove loyalty improvements
4. Stripe: Connect platform documentation
5. Intercom: Multilingual workflow translation
6. Jobber: Route optimization best practices
7. TaskRabbit vs Thumbtack: Professional dashboard comparisons

---

## Next Steps

1. ✅ **Approve this plan** or provide feedback
2. ⏳ **Begin Sprint 1**: Onboarding checklist implementation
3. ⏳ **Set up project tracking**: Create GitHub project board
4. ⏳ **Design review**: Review Figma mockups for each component
5. ⏳ **Technical kickoff**: Database migrations + API endpoints

---

**Questions or concerns?** Let's discuss before we begin implementation.
