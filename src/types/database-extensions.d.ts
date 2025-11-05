/**
 * Temporary type extensions for Sprint 2 features
 *
 * TODO: Regenerate types from production with:
 * supabase gen types typescript --linked > src/types/supabase.ts
 *
 * (Once connection pooler issues are resolved)
 */

declare module "@/types/supabase" {
  export type Database = {
    public: {
      Tables: {
        bookings: {
          Row: {
            // Sprint 2: Rebook Nudge columns
            rebook_nudge_variant?: "24h" | "72h" | null;
            rebook_nudge_sent?: boolean | null;
            rebook_nudge_sent_at?: string | null;
            // ... other existing columns
          };
          Insert: {
            rebook_nudge_variant?: "24h" | "72h" | null;
            rebook_nudge_sent?: boolean | null;
            rebook_nudge_sent_at?: string | null;
            // ... other existing columns
          };
          Update: {
            rebook_nudge_variant?: "24h" | "72h" | null;
            rebook_nudge_sent?: boolean | null;
            rebook_nudge_sent_at?: string | null;
            // ... other existing columns
          };
        };

        // Sprint 2: New tables
        pricing_controls: {
          Row: {
            id: string;
            service_category: string | null;
            city: string | null;
            country: string;
            commission_rate: number;
            background_check_fee_cop: number;
            min_price_cop: number | null;
            max_price_cop: number | null;
            deposit_percentage: number | null;
            late_cancel_hours: number;
            late_cancel_fee_percentage: number;
            effective_from: string;
            effective_until: string | null;
            created_by: string | null;
            notes: string | null;
            is_active: boolean;
            created_at: string;
            updated_at: string;
          };
          Insert: {
            id?: string;
            service_category?: string | null;
            city?: string | null;
            country?: string;
            commission_rate: number;
            background_check_fee_cop?: number;
            min_price_cop?: number | null;
            max_price_cop?: number | null;
            deposit_percentage?: number | null;
            late_cancel_hours?: number;
            late_cancel_fee_percentage?: number;
            effective_from?: string;
            effective_until?: string | null;
            created_by?: string | null;
            notes?: string | null;
            is_active?: boolean;
            created_at?: string;
            updated_at?: string;
          };
          Update: {
            id?: string;
            service_category?: string | null;
            city?: string | null;
            country?: string;
            commission_rate?: number;
            background_check_fee_cop?: number;
            min_price_cop?: number | null;
            max_price_cop?: number | null;
            deposit_percentage?: number | null;
            late_cancel_hours?: number;
            late_cancel_fee_percentage?: number;
            effective_from?: string;
            effective_until?: string | null;
            created_by?: string | null;
            notes?: string | null;
            is_active?: boolean;
            created_at?: string;
            updated_at?: string;
          };
        };

        recurring_plans: {
          Row: {
            id: string;
            customer_id: string;
            professional_id: string;
            service_name: string;
            duration_minutes: number;
            address: string;
            special_instructions: string | null;
            frequency: "weekly" | "biweekly" | "monthly";
            day_of_week: number | null;
            preferred_time: string;
            base_amount: number;
            discount_percentage: number;
            final_amount: number;
            currency: string;
            status: "active" | "paused" | "cancelled";
            pause_start_date: string | null;
            pause_end_date: string | null;
            created_at: string;
            updated_at: string;
            next_booking_date: string;
            total_bookings_completed: number;
          };
          Insert: {
            id?: string;
            customer_id: string;
            professional_id: string;
            service_name: string;
            duration_minutes: number;
            address: string;
            special_instructions?: string | null;
            frequency: "weekly" | "biweekly" | "monthly";
            day_of_week?: number | null;
            preferred_time: string;
            base_amount: number;
            discount_percentage?: number;
            final_amount: number;
            currency?: string;
            status?: "active" | "paused" | "cancelled";
            pause_start_date?: string | null;
            pause_end_date?: string | null;
            created_at?: string;
            updated_at?: string;
            next_booking_date: string;
            total_bookings_completed?: number;
          };
          Update: {
            id?: string;
            customer_id?: string;
            professional_id?: string;
            service_name?: string;
            duration_minutes?: number;
            address?: string;
            special_instructions?: string | null;
            frequency?: "weekly" | "biweekly" | "monthly";
            day_of_week?: number | null;
            preferred_time?: string;
            base_amount?: number;
            discount_percentage?: number;
            final_amount?: number;
            currency?: string;
            status?: "active" | "paused" | "cancelled";
            pause_start_date?: string | null;
            pause_end_date?: string | null;
            created_at?: string;
            updated_at?: string;
            next_booking_date?: string;
            total_bookings_completed?: number;
          };
        };

        rebook_nudge_experiments: {
          Row: {
            id: string;
            booking_id: string;
            customer_id: string;
            variant: "24h" | "72h";
            email_sent_at: string | null;
            email_opened: boolean;
            email_opened_at: string | null;
            email_clicked: boolean;
            email_clicked_at: string | null;
            push_sent_at: string | null;
            push_clicked: boolean;
            push_clicked_at: string | null;
            rebooked: boolean;
            rebooked_at: string | null;
            rebook_booking_id: string | null;
            created_at: string;
            updated_at: string;
          };
          Insert: {
            id?: string;
            booking_id: string;
            customer_id: string;
            variant: "24h" | "72h";
            email_sent_at?: string | null;
            email_opened?: boolean;
            email_opened_at?: string | null;
            email_clicked?: boolean;
            email_clicked_at?: string | null;
            push_sent_at?: string | null;
            push_clicked?: boolean;
            push_clicked_at?: string | null;
            rebooked?: boolean;
            rebooked_at?: string | null;
            rebook_booking_id?: string | null;
            created_at?: string;
            updated_at?: string;
          };
          Update: {
            id?: string;
            booking_id?: string;
            customer_id?: string;
            variant?: "24h" | "72h";
            email_sent_at?: string | null;
            email_opened?: boolean;
            email_opened_at?: string | null;
            email_clicked?: boolean;
            email_clicked_at?: string | null;
            push_sent_at?: string | null;
            push_clicked?: boolean;
            push_clicked_at?: string | null;
            rebooked?: boolean;
            rebooked_at?: string | null;
            rebook_booking_id?: string | null;
            created_at?: string;
            updated_at?: string;
          };
        };

        recurring_plan_holidays: {
          Row: {
            id: string;
            recurring_plan_id: string;
            skip_date: string;
            reason: string | null;
            created_at: string;
          };
          Insert: {
            id?: string;
            recurring_plan_id: string;
            skip_date: string;
            reason?: string | null;
            created_at?: string;
          };
          Update: {
            id?: string;
            recurring_plan_id?: string;
            skip_date?: string;
            reason?: string | null;
            created_at?: string;
          };
        };
      };
    };
  };
}
