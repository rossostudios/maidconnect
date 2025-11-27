export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
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
      amara_conversations: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          last_message_at: string;
          locale: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          last_message_at?: string;
          locale?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          last_message_at?: string;
          locale?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      amara_messages: {
        Row: {
          attachments: Json | null;
          content: string;
          conversation_id: string;
          created_at: string;
          id: string;
          metadata: Json | null;
          parts: Json | null;
          role: string;
          status: string;
          tool_calls: Json | null;
        };
        Insert: {
          attachments?: Json | null;
          content: string;
          conversation_id: string;
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          parts?: Json | null;
          role: string;
          status?: string;
          tool_calls?: Json | null;
        };
        Update: {
          attachments?: Json | null;
          content?: string;
          conversation_id?: string;
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          parts?: Json | null;
          role?: string;
          status?: string;
          tool_calls?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "amara_messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "amara_conversations";
            referencedColumns: ["id"];
          },
        ];
      };
      amara_tool_runs: {
        Row: {
          conversation_id: string;
          created_at: string;
          error_text: string | null;
          id: string;
          input: Json | null;
          latency_ms: number | null;
          message_id: string;
          output: Json | null;
          state: string;
          tool_call_id: string;
          tool_name: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          conversation_id: string;
          created_at?: string;
          error_text?: string | null;
          id?: string;
          input?: Json | null;
          latency_ms?: number | null;
          message_id: string;
          output?: Json | null;
          state?: string;
          tool_call_id: string;
          tool_name: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          conversation_id?: string;
          created_at?: string;
          error_text?: string | null;
          id?: string;
          input?: Json | null;
          latency_ms?: number | null;
          message_id?: string;
          output?: Json | null;
          state?: string;
          tool_call_id?: string;
          tool_name?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "amara_tool_runs_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "amara_conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "amara_tool_runs_message_id_fkey";
            columns: ["message_id"];
            isOneToOne: false;
            referencedRelation: "amara_messages";
            referencedColumns: ["id"];
          },
        ];
      };
      background_checks: {
        Row: {
          completed_at: string | null;
          created_at: string;
          id: string;
          professional_id: string;
          provider: string;
          provider_check_id: string;
          result_data: Json | null;
          status: Database["public"]["Enums"]["background_check_status"];
          updated_at: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          professional_id: string;
          provider: string;
          provider_check_id: string;
          result_data?: Json | null;
          status?: Database["public"]["Enums"]["background_check_status"];
          updated_at?: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          professional_id?: string;
          provider?: string;
          provider_check_id?: string;
          result_data?: Json | null;
          status?: Database["public"]["Enums"]["background_check_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "background_checks_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      booking_addons: {
        Row: {
          addon_id: string;
          addon_name: string;
          addon_price_cop: number;
          booking_id: string;
          created_at: string | null;
          id: string;
          quantity: number | null;
        };
        Insert: {
          addon_id: string;
          addon_name: string;
          addon_price_cop: number;
          booking_id: string;
          created_at?: string | null;
          id?: string;
          quantity?: number | null;
        };
        Update: {
          addon_id?: string;
          addon_name?: string;
          addon_price_cop?: number;
          booking_id?: string;
          created_at?: string | null;
          id?: string;
          quantity?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "booking_addons_addon_id_fkey";
            columns: ["addon_id"];
            isOneToOne: false;
            referencedRelation: "service_addons";
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
      booking_status_history: {
        Row: {
          booking_id: string;
          changed_by: string;
          created_at: string | null;
          id: string;
          new_status: string;
          old_status: string | null;
          reason: string | null;
        };
        Insert: {
          booking_id: string;
          changed_by: string;
          created_at?: string | null;
          id?: string;
          new_status: string;
          old_status?: string | null;
          reason?: string | null;
        };
        Update: {
          booking_id?: string;
          changed_by?: string;
          created_at?: string | null;
          id?: string;
          new_status?: string;
          old_status?: string | null;
          reason?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "booking_status_history_changed_by_fkey";
            columns: ["changed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      bookings: {
        Row: {
          address: string | null;
          amount_authorized: number | null;
          amount_estimated: number | null;
          amount_final: number | null;
          auto_declined_at: string | null;
          booking_type: string | null;
          booking_source: string | null;
          source_details: Json | null;
          first_touch_source: string | null;
          last_touch_source: string | null;
          touch_points: number | null;
          checked_in_at: string | null;
          checked_out_at: string | null;
          created_at: string;
          currency: string | null;
          customer_id: string | null;
          declined_reason: string | null;
          deposit_amount: number | null;
          deposit_captured_at: string | null;
          direct_hire_completed_at: string | null;
          direct_hire_fee_paid: boolean | null;
          duration_minutes: number | null;
          final_amount_captured: number | null;
          guest_session_id: string | null;
          id: string;
          included_in_payout_id: string | null;
          insurance_fee: number | null;
          processed_by_cron: boolean | null;
          professional_id: string;
          requires_insurance: boolean | null;
          scheduled_end: string | null;
          scheduled_start: string | null;
          service_hourly_rate: number | null;
          service_name: string | null;
          special_instructions: string | null;
          status: string;
          stripe_payment_intent_id: string | null;
          stripe_payment_method_id: string | null;
          time_extension_amount: number | null;
          time_extension_minutes: number | null;
          tip_amount: number | null;
          total_amount: number | null;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          amount_authorized?: number | null;
          amount_estimated?: number | null;
          amount_final?: number | null;
          auto_declined_at?: string | null;
          booking_type?: string | null;
          booking_source?: string | null;
          source_details?: Json | null;
          first_touch_source?: string | null;
          last_touch_source?: string | null;
          touch_points?: number | null;
          checked_in_at?: string | null;
          checked_out_at?: string | null;
          created_at?: string;
          currency?: string | null;
          customer_id?: string | null;
          declined_reason?: string | null;
          deposit_amount?: number | null;
          deposit_captured_at?: string | null;
          direct_hire_completed_at?: string | null;
          direct_hire_fee_paid?: boolean | null;
          duration_minutes?: number | null;
          final_amount_captured?: number | null;
          guest_session_id?: string | null;
          id?: string;
          included_in_payout_id?: string | null;
          insurance_fee?: number | null;
          processed_by_cron?: boolean | null;
          professional_id: string;
          requires_insurance?: boolean | null;
          scheduled_end?: string | null;
          scheduled_start?: string | null;
          service_hourly_rate?: number | null;
          service_name?: string | null;
          special_instructions?: string | null;
          status?: string;
          stripe_payment_intent_id?: string | null;
          stripe_payment_method_id?: string | null;
          time_extension_amount?: number | null;
          time_extension_minutes?: number | null;
          tip_amount?: number | null;
          total_amount?: number | null;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          amount_authorized?: number | null;
          amount_estimated?: number | null;
          amount_final?: number | null;
          auto_declined_at?: string | null;
          booking_type?: string | null;
          booking_source?: string | null;
          source_details?: Json | null;
          first_touch_source?: string | null;
          last_touch_source?: string | null;
          touch_points?: number | null;
          checked_in_at?: string | null;
          checked_out_at?: string | null;
          created_at?: string;
          currency?: string | null;
          customer_id?: string | null;
          declined_reason?: string | null;
          deposit_amount?: number | null;
          deposit_captured_at?: string | null;
          direct_hire_completed_at?: string | null;
          direct_hire_fee_paid?: boolean | null;
          duration_minutes?: number | null;
          final_amount_captured?: number | null;
          guest_session_id?: string | null;
          id?: string;
          included_in_payout_id?: string | null;
          insurance_fee?: number | null;
          processed_by_cron?: boolean | null;
          professional_id?: string;
          requires_insurance?: boolean | null;
          scheduled_end?: string | null;
          scheduled_start?: string | null;
          service_hourly_rate?: number | null;
          service_name?: string | null;
          special_instructions?: string | null;
          status?: string;
          stripe_payment_intent_id?: string | null;
          stripe_payment_method_id?: string | null;
          time_extension_amount?: number | null;
          time_extension_minutes?: number | null;
          tip_amount?: number | null;
          total_amount?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_guest_session_id_fkey";
            columns: ["guest_session_id"];
            isOneToOne: false;
            referencedRelation: "guest_sessions";
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
            foreignKeyName: "bookings_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      briefs: {
        Row: {
          city: string;
          completed_at: string | null;
          created_at: string;
          email: string;
          hours_per_week: string;
          id: string;
          language: string;
          metadata: Json | null;
          name: string;
          phone: string | null;
          requirements: string | null;
          reviewed_at: string | null;
          service_type: string;
          start_date: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          city: string;
          completed_at?: string | null;
          created_at?: string;
          email: string;
          hours_per_week: string;
          id?: string;
          language: string;
          metadata?: Json | null;
          name: string;
          phone?: string | null;
          requirements?: string | null;
          reviewed_at?: string | null;
          service_type: string;
          start_date: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          city?: string;
          completed_at?: string | null;
          created_at?: string;
          email?: string;
          hours_per_week?: string;
          id?: string;
          language?: string;
          metadata?: Json | null;
          name?: string;
          phone?: string | null;
          requirements?: string | null;
          reviewed_at?: string | null;
          service_type?: string;
          start_date?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
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
          participant_ids: string[] | null;
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
          participant_ids?: string[] | null;
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
          participant_ids?: string[] | null;
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
          emergency_contact: Json | null;
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
          emergency_contact?: Json | null;
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
          emergency_contact?: Json | null;
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
      guest_sessions: {
        Row: {
          created_at: string;
          email: string;
          expires_at: string;
          full_name: string;
          id: string;
          metadata: Json | null;
          phone: string | null;
          session_token: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          expires_at?: string;
          full_name: string;
          id?: string;
          metadata?: Json | null;
          phone?: string | null;
          session_token: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          expires_at?: string;
          full_name?: string;
          id?: string;
          metadata?: Json | null;
          phone?: string | null;
          session_token?: string;
        };
        Relationships: [];
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
      help_article_tags: {
        Row: {
          color: string;
          created_at: string;
          description_en: string | null;
          description_es: string | null;
          id: string;
          name_en: string;
          name_es: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          color?: string;
          created_at?: string;
          description_en?: string | null;
          description_es?: string | null;
          id?: string;
          name_en: string;
          name_es: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          color?: string;
          created_at?: string;
          description_en?: string | null;
          description_es?: string | null;
          id?: string;
          name_en?: string;
          name_es?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      help_article_tags_relation: {
        Row: {
          article_id: string;
          created_at: string;
          tag_id: string;
        };
        Insert: {
          article_id: string;
          created_at?: string;
          tag_id: string;
        };
        Update: {
          article_id?: string;
          created_at?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "help_article_tags_relation_article_id_fkey";
            columns: ["article_id"];
            isOneToOne: false;
            referencedRelation: "help_articles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "help_article_tags_relation_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "help_article_tags";
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
      help_search_analytics: {
        Row: {
          clicked_article_id: string | null;
          created_at: string;
          id: string;
          locale: string;
          query: string;
          result_count: number;
          session_id: string | null;
          user_id: string | null;
        };
        Insert: {
          clicked_article_id?: string | null;
          created_at?: string;
          id?: string;
          locale?: string;
          query: string;
          result_count: number;
          session_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          clicked_article_id?: string | null;
          created_at?: string;
          id?: string;
          locale?: string;
          query?: string;
          result_count?: number;
          session_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "help_search_analytics_clicked_article_id_fkey";
            columns: ["clicked_article_id"];
            isOneToOne: false;
            referencedRelation: "help_articles";
            referencedColumns: ["id"];
          },
        ];
      };
      insurance_claims: {
        Row: {
          booking_id: string;
          claim_type: Database["public"]["Enums"]["claim_type"];
          created_at: string;
          customer_id: string | null;
          description: string;
          estimated_cost: number | null;
          evidence_urls: string[] | null;
          filed_by: string;
          id: string;
          payout_amount: number | null;
          professional_id: string | null;
          resolution_notes: string | null;
          resolved_at: string | null;
          resolved_by: string | null;
          status: Database["public"]["Enums"]["claim_status"];
          updated_at: string;
        };
        Insert: {
          booking_id: string;
          claim_type: Database["public"]["Enums"]["claim_type"];
          created_at?: string;
          customer_id?: string | null;
          description: string;
          estimated_cost?: number | null;
          evidence_urls?: string[] | null;
          filed_by: string;
          id?: string;
          payout_amount?: number | null;
          professional_id?: string | null;
          resolution_notes?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          status?: Database["public"]["Enums"]["claim_status"];
          updated_at?: string;
        };
        Update: {
          booking_id?: string;
          claim_type?: Database["public"]["Enums"]["claim_type"];
          created_at?: string;
          customer_id?: string | null;
          description?: string;
          estimated_cost?: number | null;
          evidence_urls?: string[] | null;
          filed_by?: string;
          id?: string;
          payout_amount?: number | null;
          professional_id?: string | null;
          resolution_notes?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          status?: Database["public"]["Enums"]["claim_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "insurance_claims_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "insurance_claims_filed_by_fkey";
            columns: ["filed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "insurance_claims_resolved_by_fkey";
            columns: ["resolved_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      interview_slots: {
        Row: {
          completed_at: string | null;
          completed_by: string | null;
          created_at: string;
          id: string;
          interview_notes: string | null;
          location: string;
          location_address: Json | null;
          professional_id: string;
          scheduled_at: string;
          status: Database["public"]["Enums"]["interview_status"];
          updated_at: string;
        };
        Insert: {
          completed_at?: string | null;
          completed_by?: string | null;
          created_at?: string;
          id?: string;
          interview_notes?: string | null;
          location: string;
          location_address?: Json | null;
          professional_id: string;
          scheduled_at: string;
          status?: Database["public"]["Enums"]["interview_status"];
          updated_at?: string;
        };
        Update: {
          completed_at?: string | null;
          completed_by?: string | null;
          created_at?: string;
          id?: string;
          interview_notes?: string | null;
          location?: string;
          location_address?: Json | null;
          professional_id?: string;
          scheduled_at?: string;
          status?: Database["public"]["Enums"]["interview_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "interview_slots_completed_by_fkey";
            columns: ["completed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interview_slots_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          attachments: string[] | null;
          conversation_id: string;
          created_at: string;
          id: string;
          message: string;
          participant_ids: string[] | null;
          read_at: string | null;
          sender_id: string;
        };
        Insert: {
          attachments?: string[] | null;
          conversation_id: string;
          created_at?: string;
          id?: string;
          message: string;
          participant_ids?: string[] | null;
          read_at?: string | null;
          sender_id: string;
        };
        Update: {
          attachments?: string[] | null;
          conversation_id?: string;
          created_at?: string;
          id?: string;
          message?: string;
          participant_ids?: string[] | null;
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
      payout_batches: {
        Row: {
          batch_id: string;
          completed_at: string | null;
          created_at: string;
          error_message: string | null;
          failed_transfers: number;
          id: string;
          run_date: string;
          started_at: string | null;
          status: string;
          successful_transfers: number;
          total_amount_cop: number;
          total_transfers: number;
          updated_at: string;
        };
        Insert: {
          batch_id: string;
          completed_at?: string | null;
          created_at?: string;
          error_message?: string | null;
          failed_transfers?: number;
          id?: string;
          run_date?: string;
          started_at?: string | null;
          status?: string;
          successful_transfers?: number;
          total_amount_cop?: number;
          total_transfers?: number;
          updated_at?: string;
        };
        Update: {
          batch_id?: string;
          completed_at?: string | null;
          created_at?: string;
          error_message?: string | null;
          failed_transfers?: number;
          id?: string;
          run_date?: string;
          started_at?: string | null;
          status?: string;
          successful_transfers?: number;
          total_amount_cop?: number;
          total_transfers?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      payout_transfers: {
        Row: {
          amount_cop: number;
          batch_id: string;
          booking_id: string;
          created_at: string;
          error_message: string | null;
          id: string;
          processed_at: string | null;
          professional_id: string;
          status: string;
          stripe_transfer_id: string | null;
          updated_at: string;
        };
        Insert: {
          amount_cop: number;
          batch_id: string;
          booking_id: string;
          created_at?: string;
          error_message?: string | null;
          id?: string;
          processed_at?: string | null;
          professional_id: string;
          status?: string;
          stripe_transfer_id?: string | null;
          updated_at?: string;
        };
        Update: {
          amount_cop?: number;
          batch_id?: string;
          booking_id?: string;
          created_at?: string;
          error_message?: string | null;
          id?: string;
          processed_at?: string | null;
          professional_id?: string;
          status?: string;
          stripe_transfer_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payout_transfers_batch_id_fkey";
            columns: ["batch_id"];
            isOneToOne: false;
            referencedRelation: "payout_batches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payout_transfers_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: true;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payout_transfers_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
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
      platform_events: {
        Row: {
          created_at: string;
          event_type: string;
          id: string;
          properties: Json | null;
          session_id: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          event_type: string;
          id?: string;
          properties?: Json | null;
          session_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          event_type?: string;
          id?: string;
          properties?: Json | null;
          session_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      platform_settings: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          setting_category: string;
          setting_key: string;
          setting_value: Json;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          setting_category?: string;
          setting_key: string;
          setting_value?: Json;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          setting_category?: string;
          setting_key?: string;
          setting_value?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      pricing_controls: {
        Row: {
          background_check_fee_cop: number | null;
          city: string | null;
          commission_rate: number;
          country: string | null;
          created_at: string | null;
          created_by: string | null;
          deposit_percentage: number | null;
          effective_from: string;
          effective_until: string | null;
          id: string;
          is_active: boolean | null;
          late_cancel_fee_percentage: number | null;
          late_cancel_hours: number | null;
          max_price_cop: number | null;
          min_price_cop: number | null;
          notes: string | null;
          service_category: string | null;
          updated_at: string | null;
        };
        Insert: {
          background_check_fee_cop?: number | null;
          city?: string | null;
          commission_rate: number;
          country?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          deposit_percentage?: number | null;
          effective_from?: string;
          effective_until?: string | null;
          id?: string;
          is_active?: boolean | null;
          late_cancel_fee_percentage?: number | null;
          late_cancel_hours?: number | null;
          max_price_cop?: number | null;
          min_price_cop?: number | null;
          notes?: string | null;
          service_category?: string | null;
          updated_at?: string | null;
        };
        Update: {
          background_check_fee_cop?: number | null;
          city?: string | null;
          commission_rate?: number;
          country?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          deposit_percentage?: number | null;
          effective_from?: string;
          effective_until?: string | null;
          id?: string;
          is_active?: boolean | null;
          late_cancel_fee_percentage?: number | null;
          late_cancel_hours?: number | null;
          max_price_cop?: number | null;
          min_price_cop?: number | null;
          notes?: string | null;
          service_category?: string | null;
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
      professional_performance_metrics: {
        Row: {
          average_booking_value_cop: number | null;
          average_rating: number | null;
          average_response_time_minutes: number | null;
          bookings_last_30_days: number | null;
          bookings_last_7_days: number | null;
          cancellation_rate: number | null;
          cancelled_bookings: number | null;
          completed_bookings: number | null;
          completion_rate: number | null;
          created_at: string | null;
          five_star_count: number | null;
          four_star_count: number | null;
          id: string;
          last_calculated_at: string | null;
          on_time_arrival_rate: number | null;
          one_star_count: number | null;
          profile_id: string;
          repeat_customer_rate: number | null;
          revenue_last_30_days_cop: number | null;
          revenue_last_7_days_cop: number | null;
          three_star_count: number | null;
          total_bookings: number | null;
          total_revenue_cop: number | null;
          total_reviews: number | null;
          two_star_count: number | null;
          updated_at: string | null;
        };
        Insert: {
          average_booking_value_cop?: number | null;
          average_rating?: number | null;
          average_response_time_minutes?: number | null;
          bookings_last_30_days?: number | null;
          bookings_last_7_days?: number | null;
          cancellation_rate?: number | null;
          cancelled_bookings?: number | null;
          completed_bookings?: number | null;
          completion_rate?: number | null;
          created_at?: string | null;
          five_star_count?: number | null;
          four_star_count?: number | null;
          id?: string;
          last_calculated_at?: string | null;
          on_time_arrival_rate?: number | null;
          one_star_count?: number | null;
          profile_id: string;
          repeat_customer_rate?: number | null;
          revenue_last_30_days_cop?: number | null;
          revenue_last_7_days_cop?: number | null;
          three_star_count?: number | null;
          total_bookings?: number | null;
          total_revenue_cop?: number | null;
          total_reviews?: number | null;
          two_star_count?: number | null;
          updated_at?: string | null;
        };
        Update: {
          average_booking_value_cop?: number | null;
          average_rating?: number | null;
          average_response_time_minutes?: number | null;
          bookings_last_30_days?: number | null;
          bookings_last_7_days?: number | null;
          cancellation_rate?: number | null;
          cancelled_bookings?: number | null;
          completed_bookings?: number | null;
          completion_rate?: number | null;
          created_at?: string | null;
          five_star_count?: number | null;
          four_star_count?: number | null;
          id?: string;
          last_calculated_at?: string | null;
          on_time_arrival_rate?: number | null;
          one_star_count?: number | null;
          profile_id?: string;
          repeat_customer_rate?: number | null;
          revenue_last_30_days_cop?: number | null;
          revenue_last_7_days_cop?: number | null;
          three_star_count?: number | null;
          total_bookings?: number | null;
          total_revenue_cop?: number | null;
          total_reviews?: number | null;
          two_star_count?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "professional_performance_metrics_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      professional_profiles: {
        Row: {
          availability: Json | null;
          availability_settings: Json | null;
          avatar_url: string | null;
          background_check_status: string | null;
          bio: string | null;
          blocked_dates: Json | null;
          city: string | null;
          consent_background_check: boolean | null;
          country: string | null;
          created_at: string;
          direct_hire_fee_cop: number | null;
          emergency_contact: Json | null;
          experience_years: number | null;
          featured_work: string | null;
          full_name: string | null;
          id_number: string | null;
          instant_booking_enabled: boolean | null;
          instant_booking_settings: Json | null;
          interview_completed: boolean | null;
          languages: string[] | null;
          latest_background_check_id: string | null;
          latest_interview_id: string | null;
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
          avatar_url?: string | null;
          background_check_status?: string | null;
          bio?: string | null;
          blocked_dates?: Json | null;
          city?: string | null;
          consent_background_check?: boolean | null;
          country?: string | null;
          created_at?: string;
          direct_hire_fee_cop?: number | null;
          emergency_contact?: Json | null;
          experience_years?: number | null;
          featured_work?: string | null;
          full_name?: string | null;
          id_number?: string | null;
          instant_booking_enabled?: boolean | null;
          instant_booking_settings?: Json | null;
          interview_completed?: boolean | null;
          languages?: string[] | null;
          latest_background_check_id?: string | null;
          latest_interview_id?: string | null;
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
          avatar_url?: string | null;
          background_check_status?: string | null;
          bio?: string | null;
          blocked_dates?: Json | null;
          city?: string | null;
          consent_background_check?: boolean | null;
          country?: string | null;
          created_at?: string;
          direct_hire_fee_cop?: number | null;
          emergency_contact?: Json | null;
          experience_years?: number | null;
          featured_work?: string | null;
          full_name?: string | null;
          id_number?: string | null;
          instant_booking_enabled?: boolean | null;
          instant_booking_settings?: Json | null;
          interview_completed?: boolean | null;
          languages?: string[] | null;
          latest_background_check_id?: string | null;
          latest_interview_id?: string | null;
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
      professional_revenue_snapshots: {
        Row: {
          average_booking_value_cop: number | null;
          completed_bookings: number | null;
          created_at: string | null;
          id: string;
          period_type: string;
          profile_id: string;
          snapshot_date: string;
          total_revenue_cop: number | null;
        };
        Insert: {
          average_booking_value_cop?: number | null;
          completed_bookings?: number | null;
          created_at?: string | null;
          id?: string;
          period_type: string;
          profile_id: string;
          snapshot_date: string;
          total_revenue_cop?: number | null;
        };
        Update: {
          average_booking_value_cop?: number | null;
          completed_bookings?: number | null;
          created_at?: string | null;
          id?: string;
          period_type?: string;
          profile_id?: string;
          snapshot_date?: string;
          total_revenue_cop?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "professional_revenue_snapshots_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
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
      professional_services: {
        Row: {
          advance_booking_hours: number | null;
          average_rating: number | null;
          base_price_cop: number;
          booking_count: number | null;
          category_id: string | null;
          created_at: string | null;
          description: string | null;
          estimated_duration_minutes: number | null;
          id: string;
          included_items: Json | null;
          is_active: boolean | null;
          is_featured: boolean | null;
          max_booking_days_ahead: number | null;
          max_duration_minutes: number | null;
          min_duration_minutes: number | null;
          name: string;
          pricing_unit: string | null;
          profile_id: string;
          requirements: Json | null;
          requires_approval: boolean | null;
          service_type: string | null;
          updated_at: string | null;
        };
        Insert: {
          advance_booking_hours?: number | null;
          average_rating?: number | null;
          base_price_cop: number;
          booking_count?: number | null;
          category_id?: string | null;
          created_at?: string | null;
          description?: string | null;
          estimated_duration_minutes?: number | null;
          id?: string;
          included_items?: Json | null;
          is_active?: boolean | null;
          is_featured?: boolean | null;
          max_booking_days_ahead?: number | null;
          max_duration_minutes?: number | null;
          min_duration_minutes?: number | null;
          name: string;
          pricing_unit?: string | null;
          profile_id: string;
          requirements?: Json | null;
          requires_approval?: boolean | null;
          service_type?: string | null;
          updated_at?: string | null;
        };
        Update: {
          advance_booking_hours?: number | null;
          average_rating?: number | null;
          base_price_cop?: number;
          booking_count?: number | null;
          category_id?: string | null;
          created_at?: string | null;
          description?: string | null;
          estimated_duration_minutes?: number | null;
          id?: string;
          included_items?: Json | null;
          is_active?: boolean | null;
          is_featured?: boolean | null;
          max_booking_days_ahead?: number | null;
          max_duration_minutes?: number | null;
          min_duration_minutes?: number | null;
          name?: string;
          pricing_unit?: string | null;
          profile_id?: string;
          requirements?: Json | null;
          requires_approval?: boolean | null;
          service_type?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "professional_services_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "service_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "professional_services_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      professional_travel_buffers: {
        Row: {
          avg_travel_speed_kmh: number | null;
          created_at: string | null;
          id: string;
          profile_id: string;
          service_location: unknown;
          service_radius_km: number;
          travel_buffer_after_minutes: number | null;
          travel_buffer_before_minutes: number | null;
          updated_at: string | null;
        };
        Insert: {
          avg_travel_speed_kmh?: number | null;
          created_at?: string | null;
          id?: string;
          profile_id: string;
          service_location: unknown;
          service_radius_km?: number;
          travel_buffer_after_minutes?: number | null;
          travel_buffer_before_minutes?: number | null;
          updated_at?: string | null;
        };
        Update: {
          avg_travel_speed_kmh?: number | null;
          created_at?: string | null;
          id?: string;
          profile_id?: string;
          service_location?: unknown;
          service_radius_km?: number;
          travel_buffer_after_minutes?: number | null;
          travel_buffer_before_minutes?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "professional_travel_buffers_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      professional_working_hours: {
        Row: {
          created_at: string | null;
          day_of_week: number;
          end_time: string;
          id: string;
          is_available: boolean | null;
          profile_id: string;
          start_time: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          day_of_week: number;
          end_time: string;
          id?: string;
          is_available?: boolean | null;
          profile_id: string;
          start_time: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          day_of_week?: number;
          end_time?: string;
          id?: string;
          is_available?: boolean | null;
          profile_id?: string;
          start_time?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "professional_working_hours_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          account_status: string;
          avatar_url: string | null;
          can_accept_bookings: boolean | null;
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
          onboarding_checklist: Json | null;
          onboarding_completion_percentage: number | null;
          onboarding_status: string;
          phone: string | null;
          phone_verification_code: string | null;
          phone_verification_sent_at: string | null;
          phone_verified: boolean | null;
          privacy_policy_accepted: boolean | null;
          privacy_policy_accepted_at: string | null;
          role: string;
          sms_notifications_enabled: boolean | null;
          stripe_customer_id: string | null;
          terms_accepted: boolean | null;
          terms_accepted_at: string | null;
          updated_at: string;
        };
        Insert: {
          account_status?: string;
          avatar_url?: string | null;
          can_accept_bookings?: boolean | null;
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
          onboarding_checklist?: Json | null;
          onboarding_completion_percentage?: number | null;
          onboarding_status?: string;
          phone?: string | null;
          phone_verification_code?: string | null;
          phone_verification_sent_at?: string | null;
          phone_verified?: boolean | null;
          privacy_policy_accepted?: boolean | null;
          privacy_policy_accepted_at?: string | null;
          role: string;
          sms_notifications_enabled?: boolean | null;
          stripe_customer_id?: string | null;
          terms_accepted?: boolean | null;
          terms_accepted_at?: string | null;
          updated_at?: string;
        };
        Update: {
          account_status?: string;
          avatar_url?: string | null;
          can_accept_bookings?: boolean | null;
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
          onboarding_checklist?: Json | null;
          onboarding_completion_percentage?: number | null;
          onboarding_status?: string;
          phone?: string | null;
          phone_verification_code?: string | null;
          phone_verification_sent_at?: string | null;
          phone_verified?: boolean | null;
          privacy_policy_accepted?: boolean | null;
          privacy_policy_accepted_at?: string | null;
          role?: string;
          sms_notifications_enabled?: boolean | null;
          stripe_customer_id?: string | null;
          terms_accepted?: boolean | null;
          terms_accepted_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      rebook_nudge_experiments: {
        Row: {
          booking_id: string;
          created_at: string | null;
          customer_id: string;
          email_clicked: boolean | null;
          email_clicked_at: string | null;
          email_opened: boolean | null;
          email_opened_at: string | null;
          email_sent_at: string | null;
          id: string;
          push_clicked: boolean | null;
          push_clicked_at: string | null;
          push_sent_at: string | null;
          rebook_booking_id: string | null;
          rebooked: boolean | null;
          rebooked_at: string | null;
          updated_at: string | null;
          variant: string;
        };
        Insert: {
          booking_id: string;
          created_at?: string | null;
          customer_id: string;
          email_clicked?: boolean | null;
          email_clicked_at?: string | null;
          email_opened?: boolean | null;
          email_opened_at?: string | null;
          email_sent_at?: string | null;
          id?: string;
          push_clicked?: boolean | null;
          push_clicked_at?: string | null;
          push_sent_at?: string | null;
          rebook_booking_id?: string | null;
          rebooked?: boolean | null;
          rebooked_at?: string | null;
          updated_at?: string | null;
          variant: string;
        };
        Update: {
          booking_id?: string;
          created_at?: string | null;
          customer_id?: string;
          email_clicked?: boolean | null;
          email_clicked_at?: string | null;
          email_opened?: boolean | null;
          email_opened_at?: string | null;
          email_sent_at?: string | null;
          id?: string;
          push_clicked?: boolean | null;
          push_clicked_at?: string | null;
          push_sent_at?: string | null;
          rebook_booking_id?: string | null;
          rebooked?: boolean | null;
          rebooked_at?: string | null;
          updated_at?: string | null;
          variant?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rebook_nudge_experiments_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      recurring_plan_holidays: {
        Row: {
          created_at: string;
          id: string;
          reason: string | null;
          recurring_plan_id: string;
          skip_date: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          reason?: string | null;
          recurring_plan_id: string;
          skip_date: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          reason?: string | null;
          recurring_plan_id?: string;
          skip_date?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recurring_plan_holidays_recurring_plan_id_fkey";
            columns: ["recurring_plan_id"];
            isOneToOne: false;
            referencedRelation: "recurring_plans";
            referencedColumns: ["id"];
          },
        ];
      };
      recurring_plans: {
        Row: {
          address: string;
          base_amount: number;
          created_at: string;
          currency: string;
          customer_id: string;
          day_of_week: number | null;
          discount_percentage: number;
          duration_minutes: number;
          final_amount: number;
          frequency: string;
          id: string;
          next_booking_date: string;
          pause_end_date: string | null;
          pause_start_date: string | null;
          preferred_time: string;
          professional_id: string;
          service_name: string;
          special_instructions: string | null;
          status: string;
          total_bookings_completed: number;
          updated_at: string;
        };
        Insert: {
          address: string;
          base_amount: number;
          created_at?: string;
          currency?: string;
          customer_id: string;
          day_of_week?: number | null;
          discount_percentage?: number;
          duration_minutes: number;
          final_amount: number;
          frequency: string;
          id?: string;
          next_booking_date: string;
          pause_end_date?: string | null;
          pause_start_date?: string | null;
          preferred_time: string;
          professional_id: string;
          service_name: string;
          special_instructions?: string | null;
          status?: string;
          total_bookings_completed?: number;
          updated_at?: string;
        };
        Update: {
          address?: string;
          base_amount?: number;
          created_at?: string;
          currency?: string;
          customer_id?: string;
          day_of_week?: number | null;
          discount_percentage?: number;
          duration_minutes?: number;
          final_amount?: number;
          frequency?: string;
          id?: string;
          next_booking_date?: string;
          pause_end_date?: string | null;
          pause_start_date?: string | null;
          preferred_time?: string;
          professional_id?: string;
          service_name?: string;
          special_instructions?: string | null;
          status?: string;
          total_bookings_completed?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recurring_plans_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recurring_plans_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
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
          additional_duration_minutes: number | null;
          created_at: string | null;
          description: string | null;
          display_order: number | null;
          icon: string | null;
          id: string;
          is_active: boolean | null;
          is_required: boolean | null;
          max_quantity: number | null;
          name: string;
          price_cop: number;
          pricing_type: string | null;
          service_id: string;
          updated_at: string | null;
        };
        Insert: {
          additional_duration_minutes?: number | null;
          created_at?: string | null;
          description?: string | null;
          display_order?: number | null;
          icon?: string | null;
          id?: string;
          is_active?: boolean | null;
          is_required?: boolean | null;
          max_quantity?: number | null;
          name: string;
          price_cop: number;
          pricing_type?: string | null;
          service_id: string;
          updated_at?: string | null;
        };
        Update: {
          additional_duration_minutes?: number | null;
          created_at?: string | null;
          description?: string | null;
          display_order?: number | null;
          icon?: string | null;
          id?: string;
          is_active?: boolean | null;
          is_required?: boolean | null;
          max_quantity?: number | null;
          name?: string;
          price_cop?: number;
          pricing_type?: string | null;
          service_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "service_addons_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "professional_services";
            referencedColumns: ["id"];
          },
        ];
      };
      service_bundles: {
        Row: {
          base_price_cop: number;
          created_at: string | null;
          description: string | null;
          discount_percentage: number | null;
          final_price_cop: number;
          id: string;
          is_active: boolean | null;
          name: string;
          profile_id: string;
          services: Json;
          total_duration_minutes: number;
          updated_at: string | null;
          usage_count: number | null;
        };
        Insert: {
          base_price_cop: number;
          created_at?: string | null;
          description?: string | null;
          discount_percentage?: number | null;
          final_price_cop: number;
          id?: string;
          is_active?: boolean | null;
          name: string;
          profile_id: string;
          services: Json;
          total_duration_minutes: number;
          updated_at?: string | null;
          usage_count?: number | null;
        };
        Update: {
          base_price_cop?: number;
          created_at?: string | null;
          description?: string | null;
          discount_percentage?: number | null;
          final_price_cop?: number;
          id?: string;
          is_active?: boolean | null;
          name?: string;
          profile_id?: string;
          services?: Json;
          total_duration_minutes?: number;
          updated_at?: string | null;
          usage_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "service_bundles_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      service_categories: {
        Row: {
          created_at: string | null;
          description: string | null;
          display_order: number | null;
          icon: string | null;
          id: string;
          is_active: boolean | null;
          name: string;
          parent_category_id: string | null;
          slug: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          display_order?: number | null;
          icon?: string | null;
          id?: string;
          is_active?: boolean | null;
          name: string;
          parent_category_id?: string | null;
          slug: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          display_order?: number | null;
          icon?: string | null;
          id?: string;
          is_active?: boolean | null;
          name?: string;
          parent_category_id?: string | null;
          slug?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "service_categories_parent_category_id_fkey";
            columns: ["parent_category_id"];
            isOneToOne: false;
            referencedRelation: "service_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      service_pricing_tiers: {
        Row: {
          created_at: string | null;
          description: string | null;
          features: Json | null;
          id: string;
          is_active: boolean | null;
          is_default: boolean | null;
          max_area_sqm: number | null;
          max_hours: number | null;
          price_cop: number;
          pricing_adjustment_type: string | null;
          pricing_adjustment_value: number | null;
          service_id: string;
          tier_level: number;
          tier_name: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          features?: Json | null;
          id?: string;
          is_active?: boolean | null;
          is_default?: boolean | null;
          max_area_sqm?: number | null;
          max_hours?: number | null;
          price_cop: number;
          pricing_adjustment_type?: string | null;
          pricing_adjustment_value?: number | null;
          service_id: string;
          tier_level: number;
          tier_name: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          features?: Json | null;
          id?: string;
          is_active?: boolean | null;
          is_default?: boolean | null;
          max_area_sqm?: number | null;
          max_hours?: number | null;
          price_cop?: number;
          pricing_adjustment_type?: string | null;
          pricing_adjustment_value?: number | null;
          service_id?: string;
          tier_level?: number;
          tier_name?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "service_pricing_tiers_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "professional_services";
            referencedColumns: ["id"];
          },
        ];
      };
      sms_logs: {
        Row: {
          error_message: string | null;
          id: string;
          message: string;
          phone: string;
          provider_message_id: string | null;
          sent_at: string;
          status: Database["public"]["Enums"]["sms_status"];
          user_id: string | null;
        };
        Insert: {
          error_message?: string | null;
          id?: string;
          message: string;
          phone: string;
          provider_message_id?: string | null;
          sent_at?: string;
          status: Database["public"]["Enums"]["sms_status"];
          user_id?: string | null;
        };
        Update: {
          error_message?: string | null;
          id?: string;
          message?: string;
          phone?: string;
          provider_message_id?: string | null;
          sent_at?: string;
          status?: Database["public"]["Enums"]["sms_status"];
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "sms_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      spatial_ref_sys: {
        Row: {
          auth_name: string | null;
          auth_srid: number | null;
          proj4text: string | null;
          srid: number;
          srtext: string | null;
        };
        Insert: {
          auth_name?: string | null;
          auth_srid?: number | null;
          proj4text?: string | null;
          srid: number;
          srtext?: string | null;
        };
        Update: {
          auth_name?: string | null;
          auth_srid?: number | null;
          proj4text?: string | null;
          srid?: number;
          srtext?: string | null;
        };
        Relationships: [];
      };
      user_blocks: {
        Row: {
          blocked_id: string;
          blocker_id: string;
          created_at: string;
          id: string;
          reason: string | null;
        };
        Insert: {
          blocked_id: string;
          blocker_id: string;
          created_at?: string;
          id?: string;
          reason?: string | null;
        };
        Update: {
          blocked_id?: string;
          blocker_id?: string;
          created_at?: string;
          id?: string;
          reason?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_blocks_blocked_id_fkey";
            columns: ["blocked_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_blocks_blocker_id_fkey";
            columns: ["blocker_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
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
      geography_columns: {
        Row: {
          coord_dimension: number | null;
          f_geography_column: unknown;
          f_table_catalog: unknown;
          f_table_name: unknown;
          f_table_schema: unknown;
          srid: number | null;
          type: string | null;
        };
        Relationships: [];
      };
      geometry_columns: {
        Row: {
          coord_dimension: number | null;
          f_geometry_column: unknown;
          f_table_catalog: string | null;
          f_table_name: unknown;
          f_table_schema: unknown;
          srid: number | null;
          type: string | null;
        };
        Insert: {
          coord_dimension?: number | null;
          f_geometry_column?: unknown;
          f_table_catalog?: string | null;
          f_table_name?: unknown;
          f_table_schema?: unknown;
          srid?: number | null;
          type?: string | null;
        };
        Update: {
          coord_dimension?: number | null;
          f_geometry_column?: unknown;
          f_table_catalog?: string | null;
          f_table_name?: unknown;
          f_table_schema?: unknown;
          srid?: number | null;
          type?: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string };
        Returns: undefined;
      };
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown };
        Returns: unknown;
      };
      _postgis_pgsql_version: { Args: never; Returns: string };
      _postgis_scripts_pgsql_version: { Args: never; Returns: string };
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown };
        Returns: number;
      };
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown };
        Returns: string;
      };
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean };
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean };
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_dwithin: {
        Args: {
          geog1: unknown;
          geog2: unknown;
          tolerance: number;
          use_spheroid?: boolean;
        };
        Returns: boolean;
      };
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean };
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown };
        Returns: number;
      };
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_sortablehash: { Args: { geom: unknown }; Returns: number };
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_voronoi: {
        Args: {
          clip?: unknown;
          g1: unknown;
          return_polygons?: boolean;
          tolerance?: number;
        };
        Returns: unknown;
      };
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean };
      addauth: { Args: { "": string }; Returns: boolean };
      addgeometrycolumn:
        | {
            Args: {
              column_name: string;
              new_dim: number;
              new_srid: number;
              new_type: string;
              schema_name: string;
              table_name: string;
              use_typmod?: boolean;
            };
            Returns: string;
          }
        | {
            Args: {
              column_name: string;
              new_dim: number;
              new_srid: number;
              new_type: string;
              table_name: string;
              use_typmod?: boolean;
            };
            Returns: string;
          }
        | {
            Args: {
              catalog_name: string;
              column_name: string;
              new_dim: number;
              new_srid_in: number;
              new_type: string;
              schema_name: string;
              table_name: string;
              use_typmod?: boolean;
            };
            Returns: string;
          };
      are_users_blocked: {
        Args: { user1_id: string; user2_id: string };
        Returns: boolean;
      };
      award_referral_credits: {
        Args: { p_booking_id: string; p_referral_id: string };
        Returns: undefined;
      };
      calculate_deposit_amount: {
        Args: { booking_total: number; deposit_percentage: number };
        Returns: number;
      };
      calculate_next_booking_date: {
        Args: {
          day_of_week: number;
          frequency_type: string;
          start_date: string;
        };
        Returns: string;
      };
      calculate_professional_metrics: {
        Args: { professional_profile_id: string };
        Returns: Json;
      };
      calculate_refund_amount: {
        Args: { booking_id: string; cancellation_time: string };
        Returns: number;
      };
      calculate_service_price: {
        Args: {
          addon_ids_param?: string[];
          service_id_param: string;
          tier_id_param?: string;
        };
        Returns: Json;
      };
      check_booking_availability: {
        Args: {
          booking_date: string;
          end_time: string;
          exclude_booking_id?: string;
          professional_profile_id: string;
          start_time: string;
        };
        Returns: boolean;
      };
      check_service_ownership: {
        Args: { p_service_id: string };
        Returns: boolean;
      };
      cleanup_expired_guest_sessions: { Args: never; Returns: undefined };
      cleanup_old_platform_events: { Args: never; Returns: undefined };
      convert_guest_to_user: {
        Args: { p_guest_session_id: string; p_user_id: string };
        Returns: undefined;
      };
      diagnose_help_center: {
        Args: never;
        Returns: {
          check_name: string;
          details: string;
          status: string;
        }[];
      };
      disablelongtransactions: { Args: never; Returns: string };
      dropgeometrycolumn:
        | {
            Args: {
              column_name: string;
              schema_name: string;
              table_name: string;
            };
            Returns: string;
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
        | {
            Args: {
              catalog_name: string;
              column_name: string;
              schema_name: string;
              table_name: string;
            };
            Returns: string;
          };
      dropgeometrytable:
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
        | {
            Args: {
              catalog_name: string;
              schema_name: string;
              table_name: string;
            };
            Returns: string;
          };
      enablelongtransactions: { Args: never; Returns: string };
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean };
      generate_booking_number: { Args: never; Returns: string };
      generate_daily_revenue_snapshot: {
        Args: { professional_profile_id: string; snapshot_date?: string };
        Returns: Json;
      };
      generate_referral_code: { Args: never; Returns: string };
      geometry: { Args: { "": string }; Returns: unknown };
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geomfromewkt: { Args: { "": string }; Returns: unknown };
      get_articles_by_tag: {
        Args: { locale_filter?: string; tag_slug_filter: string };
        Returns: {
          article_id: string;
          category_slug: string;
          created_at: string;
          excerpt: string;
          slug: string;
          title: string;
          view_count: number;
        }[];
      };
      get_conversion_funnel: {
        Args: { p_end_date?: string; p_start_date?: string };
        Returns: {
          conversion_rate: number;
          stage: string;
          unique_users: number;
        }[];
      };
      get_customer_booking_summary: {
        Args: { customer_profile_id: string };
        Returns: {
          cancelled_bookings: number;
          completed_bookings: number;
          pending_bookings: number;
          pending_ratings: number;
          total_bookings: number;
          total_spent_cop: number;
        }[];
      };
      get_event_counts_by_type: {
        Args: { p_end_date?: string; p_start_date?: string };
        Returns: {
          event_count: number;
          event_type: string;
        }[];
      };
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
      get_message_participants: {
        Args: { msg_conversation_id: string };
        Returns: string[];
      };
      get_no_result_searches: {
        Args: { days_back?: number; limit_count?: number };
        Returns: {
          last_searched: string;
          query: string;
          search_count: number;
        }[];
      };
      get_onboarding_progress: {
        Args: { professional_profile_id: string };
        Returns: {
          can_accept_bookings: boolean;
          completed_items: Json;
          completion_percentage: number;
          pending_required_items: Json;
        }[];
      };
      get_performance_summary: {
        Args: { professional_profile_id: string };
        Returns: {
          average_booking_value_cop: number;
          average_rating: number;
          bookings_last_30_days: number;
          completion_rate: number;
          repeat_customer_rate: number;
          revenue_last_30_days_cop: number;
          total_bookings: number;
          total_revenue_cop: number;
        }[];
      };
      get_popular_tags: {
        Args: { limit_count?: number; locale_filter?: string };
        Returns: {
          article_count: number;
          color: string;
          name: string;
          slug: string;
          tag_id: string;
        }[];
      };
      get_pricing_rule: {
        Args: {
          p_city?: string;
          p_effective_date?: string;
          p_service_category?: string;
        };
        Returns: {
          background_check_fee_cop: number;
          commission_rate: number;
          deposit_percentage: number;
          id: string;
          late_cancel_fee_percentage: number;
          late_cancel_hours: number;
          max_price_cop: number;
          min_price_cop: number;
        }[];
      };
      get_professional_booking_summary: {
        Args: { professional_profile_id: string };
        Returns: {
          average_rating: number;
          cancelled_bookings: number;
          completed_bookings: number;
          confirmed_bookings: number;
          pending_bookings: number;
          total_bookings: number;
          total_earned_cop: number;
          total_ratings: number;
        }[];
      };
      get_professional_profile: {
        Args: { p_profile_id: string };
        Returns: {
          availability: Json;
          bio: string;
          city: string;
          country: string;
          experience_years: number;
          full_name: string;
          languages: string[];
          on_time_rate: number;
          onboarding_status: string;
          portfolio_images: Json;
          primary_services: string[];
          professional_status: string;
          profile_id: string;
          rating: number;
          references_data: Json;
          review_count: number;
          services: Json;
          total_completed_bookings: number;
          total_earnings: number;
          verification_level: string;
        }[];
      };
      get_professional_services_summary: {
        Args: { professional_profile_id: string };
        Returns: {
          active_services: number;
          average_rating: number;
          featured_services: number;
          total_bookings: number;
          total_services: number;
        }[];
      };
      get_revenue_trend: {
        Args: { days?: number; professional_profile_id: string };
        Returns: {
          bookings_count: number;
          date: string;
          revenue_cop: number;
        }[];
      };
      get_top_professionals_by_completion_rate: {
        Args: { limit_count?: number; min_bookings?: number };
        Returns: {
          average_rating: number;
          completion_rate: number;
          full_name: string;
          profile_id: string;
          total_bookings: number;
        }[];
      };
      get_top_searches: {
        Args: { days_back?: number; limit_count?: number };
        Returns: {
          avg_results: number;
          click_rate: number;
          query: string;
          search_count: number;
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
      gettransactionid: { Args: never; Returns: unknown };
      has_user_voted: {
        Args: { item_id: string; user_id: string };
        Returns: boolean;
      };
      increment_article_view_count: {
        Args: { article_id: string };
        Returns: undefined;
      };
      initialize_performance_metrics: {
        Args: { professional_profile_id: string };
        Returns: Json;
      };
      is_authorization_expired: { Args: { auth_id: string }; Returns: boolean };
      is_within_service_radius: {
        Args: { customer_location: unknown; professional_profile_id: string };
        Returns: boolean;
      };
      list_active_professionals: {
        Args: { p_customer_lat?: number; p_customer_lon?: number };
        Returns: {
          availability: Json;
          bio: string;
          city: string;
          country: string;
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
      longtransactionsenabled: { Args: never; Returns: boolean };
      mark_onboarding_item_completed: {
        Args: { item_id: string; professional_profile_id: string };
        Returns: Json;
      };
      populate_geometry_columns:
        | { Args: { use_typmod?: boolean }; Returns: string }
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number };
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string };
        Returns: number;
      };
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string };
        Returns: number;
      };
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string };
        Returns: string;
      };
      postgis_extensions_upgrade: { Args: never; Returns: string };
      postgis_full_version: { Args: never; Returns: string };
      postgis_geos_version: { Args: never; Returns: string };
      postgis_lib_build_date: { Args: never; Returns: string };
      postgis_lib_revision: { Args: never; Returns: string };
      postgis_lib_version: { Args: never; Returns: string };
      postgis_libjson_version: { Args: never; Returns: string };
      postgis_liblwgeom_version: { Args: never; Returns: string };
      postgis_libprotobuf_version: { Args: never; Returns: string };
      postgis_libxml_version: { Args: never; Returns: string };
      postgis_proj_version: { Args: never; Returns: string };
      postgis_scripts_build_date: { Args: never; Returns: string };
      postgis_scripts_installed: { Args: never; Returns: string };
      postgis_scripts_released: { Args: never; Returns: string };
      postgis_svn_version: { Args: never; Returns: string };
      postgis_type_name: {
        Args: {
          coord_dimension: number;
          geomname: string;
          use_new_name?: boolean;
        };
        Returns: string;
      };
      postgis_version: { Args: never; Returns: string };
      postgis_wagyu_version: { Args: never; Returns: string };
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
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown };
            Returns: number;
          };
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number };
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number };
        Returns: string;
      };
      st_asewkt: { Args: { "": string }; Returns: string };
      st_asgeojson:
        | {
            Args: {
              geom_column?: string;
              maxdecimaldigits?: number;
              pretty_bool?: boolean;
              r: Record<string, unknown>;
            };
            Returns: string;
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number };
            Returns: string;
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number };
            Returns: string;
          }
        | { Args: { "": string }; Returns: string };
      st_asgml:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number };
            Returns: string;
          }
        | {
            Args: {
              geom: unknown;
              id?: string;
              maxdecimaldigits?: number;
              nprefix?: string;
              options?: number;
              version: number;
            };
            Returns: string;
          }
        | {
            Args: {
              geog: unknown;
              id?: string;
              maxdecimaldigits?: number;
              nprefix?: string;
              options?: number;
              version: number;
            };
            Returns: string;
          }
        | {
            Args: {
              geog: unknown;
              id?: string;
              maxdecimaldigits?: number;
              nprefix?: string;
              options?: number;
            };
            Returns: string;
          }
        | { Args: { "": string }; Returns: string };
      st_askml:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string };
            Returns: string;
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string };
            Returns: string;
          }
        | { Args: { "": string }; Returns: string };
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string };
        Returns: string;
      };
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string };
      st_asmvtgeom: {
        Args: {
          bounds: unknown;
          buffer?: number;
          clip_geom?: boolean;
          extent?: number;
          geom: unknown;
        };
        Returns: unknown;
      };
      st_assvg:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number };
            Returns: string;
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number };
            Returns: string;
          }
        | { Args: { "": string }; Returns: string };
      st_astext: { Args: { "": string }; Returns: string };
      st_astwkb:
        | {
            Args: {
              geom: unknown[];
              ids: number[];
              prec?: number;
              prec_m?: number;
              prec_z?: number;
              with_boxes?: boolean;
              with_sizes?: boolean;
            };
            Returns: string;
          }
        | {
            Args: {
              geom: unknown;
              prec?: number;
              prec_m?: number;
              prec_z?: number;
              with_boxes?: boolean;
              with_sizes?: boolean;
            };
            Returns: string;
          };
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number };
        Returns: string;
      };
      st_azimuth:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number };
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown };
        Returns: unknown;
      };
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number };
            Returns: unknown;
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number };
            Returns: unknown;
          };
      st_centroid: { Args: { "": string }; Returns: unknown };
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown };
        Returns: unknown;
      };
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown };
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean;
          param_geom: unknown;
          param_pctconvex: number;
        };
        Returns: unknown;
      };
      st_contains: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_coorddim: { Args: { geometry: unknown }; Returns: number };
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean };
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean };
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean };
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number };
        Returns: unknown;
      };
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number };
        Returns: unknown;
      };
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number };
        Returns: unknown;
      };
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_distance:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean };
            Returns: number;
          };
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number };
            Returns: number;
          };
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      st_dwithin: {
        Args: {
          geog1: unknown;
          geog2: unknown;
          tolerance: number;
          use_spheroid?: boolean;
        };
        Returns: boolean;
      };
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean };
      st_expand:
        | {
            Args: {
              dm?: number;
              dx: number;
              dy: number;
              dz?: number;
              geom: unknown;
            };
            Returns: unknown;
          }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number };
            Returns: unknown;
          }
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown };
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown };
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number };
        Returns: unknown;
      };
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number };
        Returns: unknown;
      };
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number };
        Returns: unknown;
      };
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number };
            Returns: unknown;
          };
      st_geogfromtext: { Args: { "": string }; Returns: unknown };
      st_geographyfromtext: { Args: { "": string }; Returns: unknown };
      st_geohash:
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
        | { Args: { geog: unknown; maxchars?: number }; Returns: string };
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown };
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean;
          g: unknown;
          max_iter?: number;
          tolerance?: number;
        };
        Returns: unknown;
      };
      st_geometryfromtext: { Args: { "": string }; Returns: unknown };
      st_geomfromewkt: { Args: { "": string }; Returns: unknown };
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown };
      st_geomfromgml: { Args: { "": string }; Returns: unknown };
      st_geomfromkml: { Args: { "": string }; Returns: unknown };
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown };
      st_geomfromtext: { Args: { "": string }; Returns: unknown };
      st_gmltosql: { Args: { "": string }; Returns: unknown };
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean };
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number };
        Returns: unknown;
      };
      st_hexagongrid: {
        Args: { bounds: unknown; size: number };
        Returns: Record<string, unknown>[];
      };
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown };
        Returns: number;
      };
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number };
        Returns: unknown;
      };
      st_intersects:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean };
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown };
        Returns: Database["public"]["CompositeTypes"]["valid_detail"];
        SetofOptions: {
          from: "*";
          to: "valid_detail";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number };
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown };
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown };
        Returns: number;
      };
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string };
        Returns: unknown;
      };
      st_linefromtext: { Args: { "": string }; Returns: unknown };
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown };
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number };
        Returns: unknown;
      };
      st_locatebetween: {
        Args: {
          frommeasure: number;
          geometry: unknown;
          leftrightoffset?: number;
          tomeasure: number;
        };
        Returns: unknown;
      };
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number };
        Returns: unknown;
      };
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_makevalid: {
        Args: { geom: unknown; params: string };
        Returns: unknown;
      };
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number };
        Returns: unknown;
      };
      st_mlinefromtext: { Args: { "": string }; Returns: unknown };
      st_mpointfromtext: { Args: { "": string }; Returns: unknown };
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown };
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown };
      st_multipointfromtext: { Args: { "": string }; Returns: unknown };
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown };
      st_node: { Args: { g: unknown }; Returns: unknown };
      st_normalize: { Args: { geom: unknown }; Returns: unknown };
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string };
        Returns: unknown;
      };
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean };
        Returns: number;
      };
      st_pointfromtext: { Args: { "": string }; Returns: unknown };
      st_pointm: {
        Args: {
          mcoordinate: number;
          srid?: number;
          xcoordinate: number;
          ycoordinate: number;
        };
        Returns: unknown;
      };
      st_pointz: {
        Args: {
          srid?: number;
          xcoordinate: number;
          ycoordinate: number;
          zcoordinate: number;
        };
        Returns: unknown;
      };
      st_pointzm: {
        Args: {
          mcoordinate: number;
          srid?: number;
          xcoordinate: number;
          ycoordinate: number;
          zcoordinate: number;
        };
        Returns: unknown;
      };
      st_polyfromtext: { Args: { "": string }; Returns: unknown };
      st_polygonfromtext: { Args: { "": string }; Returns: unknown };
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown };
        Returns: unknown;
      };
      st_quantizecoordinates: {
        Args: {
          g: unknown;
          prec_m?: number;
          prec_x: number;
          prec_y?: number;
          prec_z?: number;
        };
        Returns: unknown;
      };
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number };
        Returns: unknown;
      };
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string };
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number };
        Returns: unknown;
      };
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number };
        Returns: unknown;
      };
      st_setsrid:
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
        | { Args: { geog: unknown; srid: number }; Returns: unknown };
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number };
        Returns: unknown;
      };
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown };
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number };
        Returns: unknown;
      };
      st_squaregrid: {
        Args: { bounds: unknown; size: number };
        Returns: Record<string, unknown>[];
      };
      st_srid:
        | { Args: { geom: unknown }; Returns: number }
        | { Args: { geog: unknown }; Returns: number };
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number };
        Returns: unknown[];
      };
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown };
        Returns: unknown;
      };
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number };
        Returns: unknown;
      };
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_tileenvelope: {
        Args: {
          bounds?: unknown;
          margin?: number;
          x: number;
          y: number;
          zoom: number;
        };
        Returns: unknown;
      };
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean };
      st_transform:
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number };
            Returns: unknown;
          }
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string };
            Returns: unknown;
          };
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown };
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number };
            Returns: unknown;
          };
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number };
        Returns: unknown;
      };
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number };
        Returns: unknown;
      };
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean };
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown };
      st_wkttosql: { Args: { "": string }; Returns: unknown };
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number };
        Returns: unknown;
      };
      trigger_auto_decline_cron: { Args: never; Returns: undefined };
      unlockrows: { Args: { "": string }; Returns: number };
      update_user_consent: {
        Args: { p_accepted: boolean; p_consent_type: string; p_user_id: string };
        Returns: undefined;
      };
      updategeometrysrid: {
        Args: {
          catalogn_name: string;
          column_name: string;
          new_srid_in: number;
          schema_name: string;
          table_name: string;
        };
        Returns: string;
      };
    };
    Enums: {
      authorization_status: "authorized" | "captured" | "cancelled" | "expired";
      background_check_status: "pending" | "clear" | "consider" | "suspended";
      claim_status: "filed" | "investigating" | "approved" | "denied" | "paid";
      claim_type: "damage" | "theft" | "injury" | "other";
      interview_status: "scheduled" | "completed" | "no_show" | "rescheduled" | "cancelled";
      sms_status: "sent" | "delivered" | "failed" | "undelivered";
    };
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null;
        geom: unknown;
      };
      valid_detail: {
        valid: boolean | null;
        reason: string | null;
        location: unknown;
      };
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

type Tables<
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

type TablesInsert<
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

type TablesUpdate<
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

type Enums<
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

type CompositeTypes<
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

const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      authorization_status: ["authorized", "captured", "cancelled", "expired"],
      background_check_status: ["pending", "clear", "consider", "suspended"],
      claim_status: ["filed", "investigating", "approved", "denied", "paid"],
      claim_type: ["damage", "theft", "injury", "other"],
      interview_status: ["scheduled", "completed", "no_show", "rescheduled", "cancelled"],
      sms_status: ["sent", "delivered", "failed", "undelivered"],
    },
  },
} as const;
