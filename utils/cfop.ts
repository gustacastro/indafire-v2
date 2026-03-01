export function formatCfopDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 1) return digits;
  return `${digits.slice(0, 1)}.${digits.slice(1)}`;
}

export function rawCfop(formatted: string): string {
  return formatted.replace(/\./g, '');
}
