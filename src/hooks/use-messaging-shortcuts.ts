/**
 * Messaging Keyboard Shortcuts Hook
 *
 * Provides keyboard shortcuts specifically for the messaging interface.
 * Designed to work alongside the global keyboard shortcuts hook.
 *
 * Shortcuts:
 * - Enter / Cmd+Enter - Send message (when input focused)
 * - Escape - Close panels, clear selection, blur input
 * - / - Focus search input
 * - K - Toggle quick replies panel
 * - R - Mark current conversation as read
 * - B - Toggle booking context sheet
 * - Up/Down - Navigate conversations
 * - N - Focus compose input (new message)
 *
 * Following Lia Design System patterns.
 */

import { useCallback, useEffect, useRef } from "react";

// ============================================================================
// Types
// ============================================================================

export type MessagingShortcutAction =
  | "send_message"
  | "focus_search"
  | "focus_compose"
  | "toggle_quick_replies"
  | "toggle_booking_context"
  | "mark_read"
  | "navigate_up"
  | "navigate_down"
  | "close_panel"
  | "select_conversation";

export type MessagingShortcutHandlers = {
  /** Send the current message (Enter or Cmd+Enter) */
  onSendMessage?: () => void;
  /** Focus the search input (/) */
  onFocusSearch?: () => void;
  /** Focus the compose/message input (N) */
  onFocusCompose?: () => void;
  /** Toggle quick replies panel (K) */
  onToggleQuickReplies?: () => void;
  /** Toggle booking context sheet (B) */
  onToggleBookingContext?: () => void;
  /** Mark current conversation as read (R) */
  onMarkRead?: () => void;
  /** Navigate to previous conversation (Up arrow) */
  onNavigateUp?: () => void;
  /** Navigate to next conversation (Down arrow) */
  onNavigateDown?: () => void;
  /** Close any open panel (Escape) */
  onClosePanel?: () => void;
  /** Select conversation by index (1-9) */
  onSelectConversation?: (index: number) => void;
};

export type UseMessagingShortcutsOptions = {
  /** Handlers for each shortcut action */
  handlers: MessagingShortcutHandlers;
  /** Whether shortcuts are enabled (default: true) */
  enabled?: boolean;
  /** Ref to the compose input element (for Enter to send) */
  composeInputRef?: React.RefObject<HTMLTextAreaElement | HTMLInputElement>;
  /** Whether Cmd/Ctrl+Enter is required to send (default: false - Enter sends) */
  requireModifierToSend?: boolean;
  /** Whether a panel is currently open (disables some shortcuts) */
  isPanelOpen?: boolean;
};

export type MessagingShortcutsState = {
  /** Currently pressed modifier keys */
  modifiers: {
    meta: boolean;
    ctrl: boolean;
    shift: boolean;
    alt: boolean;
  };
  /** Register a custom shortcut handler */
  registerShortcut: (key: string, handler: () => void) => () => void;
  /** Get keyboard shortcut hints for display */
  getShortcutHints: () => ShortcutHint[];
};

export type ShortcutHint = {
  action: string;
  keys: string[];
  description: string;
};

// ============================================================================
// Constants
// ============================================================================

const SHORTCUT_HINTS: ShortcutHint[] = [
  { action: "send_message", keys: ["Enter", "⌘+Enter"], description: "Send message" },
  { action: "focus_search", keys: ["/"], description: "Search conversations" },
  { action: "focus_compose", keys: ["N"], description: "New message" },
  { action: "toggle_quick_replies", keys: ["K"], description: "Quick replies" },
  { action: "toggle_booking_context", keys: ["B"], description: "Booking details" },
  { action: "mark_read", keys: ["R"], description: "Mark as read" },
  { action: "navigate", keys: ["↑", "↓"], description: "Navigate conversations" },
  { action: "close", keys: ["Esc"], description: "Close panel" },
  { action: "select", keys: ["1-9"], description: "Select conversation" },
];

// Regex for number keys 1-9 (top-level for performance)
const NUMBER_KEY_REGEX = /^[1-9]$/;

// ============================================================================
// Hook
// ============================================================================

export function useMessagingShortcuts(
  options: UseMessagingShortcutsOptions
): MessagingShortcutsState {
  const {
    handlers,
    enabled = true,
    composeInputRef,
    requireModifierToSend = false,
    isPanelOpen = false,
  } = options;

  // Track modifier keys
  const modifiersRef = useRef({
    meta: false,
    ctrl: false,
    shift: false,
    alt: false,
  });

  // Custom shortcut handlers registry
  const customHandlersRef = useRef<Map<string, () => void>>(new Map());

  // Check if user is typing in an input field
  const isTypingInInput = useCallback(
    (target: HTMLElement): boolean =>
      target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable,
    []
  );

  // Check if target is the compose input
  const isComposeInput = useCallback(
    (target: HTMLElement): boolean => {
      if (!composeInputRef?.current) {
        return false;
      }
      return target === composeInputRef.current;
    },
    [composeInputRef]
  );

  // Handle send message shortcut
  const handleSendShortcut = useCallback(
    (event: KeyboardEvent, target: HTMLElement): boolean => {
      if (!isComposeInput(target)) {
        return false;
      }
      if (!handlers.onSendMessage) {
        return false;
      }

      const isEnter = event.key === "Enter" && !event.shiftKey;
      const hasModifier = event.metaKey || event.ctrlKey;

      // If requireModifierToSend is true, only send with Cmd/Ctrl+Enter
      // Otherwise, Enter sends (Shift+Enter for newline)
      if (requireModifierToSend) {
        if (isEnter && hasModifier) {
          event.preventDefault();
          handlers.onSendMessage();
          return true;
        }
      } else if (isEnter && !hasModifier) {
        event.preventDefault();
        handlers.onSendMessage();
        return true;
      }

      return false;
    },
    [handlers, isComposeInput, requireModifierToSend]
  );

  // Handle navigation shortcuts (when not typing)
  const handleNavigationShortcut = useCallback(
    (event: KeyboardEvent): boolean => {
      if (event.key === "ArrowUp") {
        event.preventDefault();
        handlers.onNavigateUp?.();
        return true;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        handlers.onNavigateDown?.();
        return true;
      }

      return false;
    },
    [handlers]
  );

  // Handle single key shortcuts (when not typing)
  const handleSingleKeyShortcut = useCallback(
    (key: string, event: KeyboardEvent): boolean => {
      // Check custom handlers first
      const customHandler = customHandlersRef.current.get(key);
      if (customHandler) {
        event.preventDefault();
        customHandler();
        return true;
      }

      switch (key) {
        case "/":
          event.preventDefault();
          handlers.onFocusSearch?.();
          return true;

        case "n":
          event.preventDefault();
          handlers.onFocusCompose?.();
          return true;

        case "k":
          if (!isPanelOpen) {
            event.preventDefault();
            handlers.onToggleQuickReplies?.();
            return true;
          }
          break;

        case "b":
          if (!isPanelOpen) {
            event.preventDefault();
            handlers.onToggleBookingContext?.();
            return true;
          }
          break;

        case "r":
          event.preventDefault();
          handlers.onMarkRead?.();
          return true;

        // Number keys 1-9 for quick conversation selection
        default:
          if (NUMBER_KEY_REGEX.test(key)) {
            event.preventDefault();
            handlers.onSelectConversation?.(Number.parseInt(key, 10) - 1);
            return true;
          }
      }

      return false;
    },
    [handlers, isPanelOpen]
  );

  // Handle escape key
  const handleEscapeShortcut = useCallback(
    (event: KeyboardEvent, target: HTMLElement): boolean => {
      if (event.key !== "Escape") {
        return false;
      }

      // If a panel is open, close it
      if (isPanelOpen) {
        event.preventDefault();
        handlers.onClosePanel?.();
        return true;
      }

      // If typing in compose input, blur it
      if (isComposeInput(target)) {
        event.preventDefault();
        (target as HTMLElement).blur();
        return true;
      }

      // Otherwise, call close panel handler
      handlers.onClosePanel?.();
      return true;
    },
    [handlers, isPanelOpen, isComposeInput]
  );

  // Register custom shortcut
  const registerShortcut = useCallback((key: string, handler: () => void) => {
    customHandlersRef.current.set(key.toLowerCase(), handler);

    // Return unregister function
    return () => {
      customHandlersRef.current.delete(key.toLowerCase());
    };
  }, []);

  // Get shortcut hints for display
  const getShortcutHints = useCallback(() => SHORTCUT_HINTS, []);

  // Update modifier tracking helper
  const updateModifiers = useCallback((event: KeyboardEvent) => {
    modifiersRef.current = {
      meta: event.metaKey,
      ctrl: event.ctrlKey,
      shift: event.shiftKey,
      alt: event.altKey,
    };
  }, []);

  // Process keyboard event (extracted to reduce complexity)
  const processKeyboardEvent = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isTyping = isTypingInInput(target);
      const key = event.key.toLowerCase();

      // Always handle Escape
      if (handleEscapeShortcut(event, target)) {
        return;
      }

      // Handle send message when in compose input
      if (isTyping && isComposeInput(target)) {
        handleSendShortcut(event, target);
        return;
      }

      // Block shortcuts while typing in other inputs
      if (isTyping) {
        return;
      }

      // Handle navigation shortcuts
      if (handleNavigationShortcut(event)) {
        return;
      }

      // Handle single key shortcuts
      handleSingleKeyShortcut(key, event);
    },
    [
      isTypingInInput,
      isComposeInput,
      handleEscapeShortcut,
      handleSendShortcut,
      handleNavigationShortcut,
      handleSingleKeyShortcut,
    ]
  );

  // Main keyboard event handler
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      updateModifiers(event);
      processKeyboardEvent(event);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      updateModifiers(event);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [enabled, updateModifiers, processKeyboardEvent]);

  return {
    modifiers: modifiersRef.current,
    registerShortcut,
    getShortcutHints,
  };
}

// ============================================================================
// Utility: Keyboard Shortcut Display Component Helper
// ============================================================================

/**
 * Format a key for display (e.g., "meta" -> "⌘" on Mac, "Ctrl" on Windows)
 */
export function formatKeyForDisplay(key: string, isMac = true): string {
  const keyMap: Record<string, [string, string]> = {
    meta: ["⌘", "Ctrl"],
    ctrl: ["⌃", "Ctrl"],
    alt: ["⌥", "Alt"],
    shift: ["⇧", "Shift"],
    enter: ["↵", "Enter"],
    escape: ["Esc", "Esc"],
    arrowup: ["↑", "↑"],
    arrowdown: ["↓", "↓"],
    arrowleft: ["←", "←"],
    arrowright: ["→", "→"],
  };

  const mapped = keyMap[key.toLowerCase()];
  if (mapped) {
    return isMac ? mapped[0] : mapped[1];
  }

  return key.toUpperCase();
}

/**
 * Create keyboard shortcut display string (e.g., "⌘+K" or "Ctrl+K")
 */
export function formatShortcut(keys: string[], isMac = true): string {
  return keys.map((k) => formatKeyForDisplay(k, isMac)).join("+");
}

// ============================================================================
// Utility: Detect Platform
// ============================================================================

/**
 * Check if running on macOS
 */
export function isMacOS(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }
  return navigator.platform.toUpperCase().indexOf("MAC") >= 0;
}
