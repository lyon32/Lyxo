export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      custom_exercises: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          muscle_group: string | null
          name: string
          profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          muscle_group?: string | null
          name: string
          profile_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          muscle_group?: string | null
          name?: string
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_exercises_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      devices: {
        Row: {
          created_at: string
          device_id: string
          device_name: string | null
          id: string
          is_active: boolean
          last_active_at: string
          profile_id: string
          push_token: string | null
        }
        Insert: {
          created_at?: string
          device_id: string
          device_name?: string | null
          id?: string
          is_active?: boolean
          last_active_at?: string
          profile_id: string
          push_token?: string | null
        }
        Update: {
          created_at?: string
          device_id?: string
          device_name?: string | null
          id?: string
          is_active?: boolean
          last_active_at?: string
          profile_id?: string
          push_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "devices_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          created_at: string
          equipment: string | null
          external_id: string | null
          gif_url: string | null
          id: string
          is_embedded_pack: boolean
          muscle_group: string
          name_en: string
          name_fr: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          equipment?: string | null
          external_id?: string | null
          gif_url?: string | null
          id?: string
          is_embedded_pack?: boolean
          muscle_group: string
          name_en: string
          name_fr: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          equipment?: string | null
          external_id?: string | null
          gif_url?: string | null
          id?: string
          is_embedded_pack?: boolean
          muscle_group?: string
          name_en?: string
          name_fr?: string
          updated_at?: string
        }
        Relationships: []
      }
      personal_records: {
        Row: {
          achieved_at: string
          created_at: string
          deleted_at: string | null
          estimated_1rm_kg: number | null
          exercise_id: string
          id: string
          ineligibility_reason: string | null
          is_social_eligible: boolean
          local_id: string
          pr_type: string
          profile_id: string
          reps: number
          set_id: string | null
          updated_at: string
          weight_kg: number
        }
        Insert: {
          achieved_at: string
          created_at?: string
          deleted_at?: string | null
          estimated_1rm_kg?: number | null
          exercise_id: string
          id?: string
          ineligibility_reason?: string | null
          is_social_eligible?: boolean
          local_id: string
          pr_type: string
          profile_id: string
          reps: number
          set_id?: string | null
          updated_at?: string
          weight_kg: number
        }
        Update: {
          achieved_at?: string
          created_at?: string
          deleted_at?: string | null
          estimated_1rm_kg?: number | null
          exercise_id?: string
          id?: string
          ineligibility_reason?: string | null
          is_social_eligible?: boolean
          local_id?: string
          pr_type?: string
          profile_id?: string
          reps?: number
          set_id?: string | null
          updated_at?: string
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "personal_records_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_records_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_records_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "sets"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_initials: string | null
          billing_region: string
          bio: string | null
          country: string | null
          created_at: string
          data_saver: boolean
          deleted_at: string | null
          display_name: string | null
          goal: string | null
          hide_lost_titles: boolean
          id: string
          is_coach: boolean
          is_private: boolean
          is_reviewer: boolean
          language: string
          preferred_split: string | null
          private_sessions_default: boolean
          rivalry_notifications: boolean
          trial_expires_at: string | null
          trial_used: boolean
          updated_at: string
          username: string
          weekly_goal: number
          weight_unit: string
        }
        Insert: {
          avatar_initials?: string | null
          billing_region?: string
          bio?: string | null
          country?: string | null
          created_at?: string
          data_saver?: boolean
          deleted_at?: string | null
          display_name?: string | null
          goal?: string | null
          hide_lost_titles?: boolean
          id: string
          is_coach?: boolean
          is_private?: boolean
          is_reviewer?: boolean
          language?: string
          preferred_split?: string | null
          private_sessions_default?: boolean
          rivalry_notifications?: boolean
          trial_expires_at?: string | null
          trial_used?: boolean
          updated_at?: string
          username: string
          weekly_goal?: number
          weight_unit?: string
        }
        Update: {
          avatar_initials?: string | null
          billing_region?: string
          bio?: string | null
          country?: string | null
          created_at?: string
          data_saver?: boolean
          deleted_at?: string | null
          display_name?: string | null
          goal?: string | null
          hide_lost_titles?: boolean
          id?: string
          is_coach?: boolean
          is_private?: boolean
          is_reviewer?: boolean
          language?: string
          preferred_split?: string | null
          private_sessions_default?: boolean
          rivalry_notifications?: boolean
          trial_expires_at?: string | null
          trial_used?: boolean
          updated_at?: string
          username?: string
          weekly_goal?: number
          weight_unit?: string
        }
        Relationships: []
      }
      sets: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          is_completed: boolean
          local_id: string
          reps: number
          rpe: number | null
          set_number: number
          updated_at: string
          weight_kg: number
          workout_exercise_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_completed?: boolean
          local_id: string
          reps: number
          rpe?: number | null
          set_number: number
          updated_at?: string
          weight_kg: number
          workout_exercise_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_completed?: boolean
          local_id?: string
          reps?: number
          rpe?: number | null
          set_number?: number
          updated_at?: string
          weight_kg?: number
          workout_exercise_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sets_workout_exercise_id_fkey"
            columns: ["workout_exercise_id"]
            isOneToOne: false
            referencedRelation: "workout_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_exercises: {
        Row: {
          created_at: string
          custom_exercise_id: string | null
          deleted_at: string | null
          exercise_id: string | null
          id: string
          local_id: string
          order_index: number
          updated_at: string
          workout_id: string
        }
        Insert: {
          created_at?: string
          custom_exercise_id?: string | null
          deleted_at?: string | null
          exercise_id?: string | null
          id?: string
          local_id: string
          order_index: number
          updated_at?: string
          workout_id: string
        }
        Update: {
          created_at?: string
          custom_exercise_id?: string | null
          deleted_at?: string | null
          exercise_id?: string | null
          id?: string
          local_id?: string
          order_index?: number
          updated_at?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_custom_exercise_id_fkey"
            columns: ["custom_exercise_id"]
            isOneToOne: false
            referencedRelation: "custom_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          completed_at: string | null
          created_at: string
          deleted_at: string | null
          id: string
          is_private: boolean
          local_id: string
          profile_id: string
          program_id: string | null
          started_at: string
          title: string | null
          total_volume_kg: number | null
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_private?: boolean
          local_id: string
          profile_id: string
          program_id?: string | null
          started_at: string
          title?: string | null
          total_volume_kg?: number | null
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_private?: boolean
          local_id?: string
          profile_id?: string
          program_id?: string | null
          started_at?: string
          title?: string | null
          total_volume_kg?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workouts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_active_premium: { Args: { p_profile_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
