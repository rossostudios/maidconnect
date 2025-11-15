# API Testing Guide - Structured Outputs

## Quick Reference

All structured output API endpoints for manual testing and smoke tests.

## Setup

```bash
# Set environment variables
export API_URL="http://localhost:3000"  # Or your deployed URL
export ADMIN_TOKEN="your_admin_jwt_token"  # Get from Supabase auth

# Or for production
export API_URL="https://casaora.com"
```

## 1. Booking Intent Detection

**Endpoint:** `POST /api/amara/booking-intent`

**Auth:** None required (public)

### Test 1: Basic English Request

```bash
curl -X POST $API_URL/api/amara/booking-intent \
  -H "Content-Type: application/json" \
  -d '{
    "userMessage": "I need a cleaner for next Tuesday in Chapinero",
    "locale": "en"
  }'
```

**Expected Response:**
```json
{
  "serviceType": "house_cleaning",
  "location": {
    "city": "Bogotá",
    "neighborhood": "Chapinero"
  },
  "urgency": "flexible",
  "confidence": 88
}
```

### Test 2: Spanish Request with Urgency

```bash
curl -X POST $API_URL/api/amara/booking-intent \
  -H "Content-Type: application/json" \
  -d '{
    "userMessage": "Necesito urgentemente una empleada doméstica para mañana",
    "locale": "es"
  }'
```

**Expected Response:**
```json
{
  "serviceType": "house_cleaning",
  "urgency": "urgent",
  "confidence": 92
}
```

### Test 3: Low Confidence (Should Return < 70%)

```bash
curl -X POST $API_URL/api/amara/booking-intent \
  -H "Content-Type": application/json" \
  -d '{
    "userMessage": "What are your hours?",
    "locale": "en"
  }'
```

**Expected Response:**
```json
{
  "serviceType": null,
  "confidence": 15
}
```

---

## 2. Document Extraction

**Endpoint:** `POST /api/admin/professionals/extract-document`

**Auth:** Admin only (Bearer token required)

### Test 1: Extract from Base64 Image

```bash
# Sample 1x1 PNG (for testing structure only)
BASE64_IMAGE="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

curl -X POST $API_URL/api/admin/professionals/extract-document \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
    \"imageData\": \"$BASE64_IMAGE\",
    \"imageType\": \"base64\",
    \"professionalId\": \"prof_123\"
  }"
```

**Expected Response:**
```json
{
  "documentType": "national_id",
  "confidence": 85,
  "personalInfo": {
    "fullName": "John Doe",
    "idNumber": "123456789",
    "dateOfBirth": "1990-01-15",
    "nationality": "Colombian"
  },
  "warnings": []
}
```

### Test 2: Unauthorized Access (No Token)

```bash
curl -X POST $API_URL/api/admin/professionals/extract-document \
  -H "Content-Type: application/json" \
  -d '{
    "imageData": "sample",
    "imageType": "base64"
  }'
```

**Expected Response:** `401 Unauthorized`

---

## 3. Review Analysis

**Endpoint:** `POST /api/admin/reviews/analyze`

**Auth:** Admin only

### Test 1: Positive Review

```bash
curl -X POST $API_URL/api/admin/reviews/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "reviewText": "Excellent service! Maria was very professional and thorough.",
    "rating": 5,
    "locale": "en"
  }'
```

**Expected Response:**
```json
{
  "sentiment": "positive",
  "categories": ["service_quality", "professionalism"],
  "flags": [],
  "severity": "low",
  "actionRequired": false,
  "recommendedAction": "Approve - meets auto-publish criteria",
  "confidence": 95
}
```

### Test 2: Review with Safety Flags

```bash
curl -X POST $API_URL/api/admin/reviews/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "reviewText": "Terrible service. Call me at 555-1234 to discuss.",
    "rating": 1,
    "locale": "en"
  }'
```

**Expected Response:**
```json
{
  "sentiment": "negative",
  "categories": ["service_quality"],
  "flags": [
    "Contains personal information (phone number)"
  ],
  "severity": "high",
  "actionRequired": true,
  "recommendedAction": "Request clarification - remove personal info"
}
```

### Test 3: Spanish Review

```bash
curl -X POST $API_URL/api/admin/reviews/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "reviewText": "Excelente servicio, muy profesional y puntual.",
    "rating": 5,
    "locale": "es"
  }'
```

---

## 4. Pending Reviews

**Endpoint:** `GET /api/admin/reviews/pending`

**Auth:** Admin only

### Test 1: Fetch Pending Reviews

```bash
curl -X GET $API_URL/api/admin/reviews/pending \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response:**
```json
{
  "reviews": [
    {
      "id": "review_123",
      "bookingId": "booking_456",
      "professionalId": "prof_789",
      "professionalName": "Maria Rodriguez",
      "customerName": "john.doe",
      "rating": 5,
      "comment": "Great service!",
      "createdAt": "2025-01-15T10:00:00Z",
      "status": "pending"
    }
  ],
  "count": 12
}
```

---

## 5. Review Moderation

**Endpoint:** `POST /api/admin/reviews/moderate`

**Auth:** Admin only

### Test 1: Approve Review

```bash
curl -X POST $API_URL/api/admin/reviews/moderate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "reviewId": "review_123",
    "action": "approve",
    "reason": "Legitimate positive feedback"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "review": {
    "id": "review_123",
    "status": "approved",
    "moderatedBy": "admin_456",
    "moderatedAt": "2025-01-15T14:30:00Z"
  }
}
```

### Test 2: Reject Review

```bash
curl -X POST $API_URL/api/admin/reviews/moderate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "reviewId": "review_456",
    "action": "reject",
    "reason": "Violates content policy"
  }'
```

### Test 3: Request Clarification

```bash
curl -X POST $API_URL/api/admin/reviews/moderate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "reviewId": "review_789",
    "action": "clarify",
    "reason": "Please remove personal information"
  }'
```

### Test 4: Invalid Action (Should Fail)

```bash
curl -X POST $API_URL/api/admin/reviews/moderate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "reviewId": "review_123",
    "action": "delete"
  }'
```

**Expected Response:** `400 Bad Request`

---

## Error Testing

### Test 1: Malformed JSON

```bash
curl -X POST $API_URL/api/amara/booking-intent \
  -H "Content-Type: application/json" \
  -d '{ invalid json }'
```

**Expected:** `400 Bad Request`

### Test 2: Missing Required Fields

```bash
curl -X POST $API_URL/api/amara/booking-intent \
  -H "Content-Type: application/json" \
  -d '{
    "locale": "en"
  }'
```

**Expected:** `400 Bad Request` with error message

### Test 3: Unauthorized Admin Endpoint

```bash
curl -X GET $API_URL/api/admin/reviews/pending
```

**Expected:** `401 Unauthorized`

### Test 4: Text Length Limit

```bash
# Generate 5001 character string
LONG_TEXT=$(printf 'a%.0s' {1..5001})

curl -X POST $API_URL/api/admin/reviews/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
    \"reviewText\": \"$LONG_TEXT\",
    \"locale\": \"en\"
  }"
```

**Expected:** `400 Bad Request` ("reviewText must be 5000 characters or less")

---

## Performance Testing

### Test Response Times

```bash
# Measure booking intent latency
time curl -X POST $API_URL/api/amara/booking-intent \
  -H "Content-Type: application/json" \
  -d '{
    "userMessage": "I need a cleaner tomorrow",
    "locale": "en"
  }' \
  -w "\nTime: %{time_total}s\n"
```

**Target:** < 2 seconds for all structured output endpoints

### Test Concurrent Requests

```bash
# Run 10 concurrent requests
for i in {1..10}; do
  curl -X POST $API_URL/api/amara/booking-intent \
    -H "Content-Type: application/json" \
    -d '{
      "userMessage": "Test message '$i'",
      "locale": "en"
    }' &
done
wait
```

---

## Automated Test Execution

### Run Vitest Test Suite

```bash
# Run all API tests
bun test tests/api/structured-outputs.test.ts

# Run with coverage
bun test --coverage

# Run in watch mode
bun test --watch
```

### Test Environment Setup

```bash
# .env.test
NEXT_PUBLIC_BASE_URL=http://localhost:3000
TEST_ADMIN_TOKEN=your_test_admin_token
ANTHROPIC_API_KEY=your_api_key
SUPABASE_URL=your_test_supabase_url
SUPABASE_ANON_KEY=your_test_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_test_service_key
```

---

## Troubleshooting

### Common Issues

**Issue:** `ECONNREFUSED` error  
**Solution:** Ensure dev server is running (`bun dev`)

**Issue:** `401 Unauthorized`  
**Solution:** Check ADMIN_TOKEN is valid and not expired

**Issue:** `500 Internal Server Error`  
**Solution:** Check server logs for Claude API errors or database connection issues

**Issue:** Slow response times  
**Solution:** Check Anthropic API status, verify token limits not exceeded

### Debug Mode

Enable detailed logging:

```bash
# Set debug environment variable
export DEBUG=true

# Or in .env.local
DEBUG=true
```

---

**Last Updated:** 2025-01-15  
**Version:** 1.0.0
