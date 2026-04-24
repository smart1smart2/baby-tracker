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
      caregivers: {
        Row: {
          child_id: string
          created_at: string
          profile_id: string
          role: Database["public"]["Enums"]["caregiver_role"]
        }
        Insert: {
          child_id: string
          created_at?: string
          profile_id: string
          role?: Database["public"]["Enums"]["caregiver_role"]
        }
        Update: {
          child_id?: string
          created_at?: string
          profile_id?: string
          role?: Database["public"]["Enums"]["caregiver_role"]
        }
        Relationships: [
          {
            foreignKeyName: "caregivers_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caregivers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          avatar_url: string | null
          created_at: string
          date_of_birth: string
          full_name: string
          id: string
          notes: string | null
          sex: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth: string
          full_name: string
          id?: string
          notes?: string | null
          sex?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string
          full_name?: string
          id?: string
          notes?: string | null
          sex?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      diapers: {
        Row: {
          child_id: string
          created_at: string
          created_by: string | null
          id: string
          kind: Database["public"]["Enums"]["diaper_kind"]
          notes: string | null
          occurred_at: string
        }
        Insert: {
          child_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          kind: Database["public"]["Enums"]["diaper_kind"]
          notes?: string | null
          occurred_at?: string
        }
        Update: {
          child_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["diaper_kind"]
          notes?: string | null
          occurred_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "diapers_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diapers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedings: {
        Row: {
          amount_ml: number | null
          child_id: string
          created_at: string
          created_by: string | null
          ended_at: string | null
          id: string
          kind: Database["public"]["Enums"]["feeding_kind"]
          notes: string | null
          solid_food: string | null
          started_at: string
        }
        Insert: {
          amount_ml?: number | null
          child_id: string
          created_at?: string
          created_by?: string | null
          ended_at?: string | null
          id?: string
          kind: Database["public"]["Enums"]["feeding_kind"]
          notes?: string | null
          solid_food?: string | null
          started_at: string
        }
        Update: {
          amount_ml?: number | null
          child_id?: string
          created_at?: string
          created_by?: string | null
          ended_at?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["feeding_kind"]
          notes?: string | null
          solid_food?: string | null
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedings_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      growth_measurements: {
        Row: {
          child_id: string
          created_at: string
          created_by: string | null
          id: string
          kind: Database["public"]["Enums"]["measurement_kind"]
          measured_at: string
          notes: string | null
          unit: string
          value: number
        }
        Insert: {
          child_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          kind: Database["public"]["Enums"]["measurement_kind"]
          measured_at?: string
          notes?: string | null
          unit: string
          value: number
        }
        Update: {
          child_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["measurement_kind"]
          measured_at?: string
          notes?: string | null
          unit?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "growth_measurements_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "growth_measurements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      milestone_templates: {
        Row: {
          category: string
          code: string
          description: string | null
          expected_age_max_months: number
          expected_age_min_months: number
          id: string
          title: string
        }
        Insert: {
          category: string
          code: string
          description?: string | null
          expected_age_max_months: number
          expected_age_min_months: number
          id?: string
          title: string
        }
        Update: {
          category?: string
          code?: string
          description?: string | null
          expected_age_max_months?: number
          expected_age_min_months?: number
          id?: string
          title?: string
        }
        Relationships: []
      }
      milestones: {
        Row: {
          achieved_at: string | null
          child_id: string
          created_at: string
          created_by: string | null
          custom_title: string | null
          id: string
          notes: string | null
          photo_url: string | null
          template_id: string | null
        }
        Insert: {
          achieved_at?: string | null
          child_id: string
          created_at?: string
          created_by?: string | null
          custom_title?: string | null
          id?: string
          notes?: string | null
          photo_url?: string | null
          template_id?: string | null
        }
        Update: {
          achieved_at?: string | null
          child_id?: string
          created_at?: string
          created_by?: string | null
          custom_title?: string | null
          id?: string
          notes?: string | null
          photo_url?: string | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "milestones_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestones_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestones_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "milestone_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      photos: {
        Row: {
          caption: string | null
          child_id: string
          created_at: string
          created_by: string | null
          id: string
          storage_path: string
          taken_at: string
        }
        Insert: {
          caption?: string | null
          child_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          storage_path: string
          taken_at?: string
        }
        Update: {
          caption?: string | null
          child_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          storage_path?: string
          taken_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "photos_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          locale: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          locale?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          locale?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          child_id: string
          created_at: string
          created_by: string | null
          due_at: string
          id: string
          is_done: boolean
          kind: Database["public"]["Enums"]["reminder_kind"]
          notes: string | null
          recurrence: string | null
          title: string
        }
        Insert: {
          child_id: string
          created_at?: string
          created_by?: string | null
          due_at: string
          id?: string
          is_done?: boolean
          kind: Database["public"]["Enums"]["reminder_kind"]
          notes?: string | null
          recurrence?: string | null
          title: string
        }
        Update: {
          child_id?: string
          created_at?: string
          created_by?: string | null
          due_at?: string
          id?: string
          is_done?: boolean
          kind?: Database["public"]["Enums"]["reminder_kind"]
          notes?: string | null
          recurrence?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sleeps: {
        Row: {
          child_id: string
          created_at: string
          created_by: string | null
          ended_at: string | null
          id: string
          notes: string | null
          started_at: string
        }
        Insert: {
          child_id: string
          created_at?: string
          created_by?: string | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          started_at: string
        }
        Update: {
          child_id?: string
          created_at?: string
          created_by?: string | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sleeps_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sleeps_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vaccinations: {
        Row: {
          administered_at: string | null
          child_id: string
          created_at: string
          created_by: string | null
          dose_number: number | null
          id: string
          notes: string | null
          scheduled_for: string | null
          vaccine_code: string
          vaccine_name: string
        }
        Insert: {
          administered_at?: string | null
          child_id: string
          created_at?: string
          created_by?: string | null
          dose_number?: number | null
          id?: string
          notes?: string | null
          scheduled_for?: string | null
          vaccine_code: string
          vaccine_name: string
        }
        Update: {
          administered_at?: string | null
          child_id?: string
          created_at?: string
          created_by?: string | null
          dose_number?: number | null
          id?: string
          notes?: string | null
          scheduled_for?: string | null
          vaccine_code?: string
          vaccine_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "vaccinations_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccinations_created_by_fkey"
            columns: ["created_by"]
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
      can_edit_child: { Args: { p_child: string }; Returns: boolean }
      is_caregiver: { Args: { p_child: string }; Returns: boolean }
    }
    Enums: {
      caregiver_role: "owner" | "co_parent" | "caregiver" | "pediatrician"
      diaper_kind: "wet" | "dirty" | "mixed" | "dry"
      feeding_kind:
        | "breast_left"
        | "breast_right"
        | "bottle_breast_milk"
        | "bottle_formula"
        | "solid"
      measurement_kind: "weight" | "height" | "head_circumference"
      reminder_kind: "feeding" | "sleep" | "medicine" | "vaccination" | "custom"
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
    Enums: {
      caregiver_role: ["owner", "co_parent", "caregiver", "pediatrician"],
      diaper_kind: ["wet", "dirty", "mixed", "dry"],
      feeding_kind: [
        "breast_left",
        "breast_right",
        "bottle_breast_milk",
        "bottle_formula",
        "solid",
      ],
      measurement_kind: ["weight", "height", "head_circumference"],
      reminder_kind: ["feeding", "sleep", "medicine", "vaccination", "custom"],
    },
  },
} as const
