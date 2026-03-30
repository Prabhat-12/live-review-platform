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
      profiles: {
        Row: {
          id: string
          display_name: string
          avatar_url: string | null
          email: string
          created_at: string
        }
        Insert: {
          id: string
          display_name: string
          avatar_url?: string | null
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          avatar_url?: string | null
          email?: string
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          target_url: string
          owner_id: string
          status: 'active' | 'archived'
          guest_access_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          target_url: string
          owner_id: string
          status?: 'active' | 'archived'
          guest_access_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          target_url?: string
          owner_id?: string
          status?: 'active' | 'archived'
          guest_access_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      project_members: {
        Row: {
          id: string
          project_id: string
          user_id: string | null
          guest_name: string | null
          role: 'admin' | 'reviewer' | 'viewer'
          invited_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id?: string | null
          guest_name?: string | null
          role: 'admin' | 'reviewer' | 'viewer'
          invited_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string | null
          guest_name?: string | null
          role?: 'admin' | 'reviewer' | 'viewer'
          invited_at?: string
        }
      }
      feedback_items: {
        Row: {
          id: string
          project_id: string
          author_id: string
          type: 'comment' | 'annotation'
          category: 'bug' | 'ux' | 'feature_request' | 'general' | 'question'
          content: string
          page_url: string
          pin_position: {
            x: number
            y: number
            selector: string
            viewportW: number
            viewportH: number
          } | null
          annotation_data: Json | null
          screenshot_url: string | null
          context_metadata: {
            browser: string
            os: string
            viewport: { width: number; height: number }
            deviceType: 'desktop' | 'tablet' | 'mobile'
            consoleErrors: string[]
            timestamp: string
          }
          status: 'open' | 'resolved'
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          author_id: string
          type: 'comment' | 'annotation'
          category: 'bug' | 'ux' | 'feature_request' | 'general' | 'question'
          content: string
          page_url: string
          pin_position?: Json | null
          annotation_data?: Json | null
          screenshot_url?: string | null
          context_metadata?: Json
          status?: 'open' | 'resolved'
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          author_id?: string
          type?: 'comment' | 'annotation'
          category?: 'bug' | 'ux' | 'feature_request' | 'general' | 'question'
          content?: string
          page_url?: string
          pin_position?: Json | null
          annotation_data?: Json | null
          screenshot_url?: string | null
          context_metadata?: Json
          status?: 'open' | 'resolved'
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          feedback_item_id: string
          author_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          feedback_item_id: string
          author_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          feedback_item_id?: string
          author_id?: string
          content?: string
          created_at?: string
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
      [_ in never]: never
    }
  }
}

// Convenience type aliases
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectMember = Database['public']['Tables']['project_members']['Row']
export type FeedbackItem = Database['public']['Tables']['feedback_items']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']

export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type FeedbackItemInsert = Database['public']['Tables']['feedback_items']['Insert']
export type CommentInsert = Database['public']['Tables']['comments']['Insert']

export type FeedbackCategory = FeedbackItem['category']
export type FeedbackStatus = FeedbackItem['status']
export type ProjectRole = ProjectMember['role']
export type ProjectStatus = Project['status']

// Extended types with joined data
export type ProjectWithStats = Project & {
  feedback_count: number
  open_feedback_count: number
  member_count: number
  last_activity: string | null
}

export type FeedbackItemWithAuthor = FeedbackItem & {
  author: ProjectMember & { profile: Profile | null }
  comments: (Comment & { author: ProjectMember & { profile: Profile | null } })[]
}
