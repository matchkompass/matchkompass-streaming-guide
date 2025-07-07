export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      club_leagues: {
        Row: {
          club_id: number | null
          id: number
          league_id: number | null
        }
        Insert: {
          club_id?: number | null
          id?: number
          league_id?: number | null
        }
        Update: {
          club_id?: number | null
          id?: number
          league_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "club_leagues_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["club_id"]
          },
          {
            foreignKeyName: "club_leagues_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["league_id"]
          },
        ]
      }
      clubs: {
        Row: {
          bundesliga: boolean | null
          champions_league: boolean | null
          club_id: number
          club_world_cup: boolean | null
          conference_league: boolean | null
          copa_del_rey: boolean | null
          coppa_italia: boolean | null
          country: string | null
          coupe_de_france: boolean | null
          dfb_pokal: boolean | null
          efl_cup: boolean | null
          eredevise: boolean | null
          europa_league: boolean | null
          fa_cup: boolean | null
          facebook_url: string | null
          fanshop_url: string | null
          founded_year: number | null
          instagram_url: string | null
          la_liga: boolean | null
          liga_portugal: boolean | null
          ligue_1: boolean | null
          logo_url: string | null
          members_count: number | null
          mls: boolean | null
          name: string | null
          popularity_score: number | null
          premier_league: boolean | null
          primary_color: string | null
          saudi_pro_league: boolean | null
          second_bundesliga: boolean | null
          secondary_color: string | null
          serie_a: boolean | null
          slug: string | null
          stadium_capacity: number | null
          stadium_location: string | null
          stadium_name: string | null
          sueper_lig: boolean | null
          third_bundesliga: boolean | null
          twitter_url: string | null
          website_url: string | null
        }
        Insert: {
          bundesliga?: boolean | null
          champions_league?: boolean | null
          club_id: number
          club_world_cup?: boolean | null
          conference_league?: boolean | null
          copa_del_rey?: boolean | null
          coppa_italia?: boolean | null
          country?: string | null
          coupe_de_france?: boolean | null
          dfb_pokal?: boolean | null
          efl_cup?: boolean | null
          eredevise?: boolean | null
          europa_league?: boolean | null
          fa_cup?: boolean | null
          facebook_url?: string | null
          fanshop_url?: string | null
          founded_year?: number | null
          instagram_url?: string | null
          la_liga?: boolean | null
          liga_portugal?: boolean | null
          ligue_1?: boolean | null
          logo_url?: string | null
          members_count?: number | null
          mls?: boolean | null
          name?: string | null
          popularity_score?: number | null
          premier_league?: boolean | null
          primary_color?: string | null
          saudi_pro_league?: boolean | null
          second_bundesliga?: boolean | null
          secondary_color?: string | null
          serie_a?: boolean | null
          slug?: string | null
          stadium_capacity?: number | null
          stadium_location?: string | null
          stadium_name?: string | null
          sueper_lig?: boolean | null
          third_bundesliga?: boolean | null
          twitter_url?: string | null
          website_url?: string | null
        }
        Update: {
          bundesliga?: boolean | null
          champions_league?: boolean | null
          club_id?: number
          club_world_cup?: boolean | null
          conference_league?: boolean | null
          copa_del_rey?: boolean | null
          coppa_italia?: boolean | null
          country?: string | null
          coupe_de_france?: boolean | null
          dfb_pokal?: boolean | null
          efl_cup?: boolean | null
          eredevise?: boolean | null
          europa_league?: boolean | null
          fa_cup?: boolean | null
          facebook_url?: string | null
          fanshop_url?: string | null
          founded_year?: number | null
          instagram_url?: string | null
          la_liga?: boolean | null
          liga_portugal?: boolean | null
          ligue_1?: boolean | null
          logo_url?: string | null
          members_count?: number | null
          mls?: boolean | null
          name?: string | null
          popularity_score?: number | null
          premier_league?: boolean | null
          primary_color?: string | null
          saudi_pro_league?: boolean | null
          second_bundesliga?: boolean | null
          secondary_color?: string | null
          serie_a?: boolean | null
          slug?: string | null
          stadium_capacity?: number | null
          stadium_location?: string | null
          stadium_name?: string | null
          sueper_lig?: boolean | null
          third_bundesliga?: boolean | null
          twitter_url?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      leagues: {
        Row: {
          "country code": string | null
          league: string | null
          league_id: number
          league_slug: string | null
          "number of games": number | null
        }
        Insert: {
          "country code"?: string | null
          league?: string | null
          league_id: number
          league_slug?: string | null
          "number of games"?: number | null
        }
        Update: {
          "country code"?: string | null
          league?: string | null
          league_id?: number
          league_slug?: string | null
          "number of games"?: number | null
        }
        Relationships: []
      }
      streaming: {
        Row: {
          affiliate_url: string | null
          bundesliga: number | null
          champions_league: number | null
          club_world_cup: number | null
          conference_league: number | null
          copa_del_rey: number | null
          coppa_italia: number | null
          coupe_de_france: number | null
          dfb_pokal: number | null
          efl_cup: number | null
          eredevise: number | null
          europa_league: number | null
          fa_cup: number | null
          features: Json | null
          la_liga: number | null
          liga_portugal: number | null
          ligue_1: number | null
          logo_url: string | null
          mls: number | null
          monthly_price: string | null
          name: string | null
          premier_league: number | null
          provider_name: string | null
          saudi_pro_league: number | null
          second_bundesliga: number | null
          serie_a: number | null
          slug: string | null
          streamer_id: number
          sueper_lig: number | null
          third_bundesliga: number | null
          yearly_price: string | null
        }
        Insert: {
          affiliate_url?: string | null
          bundesliga?: number | null
          champions_league?: number | null
          club_world_cup?: number | null
          conference_league?: number | null
          copa_del_rey?: number | null
          coppa_italia?: number | null
          coupe_de_france?: number | null
          dfb_pokal?: number | null
          efl_cup?: number | null
          eredevise?: number | null
          europa_league?: number | null
          fa_cup?: number | null
          features?: Json | null
          la_liga?: number | null
          liga_portugal?: number | null
          ligue_1?: number | null
          logo_url?: string | null
          mls?: number | null
          monthly_price?: string | null
          name?: string | null
          premier_league?: number | null
          provider_name?: string | null
          saudi_pro_league?: number | null
          second_bundesliga?: number | null
          serie_a?: number | null
          slug?: string | null
          streamer_id: number
          sueper_lig?: number | null
          third_bundesliga?: number | null
          yearly_price?: string | null
        }
        Update: {
          affiliate_url?: string | null
          bundesliga?: number | null
          champions_league?: number | null
          club_world_cup?: number | null
          conference_league?: number | null
          copa_del_rey?: number | null
          coppa_italia?: number | null
          coupe_de_france?: number | null
          dfb_pokal?: number | null
          efl_cup?: number | null
          eredevise?: number | null
          europa_league?: number | null
          fa_cup?: number | null
          features?: Json | null
          la_liga?: number | null
          liga_portugal?: number | null
          ligue_1?: number | null
          logo_url?: string | null
          mls?: number | null
          monthly_price?: string | null
          name?: string | null
          premier_league?: number | null
          provider_name?: string | null
          saudi_pro_league?: number | null
          second_bundesliga?: number | null
          serie_a?: number | null
          slug?: string | null
          streamer_id?: number
          sueper_lig?: number | null
          third_bundesliga?: number | null
          yearly_price?: string | null
        }
        Relationships: []
      }
      streaming_leagues: {
        Row: {
          coverage_percentage: number
          id: number
          league_id: number | null
          streamer_id: number | null
        }
        Insert: {
          coverage_percentage?: number
          id?: number
          league_id?: number | null
          streamer_id?: number | null
        }
        Update: {
          coverage_percentage?: number
          id?: number
          league_id?: number | null
          streamer_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "streaming_leagues_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["league_id"]
          },
          {
            foreignKeyName: "streaming_leagues_streamer_id_fkey"
            columns: ["streamer_id"]
            isOneToOne: false
            referencedRelation: "streaming"
            referencedColumns: ["streamer_id"]
          },
        ]
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
