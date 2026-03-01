'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/layout/PageHeader/PageHeader';
import { Button } from '@/components/ui/Button/Button';
import { ModalConfirm } from '@/components/ui/Modal/ModalConfirm';
import {
  IconMessageSquare,
  IconSmartphone,
  IconRefreshCw,
  IconLogOut,
} from '@/components/icons';
import { WhatsappView } from '@/types/integrations/whatsapp-settings.types';
import {
  fetchWhatsappStatus,
  connectWhatsapp,
  disconnectWhatsapp,
} from './whatsapp-settings.facade';
import { formatWhatsappNumber } from '@/utils/phone';

const POLL_INTERVAL = 4000;

export function WhatsappSettings() {
  const [view, setView] = useState<WhatsappView>('disconnected');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const pollerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPoller = useCallback(() => {
    if (pollerRef.current) {
      clearInterval(pollerRef.current);
      pollerRef.current = null;
    }
  }, []);

  const startPoller = useCallback(() => {
    stopPoller();
    pollerRef.current = setInterval(async () => {
      try {
        const status = await fetchWhatsappStatus();
        if (status.whatsapp_is_connected) {
          stopPoller();
          setPhoneNumber(status.whatsapp_number);
          setView('connected');
        }
      } catch {
        //
      }
    }, POLL_INTERVAL);
  }, [stopPoller]);

  useEffect(() => {
    async function init() {
      try {
        const status = await fetchWhatsappStatus();
        if (status.whatsapp_is_connected) {
          setPhoneNumber(status.whatsapp_number);
          setView('connected');
        }
      } catch {
        //
      }
    }
    init();
    return () => stopPoller();
  }, [stopPoller]);

  async function handleConnect() {
    setIsConnecting(true);
    try {
      const result = await toast.promise(connectWhatsapp(), {
        loading: 'Gerando QR Code...',
        success: 'QR Code gerado com sucesso.',
        error: (err: unknown) =>
          (err as { response?: { data?: { detail?: { message?: string } } } })
            ?.response?.data?.detail?.message ?? 'Erro ao gerar QR Code.',
      });
      setQrCode(result.qr_code);
      setView('qr');
      startPoller();
    } catch {
      //
    } finally {
      setIsConnecting(false);
    }
  }

  async function handleRefreshQr() {
    setIsConnecting(true);
    try {
      const result = await toast.promise(connectWhatsapp(), {
        loading: 'Atualizando QR Code...',
        success: 'QR Code atualizado.',
        error: (err: unknown) =>
          (err as { response?: { data?: { detail?: { message?: string } } } })
            ?.response?.data?.detail?.message ?? 'Erro ao atualizar QR Code.',
      });
      setQrCode(result.qr_code);
      startPoller();
    } catch {
      //
    } finally {
      setIsConnecting(false);
    }
  }

  async function handleDisconnectConfirm() {
    setIsDisconnecting(true);
    try {
      await toast.promise(disconnectWhatsapp(), {
        loading: 'Desconectando...',
        success: 'Dispositivo desconectado com sucesso.',
        error: (err: unknown) =>
          (err as { response?: { data?: { detail?: { message?: string } } } })
            ?.response?.data?.detail?.message ?? 'Erro ao desconectar dispositivo.',
      });
      setShowDisconnectModal(false);
      setPhoneNumber('');
      setQrCode(null);
      setView('disconnected');
    } catch {
      //
    } finally {
      setIsDisconnecting(false);
    }
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      <PageHeader
        title="WhatsApp"
        description="Gerencie a conexão do WhatsApp para envio automatizado de mensagens."
        icon={<IconMessageSquare size={20} />}
      />

      {view === 'disconnected' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4 py-16">
          <div className="w-20 h-20 rounded-full bg-card border border-border flex items-center justify-center">
            <IconSmartphone size={32} className="text-muted" />
          </div>
          <div className="flex flex-col gap-3 max-w-md">
            <h2 className="text-2xl font-semibold text-heading">Dispositivo não vinculado</h2>
            <p className="text-sm text-muted leading-relaxed">
              Para ativar o envio automatizado de mensagens, você precisa conectar o seu
              WhatsApp lendo o QR Code de autenticação.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? 'Aguarde...' : 'Gerar QR Code de Conexão'}
          </Button>
        </div>
      )}

      {view === 'qr' && qrCode && (
        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          <div className="w-full max-w-2xl flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
            <div className="flex-1 flex flex-col gap-6">
              <div>
                <h2 className="text-lg font-semibold text-heading">Leia o QR Code</h2>
                <p className="mt-1 text-sm text-muted leading-relaxed">
                  Siga os passos abaixo no seu celular para estabelecer a conexão:
                </p>
              </div>
              <ol className="flex flex-col gap-3">
                {[
                  'Abra o WhatsApp no seu celular.',
                  <>Toque em <span className="font-semibold text-heading">Mais opções</span> (⋮) ou <span className="font-semibold text-heading">Configurações</span>.</>,
                  <>Toque em <span className="font-semibold text-heading">Aparelhos conectados</span> e depois em <span className="font-semibold text-heading">Conectar um aparelho</span>.</>,
                  'Aponte a câmera para o código ao lado.',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted leading-relaxed">
                    <span className="shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-xs font-semibold">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="shrink-0 flex justify-center">
              <div className="p-2 bg-white rounded-xl border border-border shadow-sm">
                <img
                  src={qrCode}
                  alt="QR Code WhatsApp"
                  className="w-52 h-52 object-contain"
                />
              </div>
            </div>
          </div>

          <div className="w-full max-w-2xl flex items-center pt-4 border-t border-border">
            <Button
              variant="outline"
              iconLeft={<IconRefreshCw size={16} />}
              onClick={handleRefreshQr}
              disabled={isConnecting}
            >
              {isConnecting ? 'Atualizando...' : 'Atualizar QR Code'}
            </Button>
          </div>
        </div>
      )}

      {view === 'connected' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center px-4 py-16">
          <div className="w-20 h-20 rounded-full bg-success/10 border border-success/20 flex items-center justify-center">
            <IconMessageSquare size={32} className="text-success" />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold text-heading">Conexão Ativa</h2>
            <p className="text-sm text-muted">Dispositivo vinculado com sucesso.</p>
            {phoneNumber && (
              <p className="text-base font-bold text-heading">
                {formatWhatsappNumber(phoneNumber)}
              </p>
            )}
          </div>
          <Button
            variant="destructive"
            iconLeft={<IconLogOut size={16} />}
            onClick={() => setShowDisconnectModal(true)}
          >
            Desconectar
          </Button>
        </div>
      )}

      <ModalConfirm
        isOpen={showDisconnectModal}
        onClose={() => setShowDisconnectModal(false)}
        variant="danger"
        icon={<IconLogOut size={20} className="text-destructive" />}
        title="Desconectar dispositivo"
        description="Tem certeza que deseja desconectar o WhatsApp? O envio automatizado de mensagens será interrompido."
        confirmLabel="Desconectar"
        cancelLabel="Cancelar"
        onConfirm={handleDisconnectConfirm}
        confirmLoading={isDisconnecting}
        requireConfirmation
        requireConfirmationLabel="Confirmo que desejo desconectar este dispositivo"
      />
    </div>
  );
}
