'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { SideModal } from '@/components/ui/SideModal/SideModal';
import { InfoItem } from '@/components/ui/InfoItem/InfoItem';
import { StatusBadge } from '@/components/ui/StatusBadge/StatusBadge';
import { ImageGalleryModal } from '@/components/ui/ImageGalleryModal/ImageGalleryModal';
import { MapsButton } from '@/components/ui/MapsButton/MapsButton';
import {
  IconUser,
  IconCalendar,
  IconCreditCard,
  IconDollarSign,
  IconHash,
  IconImage,
  IconTruck,
  IconPercent,
  IconMapPin,
} from '@/components/icons';
import { formatApiCurrency } from '@/utils/currency';
import { formatCpf, formatCnpj } from '@/utils/document';
import {
  getQuoteEnriched,
  EnrichedQuote,
  getQuoteStatusLabel,
  getQuoteStatusVariant,
  getClientName,
  getClientDocument,
  getClientType,
  formatAddressShort,
} from './quotes.facade';
import { ViewSection } from '@/components/ui/ViewSection/ViewSection';
import { ViewDivider } from '@/components/ui/ViewDivider/ViewDivider';
import { InfoValue } from '@/components/ui/InfoValue/InfoValue';
import { Button } from '@/components/ui/Button/Button';
import { QuoteHistoryModal } from './QuoteHistoryModal';
import { QuoteViewPanelProps } from '@/types/entities/quote/quote-view-panel.types';

interface QuoteItemsSectionItem {
  id: string;
  name: string;
  amount: number;
  unitary_value: number;
  images?: string[];
}

interface QuoteItemsSectionProps {
  title: string;
  items: QuoteItemsSectionItem[];
  onImageClick?: (images: string[], index: number) => void;
  hideValues?: boolean;
}

function QuoteItemsSection({ title, items, onImageClick, hideValues }: QuoteItemsSectionProps) {
  if (items.length === 0) return null;
  return (
    <>
      <ViewDivider />
      <ViewSection title={title} spacing="compact">
        {items.map((item) => {
          const imgs = item.images ?? [];
          const firstImg = imgs.length > 0 ? imgs[0] : null;
          return (
            <div key={item.id} className="flex items-center gap-3 bg-secondary p-3 rounded-(--radius-lg) border border-border">
              {item.images !== undefined && (
                <button
                  type="button"
                  onClick={() => imgs.length > 0 && onImageClick?.(imgs, 0)}
                  className={[
                    'shrink-0 w-10 h-10 rounded-(--radius-md) overflow-hidden border border-border bg-card flex items-center justify-center',
                    imgs.length > 0 ? 'cursor-pointer hover:opacity-80 hover:border-primary' : 'cursor-default',
                  ].join(' ')}
                >
                  {firstImg ? (
                    <img src={firstImg} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <IconImage size={16} className="text-muted" />
                  )}
                </button>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                <p className="text-xs text-muted">
                  {hideValues ? `${item.amount}x` : `${item.amount}x · ${formatApiCurrency(item.unitary_value)} = ${formatApiCurrency(item.unitary_value * item.amount)}`}
                </p>
              </div>
            </div>
          );
        })}
      </ViewSection>
    </>
  );
}

function formatDateBR(dateStr: string): string {
  if (!dateStr) return '—';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

export function QuoteViewPanel({ quoteId, isOpen, onClose, footerButtons, hideFinancials }: QuoteViewPanelProps) {
  const [quote, setQuote] = useState<EnrichedQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    if (!isOpen || !quoteId) return;
    setQuote(null);
    setIsLoading(true);
    getQuoteEnriched(quoteId)
      .then(setQuote)
      .catch(() => toast.error('Erro ao carregar detalhes do orçamento.'))
      .finally(() => setIsLoading(false));
  }, [isOpen, quoteId]);

  const hasRejections = (quote?.rejections.length ?? 0) > 0;

  function openGallery(images: string[], index: number) {
    setGalleryImages(images);
    setGalleryIndex(index);
    setGalleryOpen(true);
  }

  return (
    <>
      <SideModal isOpen={isOpen} onClose={onClose} title="Detalhes do Orçamento" footerButtons={footerButtons}>
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <span className="text-sm text-muted">Carregando...</span>
          </div>
        )}

        {!isLoading && quote && (
          <>
            {hasRejections && (
              <div className="flex justify-end mb-(--spacing-lg)">
                <Button variant="outline" size="sm" onClick={() => setHistoryOpen(true)}>
                  Históricos
                </Button>
              </div>
            )}

            <ViewSection title="Informações Gerais">
              <InfoItem icon={<IconHash size={16} />} label="Código do orçamento">
                <InfoValue>#{quote.detail.quote_code}</InfoValue>
              </InfoItem>
              <InfoItem icon={<IconCalendar size={16} />} label="Status">
                <div className="mt-1">
                  <StatusBadge
                    label={getQuoteStatusLabel(quote.detail.status)}
                    variant={getQuoteStatusVariant(quote.detail.status)}
                  />
                </div>
              </InfoItem>
              {quote.detail.status !== 'IN_ATTENDANCE' && (
                <InfoItem icon={<IconCalendar size={16} />} label="Entrega prevista">
                  <InfoValue>{formatDateBR(quote.detail.expected_delivery_date)}</InfoValue>
                </InfoItem>
              )}
            </ViewSection>

            <ViewDivider />

            <ViewSection title="Cliente">
              <InfoItem icon={<IconUser size={16} />} label="Nome">
                <InfoValue>{getClientName(quote.client)}</InfoValue>
              </InfoItem>
              <InfoItem icon={<IconUser size={16} />} label="Documento">
                <InfoValue>
                  {getClientType(quote.client) === 'PJ'
                    ? formatCnpj(getClientDocument(quote.client))
                    : formatCpf(getClientDocument(quote.client))}
                </InfoValue>
              </InfoItem>
              <InfoItem icon={<IconUser size={16} />} label="Tipo">
                <InfoValue>{getClientType(quote.client) === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física'}</InfoValue>
              </InfoItem>
              {(quote.client.address.street || quote.client.address.city) && (
                <InfoItem icon={<IconMapPin size={16} />} label="Endereço">
                  <div className="flex items-start gap-2 mt-0.5">
                    <p className="text-sm text-foreground whitespace-pre-line flex-1">
                      {formatAddressShort(quote.client.address)}
                    </p>
                    <MapsButton address={quote.client.address} />
                  </div>
                </InfoItem>
              )}
            </ViewSection>

            {quote.detail.status === 'IN_ATTENDANCE' ? (
              <>
                <ViewDivider />
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-12 h-12 rounded-(--radius-full) bg-muted/10 flex items-center justify-center mb-3">
                    <IconUser size={24} className="text-muted" />
                  </div>
                  <p className="text-sm font-semibold text-muted">Em atendimento</p>
                  <p className="text-xs text-muted mt-1">
                    Este orçamento ainda está em fase de atendimento. Edite-o para adicionar produtos, serviços e valores.
                  </p>
                </div>
              </>
            ) : (
              <>
                <QuoteItemsSection
                  title="Produtos"
                  items={quote.products.map((p) => ({
                    id: p.product.id,
                    name: p.product.info.name,
                    amount: p.amount,
                    unitary_value: p.unitary_value,
                    images: Object.values(p.product.files ?? {}),
                  }))}
                  onImageClick={openGallery}
                  hideValues={hideFinancials}
                />

                <QuoteItemsSection
                  title="Serviços"
                  items={quote.jobs.map((j) => ({
                    id: j.job.id,
                    name: j.job.service_name,
                    amount: j.amount,
                    unitary_value: j.unitary_value,
                  }))}
                  hideValues={hideFinancials}
                />

                {!hideFinancials && (
                  <>
                <ViewDivider />

                <ViewSection title="Financeiro">
                  <InfoItem icon={<IconCreditCard size={16} />} label="Meio de pagamento">
                    <InfoValue>{quote.paymentMethod?.name ?? '—'}</InfoValue>
                  </InfoItem>
                  <InfoItem icon={<IconCreditCard size={16} />} label="Parcelas">
                    <InfoValue>{quote.detail.installments > 0 ? `${quote.detail.installments}x` : 'À vista'}</InfoValue>
                  </InfoItem>
                  {quote.detail.installments > 0 && (
                    <InfoItem icon={<IconCreditCard size={16} />} label="Valor por parcela">
                      <InfoValue>
                        <span className="font-bold text-foreground">
                          {formatApiCurrency(Math.floor(quote.detail.net_value / quote.detail.installments))}
                        </span>
                      </InfoValue>
                    </InfoItem>
                  )}
                  <InfoItem icon={<IconTruck size={16} />} label="Frete">
                    <InfoValue>{formatApiCurrency(quote.detail.freight)}</InfoValue>
                  </InfoItem>
                  <InfoItem icon={<IconPercent size={16} />} label="Desconto">
                    <InfoValue>
                      {quote.detail.discount_percentage
                        ? `${(quote.detail.discount_percentage / 100).toFixed(2).replace('.', ',')}% (${formatApiCurrency(quote.detail.discount_value)})`
                        : '—'}
                    </InfoValue>
                  </InfoItem>
                  <InfoItem icon={<IconDollarSign size={16} />} label="Subtotal dos itens">
                    <InfoValue>{formatApiCurrency(quote.detail.total_items_value)}</InfoValue>
                  </InfoItem>
                  <InfoItem icon={<IconDollarSign size={16} />} label="Valor total">
                    <InfoValue>{formatApiCurrency(quote.detail.total_quote_value)}</InfoValue>
                  </InfoItem>
                  <InfoItem icon={<IconDollarSign size={16} />} label="Valor líquido">
                    <InfoValue>
                      <span className="text-success font-bold">{formatApiCurrency(quote.detail.net_value)}</span>
                    </InfoValue>
                  </InfoItem>
                </ViewSection>
                  </>
                )}
              </>
            )}
          </>
        )}
      </SideModal>

      {quote && (
        <QuoteHistoryModal
          isOpen={historyOpen}
          onClose={() => setHistoryOpen(false)}
          rejections={quote.rejections}
        />
      )}

      <ImageGalleryModal
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        images={galleryImages}
        initialIndex={galleryIndex}
        title="Fotos do produto"
      />
    </>
  );
}
