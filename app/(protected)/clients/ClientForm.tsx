'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { BrasilAPI } from '@matheustrres/brasilapi';
import { useAuth } from '@/hooks/useAuth';
import { FormHeader } from '@/components/ui/FormHeader/FormHeader';
import { FormSection } from '@/components/ui/FormSection/FormSection';
import { FormField } from '@/components/ui/FormField/FormField';
import { FormGrid } from '@/components/ui/FormGrid/FormGrid';
import { PillSelector } from '@/components/ui/PillSelector/PillSelector';
import { SwitchCard } from '@/components/ui/SwitchCard/SwitchCard';
import { TextArea } from '@/components/ui/TextArea/TextArea';
import { Button } from '@/components/ui/Button/Button';
import { ModalConfirm } from '@/components/ui/Modal/ModalConfirm';
import { DynamicListField } from '@/components/ui/DynamicListField/DynamicListField';
import { ContactPersonCard } from '@/components/ui/ContactPersonCard/ContactPersonCard';
import { IconSave, IconPhone, IconMail, IconUser, IconPlus } from '@/components/icons';
import { DynamicListItem } from '@/types/ui/dynamic-list-field.types';
import { ContactPerson } from '@/types/ui/contact-person-card.types';
import { ClientFormProps } from '@/types/entities/client/client.types';
import {
  getClientById,
  createCompanyClient,
  createIndividualClient,
  updateCompanyClient,
  updateIndividualClient,
  toggleClientStatus,
  isCompanyClient,
  ClientType,
} from './clients.facade';
import {
  formatCpf,
  rawCpf,
  formatCnpj,
  rawCnpj,
  formatCep,
  rawCep,
  formatPhone,
  rawPhone,
  validateCpf,
  validateCnpj,
} from '@/utils/document';

const brasilApi = new BrasilAPI();

const CLIENT_TYPE_OPTIONS = [
  { value: 'PJ', label: 'Pessoa Jurídica' },
  { value: 'PF', label: 'Pessoa Física' },
];

export function ClientForm({ mode, clientId, isSupplier }: ClientFormProps) {
  const router = useRouter();
  const { hasPermission, isLoading: authLoading } = useAuth();
  const backHref = isSupplier ? '/suppliers' : '/clients';
  const entityLabel = isSupplier ? 'fornecedor' : 'cliente';
  const entityLabelCap = isSupplier ? 'Fornecedor' : 'Cliente';

  const canProceed = mode === 'create'
    ? hasPermission('clients', 'create')
    : hasPermission('clients', 'edit');

  useEffect(() => {
    if (!authLoading && !canProceed) router.replace('/dashboard');
  }, [authLoading, canProceed, router]);

  const [clientType, setClientType] = useState<ClientType>('PJ');
  const [code, setCode] = useState('');

  const [cnpj, setCnpj] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyFantasyName, setCompanyFantasyName] = useState('');
  const [cityRegistration, setCityRegistration] = useState('');
  const [stateRegistration, setStateRegistration] = useState('');
  const [isentoIe, setIsentoIe] = useState(false);
  const [taxRegime, setTaxRegime] = useState('');
  const [rateDifferential, setRateDifferential] = useState('');

  const [cpf, setCpf] = useState('');
  const [personName, setPersonName] = useState('');
  const [personFantasyName, setPersonFantasyName] = useState('');

  const [cep, setCep] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [street, setStreet] = useState('');
  const [streetNumber, setStreetNumber] = useState('');

  const [phones, setPhones] = useState<DynamicListItem[]>([{ value: '', department: '' }]);
  const [emails, setEmails] = useState<DynamicListItem[]>([{ value: '', department: '' }]);
  const [contactPersons, setContactPersons] = useState<ContactPerson[]>([
    { name: '', phone: '', department: '', isExtension: false },
  ]);

  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [comercialReferences, setComercialReferences] = useState('');
  const [defaulter, setDefaulter] = useState(false);

  const [cnpjError, setCnpjError] = useState('');
  const [companyNameError, setCompanyNameError] = useState('');
  const [companyFantasyNameError, setCompanyFantasyNameError] = useState('');
  const [cpfError, setCpfError] = useState('');
  const [personNameError, setPersonNameError] = useState('');
  const [cepError, setCepError] = useState('');
  const [stateError, setStateError] = useState('');
  const [cityError, setCityError] = useState('');
  const [districtError, setDistrictError] = useState('');
  const [streetError, setStreetError] = useState('');
  const [streetNumberError, setStreetNumberError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(mode === 'edit');
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const cnpjRef = useRef<HTMLDivElement>(null);
  const cpfRef = useRef<HTMLDivElement>(null);
  const companyNameRef = useRef<HTMLDivElement>(null);
  const personNameRef = useRef<HTMLDivElement>(null);
  const cepRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLDivElement>(null);

  const cepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadClient = useCallback(async () => {
    if (mode !== 'edit' || !clientId) return;
    setIsFetching(true);
    try {
      const client = await getClientById(clientId);
      setCode(client.code ?? '');
      setDefaulter(client.identity.defaulter);

      if (isCompanyClient(client.identity)) {
        setClientType('PJ');
        setCnpj(formatCnpj(client.identity.cnpj));
        setCompanyName(client.identity.company_name);
        setCompanyFantasyName(client.identity.company_fantasy_name);
        setCityRegistration(client.identity.company_city_registration);
        setStateRegistration(client.identity.company_state_registration);
        setTaxRegime(client.identity.tax_regime);
        setRateDifferential(client.identity.rate_differential);
        if (!client.identity.company_state_registration) setIsentoIe(true);
      } else {
        setClientType('PF');
        setCpf(formatCpf(client.identity.cpf));
        setPersonName(client.identity.name);
        setPersonFantasyName(client.identity.fantasy_name);
      }

      setCep(formatCep(client.address.cep));
      setState(client.address.state);
      setCity(client.address.city);
      setDistrict(client.address.district);
      setStreet(client.address.street);
      setStreetNumber(client.address.street_number);

      const phonesList: DynamicListItem[] = [
        { value: formatPhone(client.contact.phone_number), department: client.contact.email_department ?? '' },
      ];
      if (client.contact.additional_phone_numbers?.length) {
        client.contact.additional_phone_numbers.forEach((p) => {
          phonesList.push({ value: formatPhone(p.number), department: p.department });
        });
      }
      setPhones(phonesList);

      const emailsList: DynamicListItem[] = [
        { value: client.contact.email, department: client.contact.email_department ?? '' },
      ];
      if (client.contact.additional_emails?.length) {
        client.contact.additional_emails.forEach((e) => {
          emailsList.push({ value: e.email, department: e.department });
        });
      }
      setEmails(emailsList);

      if (client.contact.contact_persons?.length) {
        setContactPersons(
          client.contact.contact_persons.map((cp) => ({
            name: cp.name,
            phone: cp.phone ? formatPhone(cp.phone) : '',
            department: cp.department,
            isExtension: cp.isExtension,
          })),
        );
      }

      setInstagram(client.contact.instagram ?? '');
      setFacebook(client.contact.facebook ?? '');
      setComercialReferences(client.contact.comercial_references ?? '');
    } catch {
      toast.error(`Erro ao carregar dados do ${entityLabel}.`);
    } finally {
      setIsFetching(false);
    }
  }, [mode, clientId, entityLabel]);

  useEffect(() => {
    loadClient();
  }, [loadClient]);

  function handleCepChange(value: string) {
    const formatted = formatCep(value);
    setCep(formatted);
    setCepError('');

    const digits = rawCep(formatted);
    if (cepTimerRef.current) clearTimeout(cepTimerRef.current);
    if (digits.length === 8) {
      cepTimerRef.current = setTimeout(() => {
        fetchCepData(digits);
      }, 600);
    }
  }

  async function fetchCepData(cepDigits: string) {
    try {
      const response = await brasilApi.CEPs.get(cepDigits);
      const result = response?.data;
      if (result?.state) setState(result.state);
      if (result?.city) setCity(result.city);
      if (result?.neighborhood) setDistrict(result.neighborhood);
      if (result?.street) setStreet(result.street);
    } catch {
      toast.error('CEP não encontrado.');
    }
  }

  function scrollToRef(ref: React.RefObject<HTMLDivElement | null>) {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const input = ref.current.querySelector<HTMLInputElement>('input');
      input?.focus();
    }
  }

  function validateForm(): boolean {
    let hasError = false;
    let firstRef: React.RefObject<HTMLDivElement | null> | null = null;

    function setFirst(ref: React.RefObject<HTMLDivElement | null>) {
      if (!firstRef) firstRef = ref;
    }

    if (clientType === 'PJ') {
      const cnpjDigits = rawCnpj(cnpj);
      if (!cnpjDigits || cnpjDigits.length < 14) {
        setCnpjError('CNPJ deve ter 14 dígitos.');
        setFirst(cnpjRef);
        hasError = true;
      } else if (!validateCnpj(cnpjDigits)) {
        setCnpjError('CNPJ inválido.');
        setFirst(cnpjRef);
        hasError = true;
      }
      if (!companyName.trim()) {
        setCompanyNameError('Razão Social é obrigatória.');
        setFirst(companyNameRef);
        hasError = true;
      }
      if (!companyFantasyName.trim()) {
        setCompanyFantasyNameError('Nome Fantasia é obrigatório.');
        setFirst(companyNameRef);
        hasError = true;
      }
    } else {
      const cpfDigits = rawCpf(cpf);
      if (!cpfDigits || cpfDigits.length < 11) {
        setCpfError('CPF deve ter 11 dígitos.');
        setFirst(cpfRef);
        hasError = true;
      } else if (!validateCpf(cpfDigits)) {
        setCpfError('CPF inválido.');
        setFirst(cpfRef);
        hasError = true;
      }
      if (!personName.trim()) {
        setPersonNameError('Nome Completo é obrigatório.');
        setFirst(personNameRef);
        hasError = true;
      }
    }

    if (!rawCep(cep) || rawCep(cep).length < 8) {
      setCepError('CEP é obrigatório.');
      setFirst(cepRef);
      hasError = true;
    }
    if (!state.trim()) {
      setStateError('Estado é obrigatório.');
      hasError = true;
    }
    if (!city.trim()) {
      setCityError('Cidade é obrigatória.');
      hasError = true;
    }
    if (!district.trim()) {
      setDistrictError('Bairro é obrigatório.');
      hasError = true;
    }
    if (!street.trim()) {
      setStreetError('Rua é obrigatória.');
      hasError = true;
    }
    if (!streetNumber.trim()) {
      setStreetNumberError('Número é obrigatório.');
      hasError = true;
    }

    if (!rawPhone(phones[0]?.value)) {
      setPhoneError('Telefone principal é obrigatório.');
      setFirst(phoneRef);
      hasError = true;
    }
    if (!emails[0]?.value.trim()) {
      setEmailError('E-mail principal é obrigatório.');
      setFirst(emailRef);
      hasError = true;
    }

    if (firstRef) scrollToRef(firstRef);
    return !hasError;
  }

  async function handleStatusToggle() {
    if (mode !== 'edit' || !clientId) return;
    try {
      await toast.promise(
        toggleClientStatus(clientId),
        {
          loading: 'Alterando status...',
          success: 'Status alterado com sucesso.',
          error: (err: unknown) =>
            (err as { response?: { data?: { detail?: { message?: string } } } })
              ?.response?.data?.detail?.message ?? 'Erro ao alterar status.',
        },
      );
      setDefaulter((prev) => !prev);
    } catch {
      //
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const address = {
        cep: rawCep(cep),
        state,
        city,
        district,
        street,
        street_number: streetNumber,
      };

      const additionalPhones = phones.slice(1).map((p) => ({
        number: rawPhone(p.value),
        department: p.department,
      }));

      const additionalEmails = emails.slice(1).map((e) => ({
        email: e.value,
        department: e.department,
      }));

      const contactPersonsPayload = contactPersons
        .filter((cp) => cp.name.trim())
        .map((cp) => ({
          name: cp.name,
          phone: cp.phone,
          department: cp.department,
          isExtension: cp.isExtension,
        }));

      if (clientType === 'PJ') {
        const payload = {
          identity: {
            cnpj: rawCnpj(cnpj),
            company_name: companyName,
            company_fantasy_name: companyFantasyName,
            company_city_registration: cityRegistration,
            company_state_registration: isentoIe ? '' : stateRegistration,
            tax_regime: taxRegime,
            rate_differential: rateDifferential,
            defaulter,
            supplier: isSupplier,
            prospection: false,
          },
          address,
          contact: {
            email: emails[0].value,
            email_department: emails[0].department,
            additional_emails: additionalEmails,
            phone_number: rawPhone(phones[0].value),
            additional_phone_numbers: additionalPhones,
            website: '',
            comercial_references: comercialReferences,
            instagram,
            facebook,
            contact_persons: contactPersonsPayload,
          },
          id: mode === 'edit' ? clientId! : '',
        };

        if (mode === 'create') {
          await toast.promise(createCompanyClient(payload), {
            loading: `Criando ${entityLabel}...`,
            success: `${entityLabelCap} criado com sucesso.`,
            error: (err: unknown) =>
              (err as { response?: { data?: { detail?: { message?: string } } } })
                ?.response?.data?.detail?.message ?? `Erro ao criar ${entityLabel}.`,
          });
        } else {
          await toast.promise(updateCompanyClient(clientId!, payload), {
            loading: 'Salvando alterações...',
            success: `${entityLabelCap} atualizado com sucesso.`,
            error: (err: unknown) =>
              (err as { response?: { data?: { detail?: { message?: string } } } })
                ?.response?.data?.detail?.message ?? `Erro ao salvar ${entityLabel}.`,
          });
        }
      } else {
        const payload = {
          identity: {
            cpf: rawCpf(cpf),
            name: personName,
            fantasy_name: personFantasyName,
            defaulter,
            supplier: isSupplier,
            prospection: false,
          },
          address,
          contact: {
            email: emails[0].value,
            email_department: emails[0].department,
            additional_emails: additionalEmails,
            phone_number: rawPhone(phones[0].value),
            additional_phone_numbers: additionalPhones,
            website_information: '',
            instagram,
            facebook,
            contact_persons: contactPersonsPayload,
          },
          id: mode === 'edit' ? clientId! : '',
          code: mode === 'edit' ? code : '',
        };

        if (mode === 'create') {
          await toast.promise(createIndividualClient(payload), {
            loading: `Criando ${entityLabel}...`,
            success: `${entityLabelCap} criado com sucesso.`,
            error: (err: unknown) =>
              (err as { response?: { data?: { detail?: { message?: string } } } })
                ?.response?.data?.detail?.message ?? `Erro ao criar ${entityLabel}.`,
          });
        } else {
          await toast.promise(updateIndividualClient(clientId!, payload), {
            loading: 'Salvando alterações...',
            success: `${entityLabelCap} atualizado com sucesso.`,
            error: (err: unknown) =>
              (err as { response?: { data?: { detail?: { message?: string } } } })
                ?.response?.data?.detail?.message ?? `Erro ao salvar ${entityLabel}.`,
          });
        }
      }

      router.push(backHref);
    } catch {
      //
    } finally {
      setIsSubmitting(false);
    }
  }

  function addContactPerson() {
    setContactPersons((prev) => [...prev, { name: '', phone: '', department: '', isExtension: false }]);
  }

  function handleCnpjBlur() {
    const digits = rawCnpj(cnpj);
    if (!digits) return;
    if (digits.length < 14) {
      setCnpjError('CNPJ deve ter 14 dígitos.');
    } else if (!validateCnpj(digits)) {
      setCnpjError('CNPJ inválido.');
    }
  }

  function handleCpfBlur() {
    const digits = rawCpf(cpf);
    if (!digits) return;
    if (digits.length < 11) {
      setCpfError('CPF deve ter 11 dígitos.');
    } else if (!validateCpf(digits)) {
      setCpfError('CPF inválido.');
    }
  }

  function updateContactPerson(index: number, person: ContactPerson) {
    setContactPersons((prev) => {
      const updated = [...prev];
      updated[index] = person;
      return updated;
    });
  }

  function removeContactPerson(index: number) {
    setContactPersons((prev) => prev.filter((_, i) => i !== index));
  }

  const hasErrors = !!(
    cnpjError || companyNameError || companyFantasyNameError ||
    cpfError || personNameError ||
    cepError || stateError || cityError || districtError || streetError || streetNumberError ||
    phoneError || emailError
  );

  const isRequiredFilled = clientType === 'PJ'
    ? (
      rawCnpj(cnpj).length === 14 &&
      companyName.trim().length > 0 &&
      companyFantasyName.trim().length > 0 &&
      rawCep(cep).length === 8 &&
      state.trim().length > 0 &&
      city.trim().length > 0 &&
      district.trim().length > 0 &&
      street.trim().length > 0 &&
      streetNumber.trim().length > 0 &&
      rawPhone(phones[0]?.value ?? '').length >= 10 &&
      (emails[0]?.value ?? '').trim().length > 0
    )
    : (
      rawCpf(cpf).length === 11 &&
      personName.trim().length > 0 &&
      rawCep(cep).length === 8 &&
      state.trim().length > 0 &&
      city.trim().length > 0 &&
      district.trim().length > 0 &&
      street.trim().length > 0 &&
      streetNumber.trim().length > 0 &&
      rawPhone(phones[0]?.value ?? '').length >= 10 &&
      (emails[0]?.value ?? '').trim().length > 0
    );

  const isSaveDisabled = isSubmitting || isFetching || hasErrors || !isRequiredFilled;

  if (authLoading || (!authLoading && !canProceed)) return null;

  return (
    <form onSubmit={handleSubmit}>
      <FormHeader
        backHref={backHref}
        onBackClick={(e) => { e.preventDefault(); setShowDiscardModal(true); }}
        title={mode === 'create' ? `Criar ${entityLabel}` : `Editar ${entityLabel}`}
        description={
          mode === 'create'
            ? `Preencha os dados cadastrais, endereço e informações de contato do ${entityLabel}.`
            : `Atualize os dados do ${entityLabel}.`
        }
      />

      <div className="flex flex-col gap-6">
        <FormSection title="Dados Principais">
          <div className="flex flex-col gap-6">
            <PillSelector
              label="Tipo de pessoa"
              required
              options={CLIENT_TYPE_OPTIONS}
              value={clientType}
              onChange={(v) => setClientType(v as ClientType)}
              size="md"
              disabled={mode === 'edit'}
            />

            {clientType === 'PJ' && (
              <FormGrid cols={3}>
                {mode === 'edit' && (
                  <FormField
                    label="Código"
                    type="text"
                    value={code}
                    disabled
                    copy
                    onChange={() => {}}
                  />
                )}
                <div ref={cnpjRef}>
                  <FormField
                    label="CNPJ"
                    type="text"
                    value={cnpj}
                    onChange={(e) => { setCnpj(formatCnpj(e.target.value)); setCnpjError(''); }}
                    placeholder="00.000.000/0000-00"
                    required
                    error={cnpjError}
                    onBlur={handleCnpjBlur}
                  />
                </div>
                <div ref={companyNameRef}>
                  <FormField
                    label="Razão Social"
                    type="text"
                    value={companyName}
                    onChange={(e) => { setCompanyName(e.target.value); setCompanyNameError(''); }}
                    placeholder="Razão social completa"
                    required
                    error={companyNameError}
                    onBlur={() => { if (!companyName.trim()) setCompanyNameError('Razão Social é obrigatória.'); }}
                  />
                </div>
                <FormField
                  label="Nome Fantasia"
                  type="text"
                  value={companyFantasyName}
                  onChange={(e) => { setCompanyFantasyName(e.target.value); setCompanyFantasyNameError(''); }}
                  placeholder="Nome fantasia"
                  required
                  error={companyFantasyNameError}
                  onBlur={() => { if (!companyFantasyName.trim()) setCompanyFantasyNameError('Nome Fantasia é obrigatório.'); }}
                />
                <FormField
                  label="Inscrição Municipal"
                  type="text"
                  value={cityRegistration}
                  onChange={(e) => setCityRegistration(e.target.value)}
                  placeholder="Inscrição municipal"
                  maxLength={15}
                  showCount
                />
                <FormField
                  label="Inscrição Estadual"
                  type="text"
                  value={stateRegistration}
                  onChange={(e) => setStateRegistration(e.target.value)}
                  placeholder={isentoIe ? 'ISENTO' : 'Inscrição estadual'}
                  disabled={isentoIe}
                  maxLength={15}
                  showCount
                  inlineSwitch={{
                    checked: isentoIe,
                    onChange: setIsentoIe,
                    label: 'Isento',
                  }}
                />
                <FormField
                  label="Regime Tributário"
                  type="text"
                  value={taxRegime}
                  onChange={(e) => setTaxRegime(e.target.value)}
                  placeholder="Ex: Simples Nacional"
                  maxLength={20}
                  showCount
                />
                <FormField
                  label="Diferencial de Alíquota"
                  type="text"
                  value={rateDifferential}
                  onChange={(e) => setRateDifferential(e.target.value)}
                  placeholder="Diferencial"
                  maxLength={20}
                  showCount
                />
              </FormGrid>
            )}

            {clientType === 'PF' && (
              <FormGrid>
                {mode === 'edit' && (
                  <FormField
                    label="Código"
                    type="text"
                    value={code}
                    disabled
                    copy
                    onChange={() => {}}
                  />
                )}
                <div ref={cpfRef}>
                  <FormField
                    label="CPF"
                    type="text"
                    value={cpf}
                    onChange={(e) => { setCpf(formatCpf(e.target.value)); setCpfError(''); }}
                    placeholder="000.000.000-00"
                    required
                    error={cpfError}
                    onBlur={handleCpfBlur}
                  />
                </div>
                <div ref={personNameRef}>
                  <FormField
                    label="Nome Completo"
                    type="text"
                    value={personName}
                    onChange={(e) => { setPersonName(e.target.value); setPersonNameError(''); }}
                    placeholder="Nome da pessoa"
                    required
                    error={personNameError}
                    onBlur={() => { if (!personName.trim()) setPersonNameError('Nome Completo é obrigatório.'); }}
                  />
                </div>
                <div className="sm:col-span-2">
                  <FormField
                    label="Nome Fantasia (Opcional)"
                    type="text"
                    value={personFantasyName}
                    onChange={(e) => setPersonFantasyName(e.target.value)}
                    placeholder="Apelido ou nome comercial"
                  />
                </div>
              </FormGrid>
            )}
          </div>
        </FormSection>

        <FormSection title="Endereço">
          <FormGrid cols={3}>
            <div ref={cepRef}>
              <FormField
                label="CEP"
                type="text"
                value={cep}
                onChange={(e) => handleCepChange(e.target.value)}
                placeholder="00000-000"
                required
                error={cepError}
                onBlur={() => { if (rawCep(cep).length < 8 && cep.length > 0) setCepError('CEP deve ter 8 dígitos.'); }}
              />
            </div>
            <FormField
              label="Estado"
              type="text"
              value={state}
              onChange={(e) => { setState(e.target.value); setStateError(''); }}
              placeholder="Ex: SP"
              required
              error={stateError}
              onBlur={() => { if (!state.trim()) setStateError('Estado é obrigatório.'); }}
            />
            <FormField
              label="Cidade"
              type="text"
              value={city}
              onChange={(e) => { setCity(e.target.value); setCityError(''); }}
              placeholder="Nome da cidade"
              required
              error={cityError}
              onBlur={() => { if (!city.trim()) setCityError('Cidade é obrigatória.'); }}
            />
            <FormField
              label="Bairro"
              type="text"
              value={district}
              onChange={(e) => { setDistrict(e.target.value); setDistrictError(''); }}
              placeholder="Nome do bairro"
              required
              error={districtError}
              onBlur={() => { if (!district.trim()) setDistrictError('Bairro é obrigatório.'); }}
            />
            <div className="sm:col-span-2">
              <FormField
                label="Rua / Logradouro"
                type="text"
                value={street}
                onChange={(e) => { setStreet(e.target.value); setStreetError(''); }}
                placeholder="Avenida, Rua, Travessa..."
                required
                error={streetError}
                onBlur={() => { if (!street.trim()) setStreetError('Rua é obrigatória.'); }}
              />
            </div>
            <FormField
              label="Número"
              type="text"
              value={streetNumber}
              onChange={(e) => { setStreetNumber(e.target.value); setStreetNumberError(''); }}
              placeholder="Ex: 123"
              required
              error={streetNumberError}
              onBlur={() => { if (!streetNumber.trim()) setStreetNumberError('Número é obrigatório.'); }}
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Comunicação e Contatos">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-10">
            <div ref={phoneRef}>
              <DynamicListField
                label="WhatsApp / Telefones"
                icon={<IconPhone size={16} className="text-brand" />}
                items={phones}
                onChange={(items) => { setPhones(items); setPhoneError(''); }}
                valuePlaceholder="(00) 00000-0000"
                departmentPlaceholder="Setor (Ex: Financeiro)"
                valueFormatter={formatPhone}
              />
              {phoneError && <p className="text-xs text-destructive mt-1">{phoneError}</p>}
            </div>

            <div ref={emailRef}>
              <DynamicListField
                label="Endereços de E-mail"
                icon={<IconMail size={16} className="text-brand" />}
                items={emails}
                onChange={(items) => { setEmails(items); setEmailError(''); }}
                valuePlaceholder="email@empresa.com"
                departmentPlaceholder="Setor (Ex: Comercial)"
              />
              {emailError && <p className="text-xs text-destructive mt-1">{emailError}</p>}
            </div>

            <div className="lg:col-span-2 pt-6 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-heading flex items-center gap-2">
                  Pessoas Relacionadas / Responsáveis
                </h3>
                <Button
                  type="button"
                  variant="brand-outline"
                  size="sm"
                  iconLeft={<IconPlus size={13} />}
                  onClick={addContactPerson}
                >
                  Adicionar
                </Button>
              </div>
              <div className="space-y-4">
                {contactPersons.map((person, idx) => (
                  <ContactPersonCard
                    key={idx}
                    person={person}
                    onChange={(p) => updateContactPerson(idx, p)}
                    onRemove={() => removeContactPerson(idx)}
                    canRemove={contactPersons.length > 1}
                  />
                ))}
              </div>
            </div>
          </div>
        </FormSection>

        <FormSection title="Redes Sociais e Status">
          <FormGrid>
            <FormField
              label="Instagram"
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="@instagram"
            />
            <FormField
              label="Facebook"
              type="text"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              placeholder="facebook.com/usuario"
            />
            {isSupplier && (
              <div className="sm:col-span-2">
                <TextArea
                  label="Referências Comerciais"
                  value={comercialReferences}
                  onChange={(e) => setComercialReferences(e.target.value)}
                  placeholder="Referências comerciais do fornecedor..."
                  rows={3}
                />
              </div>
            )}
            <div className="sm:col-span-2">
              <SwitchCard
                checked={!defaulter}
                onChange={(v) => {
                  if (mode === 'edit') {
                    handleStatusToggle();
                  } else {
                    setDefaulter(!v);
                  }
                }}
                title="Status"
                description="O cliente está marcado como inativo."
                activeDescription="O cliente está ativo e em dia."
              />
            </div>
          </FormGrid>
        </FormSection>

        <div className="flex items-center justify-end gap-3 pb-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowDiscardModal(true)}
          >
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
                ? `Cadastrar ${entityLabel}`
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
      />
    </form>
  );
}
