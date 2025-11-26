// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils";

/**
 * Lia Design System Kitchen Sink
 *
 * A comprehensive showcase of all Lia Design System primitives:
 * - Typography (Geist Sans + Geist Mono)
 * - Color Palette (Neutral + Orange)
 * - Buttons (Primary, Secondary, Outline, Ghost)
 * - Badges (Status indicators)
 * - Cards (Data containers)
 * - Spacing Scale (8px/24px/64px)
 * - Data Tables
 *
 * Design Philosophy:
 * - Bloomberg Terminal-inspired precision
 * - Sharp rectangular geometry (zero rounded corners)
 * - Geist fonts exclusively
 * - WCAG AAA accessibility (7:1+ contrast)
 * - Minimal decoration, maximum clarity
 */

const meta = {
  title: "Design System/Precision Kitchen Sink",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Complete showcase of Lia Design System primitives for visual verification and designer/engineer reference.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Complete Lia Design System showcase
 */
export const KitchenSink: Story = {
  render: () => (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="mx-auto max-w-7xl space-y-16">
        {/* Header */}
        <header className="border-neutral-200 border-b pb-8">
          <h1
            className={cn(
              "font-bold text-5xl text-neutral-900 uppercase tracking-tight",
              geistSans.className
            )}
          >
            Lia Design System
          </h1>
          <p className={cn("mt-4 text-lg text-neutral-700 leading-relaxed", geistSans.className)}>
            Bloomberg Terminal-inspired professional design language with sharp edges, Geist fonts,
            and WCAG AAA accessibility.
          </p>
        </header>

        {/* Typography Section */}
        <section>
          <h2
            className={cn(
              "mb-6 font-semibold text-3xl text-neutral-900 uppercase tracking-tight",
              geistSans.className
            )}
          >
            Typography
          </h2>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Geist Sans */}
            <div className="border border-neutral-200 bg-white p-6 shadow-sm ring-1 ring-black/5">
              <h3
                className={cn(
                  "mb-4 font-semibold text-neutral-900 text-xl tracking-tight",
                  geistSans.className
                )}
              >
                Geist Sans (UI Font)
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="mb-1 text-neutral-600 text-xs uppercase tracking-wide">
                    Heading 1 (48px)
                  </p>
                  <h1
                    className={cn(
                      "font-bold text-5xl text-neutral-900 tracking-tight",
                      geistSans.className
                    )}
                  >
                    Premium Service
                  </h1>
                </div>

                <div>
                  <p className="mb-1 text-neutral-600 text-xs uppercase tracking-wide">
                    Heading 2 (36px)
                  </p>
                  <h2
                    className={cn(
                      "font-semibold text-4xl text-neutral-900 tracking-tight",
                      geistSans.className
                    )}
                  >
                    How It Works
                  </h2>
                </div>

                <div>
                  <p className="mb-1 text-neutral-600 text-xs uppercase tracking-wide">
                    Heading 3 (24px)
                  </p>
                  <h3
                    className={cn(
                      "font-semibold text-2xl text-neutral-900 tracking-tight",
                      geistSans.className
                    )}
                  >
                    User Management
                  </h3>
                </div>

                <div>
                  <p className="mb-1 text-neutral-600 text-xs uppercase tracking-wide">
                    Body Text (16px)
                  </p>
                  <p
                    className={cn(
                      "text-base text-neutral-700 leading-relaxed",
                      geistSans.className
                    )}
                  >
                    Casaora connects discerning households with Colombia's top 5% of domestic
                    professionals through AI-powered matching and rigorous vetting.
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-neutral-600 text-xs uppercase tracking-wide">
                    Small Text (14px)
                  </p>
                  <p
                    className={cn("text-neutral-600 text-sm leading-relaxed", geistSans.className)}
                  >
                    Secondary information and supporting details use smaller text for visual
                    hierarchy.
                  </p>
                </div>
              </div>
            </div>

            {/* Geist Mono */}
            <div className="border border-neutral-200 bg-white p-6 shadow-sm ring-1 ring-black/5">
              <h3
                className={cn(
                  "mb-4 font-semibold text-neutral-900 text-xl tracking-tight",
                  geistSans.className
                )}
              >
                Geist Mono (Data Font)
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="mb-1 text-neutral-600 text-xs uppercase tracking-wide">
                    Large Metrics (36px)
                  </p>
                  <p
                    className={cn(
                      "font-bold text-4xl text-neutral-900 tracking-tight",
                      geistSans.className
                    )}
                  >
                    12,847
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-neutral-600 text-xs uppercase tracking-wide">
                    IDs & References (14px)
                  </p>
                  <p className={cn("text-neutral-700 text-sm", geistSans.className)}>
                    USR-2025-001
                  </p>
                  <p className={cn("text-neutral-700 text-sm", geistSans.className)}>
                    BKG-2025-042
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-neutral-600 text-xs uppercase tracking-wide">
                    Timestamps (12px)
                  </p>
                  <p className={cn("text-neutral-600 text-xs", geistSans.className)}>
                    Jan 15, 2025 · 10:30 AM
                  </p>
                  <p className={cn("text-neutral-600 text-xs", geistSans.className)}>
                    2025-01-15T10:30:00Z
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-neutral-600 text-xs uppercase tracking-wide">
                    Currency (14px)
                  </p>
                  <p className={cn("text-neutral-900 text-sm", geistSans.className)}>
                    $125,000 COP
                  </p>
                  <p className={cn("text-neutral-900 text-sm", geistSans.className)}>$350.00 USD</p>
                </div>

                <div>
                  <p className="mb-1 text-neutral-600 text-xs uppercase tracking-wide">
                    Percentages (14px)
                  </p>
                  <p className={cn("text-green-600 text-sm", geistSans.className)}>↑ 12.5%</p>
                  <p className={cn("text-red-600 text-sm", geistSans.className)}>↓ 3.2%</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Color Palette Section */}
        <section>
          <h2
            className={cn(
              "mb-6 font-semibold text-3xl text-neutral-900 uppercase tracking-tight",
              geistSans.className
            )}
          >
            Color Palette
          </h2>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Neutral Palette */}
            <div className="border border-neutral-200 bg-white p-6 shadow-sm ring-1 ring-black/5">
              <h3
                className={cn(
                  "mb-4 font-semibold text-neutral-900 text-xl tracking-tight",
                  geistSans.className
                )}
              >
                Neutral Palette
              </h3>

              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 border border-neutral-200 bg-neutral-50" />
                  <div>
                    <p className={cn("text-neutral-900 text-sm", geistSans.className)}>
                      neutral-50
                    </p>
                    <p className={cn("text-neutral-600 text-xs", geistSans.className)}>#FFFDFC</p>
                  </div>
                  <p className={cn("ml-auto text-neutral-600 text-xs", geistSans.className)}>
                    Page backgrounds
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 border border-neutral-200 bg-neutral-100" />
                  <div>
                    <p className={cn("text-neutral-900 text-sm", geistSans.className)}>
                      neutral-100
                    </p>
                    <p className={cn("text-neutral-600 text-xs", geistSans.className)}>#FAF8F6</p>
                  </div>
                  <p className={cn("ml-auto text-neutral-600 text-xs", geistSans.className)}>
                    Subtle backgrounds
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 border border-neutral-300 bg-neutral-200" />
                  <div>
                    <p className={cn("text-neutral-900 text-sm", geistSans.className)}>
                      neutral-200
                    </p>
                    <p className={cn("text-neutral-600 text-xs", geistSans.className)}>#EBEAE9</p>
                  </div>
                  <p className={cn("ml-auto text-neutral-600 text-xs", geistSans.className)}>
                    Borders, dividers
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 border border-neutral-700 bg-neutral-600" />
                  <div>
                    <p className={cn("text-neutral-900 text-sm", geistSans.className)}>
                      neutral-600
                    </p>
                    <p className={cn("text-neutral-600 text-xs", geistSans.className)}>#8C8985</p>
                  </div>
                  <p className={cn("ml-auto text-neutral-600 text-xs", geistSans.className)}>
                    Muted text
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 border border-neutral-800 bg-neutral-700" />
                  <div>
                    <p className={cn("text-neutral-900 text-sm", geistSans.className)}>
                      neutral-700
                    </p>
                    <p className={cn("text-neutral-600 text-xs", geistSans.className)}>#64615D</p>
                  </div>
                  <p className={cn("ml-auto text-neutral-600 text-xs", geistSans.className)}>
                    Body text
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 border border-neutral-900 bg-neutral-900" />
                  <div>
                    <p className={cn("text-neutral-900 text-sm", geistSans.className)}>
                      neutral-900
                    </p>
                    <p className={cn("text-neutral-600 text-xs", geistSans.className)}>#181818</p>
                  </div>
                  <p className={cn("ml-auto text-neutral-600 text-xs", geistSans.className)}>
                    Headings
                  </p>
                </div>
              </div>
            </div>

            {/* Orange Palette */}
            <div className="border border-neutral-200 bg-white p-6 shadow-sm ring-1 ring-black/5">
              <h3
                className={cn(
                  "mb-4 font-semibold text-neutral-900 text-xl tracking-tight",
                  geistSans.className
                )}
              >
                Orange Accent Palette
              </h3>

              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 border border-rausch-100 bg-rausch-50" />
                  <div>
                    <p className={cn("text-neutral-900 text-sm", geistSans.className)}>rausch-50</p>
                    <p className={cn("text-neutral-600 text-xs", geistSans.className)}>#FFF7F0</p>
                  </div>
                  <p className={cn("ml-auto text-neutral-600 text-xs", geistSans.className)}>
                    Tint backgrounds
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 border border-rausch-500 bg-rausch-400" />
                  <div>
                    <p className={cn("text-neutral-900 text-sm", geistSans.className)}>
                      rausch-400
                    </p>
                    <p className={cn("text-neutral-600 text-xs", geistSans.className)}>#FF8746</p>
                  </div>
                  <p className={cn("ml-auto text-neutral-600 text-xs", geistSans.className)}>
                    Light accents
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 border border-rausch-600 bg-rausch-500" />
                  <div>
                    <p className={cn("text-neutral-900 text-sm", geistSans.className)}>
                      rausch-500
                    </p>
                    <p className={cn("text-neutral-600 text-xs", geistSans.className)}>#FF5200</p>
                  </div>
                  <p className={cn("ml-auto text-neutral-600 text-xs", geistSans.className)}>
                    Primary CTAs
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 border border-rausch-700 bg-rausch-600" />
                  <div>
                    <p className={cn("text-neutral-900 text-sm", geistSans.className)}>
                      rausch-600
                    </p>
                    <p className={cn("text-neutral-600 text-xs", geistSans.className)}>#E64A00</p>
                  </div>
                  <p className={cn("ml-auto text-neutral-600 text-xs", geistSans.className)}>
                    Links (WCAG AAA)
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 border border-rausch-800 bg-rausch-700" />
                  <div>
                    <p className={cn("text-neutral-900 text-sm", geistSans.className)}>
                      rausch-700
                    </p>
                    <p className={cn("text-neutral-600 text-xs", geistSans.className)}>#C84000</p>
                  </div>
                  <p className={cn("ml-auto text-neutral-600 text-xs", geistSans.className)}>
                    Active states
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Buttons Section */}
        <section>
          <h2
            className={cn(
              "mb-6 font-semibold text-3xl text-neutral-900 uppercase tracking-tight",
              geistSans.className
            )}
          >
            Buttons
          </h2>

          <div className="border border-neutral-200 bg-white p-8 shadow-sm ring-1 ring-black/5">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Primary Button */}
              <div>
                <p className="mb-4 text-neutral-600 text-xs uppercase tracking-wide">Primary CTA</p>
                <button
                  className={cn(
                    "bg-rausch-500 px-6 py-3 font-semibold text-white transition hover:bg-rausch-600 active:bg-rausch-700",
                    geistSans.className
                  )}
                  type="button"
                >
                  Book Now
                </button>
                <p className={cn("mt-2 text-neutral-600 text-sm", geistSans.className)}>
                  bg-rausch-500 hover:bg-rausch-600
                </p>
              </div>

              {/* Secondary Button */}
              <div>
                <p className="mb-4 text-neutral-600 text-xs uppercase tracking-wide">
                  Secondary Action
                </p>
                <button
                  className={cn(
                    "bg-neutral-100 px-6 py-3 font-semibold text-neutral-900 transition hover:bg-neutral-200",
                    geistSans.className
                  )}
                  type="button"
                >
                  Learn More
                </button>
                <p className={cn("mt-2 text-neutral-600 text-sm", geistSans.className)}>
                  bg-neutral-100 hover:bg-neutral-200
                </p>
              </div>

              {/* Outline Button */}
              <div>
                <p className="mb-4 text-neutral-600 text-xs uppercase tracking-wide">
                  Outline Button
                </p>
                <button
                  className={cn(
                    "border-2 border-neutral-200 bg-white px-6 py-3 font-semibold text-neutral-900 transition hover:border-rausch-500 hover:bg-rausch-50 hover:text-rausch-600",
                    geistSans.className
                  )}
                  type="button"
                >
                  View Services
                </button>
                <p className={cn("mt-2 text-neutral-600 text-sm", geistSans.className)}>
                  border-2 hover:border-rausch-500
                </p>
              </div>

              {/* Ghost Button */}
              <div>
                <p className="mb-4 text-neutral-600 text-xs uppercase tracking-wide">
                  Ghost Button
                </p>
                <button
                  className={cn(
                    "bg-transparent px-6 py-3 font-semibold text-neutral-900 transition hover:bg-rausch-50 hover:text-rausch-600",
                    geistSans.className
                  )}
                  type="button"
                >
                  Cancel
                </button>
                <p className={cn("mt-2 text-neutral-600 text-sm", geistSans.className)}>
                  bg-transparent hover:bg-rausch-50
                </p>
              </div>

              {/* Destructive Button */}
              <div>
                <p className="mb-4 text-neutral-600 text-xs uppercase tracking-wide">
                  Destructive Action
                </p>
                <button
                  className={cn(
                    "bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700",
                    geistSans.className
                  )}
                  type="button"
                >
                  Delete
                </button>
                <p className={cn("mt-2 text-neutral-600 text-sm", geistSans.className)}>
                  bg-red-600 hover:bg-red-700
                </p>
              </div>

              {/* Disabled Button */}
              <div>
                <p className="mb-4 text-neutral-600 text-xs uppercase tracking-wide">
                  Disabled State
                </p>
                <button
                  className={cn(
                    "cursor-not-allowed bg-neutral-200 px-6 py-3 font-semibold text-neutral-400",
                    geistSans.className
                  )}
                  disabled
                  type="button"
                >
                  Disabled
                </button>
                <p className={cn("mt-2 text-neutral-600 text-sm", geistSans.className)}>
                  bg-neutral-200 text-neutral-400
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Badges Section */}
        <section>
          <h2
            className={cn(
              "mb-6 font-semibold text-3xl text-neutral-900 uppercase tracking-tight",
              geistSans.className
            )}
          >
            Badges & Status Indicators
          </h2>

          <div className="border border-neutral-200 bg-white p-8 shadow-sm ring-1 ring-black/5">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Semantic Status Badges */}
              <div>
                <p className="mb-4 text-neutral-600 text-xs uppercase tracking-wide">
                  Semantic Colors
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="bg-green-600 px-3 py-1 font-medium text-white text-xs uppercase">
                    Active
                  </span>
                  <span className="bg-yellow-600 px-3 py-1 font-medium text-white text-xs uppercase">
                    Pending
                  </span>
                  <span className="bg-red-600 px-3 py-1 font-medium text-white text-xs uppercase">
                    Suspended
                  </span>
                  <span className="bg-babu-600 px-3 py-1 font-medium text-white text-xs uppercase">
                    Info
                  </span>
                </div>
              </div>

              {/* Neutral Badges */}
              <div>
                <p className="mb-4 text-neutral-600 text-xs uppercase tracking-wide">
                  Neutral Variants
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="bg-neutral-900 px-3 py-1 font-medium text-white text-xs uppercase">
                    Default
                  </span>
                  <span className="border border-neutral-200 bg-neutral-100 px-3 py-1 font-medium text-neutral-900 text-xs uppercase">
                    Outline
                  </span>
                  <span className="bg-rausch-500 px-3 py-1 font-medium text-white text-xs uppercase">
                    Featured
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cards Section */}
        <section>
          <h2
            className={cn(
              "mb-6 font-semibold text-3xl text-neutral-900 uppercase tracking-tight",
              geistSans.className
            )}
          >
            Cards & Data Containers
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Card */}
            <div className="border border-neutral-200 bg-white p-6 shadow-sm ring-1 ring-black/5">
              <h3
                className={cn(
                  "mb-2 font-semibold text-lg text-neutral-900 tracking-tight",
                  geistSans.className
                )}
              >
                Basic Card
              </h3>
              <p className={cn("text-neutral-700 text-sm leading-relaxed", geistSans.className)}>
                White background, neutral-200 border, sharp edges, minimal shadow with ring for
                depth.
              </p>
              <div className="mt-4 flex items-center gap-4">
                <span className="bg-green-600 px-3 py-1 font-medium text-white text-xs uppercase">
                  Active
                </span>
                <span className={cn("text-neutral-600 text-xs", geistSans.className)}>
                  Updated 2h ago
                </span>
              </div>
            </div>

            {/* Stat Card */}
            <div className="border border-neutral-200 bg-white p-6 shadow-sm ring-1 ring-black/5">
              <p className="mb-2 text-neutral-600 text-xs uppercase tracking-wide">
                Total Bookings
              </p>
              <p
                className={cn(
                  "mb-1 font-bold text-4xl text-neutral-900 tracking-tight",
                  geistSans.className
                )}
              >
                12,847
              </p>
              <p className={cn("text-green-600 text-sm", geistSans.className)}>
                ↑ 12.5% from last month
              </p>
            </div>
          </div>
        </section>

        {/* Data Table Section */}
        <section>
          <h2
            className={cn(
              "mb-6 font-semibold text-3xl text-neutral-900 uppercase tracking-tight",
              geistSans.className
            )}
          >
            Data Table
          </h2>

          <div className="border border-neutral-200 bg-white shadow-sm ring-1 ring-black/5">
            <table className="w-full">
              <thead className="border-neutral-200 border-b bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <span
                      className={cn(
                        "text-neutral-900 text-xs uppercase tracking-wide",
                        geistSans.className
                      )}
                    >
                      User ID
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span
                      className={cn(
                        "text-neutral-900 text-xs uppercase tracking-wide",
                        geistSans.className
                      )}
                    >
                      Name
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span
                      className={cn(
                        "text-neutral-900 text-xs uppercase tracking-wide",
                        geistSans.className
                      )}
                    >
                      Status
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span
                      className={cn(
                        "text-neutral-900 text-xs uppercase tracking-wide",
                        geistSans.className
                      )}
                    >
                      Revenue
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span
                      className={cn(
                        "text-neutral-900 text-xs uppercase tracking-wide",
                        geistSans.className
                      )}
                    >
                      Last Active
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-neutral-200 border-b transition hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <span className={cn("text-neutral-700 text-sm", geistSans.className)}>
                      USR-2025-001
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-neutral-900 text-sm", geistSans.className)}>
                      María García
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-green-600 px-3 py-1 font-medium text-white text-xs uppercase">
                      Active
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-neutral-900 text-sm", geistSans.className)}>
                      $125,000 COP
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-neutral-600 text-xs", geistSans.className)}>
                      Jan 15, 2025 · 10:30 AM
                    </span>
                  </td>
                </tr>

                <tr className="border-neutral-200 border-b transition hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <span className={cn("text-neutral-700 text-sm", geistSans.className)}>
                      USR-2025-002
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-neutral-900 text-sm", geistSans.className)}>
                      Carlos Rodríguez
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-yellow-600 px-3 py-1 font-medium text-white text-xs uppercase">
                      Pending
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-neutral-900 text-sm", geistSans.className)}>
                      $85,000 COP
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-neutral-600 text-xs", geistSans.className)}>
                      Jan 14, 2025 · 3:45 PM
                    </span>
                  </td>
                </tr>

                <tr className="border-neutral-200 border-b transition hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <span className={cn("text-neutral-700 text-sm", geistSans.className)}>
                      USR-2025-003
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-neutral-900 text-sm", geistSans.className)}>
                      Ana López
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-green-600 px-3 py-1 font-medium text-white text-xs uppercase">
                      Active
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-neutral-900 text-sm", geistSans.className)}>
                      $240,000 COP
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-neutral-600 text-xs", geistSans.className)}>
                      Jan 15, 2025 · 9:15 AM
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Spacing Scale Section */}
        <section>
          <h2
            className={cn(
              "mb-6 font-semibold text-3xl text-neutral-900 uppercase tracking-tight",
              geistSans.className
            )}
          >
            Spacing Scale (8px Base)
          </h2>

          <div className="border border-neutral-200 bg-white p-8 shadow-sm ring-1 ring-black/5">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 bg-rausch-500" style={{ width: "16px" }} />
                <span className={cn("text-neutral-700 text-sm", geistSans.className)}>
                  0.5 (4px)
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-12 bg-rausch-500" style={{ width: "32px" }} />
                <span className={cn("text-neutral-700 text-sm", geistSans.className)}>1 (8px)</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-12 bg-rausch-500" style={{ width: "48px" }} />
                <span className={cn("text-neutral-700 text-sm", geistSans.className)}>
                  1.5 (12px)
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-12 bg-rausch-500" style={{ width: "64px" }} />
                <span className={cn("text-neutral-700 text-sm", geistSans.className)}>
                  2 (16px)
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-12 bg-rausch-500" style={{ width: "96px" }} />
                <span className={cn("text-neutral-700 text-sm", geistSans.className)}>
                  3 (24px - Baseline)
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-12 bg-rausch-500" style={{ width: "128px" }} />
                <span className={cn("text-neutral-700 text-sm", geistSans.className)}>
                  4 (32px)
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-12 bg-rausch-500" style={{ width: "192px" }} />
                <span className={cn("text-neutral-700 text-sm", geistSans.className)}>
                  6 (48px)
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-12 bg-rausch-500" style={{ width: "256px" }} />
                <span className={cn("text-neutral-700 text-sm", geistSans.className)}>
                  8 (64px - Module)
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Design Principles */}
        <section className="border-neutral-200 border-t pt-8">
          <h2
            className={cn(
              "mb-6 font-semibold text-3xl text-neutral-900 uppercase tracking-tight",
              geistSans.className
            )}
          >
            Design Principles
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="border border-neutral-200 bg-white p-6 shadow-sm ring-1 ring-black/5">
              <h3
                className={cn(
                  "mb-3 font-semibold text-lg text-neutral-900 tracking-tight",
                  geistSans.className
                )}
              >
                Sharp Geometry
              </h3>
              <p className={cn("text-neutral-700 text-sm leading-relaxed", geistSans.className)}>
                Zero rounded corners. All components use sharp rectangular edges for Bloomberg
                Terminal-inspired precision.
              </p>
            </div>

            <div className="border border-neutral-200 bg-white p-6 shadow-sm ring-1 ring-black/5">
              <h3
                className={cn(
                  "mb-3 font-semibold text-lg text-neutral-900 tracking-tight",
                  geistSans.className
                )}
              >
                Geist Fonts Only
              </h3>
              <p className={cn("text-neutral-700 text-sm leading-relaxed", geistSans.className)}>
                Geist Sans for all UI text. Geist Mono for data, IDs, timestamps, and metrics. Zero
                exceptions.
              </p>
            </div>

            <div className="border border-neutral-200 bg-white p-6 shadow-sm ring-1 ring-black/5">
              <h3
                className={cn(
                  "mb-3 font-semibold text-lg text-neutral-900 tracking-tight",
                  geistSans.className
                )}
              >
                WCAG AAA
              </h3>
              <p className={cn("text-neutral-700 text-sm leading-relaxed", geistSans.className)}>
                All text/background combinations meet 7:1+ contrast ratio for maximum accessibility
                and professional clarity.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  ),
};
