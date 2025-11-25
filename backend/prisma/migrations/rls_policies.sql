-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR SUPABASE
-- ============================================================================
-- This file enables RLS on all public tables and creates appropriate policies
-- for secure multi-tenant data isolation

-- ============================================================================
-- 1. USERS TABLE
-- ============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can only view their own record
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT
  USING (auth.uid()::text = id);

-- Users can only update their own record
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

-- Service role (backend) can insert users
CREATE POLICY "users_insert_backend" ON public.users
  FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- 2. REFRESH_TOKENS TABLE
-- ============================================================================
ALTER TABLE public.refresh_tokens ENABLE ROW LEVEL SECURITY;

-- Users can only view their own tokens
CREATE POLICY "refresh_tokens_select_own" ON public.refresh_tokens
  FOR SELECT
  USING (auth.uid()::text = "userId");

-- Users can delete their own tokens
CREATE POLICY "refresh_tokens_delete_own" ON public.refresh_tokens
  FOR DELETE
  USING (auth.uid()::text = "userId");

-- Backend can manage all tokens
CREATE POLICY "refresh_tokens_backend_manage" ON public.refresh_tokens
  FOR ALL
  USING (true);

-- ============================================================================
-- 3. SESSIONS TABLE
-- ============================================================================
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Users can only view their own sessions
CREATE POLICY "sessions_select_own" ON public.sessions
  FOR SELECT
  USING (auth.uid()::text = "userId");

-- Users can only insert sessions for themselves
CREATE POLICY "sessions_insert_own" ON public.sessions
  FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

-- Users can only update their own sessions
CREATE POLICY "sessions_update_own" ON public.sessions
  FOR UPDATE
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

-- Users can only delete their own sessions
CREATE POLICY "sessions_delete_own" ON public.sessions
  FOR DELETE
  USING (auth.uid()::text = "userId");

-- ============================================================================
-- 4. HANDS TABLE
-- ============================================================================
ALTER TABLE public.hands ENABLE ROW LEVEL SECURITY;

-- Users can only view their own hands
CREATE POLICY "hands_select_own" ON public.hands
  FOR SELECT
  USING (auth.uid()::text = "userId");

-- Users can only insert hands for themselves
CREATE POLICY "hands_insert_own" ON public.hands
  FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

-- Users can only update their own hands
CREATE POLICY "hands_update_own" ON public.hands
  FOR UPDATE
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

-- Users can only delete their own hands
CREATE POLICY "hands_delete_own" ON public.hands
  FOR DELETE
  USING (auth.uid()::text = "userId");

-- ============================================================================
-- 5. COACH_PROFILES TABLE
-- ============================================================================
ALTER TABLE public.coach_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view approved coach profiles (for marketplace)
-- Everyone can view public coach profiles
CREATE POLICY "coach_profiles_select_approved" ON public.coach_profiles
  FOR SELECT
  USING (status::text = 'APPROVED' OR auth.uid()::text = "userId");

-- Users can only insert/update their own profile
CREATE POLICY "coach_profiles_insert_own" ON public.coach_profiles
  FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "coach_profiles_update_own" ON public.coach_profiles
  FOR UPDATE
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

-- ============================================================================
-- 6. BOOKINGS TABLE
-- ============================================================================
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Users can view their own bookings (as student or coach)
CREATE POLICY "bookings_select_own" ON public.bookings
  FOR SELECT
  USING (
    auth.uid()::text = "studentId" OR
    auth.uid()::text = (SELECT "userId" FROM public.coach_profiles WHERE id = "coachId")
  );

-- Students can insert bookings
CREATE POLICY "bookings_insert_student" ON public.bookings
  FOR INSERT
  WITH CHECK (auth.uid()::text = "studentId");

-- Students and coaches can update their bookings
CREATE POLICY "bookings_update_own" ON public.bookings
  FOR UPDATE
  USING (
    auth.uid()::text = "studentId" OR
    auth.uid()::text = (SELECT "userId" FROM public.coach_profiles WHERE id = "coachId")
  )
  WITH CHECK (
    auth.uid()::text = "studentId" OR
    auth.uid()::text = (SELECT "userId" FROM public.coach_profiles WHERE id = "coachId")
  );

-- ============================================================================
-- 7. REVIEWS TABLE
-- ============================================================================
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view public reviews
-- Users can view their own reviews (if private)
CREATE POLICY "reviews_select_public" ON public.reviews
  FOR SELECT
  USING (
    "isPublic" = true OR
    auth.uid()::text = (SELECT "studentId" FROM public.bookings WHERE id = "bookingId") OR
    auth.uid()::text = "coachId"
  );

-- Only booking owner can insert review
CREATE POLICY "reviews_insert_own_booking" ON public.reviews
  FOR INSERT
  WITH CHECK (
    auth.uid()::text = (SELECT "studentId" FROM public.bookings WHERE id = "bookingId")
  );

-- Only review creator can update
CREATE POLICY "reviews_update_own" ON public.reviews
  FOR UPDATE
  USING (
    auth.uid()::text = (SELECT "studentId" FROM public.bookings WHERE id = "bookingId")
  )
  WITH CHECK (
    auth.uid()::text = (SELECT "studentId" FROM public.bookings WHERE id = "bookingId")
  );

-- ============================================================================
-- 8. GTO_RANGES TABLE
-- ============================================================================
ALTER TABLE public.gto_ranges ENABLE ROW LEVEL SECURITY;

-- Everyone can view GTO ranges (public reference data)
CREATE POLICY "gto_ranges_select_all" ON public.gto_ranges
  FOR SELECT
  USING (true);

-- Backend/admin can manage
CREATE POLICY "gto_ranges_backend_manage" ON public.gto_ranges
  FOR ALL
  USING (true);

-- ============================================================================
-- 9. HAND_HISTORY_SESSIONS TABLE
-- ============================================================================
ALTER TABLE public.hand_history_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only view their own sessions
CREATE POLICY "hand_history_sessions_select_own" ON public.hand_history_sessions
  FOR SELECT
  USING (auth.uid()::text = "userId");

-- Users can only insert sessions for themselves
CREATE POLICY "hand_history_sessions_insert_own" ON public.hand_history_sessions
  FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

-- Users can only update their own sessions
CREATE POLICY "hand_history_sessions_update_own" ON public.hand_history_sessions
  FOR UPDATE
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

-- Users can only delete their own sessions
CREATE POLICY "hand_history_sessions_delete_own" ON public.hand_history_sessions
  FOR DELETE
  USING (auth.uid()::text = "userId");

-- ============================================================================
-- 10. HAND_HISTORY_HANDS TABLE
-- ============================================================================
ALTER TABLE public.hand_history_hands ENABLE ROW LEVEL SECURITY;

-- Users can only view hands from their own sessions
CREATE POLICY "hand_history_hands_select_own" ON public.hand_history_hands
  FOR SELECT
  USING (
    "sessionId" IN (
      SELECT id FROM public.hand_history_sessions
      WHERE "userId" = auth.uid()::text
    )
  );

-- Users can only insert hands to their own sessions
CREATE POLICY "hand_history_hands_insert_own" ON public.hand_history_hands
  FOR INSERT
  WITH CHECK (
    "sessionId" IN (
      SELECT id FROM public.hand_history_sessions
      WHERE "userId" = auth.uid()::text
    )
  );

-- Users can only update hands in their own sessions
CREATE POLICY "hand_history_hands_update_own" ON public.hand_history_hands
  FOR UPDATE
  USING (
    "sessionId" IN (
      SELECT id FROM public.hand_history_sessions
      WHERE "userId" = auth.uid()::text
    )
  )
  WITH CHECK (
    "sessionId" IN (
      SELECT id FROM public.hand_history_sessions
      WHERE "userId" = auth.uid()::text
    )
  );

-- ============================================================================
-- 11. ANONYMIZED_HANDS TABLE
-- ============================================================================
ALTER TABLE public.anonymized_hands ENABLE ROW LEVEL SECURITY;

-- Everyone can view anonymized hands (training data)
CREATE POLICY "anonymized_hands_select_all" ON public.anonymized_hands
  FOR SELECT
  USING (true);

-- Backend/admin can manage
CREATE POLICY "anonymized_hands_backend_manage" ON public.anonymized_hands
  FOR ALL
  USING (true);

-- ============================================================================
-- 12. ANONYMIZATION_JOBS TABLE
-- ============================================================================
ALTER TABLE public.anonymization_jobs ENABLE ROW LEVEL SECURITY;

-- Users can view their own jobs
CREATE POLICY "anonymization_jobs_select_own" ON public.anonymization_jobs
  FOR SELECT
  USING (auth.uid()::text = "userId");

-- Backend can manage all jobs
CREATE POLICY "anonymization_jobs_backend_manage" ON public.anonymization_jobs
  FOR ALL
  USING (true);

-- ============================================================================
-- 13. _PRISMA_MIGRATIONS TABLE (System Table)
-- ============================================================================
-- This table is managed by Prisma and should only be accessible by backend
ALTER TABLE public._prisma_migrations ENABLE ROW LEVEL SECURITY;

-- Only backend can access migrations table
CREATE POLICY "_prisma_migrations_backend_only" ON public._prisma_migrations
  FOR ALL
  USING (true);
