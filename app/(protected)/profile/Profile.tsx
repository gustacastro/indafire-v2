'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserById, UserDetail } from './profile.facade';
import { FormHeader } from '@/components/ui/FormHeader/FormHeader';
import { FormSection } from '@/components/ui/FormSection/FormSection';
import { FormGrid } from '@/components/ui/FormGrid/FormGrid';
import { FormField } from '@/components/ui/FormField/FormField';
import { Button } from '@/components/ui/Button/Button';
import { Avatar } from '@/components/ui/Avatar/Avatar';
import { ProfilePermissions } from '@/components/ui/ProfilePermissions/ProfilePermissions';
import { Notification } from '@/components/ui/Notification/Notification';
import { IconSave, IconCamera } from '@/components/icons';
import toast from 'react-hot-toast';

export function Profile() {
  const { user: authUser, modules } = useAuth();
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authUser?.id) return;
    setIsLoading(true);
    getUserById(authUser.id)
      .then(setUserDetail)
      .catch(() => toast.error('Erro ao carregar dados do perfil.'))
      .finally(() => setIsLoading(false));
  }, [authUser?.id]);

  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function validatePassword(value: string) {
    if (value && value.length < 8) {
      setPasswordError('Mínimo de 8 caracteres');
    } else {
      setPasswordError('');
    }
    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError('As senhas não correspondem');
    } else {
      setConfirmPasswordError('');
    }
  }

  function validateConfirmPassword(value: string) {
    if (value && value !== password) {
      setConfirmPasswordError('As senhas não correspondem');
    } else {
      setConfirmPasswordError('');
    }
    if (password && password.length < 8) {
      setPasswordError('Mínimo de 8 caracteres');
    }
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
  }

  function handleConfirmPasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setConfirmPassword(value);
    validateConfirmPassword(value);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="text-sm text-muted">Carregando...</span>
      </div>
    );
  }

  if (!userDetail) {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="text-sm text-muted">Não foi possível carregar os dados do perfil.</span>
      </div>
    );
  }

  return (
    <div>
      <FormHeader
        backHref="/dashboard"
        backLabel="Dashboard"
        onBackClick={() => {}}
        title="Meu Perfil"
        description="Visualize seus dados e permissões"
      />

      <div className="flex flex-col gap-(--spacing-lg)">
        <div className="flex flex-col items-center gap-(--spacing-md) py-(--spacing-lg)">
          <button
            type="button"
            onClick={handleAvatarClick}
            className="relative group cursor-pointer"
          >
            {avatarPreview ? (
              <div className="w-24 h-24 rounded-full overflow-hidden">
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <Avatar name={userDetail.name} size="xl" />
            )}
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <IconCamera size={24} className="text-white" />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </button>
          <div className="text-center">
            <h2 className="text-xl font-bold text-heading">{userDetail.name}</h2>
            <p className="text-sm text-muted mt-1">{userDetail.email}</p>
          </div>
        </div>

        <FormSection title="Dados Pessoais">
          <FormGrid>
            <FormField
              label="Nome"
              type="text"
              value={userDetail.name}
              disabled
            />
            <FormField
              label="E-mail"
              type="email"
              value={userDetail.email}
              disabled
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Alterar Senha">
          <FormGrid>
            <FormField
              label="Nova Senha"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Digite a nova senha"
              error={passwordError}
            />
            <FormField
              label="Confirmar Senha"
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              placeholder="Confirme a nova senha"
              error={confirmPasswordError}
            />
          </FormGrid>
        </FormSection>

        <FormSection
          title="Minhas Permissões"
        >
          <ProfilePermissions
            permissions={userDetail.permissions}
            modules={modules}
          />
        </FormSection>

        <div className="flex flex-col items-end gap-(--spacing-sm) pb-(--spacing-xl)">
          <Notification
            variant="info"
            message="A atualização de perfil ainda não está disponível."
          />
          <Button
            type="button"
            variant="primary"
            disabled
            iconLeft={<IconSave size={16} />}
          >
            Atualizar Perfil
          </Button>
        </div>
      </div>
    </div>
  );
}
