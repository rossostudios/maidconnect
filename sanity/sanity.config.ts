import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { presentationTool } from 'sanity/presentation';
import { documentInternationalization } from '@sanity/document-internationalization';
import { schemaTypes } from './schemas';
import { locate } from './presentation/locate';

// Supported languages
const supportedLanguages = [
  { id: 'en', title: 'English', isDefault: true },
  { id: 'es', title: 'Spanish' },
];

export default defineConfig({
  name: 'default',
  title: 'MaidConnect CMS',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',

  plugins: [
    structureTool(),
    visionTool(),
    presentationTool({
      resolve: {
        locations: locate,
      },
      previewUrl: {
        draftMode: {
          enable: '/api/draft',
        },
      },
    }),
    documentInternationalization({
      // Supported languages
      supportedLanguages,
      // Schema types to enable internationalization for
      schemaTypes: ['helpArticle', 'helpCategory', 'helpTag', 'changelog', 'roadmapItem', 'page', 'cityPage'],
      // Field name for language reference
      languageField: 'language',
    }),
  ],

  schema: {
    types: schemaTypes,
  },

  // Document actions configuration
  // TODO: Configure custom document actions for i18n types when needed
  // document: {
  //   actions: (prev, { schemaType }) => {
  //     const i18nSchemaTypes = ['helpArticle', 'helpCategory', 'helpTag', 'changelog', 'roadmapItem', 'page', 'cityPage'];
  //     return prev;
  //   },
  // },
});
