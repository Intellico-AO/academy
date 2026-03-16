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
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import * as authService from '../../../lib/authService';

export default function NovoMembroPage() {
  const { center, user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    role: '' as 'responsavel' | 'assistente' | '',
  });

  // Apenas responsável pode adicionar membros
  useEffect(() => {
    if (user && user.role !== 'responsavel') {
      router.push('/');
      toast.error(
        'Acesso negado',
        'Apenas o responsável pode adicionar membros à equipa.'
      );
    }
  }, [user, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!center?.id) return;

    if (
      !formData.nome.trim() ||
      !formData.email.trim() ||
      !formData.role
    ) {
      toast.error(
        'Campos obrigatórios',
        'Preencha o nome, email e papel do membro.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Verificar se email já existe
      const emailExists = await authService.checkEmailExists(
        formData.email
      );
      if (emailExists) {
        toast.error(
          'Email já registado',
          'Já existe uma conta com este email.'
        );
        setIsSubmitting(false);
        return;
      }

      // Criar membro (pré-registo sem password)
      await authService.createTeamMember(
        formData.email,
        formData.nome,
        formData.role as 'responsavel' | 'assistente',
        center.id
      );

      toast.success(
        'Membro adicionado',
        `${formData.nome} foi adicionado como ${formData.role === 'responsavel' ? 'responsável' : 'assistente'}.`
      );
      router.push('/equipa');
    } catch (error) {
      console.error('Erro ao adicionar membro:', error);
      toast.error(
        'Erro',
        'Não foi possível adicionar o membro. Tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user && user.role !== 'responsavel') {
    return null;
  }

  return (
    <>
      <Header
        title="Novo Membro"
        subtitle="Adicionar um responsável ou assistente ao centro de formação"
        breadcrumbs={[{ label: 'Equipa', href: '/equipa' }, { label: 'Novo Membro' }]}
      />

      <div className="p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Dados do Membro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Nome completo *"
                placeholder="Nome do membro"
                value={formData.nome}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    nome: e.target.value,
                  }))
                }
                required
              />

              <Input
                label="Email *"
                type="email"
                placeholder="email@exemplo.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                required
              />

              <Select
                label="Papel *"
                options={[
                  {
                    value: 'responsavel',
                    label: 'Responsável — Acesso total à gestão do centro',
                  },
                  {
                    value: 'assistente',
                    label: 'Assistente — Gestão de formandos e suporte',
                  },
                ]}
                placeholder="Selecione o papel"
                value={formData.role}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    role: e.target.value as
                      | 'responsavel'
                      | 'assistente'
                      | '',
                  }))
                }
              />

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                O membro receberá acesso ao definir a sua password no
                primeiro login com o email indicado.
              </div>
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
              Adicionar Membro
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
