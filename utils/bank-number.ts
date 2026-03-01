export function formatBankCode(value: string): string {
  return value.replace(/\D/g, '').slice(0, 3);
}

export function displayBankCode(value: string): string {
  return value.padStart(3, '0');
}

export function formatBranch(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 5);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
}

export function formatAccountNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 12);
  if (digits.length <= 1) return digits;
  return `${digits.slice(0, -1)}-${digits.slice(-1)}`;
}
