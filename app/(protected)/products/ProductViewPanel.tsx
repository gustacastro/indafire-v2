'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { SideModal } from '@/components/ui/SideModal/SideModal';
import { InfoItem } from '@/components/ui/InfoItem/InfoItem';
import { TaxCard } from '@/components/ui/TaxCard/TaxCard';
import { ImageGalleryModal } from '@/components/ui/ImageGalleryModal/ImageGalleryModal';
import {
  IconShoppingBag,
  IconBarcode,
  IconFileText,
  IconScale,
  IconFileSpreadsheet,
  IconDollarSign,
  IconPercent,
  IconBuilding,
  IconImage,
} from '@/components/icons';
import { formatMeasurementUnit } from '@/utils/measurement-units';
import { formatBarcodeDisplay } from '@/utils/barcode';
import { formatNcmDisplay } from '@/utils/ncm';
import { formatCfopDisplay } from '@/utils/cfop';
import { formatApiCurrency } from '@/utils/currency';
import { TaxCategory } from '@/app/(protected)/taxes/taxes.facade';
import { getProductById, Product } from './products.facade';

function calcNetValue(salePriceCents: string, taxes: TaxCategory[]): string {
  const cents = parseFloat(salePriceCents);
  if (!cents || isNaN(cents)) return '—';
  const totalRate = taxes.reduce((sum, t) => {
    if (!t.allow_iss_deduction) return sum;
    return sum + t.iss_rate + t.cofins_rate + t.csll_rate + t.ir_rate + t.inss_rate + t.pis_rate;
  }, 0);
  const netCents = cents * (1 - totalRate / 100);
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(netCents / 100);
}
import { ViewSection } from '@/components/ui/ViewSection/ViewSection';
import { ViewDivider } from '@/components/ui/ViewDivider/ViewDivider';
import { InfoValue } from '@/components/ui/InfoValue/InfoValue';
import { ProductViewPanelProps } from '@/types/entities/product/product-view-panel.types';

export function ProductViewPanel({ productId, isOpen, onClose, footerButtons }: ProductViewPanelProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  useEffect(() => {
    if (!isOpen || !productId) return;
    setProduct(null);
    setIsLoading(true);
    getProductById(productId)
      .then(setProduct)
      .catch(() => toast.error('Erro ao carregar detalhes do produto.'))
      .finally(() => setIsLoading(false));
  }, [isOpen, productId]);

  const imageUrls = product ? Object.values(product.files ?? {}) : [];

  function openGallery(index: number) {
    setGalleryIndex(index);
    setGalleryOpen(true);
  }

  return (
    <>
      <SideModal isOpen={isOpen} onClose={onClose} title="Detalhes do Produto" footerButtons={footerButtons}>
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <span className="text-sm text-muted">Carregando...</span>
          </div>
        )}

        {!isLoading && product && (
          <>
            {imageUrls.length > 0 && (
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Fotos</h4>
                <div className="flex gap-2 flex-wrap">
                  {imageUrls.slice(0, 6).map((url, i) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => openGallery(i)}
                      className="w-16 h-16 rounded-(--radius-md) overflow-hidden border border-border bg-secondary hover:border-primary hover:opacity-90 transition-all"
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                  {imageUrls.length > 6 && (
                    <button
                      type="button"
                      onClick={() => openGallery(6)}
                      className="w-16 h-16 rounded-(--radius-md) border border-border bg-secondary flex items-center justify-center text-xs font-bold text-muted hover:border-primary hover:text-primary transition-all"
                    >
                      +{imageUrls.length - 6}
                    </button>
                  )}
                </div>
              </div>
            )}

            {imageUrls.length > 0 && <ViewDivider />}

            <ViewSection title="Informações Principais">
              <InfoItem icon={<IconShoppingBag size={16} />} label="Nome do produto">
                <InfoValue>{product.info.name || '—'}</InfoValue>
              </InfoItem>
              {product.info.fantasy_name && (
                <InfoItem icon={<IconShoppingBag size={16} />} label="Nome fantasia">
                  <InfoValue>{product.info.fantasy_name}</InfoValue>
                </InfoItem>
              )}
              <InfoItem icon={<IconBarcode size={16} />} label="Código de barras">
                <InfoValue>
                  {product.info.barcode
                    ? <span className="font-mono">{formatBarcodeDisplay(product.info.barcode)}</span>
                    : '—'}
                </InfoValue>
              </InfoItem>
              {product.info.description && (
                <InfoItem icon={<IconFileText size={16} />} label="Descrição">
                  <InfoValue>{product.info.description}</InfoValue>
                </InfoItem>
              )}
              <InfoItem icon={<IconImage size={16} />} label="Estoque disponível">
                <InfoValue>{product.info.available_stock ?? 0}</InfoValue>
              </InfoItem>
            </ViewSection>

            <ViewDivider />

            <ViewSection title="Medidas e Informações Fiscais">
              <InfoItem icon={<IconScale size={16} />} label="Unidade de medida">
                <InfoValue>
                  {product.info.measurement_unit
                    ? `${product.info.measurement_amount} × ${formatMeasurementUnit(product.info.measurement_unit)}`
                    : '—'}
                </InfoValue>
              </InfoItem>
              <InfoItem icon={<IconFileSpreadsheet size={16} />} label="NCM">
                <InfoValue>
                  {product.tax.ncm
                    ? <span className="font-mono">{formatNcmDisplay(product.tax.ncm)}</span>
                    : '—'}
                </InfoValue>
              </InfoItem>
              <InfoItem icon={<IconFileSpreadsheet size={16} />} label="CFOP">
                <InfoValue>
                  {product.tax.cfop
                    ? <span className="font-mono">{formatCfopDisplay(product.tax.cfop)}</span>
                    : '—'}
                </InfoValue>
              </InfoItem>
            </ViewSection>

            <ViewDivider />

            <ViewSection title="Precificação">
              <InfoItem icon={<IconDollarSign size={16} />} label="Valor de venda">
                <InfoValue>{formatApiCurrency(product.tax.sale_price)}</InfoValue>
              </InfoItem>
              <InfoItem icon={<IconDollarSign size={16} />} label="Valor líquido">
                <InfoValue>
                  <span className={product.applied_taxes.length > 0 ? 'text-brand font-semibold' : ''}>
                    {calcNetValue(product.tax.sale_price, product.applied_taxes)}
                  </span>
                </InfoValue>
              </InfoItem>
              <InfoItem icon={<IconDollarSign size={16} />} label="Custo de produção">
                <InfoValue>{formatApiCurrency(product.tax.production_cost)}</InfoValue>
              </InfoItem>
              <InfoItem icon={<IconDollarSign size={16} />} label="Frete">
                <InfoValue>{formatApiCurrency(product.tax.delivery_fee)}</InfoValue>
              </InfoItem>
              {product.tax.center_costs && (
                <InfoItem icon={<IconBuilding size={16} />} label="Centro de custos">
                  <InfoValue>{product.tax.center_costs}</InfoValue>
                </InfoItem>
              )}
              {product.tax.center_cost_especification && (
                <InfoItem icon={<IconBuilding size={16} />} label="Subgrupo">
                  <InfoValue>{product.tax.center_cost_especification}</InfoValue>
                </InfoItem>
              )}
            </ViewSection>

            {product.applied_taxes.length > 0 && (
              <>
                <ViewDivider />
                <ViewSection title="Impostos Aplicados" spacing="compact" icon={<IconPercent size={13} />}>
                  {product.applied_taxes.map((tax) => (
                    <TaxCard key={tax.category_id} tax={tax} variant="compact" />
                  ))}
                </ViewSection>
              </>
            )}
          </>
        )}
      </SideModal>

      <ImageGalleryModal
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        images={imageUrls}
        title={product?.info.name ?? 'Imagens do Produto'}
        initialIndex={galleryIndex}
      />
    </>
  );
}
