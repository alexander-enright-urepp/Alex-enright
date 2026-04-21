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
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          content: string
          created_at: string
          id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      daily_posts: {
        Row: {
          body: string
          created_at: string
          id: string
          image_url: string | null
          title: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          image_url?: string | null
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          image_url?: string | null
          title?: string
        }
        Relationships: []
      }
      job_listings: {
        Row: {
          approved: boolean
          apply_url: string | null
          company: string
          created_at: string
          description: string
          id: string
          location: string
          salary_range: string | null
          title: string
        }
        Insert: {
          approved?: boolean
          apply_url?: string | null
          company: string
          created_at?: string
          description: string
          id?: string
          location: string
          salary_range?: string | null
          title: string
        }
        Update: {
          approved?: boolean
          apply_url?: string | null
          company?: string
          created_at?: string
          description?: string
          id?: string
          location?: string
          salary_range?: string | null
          title?: string
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          anon_id: string
          created_at: string
          id: string
          post_id: string
        }
        Insert: {
          anon_id: string
          created_at?: string
          id?: string
          post_id: string
        }
        Update: {
          anon_id?: string
          created_at?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "daily_posts"
            referencedColumns: ["id"]
          }
        ]
      }
      recruiter_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          job_type: string | null
          linkedin_url: string | null
          location: string | null
          name: string
          note: string | null
          phone: string | null
          remote_pref: string | null
          resume_url: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          job_type?: string | null
          linkedin_url?: string | null
          location?: string | null
          name: string
          note?: string | null
          phone?: string | null
          remote_pref?: string | null
          resume_url?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          job_type?: string | null
          linkedin_url?: string | null
          location?: string | null
          name?: string
          note?: string | null
          phone?: string | null
          remote_pref?: string | null
          resume_url?: string | null
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never
