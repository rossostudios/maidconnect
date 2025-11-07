# Data Processing Agreement (DPA)

**Template Version:** 1.0.0
**Last Updated:** 2025-11-06

---

> **⚖️ LEGAL DISCLAIMER**
> This is a template Data Processing Agreement (DPA) for use with third-party data processors. This document MUST be reviewed and customized by a qualified attorney before execution with any vendor. This template is designed to comply with GDPR Article 28 and Colombian Law 1581 Article 16.

---

## Table of Contents

1. [Purpose and Scope](#purpose-and-scope)
2. [Definitions](#definitions)
3. [Roles and Responsibilities](#roles-and-responsibilities)
4. [Data Processing Instructions](#data-processing-instructions)
5. [Processor Obligations](#processor-obligations)
6. [Sub-Processing](#sub-processing)
7. [Data Subject Rights](#data-subject-rights)
8. [Security Measures](#security-measures)
9. [Data Breach Notification](#data-breach-notification)
10. [International Data Transfers](#international-data-transfers)
11. [Audits and Inspections](#audits-and-inspections)
12. [Data Retention and Deletion](#data-retention-and-deletion)
13. [Liability and Indemnification](#liability-and-indemnification)
14. [Term and Termination](#term-and-termination)
15. [Governing Law](#governing-law)
16. [Signature Block](#signature-block)

---

## Purpose and Scope

### Purpose

This Data Processing Agreement ("DPA") sets forth the terms under which **[PROCESSOR NAME]** ("Processor") processes Personal Data on behalf of **[MAIDCONNECT LEGAL NAME]** ("Controller") in connection with the services provided under the Master Services Agreement dated **[DATE]** ("MSA").

### Scope

This DPA applies to all Processing of Personal Data by Processor on behalf of Controller in connection with the Services, including:
- Personal Data stored in Processor's systems
- Personal Data transmitted through Processor's infrastructure
- Personal Data processed by Processor's Sub-processors (with Controller consent)

### Relationship to MSA

This DPA supplements and forms an integral part of the MSA. In case of conflict between the MSA and this DPA, this DPA prevails on data protection matters.

---

## Definitions

**Capitalized terms used in this DPA:**

- **"Personal Data"** - Any information relating to an identified or identifiable natural person, as defined in GDPR Article 4(1) and Colombian Law 1581 Article 3(e).

- **"Processing"** - Any operation performed on Personal Data, including collection, storage, use, disclosure, deletion, or destruction, as defined in GDPR Article 4(2) and Colombian Law 1581 Article 3(f).

- **"Data Subject"** - The identified or identifiable natural person to whom Personal Data relates (e.g., MaidConnect customers and professionals).

- **"Controller"** - The entity that determines the purposes and means of Processing Personal Data (MaidConnect).

- **"Processor"** - The entity that Processes Personal Data on behalf of the Controller ([PROCESSOR NAME]).

- **"Sub-processor"** - Any third party engaged by Processor to Process Personal Data on behalf of Controller.

- **"Data Breach"** - A breach of security leading to accidental or unlawful destruction, loss, alteration, unauthorized disclosure of, or access to Personal Data.

- **"Supervisory Authority"** -
  - For GDPR: European Data Protection Board (EDPB) or national DPAs
  - For Colombian Law 1581: Superintendencia de Industria y Comercio (SIC)

- **"GDPR"** - Regulation (EU) 2016/679 (General Data Protection Regulation)

- **"Colombian Law 1581"** - Ley 1581 de 2012 (Colombian data protection law)

---

## Roles and Responsibilities

### Controller (MaidConnect)

**Responsibilities:**
1. **Determine Purpose and Means** - Controller determines why and how Personal Data is processed
2. **Provide Instructions** - Provide documented Processing instructions to Processor
3. **Ensure Lawful Basis** - Obtain necessary consents and ensure legal basis for Processing
4. **Data Subject Rights** - Respond to Data Subject rights requests (with Processor assistance)
5. **Supervisory Authority** - Manage relationships with SIC and other supervisory authorities

**Authority:**
- Issue binding Processing instructions to Processor
- Audit Processor's compliance with this DPA
- Approve or reject Sub-processors

### Processor ([PROCESSOR NAME])

**Responsibilities:**
1. **Follow Instructions** - Process Personal Data only as instructed by Controller
2. **Security** - Implement appropriate technical and organizational measures
3. **Confidentiality** - Ensure all personnel are bound by confidentiality
4. **Assist Controller** - Support Controller in fulfilling data protection obligations
5. **Sub-processing** - Obtain Controller approval before engaging Sub-processors
6. **Breach Notification** - Notify Controller of Data Breaches within required timeframes

**Limitations:**
- May NOT Process Personal Data for Processor's own purposes
- May NOT disclose Personal Data to third parties without Controller consent
- May NOT transfer Personal Data outside authorized jurisdictions without approval

---

## Data Processing Instructions

### Authorized Processing Activities

**Processor is authorized to Process Personal Data for the following purposes only:**

1. **Service Delivery** - Providing the Services described in the MSA, including:
   - [SPECIFIC SERVICE: e.g., "Database hosting and management" for Supabase]
   - [SPECIFIC SERVICE: e.g., "Payment processing" for Stripe]
   - [SPECIFIC SERVICE: e.g., "Email delivery" for Resend]

2. **Service Maintenance** - Maintaining and supporting the Services:
   - Error monitoring and debugging
   - Performance optimization
   - Security updates and patches

3. **Legal Compliance** - Complying with legal obligations:
   - Responding to valid legal process (with Controller notification)
   - Regulatory compliance (financial, tax, etc.)

### Categories of Data Subjects

**Personal Data relates to the following categories of Data Subjects:**
- MaidConnect customers (individuals booking cleaning services)
- MaidConnect professionals (service providers)
- MaidConnect employees and contractors (if applicable)

### Types of Personal Data

**Processor may Process the following categories of Personal Data:**

| Category | Data Elements | Sensitivity |
|----------|---------------|-------------|
| **Identity Data** | Name, date of birth, government ID number (Cédula) | High |
| **Contact Data** | Email, phone number, address | Medium |
| **Account Data** | Username, password hash, profile photo | Medium |
| **Financial Data** | Bank account details, payment card tokens | High (PCI-DSS) |
| **Transaction Data** | Booking details, service history, payments | Medium |
| **Communications Data** | In-app messages, emails, SMS | Medium |
| **Technical Data** | IP address, device info, browser data | Low |
| **Location Data** | Service address, approximate geolocation | Medium |

**Sensitive Data:** Processor shall NOT process sensitive data (health, biometric, religious beliefs, etc.) unless explicitly authorized in writing by Controller.

### Processing Duration

**Duration:** For the term of the MSA and as necessary for Service provision.

**Retention After Termination:** See [Data Retention and Deletion](#data-retention-and-deletion).

---

## Processor Obligations

### 1. Process Only on Instructions

**Binding Instructions:** Processor shall Process Personal Data only:
- As documented in this DPA
- As documented in the MSA
- As instructed by Controller in writing (including email)

**Prohibited Processing:** Processor shall NOT:
- Process Personal Data for Processor's own purposes (except as required by law)
- Use Personal Data for marketing, analytics, or product improvement (unless explicitly authorized)
- Share Personal Data with third parties without Controller consent

**Unlawful Instructions:** If Processor believes an instruction violates GDPR or Colombian Law 1581, Processor shall immediately inform Controller and may suspend Processing until resolved.

### 2. Confidentiality

**Personnel Obligations:**
- All Processor personnel with access to Personal Data must sign confidentiality agreements
- Confidentiality obligations survive termination of employment
- Processor shall provide evidence of confidentiality agreements upon Controller request

**Access Controls:**
- Limit access to Personal Data to personnel who need it for Service provision
- Implement role-based access controls (RBAC)
- Log all access to Personal Data

### 3. Security Measures

**See [Security Measures](#security-measures) section below for detailed requirements.**

### 4. Sub-processor Management

**See [Sub-Processing](#sub-processing) section below.**

### 5. Assist with Data Subject Rights

**Processor shall assist Controller in responding to Data Subject rights requests:**

| Right | Processor Assistance |
|-------|---------------------|
| **Access** | Provide tools or APIs for Controller to retrieve Data Subject's data |
| **Rectification** | Enable Controller to update inaccurate data |
| **Erasure** | Delete data upon Controller instruction (subject to legal retention) |
| **Portability** | Provide data in machine-readable format (JSON, CSV) |
| **Objection** | Assist in restricting Processing if Data Subject objects |

**Timeframe:** Processor shall respond to Controller requests for assistance within **5 business days**.

**Fees:** Assistance with routine requests is included in Service fees. Extraordinary requests (e.g., custom exports, extensive manual work) may incur additional fees agreed upon in advance.

### 6. Assist with Data Protection Impact Assessments (DPIA)

**If requested by Controller**, Processor shall provide information necessary for DPIAs, including:
- Description of Processing activities
- Security measures in place
- Sub-processors used
- International data transfer mechanisms

### 7. Notification of Legal Requests

**Government or Legal Requests:**
If Processor receives a legal request for disclosure of Personal Data (subpoena, court order, etc.), Processor shall:

1. **Notify Controller** - Within **24 hours** (unless prohibited by law)
2. **Challenge Overly Broad Requests** - Where legally permissible
3. **Minimize Disclosure** - Disclose only the minimum Personal Data required
4. **Document the Request** - Provide Controller with copy of legal process

**Exception:** Routine tax or financial audits may not require advance notice if Personal Data disclosure is minimal.

---

## Sub-Processing

### Authorization Required

**General Authorization:** Controller grants Processor general authorization to engage Sub-processors for the Services, subject to the conditions in this section.

**Specific Sub-processors Approved:** The following Sub-processors are pre-approved:
- [LIST PRE-APPROVED SUB-PROCESSORS, e.g., "Amazon Web Services (AWS) for infrastructure hosting"]
- [Example: "Cloudflare for CDN and DDoS protection"]

### New Sub-processors

**30-Day Notice Requirement:**
Before engaging a new Sub-processor, Processor shall:
1. Provide Controller with **30 days' advance written notice**
2. Include Sub-processor name, location, and Processing activities
3. Provide copy of Sub-processor DPA or relevant contract sections

**Controller Objection:**
Controller may object to a new Sub-processor within 30 days if:
- Sub-processor does not meet security or compliance requirements
- Sub-processor is located in a jurisdiction without adequate data protection laws
- Sub-processor poses a security or reputational risk

**If Controller Objects:**
- Processor and Controller negotiate in good faith to resolve concerns
- If unresolved, Controller may terminate the MSA without penalty (for the affected Services only)

### Sub-processor Requirements

**Processor shall ensure all Sub-processors:**
1. **Execute a DPA** - Containing substantially similar obligations to this DPA
2. **Implement Security Measures** - At least as protective as required in this DPA
3. **Comply with GDPR and Colombian Law 1581** - Where applicable
4. **Allow Audits** - Permit Controller or its auditors to audit Sub-processor compliance

**Liability:** Processor remains fully liable to Controller for any Sub-processor's failure to fulfill data protection obligations.

---

## Data Subject Rights

### Controller's Role

**Primary Responsibility:** Controller is responsible for responding to Data Subject rights requests under GDPR and Colombian Law 1581.

### Processor's Assistance

**Upon Controller Request, Processor shall:**

1. **Provide Access** - Tools, APIs, or data exports to enable Controller to fulfill access requests
2. **Enable Rectification** - Functionality for Controller to correct inaccurate data
3. **Enable Erasure** - Delete data upon instruction (subject to legal retention requirements)
4. **Restrict Processing** - Temporarily freeze Processing if Data Subject objects
5. **Data Portability** - Provide data in structured, machine-readable format (JSON, CSV, etc.)

### Timeframes

**Processor Response Time:**
- Routine requests: **5 business days** from Controller instruction
- Urgent requests (e.g., security threats): **24 hours**

**Fees:**
- Standard assistance: Included in Service fees
- Custom development or extensive manual work: Additional fees agreed in advance

### Direct Requests from Data Subjects

**If Processor receives a direct request from a Data Subject** (e.g., via email), Processor shall:
1. **Redirect to Controller** - Inform Data Subject to submit request to Controller (privacy@casaora.co)
2. **Notify Controller** - Forward the request to Controller within **2 business days**
3. **Do NOT Respond Directly** - Unless instructed by Controller in writing

---

## Security Measures

### Technical and Organizational Measures

**Processor shall implement and maintain appropriate security measures to protect Personal Data from unauthorized access, disclosure, alteration, or destruction.**

**Required Security Measures (Minimum):**

#### 1. Encryption

- **Data in Transit:** TLS 1.2 or higher (preferably TLS 1.3)
- **Data at Rest:** AES-256 encryption for stored Personal Data
- **Database Encryption:** Encrypted database fields for sensitive data (passwords, government IDs, bank accounts)

#### 2. Access Controls

- **Role-Based Access Control (RBAC):** Personnel access limited to necessary data
- **Multi-Factor Authentication (MFA):** Required for administrative access
- **Principle of Least Privilege:** Users granted minimum necessary permissions
- **Regular Access Reviews:** Quarterly review and revocation of unnecessary access

#### 3. Network Security

- **Firewalls:** Network segmentation and firewall protection
- **Intrusion Detection/Prevention Systems (IDS/IPS):** Monitor for suspicious activity
- **DDoS Protection:** Mitigation of denial-of-service attacks
- **VPN Access:** Secure remote access for personnel

#### 4. Application Security

- **Secure Development Lifecycle:** Security testing in development process
- **Vulnerability Scanning:** Automated scanning for known vulnerabilities
- **Penetration Testing:** Annual third-party penetration tests
- **Dependency Management:** Regular updates to patch security vulnerabilities

#### 5. Data Minimization and Pseudonymization

- **Data Minimization:** Process only Personal Data necessary for Services
- **Pseudonymization:** Where feasible, replace identifiers with pseudonyms
- **Anonymization:** Anonymize data for analytics and testing (when possible)

#### 6. Logging and Monitoring

- **Audit Logs:** Log all access to Personal Data (who, what, when)
- **Log Retention:** Retain logs for at least 1 year
- **Security Monitoring:** Real-time monitoring for anomalies and security events
- **Alerting:** Automated alerts for critical security events

#### 7. Backup and Disaster Recovery

- **Regular Backups:** Daily backups of all Personal Data
- **Encrypted Backups:** Backups encrypted at rest
- **Tested Recovery:** Quarterly disaster recovery drills
- **Geographically Distributed:** Backups stored in multiple locations

#### 8. Personnel Security

- **Background Checks:** For personnel with access to Personal Data (where legally permissible)
- **Security Training:** Annual data protection and security training
- **Confidentiality Agreements:** All personnel bound by confidentiality
- **Offboarding:** Immediate access revocation upon employee termination

### Compliance with Standards

**Processor shall maintain compliance with relevant security standards:**
- **ISO 27001** - Information Security Management (certification preferred)
- **SOC 2 Type II** - Service Organization Control (for SaaS providers)
- **PCI-DSS** - Payment Card Industry Data Security Standard (if processing payment data)

**Evidence of Compliance:** Processor shall provide Controller with copies of relevant certifications and audit reports upon request (subject to confidentiality).

### Security Updates

**Processor shall:**
- Notify Controller of material changes to security measures within **30 days**
- Ensure security measures evolve to address emerging threats
- Implement security updates and patches promptly (critical patches within 48 hours)

---

## Data Breach Notification

### Processor's Obligations

**In the event of a Data Breach, Processor shall:**

### 1. Initial Notification (Within 24 Hours)

**Processor shall notify Controller within 24 hours** of becoming aware of a Data Breach, providing:
- **Date and time of breach discovery**
- **Nature of the breach** (unauthorized access, data loss, ransomware, etc.)
- **Categories and approximate number of Data Subjects affected**
- **Categories and approximate number of Personal Data records affected**
- **Contact point** for further information (Security Incident Response Team)

**Notification Method:**
- **Email:** security@casaora.co
- **Phone:** [EMERGENCY CONTACT NUMBER] (for critical breaches)

### 2. Investigation and Containment

**Processor shall immediately:**
- **Contain the breach** - Prevent further unauthorized access
- **Preserve evidence** - Retain logs and forensic data
- **Investigate root cause** - Determine how the breach occurred
- **Identify affected data** - Determine which Personal Data was compromised

### 3. Detailed Report (Within 72 Hours)

**Processor shall provide a detailed incident report within 72 hours**, including:
- **Timeline of events** - Chronological description of the breach
- **Root cause analysis** - How the breach occurred
- **Data affected** - Specific Personal Data compromised (names, IDs, financial data, etc.)
- **Data Subjects affected** - Number and categories of individuals
- **Security measures in place** - What safeguards existed (if any) and why they failed
- **Containment measures** - Steps taken to contain the breach
- **Mitigation measures** - Steps to prevent recurrence
- **Recommendations** - Suggested actions for Controller (e.g., notify Data Subjects, regulatory authorities)

### 4. Ongoing Updates

**Processor shall provide regular updates** (at least every 3 days) until the incident is fully resolved, including:
- Progress on investigation
- Additional affected data discovered
- Remediation steps completed

### 5. Final Report (Within 30 Days)

**Processor shall provide a comprehensive post-incident report**, including:
- **Complete timeline** - From initial breach to resolution
- **Full impact assessment** - All affected data and Data Subjects
- **Root cause analysis** - Technical details of the vulnerability
- **Remediation completed** - Security improvements implemented
- **Lessons learned** - Process improvements to prevent future breaches
- **Evidence of deletion** - Confirmation that unauthorized parties deleted stolen data (if applicable and verifiable)

### Controller's Obligations

**Controller is responsible for:**
- **Notifying Supervisory Authorities** - Within 72 hours (GDPR) or immediately (Colombian Law 1581)
- **Notifying Data Subjects** - If high risk to rights and freedoms (GDPR Article 34, Colombian Law 1581)
- **Regulatory Liaison** - Managing relationships with SIC, DPAs, etc.

**Processor shall assist Controller** in fulfilling these obligations by providing necessary information and evidence.

### Liability

**Breach Caused by Processor:**
- Processor liable for damages resulting from breach caused by Processor's failure to comply with this DPA
- Processor shall indemnify Controller for fines, penalties, and damages (subject to MSA limitations)

**Breach Caused by Third Party (Not Processor's Fault):**
- Processor not liable if breach caused by factors outside Processor's control (e.g., sophisticated state-sponsored cyberattack despite reasonable security measures)

---

## International Data Transfers

### Data Transfer Mechanisms

**If Processor transfers Personal Data outside Colombia or the European Economic Area (EEA), Processor shall ensure adequate safeguards:**

#### 1. For Transfers to Third Countries (GDPR)

**Processor shall use one or more of the following mechanisms:**

**Option A: European Commission Adequacy Decision**
- If destination country has EC adequacy decision (e.g., Canada, Japan), no additional safeguards required
- Current adequacy decisions: [Link to EDPB list]

**Option B: Standard Contractual Clauses (SCCs)**
- Execute EU Standard Contractual Clauses (2021 version) with data importer
- Perform Transfer Impact Assessment (TIA) to ensure data protection in destination country
- Implement supplementary measures if necessary (e.g., encryption, access controls)

**Option C: Binding Corporate Rules (BCRs)**
- If Processor has BCRs approved by competent supervisory authority

**Option D: Derogations (Rare, Specific Cases Only)**
- Explicit Data Subject consent
- Contractual necessity
- Important public interest

#### 2. For Transfers Outside Colombia (Law 1581)

**Processor shall comply with Colombian Law 1581 Article 26:**
- **Adequate Level of Protection** - Destination country must provide adequate data protection (as determined by SIC or via contractual safeguards)
- **Contractual Safeguards** - Execute DPA with data importer containing equivalent protections to Colombian law
- **Data Subject Consent** - Ensure Controller has obtained Data Subject consent for international transfers (if required)

**SIC Authorization:** If transfer does not meet criteria above, Processor shall assist Controller in obtaining SIC authorization (though in practice, SIC authorization is rarely required if contractual safeguards are in place per Decree 1377).

### Current Data Locations

**Processor processes Personal Data in the following locations:**

| Data Type | Primary Location | Backup Location | Transfer Mechanism |
|-----------|------------------|-----------------|-------------------|
| [e.g., User Database] | [e.g., United States (AWS us-east-1)] | [e.g., United States (AWS us-west-2)] | [e.g., SCCs + TLS 1.3 encryption] |
| [e.g., Payment Data] | [e.g., United States (Stripe)] | [e.g., European Union (Stripe EU)] | [e.g., SCCs + PCI-DSS compliance] |

**Changes to Data Locations:**
Processor shall notify Controller **60 days in advance** of any change in data processing locations.

### Transfer Impact Assessment (TIA)

**For transfers to countries without adequacy decision**, Processor shall:
- Conduct Transfer Impact Assessment to evaluate destination country's data protection laws
- Identify risks (e.g., government surveillance, weak legal protections)
- Implement supplementary measures to mitigate risks (e.g., end-to-end encryption, data minimization)
- Provide TIA results to Controller upon request

---

## Audits and Inspections

### Controller's Right to Audit

**Frequency:** Controller may audit Processor's compliance with this DPA **once per year** (or more frequently if required by supervisory authority or in case of suspected breach).

**Scope of Audit:**
- Review of security measures and controls
- Inspection of data processing facilities (with reasonable notice)
- Review of policies, procedures, and documentation
- Interviews with Processor personnel
- Review of Sub-processor DPAs and certifications

### Audit Process

**1. Audit Request:**
- Controller provides **30 days' written notice** (except in case of suspected breach)
- Specify scope, duration, and auditor details

**2. Scheduling:**
- Processor and Controller agree on audit dates and logistics
- Processor may request adjustments to minimize business disruption

**3. Execution:**
- Audit conducted by Controller or third-party auditor (subject to confidentiality agreement)
- Processor cooperates fully and provides requested documentation
- Audit limited to business hours unless emergency

**4. Audit Report:**
- Auditor provides written report of findings within **30 days**
- Includes any non-conformities or recommendations

**5. Remediation:**
- Processor shall remediate any non-conformities within **90 days** (or shorter timeframe for critical issues)
- Processor provides evidence of remediation

### Alternative to On-Site Audit

**Processor may satisfy audit requirements by:**
- Providing recent **SOC 2 Type II** or **ISO 27001** audit reports (less than 12 months old)
- Providing questionnaire responses and supporting documentation
- Conducting virtual audit via video conference

**Acceptance:** Controller may accept alternative evidence in lieu of on-site audit at Controller's discretion.

### Costs

**Audit Costs:**
- **First annual audit:** Processor bears reasonable costs (e.g., staff time, document preparation)
- **Additional audits:** Controller bears costs (auditor fees, travel, etc.)
- **Breach-Related Audits:** Processor bears all costs if audit reveals Processor non-compliance

---

## Data Retention and Deletion

### Retention During Service Term

**During the term of the MSA:**
- Processor retains Personal Data as necessary for Service provision
- Processor follows Controller's retention instructions (if provided)
- Processor does NOT retain Personal Data longer than necessary unless required by law

### Deletion Upon Termination

**Within 30 days of MSA termination or expiration:**

**Option 1: Return of Personal Data (Controller's Choice)**
- Processor provides complete copy of Personal Data in structured, machine-readable format (e.g., JSON, SQL dump)
- Delivery method: Secure file transfer (encrypted) or physical media

**Option 2: Deletion of Personal Data (Controller's Choice)**
- Processor securely deletes all Personal Data from production systems
- Deletion includes all copies, backups, and Sub-processor systems
- Processor provides written certification of deletion

**Partial Deletion:**
- Controller may request deletion of specific categories of data while retaining others

### Exceptions to Deletion

**Processor may retain Personal Data after termination if:**

1. **Legal Obligation** - Required by law (e.g., tax records, financial audits)
   - Processor notifies Controller of legal basis and retention period
   - Data retained only as long as legally required
   - Data kept segregated and access restricted

2. **Backup Retention** - Included in encrypted backups (pending automated deletion)
   - Backups deleted per normal rotation schedule (typically 30-90 days)
   - Backup data not restored or used except for disaster recovery

3. **Anonymized Data** - Data irreversibly anonymized for statistical purposes
   - Processor provides evidence that data cannot be re-identified
   - Anonymization meets GDPR and Colombian Law 1581 standards

### Secure Deletion Methods

**Processor shall use industry-standard deletion methods:**
- **Logical Deletion:** Overwrite data with random bits (minimum 3 passes)
- **Cryptographic Deletion:** Destroy encryption keys (if data encrypted with unique keys)
- **Physical Destruction:** Destroy physical media (for end-of-life hardware)

**Certification:** Processor provides certificate of destruction upon request.

---

## Liability and Indemnification

### Liability Allocation

**Processor's Liability:**
Processor is liable for damages caused by:
- Processing Personal Data in violation of this DPA
- Failure to implement required security measures
- Unauthorized disclosure or use of Personal Data
- Data breaches caused by Processor's negligence

**Limitations:**
- Total liability capped at amount specified in MSA (typically 12 months' fees or insurance coverage limit)
- Exclusions for indirect, consequential, or punitive damages (except where prohibited by law)

### Indemnification

**Processor Indemnifies Controller:**
Processor shall indemnify, defend, and hold Controller harmless from:
- Fines or penalties imposed by supervisory authorities (SIC, DPAs) due to Processor's non-compliance
- Claims by Data Subjects resulting from Processor's breach of this DPA
- Legal fees and costs defending against such claims

**Controller Indemnifies Processor:**
Controller shall indemnify Processor from:
- Claims arising from Controller's Processing instructions that violate applicable law
- Claims arising from Controller's failure to obtain necessary consents
- Controller's breach of MSA or this DPA

### Insurance

**Processor shall maintain:**
- **Cyber Liability Insurance:** Minimum [USD $2,000,000 or as agreed] coverage
- **Professional Liability Insurance (E&O):** Minimum [USD $1,000,000 or as agreed] coverage

**Evidence:** Processor provides certificate of insurance annually.

---

## Term and Termination

### Term

**This DPA is effective as of the MSA effective date and continues for the duration of the MSA** (including any renewal terms).

### Termination

**This DPA terminates:**
1. **With the MSA** - Automatically upon MSA termination or expiration
2. **For Material Breach** - If Processor materially breaches this DPA and fails to cure within 30 days
3. **By Mutual Agreement** - If parties agree in writing

### Survival

**The following provisions survive termination:**
- Data Retention and Deletion obligations
- Liability and Indemnification
- Confidentiality
- Audit rights (for 2 years post-termination)
- Governing Law and Dispute Resolution

---

## Governing Law

### Governing Law

**This DPA is governed by:**
- **Primary:** Laws of the Republic of Colombia
- **GDPR Compliance:** European Union data protection law (for EU Data Subjects)
- **Conflicts:** In case of conflict, the more protective law applies to Data Subjects

### Dispute Resolution

**Disputes arising from this DPA shall be resolved:**
1. **Good Faith Negotiation** - 30 days
2. **Mediation** - Non-binding mediation in Bogotá, Colombia
3. **Arbitration** - Binding arbitration per MSA arbitration clause

**Supervisory Authority Rights:** Nothing in this DPA limits the rights of supervisory authorities (SIC, DPAs) to enforce data protection laws.

---

## Amendments

**This DPA may be amended:**
1. **By Mutual Written Agreement** - Signed by both parties
2. **To Comply with Law** - Processor may amend to comply with new data protection laws (with 30 days' notice to Controller)

**Material Amendments:** Require Controller's written approval.

---

## Signature Block

**CONTROLLER:**

[MAIDCONNECT LEGAL NAME]

By: ___________________________
Name: [AUTHORIZED SIGNATORY NAME]
Title: [TITLE]
Date: ___________________________

---

**PROCESSOR:**

[PROCESSOR LEGAL NAME]

By: ___________________________
Name: [AUTHORIZED SIGNATORY NAME]
Title: [TITLE]
Date: ___________________________

---

## Annexes

### Annex A: Description of Processing

**Attached:** Detailed description of:
- Processing activities
- Categories of Personal Data
- Categories of Data Subjects
- Processing duration
- Data retention periods

### Annex B: Technical and Organizational Measures

**Attached:** Detailed security measures implemented by Processor (may be marked confidential).

### Annex C: List of Sub-processors

**Attached:** Current list of approved Sub-processors, including:
- Sub-processor name
- Sub-processor location
- Processing activities
- Date of approval

**Updates:** Controller may request updated list at any time.

---

**Document Control:**
- **Template Version:** 1.0.0
- **Created:** 2025-11-06
- **Last Reviewed:** 2025-11-06
- **Owner:** Legal Team / Privacy Officer
- **Approval Required:** Colombian attorney, CEO
- **Next Review:** Annually or upon material change in data protection laws
