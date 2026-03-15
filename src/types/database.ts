export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string | null
          username: string | null
          bio: string | null
          website: string | null
          instagram: string | null
          location: string | null
          avatar_url: string | null
          is_featured: boolean
          submission_count: number
        }
        Insert: {
          id: string
          full_name?: string | null
          username?: string | null
          bio?: string | null
          website?: string | null
          instagram?: string | null
          location?: string | null
          avatar_url?: string | null
        }
        Update: {
          full_name?: string | null
          username?: string | null
          bio?: string | null
          website?: string | null
          instagram?: string | null
          location?: string | null
          avatar_url?: string | null
        }
      }
      submissions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          photographer_id: string
          title: string
          description: string | null
          location_name: string
          location_country: string
          location_lat: number | null
          location_lng: number | null
          category: SubmissionCategory
          status: SubmissionStatus
          is_magazine_featured: boolean
          magazine_issue: string | null
          view_count: number
          images: string[]
          cover_image: string | null
        }
        Insert: {
          photographer_id: string
          title: string
          description?: string | null
          location_name: string
          location_country: string
          location_lat?: number | null
          location_lng?: number | null
          category: SubmissionCategory
          images: string[]
          cover_image?: string | null
        }
        Update: {
          title?: string
          description?: string | null
          location_name?: string
          location_country?: string
          status?: SubmissionStatus
          is_magazine_featured?: boolean
          magazine_issue?: string | null
        }
      }
      places: {
        Row: {
          id: string
          created_at: string
          name: string
          country: string
          region: string | null
          lat: number
          lng: number
          session_count: number
          cover_image: string | null
          description: string | null
          is_featured: boolean
        }
        Insert: {
          name: string
          country: string
          region?: string | null
          lat: number
          lng: number
          cover_image?: string | null
          description?: string | null
        }
        Update: {
          session_count?: number
          cover_image?: string | null
          is_featured?: boolean
        }
      }
      magazine_issues: {
        Row: {
          id: string
          created_at: string
          issue_number: number
          title: string
          subtitle: string | null
          cover_image: string | null
          published_at: string | null
          is_published: boolean
          sections: Json
        }
        Insert: {
          issue_number: number
          title: string
          subtitle?: string | null
          cover_image?: string | null
          sections?: Json
        }
        Update: {
          title?: string
          is_published?: boolean
          published_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      submission_category: SubmissionCategory
      submission_status: SubmissionStatus
    }
  }
}

export type SubmissionCategory =
  | 'family_documentary'
  | 'motherhood'
  | 'fatherhood'
  | 'newborn'
  | 'love_couples'
  | 'editorial'

export type SubmissionStatus =
  | 'pending'
  | 'approved'
  | 'featured'
  | 'rejected'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Submission = Database['public']['Tables']['submissions']['Row']
export type Place = Database['public']['Tables']['places']['Row']
export type MagazineIssue = Database['public']['Tables']['magazine_issues']['Row']
