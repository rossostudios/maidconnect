# Colombian Law 1581 Compliance Guide

**For Internal Use Only**
**Last Updated:** 2025-11-06
**Version:** 1.0.0

---

> **📋 INTERNAL DOCUMENTATION**
> This guide is for MaidConnect team members to understand and maintain compliance with Colombian Law 1581 of 2012 (Ley de Protección de Datos Personales - Habeas Data). This is NOT a user-facing document. For user-facing policies, see [Privacy Policy](./privacy-policy.md).

---

## Table of Contents

1. [Overview](#overview)
2. [Legal Framework](#legal-framework)
3. [Key Principles](#key-principles)
4. [Authorization (Consent) Requirements](#authorization-consent-requirements)
5. [Data Subject Rights](#data-subject-rights)
6. [Data Controller Obligations](#data-controller-obligations)
7. [Data Processors (Encargados)](#data-processors-encargados)
8. [Sensitive Data](#sensitive-data)
9. [Cross-Border Data Transfers](#cross-border-data-transfers)
10. [SIC Registration and Compliance](#sic-registration-and-compliance)
11. [Technical Implementation](#technical-implementation)
12. [Enforcement and Penalties](#enforcement-and-penalties)
13. [Compliance Checklist](#compliance-checklist)
14. [Common Pitfalls](#common-pitfalls)
15. [Resources](#resources)
16. [Contact Information](#contact-information)

---

## Overview

### What is Law 1581?

**Ley 1581 de 2012** (enacted October 18, 2012) is Colombia's data protection law, also known as the **Habeas Data Law**. It regulates the collection, processing, and circulation of personal data in Colombia.

**Objective:** Protect the constitutional right to privacy and data protection (habeas data) guaranteed by Article 15 of the Colombian Constitution.

**Scope:**
- Applies to all personal data processing in Colombia
- Applies to Colombian companies and foreign companies processing data of individuals in Colombia
- **MaidConnect:** Fully subject to Law 1581 as we operate in Colombia and process data of Colombian residents

### Why Law 1581 Matters for MaidConnect

**Primary Reasons:**
1. **Colombian Market** - Our core market is Colombia; most users are Colombian
2. **Legal Compliance** - Mandatory compliance (non-compliance = fines and criminal liability)
3. **Trust** - Users expect and demand data protection
4. **Competitive Advantage** - Strong privacy practices differentiate us from competitors

**Consequences of Non-Compliance:**
- Administrative fines up to COP 2,000 equivalent to current monthly minimum wages (~COP 2.4 billion in 2025)
- Criminal sanctions for data controllers (imprisonment up to 8 years in severe cases)
- Reputational damage
- Platform shutdown by SIC

---

## Legal Framework

### Primary Legislation

**1. Law 1581 of 2012 (Habeas Data Law)**
- Core data protection statute
- Defines principles, rights, obligations
- Full text: [http://www.secretariasenado.gov.co/senado/basedoc/ley_1581_2012.html](http://www.secretariasenado.gov.co/senado/basedoc/ley_1581_2012.html)

**2. Decree 1377 of 2013 (Regulatory Decree)**
- Implements Law 1581
- Provides detailed requirements for:
  - Authorization (consent) mechanisms
  - Privacy policies
  - Data subject rights procedures
  - Cross-border transfers
- Full text: [https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=53646](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=53646)

**3. Decree 1074 of 2015**
- Consolidates commercial regulations
- Includes Law 1581 provisions

### Constitutional Basis

**Article 15 of Colombian Constitution:**
> "All persons have the right to personal and family privacy and to their good name, and the State must respect and enforce this right. In the same way, they have the right to know, update, and rectify information collected about them in databases and files of public and private entities."

This constitutional right is known as **"Habeas Data"** (similar to habeas corpus for data).

### Regulatory Authority

**Superintendencia de Industria y Comercio (SIC)**
- **Role:** Enforce Law 1581, investigate complaints, impose sanctions
- **Website:** [https://www.sic.gov.co](https://www.sic.gov.co)
- **Delegation of Data Protection:** [https://www.sic.gov.co/tema/proteccion-de-datos-personales](https://www.sic.gov.co/tema/proteccion-de-datos-personales)

**SIC Powers:**
- Issue guidelines and interpretations
- Investigate data protection violations
- Impose fines and sanctions
- Order cessation of unlawful processing
- Maintain National Registry of Databases (RNBD)

---

## Key Principles

### Article 4: Principles for Personal Data Processing

**Law 1581 establishes the following principles:**

#### 1. Legality (Legalidad)

**Requirement:** Process personal data only in accordance with Law 1581 and other applicable laws.

**MaidConnect Implementation:**
- ✅ Processing based on legal grounds (authorization, contract, legal obligation)
- ✅ No processing prohibited by law
- ✅ Compliance with Colombian consumer protection law, commercial code, etc.

#### 2. Purpose Limitation (Finalidad)

**Requirement:** Inform data subjects of the purpose of data processing. Do NOT use data for purposes incompatible with the original purpose.

**MaidConnect Implementation:**
- ✅ Privacy Policy clearly states purposes: Service delivery, payments, trust & safety
- ✅ No secondary use without new authorization (e.g., no selling data to third parties)
- ✅ Marketing emails require separate consent

**Example:**
```
✅ CORRECT: Customer provides address → Used for service delivery
❌ WRONG: Customer provides address → Shared with marketing partners
```

#### 3. Freedom (Libertad)

**Requirement:** Data processing requires prior, express, and informed authorization (consent) from the data subject, except in cases provided by law.

**MaidConnect Implementation:**
- ✅ Explicit consent obtained during account registration
- ✅ Consent mechanism complies with Decree 1377 requirements (see below)
- ✅ Users can withdraw consent (subject to contractual obligations)

#### 4. Veracity or Quality (Veracidad o Calidad)

**Requirement:** Personal data must be truthful, complete, accurate, up-to-date, verifiable, and understandable. Partial, incomplete, or misleading data is prohibited.

**MaidConnect Implementation:**
- ✅ Email verification during signup
- ✅ Phone number verification via SMS
- ✅ Users can update their information anytime (Settings → Profile)
- ✅ Data validation on forms (e.g., valid email format, valid Colombian phone number)

**Developer Guidance:**
- Implement input validation for all user data
- Provide clear error messages if data is incorrect
- Allow users to easily correct mistakes

#### 5. Transparency (Transparencia)

**Requirement:** Guarantee data subjects' right to obtain information about their data at any time and without restrictions.

**MaidConnect Implementation:**
- ✅ Privacy Policy accessible in footer of all pages
- ✅ Users can download their data anytime (Settings → Privacy → Download My Data)
- ✅ Clear explanations of data processing in Spanish

#### 6. Restricted Access and Circulation (Acceso y Circulación Restringida)

**Requirement:** Data processing is subject to limits arising from the nature of the data, legal provisions, and Constitution. In this context, processing may only be carried out by authorized persons.

**MaidConnect Implementation:**
- ✅ Role-based access control (RBAC) - Only authorized personnel access data
- ✅ Row-level security (RLS) in database - Users can only access their own data
- ✅ Admin access logged and audited
- ✅ Data sharing with third parties only as disclosed in Privacy Policy

**Developer Guidance:**
```sql
-- Example: RLS policy ensures customers only see their own bookings
CREATE POLICY "Customers view own bookings"
  ON bookings FOR SELECT TO authenticated
  USING (customer_id = auth.uid());
```

#### 7. Security (Seguridad)

**Requirement:** Personal data must be protected using appropriate technical, administrative, and human measures to prevent unauthorized access, alteration, loss, theft, or fraudulent use.

**MaidConnect Implementation:**
- ✅ Encryption in transit (TLS 1.3) and at rest (AES-256)
- ✅ Password hashing (bcrypt with cost factor 12)
- ✅ Access controls and authentication (Supabase Auth)
- ✅ Regular security audits
- ✅ Incident response plan

**See:** [Authentication Documentation](../03-technical/authentication.md) for security details.

#### 8. Confidentiality (Confidencialidad)

**Requirement:** All persons involved in data processing must guarantee confidentiality of information, except when required by law or judicial order.

**MaidConnect Implementation:**
- ✅ Employee confidentiality agreements (NDAs)
- ✅ Processor DPAs include confidentiality obligations
- ✅ Access to data logged and monitored
- ✅ Clear policies on data sharing with law enforcement (Privacy Policy, Terms of Service)

---

## Authorization (Consent) Requirements

### Article 9: Authorization from the Data Subject

**General Rule:** Data processing requires **prior, express, and informed authorization** from the data subject.

**Exceptions (Article 10):** Authorization NOT required for:
1. **Public information** (government records, commercial registries)
2. **Statistical or scientific purposes** (if data anonymized)
3. **Legal obligation** (court order, tax reporting)
4. **Vital interests** (emergency medical treatment)
5. **Contractual relationship** (data necessary to perform contract)
6. **Credit information** (credit bureaus, with specific rules)

**MaidConnect Position:**
- We rely primarily on **express authorization** (consent) and **contractual relationship**
- Authorization obtained during account registration

### Decree 1377: Authorization Mechanisms

**Article 5: Authorized Mechanisms**

Authorization may be obtained through:
1. **Written document** (physical or electronic)
2. **Oral authorization** (if recorded)
3. **Conduct** (unequivocal action demonstrating consent - e.g., checking "I accept" box)

**MaidConnect Implementation:**

**During Account Registration:**
```tsx
// User must actively check box to create account
<Checkbox id="authorization" required>
  He leído y acepto la <Link to="/privacy">Política de Privacidad</Link> y
  autorizo el tratamiento de mis datos personales de acuerdo con la misma.

  (I have read and accept the Privacy Policy and authorize the processing
  of my personal data in accordance with it.)
</Checkbox>
```

**Key Requirements:**
- ✅ **Prior:** Before processing (authorization during signup, before data is processed)
- ✅ **Express:** Affirmative action required (not pre-checked box)
- ✅ **Informed:** Privacy Policy accessible and understandable
- ✅ **Specific:** Explains purposes of processing

**Spanish Language:** Authorization for Colombian users MUST be in Spanish (primary language).

### What Authorization Must Include (Decree 1377, Article 5)

**Authorization must inform data subject of:**
1. **Data to be collected** - Name, email, phone, address, etc.
2. **Purpose of processing** - Service delivery, payments, communications, etc.
3. **Optional/mandatory nature** - Which fields are required vs. optional
4. **Rights** - Rights to access, update, rectify, suppress data
5. **How to exercise rights** - Contact info (privacy@casaora.co)
6. **Data controller identity** - MaidConnect legal name, NIT, address
7. **Cross-border transfers** - If data will be transferred outside Colombia (yes - to U.S.)

**MaidConnect Compliance:**
- ✅ All elements included in Privacy Policy
- ✅ Authorization checkbox references Privacy Policy
- ✅ Privacy Policy link prominently displayed during signup

### Minor's Data (Under 18)

**Article 7: Special Protection for Minors**

**Prohibition:** Processing personal data of minors requires **authorization from parent or legal guardian**, except for public data.

**MaidConnect Implementation:**
- ✅ Platform restricted to users 18+ (age verification during signup)
- ✅ Terms of Service explicitly state minimum age requirement
- ✅ If minor's data inadvertently collected, delete immediately upon discovery

**Developer Guidance:**
- Validate date of birth during signup (must be 18+)
- Block account creation if under 18

---

## Data Subject Rights

### Article 8: Rights of Data Subjects

**Colombian data subjects (titulares) have the following rights:**

#### 1. Conocer (Right to Know)

**Definition:** Right to access personal data held about them.

**Requirements:**
- Data subject may request access at any time
- Free of charge (once per month per Decree 1377, Article 16)
- Response within **15 business days** (Article 15, Decree 1377)

**MaidConnect Implementation:**

**Self-Service:**
- User goes to **Configuración → Privacidad → Descargar Mis Datos** (Settings → Privacy → Download My Data)
- System generates JSON export of all user data

**Email Request:**
- User emails privacy@casaora.co
- We verify identity and provide data within 15 business days

**What to Provide:**
- All personal data we hold
- Purpose of processing
- Recipients of data (e.g., Stripe, Supabase)
- Retention period

#### 2. Actualizar (Right to Update)

**Definition:** Right to update incomplete or outdated data.

**MaidConnect Implementation:**
- ✅ User goes to **Configuración → Perfil → Editar** (Settings → Profile → Edit)
- ✅ Update name, phone, email, address, etc.
- ✅ Changes saved immediately

**Developer Note:** Ensure all editable fields have update endpoints.

#### 3. Rectificar (Right to Rectify)

**Definition:** Right to correct inaccurate or incorrect data.

**MaidConnect Implementation:**
- Same as "Actualizar" (update) - users can correct errors via Settings
- If user cannot self-correct, they may email privacy@casaora.co
- We investigate and correct within 15 business days

#### 4. Suprimir (Right to Delete / Suppress)

**Definition:** Right to request deletion of data when:
- Data is no longer necessary for the purpose
- Authorization is withdrawn
- Processing is unlawful

**Limitations (Article 16, Law 1581):**
- We may refuse deletion if:
  - **Legal obligation:** Tax records (5 years), legal defense
  - **Contractual obligation:** Data necessary for active service contract
  - **Public interest:** Fraud prevention (case-by-case)

**MaidConnect Implementation:**

**Self-Service Deletion:**
- User goes to **Configuración → Privacidad → Eliminar Cuenta** (Settings → Privacy → Delete Account)
- Account deleted immediately; data anonymized within 30 days

**Email Request:**
- User emails privacy@casaora.co
- We process deletion within 15 business days

**Exception Handling:**
- If we must retain data (e.g., tax records), we notify user and offer restriction instead

**Technical Implementation:**
```sql
-- Anonymize user data after account deletion
UPDATE profiles
SET
  email = 'deleted-' || id || '@example.com',
  phone = NULL,
  full_name = 'Usuario Eliminado',
  profile_photo = NULL,
  government_id = NULL
WHERE id = $1 AND deleted_at < now() - interval '30 days';
```

#### 5. Revocar Autorización (Right to Revoke Authorization)

**Definition:** Right to withdraw consent for data processing (subject to contractual or legal obligations).

**MaidConnect Implementation:**
- User may revoke authorization by deleting account
- For specific purposes (e.g., marketing emails), user can opt out:
  - Unsubscribe link in emails
  - Settings → Notificaciones → Correos de Marketing (Settings → Notifications → Marketing Emails)

**Important:** If user revokes authorization for essential processing (e.g., service delivery), we must terminate the service contract (i.e., delete account).

### Claim Procedure (Consultas y Reclamos)

**Decree 1377, Articles 14-15:**

#### Consulta (Inquiry)

**Definition:** Request for information about data processing.

**Process:**
1. User submits inquiry (email, web form, in person)
2. We respond within **10 business days**
3. If we need extension, notify user and respond within **5 additional days**

#### Reclamo (Claim/Complaint)

**Definition:** Complaint about inaccurate data, unauthorized processing, or violation of Law 1581.

**Process:**
1. User submits claim with:
   - Name and contact information
   - Description of facts giving rise to claim
   - Documents supporting claim (if any)
   - Address for notifications
2. If incomplete, we request additional information within **5 days**
3. User has **2 months** to provide additional information (claim expires if not provided)
4. We investigate and respond within **15 business days** from complete claim receipt
5. Our response must:
   - Indicate decision (accept or reject claim)
   - Explain reasons
   - Describe corrective actions taken (if applicable)

**MaidConnect Implementation:**
- Email: privacy@casaora.co with subject "Reclamo - Protección de Datos"
- Automated case tracking system (track response deadlines)
- Document all claims and responses (audit trail)

---

## Data Controller Obligations

### Article 17: Duties of Data Controller (Responsable del Tratamiento)

**As Data Controller, MaidConnect must:**

#### 1. Obtain Authorization

- ✅ Obtain prior, express, and informed authorization from data subjects
- ✅ Authorization mechanism complies with Decree 1377 requirements

#### 2. Provide Information

**Before or at the time of data collection, inform data subject of:**
- Purpose of processing
- Optional vs. mandatory data
- Rights (know, update, rectify, delete)
- How to exercise rights
- Data controller identity
- Cross-border transfers

**MaidConnect Implementation:**
- ✅ Privacy Policy prominently displayed during signup
- ✅ Privacy Policy link in footer of all pages
- ✅ Authorization checkbox references Privacy Policy

#### 3. Process Data for Authorized Purposes Only

- ✅ Use data only for purposes stated in Privacy Policy
- ✅ No secondary uses without new authorization

#### 4. Provide Mechanisms for Rights Exercise

- ✅ Email: privacy@casaora.co
- ✅ Self-service tools (Settings → Privacy)
- ✅ Response within legal timeframes (10-15 business days)

#### 5. Keep Data Accurate and Up-to-Date

- ✅ Users can update their information anytime
- ✅ Email and phone verification
- ✅ Data validation on forms

#### 6. Update Privacy Policy

- ✅ Review and update Privacy Policy annually
- ✅ Notify users of material changes (30 days' notice)

#### 7. Implement Security Measures

**Decree 1377, Article 19: Technical and Organizational Measures**

**Required Security Measures:**
- **Access controls:** Role-based access, authentication
- **Encryption:** Data in transit (TLS) and at rest (AES-256)
- **Audit logs:** Track access to personal data
- **Training:** Employee data protection training
- **Incident response:** Plan for data breaches

**MaidConnect Implementation:**
- ✅ See [Authentication Documentation](../03-technical/authentication.md) for security details
- ✅ See [Incident Response Plan](../06-operations/incident-response.md) for breach procedures

#### 8. Maintain Registry of Databases

**Decree 1377, Article 25: National Registry of Databases (RNBD)**

**Requirement:** Register databases with SIC's National Registry of Databases.

**MaidConnect Status:**
- [ ] **TO DO:** Register with RNBD before public launch
- [ ] Obtain RNBD registration number
- [ ] Update Privacy Policy with registration number

**Registration Process:** See [SIC Registration](#sic-registration-and-compliance) below.

#### 9. Report Data Breaches

**Decree 1377, Article 19:**

**In case of data breach:**
- Notify SIC **immediately**
- Notify affected data subjects without undue delay
- Implement corrective measures

**See:** [Incident Response Plan](../06-operations/incident-response.md) for detailed breach procedures.

---

## Data Processors (Encargados)

### Article 16: Duties of Data Processor (Encargado del Tratamiento)

**Definition:** A data processor (encargado) processes personal data on behalf of the data controller (responsable).

**Examples:** Supabase (database), Stripe (payments), Anthropic (AI assistant)

### Processor Requirements

**Data processors must:**
1. **Process data only on controller's instructions**
2. **Implement security measures**
3. **Maintain confidentiality**
4. **Assist controller with data subject rights**
5. **Notify controller of data breaches**
6. **Return or delete data upon contract termination**

### Data Processing Agreements (DPAs)

**Requirement:** Execute written contract (DPA) with each processor.

**MaidConnect Implementation:**
- ✅ DPAs signed with all processors (Supabase, Stripe, Vercel, Anthropic, Resend, Better Stack)
- ✅ DPAs comply with Law 1581 and GDPR requirements
- ✅ See [Data Processing Agreement Template](./data-processing-agreement.md)

**Processor Inventory:**

| Processor | Purpose | DPA Signed | Location | Law 1581 Compliant |
|-----------|---------|------------|----------|-------------------|
| **Supabase** | Database, auth | ✅ Yes | United States | ✅ Yes (SCCs + DPA) |
| **Stripe** | Payment processing | ✅ Yes | United States | ✅ Yes (SCCs + DPA) |
| **Vercel** | Hosting | ✅ Yes | United States | ✅ Yes (SCCs + DPA) |
| **Anthropic** | AI assistant | ✅ Yes | United States | ✅ Yes (SCCs + DPA) |
| **Resend** | Email delivery | ✅ Yes | United States | ✅ Yes (SCCs + DPA) |
| **Better Stack** | Error monitoring | ✅ Yes | European Union | ✅ Yes (DPA) |

---

## Sensitive Data

### Article 5: Sensitive Data (Datos Sensibles)

**Definition:** Data that affects intimacy or whose improper use could lead to discrimination, including:
- Race or ethnicity
- Political opinions
- Religious or philosophical beliefs
- Trade union membership
- Health data
- Sexual life or orientation
- Biometric data
- Genetic data

### Special Requirements

**Article 6: Processing of Sensitive Data**

**Prohibition:** Processing sensitive data is generally **prohibited** unless:
1. **Explicit authorization** from data subject (separate from general authorization)
2. **Legal obligation** (public health emergency, etc.)
3. **Vital interests** (medical emergency)
4. **Legitimate activities** (e.g., foundations, NGOs processing member data)

**MaidConnect Position:**
- ❌ We do NOT collect sensitive data as part of standard operations
- ⚠️ If user voluntarily provides sensitive data (e.g., health condition in support message):
  - Treat with heightened security
  - Delete as soon as purpose fulfilled
  - Do NOT use for secondary purposes

**Developer Guidance:**
- DO NOT add form fields for sensitive data
- If user includes sensitive data in free-text fields (messages, notes), flag for special handling
- Implement automated detection and flagging (e.g., keywords: "VIH", "cáncer", "religión")

---

## Cross-Border Data Transfers

### Article 26: International Data Transfers

**General Rule:** Personal data may be transferred outside Colombia if the destination country provides an **adequate level of data protection**.

### How to Determine "Adequate Level of Protection"

**Decree 1377, Article 25:**

**Option 1: SIC Adequacy Determination**
- SIC has determined that destination country has adequate data protection laws
- As of 2025, **SIC has NOT issued adequacy determinations** for any countries (unlike EC for GDPR)

**Option 2: Contractual Safeguards**
- Execute Data Processing Agreement with data importer
- DPA must contain equivalent protections to Law 1581
- Standard Contractual Clauses (SCCs) used for GDPR generally satisfy Law 1581 as well

**Option 3: Data Subject Authorization**
- Obtain explicit authorization for international transfer
- MaidConnect obtains this via Privacy Policy (users authorize transfers to U.S. processors)

### MaidConnect's International Transfers

**We transfer data to:**
- **United States:** Supabase, Stripe, Vercel, Anthropic, Resend

**Compliance Mechanism:**
- ✅ **Contractual Safeguards:** DPAs with all U.S. processors (SCCs + Law 1581 provisions)
- ✅ **Data Subject Authorization:** Privacy Policy discloses transfers; users authorize during signup
- ✅ **Security Measures:** Encryption in transit and at rest

**Privacy Policy Disclosure:**
```
Sus datos pueden ser transferidos a procesadores ubicados en Estados Unidos
(Supabase, Stripe, Vercel). Hemos implementado Cláusulas Contractuales Estándar
y medidas de seguridad adicionales para proteger sus datos.

(Your data may be transferred to processors located in the United States
(Supabase, Stripe, Vercel). We have implemented Standard Contractual Clauses
and additional security measures to protect your data.)
```

### When SIC Authorization IS Required

**Decree 1377, Article 25, Paragraph 2:**

SIC authorization required ONLY if:
1. Transfer is to a country WITHOUT adequate protection
2. AND transfer does NOT fall under exceptions (data subject authorization, DPA, etc.)

**In practice:** If we have DPAs and data subject authorization, SIC authorization is NOT required.

---

## SIC Registration and Compliance

### National Registry of Databases (RNBD)

**Decree 1377, Article 25: Registro Nacional de Bases de Datos**

**Requirement:** All data controllers must register their databases with SIC's RNBD.

**Purpose:**
- Public record of databases in Colombia
- Transparency and oversight
- Enable SIC monitoring and enforcement

### Registration Process

**1. Prepare Information:**

For each database, gather:
- **Database name** (e.g., "MaidConnect User Profiles Database")
- **Purpose** (e.g., "User account management and service delivery")
- **Data categories** (name, email, phone, address, etc.)
- **Data subjects** (customers, professionals)
- **Retention period** (e.g., "Duration of account + 6 months")
- **Security measures** (encryption, access controls, etc.)
- **Processors** (if applicable - Supabase, Stripe, etc.)
- **International transfers** (yes - to United States)

**2. Submit Registration:**

**Online Portal:**
- Go to [SIC RNBD Portal](https://www.sic.gov.co/registro-publico-de-bases-de-datos)
- Create SIC account (if not already registered)
- Complete RNBD registration form
- Upload supporting documents (Privacy Policy, DPAs)
- Submit for review

**3. SIC Review:**
- SIC reviews submission (typically 30-60 days)
- May request additional information or clarifications
- Issues registration number once approved

**4. Update Privacy Policy:**
- Add RNBD registration number to Privacy Policy
- Example: "MaidConnect está inscrito en el Registro Nacional de Bases de Datos (RNBD) de la SIC con el número [NÚMERO]."

### MaidConnect Databases to Register

**Primary Databases:**

1. **User Profiles Database (Base de Datos de Perfiles de Usuarios)**
   - Purpose: Account management, authentication, service matching
   - Data: Name, email, phone, address, profile photo, role

2. **Bookings Database (Base de Datos de Reservas)**
   - Purpose: Service bookings and delivery
   - Data: Booking details, service address, dates, customer-professional matching

3. **Transactions Database (Base de Datos de Transacciones)**
   - Purpose: Payment processing and financial records
   - Data: Transaction amounts, payment methods (tokenized), dates

4. **Communications Database (Base de Datos de Comunicaciones)**
   - Purpose: Customer-professional messaging, support tickets
   - Data: Message content, sender/recipient, timestamps

**Status:**
- [ ] **TO DO:** Register databases before public launch
- [ ] Obtain RNBD registration numbers
- [ ] Update Privacy Policy

### SIC Complaints and Investigations

**Data Subjects May File Complaints with SIC:**

**Complaint Process:**
1. Data subject files complaint via [SIC website](https://www.sic.gov.co)
2. SIC notifies MaidConnect of complaint
3. MaidConnect has **15 business days** to respond
4. SIC investigates and may:
   - Request additional information
   - Conduct on-site inspections
   - Hold hearings
5. SIC issues decision (sanction, order to cease processing, etc.)

**MaidConnect Response Strategy:**
- Acknowledge receipt immediately
- Investigate complaint internally
- Prepare comprehensive response with evidence (Privacy Policy, authorization records, logs)
- Cooperate fully with SIC

---

## Technical Implementation

### Authorization Mechanism (Account Registration)

**Compliant Authorization Checkbox:**

```tsx
// Spanish (primary)
<form onSubmit={handleRegister}>
  {/* ... other fields ... */}

  <Checkbox id="privacy-authorization" required>
    He leído y acepto la{' '}
    <Link to="/es/privacy" target="_blank" className="underline">
      Política de Privacidad
    </Link>{' '}
    y autorizo el tratamiento de mis datos personales de acuerdo con la
    Ley 1581 de 2012. Entiendo que mis datos serán utilizados para la
    prestación de servicios, procesamiento de pagos, y comunicaciones
    relacionadas con mi cuenta. Conozco mi derecho a conocer, actualizar,
    rectificar, y suprimir mi información personal.
  </Checkbox>

  <Checkbox id="marketing-consent">
    Acepto recibir correos electrónicos promocionales de MaidConnect (opcional)
  </Checkbox>

  <Button type="submit">Crear Cuenta</Button>
</form>
```

**Key Elements:**
- ✅ **Prior:** Before account creation
- ✅ **Express:** Active checkbox (not pre-checked)
- ✅ **Informed:** Links to Privacy Policy, explains purposes
- ✅ **Specific:** Mentions Law 1581, rights, purposes
- ✅ **Spanish:** Primary language for Colombian users
- ✅ **Separate Marketing Consent:** Optional, not bundled

### Data Subject Rights Implementation

**Self-Service Data Export:**

```typescript
// src/app/api/user/export-data/route.ts
import { createClient } from '@/lib/supabase/server-client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Export all user data
  const [profile, bookings, messages, transactions] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('bookings').select('*').or(`customer_id.eq.${user.id},professional_id.eq.${user.id}`),
    supabase.from('messages').select('*').or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`),
    supabase.from('transactions').select('*').eq('user_id', user.id),
  ]);

  const exportData = {
    exported_at: new Date().toISOString(),
    user_id: user.id,
    profile: profile.data,
    bookings: bookings.data,
    messages: messages.data,
    transactions: transactions.data,
    rights_information: {
      message: 'Usted tiene derecho a actualizar, rectificar, y suprimir sus datos.',
      contact: 'privacy@casaora.co',
    },
  };

  // Log export (audit trail)
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'data_export',
    timestamp: new Date(),
  });

  return NextResponse.json(exportData, {
    headers: {
      'Content-Disposition': `attachment; filename="maidconnect-data-export-${user.id}.json"`,
    },
  });
}
```

**Account Deletion:**

```typescript
// src/app/api/user/delete-account/route.ts
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check for active bookings (may prevent deletion)
  const { data: activeBookings } = await supabase
    .from('bookings')
    .select('id')
    .or(`customer_id.eq.${user.id},professional_id.eq.${user.id}`)
    .in('status', ['pending', 'confirmed', 'in_progress']);

  if (activeBookings && activeBookings.length > 0) {
    return NextResponse.json({
      error: 'No puede eliminar su cuenta con reservas activas. Por favor cancele o complete sus reservas primero.',
    }, { status: 400 });
  }

  // Mark account for deletion (anonymization in 30 days)
  await supabase.from('profiles').update({
    deleted_at: new Date(),
    deletion_scheduled: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  }).eq('id', user.id);

  // Log deletion request
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'account_deletion_requested',
    timestamp: new Date(),
  });

  return NextResponse.json({
    success: true,
    message: 'Su cuenta será eliminada permanentemente en 30 días. Recibirá un correo de confirmación.',
  });
}
```

**Automated Data Anonymization (Cron Job):**

```typescript
// src/app/api/cron/anonymize-deleted-accounts/route.ts
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createServiceClient(); // Service role for admin access

  // Find accounts scheduled for deletion
  const { data: accountsToAnonymize } = await supabase
    .from('profiles')
    .select('id, email')
    .lte('deletion_scheduled', new Date())
    .is('anonymized', false);

  if (!accountsToAnonymize || accountsToAnonymize.length === 0) {
    return NextResponse.json({ message: 'No accounts to anonymize' });
  }

  // Anonymize each account
  for (const account of accountsToAnonymize) {
    await supabase.from('profiles').update({
      email: `deleted-${account.id}@example.com`,
      phone: null,
      full_name: 'Usuario Eliminado',
      profile_photo: null,
      government_id: null,
      bank_account: null,
      anonymized: true,
    }).eq('id', account.id);

    // Log anonymization
    await supabase.from('audit_logs').insert({
      user_id: account.id,
      action: 'account_anonymized',
      timestamp: new Date(),
    });
  }

  return NextResponse.json({
    success: true,
    count: accountsToAnonymize.length,
    message: `Anonymized ${accountsToAnonymize.length} accounts`,
  });
}
```

**Vercel Cron Configuration (vercel.json):**

```json
{
  "crons": [
    {
      "path": "/api/cron/anonymize-deleted-accounts",
      "schedule": "0 2 * * *"
    }
  ]
}
```

---

## Enforcement and Penalties

### SIC Enforcement Powers

**Article 23: Sanctions**

**SIC may impose the following sanctions:**

#### 1. Administrative Fines

**Amounts:**
- **Up to 2,000 times current monthly minimum wage** (salario mínimo mensual legal vigente - SMMLV)
- As of 2025: SMMLV = ~COP 1,300,000 → Maximum fine = ~COP 2,600,000,000 (approximately USD $600,000)

**Factors Affecting Fine Amount:**
- Severity of violation
- Number of data subjects affected
- Duration of violation
- Economic capacity of the violator
- Recidivism (repeat violations)

**Examples of Violations:**
- Processing without authorization
- Failing to implement security measures
- Not responding to data subject rights requests
- Cross-border transfers without safeguards
- Data breach not reported to SIC

#### 2. Temporary or Permanent Suspension

**SIC may order:**
- Temporary suspension of database (cease processing until violation corrected)
- Permanent suspension (shut down database)

**Consequences:**
- Cannot operate platform without databases
- Effectively shuts down business

#### 3. Immediate Suspension (Precautionary Measure)

**In urgent cases (serious risk to data subjects):**
- SIC may order immediate suspension without prior hearing
- Example: Ongoing data breach with mass data exposure

### Criminal Liability

**Criminal Code (Código Penal) - Habeas Data Violations:**

**Article 269J: Unauthorized Use of Personal Data**
- **Crime:** Unauthorized or fraudulent use of personal data
- **Penalty:** Imprisonment of 4 to 8 years + fines
- **Applies To:** Data controllers and processors who intentionally misuse data

**Examples:**
- Selling personal data to third parties without authorization
- Using data for purposes not authorized
- Intentional data breaches (e.g., insider selling customer data)

### Civil Liability

**Data subjects may sue for damages:**
- **Moral damages** (emotional distress, reputational harm)
- **Material damages** (financial losses)
- **Injunctive relief** (order to cease unlawful processing)

**Colombian courts have awarded significant damages** for privacy violations (case law evolving).

---

## Compliance Checklist

### Pre-Launch Checklist

**Before Public Launch:**
- [ ] **Privacy Policy** published in Spanish and English
- [ ] **Authorization mechanism** complies with Law 1581 and Decree 1377
- [ ] **Data subject rights** workflows implemented (access, deletion, etc.)
- [ ] **Security measures** implemented (encryption, access controls, RLS)
- [ ] **Data Processing Agreements (DPAs)** signed with all processors
- [ ] **Cross-border transfer** mechanisms in place (SCCs, Privacy Policy disclosure)
- [ ] **SIC RNBD Registration** completed (obtain registration numbers)
- [ ] **Privacy Policy updated** with RNBD registration numbers
- [ ] **Incident response plan** documented and tested
- [ ] **Employee training** on data protection and Law 1581
- [ ] **Audit logging** for admin access to personal data
- [ ] **Data retention policies** implemented (automated deletion)

### Ongoing Compliance

**Monthly:**
- [ ] Review audit logs for suspicious activity
- [ ] Check for data subject rights requests (respond within 10-15 business days)
- [ ] Monitor security alerts (Better Stack)

**Quarterly:**
- [ ] Review and update processor inventory
- [ ] Test data export and deletion workflows
- [ ] Review data retention policies (ensure automated deletion is working)
- [ ] Review SIC guidelines for any new requirements

**Annually:**
- [ ] Review and update Privacy Policy (if needed)
- [ ] Review DPAs with processors (ensure still valid and up-to-date)
- [ ] Conduct internal privacy audit
- [ ] Employee privacy training (Law 1581 refresher)
- [ ] Review and test Incident Response Plan
- [ ] Renew SIC RNBD registration (if required)

**When Introducing New Features:**
- [ ] Assess if new data collection is necessary (data minimization)
- [ ] Determine lawful basis (authorization, contract, legal obligation)
- [ ] Update Privacy Policy if new data processing introduced
- [ ] Update RNBD registration if new database or significant processing change
- [ ] Obtain new authorization from users if purpose changes

---

## Common Pitfalls

### Mistakes to Avoid

#### 1. Pre-Checked Authorization Checkbox

**❌ WRONG:**
```tsx
<Checkbox defaultChecked={true}>
  Acepto la Política de Privacidad
</Checkbox>
```

**Why It's Wrong:** Authorization must be express (affirmative action). Pre-checked box does NOT constitute valid authorization under Law 1581.

**✅ CORRECT:**
```tsx
<Checkbox defaultChecked={false} required>
  He leído y acepto la Política de Privacidad
</Checkbox>
```

#### 2. Bundled Consent

**❌ WRONG:**
```
[ ] Acepto los Términos, Política de Privacidad, y recibir emails de marketing
```

**Why It's Wrong:** Consent for non-essential processing (marketing) must be separate and optional (Decree 1377).

**✅ CORRECT:**
```
[✓] Acepto los Términos y Política de Privacidad (requerido)
[ ] Acepto recibir emails de marketing (opcional)
```

#### 3. Not Responding to Rights Requests in Time

**❌ WRONG:**
- Ignoring consultas (inquiries)
- Responding to reclamos (claims) after 15 business days without justification

**Legal Consequence:** SIC may impose fines for failing to respond within legal timeframes.

**✅ CORRECT:**
- Respond to consultas within **10 business days**
- Respond to reclamos within **15 business days**
- If need extension, notify user and provide justification

#### 4. No DPA with Processors

**❌ WRONG:**
- Using Supabase, Stripe, etc. without signed DPA
- Assuming their privacy policy is sufficient

**Legal Consequence:** SIC may find that international transfer lacks adequate safeguards.

**✅ CORRECT:**
- Execute DPA with every processor
- Ensure DPA includes Law 1581 provisions (not just GDPR)

#### 5. Storing Sensitive Data Unnecessarily

**❌ WRONG:**
- Collecting health data, religious beliefs, etc. without explicit authorization and clear purpose

**Legal Consequence:** Article 6 of Law 1581 generally prohibits processing sensitive data unless explicit authorization obtained.

**✅ CORRECT:**
- DO NOT collect sensitive data unless absolutely necessary
- If must collect, obtain separate, explicit authorization
- Implement heightened security measures

#### 6. Not Registering with SIC RNBD

**❌ WRONG:**
- Operating without SIC RNBD registration

**Legal Consequence:** Potential fine for non-compliance with Decree 1377 registration requirement.

**✅ CORRECT:**
- Register databases with SIC RNBD before public launch
- Update Privacy Policy with registration numbers

#### 7. Storing Data Indefinitely

**❌ WRONG:**
- Never deleting user data (even after account deletion)
- "We might need it someday"

**Legal Consequence:** Violates purpose limitation and storage limitation principles.

**✅ CORRECT:**
- Define retention periods for each data type
- Automate deletion after retention period
- Retain only what's legally required (tax records, etc.)

#### 8. Poor Privacy Policy (Not in Spanish)

**❌ WRONG:**
- Privacy Policy only in English
- Privacy Policy with complex legal jargon (not understandable by average user)

**Legal Consequence:** Authorization may be deemed invalid if data subject could not reasonably understand purposes.

**✅ CORRECT:**
- Privacy Policy in Spanish (primary) and English
- Clear, plain language (understandable by average person)
- Prominently displayed and easily accessible

---

## Resources

### Official Resources

**Superintendencia de Industria y Comercio (SIC):**
- **Website:** [https://www.sic.gov.co](https://www.sic.gov.co)
- **Data Protection:** [https://www.sic.gov.co/tema/proteccion-de-datos-personales](https://www.sic.gov.co/tema/proteccion-de-datos-personales)
- **RNBD Registration:** [https://www.sic.gov.co/registro-publico-de-bases-de-datos](https://www.sic.gov.co/registro-publico-de-bases-de-datos)
- **Guidelines:** [https://www.sic.gov.co/tema/proteccion-de-datos-personales/guias-y-manuales](https://www.sic.gov.co/tema/proteccion-de-datos-personales/guias-y-manuales)

**Legal Texts:**
- **Law 1581 of 2012:** [http://www.secretariasenado.gov.co/senado/basedoc/ley_1581_2012.html](http://www.secretariasenado.gov.co/senado/basedoc/ley_1581_2012.html)
- **Decree 1377 of 2013:** [https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=53646](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=53646)

### Practical Guides

**SIC Guidance Documents:**
- **Guide for Data Controllers:** [https://www.sic.gov.co/tema/proteccion-de-datos-personales/guia-para-responsables-del-tratamiento](https://www.sic.gov.co/tema/proteccion-de-datos-personales/guia-para-responsables-del-tratamiento)
- **Privacy Policy Model:** [https://www.sic.gov.co/tema/proteccion-de-datos-personales/modelo-politica-de-privacidad](https://www.sic.gov.co/tema/proteccion-de-datos-personales/modelo-politica-de-privacidad)

---

## Contact Information

### Internal Contacts

**Privacy Officer:**
- Email: privacy@casaora.co
- Responsible for Law 1581 compliance, data subject rights, SIC liaison

**Security Team:**
- Email: security@casaora.co
- Responsible for data breach response, security incidents

**Legal Team:**
- Email: legal@casaora.co
- Responsible for DPA negotiations, SIC communications, legal advice

### External Resources

**Legal Counsel (Colombian Attorney):**
- [LAW FIRM NAME - TO BE DETERMINED]
- Specializes in data protection and technology law in Colombia

**SIC Contact:**
- **Address:** Carrera 13 No. 27 – 00, Pisos 1 y 3, Bogotá D.C., Colombia
- **Phone:** +57 (1) 587 0000
- **Email:** contactenos@sic.gov.co
- **Complaints:** [https://www.sic.gov.co/tema/proteccion-de-datos-personales/como-presentar-una-queja](https://www.sic.gov.co/tema/proteccion-de-datos-personales/como-presentar-una-queja)

---

**Questions or Concerns?**

If you have questions about Law 1581 compliance or encounter a situation not covered in this guide:
1. **Email:** privacy@casaora.co
2. **Slack:** #privacy-compliance channel (internal)
3. **Escalate:** If urgent or high-risk, escalate to CEO and Legal Counsel

**Remember:** When in doubt, prioritize user privacy. It's better to over-comply than to violate Law 1581 and face SIC sanctions.

---

**Document Control:**
- **Created:** 2025-11-06
- **Last Reviewed:** 2025-11-06
- **Next Review:** Quarterly or upon material change in Colombian data protection law
- **Owner:** Privacy Officer / Legal Team
- **Intended Audience:** Internal - MaidConnect team members (developers, product, operations)
