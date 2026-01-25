'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { useToast } from '../../../../context/ToastContext';
import { Header } from '../../../../components/layout';
import { Button, Input, TextArea, Card, CardContent, CardHeader, CardTitle, Select } from '../../../../components/ui';
import { ArrowLeft, Plus, Trash2, Save, UserCircle } from 'lucide-react';
import { Trainer, TrainerFormData, Status } from '../../../../types';
import * as trainersService from '../../../../lib/trainersService';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditarFormadorPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { center } = useAuth();
  const toast = useToast();
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<TrainerFormData & { status: Status }>({
    nome: '',
    email: '',
    telefone: '',
    nif: '',
    morada: '',
    codigoPostal: '',
    localidade: '',
    dataNascimento: '',
    nacionalidade: 'Portuguesa',
    habilitacoes: '',
    certificacaoPedagogica: 'CCP',
    numeroCertificacao: '',
    validadeCertificacao: '',
    areasCompetencia: [''],
    experienciaAnos: 0,
    curriculo: '',
    status: 'ativo',
  });

  useEffect(() => {
    loadTrainer();
  }, [id]);

  const loadTrainer = async () => {
    try {
      const data = await trainersService.getTrainer(id);
      if (data) {
        setTrainer(data);
        setFormData({
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          nif: data.nif,
          morada: data.morada,
          codigoPostal: data.codigoPostal,
          localidade: data.localidade,
          dataNascimento: data.dataNascimento,
          nacionalidade: data.nacionalidade,
          habilitacoes: data.habilitacoes,
          certificacaoPedagogica: data.certificacaoPedagogica,
          numeroCertificacao: data.numeroCertificacao,
          validadeCertificacao: data.validadeCertificacao,
          areasCompetencia: data.areasCompetencia.length > 0 ? data.areasCompetencia : [''],
          experienciaAnos: data.experienciaAnos,
          curriculo: data.curriculo,
          status: data.status,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar formador:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainer) return;

    setIsSubmitting(true);
    setError('');

    try {
      await trainersService.updateTrainer(trainer.id, {
        ...formData,
        areasCompetencia: formData.areasCompetencia.filter((a) => a.trim()),
      });
      
      toast.success('Formador atualizado!', 'As alterações foram guardadas com sucesso.');
      router.push(`/formadores/${trainer.id}`);
    } catch (error) {
      console.error('Erro ao atualizar formador:', error);
      const msg = 'Erro ao atualizar formador. Tente novamente.';
      setError(msg);
      toast.error('Erro', msg);
      setIsSubmitting(false);
    }
  };

  const addArea = () => {
    setFormData((prev) => ({
      ...prev,
      areasCompetencia: [...prev.areasCompetencia, ''],
    }));
  };

  const updateArea = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      areasCompetencia: prev.areasCompetencia.map((a, i) => (i === index ? value : a)),
    }));
  };

  const removeArea = (index: number) => {
    if (formData.areasCompetencia.length > 1) {
      setFormData((prev) => ({
        ...prev,
        areasCompetencia: prev.areasCompetencia.filter((_, i) => i !== index),
      }));
    }
  };

  if (isLoading) {
    return (
      <>
        <Header title="A carregar..." />
        <div className="p-8 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (!trainer) {
    return (
      <>
        <Header title="Formador não encontrado" />
        <div className="p-8">
          <p className="text-slate-500">O formador solicitado não existe ou foi eliminado.</p>
          <Button onClick={() => router.push('/formadores')} className="mt-4">
            Voltar aos Formadores
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Editar Formador" subtitle={trainer.nome} />

      <div className="p-8 max-w-4xl">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Voltar</span>
        </button>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Pessoais */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="w-5 h-5 text-emerald-500" />
                Dados Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Nome Completo *"
                    placeholder="Nome completo do formador"
                    value={formData.nome}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
                    required
                  />
                </div>
                <Select
                  label="Estado"
                  value={formData.status}
                  onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as Status }))}
                  options={[
                    { value: 'ativo', label: 'Ativo' },
                    { value: 'arquivado', label: 'Arquivado' },
                  ]}
                />
                <Input
                  label="Email *"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
                <Input
                  label="Telefone"
                  placeholder="+351 XXX XXX XXX"
                  value={formData.telefone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, telefone: e.target.value }))}
                />
                <Input
                  label="NIF"
                  placeholder="123456789"
                  value={formData.nif}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nif: e.target.value }))}
                />
                <Input
                  label="Data de Nascimento"
                  type="date"
                  value={formData.dataNascimento}
                  onChange={(e) => setFormData((prev) => ({ ...prev, dataNascimento: e.target.value }))}
                />
                <Input
                  label="Nacionalidade"
                  placeholder="Portuguesa"
                  value={formData.nacionalidade}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nacionalidade: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Morada */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Morada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-3">
                  <Input
                    label="Morada"
                    placeholder="Rua, número, andar"
                    value={formData.morada}
                    onChange={(e) => setFormData((prev) => ({ ...prev, morada: e.target.value }))}
                  />
                </div>
                <Input
                  label="Código Postal"
                  placeholder="0000-000"
                  value={formData.codigoPostal}
                  onChange={(e) => setFormData((prev) => ({ ...prev, codigoPostal: e.target.value }))}
                />
                <div className="md:col-span-2">
                  <Input
                    label="Localidade"
                    placeholder="Lisboa"
                    value={formData.localidade}
                    onChange={(e) => setFormData((prev) => ({ ...prev, localidade: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Qualificações */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Qualificações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Habilitações Académicas"
                  placeholder="Ex: Licenciatura em Engenharia"
                  value={formData.habilitacoes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, habilitacoes: e.target.value }))}
                />
                <Input
                  label="Anos de Experiência"
                  type="number"
                  min={0}
                  value={formData.experienciaAnos}
                  onChange={(e) => setFormData((prev) => ({ ...prev, experienciaAnos: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  label="Certificação Pedagógica"
                  value={formData.certificacaoPedagogica}
                  onChange={(e) => setFormData((prev) => ({ ...prev, certificacaoPedagogica: e.target.value }))}
                  options={[
                    { value: 'CCP', label: 'CCP - Certificado de Competências Pedagógicas' },
                    { value: 'CAP', label: 'CAP - Certificado de Aptidão Pedagógica' },
                    { value: 'Outro', label: 'Outro' },
                  ]}
                />
                <Input
                  label="Número de Certificação"
                  placeholder="F123456/2024"
                  value={formData.numeroCertificacao}
                  onChange={(e) => setFormData((prev) => ({ ...prev, numeroCertificacao: e.target.value }))}
                />
                <Input
                  label="Validade"
                  type="date"
                  value={formData.validadeCertificacao}
                  onChange={(e) => setFormData((prev) => ({ ...prev, validadeCertificacao: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Áreas de Competência */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Áreas de Competência</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.areasCompetencia.map((area, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Ex: Gestão de Projetos, Informática, Marketing Digital...`}
                    value={area}
                    onChange={(e) => updateArea(index, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeArea(index)}
                    className="!px-2"
                    disabled={formData.areasCompetencia.length === 1}
                  >
                    <Trash2 className="w-4 h-4 text-slate-400" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addArea}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Adicionar Área
              </Button>
            </CardContent>
          </Card>

          {/* Currículo */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Currículo / Resumo Profissional</CardTitle>
            </CardHeader>
            <CardContent>
              <TextArea
                placeholder="Breve resumo do percurso profissional e académico do formador..."
                value={formData.curriculo || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, curriculo: e.target.value }))}
                rows={5}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              leftIcon={<Save className="w-4 h-4" />}
              disabled={!formData.nome || !formData.email}
            >
              Guardar Alterações
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
