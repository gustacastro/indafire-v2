'use client';
import { useState, useEffect } from 'react';
import { SendProposalModalProps, ContactItem } from '@/types/ui/send-proposal-modal.types';
import { Modal } from '@/components/ui/Modal/Modal';
import { Button } from '@/components/ui/Button/Button';
import { Checkbox } from '@/components/ui/Checkbox/Checkbox';
import { fetchClientContacts } from '@/app/(protected)/commercial-panel/commercial-panel.facade';
import { formatPhone } from '@/utils/document';
import { TagChip } from '../TagChip/TagChip';

export function SendProposalModal({
  isOpen,
  onClose,
  quoteId,
  quoteCode,
  clientName,
  clientId,
  onSkipAndMove,
  onSendAndMove,
  sendLoading,
}: SendProposalModalProps) {
  const [emails, setEmails] = useState<ContactItem[]>([]);
  const [phones, setPhones] = useState<ContactItem[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [selectedPhones, setSelectedPhones] = useState<string[]>([]);
  const [includePhotos, setIncludePhotos] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedEmails([]);
      setSelectedPhones([]);
      setIncludePhotos(false);
      setEmails([]);
      setPhones([]);
      return;
    }

    if (!clientId) return;

    setLoadingContacts(true);
    fetchClientContacts(clientId)
      .then(({ emails: e, phones: p }) => {
        setEmails(e);
        setPhones(p);
      })
      .finally(() => setLoadingContacts(false));
  }, [isOpen, clientId]);

  function toggleEmail(email: string) {
    setSelectedEmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  }

  function togglePhone(phone: string) {
    setSelectedPhones((prev) =>
      prev.includes(phone) ? prev.filter((p) => p !== phone) : [...prev, phone]
    );
  }

  const hasSelection = selectedEmails.length > 0 || selectedPhones.length > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="px-(--spacing-lg) py-(--spacing-md) border-b border-border bg-secondary flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-heading">Enviar Proposta</h2>
          <p className="text-xs text-muted mt-0.5">Orçamento #{quoteCode}</p>
        </div>
      </div>

      <div className="p-(--spacing-lg) overflow-y-auto max-h-[60vh]">
        {loadingContacts ? (
          <div className="flex items-center justify-center py-(--spacing-xl)">
            <p className="text-sm text-muted">Carregando contatos...</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted mb-(--spacing-lg)">
              Selecione os canais de comunicação para enviar o orçamento para{' '}
              <strong className="text-heading">{clientName}</strong>:
            </p>

            <div className="mb-(--spacing-lg) bg-secondary rounded-xl border border-border overflow-hidden">
              <div className="px-(--spacing-md) py-(--spacing-sm) border-b border-border">
                <h3 className="text-sm font-bold text-heading">WhatsApp</h3>
              </div>
              <div className="p-(--spacing-xs)">
                {phones.length > 0 ? (
                  phones.map((tel) => (
                    <div key={tel.value} className="px-(--spacing-sm) py-(--spacing-xs)">
                      <Checkbox
                        checked={selectedPhones.includes(tel.value)}
                        onChange={() => togglePhone(tel.value)}
                        label={`${formatPhone(tel.value)}${tel.department ? ` — ${tel.department}` : ''}`}
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted p-(--spacing-sm) italic">
                    Nenhum telefone cadastrado para este cliente.
                  </p>
                )}
              </div>
            </div>

            <div className="mb-(--spacing-lg) bg-secondary rounded-xl border border-border overflow-hidden">
              <div className="px-(--spacing-md) py-(--spacing-sm) border-b border-border">
                <h3 className="text-sm font-bold text-heading">E-mail</h3>
              </div>
              <div className="p-(--spacing-xs)">
                {emails.length > 0 ? (
                  emails.map((em) => (
                    <div key={em.value} className="px-(--spacing-sm) py-(--spacing-xs)">
                      <Checkbox
                        checked={selectedEmails.includes(em.value)}
                        onChange={() => toggleEmail(em.value)}
                        label={`${em.value}${em.department ? ` — ${em.department}` : ''}`}
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted p-(--spacing-sm) italic">
                    Nenhum e-mail cadastrado para este cliente.
                  </p>
                )}
              </div>
            </div>

            <div className="mb-(--spacing-lg)">
              <Checkbox
                checked={includePhotos}
                onChange={setIncludePhotos}
                label="Incluir fotos dos produtos no orçamento"
              />
              <p className="text-xs text-muted mt-(--spacing-xs) ml-8 leading-relaxed">
                As fotos dos produtos serão anexadas no email e na mensagem do WhatsApp
              </p>
            </div>

            {hasSelection && (
              <div className="bg-secondary border border-border rounded-xl p-(--spacing-md) animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h4 className="text-sm font-bold text-heading mb-(--spacing-sm)">Resumo do envio:</h4>

                {selectedEmails.length > 0 && (
                  <div className="mb-(--spacing-sm)">
                    <p className="text-xs text-muted mb-(--spacing-xs)">
                      A proposta será enviada para <strong>{selectedEmails.length}</strong> email(s):
                    </p>
                    <div className="flex flex-wrap gap-(--spacing-xs)">
                      {selectedEmails.map((email) => (
                        <TagChip key={email} label={email} />
                      ))}
                    </div>
                  </div>
                )}

                {selectedPhones.length > 0 && (
                  <div>
                    <p className="text-xs text-muted mb-(--spacing-xs)">
                      A proposta será enviada para <strong>{selectedPhones.length}</strong> WhatsApp(s):
                    </p>
                    <div className="flex flex-wrap gap-(--spacing-xs)">
                      {selectedPhones.map((phone) => (
                        <TagChip key={phone} label={formatPhone(phone)} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div className="px-(--spacing-lg) py-(--spacing-md) border-t border-border bg-secondary flex flex-col sm:flex-row justify-between items-center gap-(--spacing-sm)">
        <Button variant="ghost" size="sm" onClick={onClose} disabled={sendLoading}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          size="sm"
          nowrap
          disabled={sendLoading}
          onClick={() =>
            hasSelection
              ? onSendAndMove(selectedEmails, selectedPhones, includePhotos)
              : onSkipAndMove()
          }
        >
          {sendLoading ? 'Enviando...' : hasSelection ? 'Enviar proposta' : 'Pular envio de proposta'}
        </Button>
      </div>
    </Modal>
  );
}
