export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          created_at: string
          doctor_id: string
          id: string
          note: string | null
          patient_id: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          reason: string | null
          ref: string
          starts_at: string
          status: Database["public"]["Enums"]["appointment_status"]
          symptom: string | null
        }
        Insert: {
          created_at?: string
          doctor_id: string
          id?: string
          note?: string | null
          patient_id: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          reason?: string | null
          ref: string
          starts_at: string
          status?: Database["public"]["Enums"]["appointment_status"]
          symptom?: string | null
        }
        Update: {
          created_at?: string
          doctor_id?: string
          id?: string
          note?: string | null
          patient_id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          reason?: string | null
          ref?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          symptom?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      availability: {
        Row: {
          doctor_id: string
          end_time: string
          id: string
          start_time: string
          weekday: number
        }
        Insert: {
          doctor_id: string
          end_time: string
          id?: string
          start_time: string
          weekday: number
        }
        Update: {
          doctor_id?: string
          end_time?: string
          id?: string
          start_time?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "availability_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          active: boolean
          bio: string | null
          created_at: string
          id: string
          languages: string[]
          name: string
          photo_url: string | null
          profile_id: string | null
          reg_no: string | null
          specialty: string
          verification_status: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          active?: boolean
          bio?: string | null
          created_at?: string
          id?: string
          languages?: string[]
          name: string
          photo_url?: string | null
          profile_id?: string | null
          reg_no?: string | null
          specialty: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          active?: boolean
          bio?: string | null
          created_at?: string
          id?: string
          languages?: string[]
          name?: string
          photo_url?: string | null
          profile_id?: string | null
          reg_no?: string | null
          specialty?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: [
          {
            foreignKeyName: "doctors_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          diabetes: Database["public"]["Enums"]["diabetes_status"]
          email: string | null
          full_name: string | null
          id: string
          notify_email: boolean
          notify_sms: boolean
          notify_whatsapp: boolean
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          diabetes?: Database["public"]["Enums"]["diabetes_status"]
          email?: string | null
          full_name?: string | null
          id: string
          notify_email?: boolean
          notify_sms?: boolean
          notify_whatsapp?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          diabetes?: Database["public"]["Enums"]["diabetes_status"]
          email?: string | null
          full_name?: string | null
          id?: string
          notify_email?: boolean
          notify_sms?: boolean
          notify_whatsapp?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      triage_option_scores: {
        Row: {
          label: string
          red_flag: boolean
          urgency: number
          value: string
        }
        Insert: {
          label: string
          red_flag?: boolean
          urgency?: number
          value: string
        }
        Update: {
          label?: string
          red_flag?: boolean
          urgency?: number
          value?: string
        }
        Relationships: []
      }
      triage_records: {
        Row: {
          acuity: Json
          answers: Json
          appointment_id: string
          id: string
          photo_paths: string[]
          red_flags: string[]
          submitted_at: string
          urgency: number
        }
        Insert: {
          acuity?: Json
          answers?: Json
          appointment_id: string
          id?: string
          photo_paths?: string[]
          red_flags?: string[]
          submitted_at?: string
          urgency?: number
        }
        Update: {
          acuity?: Json
          answers?: Json
          appointment_id?: string
          id?: string
          photo_paths?: string[]
          red_flags?: string[]
          submitted_at?: string
          urgency?: number
        }
        Relationships: [
          {
            foreignKeyName: "triage_records_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: true
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      book_appointment: {
        Args: {
          p_doctor_id: string
          p_note?: string
          p_reason: string
          p_starts_at: string
          p_symptom?: string
        }
        Returns: {
          created_at: string
          doctor_id: string
          id: string
          note: string | null
          patient_id: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          reason: string | null
          ref: string
          starts_at: string
          status: Database["public"]["Enums"]["appointment_status"]
          symptom: string | null
        }
        SetofOptions: {
          from: "*"
          to: "appointments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      is_admin: { Args: never; Returns: boolean }
      my_doctor_id: { Args: never; Returns: string }
      open_slots: {
        Args: { p_days?: number; p_doctor_id: string }
        Returns: string[]
      }
      submit_triage: {
        Args: {
          p_acuity?: Json
          p_answers: Json
          p_appointment_id: string
          p_photo_paths?: string[]
        }
        Returns: {
          acuity: Json
          answers: Json
          appointment_id: string
          id: string
          photo_paths: string[]
          red_flags: string[]
          submitted_at: string
          urgency: number
        }
        SetofOptions: {
          from: "*"
          to: "triage_records"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      appointment_status:
        | "upcoming"
        | "live"
        | "completed"
        | "cancelled"
        | "no_show"
      diabetes_status: "yes" | "no" | "unknown"
      payment_status: "pending" | "paid" | "refunded"
      user_role: "patient" | "doctor" | "admin"
      verification_status: "verified" | "pending" | "suspended"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      appointment_status: [
        "upcoming",
        "live",
        "completed",
        "cancelled",
        "no_show",
      ],
      diabetes_status: ["yes", "no", "unknown"],
      payment_status: ["pending", "paid", "refunded"],
      user_role: ["patient", "doctor", "admin"],
      verification_status: ["verified", "pending", "suspended"],
    },
  },
} as const

