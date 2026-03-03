'use client';
import { useRef, useCallback } from 'react';
import { Modal } from '@/components/ui/Modal/Modal';
import { Button } from '@/components/ui/Button/Button';
import { IconPrinter, IconDownload, IconX, IconLoader } from '@/components/icons';
import { PdfPreviewModalProps } from '@/types/ui/pdf-preview-modal.types';

export function PdfPreviewModal({
  isOpen,
  onClose,
  title,
  subtitle,
  pdfUrl,
  isLoading,
}: PdfPreviewModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handlePrint = useCallback(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.print();
    }
  }, []);

  const handleDownload = useCallback(() => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [pdfUrl, title]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl">
      <div className="flex flex-col h-full max-h-[calc(100vh-2rem)]">
        <div className="flex items-start justify-between p-(--spacing-lg) border-b border-border">
          <div className="flex flex-col gap-(--spacing-xs)">
            <h2 className="text-lg font-bold text-heading">{title}</h2>
            {subtitle && (
              <p className="text-sm text-muted">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-(--spacing-sm)">
            {pdfUrl && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  iconLeft={<IconDownload size={16} />}
                  onClick={handleDownload}
                >
                  Baixar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  iconLeft={<IconPrinter size={16} />}
                  onClick={handlePrint}
                >
                  Imprimir
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1.5!"
            >
              <IconX size={18} />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-secondary/50 p-(--spacing-sm) md:p-(--spacing-md)">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-(--spacing-md) min-h-100">
              <IconLoader size={32} className="text-primary animate-spin" />
              <p className="text-sm text-muted">Gerando PDF...</p>
            </div>
          ) : pdfUrl ? (
            <iframe
              ref={iframeRef}
              src={pdfUrl}
              className="w-full h-full rounded-lg border border-border bg-white"
              style={{ minHeight: 'calc(100vh - 200px)' }}
              title="Visualização do PDF"
            />
          ) : (
            <div className="flex items-center justify-center h-full min-h-100">
              <p className="text-sm text-muted">Nenhum PDF disponível.</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
