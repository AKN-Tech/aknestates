import { Bed, Bath, MapPin, Maximize, Heart, MessageCircle, Eye } from 'lucide-react';
import type { Property } from '@/data/properties';
import { formatPKR, formatSize } from '@/lib/format';
import { useRouter } from '@/lib/router';
import { useSaved } from '@/lib/saved-context';

interface PropertyCardProps {
  property: Property;
  onQuickView?: (property: Property) => void;
}

export function PropertyCard({ property, onQuickView }: PropertyCardProps) {
  const { navigate } = useRouter();
  const { isSaved, toggleProperty } = useSaved();
  const saved = isSaved(property.id);

  const priceLabel = property.purpose === 'rent' && property.rent
    ? `${formatPKR(property.rent)}/mo`
    : formatPKR(property.price);

  const whatsappText = encodeURIComponent(
    `Hi AKN Estates, I'm interested in "${property.title}" (${property.area}, ${property.city}). Price: ${priceLabel}. Could you share more details?`,
  );

  return (
    <div className="group overflow-hidden rounded-xl bg-white card-shadow transition-all duration-300 hover:card-shadow-hover hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <span className={`badge ${property.purpose === 'rent' ? 'bg-forest-500 text-cream-100' : 'bg-gold-400 text-forest-700'}`}>
            {property.purpose === 'rent' ? 'For Rent' : 'For Sale'}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleProperty(property.id);
            }}
            className={`flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all ${
              saved ? 'bg-rose-500 text-white' : 'bg-white/80 text-forest-600 hover:bg-white'
            }`}
            aria-label={saved ? 'Remove from saved' : 'Save property'}
          >
            <Heart className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
          </button>
        </div>
        {property.furnished !== undefined && (
          <span className="absolute bottom-3 left-3 badge bg-forest-600/90 text-cream-100 backdrop-blur-md">
            {property.furnished ? 'Furnished' : 'Unfurnished'}
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-semibold leading-snug text-forest-700 line-clamp-1">
            {property.title}
          </h3>
        </div>
        <div className="mt-1.5 flex items-center gap-1 text-sm text-forest-400">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-gold-400" />
          <span className="line-clamp-1">{property.area}, {property.city}</span>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-display text-xl font-bold text-forest-600">{priceLabel}</span>
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-xs text-forest-400">
          <Maximize className="h-3.5 w-3.5 text-gold-400" />
          <span>{formatSize(property.marla, property.sqft)}</span>
        </div>

        <div className="mt-3 flex items-center gap-4 border-t border-cream-200 pt-3 text-sm text-forest-500">
          {property.beds > 0 && (
            <span className="flex items-center gap-1.5">
              <Bed className="h-4 w-4 text-forest-400" />
              {property.beds} Beds
            </span>
          )}
          {property.baths > 0 && (
            <span className="flex items-center gap-1.5">
              <Bath className="h-4 w-4 text-forest-400" />
              {property.baths} Baths
            </span>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onQuickView ? onQuickView(property) : navigate({ name: 'property', id: property.id })}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-forest-50 px-3 py-2 text-xs font-semibold text-forest-600 transition-colors hover:bg-forest-100"
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </button>
          <a
            href={`https://wa.me/923001234567?text=${whatsappText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-2 text-xs font-semibold text-white transition-all hover:brightness-110"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
