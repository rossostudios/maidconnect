import { BookingCalendar } from "@/components/illustrations/booking-calendar";
import { CleanHome } from "@/components/illustrations/clean-home";
import { Container } from "@/components/ui/container";
import { FeatureCard, FeatureGrid, FeatureSection } from "@/components/ui/feature-section";
import { WavyDivider } from "@/components/ui/wavy-divider";
import { Link } from "@/i18n/routing";

/**
 * Design Showcase - Demonstrates SavvyCal-inspired design system
 * This page showcases all the new components and patterns
 *
 * Location: /design-showcase
 */
export default function DesignShowcasePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section - White Background */}
      <section className="bg-[#FFEEFF8E8] py-24">
        <Container>
          <div className="mx-auto max-w-4xl text-center">
            <div className="tagline mb-6 text-[#AA88AAAAC]">DESIGN SHOWCASE</div>

            <h1 className="serif-display-lg mb-8 text-[#116611616]">
              SavvyCal-Inspired Design System
            </h1>

            <p className="lead mb-12 text-[#116611616]/80">
              A comprehensive showcase of our new design components, colors, and patterns. Built
              with warm, inviting aesthetics and clean typography.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                className="rounded-full bg-[#FF4444A22] px-8 py-4 font-semibold text-[#FFEEFF8E8] shadow-lg transition-all hover:bg-[#FF4444A22] hover:shadow-xl active:scale-95"
                href="#components"
              >
                Explore Components
              </Link>
              <Link
                className="rounded-full border-2 border-[#FF4444A22] bg-transparent px-8 py-4 font-semibold text-[#FF4444A22] transition-all hover:bg-[#FF4444A22] hover:text-[#FFEEFF8E8]"
                href="/professionals"
              >
                See It Live
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Wavy Divider Transition */}
      <WavyDivider bottomColor="bg-[#FFEEFF8E8]" topColor="#FFEEFF8E8" />

      {/* Feature Section 1 - Cream Background with Clean Home */}
      <FeatureSection
        align="center"
        backgroundColor="secondary"
        description="Professional home services that make life easier. From cleaning to childcare, find verified professionals ready to help with all your home needs."
        heading="Professional Home Services"
        illustration={<CleanHome />}
        tagline="WHAT WE OFFER"
      >
        <FeatureGrid>
          <FeatureCard
            description="Connect with experienced house cleaners who provide thorough, reliable cleaning services for your home."
            href="/professionals?service=housekeeping"
            linkText="Find cleaners"
            title="House Cleaning"
          />
          <FeatureCard
            description="Trusted childcare professionals who provide safe, nurturing care for your children."
            href="/professionals?service=childcare"
            linkText="Find childcare"
            title="Childcare Services"
          />
          <FeatureCard
            description="Make moving easier with professional relocation assistance and unpacking services."
            href="/professionals?service=relocation"
            linkText="Get help moving"
            title="Relocation Help"
          />
        </FeatureGrid>
      </FeatureSection>

      {/* Wavy Divider Transition */}
      <WavyDivider bottomColor="#FFEEFF8E8" flip topColor="bg-[#FFEEFF8E8]" />

      {/* Feature Section 2 - White Background with Clean Home */}
      <FeatureSection
        align="left"
        backgroundColor="primary"
        description="We ensure every professional on our platform is thoroughly vetted, background-checked, and ready to provide exceptional service."
        heading="Trusted Professionals, Verified Results"
        illustration={<CleanHome />}
        tagline="QUALITY ASSURANCE"
      >
        <FeatureGrid>
          <FeatureCard
            description="Every professional undergoes comprehensive background checks and identity verification."
            title="Verified Identities"
          />
          <FeatureCard
            description="Read authentic reviews from real customers to make informed decisions."
            title="Authentic Reviews"
          />
          <FeatureCard
            description="All professionals carry insurance coverage for your peace of mind."
            title="Insured Services"
          />
          <FeatureCard
            description="Ongoing quality monitoring ensures consistently excellent service delivery."
            title="Quality Monitoring"
          />
          <FeatureCard
            description="Quick response times with most professionals available within 24-48 hours."
            title="Fast Response"
          />
          <FeatureCard
            description="Dedicated customer support team available to help with any questions or concerns."
            title="Support Team"
          />
        </FeatureGrid>
      </FeatureSection>

      {/* Wavy Divider Transition */}
      <WavyDivider bottomColor="bg-[#FFEEFF8E8]" topColor="#FFEEFF8E8" />

      {/* Feature Section 3 - Cream Background with Booking Calendar */}
      <FeatureSection
        align="center"
        backgroundColor="inverse"
        description="Book services in minutes with our intuitive platform. Schedule, manage, and pay all in one place."
        heading="Simple, Seamless Booking"
        illustration={<BookingCalendar />}
        tagline="EASY SCHEDULING"
      >
        <div className="mx-auto max-w-3xl space-y-12">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="text-left">
              <h3 className="serif-headline-sm mb-3 text-[#116611616]">1. Browse Professionals</h3>
              <p className="text-[#116611616]/70">
                Search by service type, location, and availability. View detailed profiles, ratings,
                and reviews to find the perfect match.
              </p>
            </div>

            <div className="text-left">
              <h3 className="serif-headline-sm mb-3 text-[#116611616]">2. Select Your Time</h3>
              <p className="text-[#116611616]/70">
                Choose from available time slots that work with your schedule. Real-time
                availability makes booking quick and easy.
              </p>
            </div>

            <div className="text-left">
              <h3 className="serif-headline-sm mb-3 text-[#116611616]">3. Secure Payment</h3>
              <p className="text-[#116611616]/70">
                Pay securely through our platform with multiple payment options. Funds are held
                safely until service completion.
              </p>
            </div>

            <div className="text-left">
              <h3 className="serif-headline-sm mb-3 text-[#116611616]">4. Enjoy Your Service</h3>
              <p className="text-[#116611616]/70">
                Relax while our verified professional takes care of your needs. Track progress and
                communicate directly through the platform.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link
              className="inline-flex items-center gap-2 rounded-full bg-[#FF4444A22] px-8 py-4 font-semibold text-[#FFEEFF8E8] shadow-lg transition-all hover:bg-[#FF4444A22] hover:shadow-xl active:scale-95"
              href="/auth/sign-up"
            >
              Get Started Today
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <title>Arrow</title>
                <path
                  d="M9 5l7 7-7 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </Link>
          </div>
        </div>
      </FeatureSection>

      {/* Wavy Divider Transition */}
      <WavyDivider bottomColor="#116611616" flip topColor="bg-[#FFEEFF8E8]" />

      {/* Dark Section - Showcase Contrast */}
      <section className="bg-[#116611616] py-24">
        <Container>
          <div className="mx-auto max-w-4xl text-center">
            <div className="tagline mb-6 text-[bg-[#FFEEFF8E8]]/70">JOIN OUR COMMUNITY</div>

            <h2 className="serif-display-lg mb-8 text-[bg-[#FFEEFF8E8]]">
              Are You a Home Service Professional?
            </h2>

            <p className="lead mb-12 text-[bg-[#FFEEFF8E8]]/80">
              Join thousands of professionals finding meaningful work through our platform. Set your
              own schedule, build your client base, and grow your business.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                className="rounded-full bg-[#FF4444A22] px-8 py-4 font-semibold text-[#FFEEFF8E8] shadow-lg transition-all hover:bg-[#FF4444A22] hover:shadow-xl active:scale-95"
                href="/auth/sign-up?role=professional"
              >
                Apply as Professional
              </Link>
              <Link
                className="rounded-full border-2 border-[bg-[#FFEEFF8E8]]/30 bg-transparent px-8 py-4 font-semibold text-[bg-[#FFEEFF8E8]] transition-all hover:border-[bg-[#FFEEFF8E8]] hover:bg-[#FFEEFF8E8]/10"
                href="/how-it-works"
              >
                Learn More
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Wavy Divider Transition */}
      <WavyDivider bottomColor="#FFEEFF8E8" topColor="#116611616" />

      {/* Color Palette Reference Section */}
      <section className="bg-[#FFEEFF8E8] py-24" id="components">
        <Container>
          <div className="mx-auto max-w-4xl">
            <div className="mb-16 text-center">
              <div className="tagline mb-6 text-[#AA88AAAAC]">DESIGN SYSTEM</div>
              <h2 className="serif-display-lg text-[#116611616]">Color Palette & Components</h2>
            </div>

            {/* Color Swatches */}
            <div className="mb-16">
              <h3 className="serif-headline-md mb-8 text-[#116611616]">Colors</h3>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-[#EE44EE2E3] bg-[#FFEEFF8E8] p-6">
                  <div
                    className="mb-4 h-24 w-full rounded-lg"
                    style={{ backgroundColor: "bg-[#FFEEFF8E8]" }}
                  />
                  <p className="font-mono text-sm">bg-[#FFEEFF8E8]</p>
                  <p className="text-[#AA88AAAAC] text-xs">Background</p>
                </div>
                <div className="rounded-xl border border-[#EE44EE2E3] bg-[#FFEEFF8E8] p-6">
                  <div
                    className="mb-4 h-24 w-full rounded-lg"
                    style={{ backgroundColor: "#116611616" }}
                  />
                  <p className="font-mono text-sm">#116611616</p>
                  <p className="text-[#AA88AAAAC] text-xs">Foreground</p>
                </div>
                <div className="rounded-xl border border-[#EE44EE2E3] bg-[#FFEEFF8E8] p-6">
                  <div
                    className="mb-4 h-24 w-full rounded-lg"
                    style={{ backgroundColor: "#FF4444A22" }}
                  />
                  <p className="font-mono text-sm">#FF4444A22</p>
                  <p className="text-[#AA88AAAAC] text-xs">Accent</p>
                </div>
                <div className="rounded-xl border border-[#EE44EE2E3] bg-[#FFEEFF8E8] p-6">
                  <div
                    className="mb-4 h-24 w-full rounded-lg"
                    style={{ backgroundColor: "#FF4444A22" }}
                  />
                  <p className="font-mono text-sm">#FF4444A22</p>
                  <p className="text-[#AA88AAAAC] text-xs">Accent Hover</p>
                </div>
              </div>
            </div>

            {/* Button Examples */}
            <div className="mb-16">
              <h3 className="serif-headline-md mb-8 text-[#116611616]">Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <button
                  className="rounded-full bg-[#FF4444A22] px-8 py-4 font-semibold text-[#FFEEFF8E8] shadow-lg transition-all hover:bg-[#FF4444A22] hover:shadow-xl active:scale-95"
                  type="button"
                >
                  Primary Button
                </button>
                <button
                  className="rounded-full border-2 border-[#FF4444A22] bg-transparent px-8 py-4 font-semibold text-[#FF4444A22] transition-all hover:bg-[#FF4444A22] hover:text-[#FFEEFF8E8]"
                  type="button"
                >
                  Secondary Button
                </button>
                <button
                  className="rounded-full border-2 border-[#EE44EE2E3] bg-[#FFEEFF8E8] px-8 py-4 font-semibold text-[#116611616] transition-all hover:border-[#FF4444A22]/30 hover:shadow-md"
                  type="button"
                >
                  Tertiary Button
                </button>
              </div>
            </div>

            {/* Typography Examples */}
            <div>
              <h3 className="serif-headline-md mb-8 text-[#116611616]">Typography</h3>
              <div className="space-y-6">
                <div>
                  <p className="mb-2 font-mono text-[#AA88AAAAC] text-xs">.serif-display-lg</p>
                  <h1 className="serif-display-lg text-[#116611616]">Display Heading</h1>
                </div>
                <div>
                  <p className="mb-2 font-mono text-[#AA88AAAAC] text-xs">.serif-headline-lg</p>
                  <h2 className="serif-headline-lg text-[#116611616]">Headline Large</h2>
                </div>
                <div>
                  <p className="mb-2 font-mono text-[#AA88AAAAC] text-xs">.serif-headline-md</p>
                  <h3 className="serif-headline-md text-[#116611616]">Headline Medium</h3>
                </div>
                <div>
                  <p className="mb-2 font-mono text-[#AA88AAAAC] text-xs">.lead</p>
                  <p className="lead text-[#116611616]/80">
                    Lead paragraph text for important introductions and descriptions.
                  </p>
                </div>
                <div>
                  <p className="mb-2 font-mono text-[#AA88AAAAC] text-xs">body</p>
                  <p className="text-[#116611616]/70">
                    Regular body text for general content and descriptions throughout the
                    application.
                  </p>
                </div>
                <div>
                  <p className="mb-2 font-mono text-[#AA88AAAAC] text-xs">.tagline</p>
                  <p className="tagline text-[#AA88AAAAC]">TAGLINE TEXT</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
