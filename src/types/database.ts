/**
 * Mirrors supabase/migrations/20260823000000_initial_schema.sql.
 *
 * Hand-written because the Supabase project does not exist yet. Once it does,
 * this file becomes generated and must no longer be edited by hand:
 *
 *   npm run types:gen
 *   # or, against the remote project:
 *   npx supabase gen types typescript --project-id YOUR_ID > src/types/database.ts
 */
export type Json = string | number | boolean | null | { [k: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          created_at: string;
          timezone: string;
          baseline_pgsi: number | null;
          pgsi_at: string | null;
          ema_times: string[];
          goal: string;
        };
        Insert: {
          id: string;
          created_at?: string;
          timezone?: string;
          baseline_pgsi?: number | null;
          pgsi_at?: string | null;
          ema_times?: string[];
          goal?: string;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
        Relationships: [];
      };
      ema_entries: {
        Row: {
          id: string;
          user_id: string;
          scheduled_at: string;
          answered_at: string | null;
          craving: number | null;
          self_efficacy: number | null;
          mood: string | null;
          triggers: string[] | null;
          context: string[] | null;
          gambled_since_last: boolean | null;
          amount_band: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          scheduled_at: string;
          answered_at?: string | null;
          craving?: number | null;
          self_efficacy?: number | null;
          mood?: string | null;
          triggers?: string[] | null;
          context?: string[] | null;
          gambled_since_last?: boolean | null;
          amount_band?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['ema_entries']['Insert']>;
        Relationships: [];
      };
      coping_plans: {
        Row: {
          id: string;
          user_id: string;
          trigger_condition: string;
          action: string;
          category: string;
          triggers: string[];
          times_shown: number;
          times_worked: number;
          archived_at: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          trigger_condition: string;
          action: string;
          category: string;
          triggers?: string[];
          times_shown?: number;
          times_worked?: number;
          archived_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['coping_plans']['Insert']>;
        Relationships: [];
      };
      interventions: {
        Row: {
          id: string;
          user_id: string;
          ema_id: string | null;
          plan_id: string | null;
          triggered_at: string;
          trigger_reason: string | null;
          followup_at: string | null;
          outcome: string | null;
        };
        Insert: {
          id: string;
          user_id: string;
          ema_id?: string | null;
          plan_id?: string | null;
          triggered_at?: string;
          trigger_reason?: string | null;
          followup_at?: string | null;
          outcome?: string | null;
        };
        Update: Partial<Database['public']['Tables']['interventions']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      delete_my_data: { Args: Record<string, never>; Returns: undefined };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

export type Tables = Database['public']['Tables'];
export type UserRow = Tables['users']['Row'];
export type EmaRow = Tables['ema_entries']['Row'];
export type PlanRow = Tables['coping_plans']['Row'];
export type InterventionRow = Tables['interventions']['Row'];
