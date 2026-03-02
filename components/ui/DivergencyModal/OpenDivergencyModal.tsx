'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { ModalConfirm } from '@/components/ui/Modal/ModalConfirm';
import { Select } from '@/components/ui/Select/Select';
import { TextArea } from '@/components/ui/TextArea/TextArea';
import { createDivergency, DIVERGENCY_TYPE_OPTIONS } from '@/app/(protected)/quotes/quotes.facade';

interface OpenDivergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteId: string;
  onSuccess: () => void;
}

export function OpenDivergencyModal({ isOpen, onClose, quoteId, onSuccess }: OpenDivergencyModalProps) {
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ type?: string; description?: string }>({});

  function resetForm() {
    setType('');
    setDescription('');
    setErrors({});
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit() {
    const newErrors: { type?: string; description?: string } = {};
    if (!type) newErrors.type = 'Selecione o tipo da divergência.';
    if (!description.trim()) newErrors.description = 'Descreva o problema.';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      await toast.promise(
        createDivergency(quoteId, { type, problem_description: description.trim() }),
        {
          loading: 'Reportando divergência...',
          success: 'Divergência reportada com sucesso.',
          error: (err: unknown) =>
            (err as { response?: { data?: { detail?: { message?: string } } } })
              ?.response?.data?.detail?.message ?? 'Erro ao reportar divergência.',
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
      variant="warning"
      title="Abrir Divergência"
      confirmLabel="Reportar Divergência"
      onConfirm={handleSubmit}
      confirmLoading={loading}
    >
      <div className="flex flex-col gap-(--spacing-md)">
        <Select
          label="Tipo da divergência"
          required
          placeholder="Selecione o tipo"
          options={DIVERGENCY_TYPE_OPTIONS}
          value={type}
          onChange={setType}
          error={errors.type}
        />
        <TextArea
          label="Descrição do problema"
          required
          placeholder="Descreva o problema encontrado..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          error={errors.description}
        />
      </div>
    </ModalConfirm>
  );
}
