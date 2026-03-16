'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '../../../../context/AppContext';
import { useAuth } from '../../../../context/AuthContext';
import { useToast } from '../../../../context/ToastContext';
import { Header } from '../../../../components/layout';
import {
  Button,
  Input,
  TextArea,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../components/ui';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import type { DemonstrationPlanFormData, DemonstrationStep } from '../../../../types';

type StepFormData = Omit<DemonstrationStep, 'id'>;

interface DemonstracaoFormProps {
  planoId?: string;
}

export function DemonstracaoForm({ planoId }: DemonstracaoFormProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const {
    adicionarPlanoDemonstracao,
    atualizarPlanoDemonstracao,
    state,
  } = useApp();

  const sessaoId = searchParams.get('sessao') || '';
  const isEditing = !!planoId;

  const existingPlano = isEditing
    ? state.planosDemonstracao.find((p) => p.id === planoId)
    : undefined;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<DemonstrationPlanFormData>({
    titulo: '',
    objetivoGeral: '',
    objetivosEspecificos: [''],
    publicoAlvo: '',
    materiaisEquipamentos: [''],
    condicoesSeguranca: [''],
    preparacaoPrevia: '',
    etapas: [],
    criteriosAvaliacao: [''],
    observacoes: '',
  });

  const [currentStep, setCurrentStep] = useState<StepFormData>({
    ordem: 1,
    descricao: '',
    tempoMinutos: 10,
    materiaisNecessarios: [],
    pontosChave: [],
    errosComuns: [],
  });

  // Carregar dados existentes
  useEffect(() => {
    if (existingPlano) {
      setFormData({
        titulo: existingPlano.titulo,
        objetivoGeral: existingPlano.objetivoGeral,
        objetivosEspecificos:
          existingPlano.objetivosEspecificos.length > 0
            ? existingPlano.objetivosEspecificos
            : [''],
        publicoAlvo: existingPlano.publicoAlvo,
        materiaisEquipamentos:
          existingPlano.materiaisEquipamentos.length > 0
            ? existingPlano.materiaisEquipamentos
            : [''],
        condicoesSeguranca:
          existingPlano.condicoesSeguranca.length > 0
            ? existingPlano.condicoesSeguranca
            : [''],
        preparacaoPrevia: existingPlano.preparacaoPrevia,
        etapas: existingPlano.etapas.map((e) => ({
          ordem: e.ordem,
          descricao: e.descricao,
          tempoMinutos: e.tempoMinutos,
          materiaisNecessarios: e.materiaisNecessarios,
          pontosChave: e.pontosChave,
          errosComuns: e.errosComuns,
        })),
        criteriosAvaliacao:
          existingPlano.criteriosAvaliacao.length > 0
            ? existingPlano.criteriosAvaliacao
            : [''],
        observacoes: existingPlano.observacoes,
      });
    }
  }, [existingPlano]);

  // Redirect se não for formador/responsável
  useEffect(() => {
    if (user && user.role !== 'formador' && user.role !== 'responsavel') {
      router.push('/planos');
    }
  }, [user, router]);

  // Helpers para listas dinâmicas
  const addToList = (
    field: 'objetivosEspecificos' | 'materiaisEquipamentos' | 'condicoesSeguranca' | 'criteriosAvaliacao'
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const updateList = (
    field: 'objetivosEspecificos' | 'materiaisEquipamentos' | 'condicoesSeguranca' | 'criteriosAvaliacao',
    index: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const removeFromList = (
    field: 'objetivosEspecificos' | 'materiaisEquipamentos' | 'condicoesSeguranca' | 'criteriosAvaliacao',
    index: number
  ) => {
    if (formData[field].length > 1) {
      setFormData((prev) => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index),
      }));
    }
  };

  // Etapas
  const addEtapa = () => {
    if (!currentStep.descricao.trim()) return;
    setFormData((prev) => ({
      ...prev,
      etapas: [
        ...prev.etapas,
        { ...currentStep, ordem: prev.etapas.length + 1 },
      ],
    }));
    setCurrentStep({
      ordem: formData.etapas.length + 2,
      descricao: '',
      tempoMinutos: 10,
      materiaisNecessarios: [],
      pontosChave: [],
      errosComuns: [],
    });
  };

  const removeEtapa = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      etapas: prev.etapas
        .filter((_, i) => i !== index)
        .map((e, i) => ({ ...e, ordem: i + 1 })),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetSessaoId = isEditing
      ? existingPlano?.sessaoId || sessaoId
      : sessaoId;

    if (!targetSessaoId) return;

    if (!formData.titulo.trim()) {
      toast.error('Campo obrigatório', 'O título é obrigatório.');
      return;
    }

    setIsSubmitting(true);
    try {
      const dataToSave: DemonstrationPlanFormData = {
        ...formData,
        objetivosEspecificos: formData.objetivosEspecificos.filter(
          (o) => o.trim()
        ),
        materiaisEquipamentos: formData.materiaisEquipamentos.filter(
          (m) => m.trim()
        ),
        condicoesSeguranca: formData.condicoesSeguranca.filter(
          (c) => c.trim()
        ),
        criteriosAvaliacao: formData.criteriosAvaliacao.filter(
          (c) => c.trim()
        ),
      };

      if (isEditing && planoId) {
        await atualizarPlanoDemonstracao(planoId, dataToSave);
        toast.success(
          'Plano atualizado',
          `"${formData.titulo}" foi atualizado.`
        );
      } else {
        await adicionarPlanoDemonstracao(targetSessaoId, dataToSave);
        toast.success(
          'Plano criado',
          `"${formData.titulo}" foi criado.`
        );
      }

      router.push(`/planos?sessao=${targetSessaoId}`);
    } catch (error) {
      console.error('Erro ao guardar plano de demonstração:', error);
      toast.error('Erro', 'Não foi possível guardar o plano.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Contexto para IA
  const buildAiContext = () => {
    const parts: string[] = [];
    parts.push(`SESSÃO ID: ${sessaoId}`);
    parts.push('\nPLANO DE DEMONSTRAÇÃO - CAMPOS PREENCHIDOS:');
    if (formData.titulo) parts.push(`Título: ${formData.titulo}`);
    if (formData.objetivoGeral)
      parts.push(`Objectivo geral: ${formData.objetivoGeral}`);
    if (formData.publicoAlvo)
      parts.push(`Público-alvo: ${formData.publicoAlvo}`);
    if (formData.preparacaoPrevia)
      parts.push(`Preparação prévia: ${formData.preparacaoPrevia}`);
    if (formData.etapas.length > 0)
      parts.push(
        `Etapas: ${formData.etapas.map((e) => e.descricao).join('; ')}`
      );
    return parts.join('\n');
  };

  if (user && user.role !== 'formador' && user.role !== 'responsavel') {
    return null;
  }

  return (
    <>
      <Header
        title={
          isEditing
            ? 'Editar Plano de Demonstração'
            : 'Novo Plano de Demonstração'
        }
        subtitle={undefined}
      />

      <div className="p-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Gerais */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Título *"
                placeholder="Ex: Demonstração de Soldadura TIG"
                value={formData.titulo}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    titulo: e.target.value,
                  }))
                }
                required
              />

              <TextArea
                label="Objectivo Geral"
                placeholder="O objectivo principal desta demonstração..."
                value={formData.objetivoGeral}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    objetivoGeral: e.target.value,
                  }))
                }
                onAiGenerate={(text) =>
                  setFormData((prev) => ({
                    ...prev,
                    objetivoGeral: text,
                  }))
                }
                aiContext={buildAiContext()}
                rows={3}
              />

              <Input
                label="Público-Alvo"
                placeholder="Ex: Formandos do módulo de soldadura"
                value={formData.publicoAlvo}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    publicoAlvo: e.target.value,
                  }))
                }
              />
            </CardContent>
          </Card>

          {/* Objectivos Específicos */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Objectivos Específicos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.objetivosEspecificos.map((obj, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Ex: Identificar os materiais necessários..."
                    value={obj}
                    onChange={(e) =>
                      updateList(
                        'objetivosEspecificos',
                        index,
                        e.target.value
                      )
                    }
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      removeFromList('objetivosEspecificos', index)
                    }
                    className="!px-2"
                    disabled={
                      formData.objetivosEspecificos.length === 1
                    }
                  >
                    <Trash2 className="w-4 h-4 text-slate-400" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addToList('objetivosEspecificos')}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Adicionar Objectivo
              </Button>
            </CardContent>
          </Card>

          {/* Preparação */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Preparação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <TextArea
                label="Preparação Prévia"
                placeholder="Descreva o que deve ser preparado antes da demonstração..."
                value={formData.preparacaoPrevia}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    preparacaoPrevia: e.target.value,
                  }))
                }
                onAiGenerate={(text) =>
                  setFormData((prev) => ({
                    ...prev,
                    preparacaoPrevia: text,
                  }))
                }
                aiContext={buildAiContext()}
                rows={3}
              />

              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">
                  Materiais e Equipamentos
                </h4>
                {formData.materiaisEquipamentos.map((mat, index) => (
                  <div
                    key={index}
                    className="flex gap-2 mb-2"
                  >
                    <Input
                      placeholder="Ex: Máquina de soldadura TIG"
                      value={mat}
                      onChange={(e) =>
                        updateList(
                          'materiaisEquipamentos',
                          index,
                          e.target.value
                        )
                      }
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        removeFromList(
                          'materiaisEquipamentos',
                          index
                        )
                      }
                      className="!px-2"
                      disabled={
                        formData.materiaisEquipamentos.length === 1
                      }
                    >
                      <Trash2 className="w-4 h-4 text-slate-400" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addToList('materiaisEquipamentos')}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Adicionar Material
                </Button>
              </div>

              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">
                  Condições de Segurança
                </h4>
                {formData.condicoesSeguranca.map((cond, index) => (
                  <div
                    key={index}
                    className="flex gap-2 mb-2"
                  >
                    <Input
                      placeholder="Ex: Usar óculos de protecção"
                      value={cond}
                      onChange={(e) =>
                        updateList(
                          'condicoesSeguranca',
                          index,
                          e.target.value
                        )
                      }
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        removeFromList('condicoesSeguranca', index)
                      }
                      className="!px-2"
                      disabled={
                        formData.condicoesSeguranca.length === 1
                      }
                    >
                      <Trash2 className="w-4 h-4 text-slate-400" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addToList('condicoesSeguranca')}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Adicionar Condição
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Etapas */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>
                Etapas da Demonstração ({formData.etapas.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Lista de etapas */}
              {formData.etapas.map((etapa, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                >
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-violet-100 text-violet-700 text-sm font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900">
                      {etapa.descricao}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {etapa.tempoMinutos} min
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEtapa(index)}
                    className="!px-2"
                  >
                    <Trash2 className="w-4 h-4 text-slate-400" />
                  </Button>
                </div>
              ))}

              {/* Adicionar etapa */}
              <div className="border border-dashed border-slate-300 rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium text-slate-600">
                  Nova etapa
                </p>
                <TextArea
                  placeholder="Descreva esta etapa da demonstração..."
                  value={currentStep.descricao}
                  onChange={(e) =>
                    setCurrentStep((prev) => ({
                      ...prev,
                      descricao: e.target.value,
                    }))
                  }
                  rows={2}
                />
                <div className="flex items-end gap-3">
                  <Input
                    label="Duração (min)"
                    type="number"
                    min={1}
                    value={currentStep.tempoMinutos}
                    onChange={(e) =>
                      setCurrentStep((prev) => ({
                        ...prev,
                        tempoMinutos:
                          parseInt(e.target.value) || 10,
                      }))
                    }
                    className="w-32"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addEtapa}
                    disabled={!currentStep.descricao.trim()}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Adicionar Etapa
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Avaliação */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Critérios de Avaliação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.criteriosAvaliacao.map((crit, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Ex: Executar correctamente a técnica demonstrada"
                    value={crit}
                    onChange={(e) =>
                      updateList(
                        'criteriosAvaliacao',
                        index,
                        e.target.value
                      )
                    }
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      removeFromList('criteriosAvaliacao', index)
                    }
                    className="!px-2"
                    disabled={
                      formData.criteriosAvaliacao.length === 1
                    }
                  >
                    <Trash2 className="w-4 h-4 text-slate-400" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addToList('criteriosAvaliacao')}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Adicionar Critério
              </Button>
            </CardContent>
          </Card>

          {/* Observações */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <TextArea
                placeholder="Notas adicionais sobre a demonstração..."
                value={formData.observacoes}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    observacoes: e.target.value,
                  }))
                }
                onAiGenerate={(text) =>
                  setFormData((prev) => ({
                    ...prev,
                    observacoes: text,
                  }))
                }
                aiContext={buildAiContext()}
                rows={3}
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
              {isEditing ? 'Atualizar Plano' : 'Criar Plano'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
