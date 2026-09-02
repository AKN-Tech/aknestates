type RGB = [number, number, number];

function hexToRgb(hex: string): RGB {
  const cleaned = hex.replace('#', '');
  return [
    parseInt(cleaned.slice(0, 2), 16),
    parseInt(cleaned.slice(2, 4), 16),
    parseInt(cleaned.slice(4, 6), 16),
  ];
}

function toCssValue(rgb: RGB): string {
  return `${Math.round(rgb[0])} ${Math.round(rgb[1])} ${Math.round(rgb[2])}`;
}

function mix(color: RGB, target: RGB, amount: number): RGB {
  return [
    color[0] + (target[0] - color[0]) * amount,
    color[1] + (target[1] - color[1]) * amount,
    color[2] + (target[2] - color[2]) * amount,
  ];
}

const WHITE: RGB = [255, 255, 255];
const BLACK: RGB = [0, 0, 0];

const SHADE_KEYS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

// Lightness adjustments relative to the base color at its shade position.
// Positive = mix toward white, negative = mix toward black, 0 = base.
const FOREST_ADJ: number[] = [0.85, 0.72, 0.55, 0.35, 0.18, 0.06, 0, -0.12, -0.24, -0.36];
const GOLD_ADJ: number[] = [0.82, 0.68, 0.48, 0.22, 0, -0.08, -0.18, -0.28, -0.38, -0.48];
const CREAM_KEYS = [50, 100, 200, 300, 400, 500] as const;
const CREAM_ADJ: number[] = [0.45, 0, -0.08, -0.16, -0.26, -0.36];

function generateRamp(baseHex: string, adjustments: number[]): string[] {
  const base = hexToRgb(baseHex);
  return adjustments.map((adj) => {
    if (adj > 0) return toCssValue(mix(base, WHITE, adj));
    if (adj < 0) return toCssValue(mix(base, BLACK, Math.abs(adj)));
    return toCssValue(base);
  });
}

export function applyTheme(primary: string, accent: string, background: string): void {
  const root = document.documentElement;

  const forestRamp = generateRamp(primary, FOREST_ADJ);
  SHADE_KEYS.forEach((shade, i) => {
    root.style.setProperty(`--c-forest-${shade}`, forestRamp[i]);
  });

  const goldRamp = generateRamp(accent, GOLD_ADJ);
  SHADE_KEYS.forEach((shade, i) => {
    root.style.setProperty(`--c-gold-${shade}`, goldRamp[i]);
  });

  const creamRamp = generateRamp(background, CREAM_ADJ);
  CREAM_KEYS.forEach((shade, i) => {
    root.style.setProperty(`--c-cream-${shade}`, creamRamp[i]);
  });
}
