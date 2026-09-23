-- Migration: Initial Schema for IBETC 2026 Platform (Build 1 & 2 Core System)
-- Date: 2026-09-23

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. ENUMS
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE public.submission_status AS ENUM ('pending', 'approved', 'rejected', 'hidden');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.staff_role AS ENUM ('super_admin', 'admin', 'judge');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 2. CORE TABLES
-- ============================================================================

-- Staff Users Table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.staff_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role public.staff_role NOT NULL DEFAULT 'judge',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Submissions Table
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    school TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    debate_topic TEXT NOT NULL,
    video_path TEXT NOT NULL,
    status public.submission_status NOT NULL DEFAULT 'pending',
    owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    participant_key TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Judging Criteria Table
CREATE TABLE IF NOT EXISTS public.judging_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    max_score NUMERIC(5,2) NOT NULL CHECK (max_score > 0),
    weight NUMERIC(5,2) NOT NULL DEFAULT 1.0 CHECK (weight >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Scores Table
CREATE TABLE IF NOT EXISTS public.scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    judge_id UUID NOT NULL REFERENCES public.staff_users(id) ON DELETE CASCADE,
    criterion_id UUID NOT NULL REFERENCES public.judging_criteria(id) ON DELETE CASCADE,
    score NUMERIC(5,2) NOT NULL CHECK (score >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_score_per_judge_criterion UNIQUE (submission_id, judge_id, criterion_id)
);

-- ============================================================================
-- 3. INDEXES & CONSTRAINTS
-- ============================================================================

-- Ensure one active submission per participant (combination of full_name, email, phone excluding rejected submissions)
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_participant_submission 
    ON public.submissions (LOWER(full_name), LOWER(email), LOWER(phone)) 
    WHERE status != 'rejected';

CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_owner_user_id ON public.submissions(owner_user_id) WHERE owner_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_submissions_participant_key ON public.submissions(participant_key);

CREATE INDEX IF NOT EXISTS idx_scores_submission_id ON public.scores(submission_id);
CREATE INDEX IF NOT EXISTS idx_scores_judge_id ON public.scores(judge_id);
CREATE INDEX IF NOT EXISTS idx_staff_users_role ON public.staff_users(role);

-- Automatic updated_at trigger helper
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS set_staff_users_updated_at ON public.staff_users;
CREATE TRIGGER set_staff_users_updated_at
    BEFORE UPDATE ON public.staff_users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_submissions_updated_at ON public.submissions;
CREATE TRIGGER set_submissions_updated_at
    BEFORE UPDATE ON public.submissions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_judging_criteria_updated_at ON public.judging_criteria;
CREATE TRIGGER set_judging_criteria_updated_at
    BEFORE UPDATE ON public.judging_criteria
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_scores_updated_at ON public.scores;
CREATE TRIGGER set_scores_updated_at
    BEFORE UPDATE ON public.scores
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 4. STAFF AUTHORIZATION & SECURE PARTICIPANT RPC FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_staff_role(p_user_id UUID DEFAULT auth.uid())
RETURNS public.staff_role AS $$
DECLARE
    v_role public.staff_role;
BEGIN
    IF p_user_id IS NULL THEN
        RETURN NULL;
    END IF;
    SELECT role INTO v_role FROM public.staff_users WHERE id = p_user_id;
    RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_staff(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.get_staff_role(p_user_id) IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_admin_or_super(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
DECLARE
    v_role public.staff_role;
BEGIN
    v_role := public.get_staff_role(p_user_id);
    RETURN v_role IN ('admin', 'super_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_super_admin(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.get_staff_role(p_user_id) = 'super_admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Admin Submissions Metrics RPC
CREATE OR REPLACE FUNCTION public.get_admin_submission_stats()
RETURNS TABLE (
    total_count BIGINT,
    pending_count BIGINT,
    approved_count BIGINT,
    rejected_count BIGINT,
    hidden_count BIGINT
) AS $$
BEGIN
    IF NOT public.is_staff(auth.uid()) THEN
        RAISE EXCEPTION 'Access denied: Staff authorization required';
    END IF;

    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT AS total_count,
        COUNT(*) FILTER (WHERE status = 'pending')::BIGINT AS pending_count,
        COUNT(*) FILTER (WHERE status = 'approved')::BIGINT AS approved_count,
        COUNT(*) FILTER (WHERE status = 'rejected')::BIGINT AS rejected_count,
        COUNT(*) FILTER (WHERE status = 'hidden')::BIGINT AS hidden_count
    FROM public.submissions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Secure Participant Access RPC
CREATE OR REPLACE FUNCTION public.get_submission_by_participant_key(
    p_submission_id UUID,
    p_participant_key TEXT
)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    school TEXT,
    phone TEXT,
    email TEXT,
    debate_topic TEXT,
    video_path TEXT,
    status public.submission_status,
    owner_user_id UUID,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.full_name,
        s.school,
        s.phone,
        s.email,
        s.debate_topic,
        s.video_path,
        s.status,
        s.owner_user_id,
        s.created_at,
        s.updated_at
    FROM public.submissions s
    WHERE s.id = p_submission_id 
      AND s.participant_key = p_participant_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Secure Participant Account Association RPC
CREATE OR REPLACE FUNCTION public.associate_submission_with_account(
    p_submission_id UUID,
    p_participant_key TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_updated INT;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required to link account';
    END IF;

    UPDATE public.submissions
    SET owner_user_id = auth.uid()
    WHERE id = p_submission_id
      AND participant_key = p_participant_key
      AND (owner_user_id IS NULL OR owner_user_id = auth.uid());

    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant EXECUTE permissions on RPC functions
GRANT EXECUTE ON FUNCTION public.get_admin_submission_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_submission_by_participant_key(UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.associate_submission_with_account(UUID, TEXT) TO authenticated;

-- ============================================================================
-- 5. PUBLIC SAFE VIEW (EXPOSES ONLY APPROVED SUBMISSIONS & SAFE COLUMNS)
-- ============================================================================

CREATE OR REPLACE VIEW public.public_approved_submissions AS
SELECT 
    id,
    full_name,
    school,
    debate_topic,
    video_path,
    created_at
FROM public.submissions
WHERE status = 'approved';

-- Grant access to public view
GRANT SELECT ON public.public_approved_submissions TO anon, authenticated;

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.judging_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

-- RLS: staff_users
CREATE POLICY "Staff can view staff user profiles"
    ON public.staff_users FOR SELECT
    TO authenticated
    USING (public.is_staff(auth.uid()) OR auth.uid() = id);

CREATE POLICY "Super admins manage staff users"
    ON public.staff_users FOR ALL
    TO authenticated
    USING (public.is_super_admin(auth.uid()))
    WITH CHECK (public.is_super_admin(auth.uid()));

-- RLS: submissions
CREATE POLICY "Public can view approved submissions"
    ON public.submissions FOR SELECT
    TO anon, authenticated
    USING (status = 'approved');

CREATE POLICY "Account owners can view own submission"
    ON public.submissions FOR SELECT
    TO authenticated
    USING (owner_user_id IS NOT NULL AND owner_user_id = auth.uid());

CREATE POLICY "Staff can view all submissions"
    ON public.submissions FOR SELECT
    TO authenticated
    USING (public.is_staff(auth.uid()));

CREATE POLICY "Anyone can submit debate entry"
    ON public.submissions FOR INSERT
    TO anon, authenticated
    WITH CHECK (status = 'pending');

CREATE POLICY "Admins can update submissions"
    ON public.submissions FOR UPDATE
    TO authenticated
    USING (public.is_admin_or_super(auth.uid()))
    WITH CHECK (public.is_admin_or_super(auth.uid()));

CREATE POLICY "Super admins can delete submissions"
    ON public.submissions FOR DELETE
    TO authenticated
    USING (public.is_super_admin(auth.uid()));

-- RLS: judging_criteria
CREATE POLICY "Staff can view judging criteria"
    ON public.judging_criteria FOR SELECT
    TO authenticated
    USING (public.is_staff(auth.uid()));

CREATE POLICY "Super admins manage judging criteria"
    ON public.judging_criteria FOR ALL
    TO authenticated
    USING (public.is_super_admin(auth.uid()))
    WITH CHECK (public.is_super_admin(auth.uid()));

-- RLS: scores
CREATE POLICY "Staff can view scores"
    ON public.scores FOR SELECT
    TO authenticated
    USING (public.is_staff(auth.uid()));

CREATE POLICY "Judges can create own scores"
    ON public.scores FOR INSERT
    TO authenticated
    WITH CHECK (
        judge_id = auth.uid() 
        AND public.is_staff(auth.uid())
    );

CREATE POLICY "Judges can update own scores"
    ON public.scores FOR UPDATE
    TO authenticated
    USING (judge_id = auth.uid())
    WITH CHECK (judge_id = auth.uid());

CREATE POLICY "Super admins can delete scores"
    ON public.scores FOR DELETE
    TO authenticated
    USING (public.is_super_admin(auth.uid()));

-- ============================================================================
-- 7. PRIVATE VIDEO STORAGE BUCKET CONFIGURATION (STRENGTHENED SECURITY)
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('debate-videos', 'debate-videos', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Restricted upload policy for video storage bucket:
-- Enforces bucket 'debate-videos' and target path structure 'submissions/*'
DROP POLICY IF EXISTS "Anyone can upload debate video" ON storage.objects;
CREATE POLICY "Anyone can upload debate video"
    ON storage.objects FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        bucket_id = 'debate-videos' 
        AND name LIKE 'submissions/%'
    );

-- Read policy for video storage bucket (Staff members only; public access via signed URLs generated server-side)
DROP POLICY IF EXISTS "Authorized staff access to debate videos" ON storage.objects;
CREATE POLICY "Authorized staff access to debate videos"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'debate-videos' 
        AND public.is_staff(auth.uid())
    );
