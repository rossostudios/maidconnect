/**
 * Swiss Grid System Showcase
 *
 * Demonstrates all Swiss Grid configurations and features.
 * Use this component as a reference for implementing the grid system
 * in your layouts following Josef Müller-Brockmann's principles.
 *
 * To view: Add this component to any page in development mode
 */

import { GridField, GridFieldThird, GridFieldTwoThirds } from "@/components/ui/grid-field";
import { SwissGrid10, SwissGrid12, SwissGrid13 } from "@/components/ui/swiss-grid";

export function SwissGridShowcase() {
  return (
    <div className="space-y-24 py-24">
      {/* Header */}
      <div className="container mx-auto px-6">
        <h1 className="mb-baseline-1 font-bold text-[48px] leading-[48px]">
          Swiss Grid System Showcase
        </h1>
        <p className="max-w-2xl text-[18px] text-neutral-600 leading-[24px]">
          Inspired by Josef Müller-Brockmann's "Grid Systems in Graphic Design". All typography is
          locked to the 24px baseline grid, and layouts follow the 64px module system for perfect
          mathematical precision.
        </p>
      </div>

      {/* 12-Column Grid: Standard, versatile */}
      <section>
        <div className="container mx-auto mb-baseline-1 px-6">
          <h2 className="mb-baseline-1 font-semibold text-[36px] leading-[48px]">12-Column Grid</h2>
          <p className="text-[16px] text-neutral-600 leading-[24px]">
            Standard grid with 24px gap and 24px margins. Most versatile configuration.
          </p>
        </div>

        <SwissGrid12>
          <GridFieldTwoThirds className="rounded-lg border border-neutral-200 bg-neutral-100 p-6">
            <h3 className="mb-baseline-1 font-semibold text-[24px] leading-[24px]">
              Main Content (8 columns)
            </h3>
            <p className="text-[16px] text-neutral-600 leading-[24px]">
              Primary content area spanning two-thirds of the grid width.
            </p>
          </GridFieldTwoThirds>

          <GridFieldThird className="rounded-lg border border-neutral-200 bg-neutral-50 p-6">
            <h4 className="mb-baseline-1 font-semibold text-[20px] leading-[24px]">
              Sidebar (4 columns)
            </h4>
            <p className="text-[14px] text-neutral-600 leading-[24px]">
              Sidebar content spanning one-third.
            </p>
          </GridFieldThird>

          <GridFieldThird className="rounded-lg border border-neutral-200 bg-neutral-50 p-6">
            <h4 className="mb-baseline-1 font-semibold text-[18px] leading-[24px]">
              Card 1 (4 cols)
            </h4>
            <p className="text-[14px] text-neutral-600 leading-[24px]">
              Grid field spanning 4 columns.
            </p>
          </GridFieldThird>

          <GridFieldThird className="rounded-lg border border-neutral-200 bg-neutral-100 p-6">
            <h4 className="mb-baseline-1 font-semibold text-[18px] leading-[24px]">
              Card 2 (4 cols)
            </h4>
            <p className="text-[14px] text-neutral-600 leading-[24px]">Another 4-column field.</p>
          </GridFieldThird>

          <GridFieldThird className="rounded-lg border border-neutral-200 bg-neutral-50 p-6">
            <h4 className="mb-baseline-1 font-semibold text-[18px] leading-[24px]">
              Card 3 (4 cols)
            </h4>
            <p className="text-[14px] text-neutral-600 leading-[24px]">Third 4-column field.</p>
          </GridFieldThird>
        </SwissGrid12>
      </section>

      {/* 10-Column Grid: Asymmetric balance */}
      <section>
        <div className="container mx-auto mb-baseline-1 px-6">
          <h2 className="mb-baseline-1 font-semibold text-[36px] leading-[48px]">10-Column Grid</h2>
          <p className="text-[16px] text-neutral-600 leading-[24px]">
            Asymmetric grid with 24px gap and 42px margins for unique layouts.
          </p>
        </div>

        <SwissGrid10>
          <GridField
            className="rounded-lg border border-neutral-200 bg-neutral-100 p-6"
            colSpan={6}
          >
            <h3 className="mb-baseline-1 font-semibold text-[24px] leading-[24px]">
              Hero Content (6 columns)
            </h3>
            <p className="text-[16px] text-neutral-600 leading-[24px]">
              Asymmetric layouts create visual interest and dynamic balance.
            </p>
          </GridField>

          <GridField className="rounded-lg border border-neutral-200 bg-neutral-50 p-6" colSpan={4}>
            <h4 className="mb-baseline-1 font-semibold text-[20px] leading-[24px]">
              Aside (4 columns)
            </h4>
            <p className="text-[14px] text-neutral-600 leading-[24px]">Supporting content area.</p>
          </GridField>

          <GridField className="rounded-lg border border-neutral-200 bg-neutral-50 p-6" colSpan={5}>
            <h4 className="mb-baseline-1 font-semibold text-[18px] leading-[24px]">
              Feature A (5 cols)
            </h4>
            <p className="text-[14px] text-neutral-600 leading-[24px]">Half of 10-column grid.</p>
          </GridField>

          <GridField
            className="rounded-lg border border-neutral-200 bg-neutral-100 p-6"
            colSpan={5}
          >
            <h4 className="mb-baseline-1 font-semibold text-[18px] leading-[24px]">
              Feature B (5 cols)
            </h4>
            <p className="text-[14px] text-neutral-600 leading-[24px]">Perfect symmetry.</p>
          </GridField>
        </SwissGrid10>
      </section>

      {/* 13-Column Grid: Dynamic tension */}
      <section>
        <div className="container mx-auto mb-baseline-1 px-6">
          <h2 className="mb-baseline-1 font-semibold text-[36px] leading-[48px]">13-Column Grid</h2>
          <p className="text-[16px] text-neutral-600 leading-[24px]">
            Experimental grid with 16px gap and 32px margins for dynamic tension.
          </p>
        </div>

        <SwissGrid13>
          <GridField
            className="rounded-lg border border-neutral-200 bg-neutral-100 p-6"
            colSpan={8}
          >
            <h3 className="mb-baseline-1 font-semibold text-[24px] leading-[24px]">
              Dominant Content (8 columns)
            </h3>
            <p className="text-[16px] text-neutral-600 leading-[24px]">
              The 13-column grid creates slight imbalance for visual interest.
            </p>
          </GridField>

          <GridField className="rounded-lg border border-neutral-200 bg-neutral-50 p-6" colSpan={5}>
            <h4 className="mb-baseline-1 font-semibold text-[20px] leading-[24px]">
              Secondary (5 columns)
            </h4>
            <p className="text-[14px] text-neutral-600 leading-[24px]">Asymmetric complement.</p>
          </GridField>
        </SwissGrid13>
      </section>

      {/* Module Heights Example */}
      <section>
        <div className="container mx-auto mb-baseline-1 px-6">
          <h2 className="mb-baseline-1 font-semibold text-[36px] leading-[48px]">
            Module-Based Heights
          </h2>
          <p className="text-[16px] text-neutral-600 leading-[24px]">
            Content heights follow 64px module units for vertical rhythm.
          </p>
        </div>

        <SwissGrid12>
          <GridField
            className="h-module-2 rounded-lg border border-neutral-200 bg-neutral-100 p-6"
            colSpan={3}
          >
            <h4 className="mb-baseline-1 font-semibold text-[18px] leading-[24px]">2 Modules</h4>
            <p className="text-[14px] text-neutral-600 leading-[24px]">128px tall</p>
          </GridField>

          <GridField
            className="h-module-3 rounded-lg border border-neutral-200 bg-neutral-50 p-6"
            colSpan={3}
          >
            <h4 className="mb-baseline-1 font-semibold text-[18px] leading-[24px]">3 Modules</h4>
            <p className="text-[14px] text-neutral-600 leading-[24px]">192px tall</p>
          </GridField>

          <GridField
            className="h-module-4 rounded-lg border border-neutral-200 bg-neutral-100 p-6"
            colSpan={3}
          >
            <h4 className="mb-baseline-1 font-semibold text-[18px] leading-[24px]">4 Modules</h4>
            <p className="text-[14px] text-neutral-600 leading-[24px]">256px tall</p>
          </GridField>

          <GridField
            className="h-module-2 rounded-lg border border-neutral-200 bg-neutral-50 p-6"
            colSpan={3}
          >
            <h4 className="mb-baseline-1 font-semibold text-[18px] leading-[24px]">2 Modules</h4>
            <p className="text-[14px] text-neutral-600 leading-[24px]">128px tall</p>
          </GridField>
        </SwissGrid12>
      </section>

      {/* Baseline Typography Example */}
      <section className="container mx-auto px-6">
        <h2 className="mb-baseline-2 font-semibold text-[36px] leading-[48px]">
          Baseline-Aligned Typography
        </h2>

        <div className="max-w-3xl space-y-baseline-1 rounded-lg border border-neutral-200 bg-neutral-50 p-8">
          <h3 className="mb-baseline-1 font-semibold text-[28px] leading-[48px]">
            Heading 3 (28px / 48px line-height)
          </h3>

          <p className="text-[16px] leading-[24px]">
            All text in Casaora aligns to the 24px baseline grid. This creates perfect vertical
            rhythm across the entire application. Notice how every line of text, regardless of size,
            aligns to invisible horizontal lines spaced 24 pixels apart.
          </p>

          <p className="text-[16px] leading-[24px]">
            This typographic system is inspired by Josef Müller-Brockmann's Swiss design principles,
            ensuring mathematical precision and visual harmony. The baseline grid is the foundation
            of excellent typography.
          </p>

          <h4 className="mb-baseline-1 font-semibold text-[20px] leading-[24px]">
            Heading 4 (20px / 24px line-height)
          </h4>

          <p className="text-[14px] text-neutral-600 leading-[24px]">
            Even smaller text maintains baseline alignment. Press{" "}
            <kbd className="rounded border border-neutral-300 bg-white px-2 py-1 text-xs">
              Cmd/Ctrl + Shift + G
            </kbd>{" "}
            to toggle the baseline grid overlay and see how every line aligns perfectly.
          </p>
        </div>
      </section>

      {/* Usage Instructions */}
      <section className="container mx-auto px-6">
        <div className="rounded-lg bg-neutral-900 p-8 text-white">
          <h2 className="mb-baseline-1 font-semibold text-[28px] leading-[48px]">
            How to Use the Swiss Grid System
          </h2>

          <div className="space-y-baseline-1">
            <div>
              <h3 className="mb-baseline-1 font-semibold text-[20px] text-neutral-100 leading-[24px]">
                1. Import Components
              </h3>
              <code className="block rounded bg-neutral-800 p-4 text-sm">
                import &#123; SwissGrid, GridField &#125; from '@/components/ui/swiss-grid';
              </code>
            </div>

            <div>
              <h3 className="mb-baseline-1 font-semibold text-[20px] text-neutral-100 leading-[24px]">
                2. Create Grid Layout
              </h3>
              <code className="block whitespace-pre rounded bg-neutral-800 p-4 text-sm">
                {`<SwissGrid columns={12} gap={24} margin={24}>
  <GridField colSpan={8}>Content</GridField>
  <GridField colSpan={4}>Sidebar</GridField>
</SwissGrid>`}
              </code>
            </div>

            <div>
              <h3 className="mb-baseline-1 font-semibold text-[20px] text-neutral-100 leading-[24px]">
                3. Use Baseline Typography
              </h3>
              <code className="block whitespace-pre rounded bg-neutral-800 p-4 text-sm">
                {`<h1 className="text-[48px] leading-[48px] mb-baseline-2">
  Heading (locked to 48px baseline)
</h1>`}
              </code>
            </div>

            <div>
              <h3 className="mb-baseline-1 font-semibold text-[20px] text-neutral-100 leading-[24px]">
                4. Debug with Baseline Grid
              </h3>
              <p className="text-[16px] text-neutral-300 leading-[24px]">
                Press{" "}
                <kbd className="rounded bg-neutral-700 px-2 py-1 text-xs">Cmd/Ctrl + Shift + G</kbd>{" "}
                to toggle the red baseline grid overlay and verify your typography alignment.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
