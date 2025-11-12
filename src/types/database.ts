/**
 * Database Types for Casaora
 *
 * Core table types for type-safe database queries.
 * Generated from Supabase schema on 2025-11-07
 *
 * Usage:
 * import type { Tables, TablesInsert, TablesUpdate } from '@/types/database';
 *
 * type Booking = Tables<'bookings'>;
 * type BookingInsert = TablesInsert<'bookings'>;
 * type BookingUpdate = TablesUpdate<'bookings'>;
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: "customer" | "professional" | "admin";
          onboarding_status: "pending" | "completed" | "suspended";
          phone: string | null;
          phone_verified: boolean;
          sms_notifications_enabled: boolean;
          phone_verification_code: string | null;
          phone_verification_sent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: "customer" | "professional" | "admin";
          onboarding_status?: "pending" | "completed" | "suspended";
          phone?: string | null;
          phone_verified?: boolean;
          sms_notifications_enabled?: boolean;
          phone_verification_code?: string | null;
          phone_verification_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: "customer" | "professional" | "admin";
          onboarding_status?: "pending" | "completed" | "suspended";
          phone?: string | null;
          phone_verified?: boolean;
          sms_notifications_enabled?: boolean;
          phone_verification_code?: string | null;
          phone_verification_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          customer_id: string;
          professional_id: string;
          status:
            | "pending"
            | "authorized"
            | "confirmed"
            | "in_progress"
            | "completed"
            | "cancelled"
            | "disputed";
          service_name: string;
          scheduled_start: string;
          scheduled_end: string | null;
          duration_minutes: number;
          total_amount: number;
          deposit_amount: number | null;
          deposit_captured_at: string | null;
          insurance_fee: number;
          requires_insurance: boolean;
          final_amount_captured: number | null;
          amount_authorized: number | null;
          stripe_payment_status: string | null;
          address: Json;
          notes: string | null;
          check_in_time: string | null;
          check_out_time: string | null;
          actual_duration_minutes: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          professional_id: string;
          status?:
            | "pending"
            | "authorized"
            | "confirmed"
            | "in_progress"
            | "completed"
            | "cancelled"
            | "disputed";
          service_name: string;
          scheduled_start: string;
          scheduled_end?: string | null;
          duration_minutes: number;
          total_amount: number;
          deposit_amount?: number | null;
          deposit_captured_at?: string | null;
          insurance_fee?: number;
          requires_insurance?: boolean;
          final_amount_captured?: number | null;
          amount_authorized?: number | null;
          stripe_payment_status?: string | null;
          address: Json;
          notes?: string | null;
          check_in_time?: string | null;
          check_out_time?: string | null;
          actual_duration_minutes?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          professional_id?: string;
          status?:
            | "pending"
            | "authorized"
            | "confirmed"
            | "in_progress"
            | "completed"
            | "cancelled"
            | "disputed";
          service_name?: string;
          scheduled_start?: string;
          scheduled_end?: string | null;
          duration_minutes?: number;
          total_amount?: number;
          deposit_amount?: number | null;
          deposit_captured_at?: string | null;
          insurance_fee?: number;
          requires_insurance?: boolean;
          final_amount_captured?: number | null;
          amount_authorized?: number | null;
          stripe_payment_status?: string | null;
          address?: Json;
          notes?: string | null;
          check_in_time?: string | null;
          check_out_time?: string | null;
          actual_duration_minutes?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      help_articles: {
        Row: {
          id: string;
          category_id: string;
          slug: string;
          title_en: string;
          title_es: string;
          excerpt_en: string | null;
          excerpt_es: string | null;
          content_en: string;
          content_es: string;
          view_count: number;
          helpful_count: number;
          not_helpful_count: number;
          is_published: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          slug: string;
          title_en: string;
          title_es: string;
          excerpt_en?: string | null;
          excerpt_es?: string | null;
          content_en: string;
          content_es: string;
          view_count?: number;
          helpful_count?: number;
          not_helpful_count?: number;
          is_published?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          slug?: string;
          title_en?: string;
          title_es?: string;
          excerpt_en?: string | null;
          excerpt_es?: string | null;
          content_en?: string;
          content_es?: string;
          view_count?: number;
          helpful_count?: number;
          not_helpful_count?: number;
          is_published?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      help_categories: {
        Row: {
          id: string;
          slug: string;
          name_en: string;
          name_es: string;
          description_en: string | null;
          description_es: string | null;
          icon_name: string | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name_en: string;
          name_es: string;
          description_en?: string | null;
          description_es?: string | null;
          icon_name?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name_en?: string;
          name_es?: string;
          description_en?: string | null;
          description_es?: string | null;
          icon_name?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          booking_id: string;
          customer_id: string;
          professional_id: string;
          last_message_at: string | null;
          customer_unread_count: number;
          professional_unread_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          customer_id: string;
          professional_id: string;
          last_message_at?: string | null;
          customer_unread_count?: number;
          professional_unread_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          customer_id?: string;
          professional_id?: string;
          last_message_at?: string | null;
          customer_unread_count?: number;
          professional_unread_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          message: string;
          attachments: string[];
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          message: string;
          attachments?: string[];
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          message?: string;
          attachments?: string[];
          read_at?: string | null;
          created_at?: string;
        };
      };
      professional_profiles: {
        Row: {
          profile_id: string;
          full_name: string;
          bio: string | null;
          hourly_rate: number | null;
          services: Json;
          availability: Json;
          portfolio_urls: string[];
          rating: number | null;
          total_reviews: number;
          completed_bookings: number;
          stripe_account_id: string | null;
          stripe_onboarding_complete: boolean;
          emergency_contact: Json;
          latest_background_check_id: string | null;
          background_check_status: string;
          latest_interview_id: string | null;
          interview_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          profile_id: string;
          full_name: string;
          bio?: string | null;
          hourly_rate?: number | null;
          services?: Json;
          availability?: Json;
          portfolio_urls?: string[];
          rating?: number | null;
          total_reviews?: number;
          completed_bookings?: number;
          stripe_account_id?: string | null;
          stripe_onboarding_complete?: boolean;
          emergency_contact?: Json;
          latest_background_check_id?: string | null;
          background_check_status?: string;
          latest_interview_id?: string | null;
          interview_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          profile_id?: string;
          full_name?: string;
          bio?: string | null;
          hourly_rate?: number | null;
          services?: Json;
          availability?: Json;
          portfolio_urls?: string[];
          rating?: number | null;
          total_reviews?: number;
          completed_bookings?: number;
          stripe_account_id?: string | null;
          stripe_onboarding_complete?: boolean;
          emergency_contact?: Json;
          latest_background_check_id?: string | null;
          background_check_status?: string;
          latest_interview_id?: string | null;
          interview_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      disputes: {
        Row: {
          id: string;
          booking_id: string;
          filed_by: string;
          dispute_type: "quality" | "no_show" | "billing" | "other";
          description: string;
          evidence_urls: string[];
          status: "filed" | "investigating" | "resolved" | "closed";
          resolution_notes: string | null;
          resolution_action: string | null;
          refund_amount: number | null;
          resolved_at: string | null;
          resolved_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          filed_by: string;
          dispute_type: "quality" | "no_show" | "billing" | "other";
          description: string;
          evidence_urls?: string[];
          status?: "filed" | "investigating" | "resolved" | "closed";
          resolution_notes?: string | null;
          resolution_action?: string | null;
          refund_amount?: number | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          filed_by?: string;
          dispute_type?: "quality" | "no_show" | "billing" | "other";
          description?: string;
          evidence_urls?: string[];
          status?: "filed" | "investigating" | "resolved" | "closed";
          resolution_notes?: string | null;
          resolution_action?: string | null;
          refund_amount?: number | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      increment_article_view_count: {
        Args: { article_id: string };
        Returns: undefined;
      };
      are_users_blocked: {
        Args: { user1_id: string; user2_id: string };
        Returns: boolean;
      };
      calculate_deposit_amount: {
        Args: { booking_total: number; deposit_percentage: number };
        Returns: number;
      };
      calculate_refund_amount: {
        Args: { booking_id: string; cancellation_time: string };
        Returns: number;
      };
    };
    Enums: {
      app_role: "customer" | "professional" | "admin";
      booking_status:
        | "pending"
        | "authorized"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "disputed";
      dispute_type: "quality" | "no_show" | "billing" | "other";
      dispute_status: "filed" | "investigating" | "resolved" | "closed";
    };
  };
};

// Helper types for table operations
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T];

// Commonly used types
export type Booking = Tables<"bookings">;
export type Profile = Tables<"profiles">;
export type HelpArticle = Tables<"help_articles">;
export type HelpCategory = Tables<"help_categories">;
export type Conversation = Tables<"conversations">;
export type Message = Tables<"messages">;
export type ProfessionalProfile = Tables<"professional_profiles">;
export type Dispute = Tables<"disputes">;

// Insert types
export type BookingInsert = TablesInsert<"bookings">;
export type ProfileInsert = TablesInsert<"profiles">;
export type HelpArticleInsert = TablesInsert<"help_articles">;
export type MessageInsert = TablesInsert<"messages">;

// Update types
export type BookingUpdate = TablesUpdate<"bookings">;
export type ProfileUpdate = TablesUpdate<"profiles">;
export type HelpArticleUpdate = TablesUpdate<"help_articles">;
export type MessageUpdate = TablesUpdate<"messages">;

// Enum types
export type AppRole = Enums<"app_role">;
export type BookingStatus = Enums<"booking_status">;
export type DisputeType = Enums<"dispute_type">;
export type DisputeStatus = Enums<"dispute_status">;
