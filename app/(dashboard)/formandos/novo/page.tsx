'use client';

import { ArrowLeft, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header } from '../../../components/layout';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
} from '../../../components/ui';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import * as authService from '../../../lib/authService';
import * as enrollmentService from '../../../lib/enrollmentService';
import * as formandosService from '../../../lib/formandosService';

export default function NovoFormandoPage() {
  const { center, user } = useAuth();
  const { state } = useApp();
  const router = useRouter();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    dataNascimento: '',
    cursoId: '',
  });

  // Verificar se é gestor
  useEffect(() => {
    if (user && user.role !== 'responsavel' && user.role !== 'assistente') {
      router.push('/');
      toast.error('Acesso negado', 'Apenas o responsável ou assistente pode registar formandos.');
    }
  }, [user, router, toast]);

  const cursosDisponiveis = state.cursos.filter(
    (c) => c.status === 'ativo' && (!center?.id || c.centroFormacaoId === center.id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!center?.id) return;

    if (!formData.nome.trim() || !formData.email.trim()) {
      toast.error(
        'Campos obrigatórios',
        'Preencha o nome e email do formando.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Verificar se email já existe
      const emailExists = await authService.checkEmailExists(formData.email);
      if (emailExists) {
        toast.error(
          'Email já registado',
          'Já existe uma conta com este email.'
        );
        setIsSubmitting(false);
        return;
      }

      // Verificar conflitos de horário se curso selecionado
      if (formData.cursoId) {
        const sessoesCurso = state.sessoes.filter(
          (s) => s.cursoId === formData.cursoId
        );
        // Como é novo formando, não há conflitos a verificar
        // Conflitos só se aplicam ao adicionar um segundo curso
      }

      // Criar formando (pré-registo sem password)
      const formando = await authService.createFormandoUser(
        formData.email,
        formData.nome,
        center.id,
        formData.dataNascimento || undefined
      );

      // Se curso selecionado, criar inscrição
      if (formData.cursoId) {
        await enrollmentService.createEnrollment(
          formando.id,
          formData.cursoId,
          center.id
        );
      }

      toast.success(
        'Formando registado',
        `${formData.nome} foi registado com sucesso.`
      );
      router.push('/formandos');
    } catch (error) {
      console.error('Erro ao registar formando:', error);
      toast.error(
        'Erro',
        'Não foi possível registar o formando. Tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user && user.role !== 'responsavel' && user.role !== 'assistente') {
    return null;
  }

  return (
    <>
      <Header
        title="Novo Formando"
        subtitle="Registar um novo formando no centro de formação"
        breadcrumbs={[{ label: 'Formandos', href: '/formandos' }, { label: 'Novo Formando' }]}
      />

      <div className="p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Nome completo *"
                placeholder="Nome do formando"
                value={formData.nome}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, nome: e.target.value }))
                }
                required
              />

              <Input
                label="Email *"
                type="email"
                placeholder="email@exemplo.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                required
              />

              <Input
                label="Data de nascimento"
                type="date"
                value={formData.dataNascimento}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    dataNascimento: e.target.value,
                  }))
                }
              />
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Inscrição em Curso</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                label="Curso"
                options={cursosDisponiveis.map((c) => ({
                  value: c.id,
                  label: `${c.nome} (${c.codigo})`,
                }))}
                placeholder="Selecione um curso (opcional)"
                value={formData.cursoId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, cursoId: e.target.value }))
                }
              />
              <p className="text-sm text-slate-500 mt-2">
                Pode inscrever o formando num curso agora ou mais tarde na
                página de detalhes.
              </p>
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="flex items-center justify-between pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Voltar
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Registar Formando
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
