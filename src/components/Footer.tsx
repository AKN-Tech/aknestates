import { Building2, Phone, Mail, MapPin, Facebook, Instagram, Linkedin, Twitter, MessageCircle } from 'lucide-react';
import { useRouter, type Route } from '@/lib/router';
import { useSettings } from '@/lib/settings-context';

const POPULAR_CITIES = [
  'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Peshawar', 'Quetta', 'Gujranwala', 'Hyderabad',
];

const QUICK_LINKS: { label: string; route: Route }[] = [
  { label: 'Buy Property', route: { name: 'buy' } },
  { label: 'Rent Property', route: { name: 'rent' } },
  { label: 'Sell Your Home', route: { name: 'sell' } },
  { label: 'Installment Calculator', route: { name: 'calculator' } },
  { label: 'Saved Properties', route: { name: 'saved' } },
  { label: 'Contact Us', route: { name: 'contact' } },
];

export function Footer() {
  const { navigate } = useRouter();
  const { settings } = useSettings();

  const brandWords = settings.brand_name.split(' ');
  const brandShort = settings.brand_short || brandWords[0] || 'Brand';
  const brandSub = brandWords.slice(1).join(' ') || 'Estates';

  return (
    <footer className="bg-forest-700 text-cream-100">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2">
              {settings.logo_url ? (
                <img src={settings.logo_url} alt={settings.brand_name} className="h-10 w-10 rounded-lg object-contain" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-400 text-forest-700">
                  <Building2 className="h-5 w-5" strokeWidth={2.5} />
                </div>
              )}
              <div>
                <span className="block font-display text-lg font-bold leading-none text-cream-100">{brandShort}</span>
                <span className="block text-[10px] font-medium uppercase tracking-widest text-gold-300">{brandSub}</span>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-cream-100/60">
              Pakistan's trusted real estate marketplace. Find your next home, plot, or commercial property with confidence.
            </p>
            <div className="mt-5 flex gap-3">
              {[Facebook, Instagram, Linkedin, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest-600 text-cream-100/70 transition-colors hover:bg-gold-400 hover:text-forest-700"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-300">Quick Links</h3>
            <ul className="mt-4 space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.route)}
                    className="text-sm text-cream-100/60 transition-colors hover:text-gold-300"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-300">Popular Cities</h3>
            <ul className="mt-4 grid grid-cols-2 gap-y-2.5">
              {POPULAR_CITIES.map((city) => (
                <li key={city}>
                  <button
                    onClick={() => navigate({ name: 'buy' })}
                    className="text-sm text-cream-100/60 transition-colors hover:text-gold-300"
                  >
                    {city}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-300">Get in Touch</h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-sm text-cream-100/60">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                <span>{settings.office_address}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-cream-100/60">
                <Phone className="h-4 w-4 shrink-0 text-gold-400" />
                <a href={`tel:${settings.phone}`} className="transition-colors hover:text-gold-300">{settings.phone}</a>
              </li>
              <li className="flex items-center gap-3 text-sm text-cream-100/60">
                <Mail className="h-4 w-4 shrink-0 text-gold-400" />
                <a href={`mailto:${settings.email}`} className="transition-colors hover:text-gold-300">{settings.email}</a>
              </li>
            </ul>
            <a
              href={`https://wa.me/${settings.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110"
            >
              <MessageCircle className="h-4 w-4" />
              Chat on WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-12 border-t border-forest-600 pt-6">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-cream-100/40">
              © 2026 {settings.brand_name}. All rights reserved.
            </p>
            <div className="flex gap-4 text-xs text-cream-100/40">
              <a href="#" onClick={(e) => e.preventDefault()} className="transition-colors hover:text-gold-300">Privacy Policy</a>
              <a href="#" onClick={(e) => e.preventDefault()} className="transition-colors hover:text-gold-300">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
