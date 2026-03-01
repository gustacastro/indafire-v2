'use client';
import { FilterBarProps } from '@/types/ui/filter-bar.types';
import { SearchInput } from '@/components/ui/SearchInput/SearchInput';
import { ColumnToggle } from '@/components/data/DataTable/ColumnToggle';
import { PerPageSelect } from '@/components/data/PerPageSelect/PerPageSelect';

export function FilterBar<T>({
  search,
  onSearchChange,
  searchPlaceholder,
  totalItems,
  columns,
  visibleColumns,
  onColumnsChange,
  perPage,
  onPerPageChange,
  perPageOptions,
  extraActions,
}: FilterBarProps<T>) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
        className="w-full sm:w-80"
      />

      <div className="flex items-center gap-2 ml-auto">
        {extraActions}
        <PerPageSelect
          value={perPage}
          onChange={onPerPageChange}
          options={perPageOptions}
        />

        <ColumnToggle
          columns={columns}
          visibleColumns={visibleColumns}
          onChange={onColumnsChange}
        />
      </div>
    </div>
  );
}
