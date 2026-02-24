'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '../../../components/layout';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  TextArea,
} from '../../../components/ui';
import { ArrowLeft, Save, Scale } from 'lucide-react';
import { RegulatorFormData } from '../../../types';
import * as regulatorsService from '../../../lib/regulatorsService';
import * as firebaseService from '../../../lib/firebaseService';

export default function NovoReguladorPage() {
  const router = useRouter();
  const { center, user } = useAuth();
  const toast = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<RegulatorFormData>({
    nome: '',
    tipo: 'nacional',
    pais: '',
    descricao: '',
    website: '',
    email: '',
    telefone: '',
    morada: '',
  });
  const [cursosText, setCursosText] = useState('');
  const [programasText, setProgramasText] = useState('');

  if (user && user.role !== 'admin') {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!center?.id) {
      toast.error(
        'Centro não encontrado',
        'Não foi possível identificar o centro de formação.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const cursosCertificados = cursosText
        .split('\n')
        .map((c) => c.trim())
        .filter(Boolean);
      const programasCertificados = programasText
        .split('\n')
        .map((p) => p.trim())
        .filter(Boolean);

      const regulator = await regulatorsService.createRegulator(center.id, {
        ...formData,
        descricao: formData.descricao?.trim() || undefined,
        website: formData.website?.trim() || undefined,
        email: formData.email?.trim() || undefined,
        telefone: formData.telefone?.trim() || undefined,
        morada: formData.morada?.trim() || undefined,
        cursosCertificados: cursosCertificados.length ? cursosCertificados : undefined,
        programasCertificados: programasCertificados.length
          ? programasCertificados
          : undefined,
      });

      try {
        await firebaseService.createAuditLog({
          entidadeTipo: 'regulador',
          entidadeId: regulator.id,
          entidadeNome: regulator.nome,
          acao: 'criar',
          detalhes: `Regulador "${regulator.nome}" criado.`,
          alteracoesAntes: null,
          alteracoesDepois: regulator as unknown as Record<string, unknown>,
          utilizador: user?.nome || user?.email || 'Desconhecido',
          centroFormacaoId: center.id,
          dataHora: new Date().toISOString(),
        });
      } catch (logError) {
        console.error('Erro ao registar log de auditoria de regulador:', logError);
      }

      toast.success('Regulador criado', 'O regulador foi criado com sucesso.');
      router.push(`/admin/reguladores/${regulator.id}`);
    } catch (error) {
      console.error('Erro ao criar regulador:', error);
      toast.error('Erro', 'Não foi possível criar o regulador. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header
        title="Novo Regulador"
        subtitle="Registar uma nova entidade reguladora"
      />

      <div className="p-8 max-w-3xl">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Voltar</span>
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-red-600" />
                Dados do Regulador
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Nome da Entidade *"
                    placeholder="Ex: Autoridade Nacional de Formação Profissional"
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, nome: e.target.value }))
                    }
                    required
                  />
                </div>
                <Select
                  label="Tipo"
                  value={formData.tipo}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tipo: e.target.value as RegulatorFormData['tipo'],
                    }))
                  }
                  options={[
                    { value: 'nacional', label: 'Nacional' },
                    { value: 'regional', label: 'Regional' },
                    { value: 'internacional', label: 'Internacional' },
                    { value: 'outro', label: 'Outro' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="País *"
                  placeholder="Ex: Angola"
                  value={formData.pais}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, pais: e.target.value }))
                  }
                  required
                />
                <Input
                  label="Website"
                  placeholder="https://www.exemplo.pt"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, website: e.target.value }))
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="contacto@regulador.gov"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
                <Input
                  label="Telefone"
                  placeholder="+244 XXX XXX XXX"
                  value={formData.telefone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, telefone: e.target.value }))
                  }
                />
              </div>

              <Input
                label="Morada"
                placeholder="Rua, número, cidade"
                value={formData.morada}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, morada: e.target.value }))
                }
              />

              <TextArea
                label="Descrição"
                placeholder="Descreva brevemente a função ou âmbito deste regulador..."
                value={formData.descricao}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    descricao: e.target.value,
                  }))
                }
                rows={4}
              />

              <TextArea
                label="Cursos certificados por este regulador (um por linha, opcional)"
                placeholder="Ex: Código ou nome do curso por linha"
                value={cursosText}
                onChange={(e) => setCursosText(e.target.value)}
                rows={3}
              />

              <TextArea
                label="Programas certificados por este regulador (um por linha, opcional)"
                placeholder="Ex: Código ou nome do programa por linha"
                value={programasText}
                onChange={(e) => setProgramasText(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              leftIcon={<Save className="w-4 h-4" />}
              disabled={!formData.nome || !formData.pais}
            >
              Guardar Regulador
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

