'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { ModalConfirm } from '@/components/ui/Modal/ModalConfirm';
import { TextArea } from '@/components/ui/TextArea/TextArea';
import { resolveDivergency } from '@/app/(protected)/quotes/quotes.facade';

interface ResolveDivergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteId: string;
  divergencyId: string;
  onSuccess: () => void;
}

export function ResolveDivergencyModal({ isOpen, onClose, quoteId, divergencyId, onSuccess }: ResolveDivergencyModalProps) {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function resetForm() {
    setDescription('');
    setError('');
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit() {
    if (!description.trim()) {
      setError('Descreva a resolução.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await toast.promise(
        resolveDivergency(quoteId, divergencyId, { resolution_description: description.trim() }),
        {
          loading: 'Resolvendo divergência...',
          success: 'Divergência resolvida com sucesso.',
          error: (err: unknown) =>
            (err as { response?: { data?: { detail?: { message?: string } } } })
              ?.response?.data?.detail?.message ?? 'Erro ao resolver divergência.',
        },
      );
      resetForm();
      onSuccess();
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalConfirm
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      variant="success"
      title="Resolver Divergência"
      confirmLabel="Resolver Divergência"
      onConfirm={handleSubmit}
      confirmLoading={loading}
    >
      <TextArea
        label="Descrição da resolução"
        required
        placeholder="Descreva como o problema foi resolvido..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
        error={error}
      />
    </ModalConfirm>
  );
}
