"use client";

import { useTranslations } from "next-intl";
import {
  ComparisonTable,
  ComparisonTableBody,
  ComparisonTableCell,
  ComparisonTableHeader,
  ComparisonTableHeaderCell,
  ComparisonTableRow,
} from "@/components/ui/ComparisonTable";
import { Container } from "@/components/ui/container";

export function PricingComparison() {
  const t = useTranslations("pricing.comparison");

  return (
    <section className="bg-stone-50 py-20 sm:py-24 lg:py-32">
      <Container className="max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="serif-display-lg mb-4 text-stone-900">{t("title")}</h2>
          <p className="lead text-stone-700">{t("subtitle")}</p>
        </div>

        <ComparisonTable>
          <ComparisonTableHeader>
            <ComparisonTableHeaderCell>Feature</ComparisonTableHeaderCell>
            <ComparisonTableHeaderCell>Basic</ComparisonTableHeaderCell>
            <ComparisonTableHeaderCell featured>Premium</ComparisonTableHeaderCell>
          </ComparisonTableHeader>

          <ComparisonTableBody>
            <ComparisonTableRow category="Core Features" />
            <ComparisonTableRow>
              <ComparisonTableCell.Feature>Monthly bookings</ComparisonTableCell.Feature>
              <ComparisonTableCell type="text" value="Up to 50" />
              <ComparisonTableCell featured type="text" value="Unlimited" />
            </ComparisonTableRow>
            <ComparisonTableRow>
              <ComparisonTableCell.Feature>Calendar connections</ComparisonTableCell.Feature>
              <ComparisonTableCell type="text" value="3" />
              <ComparisonTableCell featured type="text" value="Unlimited" />
            </ComparisonTableRow>
            <ComparisonTableRow>
              <ComparisonTableCell.Feature>Team members</ComparisonTableCell.Feature>
              <ComparisonTableCell type="text" value="1" />
              <ComparisonTableCell featured type="text" value="Unlimited" />
            </ComparisonTableRow>
            <ComparisonTableRow>
              <ComparisonTableCell.Feature>Payment processing</ComparisonTableCell.Feature>
              <ComparisonTableCell type="check" />
              <ComparisonTableCell featured type="check" />
            </ComparisonTableRow>

            <ComparisonTableRow category="Branding & Customization" />
            <ComparisonTableRow>
              <ComparisonTableCell.Feature>Custom colors & logo</ComparisonTableCell.Feature>
              <ComparisonTableCell type="check" />
              <ComparisonTableCell featured type="check" />
            </ComparisonTableRow>
            <ComparisonTableRow>
              <ComparisonTableCell.Feature>Custom domain</ComparisonTableCell.Feature>
              <ComparisonTableCell type="x" />
              <ComparisonTableCell featured type="check" />
            </ComparisonTableRow>

            <ComparisonTableRow category="Advanced Features" />
            <ComparisonTableRow>
              <ComparisonTableCell.Feature>Priority support</ComparisonTableCell.Feature>
              <ComparisonTableCell type="x" />
              <ComparisonTableCell featured type="check" />
            </ComparisonTableRow>
            <ComparisonTableRow>
              <ComparisonTableCell.Feature>Advanced analytics</ComparisonTableCell.Feature>
              <ComparisonTableCell type="x" />
              <ComparisonTableCell featured type="check" />
            </ComparisonTableRow>
          </ComparisonTableBody>
        </ComparisonTable>

        <div className="mt-12 text-center">
          <p className="text-base text-stone-700">
            Not sure which plan is right for you?{" "}
            <a className="font-semibold text-stone-900 hover:text-stone-700" href="/contact">
              Contact us
            </a>{" "}
            and we'll help you choose.
          </p>
        </div>
      </Container>
    </section>
  );
}
