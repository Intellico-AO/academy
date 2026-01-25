'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../../context/AppContext';
import { Header } from '../../../components/layout';
import { Button, Input, TextArea, Card, CardContent, CardHeader, CardTitle, Select } from '../../../components/ui';
import { ArrowLeft, Plus, Trash2, Save, Clock, PlayCircle } from 'lucide-react';
import { SessionFormData, SessionActivity, SessionResource, SessionType } from '../../../types';

type ActivityFormData = Omit<SessionActivity, 'id' | 'ordem'>;
type ResourceFormData = Omit<SessionResource, 'id'>;

export default function NovaSessaoPage() {
  const router = useRouter();
  const { adicionarSessao, state, getCurso } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<SessionFormData>({
    cursoId: '',
    moduloId: '',
    nome: '',
    descricao: '',
    tipo: 'presencial',
    dataInicio: '',
    dataFim: '',
    horaInicio: '09:00',
    horaFim: '18:00',
    local: '',
    capacidadeMaxima: 20,
    formador: '',
    objetivosSessao: [''],
    notas: '',
    atividades: [],
    recursos: [],
  });

  const [currentActivity, setCurrentActivity] = useState<ActivityFormData>({
    nome: '',
    descricao: '',
    duracaoMinutos: 30,
    tipo: 'teorica',
    recursos: [],
  });

  const [currentResource, setCurrentResource] = useState<ResourceFormData>({
    tipo: 'material',
    nome: '',
    descricao: '',
    quantidade: 1,
  });

  const selectedCurso = getCurso(formData.cursoId);
  const modulosDisponiveis = selectedCurso?.modulos || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const sessao = adicionarSessao({
        ...formData,
        objetivosSessao: formData.objetivosSessao.filter((o) => o.trim()),
      });
      router.push(`/sessoes/${sessao.id}`);
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      setIsSubmitting(false);
    }
  };

  const addObjectivo = () => {
    setFormData((prev) => ({
      ...prev,
      objetivosSessao: [...prev.objetivosSessao, ''],
    }));
  };

  const updateObjectivo = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      objetivosSessao: prev.objetivosSessao.map((o, i) => (i === index ? value : o)),
    }));
  };

  const removeObjectivo = (index: number) => {
    if (formData.objetivosSessao.length > 1) {
      setFormData((prev) => ({
        ...prev,
        objetivosSessao: prev.objetivosSessao.filter((_, i) => i !== index),
      }));
    }
  };

  const addActivity = () => {
    if (currentActivity.nome.trim()) {
      setFormData((prev) => ({
        ...prev,
        atividades: [...prev.atividades, currentActivity],
      }));
      setCurrentActivity({
        nome: '',
        descricao: '',
        duracaoMinutos: 30,
        tipo: 'teorica',
        recursos: [],
      });
    }
  };

  const removeActivity = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      atividades: prev.atividades.filter((_, i) => i !== index),
    }));
  };

  const addResource = () => {
    if (currentResource.nome.trim()) {
      setFormData((prev) => ({
        ...prev,
        recursos: [...prev.recursos, currentResource],
      }));
      setCurrentResource({
        tipo: 'material',
        nome: '',
        descricao: '',
        quantidade: 1,
      });
    }
  };

  const removeResource = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      recursos: prev.recursos.filter((_, i) => i !== index),
    }));
  };

  const totalDuration = formData.atividades.reduce((acc, a) => acc + a.duracaoMinutos, 0);

  const getActivityTypeLabel = (tipo: SessionActivity['tipo']) => {
    switch (tipo) {
      case 'teorica':
        return 'Teórica';
      case 'pratica':
        return 'Prática';
      case 'avaliacao':
        return 'Avaliação';
      case 'intervalo':
        return 'Intervalo';
    }
  };

  return (
    <>
      <Header title="Nova Sessão" subtitle="Agendar uma nova sessão formativa" />

      <div className="p-8 max-w-5xl">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Voltar</span>
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Curso"
                  options={state.cursos.map((c) => ({
                    value: c.id,
                    label: `${c.codigo} - ${c.nome}`,
                  }))}
                  placeholder="Selecionar curso..."
                  value={formData.cursoId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cursoId: e.target.value, moduloId: '' }))}
                  required
                />
                <Select
                  label="Módulo"
                  options={modulosDisponiveis.map((m) => ({
                    value: m.id,
                    label: m.nome,
                  }))}
                  placeholder={formData.cursoId ? 'Selecionar módulo...' : 'Selecione um curso primeiro'}
                  value={formData.moduloId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, moduloId: e.target.value }))}
                  disabled={!formData.cursoId}
                />
              </div>

              <Input
                label="Nome da Sessão"
                placeholder="Ex: Sessão 1 - Introdução aos Conceitos"
                value={formData.nome}
                onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
                required
              />

              <TextArea
                label="Descrição"
                placeholder="Descreva os tópicos e objetivos desta sessão..."
                value={formData.descricao}
                onChange={(e) => setFormData((prev) => ({ ...prev, descricao: e.target.value }))}
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Agendamento */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Agendamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  label="Tipo de Sessão"
                  options={[
                    { value: 'presencial', label: 'Presencial' },
                    { value: 'online', label: 'Online' },
                    { value: 'hibrido', label: 'Híbrido' },
                  ]}
                  value={formData.tipo}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tipo: e.target.value as SessionType }))}
                />
                <Input
                  label="Data de Início"
                  type="date"
                  value={formData.dataInicio}
                  onChange={(e) => setFormData((prev) => ({ ...prev, dataInicio: e.target.value }))}
                  required
                />
                <Input
                  label="Data de Fim"
                  type="date"
                  value={formData.dataFim}
                  onChange={(e) => setFormData((prev) => ({ ...prev, dataFim: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  label="Hora de Início"
                  type="time"
                  value={formData.horaInicio}
                  onChange={(e) => setFormData((prev) => ({ ...prev, horaInicio: e.target.value }))}
                  required
                />
                <Input
                  label="Hora de Fim"
                  type="time"
                  value={formData.horaFim}
                  onChange={(e) => setFormData((prev) => ({ ...prev, horaFim: e.target.value }))}
                  required
                />
                <Input
                  label="Local"
                  placeholder="Ex: Sala de Formação A"
                  value={formData.local}
                  onChange={(e) => setFormData((prev) => ({ ...prev, local: e.target.value }))}
                />
                <Input
                  label="Capacidade Máxima"
                  type="number"
                  min={1}
                  value={formData.capacidadeMaxima}
                  onChange={(e) => setFormData((prev) => ({ ...prev, capacidadeMaxima: parseInt(e.target.value) || 1 }))}
                />
              </div>

              <Input
                label="Formador"
                placeholder="Nome do formador responsável"
                value={formData.formador}
                onChange={(e) => setFormData((prev) => ({ ...prev, formador: e.target.value }))}
              />
            </CardContent>
          </Card>

          {/* Objetivos */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Objetivos da Sessão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.objetivosSessao.map((obj, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Objetivo ${index + 1}`}
                    value={obj}
                    onChange={(e) => updateObjectivo(index, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeObjectivo(index)}
                    className="!px-2"
                    disabled={formData.objetivosSessao.length === 1}
                  >
                    <Trash2 className="w-4 h-4 text-slate-400" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addObjectivo}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Adicionar Objetivo
              </Button>
            </CardContent>
          </Card>

          {/* Atividades */}
          <Card variant="bordered">
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle>Atividades da Sessão</CardTitle>
                <span className="text-sm text-slate-500">
                  {formData.atividades.length} atividades • {Math.floor(totalDuration / 60)}h {totalDuration % 60}min
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {formData.atividades.length > 0 && (
                <div className="space-y-3 mb-6">
                  {formData.atividades.map((atividade, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600 font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900">{atividade.nome}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            atividade.tipo === 'teorica' ? 'bg-blue-100 text-blue-700' :
                            atividade.tipo === 'pratica' ? 'bg-emerald-100 text-emerald-700' :
                            atividade.tipo === 'avaliacao' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {getActivityTypeLabel(atividade.tipo)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">
                          {atividade.duracaoMinutos} minutos
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeActivity(index)}
                        className="!px-2"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-4 bg-violet-50/50 rounded-lg border border-violet-200 border-dashed">
                <h4 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                  <PlayCircle className="w-4 h-4 text-violet-600" />
                  Adicionar Atividade
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Input
                        label="Nome da Atividade"
                        placeholder="Ex: Apresentação de conceitos"
                        value={currentActivity.nome}
                        onChange={(e) => setCurrentActivity((prev) => ({ ...prev, nome: e.target.value }))}
                      />
                    </div>
                    <Select
                      label="Tipo"
                      options={[
                        { value: 'teorica', label: 'Teórica' },
                        { value: 'pratica', label: 'Prática' },
                        { value: 'avaliacao', label: 'Avaliação' },
                        { value: 'intervalo', label: 'Intervalo' },
                      ]}
                      value={currentActivity.tipo}
                      onChange={(e) => setCurrentActivity((prev) => ({ ...prev, tipo: e.target.value as SessionActivity['tipo'] }))}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Duração (minutos)"
                      type="number"
                      min={5}
                      value={currentActivity.duracaoMinutos}
                      onChange={(e) => setCurrentActivity((prev) => ({ ...prev, duracaoMinutos: parseInt(e.target.value) || 5 }))}
                    />
                    <div className="md:col-span-2">
                      <Input
                        label="Descrição (opcional)"
                        placeholder="Breve descrição da atividade..."
                        value={currentActivity.descricao}
                        onChange={(e) => setCurrentActivity((prev) => ({ ...prev, descricao: e.target.value }))}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={addActivity}
                    leftIcon={<Plus className="w-4 h-4" />}
                    disabled={!currentActivity.nome.trim()}
                  >
                    Adicionar Atividade
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recursos */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Recursos Necessários</CardTitle>
            </CardHeader>
            <CardContent>
              {formData.recursos.length > 0 && (
                <div className="space-y-2 mb-6">
                  {formData.recursos.map((recurso, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-1 rounded ${
                          recurso.tipo === 'material' ? 'bg-blue-100 text-blue-700' :
                          recurso.tipo === 'equipamento' ? 'bg-amber-100 text-amber-700' :
                          recurso.tipo === 'sala' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {recurso.tipo}
                        </span>
                        <span className="font-medium text-slate-900">{recurso.nome}</span>
                        <span className="text-slate-500">x{recurso.quantidade}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeResource(index)}
                        className="!px-2"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select
                  label="Tipo"
                  options={[
                    { value: 'material', label: 'Material' },
                    { value: 'equipamento', label: 'Equipamento' },
                    { value: 'sala', label: 'Sala' },
                    { value: 'outro', label: 'Outro' },
                  ]}
                  value={currentResource.tipo}
                  onChange={(e) => setCurrentResource((prev) => ({ ...prev, tipo: e.target.value as SessionResource['tipo'] }))}
                />
                <div className="md:col-span-2">
                  <Input
                    label="Nome do Recurso"
                    placeholder="Ex: Projetor, Manual do formando..."
                    value={currentResource.nome}
                    onChange={(e) => setCurrentResource((prev) => ({ ...prev, nome: e.target.value }))}
                  />
                </div>
                <Input
                  label="Quantidade"
                  type="number"
                  min={1}
                  value={currentResource.quantidade}
                  onChange={(e) => setCurrentResource((prev) => ({ ...prev, quantidade: parseInt(e.target.value) || 1 }))}
                />
              </div>
              <div className="mt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addResource}
                  leftIcon={<Plus className="w-4 h-4" />}
                  disabled={!currentResource.nome.trim()}
                >
                  Adicionar Recurso
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notas */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Notas Adicionais</CardTitle>
            </CardHeader>
            <CardContent>
              <TextArea
                placeholder="Notas internas, observações ou instruções especiais..."
                value={formData.notas}
                onChange={(e) => setFormData((prev) => ({ ...prev, notas: e.target.value }))}
                rows={4}
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
              disabled={!formData.cursoId || !formData.nome || !formData.dataInicio}
            >
              Guardar Sessão
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
