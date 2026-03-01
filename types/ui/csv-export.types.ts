export interface CsvExportColumn {
  key: string;
  label: string;
}

export interface CsvExportButtonProps {
  filename: string;
  columns: CsvExportColumn[];
  /** @deprecated No longer used — kept for backwards compat */
  visibleColumns?: string[];
  data: Record<string, unknown>[];
  table: string;
  /** Columns always appended to the export regardless of mode (not shown in column count) */
  alwaysExportColumns?: CsvExportColumn[];
}
