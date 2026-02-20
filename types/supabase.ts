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
          id: number
          title: string | null
          description: string | null
          url: string | null
          publisher: string | null
          category: string | null
          published_at: string | null
          created_at: string
        }
        Insert: {
          id?: never
          title?: string | null
          description?: string | null
          url?: string | null
          publisher?: string | null
          category?: string | null
          published_at?: string | null
          created_at?: string
        }
        Update: {
          id?: never
          title?: string | null
          description?: string | null
          url?: string | null
          publisher?: string | null
          category?: string | null
          published_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      newsletter_articles: {
        Row: {
          id: number
          newsletter_id: number
          article_id: number | null
          title: string | null
          description: string | null
          url: string | null
          publisher: string | null
          published_at: string | null
          ai_title: string | null
          ai_description: string | null
          newsletter_category: string | null
        }
        Insert: {
          id?: never
          newsletter_id: number
          article_id?: number | null
          title?: string | null
          description?: string | null
          url?: string | null
          publisher?: string | null
          published_at?: string | null
          ai_title?: string | null
          ai_description?: string | null
          newsletter_category?: string | null
        }
        Update: {
          id?: never
          newsletter_id?: number
          article_id?: number | null
          title?: string | null
          description?: string | null
          url?: string | null
          publisher?: string | null
          published_at?: string | null
          ai_title?: string | null
          ai_description?: string | null
          newsletter_category?: string | null
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
          id: number
          title: string | null
          publish_date: string | null
          status: string | null
          intro: string | null
          cover_image: string | null
        }
        Insert: {
          id?: never
          title?: string | null
          publish_date?: string | null
          status?: string | null
          intro?: string | null
          cover_image?: string | null
        }
        Update: {
          id?: never
          title?: string | null
          publish_date?: string | null
          status?: string | null
          intro?: string | null
          cover_image?: string | null
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
