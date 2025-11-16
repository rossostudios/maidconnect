"use client";

import {
  Add01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  CodeIcon,
  Delete02Icon,
  DragDropIcon,
  HighlighterIcon,
  ImageAdd01Icon,
  Link01Icon,
  LinkBackwardIcon,
  TextAlignCenterIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  TextBoldIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
  TextUnderlineIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { blocksToMarkdown, getBlockPlaceholder, markdownToBlocks } from "@/lib/block-editor-utils";
import { cn } from "@/lib/utils";
import type { BlockType, CalloutType, EditorBlock } from "@/types/block-editor";
import { BLOCK_TYPES, CALLOUT_TYPES } from "@/types/block-editor";

const editorTokens = {
  shell: "mx-auto w-full max-w-3xl px-4 sm:px-6 py-6",
  blockStack: "space-y-1",
  blockRow:
    "group relative flex items-start gap-3 -2xl pl-4 pr-16 py-1.5 transition hover:bg-white dark:bg-neutral-950",
  dragOver:
    "bg-white dark:bg-neutral-950 border border-dashed border-neutral-200 dark:border-neutral-800",
  handleRail:
    "absolute top-2 right-2 flex items-center gap-1 -full bg-white dark:bg-neutral-950/90 px-1 py-0.5 text-neutral-600 dark:text-neutral-400/70 opacity-0 shadow-sm ring-1 ring-[neutral-200] transition-all group-hover:opacity-100",
  handleButton:
    " p-1 transition hover:bg-[neutral-200]/30 hover:text-neutral-600 dark:text-neutral-400 active:cursor-grabbing",
  deleteButton:
    " p-1 text-neutral-900 dark:text-neutral-100 transition hover:bg-white dark:bg-neutral-950 hover:text-neutral-900 dark:text-neutral-100",
};

const TEXT_BLOCK_TYPES: BlockType[] = [
  "paragraph",
  "heading1",
  "heading2",
  "heading3",
  "callout",
  "checkbox",
];

const getDefaultMetadata = (type: BlockType): EditorBlock["metadata"] | undefined => {
  if (type === "bulletList" || type === "orderedList") {
    return { listItems: [""] };
  }
  if (type === "checkbox") {
    return { checked: false };
  }
  if (type === "image") {
    return { imageUrl: "", caption: "" };
  }
  return;
};

const createBlock = (
  type: BlockType = "paragraph",
  overrides?: Partial<EditorBlock>
): EditorBlock => ({
  id: overrides?.id ?? crypto.randomUUID(),
  type,
  content: overrides?.content ?? "",
  metadata: overrides?.metadata ?? getDefaultMetadata(type),
});

const getCaretOffsetWithin = (element: HTMLElement): number => {
  if (typeof window === "undefined") {
    return element.textContent?.length ?? 0;
  }
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return element.textContent?.length ?? 0;
  }
  const range = selection.getRangeAt(0);
  if (!element.contains(range.startContainer)) {
    return element.textContent?.length ?? 0;
  }
  const preRange = range.cloneRange();
  preRange.selectNodeContents(element);
  preRange.setEnd(range.startContainer, range.startOffset);
  return preRange.toString().length;
};

const setCaretPosition = (element: HTMLElement, position: number) => {
  if (typeof window === "undefined") {
    return;
  }
  const selection = window.getSelection();
  if (!selection) {
    return;
  }

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let currentNode = walker.nextNode();
  let remaining = position;

  while (currentNode) {
    const length = currentNode.textContent?.length ?? 0;
    if (remaining <= length) {
      const range = document.createRange();
      range.setStart(currentNode, remaining);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }
    remaining -= length;
    currentNode = walker.nextNode();
  }

  const fallbackRange = document.createRange();
  fallbackRange.selectNodeContents(element);
  fallbackRange.collapse(false);
  selection.removeAllRanges();
  selection.addRange(fallbackRange);
};

const isCaretAtStart = (element: HTMLElement) => getCaretOffsetWithin(element) === 0;

type BlockEditorProps = {
  initialContent?: string;
  onChange?: (markdown: string) => void;
  placeholder?: string;
  locale: "en" | "es";
};

export function BlockEditor({ initialContent = "", onChange, locale }: BlockEditorProps) {
  const [blocks, setBlocks] = useState<EditorBlock[]>(() =>
    markdownToBlocks(initialContent, { deterministic: true })
  );

  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [showBlockMenu, setShowBlockMenu] = useState<string | null>(null);
  const [slashMenuSearch, setSlashMenuSearch] = useState("");
  const [recentBlocks] = useState<BlockType[]>([]);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [dragOverBlockId, setDragOverBlockId] = useState<string | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [selectionToolbar, setSelectionToolbar] = useState({ visible: false, x: 0, y: 0 });
  const savedRangeRef = useRef<Range | null>(null);

  const hideSelectionToolbar = useCallback(() => {
    setSelectionToolbar((prev) => (prev.visible ? { ...prev, visible: false } : prev));
    savedRangeRef.current = null;
  }, []);

  const updateSelectionToolbar = useCallback(() => {
    const container = editorContainerRef.current;
    const selection = window.getSelection();
    if (!(container && selection) || selection.rangeCount === 0) {
      hideSelectionToolbar();
      return;
    }

    if (selection.isCollapsed) {
      hideSelectionToolbar();
      return;
    }

    const range = selection.getRangeAt(0);
    const node = range.commonAncestorContainer;
    if (!container.contains(node)) {
      hideSelectionToolbar();
      return;
    }

    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      hideSelectionToolbar();
      return;
    }

    const containerRect = container.getBoundingClientRect();
    savedRangeRef.current = range.cloneRange();
    const x = rect.left - containerRect.left + rect.width / 2;
    const y = rect.top - containerRect.top - 48;
    setSelectionToolbar({
      visible: true,
      x,
      y: Math.max(y, 0),
    });
  }, [hideSelectionToolbar]);

  useEffect(() => {
    const handleMouseUp = () => requestAnimationFrame(updateSelectionToolbar);
    const handleKeyUp = () => requestAnimationFrame(updateSelectionToolbar);
    const handleScroll = (event: Event) => {
      const container = editorContainerRef.current;
      if (!container) {
        return;
      }
      if (event.target instanceof Node && container.contains(event.target)) {
        hideSelectionToolbar();
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("keyup", handleKeyUp);
    document.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [hideSelectionToolbar, updateSelectionToolbar]);

  const restoreSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!(selection && savedRangeRef.current)) {
      return;
    }
    selection.removeAllRanges();
    selection.addRange(savedRangeRef.current);
  }, []);

  const applyFormatting = useCallback(
    (command: string, value?: string) => {
      restoreSelection();
      document.execCommand(command, false, value);
      updateSelectionToolbar();
    },
    [restoreSelection, updateSelectionToolbar]
  );

  const handleLinkInsert = useCallback(() => {
    restoreSelection();
    const url = window.prompt(locale === "es" ? "Pega un enlace" : "Paste a link", "https://");
    if (url) {
      document.execCommand("createLink", false, url);
    } else {
      document.execCommand("unlink");
    }
    updateSelectionToolbar();
  }, [locale, restoreSelection, updateSelectionToolbar]);

  // Auto-save with debounce (silent - no UI indicator)
  useEffect(() => {
    const timeout = setTimeout(() => {
      const markdown = blocksToMarkdown(blocks);
      onChange?.(markdown);
    }, 500);
    return () => clearTimeout(timeout);
  }, [blocks, onChange]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // CMD+Shift+Backspace: Delete all blocks (bulk delete)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "Backspace") {
        e.preventDefault();
        setBlocks([{ id: crypto.randomUUID(), type: "paragraph", content: "" }]);
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const updateBlock = useCallback((id: string, updates: Partial<EditorBlock>) => {
    setBlocks((prev) => prev.map((block) => (block.id === id ? { ...block, ...updates } : block)));
  }, []);

  const deleteBlock = useCallback((id: string) => {
    setBlocks((prev) => {
      if (prev.length === 1) {
        // Don't delete the last block, just clear it
        return [createBlock()];
      }
      return prev.filter((block) => block.id !== id);
    });
  }, []);

  const splitBlock = useCallback((blockId: string, caretIndex: number, textValue: string) => {
    const newBlockId = crypto.randomUUID();
    setBlocks((prev) => {
      const index = prev.findIndex((b) => b.id === blockId);
      if (index === -1) {
        return prev;
      }
      const block = prev[index];
      if (!(block && TEXT_BLOCK_TYPES.includes(block.type))) {
        return prev;
      }

      const before = textValue.slice(0, caretIndex);
      const after = textValue.slice(caretIndex);

      const nextType =
        block.type === "checkbox" ? "checkbox" : block.type === "callout" ? "callout" : "paragraph";

      const newBlock = createBlock(nextType, {
        id: newBlockId,
        content: after,
        metadata:
          nextType === "checkbox"
            ? { checked: false }
            : nextType === "callout"
              ? block.metadata
              : undefined,
      });

      const updated = [...prev];
      updated[index] = { ...block, content: before };
      updated.splice(index + 1, 0, newBlock);
      return updated;
    });

    requestAnimationFrame(() => {
      const element = document.querySelector(`[data-block-id="${newBlockId}"]`) as HTMLElement;
      if (element) {
        element.focus();
        setCaretPosition(element, 0);
      }
    });
  }, []);

  const mergeBlockWithPrevious = useCallback((blockId: string) => {
    let focusId: string | null = null;
    let caretPosition = 0;

    setBlocks((prev) => {
      const index = prev.findIndex((b) => b.id === blockId);
      if (index <= 0) {
        return prev;
      }
      const previous = prev[index - 1];
      const current = prev[index];
      if (!(previous && current)) {
        return prev;
      }

      focusId = previous.id;
      caretPosition = (previous.content ?? "").length;

      if (!(TEXT_BLOCK_TYPES.includes(previous.type) && TEXT_BLOCK_TYPES.includes(current.type))) {
        return prev;
      }

      const mergedContent = `${previous.content ?? ""}${current.content ?? ""}`;

      const updated = [...prev];
      updated[index - 1] = { ...previous, content: mergedContent };
      updated.splice(index, 1);
      return updated;
    });

    if (focusId) {
      requestAnimationFrame(() => {
        const element = document.querySelector(`[data-block-id="${focusId!}"]`) as HTMLElement;
        if (element) {
          element.focus();
          setCaretPosition(element, caretPosition);
        }
      });
    }
  }, []);

  const moveBlock = useCallback((id: string, direction: "up" | "down") => {
    setBlocks((prev) => {
      const index = prev.findIndex((b) => b.id === id);
      if (index === -1) {
        return prev;
      }
      if (direction === "up" && index === 0) {
        return prev;
      }
      if (direction === "down" && index === prev.length - 1) {
        return prev;
      }

      const newBlocks = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      const temp = newBlocks[index];
      if (temp && newBlocks[targetIndex]) {
        newBlocks[index] = newBlocks[targetIndex] as EditorBlock;
        newBlocks[targetIndex] = temp;
      }
      return newBlocks;
    });
  }, []);

  // Handle markdown paste
  const handlePaste = useCallback((blockId: string, e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData("text/plain");

    // Check if the pasted content looks like markdown
    const hasMarkdownSyntax =
      pastedText.includes("# ") ||
      pastedText.includes("## ") ||
      pastedText.includes("```") ||
      pastedText.includes("- ") ||
      pastedText.includes("* ") ||
      pastedText.includes("1. ") ||
      pastedText.includes("\n\n");

    if (hasMarkdownSyntax && pastedText.length > 50) {
      e.preventDefault();

      // Convert markdown to blocks
      const newBlocks = markdownToBlocks(pastedText);

      // Replace current block with pasted blocks
      setBlocks((prev) => {
        const index = prev.findIndex((b) => b.id === blockId);
        const beforeBlocks = prev.slice(0, index);
        const afterBlocks = prev.slice(index + 1);
        return [...beforeBlocks, ...newBlocks, ...afterBlocks];
      });
    }
    // Otherwise, let default paste behavior work (plain text)
  }, []);

  // Native drag-and-drop handlers
  const handleDragStart = useCallback((blockId: string) => {
    setDraggedBlockId(blockId);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, blockId: string) => {
      if (!draggedBlockId) {
        return;
      }
      e.preventDefault();
      setDragOverBlockId(blockId);
    },
    [draggedBlockId]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, targetBlockId: string) => {
      e.preventDefault();

      if (!draggedBlockId || draggedBlockId === targetBlockId) {
        setDraggedBlockId(null);
        setDragOverBlockId(null);
        return;
      }

      setBlocks((prev) => {
        const draggedIndex = prev.findIndex((b) => b.id === draggedBlockId);
        const targetIndex = prev.findIndex((b) => b.id === targetBlockId);

        if (draggedIndex === -1 || targetIndex === -1) {
          return prev;
        }

        const newBlocks = [...prev];
        const draggedBlock = newBlocks[draggedIndex];
        if (!draggedBlock) {
          return prev;
        }

        // Remove dragged block
        newBlocks.splice(draggedIndex, 1);

        // Insert at new position
        const adjustedTargetIndex = draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
        newBlocks.splice(adjustedTargetIndex, 0, draggedBlock);

        return newBlocks;
      });

      setDraggedBlockId(null);
      setDragOverBlockId(null);
    },
    [draggedBlockId]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedBlockId(null);
    setDragOverBlockId(null);
  }, []);

  const toolbarButtons = [
    {
      icon: TextBoldIcon,
      label: locale === "es" ? "Negrita" : "Bold",
      onClick: () => applyFormatting("bold"),
    },
    {
      icon: TextItalicIcon,
      label: locale === "es" ? "Cursiva" : "Italic",
      onClick: () => applyFormatting("italic"),
    },
    {
      icon: TextUnderlineIcon,
      label: locale === "es" ? "Subrayado" : "Underline",
      onClick: () => applyFormatting("underline"),
    },
    {
      icon: TextStrikethroughIcon,
      label: locale === "es" ? "Tachado" : "Strikethrough",
      onClick: () => applyFormatting("strikeThrough"),
    },
    {
      icon: HighlighterIcon,
      label: locale === "es" ? "Resaltar" : "Highlight",
      onClick: () => applyFormatting("hiliteColor", "neutral-50"),
    },
    {
      icon: CodeIcon,
      label: locale === "es" ? "Código en línea" : "Inline code",
      onClick: () => {
        restoreSelection();
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
          return;
        }
        const text = selection.toString();
        const safeText = text
          ? text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
          : "&nbsp;";
        const html = `<code>${safeText}</code>`;
        document.execCommand("insertHTML", false, html);
        updateSelectionToolbar();
      },
    },
    {
      icon: Link01Icon,
      label: locale === "es" ? "Enlace" : "Link",
      onClick: handleLinkInsert,
    },
    {
      icon: LinkBackwardIcon,
      label: locale === "es" ? "Quitar enlace" : "Remove link",
      onClick: () => applyFormatting("unlink"),
    },
    {
      icon: TextAlignLeftIcon,
      label: locale === "es" ? "Alinear izquierda" : "Align left",
      onClick: () => applyFormatting("justifyLeft"),
    },
    {
      icon: TextAlignCenterIcon,
      label: locale === "es" ? "Centrar" : "Align center",
      onClick: () => applyFormatting("justifyCenter"),
    },
    {
      icon: TextAlignRightIcon,
      label: locale === "es" ? "Alinear derecha" : "Align right",
      onClick: () => applyFormatting("justifyRight"),
    },
  ];

  return (
    <div className={cn("relative", editorTokens.shell)} ref={editorContainerRef}>
      {selectionToolbar.visible && (
        <div
          className="pointer-events-auto absolute z-40 flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-2 py-1 text-neutral-600 shadow-xl dark:border-neutral-800 dark:bg-neutral-950/95 dark:text-neutral-400"
          style={{
            left: selectionToolbar.x,
            top: selectionToolbar.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          {toolbarButtons.map((button) => (
            <button
              className="p-1 transition hover:bg-[neutral-200]/30"
              key={button.label}
              onClick={(e) => {
                e.preventDefault();
                button.onClick();
              }}
              onMouseDown={(e) => e.preventDefault()}
              title={button.label}
              type="button"
            >
              <HugeiconsIcon className="h-4 w-4" icon={button.icon} />
            </button>
          ))}
        </div>
      )}
      {/* Empty state - Notion-style blank canvas */}
      {blocks.length === 0 && (
        <div className="-3xl flex min-h-[320px] items-center justify-center border border-neutral-200 border-dashed bg-white text-center dark:border-neutral-800 dark:bg-neutral-950/70">
          <button
            className="-2xl flex items-center gap-2 border border-neutral-200 bg-white px-4 py-3 text-neutral-600 shadow-sm transition hover:border-neutral-900 hover:text-neutral-900 dark:border-neutral-100/30 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:text-neutral-400"
            onClick={() => {
              const newBlock: EditorBlock = {
                id: crypto.randomUUID(),
                type: "paragraph",
                content: "",
              };
              setBlocks([newBlock]);
              // Focus the new block
              setTimeout(() => {
                const element = document.querySelector(
                  `[data-block-id="${newBlock.id}"]`
                ) as HTMLElement;
                element?.focus();
              }, 50);
            }}
            type="button"
          >
            <HugeiconsIcon className="h-5 w-5" icon={Add01Icon} />
            <span className="font-medium text-base">
              {locale === "es"
                ? "Comienza a escribir o presiona '/'"
                : "Start typing or tap '/' for commands"}
            </span>
          </button>
        </div>
      )}

      {/* Blocks with native drag-and-drop */}
      {blocks.length > 0 && (
        <div className={editorTokens.blockStack}>
          {blocks.map((block) => (
            <BlockComponent
              block={block}
              deleteBlock={deleteBlock}
              draggedBlockId={draggedBlockId}
              dragOverBlockId={dragOverBlockId}
              isFocused={focusedBlockId === block.id}
              key={block.id}
              locale={locale}
              mergeBlockWithPrevious={mergeBlockWithPrevious}
              moveBlock={moveBlock}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
              onFocus={() => setFocusedBlockId(block.id)}
              onPaste={handlePaste}
              recentBlocks={recentBlocks}
              showBlockMenu={showBlockMenu === block.id}
              slashMenuSearch={slashMenuSearch}
              splitBlock={splitBlock}
              toggleBlockMenu={() => {
                setShowBlockMenu(showBlockMenu === block.id ? null : block.id);
                setSlashMenuSearch("");
              }}
              updateBlock={updateBlock}
              updateSlashSearch={setSlashMenuSearch}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type BlockComponentProps = {
  block: EditorBlock;
  updateBlock: (id: string, updates: Partial<EditorBlock>) => void;
  deleteBlock: (id: string) => void;
  splitBlock: (id: string, caretIndex: number, textValue: string) => void;
  mergeBlockWithPrevious: (id: string) => void;
  moveBlock: (id: string, direction: "up" | "down") => void;
  onFocus: () => void;
  isFocused: boolean;
  locale: "en" | "es";
  showBlockMenu: boolean;
  toggleBlockMenu: () => void;
  slashMenuSearch: string;
  updateSlashSearch: (search: string) => void;
  recentBlocks: BlockType[];
  onDragStart: (blockId: string) => void;
  onDragOver: (e: React.DragEvent, blockId: string) => void;
  onDrop: (e: React.DragEvent, blockId: string) => void;
  onDragEnd: () => void;
  draggedBlockId: string | null;
  dragOverBlockId: string | null;
  onPaste: (blockId: string, e: React.ClipboardEvent) => void;
};

function BlockComponent({
  block,
  updateBlock,
  deleteBlock,
  splitBlock,
  mergeBlockWithPrevious,
  moveBlock,
  onFocus,
  isFocused,
  locale,
  showBlockMenu,
  toggleBlockMenu,
  slashMenuSearch,
  updateSlashSearch,
  recentBlocks,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  draggedBlockId,
  dragOverBlockId,
  onPaste,
}: BlockComponentProps) {
  const ref = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedButtonRef = useRef<HTMLButtonElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter block types based on search
  const allBlockTypes = (Object.keys(BLOCK_TYPES) as BlockType[]).filter(
    (type) => type !== "divider"
  );

  const filteredBlockTypes = slashMenuSearch
    ? allBlockTypes.filter((type) =>
        BLOCK_TYPES[type].label.toLowerCase().includes(slashMenuSearch.toLowerCase())
      )
    : allBlockTypes;

  // Show recent blocks only if no search
  const showRecent = !slashMenuSearch && recentBlocks.length > 0;
  const recentBlocksFiltered = recentBlocks.filter((type) => type !== "divider");

  // All options for keyboard navigation
  const allOptions = showRecent
    ? [
        ...recentBlocksFiltered,
        ...filteredBlockTypes.filter((t) => !recentBlocksFiltered.includes(t)),
      ]
    : filteredBlockTypes;

  // Reset selected index when menu opens or search changes
  useEffect(() => {
    if (showBlockMenu) {
      setSelectedIndex(0);
    }
  }, [showBlockMenu]);

  // Click outside to close menu
  useEffect(() => {
    if (!showBlockMenu) {
      return;
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        toggleBlockMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showBlockMenu, toggleBlockMenu]);

  // Scroll selected item into view
  useEffect(() => {
    if (showBlockMenu && selectedButtonRef.current) {
      selectedButtonRef.current.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [showBlockMenu]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const target = e.currentTarget as HTMLElement;

    // IMPORTANT: Standard keyboard shortcuts (CMD+A, CMD+C, CMD+V, CMD+X, CMD+Z, etc.)
    // work by default - browser handles text selection and clipboard operations

    // Handle menu navigation
    if (showBlockMenu) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % allOptions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + allOptions.length) % allOptions.length);
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const selectedType = allOptions[selectedIndex];
        if (selectedType) {
          updateBlock(block.id, { type: selectedType });
          toggleBlockMenu();
        }
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        toggleBlockMenu();
        return;
      }
    }

    // Enter: Create new block
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      !showBlockMenu &&
      TEXT_BLOCK_TYPES.includes(block.type)
    ) {
      e.preventDefault();
      const caretIndex = getCaretOffsetWithin(target);
      splitBlock(block.id, caretIndex, target.textContent ?? "");
    }

    // Backspace on empty block: Delete block
    if (e.key === "Backspace" && TEXT_BLOCK_TYPES.includes(block.type)) {
      const text = target.textContent ?? "";
      if (!text) {
        e.preventDefault();
        deleteBlock(block.id);
        return;
      }
      if (isCaretAtStart(target)) {
        e.preventDefault();
        mergeBlockWithPrevious(block.id);
      }
    }

    // Cmd/Ctrl + / : Toggle block menu
    if ((e.metaKey || e.ctrlKey) && e.key === "/") {
      e.preventDefault();
      toggleBlockMenu();
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.textContent ?? "";

    // Check for slash command
    if (content === "/") {
      e.preventDefault();
      toggleBlockMenu();
      updateBlock(block.id, { content: "" });
      return;
    }

    // If menu is open, update search
    if (showBlockMenu && content.startsWith("/")) {
      const search = content.substring(1);
      updateSlashSearch(search);
      updateBlock(block.id, { content: "" });
      return;
    }

    updateBlock(block.id, { content });
  };

  const isDragging = draggedBlockId === block.id;
  const isDragOver = dragOverBlockId === block.id;

  return (
    <div
      className={cn(
        editorTokens.blockRow,
        isDragOver && editorTokens.dragOver,
        isDragging && "opacity-60"
      )}
      onDragOver={(e) => onDragOver(e, block.id)}
      onDrop={(e) => onDrop(e, block.id)}
    >
      {/* Drag Handle & Actions */}
      <div
        className={cn(
          editorTokens.handleRail,
          (isFocused || showBlockMenu || draggedBlockId === block.id) && "opacity-100"
        )}
      >
        <button
          className={editorTokens.handleButton}
          draggable
          onDragEnd={onDragEnd}
          onDragStart={(e) => {
            e.dataTransfer.setData("text/plain", block.id);
            onDragStart(block.id);
          }}
          title={locale === "es" ? "Arrastrar" : "Drag"}
          type="button"
        >
          <HugeiconsIcon className="h-3.5 w-3.5" icon={DragDropIcon} />
        </button>
        <button
          className={editorTokens.handleButton}
          onClick={toggleBlockMenu}
          title={locale === "es" ? "Agregar bloque" : "Add block"}
          type="button"
        >
          <HugeiconsIcon className="h-3.5 w-3.5" icon={Add01Icon} />
        </button>
        <button
          className={editorTokens.deleteButton}
          onClick={() => deleteBlock(block.id)}
          title={locale === "es" ? "Eliminar bloque" : "Delete block"}
          type="button"
        >
          <HugeiconsIcon className="h-3.5 w-3.5" icon={Delete02Icon} />
        </button>
      </div>

      {/* Block Menu - Minimal slash menu */}
      {showBlockMenu && (
        <div
          className="absolute top-full left-0 z-50 mt-1 w-72 overflow-hidden border border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-950"
          ref={menuRef}
        >
          {/* Search hint */}
          <div className="border-neutral-200 border-b bg-white px-3 py-2 dark:border-neutral-800/40 dark:bg-neutral-950">
            <p className="text-neutral-600 text-xs dark:text-neutral-400">
              {slashMenuSearch ? (
                <>
                  {locale === "es" ? "Buscando" : "Searching"}: "{slashMenuSearch}"
                </>
              ) : locale === "es" ? (
                "Escribe para buscar bloques"
              ) : (
                "Type to search blocks"
              )}
            </p>
          </div>

          <div className="max-h-80 overflow-y-auto p-1">
            {/* Recent blocks section */}
            {showRecent && (
              <div className="mb-2">
                <p className="px-2 py-1.5 font-medium text-neutral-600 text-xs uppercase tracking-wide dark:text-neutral-400/70">
                  {locale === "es" ? "Recientes" : "Recent"}
                </p>
                {recentBlocksFiltered.map((type, idx) => {
                  const isSelected = selectedIndex === idx;
                  return (
                    <button
                      className={cn(
                        "flex w-full items-center gap-3 px-2 py-2 text-left text-sm",
                        isSelected
                          ? "bg-[neutral-200]/30 text-neutral-900 dark:text-neutral-100"
                          : "text-neutral-600 dark:text-neutral-400"
                      )}
                      key={type}
                      onClick={() => {
                        updateBlock(block.id, { type });
                        toggleBlockMenu();
                      }}
                      ref={isSelected ? selectedButtonRef : null}
                      type="button"
                    >
                      <span className="flex h-8 w-8 items-center justify-center border border-neutral-200 bg-white text-base dark:border-neutral-800 dark:bg-neutral-950">
                        <HugeiconsIcon className="h-4 w-4" icon={BLOCK_TYPES[type].icon} />
                      </span>
                      <div className="flex-1">
                        <div className="font-medium">{BLOCK_TYPES[type].label}</div>
                        {isSelected && (
                          <div className="text-neutral-600 text-xs dark:text-neutral-400">
                            {locale === "es" ? "Presiona Enter" : "Press Enter"}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* All blocks section */}
            {filteredBlockTypes.length > 0 && (
              <div>
                {showRecent && (
                  <p className="px-2 py-1.5 font-medium text-neutral-600 text-xs uppercase tracking-wide dark:text-neutral-400/70">
                    {locale === "es" ? "Todos los bloques" : "All Blocks"}
                  </p>
                )}
                {filteredBlockTypes
                  .filter((t) => !recentBlocksFiltered.includes(t))
                  .map((type) => {
                    const optionIndex = allOptions.indexOf(type);
                    const isSelected = selectedIndex === optionIndex;
                    return (
                      <button
                        className={cn(
                          "flex w-full items-center gap-3 px-2 py-2 text-left text-sm",
                          isSelected
                            ? "bg-[neutral-200]/30 text-neutral-900 dark:text-neutral-100"
                            : "text-neutral-600 dark:text-neutral-400"
                        )}
                        key={type}
                        onClick={() => {
                          updateBlock(block.id, { type });
                          toggleBlockMenu();
                        }}
                        ref={isSelected ? selectedButtonRef : null}
                        type="button"
                      >
                        <span className="flex h-8 w-8 items-center justify-center border border-neutral-200 bg-white text-base dark:border-neutral-800 dark:bg-neutral-950">
                          <HugeiconsIcon className="h-4 w-4" icon={BLOCK_TYPES[type].icon} />
                        </span>
                        <div className="flex-1">
                          <div className="font-medium">{BLOCK_TYPES[type].label}</div>
                          {isSelected && (
                            <div className="text-neutral-600 text-xs dark:text-neutral-400">
                              {locale === "es" ? "Presiona Enter" : "Press Enter"}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
              </div>
            )}

            {/* No results */}
            {filteredBlockTypes.length === 0 && (
              <div className="px-3 py-8 text-center">
                <p className="text-neutral-600 text-sm dark:text-neutral-400/70">
                  {locale === "es" ? "No se encontraron bloques" : "No blocks found"}
                </p>
                <p className="mt-1 text-neutral-600 text-xs dark:text-neutral-400/70">
                  {locale === "es" ? "Intenta con otra búsqueda" : "Try a different search"}
                </p>
              </div>
            )}

            {/* Actions section */}
            <div className="mt-2 border-neutral-200 border-t pt-1 dark:border-neutral-800/40">
              <p className="px-2 py-1.5 font-medium text-neutral-600 text-xs uppercase tracking-wide dark:text-neutral-400/70">
                {locale === "es" ? "Acciones" : "Actions"}
              </p>
              <button
                className="flex w-full items-center gap-2 px-2 py-2 text-left text-neutral-600 text-sm dark:text-neutral-400"
                onClick={() => {
                  moveBlock(block.id, "up");
                  toggleBlockMenu();
                }}
                type="button"
              >
                <HugeiconsIcon className="h-4 w-4" icon={ArrowUp01Icon} />
                <span>{locale === "es" ? "Mover arriba" : "Move up"}</span>
              </button>
              <button
                className="flex w-full items-center gap-2 px-2 py-2 text-left text-neutral-600 text-sm dark:text-neutral-400"
                onClick={() => {
                  moveBlock(block.id, "down");
                  toggleBlockMenu();
                }}
                type="button"
              >
                <HugeiconsIcon className="h-4 w-4" icon={ArrowDown01Icon} />
                <span>{locale === "es" ? "Mover abajo" : "Move down"}</span>
              </button>
              <button
                className="flex w-full items-center gap-2 px-2 py-2 text-left text-red-700 text-sm dark:text-red-200"
                onClick={() => {
                  deleteBlock(block.id);
                  toggleBlockMenu();
                }}
                type="button"
              >
                <HugeiconsIcon className="h-4 w-4" icon={Delete02Icon} />
                <span>{locale === "es" ? "Eliminar" : "Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Content */}
      <div className="flex-1">
        <BlockContent
          block={block}
          handleInput={handleInput}
          handleKeyDown={handleKeyDown}
          locale={locale}
          onFocus={onFocus}
          onPaste={(e) => onPaste(block.id, e)}
          ref={ref}
          updateBlock={updateBlock}
        />
      </div>
    </div>
  );
}

type BlockContentProps = {
  block: EditorBlock;
  handleInput: (e: React.FormEvent<HTMLDivElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  onFocus: () => void;
  locale: "en" | "es";
  updateBlock: (id: string, updates: Partial<EditorBlock>) => void;
  onPaste: (e: React.ClipboardEvent) => void;
};

const BlockContent = ({
  block,
  handleInput,
  handleKeyDown,
  onFocus,
  locale,
  updateBlock,
  onPaste,
  ref,
}: BlockContentProps & { ref?: React.RefObject<HTMLElement | null> }) => {
  const placeholder = getBlockPlaceholder(block.type, locale);
  const sharedRef = useRef<HTMLElement | null>(null);
  const assignSharedRef = useCallback((node: HTMLElement | null) => {
    sharedRef.current = node;
  }, []);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useImperativeHandle(ref, () => sharedRef.current!);

  useEffect(() => {
    if (!sharedRef.current) {
      return;
    }
    if (!(TEXT_BLOCK_TYPES.includes(block.type) || block.type === "code")) {
      return;
    }
    const nextValue = block.content ?? "";
    const currentValue = sharedRef.current.textContent ?? "";
    if (currentValue !== nextValue) {
      sharedRef.current.textContent = nextValue;
    }
  }, [block.content, block.type]);

  if (block.type === "checkbox") {
    const checked = Boolean(block.metadata?.checked);
    return (
      <div className="flex items-start gap-3 px-1 py-1">
        <input
          aria-label={locale === "es" ? "Completar elemento" : "Toggle checklist item"}
          checked={checked}
          className="mt-1 h-4 w-4 flex-shrink-0 border-neutral-400/40 text-neutral-900 focus:ring-neutral-500 dark:border-neutral-500/40 dark:text-neutral-100 dark:focus:ring-neutral-400"
          onChange={(e) =>
            updateBlock(block.id, {
              metadata: { ...block.metadata, checked: e.target.checked },
            })
          }
          type="checkbox"
        />
        <div
          className={cn(
            "min-h-[1.5rem] flex-1 px-1 py-0.5 text-neutral-600 outline-none dark:text-neutral-400",
            "empty:before:text-neutral-600 empty:before:content-[attr(data-placeholder)] dark:text-neutral-400/50",
            checked && "text-neutral-600 line-through dark:text-neutral-400"
          )}
          contentEditable
          data-block-id={block.id}
          data-placeholder={placeholder}
          onBlur={(e) =>
            updateBlock(block.id, {
              content: e.currentTarget.textContent ?? "",
            })
          }
          onFocus={onFocus}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={onPaste}
          ref={assignSharedRef as React.Ref<HTMLDivElement>}
          suppressContentEditableWarning
        />
      </div>
    );
  }

  if (block.type === "image") {
    const imageUrl = block.metadata?.imageUrl ?? "";
    const caption = block.metadata?.caption ?? block.content ?? "";

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        return;
      }
      readFile(file);
    };

    const readFile = (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        updateBlock(block.id, {
          metadata: { ...block.metadata, imageUrl: reader.result as string },
        });
      };
      reader.readAsDataURL(file);
    };

    const handleDropUpload = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file?.type.startsWith("image/")) {
        readFile(file);
      }
    };

    return (
      <div
        className="-2xl flex flex-col gap-3 border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropUpload}
      >
        {imageUrl ? (
          <img
            alt={caption || (locale === "es" ? "Imagen del artículo" : "Article image")}
            className="max-h-96 w-full object-cover"
            src={imageUrl}
          />
        ) : (
          <div className="flex h-48 flex-col items-center justify-center border border-neutral-400/40 border-dashed bg-white text-neutral-600 text-sm dark:border-neutral-500/40 dark:bg-neutral-950 dark:text-neutral-400/70">
            {locale === "es" ? "Agrega una imagen" : "Add an image"}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex items-center gap-2 border border-neutral-200 bg-white px-3 py-2 text-neutral-600 text-xs transition hover:border-neutral-400/40 dark:border-neutral-500/40 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400"
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            <HugeiconsIcon className="h-4 w-4" icon={ImageAdd01Icon} />
            {locale === "es" ? "Subir imagen/GIF" : "Upload image/GIF"}
          </button>
          {imageUrl && (
            <button
              className="inline-flex items-center gap-2 border border-neutral-200 bg-white px-3 py-2 text-neutral-600 text-xs transition hover:border-neutral-900 hover:text-neutral-900 dark:border-neutral-100/30 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:text-neutral-400"
              onClick={() =>
                updateBlock(block.id, {
                  content: "",
                  metadata: { ...block.metadata, imageUrl: "", caption: "" },
                })
              }
              type="button"
            >
              <HugeiconsIcon className="h-4 w-4" icon={Delete02Icon} />
              {locale === "es" ? "Eliminar" : "Remove"}
            </button>
          )}
          <input
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
            type="file"
          />
          <input
            className="flex-1 border border-neutral-200 bg-white px-3 py-2 text-neutral-600 text-xs outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400"
            onChange={(e) =>
              updateBlock(block.id, { metadata: { ...block.metadata, imageUrl: e.target.value } })
            }
            placeholder="https://"
            value={imageUrl}
          />
        </div>
        <input
          className="w-full border border-neutral-200 bg-white px-3 py-2 text-neutral-600 text-sm outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400"
          onChange={(e) =>
            updateBlock(block.id, {
              content: e.target.value,
              metadata: { ...block.metadata, caption: e.target.value },
            })
          }
          placeholder={locale === "es" ? "Agrega una leyenda" : "Add a caption"}
          value={caption}
        />
      </div>
    );
  }

  // Heading blocks - Minimal Notion-style
  if (block.type === "heading1") {
    return (
      <h1
        className="min-h-[2.5rem] px-1 py-1 font-semibold text-3xl text-neutral-900 tracking-tight outline-none empty:before:text-neutral-600 empty:before:content-[attr(data-placeholder)] dark:text-neutral-100 dark:text-neutral-400/50"
        contentEditable
        data-block-id={block.id}
        data-placeholder={placeholder}
        onBlur={(e) => updateBlock(block.id, { content: e.currentTarget.textContent ?? "" })}
        onFocus={onFocus}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={onPaste}
        ref={assignSharedRef as React.Ref<HTMLHeadingElement>}
        suppressContentEditableWarning
      />
    );
  }

  if (block.type === "heading2") {
    return (
      <h2
        className="min-h-[2rem] px-1 py-1 font-semibold text-2xl text-neutral-900 outline-none empty:before:text-neutral-600 empty:before:content-[attr(data-placeholder)] dark:text-neutral-100 dark:text-neutral-400/50"
        contentEditable
        data-block-id={block.id}
        data-placeholder={placeholder}
        onBlur={(e) => updateBlock(block.id, { content: e.currentTarget.textContent ?? "" })}
        onFocus={onFocus}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={onPaste}
        ref={assignSharedRef as React.Ref<HTMLHeadingElement>}
        suppressContentEditableWarning
      />
    );
  }

  if (block.type === "heading3") {
    return (
      <h3
        className="min-h-[1.75rem] px-1 py-1 font-semibold text-neutral-900 text-xl outline-none empty:before:text-neutral-600 empty:before:content-[attr(data-placeholder)] dark:text-neutral-100 dark:text-neutral-400/50"
        contentEditable
        data-block-id={block.id}
        data-placeholder={placeholder}
        onBlur={(e) => updateBlock(block.id, { content: e.currentTarget.textContent ?? "" })}
        onFocus={onFocus}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={onPaste}
        ref={assignSharedRef as React.Ref<HTMLHeadingElement>}
        suppressContentEditableWarning
      />
    );
  }

  // List blocks - Clean minimal lists
  if (block.type === "bulletList" || block.type === "orderedList") {
    const ListTag = block.type === "bulletList" ? "ul" : "ol";
    const items = block.metadata?.listItems ?? [""];

    return (
      <ListTag
        className={cn(
          "space-y-1",
          block.type === "bulletList" ? "list-disc" : "list-decimal",
          "pl-6 marker:text-neutral-600 dark:text-neutral-400/50"
        )}
      >
        {items.map((item, idx) => (
          <li className="text-base text-neutral-600 leading-7 dark:text-neutral-400" key={idx}>
            <div
              className="min-h-[1.5rem] px-1 py-0.5 outline-none empty:before:text-neutral-600 empty:before:content-[attr(data-placeholder)] dark:text-neutral-400/50"
              contentEditable
              data-block-id={`${block.id}-${idx}`}
              data-placeholder={placeholder}
              onBlur={(e) => {
                const newItems = [...items];
                newItems[idx] = e.currentTarget.textContent ?? "";
                updateBlock(block.id, { metadata: { ...block.metadata, listItems: newItems } });
              }}
              onFocus={onFocus}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const newItems = [...items];
                  newItems.splice(idx + 1, 0, "");
                  updateBlock(block.id, { metadata: { ...block.metadata, listItems: newItems } });
                }
                if (e.key === "Backspace" && !item && items.length > 1) {
                  e.preventDefault();
                  const newItems = items.filter((_, i) => i !== idx);
                  updateBlock(block.id, { metadata: { ...block.metadata, listItems: newItems } });
                }
              }}
              suppressContentEditableWarning
            >
              {item}
            </div>
          </li>
        ))}
      </ListTag>
    );
  }

  // Code block - Clean minimal code block
  if (block.type === "code") {
    return (
      <div className="overflow-hidden border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-center justify-between border-neutral-200 border-b bg-white px-3 py-2 dark:border-neutral-800 dark:bg-neutral-950">
          <select
            className="border-none bg-transparent px-2 py-1 text-neutral-600 text-xs outline-none dark:text-neutral-400"
            onChange={(e) => updateBlock(block.id, { metadata: { language: e.target.value } })}
            value={block.metadata?.language ?? "plaintext"}
          >
            <option value="plaintext">Plain Text</option>
            <option value="typescript">TypeScript</option>
            <option value="javascript">JavaScript</option>
            <option value="jsx">JSX</option>
            <option value="tsx">TSX</option>
            <option value="css">CSS</option>
            <option value="html">HTML</option>
            <option value="json">JSON</option>
            <option value="sql">SQL</option>
            <option value="bash">Bash</option>
          </select>
        </div>
        <pre className="overflow-x-auto p-3">
          <code
            className="block font-mono text-red-700 text-sm outline-none empty:before:text-neutral-600 empty:before:content-[attr(data-placeholder)] dark:text-neutral-400/50 dark:text-red-200"
            contentEditable
            data-block-id={block.id}
            data-placeholder={placeholder}
            onBlur={(e) => updateBlock(block.id, { content: e.currentTarget.textContent ?? "" })}
            onFocus={onFocus}
            onInput={handleInput}
            onKeyDown={(e) => {
              if (e.key === "Tab") {
                e.preventDefault();
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                  const range = selection.getRangeAt(0);
                  range.deleteContents();
                  range.insertNode(document.createTextNode("  "));
                  range.collapse(false);
                }
              }
            }}
            onPaste={onPaste}
            ref={assignSharedRef as React.Ref<HTMLDivElement>}
            suppressContentEditableWarning
          />
        </pre>
      </div>
    );
  }

  // Callout block - Clean minimal callouts
  if (block.type === "callout") {
    const calloutType = block.metadata?.calloutType ?? "info";
    const calloutConfig = CALLOUT_TYPES[calloutType];

    const calloutStyles = {
      blue: "bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800",
      orange: "bg-neutral-900 dark:bg-neutral-100/5 border-neutral-900 dark:border-neutral-100/20",
      green: "bg-neutral-900 dark:bg-neutral-100/10 border-neutral-900 dark:border-neutral-100/30",
      red: "bg-white dark:bg-neutral-950 border-neutral-900 dark:border-neutral-100/20",
    };

    return (
      <div className={cn("border p-4", calloutStyles[calloutConfig.color])}>
        <div className="mb-2 flex items-center gap-2">
          <HugeiconsIcon className="h-4 w-4" icon={calloutConfig.iconComponent} />
          <select
            className="border-none bg-transparent px-2 py-0.5 text-neutral-600 text-xs outline-none dark:text-neutral-400"
            onChange={(e) =>
              updateBlock(block.id, { metadata: { calloutType: e.target.value as CalloutType } })
            }
            value={calloutType}
          >
            {(Object.keys(CALLOUT_TYPES) as CalloutType[]).map((type) => (
              <option key={type} value={type}>
                {CALLOUT_TYPES[type].label}
              </option>
            ))}
          </select>
        </div>
        <div
          className="min-h-[1.5rem] px-1 py-0.5 text-neutral-900 outline-none empty:before:text-neutral-600 empty:before:content-[attr(data-placeholder)] dark:text-neutral-100 dark:text-neutral-400/50"
          contentEditable
          data-block-id={block.id}
          data-placeholder={placeholder}
          onBlur={(e) => updateBlock(block.id, { content: e.currentTarget.textContent ?? "" })}
          onFocus={onFocus}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={onPaste}
          ref={assignSharedRef as React.Ref<HTMLDivElement>}
          suppressContentEditableWarning
        />
      </div>
    );
  }

  // Divider - Simple minimal line
  if (block.type === "divider") {
    return (
      <hr
        className="article-separator my-6 border-neutral-200 dark:border-neutral-800"
        data-editor-separator
      />
    );
  }

  // Default: Paragraph - Clean minimal paragraph
  return (
    <div
      className="min-h-[1.75rem] w-full px-1 py-1 text-base text-neutral-900 leading-7 outline-none empty:before:text-neutral-600 empty:before:content-[attr(data-placeholder)] dark:text-neutral-100 dark:text-neutral-400/50"
      contentEditable
      data-block-id={block.id}
      data-placeholder={placeholder}
      onBlur={(e) => updateBlock(block.id, { content: e.currentTarget.textContent ?? "" })}
      onFocus={onFocus}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onPaste={onPaste}
      ref={assignSharedRef as React.Ref<HTMLDivElement>}
      suppressContentEditableWarning
    />
  );
};

BlockContent.displayName = "BlockContent";
