export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action_type: string;
          admin_id: string;
          created_at: string;
          details: Json | null;
          id: string;
          notes: string | null;
          target_resource_id: string | null;
          target_resource_type: string | null;
          target_user_id: string | null;
        };
        Insert: {
          action_type: string;
          admin_id: string;
          created_at?: string;
          details?: Json | null;
          id?: string;
          notes?: string | null;
          target_resource_id?: string | null;
          target_resource_type?: string | null;
          target_user_id?: string | null;
        };
        Update: {
          action_type?: string;
          admin_id?: string;
          created_at?: string;
          details?: Json | null;
          id?: string;
          notes?: string | null;
          target_resource_id?: string | null;
          target_resource_type?: string | null;
          target_user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "admin_audit_logs_admin_id_fkey";
            columns: ["admin_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "admin_audit_logs_target_user_id_fkey";
            columns: ["target_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      admin_professional_reviews: {
        Row: {
          background_check_passed: boolean | null;
          created_at: string;
          documents_verified: boolean | null;
          id: string;
          internal_notes: string | null;
          interview_completed: boolean | null;
          notes: string | null;
          professional_id: string;
          references_verified: boolean | null;
          rejection_reason: string | null;
          review_type: string;
          reviewed_at: string | null;
          reviewed_by: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          background_check_passed?: boolean | null;
          created_at?: string;
          documents_verified?: boolean | null;
          id?: string;
          internal_notes?: string | null;
          interview_completed?: boolean | null;
          notes?: string | null;
          professional_id: string;
          references_verified?: boolean | null;
          rejection_reason?: string | null;
          review_type: string;
          reviewed_at?: string | null;
          reviewed_by: string;
          status: string;
          updated_at?: string;
        };
        Update: {
          background_check_passed?: boolean | null;
          created_at?: string;
          documents_verified?: boolean | null;
          id?: string;
          internal_notes?: string | null;
          interview_completed?: boolean | null;
          notes?: string | null;
          professional_id?: string;
          references_verified?: boolean | null;
          rejection_reason?: string | null;
          review_type?: string;
          reviewed_at?: string | null;
          reviewed_by?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admin_professional_reviews_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "professional_profiles";
            referencedColumns: ["profile_id"];
          },
          {
            foreignKeyName: "admin_professional_reviews_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      booking_disputes: {
        Row: {
          booking_id: string;
          created_at: string;
          customer_id: string;
          description: string;
          id: string;
          professional_id: string;
          reason: string;
          resolution_notes: string | null;
          resolved_at: string | null;
          resolved_by: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          booking_id: string;
          created_at?: string;
          customer_id: string;
          description: string;
          id?: string;
          professional_id: string;
          reason: string;
          resolution_notes?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          booking_id?: string;
          created_at?: string;
          customer_id?: string;
          description?: string;
          id?: string;
          professional_id?: string;
          reason?: string;
          resolution_notes?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "booking_disputes_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_disputes_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_disputes_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_disputes_resolved_by_fkey";
            columns: ["resolved_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      bookings: {
        Row: {
          actual_duration_minutes: number | null;
          addons_total_amount: number | null;
          address: Json | null;
          amount_authorized: number | null;
          amount_captured: number | null;
          amount_estimated: number | null;
          canceled_at: string | null;
          canceled_by: string | null;
          canceled_reason: string | null;
          check_in_latitude: number | null;
          check_in_longitude: number | null;
          check_out_latitude: number | null;
          check_out_longitude: number | null;
          checked_in_at: string | null;
          checked_out_at: string | null;
          completed_at: string | null;
          completion_notes: string | null;
          created_at: string;
          currency: string;
          customer_id: string;
          declined_at: string | null;
          declined_reason: string | null;
          duration_minutes: number | null;
          id: string;
          included_in_payout_id: string | null;
          is_recurring: boolean | null;
          parent_booking_id: string | null;
          professional_id: string;
          recurrence_instance_number: number | null;
          recurrence_pattern: Json | null;
          recurrence_status: string | null;
          scheduled_end: string | null;
          scheduled_start: string | null;
          selected_addons: Json | null;
          service_hourly_rate: number | null;
          service_name: string | null;
          special_instructions: string | null;
          status: string;
          stripe_payment_intent_id: string | null;
          stripe_payment_status: string | null;
          time_extension_amount: number | null;
          time_extension_minutes: number | null;
          updated_at: string;
        };
        Insert: {
          actual_duration_minutes?: number | null;
          addons_total_amount?: number | null;
          address?: Json | null;
          amount_authorized?: number | null;
          amount_captured?: number | null;
          amount_estimated?: number | null;
          canceled_at?: string | null;
          canceled_by?: string | null;
          canceled_reason?: string | null;
          check_in_latitude?: number | null;
          check_in_longitude?: number | null;
          check_out_latitude?: number | null;
          check_out_longitude?: number | null;
          checked_in_at?: string | null;
          checked_out_at?: string | null;
          completed_at?: string | null;
          completion_notes?: string | null;
          created_at?: string;
          currency?: string;
          customer_id: string;
          declined_at?: string | null;
          declined_reason?: string | null;
          duration_minutes?: number | null;
          id?: string;
          included_in_payout_id?: string | null;
          is_recurring?: boolean | null;
          parent_booking_id?: string | null;
          professional_id: string;
          recurrence_instance_number?: number | null;
          recurrence_pattern?: Json | null;
          recurrence_status?: string | null;
          scheduled_end?: string | null;
          scheduled_start?: string | null;
          selected_addons?: Json | null;
          service_hourly_rate?: number | null;
          service_name?: string | null;
          special_instructions?: string | null;
          status?: string;
          stripe_payment_intent_id?: string | null;
          stripe_payment_status?: string | null;
          time_extension_amount?: number | null;
          time_extension_minutes?: number | null;
          updated_at?: string;
        };
        Update: {
          actual_duration_minutes?: number | null;
          addons_total_amount?: number | null;
          address?: Json | null;
          amount_authorized?: number | null;
          amount_captured?: number | null;
          amount_estimated?: number | null;
          canceled_at?: string | null;
          canceled_by?: string | null;
          canceled_reason?: string | null;
          check_in_latitude?: number | null;
          check_in_longitude?: number | null;
          check_out_latitude?: number | null;
          check_out_longitude?: number | null;
          checked_in_at?: string | null;
          checked_out_at?: string | null;
          completed_at?: string | null;
          completion_notes?: string | null;
          created_at?: string;
          currency?: string;
          customer_id?: string;
          declined_at?: string | null;
          declined_reason?: string | null;
          duration_minutes?: number | null;
          id?: string;
          included_in_payout_id?: string | null;
          is_recurring?: boolean | null;
          parent_booking_id?: string | null;
          professional_id?: string;
          recurrence_instance_number?: number | null;
          recurrence_pattern?: Json | null;
          recurrence_status?: string | null;
          scheduled_end?: string | null;
          scheduled_start?: string | null;
          selected_addons?: Json | null;
          service_hourly_rate?: number | null;
          service_name?: string | null;
          special_instructions?: string | null;
          status?: string;
          stripe_payment_intent_id?: string | null;
          stripe_payment_status?: string | null;
          time_extension_amount?: number | null;
          time_extension_minutes?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_canceled_by_fkey";
            columns: ["canceled_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_included_in_payout_id_fkey";
            columns: ["included_in_payout_id"];
            isOneToOne: false;
            referencedRelation: "payouts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_parent_booking_id_fkey";
            columns: ["parent_booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "professional_profiles";
            referencedColumns: ["profile_id"];
          },
        ];
      };
      changelog_views: {
        Row: {
          changelog_id: string;
          created_at: string;
          dismissed_at: string | null;
          id: string;
          user_id: string;
          viewed_at: string;
        };
        Insert: {
          changelog_id: string;
          created_at?: string;
          dismissed_at?: string | null;
          id?: string;
          user_id: string;
          viewed_at?: string;
        };
        Update: {
          changelog_id?: string;
          created_at?: string;
          dismissed_at?: string | null;
          id?: string;
          user_id?: string;
          viewed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "changelog_views_changelog_id_fkey";
            columns: ["changelog_id"];
            isOneToOne: false;
            referencedRelation: "changelogs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "changelog_views_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      changelogs: {
        Row: {
          categories: string[] | null;
          content: string;
          created_at: string;
          created_by: string | null;
          featured_image_url: string | null;
          id: string;
          metadata: Json | null;
          published_at: string;
          slug: string;
          sprint_number: number;
          summary: string | null;
          tags: string[] | null;
          target_audience: string[] | null;
          title: string;
          updated_at: string | null;
          visibility: string;
        };
        Insert: {
          categories?: string[] | null;
          content: string;
          created_at?: string;
          created_by?: string | null;
          featured_image_url?: string | null;
          id?: string;
          metadata?: Json | null;
          published_at?: string;
          slug: string;
          sprint_number: number;
          summary?: string | null;
          tags?: string[] | null;
          target_audience?: string[] | null;
          title: string;
          updated_at?: string | null;
          visibility?: string;
        };
        Update: {
          categories?: string[] | null;
          content?: string;
          created_at?: string;
          created_by?: string | null;
          featured_image_url?: string | null;
          id?: string;
          metadata?: Json | null;
          published_at?: string;
          slug?: string;
          sprint_number?: number;
          summary?: string | null;
          tags?: string[] | null;
          target_audience?: string[] | null;
          title?: string;
          updated_at?: string | null;
          visibility?: string;
        };
        Relationships: [
          {
            foreignKeyName: "changelogs_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      conversations: {
        Row: {
          booking_id: string;
          created_at: string;
          customer_id: string;
          customer_unread_count: number | null;
          id: string;
          last_message_at: string | null;
          professional_id: string;
          professional_unread_count: number | null;
          updated_at: string;
        };
        Insert: {
          booking_id: string;
          created_at?: string;
          customer_id: string;
          customer_unread_count?: number | null;
          id?: string;
          last_message_at?: string | null;
          professional_id: string;
          professional_unread_count?: number | null;
          updated_at?: string;
        };
        Update: {
          booking_id?: string;
          created_at?: string;
          customer_id?: string;
          customer_unread_count?: number | null;
          id?: string;
          last_message_at?: string | null;
          professional_id?: string;
          professional_unread_count?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversations_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversations_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversations_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "professional_profiles";
            referencedColumns: ["profile_id"];
          },
        ];
      };
      cron_config: {
        Row: {
          api_url: string | null;
          cron_secret: string | null;
          id: number;
          updated_at: string | null;
        };
        Insert: {
          api_url?: string | null;
          cron_secret?: string | null;
          id?: number;
          updated_at?: string | null;
        };
        Update: {
          api_url?: string | null;
          cron_secret?: string | null;
          id?: number;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      customer_profiles: {
        Row: {
          booking_preferences: Json | null;
          created_at: string;
          default_address: Json | null;
          favorite_professionals: string[] | null;
          notification_preferences: Json | null;
          profile_id: string;
          property_preferences: Json;
          saved_addresses: Json | null;
          updated_at: string;
          verification_tier: string;
        };
        Insert: {
          booking_preferences?: Json | null;
          created_at?: string;
          default_address?: Json | null;
          favorite_professionals?: string[] | null;
          notification_preferences?: Json | null;
          profile_id: string;
          property_preferences?: Json;
          saved_addresses?: Json | null;
          updated_at?: string;
          verification_tier?: string;
        };
        Update: {
          booking_preferences?: Json | null;
          created_at?: string;
          default_address?: Json | null;
          favorite_professionals?: string[] | null;
          notification_preferences?: Json | null;
          profile_id?: string;
          property_preferences?: Json;
          saved_addresses?: Json | null;
          updated_at?: string;
          verification_tier?: string;
        };
        Relationships: [
          {
            foreignKeyName: "customer_profiles_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      customer_reviews: {
        Row: {
          booking_id: string;
          comment: string | null;
          communication_rating: number | null;
          created_at: string;
          customer_id: string;
          id: string;
          professional_id: string;
          punctuality_rating: number | null;
          rating: number;
          respectfulness_rating: number | null;
          title: string | null;
          updated_at: string;
        };
        Insert: {
          booking_id: string;
          comment?: string | null;
          communication_rating?: number | null;
          created_at?: string;
          customer_id: string;
          id?: string;
          professional_id: string;
          punctuality_rating?: number | null;
          rating: number;
          respectfulness_rating?: number | null;
          title?: string | null;
          updated_at?: string;
        };
        Update: {
          booking_id?: string;
          comment?: string | null;
          communication_rating?: number | null;
          created_at?: string;
          customer_id?: string;
          id?: string;
          professional_id?: string;
          punctuality_rating?: number | null;
          rating?: number;
          respectfulness_rating?: number | null;
          title?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "customer_reviews_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "customer_reviews_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "customer_reviews_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "professional_profiles";
            referencedColumns: ["profile_id"];
          },
        ];
      };
      disputes: {
        Row: {
          assigned_to: string | null;
          booking_id: string;
          created_at: string;
          customer_statement: string | null;
          description: string;
          dispute_type: string;
          evidence_urls: string[] | null;
          id: string;
          opened_by: string;
          opened_by_role: string;
          priority: string;
          professional_statement: string | null;
          refund_amount: number | null;
          resolution_action: string | null;
          resolution_notes: string | null;
          resolved_at: string | null;
          resolved_by: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          assigned_to?: string | null;
          booking_id: string;
          created_at?: string;
          customer_statement?: string | null;
          description: string;
          dispute_type: string;
          evidence_urls?: string[] | null;
          id?: string;
          opened_by: string;
          opened_by_role: string;
          priority?: string;
          professional_statement?: string | null;
          refund_amount?: number | null;
          resolution_action?: string | null;
          resolution_notes?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          assigned_to?: string | null;
          booking_id?: string;
          created_at?: string;
          customer_statement?: string | null;
          description?: string;
          dispute_type?: string;
          evidence_urls?: string[] | null;
          id?: string;
          opened_by?: string;
          opened_by_role?: string;
          priority?: string;
          professional_statement?: string | null;
          refund_amount?: number | null;
          resolution_action?: string | null;
          resolution_notes?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "disputes_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "disputes_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "disputes_opened_by_fkey";
            columns: ["opened_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "disputes_resolved_by_fkey";
            columns: ["resolved_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      etta_conversations: {
        Row: {
          created_at: string | null;
          id: string;
          is_active: boolean | null;
          last_message_at: string | null;
          locale: string | null;
          metadata: Json | null;
          title: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          last_message_at?: string | null;
          locale?: string | null;
          metadata?: Json | null;
          title?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          last_message_at?: string | null;
          locale?: string | null;
          metadata?: Json | null;
          title?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      etta_messages: {
        Row: {
          content: string;
          conversation_id: string;
          created_at: string | null;
          id: string;
          metadata: Json | null;
          role: string;
          tool_calls: Json | null;
          tool_results: Json | null;
        };
        Insert: {
          content: string;
          conversation_id: string;
          created_at?: string | null;
          id?: string;
          metadata?: Json | null;
          role: string;
          tool_calls?: Json | null;
          tool_results?: Json | null;
        };
        Update: {
          content?: string;
          conversation_id?: string;
          created_at?: string | null;
          id?: string;
          metadata?: Json | null;
          role?: string;
          tool_calls?: Json | null;
          tool_results?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "etta_messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "etta_conversations";
            referencedColumns: ["id"];
          },
        ];
      };
      feedback_submissions: {
        Row: {
          admin_notes: string | null;
          assigned_to: string | null;
          created_at: string;
          feedback_type: string;
          id: string;
          message: string;
          page_path: string;
          page_url: string;
          priority: string | null;
          resolved_at: string | null;
          resolved_by: string | null;
          screenshot_url: string | null;
          status: string;
          subject: string | null;
          updated_at: string;
          user_agent: string | null;
          user_email: string | null;
          user_id: string | null;
          user_role: string | null;
          viewport_size: Json | null;
        };
        Insert: {
          admin_notes?: string | null;
          assigned_to?: string | null;
          created_at?: string;
          feedback_type: string;
          id?: string;
          message: string;
          page_path: string;
          page_url: string;
          priority?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          screenshot_url?: string | null;
          status?: string;
          subject?: string | null;
          updated_at?: string;
          user_agent?: string | null;
          user_email?: string | null;
          user_id?: string | null;
          user_role?: string | null;
          viewport_size?: Json | null;
        };
        Update: {
          admin_notes?: string | null;
          assigned_to?: string | null;
          created_at?: string;
          feedback_type?: string;
          id?: string;
          message?: string;
          page_path?: string;
          page_url?: string;
          priority?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          screenshot_url?: string | null;
          status?: string;
          subject?: string | null;
          updated_at?: string;
          user_agent?: string | null;
          user_email?: string | null;
          user_id?: string | null;
          user_role?: string | null;
          viewport_size?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "feedback_submissions_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "feedback_submissions_resolved_by_fkey";
            columns: ["resolved_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      help_article_feedback: {
        Row: {
          article_id: string;
          created_at: string;
          feedback_text: string | null;
          id: string;
          is_helpful: boolean;
          session_id: string | null;
          user_id: string | null;
        };
        Insert: {
          article_id: string;
          created_at?: string;
          feedback_text?: string | null;
          id?: string;
          is_helpful: boolean;
          session_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          article_id?: string;
          created_at?: string;
          feedback_text?: string | null;
          id?: string;
          is_helpful?: boolean;
          session_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "help_article_feedback_article_id_fkey";
            columns: ["article_id"];
            isOneToOne: false;
            referencedRelation: "help_articles";
            referencedColumns: ["id"];
          },
        ];
      };
      help_article_relations: {
        Row: {
          article_id: string;
          created_at: string;
          related_article_id: string;
        };
        Insert: {
          article_id: string;
          created_at?: string;
          related_article_id: string;
        };
        Update: {
          article_id?: string;
          created_at?: string;
          related_article_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "help_article_relations_article_id_fkey";
            columns: ["article_id"];
            isOneToOne: false;
            referencedRelation: "help_articles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "help_article_relations_related_article_id_fkey";
            columns: ["related_article_id"];
            isOneToOne: false;
            referencedRelation: "help_articles";
            referencedColumns: ["id"];
          },
        ];
      };
      help_articles: {
        Row: {
          author_id: string | null;
          category_id: string;
          content_en: string;
          content_es: string;
          created_at: string;
          display_order: number;
          excerpt_en: string | null;
          excerpt_es: string | null;
          helpful_count: number;
          id: string;
          is_published: boolean;
          not_helpful_count: number;
          published_at: string | null;
          search_vector_en: unknown;
          search_vector_es: unknown;
          slug: string;
          title_en: string;
          title_es: string;
          updated_at: string;
          view_count: number;
        };
        Insert: {
          author_id?: string | null;
          category_id: string;
          content_en: string;
          content_es: string;
          created_at?: string;
          display_order?: number;
          excerpt_en?: string | null;
          excerpt_es?: string | null;
          helpful_count?: number;
          id?: string;
          is_published?: boolean;
          not_helpful_count?: number;
          published_at?: string | null;
          search_vector_en?: unknown;
          search_vector_es?: unknown;
          slug: string;
          title_en: string;
          title_es: string;
          updated_at?: string;
          view_count?: number;
        };
        Update: {
          author_id?: string | null;
          category_id?: string;
          content_en?: string;
          content_es?: string;
          created_at?: string;
          display_order?: number;
          excerpt_en?: string | null;
          excerpt_es?: string | null;
          helpful_count?: number;
          id?: string;
          is_published?: boolean;
          not_helpful_count?: number;
          published_at?: string | null;
          search_vector_en?: unknown;
          search_vector_es?: unknown;
          slug?: string;
          title_en?: string;
          title_es?: string;
          updated_at?: string;
          view_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: "help_articles_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "help_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      help_categories: {
        Row: {
          created_at: string;
          description_en: string | null;
          description_es: string | null;
          display_order: number;
          icon: string | null;
          id: string;
          is_active: boolean;
          name_en: string;
          name_es: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description_en?: string | null;
          description_es?: string | null;
          display_order?: number;
          icon?: string | null;
          id?: string;
          is_active?: boolean;
          name_en: string;
          name_es: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description_en?: string | null;
          description_es?: string | null;
          display_order?: number;
          icon?: string | null;
          id?: string;
          is_active?: boolean;
          name_en?: string;
          name_es?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          attachments: string[] | null;
          conversation_id: string;
          created_at: string;
          id: string;
          message: string;
          read_at: string | null;
          sender_id: string;
        };
        Insert: {
          attachments?: string[] | null;
          conversation_id: string;
          created_at?: string;
          id?: string;
          message: string;
          read_at?: string | null;
          sender_id: string;
        };
        Update: {
          attachments?: string[] | null;
          conversation_id?: string;
          created_at?: string;
          id?: string;
          message?: string;
          read_at?: string | null;
          sender_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      mobile_push_tokens: {
        Row: {
          app_version: string | null;
          created_at: string;
          device_name: string | null;
          expo_push_token: string;
          id: string;
          last_seen_at: string;
          platform: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          app_version?: string | null;
          created_at?: string;
          device_name?: string | null;
          expo_push_token: string;
          id?: string;
          last_seen_at?: string;
          platform?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          app_version?: string | null;
          created_at?: string;
          device_name?: string | null;
          expo_push_token?: string;
          id?: string;
          last_seen_at?: string;
          platform?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      notification_subscriptions: {
        Row: {
          auth: string;
          created_at: string | null;
          endpoint: string;
          id: string;
          p256dh: string;
          updated_at: string | null;
          user_agent: string | null;
          user_id: string;
        };
        Insert: {
          auth: string;
          created_at?: string | null;
          endpoint: string;
          id?: string;
          p256dh: string;
          updated_at?: string | null;
          user_agent?: string | null;
          user_id: string;
        };
        Update: {
          auth?: string;
          created_at?: string | null;
          endpoint?: string;
          id?: string;
          p256dh?: string;
          updated_at?: string | null;
          user_agent?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          body: string;
          created_at: string | null;
          id: string;
          read_at: string | null;
          tag: string | null;
          title: string;
          url: string | null;
          user_id: string;
        };
        Insert: {
          body: string;
          created_at?: string | null;
          id?: string;
          read_at?: string | null;
          tag?: string | null;
          title: string;
          url?: string | null;
          user_id: string;
        };
        Update: {
          body?: string;
          created_at?: string | null;
          id?: string;
          read_at?: string | null;
          tag?: string | null;
          title?: string;
          url?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      payouts: {
        Row: {
          arrival_date: string | null;
          booking_ids: string[];
          commission_amount: number;
          created_at: string;
          currency: string;
          failure_reason: string | null;
          gross_amount: number;
          id: string;
          net_amount: number;
          notes: string | null;
          payout_date: string | null;
          period_end: string;
          period_start: string;
          professional_id: string;
          status: string;
          stripe_connect_account_id: string;
          stripe_payout_id: string | null;
          updated_at: string;
        };
        Insert: {
          arrival_date?: string | null;
          booking_ids: string[];
          commission_amount: number;
          created_at?: string;
          currency?: string;
          failure_reason?: string | null;
          gross_amount: number;
          id?: string;
          net_amount: number;
          notes?: string | null;
          payout_date?: string | null;
          period_end: string;
          period_start: string;
          professional_id: string;
          status?: string;
          stripe_connect_account_id: string;
          stripe_payout_id?: string | null;
          updated_at?: string;
        };
        Update: {
          arrival_date?: string | null;
          booking_ids?: string[];
          commission_amount?: number;
          created_at?: string;
          currency?: string;
          failure_reason?: string | null;
          gross_amount?: number;
          id?: string;
          net_amount?: number;
          notes?: string | null;
          payout_date?: string | null;
          period_end?: string;
          period_start?: string;
          professional_id?: string;
          status?: string;
          stripe_connect_account_id?: string;
          stripe_payout_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payouts_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "professional_profiles";
            referencedColumns: ["profile_id"];
          },
        ];
      };
      pricing_faqs: {
        Row: {
          answer: string;
          category: string | null;
          created_at: string | null;
          display_order: number | null;
          id: string;
          is_visible: boolean | null;
          question: string;
          updated_at: string | null;
        };
        Insert: {
          answer: string;
          category?: string | null;
          created_at?: string | null;
          display_order?: number | null;
          id?: string;
          is_visible?: boolean | null;
          question: string;
          updated_at?: string | null;
        };
        Update: {
          answer?: string;
          category?: string | null;
          created_at?: string | null;
          display_order?: number | null;
          id?: string;
          is_visible?: boolean | null;
          question?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      pricing_plans: {
        Row: {
          billing_period: string | null;
          created_at: string | null;
          cta_text: string | null;
          cta_url: string | null;
          currency: string | null;
          description: string;
          display_order: number | null;
          features: Json;
          highlight_as_popular: boolean | null;
          id: string;
          is_visible: boolean | null;
          metadata: Json | null;
          name: string;
          price_annual: number | null;
          price_monthly: number | null;
          recommended_for: string | null;
          slug: string;
          target_audience: string | null;
          updated_at: string | null;
        };
        Insert: {
          billing_period?: string | null;
          created_at?: string | null;
          cta_text?: string | null;
          cta_url?: string | null;
          currency?: string | null;
          description: string;
          display_order?: number | null;
          features?: Json;
          highlight_as_popular?: boolean | null;
          id?: string;
          is_visible?: boolean | null;
          metadata?: Json | null;
          name: string;
          price_annual?: number | null;
          price_monthly?: number | null;
          recommended_for?: string | null;
          slug: string;
          target_audience?: string | null;
          updated_at?: string | null;
        };
        Update: {
          billing_period?: string | null;
          created_at?: string | null;
          cta_text?: string | null;
          cta_url?: string | null;
          currency?: string | null;
          description?: string;
          display_order?: number | null;
          features?: Json;
          highlight_as_popular?: boolean | null;
          id?: string;
          is_visible?: boolean | null;
          metadata?: Json | null;
          name?: string;
          price_annual?: number | null;
          price_monthly?: number | null;
          recommended_for?: string | null;
          slug?: string;
          target_audience?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      professional_documents: {
        Row: {
          document_type: string;
          id: string;
          metadata: Json | null;
          profile_id: string;
          status: string;
          storage_path: string;
          uploaded_at: string;
        };
        Insert: {
          document_type: string;
          id?: string;
          metadata?: Json | null;
          profile_id: string;
          status?: string;
          storage_path: string;
          uploaded_at?: string;
        };
        Update: {
          document_type?: string;
          id?: string;
          metadata?: Json | null;
          profile_id?: string;
          status?: string;
          storage_path?: string;
          uploaded_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "professional_documents_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "professional_profiles";
            referencedColumns: ["profile_id"];
          },
        ];
      };
      professional_profiles: {
        Row: {
          availability: Json | null;
          availability_settings: Json | null;
          bio: string | null;
          blocked_dates: Json | null;
          city: string | null;
          consent_background_check: boolean | null;
          country: string | null;
          created_at: string;
          experience_years: number | null;
          featured_work: string | null;
          full_name: string | null;
          id_number: string | null;
          instant_booking_enabled: boolean | null;
          instant_booking_settings: Json | null;
          languages: string[] | null;
          location_latitude: number | null;
          location_longitude: number | null;
          notification_preferences: Json | null;
          onboarding_completed_at: string | null;
          portfolio_images: Json | null;
          primary_services: string[] | null;
          profile_id: string;
          rate_expectations: Json | null;
          references_data: Json | null;
          search_vector: unknown;
          services: Json;
          status: string;
          stripe_connect_account_id: string | null;
          stripe_connect_last_refresh: string | null;
          stripe_connect_onboarding_status: string | null;
          updated_at: string;
          verification_level: string;
        };
        Insert: {
          availability?: Json | null;
          availability_settings?: Json | null;
          bio?: string | null;
          blocked_dates?: Json | null;
          city?: string | null;
          consent_background_check?: boolean | null;
          country?: string | null;
          created_at?: string;
          experience_years?: number | null;
          featured_work?: string | null;
          full_name?: string | null;
          id_number?: string | null;
          instant_booking_enabled?: boolean | null;
          instant_booking_settings?: Json | null;
          languages?: string[] | null;
          location_latitude?: number | null;
          location_longitude?: number | null;
          notification_preferences?: Json | null;
          onboarding_completed_at?: string | null;
          portfolio_images?: Json | null;
          primary_services?: string[] | null;
          profile_id: string;
          rate_expectations?: Json | null;
          references_data?: Json | null;
          search_vector?: unknown;
          services?: Json;
          status?: string;
          stripe_connect_account_id?: string | null;
          stripe_connect_last_refresh?: string | null;
          stripe_connect_onboarding_status?: string | null;
          updated_at?: string;
          verification_level?: string;
        };
        Update: {
          availability?: Json | null;
          availability_settings?: Json | null;
          bio?: string | null;
          blocked_dates?: Json | null;
          city?: string | null;
          consent_background_check?: boolean | null;
          country?: string | null;
          created_at?: string;
          experience_years?: number | null;
          featured_work?: string | null;
          full_name?: string | null;
          id_number?: string | null;
          instant_booking_enabled?: boolean | null;
          instant_booking_settings?: Json | null;
          languages?: string[] | null;
          location_latitude?: number | null;
          location_longitude?: number | null;
          notification_preferences?: Json | null;
          onboarding_completed_at?: string | null;
          portfolio_images?: Json | null;
          primary_services?: string[] | null;
          profile_id?: string;
          rate_expectations?: Json | null;
          references_data?: Json | null;
          search_vector?: unknown;
          services?: Json;
          status?: string;
          stripe_connect_account_id?: string | null;
          stripe_connect_last_refresh?: string | null;
          stripe_connect_onboarding_status?: string | null;
          updated_at?: string;
          verification_level?: string;
        };
        Relationships: [
          {
            foreignKeyName: "professional_profiles_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      professional_reviews: {
        Row: {
          comment: string | null;
          created_at: string;
          customer_id: string;
          id: string;
          professional_id: string;
          rating: number;
          title: string | null;
        };
        Insert: {
          comment?: string | null;
          created_at?: string;
          customer_id: string;
          id?: string;
          professional_id: string;
          rating: number;
          title?: string | null;
        };
        Update: {
          comment?: string | null;
          created_at?: string;
          customer_id?: string;
          id?: string;
          professional_id?: string;
          rating?: number;
          title?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "professional_reviews_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "professional_reviews_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "professional_profiles";
            referencedColumns: ["profile_id"];
          },
        ];
      };
      profiles: {
        Row: {
          account_status: string;
          avatar_url: string | null;
          city: string | null;
          country: string | null;
          created_at: string;
          data_processing_consent: boolean | null;
          data_processing_consent_at: string | null;
          full_name: string | null;
          id: string;
          locale: string;
          marketing_consent: boolean | null;
          marketing_consent_at: string | null;
          onboarding_status: string;
          phone: string | null;
          privacy_policy_accepted: boolean | null;
          privacy_policy_accepted_at: string | null;
          role: string;
          stripe_customer_id: string | null;
          terms_accepted: boolean | null;
          terms_accepted_at: string | null;
          updated_at: string;
        };
        Insert: {
          account_status?: string;
          avatar_url?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          data_processing_consent?: boolean | null;
          data_processing_consent_at?: string | null;
          full_name?: string | null;
          id: string;
          locale?: string;
          marketing_consent?: boolean | null;
          marketing_consent_at?: string | null;
          onboarding_status?: string;
          phone?: string | null;
          privacy_policy_accepted?: boolean | null;
          privacy_policy_accepted_at?: string | null;
          role: string;
          stripe_customer_id?: string | null;
          terms_accepted?: boolean | null;
          terms_accepted_at?: string | null;
          updated_at?: string;
        };
        Update: {
          account_status?: string;
          avatar_url?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          data_processing_consent?: boolean | null;
          data_processing_consent_at?: string | null;
          full_name?: string | null;
          id?: string;
          locale?: string;
          marketing_consent?: boolean | null;
          marketing_consent_at?: string | null;
          onboarding_status?: string;
          phone?: string | null;
          privacy_policy_accepted?: boolean | null;
          privacy_policy_accepted_at?: string | null;
          role?: string;
          stripe_customer_id?: string | null;
          terms_accepted?: boolean | null;
          terms_accepted_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      referral_codes: {
        Row: {
          code: string;
          created_at: string;
          expires_at: string | null;
          id: string;
          is_active: boolean;
          max_uses: number | null;
          updated_at: string;
          user_id: string;
          uses_count: number;
        };
        Insert: {
          code: string;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          is_active?: boolean;
          max_uses?: number | null;
          updated_at?: string;
          user_id: string;
          uses_count?: number;
        };
        Update: {
          code?: string;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          is_active?: boolean;
          max_uses?: number | null;
          updated_at?: string;
          user_id?: string;
          uses_count?: number;
        };
        Relationships: [];
      };
      referral_credits: {
        Row: {
          amount: number;
          balance_after: number;
          booking_id: string | null;
          created_at: string;
          description: string | null;
          expires_at: string | null;
          id: string;
          referral_id: string | null;
          transaction_type: string;
          user_id: string;
        };
        Insert: {
          amount: number;
          balance_after: number;
          booking_id?: string | null;
          created_at?: string;
          description?: string | null;
          expires_at?: string | null;
          id?: string;
          referral_id?: string | null;
          transaction_type: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          balance_after?: number;
          booking_id?: string | null;
          created_at?: string;
          description?: string | null;
          expires_at?: string | null;
          id?: string;
          referral_id?: string | null;
          transaction_type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "referral_credits_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "referral_credits_referral_id_fkey";
            columns: ["referral_id"];
            isOneToOne: false;
            referencedRelation: "referrals";
            referencedColumns: ["id"];
          },
        ];
      };
      referrals: {
        Row: {
          created_at: string;
          id: string;
          qualified_at: string | null;
          qualifying_booking_id: string | null;
          referee_credit_amount: number;
          referee_id: string;
          referral_code_id: string;
          referrer_credit_amount: number;
          referrer_id: string;
          rewarded_at: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          qualified_at?: string | null;
          qualifying_booking_id?: string | null;
          referee_credit_amount?: number;
          referee_id: string;
          referral_code_id: string;
          referrer_credit_amount?: number;
          referrer_id: string;
          rewarded_at?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          qualified_at?: string | null;
          qualifying_booking_id?: string | null;
          referee_credit_amount?: number;
          referee_id?: string;
          referral_code_id?: string;
          referrer_credit_amount?: number;
          referrer_id?: string;
          rewarded_at?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "referrals_qualifying_booking_id_fkey";
            columns: ["qualifying_booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "referrals_referral_code_id_fkey";
            columns: ["referral_code_id"];
            isOneToOne: false;
            referencedRelation: "referral_codes";
            referencedColumns: ["id"];
          },
        ];
      };
      roadmap_comments: {
        Row: {
          comment: string;
          created_at: string | null;
          id: string;
          is_approved: boolean | null;
          is_from_admin: boolean | null;
          roadmap_item_id: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          comment: string;
          created_at?: string | null;
          id?: string;
          is_approved?: boolean | null;
          is_from_admin?: boolean | null;
          roadmap_item_id: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          comment?: string;
          created_at?: string | null;
          id?: string;
          is_approved?: boolean | null;
          is_from_admin?: boolean | null;
          roadmap_item_id?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "roadmap_comments_roadmap_item_id_fkey";
            columns: ["roadmap_item_id"];
            isOneToOne: false;
            referencedRelation: "roadmap_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "roadmap_comments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      roadmap_items: {
        Row: {
          category: string;
          changelog_id: string | null;
          comment_count: number | null;
          created_at: string | null;
          created_by: string | null;
          description: string;
          featured_image_url: string | null;
          id: string;
          metadata: Json | null;
          priority: string | null;
          published_at: string | null;
          shipped_at: string | null;
          slug: string;
          status: string;
          tags: string[] | null;
          target_audience: string[] | null;
          target_quarter: string | null;
          title: string;
          updated_at: string | null;
          visibility: string;
          vote_count: number | null;
        };
        Insert: {
          category: string;
          changelog_id?: string | null;
          comment_count?: number | null;
          created_at?: string | null;
          created_by?: string | null;
          description: string;
          featured_image_url?: string | null;
          id?: string;
          metadata?: Json | null;
          priority?: string | null;
          published_at?: string | null;
          shipped_at?: string | null;
          slug: string;
          status?: string;
          tags?: string[] | null;
          target_audience?: string[] | null;
          target_quarter?: string | null;
          title: string;
          updated_at?: string | null;
          visibility?: string;
          vote_count?: number | null;
        };
        Update: {
          category?: string;
          changelog_id?: string | null;
          comment_count?: number | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string;
          featured_image_url?: string | null;
          id?: string;
          metadata?: Json | null;
          priority?: string | null;
          published_at?: string | null;
          shipped_at?: string | null;
          slug?: string;
          status?: string;
          tags?: string[] | null;
          target_audience?: string[] | null;
          target_quarter?: string | null;
          title?: string;
          updated_at?: string | null;
          visibility?: string;
          vote_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "roadmap_items_changelog_id_fkey";
            columns: ["changelog_id"];
            isOneToOne: false;
            referencedRelation: "changelogs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "roadmap_items_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      roadmap_votes: {
        Row: {
          created_at: string | null;
          id: string;
          roadmap_item_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          roadmap_item_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          roadmap_item_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "roadmap_votes_roadmap_item_id_fkey";
            columns: ["roadmap_item_id"];
            isOneToOne: false;
            referencedRelation: "roadmap_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "roadmap_votes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      service_addons: {
        Row: {
          created_at: string;
          description: string | null;
          display_order: number | null;
          duration_minutes: number | null;
          id: string;
          is_active: boolean | null;
          name: string;
          price_cop: number;
          professional_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          display_order?: number | null;
          duration_minutes?: number | null;
          id?: string;
          is_active?: boolean | null;
          name: string;
          price_cop: number;
          professional_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          display_order?: number | null;
          duration_minutes?: number | null;
          id?: string;
          is_active?: boolean | null;
          name?: string;
          price_cop?: number;
          professional_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "service_addons_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "professional_profiles";
            referencedColumns: ["profile_id"];
          },
        ];
      };
      user_suspensions: {
        Row: {
          created_at: string;
          details: Json | null;
          expires_at: string | null;
          id: string;
          lift_reason: string | null;
          lifted_at: string | null;
          lifted_by: string | null;
          reason: string;
          suspended_at: string;
          suspended_by: string;
          suspension_type: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          details?: Json | null;
          expires_at?: string | null;
          id?: string;
          lift_reason?: string | null;
          lifted_at?: string | null;
          lifted_by?: string | null;
          reason: string;
          suspended_at?: string;
          suspended_by: string;
          suspension_type: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          details?: Json | null;
          expires_at?: string | null;
          id?: string;
          lift_reason?: string | null;
          lifted_at?: string | null;
          lifted_by?: string | null;
          reason?: string;
          suspended_at?: string;
          suspended_by?: string;
          suspension_type?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_suspensions_lifted_by_fkey";
            columns: ["lifted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_suspensions_suspended_by_fkey";
            columns: ["suspended_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_suspensions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      award_referral_credits: {
        Args: { p_booking_id: string; p_referral_id: string };
        Returns: undefined;
      };
      generate_referral_code: { Args: never; Returns: string };
      get_feedback_stats: {
        Args: never;
        Returns: {
          average_resolution_hours: number;
          bug_count: number;
          feature_request_count: number;
          in_review_count: number;
          new_count: number;
          resolved_count: number;
          total_count: number;
        }[];
      };
      get_professional_profile: {
        Args: { p_profile_id: string };
        Returns: {
          availability: Json;
          bio: string;
          city: string;
          country: string;
          created_at: string;
          experience_years: number;
          full_name: string;
          languages: string[];
          onboarding_status: string;
          primary_services: string[];
          professional_status: string;
          profile_id: string;
          references_data: Json;
          services: Json;
          updated_at: string;
        }[];
      };
      get_unread_changelog_count: {
        Args: { p_user_id: string };
        Returns: number;
      };
      get_user_referral_credits: {
        Args: { p_user_id: string };
        Returns: number;
      };
      get_user_roadmap_vote_count: {
        Args: { user_id: string };
        Returns: number;
      };
      has_user_voted: {
        Args: { item_id: string; user_id: string };
        Returns: boolean;
      };
      increment_article_view_count: {
        Args: { article_id: string };
        Returns: undefined;
      };
      list_active_professionals: {
        Args: { p_customer_lat?: number; p_customer_lon?: number };
        Returns: {
          acceptance_rate: number;
          availability: Json;
          bio: string;
          city: string;
          country: string;
          distance_km: number;
          experience_years: number;
          favorites_count: number;
          full_name: string;
          languages: string[];
          on_time_rate: number;
          primary_services: string[];
          professional_status: string;
          profile_id: string;
          rating: number;
          review_count: number;
          services: Json;
          total_completed_bookings: number;
          total_earnings: number;
          verification_level: string;
        }[];
      };
      professional_search_vector: {
        Args: {
          bio: string;
          city: string;
          country: string;
          full_name: string;
          primary_services: string[];
        };
        Returns: unknown;
      };
      search_help_articles: {
        Args: { limit_count?: number; locale?: string; search_query: string };
        Returns: {
          category_id: string;
          category_name: string;
          category_slug: string;
          excerpt: string;
          id: string;
          rank: number;
          slug: string;
          title: string;
        }[];
      };
      search_professionals: {
        Args: { result_limit?: number; search_query: string };
        Returns: {
          avg_rating: number;
          bio: string;
          city: string;
          country: string;
          full_name: string;
          id: string;
          profile_photo_url: string;
          rank: number;
          review_count: number;
          service_types: string[];
        }[];
      };
      set_admin_by_email: { Args: { user_email: string }; Returns: undefined };
      show_limit: { Args: never; Returns: number };
      show_trgm: { Args: { "": string }; Returns: string[] };
      trigger_auto_decline_cron: { Args: never; Returns: undefined };
      update_user_consent: {
        Args: { p_accepted: boolean; p_consent_type: string; p_user_id: string };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
