'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button, Input, Card, CardContent } from '../../components/ui';
import { GraduationCap, Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export default function RecuperarPasswordPage() {
  const { resetPassword } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getErrorMessage = (code: string): string => {
    switch (code) {
      case 'auth/user-not-found':
        return 'Não existe conta com este email';
      case 'auth/invalid-email':
        return 'Email inválido';
      case 'auth/too-many-requests':
        return 'Demasiadas tentativas. Aguarde alguns minutos.';
      case 'auth/network-request-failed':
        return 'Erro de ligação. Verifique a sua internet.';
      default:
        return 'Erro ao enviar email. Tente novamente.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await resetPassword(email);
      setSuccess(true);
      toast.success('Email enviado!', 'Verifique a sua caixa de correio para instruções de recuperação.');
    } catch (err: any) {
      console.error('Erro ao recuperar password:', err);
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      toast.error('Erro ao enviar email', errorMessage);
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
          <p className="text-slate-400 mt-2">Recuperar Palavra-passe</p>
        </div>

        <Card variant="elevated" className="shadow-2xl">
          <CardContent className="p-8">
            {success ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Email Enviado!</h2>
                <p className="text-slate-600 mb-6">
                  Enviámos um email para <strong>{email}</strong> com instruções para repor a sua palavra-passe.
                </p>
                <p className="text-sm text-slate-500 mb-6">
                  Não recebeu o email? Verifique a pasta de spam ou tente novamente.
                </p>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSuccess(false);
                      setEmail('');
                    }}
                    className="w-full"
                  >
                    Enviar novamente
                  </Button>
                  <Link href="/login" className="block">
                    <Button variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />} className="w-full">
                      Voltar ao Login
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
                  Esqueceu a palavra-passe?
                </h2>
                <p className="text-slate-500 text-center mb-6">
                  Introduza o seu email e enviaremos instruções para repor a sua palavra-passe.
                </p>

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
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError('');
                        }}
                        placeholder="seu@email.com"
                        required
                        disabled={isSubmitting}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full py-3"
                    isLoading={isSubmitting}
                  >
                    Enviar Email
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Voltar ao Login
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
