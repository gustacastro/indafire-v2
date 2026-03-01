export interface MeasurementUnit {
  name: string;
  symbol: string;
}

export const MEASUREMENT_UNITS: MeasurementUnit[] = [
  { name: 'Milímetro', symbol: 'mm' },
  { name: 'Centímetro', symbol: 'cm' },
  { name: 'Metro', symbol: 'm' },
  { name: 'Quilômetro', symbol: 'km' },
  { name: 'Miligrama', symbol: 'mg' },
  { name: 'Grama', symbol: 'g' },
  { name: 'Quilograma', symbol: 'kg' },
  { name: 'Tonelada', symbol: 't' },
  { name: 'Litro', symbol: 'L' },
  { name: 'Mililitro', symbol: 'mL' },
  { name: 'Polegada', symbol: 'in' },
  { name: 'Pé', symbol: 'ft' },
  { name: 'Jarda', symbol: 'yd' },
  { name: 'Metro quadrado', symbol: 'm²' },
  { name: 'Hectare', symbol: 'ha' },
];

export const MEASUREMENT_UNIT_OPTIONS = MEASUREMENT_UNITS.map((u) => ({
  value: u.symbol,
  label: `${u.name} (${u.symbol})`,
}));

export function formatMeasurementUnit(symbol: string): string {
  const unit = MEASUREMENT_UNITS.find((u) => u.symbol === symbol);
  if (!unit) return symbol;
  return `${unit.name} (${unit.symbol})`;
}
