-- Tighten EXECUTE grants: revoke from PUBLIC/anon for admin-only functions
REVOKE EXECUTE ON FUNCTION get_ai_config_admin FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION get_ai_config_admin FROM anon;
GRANT EXECUTE ON FUNCTION get_ai_config_admin TO authenticated;

REVOKE EXECUTE ON FUNCTION save_ai_config FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION save_ai_config FROM anon;
GRANT EXECUTE ON FUNCTION save_ai_config TO authenticated;

-- get_ai_config_public stays callable by anon + authenticated (intentionally public)
