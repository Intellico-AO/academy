'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button, Input, Card, CardContent } from '../../components/ui';
import { GraduationCap, Mail, Lock, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, isLoading, isAuthenticated } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const getErrorMessage = (err: any): string => {
    // Check if it's a Firebase error or a custom error
    if (err.message?.includes('Firebase') || err.message?.includes('configurações')) {
      return 'Sistema não configurado. Contacte o administrador.';
    }
    
    const code = err.code || '';
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Email ou palavra-passe incorretos';
      case 'auth/invalid-email':
        return 'Email inválido';
      case 'auth/weak-password':
        return 'A palavra-passe deve ter pelo menos 6 caracteres';
      case 'auth/too-many-requests':
        return 'Demasiadas tentativas. Tente novamente mais tarde.';
      case 'auth/user-disabled':
        return 'Esta conta foi desativada';
      case 'auth/network-request-failed':
        return 'Erro de ligação. Verifique a sua internet.';
      case 'auth/configuration-not-found':
        return 'Sistema não configurado. Contacte o administrador.';
      case 'auth/not-registered':
        return 'Não tem conta registada em nenhum centro de formação. Contacte o administrador do seu centro.';
      default:
        return err.message || 'Erro ao iniciar sessão. Tente novamente.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await signIn(email, password);
      toast.success('Sessão iniciada!', 'Bem-vindo de volta.');
      router.push('/');
    } catch (err: any) {
      console.error('Erro de login:', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      toast.error('Erro ao iniciar sessão', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500 text-white mb-4">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-white">FormaPro</h1>
          <p className="text-slate-400 mt-2">Sistema de Gestão Formativa</p>
        </div>

        {/* Card de Login */}
        <Card variant="elevated" className="shadow-2xl">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-6">
              Iniciar Sessão
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-3 text-rose-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Palavra-passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" />
                  <span className="text-slate-600">Lembrar-me</span>
                </label>
                <Link href="/recuperar-password" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  Esqueceu a palavra-passe?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full py-3"
                isLoading={isSubmitting}
                disabled={isSubmitting || isLoading}
              >
                Entrar
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-600">
                Não tem conta?{' '}
                <Link href="/registar" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  Registar Centro de Formação
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-slate-500 text-sm mt-6">
          © {new Date().getFullYear()} FormaPro. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
