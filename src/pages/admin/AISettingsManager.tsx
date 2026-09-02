import { useState, useEffect, useCallback } from 'react';
import { Bot, Save, Loader2, AlertCircle, Check, Eye, EyeOff, Power, Sparkles, Settings2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AIConfig {
  provider: 'gemini' | 'openai' | 'anthropic' | 'custom';
  custom_provider_name: string;
  key_set: boolean;
  chatbot_enabled: boolean;
  welcome_message: string;
}

const PROVIDERS = [
  { value: 'gemini', label: 'Google Gemini' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'custom', label: 'Custom / Other' },
] as const;

export function AISettingsManager() {
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState<string>('gemini');
  const [customProviderName, setCustomProviderName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [chatbotEnabled, setChatbotEnabled] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('get_ai_config_admin');
      if (rpcError) throw rpcError;
      const rows = data as AIConfig[];
      if (rows && rows.length > 0) {
        const c = rows[0];
        setConfig(c);
        setProvider(c.provider);
        setCustomProviderName(c.custom_provider_name || '');
        setChatbotEnabled(c.chatbot_enabled);
        setWelcomeMessage(c.welcome_message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load AI configuration');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const { error: rpcError } = await supabase.rpc('save_ai_config', {
        p_provider: provider,
        p_custom_provider_name: customProviderName,
        p_api_key: apiKey,
        p_chatbot_enabled: chatbotEnabled,
        p_welcome_message: welcomeMessage,
      });
      if (rpcError) throw rpcError;
      setApiKey('');
      setShowKey(false);
      await load();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save AI configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gold-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-gold-500">
          <Bot className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase tracking-wider">AI Configuration</span>
        </div>
        <h2 className="mt-2 font-display text-2xl font-bold text-forest-700">AI Settings</h2>
        <p className="mt-1 text-sm text-forest-400">Configure your AI chatbot provider and behavior</p>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-600">
          <Check className="h-4 w-4 shrink-0" />
          <span>AI configuration saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Provider Selection */}
        <div className="rounded-xl bg-white p-6 card-shadow">
          <div className="mb-4 flex items-center gap-2 text-forest-600">
            <Sparkles className="h-5 w-5 text-gold-500" />
            <h3 className="font-display text-lg font-bold">AI Provider</h3>
          </div>

          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">Provider</label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PROVIDERS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setProvider(p.value)}
                className={`flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all ${
                  provider === p.value
                    ? 'border-gold-400 bg-gold-400/5'
                    : 'border-cream-200 hover:border-cream-300'
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${provider === p.value ? 'bg-gold-400 text-forest-700' : 'bg-cream-100 text-forest-400'}`}>
                  {p.value === 'custom' ? <Settings2 className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                </div>
                <p className={`text-sm font-semibold ${provider === p.value ? 'text-forest-700' : 'text-forest-500'}`}>{p.label}</p>
              </button>
            ))}
          </div>

          {/* Custom provider name input */}
          {provider === 'custom' && (
            <div className="mt-4 animate-fade-in">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">Custom Provider Name</label>
              <input
                type="text"
                value={customProviderName}
                onChange={(e) => setCustomProviderName(e.target.value)}
                placeholder="e.g. Mistral, Cohere, Local LLM..."
                className="input-field"
              />
              <p className="mt-1.5 text-xs text-forest-300">Enter the name of your AI provider. The chatbot will use an OpenAI-compatible API format.</p>
            </div>
          )}
        </div>

        {/* API Key */}
        <div className="rounded-xl bg-white p-6 card-shadow">
          <h3 className="mb-1 font-display text-lg font-bold text-forest-700">API Key</h3>
          <p className="mb-4 text-xs text-forest-400">
            Your API key is stored securely and never exposed to the public site.
            {config?.key_set
              ? ' A key is currently saved — enter a new key below to replace it, or leave blank to keep the existing one.'
              : ' No key is set yet.'}
          </p>

          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">
            {config?.key_set ? 'New API Key (leave blank to keep current)' : 'API Key *'}
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={config?.key_set ? '••••••••••••••••' : 'Paste your API key here'}
              className="input-field pr-12 font-mono"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-300 transition-colors hover:text-forest-500"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {config?.key_set && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600">
              <Check className="h-3.5 w-3.5" />
              <span>API key is configured</span>
            </div>
          )}
        </div>

        {/* Chatbot Toggle */}
        <div className="rounded-xl bg-white p-6 card-shadow">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${chatbotEnabled ? 'bg-emerald-50 text-emerald-600' : 'bg-cream-100 text-forest-300'}`}>
                <Power className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-forest-700">Chatbot Enabled</h3>
                <p className="mt-0.5 text-sm text-forest-400">Toggle the AI chatbot widget on or off for the public site</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setChatbotEnabled(!chatbotEnabled)}
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${chatbotEnabled ? 'bg-emerald-500' : 'bg-cream-300'}`}
              aria-label="Toggle chatbot"
            >
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${chatbotEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="rounded-xl bg-white p-6 card-shadow">
          <h3 className="mb-1 font-display text-lg font-bold text-forest-700">Welcome Message</h3>
          <p className="mb-4 text-sm text-forest-400">The first message visitors see when they open the chatbot</p>

          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">Message Text</label>
          <textarea
            rows={3}
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            placeholder="Hello! How can I help you today?"
            className="input-field resize-none"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-lg bg-forest-600 px-6 py-2.5 text-sm font-semibold text-cream-100 transition-all hover:bg-forest-700 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save AI Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
