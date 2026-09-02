/*
# Create site_settings and leads tables + site-assets storage bucket

## 1. New Tables

### site_settings (singleton)
Stores branding, contact info, and theme colors for the entire site.
A single row (id = 1) holds all settings. Public can read; only authenticated admin can update.
- `id` (int, primary key, always 1) — enforced by CHECK constraint
- `brand_name` (text) — full brand name shown in header/footer, e.g. "AKN Estates"
- `brand_short` (text) — short brand text shown in header logo area, e.g. "AKN"
- `logo_url` (text) — URL to uploaded logo in site-assets bucket; empty string = use default icon
- `phone` (text) — contact phone number
- `email` (text) — contact email address
- `whatsapp` (text) — WhatsApp number with country code, no + or spaces
- `office_address` (text) — physical office address
- `office_hours_weekday` (text) — Mon–Fri hours, e.g. "9 AM – 7 PM"
- `office_hours_saturday` (text) — Saturday hours
- `office_hours_sunday` (text) — Sunday hours
- `primary_color` (text) — hex color for primary/forest theme ramp
- `accent_color` (text) — hex color for accent/gold theme ramp
- `background_color` (text) — hex color for background/cream theme ramp
- `updated_at` (timestamptz) — auto-updated on change

### leads
Stores contact form submissions from the public Contact page.
Public visitors can INSERT only (submit a lead). Admin can SELECT and DELETE.
- `id` (uuid, primary key)
- `name` (text, not null) — submitter's name
- `phone` (text, not null) — submitter's phone number
- `message` (text, not null) — the inquiry message
- `created_at` (timestamptz, default now)

## 2. Security (RLS)

### site_settings
- SELECT: public (anon, authenticated) — the whole site reads settings
- INSERT/UPDATE/DELETE: authenticated admin only

### leads
- INSERT: public (anon, authenticated) — visitors submit contact forms
- SELECT/UPDATE/DELETE: authenticated admin only — leads are private

## 3. Storage
- Create public bucket "site-assets" for logo uploads
- Public read; authenticated write

## 4. Seed Data
- Insert a single default settings row (id = 1) with current hardcoded values
*/

-- ── site_settings table ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  id integer PRIMARY KEY DEFAULT 1,
  brand_name text NOT NULL DEFAULT 'AKN Estates',
  brand_short text NOT NULL DEFAULT 'AKN',
  logo_url text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '+92 300 1234567',
  email text NOT NULL DEFAULT 'info@aknestates.pk',
  whatsapp text NOT NULL DEFAULT '923001234567',
  office_address text NOT NULL DEFAULT '53-G, Gulberg III, Lahore, Pakistan',
  office_hours_weekday text NOT NULL DEFAULT '9 AM – 7 PM',
  office_hours_saturday text NOT NULL DEFAULT '10 AM – 5 PM',
  office_hours_sunday text NOT NULL DEFAULT 'Closed',
  primary_color text NOT NULL DEFAULT '#0F3D2E',
  accent_color text NOT NULL DEFAULT '#C9973D',
  background_color text NOT NULL DEFAULT '#F5F1E8',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_settings" ON site_settings;
CREATE POLICY "public_read_settings" ON site_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_settings" ON site_settings;
CREATE POLICY "admin_insert_settings" ON site_settings FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_settings" ON site_settings;
CREATE POLICY "admin_update_settings" ON site_settings FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_settings" ON site_settings;
CREATE POLICY "admin_delete_settings" ON site_settings FOR DELETE
  TO authenticated USING (true);

-- Seed default row
INSERT INTO site_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- ── leads table ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_leads" ON leads;
CREATE POLICY "public_insert_leads" ON leads FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_read_leads" ON leads;
CREATE POLICY "admin_read_leads" ON leads FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_delete_leads" ON leads;
CREATE POLICY "admin_delete_leads" ON leads FOR DELETE
  TO authenticated USING (true);

-- Index for sorting leads by newest first
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC);

-- ── Storage bucket for site assets (logo) ────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: public read, authenticated write
DROP POLICY IF EXISTS "public_read_site_assets" ON storage.objects;
CREATE POLICY "public_read_site_assets" ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'site-assets');

DROP POLICY IF EXISTS "auth_write_site_assets" ON storage.objects;
CREATE POLICY "auth_write_site_assets" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'site-assets');

DROP POLICY IF EXISTS "auth_update_site_assets" ON storage.objects;
CREATE POLICY "auth_update_site_assets" ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'site-assets');

DROP POLICY IF EXISTS "auth_delete_site_assets" ON storage.objects;
CREATE POLICY "auth_delete_site_assets" ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'site-assets');