'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import { Header } from '../../components/layout';
import { Button, Input, TextArea, Card, CardContent, CardHeader, CardTitle, Select, EmptyState } from '../../components/ui';
import { PrintStyles, SessionPlanPrint } from '../../components/print';
import { ClipboardList, Save, Plus, Trash2, Calendar, Printer, FileText, Lightbulb } from 'lucide-react';
import { SessionPlan } from '../../types';

function PlanosContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { state, getSessao, getCurso, getPlanoSessao, adicionarPlanoSessao, atualizarPlanoSessao, getPlanoDemonstracao, getFichasTrabalhoSessao } = useApp();
  
  const sessaoIdFromUrl = searchParams.get('sessao');
  const [selectedSessaoId, setSelectedSessaoId] = useState(sessaoIdFromUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'plano' | 'demonstracao' | 'fichas'>('plano');

  const selectedSessao = selectedSessaoId ? getSessao(selectedSessaoId) : null;
  const selectedCurso = selectedSessao ? getCurso(selectedSessao.cursoId) : null;
  const selectedModulo = selectedCurso?.modulos.find(m => m.id === selectedSessao?.moduloId);
  const existingPlano = selectedSessaoId ? getPlanoSessao(selectedSessaoId) : null;
  const existingDemonstracao = selectedSessaoId ? getPlanoDemonstracao(selectedSessaoId) : null;
  const existingFichas = selectedSessaoId ? getFichasTrabalhoSessao(selectedSessaoId) : [];

  const [formData, setFormData] = useState<Omit<SessionPlan, 'id' | 'sessaoId' | 'dataCriacao' | 'dataAtualizacao' | 'criadoPor'>>({
    introducao: '',
    desenvolvimento: '',
    conclusao: '',
    materiaisNecessarios: [''],
    tempoEstimado: 60,
    metodologias: [''],
    avaliacaoFormativa: '',
    adaptacoes: '',
    observacoes: '',
  });

  useEffect(() => {
    if (existingPlano) {
      setFormData({
        introducao: existingPlano.introducao,
        desenvolvimento: existingPlano.desenvolvimento,
        conclusao: existingPlano.conclusao,
        materiaisNecessarios: existingPlano.materiaisNecessarios.length > 0 ? existingPlano.materiaisNecessarios : [''],
        tempoEstimado: existingPlano.tempoEstimado,
        metodologias: existingPlano.metodologias.length > 0 ? existingPlano.metodologias : [''],
        avaliacaoFormativa: existingPlano.avaliacaoFormativa,
        adaptacoes: existingPlano.adaptacoes,
        observacoes: existingPlano.observacoes,
      });
    } else {
      setFormData({
        introducao: '',
        desenvolvimento: '',
        conclusao: '',
        materiaisNecessarios: [''],
        tempoEstimado: 60,
        metodologias: [''],
        avaliacaoFormativa: '',
        adaptacoes: '',
        observacoes: '',
      });
    }
  }, [existingPlano, selectedSessaoId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessaoId) return;

    setIsSubmitting(true);

    try {
      const dataToSave = {
        ...formData,
        materiaisNecessarios: formData.materiaisNecessarios.filter((m) => m.trim()),
        metodologias: formData.metodologias.filter((m) => m.trim()),
      };

      if (existingPlano) {
        atualizarPlanoSessao(existingPlano.id, dataToSave);
      } else {
        adicionarPlanoSessao(selectedSessaoId, dataToSave);
      }

      setIsSubmitting(false);
    } catch (error) {
      console.error('Erro ao guardar plano:', error);
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const addMaterial = () => {
    setFormData((prev) => ({
      ...prev,
      materiaisNecessarios: [...prev.materiaisNecessarios, ''],
    }));
  };

  const updateMaterial = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      materiaisNecessarios: prev.materiaisNecessarios.map((m, i) => (i === index ? value : m)),
    }));
  };

  const removeMaterial = (index: number) => {
    if (formData.materiaisNecessarios.length > 1) {
      setFormData((prev) => ({
        ...prev,
        materiaisNecessarios: prev.materiaisNecessarios.filter((_, i) => i !== index),
      }));
    }
  };

  const addMetodologia = () => {
    setFormData((prev) => ({
      ...prev,
      metodologias: [...prev.metodologias, ''],
    }));
  };

  const updateMetodologia = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      metodologias: prev.metodologias.map((m, i) => (i === index ? value : m)),
    }));
  };

  const removeMetodologia = (index: number) => {
    if (formData.metodologias.length > 1) {
      setFormData((prev) => ({
        ...prev,
        metodologias: prev.metodologias.filter((_, i) => i !== index),
      }));
    }
  };

  const sessoesDisponiveis = state.sessoes.filter((s) => s.status !== 'cancelado');

  return (
    <>
      <PrintStyles />
      
      {/* Print View */}
      {selectedSessao && existingPlano && (
        <SessionPlanPrint
          sessao={selectedSessao}
          plano={existingPlano}
          curso={selectedCurso}
          modulo={selectedModulo}
        />
      )}

      <div className="no-print">
        <Header
          title="Documentos Pedagógicos"
          subtitle="Planos de sessão, demonstração e fichas de trabalho"
        />

        <div className="p-8 max-w-5xl">
          {/* Seletor de Sessão */}
          <Card variant="bordered" className="mb-6">
            <CardContent>
              <div className="flex items-center gap-4">
                <Calendar className="w-5 h-5 text-violet-500" />
                <div className="flex-1">
                  <Select
                    label="Selecionar Sessão"
                    options={sessoesDisponiveis.map((s) => {
                      const curso = getCurso(s.cursoId);
                      return {
                        value: s.id,
                        label: `${s.nome} - ${curso?.nome || 'Sem curso'}`,
                      };
                    })}
                    placeholder="Escolha uma sessão para gerir os documentos..."
                    value={selectedSessaoId}
                    onChange={(e) => {
                      setSelectedSessaoId(e.target.value);
                      router.replace(`/planos?sessao=${e.target.value}`);
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {!selectedSessaoId ? (
            <EmptyState
              icon={<ClipboardList className="w-8 h-8" />}
              title="Selecione uma sessão"
              description="Escolha uma sessão da lista acima para gerir os documentos pedagógicos."
            />
          ) : (
            <>
              {/* Info da Sessão */}
              {selectedSessao && (
                <Card variant="bordered" className="bg-violet-50/50 border-violet-200 mb-6">
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-violet-100 text-violet-600">
                          <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{selectedSessao.nome}</h3>
                          <p className="text-sm text-slate-600">
                            {selectedCurso?.nome} • {selectedSessao.dataInicio} • {selectedSessao.horaInicio} - {selectedSessao.horaFim}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {existingPlano && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrint}
                            leftIcon={<Printer className="w-4 h-4" />}
                          >
                            Imprimir Plano
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tabs */}
              <div className="flex gap-2 mb-6 border-b border-slate-200">
                <button
                  onClick={() => setActiveTab('plano')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'plano'
                      ? 'border-violet-500 text-violet-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <ClipboardList className="w-4 h-4 inline-block mr-2" />
                  Plano de Sessão
                  {existingPlano && <span className="ml-2 w-2 h-2 bg-emerald-500 rounded-full inline-block" />}
                </button>
                <button
                  onClick={() => setActiveTab('demonstracao')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'demonstracao'
                      ? 'border-violet-500 text-violet-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Lightbulb className="w-4 h-4 inline-block mr-2" />
                  Plano de Demonstração
                  {existingDemonstracao && <span className="ml-2 w-2 h-2 bg-emerald-500 rounded-full inline-block" />}
                </button>
                <button
                  onClick={() => setActiveTab('fichas')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'fichas'
                      ? 'border-violet-500 text-violet-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <FileText className="w-4 h-4 inline-block mr-2" />
                  Fichas de Trabalho
                  {existingFichas.length > 0 && <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{existingFichas.length}</span>}
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'plano' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Estrutura da Sessão */}
                  <Card variant="bordered">
                    <CardHeader>
                      <CardTitle>Estrutura Pedagógica</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <TextArea
                        label="Introdução / Enquadramento"
                        placeholder="Descreva como vai iniciar a sessão, o enquadramento do tema, motivação inicial dos formandos..."
                        value={formData.introducao}
                        onChange={(e) => setFormData((prev) => ({ ...prev, introducao: e.target.value }))}
                        rows={4}
                      />

                      <TextArea
                        label="Desenvolvimento"
                        placeholder="Detalhe o desenvolvimento da sessão, sequência de atividades, explicações teóricas, exercícios práticos..."
                        value={formData.desenvolvimento}
                        onChange={(e) => setFormData((prev) => ({ ...prev, desenvolvimento: e.target.value }))}
                        rows={6}
                      />

                      <TextArea
                        label="Conclusão / Síntese"
                        placeholder="Descreva como vai concluir a sessão, síntese dos conteúdos, esclarecimento de dúvidas..."
                        value={formData.conclusao}
                        onChange={(e) => setFormData((prev) => ({ ...prev, conclusao: e.target.value }))}
                        rows={3}
                      />

                      <Input
                        label="Tempo Estimado (minutos)"
                        type="number"
                        min={15}
                        value={formData.tempoEstimado}
                        onChange={(e) => setFormData((prev) => ({ ...prev, tempoEstimado: parseInt(e.target.value) || 60 }))}
                      />
                    </CardContent>
                  </Card>

                  {/* Metodologias */}
                  <Card variant="bordered">
                    <CardHeader>
                      <CardTitle>Metodologias Pedagógicas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {formData.metodologias.map((metodologia, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder={`Ex: Exposição teórica, Trabalho em grupo, Estudo de caso...`}
                            value={metodologia}
                            onChange={(e) => updateMetodologia(index, e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMetodologia(index)}
                            className="!px-2"
                            disabled={formData.metodologias.length === 1}
                          >
                            <Trash2 className="w-4 h-4 text-slate-400" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addMetodologia}
                        leftIcon={<Plus className="w-4 h-4" />}
                      >
                        Adicionar Metodologia
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Materiais */}
                  <Card variant="bordered">
                    <CardHeader>
                      <CardTitle>Materiais Necessários</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {formData.materiaisNecessarios.map((material, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder={`Ex: Slides da apresentação, Fichas de trabalho, Computador...`}
                            value={material}
                            onChange={(e) => updateMaterial(index, e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMaterial(index)}
                            className="!px-2"
                            disabled={formData.materiaisNecessarios.length === 1}
                          >
                            <Trash2 className="w-4 h-4 text-slate-400" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addMaterial}
                        leftIcon={<Plus className="w-4 h-4" />}
                      >
                        Adicionar Material
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Avaliação e Adaptações */}
                  <Card variant="bordered">
                    <CardHeader>
                      <CardTitle>Avaliação e Adaptações</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <TextArea
                        label="Avaliação Formativa"
                        placeholder="Descreva como vai avaliar a aprendizagem dos formandos durante a sessão..."
                        value={formData.avaliacaoFormativa}
                        onChange={(e) => setFormData((prev) => ({ ...prev, avaliacaoFormativa: e.target.value }))}
                        rows={3}
                      />

                      <TextArea
                        label="Adaptações / Diferenciação Pedagógica"
                        placeholder="Descreva adaptações para diferentes ritmos de aprendizagem ou necessidades especiais..."
                        value={formData.adaptacoes}
                        onChange={(e) => setFormData((prev) => ({ ...prev, adaptacoes: e.target.value }))}
                        rows={3}
                      />
                    </CardContent>
                  </Card>

                  {/* Observações */}
                  <Card variant="bordered">
                    <CardHeader>
                      <CardTitle>Observações</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TextArea
                        placeholder="Notas adicionais, pontos de atenção, sugestões para melhoria..."
                        value={formData.observacoes}
                        onChange={(e) => setFormData((prev) => ({ ...prev, observacoes: e.target.value }))}
                        rows={4}
                      />
                    </CardContent>
                  </Card>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4">
                    <div>
                      {existingPlano && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrint}
                          leftIcon={<Printer className="w-4 h-4" />}
                        >
                          Imprimir
                        </Button>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <Button type="button" variant="ghost" onClick={() => router.back()}>
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        isLoading={isSubmitting}
                        leftIcon={<Save className="w-4 h-4" />}
                      >
                        {existingPlano ? 'Atualizar Plano' : 'Guardar Plano'}
                      </Button>
                    </div>
                  </div>
                </form>
              )}

              {activeTab === 'demonstracao' && (
                <div className="space-y-6">
                  {existingDemonstracao ? (
                    <Card variant="bordered" className="bg-emerald-50/50 border-emerald-200">
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-slate-900">{existingDemonstracao.titulo}</h3>
                            <p className="text-sm text-slate-600">{existingDemonstracao.duracaoTotal} minutos • {existingDemonstracao.etapas.length} etapas</p>
                          </div>
                          <div className="flex gap-2">
                            <Link href={`/planos/demonstracao?sessao=${selectedSessaoId}`}>
                              <Button variant="outline" size="sm">Editar</Button>
                            </Link>
                            <Link href={`/planos/demonstracao/imprimir?sessao=${selectedSessaoId}`}>
                              <Button variant="outline" size="sm" leftIcon={<Printer className="w-4 h-4" />}>
                                Imprimir
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <EmptyState
                      icon={<Lightbulb className="w-8 h-8" />}
                      title="Sem plano de demonstração"
                      description="Crie um plano de demonstração para esta sessão com etapas detalhadas."
                      actionLabel="Criar Plano de Demonstração"
                      onAction={() => router.push(`/planos/demonstracao?sessao=${selectedSessaoId}`)}
                    />
                  )}
                </div>
              )}

              {activeTab === 'fichas' && (
                <div className="space-y-6">
                  {existingFichas.length > 0 ? (
                    <>
                      {existingFichas.map((ficha) => (
                        <Card key={ficha.id} variant="bordered">
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold text-slate-900">{ficha.titulo}</h3>
                                <p className="text-sm text-slate-600">
                                  {ficha.exercicios.length} exercícios • {ficha.totalPontos} pontos • {ficha.tempoRecomendado} min
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Link href={`/planos/fichas/${ficha.id}?sessao=${selectedSessaoId}`}>
                                  <Button variant="outline" size="sm">Editar</Button>
                                </Link>
                                <Link href={`/planos/fichas/${ficha.id}/imprimir?sessao=${selectedSessaoId}`}>
                                  <Button variant="outline" size="sm" leftIcon={<Printer className="w-4 h-4" />}>
                                    Imprimir
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      <div className="text-center">
                        <Link href={`/planos/fichas/nova?sessao=${selectedSessaoId}`}>
                          <Button variant="outline" leftIcon={<Plus className="w-4 h-4" />}>
                            Criar Nova Ficha
                          </Button>
                        </Link>
                      </div>
                    </>
                  ) : (
                    <EmptyState
                      icon={<FileText className="w-8 h-8" />}
                      title="Sem fichas de trabalho"
                      description="Crie fichas de trabalho com exercícios para os formandos."
                      actionLabel="Criar Ficha de Trabalho"
                      onAction={() => router.push(`/planos/fichas/nova?sessao=${selectedSessaoId}`)}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function PlanosPage() {
  return (
    <Suspense fallback={<div className="p-8">A carregar...</div>}>
      <PlanosContent />
    </Suspense>
  );
}
