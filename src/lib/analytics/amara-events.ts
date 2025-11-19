/**
 * Amara Analytics Event Tracking
 *
 * Type-safe PostHog event tracking for Amara Generative UI.
 * Tracks user interactions with streamable UI components.
 */

/**
 * Component types that can be rendered in Amara
 */
export type AmaraComponentType =
  | 'professional_card'
  | 'professional_list'
  | 'availability_selector'
  | 'booking_summary'
  | 'loading_state'
  | 'error_state';

/**
 * User actions on Amara components
 */
export type AmaraAction =
  | 'book_now'
  | 'check_availability'
  | 'select_time'
  | 'confirm_booking'
  | 'view_details'
  | 'dismiss';

/**
 * Amara event properties
 */
export type AmaraEventProperties = {
  component_type?: AmaraComponentType;
  tool_name?: string;
  action?: AmaraAction;
  professional_id?: string;
  professional_name?: string;
  conversation_id?: string;
  message_count?: number;
  time_to_action_ms?: number;
  timestamp?: string;
  [key: string]: any;
};

/**
 * Track when Amara V2 is enabled for a user
 */
export function trackAmaraV2Enabled(userId: string) {
  if (typeof window === 'undefined' || !(window as any).posthog) {
    return;
  }

  (window as any).posthog.capture('amara_v2_enabled', {
    user_id: userId,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track when a component is rendered in the chat
 */
export function trackAmaraComponentRendered(
  componentType: AmaraComponentType,
  toolName: string,
  additionalProps?: AmaraEventProperties
) {
  if (typeof window === 'undefined' || !(window as any).posthog) {
    return;
  }

  (window as any).posthog.capture('amara_component_rendered', {
    component_type: componentType,
    tool_name: toolName,
    timestamp: new Date().toISOString(),
    ...additionalProps,
  });
}

/**
 * Track when a user clicks on a component
 */
export function trackAmaraComponentClicked(
  componentType: AmaraComponentType,
  action: AmaraAction,
  additionalProps?: AmaraEventProperties
) {
  if (typeof window === 'undefined' || !(window as any).posthog) {
    return;
  }

  (window as any).posthog.capture('amara_component_clicked', {
    component_type: componentType,
    action,
    timestamp: new Date().toISOString(),
    ...additionalProps,
  });
}

/**
 * Track when a booking draft is created
 */
export function trackAmaraBookingDrafted(props: {
  professionalId: string;
  professionalName: string;
  conversationId: string;
  messageCount: number;
  timeToActionMs?: number;
}) {
  if (typeof window === 'undefined' || !(window as any).posthog) {
    return;
  }

  (window as any).posthog.capture('amara_booking_drafted', {
    professional_id: props.professionalId,
    professional_name: props.professionalName,
    conversation_id: props.conversationId,
    message_count: props.messageCount,
    time_to_action_ms: props.timeToActionMs,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track when an error occurs in Amara V2
 */
export function trackAmaraError(props: {
  error: string;
  context?: string;
  conversationId?: string;
  toolName?: string;
}) {
  if (typeof window === 'undefined' || !(window as any).posthog) {
    return;
  }

  (window as any).posthog.capture('amara_error', {
    error: props.error,
    context: props.context,
    conversation_id: props.conversationId,
    tool_name: props.toolName,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track conversation start
 */
export function trackAmaraConversationStarted(conversationId: string, version: 'v1' | 'v2') {
  if (typeof window === 'undefined' || !(window as any).posthog) {
    return;
  }

  (window as any).posthog.capture('amara_conversation_started', {
    conversation_id: conversationId,
    version,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track message sent
 */
export function trackAmaraMessageSent(props: {
  conversationId: string;
  messageCount: number;
  version: 'v1' | 'v2';
}) {
  if (typeof window === 'undefined' || !(window as any).posthog) {
    return;
  }

  (window as any).posthog.capture('amara_message_sent', {
    conversation_id: props.conversationId,
    message_count: props.messageCount,
    version: props.version,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Convenience hook for tracking component lifecycle
 */
export function useAmaraComponentTracking(
  componentType: AmaraComponentType,
  toolName: string
) {
  if (typeof window !== 'undefined') {
    // Track render on mount
    const renderTime = Date.now();
    trackAmaraComponentRendered(componentType, toolName);

    return {
      trackClick: (action: AmaraAction, additionalProps?: AmaraEventProperties) => {
        const timeToAction = Date.now() - renderTime;
        trackAmaraComponentClicked(componentType, action, {
          time_to_action_ms: timeToAction,
          ...additionalProps,
        });
      },
    };
  }

  return {
    trackClick: () => {},
  };
}
