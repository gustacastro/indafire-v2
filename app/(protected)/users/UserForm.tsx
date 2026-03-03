'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { FormHeader } from '@/components/ui/FormHeader/FormHeader';
import { FormSection } from '@/components/ui/FormSection/FormSection';
import { FormField } from '@/components/ui/FormField/FormField';
import { PermissionsEditor } from '@/components/ui/PermissionsEditor/PermissionsEditor';
import { Button } from '@/components/ui/Button/Button';
import { ModalConfirm } from '@/components/ui/Modal/ModalConfirm';
import { IconSave } from '@/components/icons';
import { FormGrid } from '@/components/ui/FormGrid/FormGrid';
import { UserFormProps } from '@/types/entities/user/user-form.types';
import {
  getUserById,
  createUser,
  updateUser,
  UserPermissions,
} from './users.facade';

function buildEmptyPermissions(moduleKeys: string[]): Record<string, UserPermissions> {
  return Object.fromEntries(
    moduleKeys.map((k) => [k, { view: false, edit: false, create: false, delete: false }]),
  );
}

export function UserForm({ mode, userId }: UserFormProps) {
  const router = useRouter();
  const { hasPermission, modules, isLoading: authLoading } = useAuth();

  const canProceed =
    mode === 'create' ? hasPermission('users', 'create') : hasPermission('users', 'edit');

  useEffect(() => {
    if (!authLoading && !canProceed) {
      router.replace('/dashboard');
    }
  }, [authLoading, canProceed, router]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [permissions, setPermissions] = useState<Record<string, UserPermissions>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(mode === 'edit');
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const nameRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLDivElement>(null);
  const passwordRef = useRef<HTMLDivElement>(null);
  const confirmPasswordRef = useRef<HTMLDivElement>(null);

  const moduleKeys = Object.keys(modules);

  useEffect(() => {
    const keys = Object.keys(modules);
    if (keys.length === 0) return;
    setPermissions((prev) => {
      const base = buildEmptyPermissions(keys);
      return { ...base, ...prev };
    });
  }, [modules]);

  const loadUser = useCallback(async () => {
    if (mode !== 'edit' || !userId) return;
    setIsFetching(true);
    try {
      const user = await getUserById(userId);
      setName(user.name);
      setEmail(user.email);
      if (user.permissions) {
        setPermissions((prev) => ({ ...prev, ...user.permissions }));
      }
    } catch {
      toast.error('Erro ao carregar dados do usuário.');
    } finally {
      setIsFetching(false);
    }
  }, [mode, userId]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  function scrollToRef(ref: React.RefObject<HTMLDivElement | null>) {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const input = ref.current.querySelector<HTMLInputElement>('input');
      input?.focus();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (mode === 'create' && password !== confirmPassword) {
      setPasswordError('As senhas não coincidem.');
      setConfirmPasswordError('As senhas não coincidem.');
      scrollToRef(confirmPasswordRef);
      return;
    }

    if (mode === 'edit' && password && password !== confirmPassword) {
      setPasswordError('As senhas não coincidem.');
      setConfirmPasswordError('As senhas não coincidem.');
      scrollToRef(confirmPasswordRef);
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'create') {
        await toast.promise(
          createUser({ name, email, password, permissions }),
          {
            loading: 'Criando usuário...',
            success: 'Usuário criado com sucesso.',
            error: (err: unknown) =>
              (err as { response?: { data?: { detail?: { message?: string } } } })
                ?.response?.data?.detail?.message ?? 'Erro ao salvar usuário.',
          },
        );
      } else {
        await toast.promise(
          updateUser(userId!, {
            name,
            email,
            ...(password.trim() ? { password } : {}),
            permissions,
          }),
          {
            loading: 'Salvando alterações...',
            success: 'Usuário atualizado com sucesso.',
            error: (err: unknown) =>
              (err as { response?: { data?: { detail?: { message?: string } } } })
                ?.response?.data?.detail?.message ?? 'Erro ao salvar usuário.',
          },
        );
      }
      router.push('/users');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: { message?: string } } } })
          ?.response?.data?.detail?.message ?? '';
      const msgLower = msg.toLowerCase();
      if (msgLower.includes('email')) {
        setEmailError(msg);
        scrollToRef(emailRef);
      } else if (msgLower.includes('senha') || msgLower.includes('password')) {
        setPasswordError(msg);
        setConfirmPasswordError(msg);
        scrollToRef(passwordRef);
      } else if (msgLower.includes('nome') || msgLower.includes('name')) {
        setNameError(msg);
        scrollToRef(nameRef);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function selectAll() {
    setPermissions(
      Object.fromEntries(
        moduleKeys.map((k) => [k, { view: true, edit: true, create: true, delete: true }]),
      ),
    );
  }

  function clearAll() {
    setPermissions(buildEmptyPermissions(moduleKeys));
  }

  const isPasswordRequired = mode === 'create';
  const isSaveDisabled =
    !name ||
    !email ||
    (isPasswordRequired && (!password || !confirmPassword)) ||
    isSubmitting ||
    isFetching;

  if (authLoading || (!authLoading && !canProceed)) return null;

  return (
    <form onSubmit={handleSubmit}>
      <FormHeader
        backHref="/users"
        onBackClick={(e) => { e.preventDefault(); setShowDiscardModal(true); }}
        title={mode === 'create' ? 'Criar usuário' : 'Editar usuário'}
        description={mode === 'create'
          ? 'Preencha os dados básicos e defina os níveis de acesso ao sistema.'
          : 'Atualize os dados e as permissões do usuário.'}
      />

      <div className="flex flex-col gap-6">
        <FormSection title="Dados do usuário">
          <FormGrid>
            <div ref={nameRef}>
              <FormField
                label="Nome"
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setNameError(''); }}
                placeholder="Nome completo"
                required
                error={nameError}
              />
            </div>
            <div ref={emailRef}>
              <FormField
                label="E-mail"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                placeholder="email@exemplo.com"
                required
                error={emailError}
              />
            </div>
            <div ref={passwordRef}>
              <FormField
                label="Senha"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordError(''); setConfirmPasswordError(''); }}
                placeholder={
                  isPasswordRequired ? 'Digite uma senha' : 'Deixe em branco para manter'
                }
                required={isPasswordRequired}
                error={passwordError}
              />
            </div>
            <div ref={confirmPasswordRef}>
              <FormField
                label="Confirmar senha"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setConfirmPasswordError(''); setPasswordError(''); }}
                placeholder={
                  isPasswordRequired ? 'Confirme a senha' : 'Deixe em branco para manter'
                }
                required={isPasswordRequired}
                error={confirmPasswordError}
              />
            </div>
          </FormGrid>
        </FormSection>

        <FormSection
          title="Permissões do Sistema"
          action={
            <>
              <Button type="button" variant="ghost" size="sm" onClick={selectAll}>
                Selecionar todas
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={clearAll}>
                Limpar todas
              </Button>
            </>
          }
        >
          {moduleKeys.length === 0 && (
            <p className="text-sm text-muted text-center py-6">Nenhum módulo disponível.</p>
          )}

          <PermissionsEditor
            permissions={permissions}
            modules={modules}
            onChange={(p) => setPermissions(p)}
          />
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
                ? 'Cadastrar usuário'
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
