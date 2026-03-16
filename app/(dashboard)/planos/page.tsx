'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Header } from '../../components/layout';
import { Button, Input, TextArea, Card, CardContent, CardHeader, CardTitle, Select, EmptyState } from '../../components/ui';
import { PrintStyles, SessionPlanPrint } from '../../components/print';
import { ClipboardList, Save, Plus, Trash2, Calendar, Printer, FileText, Lightbulb } from 'lucide-react';
import { SessionPlan, Trainer, SessionFormData } from '../../types';
import { getActiveTrainers } from '../../lib/trainersService';

function PlanosContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, center } = useAuth();
  const { state, getSessao, getCurso, getPlanoSessao, adicionarPlanoSessao, atualizarPlanoSessao, atualizarSessao, getPlanosDemonstracao, getFichasTrabalhoSessao } = useApp();
  const isFormando = user?.role === 'formando';

  const sessaoIdFromUrl = searchParams.get('sessao');
  const [selectedSessaoId, setSelectedSessaoId] = useState(sessaoIdFromUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'plano' | 'demonstracao' | 'fichas'>('plano');
  const [formadores, setFormadores] = useState<Trainer[]>([]);

  useEffect(() => {
    if (center?.id) {
      getActiveTrainers(center.id).then(setFormadores).catch(console.error);
    }
  }, [center?.id]);

  const selectedSessao = selectedSessaoId ? getSessao(selectedSessaoId) : undefined;
  const selectedCurso = selectedSessao ? getCurso(selectedSessao.cursoId) : undefined;
  const existingPlano = selectedSessaoId ? getPlanoSessao(selectedSessaoId) : null;
  const existingDemonstracoes = selectedSessaoId ? getPlanosDemonstracao(selectedSessaoId) : [];
  const existingFichas = selectedSessaoId ? getFichasTrabalhoSessao(selectedSessaoId) : [];

  // Campos da sessão (editáveis)
  const [sessaoData, setSessaoData] = useState({
    nome: '',
    descricao: '',
    formadorId: '' as string | undefined,
    formador: '',
    objetivosSessao: [''] as string[],
  });

  // Campos pedagógicos do plano
  const [planoData, setPlanoData] = useState({
    introducao: '',
    desenvolvimento: '',
    conclusao: '',
    metodos: [''] as string[],
    tecnicas: [''] as string[],
    avaliacaoFormativa: '',
    adaptacoes: '',
    observacoes: '',
  });

  // Sincronizar campos da sessão quando a sessão selecionada muda
  useEffect(() => {
    if (selectedSessao) {
      setSessaoData({
        nome: selectedSessao.nome,
        descricao: selectedSessao.descricao,
        formadorId: selectedSessao.formadorId,
        formador: selectedSessao.formador,
        objetivosSessao: selectedSessao.objetivosSessao.length > 0 ? selectedSessao.objetivosSessao : [''],
      });
    }
  }, [selectedSessao]);

  // Sincronizar campos do plano quando o plano existente muda
  useEffect(() => {
    if (existingPlano) {
      setPlanoData({
        introducao: existingPlano.introducao,
        desenvolvimento: existingPlano.desenvolvimento,
        conclusao: existingPlano.conclusao,
        metodos: existingPlano.metodos.length > 0 ? existingPlano.metodos : [''],
        tecnicas: existingPlano.tecnicas.length > 0 ? existingPlano.tecnicas : [''],
        avaliacaoFormativa: existingPlano.avaliacaoFormativa,
        adaptacoes: existingPlano.adaptacoes,
        observacoes: existingPlano.observacoes,
      });
    } else {
      setPlanoData({
        introducao: '',
        desenvolvimento: '',
        conclusao: '',
        metodos: [''],
        tecnicas: [''],
        avaliacaoFormativa: '',
        adaptacoes: '',
        observacoes: '',
      });
    }
  }, [existingPlano, selectedSessaoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessaoId || !selectedSessao) return;

    setIsSubmitting(true);

    try {
      // Atualizar sessão com os campos editados
      await atualizarSessao(selectedSessao.id, {
        nome: sessaoData.nome,
        descricao: sessaoData.descricao,
        formadorId: sessaoData.formadorId,
        formador: sessaoData.formador,
        objetivosSessao: sessaoData.objetivosSessao.filter((o) => o.trim()),
      });

      // Guardar plano pedagógico
      const planoToSave = {
        ...planoData,
        metodos: planoData.metodos.filter((m) => m.trim()),
        tecnicas: planoData.tecnicas.filter((t) => t.trim()),
      };

      if (existingPlano) {
        await atualizarPlanoSessao(existingPlano.id, planoToSave);
      } else {
        await adicionarPlanoSessao(selectedSessaoId, planoToSave);
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

  // Helpers para objetivos da sessão
  const addObjetivo = () => {
    setSessaoData((prev) => ({
      ...prev,
      objetivosSessao: [...prev.objetivosSessao, ''],
    }));
  };

  const updateObjetivo = (index: number, value: string) => {
    setSessaoData((prev) => ({
      ...prev,
      objetivosSessao: prev.objetivosSessao.map((o, i) => (i === index ? value : o)),
    }));
  };

  const removeObjetivo = (index: number) => {
    if (sessaoData.objetivosSessao.length > 1) {
      setSessaoData((prev) => ({
        ...prev,
        objetivosSessao: prev.objetivosSessao.filter((_, i) => i !== index),
      }));
    }
  };

  // Helpers para métodos
  const addMetodo = () => {
    setPlanoData((prev) => ({ ...prev, metodos: [...prev.metodos, ''] }));
  };
  const updateMetodo = (index: number, value: string) => {
    setPlanoData((prev) => ({
      ...prev,
      metodos: prev.metodos.map((m, i) => (i === index ? value : m)),
    }));
  };
  const removeMetodo = (index: number) => {
    if (planoData.metodos.length > 1) {
      setPlanoData((prev) => ({
        ...prev,
        metodos: prev.metodos.filter((_, i) => i !== index),
      }));
    }
  };

  // Helpers para técnicas
  const addTecnica = () => {
    setPlanoData((prev) => ({ ...prev, tecnicas: [...prev.tecnicas, ''] }));
  };
  const updateTecnica = (index: number, value: string) => {
    setPlanoData((prev) => ({
      ...prev,
      tecnicas: prev.tecnicas.map((t, i) => (i === index ? value : t)),
    }));
  };
  const removeTecnica = (index: number) => {
    if (planoData.tecnicas.length > 1) {
      setPlanoData((prev) => ({
        ...prev,
        tecnicas: prev.tecnicas.filter((_, i) => i !== index),
      }));
    }
  };

  // Construir contexto para IA
  const buildAiContext = () => {
    const parts: string[] = [];

    if (selectedSessao) {
      parts.push(`SESSÃO: ${sessaoData.nome}`);
      parts.push(`Data: ${selectedSessao.data} • ${selectedSessao.horaInicio}-${selectedSessao.horaFim}`);
      if (sessaoData.formador) parts.push(`Formador: ${sessaoData.formador}`);
      if (sessaoData.descricao) parts.push(`Descrição: ${sessaoData.descricao}`);
      if (sessaoData.objetivosSessao.some((o) => o.trim())) {
        parts.push(`Objetivos: ${sessaoData.objetivosSessao.filter((o) => o.trim()).join('; ')}`);
      }
    }
    if (selectedCurso) {
      parts.push(`CURSO: ${selectedCurso.nome} (${selectedCurso.codigo})`);
      if (selectedCurso.descricao) parts.push(`Descrição do curso: ${selectedCurso.descricao}`);
      if (selectedCurso.objetivosGerais.length > 0) {
        parts.push(`Objetivos gerais: ${selectedCurso.objetivosGerais.join('; ')}`);
      }
      if (selectedCurso.publicoAlvo) parts.push(`Público-alvo: ${selectedCurso.publicoAlvo}`);
    }

    parts.push('\nCAMPOS JÁ PREENCHIDOS:');
    if (planoData.introducao) parts.push(`Introdução: ${planoData.introducao}`);
    if (planoData.desenvolvimento) parts.push(`Desenvolvimento: ${planoData.desenvolvimento}`);
    if (planoData.conclusao) parts.push(`Conclusão: ${planoData.conclusao}`);
    if (planoData.metodos.some((m) => m.trim())) parts.push(`Métodos: ${planoData.metodos.filter((m) => m.trim()).join(', ')}`);
    if (planoData.tecnicas.some((t) => t.trim())) parts.push(`Técnicas: ${planoData.tecnicas.filter((t) => t.trim()).join(', ')}`);
    if (planoData.avaliacaoFormativa) parts.push(`Avaliação formativa: ${planoData.avaliacaoFormativa}`);
    if (planoData.adaptacoes) parts.push(`Adaptações: ${planoData.adaptacoes}`);

    return parts.join('\n');
  };

  // Formandos só vêem sessões dos cursos em que estão inscritos
  const cursosFormando = useMemo(() => {
    if (!isFormando || !user) return null;
    return state.inscricoes
      .filter((i) => i.formandoId === user.id && i.status === 'ativo')
      .map((i) => i.cursoId);
  }, [isFormando, user, state.inscricoes]);

  const sessoesDisponiveis = state.sessoes.filter((s) => {
    if (s.status === 'cancelado') return false;
    if (isFormando && cursosFormando) {
      return cursosFormando.includes(s.cursoId);
    }
    return true;
  });

  return (
    <>
      <PrintStyles />

      {/* Print View */}
      {selectedSessao && existingPlano && (
        <SessionPlanPrint
          plano={existingPlano}
          sessao={selectedSessao}
          curso={selectedCurso}
        />
      )}

      <div className="no-print">
        <Header
          title="Plano de Sessão"
          subtitle="Documentos pedagógicos da sessão"
          breadcrumbs={[{ label: 'Planos' }]}
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
                            {selectedCurso?.nome} • {selectedSessao.data} • {selectedSessao.horaInicio} - {selectedSessao.horaFim}
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
                  {existingDemonstracoes.length > 0 && <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{existingDemonstracoes.length}</span>}
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

              {/* Tab: Plano - Read only view for formandos */}
              {activeTab === 'plano' && isFormando && (
                <div className="space-y-6">
                  {existingPlano ? (
                    <Card variant="bordered">
                      <CardContent className="space-y-4">
                        {selectedSessao?.descricao && (
                          <div>
                            <h4 className="text-sm font-medium text-slate-700 mb-1">Descrição da Sessão</h4>
                            <p className="text-sm text-slate-600 whitespace-pre-wrap">{selectedSessao.descricao}</p>
                          </div>
                        )}
                        {selectedSessao && selectedSessao.objetivosSessao.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-slate-700 mb-1">Objetivos</h4>
                            <ul className="list-disc list-inside text-sm text-slate-600">
                              {selectedSessao.objetivosSessao.map((o, i) => <li key={i}>{o}</li>)}
                            </ul>
                          </div>
                        )}
                        {existingPlano.introducao && (
                          <div>
                            <h4 className="text-sm font-medium text-slate-700 mb-1">Introdução</h4>
                            <p className="text-sm text-slate-600 whitespace-pre-wrap">{existingPlano.introducao}</p>
                          </div>
                        )}
                        {existingPlano.desenvolvimento && (
                          <div>
                            <h4 className="text-sm font-medium text-slate-700 mb-1">Desenvolvimento</h4>
                            <p className="text-sm text-slate-600 whitespace-pre-wrap">{existingPlano.desenvolvimento}</p>
                          </div>
                        )}
                        {existingPlano.conclusao && (
                          <div>
                            <h4 className="text-sm font-medium text-slate-700 mb-1">Conclusão</h4>
                            <p className="text-sm text-slate-600 whitespace-pre-wrap">{existingPlano.conclusao}</p>
                          </div>
                        )}
                        {existingPlano.metodos.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-slate-700 mb-1">Métodos</h4>
                            <ul className="list-disc list-inside text-sm text-slate-600">
                              {existingPlano.metodos.map((m, i) => <li key={i}>{m}</li>)}
                            </ul>
                          </div>
                        )}
                        {existingPlano.tecnicas.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-slate-700 mb-1">Técnicas</h4>
                            <ul className="list-disc list-inside text-sm text-slate-600">
                              {existingPlano.tecnicas.map((t, i) => <li key={i}>{t}</li>)}
                            </ul>
                          </div>
                        )}
                        <div className="flex justify-end pt-4">
                          <Button
                            variant="outline"
                            onClick={handlePrint}
                            leftIcon={<Printer className="w-4 h-4" />}
                          >
                            Imprimir
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <EmptyState
                      icon={<ClipboardList className="w-8 h-8" />}
                      title="Sem plano de sessão"
                      description="Ainda não foi criado um plano para esta sessão."
                    />
                  )}
                </div>
              )}

              {/* Tab: Plano - Edit form for formador/responsavel */}
              {activeTab === 'plano' && !isFormando && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Informações da Sessão (partilhadas) */}
                  <Card variant="bordered">
                    <CardHeader>
                      <CardTitle>Informações da Sessão</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Input
                        label="Nome da Sessão"
                        value={sessaoData.nome}
                        onChange={(e) => setSessaoData((prev) => ({ ...prev, nome: e.target.value }))}
                        required
                      />

                      <TextArea
                        label="Descrição"
                        placeholder="Descreva os tópicos e objetivos desta sessão..."
                        value={sessaoData.descricao}
                        onChange={(e) => setSessaoData((prev) => ({ ...prev, descricao: e.target.value }))}
                        rows={3}
                      />

                      <Select
                        label="Formador"
                        placeholder="Selecionar formador..."
                        options={formadores.map((f) => ({
                          value: f.id,
                          label: f.nome,
                        }))}
                        value={sessaoData.formadorId || ''}
                        onChange={(e) => {
                          const selected = formadores.find((f) => f.id === e.target.value);
                          setSessaoData((prev) => ({
                            ...prev,
                            formadorId: e.target.value || undefined,
                            formador: selected?.nome || '',
                          }));
                        }}
                      />

                      {/* Objetivos da Sessão */}
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-slate-700">Objetivos da Sessão</label>
                        {sessaoData.objetivosSessao.map((obj, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              placeholder={`Objetivo ${index + 1}`}
                              value={obj}
                              onChange={(e) => updateObjetivo(index, e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeObjetivo(index)}
                              className="!px-2"
                              disabled={sessaoData.objetivosSessao.length === 1}
                            >
                              <Trash2 className="w-4 h-4 text-slate-400" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addObjetivo}
                          leftIcon={<Plus className="w-4 h-4" />}
                        >
                          Adicionar Objetivo
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Estrutura Pedagógica */}
                  <Card variant="bordered">
                    <CardHeader>
                      <CardTitle>Estrutura Pedagógica</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <TextArea
                        label="Introdução / Enquadramento"
                        placeholder="Descreva como vai iniciar a sessão, o enquadramento do tema, motivação inicial dos formandos..."
                        value={planoData.introducao}
                        onChange={(e) => setPlanoData((prev) => ({ ...prev, introducao: e.target.value }))}
                        onAiGenerate={(text) => setPlanoData((prev) => ({ ...prev, introducao: text }))}
                        aiContext={buildAiContext()}
                        rows={4}
                      />

                      <TextArea
                        label="Desenvolvimento"
                        placeholder="Detalhe o desenvolvimento da sessão, sequência de atividades, explicações teóricas, exercícios práticos..."
                        value={planoData.desenvolvimento}
                        onChange={(e) => setPlanoData((prev) => ({ ...prev, desenvolvimento: e.target.value }))}
                        onAiGenerate={(text) => setPlanoData((prev) => ({ ...prev, desenvolvimento: text }))}
                        aiContext={buildAiContext()}
                        rows={6}
                      />

                      <TextArea
                        label="Conclusão / Síntese"
                        placeholder="Descreva como vai concluir a sessão, síntese dos conteúdos, esclarecimento de dúvidas..."
                        value={planoData.conclusao}
                        onChange={(e) => setPlanoData((prev) => ({ ...prev, conclusao: e.target.value }))}
                        onAiGenerate={(text) => setPlanoData((prev) => ({ ...prev, conclusao: text }))}
                        aiContext={buildAiContext()}
                        rows={3}
                      />
                    </CardContent>
                  </Card>

                  {/* Métodos e Técnicas */}
                  <Card variant="bordered">
                    <CardHeader>
                      <CardTitle>Métodos e Técnicas Pedagógicas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Métodos */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-slate-700">Métodos</h4>
                        {planoData.metodos.map((metodo, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              placeholder="Ex: Expositivo, Interrogativo, Demonstrativo, Ativo..."
                              value={metodo}
                              onChange={(e) => updateMetodo(index, e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMetodo(index)}
                              className="!px-2"
                              disabled={planoData.metodos.length === 1}
                            >
                              <Trash2 className="w-4 h-4 text-slate-400" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addMetodo}
                          leftIcon={<Plus className="w-4 h-4" />}
                        >
                          Adicionar Método
                        </Button>
                      </div>

                      <hr className="border-slate-200" />

                      {/* Técnicas */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-slate-700">Técnicas</h4>
                        {planoData.tecnicas.map((tecnica, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              placeholder="Ex: Brainstorming, Estudo de caso, Role-playing, Trabalho em grupo..."
                              value={tecnica}
                              onChange={(e) => updateTecnica(index, e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTecnica(index)}
                              className="!px-2"
                              disabled={planoData.tecnicas.length === 1}
                            >
                              <Trash2 className="w-4 h-4 text-slate-400" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addTecnica}
                          leftIcon={<Plus className="w-4 h-4" />}
                        >
                          Adicionar Técnica
                        </Button>
                      </div>
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
                        value={planoData.avaliacaoFormativa}
                        onChange={(e) => setPlanoData((prev) => ({ ...prev, avaliacaoFormativa: e.target.value }))}
                        onAiGenerate={(text) => setPlanoData((prev) => ({ ...prev, avaliacaoFormativa: text }))}
                        aiContext={buildAiContext()}
                        rows={3}
                      />

                      <TextArea
                        label="Adaptações / Diferenciação Pedagógica"
                        placeholder="Descreva adaptações para diferentes ritmos de aprendizagem ou necessidades especiais..."
                        value={planoData.adaptacoes}
                        onChange={(e) => setPlanoData((prev) => ({ ...prev, adaptacoes: e.target.value }))}
                        onAiGenerate={(text) => setPlanoData((prev) => ({ ...prev, adaptacoes: text }))}
                        aiContext={buildAiContext()}
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
                        label="Observações"
                        placeholder="Notas adicionais, pontos de atenção, sugestões para melhoria..."
                        value={planoData.observacoes}
                        onChange={(e) => setPlanoData((prev) => ({ ...prev, observacoes: e.target.value }))}
                        onAiGenerate={(text) => setPlanoData((prev) => ({ ...prev, observacoes: text }))}
                        aiContext={buildAiContext()}
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
                  {existingDemonstracoes.length > 0 ? (
                    <>
                      {existingDemonstracoes.map((demo) => (
                        <Card key={demo.id} variant="bordered">
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold text-slate-900">{demo.titulo}</h3>
                                <p className="text-sm text-slate-600">
                                  {demo.duracaoTotal} minutos • {demo.etapas.length} etapas
                                </p>
                              </div>
                              <div className="flex gap-2">
                                {!isFormando && (
                                  <Link href={`/planos/demonstracao/${demo.id}?sessao=${selectedSessaoId}`}>
                                    <Button variant="outline" size="sm">Editar</Button>
                                  </Link>
                                )}
                                <Link href={`/planos/demonstracao/${demo.id}/imprimir?sessao=${selectedSessaoId}`}>
                                  <Button variant="outline" size="sm" leftIcon={<Printer className="w-4 h-4" />}>
                                    Imprimir
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {!isFormando && (
                        <div className="text-center">
                          <Link href={`/planos/demonstracao/novo?sessao=${selectedSessaoId}`}>
                            <Button variant="outline" leftIcon={<Plus className="w-4 h-4" />}>
                              Novo Plano de Demonstração
                            </Button>
                          </Link>
                        </div>
                      )}
                    </>
                  ) : (
                    <EmptyState
                      icon={<Lightbulb className="w-8 h-8" />}
                      title="Sem planos de demonstração"
                      description={isFormando ? "Ainda não foram criados planos de demonstração." : "Crie planos de demonstração para este curso com etapas detalhadas."}
                      actionLabel={!isFormando ? "Criar Plano de Demonstração" : undefined}
                      onAction={!isFormando ? () => router.push(`/planos/demonstracao/novo?sessao=${selectedSessaoId}`) : undefined}
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
                                {!isFormando && (
                                  <Link href={`/planos/fichas/${ficha.id}?sessao=${selectedSessaoId}`}>
                                    <Button variant="outline" size="sm">Editar</Button>
                                  </Link>
                                )}
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
                      {!isFormando && (
                        <div className="text-center">
                          <Link href={`/planos/fichas/nova?sessao=${selectedSessaoId}`}>
                            <Button variant="outline" leftIcon={<Plus className="w-4 h-4" />}>
                              Criar Nova Ficha
                            </Button>
                          </Link>
                        </div>
                      )}
                    </>
                  ) : (
                    <EmptyState
                      icon={<FileText className="w-8 h-8" />}
                      title="Sem fichas de trabalho"
                      description={isFormando ? "Ainda não foram criadas fichas de trabalho." : "Crie fichas de trabalho com exercícios para os formandos."}
                      actionLabel={!isFormando ? "Criar Ficha de Trabalho" : undefined}
                      onAction={!isFormando ? () => router.push(`/planos/fichas/nova?sessao=${selectedSessaoId}`) : undefined}
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
