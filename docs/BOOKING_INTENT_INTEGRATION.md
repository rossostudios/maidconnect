# Booking Intent Integration - Amara Chat

## Overview

The Amara chat now automatically detects booking intent in user messages and provides a smart interface to quickly find matching professionals.

## How It Works

### 1. **Intent Detection Flow**

```
User sends message
    ↓
Intent detection runs in parallel with chat response
    ↓
If confidence ≥ 70%, display intent card
    ↓
User clicks "Find Professionals" → Redirects to search with pre-filled filters
```

### 2. **Detection Logic**

**File:** `src/components/amara/amara-chat-interface.tsx`

```typescript
// Detect booking intent when user sends message
const detectBookingIntent = async (userMessage: string) => {
  const response = await fetch("/api/amara/booking-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userMessage,
      locale: locale || "en",
    }),
  });

  const data = await response.json();

  // Only show if confidence is high (≥70%)
  if (data.confidence >= 70) {
    setDetectedIntent(data);
  }
};
```

### 3. **Intent Card UI**

The intent card displays:

- ✅ **Service Type** - Detected service (e.g., "House Cleaning", "Gardening")
- 📍 **Location** - City and neighborhood (if detected)
- 📝 **Requirements** - User-specified requirements
- ⚡ **Urgency** - Timing preference (urgent, ASAP, flexible)
- 📊 **Confidence Score** - Visual progress bar showing match confidence
- 🔘 **Action Button** - "Find Professionals" with auto-filled search filters

### 4. **Example User Flows**

#### Example 1: Basic Cleaning Request

**User:** "I need someone to clean my apartment in Chapinero next week"

**Detected Intent:**
```json
{
  "serviceType": "house_cleaning",
  "location": {
    "city": "Bogotá",
    "neighborhood": "Chapinero"
  },
  "urgency": "flexible",
  "confidence": 92
}
```

**Action:** Button links to `/professionals?service=house_cleaning&location=Bogotá`

#### Example 2: Urgent Gardening

**User:** "I urgently need a gardener who speaks English in Usaquén"

**Detected Intent:**
```json
{
  "serviceType": "gardening",
  "location": {
    "city": "Bogotá",
    "neighborhood": "Usaquén"
  },
  "requirements": "Speaks English",
  "urgency": "urgent",
  "confidence": 88
}
```

**Urgency Badge:** Red badge with 🔴 "Urgent"

#### Example 3: Low Confidence (No Card)

**User:** "What are your hours?"

**Detected Intent:**
```json
{
  "serviceType": null,
  "confidence": 35
}
```

**Action:** No intent card shown (confidence < 70%)

### 5. **Design Features**

#### Visual Design (Lia Design System)

- **Colors:** Orange accent (`orange-500`, `orange-600`) for primary actions
- **Borders:** Subtle neutral borders with orange highlights
- **Typography:** Geist Sans font for consistency
- **Icons:** HugeIcons with 1.5 stroke width
- **Animations:** Smooth transitions and hover effects

#### Accessibility

- **Keyboard Navigation:** All interactive elements are keyboard accessible
- **Screen Readers:** Proper ARIA labels and semantic HTML
- **Color Contrast:** WCAG AA compliant color combinations
- **Focus States:** Clear focus rings on all interactive elements

#### Responsive Design

- **Mobile:** Full-width card with compact spacing
- **Tablet/Desktop:** Optimized padding and button sizes

### 6. **Integration Points**

#### API Endpoint

**Endpoint:** `POST /api/amara/booking-intent`

**Request:**
```json
{
  "userMessage": "I need a cleaner tomorrow",
  "locale": "en"
}
```

**Response:**
```json
{
  "serviceType": "house_cleaning",
  "location": null,
  "urgency": "asap",
  "confidence": 85,
  "requirements": null
}
```

#### Service Layer

**Service:** `src/lib/services/amara/booking-intent-service.ts`

Uses Claude Sonnet 4.5 with structured outputs to parse natural language into booking criteria.

#### Tracking

All intent detections are tracked in PostHog:

```typescript
trackBookingIntentParsing({
  success: true,
  serviceType: "house_cleaning",
  hasLocation: true,
  hasRequirements: false,
  urgency: "asap",
  locale: "en",
  processingTimeMs: 234,
});
```

### 7. **Error Handling**

Intent detection failures are silent and don't disrupt the chat experience:

```typescript
try {
  await detectBookingIntent(message);
} catch (error) {
  console.error("Intent detection failed:", error);
  // Silently fail - chat continues normally
}
```

### 8. **Future Enhancements**

Potential improvements:

1. **Smart Follow-ups:** If location is missing, ask "Where would you like this service?"
2. **Price Estimates:** Show estimated price range based on detected service
3. **Availability Check:** Display professionals with immediate availability
4. **Multi-Intent:** Detect and handle multiple service requests in one message
5. **Intent History:** Save detected intents for faster rebooking
6. **A/B Testing:** Use PostHog feature flags to test different UI variations

### 9. **Testing**

#### Manual Testing

Test with these sample messages:

```
// High confidence detection
"I need a housekeeper for Tuesday morning in Rosales"

// Urgent request
"Urgently need someone to fix my plumbing today!"

// Flexible timing
"Looking for a gardener sometime this month"

// Low confidence (should not show card)
"What services do you offer?"
"How much does it cost?"
```

#### Automated Testing

Add E2E tests for:
- Intent detection API response
- UI card appearance/dismissal
- Search redirect with correct parameters
- Error handling

### 10. **Performance**

- **Parallel Execution:** Intent detection runs in parallel with chat response (no blocking)
- **Debouncing:** Could add debouncing for rapid-fire messages
- **Caching:** Consider caching similar intents to reduce API calls
- **Timeout:** API call has 5-second timeout to prevent hanging

---

**Last Updated:** 2025-01-15
**Version:** 1.0.0
**Author:** Claude Code
