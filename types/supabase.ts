export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      brands: {
        Row: {
          id: string
          created_at: string | null
          user_id: string
          company_name: string | null
          website: string | null
          industry: string | null
          contact_person: string | null
          phone_number: string | null
          logo_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          user_id: string
          company_name?: string | null
          website?: string | null
          industry?: string | null
          contact_person?: string | null
          phone_number?: string | null
          logo_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string | null
          user_id?: string
          company_name?: string | null
          website?: string | null
          industry?: string | null
          contact_person?: string | null
          phone_number?: string | null
          logo_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brands_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      influencers: {
        Row: {
          id: string
          created_at: string | null
          user_id: string
          full_name: string | null
          instagram_handle: string | null
          youtube_handle: string | null
          bio: string | null
          phone_number: string | null
          avatar_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          user_id: string
          full_name?: string | null
          instagram_handle?: string | null
          youtube_handle?: string | null
          bio?: string | null
          phone_number?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string | null
          user_id?: string
          full_name?: string | null
          instagram_handle?: string | null
          youtube_handle?: string | null
          bio?: string | null
          phone_number?: string | null
          avatar_url?: string | null
        }
        Relationships: [
           {
            foreignKeyName: "influencers_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
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
