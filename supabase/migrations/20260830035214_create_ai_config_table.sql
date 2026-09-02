/*
# AI Configuration table with server-side-only API key access

## Security model

The `ai_config` table holds a third-party API key that must never reach the browser.
RLS is enabled with NO direct-access policies — the table is invisible to both
anon and authenticated roles via the data API.

All reads and writes go through SECURITY DEFINER functions that:
  - Authorize the caller via auth.uid() (authenticated only)
  - Never return the raw api_key to the caller
  - Expose only non-secret fields to the public (chatbot_enabled, welcome_message)

An edge function using the service role key can read the full row directly
for server-side AI API calls (bypasses RLS).
*/

-- ── ai_config table (singleton, like site_settings) ──────────
CREATE TABLE IF NOT EXISTS ai_config (
  id integer PRIMARY KEY DEFAULT 1,
  provider text NOT NULL DEFAULT 'gemini'
    CHECK (provider IN ('gemini', 'openai', 'anthropic')),
  api_key text NOT NULL DEFAULT '',
  chatbot_enabled boolean NOT NULL DEFAULT false,
  welcome_message text NOT NULL DEFAULT 'Hello! How can I help you with your real estate needs today?',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE ai_config ENABLE ROW LEVEL SECURITY;

-- No policies — deny by default. All access through SECURITY DEFINER functions.

-- Seed default row
INSERT INTO ai_config (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- ── SECURITY DEFINER functions ──────────────────────────────

-- Admin read: returns everything EXCEPT the raw api_key (replaced with a boolean "key_set")
CREATE OR REPLACE FUNCTION get_ai_config_admin()
RETURNS TABLE (
  provider text,
  key_set boolean,
  chatbot_enabled boolean,
  welcome_message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
    SELECT
      a.provider,
      (a.api_key <> '') AS key_set,
      a.chatbot_enabled,
      a.welcome_message
    FROM ai_config a
    WHERE a.id = 1;
END;
$$;

REVOKE EXECUTE ON FUNCTION get_ai_config_admin FROM anon;
GRANT EXECUTE ON FUNCTION get_ai_config_admin TO authenticated;

-- Admin write: upserts the config row. Only callable by authenticated users.
CREATE OR REPLACE FUNCTION save_ai_config(
  p_provider text,
  p_api_key text,
  p_chatbot_enabled boolean,
  p_welcome_message text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_provider NOT IN ('gemini', 'openai', 'anthropic') THEN
    RAISE EXCEPTION 'Invalid provider';
  END IF;

  -- If api_key is empty string, keep the existing key (don't overwrite with blank)
  IF p_api_key = '' THEN
    UPDATE ai_config SET
      provider = p_provider,
      chatbot_enabled = p_chatbot_enabled,
      welcome_message = p_welcome_message,
      updated_at = now()
    WHERE id = 1;
  ELSE
    UPDATE ai_config SET
      provider = p_provider,
      api_key = p_api_key,
      chatbot_enabled = p_chatbot_enabled,
      welcome_message = p_welcome_message,
      updated_at = now()
    WHERE id = 1;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION save_ai_config FROM anon;
GRANT EXECUTE ON FUNCTION save_ai_config TO authenticated;

-- Public read: returns only chatbot_enabled and welcome_message (no secrets)
-- Used by the public site to decide whether to show the chatbot widget
CREATE OR REPLACE FUNCTION get_ai_config_public()
RETURNS TABLE (
  chatbot_enabled boolean,
  welcome_message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
    SELECT
      a.chatbot_enabled,
      a.welcome_message
    FROM ai_config a
    WHERE a.id = 1;
END;
$$;

GRANT EXECUTE ON FUNCTION get_ai_config_public TO anon, authenticated;
