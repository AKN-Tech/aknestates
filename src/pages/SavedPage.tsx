import { Heart, Search, Trash2, MapPin, X, Loader2 } from 'lucide-react';
import { useSaved, type SavedItem } from '@/lib/saved-context';
import { PropertyCard } from '@/components/PropertyCard';
import { useRouter } from '@/lib/router';
import { useAllListings } from '@/lib/use-listings';

export function SavedPage() {
  const { saved, savedProperties, removeSaved } = useSaved();
  const { navigate } = useRouter();
  const { listings, loading } = useAllListings();

  const savedPropertyObjects = listings.filter((p) => savedProperties.includes(p.id));
  const savedSearches = saved.filter((s) => s.type === 'search');

  if (saved.length === 0) {
    return (
      <div className="animate-fade-in pt-20">
        <div className="bg-forest-600 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="font-display text-3xl font-bold text-cream-100 sm:text-4xl">Saved Properties</h1>
            <p className="mt-2 text-sm text-cream-100/60">Your favorite properties and searches in one place</p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center card-shadow">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cream-200 text-forest-300">
              <Heart className="h-10 w-10" />
            </div>
            <h2 className="mt-6 font-display text-2xl font-bold text-forest-700">No saved properties yet</h2>
            <p className="mt-2 max-w-md text-sm text-forest-400">
              Tap the heart icon on any property to save it here. You can also save your search filters for quick access later.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => navigate({ name: 'buy' })} className="btn-primary">
                <Search className="h-4 w-4" />
                Browse Properties
              </button>
              <button onClick={() => navigate({ name: 'rent' })} className="btn-outline">
                View Rentals
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pt-20">
      <div className="bg-forest-600 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-bold text-cream-100 sm:text-4xl">Saved Properties</h1>
          <p className="mt-2 text-sm text-cream-100/60">
            {savedPropertyObjects.length} saved {savedPropertyObjects.length === 1 ? 'property' : 'properties'}
            {savedSearches.length > 0 && ` · ${savedSearches.length} saved ${savedSearches.length === 1 ? 'search' : 'searches'}`}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Saved Searches */}
        {savedSearches.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 font-display text-xl font-bold text-forest-700">Saved Searches</h2>
            <div className="flex flex-wrap gap-3">
              {savedSearches.map((search) => (
                <div
                  key={search.searchLabel}
                  className="flex items-center gap-2 rounded-xl border border-cream-300 bg-white px-4 py-2.5 card-shadow"
                >
                  <Search className="h-4 w-4 text-gold-500" />
                  <span className="text-sm font-medium text-forest-600">{search.searchLabel}</span>
                  <button
                    onClick={() => removeSaved(search)}
                    className="rounded-md p-1 text-forest-300 transition-colors hover:bg-rose-50 hover:text-rose-500"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Saved Properties */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gold-400" />
          </div>
        ) : savedPropertyObjects.length > 0 ? (
          <div>
            <h2 className="mb-4 font-display text-xl font-bold text-forest-700">Favorite Properties</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {savedPropertyObjects.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl bg-white py-12 text-center card-shadow">
            <Heart className="h-8 w-8 text-forest-200" />
            <p className="mt-3 text-sm text-forest-400">No saved properties yet. Browse and tap the heart icon to save.</p>
            <button onClick={() => navigate({ name: 'buy' })} className="mt-4 btn-primary">
              Browse Properties
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
