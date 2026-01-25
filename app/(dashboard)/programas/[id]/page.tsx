'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '../../../context/AppContext';
import { Header } from '../../../components/layout';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, getStatusBadgeVariant, getStatusLabel } from '../../../components/ui';
import { ArrowLeft, Edit, Clock, BookOpen, Award, Target, CheckCircle, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProgramaDetalhesPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { getPrograma, getCurso, getAuditLogs } = useApp();

  const programa = getPrograma(id);
  const auditLogs = getAuditLogs({ entidadeId: id });

  if (!programa) {
    return (
      <>
        <Header title="Programa não encontrado" />
        <div className="p-8">
          <p className="text-slate-500">O programa solicitado não existe ou foi eliminado.</p>
          <Button onClick={() => router.push('/programas')} className="mt-4">
            Voltar aos Programas
          </Button>
        </div>
      </>
    );
  }

  const cursosObrigatorios = programa.cursos.filter((c) => c.obrigatorio).length;
  const cursosOpcionais = programa.cursos.length - cursosObrigatorios;

  return (
    <>
      <Header
        title={programa.nome}
        subtitle={`Código: ${programa.codigo}`}
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
            <Badge variant={getStatusBadgeVariant(programa.status)} className="text-sm px-3 py-1">
              {getStatusLabel(programa.status)}
            </Badge>
            <Link href={`/programas/${programa.id}/editar`}>
              <Button leftIcon={<Edit className="w-4 h-4" />}>
                Editar Programa
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
                  {programa.descricao || 'Sem descrição disponível.'}
                </p>
              </CardContent>
            </Card>

            {/* Objetivos */}
            {programa.objetivos.length > 0 && (
              <Card variant="bordered">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-sky-500" />
                    Objetivos do Programa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {programa.objetivos.map((obj, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-sky-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-600">{obj}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Cursos do Programa */}
            <Card variant="bordered">
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-sky-500" />
                    Percurso Formativo ({programa.cursos.length} cursos)
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="success">{cursosObrigatorios} obrigatórios</Badge>
                    {cursosOpcionais > 0 && (
                      <Badge variant="default">{cursosOpcionais} opcionais</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {programa.cursos.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">
                    Nenhum curso definido para este programa.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {programa.cursos.map((programCurso, index) => {
                      const curso = getCurso(programCurso.cursoId);
                      if (!curso) return null;

                      return (
                        <div
                          key={programCurso.cursoId}
                          className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700 font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-slate-900">
                                    {curso.nome}
                                  </h4>
                                  <span className="text-xs text-slate-400">
                                    ({curso.codigo})
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant={programCurso.obrigatorio ? 'success' : 'default'}
                                  >
                                    {programCurso.obrigatorio ? 'Obrigatório' : 'Opcional'}
                                  </Badge>
                                  <Link
                                    href={`/cursos/${curso.id}`}
                                    className="p-1 rounded hover:bg-slate-200 transition-colors"
                                    title="Ver curso"
                                  >
                                    <ExternalLink className="w-4 h-4 text-slate-400" />
                                  </Link>
                                </div>
                              </div>
                              {curso.descricao && (
                                <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                                  {curso.descricao}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-sm text-slate-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{curso.duracaoTotal}h</span>
                                </div>
                                <span>•</span>
                                <span>{curso.modulos.length} módulos</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info Card */}
            <Card variant="bordered">
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="p-2 rounded-lg bg-sky-100 text-sky-600">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Duração Total</p>
                      <p className="font-semibold text-slate-900">
                        {programa.duracaoTotal} horas
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Total de Cursos</p>
                      <p className="font-semibold text-slate-900">
                        {programa.cursos.length} cursos
                      </p>
                    </div>
                  </div>

                  {programa.certificacao && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Certificação</p>
                        <p className="font-medium text-slate-900">
                          {programa.certificacao}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
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
                      {format(new Date(programa.dataCriacao), "d 'de' MMMM 'de' yyyy", {
                        locale: pt,
                      })}
                    </p>
                    <p className="text-xs text-slate-400">por {programa.criadoPor}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-slate-500">Última atualização</p>
                    <p className="font-medium text-slate-900">
                      {format(new Date(programa.dataAtualizacao), "d 'de' MMMM 'de' yyyy", {
                        locale: pt,
                      })}
                    </p>
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
