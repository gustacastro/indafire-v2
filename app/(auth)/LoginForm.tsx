'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button/Button';
import { FormField } from '@/components/ui/FormField/FormField';
import { ThemeToggle } from '@/components/ui/ThemeToggle/ThemeToggle';
import { AuthBranding } from '@/app/(auth)/AuthBranding';
import { login, normalizePermissions, fetchModules } from '@/lib/auth';
import { setAuthCookies } from '@/app/actions/auth.actions';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const loginPromise = async () => {
      const response = await login({ email, password });
      const permissions = normalizePermissions(response.permissions);
      const modules = await fetchModules(response.access_token);
      await setAuthCookies(response.access_token, permissions, modules);
    };

    try {
      await toast.promise(loginPromise(), {
        loading: 'Autenticando...',
        success: 'Login realizado com sucesso!',
        error: (err: unknown) => {
          if (err && typeof err === 'object' && 'response' in err) {
            const axiosError = err as { response?: { data?: { detail?: { message?: string } | string } } };
            const detail = axiosError.response?.data?.detail;
            const message = typeof detail === 'object' ? detail?.message : detail;
            return message || 'Erro ao realizar login.';
          }
          return 'Erro ao realizar login.';
        },
      });
      window.location.href = '/dashboard';
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full font-sans">
      <main className="flex min-h-screen w-full bg-background text-foreground transition-colors duration-300 relative">
        <ThemeToggle className="absolute top-6 right-6 z-50" />

        <div className="w-full lg:w-1/2 flex flex-col px-8 sm:px-16 lg:px-24 py-12 justify-center overflow-y-auto">
          <div className="w-full max-w-md mx-auto">
            <div className="mb-10">
              <h1 className="text-3xl font-bold mb-3 text-heading">Entrar</h1>
              <p className="text-muted text-sm">
                Insira seu e-mail e senha para acessar o sistema.
              </p>
            </div>

            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <FormField
                label="E-mail"
                type="text"
                placeholder="usuario@indafire.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <FormField
                label="Senha"
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={loading}
                className="mt-2"
              >
                {loading ? 'Entrando...' : 'Entrar no Sistema'}
              </Button>
            </form>
          </div>
        </div>

        <AuthBranding />
      </main>
    </div>
  );
}
