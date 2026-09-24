export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'hidden';
export type StaffRole = 'super_admin' | 'admin' | 'judge';

export type Database = {
  public: {
    Tables: {
      system_settings: {
        Row: {
          key: string
          value: Json
          updated_at: string
        }
        Insert: {
          key: string
          value: Json
          updated_at?: string
        }
        Update: {
          key?: string
          value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      staff_users: {
        Row: {
          id: string
          full_name: string
          email: string
          role: StaffRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          role?: StaffRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          role?: StaffRole
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          id: string
          full_name: string
          school: string
          phone: string
          email: string
          debate_topic: string
          video_path: string
          status: SubmissionStatus
          owner_user_id: string | null
          participant_key: string
          vote_count: number
          is_finalist: boolean
          finalist_rank: number | null
          slug: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          school: string
          phone: string
          email: string
          debate_topic: string
          video_path: string
          status?: SubmissionStatus
          owner_user_id?: string | null
          participant_key: string
          vote_count?: number
          is_finalist?: boolean
          finalist_rank?: number | null
          slug?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          school?: string
          phone?: string
          email?: string
          debate_topic?: string
          video_path?: string
          status?: SubmissionStatus
          owner_user_id?: string | null
          participant_key?: string
          vote_count?: number
          is_finalist?: boolean
          finalist_rank?: number | null
          slug?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      votes: {
        Row: {
          id: string
          submission_id: string
          voter_fingerprint: string
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          submission_id: string
          voter_fingerprint: string
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          submission_id?: string
          voter_fingerprint?: string
          ip_address?: string | null
          created_at?: string
        }
        Relationships: []
      }
      judging_criteria: {
        Row: {
          id: string
          name: string
          description: string | null
          max_score: number
          weight: number
          is_active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          max_score: number
          weight?: number
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          max_score?: number
          weight?: number
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      scores: {
        Row: {
          id: string
          submission_id: string
          judge_id: string
          criterion_id: string
          score: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          submission_id: string
          judge_id: string
          criterion_id: string
          score: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          submission_id?: string
          judge_id?: string
          criterion_id?: string
          score?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_approved_submissions: {
        Row: {
          id: string
          full_name: string
          school: string
          debate_topic: string
          video_path: string
          vote_count: number
          is_finalist: boolean
          finalist_rank: number | null
          slug: string | null
          created_at: string
        }
        Relationships: []
      }
    }
    Functions: {
      get_staff_role: {
        Args: { p_user_id?: string }
        Returns: StaffRole | null
      }
      is_staff: {
        Args: { p_user_id?: string }
        Returns: boolean
      }
      is_admin_or_super: {
        Args: { p_user_id?: string }
        Returns: boolean
      }
      is_super_admin: {
        Args: { p_user_id?: string }
        Returns: boolean
      }
      is_judging_open: {
        Args: Record<string, never>
        Returns: boolean
      }
      is_voting_open: {
        Args: Record<string, never>
        Returns: boolean
      }
      toggle_judging_lock: {
        Args: { p_open: boolean }
        Returns: boolean
      }
      toggle_voting_lock: {
        Args: { p_open: boolean }
        Returns: boolean
      }
      toggle_finalist: {
        Args: { p_submission_id: string; p_is_finalist: boolean; p_rank?: number | null }
        Returns: boolean
      }
      cast_vote: {
        Args: { p_submission_id: string; p_voter_fingerprint: string; p_ip_address?: string | null }
        Returns: {
          success: boolean
          vote_count: number
          message: string
        }[]
      }
      create_staff_user: {
        Args: { p_user_id: string; p_full_name: string; p_email: string; p_role: StaffRole }
        Returns: boolean
      }
      get_admin_submission_stats: {
        Args: Record<string, never>
        Returns: {
          total_count: number
          pending_count: number
          approved_count: number
          rejected_count: number
          hidden_count: number
          total_votes: number
          finalists_count: number
        }[]
      }
      get_submission_by_participant_key: {
        Args: { p_submission_id: string; p_participant_key: string }
        Returns: {
          id: string
          full_name: string
          school: string
          phone: string
          email: string
          debate_topic: string
          video_path: string
          status: SubmissionStatus
          owner_user_id: string | null
          created_at: string
          updated_at: string
        }[]
      }
      get_public_entry_by_slug_or_id: {
        Args: { p_identifier: string }
        Returns: {
          id: string
          full_name: string
          school: string
          debate_topic: string
          video_path: string
          vote_count: number
          is_finalist: boolean
          finalist_rank: number | null
          slug: string | null
          created_at: string
        }[]
      }
      associate_submission_with_account: {
        Args: { p_submission_id: string; p_participant_key: string }
        Returns: boolean
      }
    }
    Enums: {
      submission_status: SubmissionStatus
      staff_role: StaffRole
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
