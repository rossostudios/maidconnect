# Trust & Safety System

**Status:** Production Ready
**Last Updated:** 2025-11-06
**Maintainer:** Technical Leadership Team

---

## Table of Contents

1. [Overview](#1-overview)
2. [Identity Verification](#2-identity-verification)
3. [Background Checks](#3-background-checks)
4. [Professional Vetting](#4-professional-vetting)
5. [GPS Check-In/Check-Out](#5-gps-check-incheck-out)
6. [Emergency Contact System](#6-emergency-contact-system)
7. [Dispute Resolution](#7-dispute-resolution)
8. [User Blocking & Suspension](#8-user-blocking--suspension)
9. [Insurance Claims](#9-insurance-claims)
10. [Trust Indicators](#10-trust-indicators)
11. [SMS Tracking](#11-sms-tracking)
12. [Audit Logging](#12-audit-logging)
13. [Admin Tools](#13-admin-tools)
14. [Security Implementation](#14-security-implementation)
15. [Help Center Content](#15-help-center-content)
16. [Troubleshooting Guide](#16-troubleshooting-guide)
17. [Future Enhancements](#17-future-enhancements)

---

## 1. Overview

### What is the Trust & Safety System?

MaidConnect implements a **comprehensive, multi-layered Trust & Safety system** specifically designed for the Colombian domestic services marketplace. The system protects both customers and cleaning professionals through identity verification, background checks, GPS tracking, dispute resolution, and emergency features.

### Key Features

✅ **Identity Verification:**
- Phone number verification (SMS codes)
- Government ID document upload and review
- Multi-level verification badges

✅ **Background Checks:**
- Integration with Checkr (US-based, Colombia support)
- Integration with Truora (LatAm specialist)
- Criminal, judicial, and disciplinary records checks

✅ **Professional Vetting:**
- Multi-stage admin review process
- Document verification workflow
- In-person interview scheduling
- Reference checking

✅ **GPS Check-In/Check-Out:**
- 150-meter proximity verification
- Soft enforcement (logs warnings, doesn't block)
- Haversine formula for accurate distance calculation

✅ **Emergency Features:**
- Emergency contact storage for professionals and customers
- Quick access during active bookings
- Incident logging and notifications

✅ **Dispute Resolution:**
- 48-hour protection window after booking completion
- Structured dispute reasons (service quality, safety, damage)
- Admin investigation workflow
- Evidence upload system

✅ **User Moderation:**
- Mutual user blocking
- Temporary suspensions (default 7 days)
- Permanent bans
- Email notifications and audit logging

✅ **Insurance Claims:**
- Damage, theft, and injury claims
- Evidence photo uploads
- Cost tracking and payout management
- Admin resolution workflow

✅ **Trust Indicators:**
- Verification badges (Basic, Enhanced, Background Check)
- On-time rate badges (≥75%)
- Trust cards with comprehensive metrics
- Compact badges for search results

✅ **Audit & Compliance:**
- Complete admin action logging
- GDPR-compliant data export
- Audit trail dashboard
- Security incident tracking

---

## 2. Identity Verification

### A. Phone Verification

**Purpose:** Ensure professionals and customers have valid phone numbers

**Database Schema:**

**File:** `/supabase/migrations/20251106030000_trust_safety_foundation.sql`

```sql
-- Phone verification fields on profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS phone_verification_code text,
ADD COLUMN IF NOT EXISTS phone_verification_sent_at timestamptz;

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone_verification
  ON public.profiles(phone_verified, phone_verification_sent_at);
```

**Flow:**
1. User enters phone number during signup/onboarding
2. System generates 6-digit verification code
3. SMS sent via notification service
4. User enters code within 10 minutes
5. System validates code and sets `phone_verified = true`

**Implementation:**

```typescript
// Generate verification code
const code = Math.floor(100000 + Math.random() * 900000).toString();

await supabase.from('profiles').update({
  phone_verification_code: code,
  phone_verification_sent_at: new Date().toISOString()
}).eq('id', userId);

// Send SMS
await sendSMS(phoneNumber, `Your Casaora verification code is: ${code}`);

// Verify code (within 10 minutes)
const { data: profile } = await supabase
  .from('profiles')
  .select('phone_verification_code, phone_verification_sent_at')
  .eq('id', userId)
  .single();

const sentAt = new Date(profile.phone_verification_sent_at);
const now = new Date();
const minutesSinceSent = (now.getTime() - sentAt.getTime()) / (1000 * 60);

if (minutesSinceSent > 10) {
  return { error: 'Verification code expired. Request a new one.' };
}

if (inputCode !== profile.phone_verification_code) {
  return { error: 'Invalid verification code.' };
}

await supabase.from('profiles').update({
  phone_verified: true,
  phone_verification_code: null
}).eq('id', userId);
```

---

### B. Document Upload & Verification

**Purpose:** Verify professional identity using government-issued ID

**Supported Document Types:**
- Colombian Cédula de Ciudadanía (National ID)
- Passport
- Cédula de Extranjería (Foreigner ID)

**Upload Process:**
1. Professional uploads front and back of ID during onboarding
2. Documents stored in Supabase Storage (encrypted)
3. Admin reviews documents in vetting dashboard
4. Admin marks as "documents_verified" in review checklist

**Storage Path:**
```
/documents/{professional_id}/id_front.{ext}
/documents/{professional_id}/id_back.{ext}
```

**RLS Policy:**
```sql
-- Only professionals can upload their own documents
CREATE POLICY "Professionals can upload their own documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

-- Admins can view all documents
CREATE POLICY "Admins can view all documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );
```

---

### C. Verification Levels

**File:** `/src/components/professionals/verification-badge.tsx`

```typescript
export type VerificationLevel =
  | "none"
  | "basic"
  | "enhanced"
  | "background-check";

// Verification progression:
// none → basic (ID verified)
// basic → enhanced (Enhanced verified - references, interview)
// enhanced → background-check (Background check passed)
```

**Visual Badges:**

```tsx
<VerificationBadge level="basic" />
// Displays: ✓ ID Verified (Green badge)

<VerificationBadge level="enhanced" />
// Displays: ✓ Enhanced Verified (Blue badge)

<VerificationBadge level="background-check" />
// Displays: ✓ Background Checked (Purple badge)
```

**Badge Colors:**
- **Basic (Green):** ID documents verified
- **Enhanced (Blue):** ID + references + interview completed
- **Background Check (Purple):** Full background check passed

---

## 3. Background Checks

### A. Supported Providers

MaidConnect integrates with two background check providers:

#### **1. Checkr (US-based, Colombia support)**

**File:** `/src/lib/background-checks/checkr-client.ts`

```typescript
export class CheckrClient implements BackgroundCheckProvider {
  private apiKey: string;
  private baseURL = "https://api.checkr.com/v1";

  async createCheck(professionalId: string, candidateData: CandidateData) {
    // Create candidate
    const candidate = await this.createCandidate(candidateData);

    // Request background check
    const check = await fetch(`${this.baseURL}/reports`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        candidate_id: candidate.id,
        package: "colombian_national_criminal_search",
        // Colombian-specific checks
      })
    });

    return check.json();
  }

  async getCheckStatus(checkId: string): Promise<CheckrReport> {
    const response = await fetch(`${this.baseURL}/reports/${checkId}`, {
      headers: { "Authorization": `Bearer ${this.apiKey}` }
    });

    return response.json();
  }

  // Webhook verification (HMAC-SHA256)
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const hmac = crypto.createHmac("sha256", this.webhookSecret);
    hmac.update(payload);
    const computedSignature = hmac.digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computedSignature)
    );
  }
}
```

**Checkr Package:**
- `colombian_national_criminal_search` - Criminal records search in Colombia

---

#### **2. Truora (LatAm specialist)**

**File:** `/src/lib/background-checks/truora-client.ts`

```typescript
export class TruoraClient implements BackgroundCheckProvider {
  private apiKey: string;
  private baseURL = "https://api.truora.com/v1";

  async createCheck(professionalId: string, candidateData: CandidateData) {
    const check = await fetch(`${this.baseURL}/checks`, {
      method: "POST",
      headers: {
        "Truora-API-Key": this.apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        type: "person",
        user_authorized: true,
        country: "CO", // Colombia
        checks_requested: [
          "national_background_check",  // Criminal records
          "judicial_records",           // Judicial records
          "disciplinary_records",       // Procuraduría (PGN) records
          "identity_validation"         // Document verification
        ],
        personal_information: {
          first_name: candidateData.firstName,
          last_name: candidateData.lastName,
          national_id: candidateData.nationalId,
          national_id_type: "CC", // Cédula de Ciudadanía
          email: candidateData.email
        }
      })
    });

    return check.json();
  }

  async getCheckStatus(checkId: string): Promise<TruoraCheck> {
    const response = await fetch(`${this.baseURL}/checks/${checkId}`, {
      headers: { "Truora-API-Key": this.apiKey }
    });

    return response.json();
  }

  // Webhook verification (Bearer token)
  verifyWebhookToken(token: string): boolean {
    return token === this.webhookSecret;
  }
}
```

**Truora Checks:**
- **National Background Check:** Criminal records from Policía Nacional
- **Judicial Records:** Court records from Rama Judicial
- **Disciplinary Records:** Procuraduría General de la Nación (PGN)
- **Identity Validation:** Government ID verification

---

### B. Database Schema

**File:** `/supabase/migrations/20251106030000_trust_safety_foundation.sql`

```sql
CREATE TYPE background_check_status AS ENUM (
  'pending',
  'clear',
  'consider',
  'suspended'
);

CREATE TABLE public.background_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider text NOT NULL, -- 'checkr' | 'truora'
  provider_check_id text NOT NULL, -- External provider ID
  status background_check_status NOT NULL DEFAULT 'pending',
  result_data jsonb DEFAULT '{}'::jsonb, -- Full provider response
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (professional_id, provider, provider_check_id)
);

-- Index for admin dashboard
CREATE INDEX idx_background_checks_professional_id
  ON public.background_checks(professional_id);

CREATE INDEX idx_background_checks_status
  ON public.background_checks(status);

CREATE INDEX idx_background_checks_created_at
  ON public.background_checks(created_at DESC);

-- Auto-update updated_at
CREATE TRIGGER set_background_checks_updated_at
  BEFORE UPDATE ON public.background_checks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

**Type Definitions:**

```typescript
export type BackgroundCheckStatus =
  | "pending"      // Check in progress
  | "clear"        // No issues found
  | "consider"     // Requires admin review (minor issues)
  | "suspended";   // Serious issues found (criminal record)

export type BackgroundCheckProvider = "checkr" | "truora";

export interface BackgroundCheck {
  id: string;
  professional_id: string;
  provider: BackgroundCheckProvider;
  provider_check_id: string;
  status: BackgroundCheckStatus;
  result_data: Record<string, any>; // Full provider response
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}
```

---

### C. Workflow

**1. Admin Initiates Check:**

**File:** `/src/app/api/admin/background-checks/route.ts`

```typescript
// POST /api/admin/background-checks
export async function POST(request: Request) {
  const { professionalId, provider } = await request.json();

  // Get professional data
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, professional_profiles(*)")
    .eq("id", professionalId)
    .single();

  // Select provider
  const providerClient = provider === "checkr"
    ? new CheckrClient(process.env.CHECKR_API_KEY!)
    : new TruoraClient(process.env.TRUORA_API_KEY!);

  // Create check
  const check = await providerClient.createCheck(professionalId, {
    firstName: profile.full_name.split(" ")[0],
    lastName: profile.full_name.split(" ").slice(1).join(" "),
    nationalId: profile.professional_profiles.national_id,
    email: profile.email,
  });

  // Store in database
  const { data: bgCheck } = await supabase
    .from("background_checks")
    .insert({
      professional_id: professionalId,
      provider,
      provider_check_id: check.id,
      status: "pending",
      result_data: check,
    })
    .select()
    .single();

  return NextResponse.json({ success: true, check: bgCheck });
}
```

**2. Provider Processes Check:**
- Checkr/Truora runs background check (2-7 days typical)
- Searches criminal, judicial, disciplinary records
- Validates identity documents

**3. Webhook Updates Status:**

**File:** `/src/app/api/webhooks/background-checks/route.ts`

```typescript
// POST /api/webhooks/background-checks
export async function POST(request: Request) {
  const signature = request.headers.get("X-Checkr-Signature");
  const payload = await request.text();

  // Verify webhook signature
  const isValid = verifyWebhookSignature(payload, signature);
  if (!isValid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const event = JSON.parse(payload);

  // Update background check status
  const { data: bgCheck } = await supabase
    .from("background_checks")
    .update({
      status: mapProviderStatus(event.status), // 'clear', 'consider', 'suspended'
      result_data: event,
      completed_at: event.status !== "pending" ? new Date().toISOString() : null,
    })
    .eq("provider_check_id", event.id)
    .select()
    .single();

  // Notify admin
  await sendAdminNotification({
    type: "background_check_completed",
    professionalId: bgCheck.professional_id,
    status: bgCheck.status,
  });

  return NextResponse.json({ received: true });
}
```

**4. Admin Reviews Result:**

**File:** `/src/components/admin/background-check-dashboard.tsx`

- Admin views detailed check results
- If status is "clear" → Approve professional
- If status is "consider" → Review details, decide approval
- If status is "suspended" → Reject professional application

**5. Approval/Rejection:**

```typescript
// POST /api/admin/background-checks/[id]/approve
await supabase.from("professional_profiles").update({
  onboarding_status: "approved",
  verification_level: "background-check"
}).eq("profile_id", professionalId);

// POST /api/admin/background-checks/[id]/reject
await supabase.from("professional_profiles").update({
  onboarding_status: "rejected"
}).eq("profile_id", professionalId);

// Send email notification
await sendBackgroundCheckResultEmail(professional.email, approved);
```

---

### D. Admin Dashboard

**File:** `/src/components/admin/background-check-dashboard.tsx`

**Features:**

```tsx
export function BackgroundCheckDashboard() {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="Pending Checks" value={pendingCount} />
        <MetricCard label="Clear" value={clearCount} />
        <MetricCard label="Needs Review" value={considerCount} />
        <MetricCard label="Failed" value={suspendedCount} />
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={statusFilter} onChange={setStatusFilter}>
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="clear">Clear</option>
          <option value="consider">Needs Review</option>
          <option value="suspended">Suspended</option>
        </Select>

        <Select value={providerFilter} onChange={setProviderFilter}>
          <option value="all">All Providers</option>
          <option value="checkr">Checkr</option>
          <option value="truora">Truora</option>
        </Select>
      </div>

      {/* Background Checks Table */}
      <BackgroundChecksTable
        checks={filteredChecks}
        onViewDetails={handleViewDetails}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
```

**Detail Modal:**

```tsx
export function BackgroundCheckDetailModal({ check }: Props) {
  return (
    <Dialog>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Background Check Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Professional Info */}
          <ProfessionalSummary professional={check.professional} />

          {/* Check Status */}
          <StatusBadge status={check.status} />

          {/* Check Results (from provider) */}
          <div className="grid grid-cols-2 gap-4">
            <DetailCard
              label="Criminal Records"
              value={check.result_data.criminal_records}
              status={check.result_data.criminal_records_status}
            />
            <DetailCard
              label="Judicial Records"
              value={check.result_data.judicial_records}
              status={check.result_data.judicial_records_status}
            />
            <DetailCard
              label="Disciplinary Records"
              value={check.result_data.disciplinary_records}
              status={check.result_data.disciplinary_records_status}
            />
            <DetailCard
              label="Identity Validation"
              value={check.result_data.identity_validation}
              status={check.result_data.identity_validation_status}
            />
          </div>

          {/* Admin Actions */}
          <div className="flex gap-4">
            <Button onClick={onApprove} variant="success">
              Approve Professional
            </Button>
            <Button onClick={onReject} variant="danger">
              Reject Application
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 4. Professional Vetting

### A. Onboarding Statuses

**Progression:**

```typescript
export type OnboardingStatus =
  | "application_pending"       // Initial application submitted
  | "application_in_review"     // Admin reviewing application
  | "approved"                  // Approved, building profile
  | "active"                    // Profile complete, live on platform
  | "suspended"                 // Account suspended
  | "rejected";                 // Application rejected

// Flow:
// application_pending → application_in_review → approved → active
//                                            ↘ rejected
//                                            ↘ suspended (later)
```

**Database:**

```sql
ALTER TABLE public.professional_profiles
ADD COLUMN IF NOT EXISTS onboarding_status text DEFAULT 'application_pending';

CREATE INDEX idx_professional_profiles_onboarding_status
  ON public.professional_profiles(onboarding_status);
```

---

### B. Admin Review Process

**File:** `/src/components/admin/professional-review-modal.tsx`

**Review Checklist:**

```tsx
export function ProfessionalReviewModal({ professional }: Props) {
  const [documentsVerified, setDocumentsVerified] = useState(false);
  const [referencesVerified, setReferencesVerified] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [backgroundCheckPassed, setBackgroundCheckPassed] = useState(false);
  const [action, setAction] = useState<"approve" | "reject" | "request_info">("approve");
  const [notes, setNotes] = useState("");

  const handleSubmit = async () => {
    await submitProfessionalReview({
      professionalId: professional.id,
      action,
      documentsVerified,
      referencesVerified,
      interviewCompleted,
      backgroundCheckPassed,
      notes,
    });
  };

  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review Professional Application</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Professional Info */}
          <ProfessionalSummaryCard professional={professional} />

          {/* Verification Checklist */}
          <div className="space-y-3 border-t pt-4">
            <h3 className="font-semibold">Verification Checklist</h3>

            <Checkbox
              checked={documentsVerified}
              onChange={setDocumentsVerified}
              label="Documents Verified (ID, proof of address)"
            />

            <Checkbox
              checked={referencesVerified}
              onChange={setReferencesVerified}
              label="References Verified (contacted references)"
            />

            <Checkbox
              checked={interviewCompleted}
              onChange={setInterviewCompleted}
              label="Interview Completed (in-person or video)"
            />

            <Checkbox
              checked={backgroundCheckPassed}
              onChange={setBackgroundCheckPassed}
              label="Background Check Passed"
            />
          </div>

          {/* Action Selection */}
          <div className="border-t pt-4">
            <label className="font-semibold">Decision</label>
            <Select value={action} onChange={setAction}>
              <option value="approve">Approve Application</option>
              <option value="reject">Reject Application</option>
              <option value="request_info">Request More Information</option>
            </Select>
          </div>

          {/* Internal Notes */}
          <textarea
            placeholder="Internal notes (visible to admins only)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full rounded-lg border p-2"
          />

          {/* Submit */}
          <Button onClick={handleSubmit} className="w-full">
            Submit Review
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

### C. Interview System

**Purpose:** In-person or video interviews with professional applicants

**Database Schema:**

```sql
CREATE TYPE interview_status AS ENUM (
  'scheduled',
  'completed',
  'no_show',
  'rescheduled',
  'cancelled'
);

CREATE TABLE public.interview_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL,
  location text NOT NULL, -- 'office', 'video', 'phone'
  location_address jsonb DEFAULT '{}'::jsonb,
  status interview_status NOT NULL DEFAULT 'scheduled',
  interview_notes text,
  completed_by uuid REFERENCES public.profiles(id), -- Admin who conducted interview
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),

  -- Prevent double-booking
  UNIQUE(professional_id, scheduled_at)
);
```

**Interview Scheduling API:**

```typescript
// POST /api/admin/interviews
export async function POST(request: Request) {
  const { professionalId, scheduledAt, location, locationAddress } = await request.json();

  const { data: interview } = await supabase
    .from("interview_slots")
    .insert({
      professional_id: professionalId,
      scheduled_at: scheduledAt,
      location,
      location_address: locationAddress,
      status: "scheduled",
    })
    .select()
    .single();

  // Send email notification
  await sendInterviewInvitationEmail(professional.email, interview);

  return NextResponse.json({ success: true, interview });
}

// POST /api/admin/interviews/[id]/complete
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { notes } = await request.json();
  const adminId = await getAuthenticatedAdminId();

  const { data: interview } = await supabase
    .from("interview_slots")
    .update({
      status: "completed",
      interview_notes: notes,
      completed_by: adminId,
      completed_at: new Date().toISOString(),
    })
    .eq("id", params.id)
    .select()
    .single();

  return NextResponse.json({ success: true, interview });
}
```

**Interview Dashboard:**

```tsx
export function InterviewScheduleDashboard() {
  return (
    <div className="space-y-6">
      {/* Calendar View */}
      <Calendar
        interviews={interviews}
        onScheduleInterview={handleSchedule}
        onRescheduleInterview={handleReschedule}
      />

      {/* Upcoming Interviews */}
      <div>
        <h3 className="font-semibold mb-4">Upcoming Interviews</h3>
        <InterviewsList
          interviews={upcomingInterviews}
          onMarkCompleted={handleMarkCompleted}
          onMarkNoShow={handleMarkNoShow}
        />
      </div>

      {/* Completed Interviews (Needs Follow-up) */}
      <div>
        <h3 className="font-semibold mb-4">Completed - Pending Approval</h3>
        <InterviewsList
          interviews={completedInterviews}
          onViewNotes={handleViewNotes}
          onApprove={handleApprove}
        />
      </div>
    </div>
  );
}
```

---

### D. Professional Vetting Queue

**File:** `/src/app/api/admin/professionals/queue/route.ts`

**Purpose:** Group professionals by onboarding status for admin review

```typescript
export async function GET(request: Request) {
  const supabase = await createServiceClient();

  const { data: professionals } = await supabase
    .from("professional_profiles")
    .select(`
      profile_id,
      onboarding_status,
      created_at,
      profiles (
        id,
        full_name,
        email,
        phone
      ),
      background_checks (
        id,
        status,
        completed_at
      ),
      interview_slots (
        id,
        status,
        scheduled_at
      )
    `)
    .in("onboarding_status", ["application_pending", "application_in_review", "approved"])
    .order("created_at", { ascending: true });

  // Group by status
  const queue = {
    application_pending: professionals.filter(p => p.onboarding_status === "application_pending"),
    application_in_review: professionals.filter(p => p.onboarding_status === "application_in_review"),
    approved: professionals.filter(p => p.onboarding_status === "approved"),
  };

  return NextResponse.json(queue);
}
```

**Vetting Dashboard:**

```tsx
export function ProfessionalVettingDashboard() {
  const { data: queue } = useQuery({
    queryKey: ["professional-queue"],
    queryFn: fetchProfessionalQueue,
  });

  return (
    <div className="space-y-8">
      {/* Application Pending (Needs Immediate Attention) */}
      <div>
        <h2 className="text-xl font-bold mb-4">
          New Applications ({queue.application_pending.length})
        </h2>
        <ProfessionalsTable
          professionals={queue.application_pending}
          onReview={handleReview}
        />
      </div>

      {/* In Review (Admin Currently Reviewing) */}
      <div>
        <h2 className="text-xl font-bold mb-4">
          In Review ({queue.application_in_review.length})
        </h2>
        <ProfessionalsTable
          professionals={queue.application_in_review}
          onContinueReview={handleContinueReview}
        />
      </div>

      {/* Approved (Ready for Activation) */}
      <div>
        <h2 className="text-xl font-bold mb-4">
          Approved - Pending Activation ({queue.approved.length})
        </h2>
        <ProfessionalsTable
          professionals={queue.approved}
          onActivate={handleActivate}
        />
      </div>
    </div>
  );
}
```

---

## 5. GPS Check-In/Check-Out

### A. GPS Verification Utility

**File:** `/src/lib/gps-verification.ts`

**Purpose:** Verify professional is at booking location using Haversine formula

```typescript
export interface GPSCoordinates {
  latitude: number;
  longitude: number;
}

export interface GPSVerificationResult {
  verified: boolean;
  distance: number; // Distance in meters
  maxDistance: number;
  reason?: string;
}

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(
  coord1: GPSCoordinates,
  coord2: GPSCoordinates
): number {
  const R = 6371e3; // Earth radius in meters

  const φ1 = (coord1.latitude * Math.PI) / 180;
  const φ2 = (coord2.latitude * Math.PI) / 180;
  const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in meters
  return Math.round(distance);
}

/**
 * Verify professional is within acceptable distance of booking address
 * Default: 150 meters (soft enforcement)
 */
export function verifyGPSProximity(
  currentLocation: GPSCoordinates,
  targetLocation: GPSCoordinates,
  maxDistanceMeters = 150
): GPSVerificationResult {
  const distance = calculateDistance(currentLocation, targetLocation);

  const verified = distance <= maxDistanceMeters;

  return {
    verified,
    distance,
    maxDistance: maxDistanceMeters,
    reason: verified
      ? undefined
      : `Distance of ${distance}m exceeds maximum allowed distance of ${maxDistanceMeters}m`,
  };
}
```

**Why 150 meters?**
- GPS accuracy varies (5-20 meters typical)
- Addresses may have inaccurate coordinates
- Professionals may park nearby
- **Soft enforcement:** Logs warning but doesn't block check-in

---

### B. Check-In API

**File:** `/src/app/api/bookings/check-in/route.ts`

```typescript
import { withProfessional } from "@/lib/api-middleware";
import { verifyGPSProximity } from "@/lib/gps-verification";
import { logger } from "@/lib/logger";

export const POST = withProfessional(async ({ user, supabase }, request: Request) => {
  try {
    const body = await request.json();
    const { bookingId, latitude, longitude } = body;

    // Validate input
    if (!bookingId || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify professional owns this booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, status, address, latitude as booking_latitude, longitude as booking_longitude")
      .eq("id", bookingId)
      .eq("professional_id", user.id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: "Booking not found or unauthorized" },
        { status: 404 }
      );
    }

    // Check booking status
    if (booking.status !== "confirmed") {
      return NextResponse.json(
        { error: "Booking must be confirmed before check-in" },
        { status: 400 }
      );
    }

    // GPS Verification (soft enforcement)
    const gpsVerification = verifyGPSProximity(
      { latitude, longitude },
      {
        latitude: booking.booking_latitude,
        longitude: booking.booking_longitude
      },
      150 // 150 meters
    );

    // Log verification result
    if (!gpsVerification.verified) {
      await logger.warn("Professional checking in from unexpected location", {
        bookingId,
        professionalId: user.id,
        distance: gpsVerification.distance,
        maxDistance: gpsVerification.maxDistance,
        severity: "MEDIUM",
        actionRecommended: "Review check-in location for potential fraud",
      });
    } else {
      await logger.info("GPS verification successful at check-in", {
        bookingId,
        distance: gpsVerification.distance,
      });
    }

    // Update booking (check-in regardless of GPS result for now)
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "in_progress",
        checked_in_at: new Date().toISOString(),
        check_in_latitude: latitude,
        check_in_longitude: longitude,
      })
      .eq("id", bookingId);

    if (updateError) {
      throw updateError;
    }

    // Send notification to customer
    await sendNotification({
      userId: booking.customer_id,
      type: "service_started",
      title: "Service Started",
      body: `${professional.full_name} has checked in and started your service.`,
    });

    return NextResponse.json({
      success: true,
      gpsVerification,
    });

  } catch (error) {
    console.error("Check-in error:", error);
    return NextResponse.json(
      { error: "Failed to check in" },
      { status: 500 }
    );
  }
});
```

---

### C. Check-Out API

**File:** `/src/app/api/bookings/check-out/route.ts`

```typescript
export const POST = withProfessional(async ({ user, supabase }, request: Request) => {
  const { bookingId, latitude, longitude } = await request.json();

  // Verify ownership and status
  const { data: booking } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .eq("professional_id", user.id)
    .single();

  if (booking.status !== "in_progress") {
    return NextResponse.json(
      { error: "Booking must be in progress to check out" },
      { status: 400 }
    );
  }

  // GPS Verification
  const gpsVerification = verifyGPSProximity(
    { latitude, longitude },
    { latitude: booking.latitude, longitude: booking.longitude },
    150
  );

  // Log GPS result
  if (!gpsVerification.verified) {
    await logger.warn("Professional checking out from unexpected location", {
      bookingId,
      distance: gpsVerification.distance,
    });
  }

  // Update booking
  await supabase
    .from("bookings")
    .update({
      status: "completed",
      checked_out_at: new Date().toISOString(),
      check_out_latitude: latitude,
      check_out_longitude: longitude,
    })
    .eq("id", bookingId);

  // Calculate actual duration
  const checkedInAt = new Date(booking.checked_in_at);
  const checkedOutAt = new Date();
  const actualDurationMinutes = Math.round(
    (checkedOutAt.getTime() - checkedInAt.getTime()) / (1000 * 60)
  );

  // Send notification to customer
  await sendNotification({
    userId: booking.customer_id,
    type: "service_completed",
    title: "Service Completed",
    body: `${professional.full_name} has completed your service. Please review the work.`,
  });

  return NextResponse.json({
    success: true,
    actualDurationMinutes,
    gpsVerification,
  });
});
```

---

### D. GPS Tracking in Mobile App

**Location:** `/mobile/lib/gps-tracking.ts`

```typescript
import * as Location from 'expo-location';

export async function getCurrentLocation(): Promise<GPSCoordinates> {
  // Request permissions
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== 'granted') {
    throw new Error('Location permission denied');
  }

  // Get current position
  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High, // Best accuracy
  });

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}

export async function checkInWithGPS(bookingId: string) {
  const location = await getCurrentLocation();

  const response = await fetch('/api/bookings/check-in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bookingId,
      latitude: location.latitude,
      longitude: location.longitude,
    }),
  });

  return response.json();
}
```

---

## 6. Emergency Contact System

### Database Schema

```sql
-- Both professional and customer profiles have emergency contacts
ALTER TABLE public.professional_profiles
ADD COLUMN IF NOT EXISTS emergency_contact jsonb DEFAULT '{}'::jsonb;

ALTER TABLE public.customer_profiles
ADD COLUMN IF NOT EXISTS emergency_contact jsonb DEFAULT '{}'::jsonb;

-- Emergency contact structure:
-- {
--   name: string,
--   relationship: string,
--   phone: string,
--   alternate_phone?: string
-- }

COMMENT ON COLUMN public.professional_profiles.emergency_contact IS
  'Emergency contact information for safety purposes during bookings';
```

**Type Definition:**

```typescript
export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  alternate_phone?: string;
}
```

---

### Collection During Onboarding

**File:** `/src/components/onboarding/emergency-contact-step.tsx`

```tsx
export function EmergencyContactStep() {
  const [emergencyContact, setEmergencyContact] = useState<EmergencyContact>({
    name: "",
    relationship: "",
    phone: "",
    alternate_phone: "",
  });

  const handleSubmit = async () => {
    await supabase
      .from("professional_profiles")
      .update({
        emergency_contact: emergencyContact,
      })
      .eq("profile_id", userId);

    onNextStep();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Emergency Contact</h2>
        <p className="text-gray-600">
          Who should we contact in case of emergency during a booking?
        </p>
      </div>

      <div className="space-y-4">
        <Input
          label="Name *"
          value={emergencyContact.name}
          onChange={(e) => setEmergencyContact({ ...emergencyContact, name: e.target.value })}
          required
        />

        <Select
          label="Relationship *"
          value={emergencyContact.relationship}
          onChange={(e) => setEmergencyContact({ ...emergencyContact, relationship: e.target.value })}
          required
        >
          <option value="">Select relationship</option>
          <option value="spouse">Spouse/Partner</option>
          <option value="parent">Parent</option>
          <option value="sibling">Sibling</option>
          <option value="child">Child</option>
          <option value="friend">Friend</option>
          <option value="other">Other</option>
        </Select>

        <Input
          label="Phone Number *"
          type="tel"
          placeholder="+57 300 1234567"
          value={emergencyContact.phone}
          onChange={(e) => setEmergencyContact({ ...emergencyContact, phone: e.target.value })}
          required
        />

        <Input
          label="Alternate Phone (Optional)"
          type="tel"
          placeholder="+57 300 1234567"
          value={emergencyContact.alternate_phone}
          onChange={(e) => setEmergencyContact({ ...emergencyContact, alternate_phone: e.target.value })}
        />
      </div>

      <Button onClick={handleSubmit} disabled={!isValid}>
        Continue
      </Button>
    </div>
  );
}
```

---

### Emergency Button (Future Enhancement)

**Proposed UI in Active Booking:**

```tsx
export function ActiveBookingCard({ booking }: Props) {
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);

  const handleEmergency = async () => {
    // 1. Call emergency contact
    await makePhoneCall(booking.professional.emergency_contact.phone);

    // 2. Notify admin
    await notifyAdmin({
      type: "emergency",
      bookingId: booking.id,
      severity: "critical",
    });

    // 3. Log incident
    await logEmergencyIncident(booking.id);

    // 4. Pause booking
    await pauseBooking(booking.id);
  };

  return (
    <Card>
      {/* Booking details */}

      {/* Emergency Button (prominent, red) */}
      <Button
        variant="danger"
        size="lg"
        className="w-full"
        onClick={() => setShowEmergencyDialog(true)}
      >
        🚨 Emergency
      </Button>

      <EmergencyDialog
        isOpen={showEmergencyDialog}
        onClose={() => setShowEmergencyDialog(false)}
        onConfirm={handleEmergency}
      />
    </Card>
  );
}
```

---

## 7. Dispute Resolution

### A. Database Schema

```sql
CREATE TYPE dispute_status AS ENUM (
  'open',
  'investigating',
  'resolved',
  'closed'
);

CREATE TYPE dispute_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

CREATE TABLE public.booking_disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason text NOT NULL, -- 'incomplete_service', 'quality_issues', 'late_arrival', etc.
  description text NOT NULL,
  status dispute_status NOT NULL DEFAULT 'open',
  priority dispute_priority NOT NULL DEFAULT 'medium',
  evidence_urls text[] DEFAULT '{}'::text[], -- Photo evidence
  resolution_notes text,
  resolved_by uuid REFERENCES public.profiles(id),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- Only one dispute per booking
  UNIQUE(booking_id)
);

-- Indexes
CREATE INDEX idx_booking_disputes_status
  ON public.booking_disputes(status);

CREATE INDEX idx_booking_disputes_customer_id
  ON public.booking_disputes(customer_id);

CREATE INDEX idx_booking_disputes_professional_id
  ON public.booking_disputes(professional_id);
```

---

### B. Dispute Reasons

**File:** `/src/components/bookings/dispute-modal.tsx`

```typescript
export const DISPUTE_REASONS = [
  {
    value: "incomplete_service",
    label: "Service was incomplete or not performed",
    description: "Professional did not complete all agreed-upon tasks"
  },
  {
    value: "quality_issues",
    label: "Quality of service did not meet expectations",
    description: "Work quality was below standard or poorly executed"
  },
  {
    value: "late_arrival",
    label: "Professional arrived significantly late",
    description: "Arrival was more than 30 minutes past scheduled time"
  },
  {
    value: "no_show",
    label: "Professional did not show up",
    description: "Professional failed to arrive without prior notice"
  },
  {
    value: "property_damage",
    label: "Damage to property or belongings",
    description: "Professional caused damage during service"
  },
  {
    value: "unprofessional_conduct",
    label: "Unprofessional or inappropriate behavior",
    description: "Conduct was rude, disrespectful, or inappropriate"
  },
  {
    value: "safety_concern",
    label: "Safety or security concern",
    description: "Felt unsafe or noticed suspicious behavior"
  },
  {
    value: "other",
    label: "Other issue",
    description: "Issue not covered by other categories"
  }
] as const;
```

---

### C. 48-Hour Protection Window

**Utility:**

```typescript
/**
 * Check if booking is within 48-hour dispute window
 * Customers can only file disputes within 48 hours of service completion
 */
export function isWithinDisputeWindow(
  booking: { status: string; scheduled_start: string },
  completedAt?: string
): boolean {
  if (booking.status !== "completed") {
    return false;
  }

  const completionDate = completedAt
    ? new Date(completedAt)
    : new Date(booking.scheduled_start);

  const hoursSinceCompletion =
    (Date.now() - completionDate.getTime()) / (1000 * 60 * 60);

  return hoursSinceCompletion <= 48;
}
```

---

### D. Dispute Submission

**File:** `/src/app/api/bookings/disputes/route.ts`

```typescript
// POST /api/bookings/disputes
export async function POST(request: Request) {
  try {
    const { bookingId, reason, description, evidenceUrls } = await request.json();

    // Authenticate
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .eq("customer_id", user.id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Check if booking is completed
    if (booking.status !== "completed") {
      return NextResponse.json(
        { error: "Can only dispute completed bookings" },
        { status: 400 }
      );
    }

    // Check 48-hour window
    const withinWindow = isWithinDisputeWindow(booking, booking.checked_out_at);
    if (!withinWindow) {
      return NextResponse.json(
        { error: "Disputes must be filed within 48 hours of service completion" },
        { status: 400 }
      );
    }

    // Check for existing dispute
    const { data: existingDispute } = await supabase
      .from("booking_disputes")
      .select("id")
      .eq("booking_id", bookingId)
      .maybeSingle();

    if (existingDispute) {
      return NextResponse.json(
        { error: "Dispute already exists for this booking" },
        { status: 400 }
      );
    }

    // Determine priority based on reason
    const priority = determinePriority(reason);

    // Create dispute
    const { data: dispute, error: disputeError } = await supabase
      .from("booking_disputes")
      .insert({
        booking_id: bookingId,
        customer_id: user.id,
        professional_id: booking.professional_id,
        reason,
        description,
        evidence_urls: evidenceUrls || [],
        status: "open",
        priority,
      })
      .select()
      .single();

    if (disputeError) {
      throw disputeError;
    }

    // Notify admin
    await notifyAdmin({
      type: "new_dispute",
      disputeId: dispute.id,
      priority,
    });

    // Send email to customer
    await sendDisputeConfirmationEmail(user.email, dispute);

    return NextResponse.json({ success: true, dispute });

  } catch (error) {
    console.error("Dispute submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit dispute" },
      { status: 500 }
    );
  }
}

function determinePriority(reason: string): "low" | "medium" | "high" | "urgent" {
  if (reason === "safety_concern" || reason === "property_damage") {
    return "urgent";
  }
  if (reason === "no_show" || reason === "unprofessional_conduct") {
    return "high";
  }
  if (reason === "incomplete_service" || reason === "quality_issues") {
    return "medium";
  }
  return "low";
}
```

---

### E. Admin Resolution Dashboard

**File:** `/src/components/admin/dispute-resolution-dashboard.tsx`

```tsx
export function DisputeResolutionDashboard() {
  const [statusFilter, setStatusFilter] = useState<DisputeStatus | "all">("open");
  const [priorityFilter, setPriorityFilter] = useState<DisputePriority | "all">("all");

  const { data: disputes } = useQuery({
    queryKey: ["admin-disputes", statusFilter, priorityFilter],
    queryFn: () => fetchDisputes(statusFilter, priorityFilter),
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          label="Open"
          value={disputes.filter(d => d.status === "open").length}
          variant="danger"
        />
        <MetricCard
          label="Investigating"
          value={disputes.filter(d => d.status === "investigating").length}
          variant="warning"
        />
        <MetricCard
          label="Resolved"
          value={disputes.filter(d => d.status === "resolved").length}
          variant="success"
        />
        <MetricCard
          label="Avg Resolution Time"
          value={`${avgResolutionTimeHours}h`}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={statusFilter} onChange={setStatusFilter}>
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="investigating">Investigating</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </Select>

        <Select value={priorityFilter} onChange={setPriorityFilter}>
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </Select>
      </div>

      {/* Disputes Table */}
      <DisputesTable
        disputes={disputes}
        onViewDetails={handleViewDetails}
        onMarkInvestigating={handleMarkInvestigating}
        onResolve={handleResolve}
      />
    </div>
  );
}
```

**Resolution Modal:**

```tsx
export function DisputeResolutionModal({ dispute }: Props) {
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [action, setAction] = useState<"refund_customer" | "no_action" | "suspend_professional">("no_action");

  const handleResolve = async () => {
    await resolveDispute({
      disputeId: dispute.id,
      resolutionNotes,
      action,
    });
  };

  return (
    <Dialog>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Resolve Dispute</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Dispute Details */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Customer</h3>
              <UserCard user={dispute.customer} />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Professional</h3>
              <UserCard user={dispute.professional} />
            </div>
          </div>

          {/* Booking Details */}
          <BookingSummary booking={dispute.booking} />

          {/* Dispute Information */}
          <div>
            <h3 className="font-semibold mb-2">Dispute Details</h3>
            <div className="space-y-2">
              <p><strong>Reason:</strong> {formatDisputeReason(dispute.reason)}</p>
              <p><strong>Description:</strong> {dispute.description}</p>
              {dispute.evidence_urls.length > 0 && (
                <div>
                  <strong>Evidence:</strong>
                  <div className="flex gap-2 mt-2">
                    {dispute.evidence_urls.map((url, i) => (
                      <img key={i} src={url} alt={`Evidence ${i + 1}`} className="w-24 h-24 object-cover rounded" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resolution Action */}
          <div>
            <label className="font-semibold">Resolution Action</label>
            <Select value={action} onChange={setAction}>
              <option value="no_action">No Action Required</option>
              <option value="refund_customer">Issue Refund to Customer</option>
              <option value="suspend_professional">Suspend Professional</option>
            </Select>
          </div>

          {/* Resolution Notes */}
          <textarea
            placeholder="Resolution notes (visible to customer and professional)"
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            rows={4}
            className="w-full rounded-lg border p-2"
            required
          />

          {/* Submit */}
          <Button onClick={handleResolve} className="w-full">
            Resolve Dispute
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 8. User Blocking & Suspension

### A. User Blocking (Mutual)

**Database Schema:**

```sql
CREATE TABLE public.user_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),

  -- Prevent duplicate blocks
  UNIQUE(blocker_id, blocked_id),

  -- Prevent self-blocking
  CHECK (blocker_id != blocked_id)
);

-- Helper function to check if users have blocked each other
CREATE FUNCTION public.are_users_blocked(user1_id uuid, user2_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_blocks
    WHERE (blocker_id = user1_id AND blocked_id = user2_id)
       OR (blocker_id = user2_id AND blocked_id = user1_id)
  );
$$;
```

**RLS Policies:**

```sql
-- Enable RLS
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

-- Users can view blocks they created or that target them
CREATE POLICY "Users can view relevant blocks"
  ON public.user_blocks FOR SELECT
  TO authenticated
  USING (
    blocker_id = (SELECT auth.uid())
    OR blocked_id = (SELECT auth.uid())
  );

-- Users can create blocks
CREATE POLICY "Users can create blocks"
  ON public.user_blocks FOR INSERT
  TO authenticated
  WITH CHECK (blocker_id = (SELECT auth.uid()));

-- Users can delete blocks they created
CREATE POLICY "Users can delete their own blocks"
  ON public.user_blocks FOR DELETE
  TO authenticated
  USING (blocker_id = (SELECT auth.uid()));
```

**API Endpoints:**

```typescript
// POST /api/users/block
export async function POST(request: Request) {
  const { userId, reason } = await request.json();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Prevent self-blocking (database constraint also prevents this)
  if (userId === user.id) {
    return NextResponse.json(
      { error: "Cannot block yourself" },
      { status: 400 }
    );
  }

  // Create block
  const { data: block, error } = await supabase
    .from("user_blocks")
    .insert({
      blocker_id: user.id,
      blocked_id: userId,
      reason,
    })
    .select()
    .single();

  if (error) {
    // Check for duplicate block (unique constraint)
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "User is already blocked" },
        { status: 400 }
      );
    }
    throw error;
  }

  return NextResponse.json({ success: true, block });
}

// DELETE /api/users/block/[userId]
export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Delete block
  const { error } = await supabase
    .from("user_blocks")
    .delete()
    .eq("blocker_id", user.id)
    .eq("blocked_id", params.userId);

  if (error) throw error;

  return NextResponse.json({ success: true });
}
```

---

### B. Account Suspension System

**Database Schema:**

```sql
CREATE TYPE suspension_type AS ENUM (
  'temporary',
  'permanent'
);

CREATE TABLE public.user_suspensions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  suspended_by uuid NOT NULL REFERENCES public.profiles(id),
  suspension_type suspension_type NOT NULL,
  reason text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  expires_at timestamptz, -- NULL for permanent bans
  lifted_at timestamptz,
  lifted_by uuid REFERENCES public.profiles(id),
  lift_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for checking active suspensions
CREATE INDEX idx_user_suspensions_user_id_active
  ON public.user_suspensions(user_id)
  WHERE lifted_at IS NULL;
```

---

### C. Moderation API

**File:** `/src/app/api/admin/users/moderate/route.ts`

```typescript
export async function POST(request: Request) {
  try {
    const { userId, action, reason, liftReason, durationDays, details } = await request.json();

    // Authenticate admin
    const supabase = await createServiceClient();
    const adminId = await getAuthenticatedAdminId();

    // Prevent self-moderation
    if (userId === adminId) {
      return NextResponse.json(
        { error: "Cannot moderate your own account" },
        { status: 400 }
      );
    }

    // Get user role
    const { data: targetUser } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    // Prevent admin-to-admin moderation
    if (targetUser.role === "admin") {
      return NextResponse.json(
        { error: "Cannot moderate admin accounts" },
        { status: 403 }
      );
    }

    if (action === "suspend") {
      // Check if already suspended
      const { data: existingSuspension } = await supabase
        .from("user_suspensions")
        .select("id")
        .eq("user_id", userId)
        .is("lifted_at", null)
        .maybeSingle();

      if (existingSuspension) {
        return NextResponse.json(
          { error: "User is already suspended" },
          { status: 400 }
        );
      }

      // Calculate expiry date (default 7 days)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (durationDays || 7));

      // Create suspension
      const { data: suspension } = await supabase
        .from("user_suspensions")
        .insert({
          user_id: userId,
          suspended_by: adminId,
          suspension_type: "temporary",
          reason,
          details: details || {},
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      // Update professional status if applicable
      await supabase
        .from("professional_profiles")
        .update({ onboarding_status: "suspended" })
        .eq("profile_id", userId);

      // Send email notification
      await sendAccountSuspensionEmail(
        targetUser.email,
        targetUser.full_name,
        reason,
        expiresAt,
        durationDays
      );

      // Create audit log
      await createAuditLog({
        adminId,
        actionType: "suspend_user",
        targetUserId: userId,
        details: { reason, durationDays, expiresAt },
        notes: reason,
      });

      return NextResponse.json({ success: true, suspension });

    } else if (action === "ban") {
      // Permanent ban
      const { data: suspension } = await supabase
        .from("user_suspensions")
        .insert({
          user_id: userId,
          suspended_by: adminId,
          suspension_type: "permanent",
          reason,
          details: details || {},
          expires_at: null,
        })
        .select()
        .single();

      // Update professional status
      await supabase
        .from("professional_profiles")
        .update({ onboarding_status: "suspended" })
        .eq("profile_id", userId);

      // Send email
      await sendAccountBanEmail(targetUser.email, targetUser.full_name, reason);

      // Audit log
      await createAuditLog({
        adminId,
        actionType: "ban_user",
        targetUserId: userId,
        details: { reason },
        notes: reason,
      });

      return NextResponse.json({ success: true, suspension });

    } else if (action === "unsuspend") {
      // Lift suspension
      const { data: suspension } = await supabase
        .from("user_suspensions")
        .update({
          lifted_at: new Date().toISOString(),
          lifted_by: adminId,
          lift_reason: liftReason,
        })
        .eq("user_id", userId)
        .is("lifted_at", null)
        .select()
        .single();

      if (!suspension) {
        return NextResponse.json(
          { error: "No active suspension found" },
          { status: 404 }
        );
      }

      // Restore professional status
      await supabase
        .from("professional_profiles")
        .update({ onboarding_status: "active" })
        .eq("profile_id", userId);

      // Send email
      await sendAccountRestorationEmail(
        targetUser.email,
        targetUser.full_name,
        liftReason
      );

      // Audit log
      await createAuditLog({
        adminId,
        actionType: "unsuspend_user",
        targetUserId: userId,
        details: { liftReason },
        notes: liftReason,
      });

      return NextResponse.json({ success: true, suspension });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error("Moderation error:", error);
    return NextResponse.json(
      { error: "Failed to moderate user" },
      { status: 500 }
    );
  }
}
```

---

### D. Suspension Page

**File:** `/src/app/[locale]/support/account-suspended/page.tsx`

**Purpose:** Page shown to suspended professional accounts

```tsx
export default async function AccountSuspendedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  // Get suspension details
  const { data: suspension } = await supabase
    .from("user_suspensions")
    .select("*")
    .eq("user_id", user.id)
    .is("lifted_at", null)
    .single();

  const isPermanent = suspension.suspension_type === "permanent";
  const expiresAt = suspension.expires_at ? new Date(suspension.expires_at) : null;
  const daysRemaining = expiresAt
    ? Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="max-w-2xl w-full p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <ShieldAlertIcon className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Account Suspended
          </h1>
          <p className="text-gray-600">
            Your account has been {isPermanent ? "permanently suspended" : "temporarily suspended"}
          </p>
        </div>

        <div className="space-y-4">
          {/* Reason */}
          <div>
            <h2 className="font-semibold text-gray-900 mb-2">Reason for Suspension</h2>
            <p className="text-gray-700 bg-gray-50 rounded-lg p-4">
              {suspension.reason}
            </p>
          </div>

          {/* Duration (for temporary) */}
          {!isPermanent && expiresAt && (
            <div>
              <h2 className="font-semibold text-gray-900 mb-2">Suspension Duration</h2>
              <p className="text-gray-700">
                Your account will be automatically restored on{" "}
                <strong>{expiresAt.toLocaleDateString()}</strong>{" "}
                ({daysRemaining} days remaining).
              </p>
            </div>
          )}

          {/* Permanent Ban Message */}
          {isPermanent && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">
                This suspension is permanent and cannot be automatically lifted.
              </p>
            </div>
          )}

          {/* Contact Support */}
          <div>
            <h2 className="font-semibold text-gray-900 mb-2">Have Questions?</h2>
            <p className="text-gray-700 mb-3">
              If you believe this suspension was made in error or have questions, please contact our support team.
            </p>
            <Button asChild variant="outline" className="w-full">
              <a href="mailto:support@casaora.co">Contact Support</a>
            </Button>
          </div>
        </div>

        {/* Return Home */}
        <div className="mt-6 text-center">
          <Button asChild variant="ghost">
            <a href="/">Return to Home</a>
          </Button>
        </div>
      </Card>
    </div>
  );
}
```

---

## 9. Insurance Claims

### Database Schema

```sql
CREATE TYPE claim_type AS ENUM (
  'damage',
  'theft',
  'injury',
  'other'
);

CREATE TYPE claim_status AS ENUM (
  'filed',
  'investigating',
  'approved',
  'denied',
  'paid'
);

CREATE TABLE public.insurance_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  filed_by uuid NOT NULL REFERENCES public.profiles(id),
  claim_type claim_type NOT NULL,
  description text NOT NULL,
  estimated_cost integer, -- Amount in cents
  evidence_urls text[] DEFAULT '{}'::text[], -- Supabase Storage URLs
  status claim_status NOT NULL DEFAULT 'filed',
  payout_amount integer,
  resolution_notes text,
  resolved_by uuid REFERENCES public.profiles(id),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- Unique constraint prevents duplicate claims per booking
  UNIQUE(booking_id, filed_by)
);

-- Indexes
CREATE INDEX idx_insurance_claims_status
  ON public.insurance_claims(status);

CREATE INDEX idx_insurance_claims_filed_by
  ON public.insurance_claims(filed_by);

-- Auto-update updated_at
CREATE TRIGGER set_insurance_claims_updated_at
  BEFORE UPDATE ON public.insurance_claims
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

---

### RLS Policies

```sql
-- Enable RLS
ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;

-- Users can view claims they filed
CREATE POLICY "Users can view their own insurance claims"
  ON public.insurance_claims FOR SELECT
  TO authenticated
  USING (filed_by = (SELECT auth.uid()));

-- Users can create claims for their bookings
CREATE POLICY "Users can create insurance claims"
  ON public.insurance_claims FOR INSERT
  TO authenticated
  WITH CHECK (filed_by = (SELECT auth.uid()));

-- Service role (admins) can manage all claims
CREATE POLICY "Service role can manage all insurance claims"
  ON public.insurance_claims FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);
```

---

### Claim Submission

**API:**

```typescript
// POST /api/insurance/claims
export async function POST(request: Request) {
  const { bookingId, claimType, description, estimatedCost, evidenceUrls } = await request.json();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify booking ownership
  const { data: booking } = await supabase
    .from("bookings")
    .select("id, customer_id, professional_id")
    .eq("id", bookingId)
    .single();

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // User must be customer or professional on this booking
  const isCustomer = booking.customer_id === user.id;
  const isProfessional = booking.professional_id === user.id;

  if (!isCustomer && !isProfessional) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Create claim
  const { data: claim } = await supabase
    .from("insurance_claims")
    .insert({
      booking_id: bookingId,
      filed_by: user.id,
      claim_type: claimType,
      description,
      estimated_cost: estimatedCost * 100, // Convert to cents
      evidence_urls: evidenceUrls || [],
      status: "filed",
    })
    .select()
    .single();

  // Notify admin
  await notifyAdmin({
    type: "new_insurance_claim",
    claimId: claim.id,
    claimType,
  });

  return NextResponse.json({ success: true, claim });
}
```

---

### Admin Claims Dashboard

**File:** `/src/components/admin/insurance-claims-dashboard.tsx`

```tsx
export function InsuranceClaimsDashboard() {
  const { data: claims } = useQuery({
    queryKey: ["admin-insurance-claims"],
    queryFn: fetchInsuranceClaims,
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4">
        <MetricCard label="Filed" value={claimsBy Status.filed} />
        <MetricCard label="Investigating" value={claimsByStatus.investigating} />
        <MetricCard label="Approved" value={claimsByStatus.approved} />
        <MetricCard label="Denied" value={claimsByStatus.denied} />
        <MetricCard label="Paid" value={claimsByStatus.paid} />
      </div>

      {/* Claims Table */}
      <InsuranceClaimsTable
        claims={claims}
        onViewDetails={handleViewDetails}
        onApprove={handleApprove}
        onDeny={handleDeny}
        onMarkPaid={handleMarkPaid}
      />
    </div>
  );
}
```

**Claim Detail Modal:**

```tsx
export function ClaimDetailModal({ claim }: Props) {
  const [payoutAmount, setPayoutAmount] = useState(claim.estimated_cost || 0);
  const [resolutionNotes, setResolutionNotes] = useState("");

  const handleApprove = async () => {
    await approveInsuranceClaim({
      claimId: claim.id,
      payoutAmount: payoutAmount * 100, // Convert to cents
      resolutionNotes,
    });
  };

  return (
    <Dialog>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Insurance Claim Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Claim Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold">Claim Type</label>
              <p>{formatClaimType(claim.claim_type)}</p>
            </div>
            <div>
              <label className="font-semibold">Status</label>
              <StatusBadge status={claim.status} />
            </div>
            <div>
              <label className="font-semibold">Filed By</label>
              <UserCard user={claim.filed_by} />
            </div>
            <div>
              <label className="font-semibold">Estimated Cost</label>
              <p>{formatCurrency(claim.estimated_cost)}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="font-semibold">Description</label>
            <p className="text-gray-700">{claim.description}</p>
          </div>

          {/* Evidence Photos */}
          {claim.evidence_urls.length > 0 && (
            <div>
              <label className="font-semibold">Evidence</label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {claim.evidence_urls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Evidence ${i + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Booking Details */}
          <BookingSummary booking={claim.booking} />

          {/* Admin Actions */}
          {claim.status === "filed" && (
            <div className="space-y-4 border-t pt-4">
              <Input
                label="Payout Amount (COP)"
                type="number"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(Number(e.target.value))}
              />

              <textarea
                placeholder="Resolution notes"
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={3}
                className="w-full rounded-lg border p-2"
              />

              <div className="flex gap-4">
                <Button onClick={handleApprove} variant="success">
                  Approve Claim
                </Button>
                <Button onClick={handleDeny} variant="danger">
                  Deny Claim
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 10. Trust Indicators

### A. Verification Badges

**File:** `/src/components/professionals/verification-badge.tsx`

```tsx
export type VerificationLevel =
  | "none"
  | "basic"
  | "enhanced"
  | "background-check";

interface VerificationBadgeProps {
  level: VerificationLevel;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function VerificationBadge({
  level,
  size = "md",
  showLabel = true
}: VerificationBadgeProps) {
  if (level === "none") return null;

  const config = {
    basic: {
      icon: <ShieldCheckIcon className="size-4" />,
      label: "ID Verified",
      color: "bg-green-100 text-green-700 border-green-200",
    },
    enhanced: {
      icon: <ShieldCheckIcon className="size-4" />,
      label: "Enhanced Verified",
      color: "bg-blue-100 text-blue-700 border-blue-200",
    },
    "background-check": {
      icon: <ShieldCheckIcon className="size-4" />,
      label: "Background Checked",
      color: "bg-purple-100 text-purple-700 border-purple-200",
    },
  };

  const badgeConfig = config[level];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium",
        badgeConfig.color,
        size === "sm" && "px-1.5 py-0.5 text-[10px]",
        size === "lg" && "px-3 py-1.5 text-sm"
      )}
    >
      {badgeConfig.icon}
      {showLabel && <span>{badgeConfig.label}</span>}
    </span>
  );
}
```

---

### B. Trust Card

**File:** `/src/components/professionals/trust-card.tsx`

**Purpose:** Comprehensive trust indicators on professional profile

```tsx
export function TrustCard({ professional }: { professional: ProfessionalProfile }) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Trust & Safety</h3>

      <div className="space-y-4">
        {/* Verification Level */}
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Verification</span>
          <VerificationBadge level={professional.verification_level} />
        </div>

        {/* On-Time Rate (if ≥75%) */}
        {professional.on_time_rate >= 75 && (
          <div className="flex items-center justify-between">
            <span className="text-gray-700">On-Time Rate</span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
              <ClockIcon className="size-4" />
              {professional.on_time_rate}%
            </span>
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Rating</span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
            <StarIcon className="size-4 fill-amber-600" />
            {professional.rating.toFixed(1)} ({professional.review_count} reviews)
          </span>
        </div>

        {/* Background Check Status */}
        {professional.background_check_status === "clear" && (
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Background Check</span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
              <ShieldCheckIcon className="size-4" />
              Clear
            </span>
          </div>
        )}

        {/* Identity Verified */}
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Identity Verified</span>
          <span className="inline-flex items-center gap-1 text-green-600">
            <CheckCircleIcon className="size-5" />
            Yes
          </span>
        </div>

        {/* Response Time */}
        {professional.avg_response_time_hours && (
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Response Time</span>
            <span className="text-gray-900 font-medium">
              ~{professional.avg_response_time_hours}h
            </span>
          </div>
        )}

        {/* Years of Experience */}
        {professional.years_experience && (
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Experience</span>
            <span className="text-gray-900 font-medium">
              {professional.years_experience} {professional.years_experience === 1 ? "year" : "years"}
            </span>
          </div>
        )}
      </div>

      {/* Trust Explanation */}
      <div className="mt-6 pt-4 border-t">
        <p className="text-xs text-gray-500">
          Casaora verifies identity, checks backgrounds, and monitors service quality to ensure your safety.
        </p>
      </div>
    </Card>
  );
}
```

---

### C. Compact Trust Badge

**File:** `/src/components/professionals/compact-trust-badge.tsx`

**Purpose:** Small badge for search results and lists

```tsx
export function CompactTrustBadge({ professional }: Props) {
  const trustScore = calculateTrustScore(professional);

  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-medium text-blue-700">
      <ShieldCheckIcon className="size-3" />
      <span>Verified</span>
    </div>
  );
}

function calculateTrustScore(professional: ProfessionalProfile): number {
  let score = 0;

  // Verification level (max 40 points)
  if (professional.verification_level === "background-check") score += 40;
  else if (professional.verification_level === "enhanced") score += 30;
  else if (professional.verification_level === "basic") score += 20;

  // Rating (max 30 points)
  score += (professional.rating / 5) * 30;

  // Review count (max 15 points)
  score += Math.min(professional.review_count / 20, 1) * 15;

  // On-time rate (max 15 points)
  if (professional.on_time_rate >= 75) {
    score += (professional.on_time_rate / 100) * 15;
  }

  return Math.round(score); // 0-100 score
}
```

---

## 11. SMS Tracking

### Database Schema

```sql
CREATE TYPE sms_status AS ENUM (
  'sent',
  'delivered',
  'failed',
  'undelivered'
);

CREATE TABLE public.sms_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id),
  phone text NOT NULL,
  message text NOT NULL,
  status sms_status NOT NULL,
  provider_message_id text,
  error_message text,
  sent_at timestamptz NOT NULL DEFAULT now()
);

-- Index for user lookup
CREATE INDEX idx_sms_logs_user_id
  ON public.sms_logs(user_id);

-- Index for status tracking
CREATE INDEX idx_sms_logs_status
  ON public.sms_logs(status);

-- SMS preferences in profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS sms_notifications_enabled boolean DEFAULT true;
```

---

### SMS Sending Service

**File:** `/src/lib/sms/send.ts`

```typescript
import twilio from 'twilio';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export async function sendSMS(
  userId: string,
  phone: string,
  message: string
): Promise<void> {
  try {
    // Send SMS via Twilio
    const result = await twilioClient.messages.create({
      body: message,
      to: phone,
      from: process.env.TWILIO_PHONE_NUMBER!,
    });

    // Log to database
    await supabase.from("sms_logs").insert({
      user_id: userId,
      phone,
      message,
      status: "sent",
      provider_message_id: result.sid,
    });

  } catch (error) {
    console.error("SMS send error:", error);

    // Log error
    await supabase.from("sms_logs").insert({
      user_id: userId,
      phone,
      message,
      status: "failed",
      error_message: error instanceof Error ? error.message : "Unknown error",
    });

    throw error;
  }
}
```

---

### SMS Notification Events

**File:** `/src/lib/notifications.ts`

```typescript
export async function sendBookingNotification(
  event: "booking_confirmed" | "service_started" | "service_completed",
  booking: Booking
) {
  // Check user preferences
  const { data: profile } = await supabase
    .from("profiles")
    .select("sms_notifications_enabled")
    .eq("id", booking.customer_id)
    .single();

  if (!profile?.sms_notifications_enabled) {
    return; // User opted out
  }

  const messages = {
    booking_confirmed: `Your booking with ${booking.professional.full_name} is confirmed for ${formatDate(booking.scheduled_start)}.`,
    service_started: `${booking.professional.full_name} has checked in and started your service.`,
    service_completed: `Your service is complete! Please review ${booking.professional.full_name}'s work.`,
  };

  await sendSMS(booking.customer_id, booking.customer.phone, messages[event]);
}
```

---

## 12. Audit Logging

### Database Schema

```sql
CREATE TABLE public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES public.profiles(id),
  action_type text NOT NULL,
  target_user_id uuid REFERENCES public.profiles(id),
  target_resource_type text,
  target_resource_id text,
  details jsonb DEFAULT '{}'::jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_admin_audit_logs_admin_id
  ON public.admin_audit_logs(admin_id);

CREATE INDEX idx_admin_audit_logs_action_type
  ON public.admin_audit_logs(action_type);

CREATE INDEX idx_admin_audit_logs_created_at
  ON public.admin_audit_logs(created_at DESC);
```

---

### Audit Log Creation

**File:** `/src/lib/admin-helpers.ts`

```typescript
export async function createAuditLog({
  adminId,
  actionType,
  targetUserId,
  targetResourceType,
  targetResourceId,
  details,
  notes
}: AuditLogParams) {
  const supabase = await createServiceClient();

  await supabase.from("admin_audit_logs").insert({
    admin_id: adminId,
    action_type: actionType,
    target_user_id: targetUserId,
    target_resource_type: targetResourceType,
    target_resource_id: targetResourceId,
    details: details || {},
    notes,
  });
}

// Tracked action types:
// - suspend_user
// - unsuspend_user
// - ban_user
// - approve_professional
// - reject_professional
// - resolve_dispute
// - approve_background_check
// - reject_background_check
// - update_user_role
// - delete_user_content
```

---

### Audit Dashboard

**File:** `/src/components/admin/audit-logs-dashboard.tsx`

```tsx
export function AuditLogsDashboard() {
  const [actionFilter, setActionFilter] = useState<string | "all">("all");
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  const { data: logs } = useQuery({
    queryKey: ["admin-audit-logs", actionFilter, dateRange],
    queryFn: () => fetchAuditLogs(actionFilter, dateRange),
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4">
        <Select value={actionFilter} onChange={setActionFilter}>
          <option value="all">All Actions</option>
          <option value="suspend_user">Suspend User</option>
          <option value="unsuspend_user">Unsuspend User</option>
          <option value="approve_professional">Approve Professional</option>
          <option value="resolve_dispute">Resolve Dispute</option>
        </Select>

        <DateRangePicker value={dateRange} onChange={setDateRange} />

        <Button onClick={exportAuditLogs} variant="outline">
          Export CSV
        </Button>
      </div>

      {/* Audit Logs Table */}
      <AuditLogsTable
        logs={logs}
        onViewDetails={handleViewDetails}
      />
    </div>
  );
}
```

---

## 13. Admin Tools

### A. User Management Dashboard

**File:** `/src/components/admin/user-management-dashboard.tsx`

**Purpose:** Comprehensive user search, view, and moderation

```tsx
export function UserManagementDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<AppRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<string | "all">("all");

  const { data: users } = useQuery({
    queryKey: ["admin-users", searchQuery, roleFilter, statusFilter],
    queryFn: () => fetchUsers({ query: searchQuery, role: roleFilter, status: statusFilter }),
  });

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search by name, email, or phone"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />

        <Select value={roleFilter} onChange={setRoleFilter}>
          <option value="all">All Roles</option>
          <option value="customer">Customer</option>
          <option value="professional">Professional</option>
          <option value="admin">Admin</option>
        </Select>

        <Select value={statusFilter} onChange={setStatusFilter}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="pending">Pending</option>
        </Select>
      </div>

      {/* Users Table */}
      <UsersTable
        users={users}
        onViewProfile={handleViewProfile}
        onModerate={handleModerate}
        onViewActivity={handleViewActivity}
      />
    </div>
  );
}
```

---

### B. Professional Vetting Dashboard

(Already covered in Section 4 - Professional Vetting)

---

### C. Background Check Dashboard

(Already covered in Section 3 - Background Checks)

---

### D. Dispute Resolution Dashboard

(Already covered in Section 7 - Dispute Resolution)

---

## 14. Security Implementation

### A. Row Level Security (RLS)

**ALL** trust & safety tables have RLS enabled:

```sql
-- Example: Background Checks
ALTER TABLE public.background_checks ENABLE ROW LEVEL SECURITY;

-- Professionals can view their own checks
CREATE POLICY "Professionals can view their own background checks"
  ON public.background_checks FOR SELECT
  TO authenticated
  USING (professional_id = (SELECT auth.uid()));

-- Service role can manage all checks
CREATE POLICY "Service role can manage all background checks"
  ON public.background_checks FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);
```

---

### B. API Authorization Middleware

**File:** `/src/lib/api-middleware.ts`

```typescript
export function withAuth(
  handler: (ctx: AuthContext, request: Request) => Promise<NextResponse>
) {
  return async (request: Request) => {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return handler({ user, supabase }, request);
  };
}

export function withProfessional(
  handler: (ctx: ProfessionalContext, request: Request) => Promise<NextResponse>
) {
  return withAuth(async (ctx, request) => {
    const { data: profile } = await ctx.supabase
      .from("profiles")
      .select("role")
      .eq("id", ctx.user.id)
      .single();

    if (profile?.role !== "professional") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return handler(ctx as ProfessionalContext, request);
  });
}

export function requireAdmin(handler: AuthenticatedHandler) {
  return withAuth(async (ctx, request) => {
    const { data: profile } = await ctx.supabase
      .from("profiles")
      .select("role")
      .eq("id", ctx.user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return handler(ctx, request);
  });
}
```

---

### C. Input Validation (Zod)

**Example:**

```typescript
import { z } from "zod";

const disputeSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID"),
  reason: z.string().min(1, "Reason is required"),
  description: z.string().min(20, "Description must be at least 20 characters").max(500),
  evidenceUrls: z.array(z.string().url()).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = disputeSchema.parse(body);

    // validated is now type-safe and validated
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
  }
}
```

---

### D. Data Privacy

**Sensitive data encryption:**
- Emergency contacts stored in JSONB (encrypted at rest)
- PII access restricted by RLS policies
- Audit logging for all admin access to user data

**GDPR compliance:**
- Users can export their data via API
- Users can request account deletion
- Data retention policies enforced

---

## 15. Help Center Content

### For Customers

#### How does Casaora verify cleaning professionals?

**Casaora uses a comprehensive multi-step vetting process:**

1. **Identity Verification:**
   - Government-issued ID (Cédula de Ciudadanía)
   - Proof of address
   - Phone number verification (SMS code)

2. **Background Checks:**
   - Criminal records check (Policía Nacional)
   - Judicial records (Rama Judicial)
   - Disciplinary records (Procuraduría - PGN)
   - Identity validation

3. **Reference Verification:**
   - Contact previous employers/clients
   - Verify work history and reputation

4. **In-Person Interview:**
   - Meet with Casaora team member
   - Assess professionalism and communication
   - Verify service skills and experience

**Verification Levels:**
- ✓ **ID Verified** (Green badge): Identity documents verified
- ✓ **Enhanced Verified** (Blue badge): ID + references + interview
- ✓ **Background Checked** (Purple badge): Full background check passed

**All professionals must complete these steps before accepting bookings.**

---

#### What is GPS check-in/check-out?

**GPS check-in/check-out ensures professionals are at your location during service:**

**How it works:**
1. Professional arrives at your address
2. Professional taps "Check In" in their app
3. System verifies they're within 150 meters of your address
4. Service begins, you receive notification
5. When service is complete, professional taps "Check Out"
6. System records actual service duration

**Why 150 meters?**
- GPS accuracy varies (5-20 meters typical)
- Professionals may park nearby
- Some addresses have inaccurate coordinates
- Soft enforcement prevents legitimate work from being blocked

**What if professional checks in from far away?**
- System logs a warning for review
- Admin team investigates suspicious patterns
- Repeated violations result in account suspension

**Your safety:**
- You know exactly when professional arrives/leaves
- Accurate billing based on actual time worked
- Evidence for dispute resolution if needed

---

#### How do I report a safety concern?

**If you feel unsafe during a booking:**

**1. Immediate danger:**
- Call emergency services (123 in Colombia)
- End the booking immediately
- Leave the premises if possible

**2. Non-urgent safety concerns:**
- Contact Casaora support immediately:
  - Phone: +57 300 XXX XXXX
  - Email: support@casaora.co
- We respond to safety concerns within 1 hour

**3. After the booking:**
- File a dispute (within 48 hours)
- Select "Safety or security concern" as reason
- Provide detailed description and any evidence
- We'll investigate and take appropriate action

**What we do:**
- Suspend professional immediately (pending investigation)
- Contact you within 1 hour
- Review GPS logs and booking history
- Issue refund if warranted
- Permanent ban for serious violations

**You will never be charged for a booking where you felt unsafe.**

---

#### What happens if property is damaged?

**If a professional damages your property:**

**1. Document the damage:**
- Take photos immediately
- Note what was damaged
- Estimate repair/replacement cost

**2. Contact professional first:**
- Professional may offer to repair or compensate
- Give them a chance to resolve directly
- Document all communication

**3. File insurance claim (within 48 hours):**
- Go to "My Bookings" → Select booking → "File Insurance Claim"
- Choose "Property Damage" as claim type
- Upload photos as evidence
- Provide detailed description
- Enter estimated cost

**4. Investigation:**
- Casaora reviews claim (typically 2-5 business days)
- May contact you and professional for details
- Inspects evidence photos

**5. Resolution:**
- **Approved:** Receive payout for repair costs
- **Denied:** Explanation provided, can appeal
- **Partial approval:** Partial payout based on assessment

**Coverage limits:**
- Up to 1,000,000 COP per incident
- Excludes pre-existing damage
- Excludes normal wear and tear

**Tip:** Take "before" photos before each booking to document pre-existing conditions.

---

### For Professionals

#### What background checks does Casaora run?

**Casaora partners with trusted background check providers (Checkr, Truora) to run:**

**1. Criminal Records Check (Antecedentes Penales):**
- Searches Policía Nacional database
- Looks for criminal convictions
- Checks for outstanding warrants

**2. Judicial Records (Antecedentes Judiciales):**
- Searches Rama Judicial database
- Looks for pending cases
- Checks for civil judgments

**3. Disciplinary Records (Antecedentes Disciplinarios):**
- Searches Procuraduría General de la Nación (PGN)
- Looks for disciplinary actions
- Checks for misconduct in public service

**4. Identity Validation:**
- Verifies your Cédula de Ciudadanía is authentic
- Cross-references government databases
- Confirms document hasn't been reported lost/stolen

**Timeline:**
- Background check takes 2-7 business days
- You'll receive email when complete
- Results visible in your dashboard

**Cost:**
- **Free for all professionals** (Casaora pays)

**What if something shows up?**
- Minor issues (e.g., old traffic violation): Usually not a problem
- Serious issues (e.g., violent crime): Application will be rejected
- You can dispute inaccurate results

**Your privacy:**
- Results are confidential
- Only Casaora admin team can see
- Never shared with customers

---

#### How does GPS check-in/check-out work?

**GPS check-in/check-out proves you were at the customer's location:**

**Check-In Process:**
1. Arrive at customer address
2. Open Casaora app
3. Tap "Check In" button
4. App verifies you're within 150 meters
5. Service begins, customer notified

**Check-Out Process:**
1. Complete service
2. Open Casaora app
3. Tap "Check Out" button
4. App records actual service duration
5. Customer notified service is complete

**Why GPS verification?**
- Protects you from false "no-show" claims
- Proves you completed the work
- Accurate payment based on actual hours worked
- Builds trust with customers

**What if GPS isn't working?**
- Ensure location services are enabled
- Ensure GPS signal is strong (may not work indoors)
- Contact support if persistent issues

**Will I be penalized if GPS is off by a few meters?**
- No! System allows 150-meter radius
- Soft enforcement (logs warning, doesn't block)
- Only repeated suspicious patterns investigated

**Tips:**
- Enable "High Accuracy" location mode
- Check in/out outdoors for best signal
- Keep app updated for bug fixes

---

#### What if a customer files a false dispute?

**If a customer files a dispute you believe is unfair:**

**1. Don't panic:**
- Disputes are normal in service industries
- You'll have a chance to present your side
- Casaora investigates objectively

**2. Provide evidence:**
- Check-in/check-out GPS logs (proves you were there)
- Photos of completed work
- Messages with customer (shows communication)
- Before/after photos (proves quality)

**3. Write detailed response:**
- Explain what happened from your perspective
- Be professional and factual
- Avoid personal attacks
- Provide timeline of events

**4. Casaora investigates:**
- Reviews all evidence
- Checks GPS logs automatically
- Reads messages between you and customer
- Considers your booking history

**5. Resolution:**
- **Dispute denied:** No impact on your account
- **Partial refund:** Customer receives partial refund, you keep remainder
- **Full refund:** Customer receives full refund (rare, only for serious issues)

**False dispute protection:**
- Your GPS logs are strong evidence
- Your positive reviews are considered
- Repeat false disputes from customer = customer banned

**How to prevent disputes:**
- Take photos of completed work
- Communicate clearly with customer
- Confirm expectations before starting
- Check in/out properly (GPS proof)
- Address concerns during service

**Remember:** One dispute won't ruin your reputation. We look at patterns over time.

---

#### Can I refuse service if I feel unsafe?

**Yes. Your safety is our top priority.**

**If you arrive and feel unsafe:**

**1. Trust your instincts:**
- Uncomfortable environment
- Intoxicated customer
- Aggressive behavior
- Unsafe working conditions

**2. Cancel the booking immediately:**
- Open app → Select booking → "Cancel Booking"
- Select reason: "Safety concern"
- Provide brief explanation

**3. Leave the location:**
- Do not start the service
- Leave immediately
- Contact Casaora support: +57 300 XXX XXXX

**What happens:**
- ✅ **No penalty** for safety cancellations
- ✅ Customer's payment refunded automatically
- ✅ Customer warned about reported behavior
- ✅ Repeat offender customers banned

**You will NOT be penalized for:**
- Canceling due to safety concerns
- Refusing to enter unsafe premises
- Leaving if customer becomes aggressive

**Emergency situations:**
- Call 123 (Colombian emergency services) immediately
- Then notify Casaora support
- We'll assist with police report if needed

**Protection:**
- Emergency contact on file (we'll notify if no check-in)
- GPS tracking during booking
- 24/7 support line

**Your safety > any booking. Always trust your gut.**

---

## 16. Troubleshooting Guide

### Background Check Delayed

**Symptoms:** Background check taking longer than 7 days

**Causes:**
- High volume at background check provider
- Government database downtime (Colombia)
- Incomplete information provided

**Solutions:**
1. **Wait patiently:** Most checks complete within 7 days
2. **Check email:** Provider may have requested additional info
3. **Contact support:** If >10 days, email support@casaora.co with your professional ID

---

### GPS Check-In Failing

**Symptoms:** "GPS verification failed" error when checking in

**Causes:**
1. Location services disabled
2. Poor GPS signal (indoors)
3. Device location settings incorrect
4. App permissions not granted

**Solutions:**

**Android:**
1. Settings → Location → Enable
2. Settings → Apps → Casaora → Permissions → Location → Allow all the time
3. Settings → Location → Mode → High accuracy

**iOS:**
1. Settings → Privacy → Location Services → Enable
2. Settings → Casaora → Location → Always
3. Ensure WiFi and Bluetooth enabled (improves accuracy)

**Still not working:**
- Go outdoors for better signal
- Restart app
- Restart phone
- Update app to latest version

---

### Identity Documents Rejected

**Symptoms:** Admin rejected your ID documents

**Common reasons:**
- Blurry/low-quality photos
- Document partially cut off
- Glare/reflections obscuring information
- Expired documents
- Wrong document type uploaded

**Solutions:**
1. **Retake photos:**
   - Use good lighting (natural light best)
   - Lay document flat on solid surface
   - Take photo directly above (not at angle)
   - Ensure all text is clearly visible
   - No glare/shadows

2. **Upload correct documents:**
   - Front AND back of Cédula
   - Valid (not expired)
   - Original document (not photocopy)

3. **Resubmit:** Dashboard → Profile → Upload Documents

---

### Dispute Denied

**Symptoms:** Filed dispute but was denied

**Common reasons:**
- Filed after 48-hour window
- Insufficient evidence provided
- Professional provided strong counter-evidence
- Issue doesn't qualify for refund (subjective quality opinion)

**What to do:**
1. **Review denial reason:** Check email for explanation
2. **Provide additional evidence:** If you have more evidence, contact support
3. **Appeal:** Email support@casaora.co with appeal and new evidence
4. **Learn for next time:** Take photos, document issues during service

---

### Suspension Appeal

**Symptoms:** Account suspended, believe it was unfair

**Steps to appeal:**

1. **Understand reason:** Check email for suspension details
2. **Gather evidence:**
   - GPS logs (if location-related)
   - Messages (if communication-related)
   - Photos (if quality-related)
   - References (character witnesses)

3. **Write appeal:**
   - Email: support@casaora.co
   - Subject: "Suspension Appeal - [Your Name]"
   - Explain your side professionally
   - Attach evidence
   - Request specific action

4. **Wait for review:**
   - Appeals reviewed within 5 business days
   - May request additional information
   - Decision is final after appeal

**Tips:**
- Be professional and factual
- Accept responsibility where appropriate
- Show how you'll prevent future issues
- Provide concrete evidence

---

## 17. Future Enhancements

### Priority 1: Critical Safety

**1. Emergency Button UI (High Priority)**
- Prominent emergency button during active bookings
- One-tap to call emergency contact
- Automatic admin notification
- Incident logging

**2. Real-Time Geofencing Alerts**
- Proactive alerts for GPS anomalies
- "Professional hasn't checked in 30 min after scheduled start"
- "Professional checked in >500m from address"
- "Professional stayed >2 hours after check-out"

**3. Insurance Provider Integration**
- Automate claims processing with Colombian insurance provider (SURA, Seguros Bolívar)
- Faster claim resolution (hours instead of days)
- Direct payout to customers

---

### Priority 2: Trust Building

**4. Safety Help Center**
- Comprehensive safety guidelines
- "What to do in an emergency"
- "Reporting suspicious behavior"
- "Understanding background checks"
- Video tutorials

**5. Trust & Safety Landing Page**
- Dedicated page explaining all safety measures
- Customer testimonials about safety
- Transparency about vetting process
- Statistics (e.g., "98% of bookings complete without issues")

**6. Safety Certifications Display**
- First aid certification badges
- CPR certification badges
- Specialized training badges (e.g., "Deep Cleaning Certified")

---

### Priority 3: Operational Excellence

**7. Document OCR**
- Automatic ID data extraction
- Faster onboarding (seconds instead of manual review)
- Detect fake IDs
- Auto-fill professional info

**8. AI-Powered Risk Scoring**
- ML model for fraud detection
- Analyze patterns across bookings
- Flag suspicious behavior before incidents occur
- Predictive risk scores per professional

**9. Professional Safety Training**
- Mandatory online safety training module
- Quiz at end (must pass to complete onboarding)
- Annual refresher training
- Certificate upon completion

---

## Files Reference

### Core Database
- `/supabase/migrations/20251106030000_trust_safety_foundation.sql` - Main Trust & Safety schema

### Background Checks
- `/src/lib/background-checks/types.ts`
- `/src/lib/background-checks/checkr-client.ts`
- `/src/lib/background-checks/truora-client.ts`
- `/src/lib/background-checks/provider-interface.ts`
- `/src/lib/admin/background-checks-service.ts`
- `/src/components/admin/background-check-dashboard.tsx`
- `/src/components/admin/background-check-detail-modal.tsx`
- `/src/app/api/admin/background-checks/route.ts`
- `/src/app/api/webhooks/background-checks/route.ts`

### Professional Vetting
- `/src/components/admin/professional-vetting-dashboard.tsx`
- `/src/components/admin/professional-review-modal.tsx`
- `/src/lib/admin/professional-review-service.ts`
- `/src/app/api/admin/professionals/queue/route.ts`

### GPS & Check-In/Out
- `/src/lib/gps-verification.ts`
- `/src/app/api/bookings/check-in/route.ts`
- `/src/app/api/bookings/check-out/route.ts`
- `/src/lib/bookings/check-out-service.ts`

### Disputes
- `/src/components/bookings/dispute-modal.tsx`
- `/src/app/api/bookings/disputes/route.ts`
- `/src/components/admin/dispute-resolution-dashboard.tsx`
- `/src/app/api/admin/disputes/route.ts`

### User Management & Moderation
- `/src/app/api/admin/users/moderate/route.ts`
- `/src/lib/admin/user-management-service.ts`
- `/src/components/admin/user-management-dashboard.tsx`
- `/src/app/[locale]/support/account-suspended/page.tsx`

### Trust Indicators
- `/src/components/professionals/verification-badge.tsx`
- `/src/components/professionals/trust-card.tsx`
- `/src/components/professionals/compact-trust-badge.tsx`

### Audit & Logging
- `/src/components/admin/audit-logs-dashboard.tsx`
- `/src/lib/admin-helpers.ts`
- `/src/lib/logger.ts`

---

**Last Updated:** 2025-11-06
**Status:** Production Ready
**Next Steps:** Implement emergency button UI, real-time geofencing alerts, insurance provider integration
