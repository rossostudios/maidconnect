/**
 * Block Editor Types
 * Notion-style block-based editor for help articles
 */

import {
  Alert01Icon,
  Cancel01Icon,
  CheckListIcon,
  CheckmarkCircle02Icon,
  CodeIcon,
  Heading01Icon,
  Heading02Icon,
  Heading03Icon,
  Idea01Icon,
  ImageAdd01Icon,
  LeftToRightListBulletIcon,
  LeftToRightListNumberIcon,
  LineIcon,
  Note01Icon,
  TextIcon,
} from "@hugeicons/core-free-icons";

// Type for Hugeicons icon objects
type IconSvgObject = typeof TextIcon;

export type BlockType =
  | "paragraph"
  | "heading1"
  | "heading2"
  | "heading3"
  | "bulletList"
  | "orderedList"
  | "checkbox"
  | "code"
  | "callout"
  | "divider"
  | "image";

export type CalloutType = "info" | "warning" | "success" | "error";

export type EditorBlock = {
  id: string;
  type: BlockType;
  content: string;
  metadata?: {
    language?: string; // For code blocks
    calloutType?: CalloutType; // For callouts
    listItems?: string[]; // For lists
    checked?: boolean; // For checkbox blocks
    imageUrl?: string; // For image blocks
    caption?: string; // For image captions
  };
};

export type BlockEditorProps = {
  initialContent?: string; // Markdown input
  onChange?: (markdown: string) => void;
  placeholder?: string;
  locale: "en" | "es";
};

/**
 * Block type icons and labels
 */
export const BLOCK_TYPES: Record<
  BlockType,
  { label: string; icon: IconSvgObject; shortcut: string }
> = {
  paragraph: { label: "Text", icon: TextIcon, shortcut: "Ctrl+Alt+0" },
  heading1: { label: "Heading 1", icon: Heading01Icon, shortcut: "Ctrl+Alt+1" },
  heading2: { label: "Heading 2", icon: Heading02Icon, shortcut: "Ctrl+Alt+2" },
  heading3: { label: "Heading 3", icon: Heading03Icon, shortcut: "Ctrl+Alt+3" },
  bulletList: { label: "Bullet List", icon: LeftToRightListBulletIcon, shortcut: "Ctrl+Shift+8" },
  orderedList: {
    label: "Numbered List",
    icon: LeftToRightListNumberIcon,
    shortcut: "Ctrl+Shift+7",
  },
  checkbox: { label: "Checklist", icon: CheckListIcon, shortcut: "Ctrl+Shift+C" },
  code: { label: "Code Block", icon: CodeIcon, shortcut: "Ctrl+Alt+C" },
  callout: { label: "Callout", icon: Note01Icon, shortcut: "Ctrl+Alt+I" },
  divider: { label: "Separator", icon: LineIcon, shortcut: "Ctrl+Alt+D" },
  image: { label: "Image", icon: ImageAdd01Icon, shortcut: "Ctrl+Shift+I" },
};

export const CALLOUT_TYPES = {
  info: { label: "Info", iconComponent: Idea01Icon, color: "blue" },
  warning: { label: "Warning", iconComponent: Alert01Icon, color: "yellow" },
  success: { label: "Success", iconComponent: CheckmarkCircle02Icon, color: "green" },
  error: { label: "Error", iconComponent: Cancel01Icon, color: "red" },
} as const;
