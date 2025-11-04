# Casaora - Compliance & Security Frameworks

## 📋 Overview

Casaora is a marketplace platform connecting customers with household service professionals in Colombia. Given the nature of the platform (payments, personal data, geolocation, messaging), several compliance frameworks and security standards are applicable.

**Last Updated:** 2025-01-30
**Status:** Pre-Launch - Implementation Roadmap

---

## 🎯 Critical Compliance Requirements

### 1. Payment Card Industry Data Security Standard (PCI DSS)

**Status:** ✅ **Compliant via Stripe**

**Why It Matters:**
- Casaora processes credit card payments for bookings
- Non-compliance can result in fines, liability for breaches, and inability to process cards

**Current Implementation:**
- **Stripe Integration:** Using Stripe's hosted payment elements
- **PCI SAQ-A Eligible:** Casaora never touches raw card data
- **Compliance Level:** PCI DSS SAQ-A (simplest level)

**Evidence in Code:**
- `src/components/bookings/enhanced-booking-form.tsx` - Uses Stripe Elements
- Payment capture happens server-side via Stripe API
- No card data stored in Casaora database

**Actions Required:**
- [ ] Complete PCI DSS SAQ-A questionnaire annually
- [ ] Maintain Stripe integration without custom card handling
- [ ] Document payment flow in security policy
- [ ] Regular security scans of public-facing website

**Resources:**
- [Stripe PCI Compliance Guide](https://stripe.com/docs/security/guide)
- [PCI SAQ-A](https://www.pcisecuritystandards.org/documents/PCI-DSS-v4_0-SAQ-A-r1.pdf)

---

### 2. Colombian Personal Data Protection Law (Ley 1581 de 2012)

**Status:** ⚠️ **Requires Implementation**

**Why It Matters:**
- Casaora is based in Colombia and processes Colombian residents' data
- Equivalent to GDPR but with Colombian-specific requirements
- Enforced by Superintendencia de Industria y Comercio (SIC)

**Data Types Collected:**
- **Personal:** Full name, email, phone number, addresses
- **Location:** GPS coordinates during check-in/check-out
- **Financial:** Payment history, payout information
- **Biometric (Future):** Photos in portfolios, avatar URLs
- **Behavioral:** Service preferences, messaging history

**Key Requirements:**

#### 2.1 Consent Management
- [ ] **Explicit consent** required before data collection
- [ ] **Purpose limitation** - state why data is collected
- [ ] **Revocation mechanism** - users can withdraw consent
- [ ] **Granular consent** - separate consent for different purposes

**Implementation Needed:**
```typescript
// Example consent flow needed at signup
type ConsentTypes = {
  required_service: boolean;      // Service delivery
  marketing: boolean;             // Marketing communications
  analytics: boolean;             // Usage analytics
  third_party_sharing: boolean;   // Share with partners
};
```

#### 2.2 Data Subject Rights
- [ ] **Right to access** - users can request their data
- [ ] **Right to rectification** - users can correct data
- [ ] **Right to deletion** - users can request deletion
- [ ] **Right to portability** - export data in machine-readable format

**Implementation Status:**
- ❌ No self-service data export currently
- ❌ No automated deletion workflow
- ⚠️ Manual rectification via profile editing

#### 2.3 Privacy Policy Requirements
- [ ] **Clear language** in Spanish
- [ ] **Data categories** collected
- [ ] **Processing purposes** explained
- [ ] **Third-party sharing** disclosed (Stripe, Supabase, Vercel)
- [ ] **Data retention periods** specified
- [ ] **User rights** explained
- [ ] **Contact information** for data protection officer

**Current Status:**
- ✅ Privacy page exists: `src/app/[locale]/privacy/page.tsx`
- ⚠️ Content needs legal review for Ley 1581 compliance

#### 2.4 Data Security Measures
- [ ] **Encryption in transit** (HTTPS)
- [ ] **Encryption at rest** (database encryption)
- [ ] **Access controls** (role-based access)
- [ ] **Audit logging** for data access
- [ ] **Incident response plan**

**Actions Required:**

**Immediate (Pre-Launch):**
1. Update privacy policy with Ley 1581 requirements
2. Add consent checkboxes at signup
3. Create data subject rights request form
4. Document data retention policy
5. Register as data controller with SIC (if required)

**Short-term (3 months):**
1. Implement self-service data export
2. Build automated deletion workflow
3. Add audit logging for sensitive data access
4. Create incident response plan

**Resources:**
- [Ley 1581 Full Text](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981)
- [SIC Data Protection Guide](https://www.sic.gov.co/proteccion-de-datos-personales)

---

### 3. General Data Protection Regulation (GDPR)

**Status:** 🌍 **Required if serving EU customers**

**Why It Matters:**
- If Casaora expands to serve EU residents (even remotely)
- Stricter than Colombian law in many areas
- Fines up to €20M or 4% of global revenue

**Applicability:**
- Not currently required (Colombia-only operations)
- Consider if expanding internationally

**Key Differences from Ley 1581:**
- Stricter consent requirements (opt-in, not opt-out)
- Data Protection Impact Assessments (DPIAs) for high-risk processing
- Data Protection Officer (DPO) required for certain operations
- Right to be forgotten (stronger than Colombian law)
- Cross-border data transfer restrictions

**Implementation if Needed:**
- Cookie consent banner (more strict than Colombia)
- GDPR-compliant privacy policy
- Data processing agreements with vendors
- EU representative appointment

---

### 4. Know Your Customer (KYC) / Anti-Money Laundering (AML)

**Status:** ⚠️ **Recommend Implementation for Professionals**

**Why It Matters:**
- Professionals receive payouts (money movement)
- Platform could be used for money laundering
- Colombian AML regulations (Circular Externa 027 de 2020)

**Current Verification:**
- ✅ Basic identity verification (name, email, phone)
- ✅ Stripe Connect identity verification
- ❌ No formal KYC process
- ❌ No document verification

**Risk Assessment:**
- **Low Risk:** Small transactions (<$1,000 USD typical)
- **Medium Risk:** High-volume professionals
- **High Risk:** Cross-border payments (if added)

**Recommended Implementation:**

**Tier 1 - Basic (Current):**
- Email verification
- Phone verification
- Stripe Connect onboarding

**Tier 2 - Enhanced (Recommended):**
- Government ID verification (Cédula de Ciudadanía)
- Proof of address
- Background check (Policía Nacional certificate)
- Professional license verification (if applicable)

**Tier 3 - Advanced (High-Volume):**
- Enhanced due diligence for professionals earning >$5M COP/month
- Source of funds verification
- Periodic re-verification

**Implementation Status:**
- ⚠️ Tier 1 implemented via Stripe
- ❌ Tier 2 needs implementation
- ❌ No AML monitoring

**Actions Required:**
1. Partner with identity verification provider (e.g., Truora, Verifik)
2. Add ID upload during professional onboarding
3. Implement payout velocity monitoring
4. Create suspicious activity reporting process
5. Consult with Colombian financial lawyer on AML obligations

---

## 🔒 Security Frameworks (Optional but Recommended)

### 5. SOC 2 Type II Certification

**Status:** 🎯 **Consider for Enterprise Customers**

**Why It Matters:**
- Required by many enterprise clients
- Demonstrates mature security practices
- Competitive advantage

**When to Pursue:**
- When targeting business clients (corporate cleaning contracts)
- When handling sensitive business data
- After achieving product-market fit

**Timeline:** 6-12 months from start to certification

**Cost:** $20,000-$50,000 USD for initial audit

**Requirements:**
- Security policies and procedures
- Access controls and authentication
- Encryption standards
- Incident response plan
- Vendor management program
- Regular security testing
- 3-6 months of operational history

**Actions Required (Future):**
1. Gap assessment with SOC 2 auditor
2. Implement security controls
3. Document policies and procedures
4. Conduct readiness assessment
5. Formal audit (3-6 months of evidence)

---

### 6. ISO 27001 Information Security Management

**Status:** 🌍 **International Standard (Optional)**

**Why It Matters:**
- Globally recognized security standard
- Required by some enterprise clients
- Demonstrates systematic approach to security

**Similar to SOC 2 but:**
- More comprehensive (114 controls)
- Internationally recognized (SOC 2 is US-focused)
- Can be self-certified initially

**When to Pursue:**
- Expanding internationally
- Targeting global enterprise customers
- After SOC 2 (if pursuing compliance path)

**Timeline:** 12-18 months

**Cost:** $30,000-$100,000 USD

---

### 7. OWASP Top 10 Security Best Practices

**Status:** ✅ **Should Implement (Free)**

**Why It Matters:**
- Industry-standard web application security practices
- No certification, just good engineering
- Prevents most common vulnerabilities

**Top 10 Vulnerabilities:**

#### A01: Broken Access Control ✅ **Implemented**
- Row-level security in Supabase
- Role-based access (customer, professional, admin)
- Evidence: `supabase/migrations/` RLS policies

#### A02: Cryptographic Failures ✅ **Implemented**
- HTTPS for all traffic
- Supabase database encryption at rest
- Stripe for payment security

#### A03: Injection ✅ **Implemented**
- Supabase RPC functions prevent SQL injection
- Parameterized queries throughout
- Evidence: `src/app/api/` route handlers

#### A04: Insecure Design ⚠️ **Needs Review**
- [ ] Threat modeling exercise needed
- [ ] Security requirements in design phase
- [ ] Secure by default configurations

#### A05: Security Misconfiguration ⚠️ **Needs Hardening**
- [ ] Remove development/debugging code in production
- [ ] Minimize exposed endpoints
- [ ] Security headers (CSP, HSTS, X-Frame-Options)
- [ ] Disable unnecessary features

**Actions Required:**
```typescript
// Add security headers in next.config.js
headers: async () => [
  {
    source: '/:path*',
    headers: [
      { key: 'X-DNS-Prefetch-Control', value: 'on' },
      { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
    ],
  },
],
```

#### A06: Vulnerable Components ⚠️ **Needs Monitoring**
- [ ] Automated dependency scanning (Snyk, Dependabot)
- [ ] Regular npm audit
- [ ] Update cadence for dependencies

**Actions Required:**
```bash
# Enable GitHub Dependabot
# Add .github/dependabot.yml

# Regular security audits
npm audit
npm audit fix
```

#### A07: Identification and Authentication ✅ **Implemented**
- Supabase Auth for authentication
- Email verification required
- JWT tokens with expiration
- Evidence: `src/lib/auth.ts`

**Enhancement Needed:**
- [ ] Add 2FA/MFA for professionals
- [ ] Rate limiting on login endpoints
- [ ] Account lockout after failed attempts

#### A08: Software and Data Integrity ⚠️ **Needs Implementation**
- [ ] Code signing for releases
- [ ] Integrity checks for dependencies
- [ ] CI/CD pipeline security

#### A09: Security Logging and Monitoring ❌ **Not Implemented**
- [ ] Centralized logging (e.g., Sentry, LogRocket)
- [ ] Security event monitoring
- [ ] Alerting for suspicious activity
- [ ] Log retention policy

**Actions Required:**
1. Add Sentry for error tracking
2. Log authentication events
3. Monitor unusual booking patterns
4. Alert on mass data export attempts

#### A10: Server-Side Request Forgery (SSRF) ✅ **Low Risk**
- No user-provided URLs fetched server-side
- Webhook endpoints validated (Stripe signatures)

---

## 🏢 Employment & Labor Compliance

### 8. Gig Economy / Contractor Classification

**Status:** ⚠️ **Legal Gray Area**

**Why It Matters:**
- Colombian labor law is strict on worker classification
- Misclassification can result in massive liabilities
- Recent global cases (Uber, Rappi) increase scrutiny

**Current Model:**
- Professionals are independent contractors
- They set their own rates
- They accept/decline jobs freely
- Casaora takes commission

**Risks:**
- Could be reclassified as employees
- Back-pay of benefits, severance, social security
- Fines from Ministry of Labor

**Compliance Strategies:**

**Option 1: True Independent Contractor Model (Current)**
- ✅ Professionals set own schedules
- ✅ Professionals can decline jobs
- ✅ Professionals set own rates (within ranges)
- ❌ Platform sets commission rate
- ❌ GPS tracking could imply control

**Option 2: Marketplace Model (Stronger)**
- Platform connects but doesn't employ
- Minimal control over professionals
- Professionals are clearly independent businesses
- Written independent contractor agreements

**Option 3: Hybrid/Employee Model**
- Employ professionals directly
- Full benefits, social security
- More expensive but clear compliance
- Used by some cleaning companies

**Recommended Approach:**

**Immediate:**
1. Legal review with Colombian labor lawyer
2. Independent contractor agreements (clear language)
3. Avoid language implying employment
4. Allow professionals to work for competitors
5. Don't require exclusivity

**Medium-term:**
1. Consider professional LLC/business registration requirement
2. Document hands-off approach
3. Minimize direct control/supervision

**Resources:**
- Colombian Labor Code (Código Sustantivo del Trabajo)
- Ministry of Labor guidelines on contractors
- Recent Rappi/Uber rulings in Colombia

---

## 🔐 Technical Security Requirements

### 9. Data Encryption

**Status:** ✅ **Mostly Implemented**

#### Encryption in Transit
- ✅ HTTPS everywhere (Vercel enforced)
- ✅ TLS 1.2+ for API calls
- ✅ Secure WebSocket connections (Supabase Realtime)

#### Encryption at Rest
- ✅ Supabase PostgreSQL encryption
- ⚠️ Need to verify: File uploads (professional portfolios)
- ⚠️ Need to verify: Message attachments

**Actions Required:**
1. Confirm Supabase Storage encryption enabled
2. Add client-side encryption for sensitive messages (optional)
3. Document encryption standards

---

### 10. Authentication & Authorization

**Status:** ✅ **Well Implemented**

**Current Implementation:**
- JWT tokens via Supabase Auth
- Row-level security (RLS) in database
- Role-based access control
- Session management

**Enhancements Needed:**
- [ ] Two-factor authentication (2FA)
- [ ] OAuth social logins (Google, Facebook)
- [ ] Biometric authentication for mobile
- [ ] Session timeout configurations

---

### 11. Secure Development Lifecycle (SDLC)

**Status:** ⚠️ **Informal**

**Current Practices:**
- ✅ Git version control
- ✅ Code review (implicit with Claude Code)
- ❌ No formal security code review
- ❌ No penetration testing
- ❌ No security training for developers

**Recommended Practices:**

**Code Review:**
- Security-focused code review checklist
- Peer review for sensitive changes
- Automated static analysis (ESLint security rules)

**Testing:**
- [ ] Security unit tests
- [ ] Penetration testing (annual)
- [ ] Vulnerability scanning
- [ ] Bug bounty program (future)

**Documentation:**
- [ ] Security architecture diagrams
- [ ] Threat models
- [ ] Incident response runbooks

---

## 📊 Compliance Roadmap & Prioritization

### Pre-Launch (Critical) ⚠️

**Must-Have Before Public Launch:**

1. **Ley 1581 Compliance**
   - [ ] Update privacy policy (Spanish)
   - [ ] Add consent checkboxes at signup
   - [ ] Create terms of service
   - [ ] Data retention policy
   - **Estimated Time:** 2 weeks
   - **Cost:** $1,000-$3,000 (legal review)

2. **PCI DSS SAQ-A**
   - [ ] Complete questionnaire
   - [ ] Document Stripe integration
   - [ ] Quarterly security scans
   - **Estimated Time:** 1 week
   - **Cost:** $500 (scanner) + internal time

3. **Security Hardening**
   - [ ] Add security headers
   - [ ] Enable Dependabot
   - [ ] Set up error monitoring (Sentry)
   - [ ] Implement rate limiting
   - **Estimated Time:** 1 week
   - **Cost:** $200/month (Sentry)

4. **Legal Agreements**
   - [ ] Terms of Service
   - [ ] Privacy Policy
   - [ ] Professional Contractor Agreement
   - [ ] Customer Service Agreement
   - **Estimated Time:** 2 weeks
   - **Cost:** $2,000-$5,000 (lawyer)

**Total Pre-Launch:** ~6 weeks, $4,000-$9,000

---

### Post-Launch (3-6 months) 📅

**High Priority:**

1. **Enhanced KYC for Professionals**
   - [ ] ID verification integration
   - [ ] Background check process
   - **Estimated Time:** 3 weeks
   - **Cost:** $0.50-$2 per verification

2. **Data Subject Rights Portal**
   - [ ] Self-service data export
   - [ ] Account deletion workflow
   - [ ] Data rectification tools
   - **Estimated Time:** 4 weeks
   - **Cost:** Internal development time

3. **Security Monitoring**
   - [ ] Centralized logging
   - [ ] Suspicious activity alerts
   - [ ] Audit trail for sensitive operations
   - **Estimated Time:** 2 weeks
   - **Cost:** $100-$500/month

4. **Incident Response Plan**
   - [ ] Document procedures
   - [ ] Assign responsibilities
   - [ ] Test with tabletop exercise
   - **Estimated Time:** 1 week
   - **Cost:** Internal time

**Total Post-Launch:** ~10 weeks, $100-$500/month recurring

---

### Growth Phase (12+ months) 🚀

**Enterprise Readiness:**

1. **SOC 2 Type II Certification**
   - If pursuing enterprise customers
   - **Timeline:** 6-12 months
   - **Cost:** $20,000-$50,000

2. **Penetration Testing**
   - Annual security assessment
   - **Timeline:** 2-4 weeks
   - **Cost:** $10,000-$25,000

3. **Bug Bounty Program**
   - Crowd-sourced security testing
   - **Timeline:** Ongoing
   - **Cost:** $500-$5,000/month

4. **ISO 27001** (if international expansion)
   - **Timeline:** 12-18 months
   - **Cost:** $30,000-$100,000

---

## 🚨 Immediate Action Items

### This Week

1. **Legal Consultation**
   - Schedule call with Colombian tech lawyer
   - Topics: Ley 1581, contractor classification, terms of service
   - **Priority:** Critical

2. **Privacy Policy Update**
   - Review current privacy page
   - Add Ley 1581 required sections
   - Spanish translation review
   - **Priority:** Critical

3. **Security Audit**
   - Run npm audit
   - Enable GitHub Dependabot
   - Review .env for exposed secrets
   - **Priority:** High

### Next Week

4. **Consent Management**
   - Design consent checkboxes for signup
   - Create consent management system
   - **Priority:** Critical

5. **Error Monitoring**
   - Set up Sentry account
   - Integrate with Next.js
   - Configure alerts
   - **Priority:** High

6. **Security Headers**
   - Add to next.config.js
   - Test with securityheaders.com
   - **Priority:** Medium

---

## 📚 Resources & Tools

### Legal Resources

**Colombia-Specific:**
- [Superintendencia de Industria y Comercio (SIC)](https://www.sic.gov.co/)
- [Ministry of Labor](https://www.mintrabajo.gov.co/)
- Colombian tech lawyer recommendations needed

**International:**
- [GDPR Official Text](https://gdpr.eu/)
- [PCI Security Standards Council](https://www.pcisecuritystandards.org/)

### Security Tools

**Free/Open Source:**
- [OWASP ZAP](https://www.zaproxy.org/) - Security testing
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit) - Dependency scanning
- [GitHub Dependabot](https://github.com/dependabot) - Automated updates
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Security audits

**Paid Services:**
- [Sentry](https://sentry.io/) - Error monitoring ($26-$80/month)
- [Snyk](https://snyk.io/) - Dependency scanning ($0-$129/month)
- [Truora](https://www.truora.com/) - Colombian identity verification
- [Verifik](https://www.verifik.co/) - Colombian background checks

### Compliance Management

**Platforms:**
- [Vanta](https://www.vanta.com/) - SOC 2 automation ($4,000+/year)
- [Drata](https://drata.com/) - SOC 2 automation ($3,500+/year)
- [Secureframe](https://secureframe.com/) - Compliance automation ($1,500+/year)

---

## 🎓 Training & Awareness

### Developer Security Training

**Recommended Courses:**
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Secure Coding in JavaScript](https://www.pluralsight.com/)
- [Web Application Security](https://portswigger.net/web-security)

**Internal Knowledge:**
- Security code review guidelines
- Incident response procedures
- Data handling best practices

---

## 📞 Contact & Escalation

### Internal Responsibilities

**Assign before launch:**
- [ ] Data Protection Officer (DPO)
- [ ] Security Incident Response Lead
- [ ] Legal/Compliance Contact
- [ ] Customer Support Lead (for data requests)

### External Contacts

**To Establish:**
- Colombian tech lawyer (retained)
- Cybersecurity consultant
- Identity verification vendor
- Insurance broker (cyber liability)

---

## 📈 Compliance Metrics

### Track Quarterly

1. **Security Metrics:**
   - Critical vulnerabilities detected/resolved
   - Mean time to patch vulnerabilities
   - Security incidents (count, severity)
   - Uptime/availability

2. **Privacy Metrics:**
   - Data subject requests received/fulfilled
   - Average response time
   - Consent opt-in rates
   - Data retention compliance

3. **KYC Metrics:**
   - Professional verification completion rate
   - Time to verify new professionals
   - Rejected applications (with reasons)

4. **Audit Metrics:**
   - Last security audit date
   - Open audit findings
   - Compliance training completion rate

---

## ✅ Compliance Checklist Summary

### 🚨 Critical (Pre-Launch)
- [ ] Ley 1581 privacy policy updated
- [ ] Terms of Service created
- [ ] Consent management implemented
- [ ] PCI DSS SAQ-A completed
- [ ] Professional contractor agreements
- [ ] Security headers enabled
- [ ] Error monitoring (Sentry) configured

### ⚠️ High Priority (Post-Launch)
- [ ] Data subject rights portal
- [ ] Enhanced KYC for professionals
- [ ] Security logging/monitoring
- [ ] Incident response plan
- [ ] Regular security audits
- [ ] Dependency scanning automated

### 📊 Medium Priority (Growth Phase)
- [ ] SOC 2 Type II certification
- [ ] Penetration testing
- [ ] Bug bounty program
- [ ] Two-factor authentication
- [ ] Advanced fraud detection

### 🌍 Optional (International Expansion)
- [ ] GDPR compliance
- [ ] ISO 27001 certification
- [ ] Regional compliance (per market)

---

## 💡 Recommendations

### Tier 1: Minimum Viable Compliance (Pre-Launch)
**Investment:** $5,000-$10,000 + 40 hours internal time
**Timeline:** 6-8 weeks

Focus on legal compliance (Ley 1581, terms of service) and basic security hardening. This gets you to launch legally and safely.

### Tier 2: Production-Ready (First 6 months)
**Investment:** $15,000-$25,000 + 100 hours internal time
**Timeline:** 6 months

Add KYC verification, security monitoring, data subject rights. This positions you as a trustworthy platform.

### Tier 3: Enterprise-Ready (12+ months)
**Investment:** $50,000-$150,000 + significant internal time
**Timeline:** 12-18 months

Pursue SOC 2, conduct penetration testing, implement advanced security. This enables enterprise sales.

---

## 🎯 Next Steps

1. **Schedule legal consultation** (this week)
2. **Prioritize pre-launch checklist** items
3. **Create Jira/Linear tickets** for each compliance task
4. **Assign owners** for each area
5. **Set deadlines** based on launch date
6. **Budget accordingly** for legal, tools, and certifications

---

**Document Maintained By:** Technical Team
**Last Reviewed:** 2025-01-30
**Next Review:** Before Launch + Quarterly thereafter
**Version:** 1.0

---

**Questions or Concerns?**
This document should be reviewed with:
- Colombian tech lawyer (legal compliance)
- Security consultant (technical security)
- Insurance broker (cyber liability coverage)

Remember: Compliance is ongoing, not a one-time task. Budget time and resources for continuous improvement.
