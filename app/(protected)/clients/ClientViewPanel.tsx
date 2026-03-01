'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { SideModal } from '@/components/ui/SideModal/SideModal';
import { InfoItem } from '@/components/ui/InfoItem/InfoItem';
import { InfoTable } from '@/components/ui/InfoTable/InfoTable';
import { StatusBadge } from '@/components/ui/StatusBadge/StatusBadge';
import { Toggle } from '@/components/ui/Toggle/Toggle';
import { CopyField } from '@/components/ui/CopyField/CopyField';
import {
  IconBuilding,
  IconUser,
  IconHash,
  IconMapPin,
  IconPhone,
  IconMail,
  IconInstagram,
  IconFacebook,
  IconGlobe,
} from '@/components/icons';
import {
  getClientById,
  toggleClientStatus,
  Client,
  isCompanyClient,
  isClientActive,
  getClientName,
  getClientType,
  ClientContactPerson,
} from './clients.facade';
import { ViewSection } from '@/components/ui/ViewSection/ViewSection';
import { ViewDivider } from '@/components/ui/ViewDivider/ViewDivider';
import { InfoValue } from '@/components/ui/InfoValue/InfoValue';
import { ClientViewPanelProps } from '@/types/entities/client/client.types';
import { formatCpf, formatCnpj, formatCep, formatPhone } from '@/utils/document';

export function ClientViewPanel({ clientId, isOpen, onClose, footerButtons, isSupplier, onStatusChange }: ClientViewPanelProps) {
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !clientId) return;
    setClient(null);
    setIsLoading(true);
    getClientById(clientId)
      .then(setClient)
      .catch(() => toast.error('Erro ao carregar detalhes.'))
      .finally(() => setIsLoading(false));
  }, [isOpen, clientId]);

  async function handleToggleStatus() {
    if (!client) return;
    try {
      await toast.promise(toggleClientStatus(client.id), {
        loading: 'Alterando status...',
        success: 'Status alterado com sucesso.',
        error: (err: unknown) =>
          (err as { response?: { data?: { detail?: { message?: string } } } })
            ?.response?.data?.detail?.message ?? 'Erro ao alterar status.',
      });
      const updated = await getClientById(client.id);
      setClient(updated);
      onStatusChange?.();
    } catch {
      //
    }
  }

  const entityLabel = isSupplier ? 'Fornecedor' : 'Cliente';

  return (
    <SideModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalhes do ${entityLabel}`}
      footerButtons={footerButtons}
    >
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <span className="text-sm text-muted">Carregando...</span>
        </div>
      )}

      {!isLoading && client && (
        <>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-secondary border border-border flex items-center justify-center mb-4 shadow-lg">
              {isCompanyClient(client.identity)
                ? <IconBuilding size={28} className="text-muted" />
                : <IconUser size={28} className="text-muted" />}
            </div>
            <h3 className="text-xl font-bold text-heading">{getClientName(client)}</h3>
            <span className="text-xs text-muted mt-1">
              {getClientType(client) === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física'}
            </span>
          </div>

          <ViewDivider />

          <ViewSection title="Identificação">

            {client.code && (
              <InfoItem icon={<IconHash size={16} />} label="Código">
                <CopyField value={client.code}>
                  <InfoValue>{client.code}</InfoValue>
                </CopyField>
              </InfoItem>
            )}

            {isCompanyClient(client.identity) ? (
              <>
                <InfoItem icon={<IconHash size={16} />} label="CNPJ">
                  <CopyField value={client.identity.cnpj}>
                    <InfoValue>
                      <span className="font-mono">{formatCnpj(client.identity.cnpj)}</span>
                    </InfoValue>
                  </CopyField>
                </InfoItem>
                <InfoItem icon={<IconBuilding size={16} />} label="Razão Social">
                  <InfoValue>{client.identity.company_name}</InfoValue>
                </InfoItem>
                <InfoItem icon={<IconBuilding size={16} />} label="Nome Fantasia">
                  <InfoValue>{client.identity.company_fantasy_name || '—'}</InfoValue>
                </InfoItem>
                {client.identity.company_city_registration && (
                  <InfoItem icon={<IconHash size={16} />} label="Inscrição Municipal">
                    <InfoValue>{client.identity.company_city_registration}</InfoValue>
                  </InfoItem>
                )}
                <InfoItem icon={<IconHash size={16} />} label="Inscrição Estadual">
                  <InfoValue>{client.identity.company_state_registration || 'ISENTO'}</InfoValue>
                </InfoItem>
                {client.identity.tax_regime && (
                  <InfoItem icon={<IconHash size={16} />} label="Regime Tributário">
                    <InfoValue>{client.identity.tax_regime}</InfoValue>
                  </InfoItem>
                )}
                {client.identity.rate_differential && (
                  <InfoItem icon={<IconHash size={16} />} label="Diferencial de Alíquota">
                    <InfoValue>{client.identity.rate_differential}</InfoValue>
                  </InfoItem>
                )}
              </>
            ) : (
              <>
                <InfoItem icon={<IconHash size={16} />} label="CPF">
                  <CopyField value={client.identity.cpf}>
                    <InfoValue>
                      <span className="font-mono">{formatCpf(client.identity.cpf)}</span>
                    </InfoValue>
                  </CopyField>
                </InfoItem>
                <InfoItem icon={<IconUser size={16} />} label="Nome Completo">
                  <InfoValue>{client.identity.name}</InfoValue>
                </InfoItem>
                {client.identity.fantasy_name && (
                  <InfoItem icon={<IconUser size={16} />} label="Nome Fantasia">
                    <InfoValue>{client.identity.fantasy_name}</InfoValue>
                  </InfoItem>
                )}
              </>
            )}
          </ViewSection>

          <ViewDivider />

          <ViewSection title="Endereço">
            <InfoItem icon={<IconMapPin size={16} />} label="Endereço completo">
              <InfoValue>
                {client.address.street}, {client.address.street_number}
                <br />
                {client.address.district} — {client.address.city}/{client.address.state}
                <br />
                <span className="font-mono">{formatCep(client.address.cep)}</span>
              </InfoValue>
            </InfoItem>
          </ViewSection>

          <ViewDivider />

          <ViewSection title="Contato">
            <InfoItem icon={<IconPhone size={16} />} label="Telefone Principal">
              <InfoValue>{formatPhone(client.contact.phone_number)}</InfoValue>
            </InfoItem>
            {client.contact.additional_phone_numbers?.length > 0 && (
              <InfoTable<{ number: string; department: string }>
                title="Telefones Adicionais"
                columns={[
                  { key: 'number', header: 'Número', render: (row) => <span className="text-foreground">{formatPhone(row.number)}</span> },
                  { key: 'department', header: 'Setor', render: (row) => <span className="text-muted">{row.department || '—'}</span> },
                ]}
                rows={client.contact.additional_phone_numbers}
              />
            )}
            <InfoItem icon={<IconMail size={16} />} label="E-mail Principal">
              <CopyField value={client.contact.email}>
                <InfoValue>{client.contact.email}</InfoValue>
              </CopyField>
            </InfoItem>
            {client.contact.additional_emails?.length > 0 && (
              <InfoTable<{ email: string; department: string }>
                title="E-mails Adicionais"
                columns={[
                  { key: 'email', header: 'E-mail', render: (row) => <span className="text-foreground">{row.email}</span> },
                  { key: 'department', header: 'Setor', render: (row) => <span className="text-muted">{row.department || '—'}</span> },
                ]}
                rows={client.contact.additional_emails}
              />
            )}
          </ViewSection>

          {client.contact.contact_persons?.length > 0 && (
            <>
              <ViewDivider />
              <ViewSection title="Pessoas de Contato" spacing="compact">
                <InfoTable<ClientContactPerson>
                  columns={[
                    { key: 'name', header: 'Nome', render: (row) => <span className="text-foreground font-medium">{row.name}</span> },
                    { key: 'phone', header: 'Telefone', render: (row) => (
                      <span className="text-muted">
                        {row.phone ? formatPhone(row.phone) : '—'}
                        {row.isExtension && <span className="text-xs text-brand ml-1">(Ramal)</span>}
                      </span>
                    )},
                    { key: 'department', header: 'Setor', render: (row) => <span className="text-muted">{row.department || '—'}</span> },
                  ]}
                  rows={client.contact.contact_persons}
                />
              </ViewSection>
            </>
          )}

          <ViewDivider />

          <ViewSection title="Redes Sociais e Status">
            {client.contact.instagram && (
              <InfoItem icon={<IconInstagram size={16} />} label="Instagram">
                <InfoValue>{client.contact.instagram}</InfoValue>
              </InfoItem>
            )}
            {client.contact.facebook && (
              <InfoItem icon={<IconFacebook size={16} />} label="Facebook">
                <InfoValue>{client.contact.facebook}</InfoValue>
              </InfoItem>
            )}
            {isSupplier && client.contact.comercial_references && (
              <InfoItem icon={<IconGlobe size={16} />} label="Referências Comerciais">
                <InfoValue>{client.contact.comercial_references}</InfoValue>
              </InfoItem>
            )}
            <div className="flex items-center gap-3 p-3 bg-secondary rounded-(--radius-lg) border border-border">
              <Toggle
                checked={isClientActive(client)}
                onChange={handleToggleStatus}
                size="md"
                label="Status"
              />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-heading">Status</span>
                <StatusBadge
                  value={isClientActive(client)}
                  trueLabel="Ativo"
                  falseLabel="Inativo"
                  trueVariant="primary"
                  falseVariant="error"
                />
              </div>
            </div>
          </ViewSection>
        </>
      )}
    </SideModal>
  );
}
