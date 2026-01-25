'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '../../../context/AppContext';
import { Header } from '../../../components/layout';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, getStatusBadgeVariant, getStatusLabel } from '../../../components/ui';
import { ArrowLeft, Edit, Clock, MapPin, User, Users, Calendar, Target, CheckCircle, PlayCircle, Package } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { SessionType } from '../../../types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SessaoDetalhesPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { getSessao, getCurso, getAuditLogs, getPlanoSessao } = useApp();

  const sessao = getSessao(id);
  const curso = sessao ? getCurso(sessao.cursoId) : null;
  const modulo = curso?.modulos.find((m) => m.id === sessao?.moduloId);
  const auditLogs = getAuditLogs({ entidadeId: id });
  const planoSessao = sessao ? getPlanoSessao(sessao.id) : null;

  if (!sessao) {
    return (
      <>
        <Header title="Sessão não encontrada" />
        <div className="p-8">
          <p className="text-slate-500">A sessão solicitada não existe ou foi eliminada.</p>
          <Button onClick={() => router.push('/sessoes')} className="mt-4">
            Voltar às Sessões
          </Button>
        </div>
      </>
    );
  }

  const getTipoLabel = (tipo: SessionType) => {
    switch (tipo) {
      case 'presencial':
        return 'Presencial';
      case 'online':
        return 'Online';
      case 'hibrido':
        return 'Híbrido';
    }
  };

  const getTipoBadgeVariant = (tipo: SessionType) => {
    switch (tipo) {
      case 'presencial':
        return 'success' as const;
      case 'online':
        return 'info' as const;
      case 'hibrido':
        return 'warning' as const;
    }
  };

  const totalDuration = sessao.atividades.reduce((acc, a) => acc + a.duracaoMinutos, 0);

  return (
    <>
      <Header
        title={sessao.nome}
        subtitle={curso ? `${curso.codigo} - ${curso.nome}` : undefined}
      />

      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Voltar</span>
          </button>

          <div className="flex items-center gap-3">
            <Badge variant={getTipoBadgeVariant(sessao.tipo)}>
              {getTipoLabel(sessao.tipo)}
            </Badge>
            <Badge variant={getStatusBadgeVariant(sessao.status)} className="text-sm px-3 py-1">
              {sessao.status === 'ativo' ? 'Agendado' : getStatusLabel(sessao.status)}
            </Badge>
            <Link href={`/sessoes/${sessao.id}/editar`}>
              <Button leftIcon={<Edit className="w-4 h-4" />}>
                Editar Sessão
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Descrição */}
            <Card variant="bordered">
              <CardHeader>
                <CardTitle>Descrição</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 whitespace-pre-wrap">
                  {sessao.descricao || 'Sem descrição disponível.'}
                </p>
              </CardContent>
            </Card>

            {/* Objetivos */}
            {sessao.objetivosSessao.length > 0 && (
              <Card variant="bordered">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-violet-500" />
                    Objetivos da Sessão
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {sessao.objetivosSessao.map((obj, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-violet-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-600">{obj}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Atividades */}
            <Card variant="bordered">
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <CardTitle className="flex items-center gap-2">
                    <PlayCircle className="w-5 h-5 text-violet-500" />
                    Plano de Atividades ({sessao.atividades.length})
                  </CardTitle>
                  <span className="text-sm text-slate-500">
                    {Math.floor(totalDuration / 60)}h {totalDuration % 60}min
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {sessao.atividades.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">
                    Nenhuma atividade definida para esta sessão.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {sessao.atividades.map((atividade, index) => (
                      <div
                        key={atividade.id}
                        className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center text-violet-700 font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-slate-900">
                              {atividade.nome}
                            </h4>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                atividade.tipo === 'teorica'
                                  ? 'bg-blue-100 text-blue-700'
                                  : atividade.tipo === 'pratica'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : atividade.tipo === 'avaliacao'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {atividade.tipo === 'teorica'
                                ? 'Teórica'
                                : atividade.tipo === 'pratica'
                                ? 'Prática'
                                : atividade.tipo === 'avaliacao'
                                ? 'Avaliação'
                                : 'Intervalo'}
                            </span>
                          </div>
                          {atividade.descricao && (
                            <p className="text-sm text-slate-600 mb-2">
                              {atividade.descricao}
                            </p>
                          )}
                          <div className="flex items-center gap-1 text-sm text-slate-500">
                            <Clock className="w-4 h-4" />
                            <span>{atividade.duracaoMinutos} minutos</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recursos */}
            {sessao.recursos.length > 0 && (
              <Card variant="bordered">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-violet-500" />
                    Recursos Necessários
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {sessao.recursos.map((recurso) => (
                      <div
                        key={recurso.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs px-2 py-1 rounded capitalize ${
                              recurso.tipo === 'material'
                                ? 'bg-blue-100 text-blue-700'
                                : recurso.tipo === 'equipamento'
                                ? 'bg-amber-100 text-amber-700'
                                : recurso.tipo === 'sala'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {recurso.tipo}
                          </span>
                          <span className="font-medium text-slate-900">
                            {recurso.nome}
                          </span>
                        </div>
                        <span className="text-slate-500">x{recurso.quantidade}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notas */}
            {sessao.notas && (
              <Card variant="bordered">
                <CardHeader>
                  <CardTitle>Notas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 whitespace-pre-wrap">{sessao.notas}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info Card */}
            <Card variant="bordered">
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-violet-50 rounded-lg">
                    <div className="p-2 rounded-lg bg-violet-100 text-violet-600">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Data</p>
                      <p className="font-semibold text-slate-900">
                        {format(new Date(sessao.dataInicio), "d 'de' MMMM 'de' yyyy", {
                          locale: pt,
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="p-2 rounded-lg bg-slate-200 text-slate-600">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Horário</p>
                      <p className="font-semibold text-slate-900">
                        {sessao.horaInicio} - {sessao.horaFim}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Local</p>
                      <p className="font-medium text-slate-900">
                        {sessao.local || 'Não definido'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="p-2 rounded-lg bg-sky-100 text-sky-600">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Formador</p>
                      <p className="font-medium text-slate-900">
                        {sessao.formador || 'Não atribuído'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Capacidade</p>
                      <p className="font-medium text-slate-900">
                        {sessao.capacidadeMaxima} participantes
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Curso e Módulo */}
            {curso && (
              <Card variant="bordered">
                <CardHeader>
                  <CardTitle>Curso</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/cursos/${curso.id}`}
                    className="block p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <p className="font-medium text-slate-900">{curso.nome}</p>
                    <p className="text-sm text-slate-500">{curso.codigo}</p>
                  </Link>
                  {modulo && (
                    <div className="mt-3 p-3 bg-emerald-50 rounded-lg">
                      <p className="text-sm text-slate-500">Módulo</p>
                      <p className="font-medium text-slate-900">{modulo.nome}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Plano de Sessão */}
            <Card variant="bordered">
              <CardHeader>
                <CardTitle>Plano de Sessão</CardTitle>
              </CardHeader>
              <CardContent>
                {planoSessao ? (
                  <Link
                    href={`/planos?sessao=${sessao.id}`}
                    className="block p-3 bg-emerald-50 rounded-lg text-center hover:bg-emerald-100 transition-colors"
                  >
                    <p className="font-medium text-emerald-700">Ver Plano de Sessão</p>
                  </Link>
                ) : (
                  <Link
                    href={`/planos?sessao=${sessao.id}`}
                    className="block p-3 bg-slate-50 rounded-lg text-center hover:bg-slate-100 transition-colors border-2 border-dashed border-slate-200"
                  >
                    <p className="font-medium text-slate-600">Criar Plano de Sessão</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Adicione detalhes pedagógicos
                    </p>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Histórico */}
            <Card variant="bordered">
              <CardHeader>
                <CardTitle>Histórico</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="text-slate-500">Criado em</p>
                    <p className="font-medium text-slate-900">
                      {format(new Date(sessao.dataCriacao), "d 'de' MMMM 'de' yyyy", {
                        locale: pt,
                      })}
                    </p>
                    <p className="text-xs text-slate-400">por {sessao.criadoPor}</p>
                  </div>
                </div>

                {auditLogs.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                      Alterações Recentes
                    </p>
                    <div className="space-y-2">
                      {auditLogs.slice(0, 5).map((log) => (
                        <div
                          key={log.id}
                          className="text-xs text-slate-600 flex items-center justify-between"
                        >
                          <span className="capitalize">{log.acao}</span>
                          <span className="text-slate-400">
                            {format(new Date(log.dataHora), 'd MMM HH:mm', {
                              locale: pt,
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
