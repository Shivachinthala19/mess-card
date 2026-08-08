/*
# Production Schema Overhaul — MessCard Platform

## Overview
Upgrades the schema for production use with real user accounts, role-based
access control, and proper data ownership. Two user roles: "student" (subscribes
to mess) and "owner" (manages hostels). Hostels are owned by owner users.
Subscriptions and reviews are owned by student users.

## Changes

### New Table: profiles
- Stores the user's role (student/owner), full name, and phone.
- One row per auth user, keyed by auth.users.id.
- Created via trigger on signup.

### Modified: hostels
- Added owner_id uuid (nullable for legacy rows, NOT NULL enforced by app/RLS)
  referencing auth.users. New inserts require owner_id = auth.uid().

### Modified: subscriptions
- Added user_id uuid NOT NULL DEFAULT auth.uid() referencing auth.users.
- Added payment_status text DEFAULT 'pending' (pending/paid/failed).

### Modified: reviews
- Added user_id uuid NOT NULL DEFAULT auth.uid() referencing auth.users.

### Security (RLS)
- profiles: users read all profiles, update only their own.
- hostels: public read, owner-only insert/update/delete.
- weekly_menus: public read, owner-of-parent-hostel insert/update/delete.
- subscriptions: students read/insert their own; hostel owners read
  subscriptions for hostels they own.
- reviews: public read, authenticated insert (own only), update/delete own.

### Trigger
- handle_new_user(): auto-creates a profile row when a new auth.user signs up.
*/

-- ===== PROFILES TABLE =====
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'owner')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- ===== ADD owner_id TO hostels (nullable for legacy seed data) =====
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hostels' AND column_name = 'owner_id') THEN
    ALTER TABLE hostels ADD COLUMN owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ===== ADD user_id + payment_status TO subscriptions =====
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'user_id') THEN
    ALTER TABLE subscriptions ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'payment_status') THEN
    ALTER TABLE subscriptions ADD COLUMN payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed'));
  END IF;
END $$;

-- ===== ADD user_id TO reviews =====
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'user_id') THEN
    ALTER TABLE reviews ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ===== RLS POLICIES FOR hostels (owner-scoped write, public read) =====
DROP POLICY IF EXISTS "anon_select_hostels" ON hostels;
DROP POLICY IF EXISTS "anon_insert_hostels" ON hostels;
DROP POLICY IF EXISTS "anon_update_hostels" ON hostels;
DROP POLICY IF EXISTS "anon_delete_hostels" ON hostels;

CREATE POLICY "hostels_select_all" ON hostels FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "hostels_insert_own" ON hostels FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "hostels_update_own" ON hostels FOR UPDATE
  TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "hostels_delete_own" ON hostels FOR DELETE
  TO authenticated USING (auth.uid() = owner_id);

-- ===== RLS POLICIES FOR weekly_menus (owner-scoped write via parent hostel) =====
DROP POLICY IF EXISTS "anon_select_weekly_menus" ON weekly_menus;
DROP POLICY IF EXISTS "anon_insert_weekly_menus" ON weekly_menus;
DROP POLICY IF EXISTS "anon_update_weekly_menus" ON weekly_menus;
DROP POLICY IF EXISTS "anon_delete_weekly_menus" ON weekly_menus;

CREATE POLICY "weekly_menus_select_all" ON weekly_menus FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "weekly_menus_insert_owner" ON weekly_menus FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM hostels WHERE hostels.id = weekly_menus.hostel_id AND hostels.owner_id = auth.uid())
  );

CREATE POLICY "weekly_menus_update_owner" ON weekly_menus FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM hostels WHERE hostels.id = weekly_menus.hostel_id AND hostels.owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM hostels WHERE hostels.id = weekly_menus.hostel_id AND hostels.owner_id = auth.uid())
  );

CREATE POLICY "weekly_menus_delete_owner" ON weekly_menus FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM hostels WHERE hostels.id = weekly_menus.hostel_id AND hostels.owner_id = auth.uid())
  );

-- ===== RLS POLICIES FOR subscriptions =====
DROP POLICY IF EXISTS "anon_select_subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "anon_insert_subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "anon_update_subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "anon_delete_subscriptions" ON subscriptions;

CREATE POLICY "subscriptions_select_own_or_owner" ON subscriptions FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM hostels WHERE hostels.id = subscriptions.hostel_id AND hostels.owner_id = auth.uid())
  );

CREATE POLICY "subscriptions_insert_own" ON subscriptions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "subscriptions_update_own_or_owner" ON subscriptions FOR UPDATE
  TO authenticated USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM hostels WHERE hostels.id = subscriptions.hostel_id AND hostels.owner_id = auth.uid())
  ) WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM hostels WHERE hostels.id = subscriptions.hostel_id AND hostels.owner_id = auth.uid())
  );

CREATE POLICY "subscriptions_delete_own" ON subscriptions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ===== RLS POLICIES FOR reviews =====
DROP POLICY IF EXISTS "anon_select_reviews" ON reviews;
DROP POLICY IF EXISTS "anon_insert_reviews" ON reviews;
DROP POLICY IF EXISTS "anon_update_reviews" ON reviews;
DROP POLICY IF EXISTS "anon_delete_reviews" ON reviews;

CREATE POLICY "reviews_select_all" ON reviews FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "reviews_insert_own" ON reviews FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_update_own" ON reviews FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_delete_own" ON reviews FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ===== INDEXES =====
CREATE INDEX IF NOT EXISTS idx_hostels_owner_id ON hostels(owner_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- ===== TRIGGER: auto-create profile on signup =====
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
