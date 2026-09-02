import { useState, useEffect, useCallback } from 'react';
import { Building2, LogOut, LayoutDashboard, Home, ArrowRight, Lock, List, Loader2, Settings, Palette, MessageSquare, Bot } from 'lucide-react';
import { useAdminAuth } from '@/lib/admin-auth';
import { useRouter } from '@/lib/router';
import { supabase } from '@/lib/supabase';
import { useSettings } from '@/lib/settings-context';
import { ListingsManager } from '@/pages/admin/ListingsManager';
import { SiteSettingsManager } from '@/pages/admin/SiteSettingsManager';
import { ThemeCustomizer } from '@/pages/admin/ThemeCustomizer';
import { LeadsManager } from '@/pages/admin/LeadsManager';
import { AISettingsManager } from '@/pages/admin/AISettingsManager';

type AdminTab = 'overview' | 'listings' | 'leads' | 'settings' | 'theme' | 'ai';

export function AdminDashboardPage() {
  const { user, signOut } = useAdminAuth();
  const { navigate } = useRouter();
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState({ total: 0, sale: 0, rent: 0, cities: 0, leads: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const [listingsResult, leadsResult] = await Promise.all([
        supabase.from('listings').select('purpose, city'),
        supabase.from('leads').select('id', { count: 'exact', head: true }),
      ]);

      const listingRows = (listingsResult.data as { purpose: string; city: string }[]) ?? [];
      const uniqueCities = new Set(listingRows.map((r) => r.city));
      setStats({
        total: listingRows.length,
        sale: listingRows.filter((r) => r.purpose === 'sale').length,
        rent: listingRows.filter((r) => r.purpose === 'rent').length,
        cities: uniqueCities.size,
        leads: leadsResult.count ?? 0,
      });
    } catch {
      setStats({ total: 0, sale: 0, rent: 0, cities: 0, leads: 0 });
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const handleSignOut = async () => {
    await signOut();
    navigate({ name: 'home' });
  };

  const tabs: { id: AdminTab; label: string; icon: typeof List }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'listings', label: 'Listings', icon: List },
    { id: 'leads', label: 'Leads', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'ai', label: 'AI Settings', icon: Bot },
  ];

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Admin Header */}
      <header className="sticky top-0 z-40 border-b border-cream-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest-600 text-gold-400">
              <Building2 className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div>
              <span className="block font-display text-sm font-bold leading-none text-forest-700">{settings.brand_name}</span>
              <span className="block text-[10px] font-medium uppercase tracking-widest text-gold-500">Admin Panel</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium text-forest-400">Signed in as</p>
              <p className="text-sm font-semibold text-forest-700">{user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm font-medium text-forest-600 transition-colors hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-gold-400 text-forest-700'
                    : 'border-transparent text-forest-400 hover:text-forest-600'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === 'overview' ? (
          <div className="animate-fade-in">
            <div className="mb-8">
              <div className="flex items-center gap-2 text-gold-500">
                <LayoutDashboard className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Dashboard</span>
              </div>
              <h1 className="mt-2 font-display text-3xl font-bold text-forest-700">Welcome back, Admin</h1>
              <p className="mt-1 text-sm text-forest-400">
                Manage your properties, leads, and site settings from this control panel.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { label: 'Total Properties', value: loadingStats ? '—' : String(stats.total), hint: 'All listings' },
                { label: 'For Sale', value: loadingStats ? '—' : String(stats.sale), hint: 'Properties listed' },
                { label: 'For Rent', value: loadingStats ? '—' : String(stats.rent), hint: 'Rental listings' },
                { label: 'Cities Covered', value: loadingStats ? '—' : String(stats.cities), hint: 'Across Pakistan' },
                { label: 'New Leads', value: loadingStats ? '—' : String(stats.leads), hint: 'Contact inquiries' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl bg-white p-5 card-shadow">
                  <p className="text-xs font-semibold uppercase tracking-wider text-forest-400">{stat.label}</p>
                  <p className="mt-2 font-display text-3xl font-bold text-forest-700">{stat.value}</p>
                  <p className="mt-1 text-xs text-forest-300">{stat.hint}</p>
                </div>
              ))}
            </div>

            {/* Quick Access */}
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="rounded-xl bg-white p-6 card-shadow lg:col-span-2">
                <div className="flex items-center gap-2 text-forest-600">
                  <Lock className="h-5 w-5 text-gold-500" />
                  <h2 className="font-display text-lg font-bold">Management Modules</h2>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    onClick={() => setActiveTab('listings')}
                    className="flex items-start gap-2 rounded-lg bg-cream-50 p-3 text-sm text-forest-500 transition-colors hover:bg-cream-100"
                  >
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                    <span><strong>Property Management</strong> — add, edit, delete listings</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('leads')}
                    className="flex items-start gap-2 rounded-lg bg-cream-50 p-3 text-sm text-forest-500 transition-colors hover:bg-cream-100"
                  >
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                    <span><strong>Lead Management</strong> — view and respond to inquiries</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="flex items-start gap-2 rounded-lg bg-cream-50 p-3 text-sm text-forest-500 transition-colors hover:bg-cream-100"
                  >
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                    <span><strong>Site Settings</strong> — update branding and contact info</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('theme')}
                    className="flex items-start gap-2 rounded-lg bg-cream-50 p-3 text-sm text-forest-500 transition-colors hover:bg-cream-100"
                  >
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                    <span><strong>Theme Customization</strong> — change site colors</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('ai')}
                    className="flex items-start gap-2 rounded-lg bg-cream-50 p-3 text-sm text-forest-500 transition-colors hover:bg-cream-100"
                  >
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                    <span><strong>AI Settings</strong> — configure chatbot and API key</span>
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-forest-600 to-forest-700 p-6 text-cream-100 card-shadow">
                <h3 className="font-display text-lg font-bold text-cream-100">Quick Actions</h3>
                <p className="mt-1 text-sm text-cream-100/50">
                  Visit the live site to see how things look to your visitors.
                </p>
                <button
                  onClick={() => navigate({ name: 'home' })}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gold-400 px-4 py-2.5 text-sm font-semibold text-forest-700 transition-all hover:bg-gold-300"
                >
                  <Home className="h-4 w-4" />
                  View Live Site
                </button>
                <button
                  onClick={() => setActiveTab('listings')}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-cream-100/20 px-4 py-2.5 text-sm font-semibold text-cream-100 transition-all hover:bg-cream-100/10"
                >
                  <List className="h-4 w-4" />
                  Manage Listings
                </button>
              </div>
            </div>
          </div>
        ) : activeTab === 'listings' ? (
          <div className="animate-fade-in">
            <ListingsManager />
          </div>
        ) : activeTab === 'leads' ? (
          <div className="animate-fade-in">
            <LeadsManager />
          </div>
        ) : activeTab === 'settings' ? (
          <div className="animate-fade-in">
            <SiteSettingsManager />
          </div>
        ) : activeTab === 'theme' ? (
          <div className="animate-fade-in">
            <ThemeCustomizer />
          </div>
        ) : (
          <div className="animate-fade-in">
            <AISettingsManager />
          </div>
        )}
      </main>
    </div>
  );
}
