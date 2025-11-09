/**
 * Block Editor Utilities
 * Convert between markdown and editor blocks
 */

import type { BlockType, CalloutType, EditorBlock } from "@/types/block-editor";

type MarkdownParseOptions = {
  deterministic?: boolean;
  seed?: string;
};

const stableHash = (input: string) => {
  let hash = 0;
  if (input.length === 0) {
    return "0";
  }
  for (let i = 0; i < input.length; i++) {
    const chr = input.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
};

/**
 * Parse markdown into editor blocks
 */
export function markdownToBlocks(markdown: string, options?: MarkdownParseOptions): EditorBlock[] {
  const lines = markdown.split("\n");
  const blocks: EditorBlock[] = [];
  let currentBlock: EditorBlock | null = null;
  let listItems: string[] = [];
  let codeBlock: { language: string; lines: string[] } | null = null;
  const deterministic = options?.deterministic ?? false;
  const baseSeed = options?.seed ?? stableHash(markdown || "content");
  let counter = 0;

  const nextId = () => (deterministic ? `blk-${baseSeed}-${counter++}` : crypto.randomUUID());

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block start/end
    if (line?.startsWith("```")) {
      if (codeBlock) {
        // End code block
        blocks.push({
          id: nextId(),
          type: "code",
          content: codeBlock.lines.join("\n"),
          metadata: { language: codeBlock.language },
        });
        codeBlock = null;
      } else {
        // Start code block
        const language = line.slice(3).trim() || "plaintext";
        codeBlock = { language, lines: [] };
      }
      continue;
    }

    // Inside code block
    if (codeBlock) {
      codeBlock.lines.push(line ?? "");
      continue;
    }

    // Heading 1
    if (line?.startsWith("# ")) {
      flushListBlock();
      blocks.push({
        id: nextId(),
        type: "heading1",
        content: line.slice(2).trim(),
      });
      continue;
    }

    // Heading 2
    if (line?.startsWith("## ")) {
      flushListBlock();
      blocks.push({
        id: nextId(),
        type: "heading2",
        content: line.slice(3).trim(),
      });
      continue;
    }

    // Heading 3
    if (line?.startsWith("### ")) {
      flushListBlock();
      blocks.push({
        id: nextId(),
        type: "heading3",
        content: line.slice(4).trim(),
      });
      continue;
    }

    // Separator/divider via custom hr tag
    if (line?.toLowerCase().includes("article-separator")) {
      flushListBlock();
      blocks.push({
        id: nextId(),
        type: "divider",
        content: "",
      });
      continue;
    }

    // Divider markdown (--- or ***)
    if (line?.match(/^(-{3,}|\*{3,})$/)) {
      flushListBlock();
      blocks.push({
        id: nextId(),
        type: "divider",
        content: "",
      });
      continue;
    }

    // Callout (blockquote with emoji)
    if (line?.startsWith("> ")) {
      flushListBlock();
      const content = line.slice(2).trim();
      let calloutType: CalloutType = "info";

      // Detect callout type by emoji/keyword
      if (content.startsWith("💡") || content.toLowerCase().includes("tip:")) {
        calloutType = "info";
      } else if (content.startsWith("⚠️") || content.toLowerCase().includes("warning:")) {
        calloutType = "warning";
      } else if (content.startsWith("✅") || content.toLowerCase().includes("success:")) {
        calloutType = "success";
      } else if (content.startsWith("❌") || content.toLowerCase().includes("error:")) {
        calloutType = "error";
      }

      // Remove emoji/keyword prefix
      const cleanContent = content
        .replace(/^(💡|⚠️|✅|❌)\s*/, "")
        .replace(/^(tip:|warning:|success:|error:)\s*/i, "");

      blocks.push({
        id: nextId(),
        type: "callout",
        content: cleanContent,
        metadata: { calloutType },
      });
      continue;
    }

    // Image block ![caption](url)
    const imageMatch = line?.match(/^!\[(.*?)]\((.*?)\)$/);
    if (imageMatch) {
      const [, caption = "", url = ""] = imageMatch;
      blocks.push({
        id: nextId(),
        type: "image",
        content: caption,
        metadata: { imageUrl: url, caption },
      });
      continue;
    }

    // Checkbox / checklist item
    if (line?.match(/^[-*]\s\[( |x|X)\]\s+/)) {
      flushListBlock();
      const checked = /^[-*]\s\[(x|X)\]\s+/.test(line);
      const content = line.replace(/^[-*]\s\[( |x|X)\]\s+/, "").trim();
      blocks.push({
        id: nextId(),
        type: "checkbox",
        content,
        metadata: { checked },
      });
      continue;
    }

    // Bullet list
    if (line?.match(/^[-*]\s/)) {
      const content = line.slice(2).trim();
      if (currentBlock?.type === "bulletList") {
        listItems.push(content);
      } else {
        flushListBlock();
        currentBlock = {
          id: nextId(),
          type: "bulletList",
          content: "",
          metadata: { listItems: [content] },
        };
        listItems = [content];
      }
      continue;
    }

    // Ordered list
    if (line?.match(/^\d+\.\s/)) {
      const content = line.replace(/^\d+\.\s/, "").trim();
      if (currentBlock?.type === "orderedList") {
        listItems.push(content);
      } else {
        flushListBlock();
        currentBlock = {
          id: nextId(),
          type: "orderedList",
          content: "",
          metadata: { listItems: [content] },
        };
        listItems = [content];
      }
      continue;
    }

    // Empty line
    if (!line?.trim()) {
      flushListBlock();
      continue;
    }

    // Regular paragraph
    flushListBlock();
    blocks.push({
      id: nextId(),
      type: "paragraph",
      content: line,
    });
  }

  flushListBlock();

  function flushListBlock() {
    if (
      currentBlock &&
      (currentBlock.type === "bulletList" || currentBlock.type === "orderedList")
    ) {
      blocks.push({
        ...currentBlock,
        metadata: { listItems },
      });
      currentBlock = null;
      listItems = [];
    }
  }

  return blocks.length > 0 ? blocks : [{ id: nextId(), type: "paragraph", content: "" }];
}

/**
 * Convert editor blocks back to markdown
 */
export function blocksToMarkdown(blocks: EditorBlock[]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case "heading1":
          return `# ${block.content}`;

        case "heading2":
          return `## ${block.content}`;

        case "heading3":
          return `### ${block.content}`;

        case "bulletList": {
          const items = block.metadata?.listItems ?? [];
          return items.map((item) => `- ${item}`).join("\n");
        }

        case "orderedList": {
          const items = block.metadata?.listItems ?? [];
          return items.map((item, idx) => `${idx + 1}. ${item}`).join("\n");
        }

        case "code": {
          const language = block.metadata?.language ?? "plaintext";
          return `\`\`\`${language}\n${block.content}\n\`\`\``;
        }

        case "checkbox": {
          const checked = block.metadata?.checked ? "x" : " ";
          return `- [${checked}] ${block.content}`.trimEnd();
        }

        case "callout": {
          const calloutType = block.metadata?.calloutType ?? "info";
          const emoji =
            calloutType === "info"
              ? "💡"
              : calloutType === "warning"
                ? "⚠️"
                : calloutType === "success"
                  ? "✅"
                  : "❌";
          return `> ${emoji} ${block.content}`;
        }

        case "image": {
          const imageUrl = block.metadata?.imageUrl ?? "";
          const caption = block.metadata?.caption ?? block.content ?? "";
          return imageUrl ? `![${caption}](${imageUrl})` : caption;
        }

        case "divider":
          return '<hr class="article-separator" />';

        case "paragraph":
        default:
          return block.content;
      }
    })
    .join("\n\n");
}

/**
 * Get placeholder text for block type
 */
export function getBlockPlaceholder(type: BlockType, locale: "en" | "es"): string {
  const placeholders = {
    en: {
      paragraph: "Type / for commands",
      heading1: "Heading 1",
      heading2: "Heading 2",
      heading3: "Heading 3",
      bulletList: "List item",
      orderedList: "List item",
      checkbox: "Checklist item",
      code: "Enter code...",
      callout: "Write a callout...",
      divider: "",
      image: "Add a caption",
    },
    es: {
      paragraph: "Escribe / para comandos",
      heading1: "Encabezado 1",
      heading2: "Encabezado 2",
      heading3: "Encabezado 3",
      bulletList: "Elemento de lista",
      orderedList: "Elemento de lista",
      checkbox: "Elemento de checklist",
      code: "Ingresa código...",
      callout: "Escribe una nota...",
      divider: "",
      image: "Agrega una leyenda",
    },
  };

  return placeholders[locale][type] ?? "";
}
