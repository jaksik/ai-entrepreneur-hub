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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      articles: {
        Row: {
          created_at: string
          id: number
          title: string | null
          url: string | null
          publisher: string | null
          category: string | null
          published_at: string | null
          description: string | null
          source: string | null
          source_feature: boolean
          title_snippet: string | null
          description_snippet: string | null
          newsletter_id: number | null
        }
        Insert: {
          created_at?: string
          id?: never
          title?: string | null
          url?: string | null
          publisher?: string | null
          category?: string | null
          published_at?: string | null
          description?: string | null
          source?: string | null
          source_feature?: boolean
          title_snippet?: string | null
          description_snippet?: string | null
          newsletter_id?: number | null
        }
        Update: {
          created_at?: string
          id?: never
          title?: string | null
          url?: string | null
          publisher?: string | null
          category?: string | null
          published_at?: string | null
          description?: string | null
          source?: string | null
          source_feature?: boolean
          title_snippet?: string | null
          description_snippet?: string | null
          newsletter_id?: number | null
        }
        Relationships: []
      }
      newsletter_images: {
        Row: {
          id: number
          newsletter_id: number
          blob_url: string | null
          prompt: string | null
          provider: string | null
          model: string | null
          created_at: string | null
        }
        Insert: {
          id?: never
          newsletter_id: number
          blob_url?: string | null
          prompt?: string | null
          provider?: string | null
          model?: string | null
          created_at?: string | null
        }
        Update: {
          id?: never
          newsletter_id?: number
          blob_url?: string | null
          prompt?: string | null
          provider?: string | null
          model?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      newsletters: {
        Row: {
          created_at: string
          id: number
          publish_date: string | null
          title: string | null
          sub_title: string | null
          intro: string | null
          status: string | null
          cover_image: string | null
          cover_article: number | null
        }
        Insert: {
          created_at?: string
          id?: never
          publish_date?: string | null
          title?: string | null
          sub_title?: string | null
          intro?: string | null
          status?: string | null
          cover_image?: string | null
          cover_article?: number | null
        }
        Update: {
          created_at?: string
          id?: never
          publish_date?: string | null
          title?: string | null
          sub_title?: string | null
          intro?: string | null
          status?: string | null
          cover_image?: string | null
          cover_article?: number | null
        }
        Relationships: []
      }
      job_postings: {
        Row: {
          id: number
          created_at: string
          job_id: string | null
          newsletter_id: number | null
          title: string | null
          company: string | null
          location: string | null
          apply_link: string | null
          remote: boolean | null
          company_logo: string | null
          description: string | null
          posted_date: string | null
        }
        Insert: {
          id?: never
          created_at?: string
          job_id?: string | null
          newsletter_id?: number | null
          title?: string | null
          company?: string | null
          location?: string | null
          apply_link?: string | null
          remote?: boolean | null
          company_logo?: string | null
          description?: string | null
          posted_date?: string | null
        }
        Update: {
          id?: never
          created_at?: string
          job_id?: string | null
          newsletter_id?: number | null
          title?: string | null
          company?: string | null
          location?: string | null
          apply_link?: string | null
          remote?: boolean | null
          company_logo?: string | null
          description?: string | null
          posted_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_postings_newsletter_id_fkey"
            columns: ["newsletter_id"]
            isOneToOne: false
            referencedRelation: "newsletters"
            referencedColumns: ["id"]
          },
        ]
      }
      script_logs: {
        Row: {
          id: number
          created_at: string
          status: string | null
          script_name: string | null
          message: string | null
        }
        Insert: {
          id?: never
          created_at?: string
          status?: string | null
          script_name?: string | null
          message?: string | null
        }
        Update: {
          id?: never
          created_at?: string
          status?: string | null
          script_name?: string | null
          message?: string | null
        }
        Relationships: []
      }
      tools: {
        Row: {
          affiliate_link: string | null
          category: string | null
          description: string | null
          id: number
          logo_url: string | null
          name: string | null
          subcategory: string | null
          url: string | null
        }
        Insert: {
          affiliate_link?: string | null
          category?: string | null
          description?: string | null
          id?: never
          logo_url?: string | null
          name?: string | null
          subcategory?: string | null
          url?: string | null
        }
        Update: {
          affiliate_link?: string | null
          category?: string | null
          description?: string | null
          id?: never
          logo_url?: string | null
          name?: string | null
          subcategory?: string | null
          url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
