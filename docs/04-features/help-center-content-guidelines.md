# Help Center Content Guidelines

**Writing standards and best practices for MaidConnect help articles**

**Last Updated:** November 2025
**Owner:** Content Team
**Status:** Living Document

---

## Table of Contents

1. [Writing Principles](#writing-principles)
2. [Article Structure](#article-structure)
3. [Style Guide](#style-guide)
4. [Visual Assets](#visual-assets)
5. [Translation Guidelines](#translation-guidelines)
6. [SEO & Discoverability](#seo--discoverability)
7. [Quality Checklist](#quality-checklist)

---

## Writing Principles

### 1. User-First Language

**✅ DO:**
- Use "you" and "your" (direct address)
- Start with the user's goal (e.g., "How to book a service")
- Use customer language, not internal jargon
- Address common pain points directly

**❌ DON'T:**
- Use passive voice ("Bookings are created by...")
- Use technical terms without explanation
- Assume knowledge of platform mechanics
- Write from the company's perspective

**Example:**

```markdown
✅ GOOD: "How to cancel your booking and get a full refund"
❌ BAD: "Cancellation policy and refund processing procedures"

✅ GOOD: "You'll receive a full refund if you cancel more than 48 hours before service."
❌ BAD: "Refunds are processed according to the cancellation timeline outlined in section 3.2."
```

---

### 2. Outcome-Focused Writing

Every article should follow the **"Do this → See this"** pattern.

**Structure:**
1. **What you'll accomplish** (expected outcome)
2. **Step-by-step actions** (how to do it)
3. **What happens next** (confirmation/result)

**Example:**

```markdown
# How to Book a Cleaning Service

**What you'll accomplish:** Schedule a professional cleaning at your preferred time and get instant confirmation.

## Steps

1. Go to [Find Professionals](/professionals)
2. Browse available professionals or use filters
3. Click "View Profile" on your chosen professional
4. Click "Book Service"
5. Select date, time, and any add-ons
6. Review total price and confirm booking

## What happens next

- You'll receive instant confirmation via email
- The professional has 24 hours to accept
- Once accepted, you'll get a notification with next steps
- Payment is authorized but not charged until after service completion
```

---

### 3. Scannable Content

Users scan before reading. Make content easily scannable:

**✅ DO:**
- Use descriptive H2/H3 headings every 100-150 words
- Use bullet points for lists (not paragraphs)
- Bold key terms and actions
- Use numbered lists for sequential steps
- Break up long paragraphs (3-4 sentences max)

**❌ DON'T:**
- Write long paragraphs (>5 sentences)
- Use vague headings ("Overview", "Details")
- Bury important information in paragraph middle

---

### 4. Progressive Disclosure

Start simple, add complexity as needed:

1. **Core answer** in first paragraph (featured snippet)
2. **Common scenario** (80% of users)
3. **Edge cases** in collapsible sections or separate articles
4. **Advanced tips** at the end

**Example:**

```markdown
# When Will I Be Charged?

**You're charged 48 hours after service completion** once the professional marks the booking as complete.

## Payment Timeline

1. **At booking:** We authorize (hold) the amount on your card
2. **During service:** No charge yet—it's still on hold
3. **48 hours after completion:** The hold becomes an actual charge
4. **Receipt:** Sent via email immediately after charge

## Why the 48-hour hold?

This gives you time to report any issues before payment is finalized. If you have concerns, you can file a dispute within 48 hours.

<details>
<summary>What if I cancel before service?</summary>

The authorization hold is released immediately. Depending on your bank, it may take 3-5 business days to see the funds back in your account.
</details>
```

---

## Article Structure

### Standard Article Template

```markdown
# [Action-oriented title: "How to..." or "When will..."]

[One-sentence summary answering the core question]

## [H2: First major section]

[Content with bullet points, numbered steps, or short paragraphs]

### [H3: Subsection if needed]

[Additional details]

## What happens next

[Expected outcome or confirmation the user will see]

## Common questions

<details>
<summary>[Question 1]</summary>
[Answer]
</details>

<details>
<summary>[Question 2]</summary>
[Answer]
</details>

## Related articles

- [Link to related article 1]
- [Link to related article 2]
- [Link to related article 3]
```

---

### Article Length Guidelines

| Article Type | Word Count | Use Case |
|--------------|------------|----------|
| **Quick Reference** | 150-300 words | Simple how-to, single action |
| **Standard Guide** | 300-600 words | Multi-step process, common scenarios |
| **Comprehensive Guide** | 600-1,200 words | Complex topic, multiple scenarios |
| **Policy Explanation** | 400-800 words | Cancellation, refunds, safety |

**Target:** Most articles should be **300-600 words** (scannable in 2-3 minutes).

---

### Heading Hierarchy

```markdown
# Article Title (H1) - Only one per article
## Major Section (H2) - Every 100-200 words
### Subsection (H3) - For nested details
#### Rare Subsection (H4) - Only if absolutely necessary
```

**Heading Best Practices:**
- Use questions for H2 ("What if I need to cancel?")
- Use action phrases for H3 ("Canceling more than 48 hours before")
- Keep headings short (5-8 words max)
- Make headings descriptive (avoid "Overview", "Details")

---

## Style Guide

### Tone & Voice

**MaidConnect Tone:**
- **Friendly but professional** (not overly casual)
- **Helpful and empowering** (not patronizing)
- **Clear and direct** (not corporate or bureaucratic)
- **Reassuring** (especially for safety and payment topics)

**Examples:**

```markdown
✅ GOOD: "Your payment is secure and protected by Stripe's PCI-compliant system."
❌ BAD: "We utilize enterprise-grade security protocols for payment processing."

✅ GOOD: "Don't worry—if the professional doesn't show up, you'll get a full refund immediately."
❌ BAD: "In the event of a no-show, refund procedures will be initiated per policy 4.3."
```

---

### Formatting Conventions

#### Capitalization

| Element | Style | Example |
|---------|-------|---------|
| **Article titles** | Title Case | "How to Book a Service" |
| **Headings (H2/H3)** | Sentence case | "What happens if I cancel?" |
| **Buttons/UI elements** | Bold, exact match | Click **Book Service** |
| **Page names** | Title Case | Go to your Dashboard |
| **Feature names** | Title Case | Amara AI Assistant |

#### Numbers & Dates

- **Numbers:** Spell out one through nine; use numerals for 10+
- **Percentages:** Always use numerals (5%, not five percent)
- **Money:** Always use numerals with currency symbol ($50, COP 200,000)
- **Time:** Use 12-hour format with am/pm (9:00 am, not 09:00)
- **Dates:** Use Month DD, YYYY format (November 5, 2025)

#### Lists

**Numbered lists:** For sequential steps only
```markdown
1. Click **Book Service**
2. Select your date and time
3. Click **Confirm Booking**
```

**Bullet points:** For non-sequential items
```markdown
- Full refund for cancellations >48 hours before service
- 50% refund for cancellations 24-48 hours before
- No refund for cancellations <24 hours before
```

---

### Common Terms & Phrases

| Use This | Not This | Notes |
|----------|----------|-------|
| professional | cleaner, maid, worker | Respectful term |
| customer | client, user | Platform terminology |
| booking | appointment, reservation | Consistent terminology |
| service completion | job completion | Customer-friendly |
| authorized | pre-authorized, on hold | Clear payment term |
| charged | billed, debited | Simple payment term |
| GPS check-in | geolocation verification | User-friendly term |
| cancel | abort, terminate | Softer language |

---

### Writing for Both Audiences

**Customer articles** emphasize:
- Safety and trust
- Ease of use
- Price transparency
- Refund protection

**Professional articles** emphasize:
- Earnings potential
- Reputation building
- Professional development
- Platform policies

**Example—Same topic, different framing:**

**Customer article:**
> "All professionals are background-checked and verified before joining the platform. You can see verification badges on each profile."

**Professional article:**
> "Complete your background check and verification to earn trust badges on your profile. Verified professionals get 3x more bookings."

---

## Visual Assets

### Screenshot Guidelines

**When to include screenshots:**
- ✅ Complex UI interactions (booking flow, payment setup)
- ✅ Settings/account management pages
- ✅ Key confirmations (booking created, payment processed)
- ✅ Error states (with resolution steps)

**When NOT to include screenshots:**
- ❌ Simple text-based instructions
- ❌ Content that changes frequently
- ❌ Obvious UI elements (login button)

**Screenshot standards:**
- **Size:** 1200px wide (retina quality)
- **Format:** PNG or WebP (WebP preferred for smaller file size)
- **Annotations:** Red arrows/circles for callouts (use Snagit or Markup)
- **Privacy:** Blur any personal information (names, emails, addresses)
- **Alt text:** Descriptive alt text for accessibility

**Example alt text:**
```markdown
![Booking confirmation page showing service date, time, professional name, and total price with "Confirm Booking" button highlighted](booking-confirmation.png)
```

---

### GIF/Video Guidelines

**When to use GIFs:**
- Multi-step processes (e.g., booking flow, GPS check-in)
- Interactive UI elements (modals, dropdowns)
- Troubleshooting actions

**GIF standards:**
- **Length:** 5-15 seconds max
- **Size:** <2 MB (optimize with ezgif.com)
- **Frame rate:** 15-20 fps (smooth but small file size)
- **Loop:** Yes, for continuous processes

**Video guidelines:**
- **Length:** 30-90 seconds
- **Format:** MP4 (H.264 codec)
- **Resolution:** 1080p
- **Captions:** Always include captions (EN/ES)
- **Hosting:** YouTube (unlisted) or Supabase Storage

---

## Translation Guidelines

### Spanish Translation Approach

**Professional human translation** for:
- All customer-facing help articles (P0 and P1)
- Legal/policy articles (cancellation, refunds, safety)
- Professional onboarding articles

**AI + human review** for:
- Internal SOPs
- Lower-priority P2 articles
- Draft content (for review before translation)

---

### Colombian Spanish Specifics

**Terms specific to Colombian market:**

| English | Colombian Spanish | Not |
|---------|------------------|-----|
| Payment | Pago | Pagamiento |
| Cell phone | Celular | Móvil, teléfono |
| Professional | Profesional | Limpiador(a) |
| Service | Servicio | Trabajo |
| Cancel | Cancelar | Anular |
| Schedule | Agendar | Programar (both acceptable) |

**Currency:**
- Always use COP (Colombian pesos)
- Format: COP 200,000 (space after currency code)
- Or use peso symbol: $200.000 (dot as thousands separator)

**Cultural considerations:**
- Use formal "usted" form (not informal "tú")
- Be respectful and polite in tone
- Emphasize trust and safety (important in Colombian market)

---

### Translation Consistency

**Terminology management:**
- Maintain translation memory (TM) in spreadsheet
- Consistent terms across all articles
- Review by native Colombian speaker
- Update TM when terms change

**Example TM entry:**

| English | Spanish (ES-CO) | Context | Notes |
|---------|----------------|---------|-------|
| Book a service | Reservar un servicio | Button, CTA | "Agendar" also acceptable |
| GPS check-in | Registro GPS | Feature name | Not "ubicación GPS" |
| Background check | Verificación de antecedentes | Safety feature | Not "chequeo de antecedentes" |

---

## SEO & Discoverability

### Title Optimization

**Structure:** `[Action/Question] - MaidConnect Help`

**Examples:**
- ✅ "How to Book a Cleaning Service - MaidConnect Help"
- ✅ "When Will I Be Charged? - MaidConnect Help"
- ✅ "Cancellation Policy Explained - MaidConnect Help"

**Title best practices:**
- Include target keyword naturally
- Match user search queries
- Keep under 60 characters (for Google snippets)
- Use question format for "how-to" content

---

### First Paragraph = Featured Snippet

Google often pulls the first paragraph as a featured snippet. Structure it to answer the core question directly:

**Template:**
```markdown
# [Question as title]

[Direct answer in 1-2 sentences, 40-60 words]

[Optional: One more sentence with key detail or benefit]
```

**Example:**
```markdown
# When Will I Be Charged?

You're charged 48 hours after service completion, once the professional marks the booking as complete. We authorize (hold) the payment at booking time, but it's not charged until after you've confirmed the service was delivered.
```

---

### Keywords in Headings

Include target keywords naturally in H2/H3 headings:

**Example—Target keyword: "cancel booking"**
```markdown
# How to Cancel Your Booking

## When you can cancel for a full refund
## How to cancel a booking step-by-step
## What happens after you cancel
```

---

### Internal Linking

**Link to related articles** at the end of each article (3-5 links):

```markdown
## Related articles

- [Cancellation policy explained](/help/bookings/cancellation-policy)
- [How refunds work](/help/payments/refunds)
- [What if the professional doesn't show up?](/help/bookings/no-show)
```

**Benefits:**
- Improves SEO (internal link equity)
- Reduces bounce rate
- Helps users discover related content
- Increases self-service resolution rate

---

### Search Keywords

Include common search terms naturally in content:

**Example—Article: "How to cancel a booking"**

Include variations:
- "cancel my booking"
- "cancellation policy"
- "get a refund"
- "cancel before service"
- "cancellation deadline"

---

## Quality Checklist

Before publishing any help article, verify:

### Content Quality

- [ ] **Title is action-oriented** (How to..., When will..., What if...)
- [ ] **First paragraph answers core question** (30-60 words)
- [ ] **Headings are descriptive** (not "Overview" or "Details")
- [ ] **Steps are numbered** for sequential processes
- [ ] **Bullet points used** for non-sequential lists
- [ ] **No paragraph >5 sentences** (scannable content)
- [ ] **"What happens next"** section included
- [ ] **Related articles** linked (3-5 links)
- [ ] **Common questions** addressed (FAQ accordion)

### Style & Tone

- [ ] **Tone is friendly but professional**
- [ ] **Uses "you/your"** (direct address)
- [ ] **No jargon** without explanation
- [ ] **Bold used** for UI elements (Click **Book Service**)
- [ ] **Consistent terminology** (professional, not cleaner)
- [ ] **Numbers formatted correctly** (spell 1-9, numerals 10+)
- [ ] **Currency formatted correctly** (COP 200,000)

### Visual Assets

- [ ] **Screenshots included** where helpful
- [ ] **Alt text written** for all images (accessibility)
- [ ] **Personal info blurred** in screenshots
- [ ] **Annotations clear** (red arrows/circles)
- [ ] **GIFs optimized** (<2 MB file size)

### Technical & SEO

- [ ] **Title includes keyword** naturally
- [ ] **URL is clean** (/help/category/article-name)
- [ ] **First paragraph optimized** for featured snippet
- [ ] **Keywords in H2 headings** naturally
- [ ] **Internal links added** (3-5 related articles)
- [ ] **Meta description written** (150-160 characters)

### Translation (if applicable)

- [ ] **Spanish version matches structure** of English
- [ ] **Colombian Spanish terms** used correctly
- [ ] **Formal "usted" form** used consistently
- [ ] **Currency formatted** for Colombian market (COP)
- [ ] **Native speaker reviewed** translation

### Testing

- [ ] **Article readable** on mobile (test on phone)
- [ ] **Links work** (no 404s)
- [ ] **Search finds article** (test search with keywords)
- [ ] **Feedback widget works** ("Was this helpful?")
- [ ] **Related articles display** correctly
- [ ] **Print preview** looks good (if users print)

---

## Article Review Process

### Before Publishing

1. **Self-review:** Writer completes quality checklist
2. **Peer review:** Another writer reviews for clarity and accuracy
3. **Subject matter expert (SME) review:** Product/support team validates accuracy
4. **Copy edit:** Final grammar/style check
5. **Translation:** Professional Spanish translation
6. **Translation review:** Native Colombian speaker reviews
7. **Staging test:** Publish to staging, test all functionality
8. **Publish:** Publish to production

### After Publishing

**Monitor for 2 weeks:**
- "Was this helpful?" feedback (target: >80% helpful)
- Search queries leading to article (using analytics)
- Related support tickets (did it reduce questions?)
- User comments/questions (if enabled)

**Update if:**
- <70% helpful rating
- Feature changes make content outdated
- Users consistently ask clarifying questions
- Better information becomes available

---

## Content Maintenance

### Regular Updates

**Quarterly review:** (Every 3 months)
- Check all P0 articles for accuracy
- Update screenshots if UI changed
- Refresh "last updated" dates
- Archive outdated articles

**Feature release review:** (When features change)
- Update affected articles within 1 week of release
- Add new articles for new features
- Archive deprecated feature articles

**SEO review:** (Every 6 months)
- Analyze top search queries
- Identify content gaps (queries with no matching article)
- Optimize underperforming articles
- Update internal linking structure

---

## Content Governance

### Roles & Responsibilities

| Role | Responsibilities |
|------|------------------|
| **Content Writer** | Draft articles, self-review, incorporate feedback |
| **Content Lead** | Review articles, maintain style guide, coordinate translations |
| **SME (Product/Support)** | Validate technical accuracy, provide product context |
| **Translator** | Professional Spanish translation, cultural adaptation |
| **QA Tester** | Test articles on staging, verify links and functionality |

### Approval Authority

| Article Type | Approver |
|--------------|----------|
| **New P0 article** | Content Lead + SME |
| **New P1/P2 article** | Content Lead |
| **Minor update** | Content Writer (notify lead) |
| **Policy change** | Legal + Product + Content Lead |
| **Translation** | Native speaker + Content Lead |

---

## Tools & Resources

### Writing Tools
- **Grammar check:** Grammarly or Hemingway Editor
- **Readability:** Hemingway Editor (target: Grade 8 or below)
- **Translation:** DeepL + professional review
- **Screenshots:** Snagit or macOS Markup
- **GIFs:** Loom or LICEcap
- **Alt text generator:** Azure AI or manual writing

### Reference Documents
- [Help Center Categories](./help-center-categories.md) - Complete article structure
- [Help Center SOPs](./help-center-sops.md) - Support team procedures
- [Product Requirements Document (PRD)](../01-product/prd.md) - Platform features
- [User Stories](../01-product/user-stories.md) - User pain points

### Templates
- [Standard article template](#standard-article-template) (above)
- [How-to article template](#article-structure) (above)
- [Policy explanation template](#progressive-disclosure) (above)

---

## Examples of Excellent Help Articles

### Example 1: Clear Process Article

**Article:** "How to Book a Service"
- ✅ Numbered steps with bold UI elements
- ✅ Screenshot of booking form
- ✅ "What happens next" section
- ✅ Common questions addressed
- ✅ Related articles linked

### Example 2: Policy Explanation

**Article:** "Cancellation Policy Explained"
- ✅ Clear refund tiers (>48h, 24-48h, <24h)
- ✅ Visual table showing policy breakdown
- ✅ "Why this policy?" explanation builds trust
- ✅ Links to "How to cancel" and "How refunds work"

### Example 3: Troubleshooting Guide

**Article:** "GPS Check-In Not Working?"
- ✅ Step-by-step troubleshooting (progressive disclosure)
- ✅ Screenshots showing GPS permissions
- ✅ Alternative solutions (manual override contact support)
- ✅ "Why GPS is required" explanation

---

**Last Updated:** November 2025
**Next Review:** February 2026
**Maintained By:** Content Team
**Questions?** Contact content@casaora.co
