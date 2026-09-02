import { useState, useEffect } from 'react';
import { Menu, X, Heart, Building2, ChevronDown } from 'lucide-react';
import { useRouter, type Route } from '@/lib/router';
import { useSaved } from '@/lib/saved-context';
import { useSettings } from '@/lib/settings-context';

const NAV_ITEMS: { label: string; route: Route }[] = [
  { label: 'Home', route: { name: 'home' } },
  { label: 'Buy', route: { name: 'buy' } },
  { label: 'Rent', route: { name: 'rent' } },
  { label: 'Sell', route: { name: 'sell' } },
  { label: 'Calculator', route: { name: 'calculator' } },
  { label: 'Saved', route: { name: 'saved' } },
  { label: 'Contact', route: { name: 'contact' } },
];

export function Header() {
  const { route, navigate } = useRouter();
  const { savedProperties } = useSaved();
  const { settings } = useSettings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const isActive = (item: Route) => route.name === item.name;

  const brandWords = settings.brand_name.split(' ');
  const brandShort = settings.brand_short || brandWords[0] || 'Brand';
  const brandSub = brandWords.slice(1).join(' ') || 'Estates';

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-forest-600/95 py-2 shadow-lg shadow-forest-600/20 backdrop-blur-md' : 'bg-transparent py-4'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate({ name: 'home' })}
          className="flex items-center gap-2 transition-transform hover:scale-105"
        >
          {settings.logo_url ? (
            <img src={settings.logo_url} alt={settings.brand_name} className="h-10 w-10 rounded-lg object-contain" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-400 text-forest-700 shadow-md">
              <Building2 className="h-5 w-5" strokeWidth={2.5} />
            </div>
          )}
          <div className="text-left">
            <span className="block font-display text-lg font-bold leading-none text-cream-100">{brandShort}</span>
            <span className="block text-[10px] font-medium uppercase tracking-widest text-gold-300">{brandSub}</span>
          </div>
        </button>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.route)}
              className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(item.route)
                  ? 'text-gold-300'
                  : 'text-cream-100/80 hover:text-cream-100'
              }`}
            >
              {item.label}
              {isActive(item.route) && (
                <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gold-400" />
              )}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate({ name: 'saved' })}
            className="relative hidden items-center gap-1.5 rounded-lg border border-cream-100/20 px-3 py-2 text-sm font-medium text-cream-100 transition-colors hover:bg-cream-100/10 sm:flex"
          >
            <Heart className="h-4 w-4" />
            <span>Saved</span>
            {savedProperties.length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-400 text-xs font-bold text-forest-700">
                {savedProperties.length}
              </span>
            )}
          </button>
          <button
            onClick={() => navigate({ name: 'contact' })}
            className="hidden rounded-lg bg-gold-400 px-4 py-2 text-sm font-semibold text-forest-700 transition-all hover:bg-gold-300 hover:shadow-lg hover:shadow-gold-400/30 sm:block"
          >
            List Property
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-cream-100 transition-colors hover:bg-cream-100/10 lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="absolute inset-x-0 top-full mx-3 mt-1 animate-slide-down rounded-xl bg-forest-700 p-3 shadow-xl lg:hidden">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                navigate(item.route);
                setMobileOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive(item.route) ? 'bg-gold-400/15 text-gold-300' : 'text-cream-100/80 hover:bg-cream-100/5'
              }`}
            >
              {item.label}
              {item.label === 'Saved' && savedProperties.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-400 text-xs font-bold text-forest-700">
                  {savedProperties.length}
                </span>
              )}
              {isActive(item.route) && <ChevronDown className="h-4 w-4 -rotate-90" />}
            </button>
          ))}
          <button
            onClick={() => {
              navigate({ name: 'contact' });
              setMobileOpen(false);
            }}
            className="mt-2 w-full rounded-lg bg-gold-400 px-4 py-2.5 text-sm font-semibold text-forest-700"
          >
            List Property
          </button>
        </div>
      )}
    </header>
  );
}
