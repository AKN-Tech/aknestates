/*
# Add "custom" provider option and custom_provider_name column to ai_config
*/

-- Add custom_provider_name column
ALTER TABLE ai_config ADD COLUMN IF NOT EXISTS custom_provider_name text NOT NULL DEFAULT '';

-- Drop the old CHECK constraint and add a new one that includes 'custom'
ALTER TABLE ai_config DROP CONSTRAINT IF EXISTS ai_config_provider_check;
ALTER TABLE ai_config ADD CONSTRAINT ai_config_provider_check
  CHECK (provider IN ('gemini', 'openai', 'anthropic', 'custom'));

-- Must DROP functions first since return type changes
DROP FUNCTION IF EXISTS get_ai_config_admin();
DROP FUNCTION IF EXISTS save_ai_config(text, text, boolean, text);

-- ── Recreate SECURITY DEFINER functions ────────────────────

-- Admin read: now also returns custom_provider_name
CREATE OR REPLACE FUNCTION get_ai_config_admin()
RETURNS TABLE (
  provider text,
  custom_provider_name text,
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
      a.custom_provider_name,
      (a.api_key <> '') AS key_set,
      a.chatbot_enabled,
      a.welcome_message
    FROM ai_config a
    WHERE a.id = 1;
END;
$$;

REVOKE EXECUTE ON FUNCTION get_ai_config_admin FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION get_ai_config_admin FROM anon;
GRANT EXECUTE ON FUNCTION get_ai_config_admin TO authenticated;

-- Admin write: now accepts p_custom_provider_name
CREATE OR REPLACE FUNCTION save_ai_config(
  p_provider text,
  p_custom_provider_name text,
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

  IF p_provider NOT IN ('gemini', 'openai', 'anthropic', 'custom') THEN
    RAISE EXCEPTION 'Invalid provider';
  END IF;

  IF p_api_key = '' THEN
    UPDATE ai_config SET
      provider = p_provider,
      custom_provider_name = p_custom_provider_name,
      chatbot_enabled = p_chatbot_enabled,
      welcome_message = p_welcome_message,
      updated_at = now()
    WHERE id = 1;
  ELSE
    UPDATE ai_config SET
      provider = p_provider,
      custom_provider_name = p_custom_provider_name,
      api_key = p_api_key,
      chatbot_enabled = p_chatbot_enabled,
      welcome_message = p_welcome_message,
      updated_at = now()
    WHERE id = 1;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION save_ai_config FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION save_ai_config FROM anon;
GRANT EXECUTE ON FUNCTION save_ai_config TO authenticated;
