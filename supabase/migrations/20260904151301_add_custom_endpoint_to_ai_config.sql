/*
# Add custom_endpoint column to ai_config

1. Changes
- Adds `custom_endpoint` (text) column to `ai_config` table.
- This stores the API endpoint URL for custom/OpenAI-compatible providers.
- Defaults to empty string (existing gemini/openai/anthropic providers don't need it).
2. Functions
- Drops and recreates `get_ai_config_admin()` to also return `custom_endpoint`.
- Drops and recreates `save_ai_config()` to also accept and store `p_custom_endpoint`.
- `get_ai_config_public()` is unchanged (still returns only chatbot_enabled + welcome_message).
3. Security
- No RLS policy changes. Table remains deny-by-default with SECURITY DEFINER functions.
- `custom_endpoint` is treated as non-secret (visible to admin via get_ai_config_admin).
*/

ALTER TABLE ai_config ADD COLUMN IF NOT EXISTS custom_endpoint text NOT NULL DEFAULT '';

DROP FUNCTION IF EXISTS get_ai_config_admin();
DROP FUNCTION IF EXISTS save_ai_config(text, text, text, boolean, text);

CREATE OR REPLACE FUNCTION get_ai_config_admin()
RETURNS TABLE (
  provider text,
  custom_provider_name text,
  custom_endpoint text,
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
      a.custom_endpoint,
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

CREATE OR REPLACE FUNCTION save_ai_config(
  p_provider text,
  p_custom_provider_name text,
  p_custom_endpoint text,
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
      custom_endpoint = p_custom_endpoint,
      chatbot_enabled = p_chatbot_enabled,
      welcome_message = p_welcome_message,
      updated_at = now()
    WHERE id = 1;
  ELSE
    UPDATE ai_config SET
      provider = p_provider,
      custom_provider_name = p_custom_provider_name,
      custom_endpoint = p_custom_endpoint,
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
