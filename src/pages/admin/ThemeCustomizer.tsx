import { useState, useEffect } from 'react';
import { Palette, Save, RotateCcw, Loader2, Check, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSettings } from '@/lib/settings-context';
import { applyTheme } from '@/lib/theme';

export function ThemeCustomizer() {
  const { settings, refresh } = useSettings();
  const [colors, setColors] = useState({
    primary: settings.primary_color,
    accent: settings.accent_color,
    background: settings.background_color,
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setColors({
      primary: settings.primary_color,
      accent: settings.accent_color,
      background: settings.background_color,
    });
  }, [settings]);

  // Live preview — apply theme immediately whenever color values change
  useEffect(() => {
    if (colors.primary && colors.accent && colors.background) {
      applyTheme(colors.primary, colors.accent, colors.background);
    }
  }, [colors]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const { error: updateError } = await supabase
        .from('site_settings')
        .update({
          primary_color: colors.primary,
          accent_color: colors.accent,
          background_color: colors.background,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1);
      if (updateError) throw updateError;
      await refresh();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save theme');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setColors({
      primary: settings.primary_color,
      accent: settings.accent_color,
      background: settings.background_color,
    });
    applyTheme(settings.primary_color, settings.accent_color, settings.background_color);
  };

  const presets = [
    { name: 'Forest Gold', primary: '#0F3D2E', accent: '#C9973D', background: '#F5F1E8' },
    { name: 'Ocean Blue', primary: '#1E3A5F', accent: '#3B9AC9', background: '#F0F4F8' },
    { name: 'Royal Burgundy', primary: '#5B1A2E', accent: '#C4956C', background: '#F5EDE8' },
    { name: 'Charcoal Teal', primary: '#1A3A3A', accent: '#D4A574', background: '#F2EFEA' },
    { name: 'Slate Green', primary: '#2D4A3E', accent: '#B8860B', background: '#F3F0E8' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-forest-700">Theme Customization</h2>
        <p className="mt-1 text-sm text-forest-400">Customize your site colors with live preview</p>
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
          <span>Theme saved successfully!</span>
        </div>
      )}

      {/* Color Pickers */}
      <div className="rounded-xl bg-white p-6 card-shadow">
        <div className="mb-5 flex items-center gap-2 text-forest-600">
          <Palette className="h-5 w-5 text-gold-500" />
          <h3 className="font-display text-lg font-bold">Color Pickers</h3>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { key: 'primary' as const, label: 'Primary Color', desc: 'Headers, buttons, dark backgrounds' },
            { key: 'accent' as const, label: 'Accent Color', desc: 'Highlights, CTAs, icons' },
            { key: 'background' as const, label: 'Background Color', desc: 'Page background, cards' },
          ].map((item) => (
            <div key={item.key}>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">{item.label}</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={colors[item.key]}
                  onChange={(e) => setColors((prev) => ({ ...prev, [item.key]: e.target.value }))}
                  className="h-12 w-16 cursor-pointer rounded-lg border border-cream-300"
                />
                <input
                  type="text"
                  value={colors[item.key]}
                  onChange={(e) => setColors((prev) => ({ ...prev, [item.key]: e.target.value }))}
                  className="input-field flex-1 font-mono text-sm uppercase"
                />
              </div>
              <p className="mt-1.5 text-xs text-forest-300">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Presets */}
      <div className="mt-6 rounded-xl bg-white p-6 card-shadow">
        <h3 className="mb-4 font-display text-lg font-bold text-forest-700">Quick Presets</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {presets.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => setColors({ primary: preset.primary, accent: preset.accent, background: preset.background })}
              className="rounded-lg border border-cream-200 p-3 text-left transition-all hover:border-gold-400 hover:shadow-md"
            >
              <div className="flex gap-1.5">
                <div className="h-8 w-8 rounded" style={{ backgroundColor: preset.primary }} />
                <div className="h-8 w-8 rounded" style={{ backgroundColor: preset.accent }} />
                <div className="h-8 w-8 rounded border border-cream-200" style={{ backgroundColor: preset.background }} />
              </div>
              <p className="mt-2 text-sm font-medium text-forest-600">{preset.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Live Preview Card */}
      <div className="mt-6 rounded-xl bg-white p-6 card-shadow">
        <h3 className="mb-4 font-display text-lg font-bold text-forest-700">Live Preview</h3>
        <div className="overflow-hidden rounded-lg border border-cream-200">
          {/* Header preview */}
          <div className="flex items-center justify-between bg-forest-600 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-400 text-forest-700">
                <span className="text-xs font-bold">A</span>
              </div>
              <span className="font-display text-sm font-bold text-cream-100">Brand</span>
            </div>
            <button className="rounded-lg bg-gold-400 px-3 py-1.5 text-xs font-semibold text-forest-700">Button</button>
          </div>
          {/* Body preview */}
          <div className="bg-cream-100 p-6">
            <div className="mb-4">
              <h4 className="font-display text-lg font-bold text-forest-700">Sample Heading</h4>
              <p className="mt-1 text-sm text-forest-400">This is how your content will look with the selected colors.</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-white p-3 card-shadow">
                <div className="mb-2 h-2 w-12 rounded bg-gold-400" />
                <div className="h-2 w-full rounded bg-forest-200" />
                <div className="mt-1 h-2 w-2/3 rounded bg-forest-100" />
              </div>
              <div className="rounded-lg bg-white p-3 card-shadow">
                <div className="mb-2 h-2 w-12 rounded bg-gold-400" />
                <div className="h-2 w-full rounded bg-forest-200" />
                <div className="mt-1 h-2 w-2/3 rounded bg-forest-100" />
              </div>
              <div className="rounded-lg bg-white p-3 card-shadow">
                <div className="mb-2 h-2 w-12 rounded bg-gold-400" />
                <div className="h-2 w-full rounded bg-forest-200" />
                <div className="mt-1 h-2 w-2/3 rounded bg-forest-100" />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="rounded-lg bg-forest-600 px-4 py-2 text-xs font-semibold text-cream-100">Primary</button>
              <button className="rounded-lg bg-gold-400 px-4 py-2 text-xs font-semibold text-forest-700">Accent</button>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-2 rounded-lg border border-cream-300 px-5 py-2.5 text-sm font-medium text-forest-600 transition-colors hover:bg-cream-50"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Saved
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-lg bg-forest-600 px-6 py-2.5 text-sm font-semibold text-cream-100 transition-all hover:bg-forest-700 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Theme
        </button>
      </div>
    </div>
  );
}
