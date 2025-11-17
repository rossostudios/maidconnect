import { describe, expect, it } from "vitest";
import { blocksToMarkdown, getBlockPlaceholder, markdownToBlocks } from "../blockEditor";
import type { EditorBlock } from "@/types/blockEditor";

// Use deterministic IDs for testing
const parseOptions = { deterministic: true, seed: "test" };

// ============================================================================
// MARKDOWN TO BLOCKS
// ============================================================================

describe("markdownToBlocks", () => {
  describe("paragraphs", () => {
    it("parses single paragraph", () => {
      const markdown = "This is a paragraph";
      const blocks = markdownToBlocks(markdown, parseOptions);

      expect(blocks.length).toBe(1);
      expect(blocks[0].type).toBe("paragraph");
      expect(blocks[0].content).toBe("This is a paragraph");
    });

    it("parses multiple paragraphs separated by empty lines", () => {
      const markdown = "First paragraph\n\nSecond paragraph";
      const blocks = markdownToBlocks(markdown, parseOptions);

      expect(blocks.length).toBe(2);
      expect(blocks[0].type).toBe("paragraph");
      expect(blocks[0].content).toBe("First paragraph");
      expect(blocks[1].type).toBe("paragraph");
      expect(blocks[1].content).toBe("Second paragraph");
    });

    it("returns single empty paragraph for empty string", () => {
      const blocks = markdownToBlocks("", parseOptions);

      expect(blocks.length).toBe(1);
      expect(blocks[0].type).toBe("paragraph");
      expect(blocks[0].content).toBe("");
    });
  });

  describe("headings", () => {
    it("parses heading 1", () => {
      const markdown = "# Main Title";
      const blocks = markdownToBlocks(markdown, parseOptions);

      expect(blocks.length).toBe(1);
      expect(blocks[0].type).toBe("heading1");
      expect(blocks[0].content).toBe("Main Title");
    });

    it("parses heading 2", () => {
      const markdown = "## Section Title";
      const blocks = markdownToBlocks(markdown, parseOptions);

      expect(blocks.length).toBe(1);
      expect(blocks[0].type).toBe("heading2");
      expect(blocks[0].content).toBe("Section Title");
    });

    it("parses heading 3", () => {
      const markdown = "### Subsection";
      const blocks = markdownToBlocks(markdown, parseOptions);

      expect(blocks.length).toBe(1);
      expect(blocks[0].type).toBe("heading3");
      expect(blocks[0].content).toBe("Subsection");
    });

    it("parses mixed heading levels", () => {
      const markdown = "# H1\n\n## H2\n\n### H3";
      const blocks = markdownToBlocks(markdown, parseOptions);

      expect(blocks.length).toBe(3);
      expect(blocks[0].type).toBe("heading1");
      expect(blocks[1].type).toBe("heading2");
      expect(blocks[2].type).toBe("heading3");
    });
  });

  describe("lists", () => {
    it("parses bullet list with dash", () => {
      const markdown = "- Item 1\n- Item 2\n- Item 3";
      const blocks = markdownToBlocks(markdown, parseOptions);

      expect(blocks.length).toBe(1);
      expect(blocks[0].type).toBe("bulletList");
      expect(blocks[0].metadata?.listItems).toEqual(["Item 1", "Item 2", "Item 3"]);
    });

    it("parses bullet list with asterisk", () => {
      const markdown = "* Item 1\n* Item 2";
      const blocks = markdownToBlocks(markdown, parseOptions);

      expect(blocks.length).toBe(1);
      expect(blocks[0].type).toBe("bulletList");
      expect(blocks[0].metadata?.listItems).toEqual(["Item 1", "Item 2"]);
    });

    it("parses ordered list", () => {
      const markdown = "1. First\n2. Second\n3. Third";
      const blocks = markdownToBlocks(markdown, parseOptions);

      expect(blocks.length).toBe(1);
      expect(blocks[0].type).toBe("orderedList");
      expect(blocks[0].metadata?.listItems).toEqual(["First", "Second", "Third"]);
    });

    it("separates lists with empty lines", () => {
      const markdown = "- List 1 Item 1\n- List 1 Item 2\n\n- List 2 Item 1";
      const blocks = markdownToBlocks(markdown, parseOptions);

      expect(blocks.length).toBe(2);
      expect(blocks[0].type).toBe("bulletList");
      expect(blocks[0].metadata?.listItems).toHaveLength(2);
      expect(blocks[1].type).toBe("bulletList");
      expect(blocks[1].metadata?.listItems).toHaveLength(1);
    });
  });

  describe("code blocks", () => {
    it("parses code block with language", () => {
      const markdown = "```typescript\nconst x = 42;\n```";
      const blocks = markdownToBlocks(markdown, parseOptions);

      expect(blocks.length).toBe(1);
      expect(blocks[0].type).toBe("code");
      expect(blocks[0].content).toBe("const x = 42;");
      expect(blocks[0].metadata?.language).toBe("typescript");
    });

    it("parses code block without language (defaults to plaintext)", () => {
      const markdown = "```\nconst x = 42;\n```";
      const blocks = markdownToBlocks(markdown, parseOptions);

      expect(blocks.length).toBe(1);
      expect(blocks[0].type).toBe("code");
      expect(blocks[0].metadata?.language).toBe("plaintext");
    });

    it("parses multi-line code block", () => {
      const markdown = "```javascript\nfunction test() {\n  return 42;\n}\n```";
      const blocks = markdownToBlocks(markdown, parseOptions);

      expect(blocks.length).toBe(1);
      expect(blocks[0].type).toBe("code");
      expect(blocks[0].content).toBe("function test() {\n  return 42;\n}");
    });
  });

  describe("checkboxes", () => {
    it("parses unchecked checkbox with dash", () => {
      const markdown = "- [ ] Unchecked task";
      const blocks = markdownToBlocks(markdown, parseOptions);

      expect(blocks.length).toBe(1);
      expect(blocks[0].type).toBe("checkbox");
      expect(blocks[0].content).toBe("Unchecked task");
      expect(blocks[0].metadata?.checked).toBe(false);
    });

    it("parses checked checkbox with lowercase x", () => {
      const markdown = "- [x] Checked task";
      const blocks = markdownToBlocks(markdown, parseOptions);

      expect(blocks.length).toBe(1);
      expect(blocks[0].type).toBe("checkbox");
      expect(blocks[0].content).toBe("Checked task");
      expect(blocks[0].metadata?.checked).toBe(true);
    });

    it("parses checked checkbox with uppercase X", () => {
      const markdown = "- [X] Checked task";
      const blocks = markdownToBlocks(markdown, parseOptions);

      expect(blocks.length).toBe(1);
      expect(blocks[0].metadata?.checked).toBe(true);
    });

    it("parses multiple checkboxes", () => {
      const markdown = "- [ ] Task 1\n- [x] Task 2\n- [ ] Task 3";
      const blocks = markdownToBlocks(markdown, parseOptions);

      expect(blocks.length).toBe(3);
      expect(blocks[0].metadata?.checked).toBe(false);
      expect(blocks[1].metadata?.checked).toBe(true);
      expect(blocks[2].metadata?.checked).toBe(false);
    });
  });

  describe("callouts", () => {
    it("parses info callout with emoji", () => {
      const markdown = "> 💡 This is a tip";
      const blocks = markdownToBlocks(markdown, parseOptions);

      expect(blocks.length).toBe(1);
      expect(blocks[0].type).toBe("callout");
      expect(blocks[0].content).toBe("This is a tip");
      expect(blocks[0].metadata?.calloutType).toBe("info");
    });

    it("parses warning callout with emoji", () => {
      const markdown = "> ⚠️ This is a warning";
      const blocks = markdownToBlocks(markdown, parseOptions);

      expect(blocks[0].metadata?.calloutType).toBe("warning");
      expect(blocks[0].content).toBe("This is a warning");
    });

    it("parses success callout with emoji", () => {
      const markdown = "> ✅ This is success";
      const blocks = markdownToBlocks(markdown, parseOptions);

      expect(blocks[0].metadata?.calloutType).toBe("success");
      expect(blocks[0].content).toBe("This is success");
    });

    it("parses error callout with emoji", () => {
      const markdown = "> ❌ This is an error";
      const blocks = markdownToBlocks(markdown, parseOptions);

      expect(blocks[0].metadata?.calloutType).toBe("error");
      expect(blocks[0].content).toBe("This is an error");
    });

    it("parses callout with keyword instead of emoji", () => {
      const markdown = "> tip: This is a helpful tip";
      const blocks = markdownToBlocks(markdown, parseOptions);

      expect(blocks[0].metadata?.calloutType).toBe("info");
      expect(blocks[0].content).toBe("This is a helpful tip");
    });

    it("defaults to info callout for plain blockquote", () => {
      const markdown = "> This is a plain quote";
      const blocks = markdownToBlocks(markdown, parseOptions);

      expect(blocks[0].type).toBe("callout");
      expect(blocks[0].metadata?.calloutType).toBe("info");
    });
  });

  describe("images", () => {
    it("parses image with caption and URL", () => {
      const markdown = "![Beautiful sunset](https://example.com/sunset.jpg)";
      const blocks = markdownToBlocks(markdown, parseOptions);

      expect(blocks.length).toBe(1);
      expect(blocks[0].type).toBe("image");
      expect(blocks[0].content).toBe("Beautiful sunset");
      expect(blocks[0].metadata?.imageUrl).toBe("https://example.com/sunset.jpg");
      expect(blocks[0].metadata?.caption).toBe("Beautiful sunset");
    });

    it("parses image without caption", () => {
      const markdown = "![](https://example.com/image.jpg)";
      const blocks = markdownToBlocks(markdown, parseOptions);

      expect(blocks.length).toBe(1);
      expect(blocks[0].type).toBe("image");
      expect(blocks[0].content).toBe("");
      expect(blocks[0].metadata?.imageUrl).toBe("https://example.com/image.jpg");
    });
  });

  describe("dividers", () => {
    it("parses three dashes as divider", () => {
      const markdown = "---";
      const blocks = markdownToBlocks(markdown, parseOptions);

      expect(blocks.length).toBe(1);
      expect(blocks[0].type).toBe("divider");
      expect(blocks[0].content).toBe("");
    });

    it("parses three asterisks as divider", () => {
      const markdown = "***";
      const blocks = markdownToBlocks(markdown, parseOptions);

      expect(blocks[0].type).toBe("divider");
    });

    it("parses article-separator as divider", () => {
      const markdown = '<hr class="article-separator" />';
      const blocks = markdownToBlocks(markdown, parseOptions);

      expect(blocks[0].type).toBe("divider");
    });
  });

  describe("complex documents", () => {
    it("parses mixed content types", () => {
      const markdown = `# Title

This is a paragraph.

## Section

- Item 1
- Item 2

> 💡 This is a tip

\`\`\`javascript
console.log('Hello');
\`\`\`

![Image](url.jpg)

---`;

      const blocks = markdownToBlocks(markdown, parseOptions);

      expect(blocks.length).toBe(8);
      expect(blocks[0].type).toBe("heading1");
      expect(blocks[1].type).toBe("paragraph");
      expect(blocks[2].type).toBe("heading2");
      expect(blocks[3].type).toBe("bulletList");
      expect(blocks[4].type).toBe("callout");
      expect(blocks[5].type).toBe("code");
      expect(blocks[6].type).toBe("image");
      expect(blocks[7].type).toBe("divider");
    });
  });

  describe("deterministic vs non-deterministic IDs", () => {
    it("generates deterministic IDs when option is true", () => {
      const markdown = "# Title\n\nParagraph";
      const blocks1 = markdownToBlocks(markdown, { deterministic: true, seed: "test" });
      const blocks2 = markdownToBlocks(markdown, { deterministic: true, seed: "test" });

      expect(blocks1[0].id).toBe(blocks2[0].id);
      expect(blocks1[1].id).toBe(blocks2[1].id);
    });

    it("generates different IDs with different seeds", () => {
      const markdown = "# Title";
      const blocks1 = markdownToBlocks(markdown, { deterministic: true, seed: "seed1" });
      const blocks2 = markdownToBlocks(markdown, { deterministic: true, seed: "seed2" });

      expect(blocks1[0].id).not.toBe(blocks2[0].id);
    });
  });
});

// ============================================================================
// BLOCKS TO MARKDOWN
// ============================================================================

describe("blocksToMarkdown", () => {
  describe("paragraphs", () => {
    it("converts paragraph block to markdown", () => {
      const blocks: EditorBlock[] = [{ id: "1", type: "paragraph", content: "Hello world" }];
      const markdown = blocksToMarkdown(blocks);

      expect(markdown).toBe("Hello world");
    });

    it("converts multiple paragraphs with double newline", () => {
      const blocks: EditorBlock[] = [
        { id: "1", type: "paragraph", content: "First" },
        { id: "2", type: "paragraph", content: "Second" },
      ];
      const markdown = blocksToMarkdown(blocks);

      expect(markdown).toBe("First\n\nSecond");
    });
  });

  describe("headings", () => {
    it("converts heading1 to markdown", () => {
      const blocks: EditorBlock[] = [{ id: "1", type: "heading1", content: "Title" }];
      const markdown = blocksToMarkdown(blocks);

      expect(markdown).toBe("# Title");
    });

    it("converts heading2 to markdown", () => {
      const blocks: EditorBlock[] = [{ id: "1", type: "heading2", content: "Section" }];
      const markdown = blocksToMarkdown(blocks);

      expect(markdown).toBe("## Section");
    });

    it("converts heading3 to markdown", () => {
      const blocks: EditorBlock[] = [{ id: "1", type: "heading3", content: "Subsection" }];
      const markdown = blocksToMarkdown(blocks);

      expect(markdown).toBe("### Subsection");
    });
  });

  describe("lists", () => {
    it("converts bullet list to markdown", () => {
      const blocks: EditorBlock[] = [
        {
          id: "1",
          type: "bulletList",
          content: "",
          metadata: { listItems: ["Item 1", "Item 2", "Item 3"] },
        },
      ];
      const markdown = blocksToMarkdown(blocks);

      expect(markdown).toBe("- Item 1\n- Item 2\n- Item 3");
    });

    it("converts ordered list to markdown", () => {
      const blocks: EditorBlock[] = [
        {
          id: "1",
          type: "orderedList",
          content: "",
          metadata: { listItems: ["First", "Second", "Third"] },
        },
      ];
      const markdown = blocksToMarkdown(blocks);

      expect(markdown).toBe("1. First\n2. Second\n3. Third");
    });

    it("handles empty list items", () => {
      const blocks: EditorBlock[] = [
        { id: "1", type: "bulletList", content: "", metadata: { listItems: [] } },
      ];
      const markdown = blocksToMarkdown(blocks);

      expect(markdown).toBe("");
    });
  });

  describe("code blocks", () => {
    it("converts code block with language", () => {
      const blocks: EditorBlock[] = [
        {
          id: "1",
          type: "code",
          content: "const x = 42;",
          metadata: { language: "javascript" },
        },
      ];
      const markdown = blocksToMarkdown(blocks);

      expect(markdown).toBe("```javascript\nconst x = 42;\n```");
    });

    it("defaults to plaintext when no language specified", () => {
      const blocks: EditorBlock[] = [{ id: "1", type: "code", content: "code here" }];
      const markdown = blocksToMarkdown(blocks);

      expect(markdown).toBe("```plaintext\ncode here\n```");
    });
  });

  describe("checkboxes", () => {
    it("converts unchecked checkbox", () => {
      const blocks: EditorBlock[] = [
        { id: "1", type: "checkbox", content: "Task", metadata: { checked: false } },
      ];
      const markdown = blocksToMarkdown(blocks);

      expect(markdown).toBe("- [ ] Task");
    });

    it("converts checked checkbox", () => {
      const blocks: EditorBlock[] = [
        { id: "1", type: "checkbox", content: "Done", metadata: { checked: true } },
      ];
      const markdown = blocksToMarkdown(blocks);

      expect(markdown).toBe("- [x] Done");
    });
  });

  describe("callouts", () => {
    it("converts info callout", () => {
      const blocks: EditorBlock[] = [
        { id: "1", type: "callout", content: "Tip here", metadata: { calloutType: "info" } },
      ];
      const markdown = blocksToMarkdown(blocks);

      expect(markdown).toBe("> 💡 Tip here");
    });

    it("converts warning callout", () => {
      const blocks: EditorBlock[] = [
        { id: "1", type: "callout", content: "Warning", metadata: { calloutType: "warning" } },
      ];
      const markdown = blocksToMarkdown(blocks);

      expect(markdown).toBe("> ⚠️ Warning");
    });

    it("converts success callout", () => {
      const blocks: EditorBlock[] = [
        { id: "1", type: "callout", content: "Success", metadata: { calloutType: "success" } },
      ];
      const markdown = blocksToMarkdown(blocks);

      expect(markdown).toBe("> ✅ Success");
    });

    it("converts error callout", () => {
      const blocks: EditorBlock[] = [
        { id: "1", type: "callout", content: "Error", metadata: { calloutType: "error" } },
      ];
      const markdown = blocksToMarkdown(blocks);

      expect(markdown).toBe("> ❌ Error");
    });

    it("defaults to info callout when type not specified", () => {
      const blocks: EditorBlock[] = [{ id: "1", type: "callout", content: "Default" }];
      const markdown = blocksToMarkdown(blocks);

      expect(markdown).toBe("> 💡 Default");
    });
  });

  describe("images", () => {
    it("converts image with caption and URL", () => {
      const blocks: EditorBlock[] = [
        {
          id: "1",
          type: "image",
          content: "Caption",
          metadata: { imageUrl: "https://example.com/img.jpg", caption: "Caption" },
        },
      ];
      const markdown = blocksToMarkdown(blocks);

      expect(markdown).toBe("![Caption](https://example.com/img.jpg)");
    });

    it("converts image without caption", () => {
      const blocks: EditorBlock[] = [
        { id: "1", type: "image", content: "", metadata: { imageUrl: "url.jpg", caption: "" } },
      ];
      const markdown = blocksToMarkdown(blocks);

      expect(markdown).toBe("![](url.jpg)");
    });

    it("uses content as caption if metadata caption missing", () => {
      const blocks: EditorBlock[] = [
        { id: "1", type: "image", content: "Alt text", metadata: { imageUrl: "url.jpg" } },
      ];
      const markdown = blocksToMarkdown(blocks);

      expect(markdown).toBe("![Alt text](url.jpg)");
    });
  });

  describe("dividers", () => {
    it("converts divider to HTML hr tag", () => {
      const blocks: EditorBlock[] = [{ id: "1", type: "divider", content: "" }];
      const markdown = blocksToMarkdown(blocks);

      expect(markdown).toBe('<hr class="article-separator" />');
    });
  });

  describe("empty blocks array", () => {
    it("returns empty string for empty array", () => {
      const markdown = blocksToMarkdown([]);
      expect(markdown).toBe("");
    });
  });
});

// ============================================================================
// ROUNDTRIP CONVERSION
// ============================================================================

describe("Roundtrip conversion (markdown → blocks → markdown)", () => {
  it("preserves headings", () => {
    const original = "# Title\n\n## Section\n\n### Subsection";
    const blocks = markdownToBlocks(original, parseOptions);
    const converted = blocksToMarkdown(blocks);

    expect(converted).toBe(original);
  });

  it("preserves bullet lists", () => {
    const original = "- Item 1\n- Item 2\n- Item 3";
    const blocks = markdownToBlocks(original, parseOptions);
    const converted = blocksToMarkdown(blocks);

    expect(converted).toBe(original);
  });

  it("preserves code blocks", () => {
    const original = "```javascript\nconst x = 42;\n```";
    const blocks = markdownToBlocks(original, parseOptions);
    const converted = blocksToMarkdown(blocks);

    expect(converted).toBe(original);
  });

  it("preserves checkboxes", () => {
    const original = "- [ ] Unchecked\n\n- [x] Checked";
    const blocks = markdownToBlocks(original, parseOptions);
    const converted = blocksToMarkdown(blocks);

    expect(converted).toBe(original);
  });

  it("preserves callouts", () => {
    const original = "> 💡 Tip\n\n> ⚠️ Warning";
    const blocks = markdownToBlocks(original, parseOptions);
    const converted = blocksToMarkdown(blocks);

    expect(converted).toBe(original);
  });
});

// ============================================================================
// GET BLOCK PLACEHOLDER
// ============================================================================

describe("getBlockPlaceholder", () => {
  describe("English placeholders", () => {
    it("returns English paragraph placeholder", () => {
      expect(getBlockPlaceholder("paragraph", "en")).toBe("Type / for commands");
    });

    it("returns English heading1 placeholder", () => {
      expect(getBlockPlaceholder("heading1", "en")).toBe("Heading 1");
    });

    it("returns English code placeholder", () => {
      expect(getBlockPlaceholder("code", "en")).toBe("Enter code...");
    });

    it("returns English callout placeholder", () => {
      expect(getBlockPlaceholder("callout", "en")).toBe("Write a callout...");
    });

    it("returns empty string for divider", () => {
      expect(getBlockPlaceholder("divider", "en")).toBe("");
    });
  });

  describe("Spanish placeholders", () => {
    it("returns Spanish paragraph placeholder", () => {
      expect(getBlockPlaceholder("paragraph", "es")).toBe("Escribe / para comandos");
    });

    it("returns Spanish heading1 placeholder", () => {
      expect(getBlockPlaceholder("heading1", "es")).toBe("Encabezado 1");
    });

    it("returns Spanish code placeholder", () => {
      expect(getBlockPlaceholder("code", "es")).toBe("Ingresa código...");
    });

    it("returns Spanish callout placeholder", () => {
      expect(getBlockPlaceholder("callout", "es")).toBe("Escribe una nota...");
    });

    it("returns empty string for divider", () => {
      expect(getBlockPlaceholder("divider", "es")).toBe("");
    });
  });

  describe("all block types", () => {
    it("has placeholder for all English block types", () => {
      const types = [
        "paragraph",
        "heading1",
        "heading2",
        "heading3",
        "bulletList",
        "orderedList",
        "checkbox",
        "code",
        "callout",
        "divider",
        "image",
      ] as const;

      for (const type of types) {
        const placeholder = getBlockPlaceholder(type, "en");
        expect(typeof placeholder).toBe("string");
      }
    });

    it("has placeholder for all Spanish block types", () => {
      const types = [
        "paragraph",
        "heading1",
        "heading2",
        "heading3",
        "bulletList",
        "orderedList",
        "checkbox",
        "code",
        "callout",
        "divider",
        "image",
      ] as const;

      for (const type of types) {
        const placeholder = getBlockPlaceholder(type, "es");
        expect(typeof placeholder).toBe("string");
      }
    });
  });
});
