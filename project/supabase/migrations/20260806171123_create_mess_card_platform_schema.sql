/*
# MessCard Digital Platform - Core Schema

## Overview
Creates the database schema for a digital mess card platform that connects
students/IT workers with hostels and PGs that provide daily meals. Users browse
hostels, view weekly menus, and take monthly subscriptions. The app takes a
commission; hostels receive payments; users get food.

## Tables

### hostels
Stores hostel/PG listings with details like name, location, pricing, capacity,
amenities, and rating. This is the core browsable entity.

### weekly_menus
Stores the recurring weekly menu for each hostel, broken down by day of week
and meal type (breakfast, lunch, dinner). Each entry lists menu items.

### subscriptions
Records a user's monthly subscription to a hostel's mess. Tracks subscriber
name/phone, plan type, start/end dates, payment amount, and status (active/
expired/cancelled). This is the "digital mess card".

### reviews
Stores user reviews and ratings for hostels.

## Security
- RLS enabled on all tables.
- This is a no-auth app (no sign-in screen), so all policies use
  TO anon, authenticated with USING(true) / WITH CHECK(true) because the
  data is intentionally public/shared for browsing and demo purposes.
*/

-- Hostels / PGs table
CREATE TABLE IF NOT EXISTS hostels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  area text NOT NULL,
  city text NOT NULL,
  address text NOT NULL DEFAULT '',
  monthly_price numeric(10,2) NOT NULL DEFAULT 0,
  commission_rate numeric(5,2) NOT NULL DEFAULT 10.00,
  image_url text NOT NULL DEFAULT '',
  rating numeric(3,2) NOT NULL DEFAULT 0.00,
  total_capacity int NOT NULL DEFAULT 0,
  filled_capacity int NOT NULL DEFAULT 0,
  contact_phone text NOT NULL DEFAULT '',
  amenities text[] NOT NULL DEFAULT '{}',
  food_type text NOT NULL DEFAULT 'Veg & Non-Veg',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Weekly menus (recurring weekly menu per hostel)
CREATE TABLE IF NOT EXISTS weekly_menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id uuid NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  day_of_week int NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  meal_type text NOT NULL CHECK (meal_type IN ('Breakfast', 'Lunch', 'Dinner')),
  menu_items text NOT NULL,
  description text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Subscriptions (digital mess cards)
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id uuid NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  subscriber_name text NOT NULL,
  subscriber_phone text NOT NULL,
  plan_type text NOT NULL DEFAULT 'Full' CHECK (plan_type IN ('Breakfast Only', 'Lunch Only', 'Dinner Only', 'Lunch & Dinner', 'Full')),
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
  amount_paid numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Expired', 'Cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id uuid NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  reviewer_name text NOT NULL,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Hostels policies (public read, public write for demo)
DROP POLICY IF EXISTS "anon_select_hostels" ON hostels;
CREATE POLICY "anon_select_hostels" ON hostels FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_hostels" ON hostels;
CREATE POLICY "anon_insert_hostels" ON hostels FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_hostels" ON hostels;
CREATE POLICY "anon_update_hostels" ON hostels FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_hostels" ON hostels;
CREATE POLICY "anon_delete_hostels" ON hostels FOR DELETE
  TO anon, authenticated USING (true);

-- Weekly menus policies
DROP POLICY IF EXISTS "anon_select_weekly_menus" ON weekly_menus;
CREATE POLICY "anon_select_weekly_menus" ON weekly_menus FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_weekly_menus" ON weekly_menus;
CREATE POLICY "anon_insert_weekly_menus" ON weekly_menus FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_weekly_menus" ON weekly_menus;
CREATE POLICY "anon_update_weekly_menus" ON weekly_menus FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_weekly_menus" ON weekly_menus;
CREATE POLICY "anon_delete_weekly_menus" ON weekly_menus FOR DELETE
  TO anon, authenticated USING (true);

-- Subscriptions policies
DROP POLICY IF EXISTS "anon_select_subscriptions" ON subscriptions;
CREATE POLICY "anon_select_subscriptions" ON subscriptions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_subscriptions" ON subscriptions;
CREATE POLICY "anon_insert_subscriptions" ON subscriptions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_subscriptions" ON subscriptions;
CREATE POLICY "anon_update_subscriptions" ON subscriptions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_subscriptions" ON subscriptions;
CREATE POLICY "anon_delete_subscriptions" ON subscriptions FOR DELETE
  TO anon, authenticated USING (true);

-- Reviews policies
DROP POLICY IF EXISTS "anon_select_reviews" ON reviews;
CREATE POLICY "anon_select_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_reviews" ON reviews;
CREATE POLICY "anon_insert_reviews" ON reviews FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_reviews" ON reviews;
CREATE POLICY "anon_update_reviews" ON reviews FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_reviews" ON reviews;
CREATE POLICY "anon_delete_reviews" ON reviews FOR DELETE
  TO anon, authenticated USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_hostels_city ON hostels(city);
CREATE INDEX IF NOT EXISTS idx_hostels_area ON hostels(area);
CREATE INDEX IF NOT EXISTS idx_weekly_menus_hostel_id ON weekly_menus(hostel_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_hostel_id ON subscriptions(hostel_id);
CREATE INDEX IF NOT EXISTS idx_reviews_hostel_id ON reviews(hostel_id);
