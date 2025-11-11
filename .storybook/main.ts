import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],

  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-links',
    '@storybook/addon-themes',
  ],

  framework: {
    name: '@storybook/nextjs',
    options: {
      // Configure Next.js options
      builder: {
        useSWC: true, // Use SWC for faster builds
      },
    },
  },

  staticDirs: ['../public'],

  // Enable React Server Components support (experimental)
  features: {
    experimentalRSC: true,
  },

  // TypeScript configuration
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      // Should match your tsconfig
      compilerOptions: {
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
      },
      // Speed up by only processing story files
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      // Use a custom filter to avoid issues with large codebases
      propFilter: (prop) => {
        if (prop.parent) {
          return !prop.parent.fileName.includes('node_modules');
        }
        return true;
      },
    },
  },

  // Core configuration
  core: {
    disableTelemetry: true, // Disable telemetry if you prefer
    disableWhatsNewNotifications: true,
  },

  docs: {
    autodocs: 'tag',
  },
};

export default config;
