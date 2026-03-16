'use client';

import { ArrowLeft, Save } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header } from '../../../../components/layout';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from '../../../../components/ui';
import { useAuth } from '../../../../context/AuthContext';
import { useToast } from '../../../../context/ToastContext';
import * as formandosService from '../../../../lib/formandosService';
import type { UserAccount } from '../../../../types';

export default function EditarFormandoPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const [formando, setFormando] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    dataNascimento: '',
  });

  const formandoId = params.id as string;

  useEffect(() => {
    if (user && user.role !== 'responsavel' && user.role !== 'assistente') {
      router.push('/');
      return;
    }
    loadFormando();
  }, [formandoId, user]);

  const loadFormando = async () => {
    setIsLoading(true);
    try {
      const data = await formandosService.getFormando(formandoId);
      if (data) {
        setFormando(data);
        setFormData({
          nome: data.nome,
          dataNascimento: data.dataNascimento || '',
        });
      } else {
        toast.error(
          'Formando não encontrado',
          'O formando solicitado não existe.'
        );
        router.push('/formandos');
      }
    } catch (error) {
      console.error('Erro ao carregar formando:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      toast.error('Campo obrigatório', 'O nome é obrigatório.');
      return;
    }

    setIsSubmitting(true);

    try {
      await formandosService.updateFormando(formandoId, {
        nome: formData.nome,
        dataNascimento: formData.dataNascimento || undefined,
      });

      toast.success(
        'Formando atualizado',
        `${formData.nome} foi atualizado com sucesso.`
      );
      router.push(`/formandos/${formandoId}`);
    } catch (error) {
      console.error('Erro ao atualizar formando:', error);
      toast.error('Erro', 'Não foi possível atualizar o formando.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header title="Editar Formando" subtitle="A carregar..." />
        <div className="p-8 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (!formando) return null;

  return (
    <>
      <Header
        title="Editar Formando"
        subtitle={`Editar dados de ${formando.nome}`}
        breadcrumbs={[{ label: 'Formandos', href: '/formandos' }, { label: 'Editar' }]}
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
                label="Email"
                type="email"
                value={formando.email}
                disabled
                className="opacity-60"
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
              Guardar Alterações
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
