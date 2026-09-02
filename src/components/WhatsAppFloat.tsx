import { MessageCircle } from 'lucide-react';
import { useSettings } from '@/lib/settings-context';

export function WhatsAppFloat() {
  const { settings } = useSettings();

  return (
    <a
      href={`https://wa.me/${settings.whatsapp}?text=Hi%20${encodeURIComponent(settings.brand_name)}%2C%20I%27d%20like%20to%20know%20more%20about%20your%20properties.`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 transition-all hover:scale-110 hover:shadow-xl"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="absolute -top-1 -right-1 flex h-4 w-4">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-75"></span>
        <span className="relative inline-flex h-4 w-4 rounded-full bg-gold-400"></span>
      </span>
    </a>
  );
}
