'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { SideModal } from '@/components/ui/SideModal/SideModal';
import { Avatar } from '@/components/ui/Avatar/Avatar';
import { InfoItem } from '@/components/ui/InfoItem/InfoItem';
import { PermissionsView } from '@/components/ui/PermissionsView/PermissionsView';
import { IconMail, IconShield } from '@/components/icons';
import { CopyField } from '@/components/ui/CopyField/CopyField';
import { getUserById, UserDetail } from './users.facade';
import { ViewSection } from '@/components/ui/ViewSection/ViewSection';
import { ViewDivider } from '@/components/ui/ViewDivider/ViewDivider';
import { UserViewPanelProps } from '@/types/entities/user/user-view-panel.types';

export function UserViewPanel({ userId, isOpen, onClose, footerButtons }: UserViewPanelProps) {
  const { modules } = useAuth();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !userId) return;
    setUser(null);
    setIsLoading(true);
    getUserById(userId)
      .then(setUser)
      .catch(() => toast.error('Erro ao carregar detalhes do usuário.'))
      .finally(() => setIsLoading(false));
  }, [isOpen, userId]);

  return (
    <SideModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalhes do Usuário"
      footerButtons={footerButtons}
    >
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <span className="text-sm text-muted">Carregando...</span>
        </div>
      )}

      {!isLoading && user && (
        <>
          <div className="flex flex-col items-center text-center">
            <Avatar name={user.name} size="xl" className="mb-4 shadow-lg" />
            <h3 className="text-xl font-bold text-heading">{user.name}</h3>
            <div className="text-muted mt-1 flex items-center gap-2 text-sm">
              <IconMail size={14} />
              <CopyField value={user.email}>{user.email}</CopyField>
            </div>
          </div>

          <ViewDivider />

          <ViewSection title="Informações da Conta">

            <InfoItem icon={<IconShield size={18} />} label="Nível de Acesso">
              <PermissionsView permissions={user.permissions} modules={modules} />
            </InfoItem>
          </ViewSection>
        </>
      )}
    </SideModal>
  );
}
