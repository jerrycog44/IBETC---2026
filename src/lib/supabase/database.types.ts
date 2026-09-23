export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'hidden';
export type StaffRole = 'super_admin' | 'admin' | 'judge';

export interface Database {
  public: {
    Tables: {
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
          created_at?: string
          updated_at?: string
        }
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
          created_at: string
        }
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
      associate_submission_with_account: {
        Args: { p_submission_id: string; p_participant_key: string }
        Returns: boolean
      }
    }
    Enums: {
      submission_status: SubmissionStatus
      staff_role: StaffRole
    }
  }
}
