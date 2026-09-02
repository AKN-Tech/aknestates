import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { applyTheme } from '@/lib/theme';

export interface SiteSettings {
  brand_name: string;
  brand_short: string;
  logo_url: string;
  phone: string;
  email: string;
  whatsapp: string;
  office_address: string;
  office_hours_weekday: string;
  office_hours_saturday: string;
  office_hours_sunday: string;
  primary_color: string;
  accent_color: string;
  background_color: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  brand_name: 'AKN Estates',
  brand_short: 'AKN',
  logo_url: '',
  phone: '+92 300 1234567',
  email: 'info@aknestates.pk',
  whatsapp: '923001234567',
  office_address: '53-G, Gulberg III, Lahore, Pakistan',
  office_hours_weekday: '9 AM – 7 PM',
  office_hours_saturday: '10 AM – 5 PM',
  office_hours_sunday: 'Closed',
  primary_color: '#0F3D2E',
  accent_color: '#C9973D',
  background_color: '#F5F1E8',
};

interface SettingsContextValue {
  settings: SiteSettings;
  loading: boolean;
  refresh: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        const s = data as SiteSettings;
        setSettings(s);
        applyTheme(s.primary_color, s.accent_color, s.background_color);
      } else {
        applyTheme(
          DEFAULT_SETTINGS.primary_color,
          DEFAULT_SETTINGS.accent_color,
          DEFAULT_SETTINGS.background_color,
        );
      }
    } catch {
      setSettings(DEFAULT_SETTINGS);
      applyTheme(
        DEFAULT_SETTINGS.primary_color,
        DEFAULT_SETTINGS.accent_color,
        DEFAULT_SETTINGS.background_color,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <SettingsContext.Provider value={{ settings, loading, refresh }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
