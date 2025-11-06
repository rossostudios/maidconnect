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
      <section className="bg-white py-24">
        <Container>
          <div className="mx-auto max-w-4xl text-center">
            <div className="tagline mb-6 text-[#7a6d62]">DESIGN SHOWCASE</div>

            <h1 className="serif-display-lg mb-8 text-[#1A1614]">
              SavvyCal-Inspired Design System
            </h1>

            <p className="lead mb-12 text-[#1A1614]/80">
              A comprehensive showcase of our new design components, colors, and patterns. Built
              with warm, inviting aesthetics and clean typography.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                className="rounded-full bg-[#E85D48] px-8 py-4 font-semibold text-white shadow-lg transition-all hover:bg-[#D64A36] hover:shadow-xl active:scale-95"
                href="#components"
              >
                Explore Components
              </Link>
              <Link
                className="rounded-full border-2 border-[#E85D48] bg-transparent px-8 py-4 font-semibold text-[#E85D48] transition-all hover:bg-[#E85D48] hover:text-white"
                href="/professionals"
              >
                See It Live
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Wavy Divider Transition */}
      <WavyDivider bottomColor="#F5F0E8" topColor="#ffffff" />

      {/* Feature Section 1 - Cream Background with Clean Home */}
      <FeatureSection
        align="center"
        backgroundColor="stone-50"
        description="Professional home services that make life easier. From cleaning to childcare, find verified professionals ready to help with all your home needs."
        heading="Professional Home Services"
        illustration={<CleanHome />}
        tagline="WHAT WE OFFER"
        textColor="stone-900"
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
      <WavyDivider bottomColor="#ffffff" flip topColor="#F5F0E8" />

      {/* Feature Section 2 - White Background with Clean Home */}
      <FeatureSection
        align="left"
        backgroundColor="#ffffff"
        description="We ensure every professional on our platform is thoroughly vetted, background-checked, and ready to provide exceptional service."
        heading="Trusted Professionals, Verified Results"
        illustration={<CleanHome />}
        tagline="QUALITY ASSURANCE"
        textColor="#1A1614"
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
      <WavyDivider bottomColor="#F5F0E8" topColor="#ffffff" />

      {/* Feature Section 3 - Cream Background with Booking Calendar */}
      <FeatureSection
        align="center"
        backgroundColor="#F5F0E8"
        description="Book services in minutes with our intuitive platform. Schedule, manage, and pay all in one place."
        heading="Simple, Seamless Booking"
        illustration={<BookingCalendar />}
        tagline="EASY SCHEDULING"
        textColor="#1A1614"
      >
        <div className="mx-auto max-w-3xl space-y-12">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="text-left">
              <h3 className="serif-headline-sm mb-3 text-[#1A1614]">1. Browse Professionals</h3>
              <p className="text-[#1A1614]/70">
                Search by service type, location, and availability. View detailed profiles, ratings,
                and reviews to find the perfect match.
              </p>
            </div>

            <div className="text-left">
              <h3 className="serif-headline-sm mb-3 text-[#1A1614]">2. Select Your Time</h3>
              <p className="text-[#1A1614]/70">
                Choose from available time slots that work with your schedule. Real-time
                availability makes booking quick and easy.
              </p>
            </div>

            <div className="text-left">
              <h3 className="serif-headline-sm mb-3 text-[#1A1614]">3. Secure Payment</h3>
              <p className="text-[#1A1614]/70">
                Pay securely through our platform with multiple payment options. Funds are held
                safely until service completion.
              </p>
            </div>

            <div className="text-left">
              <h3 className="serif-headline-sm mb-3 text-[#1A1614]">4. Enjoy Your Service</h3>
              <p className="text-[#1A1614]/70">
                Relax while our verified professional takes care of your needs. Track progress and
                communicate directly through the platform.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link
              className="inline-flex items-center gap-2 rounded-full bg-[#E85D48] px-8 py-4 font-semibold text-white shadow-lg transition-all hover:bg-[#D64A36] hover:shadow-xl active:scale-95"
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
      <WavyDivider bottomColor="#1A1614" flip topColor="#F5F0E8" />

      {/* Dark Section - Showcase Contrast */}
      <section className="bg-[#1A1614] py-24">
        <Container>
          <div className="mx-auto max-w-4xl text-center">
            <div className="tagline mb-6 text-[#F5F0E8]/70">JOIN OUR COMMUNITY</div>

            <h2 className="serif-display-lg mb-8 text-[#F5F0E8]">
              Are You a Home Service Professional?
            </h2>

            <p className="lead mb-12 text-[#F5F0E8]/80">
              Join thousands of professionals finding meaningful work through our platform. Set your
              own schedule, build your client base, and grow your business.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                className="rounded-full bg-[#E85D48] px-8 py-4 font-semibold text-white shadow-lg transition-all hover:bg-[#D64A36] hover:shadow-xl active:scale-95"
                href="/auth/sign-up?role=professional"
              >
                Apply as Professional
              </Link>
              <Link
                className="rounded-full border-2 border-[#F5F0E8]/30 bg-transparent px-8 py-4 font-semibold text-[#F5F0E8] transition-all hover:border-[#F5F0E8] hover:bg-[#F5F0E8]/10"
                href="/how-it-works"
              >
                Learn More
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Wavy Divider Transition */}
      <WavyDivider bottomColor="#ffffff" topColor="#1A1614" />

      {/* Color Palette Reference Section */}
      <section className="bg-white py-24" id="components">
        <Container>
          <div className="mx-auto max-w-4xl">
            <div className="mb-16 text-center">
              <div className="tagline mb-6 text-[#7a6d62]">DESIGN SYSTEM</div>
              <h2 className="serif-display-lg text-[#1A1614]">Color Palette & Components</h2>
            </div>

            {/* Color Swatches */}
            <div className="mb-16">
              <h3 className="serif-headline-md mb-8 text-[#1A1614]">Colors</h3>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-[#e8e5e0] bg-white p-6">
                  <div
                    className="mb-4 h-24 w-full rounded-lg"
                    style={{ backgroundColor: "#F5F0E8" }}
                  />
                  <p className="font-mono text-sm">#F5F0E8</p>
                  <p className="text-[#7a6d62] text-xs">Background</p>
                </div>
                <div className="rounded-xl border border-[#e8e5e0] bg-white p-6">
                  <div
                    className="mb-4 h-24 w-full rounded-lg"
                    style={{ backgroundColor: "#1A1614" }}
                  />
                  <p className="font-mono text-sm">#1A1614</p>
                  <p className="text-[#7a6d62] text-xs">Foreground</p>
                </div>
                <div className="rounded-xl border border-[#e8e5e0] bg-white p-6">
                  <div
                    className="mb-4 h-24 w-full rounded-lg"
                    style={{ backgroundColor: "#E85D48" }}
                  />
                  <p className="font-mono text-sm">#E85D48</p>
                  <p className="text-[#7a6d62] text-xs">Accent</p>
                </div>
                <div className="rounded-xl border border-[#e8e5e0] bg-white p-6">
                  <div
                    className="mb-4 h-24 w-full rounded-lg"
                    style={{ backgroundColor: "#D64A36" }}
                  />
                  <p className="font-mono text-sm">#D64A36</p>
                  <p className="text-[#7a6d62] text-xs">Accent Hover</p>
                </div>
              </div>
            </div>

            {/* Button Examples */}
            <div className="mb-16">
              <h3 className="serif-headline-md mb-8 text-[#1A1614]">Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <button
                  className="rounded-full bg-[#E85D48] px-8 py-4 font-semibold text-white shadow-lg transition-all hover:bg-[#D64A36] hover:shadow-xl active:scale-95"
                  type="button"
                >
                  Primary Button
                </button>
                <button
                  className="rounded-full border-2 border-[#E85D48] bg-transparent px-8 py-4 font-semibold text-[#E85D48] transition-all hover:bg-[#E85D48] hover:text-white"
                  type="button"
                >
                  Secondary Button
                </button>
                <button
                  className="rounded-full border-2 border-[#e8e5e0] bg-white px-8 py-4 font-semibold text-[#1A1614] transition-all hover:border-[#E85D48]/30 hover:shadow-md"
                  type="button"
                >
                  Tertiary Button
                </button>
              </div>
            </div>

            {/* Typography Examples */}
            <div>
              <h3 className="serif-headline-md mb-8 text-[#1A1614]">Typography</h3>
              <div className="space-y-6">
                <div>
                  <p className="mb-2 font-mono text-[#7a6d62] text-xs">.serif-display-lg</p>
                  <h1 className="serif-display-lg text-[#1A1614]">Display Heading</h1>
                </div>
                <div>
                  <p className="mb-2 font-mono text-[#7a6d62] text-xs">.serif-headline-lg</p>
                  <h2 className="serif-headline-lg text-[#1A1614]">Headline Large</h2>
                </div>
                <div>
                  <p className="mb-2 font-mono text-[#7a6d62] text-xs">.serif-headline-md</p>
                  <h3 className="serif-headline-md text-[#1A1614]">Headline Medium</h3>
                </div>
                <div>
                  <p className="mb-2 font-mono text-[#7a6d62] text-xs">.lead</p>
                  <p className="lead text-[#1A1614]/80">
                    Lead paragraph text for important introductions and descriptions.
                  </p>
                </div>
                <div>
                  <p className="mb-2 font-mono text-[#7a6d62] text-xs">body</p>
                  <p className="text-[#1A1614]/70">
                    Regular body text for general content and descriptions throughout the
                    application.
                  </p>
                </div>
                <div>
                  <p className="mb-2 font-mono text-[#7a6d62] text-xs">.tagline</p>
                  <p className="tagline text-[#7a6d62]">TAGLINE TEXT</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
