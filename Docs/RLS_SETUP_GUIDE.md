# RLS (Row Level Security) Setup Guide

## Overview

This guide explains the Row Level Security (RLS) policies implemented for the PokerMastery project on Supabase. RLS ensures that users can only access their own data, preventing unauthorized data access.

## Current Status

✅ **All required tables are present in Supabase**:
- users
- refresh_tokens
- sessions
- hands
- coach_profiles
- bookings
- reviews
- gto_ranges
- hand_history_sessions
- hand_history_hands
- anonymized_hands
- anonymization_jobs
- _prisma_migrations

## RLS Implementation Plan

### Phase 1: Apply SQL Policies

**Location**: `backend/prisma/migrations/rls_policies.sql`

#### Step 1: Connect to Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor** (left sidebar)

#### Step 2: Apply the RLS Script

**Option A: Direct SQL Execution (Recommended)**

1. Create a new query in SQL Editor
2. Copy the entire content of `rls_policies.sql`
3. Click **Run** button
4. All policies will be applied at once

**Option B: Step-by-Step Application**

If you prefer to apply policies table-by-table:
1. Create separate queries for each table section
2. Run them sequentially to verify each one succeeds
3. This helps identify any issues with specific tables

### Step 3: Verify RLS is Enabled

Run this query to verify RLS is enabled on all tables:

```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

You should see `rowsecurity = true` for all public tables.

## RLS Policy Details

### 1. **users** - User Profiles

- **SELECT**: Users can only view their own profile
- **UPDATE**: Users can only modify their own profile
- **INSERT**: Backend service role can create new users
- **DELETE**: No delete policy (users persist)

**Purpose**: Prevent users from viewing/modifying other users' information

---

### 2. **refresh_tokens** - Authentication Tokens

- **SELECT/DELETE**: Users can only manage their own tokens
- **INSERT/UPDATE**: Backend service role only

**Purpose**: Ensure tokens are private and can't be accessed by other users

---

### 3. **sessions** - Poker Sessions

- **SELECT**: Users see only their own sessions
- **INSERT**: Users can only create sessions for themselves
- **UPDATE**: Users can only edit their own sessions
- **DELETE**: Users can only delete their own sessions

**Purpose**: Prevent users from accessing other players' session data

---

### 4. **hands** - Individual Hands

- **SELECT**: Users see only hands they created
- **INSERT**: Users can only create hands for themselves
- **UPDATE/DELETE**: Same isolation as sessions

**Purpose**: Session hands are private to each user

---

### 5. **coach_profiles** - Coaching Profiles

- **SELECT**:
  - Approved coaches: Visible to everyone (marketplace)
  - Own profile: Visible to coach
  - Pending/Rejected: Only visible to the coach
- **INSERT/UPDATE**: Coaches can only manage their own profile
- **DELETE**: None

**Purpose**: Allow marketplace browsing while protecting profile privacy

---

### 6. **bookings** - Session Bookings

- **SELECT**: Student and coach can see their bookings
- **INSERT**: Students book sessions
- **UPDATE**: Both parties can update booking status
- **DELETE**: None

**Purpose**: Students/coaches only see bookings they're involved in

---

### 7. **reviews** - Booking Reviews

- **SELECT**:
  - Public reviews: Everyone can see
  - Private reviews: Only participants and coach
- **INSERT**: Only student from booking can create review
- **UPDATE**: Only review creator can modify
- **DELETE**: Not implemented

**Purpose**: Protect review privacy while allowing marketplace reviews

---

### 8. **gto_ranges** - GTO Reference Data

- **SELECT**: Public data - everyone can view
- **INSERT/UPDATE/DELETE**: Backend/admin only

**Purpose**: Reference data, no user isolation needed

---

### 9. **hand_history_sessions** - Hand History Analysis Sessions

- **SELECT**: Users see only their own sessions
- **INSERT**: Users create sessions for themselves
- **UPDATE**: Users modify their own sessions
- **DELETE**: Users delete their own sessions

**Purpose**: Hand history is private user analysis data

---

### 10. **hand_history_hands** - Parsed Hands

- **SELECT**: Users see hands from their own sessions
- **INSERT/UPDATE**: Same session ownership check
- **DELETE**: Not implemented

**Purpose**: Hands are tied to session ownership

---

### 11. **anonymized_hands** - AI Training Data

- **SELECT**: Public data - everyone can view
- **INSERT/UPDATE/DELETE**: Backend only

**Purpose**: Anonymized data for AI training, no user isolation needed

---

### 12. **anonymization_jobs** - Job Tracking

- **SELECT**: Users see their own jobs
- **INSERT/UPDATE/DELETE**: Backend manages

**Purpose**: Track user's anonymization processing status

---

### 13. **_prisma_migrations** - Migrations Table

- **All operations**: Backend service role only

**Purpose**: System table for database versioning

## Testing RLS Policies

### Test as Authenticated User

After applying RLS, test with these scenarios:

```sql
-- As authenticated user (get your auth.uid() first)
SELECT auth.uid() as user_id;

-- Query your sessions (should work)
SELECT * FROM sessions WHERE "userId" = auth.uid()::text;

-- Query another user's sessions (should return 0 rows)
SELECT * FROM sessions WHERE "userId" = 'different-user-id';
```

### Test Service Role Bypass

Service role (backend API) bypasses RLS. This is expected behavior for:
- Creating new users during signup
- Managing refresh tokens
- Processing anonymization jobs

## Troubleshooting

### Policy Not Working?

1. **Verify RLS is enabled**: Check the query above
2. **Check auth context**: `SELECT auth.uid();` should return a user ID
3. **Policy syntax**: Review the SQL for typos

### Performance Issues?

- Policies with subqueries (like booking policies) might be slower
- Monitor query performance in Supabase Dashboard → Performance tab
- Consider adding indexes if needed

### Backend Connection Issues?

If backend can't write after enabling RLS:

1. Ensure `anon` and `service_role` keys are being used correctly
2. Service role should bypass RLS automatically
3. Check API error messages for specific RLS violations

## Related Documentation

- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase RLS Linter](https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public)
- Project CLAUDE.md for development guidelines

## Next Steps

1. ✅ Apply RLS policies from `rls_policies.sql`
2. Test RLS enforcement with sample queries
3. Update backend environment to use correct API keys
4. Monitor Supabase logs for RLS policy violations
5. Add additional policies if new tables are created

---

**Last Updated**: November 2025
**RLS Version**: 1.0
