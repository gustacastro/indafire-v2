export function formatBarcodeDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

export function rawBarcode(formatted: string): string {
  return formatted.replace(/\s/g, '');
}
