import { defineType, defineField } from "sanity";

/**
 * Market Content Schema
 *
 * Allows ops and marketing to create country/city-specific content
 * without touching code. Each market can have custom messaging for:
 * - Hero sections
 * - Trust badges
 * - Service descriptions
 * - Localized copy
 *
 * Usage:
 * - Create content for specific markets (e.g., CO/medellin, PY/asuncion)
 * - Frontend queries by country code and optional city slug
 * - Falls back to country-level content if city-specific not found
 */
export default defineType({
  name: "marketContent",
  title: "Market Content",
  type: "document",
  icon: () => "🌎",
  fields: [
    defineField({
      name: "title",
      title: "Internal Title",
      type: "string",
      description: "Internal reference (e.g., 'Medellín Hero Content')",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "market",
      title: "Market",
      type: "object",
      description: "Target market for this content",
      validation: (Rule) => Rule.required(),
      fields: [
        {
          name: "country",
          title: "Country",
          type: "string",
          description: "ISO country code",
          options: {
            list: [
              { title: "Colombia", value: "CO" },
              { title: "Paraguay", value: "PY" },
              { title: "Uruguay", value: "UY" },
              { title: "Argentina", value: "AR" },
            ],
          },
          validation: (Rule) => Rule.required(),
        },
        {
          name: "city",
          title: "City (Optional)",
          type: "string",
          description: "City slug (e.g., 'medellin', 'bogota'). Leave empty for country-wide content.",
        },
      ],
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "object",
      description: "Market-specific content sections",
      fields: [
        {
          name: "hero",
          title: "Hero Section",
          type: "object",
          fields: [
            {
              name: "ribbon",
              title: "Ribbon Text",
              type: "object",
              fields: [
                {
                  name: "en",
                  title: "English",
                  type: "string",
                  description: "E.g., 'Medellín's boutique household staffing agency'",
                },
                {
                  name: "es",
                  title: "Spanish",
                  type: "string",
                  description: "E.g., 'La agencia boutique de personal doméstico de Medellín'",
                },
              ],
            },
            {
              name: "title",
              title: "Hero Title",
              type: "object",
              fields: [
                {
                  name: "en",
                  title: "English",
                  type: "text",
                  rows: 2,
                  description: "E.g., 'Hire trusted nannies, housekeepers & private staff in Medellín'",
                },
                {
                  name: "es",
                  title: "Spanish",
                  type: "text",
                  rows: 2,
                  description: "E.g., 'Contrata niñeras, empleadas del hogar y personal privado de confianza en Medellín'",
                },
              ],
            },
            {
              name: "subtitle",
              title: "Hero Subtitle",
              type: "object",
              fields: [
                {
                  name: "en",
                  title: "English",
                  type: "text",
                  rows: 3,
                },
                {
                  name: "es",
                  title: "Spanish",
                  type: "text",
                  rows: 3,
                },
              ],
            },
            {
              name: "trustBadge",
              title: "Trust Badge",
              type: "object",
              fields: [
                {
                  name: "en",
                  title: "English",
                  type: "string",
                  description: "E.g., 'Trusted in El Poblado, Laureles & Envigado'",
                },
                {
                  name: "es",
                  title: "Spanish",
                  type: "string",
                  description: "E.g., 'De confianza en El Poblado, Laureles y Envigado'",
                },
              ],
            },
          ],
        },
        {
          name: "services",
          title: "Service Descriptions (Optional)",
          type: "object",
          description: "Market-specific service messaging",
          fields: [
            {
              name: "cleaning",
              title: "Cleaning Service",
              type: "object",
              fields: [
                {
                  name: "en",
                  title: "English",
                  type: "text",
                  rows: 2,
                },
                {
                  name: "es",
                  title: "Spanish",
                  type: "text",
                  rows: 2,
                },
              ],
            },
            {
              name: "nanny",
              title: "Nanny Service",
              type: "object",
              fields: [
                {
                  name: "en",
                  title: "English",
                  type: "text",
                  rows: 2,
                },
                {
                  name: "es",
                  title: "Spanish",
                  type: "text",
                  rows: 2,
                },
              ],
            },
            {
              name: "chef",
              title: "Chef Service",
              type: "object",
              fields: [
                {
                  name: "en",
                  title: "English",
                  type: "text",
                  rows: 2,
                },
                {
                  name: "es",
                  title: "Spanish",
                  type: "text",
                  rows: 2,
                },
              ],
            },
          ],
        },
        {
          name: "seo",
          title: "SEO (Optional)",
          type: "object",
          fields: [
            {
              name: "metaTitle",
              title: "Meta Title",
              type: "object",
              fields: [
                {
                  name: "en",
                  title: "English",
                  type: "string",
                },
                {
                  name: "es",
                  title: "Spanish",
                  type: "string",
                },
              ],
            },
            {
              name: "metaDescription",
              title: "Meta Description",
              type: "object",
              fields: [
                {
                  name: "en",
                  title: "English",
                  type: "text",
                  rows: 2,
                },
                {
                  name: "es",
                  title: "Spanish",
                  type: "text",
                  rows: 2,
                },
              ],
            },
          ],
        },
      ],
    }),
    defineField({
      name: "isActive",
      title: "Active",
      type: "boolean",
      description: "Toggle to enable/disable this market content",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "title",
      country: "market.country",
      city: "market.city",
      isActive: "isActive",
    },
    prepare({ title, country, city, isActive }) {
      const subtitle = city ? `${country} · ${city}` : country;
      const status = isActive ? "🟢" : "🔴";
      return {
        title: `${status} ${title}`,
        subtitle,
      };
    },
  },
  orderings: [
    {
      title: "Country, A-Z",
      name: "countryAsc",
      by: [{ field: "market.country", direction: "asc" }],
    },
    {
      title: "City, A-Z",
      name: "cityAsc",
      by: [
        { field: "market.country", direction: "asc" },
        { field: "market.city", direction: "asc" },
      ],
    },
  ],
});
