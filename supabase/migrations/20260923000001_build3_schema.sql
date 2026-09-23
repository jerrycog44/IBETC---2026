-- Migration: Build 3 Competition Operations Schema Extension
-- Date: 2026-09-23

-- ============================================================================
-- 1. SYSTEM SETTINGS TABLE (For Judging Lock & Global Config)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS on system_settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read system settings"
    ON public.system_settings FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Super admins manage system settings"
    ON public.system_settings FOR ALL
    TO authenticated
    USING (public.is_super_admin(auth.uid()))
    WITH CHECK (public.is_super_admin(auth.uid()));

-- Insert initial judging_open setting
INSERT INTO public.system_settings (key, value)
VALUES ('judging_open', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Trigger for system_settings updated_at
DROP TRIGGER IF EXISTS set_system_settings_updated_at ON public.system_settings;
CREATE TRIGGER set_system_settings_updated_at
    BEFORE UPDATE ON public.system_settings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 2. JUDGING LOCK HELPER FUNCTIONS & RPC
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_judging_open()
RETURNS BOOLEAN AS $$
DECLARE
    v_open BOOLEAN;
BEGIN
    SELECT (value->>0)::boolean INTO v_open 
    FROM public.system_settings 
    WHERE key = 'judging_open';
    
    -- Default to true if setting is missing
    RETURN COALESCE(v_open, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.toggle_judging_lock(p_open BOOLEAN)
RETURNS BOOLEAN AS $$
BEGIN
    IF NOT public.is_super_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Access denied: Super Admin privileges required to toggle judging lock.';
    END IF;

    INSERT INTO public.system_settings (key, value)
    VALUES ('judging_open', to_jsonb(p_open))
    ON CONFLICT (key) DO UPDATE SET value = to_jsonb(p_open);

    RETURN p_open;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 3. STAFF USER MANAGEMENT RPC
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_staff_user(
    p_user_id UUID,
    p_full_name TEXT,
    p_email TEXT,
    p_role public.staff_role
)
RETURNS BOOLEAN AS $$
BEGIN
    IF NOT public.is_super_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Access denied: Super Admin privileges required.';
    END IF;

    INSERT INTO public.staff_users (id, full_name, email, role)
    VALUES (p_user_id, p_full_name, LOWER(p_email), p_role)
    ON CONFLICT (id) DO UPDATE 
    SET full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        email = EXCLUDED.email;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant EXECUTE permissions
GRANT EXECUTE ON FUNCTION public.is_judging_open() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_judging_lock(BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_staff_user(UUID, TEXT, TEXT, public.staff_role) TO authenticated;

-- ============================================================================
-- 4. UPDATE SCORES RLS POLICIES FOR JUDGING LOCK ENFORCEMENT
-- ============================================================================

DROP POLICY IF EXISTS "Judges can create own scores" ON public.scores;
CREATE POLICY "Judges can create own scores"
    ON public.scores FOR INSERT
    TO authenticated
    WITH CHECK (
        judge_id = auth.uid() 
        AND public.is_staff(auth.uid())
        AND public.is_judging_open()
    );

DROP POLICY IF EXISTS "Judges can update own scores" ON public.scores;
CREATE POLICY "Judges can update own scores"
    ON public.scores FOR UPDATE
    TO authenticated
    USING (
        judge_id = auth.uid()
        AND public.is_judging_open()
    )
    WITH CHECK (
        judge_id = auth.uid()
        AND public.is_judging_open()
    );

