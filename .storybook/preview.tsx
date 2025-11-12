import { withThemeByDataAttribute } from "@storybook/addon-themes";
import type { Preview } from "@storybook/react";
import { NextIntlClientProvider } from "next-intl";

// Import global styles (includes Tailwind CSS 4)
import "../src/app/globals.css";

// Import English messages for Storybook
import enMessages from "../messages/en.json";

const preview: Preview = {
  parameters: {
    // Configure Next.js features
    nextjs: {
      appDirectory: true, // Enable App Router support
      navigation: {
        pathname: "/en", // Default locale path
      },
    },
    // Configure controls
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Configure actions
    actions: { argTypesRegex: "^on[A-Z].*" },
    // Layout options - centered by default
    layout: "centered",
    // Configure backgrounds - WHITE background like reference dashboard
    backgrounds: {
      default: "white",
      values: [
        {
          name: "white",
          value: "#ffffff",
        },
        {
          name: "light-grey",
          value: "#f5f5f5",
        },
        {
          name: "dark",
          value: "#161616",
        },
      ],
    },
  },

  decorators: [
    // Tailwind dark mode support
    withThemeByDataAttribute({
      themes: {
        light: "light",
        dark: "dark",
      },
      defaultTheme: "light",
      attributeName: "data-mode",
    }),
    // next-intl provider
    (Story) => (
      <NextIntlClientProvider locale="en" messages={enMessages} timeZone="America/Bogota">
        <Story />
      </NextIntlClientProvider>
    ),
  ],
};

export default preview;
