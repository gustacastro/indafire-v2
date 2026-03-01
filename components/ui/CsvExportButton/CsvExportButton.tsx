'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal/Modal';
import { Button } from '@/components/ui/Button/Button';
import { Checkbox } from '@/components/ui/Checkbox/Checkbox';
import { IconDownload, IconCheckCircle } from '@/components/icons';
import { CsvExportButtonProps } from '@/types/ui/csv-export.types';

export function CsvExportButton({
  filename,
  columns,
  data,
  table,
  alwaysExportColumns = [],
}: CsvExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(() => columns.map((c) => c.key));
  const [isExporting, setIsExporting] = useState(false);

  function handleOpen() {
    setSelectedKeys(columns.map((c) => c.key));
    setIsOpen(true);
  }

  function toggleColumn(key: string) {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function toggleAll() {
    setSelectedKeys((prev) =>
      prev.length === columns.length ? [] : columns.map((c) => c.key)
    );
  }

  const allSelected = selectedKeys.length === columns.length;
  const someSelected = selectedKeys.length > 0 && !allSelected;

  async function handleExport() {
    if (selectedKeys.length === 0) {
      toast.error('Selecione pelo menos uma coluna.');
      return;
    }
    setIsExporting(true);
    try {
      const exportColumns = [
        ...columns.filter((c) => selectedKeys.includes(c.key)),
        ...alwaysExportColumns,
      ];

      const response = await fetch(`/api/export/${table}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, columns: exportColumns, rows: data }),
      });

      if (!response.ok) throw new Error();

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      setIsOpen(false);
      toast.success('Arquivo CSV exportado com sucesso.');
    } catch {
      toast.error('Erro ao exportar CSV.');
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg text-sm text-secondary-fg hover:text-foreground hover:bg-secondary transition-colors shadow-sm cursor-pointer"
      >
        <IconDownload size={16} />
        <span>CSV</span>
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="sm">
        <div className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <div className="flex items-start gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <IconDownload size={18} className="text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-heading">Exportar CSV</h3>
              <p className="text-sm text-muted mt-0.5">Escolha as colunas que deseja incluir no arquivo</p>
            </div>
          </div>

          <Checkbox
            checked={allSelected || someSelected}
            onChange={toggleAll}
            label={`Selecionar todas (${columns.length})`}
            className="w-full px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors"
          />
        </div>

        <div className="overflow-y-auto flex-1 min-h-0 px-6 py-3">
          <div className="flex flex-col gap-0.5">
            {columns.map((col) => {
              const checked = selectedKeys.includes(col.key);
              return (
                <Checkbox
                  key={col.key}
                  checked={checked}
                  onChange={() => toggleColumn(col.key)}
                  label={col.label}
                  className="w-full px-3 py-2 rounded-lg hover:bg-secondary transition-colors"
                />
              );
            })}
          </div>
        </div>

        <div className="px-6 py-4 bg-secondary border-t border-border flex items-center justify-between gap-2">
          <span className="text-xs text-muted">
            {selectedKeys.length} de {columns.length} colunas selecionadas
          </span>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              iconLeft={<IconCheckCircle size={15} />}
              onClick={handleExport}
              disabled={isExporting || selectedKeys.length === 0}
            >
              {isExporting ? 'Exportando...' : 'Exportar'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
