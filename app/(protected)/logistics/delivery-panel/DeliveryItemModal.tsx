'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal/Modal';
import { Button } from '@/components/ui/Button/Button';
import { ImageGalleryModal } from '@/components/ui/ImageGalleryModal/ImageGalleryModal';
import { IconCamera } from '@/components/icons';
import { formatDateTimeBR } from '@/utils/datetime';
import {
  DeliveryItemModalProps,
  PickupItemResponse,
} from '@/types/entities/job-task/pickup-kanban.types';
import {
  fetchPickupItems,
  fetchDeliveryItems,
  createDeliveryItem,
} from './delivery-panel.facade';

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
          <span className="absolute top-2 left-2 text-[10px] font-bold bg-primary text-primary-fg px-1.5 py-0.5 rounded-(--radius-sm)">
            Nova
          </span>
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

export function DeliveryItemModal({
  isOpen,
  onClose,
  card,
  onItemChanged,
  onMoveCard,
}: DeliveryItemModalProps) {
  const [pickupItems, setPickupItems] = useState<PickupItemResponse[]>([]);
  const [deliveryItems, setDeliveryItems] = useState<PickupItemResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedPickupId, setSelectedPickupId] = useState('');
  const [pickedPhoto, setPickedPhoto] = useState('');
  const [replacementPhoto, setReplacementPhoto] = useState('');

  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryTitle, setGalleryTitle] = useState('');

  const deliveredPickupIds = new Set(
    deliveryItems.map((d) => d.picked_item_serial_number)
  );

  const undeliveredPickups = pickupItems.filter(
    (p) => !deliveredPickupIds.has(p.picked_item_serial_number)
  );

  const deliveredCount = deliveryItems.length;
  const totalCount = pickupItems.length;
  const allDelivered = totalCount > 0 && deliveredCount >= totalCount;
  const progressPercent = totalCount > 0 ? (deliveredCount / totalCount) * 100 : 0;

  const selectedPickup = pickupItems.find(
    (p) => p.job_pickup_id === selectedPickupId
  );

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const [pickups, delivers] = await Promise.all([
        fetchPickupItems(card.quoteJobId),
        fetchDeliveryItems(card.quoteJobId),
      ]);
      setPickupItems(pickups);
      setDeliveryItems(delivers);
    } catch {
      toast.error('Erro ao carregar itens.');
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
    setSelectedPickupId('');
    setPickedPhoto('');
    setReplacementPhoto('');
  }

  function handleViewPhotos(item: PickupItemResponse, index: number) {
    const photos: string[] = [];
    if (item.picked_item_image_url) photos.push(item.picked_item_image_url);
    if (item.replacement_item_image_url) photos.push(item.replacement_item_image_url);
    if (photos.length === 0) {
      toast.error('Nenhuma foto disponível.');
      return;
    }
    setGalleryTitle(`Fotos da Entrega ${index + 1}`);
    setGalleryImages(photos);
    setGalleryOpen(true);
  }

  function isFormValid(): boolean {
    return (
      selectedPickupId.length > 0 &&
      pickedPhoto.length > 0 &&
      replacementPhoto.length > 0
    );
  }

  async function handleSubmit() {
    if (!isFormValid() || !selectedPickup) {
      toast.error('Selecione um item e adicione as fotos.');
      return;
    }

    const payload = {
      picked_item_serial_number: selectedPickup.picked_item_serial_number,
      replacement_item_serial_number: selectedPickup.replacement_item_serial_number,
      picked_item_photo: pickedPhoto,
      replacement_item_photo: replacementPhoto,
    };

    setSubmitting(true);
    try {
      await toast.promise(createDeliveryItem(card.quoteJobId, payload), {
        loading: 'Entregando item...',
        success: 'Item entregue com sucesso.',
        error: (err: unknown) =>
          (err as { response?: { data?: { detail?: { message?: string } } } })
            ?.response?.data?.detail?.message ?? 'Erro ao entregar item.',
      });
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
              <h3 className="text-base font-semibold text-heading">Entrega de Itens</h3>
              <p className="text-sm text-muted mt-0.5">
                #{card.quoteCode} · {card.clientName} · {card.serviceName}
              </p>
            </div>
            <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-(--radius-md)">
              {deliveredCount}/{totalCount} entregues
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
              {deliveredCount}/{totalCount}
            </span>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(100vh-14rem)] px-(--spacing-lg) py-(--spacing-md) flex flex-col gap-(--spacing-lg)">
          <div className="flex flex-col gap-(--spacing-sm)">
            <h4 className="text-sm font-semibold text-heading">Itens entregues</h4>
            {loading ? (
              <p className="text-sm text-muted py-(--spacing-md) text-center">Carregando...</p>
            ) : deliveryItems.length === 0 ? (
              <p className="text-sm text-muted py-(--spacing-md) text-center bg-secondary rounded-(--radius-md)">
                Nenhum item entregue ainda.
              </p>
            ) : (
              <div className="flex flex-col gap-(--spacing-xs)">
                {deliveryItems.map((item, index) => (
                  <div
                    key={item.job_pickup_id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-(--spacing-sm) p-(--spacing-sm) rounded-(--radius-md) border border-border bg-secondary/50"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-(--spacing-sm) min-w-0 flex-1">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-(--radius-sm) shrink-0 self-start">
                        Entrega {index + 1}
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!allDelivered && (
            <div className="flex flex-col gap-(--spacing-md) border-t border-border pt-(--spacing-md)">
              <h4 className="text-sm font-semibold text-heading">Entregar item</h4>

              <div className="flex flex-col gap-(--spacing-sm)">
                <label className="text-sm font-medium text-foreground">
                  Selecione o item retirado
                  <span className="text-brand ml-0.5">*</span>
                </label>
                <select
                  value={selectedPickupId}
                  onChange={(e) => setSelectedPickupId(e.target.value)}
                  disabled={submitting}
                  className="w-full px-3 py-2 text-sm bg-input border border-border rounded-(--radius-md) text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
                >
                  <option value="">Selecione um item...</option>
                  {undeliveredPickups.map((p) => (
                    <option key={p.job_pickup_id} value={p.job_pickup_id}>
                      Recolhido: {p.picked_item_serial_number} · Emprestado: {p.replacement_item_serial_number}
                    </option>
                  ))}
                </select>
              </div>

              {selectedPickup && (
                <div className="p-(--spacing-sm) rounded-(--radius-md) border border-primary/20 bg-primary/5">
                  <p className="text-xs text-muted mb-1">Item selecionado:</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-(--spacing-xs) text-xs text-foreground">
                    <span>
                      <span className="font-medium text-muted">Recolhido:</span> {selectedPickup.picked_item_serial_number}
                    </span>
                    <span className="hidden sm:inline text-border">·</span>
                    <span>
                      <span className="font-medium text-muted">Emprestado:</span> {selectedPickup.replacement_item_serial_number}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-(--spacing-md)">
                <PhotoInput
                  label="Foto do Emprestado Devolvido"
                  required
                  value={pickedPhoto}
                  onChange={setPickedPhoto}
                  disabled={submitting}
                />
                <PhotoInput
                  label="Foto do Item Entregue"
                  required
                  value={replacementPhoto}
                  onChange={setReplacementPhoto}
                  disabled={submitting}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-(--spacing-sm) px-(--spacing-lg) py-(--spacing-md) border-t border-border bg-secondary">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={submitting}
          >
            Fechar
          </Button>
          {!allDelivered && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={submitting || !isFormValid()}
            >
              Entregar Item
            </Button>
          )}
          {allDelivered && onMoveCard && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onMoveCard();
              }}
            >
              Concluir Entrega
            </Button>
          )}
        </div>
      </Modal>

      <ImageGalleryModal
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        images={galleryImages}
        title={galleryTitle}
      />
    </>
  );
}
