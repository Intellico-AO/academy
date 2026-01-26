'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { Header } from '../../../components/layout';
import { Button, Input, TextArea, Card, CardContent, CardHeader, CardTitle, Select } from '../../../components/ui';
import { ArrowLeft, Plus, Trash2, Save, UserCircle } from 'lucide-react';
import { TrainerFormData } from '../../../types';
import * as trainersService from '../../../lib/trainersService';

export default function NovoFormadorPage() {
  const router = useRouter();
  const { center, user } = useAuth();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Verificar se é admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
      toast.error('Acesso negado', 'Apenas o responsável pode gerir formadores.');
    }
  }, [user, router, toast]);

  const [formData, setFormData] = useState<TrainerFormData>({
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
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!center?.id) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Verificar se email já existe
      const emailExists = await trainersService.checkTrainerEmailExists(center.id, formData.email);
      if (emailExists) {
        const msg = 'Já existe um formador com este email';
        setError(msg);
        toast.error('Erro de validação', msg);
        setIsSubmitting(false);
        return;
      }

      // Verificar se NUI já existe
      if (formData.nif) {
        const nifExists = await trainersService.checkTrainerNifExists(center.id, formData.nif);
        if (nifExists) {
          const msg = 'Já existe um formador com este NUI';
          setError(msg);
          toast.error('Erro de validação', msg);
          setIsSubmitting(false);
          return;
        }
      }

      const trainer = await trainersService.createTrainer(center.id, {
        ...formData,
        areasCompetencia: formData.areasCompetencia.filter((a) => a.trim()),
      });
      
      toast.success('Formador criado!', `${formData.nome} foi registado com sucesso.`);
      router.push(`/formadores/${trainer.id}`);
    } catch (error) {
      console.error('Erro ao criar formador:', error);
      const msg = 'Erro ao criar formador. Tente novamente.';
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

  // Verificar permissões antes de renderizar
  if (user && user.role !== 'admin') {
    return null; // Será redirecionado pelo useEffect
  }

  return (
    <>
      <Header title="Novo Formador" subtitle="Registar um novo formador" />

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Nome Completo *"
                    placeholder="Nome completo do formador"
                    value={formData.nome}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
                    required
                  />
                </div>
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
                  label="NUI"
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
                  placeholder="Angolana"
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
                  label="Código Postal (Opcional)"
                  placeholder="Opcional"
                  value={formData.codigoPostal}
                  onChange={(e) => setFormData((prev) => ({ ...prev, codigoPostal: e.target.value }))}
                />
                <div className="md:col-span-2">
                  <Input
                    label="Localidade"
                    placeholder="Luanda"
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
              Guardar Formador
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
