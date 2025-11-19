/**
 * Amara Chat Server Action (Generative UI)
 *
 * Handles streaming chat conversations with Amara AI assistant using Vercel AI SDK streamUI.
 * Renders interactive React components directly in the chat stream.
 */

'use server';

import { createStreamableUI, createStreamableValue, getMutableAIState, streamUI } from 'ai/rsc';
import { z } from 'zod';
import { AMARA_MODEL_CONFIG, amaraModel, validateAmaraConfig } from '@/lib/amara/ai-client';
import { getAmaraSystemPrompt } from '@/lib/amara/prompts';
import {
  amaraToolActions,
  amaraToolSchemas,
  searchProfessionalsSchema,
  checkAvailabilitySchema,
  createBookingDraftSchema,
} from '@/lib/amara/tools-rsc';
import { logger } from '@/lib/logger';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import type { ChatMessage } from '@/lib/validations/amara';
import { ProfessionalList } from '@/components/amara/rsc/professional-list';
import {
  AvailabilitySelector,
  AvailabilitySelectorError,
} from '@/components/amara/rsc/availability-selector';
import {
  BookingSummary,
  BookingSummaryError,
} from '@/components/amara/rsc/booking-summary';
import { trackAmaraComponentRendered } from '@/lib/analytics/amara-events';

/**
 * Message type for AI state management
 */
export type ServerMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  display?: React.ReactNode;
};

/**
 * AI State for conversation context
 */
export type AIState = {
  conversationId: string | null;
  userId: string | null;
  messages: ServerMessage[];
};

/**
 * UI State returned to the client
 */
export type UIState = Array<{
  id: string;
  role: 'user' | 'assistant';
  display: React.ReactNode;
}>;

const MESSAGE_STATUS = {
  SUBMITTED: 'submitted',
  STREAMING: 'streaming',
  COMPLETED: 'completed',
  ERROR: 'error',
} as const;

/**
 * Continue conversation with Amara (streamUI)
 */
export async function continueConversation(input: {
  message: string;
  conversationId?: string;
}): Promise<{
  id: string;
  role: 'assistant';
  display: React.ReactNode;
}> {
  'use server';

  try {
    // Validate AI configuration
    validateAmaraConfig();

    // Authenticate user
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Authentication required');
    }

    // Get user profile for context
    const { data: profile } = await supabase
      .from('profiles')
      .select('locale, full_name')
      .eq('id', user.id)
      .maybeSingle();

    // Get customer profile for city info (if available)
    const { data: customerProfile } = await supabase
      .from('customer_profiles')
      .select('city')
      .eq('profile_id', user.id)
      .maybeSingle();

    // Prepare user context for system prompt
    const userContext = {
      locale: profile?.locale || 'en',
      name: profile?.full_name || undefined,
      city: customerProfile?.city || undefined,
      userId: user.id,
    };

    // Get or create conversation
    const activeConversationId = await getOrCreateConversation({
      supabase,
      conversationId: input.conversationId,
      userId: user.id,
      locale: userContext.locale,
    });

    // Persist user message
    await persistUserMessage({
      supabase,
      conversationId: activeConversationId,
      message: { role: 'user', content: input.message },
      locale: userContext.locale,
    });

    // Get system prompt
    const systemPrompt = getAmaraSystemPrompt(userContext);

    // Log chat initiation for analytics
    logger.info('Amara chat initiated (streamUI)', {
      userId: user.id,
      conversationId: activeConversationId,
      locale: userContext.locale,
    });

    // Get mutable AI state to track conversation
    const aiState = getMutableAIState();

    // Add user message to AI state
    aiState.update({
      ...aiState.get(),
      conversationId: activeConversationId,
      userId: user.id,
      messages: [
        ...(aiState.get().messages || []),
        {
          id: crypto.randomUUID(),
          role: 'user' as const,
          content: input.message,
        },
      ],
    });

    // Stream UI response using Vercel AI SDK
    const result = await streamUI({
      model: amaraModel,
      system: systemPrompt,
      messages: aiState.get().messages || [],
      text: ({ content, done }) => {
        // Stream text content as it arrives
        if (done) {
          // Add assistant message to AI state when complete
          aiState.done({
            ...aiState.get(),
            messages: [
              ...(aiState.get().messages || []),
              {
                id: crypto.randomUUID(),
                role: 'assistant' as const,
                content,
              },
            ],
          });
        }
        return <div className="text-neutral-700">{content}</div>;
      },
      tools: {
        searchProfessionals: {
          description: 'Search for cleaning professionals based on criteria',
          parameters: searchProfessionalsSchema,
          generate: async function* (params) {
            // Create streamable UI for progressive rendering
            const toolCallId = crypto.randomUUID();
            const streamableUI = createStreamableUI(
              <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                <span className="text-neutral-700">
                  Searching for {params.serviceType || 'cleaning'} professionals
                  {params.city ? ` in ${params.city}` : ''}...
                </span>
              </div>
            );

            // Execute the search
            const result = await amaraToolActions.searchProfessionals(params);

            // Update UI with results
            if (result.success && result.professionals.length > 0) {
              streamableUI.done(
                <ProfessionalList
                  professionals={result.professionals}
                  totalFound={result.totalFound}
                  searchParams={params}
                />
              );
            } else {
              streamableUI.done(
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-6 py-8 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-neutral-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-neutral-900">
                    No professionals found
                  </h3>
                  <p className="mt-2 text-sm text-neutral-600">
                    {result.error || 'Try adjusting your search criteria or location.'}
                  </p>
                </div>
              );
            }

            return streamableUI.value;
          },
        },

        checkAvailability: {
          description: 'Check availability for a specific professional',
          parameters: checkAvailabilitySchema,
          generate: async function* (params) {
            const streamableUI = createStreamableUI(
              <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                <span className="text-neutral-700">Checking availability...</span>
              </div>
            );

            // Execute availability check
            const result = await amaraToolActions.checkAvailability(params);

            // Update UI with results
            if (result.success && result.availability && result.availability.length > 0) {
              // Fetch professional name from database
              const supabase = await createSupabaseServerClient();
              const { data: professional } = await supabase
                .from('professional_profiles')
                .select('user:profiles!inner(full_name)')
                .eq('id', params.professionalId)
                .maybeSingle();

              const professionalName =
                (professional?.user as { full_name: string } | null)?.full_name || 'Professional';

              // Track component rendered
              await trackAmaraComponentRendered(
                'availability_selector',
                aiState.get().conversationId || 'unknown',
                {
                  professional_id: params.professionalId,
                  date_range: `${result.startDate} to ${result.endDate}`,
                  available_slots: result.availability.length,
                }
              );

              streamableUI.done(
                <AvailabilitySelector
                  professionalId={params.professionalId}
                  professionalName={professionalName}
                  startDate={result.startDate}
                  endDate={result.endDate}
                  availability={result.availability}
                  instantBooking={result.instantBooking}
                  conversationId={aiState.get().conversationId || undefined}
                />
              );
            } else {
              streamableUI.done(
                <AvailabilitySelectorError
                  error={result.error || 'No availability found for this professional'}
                  professionalId={params.professionalId}
                />
              );
            }

            return streamableUI.value;
          },
        },

        createBookingDraft: {
          description:
            'Create a booking draft summary for the user to review before confirming. Use this when the user has selected a specific date and time from the availability calendar.',
          parameters: createBookingDraftSchema,
          generate: async function* (params) {
            const streamableUI = createStreamableUI(
              <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                <span className="text-neutral-700">Creating booking summary...</span>
              </div>
            );

            // Execute booking draft creation
            const result = await amaraToolActions.createBookingDraft(params);

            // Update UI with results
            if (result.success && result.bookingDraft) {
              const draft = result.bookingDraft;

              // Fetch professional profile for photo
              const supabase = await createSupabaseServerClient();
              const { data: professional } = await supabase
                .from('professional_profiles')
                .select('user:profiles!inner(avatar_url)')
                .eq('id', params.professionalId)
                .maybeSingle();

              const professionalPhoto =
                (professional?.user as { avatar_url: string | null } | null)?.avatar_url || null;

              // Extract date and time from scheduledStart (ISO format: YYYY-MM-DDTHH:mm:ssZ)
              const scheduledDate = new Date(params.scheduledStart);
              const selectedDate = scheduledDate.toISOString().split('T')[0]; // YYYY-MM-DD
              const selectedTime = scheduledDate.toTimeString().slice(0, 5); // HH:MM

              // Track component rendered
              await trackAmaraComponentRendered(
                'booking_summary',
                aiState.get().conversationId || 'unknown',
                {
                  professional_id: params.professionalId,
                  service_name: params.serviceName,
                  scheduled_start: params.scheduledStart,
                  duration_hours: params.durationHours,
                  estimated_cost: draft.estimatedCostCop,
                }
              );

              streamableUI.done(
                <BookingSummary
                  professionalId={params.professionalId}
                  professionalName={params.professionalName}
                  professionalPhoto={professionalPhoto}
                  serviceType={params.serviceName}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  estimatedDuration={params.durationHours}
                  estimatedPrice={draft.estimatedCostCop}
                  instantBooking={false} // TODO: Get from professional's instant booking settings
                  conversationId={aiState.get().conversationId || undefined}
                />
              );
            } else {
              streamableUI.done(
                <BookingSummaryError
                  error={result.error || 'Failed to create booking summary'}
                  professionalId={params.professionalId}
                />
              );
            }

            return streamableUI.value;
          },
        },
      },
      onFinish: async (event) => {
        try {
          await handleAssistantCompletion({
            supabase,
            event,
            conversationId: activeConversationId,
            userId: user.id,
          });
        } catch (saveError) {
          logger.error('Error saving conversation', {
            error: saveError,
            userId: user.id,
            conversationId: activeConversationId,
          });
        }
      },
    });

    return {
      id: crypto.randomUUID(),
      role: 'assistant' as const,
      display: result.value,
    };
  } catch (error) {
    logger.error('Amara chat error (streamUI)', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
    });

    // Return error UI component
    return {
      id: crypto.randomUUID(),
      role: 'assistant' as const,
      display: (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          Sorry, I encountered an error. Please try again.
        </div>
      ),
    };
  }
}

/**
 * Get or create conversation
 */
async function getOrCreateConversation({
  supabase,
  conversationId,
  userId,
  locale,
}: {
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  conversationId?: string;
  userId: string;
  locale: string;
}): Promise<string> {
  if (conversationId) {
    const { data: existingConversation, error: existingConversationError } = await supabase
      .from('amara_conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingConversationError || !existingConversation) {
      throw new Error('Conversation not found');
    }

    return existingConversation.id;
  }

  const now = new Date().toISOString();
  const { data: createdConversation, error: conversationInsertError } = await supabase
    .from('amara_conversations')
    .insert({
      user_id: userId,
      locale,
      is_active: true,
      last_message_at: now,
    })
    .select('id')
    .single();

  if (conversationInsertError || !createdConversation) {
    throw new Error('Unable to create conversation');
  }

  return createdConversation.id;
}

/**
 * Persist user message
 */
async function persistUserMessage({
  supabase,
  conversationId,
  message,
  locale,
}: {
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  conversationId: string;
  message: ChatMessage;
  locale: string;
}) {
  const timestamp = new Date().toISOString();
  const content = typeof message.content === 'string' ? message.content : '';

  const { data, error } = await supabase
    .from('amara_messages')
    .insert({
      conversation_id: conversationId,
      role: 'user',
      content,
      parts: [{ type: 'text', text: content }],
      attachments: [],
      status: MESSAGE_STATUS.SUBMITTED,
      metadata: {
        locale,
        source: 'web',
        submittedAt: timestamp,
      },
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error('Failed to save user message');
  }

  await supabase
    .from('amara_conversations')
    .update({ last_message_at: timestamp })
    .eq('id', conversationId);

  return data.id;
}

/**
 * Handle assistant completion
 */
async function handleAssistantCompletion({
  supabase,
  event,
  conversationId,
  userId,
}: {
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  event: any; // Allow any AI SDK event structure
  conversationId: string;
  userId: string;
}) {
  const timestamp = new Date().toISOString();

  const { data: assistantMessage, error: assistantError } = await supabase
    .from('amara_messages')
    .insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: event.text || '',
      parts: [],
      attachments: [],
      tool_calls: event.toolCalls?.length ? event.toolCalls : null,
      metadata: {
        model: AMARA_MODEL_CONFIG.name,
        usage: event.usage,
        finishReason: event.finishReason,
        timestamp,
      },
      status: event.finishReason === 'error' ? MESSAGE_STATUS.ERROR : MESSAGE_STATUS.COMPLETED,
    })
    .select('id')
    .single();

  if (assistantError || !assistantMessage) {
    throw assistantError ?? new Error('Failed to store assistant message');
  }

  await supabase
    .from('amara_conversations')
    .update({ last_message_at: timestamp })
    .eq('id', conversationId);

  logger.info('Amara chat completed (streamUI)', {
    userId,
    conversationId,
    tokensUsed: event.usage?.totalTokens || 0,
    toolCallCount: event.toolCalls?.length || 0,
  });
}
