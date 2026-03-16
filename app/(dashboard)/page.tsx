'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Header } from '../components/layout';
import { Card, CardContent, Button } from '../components/ui';
import { useToast } from '../context/ToastContext';
import * as authService from '../lib/authService';
import {
  BookOpen,
  Layers,
  Calendar,
  Clock,
  TrendingUp,
  Users,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Send,
} from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

export default function Dashboard() {
  const { user, center, refreshCenter } = useAuth();
  const { getEstatisticas, state } = useApp();
  const toast = useToast();
  const stats = getEstatisticas();
  const isFormando = user?.role === 'formando';
  const isAssistente = user?.role === 'assistente';
  const isResponsavel = user?.role === 'responsavel';
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmeterCentro = async () => {
    if (!center?.id) return;
    setIsSubmitting(true);
    try {
      await authService.updateTrainingCenter(center.id, {
        status: 'aguardando_aprovacao',
        dataAtualizacao: new Date().toISOString(),
      });
      await refreshCenter();
      toast.success('Centro submetido', 'O centro foi submetido para aprovação.');
    } catch (error) {
      console.error('Erro ao submeter centro:', error);
      toast.error('Erro', 'Não foi possível submeter o centro.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dados filtrados para formandos
  const cursosFormando = useMemo(() => {
    if (!isFormando || !user) return [];
    const cursoIds = state.inscricoes
      .filter((i) => i.formandoId === user.id && i.status === 'ativo')
      .map((i) => i.cursoId);
    return state.cursos.filter((c) => cursoIds.includes(c.id));
  }, [isFormando, user, state.inscricoes, state.cursos]);

  const sessoesFormando = useMemo(() => {
    if (!isFormando || !user) return [];
    const cursoIds = cursosFormando.map((c) => c.id);
    return state.sessoes
      .filter((s) => cursoIds.includes(s.cursoId) && new Date(s.data) >= new Date())
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  }, [isFormando, user, cursosFormando, state.sessoes]);

  // Dashboard do formando
  if (isFormando) {
    return (
      <>
        <Header
          title="As Minhas Formações"
          subtitle={format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: pt })}
          breadcrumbs={[{ label: 'Dashboard' }]}
        />

        <div className="p-8">
          {/* Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card variant="bordered" className="card-hover">
              <CardContent className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Cursos Inscritos</p>
                  <p className="text-3xl font-bold text-slate-900">{cursosFormando.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500 text-white">
                  <BookOpen className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
            <Card variant="bordered" className="card-hover">
              <CardContent className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Próximas Sessões</p>
                  <p className="text-3xl font-bold text-slate-900">{sessoesFormando.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-violet-500 text-white">
                  <Calendar className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
            <Card variant="bordered" className="card-hover">
              <CardContent className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Horas de Formação</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {cursosFormando.reduce((acc, c) => acc + c.duracaoTotal, 0)}
                  </p>
                  <p className="text-sm text-slate-400">horas totais</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-500 text-white">
                  <Clock className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cursos */}
            <Card variant="bordered">
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">Os Meus Cursos</h3>
                  <a href="/cursos" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">Ver todos</a>
                </div>
                {cursosFormando.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-6">
                    Ainda não está inscrito em nenhum curso.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {cursosFormando.map((curso) => (
                      <div key={curso.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{curso.nome}</p>
                            <p className="text-sm text-slate-500">{curso.duracaoTotal}h • {curso.modulos.length} módulos</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Próximas sessões */}
            <Card variant="bordered">
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">Próximas Sessões</h3>
                  <a href="/sessoes" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">Ver todas</a>
                </div>
                {sessoesFormando.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-6">
                    Nenhuma sessão agendada.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {sessoesFormando.slice(0, 5).map((sessao) => (
                      <div key={sessao.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{sessao.nome}</p>
                            <p className="text-sm text-slate-500">
                              {format(new Date(sessao.data), 'd MMM', { locale: pt })} • {sessao.horaInicio}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          sessao.tipo === 'presencial'
                            ? 'bg-emerald-100 text-emerald-700'
                            : sessao.tipo === 'online'
                            ? 'bg-sky-100 text-sky-700'
                            : 'bg-violet-100 text-violet-700'
                        }`}>
                          {sessao.tipo === 'presencial' ? 'Presencial' : sessao.tipo === 'online' ? 'Online' : 'Híbrido'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  // Dashboard do assistente (foco em formandos)
  if (isAssistente) {
    const totalFormandos = state.formandos.length;
    const inscricoesAtivas = state.inscricoes.filter((i) => i.status === 'ativo').length;

    return (
      <>
        <Header
          title="Gestão de Formandos"
          subtitle={format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: pt })}
          breadcrumbs={[{ label: 'Dashboard' }]}
        />

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card variant="bordered" className="card-hover">
              <CardContent className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Total de Formandos</p>
                  <p className="text-3xl font-bold text-slate-900">{totalFormandos}</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500 text-white">
                  <Users className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
            <Card variant="bordered" className="card-hover">
              <CardContent className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Inscrições Ativas</p>
                  <p className="text-3xl font-bold text-slate-900">{inscricoesAtivas}</p>
                </div>
                <div className="p-3 rounded-xl bg-sky-500 text-white">
                  <BookOpen className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card variant="bordered">
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Formandos Recentes</h3>
                <a href="/formandos" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                  Ver todos
                </a>
              </div>
              {state.formandos.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">
                  Nenhum formando registado ainda.
                </p>
              ) : (
                <div className="space-y-2">
                  {state.formandos.slice(0, 5).map((formando) => (
                    <div
                      key={formando.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{formando.nome}</p>
                          <p className="text-sm text-slate-500">{formando.email}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        formando.ativo
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        {formando.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Dashboard normal (responsavel/formador)
  const statCards = [
    {
      label: 'Total de Cursos',
      value: stats.totalCursos,
      subValue: `${stats.cursosAtivos} ativos`,
      icon: BookOpen,
      color: 'emerald',
      bgColor: 'bg-emerald-500',
    },
    {
      label: 'Programas Formativos',
      value: stats.totalProgramas,
      subValue: `${stats.programasAtivos} ativos`,
      icon: Layers,
      color: 'sky',
      bgColor: 'bg-sky-500',
    },
    {
      label: 'Sessões Agendadas',
      value: stats.sessoesAgendadas,
      subValue: `de ${stats.totalSessoes} total`,
      icon: Calendar,
      color: 'violet',
      bgColor: 'bg-violet-500',
    },
    {
      label: 'Horas de Formação',
      value: stats.horasFormacao,
      subValue: 'horas totais',
      icon: Clock,
      color: 'amber',
      bgColor: 'bg-amber-500',
    },
  ];

  const recentLogs = state.auditLogs.slice(0, 5);

  return (
    <>
      <Header
        title="Painel de Controlo"
        subtitle={format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: pt })}
        breadcrumbs={[{ label: 'Dashboard' }]}
      />

      <div className="p-8">
        {/* Banner de estado do centro */}
        {isResponsavel && center && center.status === 'inativo' && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
              <div>
                <p className="font-medium text-amber-900">O seu centro de formação está inativo</p>
                <p className="text-sm text-amber-700">Submeta o centro para aprovação para poder operar na plataforma.</p>
              </div>
            </div>
            <Button
              onClick={handleSubmeterCentro}
              isLoading={isSubmitting}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Submeter para Aprovação
            </Button>
          </div>
        )}

        {isResponsavel && center && center.status === 'aguardando_aprovacao' && (
          <div className="mb-6 p-4 bg-sky-50 border border-sky-200 rounded-xl flex items-center gap-3">
            <Clock className="w-6 h-6 text-sky-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-sky-900">Centro aguardando aprovação</p>
              <p className="text-sm text-sky-700">O seu centro foi submetido e está a ser analisado pelo regulador.</p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={stat.label} 
                variant="bordered" 
                className={`card-hover animate-fade-in stagger-${index + 1}`}
              >
                <CardContent className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-slate-900 mb-1">
                      {stat.value}
                    </p>
                    <p className="text-sm text-slate-400">{stat.subValue}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor} text-white`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card variant="bordered" className="lg:col-span-1 animate-fade-in stagger-5">
            <CardContent>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Ações Rápidas
              </h3>
              <div className="space-y-3">
                <a
                  href="/cursos/novo"
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 group-hover:text-emerald-700">
                      Novo Curso
                    </p>
                    <p className="text-sm text-slate-500">
                      Criar um novo curso formativo
                    </p>
                  </div>
                </a>
                <a
                  href="/programas/novo"
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-sky-50 hover:text-sky-700 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-sky-100 text-sky-600 group-hover:bg-sky-200">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 group-hover:text-sky-700">
                      Novo Programa
                    </p>
                    <p className="text-sm text-slate-500">
                      Criar um programa de formação
                    </p>
                  </div>
                </a>
                <a
                  href="/sessoes/nova"
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-violet-50 hover:text-violet-700 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-violet-100 text-violet-600 group-hover:bg-violet-200">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 group-hover:text-violet-700">
                      Nova Sessão
                    </p>
                    <p className="text-sm text-slate-500">
                      Agendar uma sessão formativa
                    </p>
                  </div>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card variant="bordered" className="lg:col-span-2 animate-fade-in stagger-6">
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Atividade Recente
                </h3>
                <a
                  href="/auditoria"
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  Ver tudo
                </a>
              </div>

              {recentLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <p className="text-slate-500">
                    Nenhuma atividade registada ainda.
                  </p>
                  <p className="text-sm text-slate-400">
                    Comece a criar cursos e programas para ver o histórico.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-slate-50"
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          log.acao === 'criar'
                            ? 'bg-emerald-100 text-emerald-600'
                            : log.acao === 'editar'
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-rose-100 text-rose-600'
                        }`}
                      >
                        {log.acao === 'criar' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : log.acao === 'editar' ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <AlertCircle className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {log.detalhes}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-400">
                            {format(new Date(log.dataHora), "d MMM yyyy 'às' HH:mm", {
                              locale: pt,
                            })}
                          </span>
                          <span className="text-xs text-slate-300">•</span>
                          <span className="text-xs text-slate-500">
                            {log.utilizador}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Cursos Recentes */}
          <Card variant="bordered" className="animate-fade-in">
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Cursos Recentes
                </h3>
                <a
                  href="/cursos"
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  Ver todos
                </a>
              </div>
              {state.cursos.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">
                  Nenhum curso criado ainda.
                </p>
              ) : (
                <div className="space-y-2">
                  {state.cursos.slice(0, 3).map((curso) => (
                    <div
                      key={curso.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{curso.nome}</p>
                          <p className="text-sm text-slate-500">
                            {curso.duracaoTotal}h • {curso.modulos.length} módulos
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          curso.status === 'ativo'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {curso.status === 'ativo' ? 'Ativo' : 'Rascunho'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Próximas Sessões */}
          <Card variant="bordered" className="animate-fade-in">
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Próximas Sessões
                </h3>
                <a
                  href="/sessoes"
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  Ver todas
                </a>
              </div>
              {state.sessoes.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">
                  Nenhuma sessão agendada ainda.
                </p>
              ) : (
                <div className="space-y-2">
                  {state.sessoes
                    .filter((s) => new Date(s.data) >= new Date())
                    .slice(0, 3)
                    .map((sessao) => (
                      <div
                        key={sessao.id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {sessao.nome}
                            </p>
                            <p className="text-sm text-slate-500">
                              {format(new Date(sessao.data), 'd MMM', {
                                locale: pt,
                              })}{' '}
                              • {sessao.horaInicio}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            sessao.tipo === 'presencial'
                              ? 'bg-emerald-100 text-emerald-700'
                              : sessao.tipo === 'online'
                              ? 'bg-sky-100 text-sky-700'
                              : 'bg-violet-100 text-violet-700'
                          }`}
                        >
                          {sessao.tipo === 'presencial'
                            ? 'Presencial'
                            : sessao.tipo === 'online'
                            ? 'Online'
                            : 'Híbrido'}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
