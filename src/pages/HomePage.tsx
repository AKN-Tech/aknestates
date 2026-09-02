import { useState } from 'react';
import { Search, Home, Building, LandPlot, Store, Trees, TrendingUp, MapPin, ArrowRight, Quote, Loader2 } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { PROPERTY_TYPES, PROPERTY_TYPE_IMAGES, HERO_IMAGE } from '@/data/properties';
import { formatPKR } from '@/lib/format';
import { PropertyCard } from '@/components/PropertyCard';
import { useFeaturedListings, useAllListings } from '@/lib/use-listings';

const TYPE_ICONS: Record<string, typeof Home> = {
  House: Home,
  Flat: Building,
  Plot: LandPlot,
  Commercial: Store,
  Farmhouse: Trees,
};

export function HomePage() {
  const { navigate } = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { listings: featured, loading: featuredLoading } = useFeaturedListings();
  const { listings: allListings } = useAllListings();

  const typeCounts = PROPERTY_TYPES.reduce(
    (acc, type) => {
      acc[type] = allListings.filter((p) => p.type === type).length;
      return acc;
    },
    {} as Record<string, number>,
  );

  const stats = {
    totalListings: allListings.length,
    citiesCovered: new Set(allListings.map((p) => p.city)).size,
    avgPricePerMarla: allListings.length > 0
      ? Math.round(allListings.reduce((sum, p) => sum + (p.marla > 0 ? p.price / p.marla : 0), 0) / allListings.filter((p) => p.marla > 0).length || 1)
      : 0,
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ name: 'buy' });
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative min-h-[88vh] overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMAGE} alt="City skyline" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-forest-700/70 via-forest-700/50 to-forest-700/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-forest-700/60 to-transparent" />
        </div>

        <div className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-center px-4 pt-20 pb-12 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-gold-400/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-gold-300 backdrop-blur-sm">
              <MapPin className="h-3.5 w-3.5" />
              Pakistan's Trusted Property Marketplace
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-cream-100 sm:text-5xl lg:text-6xl text-balance">
              Apka Aghla Ghar,
              <br />
              <span className="text-gold-300">Apka Sheher</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-cream-100/80 sm:text-lg">
              Browse thousands of homes, plots, and commercial properties across Pakistan. From DHA Lahore to Clifton Karachi — find your perfect property today.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mt-8">
              <div className="flex flex-col gap-3 rounded-2xl bg-white/95 p-3 shadow-2xl backdrop-blur-md sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-forest-300" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Try Lahore, DHA, or 5 Marla house"
                    className="w-full rounded-lg border-0 bg-cream-50 py-3.5 pl-12 pr-4 text-sm text-forest-700 placeholder:text-forest-300 focus:outline-none focus:ring-2 focus:ring-gold-400/30"
                  />
                </div>
                <select
                  className="rounded-lg border-0 bg-cream-50 px-4 py-3.5 text-sm font-medium text-forest-600 focus:outline-none focus:ring-2 focus:ring-gold-400/30 sm:w-44"
                  defaultValue=""
                >
                  <option value="" disabled>Property Type</option>
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <button type="submit" className="btn-primary sm:px-8">
                  <Search className="h-4 w-4" />
                  Search
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs text-cream-100/50">Popular:</span>
                {['DHA Lahore', 'Clifton Karachi', '5 Marla', 'F-7 Islamabad'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => navigate({ name: 'buy' })}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs text-cream-100/7 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-cream-100"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative -mt-px bg-forest-600">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { label: 'Total Listings', value: stats.totalListings.toLocaleString(), icon: Building },
              { label: 'Cities Covered', value: String(stats.citiesCovered), icon: MapPin },
              { label: 'Avg Price / Marla', value: stats.avgPricePerMarla > 0 ? formatPKR(stats.avgPricePerMarla) : '—', icon: TrendingUp },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-4 rounded-xl bg-forest-500/40 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gold-400/15 text-gold-300">
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-cream-100">{stat.value}</p>
                  <p className="text-sm text-cream-100/50">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Property Type */}
      <section className="bg-cream-100 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold text-forest-700">Browse by Property Type</h2>
              <p className="mt-1.5 text-sm text-forest-400">Find exactly what you're looking for</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {PROPERTY_TYPES.map((type) => {
              const Icon = TYPE_ICONS[type];
              return (
                <button
                  key={type}
                  onClick={() => navigate({ name: 'buy' })}
                  className="group relative overflow-hidden rounded-xl bg-white card-shadow transition-all hover:card-shadow-hover hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={PROPERTY_TYPE_IMAGES[type]}
                      alt={type}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest-700/80 via-forest-700/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4 text-left">
                      <div className="flex items-center gap-2 text-gold-300">
                        <Icon className="h-5 w-5" />
                        <span className="text-xs font-medium text-cream-100/60">{typeCounts[type]} listings</span>
                      </div>
                      <h3 className="mt-1 font-display text-lg font-bold text-cream-100">{type}</h3>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="bg-cream-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold text-forest-700">Featured Listings</h2>
              <p className="mt-1.5 text-sm text-forest-400">Handpicked properties from across Pakistan</p>
            </div>
            <button
              onClick={() => navigate({ name: 'buy' })}
              className="hidden items-center gap-1.5 text-sm font-semibold text-gold-500 transition-colors hover:text-gold-600 sm:flex"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {featuredLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-gold-400" />
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl bg-white py-16 text-center card-shadow">
              <Home className="h-12 w-12 text-forest-200" />
              <h3 className="mt-4 font-display text-lg font-semibold text-forest-700">No featured listings yet</h3>
              <p className="mt-1 text-sm text-forest-400">New properties will appear here once they're added</p>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <button onClick={() => navigate({ name: 'buy' })} className="btn-outline">
              View All Properties
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-forest-600 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-gradient-to-r from-forest-500 to-forest-700 p-8 lg:flex-row lg:p-12">
            <div className="max-w-xl text-center lg:text-left">
              <h2 className="font-display text-2xl font-bold text-cream-100 sm:text-3xl">
                Want to sell or rent your property?
              </h2>
              <p className="mt-2 text-sm text-cream-100/60">
                Get a free instant valuation and reach thousands of potential buyers across Pakistan.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button onClick={() => navigate({ name: 'sell' })} className="btn-primary">
                Get Free Valuation
                <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => navigate({ name: 'contact' })} className="btn-outline text-cream-100 border-cream-100/30 hover:bg-cream-100/10 hover:text-cream-100">
                Contact Our Team
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="bg-cream-100 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Quote className="mx-auto h-10 w-10 text-gold-400" />
          <p className="mt-4 font-display text-xl font-medium leading-relaxed text-forest-600 sm:text-2xl">
            "AKN Estates helped me find my dream home in DHA Lahore in just two weeks. Their team was professional, transparent, and made the entire process effortless."
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gold-400 flex items-center justify-center font-display font-bold text-forest-700">AK</div>
            <div className="text-left">
              <p className="font-semibold text-forest-700">Ahmed Khan</p>
              <p className="text-sm text-forest-400">Homeowner, Lahore</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
