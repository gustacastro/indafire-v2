'use client';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { FormHeader } from '@/components/ui/FormHeader/FormHeader';
import { FormSection } from '@/components/ui/FormSection/FormSection';
import { FormGrid } from '@/components/ui/FormGrid/FormGrid';
import { FormField } from '@/components/ui/FormField/FormField';
import { CurrencyInput } from '@/components/ui/CurrencyInput/CurrencyInput';
import { PercentageInput } from '@/components/ui/PercentageInput/PercentageInput';
import { SearchableSelect } from '@/components/ui/SearchableSelect/SearchableSelect';
import { Button } from '@/components/ui/Button/Button';
import { Stepper } from '@/components/ui/Stepper/Stepper';
import { ItemSelectorPanel } from '@/components/ui/ItemSelector/ItemSelectorPanel';
import { ModalConfirm } from '@/components/ui/Modal/ModalConfirm';
import { ImageGalleryModal } from '@/components/ui/ImageGalleryModal/ImageGalleryModal';
import { StatusBadge } from '@/components/ui/StatusBadge/StatusBadge';
import {
  IconUser,
  IconPackage,
  IconDollarSign,
  IconClipboardCheck,
  IconSave,
  IconPlus,
  IconTrash,
  IconImage,
  IconMinus,
} from '@/components/icons';
import {
  Client,
  Product,
  Job,
  PaymentMethod,
  getClientName,
  getClientDocument,
  getClientType,
  getQuoteEnriched,
  createQuote,
  updateQuote,
  fetchAllPaymentMethods,
  calcQuoteTotals,
  CreateQuotePayload,
} from './quotes.facade';
import { fetchClients } from '@/app/(protected)/clients/clients.facade';
import { fetchProducts } from '@/app/(protected)/products/products.facade';
import { fetchJobs } from '@/app/(protected)/jobs/jobs.facade';
import { QuoteFormProps } from '@/types/entities/quote/quote-form.types';
import { StepItem } from '@/types/ui/stepper.types';
import {
  formatApiCurrency,
  maskCurrencyInput,
  parseCurrencyInputToCents,
  maskPercentageInput,
  parsePercentageInput,
} from '@/utils/currency';

interface SelectedProduct {
  id: string;
  product: Product;
  amount: number;
  unitary_value: string;
}

interface SelectedJob {
  id: string;
  job: Job;
  amount: number;
  unitary_value: string;
}

export function QuoteForm({ mode, quoteId }: QuoteFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') ?? '/quotes';
  const { hasPermission, isLoading: authLoading } = useAuth();

  const requiredPermission = mode === 'create' ? 'create' : 'edit';
  const canProceed = hasPermission('quotes', requiredPermission);

  useEffect(() => {
    if (!authLoading && !canProceed) router.replace('/dashboard');
  }, [authLoading, canProceed, router]);

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [selectedJobs, setSelectedJobs] = useState<SelectedJob[]>([]);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [freight, setFreight] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [discount, setDiscount] = useState('');
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const [slideOver, setSlideOver] = useState<{ isOpen: boolean; type: 'client' | 'product' | 'service' | null }>({
    isOpen: false,
    type: null,
  });
  const [slideSearch, setSlideSearch] = useState('');

  const [deliveryDateError, setDeliveryDateError] = useState('');
  const [paymentMethodError, setPaymentMethodError] = useState('');
  const [discountError, setDiscountError] = useState('');

  const [panelClients, setPanelClients] = useState<Client[]>([]);
  const [panelProducts, setPanelProducts] = useState<Product[]>([]);
  const [panelJobs, setPanelJobs] = useState<Job[]>([]);
  const [panelLoading, setPanelLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(mode === 'edit');

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchAllPaymentMethods()
      .then((pms) => setPaymentMethods(pms))
      .catch(() => toast.error('Erro ao carregar meios de pagamento.'))
      .finally(() => setDataLoading(false));
  }, []);

  const loadPanelItems = useCallback(async (type: 'client' | 'product' | 'service', search: string) => {
    setPanelLoading(true);
    try {
      if (type === 'client') {
        const res = await fetchClients({ perPage: 10, search: search || undefined });
        setPanelClients(res.data);
      } else if (type === 'product') {
        const res = await fetchProducts({ perPage: 10, search: search || undefined });
        setPanelProducts(res.data);
      } else {
        const res = await fetchJobs({ perPage: 10, search: search || undefined });
        setPanelJobs(res.data);
      }
    } catch {
      toast.error('Erro ao buscar itens.');
    } finally {
      setPanelLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!slideOver.isOpen || !slideOver.type) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (slideSearch.length === 0) {
      loadPanelItems(slideOver.type, '');
    } else if (slideSearch.length >= 2) {
      debounceRef.current = setTimeout(() => {
        loadPanelItems(slideOver.type!, slideSearch);
      }, 400);
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [slideSearch, slideOver.isOpen, slideOver.type, loadPanelItems]);

  const loadQuote = useCallback(async () => {
    if (!quoteId) return;
    try {
      const enriched = await getQuoteEnriched(quoteId);
      setSelectedClient(enriched.client);
      setSelectedProducts(
        enriched.products.map((p) => ({
          id: p.product.id,
          product: p.product,
          amount: p.amount,
          unitary_value: maskCurrencyInput(String(p.unitary_value)),
        })),
      );
      setSelectedJobs(
        enriched.jobs.map((j) => ({
          id: j.job.id,
          job: j.job,
          amount: j.amount,
          unitary_value: maskCurrencyInput(String(j.unitary_value)),
        })),
      );
      setDeliveryDate(enriched.detail.expected_delivery_date);
      setFreight(enriched.detail.freight > 0 ? maskCurrencyInput(String(enriched.detail.freight)) : '');
      setPaymentMethodId(enriched.detail.payment_method_id);
      setDiscount(enriched.detail.discount_percentage > 0 ? maskPercentageInput(String(enriched.detail.discount_percentage)) : '');
      setCurrentStep(4);
    } catch {
      toast.error('Erro ao carregar orçamento.');
      router.push(returnTo);
    } finally {
      setFormLoading(false);
    }
  }, [quoteId, router]);

  useEffect(() => {
    if (mode === 'edit' && !dataLoading) loadQuote();
  }, [mode, dataLoading, loadQuote]);

  const freightCents = parseCurrencyInputToCents(freight);
  const discountBasisPoints = parsePercentageInput(discount);
  const discountOver100 = discountBasisPoints >= 10000;

  const productItems = useMemo(
    () => selectedProducts.map((p) => ({ unitary_value: parseCurrencyInputToCents(p.unitary_value), amount: p.amount })),
    [selectedProducts],
  );
  const serviceItems = useMemo(
    () => selectedJobs.map((j) => ({ unitary_value: parseCurrencyInputToCents(j.unitary_value), amount: j.amount })),
    [selectedJobs],
  );

  const totals = useMemo(
    () => calcQuoteTotals(productItems, serviceItems, freightCents, discountBasisPoints),
    [productItems, serviceItems, freightCents, discountBasisPoints],
  );

  const selectedPaymentMethod = paymentMethods.find((pm) => pm.id === paymentMethodId);

  const paymentMinimumError = useMemo(() => {
    if (!selectedPaymentMethod || totals.netValue <= 0) return '';
    if (selectedPaymentMethod.allow_installments && selectedPaymentMethod.installment_count && selectedPaymentMethod.installment_count > 0) {
      const valuePerInstallment = Math.floor(totals.netValue / selectedPaymentMethod.installment_count);
      const minInstallment = selectedPaymentMethod.minimum_installment_amount ?? 0;
      if (minInstallment > 0 && valuePerInstallment < minInstallment) {
        return `Valor por parcela (${formatApiCurrency(valuePerInstallment)}) é inferior ao mínimo de ${formatApiCurrency(minInstallment)}`;
      }
    }
    if (selectedPaymentMethod.minimum_amount > 0 && totals.netValue < selectedPaymentMethod.minimum_amount) {
      return `Valor do orçamento (${formatApiCurrency(totals.netValue)}) é inferior ao mínimo de ${formatApiCurrency(selectedPaymentMethod.minimum_amount)}`;
    }
    return '';
  }, [selectedPaymentMethod, totals.netValue]);

  const steps: StepItem[] = [
    { id: 1, title: 'Cliente', description: 'Selecione o cliente', icon: <IconUser size={22} /> },
    { id: 2, title: 'Produtos e Serviços', description: 'Adicione itens', icon: <IconPackage size={22} /> },
    { id: 3, title: 'Valores', description: 'Configure valores', icon: <IconDollarSign size={22} /> },
    { id: 4, title: 'Resumo', description: 'Confirme o orçamento', icon: <IconClipboardCheck size={22} /> },
  ];

  function canAccessStep(stepId: number): boolean {
    if (stepId === 1) return true;
    if (stepId === 2) return selectedClient !== null;
    if (stepId === 3) return selectedClient !== null && (selectedProducts.length > 0 || selectedJobs.length > 0);
    if (stepId === 4) {
      return (
        selectedClient !== null &&
        (selectedProducts.length > 0 || selectedJobs.length > 0) &&
        deliveryDate !== '' &&
        paymentMethodId !== '' &&
        !paymentMinimumError
      );
    }
    return false;
  }

  function handleStepClick(stepId: number) {
    if (canAccessStep(stepId) || stepId < currentStep) {
      setCurrentStep(stepId);
    }
  }

  function handleSelectClient(client: Client) {
    setSelectedClient(client);
  }

  function handleToggleProduct(product: Product) {
    const exists = selectedProducts.find((p) => p.id === product.id);
    if (exists) {
      setSelectedProducts((prev) => prev.filter((p) => p.id !== product.id));
    } else {
      setSelectedProducts((prev) => [
        ...prev,
        {
          id: product.id,
          product,
          amount: 1,
          unitary_value: maskCurrencyInput(product.tax.sale_price),
        },
      ]);
    }
  }

  function handleToggleJob(job: Job) {
    const exists = selectedJobs.find((j) => j.id === job.id);
    if (exists) {
      setSelectedJobs((prev) => prev.filter((j) => j.id !== job.id));
    } else {
      setSelectedJobs((prev) => [
        ...prev,
        {
          id: job.id,
          job,
          amount: 1,
          unitary_value: maskCurrencyInput(
            String(Math.round(parseFloat(job.value.replace(/[^\d,]/g, '').replace(',', '.')) * 100)),
          ),
        },
      ]);
    }
  }

  function updateProductQty(id: string, delta: number) {
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, amount: Math.max(1, p.amount + delta) } : p,
      ),
    );
  }

  function updateProductPrice(id: string, value: string) {
    setSelectedProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, unitary_value: value } : p)),
    );
  }

  function removeProduct(id: string) {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
  }

  function updateJobQty(id: string, delta: number) {
    setSelectedJobs((prev) =>
      prev.map((j) =>
        j.id === id ? { ...j, amount: Math.max(1, j.amount + delta) } : j,
      ),
    );
  }

  function updateJobPrice(id: string, value: string) {
    setSelectedJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, unitary_value: value } : j)),
    );
  }

  function removeJob(id: string) {
    setSelectedJobs((prev) => prev.filter((j) => j.id !== id));
  }

  const paymentMethodOptions = useMemo(() => {
    return paymentMethods.map((pm) => {
      const installments = pm.installment_count ?? 0;
      const isInstallment = pm.allow_installments && installments > 0;
      const minLabel = isInstallment ? 'Valor mínimo da parcela' : 'Valor mínimo da venda';
      const minValue = isInstallment ? pm.minimum_installment_amount : pm.minimum_amount;
      return {
        value: pm.id,
        label: `${pm.name} - Parcelas (${installments}) - ${minLabel}: ${formatApiCurrency(minValue ?? 0)}`,
      };
    });
  }, [paymentMethods]);

  const isFormValid = useMemo(() => {
    return (
      selectedClient !== null &&
      (selectedProducts.length > 0 || selectedJobs.length > 0) &&
      deliveryDate !== '' &&
      paymentMethodId !== '' &&
      !paymentMinimumError &&
      !discountOver100
    );
  }, [selectedClient, selectedProducts, selectedJobs, deliveryDate, paymentMethodId, paymentMinimumError, discountOver100]);

  async function handleSubmit() {
    let hasError = false;
    if (!deliveryDate) { setDeliveryDateError('Data de entrega é obrigatória.'); hasError = true; } else { setDeliveryDateError(''); }
    if (!paymentMethodId) { setPaymentMethodError('Meio de pagamento é obrigatório.'); hasError = true; } else { setPaymentMethodError(''); }
    if (hasError || !isFormValid) return;

    const pm = paymentMethods.find((p) => p.id === paymentMethodId);

    const payload: CreateQuotePayload = {
      quote_code: '',
      client_id: selectedClient!.id,
      company_id: '',
      expected_delivery_date: deliveryDate,
      freight: freightCents,
      total_items_value: totals.totalItemsValue,
      total_quote_value: totals.totalQuoteValue,
      discount_percentage: discountBasisPoints,
      discount_value: totals.discountValue,
      net_value: totals.netValue,
      installments: pm?.installment_count ?? 0,
      payment_method_id: paymentMethodId,
      status: 'PENDING_APPROVAL',
      deleted: false,
      products: selectedProducts.map((p) => ({
        product_id: p.id,
        amount: p.amount,
        unitary_value: parseCurrencyInputToCents(p.unitary_value),
      })),
      services: selectedJobs.map((j) => ({
        service_id: j.id,
        amount: j.amount,
        unitary_value: parseCurrencyInputToCents(j.unitary_value),
      })),
    };

    try {
      if (mode === 'create') {
        await toast.promise(createQuote(payload), {
          loading: 'Criando orçamento...',
          success: 'Orçamento criado com sucesso.',
          error: (err: unknown) =>
            (err as { response?: { data?: { detail?: { message?: string } } } })
              ?.response?.data?.detail?.message ?? 'Erro ao criar orçamento.',
        });
      } else {
        await toast.promise(updateQuote(quoteId!, payload), {
          loading: 'Atualizando orçamento...',
          success: 'Orçamento atualizado com sucesso.',
          error: (err: unknown) =>
            (err as { response?: { data?: { detail?: { message?: string } } } })
              ?.response?.data?.detail?.message ?? 'Erro ao atualizar orçamento.',
        });
      }
      router.push(returnTo);
    } catch {
      // toast.promise handles error
    }
  }

  function handleDiscard(e: React.MouseEvent) {
    e.preventDefault();
    const hasChanges = selectedClient || selectedProducts.length > 0 || selectedJobs.length > 0 || deliveryDate || freight || paymentMethodId || discount;
    if (hasChanges) {
      setShowDiscardModal(true);
    } else {
      router.push(returnTo);
    }
  }

  function openGallery(images: string[], index: number) {
    setGalleryImages(images);
    setGalleryIndex(index);
    setGalleryOpen(true);
  }

  if (authLoading || (!authLoading && !canProceed)) return null;
  if (dataLoading || formLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="text-sm text-muted">Carregando...</span>
      </div>
    );
  }

  const totalProducts = productItems.reduce((sum, p) => sum + p.unitary_value * p.amount, 0);
  const totalServices = serviceItems.reduce((sum, s) => sum + s.unitary_value * s.amount, 0);

  return (
    <div className="pb-24">
      <FormHeader
        backHref="/quotes"
        onBackClick={handleDiscard}
        title={mode === 'create' ? 'Criar orçamento' : 'Editar orçamento'}
        description={mode === 'create' ? 'Preencha os dados do novo orçamento.' : 'Altere os dados do orçamento.'}
      />

      <div className="mb-8">
        <Stepper
          steps={steps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
          canAccessStep={canAccessStep}
        />
      </div>

      {currentStep === 1 && (
        <FormSection title="Cliente Selecionado">
          {!selectedClient ? (
            <div
              onClick={() => { setSlideSearch(''); setSlideOver({ isOpen: true, type: 'client' }); }}
              className="w-full border-2 border-dashed border-border hover:border-primary/50 bg-secondary hover:bg-secondary-hover rounded-(--radius-lg) p-12 flex flex-col items-center justify-center cursor-pointer transition-all group"
            >
              <div className="w-16 h-16 rounded-(--radius-full) bg-card flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-border">
                <IconUser size={32} className="text-muted group-hover:text-primary" />
              </div>
              <h3 className="text-lg font-bold text-heading mb-2">Selecione um cliente</h3>
              <p className="text-sm text-muted text-center max-w-sm mb-6">
                Busque na sua base de clientes cadastrados para vincular a este orçamento.
              </p>
              <Button variant="primary">Selecionar Cliente</Button>
            </div>
          ) : (
            <div className="bg-secondary border border-border rounded-(--radius-lg) p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-(--radius-lg) bg-primary flex items-center justify-center text-primary-fg shadow-lg shadow-primary/20">
                    <IconUser size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-heading uppercase">{getClientName(selectedClient)}</h3>
                    <p className="text-xs font-medium text-muted mt-0.5">
                      {getClientType(selectedClient) === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                      {selectedClient.identity.supplier && ' · Fornecedor'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setSlideSearch(''); setSlideOver({ isOpen: true, type: 'client' }); }}>
                    Alterar
                  </Button>
                  <StatusBadge label="Selecionado" variant="success" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Documento</p>
                  <p className="text-sm font-semibold text-foreground">{getClientDocument(selectedClient)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">E-mail</p>
                  <p className="text-sm font-semibold text-foreground">{selectedClient.contact.email || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Telefone</p>
                  <p className="text-sm font-semibold text-foreground">{selectedClient.contact.phone_number || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Código</p>
                  <p className="text-sm font-semibold text-foreground">{selectedClient.code || selectedClient.id.slice(0, 8)}</p>
                </div>
              </div>
            </div>
          )}
        </FormSection>
      )}

      {currentStep === 2 && (
        <div className="flex flex-col gap-6">
          <FormSection
            title="Produtos Selecionados"
            action={
              <Button
                variant="outline"
                size="sm"
                iconLeft={<IconPlus size={16} />}
                onClick={() => { setSlideSearch(''); setSlideOver({ isOpen: true, type: 'product' }); }}
              >
                Adicionar produto
              </Button>
            }
          >
            {selectedProducts.length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed border-border rounded-(--radius-lg) bg-secondary">
                <p className="text-muted font-medium">Nenhum produto selecionado</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-(--radius-lg) border border-border">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-secondary border-b border-border">
                      <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">Produto</th>
                      <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">Preço Unit.</th>
                      <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">Qtd</th>
                      <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">Subtotal</th>
                      <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider w-12" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {selectedProducts.map((sp) => {
                      const imgs = Object.values(sp.product.files ?? {});
                      const firstImg = imgs.length > 0 ? imgs[0] : null;
                      const subtotal = parseCurrencyInputToCents(sp.unitary_value) * sp.amount;
                      return (
                        <tr key={sp.id}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => imgs.length > 0 && openGallery(imgs, 0)}
                                className={[
                                  'shrink-0 w-10 h-10 rounded-(--radius-md) overflow-hidden border border-border bg-secondary flex items-center justify-center',
                                  imgs.length > 0 ? 'cursor-pointer hover:opacity-80 hover:border-primary' : 'cursor-default',
                                ].join(' ')}
                              >
                                {firstImg ? (
                                  <img src={firstImg} alt={sp.product.info.name} className="w-full h-full object-cover" />
                                ) : (
                                  <IconImage size={16} className="text-muted" />
                                )}
                              </button>
                              <div>
                                <p className="text-sm font-semibold text-foreground">{sp.product.info.name}</p>
                                <p className="text-xs text-muted">{sp.product.info.code || sp.id.slice(0, 8)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 w-44">
                            <CurrencyInput
                              label=""
                              value={sp.unitary_value}
                              onChange={(v) => updateProductPrice(sp.id, v)}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => updateProductQty(sp.id, -1)}
                                className="w-8 h-8 flex items-center justify-center rounded-(--radius-md) border border-border bg-secondary hover:bg-secondary-hover text-muted hover:text-foreground transition-colors"
                              >
                                <IconMinus size={14} />
                              </button>
                              <span className="text-sm font-semibold text-foreground w-8 text-center">{sp.amount}</span>
                              <button
                                type="button"
                                onClick={() => updateProductQty(sp.id, 1)}
                                className="w-8 h-8 flex items-center justify-center rounded-(--radius-md) border border-border bg-secondary hover:bg-secondary-hover text-muted hover:text-foreground transition-colors"
                              >
                                <IconPlus size={14} />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-semibold text-foreground">{formatApiCurrency(subtotal)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => removeProduct(sp.id)}
                              className="p-1.5 text-muted hover:text-destructive hover:bg-destructive/10 rounded-(--radius-md) transition-colors"
                            >
                              <IconTrash size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </FormSection>

          <FormSection
            title="Serviços Selecionados"
            action={
              <Button
                variant="outline"
                size="sm"
                iconLeft={<IconPlus size={16} />}
                onClick={() => { setSlideSearch(''); setSlideOver({ isOpen: true, type: 'service' }); }}
              >
                Adicionar serviço
              </Button>
            }
          >
            {selectedJobs.length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed border-border rounded-(--radius-lg) bg-secondary">
                <p className="text-muted font-medium">Nenhum serviço selecionado</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-(--radius-lg) border border-border">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-secondary border-b border-border">
                      <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">Serviço</th>
                      <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">Preço Unit.</th>
                      <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">Qtd</th>
                      <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">Subtotal</th>
                      <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider w-12" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {selectedJobs.map((sj) => {
                      const subtotal = parseCurrencyInputToCents(sj.unitary_value) * sj.amount;
                      return (
                        <tr key={sj.id}>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{sj.job.service_name}</p>
                              <p className="text-xs text-muted">Cód: {sj.job.service_code || sj.id.slice(0, 8)}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 w-44">
                            <CurrencyInput
                              label=""
                              value={sj.unitary_value}
                              onChange={(v) => updateJobPrice(sj.id, v)}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => updateJobQty(sj.id, -1)}
                                className="w-8 h-8 flex items-center justify-center rounded-(--radius-md) border border-border bg-secondary hover:bg-secondary-hover text-muted hover:text-foreground transition-colors"
                              >
                                <IconMinus size={14} />
                              </button>
                              <span className="text-sm font-semibold text-foreground w-8 text-center">{sj.amount}</span>
                              <button
                                type="button"
                                onClick={() => updateJobQty(sj.id, 1)}
                                className="w-8 h-8 flex items-center justify-center rounded-(--radius-md) border border-border bg-secondary hover:bg-secondary-hover text-muted hover:text-foreground transition-colors"
                              >
                                <IconPlus size={14} />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-semibold text-foreground">{formatApiCurrency(subtotal)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => removeJob(sj.id)}
                              className="p-1.5 text-muted hover:text-destructive hover:bg-destructive/10 rounded-(--radius-md) transition-colors"
                            >
                              <IconTrash size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </FormSection>
        </div>
      )}

      {currentStep === 3 && (
        <FormSection title="Configurações Financeiras">
          <FormGrid cols={2} gap={4}>
            <FormField
              label="Data prevista de entrega"
              type="date"
              value={deliveryDate}
              onChange={(e) => { setDeliveryDate(e.target.value); setDeliveryDateError(''); }}
              required
              error={deliveryDateError}
              min={new Date().toISOString().split('T')[0]}
            />
            <CurrencyInput
              label="Valor do frete"
              value={freight}
              onChange={setFreight}
            />
            <SearchableSelect
              label="Tipo de pagamento"
              required
              value={paymentMethodId}
              onChange={(v) => { setPaymentMethodId(v); setPaymentMethodError(''); }}
              options={paymentMethodOptions}
              placeholder="Selecione a forma de pagamento"
              error={paymentMethodError || paymentMinimumError}
            />
            <PercentageInput
              label="Desconto (%)"
              value={discount}
              onChange={(v) => { setDiscount(v); setDiscountError(''); }}
              error={discountOver100 ? 'O desconto não pode ser igual ou superior a 100%.' : discountError}
            />
          </FormGrid>
        </FormSection>
      )}

      {currentStep === 4 && (
        <div className="flex flex-col gap-6">
          <FormSection title="Cliente">
            {selectedClient && (
              <div className="bg-secondary border border-border rounded-(--radius-lg) p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-(--radius-lg) bg-primary flex items-center justify-center text-primary-fg shadow-lg shadow-primary/20">
                      <IconUser size={24} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-heading uppercase">{getClientName(selectedClient)}</h3>
                      <p className="text-xs font-medium text-muted mt-0.5">
                        {getClientType(selectedClient) === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                        {selectedClient.identity.supplier && ' · Fornecedor'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Documento</p>
                    <p className="text-sm font-semibold text-foreground">{getClientDocument(selectedClient)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">E-mail</p>
                    <p className="text-sm font-semibold text-foreground">{selectedClient.contact.email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Telefone</p>
                    <p className="text-sm font-semibold text-foreground">{selectedClient.contact.phone_number || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Código</p>
                    <p className="text-sm font-semibold text-foreground">{selectedClient.code || selectedClient.id.slice(0, 8)}</p>
                  </div>
                </div>
              </div>
            )}
          </FormSection>

          {selectedProducts.length > 0 && (
            <FormSection title="Produtos">
              <div className="flex flex-col gap-3">
                {selectedProducts.map((sp) => {
                  const imgs = Object.values(sp.product.files ?? {});
                  const firstImg = imgs.length > 0 ? imgs[0] : null;
                  const subtotal = parseCurrencyInputToCents(sp.unitary_value) * sp.amount;
                  return (
                    <div key={sp.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-secondary p-4 rounded-(--radius-lg) border border-border gap-4">
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => imgs.length > 0 && openGallery(imgs, 0)}
                          className={[
                            'shrink-0 w-10 h-10 rounded-(--radius-md) overflow-hidden border border-border bg-card flex items-center justify-center',
                            imgs.length > 0 ? 'cursor-pointer hover:opacity-80 hover:border-primary' : 'cursor-default',
                          ].join(' ')}
                        >
                          {firstImg ? (
                            <img src={firstImg} alt={sp.product.info.name} className="w-full h-full object-cover" />
                          ) : (
                            <IconImage size={16} className="text-muted" />
                          )}
                        </button>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{sp.product.info.name}</p>
                          <p className="text-xs text-muted">{sp.product.info.code || sp.id.slice(0, 8)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div>
                          <p className="text-xs text-muted">Qtd</p>
                          <p className="font-semibold text-foreground">{sp.amount}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted">Unit.</p>
                          <p className="font-semibold text-foreground">{formatApiCurrency(parseCurrencyInputToCents(sp.unitary_value))}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted">Subtotal</p>
                          <p className="font-bold text-foreground">{formatApiCurrency(subtotal)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </FormSection>
          )}

          {selectedJobs.length > 0 && (
            <FormSection title="Serviços">
              <div className="flex flex-col gap-3">
                {selectedJobs.map((sj) => {
                  const subtotal = parseCurrencyInputToCents(sj.unitary_value) * sj.amount;
                  return (
                    <div key={sj.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-secondary p-4 rounded-(--radius-lg) border border-border gap-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{sj.job.service_name}</p>
                        <p className="text-xs text-muted">Cód: {sj.job.service_code || sj.id.slice(0, 8)}</p>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div>
                          <p className="text-xs text-muted">Qtd</p>
                          <p className="font-semibold text-foreground">{sj.amount}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted">Unit.</p>
                          <p className="font-semibold text-foreground">{formatApiCurrency(parseCurrencyInputToCents(sj.unitary_value))}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted">Subtotal</p>
                          <p className="font-bold text-foreground">{formatApiCurrency(subtotal)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </FormSection>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormSection title="Entrega e Pagamento">
              <div className="space-y-5 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Data prevista de entrega</p>
                    <p className="font-bold text-heading">
                      {deliveryDate ? new Date(deliveryDate + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
                    </p>
                  </div>
                </div>
                {selectedPaymentMethod && (
                  <div className="border-t border-border pt-4">
                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-3">Meio de pagamento</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Nome</p>
                        <p className="font-bold text-heading">{selectedPaymentMethod.name}</p>
                      </div>
                      {selectedPaymentMethod.provider && (
                        <div>
                          <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Provedor</p>
                          <p className="font-semibold text-foreground">{selectedPaymentMethod.provider}</p>
                        </div>
                      )}
                      {selectedPaymentMethod.method_info && (
                        <div>
                          <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Informações</p>
                          <p className="font-semibold text-foreground">{selectedPaymentMethod.method_info}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Parcelamento</p>
                        <p className="font-semibold text-foreground">
                          {selectedPaymentMethod.allow_installments && (selectedPaymentMethod.installment_count ?? 0) > 0
                            ? `${selectedPaymentMethod.installment_count}x`
                            : 'À vista'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Valor mínimo da venda</p>
                        <p className="font-semibold text-foreground">{formatApiCurrency(selectedPaymentMethod.minimum_amount)}</p>
                      </div>
                      {selectedPaymentMethod.allow_installments && (selectedPaymentMethod.minimum_installment_amount ?? 0) > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Valor mínimo da parcela</p>
                          <p className="font-semibold text-foreground">{formatApiCurrency(selectedPaymentMethod.minimum_installment_amount ?? 0)}</p>
                        </div>
                      )}
                      {selectedPaymentMethod.allow_installments && (selectedPaymentMethod.installment_count ?? 0) > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Valor por parcela</p>
                          <p className={`font-bold ${paymentMinimumError ? 'text-destructive' : 'text-success'}`}>
                            {formatApiCurrency(Math.floor(totals.netValue / (selectedPaymentMethod.installment_count ?? 1)))}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </FormSection>

            <div className="bg-card border border-primary/30 rounded-(--radius-lg) p-6 relative overflow-hidden shadow-lg shadow-primary/5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full pointer-events-none" />
              <div className="space-y-3 text-sm mb-5 border-b border-border pb-5 relative z-10">
                <div className="flex justify-between">
                  <span className="text-muted">Valor dos produtos:</span>
                  <span className="font-medium text-foreground">{formatApiCurrency(totalProducts)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Valor dos serviços:</span>
                  <span className="font-medium text-foreground">{formatApiCurrency(totalServices)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Valor do frete:</span>
                  <span className="font-medium text-foreground">{formatApiCurrency(freightCents)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Desconto ({discount || '0,00'}%):</span>
                  <span className="font-medium text-destructive">-{formatApiCurrency(totals.discountValue)}</span>
                </div>
              </div>
              <div className="flex justify-between items-end relative z-10">
                <span className="text-base font-bold text-heading">Valor final:</span>
                <span className="text-2xl font-black text-success tracking-tight">{formatApiCurrency(totals.netValue)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between border-t border-border pt-6 gap-4">
        <div>
          <Button variant="outline" onClick={handleDiscard}>
            Cancelar
          </Button>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          {currentStep > 1 && (
            <Button
              variant="secondary"
              onClick={() => setCurrentStep((prev) => prev - 1)}
            >
              Voltar
            </Button>
          )}
          {currentStep < 4 ? (
            <Button
              variant="primary"
              onClick={() => canAccessStep(currentStep + 1) && setCurrentStep((prev) => prev + 1)}
              disabled={!canAccessStep(currentStep + 1)}
            >
              Próximo
            </Button>
          ) : (
            <Button
              variant="primary"
              iconLeft={<IconSave size={18} />}
              onClick={handleSubmit}
              disabled={!isFormValid}
            >
              {mode === 'create' ? 'Salvar Orçamento' : 'Atualizar Orçamento'}
            </Button>
          )}
        </div>
      </div>

      <ModalConfirm
        isOpen={showDiscardModal}
        onClose={() => setShowDiscardModal(false)}
        variant="warning"
        title="Descartar alterações"
        description="Tem certeza que deseja descartar as alterações? Todos os dados preenchidos serão perdidos."
        confirmLabel="Descartar"
        cancelLabel="Continuar editando"
        onConfirm={() => router.push(returnTo)}
      />

      <ItemSelectorPanel<Client>
        isOpen={slideOver.isOpen && slideOver.type === 'client'}
        onClose={() => setSlideOver({ isOpen: false, type: null })}
        title="Selecionar Cliente"
        items={panelClients}
        isLoading={panelLoading}
        selectedIds={selectedClient ? [selectedClient.id] : []}
        onToggle={handleSelectClient}
        getId={(c) => c.id}
        renderItem={(c) => (
          <div>
            <h3 className="font-bold text-sm text-foreground">{getClientName(c)}</h3>
            <p className="text-xs text-muted mt-0.5">
              {getClientDocument(c)}
              {c.identity.supplier && ' · Fornecedor'}
            </p>
          </div>
        )}
        searchValue={slideSearch}
        onSearchChange={setSlideSearch}
        mode="single"
      />

      <ItemSelectorPanel<Product>
        isOpen={slideOver.isOpen && slideOver.type === 'product'}
        onClose={() => setSlideOver({ isOpen: false, type: null })}
        title="Adicionar Produto"
        items={panelProducts}
        isLoading={panelLoading}
        selectedIds={selectedProducts.map((p) => p.id)}
        onToggle={handleToggleProduct}
        getId={(p) => p.id}
        renderItem={(p) => {
          const imgs = Object.values(p.files ?? {});
          const firstImg = imgs.length > 0 ? imgs[0] : null;
          return (
            <div className="flex items-center gap-3">
              <div className="shrink-0 w-10 h-10 rounded-(--radius-md) overflow-hidden border border-border bg-card flex items-center justify-center">
                {firstImg ? (
                  <img src={firstImg} alt={p.info.name} className="w-full h-full object-cover" />
                ) : (
                  <IconImage size={16} className="text-muted" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">{p.info.name}</h3>
                <p className="text-xs text-muted mt-0.5">
                  Cód: {p.info.code || p.id.slice(0, 8)} · {formatApiCurrency(p.tax.sale_price)}
                </p>
              </div>
            </div>
          );
        }}
        searchValue={slideSearch}
        onSearchChange={setSlideSearch}
        mode="multi"
      />

      <ItemSelectorPanel<Job>
        isOpen={slideOver.isOpen && slideOver.type === 'service'}
        onClose={() => setSlideOver({ isOpen: false, type: null })}
        title="Adicionar Serviço"
        items={panelJobs}
        isLoading={panelLoading}
        selectedIds={selectedJobs.map((j) => j.id)}
        onToggle={handleToggleJob}
        getId={(j) => j.id}
        renderItem={(j) => (
          <div>
            <h3 className="font-bold text-sm text-foreground">{j.service_name}</h3>
            <p className="text-xs text-muted mt-0.5">
              Cód: {j.service_code || j.id.slice(0, 8)} · {j.value}
            </p>
          </div>
        )}
        searchValue={slideSearch}
        onSearchChange={setSlideSearch}
        mode="multi"
      />

      <ImageGalleryModal
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        images={galleryImages}
        initialIndex={galleryIndex}
        title="Fotos do produto"
      />
    </div>
  );
}
