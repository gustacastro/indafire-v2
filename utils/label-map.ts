export type LabelMap = Record<string, string>;

export function mapLabel(value: string, map: LabelMap): string {
  return map[value] ?? value;
}

export function mapRecord(
  record: Record<string, unknown>,
  fields: Record<string, LabelMap>,
): Record<string, unknown> {
  const result = { ...record };
  for (const [field, map] of Object.entries(fields)) {
    if (typeof result[field] === 'string') {
      result[field] = mapLabel(result[field] as string, map);
    }
  }
  return result;
}
