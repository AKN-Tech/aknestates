import { useState, useMemo } from 'react';
import { Calculator, TrendingUp, ArrowRight, Check, Phone } from 'lucide-react';
import { CITIES, PROPERTY_TYPES, CONDITIONS, type PropertyType, type Condition } from '@/data/properties';
import { formatPKR, formatPKRShort } from '@/lib/format';
import { useRouter } from '@/lib/router';

const CITY_MULTIPLIERS: Record<string, number> = {
  Lahore: 1.0,
  Karachi: 0.95,
  Islamabad: 1.35,
  Rawalpindi: 0.75,
  Faisalabad: 0.55,
};

const TYPE_MULTIPLIERS: Record<PropertyType, number> = {
  House: 1.0,
  Flat: 0.85,
  Plot: 0.65,
  Commercial: 1.6,
  Farmhouse: 1.2,
};

const CONDITION_MULTIPLIERS: Record<Condition, number> = {
  New: 1.15,
  Excellent: 1.05,
  Good: 0.95,
  'Needs Renovation': 0.75,
};

const BASE_PRICE_PER_MARLA = 8500000;

export function SellPage() {
  const { navigate } = useRouter();
  const [city, setCity] = useState('Lahore');
  const [area, setArea] = useState('5');
  const [areaUnit, setAreaUnit] = useState<'Marla' | 'Kanal'>('Marla');
  const [type, setType] = useState<PropertyType>('House');
  const [yearBuilt, setYearBuilt] = useState('2020');
  const [condition, setCondition] = useState<Condition>('Good');

  const estimate = useMemo(() => {
    const marlaCount = areaUnit === 'Kanal' ? parseFloat(area) * 20 : parseFloat(area) || 0;
    const cityMult = CITY_MULTIPLIERS[city] || 1.0;
    const typeMult = TYPE_MULTIPLIERS[type] || 1.0;
    const conditionMult = CONDITION_MULTIPLIERS[condition] || 1.0;
    const age = Math.max(0, 2025 - parseInt(yearBuilt || '2025'));
    const ageFactor = Math.max(0.7, 1 - age * 0.01);

    const baseValue = BASE_PRICE_PER_MARLA * marlaCount * cityMult * typeMult * conditionMult * ageFactor;
    const low = Math.round(baseValue * 0.92);
    const high = Math.round(baseValue * 1.08);
    const perMarla = marlaCount > 0 ? Math.round(baseValue / marlaCount) : 0;

    return { low, high, perMarla, marlaCount };
  }, [city, area, areaUnit, type, yearBuilt, condition]);

  return (
    <div className="animate-fade-in pt-20">
      {/* Hero */}
      <div className="bg-forest-600 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-bold text-cream-100 sm:text-4xl">Sell Your Property</h1>
          <p className="mt-2 text-sm text-cream-100/60">
            Get an instant estimate and connect with our team for a professional valuation
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Estimate Tool */}
          <div className="rounded-2xl bg-white p-6 card-shadow sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-400/15 text-gold-500">
                <Calculator className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-forest-700">Instant Property Estimate</h2>
                <p className="text-sm text-forest-400">Fill in the details for a live price range</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">City</label>
                <select value={city} onChange={(e) => setCity(e.target.value)} className="select-field">
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">Area</label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="input-field flex-1"
                    placeholder="Enter area"
                  />
                  <div className="flex rounded-lg border border-cream-300 bg-white p-1">
                    {(['Marla', 'Kanal'] as const).map((unit) => (
                      <button
                        key={unit}
                        onClick={() => setAreaUnit(unit)}
                        className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                          areaUnit === unit ? 'bg-forest-600 text-cream-100' : 'text-forest-400 hover:text-forest-600'
                        }`}
                      >
                        {unit}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">Property Type</label>
                <select value={type} onChange={(e) => setType(e.target.value as PropertyType)} className="select-field">
                  {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">Year Built</label>
                  <input
                    type="number"
                    min="1950"
                    max="2025"
                    value={yearBuilt}
                    onChange={(e) => setYearBuilt(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest-400">Condition</label>
                  <select value={condition} onChange={(e) => setCondition(e.target.value as Condition)} className="select-field">
                    {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Live Estimate Result */}
          <div className="flex flex-col">
            <div className="rounded-2xl bg-gradient-to-br from-forest-600 to-forest-700 p-6 text-cream-100 card-shadow sm:p-8">
              <div className="flex items-center gap-2 text-gold-300">
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">Estimated Value</span>
              </div>

              <div className="mt-6">
                <div className="flex items-end gap-2">
                  <span className="font-display text-4xl font-bold text-cream-100 sm:text-5xl">
                    {formatPKR(estimate.low)}
                  </span>
                  <span className="pb-2 text-2xl text-cream-100/40">—</span>
                  <span className="font-display text-4xl font-bold text-cream-100 sm:text-5xl">
                    {formatPKR(estimate.high)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-cream-100/50">
                  Based on {estimate.marlaCount} {estimate.marlaCount === 1 ? 'Marla' : 'Marla'} in {city}
                </p>
              </div>

              {/* Price bar visualization */}
              <div className="mt-6">
                <div className="flex justify-between text-xs text-cream-100/40">
                  <span>Low: {formatPKRShort(estimate.low)}</span>
                  <span>High: {formatPKRShort(estimate.high)}</span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-forest-500">
                  <div className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-300" style={{ width: '100%' }} />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-forest-500 pt-6">
                <div>
                  <p className="text-xs text-cream-100/40">Est. Price / Marla</p>
                  <p className="mt-1 font-display text-lg font-semibold text-gold-300">{formatPKR(estimate.perMarla)}</p>
                </div>
                <div>
                  <p className="text-xs text-cream-100/40">Property Type</p>
                  <p className="mt-1 font-display text-lg font-semibold text-cream-100">{type}</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={() => navigate({ name: 'contact' })}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold-400 px-6 py-3.5 text-sm font-semibold text-forest-700 transition-all hover:bg-gold-300 hover:shadow-lg hover:shadow-gold-400/30"
                >
                  Get a Free Valuation from Our Team
                  <ArrowRight className="h-4 w-4" />
                </button>
                <a
                  href="https://wa.me/923001234567?text=Hi%20AKN%20Estates%2C%20I%27d%20like%20a%20free%20property%20valuation."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-cream-100/20 px-6 py-3.5 text-sm font-semibold text-cream-100 transition-colors hover:bg-cream-100/10"
                >
                  <Phone className="h-4 w-4" />
                  Talk to an Agent
                </a>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-cream-200/50 p-5">
              <h3 className="text-sm font-semibold text-forest-700">Why sell with AKN Estates?</h3>
              <ul className="mt-3 space-y-2">
                {[
                  'Free professional property valuation',
                  'Reach 12,000+ active buyers across Pakistan',
                  'Dedicated agent support throughout the process',
                  'Professional photography & listing creation',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-forest-500">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
