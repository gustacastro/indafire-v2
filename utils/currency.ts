export function maskCurrencyInput(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  const number = parseInt(digits, 10) / 100;
  return number.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function parseCurrencyToApi(masked: string): string {
  return masked;
}

export function formatCurrencyDisplay(value: string): string {
  if (!value) return '—';
  if (value.startsWith('R$')) return value;
  return `R$ ${value}`;
}

export function parseCurrencyInputToCents(masked: string): number {
  if (!masked) return 0;
  return parseInt(masked.replace(/\./g, '').replace(',', ''), 10) || 0;
}

/**
 * Masks a raw string into a percentage display value.
 * Digits are entered right-to-left, always with 2 decimal places.
 * e.g. "2000" → "20,00"  |  "2555" → "25,55"  |  "10000" → "100,00"
 */
/**
 * Formats a raw API value in cents (e.g. 10000 = R$ 100,00) to BRL currency display.
 * Returns "—" for empty, null or zero values.
 */
export function formatApiCurrency(value: string | number | undefined | null): string {
  if (value === null || value === undefined || value === '') return '—';
  const raw = typeof value === 'number' ? value : parseFloat(String(value).replace(',', '.'));
  if (isNaN(raw) || raw === 0) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(raw / 100);
}

export function maskPercentageInput(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  const number = parseInt(digits, 10);
  const intPart = Math.floor(number / 100);
  const decPart = String(number % 100).padStart(2, '0');
  return `${intPart},${decPart}`;
}

/**
 * Parses a masked percentage string back to an integer (basis points × 100).
 * e.g. "20,00" → 2000  |  "25,55" → 2555  |  "100,00" → 10000
 */
export function parsePercentageInput(masked: string): number {
  if (!masked) return 0;
  return parseInt(masked.replace(/\./g, '').replace(',', ''), 10) || 0;
}
