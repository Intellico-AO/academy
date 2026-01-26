'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button, Input, Card, CardContent } from '../../components/ui';
import { GraduationCap, Building2, User, AlertCircle, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { RegisterFormData } from '../../types';

export default function RegistarPage() {
  const router = useRouter();
  const { register, isLoading, isAuthenticated } = useAuth();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<RegisterFormData>({
    centroNome: '',
    centroNif: '',
    centroEmail: '',
    centroTelefone: '',
    centroMorada: '',
    centroCodigoPostal: '',
    centroLocalidade: '',
    centroPais: 'Angola',
    responsavelNome: '',
    responsavelEmail: '',
    responsavelPassword: '',
    responsavelTelefone: '',
  });

  const [confirmPassword, setConfirmPassword] = useState('');

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const updateField = (field: keyof RegisterFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(''); // Limpar erro ao alterar campo
  };

  const validateStep1 = () => {
    if (!formData.centroNome || !formData.centroNif || !formData.centroEmail) {
      setError('Preencha todos os campos obrigatórios');
      return false;
    }
    if (formData.centroNif.length < 11) {
      setError('NUI inválido (deve ter pelo menos 11 dígitos)');
      return false;
    }
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.centroEmail)) {
      setError('Email do centro inválido');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (!formData.responsavelNome || !formData.responsavelEmail || !formData.responsavelPassword) {
      setError('Preencha todos os campos obrigatórios');
      return false;
    }
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.responsavelEmail)) {
      setError('Email do responsável inválido');
      return false;
    }
    if (formData.responsavelPassword.length < 6) {
      setError('A palavra-passe deve ter pelo menos 6 caracteres');
      return false;
    }
    if (formData.responsavelPassword !== confirmPassword) {
      setError('As palavras-passe não coincidem');
      return false;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setError('');
  };

  const getErrorMessage = (err: any): string => {
    // Verificar se é um erro do Firebase ou um erro personalizado
    if (err.message?.includes('Firebase') || err.message?.includes('configurações')) {
      return 'Sistema não configurado. Contacte o administrador.';
    }
    
    const code = err.code || '';
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Este email já está registado';
      case 'auth/weak-password':
        return 'A palavra-passe é demasiado fraca. Use pelo menos 6 caracteres.';
      case 'auth/invalid-email':
        return 'Email inválido';
      case 'auth/network-request-failed':
        return 'Erro de ligação. Verifique a sua internet.';
      case 'auth/operation-not-allowed':
        return 'Operação não permitida. Contacte o suporte.';
      case 'auth/configuration-not-found':
        return 'Sistema não configurado. Contacte o administrador.';
      default:
        return err.message || 'Erro ao criar conta. Tente novamente.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) return;

    setIsSubmitting(true);
    setError('');

    try {
      await register(formData);
      toast.success('Conta criada com sucesso!', 'Bem-vindo ao FormaPro. O seu centro de formação está pronto.');
      router.push('/');
    } catch (err: any) {
      console.error('Erro no registo:', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      toast.error('Erro ao criar conta', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500 text-white mb-4">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-white">FormaPro</h1>
          <p className="text-slate-400 mt-2">Registar Centro de Formação</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
              {step > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
            </div>
            <span className="text-sm font-medium">Centro</span>
          </div>
          <div className="w-12 h-0.5 bg-slate-700" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
              2
            </div>
            <span className="text-sm font-medium">Responsável</span>
          </div>
        </div>

        {/* Card de Registo */}
        <Card variant="elevated" className="shadow-2xl">
          <CardContent className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-3 text-rose-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Step 1: Dados do Centro */}
              {step === 1 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Dados do Centro de Formação</h2>
                      <p className="text-sm text-slate-500">Informações da entidade formadora</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Input
                        label="Nome do Centro *"
                        placeholder="Nome completo do centro de formação"
                        value={formData.centroNome}
                        onChange={(e) => updateField('centroNome', e.target.value)}
                        required
                      />
                    </div>
                    <Input
                      label="NUI *"
                      placeholder="12345678901"
                      value={formData.centroNif}
                      onChange={(e) => updateField('centroNif', e.target.value)}
                      maxLength={11}
                      required
                    />
                    <Input
                      label="Telefone"
                      placeholder="+244 XXX XXX XXX"
                      value={formData.centroTelefone}
                      onChange={(e) => updateField('centroTelefone', e.target.value)}
                    />
                    <div className="md:col-span-2">
                      <Input
                        label="Email do Centro *"
                        type="email"
                        placeholder="geral@centro.ao"
                        value={formData.centroEmail}
                        onChange={(e) => updateField('centroEmail', e.target.value)}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        label="Morada"
                        placeholder="Rua, número, andar"
                        value={formData.centroMorada}
                        onChange={(e) => updateField('centroMorada', e.target.value)}
                      />
                    </div>
                    <Input
                      label="Código Postal (Opcional)"
                      placeholder="Opcional"
                      value={formData.centroCodigoPostal}
                      onChange={(e) => updateField('centroCodigoPostal', e.target.value)}
                    />
                    <Input
                      label="Localidade"
                      placeholder="Luanda"
                      value={formData.centroLocalidade}
                      onChange={(e) => updateField('centroLocalidade', e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      type="button"
                      onClick={handleNext}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Continuar
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Dados do Responsável */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Dados do Responsável</h2>
                      <p className="text-sm text-slate-500">Administrador do centro de formação</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Input
                        label="Nome Completo *"
                        placeholder="Nome do responsável"
                        value={formData.responsavelNome}
                        onChange={(e) => updateField('responsavelNome', e.target.value)}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <Input
                      label="Email *"
                      type="email"
                      placeholder="responsavel@centro.ao"
                      value={formData.responsavelEmail}
                      onChange={(e) => updateField('responsavelEmail', e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                    <Input
                      label="Telefone"
                      placeholder="+244 XXX XXX XXX"
                      value={formData.responsavelTelefone}
                      onChange={(e) => updateField('responsavelTelefone', e.target.value)}
                      disabled={isSubmitting}
                    />
                    <Input
                      label="Palavra-passe *"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={formData.responsavelPassword}
                      onChange={(e) => updateField('responsavelPassword', e.target.value)}
                      required
                      minLength={6}
                      disabled={isSubmitting}
                    />
                    <Input
                      label="Confirmar Palavra-passe *"
                      type="password"
                      placeholder="Repetir palavra-passe"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="flex items-start gap-2 p-4 bg-slate-50 rounded-lg text-sm text-slate-600">
                    <input 
                      type="checkbox" 
                      required 
                      disabled={isSubmitting}
                      className="mt-1 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" 
                    />
                    <span>
                      Li e aceito os{' '}
                      <a href="#" className="text-emerald-600 hover:underline">Termos e Condições</a>
                      {' '}e a{' '}
                      <a href="#" className="text-emerald-600 hover:underline">Política de Privacidade</a>
                    </span>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleBack}
                      leftIcon={<ArrowLeft className="w-4 h-4" />}
                      disabled={isSubmitting}
                    >
                      Voltar
                    </Button>
                    <Button
                      type="submit"
                      isLoading={isSubmitting}
                      disabled={isSubmitting || isLoading}
                    >
                      Criar Conta
                    </Button>
                  </div>
                </div>
              )}
            </form>

            <div className="mt-6 text-center border-t border-slate-200 pt-6">
              <p className="text-slate-600">
                Já tem conta?{' '}
                <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  Iniciar Sessão
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
