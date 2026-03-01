'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { FormHeader } from '@/components/ui/FormHeader/FormHeader';
import { FormSection } from '@/components/ui/FormSection/FormSection';
import { FormField } from '@/components/ui/FormField/FormField';
import { TextArea } from '@/components/ui/TextArea/TextArea';
import { Select } from '@/components/ui/Select/Select';
import { CurrencyInput } from '@/components/ui/CurrencyInput/CurrencyInput';
import { PillSelector } from '@/components/ui/PillSelector/PillSelector';
import { Button } from '@/components/ui/Button/Button';
import { ModalConfirm } from '@/components/ui/Modal/ModalConfirm';
import { ImageUpload } from '@/components/ui/ImageUpload/ImageUpload';
import { TaxDropdown } from '@/components/ui/TaxDropdown/TaxDropdown';
import { IconSave, IconLock, IconShoppingBag } from '@/components/icons';
import { ProductFormProps } from '@/types/entities/product/product-form.types';
import { ExistingImageItem, LocalImageItem } from '@/types/ui/image-upload.types';
import { TaxCategory } from '@/app/(protected)/taxes/taxes.facade';
import { MEASUREMENT_UNIT_OPTIONS } from '@/utils/measurement-units';
import { formatBarcodeDisplay, rawBarcode } from '@/utils/barcode';
import { formatNcmDisplay, rawNcm } from '@/utils/ncm';
import { formatCfopDisplay, rawCfop } from '@/utils/cfop';
import {
  getProductById,
  createProduct,
  updateProduct,
  uploadProductFiles,
  deleteProductFiles,
  parseCurrencyInputToCents,
  fetchProductTaxes,
} from './products.facade';
import { maskCurrencyInput } from '@/utils/currency';
import { FormGrid } from '@/components/ui/FormGrid/FormGrid';

const CENTER_COSTS_OPTIONS = [
  { value: 'admin', label: 'Administrativo' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'operacional', label: 'Operacional' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'producao', label: 'Produção' },
];

const CENTER_COST_SPEC_OPTIONS = [
  { value: 'produto_principal', label: 'Produto Principal' },
  { value: 'produto_complementar', label: 'Produto Complementar' },
  { value: 'produto_auxiliar', label: 'Produto Auxiliar' },
  { value: 'produto_especial', label: 'Produto Especial' },
  { value: 'produto_importado', label: 'Produto Importado' },
];

function calcNetValue(salePrice: string, selectedTaxes: TaxCategory[]): string {
  const clean = salePrice.replace(/R\$\s?/g, '').replace(/\./g, '').replace(',', '.');
  const price = parseFloat(clean);
  if (isNaN(price) || price === 0 || !salePrice) return '';
  const totalRate = selectedTaxes.reduce((sum, t) => {
    if (!t.allow_iss_deduction) return sum;
    return sum + t.iss_rate + (t.cofins_rate ?? 0) + (t.csll_rate ?? 0) + (t.ir_rate ?? 0) + (t.inss_rate ?? 0) + (t.pis_rate ?? 0);
  }, 0);
  const net = price * (1 - totalRate / 100);
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(net);
}

export function ProductForm({ mode, productId }: ProductFormProps) {
  const router = useRouter();
  const { hasPermission, isLoading: authLoading } = useAuth();

  const canProceed = mode === 'create'
    ? hasPermission('products', 'create')
    : hasPermission('products', 'edit');

  useEffect(() => {
    if (!authLoading && !canProceed) router.replace('/dashboard');
  }, [authLoading, canProceed, router]);

  const [name, setName] = useState('');
  const [fantasyName, setFantasyName] = useState('');
  const [description, setDescription] = useState('');
  const [barcode, setBarcode] = useState('');
  const [measurementUnit, setMeasurementUnit] = useState(MEASUREMENT_UNIT_OPTIONS[0].value);
  const [measurementAmount, setMeasurementAmount] = useState('1');
  const [ncm, setNcm] = useState('');
  const [cfop, setCfop] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [productionCost, setProductionCost] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [centerCosts, setCenterCosts] = useState('');
  const [centerCostSpec, setCenterCostSpec] = useState('');
  const [appliedTaxIds, setAppliedTaxIds] = useState<string[]>([]);

  const [existingImages, setExistingImages] = useState<ExistingImageItem[]>([]);
  const [localImages, setLocalImages] = useState<LocalImageItem[]>([]);
  const [removedFileNames, setRemovedFileNames] = useState<string[]>([]);

  const [availableTaxes, setAvailableTaxes] = useState<TaxCategory[]>([]);
  const [taxesLoading, setTaxesLoading] = useState(true);

  const [nameError, setNameError] = useState('');
  const [barcodeError, setBarcodeError] = useState('');
  const [ncmError, setNcmError] = useState('');
  const [cfopError, setCfopError] = useState('');
  const [salePriceError, setSalePriceError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(mode === 'edit');
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  useEffect(() => {
    setTaxesLoading(true);
    fetchProductTaxes()
      .then(setAvailableTaxes)
      .catch(() => toast.error('Erro ao carregar impostos.'))
      .finally(() => setTaxesLoading(false));
  }, []);

  const loadProduct = useCallback(async () => {
    if (mode !== 'edit' || !productId) return;
    setIsFetching(true);
    try {
      const product = await getProductById(productId);
      setName(product.info.name);
      setFantasyName(product.info.fantasy_name ?? '');
      setDescription(product.info.description ?? '');
      setBarcode(product.info.barcode ? formatBarcodeDisplay(product.info.barcode) : '');
      setMeasurementUnit(product.info.measurement_unit ?? MEASUREMENT_UNIT_OPTIONS[0].value);
      setMeasurementAmount(String(product.info.measurement_amount ?? 1));
      setNcm(product.tax.ncm ? formatNcmDisplay(product.tax.ncm) : '');
      setCfop(product.tax.cfop ? formatCfopDisplay(product.tax.cfop) : '');
      setSalePrice(maskCurrencyInput(product.tax.sale_price ?? ''));
      setProductionCost(maskCurrencyInput(product.tax.production_cost ?? ''));
      setDeliveryFee(maskCurrencyInput(product.tax.delivery_fee ?? ''));
      setCenterCosts(product.tax.center_costs ?? '');
      setCenterCostSpec(product.tax.center_cost_especification ?? '');
      setAppliedTaxIds(product.tax.applied_taxes_ids ?? []);

      const files = product.files ?? {};
      setExistingImages(
        Object.entries(files).map(([id, url]) => ({ id, url })),
      );
    } catch {
      toast.error('Erro ao carregar dados do produto.');
    } finally {
      setIsFetching(false);
    }
  }, [mode, productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  function handleBarcodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 13);
    setBarcode(formatBarcodeDisplay(raw));
  }

  function handleNcmChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[.\s]/g, '');
    setNcm(formatNcmDisplay(raw));
    setNcmError('');
  }

  function handleCfopChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[.\s]/g, '');
    setCfop(formatCfopDisplay(raw));
    setCfopError('');
  }

  function handleAddFiles(files: File[]) {
    const newLocal: LocalImageItem[] = files.map((file) => ({
      id: Math.random().toString(36).slice(2),
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setLocalImages((prev) => [...prev, ...newLocal]);
  }

  function handleRemoveExisting(id: string) {
    setExistingImages((prev) => prev.filter((img) => img.id !== id));
    setRemovedFileNames((prev) => [...prev, id]);
  }

  function handleRemoveLocal(id: string) {
    setLocalImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  }

  const selectedTaxes = useMemo(
    () => availableTaxes.filter((t) => appliedTaxIds.includes(t.category_id)),
    [availableTaxes, appliedTaxIds],
  );

  const netValue = useMemo(() => calcNetValue(salePrice, selectedTaxes), [salePrice, selectedTaxes]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    let hasError = false;
    if (!name.trim()) {
      setNameError('Nome do produto é obrigatório.');
      hasError = true;
    }
    if (!barcode.trim()) {
      setBarcodeError('Código de barras é obrigatório.');
      hasError = true;
    }
    if (!ncm.trim()) {
      setNcmError('NCM é obrigatório.');
      hasError = true;
    }
    if (!cfop.trim()) {
      setCfopError('CFOP é obrigatório.');
      hasError = true;
    }
    if (!salePrice.trim()) {
      setSalePriceError('Valor de venda é obrigatório.');
      hasError = true;
    }
    if (salePrice.trim() && productionCost.trim()) {
      const parseCents = (v: string) => {
        const digits = v.replace(/\D/g, '');
        return parseInt(digits || '0', 10);
      };
      if (parseCents(salePrice) < parseCents(productionCost)) {
        setSalePriceError('Valor de venda não pode ser menor que o valor de custo.');
        hasError = true;
      }
    }
    if (hasError) return;

    setIsSubmitting(true);
    try {
      const payload = {
        info: {
          name,
          fantasy_name: fantasyName,
          description,
          measurement_unit: measurementUnit,
          measurement_amount: Number(measurementAmount) || 1,
          barcode: rawBarcode(barcode),
        },
        tax: {
          ncm: rawNcm(ncm),
          cfop: rawCfop(cfop),
          production_cost: String(parseCurrencyInputToCents(productionCost)),
          sale_price: String(parseCurrencyInputToCents(salePrice)),
          center_costs: centerCosts,
          center_cost_especification: centerCostSpec,
          delivery_fee: String(parseCurrencyInputToCents(deliveryFee)),
          applied_taxes_ids: appliedTaxIds,
        },
      };

      if (mode === 'create') {
        const newId = await toast.promise(
          createProduct(payload),
          {
            loading: 'Criando produto...',
            success: 'Produto criado com sucesso.',
            error: (err: unknown) =>
              (err as { response?: { data?: { detail?: { message?: string } } } })
                ?.response?.data?.detail?.message ?? 'Erro ao criar produto.',
          },
        );

        if (localImages.length > 0) {
          await toast.promise(
            uploadProductFiles(newId, localImages.map((i) => i.file)),
            {
              loading: 'Enviando imagens...',
              success: 'Imagens enviadas com sucesso.',
              error: 'Erro ao enviar imagens.',
            },
          );
        }
      } else {
        await toast.promise(
          updateProduct(productId!, payload),
          {
            loading: 'Salvando alterações...',
            success: 'Produto atualizado com sucesso.',
            error: (err: unknown) =>
              (err as { response?: { data?: { detail?: { message?: string } } } })
                ?.response?.data?.detail?.message ?? 'Erro ao salvar produto.',
          },
        );

        if (removedFileNames.length > 0) {
          await deleteProductFiles(productId!, removedFileNames);
        }
        if (localImages.length > 0) {
          await uploadProductFiles(productId!, localImages.map((i) => i.file));
        }
      }

      router.push('/products');
    } catch {
      // toast.promise already handles error
    } finally {
      setIsSubmitting(false);
    }
  }

  const isSaveDisabled = !name || !barcode || !ncm || !cfop || !salePrice || isSubmitting || isFetching;

  if (authLoading || (!authLoading && !canProceed)) return null;

  return (
    <form onSubmit={handleSubmit}>
      <FormHeader
        backHref="/products"
        onBackClick={(e) => { e.preventDefault(); setShowDiscardModal(true); }}
        title={mode === 'create' ? 'Criar produto' : 'Editar produto'}
        description={
          mode === 'create'
            ? 'Preencha os dados de identificação, medidas, tributação e precificação.'
            : 'Atualize os dados e as configurações do produto.'
        }
      />

      <div className="flex flex-col gap-6">
        <FormSection title="Informações Principais">
          <FormGrid>
            <FormField
              label="Nome do produto"
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(''); }}
              placeholder="Ex: Parafuso Sextavado M8"
              required
              error={nameError}
            />
            <FormField
              label="Nome fantasia"
              type="text"
              value={fantasyName}
              onChange={(e) => setFantasyName(e.target.value)}
              placeholder="Ex: Parafuso Especial"
            />
            <FormField
              label="Código de barras"
              type="text"
              value={barcode}
              onChange={(e) => { handleBarcodeChange(e); setBarcodeError(''); }}
              placeholder="Ex: 1234 5678 9012 3"
              required
              error={barcodeError}
            />
            <div className="sm:col-span-2">
              <TextArea
                label="Descrição"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição detalhada do produto..."
                rows={3}
              />
            </div>
          </FormGrid>
        </FormSection>

        <FormSection title="Medidas e Informações Fiscais">
          <FormGrid>
            <div className="sm:col-span-2">
              <PillSelector
                label="Unidade de medida"
                required
                options={MEASUREMENT_UNIT_OPTIONS}
                value={measurementUnit}
                onChange={setMeasurementUnit}
                size="sm"
              />
            </div>
            <div>
              <FormField
                label="Quantidade da unidade"
                type="number"
                value={measurementAmount}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setMeasurementAmount(v < 1 ? '1' : e.target.value);
                }}
                min={1}
                required
              />
              {measurementUnit && (
                <div className="flex items-center gap-2 text-sm text-muted mt-2">
                  Equivale a
                  <span className="inline-flex items-center px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary text-xs font-bold rounded-(--radius-md)">
                    {measurementAmount || 1} {measurementUnit}
                  </span>
                </div>
              )}
            </div>
            <FormField
              label="NCM"
              type="text"
              value={ncm}
              onChange={handleNcmChange}
              placeholder="Ex: 1234.56.78"
              required
              error={ncmError}
            />
            <FormField
              label="CFOP"
              type="text"
              value={cfop}
              onChange={handleCfopChange}
              placeholder="Ex: 5.102"
              required
              error={cfopError}
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Precificação e Impostos">
          <FormGrid>
            <CurrencyInput
              label="Valor de venda"
              required
              value={salePrice}
              onChange={(v) => { setSalePrice(v); setSalePriceError(''); }}
              error={salePriceError}
            />
            <CurrencyInput
              label="Valor de custo"
              value={productionCost}
              onChange={setProductionCost}
            />
            <CurrencyInput
              label="Valor frete"
              value={deliveryFee}
              onChange={setDeliveryFee}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <IconLock size={13} className="text-muted" />
                Valor de venda líquido (após impostos)
              </label>
              <div className="w-full px-3 py-2.5 rounded-(--radius-md) border border-border bg-secondary text-sm font-semibold text-muted cursor-not-allowed">
                {netValue || '—'}
              </div>
              {selectedTaxes.length > 0 && (
                <p className="text-xs text-muted">
                  Total de impostos aplicados:{' '}
                  {selectedTaxes.reduce((sum, t) => {
                    const iss = t.allow_iss_deduction ? t.iss_rate : 0;
                    return sum + iss + t.cofins_rate + t.csll_rate + t.ir_rate + t.inss_rate + t.pis_rate;
                  }, 0).toFixed(2)}%
                </p>
              )}
            </div>
            <Select
              label="Centro de custos"
              value={centerCosts}
              onChange={setCenterCosts}
              options={CENTER_COSTS_OPTIONS}
              placeholder="Selecione o centro de custo"
            />
            <Select
              label="Centro de subgrupos"
              value={centerCostSpec}
              onChange={setCenterCostSpec}
              options={CENTER_COST_SPEC_OPTIONS}
              placeholder="Especificação / Subgrupo"
            />
            <div className="sm:col-span-2">
              {!taxesLoading && (
                <TaxDropdown
                  label="Impostos aplicáveis ao produto"
                  value={appliedTaxIds}
                  onChange={setAppliedTaxIds}
                  taxes={availableTaxes}
                />
              )}
            </div>
          </FormGrid>
        </FormSection>

        <FormSection title="Imagens do Produto">
          <ImageUpload
            existingImages={existingImages}
            localImages={localImages}
            onAddFiles={handleAddFiles}
            onRemoveExisting={handleRemoveExisting}
            onRemoveLocal={handleRemoveLocal}
            disabled={isSubmitting}
          />
        </FormSection>

        <div className="flex items-center justify-end gap-3 pb-8">
          <Button type="button" variant="outline" onClick={() => setShowDiscardModal(true)}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            iconLeft={<IconSave size={16} />}
            disabled={isSaveDisabled}
          >
            {isSubmitting
              ? 'Salvando...'
              : mode === 'create'
                ? 'Cadastrar produto'
                : 'Salvar alterações'}
          </Button>
        </div>
      </div>

      <ModalConfirm
        isOpen={showDiscardModal}
        onClose={() => setShowDiscardModal(false)}
        variant="warning"
        title="Descartar alterações?"
        description="Você tem alterações não salvas. Tem certeza que deseja sair? Tudo que você fez será perdido."
        confirmLabel="Sim, sair"
        cancelLabel="Continuar editando"
        onConfirm={() => router.back()}
        icon={<IconShoppingBag size={20} className="text-brand" />}
      />
    </form>
  );
}
