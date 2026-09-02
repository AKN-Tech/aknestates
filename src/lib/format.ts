export function formatPKR(amount: number): string {
  if (amount >= 10000000) {
    const crore = amount / 10000000;
    const formatted = crore % 1 === 0 ? crore.toFixed(0) : crore.toFixed(1);
    return `PKR ${formatted} Crore`;
  }
  if (amount >= 100000) {
    const lakh = amount / 100000;
    const formatted = lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(1);
    return `PKR ${formatted} Lakh`;
  }
  if (amount >= 1000) {
    const k = amount / 1000;
    return `PKR ${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
  }
  return `PKR ${amount.toLocaleString()}`;
}

export function formatPKRShort(amount: number): string {
  if (amount >= 10000000) {
    const crore = amount / 10000000;
    return `${crore % 1 === 0 ? crore.toFixed(0) : crore.toFixed(1)} Cr`;
  }
  if (amount >= 100000) {
    const lakh = amount / 100000;
    return `${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(1)} Lac`;
  }
  if (amount >= 1000) {
    const k = amount / 1000;
    return `${k.toFixed(0)}K`;
  }
  return amount.toString();
}

export function formatPriceLabel(price: number, purpose: 'sale' | 'rent'): string {
  const formatted = formatPKR(price);
  return purpose === 'rent' ? `${formatted}/mo` : formatted;
}

export function marlaToSqft(marla: number): number {
  return Math.round(marla * 272.25);
}

export function sqftToMarla(sqft: number): number {
  return Math.round((sqft / 272.25) * 10) / 10;
}

export function formatSize(marla: number, sqft: number): string {
  if (marla >= 20) {
    const kanal = marla / 20;
    return `${kanal % 1 === 0 ? kanal.toFixed(0) : kanal.toFixed(1)} Kanal · ${sqft.toLocaleString()} sqft`;
  }
  return `${marla} Marla · ${sqft.toLocaleString()} sqft`;
}
