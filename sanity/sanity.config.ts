import { codeInput } from "@sanity/code-input";
import { documentInternationalization } from "@sanity/document-internationalization";
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";
import { locate } from "./presentation/locate";
import { schemaTypes } from "./schemas";

// Supported languages
const supportedLanguages = [
  { id: "en", title: "English", isDefault: true },
  { id: "es", title: "Spanish" },
];

export default defineConfig({
  name: "default",
  title: "Casaora CMS",

  projectId: "7j0vrfmg",
  dataset: "production",

  plugins: [
    structureTool(),
    visionTool(),
    codeInput(),
    presentationTool({
      resolve: {
        locations: locate,
      },
      previewUrl: {
        draftMode: {
          enable: "/api/draft",
        },
      },
    }),
    documentInternationalization({
      // Supported languages
      supportedLanguages,
      // Schema types to enable internationalization for
      schemaTypes: [
        "helpArticle",
        "helpCategory",
        "helpTag",
        "changelog",
        "roadmapItem",
        "page",
        "cityPage",
        "blogCategory",
        "blogPost",
      ],
      // Field name for language reference
      languageField: "language",
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
