import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "pages.terms.meta" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function TermsOfServicePage({ params }: Props) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "pages.terms" });
  const lastUpdated = "January 2025";

  return (
    <div className="min-h-screen bg-[#fbfaf9] py-16 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[28px] bg-white p-8 md:p-12 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)]">
          <h1 className="mb-4 text-4xl font-bold text-[#211f1a]">
            {t("title")}
          </h1>
          <p className="mb-8 text-[#7d7566]">
            {t("lastUpdated", { date: lastUpdated })}
          </p>

          {/* Note: Full legal content translation should be reviewed by legal counsel */}

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-[#211f1a]">
                1. Agreement to Terms
              </h2>
              <p className="mb-4 text-[#7d7566]">
                By accessing or using MaidConnect, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-[#211f1a]">
                2. Platform Overview
              </h2>
              <p className="mb-4 text-[#7d7566]">
                MaidConnect is a platform that connects customers with professional service providers for home cleaning and related services. We facilitate the connection but are not the provider of the services.
              </p>
              <p className="mb-4 text-[#7d7566]">
                <strong>Important:</strong> MaidConnect acts as an intermediary. The actual service is performed by independent professionals, not by MaidConnect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-[#211f1a]">
                3. User Accounts
              </h2>
              <h3 className="mb-3 text-xl font-semibold text-[#211f1a]">
                3.1 Registration
              </h3>
              <ul className="mb-4 ml-6 list-disc text-[#7d7566]">
                <li>You must be at least 18 years old to use MaidConnect</li>
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for maintaining account security</li>
                <li>One person may not maintain multiple accounts</li>
              </ul>

              <h3 className="mb-3 text-xl font-semibold text-[#211f1a]">
                3.2 Professional Accounts
              </h3>
              <ul className="mb-4 ml-6 list-disc text-[#7d7566]">
                <li>Professionals must complete identity verification</li>
                <li>All required documents must be valid and current</li>
                <li>Professionals must maintain appropriate licenses and insurance</li>
                <li>MaidConnect reserves the right to reject or remove any professional</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-[#211f1a]">
                4. Bookings and Services
              </h2>
              <h3 className="mb-3 text-xl font-semibold text-[#211f1a]">
                4.1 Booking Process
              </h3>
              <ul className="mb-4 ml-6 list-disc text-[#7d7566]">
                <li>Customers can browse and book available professionals</li>
                <li>Professionals must accept or decline bookings within 24 hours</li>
                <li>Accepted bookings create a binding agreement between customer and professional</li>
                <li>Payment is authorized at booking but charged after service completion</li>
              </ul>

              <h3 className="mb-3 text-xl font-semibold text-[#211f1a]">
                4.2 Cancellations and Rescheduling
              </h3>
              <ul className="mb-4 ml-6 list-disc text-[#7d7566]">
                <li>Customers may reschedule bookings at any time (subject to professional acceptance)</li>
                <li>Professionals may decline bookings without penalty</li>
                <li>Cancellations after acceptance may result in fees</li>
                <li>No-shows may result in charges and account restrictions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-[#211f1a]">
                5. Payments and Fees
              </h2>
              <h3 className="mb-3 text-xl font-semibold text-[#211f1a]">
                5.1 Customer Payments
              </h3>
              <ul className="mb-4 ml-6 list-disc text-[#7d7566]">
                <li>Payments are processed securely through Stripe</li>
                <li>Payment is authorized at booking time</li>
                <li>Charges are captured after service completion</li>
                <li>Refunds are subject to our refund policy</li>
              </ul>

              <h3 className="mb-3 text-xl font-semibold text-[#211f1a]">
                5.2 Professional Payouts
              </h3>
              <ul className="mb-4 ml-6 list-disc text-[#7d7566]">
                <li>MaidConnect charges a platform fee on each booking</li>
                <li>Payouts are processed twice weekly (Tuesday and Friday)</li>
                <li>Professionals must set up Stripe Connect for payouts</li>
                <li>Tax obligations are the responsibility of the professional</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-[#211f1a]">
                6. User Conduct
              </h2>
              <p className="mb-4 text-[#7d7566]">
                Users agree to:
              </p>
              <ul className="mb-4 ml-6 list-disc text-[#7d7566]">
                <li>Use the platform only for lawful purposes</li>
                <li>Treat all users with respect</li>
                <li>Provide accurate information</li>
                <li>Not attempt to circumvent payment systems</li>
                <li>Not engage in fraudulent or abusive behavior</li>
                <li>Not harass, threaten, or discriminate against other users</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-[#211f1a]">
                7. Prohibited Activities
              </h2>
              <ul className="mb-4 ml-6 list-disc text-[#7d7566]">
                <li>Attempting to bypass our platform for payments</li>
                <li>Creating fake reviews or ratings</li>
                <li>Impersonating another user or professional</li>
                <li>Scraping or data mining the platform</li>
                <li>Interfering with platform operations</li>
                <li>Violating any applicable laws or regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-[#211f1a]">
                8. Liability and Disclaimers
              </h2>
              <h3 className="mb-3 text-xl font-semibold text-[#211f1a]">
                8.1 Platform "As Is"
              </h3>
              <p className="mb-4 text-[#7d7566]">
                MaidConnect is provided "as is" without warranties of any kind. We do not guarantee uninterrupted or error-free operation.
              </p>

              <h3 className="mb-3 text-xl font-semibold text-[#211f1a]">
                8.2 Professional Services
              </h3>
              <p className="mb-4 text-[#7d7566]">
                MaidConnect is not responsible for the quality, safety, or legality of services provided by professionals. Professionals are independent contractors, not employees of MaidConnect.
              </p>

              <h3 className="mb-3 text-xl font-semibold text-[#211f1a]">
                8.3 Limitation of Liability
              </h3>
              <p className="mb-4 text-[#7d7566]">
                MaidConnect's liability is limited to the amount paid for the specific booking in question. We are not liable for indirect, incidental, or consequential damages.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-[#211f1a]">
                9. Insurance and Background Checks
              </h2>
              <p className="mb-4 text-[#7d7566]">
                While we conduct basic verification of professionals, customers are responsible for:
              </p>
              <ul className="mb-4 ml-6 list-disc text-[#7d7566]">
                <li>Verifying professional credentials</li>
                <li>Ensuring adequate property insurance</li>
                <li>Securing valuables during service</li>
                <li>Reporting any issues immediately</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-[#211f1a]">
                10. Dispute Resolution
              </h2>
              <p className="mb-4 text-[#7d7566]">
                In the event of a dispute:
              </p>
              <ol className="mb-4 ml-6 list-decimal text-[#7d7566]">
                <li>Contact our support team to attempt resolution</li>
                <li>If unresolved, disputes may be referred to mediation</li>
                <li>Disputes are governed by Colombian law</li>
                <li>Venue for legal proceedings is Bogotá, Colombia</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-[#211f1a]">
                11. Intellectual Property
              </h2>
              <p className="mb-4 text-[#7d7566]">
                All content on MaidConnect, including logos, text, graphics, and software, is the property of MaidConnect and protected by copyright and trademark laws. You may not use our intellectual property without permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-[#211f1a]">
                12. Account Suspension and Termination
              </h2>
              <p className="mb-4 text-[#7d7566]">
                We reserve the right to suspend or terminate accounts for:
              </p>
              <ul className="mb-4 ml-6 list-disc text-[#7d7566]">
                <li>Violation of these Terms of Service</li>
                <li>Fraudulent or abusive behavior</li>
                <li>Failure to pay fees</li>
                <li>Any reason, with or without notice</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-[#211f1a]">
                13. Changes to Terms
              </h2>
              <p className="mb-4 text-[#7d7566]">
                We may modify these Terms at any time. Significant changes will be communicated via email or platform notification. Continued use after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-[#211f1a]">
                14. Contact Information
              </h2>
              <p className="mb-4 text-[#7d7566]">
                Questions about these Terms? Contact us:
              </p>
              <ul className="ml-6 list-none text-[#7d7566]">
                <li className="mb-2">
                  <strong>Email:</strong>{" "}
                  <a href="mailto:legal@maidconnect.co" className="text-[#ff5d46] hover:underline">
                    legal@maidconnect.co
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
