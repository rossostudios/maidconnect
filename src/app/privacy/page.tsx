import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - MaidConnect",
  description: "MaidConnect's privacy policy and data protection practices",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "January 2025";

  return (
    <div className="min-h-screen bg-[#fbfaf9] py-16 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[28px] bg-white p-8 md:p-12 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)]">
          <h1 className="mb-4 text-4xl font-bold text-[#211f1a]">
            Privacy Policy
          </h1>
          <p className="mb-8 text-[#7d7566]">
            Last updated: {lastUpdated}
          </p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-[#211f1a]">
                1. Introduction
              </h2>
              <p className="mb-4 text-[#7d7566]">
                MaidConnect ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>
              <p className="mb-4 text-[#7d7566]">
                We operate in compliance with Colombian data protection laws (Ley 1581 de 2012) and the General Data Protection Regulation (GDPR) for European users.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-[#211f1a]">
                2. Information We Collect
              </h2>
              <h3 className="mb-3 text-xl font-semibold text-[#211f1a]">
                2.1 Information You Provide
              </h3>
              <ul className="mb-4 ml-6 list-disc text-[#7d7566]">
                <li>Account information (name, email, phone number)</li>
                <li>Profile information (bio, services, experience)</li>
                <li>Payment information (processed securely through Stripe)</li>
                <li>Identity verification documents</li>
                <li>Communications with customers or professionals</li>
              </ul>

              <h3 className="mb-3 text-xl font-semibold text-[#211f1a]">
                2.2 Information Collected Automatically
              </h3>
              <ul className="mb-4 ml-6 list-disc text-[#7d7566]">
                <li>Device information (IP address, browser type)</li>
                <li>Usage data (pages visited, time spent)</li>
                <li>Location data (when you enable location services)</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-[#211f1a]">
                3. How We Use Your Information
              </h2>
              <ul className="mb-4 ml-6 list-disc text-[#7d7566]">
                <li>Facilitate bookings between customers and professionals</li>
                <li>Process payments and maintain financial records</li>
                <li>Verify identities and conduct background checks</li>
                <li>Send notifications about bookings and account activity</li>
                <li>Improve our platform and develop new features</li>
                <li>Comply with legal obligations</li>
                <li>Prevent fraud and ensure platform security</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-[#211f1a]">
                4. Information Sharing
              </h2>
              <p className="mb-4 text-[#7d7566]">
                We share your information only in the following circumstances:
              </p>
              <ul className="mb-4 ml-6 list-disc text-[#7d7566]">
                <li>
                  <strong>With Service Providers:</strong> Stripe for payment processing, Supabase for data storage, Resend for email delivery
                </li>
                <li>
                  <strong>Between Users:</strong> Customer and professional information is shared to facilitate bookings
                </li>
                <li>
                  <strong>For Legal Compliance:</strong> When required by law or to protect rights and safety
                </li>
                <li>
                  <strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets
                </li>
              </ul>
              <p className="mb-4 text-[#7d7566]">
                We never sell your personal information to third parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-[#211f1a]">
                5. Data Security
              </h2>
              <p className="mb-4 text-[#7d7566]">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="mb-4 ml-6 list-disc text-[#7d7566]">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication with Supabase Auth</li>
                <li>Regular security audits and monitoring</li>
                <li>PCI DSS compliant payment processing through Stripe</li>
                <li>Row Level Security (RLS) for database access control</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-[#211f1a]">
                6. Your Rights
              </h2>
              <p className="mb-4 text-[#7d7566]">
                You have the following rights regarding your personal data:
              </p>
              <ul className="mb-4 ml-6 list-disc text-[#7d7566]">
                <li>
                  <strong>Access:</strong> Request a copy of your personal data
                </li>
                <li>
                  <strong>Correction:</strong> Update incorrect or incomplete information
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your account and data
                </li>
                <li>
                  <strong>Portability:</strong> Receive your data in a machine-readable format
                </li>
                <li>
                  <strong>Objection:</strong> Object to processing of your data for certain purposes
                </li>
                <li>
                  <strong>Restriction:</strong> Request limitation of data processing
                </li>
              </ul>
              <p className="mb-4 text-[#7d7566]">
                To exercise these rights, contact us at{" "}
                <a href="mailto:privacy@maidconnect.co" className="text-[#ff5d46] hover:underline">
                  privacy@maidconnect.co
                </a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-[#211f1a]">
                7. Data Retention
              </h2>
              <p className="mb-4 text-[#7d7566]">
                We retain your information for as long as necessary to provide our services and comply with legal obligations. When you delete your account:
              </p>
              <ul className="mb-4 ml-6 list-disc text-[#7d7566]">
                <li>Personal information is deleted within 30 days</li>
                <li>Financial records are retained for 7 years (legal requirement)</li>
                <li>Anonymized data may be retained for analytics</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-[#211f1a]">
                8. Cookies
              </h2>
              <p className="mb-4 text-[#7d7566]">
                We use cookies and similar technologies to:
              </p>
              <ul className="mb-4 ml-6 list-disc text-[#7d7566]">
                <li>Maintain your session and keep you logged in</li>
                <li>Remember your preferences</li>
                <li>Analyze platform usage</li>
                <li>Improve user experience</li>
              </ul>
              <p className="mb-4 text-[#7d7566]">
                You can control cookies through your browser settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-[#211f1a]">
                9. Children's Privacy
              </h2>
              <p className="mb-4 text-[#7d7566]">
                MaidConnect is not intended for users under 18 years of age. We do not knowingly collect information from children. If we learn that we have collected information from a child, we will delete it immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-[#211f1a]">
                10. International Data Transfers
              </h2>
              <p className="mb-4 text-[#7d7566]">
                Your information may be transferred to and maintained on servers located outside of Colombia. We ensure appropriate safeguards are in place for such transfers in compliance with applicable laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-[#211f1a]">
                11. Changes to This Policy
              </h2>
              <p className="mb-4 text-[#7d7566]">
                We may update this Privacy Policy from time to time. We will notify you of significant changes via email or platform notification. Your continued use of MaidConnect after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-[#211f1a]">
                12. Contact Us
              </h2>
              <p className="mb-4 text-[#7d7566]">
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <ul className="ml-6 list-none text-[#7d7566]">
                <li className="mb-2">
                  <strong>Email:</strong>{" "}
                  <a href="mailto:privacy@maidconnect.co" className="text-[#ff5d46] hover:underline">
                    privacy@maidconnect.co
                  </a>
                </li>
                <li className="mb-2">
                  <strong>Support:</strong>{" "}
                  <a href="/contact" className="text-[#ff5d46] hover:underline">
                    Contact Form
                  </a>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
