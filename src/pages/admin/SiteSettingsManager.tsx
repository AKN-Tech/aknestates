import { useState, useEffect } from 'react';
import { Save, Loader2, AlertCircle, Upload, Building2, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSettings, type SiteSettings } from '@/lib/settings-context';

type FormState = Omit<SiteSettings, never>;

export function SiteSettingsManager() {
  const { settings, refresh } = useSettings();
  const [form, setForm] = useState<FormState>(settings);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogoUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `logo-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(filePath, file, { contentType: file.type });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage
        .from('site-assets')
        .getPublicUrl(filePath);
      update('logo_url', urlData.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const { error: updateError } = await supabase
        .from('site_settings')
        .update({
          brand_name: form.brand_name,
          brand_short: form.brand_short,
          logo_url: form.logo_url,
          phone: form.phone,
          email: form.email,
          whatsapp: form.whatsapp,
          office_address: form.office_address,
          office_hours_weekday: form.office_hours_weekday,
          office_hours_saturday: form.office_hours_saturday,
          office_hours_sunday: form.office_hours_sunday,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1);
      if (updateError) throw updateError;
      await refresh();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-forest-700">Site Settings</h2>
        <p className="mt-1 text-sm text-forest-400">Update your brand, contact info, and office hours</p>
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
          <span>Settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Branding Section */}
        <div className="rounded-xl bg-white p-6 card-shadow">
          <h3 className="mb-4 font-display text-lg font-bold text-forest-700">Branding</h3>

          {/* Logo Upload */}
          <div className="mb-5">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">Logo</label>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-forest-600 text-gold-400">
                {form.logo_url ? (
                  <img src={form.logo_url} alt="Logo" className="h-full w-full object-contain" />
                ) : (
                  <Building2 className="h-7 w-7" strokeWidth={2.5} />
                )}
              </div>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-cream-300 px-4 py-2.5 text-sm font-medium text-forest-600 transition-colors hover:bg-cream-50">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? 'Uploading...' : 'Upload Logo'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
                />
              </label>
              {form.logo_url && (
                <button
                  type="button"
                  onClick={() => update('logo_url', '')}
                  className="text-sm text-rose-500 hover:text-rose-600"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">Brand Name *</label>
              <input required value={form.brand_name} onChange={(e) => update('brand_name', e.target.value)} className="input-field" placeholder="AKN Estates" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">Brand Short (Logo Text) *</label>
              <input required value={form.brand_short} onChange={(e) => update('brand_short', e.target.value)} className="input-field" placeholder="AKN" />
            </div>
          </div>
        </div>

        {/* Contact Info Section */}
        <div className="rounded-xl bg-white p-6 card-shadow">
          <h3 className="mb-4 font-display text-lg font-bold text-forest-700">Contact Information</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">Phone *</label>
              <input required value={form.phone} onChange={(e) => update('phone', e.target.value)} className="input-field" placeholder="+92 300 1234567" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">Email *</label>
              <input required type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="input-field" placeholder="info@example.com" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">WhatsApp Number *</label>
              <input required value={form.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} className="input-field" placeholder="923001234567" />
              <p className="mt-1 text-xs text-forest-300">Country code + number, no + or spaces</p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">Office Address *</label>
              <input required value={form.office_address} onChange={(e) => update('office_address', e.target.value)} className="input-field" placeholder="Street address, City, Pakistan" />
            </div>
          </div>
        </div>

        {/* Office Hours Section */}
        <div className="rounded-xl bg-white p-6 card-shadow">
          <h3 className="mb-4 font-display text-lg font-bold text-forest-700">Office Hours</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">Mon – Fri</label>
              <input value={form.office_hours_weekday} onChange={(e) => update('office_hours_weekday', e.target.value)} className="input-field" placeholder="9 AM – 7 PM" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">Saturday</label>
              <input value={form.office_hours_saturday} onChange={(e) => update('office_hours_saturday', e.target.value)} className="input-field" placeholder="10 AM – 5 PM" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">Sunday</label>
              <input value={form.office_hours_sunday} onChange={(e) => update('office_hours_sunday', e.target.value)} className="input-field" placeholder="Closed" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-lg bg-forest-600 px-6 py-2.5 text-sm font-semibold text-cream-100 transition-all hover:bg-forest-700 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
