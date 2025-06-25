export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clubs: {
        Row: {
          bundesliga: boolean | null
          champions_league: boolean | null
          club_world_cup: boolean | null
          conference_league: boolean | null
          copa_del_rey: boolean | null
          country: string | null
          dfb_pokal: boolean | null
          europa_league: boolean | null
          fa_cup: boolean | null
          facebook_url: string | null
          fanshop_url: string | null
          founded_year: number | null
          id: number
          instagram_url: string | null
          la_liga: boolean | null
          logo_url: string | null
          members_count: number | null
          name: string | null
          popularity_score: number | null
          premier_league: boolean | null
          primary_color: string | null
          second_bundesliga: boolean | null
          secondary_color: string | null
          slug: string | null
          stadium_capacity: number | null
          stadium_location: string | null
          stadium_name: string | null
          twitter_url: string | null
          website_url: string | null
        }
        Insert: {
          bundesliga?: boolean | null
          champions_league?: boolean | null
          club_world_cup?: boolean | null
          conference_league?: boolean | null
          copa_del_rey?: boolean | null
          country?: string | null
          dfb_pokal?: boolean | null
          europa_league?: boolean | null
          fa_cup?: boolean | null
          facebook_url?: string | null
          fanshop_url?: string | null
          founded_year?: number | null
          id: number
          instagram_url?: string | null
          la_liga?: boolean | null
          logo_url?: string | null
          members_count?: number | null
          name?: string | null
          popularity_score?: number | null
          premier_league?: boolean | null
          primary_color?: string | null
          second_bundesliga?: boolean | null
          secondary_color?: string | null
          slug?: string | null
          stadium_capacity?: number | null
          stadium_location?: string | null
          stadium_name?: string | null
          twitter_url?: string | null
          website_url?: string | null
        }
        Update: {
          bundesliga?: boolean | null
          champions_league?: boolean | null
          club_world_cup?: boolean | null
          conference_league?: boolean | null
          copa_del_rey?: boolean | null
          country?: string | null
          dfb_pokal?: boolean | null
          europa_league?: boolean | null
          fa_cup?: boolean | null
          facebook_url?: string | null
          fanshop_url?: string | null
          founded_year?: number | null
          id?: number
          instagram_url?: string | null
          la_liga?: boolean | null
          logo_url?: string | null
          members_count?: number | null
          name?: string | null
          popularity_score?: number | null
          premier_league?: boolean | null
          primary_color?: string | null
          second_bundesliga?: boolean | null
          secondary_color?: string | null
          slug?: string | null
          stadium_capacity?: number | null
          stadium_location?: string | null
          stadium_name?: string | null
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
