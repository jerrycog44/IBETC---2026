-- Migration: Voting, Competition Settings and Finalists Schema Extension
-- Date: 2026-09-25

-- ============================================================================
-- 1. ADD NEW COLUMNS TO SUBMISSIONS TABLE
-- ============================================================================

ALTER TABLE public.submissions
ADD COLUMN IF NOT EXISTS vote_count INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_finalist BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS finalist_rank INT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Populate slug for existing records if null
UPDATE public.submissions
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(full_name || '-' || school, '[^a-zA-Z0-9]+', '-', 'g'),
    '^-|-$', '', 'g'
  )
) || '-' || SUBSTRING(id::text from 1 for 6)
WHERE slug IS NULL;

CREATE INDEX IF NOT EXISTS idx_submissions_slug ON public.submissions(slug);
CREATE INDEX IF NOT EXISTS idx_submissions_is_finalist ON public.submissions(is_finalist) WHERE is_finalist = true;

-- ============================================================================
-- 2. CREATE VOTES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    voter_fingerprint TEXT NOT NULL,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_vote_per_debater UNIQUE (submission_id, voter_fingerprint)
);

CREATE INDEX IF NOT EXISTS idx_votes_submission_id ON public.votes(submission_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter_fingerprint ON public.votes(voter_fingerprint);
CREATE INDEX IF NOT EXISTS idx_votes_ip_created ON public.votes(ip_address, created_at);

-- ============================================================================
-- 3. SYSTEM SETTINGS SEED FOR VOTING & COMPETITION
-- ============================================================================

INSERT INTO public.system_settings (key, value)
VALUES ('voting_open', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.system_settings (key, value)
VALUES ('competition_config', '{"title": "BATTLE OF WITS & WORDS", "subtitle": "Oyo Debaters", "year": "2026", "voting_open": true}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- 4. RPC FUNCTIONS FOR VOTING & FINALISTS
-- ============================================================================

-- Function to check if voting is currently open
CREATE OR REPLACE FUNCTION public.is_voting_open()
RETURNS BOOLEAN AS $$
DECLARE
    v_open BOOLEAN;
BEGIN
    SELECT (value->>0)::boolean INTO v_open 
    FROM public.system_settings 
    WHERE key = 'voting_open';
    
    RETURN COALESCE(v_open, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to toggle voting lock
CREATE OR REPLACE FUNCTION public.toggle_voting_lock(p_open BOOLEAN)
RETURNS BOOLEAN AS $$
BEGIN
    IF NOT public.is_admin_or_super(auth.uid()) THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required to toggle voting lock.';
    END IF;

    INSERT INTO public.system_settings (key, value)
    VALUES ('voting_open', to_jsonb(p_open))
    ON CONFLICT (key) DO UPDATE SET value = to_jsonb(p_open);

    RETURN p_open;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to cast a vote securely with rate limiting & duplicate prevention
CREATE OR REPLACE FUNCTION public.cast_vote(
    p_submission_id UUID,
    p_voter_fingerprint TEXT,
    p_ip_address TEXT DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    vote_count INT,
    message TEXT
) AS $$
DECLARE
    v_status public.submission_status;
    v_new_count INT;
BEGIN
    -- 1. Check if voting is open
    IF NOT public.is_voting_open() THEN
        RETURN QUERY SELECT false, 0, 'Voting is currently closed for the competition.'::TEXT;
        RETURN;
    END IF;

    -- 2. Verify submission exists and is approved
    SELECT status INTO v_status FROM public.submissions WHERE id = p_submission_id;
    IF v_status IS NULL OR v_status != 'approved' THEN
        RETURN QUERY SELECT false, 0, 'This entry is not eligible for public voting.'::TEXT;
        RETURN;
    END IF;

    -- 3. Check for existing vote with same fingerprint on this submission
    IF EXISTS (
        SELECT 1 FROM public.votes 
        WHERE submission_id = p_submission_id AND voter_fingerprint = p_voter_fingerprint
    ) THEN
        SELECT s.vote_count INTO v_new_count FROM public.submissions s WHERE s.id = p_submission_id;
        RETURN QUERY SELECT false, COALESCE(v_new_count, 0), 'You have already voted for this debater!'::TEXT;
        RETURN;
    END IF;

    -- 4. Anti-bot network protection: Max 20 votes per IP in 1 hour across all entries
    IF p_ip_address IS NOT NULL AND (
        SELECT COUNT(*) FROM public.votes 
        WHERE ip_address = p_ip_address AND created_at > (NOW() - INTERVAL '1 hour')
    ) >= 20 THEN
        SELECT s.vote_count INTO v_new_count FROM public.submissions s WHERE s.id = p_submission_id;
        RETURN QUERY SELECT false, COALESCE(v_new_count, 0), 'High voting activity detected from your network. Please try again later.'::TEXT;
        RETURN;
    END IF;

    -- 5. Insert vote record
    INSERT INTO public.votes (submission_id, voter_fingerprint, ip_address)
    VALUES (p_submission_id, p_voter_fingerprint, p_ip_address);

    -- 6. Increment submission vote count
    UPDATE public.submissions 
    SET vote_count = vote_count + 1 
    WHERE id = p_submission_id
    RETURNING public.submissions.vote_count INTO v_new_count;

    RETURN QUERY SELECT true, v_new_count, 'Your vote has been recorded successfully!'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to toggle finalist status for an approved competitor
CREATE OR REPLACE FUNCTION public.toggle_finalist(
    p_submission_id UUID,
    p_is_finalist BOOLEAN,
    p_rank INT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    IF NOT public.is_admin_or_super(auth.uid()) THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required to manage finalists.';
    END IF;

    UPDATE public.submissions
    SET is_finalist = p_is_finalist,
        finalist_rank = CASE WHEN p_is_finalist THEN p_rank ELSE NULL END
    WHERE id = p_submission_id;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Updated admin stats RPC to include votes and finalists
CREATE OR REPLACE FUNCTION public.get_admin_submission_stats()
RETURNS TABLE (
    total_count BIGINT,
    pending_count BIGINT,
    approved_count BIGINT,
    rejected_count BIGINT,
    hidden_count BIGINT,
    total_votes BIGINT,
    finalists_count BIGINT
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
        COUNT(*) FILTER (WHERE status = 'hidden')::BIGINT AS hidden_count,
        COALESCE(SUM(vote_count), 0)::BIGINT AS total_votes,
        COUNT(*) FILTER (WHERE is_finalist = true)::BIGINT AS finalists_count
    FROM public.submissions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to get single public entry by slug or id
CREATE OR REPLACE FUNCTION public.get_public_entry_by_slug_or_id(p_identifier TEXT)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    school TEXT,
    debate_topic TEXT,
    video_path TEXT,
    vote_count INT,
    is_finalist BOOLEAN,
    finalist_rank INT,
    slug TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.full_name,
        s.school,
        s.debate_topic,
        s.video_path,
        s.vote_count,
        s.is_finalist,
        s.finalist_rank,
        s.slug,
        s.created_at
    FROM public.submissions s
    WHERE s.status = 'approved'
      AND (s.slug = p_identifier OR s.id::text = p_identifier);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant EXECUTE permissions
GRANT EXECUTE ON FUNCTION public.is_voting_open() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_voting_lock(BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cast_vote(UUID, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_finalist(UUID, BOOLEAN, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_entry_by_slug_or_id(TEXT) TO anon, authenticated;

-- ============================================================================
-- 5. RECREATE PUBLIC APPROVED SUBMISSIONS VIEW
-- ============================================================================

CREATE OR REPLACE VIEW public.public_approved_submissions AS
SELECT 
    id,
    full_name,
    school,
    debate_topic,
    video_path,
    vote_count,
    is_finalist,
    finalist_rank,
    slug,
    created_at
FROM public.submissions
WHERE status = 'approved';

GRANT SELECT ON public.public_approved_submissions TO anon, authenticated;

-- ============================================================================
-- 6. ROW LEVEL SECURITY ON VOTES TABLE
-- ============================================================================

ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view all votes"
    ON public.votes FOR SELECT
    TO authenticated
    USING (public.is_staff(auth.uid()));
