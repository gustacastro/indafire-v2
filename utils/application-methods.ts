export interface ApplicationMethod {
  value: string;
  label: string;
  suffix: string;
}

export const APPLICATION_METHODS: ApplicationMethod[] = [
  { value: 'unidade', label: 'Unidade', suffix: 'un' },
  { value: 'hora', label: 'Hora', suffix: 'hr' },
  { value: 'diaria', label: 'Diária', suffix: 'dia' },
  { value: 'quinzenal', label: 'Quinzenal', suffix: 'quinzena' },
  { value: 'mensal', label: 'Mensal', suffix: 'mês' },
  { value: 'trimestral', label: 'Trimestral', suffix: 'trimestre' },
  { value: 'semestral', label: 'Semestral', suffix: 'semestre' },
  { value: 'anual', label: 'Anual', suffix: 'ano' },
];

export function getApplicationMethodSuffix(value: string): string {
  const found = APPLICATION_METHODS.find((m) => m.value === value);
  return found?.suffix ?? value;
}
