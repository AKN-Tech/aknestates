/*
# Create listings table and storage bucket for property photos

## Purpose
Stores real estate property listings for AKN Estates. Each listing represents
a property that is either For Sale or For Rent, with full details including
photos stored in Supabase Storage.

## New Tables
- `listings`
  - `id` (uuid, primary key)
  - `title` (text, not null) — property title
  - `description` (text, not null) — full description
  - `price` (bigint, not null) — price in PKR (for sale) or monthly rent (for rent)
  - `property_type` (text, not null) — one of: House, Flat, Plot, Commercial, Farmhouse
  - `city` (text, not null) — city name
  - `area` (text, not null) — area/neighborhood
  - `size_marla` (numeric, nullable) — size in Marla
  - `size_kanal` (numeric, nullable) — size in Kanal
  - `size_sqft` (integer, nullable) — size in square feet
  - `bedrooms` (integer, nullable) — number of bedrooms
  - `bathrooms` (integer, nullable) — number of bathrooms
  - `furnished` (boolean, nullable) — furnished status (for rentals)
  - `purpose` (text, not null) — 'sale' or 'rent'
  - `year_built` (integer, nullable) — year the property was built
  - `condition` (text, nullable) — New, Excellent, Good, Needs Renovation
  - `featured` (boolean, default false) — show on homepage featured section
  - `photos` (jsonb, default '[]') — array of storage URLs for property photos
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

## Security
- RLS enabled on `listings`.
- Public (anon) can READ all listings — visitors browse without logging in.
- Only authenticated users can INSERT, UPDATE, DELETE — only the admin can manage listings.
- Storage bucket `listing-photos` created with public read, admin-only write.
*/

CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  price bigint NOT NULL DEFAULT 0,
  property_type text NOT NULL CHECK (property_type IN ('House', 'Flat', 'Plot', 'Commercial', 'Farmhouse')),
  city text NOT NULL,
  area text NOT NULL,
  size_marla numeric,
  size_kanal numeric,
  size_sqft integer,
  bedrooms integer,
  bathrooms integer,
  furnished boolean,
  purpose text NOT NULL DEFAULT 'sale' CHECK (purpose IN ('sale', 'rent')),
  year_built integer,
  condition text CHECK (condition IS NULL OR condition IN ('New', 'Excellent', 'Good', 'Needs Renovation')),
  featured boolean NOT NULL DEFAULT false,
  photos jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Public read: anyone (including anon) can browse listings
DROP POLICY IF EXISTS "public_read_listings" ON listings;
CREATE POLICY "public_read_listings"
  ON listings FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin write: only authenticated users can insert
DROP POLICY IF EXISTS "admin_insert_listings" ON listings;
CREATE POLICY "admin_insert_listings"
  ON listings FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Admin update: only authenticated users can update
DROP POLICY IF EXISTS "admin_update_listings" ON listings;
CREATE POLICY "admin_update_listings"
  ON listings FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

-- Admin delete: only authenticated users can delete
DROP POLICY IF EXISTS "admin_delete_listings" ON listings;
CREATE POLICY "admin_delete_listings"
  ON listings FOR DELETE
  TO authenticated
  USING (true);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_listings_purpose ON listings (purpose);
CREATE INDEX IF NOT EXISTS idx_listings_city ON listings (city);
CREATE INDEX IF NOT EXISTS idx_listings_type ON listings (property_type);
CREATE INDEX IF NOT EXISTS idx_listings_featured ON listings (featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings (created_at DESC);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS listings_updated_at ON listings;
CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create storage bucket for listing photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-photos', 'listing-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: public can read photos, only authenticated can upload/manage
DROP POLICY IF EXISTS "public_read_listing_photos" ON storage.objects;
CREATE POLICY "public_read_listing_photos"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'listing-photos');

DROP POLICY IF EXISTS "admin_upload_listing_photos" ON storage.objects;
CREATE POLICY "admin_upload_listing_photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'listing-photos');

DROP POLICY IF EXISTS "admin_update_listing_photos" ON storage.objects;
CREATE POLICY "admin_update_listing_photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'listing-photos');

DROP POLICY IF EXISTS "admin_delete_listing_photos" ON storage.objects;
CREATE POLICY "admin_delete_listing_photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'listing-photos');
