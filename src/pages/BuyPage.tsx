import { useState, useMemo } from 'react';
import { SlidersHorizontal, X, MapPin, Search, ChevronDown, Loader2 } from 'lucide-react';
import { CITIES, PROPERTY_TYPES } from '@/data/properties';
import { formatPKR } from '@/lib/format';
import { PropertyCard } from '@/components/PropertyCard';
import { useSaved } from '@/lib/saved-context';
import { useListings } from '@/lib/use-listings';

type SortOption = 'relevance' | 'price-low' | 'price-high' | 'newest';

interface Filters {
  city: string;
  type: string;
  minPrice: string;
  maxPrice: string;
  beds: string;
  baths: string;
  sort: SortOption;
}

const PRICE_OPTIONS = [
  { label: 'No Min', value: '' },
  { label: 'PKR 20 Lakh', value: '2000000' },
  { label: 'PKR 50 Lakh', value: '5000000' },
  { label: 'PKR 1 Crore', value: '10000000' },
  { label: 'PKR 2 Crore', value: '20000000' },
  { label: 'PKR 5 Crore', value: '50000000' },
  { label: 'PKR 10 Crore', value: '100000000' },
];

const MAX_PRICE_OPTIONS = [
  { label: 'No Max', value: '' },
  { label: 'PKR 50 Lakh', value: '5000000' },
  { label: 'PKR 1 Crore', value: '10000000' },
  { label: 'PKR 2 Crore', value: '20000000' },
  { label: 'PKR 5 Crore', value: '50000000' },
  { label: 'PKR 10 Crore', value: '100000000' },
  { label: 'PKR 20 Crore', value: '200000000' },
];

export function BuyPage() {
  const { addSearch } = useSaved();
  const { listings, loading } = useListings('sale');
  const [filters, setFilters] = useState<Filters>({
    city: '',
    type: '',
    minPrice: '',
    maxPrice: '',
    beds: '',
    baths: '',
    sort: 'relevance',
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = listings;

    if (filters.city) result = result.filter((p) => p.city === filters.city);
    if (filters.type) result = result.filter((p) => p.type === filters.type);
    if (filters.minPrice) result = result.filter((p) => p.price >= parseInt(filters.minPrice));
    if (filters.maxPrice) result = result.filter((p) => p.price <= parseInt(filters.maxPrice));
    if (filters.beds) result = result.filter((p) => p.beds >= parseInt(filters.beds));
    if (filters.baths) result = result.filter((p) => p.baths >= parseInt(filters.baths));

    switch (filters.sort) {
      case 'price-low':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result = [...result].sort((a, b) => b.yearBuilt - a.yearBuilt);
        break;
    }

    return result;
  }, [filters, listings]);

  const activeFilterCount = Object.values(filters).filter((v) => v !== '' && v !== 'relevance').length;

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({ city: '', type: '', minPrice: '', maxPrice: '', beds: '', baths: '', sort: 'relevance' });
  };

  const handleSaveSearch = () => {
    const parts: string[] = [];
    if (filters.city) parts.push(filters.city);
    if (filters.type) parts.push(filters.type);
    if (filters.beds) parts.push(`${filters.beds}+ bed`);
    const label = parts.length > 0 ? parts.join(', ') : 'All properties for sale';
    addSearch(`Buy: ${label}`);
  };

  const FilterPanel = () => (
    <div className="space-y-5">
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">City</label>
        <select
          value={filters.city}
          onChange={(e) => updateFilter('city', e.target.value)}
          className="select-field"
        >
          <option value="">All Cities</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">Property Type</label>
        <select
          value={filters.type}
          onChange={(e) => updateFilter('type', e.target.value)}
          className="select-field"
        >
          <option value="">All Types</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">Min Price</label>
          <select
            value={filters.minPrice}
            onChange={(e) => updateFilter('minPrice', e.target.value)}
            className="select-field"
          >
            {PRICE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">Max Price</label>
          <select
            value={filters.maxPrice}
            onChange={(e) => updateFilter('maxPrice', e.target.value)}
            className="select-field"
          >
            {MAX_PRICE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">Bedrooms</label>
          <select
            value={filters.beds}
            onChange={(e) => updateFilter('beds', e.target.value)}
            className="select-field"
          >
            <option value="">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5+</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">Bathrooms</label>
          <select
            value={filters.baths}
            onChange={(e) => updateFilter('baths', e.target.value)}
            className="select-field"
          >
            <option value="">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
        </div>
      </div>
      <button
        onClick={handleSaveSearch}
        className="w-full rounded-lg border border-forest-600/20 bg-forest-50 px-4 py-2.5 text-sm font-medium text-forest-600 transition-colors hover:bg-forest-100"
      >
        Save This Search
      </button>
      {activeFilterCount > 0 && (
        <button
          onClick={resetFilters}
          className="w-full text-center text-sm font-medium text-gold-500 transition-colors hover:text-gold-600"
        >
          Clear All Filters ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="animate-fade-in pt-20">
      {/* Page Header */}
      <div className="bg-forest-600 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-bold text-cream-100 sm:text-4xl">Buy Property</h1>
          <p className="mt-2 text-sm text-cream-100/60">
            Browse {listings.length}+ properties for sale across Pakistan
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24 rounded-xl bg-white p-5 card-shadow">
              <div className="mb-5 flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-forest-600" />
                <h2 className="font-display text-lg font-semibold text-forest-700">Filters</h2>
              </div>
              <FilterPanel />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort Bar */}
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="flex items-center gap-2 rounded-lg border border-cream-300 bg-white px-4 py-2.5 text-sm font-medium text-forest-600 lg:hidden"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-400 text-xs font-bold text-forest-700">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <p className="text-sm text-forest-400">
                  <span className="font-semibold text-forest-700">{filtered.length}</span> properties found
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden text-sm text-forest-400 sm:inline">Sort by:</span>
                <select
                  value={filters.sort}
                  onChange={(e) => updateFilter('sort', e.target.value as SortOption)}
                  className="select-field w-auto"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>

            {/* Results Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-gold-400" />
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl bg-white py-20 text-center card-shadow">
                <Search className="h-12 w-12 text-forest-200" />
                <h3 className="mt-4 font-display text-lg font-semibold text-forest-700">No properties found</h3>
                <p className="mt-1 text-sm text-forest-400">Try adjusting your filters to see more results</p>
                <button onClick={resetFilters} className="mt-4 btn-primary">
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-forest-700/50 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute inset-y-0 right-0 w-80 max-w-[85vw] animate-slide-down overflow-y-auto bg-cream-100 p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-forest-700">Filters</h2>
              <button onClick={() => setShowMobileFilters(false)} className="rounded-lg p-2 text-forest-400 hover:bg-forest-50">
                <X className="h-5 w-5" />
              </button>
            </div>
            <FilterPanel />
            <button
              onClick={() => setShowMobileFilters(false)}
              className="mt-6 w-full btn-primary"
            >
              Show {filtered.length} Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
