'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { Html5Qrcode } from 'html5-qrcode';
import { Modal } from '@/components/ui/Modal/Modal';
import { Button } from '@/components/ui/Button/Button';
import { FormField } from '@/components/ui/FormField/FormField';
import { ImageGalleryModal } from '@/components/ui/ImageGalleryModal/ImageGalleryModal';
import { IconCamera, IconScanLine, IconX } from '@/components/icons';
import { formatDateTimeBR } from '@/utils/datetime';
import {
  PickupItemModalProps,
  PickupItemResponse,
} from '@/types/entities/job-task/pickup-kanban.types';
import {
  fetchPickupItems,
  createPickupItem,
  updatePickupItem,
} from './pickup-panel.facade';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface PhotoInputProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (base64: string) => void;
  disabled?: boolean;
}

function PhotoInput({ label, required, value, onChange, disabled }: PhotoInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const captureRef = useRef<HTMLInputElement>(null);
  const isExistingUrl = value.length > 0 && !value.startsWith('data:');

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Selecione uma imagem válida.');
      return;
    }
    const base64 = await fileToBase64(file);
    onChange(base64);
    e.target.value = '';
  }

  return (
    <div className="flex flex-col gap-(--spacing-xs)">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-brand ml-0.5">*</span>}
        </label>
        <button
          type="button"
          onClick={() => captureRef.current?.click()}
          disabled={disabled}
          className="sm:hidden p-1 text-muted hover:text-primary transition-colors disabled:opacity-50"
          title="Tirar foto"
        >
          <IconCamera size={16} />
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
        disabled={disabled}
      />
      <input
        ref={captureRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
        disabled={disabled}
      />
      {value ? (
        <div className="relative w-full h-40 rounded-(--radius-md) overflow-hidden border border-border bg-secondary">
          <img
            src={value}
            alt={label}
            className="w-full h-full object-contain"
          />
          {isExistingUrl && (
            <span className="absolute top-2 left-2 text-[10px] font-bold bg-secondary/90 text-muted border border-border px-1.5 py-0.5 rounded-(--radius-sm)">
              Foto atual
            </span>
          )}
          {!isExistingUrl && (
            <span className="absolute top-2 left-2 text-[10px] font-bold bg-primary text-primary-fg px-1.5 py-0.5 rounded-(--radius-sm)">
              Nova
            </span>
          )}
          <div className="absolute inset-0 bg-overlay/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-(--spacing-sm)">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
            >
              Trocar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => onChange('')}
              disabled={disabled}
            >
              Remover
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="w-full h-28 rounded-(--radius-md) border-2 border-dashed border-border bg-input hover:border-primary/40 hover:bg-secondary transition-all flex flex-col items-center justify-center gap-(--spacing-xs) disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-sm font-medium text-muted">Selecionar foto</span>
          <span className="text-xs text-muted">PNG, JPG, WebP</span>
        </button>
      )}
    </div>
  );
}

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResult: (value: string) => void;
  title: string;
}

function QrScannerModal({ isOpen, onClose, onResult, title }: QrScannerModalProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = 'qr-scanner-container';

  useEffect(() => {
    if (!isOpen) return;

    const scanner = new Html5Qrcode(containerId);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          onResult(decodedText);
          scanner.stop().catch(() => {});
          onClose();
        },
        () => {}
      )
      .catch(() => {
        toast.error('Não foi possível acessar a câmera.');
        onClose();
      });

    return () => {
      scanner.stop().catch(() => {});
      scannerRef.current = null;
    };
  }, [isOpen, onResult, onClose]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="flex items-center justify-between px-(--spacing-lg) py-(--spacing-md) border-b border-border">
        <h3 className="text-sm font-semibold text-heading">{title}</h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-muted hover:text-foreground transition-colors"
        >
          <IconX size={18} />
        </button>
      </div>
      <div className="p-(--spacing-md)">
        <div id={containerId} className="w-full rounded-(--radius-md) overflow-hidden" />
        <p className="text-xs text-muted text-center mt-(--spacing-sm)">
          Aponte a câmera para o QR Code do item
        </p>
      </div>
    </Modal>
  );
}

export function PickupItemModal({
  isOpen,
  onClose,
  card,
  onItemChanged,
  readOnly = false,
  onMoveCard,
}: PickupItemModalProps) {
  const canEdit = !readOnly && card.status === 'EXECUTING_PICKUP';
  const [items, setItems] = useState<PickupItemResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<PickupItemResponse | null>(null);

  const [pickedSerial, setPickedSerial] = useState('');
  const [replacementSerial, setReplacementSerial] = useState('');
  const [pickedPhoto, setPickedPhoto] = useState('');
  const [replacementPhoto, setReplacementPhoto] = useState('');

  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryTitle, setGalleryTitle] = useState('');

  const [qrTarget, setQrTarget] = useState<'picked' | 'replacement' | null>(null);

  const pickedCount = items.length;
  const allPicked = pickedCount >= card.amount;
  const progressPercent = card.amount > 0 ? (pickedCount / card.amount) * 100 : 0;

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPickupItems(card.quoteJobId);
      setItems(data);
    } catch {
      toast.error('Erro ao carregar itens retirados.');
    } finally {
      setLoading(false);
    }
  }, [card.quoteJobId]);

  useEffect(() => {
    if (isOpen) {
      loadItems();
      resetForm();
    }
  }, [isOpen, loadItems]);

  function resetForm() {
    setPickedSerial('');
    setReplacementSerial('');
    setPickedPhoto('');
    setReplacementPhoto('');
    setEditingItem(null);
  }

  function handleEdit(item: PickupItemResponse) {
    setEditingItem(item);
    setPickedSerial(item.picked_item_serial_number);
    setReplacementSerial(item.replacement_item_serial_number);
    setPickedPhoto(item.picked_item_image_url || '');
    setReplacementPhoto(item.replacement_item_image_url || '');
  }

  function handleViewPhotos(item: PickupItemResponse, index: number) {
    const photos: string[] = [];
    if (item.picked_item_image_url) photos.push(item.picked_item_image_url);
    if (item.replacement_item_image_url) photos.push(item.replacement_item_image_url);
    if (photos.length === 0) {
      toast.error('Nenhuma foto disponível.');
      return;
    }
    setGalleryTitle(`Fotos do Item ${index + 1}`);
    setGalleryImages(photos);
    setGalleryOpen(true);
  }

  function handleQrResult(value: string) {
    if (qrTarget === 'picked') setPickedSerial(value);
    if (qrTarget === 'replacement') setReplacementSerial(value);
    setQrTarget(null);
  }

  function isFormValid(): boolean {
    return (
      pickedSerial.trim().length > 0 &&
      replacementSerial.trim().length > 0 &&
      pickedPhoto.length > 0 &&
      replacementPhoto.length > 0
    );
  }

  async function handleSubmit() {
    if (!isFormValid()) {
      toast.error('Preencha todos os campos e adicione as fotos.');
      return;
    }

    const payload = {
      picked_item_serial_number: pickedSerial.trim(),
      replacement_item_serial_number: replacementSerial.trim(),
      picked_item_photo: pickedPhoto,
      replacement_item_photo: replacementPhoto,
    };

    setSubmitting(true);
    try {
      if (editingItem) {
        await toast.promise(updatePickupItem(editingItem.job_pickup_id, payload), {
          loading: 'Salvando alterações...',
          success: 'Alterações salvas com sucesso.',
          error: (err: unknown) =>
            (err as { response?: { data?: { detail?: { message?: string } } } })
              ?.response?.data?.detail?.message ?? 'Erro ao salvar alterações.',
        });
      } else {
        await toast.promise(createPickupItem(card.quoteJobId, payload), {
          loading: 'Retirando item...',
          success: 'Item retirado com sucesso.',
          error: (err: unknown) =>
            (err as { response?: { data?: { detail?: { message?: string } } } })
              ?.response?.data?.detail?.message ?? 'Erro ao retirar item.',
        });
      }
      resetForm();
      await loadItems();
      onItemChanged();
    } catch {
      //
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <div className="px-(--spacing-lg) py-(--spacing-md) border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-heading">Retirada de Itens</h3>
              <p className="text-sm text-muted mt-0.5">
                #{card.quoteCode} · {card.clientName} · {card.serviceName}
              </p>
            </div>
            <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-(--radius-md)">
              {pickedCount}/{card.amount} retirados
            </span>
          </div>
          <div className="flex items-center gap-(--spacing-sm) mt-(--spacing-sm)">
            <div className="flex-1 h-2 bg-secondary rounded-(--radius-sm) overflow-hidden">
              <div
                className="h-full bg-primary rounded-(--radius-sm) transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-medium text-muted shrink-0">
              {pickedCount}/{card.amount}
            </span>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(100vh-14rem)] px-(--spacing-lg) py-(--spacing-md) flex flex-col gap-(--spacing-lg)">
          <div className="flex flex-col gap-(--spacing-sm)">
            <h4 className="text-sm font-semibold text-heading">Itens retirados</h4>
            {loading ? (
              <p className="text-sm text-muted py-(--spacing-md) text-center">Carregando...</p>
            ) : items.length === 0 ? (
              <p className="text-sm text-muted py-(--spacing-md) text-center bg-secondary rounded-(--radius-md)">
                Nenhum item retirado ainda.
              </p>
            ) : (
              <div className="flex flex-col gap-(--spacing-xs)">
                {items.map((item, index) => (
                  <div
                    key={item.job_pickup_id}
                    className={[
                      'flex flex-col sm:flex-row sm:items-center justify-between gap-(--spacing-sm) p-(--spacing-sm) rounded-(--radius-md) border transition-colors',
                      editingItem?.job_pickup_id === item.job_pickup_id
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-secondary/50',
                    ].join(' ')}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-(--spacing-sm) min-w-0 flex-1">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-(--radius-sm) shrink-0 self-start">
                        Item {index + 1}
                      </span>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-(--spacing-xs) text-xs text-foreground min-w-0">
                        <span className="truncate">
                          <span className="text-muted">Recolhido:</span> {item.picked_item_serial_number}
                        </span>
                        <span className="hidden sm:inline text-border">·</span>
                        <span className="truncate">
                          <span className="text-muted">Emprestado:</span> {item.replacement_item_serial_number}
                        </span>
                        {item.created_at && (
                          <>
                            <span className="hidden sm:inline text-border">·</span>
                            <span className="text-muted shrink-0">
                              {formatDateTimeBR(item.created_at)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-(--spacing-xs) shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewPhotos(item, index)}
                        className="text-xs!"
                      >
                        Ver Fotos
                      </Button>
                      {canEdit && (
                        <Button
                          type="button"
                          variant="brand-outline"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          disabled={submitting}
                          className="text-xs!"
                        >
                          Editar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {canEdit && (!allPicked || editingItem) && (
            <div className="flex flex-col gap-(--spacing-md) border-t border-border pt-(--spacing-md)">
              <h4 className="text-sm font-semibold text-heading">
                {editingItem ? `Editando Item ${items.findIndex((i) => i.job_pickup_id === editingItem.job_pickup_id) + 1}` : 'Retirar novo item'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-(--spacing-md)">
                <div className="flex flex-col gap-(--spacing-md)">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium text-foreground">
                        Nº de série do item recolhido
                        <span className="text-brand ml-0.5">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setQrTarget('picked')}
                        disabled={submitting}
                        className="sm:hidden p-1 text-muted hover:text-primary transition-colors disabled:opacity-50"
                        title="Escanear QR Code"
                      >
                        <IconScanLine size={16} />
                      </button>
                    </div>
                    <FormField
                      label=""
                      maxLength={100}
                      showCount
                      value={pickedSerial}
                      onChange={(e) => setPickedSerial(e.target.value)}
                      placeholder="Digite o nº de série"
                      disabled={submitting}
                    />
                  </div>
                  <PhotoInput
                    label="Foto do item recolhido"
                    required
                    value={pickedPhoto}
                    onChange={setPickedPhoto}
                    disabled={submitting}
                  />
                </div>
                <div className="flex flex-col gap-(--spacing-md)">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium text-foreground">
                        Nº de série do item emprestado
                        <span className="text-brand ml-0.5">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setQrTarget('replacement')}
                        disabled={submitting}
                        className="sm:hidden p-1 text-muted hover:text-primary transition-colors disabled:opacity-50"
                        title="Escanear QR Code"
                      >
                        <IconScanLine size={16} />
                      </button>
                    </div>
                    <FormField
                      label=""
                      maxLength={100}
                      showCount
                      value={replacementSerial}
                      onChange={(e) => setReplacementSerial(e.target.value)}
                      placeholder="Digite o nº de série"
                      disabled={submitting}
                    />
                  </div>
                  <PhotoInput
                    label="Foto do item emprestado"
                    required
                    value={replacementPhoto}
                    onChange={setReplacementPhoto}
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-(--spacing-sm) px-(--spacing-lg) py-(--spacing-md) border-t border-border bg-secondary">
          {canEdit && editingItem && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetForm}
              disabled={submitting}
            >
              Cancelar edição
            </Button>
          )}
          <div className="flex items-center gap-(--spacing-sm) ml-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={submitting}
            >
              Fechar
            </Button>
            {canEdit && (!allPicked || editingItem) && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                disabled={submitting || !isFormValid()}
              >
                {editingItem ? 'Salvar Alterações' : 'Retirar Item'}
              </Button>
            )}
            {canEdit && allPicked && !editingItem && onMoveCard && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  onMoveCard();
                }}
              >
                Concluir Retirada
              </Button>
            )}
          </div>
        </div>
      </Modal>

      <ImageGalleryModal
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        images={galleryImages}
        title={galleryTitle}
      />

      <QrScannerModal
        isOpen={qrTarget !== null}
        onClose={() => setQrTarget(null)}
        onResult={handleQrResult}
        title={qrTarget === 'picked' ? 'Escanear Nº de série recolhido' : 'Escanear Nº de série emprestado'}
      />
    </>
  );
}
