# Use Cases & User Stories
## Trusted Home Services Marketplace

**Version 1.0** | October 2025

---

## Document Structure
- **Epics**: Large feature areas
- **User Stories**: Specific functionality from user perspective
- **Acceptance Criteria**: Definition of done
- **Priority**: P0 (MVP), P1 (Launch), P2 (Post-launch)

---

# Table of Contents
1. Professional User Journeys
2. Customer User Journeys
3. Platform Administration
4. Edge Cases & Error Handling

---

# 1. PROFESSIONAL USER JOURNEYS

## Epic 1.1: Professional Onboarding

### User Story 1.1.1: Apply to Join Platform
**As a** home service professional  
**I want to** submit an application to join the platform  
**So that** I can access new clients and grow my business

**Acceptance Criteria:**
- [ ] Application form collects: full name, ID number, phone, email, address, services offered, experience level, rate expectations, references (min 2)
- [ ] Form validates all required fields before submission
- [ ] User receives confirmation email with application ID and next steps
- [ ] Application is saved and creates record in admin dashboard
- [ ] Form is available in Spanish and English
- [ ] Mobile-responsive design

**Priority:** P0 (MVP)

---

### User Story 1.1.2: Upload Required Documents
**As a** professional applicant  
**I want to** upload my identification and supporting documents  
**So that** the platform can verify my identity and credentials

**Acceptance Criteria:**
- [ ] Accept image uploads (JPG, PNG, PDF) up to 5MB each
- [ ] Required documents: Government ID, proof of address
- [ ] Optional documents: Certifications, work permits
- [ ] Show upload progress indicator
- [ ] Allow document replacement before submission
- [ ] Compress images automatically for storage
- [ ] Show clear error messages for invalid files

**Priority:** P0 (MVP)

---

### User Story 1.1.3: Receive Application Status Updates
**As a** professional applicant  
**I want to** receive updates about my application status  
**So that** I know what stage I'm at and what to expect next

**Acceptance Criteria:**
- [ ] Email notification when application is received
- [ ] Email notification when documents are under review
- [ ] Email notification to schedule interview (if approved for next stage)
- [ ] Email notification of approval or rejection with reason
- [ ] Ability to check application status via unique link
- [ ] SMS notification option for time-sensitive updates

**Priority:** P1 (Launch)

---

### User Story 1.1.4: Schedule In-Person Interview
**As an** approved applicant  
**I want to** schedule my in-person interview  
**So that** I can complete the onboarding process

**Acceptance Criteria:**
- [ ] View available interview slots (calendar view)
- [ ] Select preferred date/time from available options
- [ ] Receive confirmation with location details and what to bring
- [ ] Ability to reschedule up to 24 hours before
- [ ] Receive reminder 24 hours before interview
- [ ] Include map/directions to interview location

**Priority:** P1 (Launch)

---

### User Story 1.1.5: Complete Profile Creation
**As a** newly approved professional  
**I want to** create my public profile  
**So that** customers can find and book my services

**Acceptance Criteria:**
- [ ] Upload or select professional photos from photo shoot
- [ ] Write bio (150-300 words) with character counter
- [ ] Select services offered from predefined list with ability to add custom
- [ ] Set hourly/daily rates for each service
- [ ] Input availability schedule (recurring weekly schedule)
- [ ] Add languages spoken and proficiency level
- [ ] Add special skills, certifications, or experience highlights
- [ ] Preview profile before publishing
- [ ] Profile requires admin approval before going live

**Priority:** P0 (MVP)

---

## Epic 1.2: Managing Bookings

### User Story 1.2.1: Receive Booking Request
**As a** professional  
**I want to** receive notifications when a customer requests a booking  
**So that** I can review and respond promptly

**Acceptance Criteria:**
- [ ] Push notification (if app installed)
- [ ] Email notification with booking details
- [ ] SMS notification option
- [ ] Notification includes: customer name, rating, service requested, date/time, duration, location, special instructions
- [ ] Link to view customer profile
- [ ] 24-hour countdown timer to respond

**Priority:** P0 (MVP)

---

### User Story 1.2.2: Review Customer Profile Before Accepting
**As a** professional  
**I want to** view the customer's profile and rating before accepting a booking  
**So that** I can make an informed decision about whether to accept

**Acceptance Criteria:**
- [ ] View customer overall rating
- [ ] View number of completed bookings
- [ ] View verification level badge
- [ ] Read reviews from other professionals (if any)
- [ ] See general location (neighborhood, not exact address)
- [ ] View customer's booking history stats (completion rate, cancellation rate)

**Priority:** P0 (MVP)

---

### User Story 1.2.3: Accept or Decline Booking
**As a** professional  
**I want to** accept or decline booking requests  
**So that** I can manage my schedule and workload

**Acceptance Criteria:**
- [ ] Clear "Accept" and "Decline" buttons
- [ ] If declining, optional reason selection (schedule conflict, outside service area, rate too low, other)
- [ ] Acceptance automatically adds booking to calendar
- [ ] Both parties receive confirmation upon acceptance
- [ ] Declining sends notification to customer
- [ ] Track decline rate (warning if >50% decline rate)

**Priority:** P0 (MVP)

---

### User Story 1.2.4: Ask Questions Before Accepting
**As a** professional  
**I want to** message the customer with questions before accepting  
**So that** I can clarify details and set proper expectations

**Acceptance Criteria:**
- [ ] In-app messaging available from booking request screen
- [ ] Customer receives notification of message
- [ ] Message thread attached to booking request
- [ ] 24-hour timer pauses while awaiting customer response (up to 12 hours)
- [ ] Can accept/decline after clarification

**Priority:** P1 (Launch)

---

### User Story 1.2.5: View Upcoming Bookings
**As a** professional  
**I want to** see all my upcoming bookings in one place  
**So that** I can plan my schedule effectively

**Acceptance Criteria:**
- [ ] Calendar view showing all confirmed bookings
- [ ] List view with sortable/filterable options
- [ ] Show booking details: customer name, service, date/time, location, duration
- [ ] Color coding for different booking statuses (confirmed, started, completed)
- [ ] Ability to get directions to customer location
- [ ] Sync with device calendar option

**Priority:** P0 (MVP)

---

### User Story 1.2.6: Check-In at Start of Service
**As a** professional  
**I want to** check in when I arrive at the customer's location  
**So that** the platform knows the service has started

**Acceptance Criteria:**
- [ ] Prominent "Check In" button on booking detail screen
- [ ] GPS verification that professional is at/near customer location
- [ ] Timer starts tracking service duration
- [ ] Customer receives notification that professional has arrived
- [ ] If late (>15 min), prompt to send message to customer
- [ ] Unable to check in if >30 minutes early

**Priority:** P0 (MVP)

---

### User Story 1.2.7: Request Time Extension During Service
**As a** professional  
**I want to** request additional time during a booking  
**So that** I can complete the work properly and be fairly compensated

**Acceptance Criteria:**
- [ ] "Request Extension" button visible during active booking
- [ ] Select additional time needed (30 min, 1 hour, 2 hours, custom)
- [ ] Shows updated total price
- [ ] Customer receives push notification to approve/deny
- [ ] Real-time approval/denial notification
- [ ] If denied, professional can complete work at original booking time
- [ ] Extension automatically added to payment if approved

**Priority:** P1 (Launch)

---

### User Story 1.2.8: Check-Out at End of Service
**As a** professional  
**I want to** check out when service is complete  
**So that** I can finalize the booking and get paid

**Acceptance Criteria:**
- [ ] "Check Out" button on active booking screen
- [ ] Option to add notes about service completed
- [ ] Option to upload before/after photos (optional)
- [ ] Prompt to report any issues or concerns
- [ ] Service duration automatically calculated
- [ ] Customer immediately prompted to rate/review
- [ ] Payment processing initiated (2-hour hold before capture)

**Priority:** P0 (MVP)

---

## Epic 1.3: Ratings & Reviews

### User Story 1.3.1: Rate and Review Customer
**As a** professional  
**I want to** rate and review customers after completing a service  
**So that** other professionals can make informed decisions

**Acceptance Criteria:**
- [ ] Prompted immediately after checkout
- [ ] Rate customer 1-5 stars in categories: respectfulness, communication, property condition, payment promptness
- [ ] Optional written review (50-500 characters)
- [ ] Cannot see customer's rating until both have submitted
- [ ] Reminder sent after 24 hours if not completed
- [ ] Review window closes after 48 hours

**Priority:** P0 (MVP)

---

### User Story 1.3.2: View My Rating and Reviews
**As a** professional  
**I want to** see my overall rating and read customer reviews  
**So that** I understand my reputation and can improve

**Acceptance Criteria:**
- [ ] Dashboard shows overall rating (average across all bookings)
- [ ] Show rating breakdown by category
- [ ] Display all reviews in chronological order
- [ ] Show number of 5-star, 4-star, etc. ratings
- [ ] Calculate and display rating trend (improving/declining)
- [ ] Ability to respond to reviews (optional)

**Priority:** P1 (Launch)

---

### User Story 1.3.3: Dispute Unfair Review
**As a** professional  
**I want to** dispute a review I believe is unfair or violates guidelines  
**So that** my reputation is not damaged unjustly

**Acceptance Criteria:**
- [ ] "Report Review" button on each review
- [ ] Select reason: false information, inappropriate language, discrimination, not relevant to service, other
- [ ] Provide detailed explanation (required, 50-500 characters)
- [ ] Submit supporting evidence (messages, photos, booking details)
- [ ] Receive confirmation that dispute is under review
- [ ] Notification of outcome within 48 hours
- [ ] Review may be removed, flagged, or remain unchanged based on investigation

**Priority:** P1 (Launch)

---

## Epic 1.4: Payment & Earnings

### User Story 1.4.1: View Earnings Dashboard
**As a** professional  
**I want to** see my earnings and payment history  
**So that** I can track my income

**Acceptance Criteria:**
- [ ] Current week earnings displayed prominently
- [ ] Month-to-date and total earnings
- [ ] List of completed bookings with payout status (pending, processed, paid)
- [ ] Show platform commission deducted
- [ ] Show tips received separately
- [ ] Filter by date range, service type, customer
- [ ] Export to CSV option

**Priority:** P0 (MVP)

---

### User Story 1.4.2: Set Up Payment Method
**As a** professional  
**I want to** add my bank account information  
**So that** I can receive payments for my services

**Acceptance Criteria:**
- [ ] Input Colombian bank account details (bank name, account type, account number)
- [ ] Support for international transfers (SWIFT/IBAN) for non-Colombian accounts
- [ ] Verify account via micro-deposit or instant verification
- [ ] Update payment method with re-verification
- [ ] Secure encryption of banking information
- [ ] Ability to add backup payment method

**Priority:** P0 (MVP)

---

### User Story 1.4.3: Receive Automatic Payouts
**As a** professional  
**I want to** receive automatic payments for completed bookings  
**So that** I don't have to manually request each payment

**Acceptance Criteria:**
- [ ] Payouts processed twice weekly (Tuesdays and Fridays)
- [ ] Minimum payout threshold: $50,000 COP (~$12 USD)
- [ ] Email notification when payout is initiated
- [ ] Email notification when payout is deposited
- [ ] Breakdown of what bookings are included in each payout
- [ ] Clear explanation of timeline (booking completion → payout date)

**Priority:** P0 (MVP)

---

### User Story 1.4.4: View Tips Received
**As a** professional  
**I want to** see tips I've received from customers  
**So that** I can track additional earnings and appreciate generous customers

**Acceptance Criteria:**
- [ ] Tips section in earnings dashboard
- [ ] List of tips by booking with customer name, date, amount
- [ ] Total tips this week/month/all-time
- [ ] Tips are separate from base booking earnings
- [ ] 100% of tips go to professional (no platform commission)
- [ ] Tips included in regular payout schedule

**Priority:** P1 (Launch)

---

## Epic 1.5: Profile & Availability Management

### User Story 1.5.1: Update Availability Schedule
**As a** professional  
**I want to** update my availability schedule  
**So that** customers can only book me when I'm actually available

**Acceptance Criteria:**
- [ ] Weekly recurring schedule with different hours per day
- [ ] Mark specific dates as unavailable (vacations, personal time)
- [ ] Block out time slots for existing commitments
- [ ] Set buffer time between bookings (15, 30, 60 minutes)
- [ ] Changes reflect immediately in booking system
- [ ] Option to set "emergency only" availability

**Priority:** P0 (MVP)

---

### User Story 1.5.2: Update Service Rates
**As a** professional  
**I want to** adjust my hourly/daily rates  
**So that** I can respond to market conditions and my experience level

**Acceptance Criteria:**
- [ ] Edit rates for each service type individually
- [ ] See platform's suggested rate ranges for reference
- [ ] Changes apply to new bookings only (not existing)
- [ ] Warning if setting rates significantly outside suggested range
- [ ] Track rate history for personal reference
- [ ] Ability to offer promotional rates for limited time

**Priority:** P1 (Launch)

---

### User Story 1.5.3: Add or Remove Services
**As a** professional  
**I want to** update the services I offer  
**So that** my profile reflects my current capabilities

**Acceptance Criteria:**
- [ ] Add new services from predefined list
- [ ] Add custom service if not in list (requires admin approval)
- [ ] Remove services no longer offered
- [ ] Existing bookings for removed services not affected
- [ ] Update service descriptions and rates
- [ ] Set different rates for different services

**Priority:** P1 (Launch)

---

### User Story 1.5.4: Update Profile Photos and Bio
**As a** professional  
**I want to** update my photos and bio  
**So that** my profile stays current and professional

**Acceptance Criteria:**
- [ ] Upload new profile photos (subject to admin review)
- [ ] Edit bio text with real-time character counter
- [ ] Preview changes before saving
- [ ] Major changes require admin re-approval
- [ ] Minor changes (typos, small edits) go live immediately
- [ ] Maintain photo/bio history for admin review

**Priority:** P2 (Post-launch)

---

## Epic 1.6: Communication

### User Story 1.6.1: Message Customer About Booking
**As a** professional  
**I want to** send messages to customers about their booking  
**So that** I can coordinate details and set expectations

**Acceptance Criteria:**
- [ ] In-app messaging per booking
- [ ] Customer receives push/email notification of new message
- [ ] Attach photos or documents (work estimates, photos of supplies needed)
- [ ] Template messages for common scenarios ("Running 10 min late", "Arrived", "Complete")
- [ ] Message history preserved with booking record
- [ ] Auto-translate option for Spanish/English

**Priority:** P0 (MVP)

---

### User Story 1.6.2: Contact Customer Support
**As a** professional  
**I want to** easily contact platform support  
**So that** I can get help when I need it

**Acceptance Criteria:**
- [ ] In-app support chat accessible from all screens
- [ ] Email support option
- [ ] Emergency hotline number displayed prominently
- [ ] Support hours clearly communicated
- [ ] Automated response with ticket number
- [ ] Ability to track support ticket status
- [ ] FAQ/help center searchable from app

**Priority:** P1 (Launch)

---

---

# 2. CUSTOMER USER JOURNEYS

## Epic 2.1: Customer Onboarding

### User Story 2.1.1: Sign Up for Account
**As a** foreigner in Colombia  
**I want to** create an account on the platform  
**So that** I can hire home service professionals

**Acceptance Criteria:**
- [ ] Sign up with email or Google/Facebook SSO
- [ ] Provide: full name, email, phone, location (city/neighborhood), property type
- [ ] Select preferred language (Spanish/English)
- [ ] Agree to terms of service and privacy policy
- [ ] Email verification required before first booking
- [ ] Optional profile photo upload

**Priority:** P0 (MVP)

---

### User Story 2.1.2: Verify Identity
**As a** customer  
**I want to** verify my identity  
**So that** professionals feel comfortable accepting my bookings

**Acceptance Criteria:**
- [ ] Tier 1 (Basic): Email and phone verification (SMS code)
- [ ] Tier 2 (Standard): Upload government ID or passport
- [ ] Tier 3 (Enhanced): Video verification call with support
- [ ] Clear explanation of benefits for each tier
- [ ] Verification badge displayed on customer profile
- [ ] Professionals can filter by minimum verification tier

**Priority:** P0 (MVP)

---

### User Story 2.1.3: Add Payment Method
**As a** customer  
**I want to** add my payment method  
**So that** I can book and pay for services

**Acceptance Criteria:**
- [ ] Accept credit/debit cards (Visa, Mastercard, Amex)
- [ ] Support Colombian payment methods (PSE, Nequi, Daviplata)
- [ ] Support international cards
- [ ] Secure tokenization (PCI compliant)
- [ ] Save multiple payment methods
- [ ] Set default payment method
- [ ] Card verification (authorization hold)

**Priority:** P0 (MVP)

---

### User Story 2.1.4: Complete First-Time User Tutorial
**As a** new customer  
**I want to** understand how the platform works  
**So that** I can use it confidently and safely

**Acceptance Criteria:**
- [ ] Interactive tutorial on first login
- [ ] Covers: searching for professionals, booking process, safety tips, rating system
- [ ] Optional skip or can replay later
- [ ] 2-minute safety video about mutual respect and preparation
- [ ] Quick tips for best experience
- [ ] Available in Spanish and English

**Priority:** P1 (Launch)

---

## Epic 2.2: Searching & Booking

### User Story 2.2.1: Search for Professionals
**As a** customer  
**I want to** search for home service professionals  
**So that** I can find someone who meets my needs

**Acceptance Criteria:**
- [ ] Search by service type (cleaning, cooking, laundry, etc.)
- [ ] Filter by: location, availability, price range, rating, language
- [ ] Sort by: rating, price (low to high, high to low), experience, distance
- [ ] Show professional cards with photo, name, rating, price, services
- [ ] "Top Professional" badge for high performers
- [ ] See distance from my location
- [ ] Save favorite professionals for quick rebooking

**Priority:** P0 (MVP)

---

### User Story 2.2.2: View Professional Profile
**As a** customer  
**I want to** view a professional's full profile  
**So that** I can make an informed hiring decision

**Acceptance Criteria:**
- [ ] View all professional photos
- [ ] Read full bio and experience
- [ ] See overall rating and number of bookings
- [ ] Read customer reviews (most recent and highest/lowest)
- [ ] View services offered with prices
- [ ] See availability calendar
- [ ] View badges (Top Professional, Verified, Languages)
- [ ] "About my home services" custom section

**Priority:** P0 (MVP)

---

### User Story 2.2.3: Check Professional Availability
**As a** customer  
**I want to** see when a professional is available  
**So that** I can book at a convenient time

**Acceptance Criteria:**
- [ ] Calendar view showing available dates/times
- [ ] Grayed out unavailable slots
- [ ] Show professional's buffer times
- [ ] Real-time availability updates
- [ ] Suggest alternative professionals if first choice unavailable
- [ ] Option to request booking outside available hours (professional can accept/decline)

**Priority:** P0 (MVP)

---

### User Story 2.2.4: Create a Booking
**As a** customer  
**I want to** book a professional for a service  
**So that** I can get help with my home tasks

**Acceptance Criteria:**
- [ ] Select service type from professional's offerings
- [ ] Choose date and time from available slots
- [ ] Select duration (minimum 2 hours, increments of 30 min)
- [ ] Enter or select service address
- [ ] Add special instructions (pets, access codes, parking, specific tasks)
- [ ] Review booking summary (professional, service, date/time, price breakdown)
- [ ] Authorize payment (not charged until after service)
- [ ] Receive booking confirmation

**Priority:** P0 (MVP)

---

### User Story 2.2.5: Message Professional Before Booking
**As a** customer  
**I want to** ask questions before confirming a booking  
**So that** I can clarify details and ensure good fit

**Acceptance Criteria:**
- [ ] "Message" button on professional profile
- [ ] Send message without booking commitment
- [ ] Professional receives notification
- [ ] View message response time (avg response within X hours)
- [ ] Continue to booking from message thread
- [ ] Message history preserved

**Priority:** P1 (Launch)

---

### User Story 2.2.6: Receive Booking Confirmation
**As a** customer  
**I want to** receive confirmation of my booking  
**So that** I have peace of mind and all the details

**Acceptance Criteria:**
- [ ] Immediate in-app confirmation screen
- [ ] Email confirmation with all booking details
- [ ] SMS confirmation (optional)
- [ ] Add to calendar button (Google Cal, Apple Cal, Outlook)
- [ ] Professional's contact info for day-of coordination
- [ ] Cancellation/modification policy clearly stated
- [ ] Reminder notifications (24 hours and 2 hours before)

**Priority:** P0 (MVP)

---

## Epic 2.3: Managing Bookings

### User Story 2.3.1: View Upcoming Bookings
**As a** customer  
**I want to** see all my upcoming bookings  
**So that** I can keep track of scheduled services

**Acceptance Criteria:**
- [ ] Dashboard showing all upcoming bookings
- [ ] Sort by date (soonest first)
- [ ] Show booking details: professional name/photo, service, date/time, price
- [ ] Quick actions: message, modify, cancel
- [ ] Calendar view option
- [ ] Past bookings in separate section

**Priority:** P0 (MVP)

---

### User Story 2.3.2: Modify or Reschedule Booking
**As a** customer  
**I want to** reschedule or modify my booking  
**So that** I can adjust to changing plans

**Acceptance Criteria:**
- [ ] "Modify Booking" button on booking details
- [ ] Change date/time if professional is available
- [ ] Add/modify special instructions
- [ ] Extend or reduce duration (within limits)
- [ ] Free modification up to 24 hours before
- [ ] Show any applicable fees for late modification
- [ ] Professional must approve significant changes
- [ ] Confirmation of modification sent to both parties

**Priority:** P1 (Launch)

---

### User Story 2.3.3: Cancel Booking
**As a** customer  
**I want to** cancel a booking if my plans change  
**So that** I don't pay for unused services

**Acceptance Criteria:**
- [ ] "Cancel Booking" button with confirmation prompt
- [ ] Select reason for cancellation (optional)
- [ ] Free cancellation 24+ hours before
- [ ] 50% fee for 12-24 hours before
- [ ] Full charge for <12 hours or no-show
- [ ] Emergency cancellation option (must provide documentation)
- [ ] Immediate refund processing (if applicable)
- [ ] Professional notified immediately

**Priority:** P0 (MVP)

---

### User Story 2.3.4: Receive Professional Check-In Notification
**As a** customer  
**I want to** know when the professional arrives  
**So that** I can greet them or provide access

**Acceptance Criteria:**
- [ ] Push notification when professional checks in
- [ ] SMS notification option
- [ ] Show professional's arrival time
- [ ] Option to message professional
- [ ] If running late, receive ETA update from professional
- [ ] Track service start time for billing accuracy

**Priority:** P1 (Launch)

---

### User Story 2.3.5: Approve Time Extension Request
**As a** customer  
**I want to** approve or deny a professional's request for more time  
**So that** I have control over additional costs

**Acceptance Criteria:**
- [ ] Push notification of extension request
- [ ] Show requested additional time and cost
- [ ] "Approve" or "Deny" buttons
- [ ] Optional message field to explain decision
- [ ] 15-minute response window before auto-denial
- [ ] Real-time notification to professional of decision
- [ ] Updated booking total if approved

**Priority:** P1 (Launch)

---

### User Story 2.3.6: Receive Service Completion Notification
**As a** customer  
**I want to** be notified when the professional completes the service  
**So that** I can inspect the work and provide feedback

**Acceptance Criteria:**
- [ ] Notification when professional checks out
- [ ] Show actual service duration
- [ ] Final cost breakdown (base rate + any extensions)
- [ ] View professional's notes about work completed
- [ ] View before/after photos (if provided)
- [ ] Immediate prompt to rate and review
- [ ] Option to report issues before payment is processed

**Priority:** P0 (MVP)

---

## Epic 2.4: Payment

### User Story 2.4.1: Review Charge Before Payment Capture
**As a** customer  
**I want to** see the final charge before it's processed  
**So that** I can verify accuracy

**Acceptance Criteria:**
- [ ] Itemized breakdown: base rate, duration, extensions, platform fee, taxes
- [ ] Compare to original booking estimate
- [ ] 2-hour window to dispute charges before capture
- [ ] Clear explanation of when card will be charged
- [ ] Option to add tip (10%, 15%, 20%, custom)
- [ ] Contact support if charges seem incorrect

**Priority:** P1 (Launch)

---

### User Story 2.4.2: Add Tip for Professional
**As a** customer  
**I want to** tip the professional for excellent service  
**So that** I can show appreciation

**Acceptance Criteria:**
- [ ] Tip option available up to 7 days after service
- [ ] Quick select: 10%, 15%, 20%
- [ ] Custom amount option
- [ ] Show that 100% goes to professional
- [ ] Optional note to professional
- [ ] Tip charged to same payment method as booking
- [ ] Professional receives notification of tip

**Priority:** P1 (Launch)

---

### User Story 2.4.3: View Payment History
**As a** customer  
**I want to** see all my past payments  
**So that** I can track expenses and verify charges

**Acceptance Criteria:**
- [ ] List all completed bookings with payments
- [ ] Show date, professional, service, amount charged
- [ ] Filter by date range, professional, service type
- [ ] Download invoice/receipt for each booking
- [ ] Export to CSV for expense tracking
- [ ] View refunds separately
- [ ] See tips given separately

**Priority:** P1 (Launch)

---

### User Story 2.4.4: Request Refund or Dispute Charge
**As a** customer  
**I want to** dispute a charge or request a refund  
**So that** I'm not charged for unsatisfactory service

**Acceptance Criteria:**
- [ ] "Dispute Charge" button on completed booking
- [ ] Select reason: service not completed, poor quality, damage occurred, overcharged, other
- [ ] Provide detailed description (required)
- [ ] Upload supporting evidence (photos, messages)
- [ ] Submit dispute within 48 hours of service
- [ ] Receive confirmation and ticket number
- [ ] Support team reviews within 4 hours
- [ ] Notification of outcome and refund (if approved)

**Priority:** P1 (Launch)

---

## Epic 2.5: Ratings & Reviews

### User Story 2.5.1: Rate and Review Professional
**As a** customer  
**I want to** rate and review the professional after service  
**So that** I can help other customers and provide feedback

**Acceptance Criteria:**
- [ ] Prompted immediately after service completion
- [ ] Rate 1-5 stars in categories: quality, punctuality, professionalism, communication
- [ ] Overall rating (average of categories)
- [ ] Optional written review (50-500 characters)
- [ ] Upload photos of work (optional)
- [ ] Cannot see professional's rating until both submitted
- [ ] Reminder after 24 hours if not completed
- [ ] 48-hour window to submit

**Priority:** P0 (MVP)

---

### User Story 2.5.2: Edit or Delete My Review
**As a** customer  
**I want to** edit my review after posting  
**So that** I can correct mistakes or update my feedback

**Acceptance Criteria:**
- [ ] Edit review within 7 days of posting
- [ ] Cannot change star rating, only written review
- [ ] Show "Edited" tag on modified reviews
- [ ] Professional notified of edit
- [ ] Delete review option (within 24 hours only)
- [ ] Deleted reviews don't affect professional's rating retroactively

**Priority:** P2 (Post-launch)

---

### User Story 2.5.3: View My Rating as a Customer
**As a** customer  
**I want to** see my own rating and reviews from professionals  
**So that** I understand my reputation on the platform

**Acceptance Criteria:**
- [ ] View overall customer rating
- [ ] See rating breakdown by category
- [ ] Read reviews from professionals
- [ ] See how rating affects booking ability
- [ ] Tips for improving rating
- [ ] Respond to reviews (optional)

**Priority:** P1 (Launch)

---

## Epic 2.6: Safety & Trust

### User Story 2.6.1: View Professional Verification Status
**As a** customer  
**I want to** see what verification checks a professional has passed  
**So that** I can trust them in my home

**Acceptance Criteria:**
- [ ] Clear badges: Background Check ✓, ID Verified ✓, References Verified ✓
- [ ] "What does this mean?" tooltips explaining each badge
- [ ] Date of last background check
- [ ] Number of completed bookings
- [ ] Member since date
- [ ] Insurance coverage information

**Priority:** P0 (MVP)

---

### User Story 2.6.2: Report Safety Concern
**As a** customer  
**I want to** report a safety concern or inappropriate behavior  
**So that** the platform can take action

**Acceptance Criteria:**
- [ ] "Report Issue" button accessible during and after booking
- [ ] Select issue type: safety threat, theft, property damage, inappropriate behavior, other
- [ ] Provide detailed description
- [ ] Upload evidence (photos, messages, video)
- [ ] Option to mark as urgent/emergency
- [ ] Immediate response from support team (<15 min for urgent)
- [ ] Professional may be suspended during investigation
- [ ] Follow-up within 24 hours