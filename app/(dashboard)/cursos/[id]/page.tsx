'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '../../../context/AppContext';
import { Header } from '../../../components/layout';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, getStatusBadgeVariant, getStatusLabel } from '../../../components/ui';
import { ArrowLeft, Edit, Clock, Users, Award, BookOpen, Target, FileText, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CursoDetalhesPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { getCurso, getAuditLogs } = useApp();

  const curso = getCurso(id);
  const auditLogs = getAuditLogs({ entidadeId: id });

  if (!curso) {
    return (
      <>
        <Header title="Curso não encontrado" />
        <div className="p-8">
          <p className="text-slate-500">O curso solicitado não existe ou foi eliminado.</p>
          <Button onClick={() => router.push('/cursos')} className="mt-4">
            Voltar aos Cursos
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title={curso.nome}
        subtitle={`Código: ${curso.codigo}`}
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
            <Badge variant={getStatusBadgeVariant(curso.status)} className="text-sm px-3 py-1">
              {getStatusLabel(curso.status)}
            </Badge>
            <Link href={`/cursos/${curso.id}/editar`}>
              <Button leftIcon={<Edit className="w-4 h-4" />}>
                Editar Curso
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
                  {curso.descricao || 'Sem descrição disponível.'}
                </p>
              </CardContent>
            </Card>

            {/* Objetivos */}
            {curso.objetivosGerais.length > 0 && (
              <Card variant="bordered">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-500" />
                    Objetivos Gerais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {curso.objetivosGerais.map((obj, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-600">{obj}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Módulos */}
            <Card variant="bordered">
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-500" />
                    Módulos ({curso.modulos.length})
                  </CardTitle>
                  <span className="text-sm text-slate-500">
                    {curso.duracaoTotal}h total
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {curso.modulos.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">
                    Nenhum módulo definido para este curso.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {curso.modulos.map((modulo, index) => (
                      <div
                        key={modulo.id}
                        className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-slate-900">
                                {modulo.nome}
                              </h4>
                              <span className="text-sm text-slate-500">
                                {modulo.duracaoHoras}h
                              </span>
                            </div>
                            {modulo.descricao && (
                              <p className="text-sm text-slate-600 mb-3">
                                {modulo.descricao}
                              </p>
                            )}
                            {modulo.objetivos.length > 0 && (
                              <div className="mb-3">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                                  Objetivos
                                </p>
                                <ul className="space-y-1">
                                  {modulo.objetivos.map((obj, i) => (
                                    <li
                                      key={i}
                                      className="text-sm text-slate-600 flex items-center gap-2"
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                      {obj}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {modulo.conteudos.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                                  Conteúdos
                                </p>
                                <ul className="space-y-1">
                                  {modulo.conteudos.map((cont, i) => (
                                    <li
                                      key={i}
                                      className="text-sm text-slate-600 flex items-center gap-2"
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                      {cont}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Metodologia e Avaliação */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {curso.metodologia && (
                <Card variant="bordered">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-500" />
                      Metodologia
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 whitespace-pre-wrap">
                      {curso.metodologia}
                    </p>
                  </CardContent>
                </Card>
              )}

              {curso.avaliacao && (
                <Card variant="bordered">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      Avaliação
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 whitespace-pre-wrap">
                      {curso.avaliacao}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info Card */}
            <Card variant="bordered">
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Duração Total</p>
                      <p className="font-semibold text-slate-900">
                        {curso.duracaoTotal} horas
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="p-2 rounded-lg bg-sky-100 text-sky-600">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Público-Alvo</p>
                      <p className="font-medium text-slate-900">
                        {curso.publicoAlvo || 'Não especificado'}
                      </p>
                    </div>
                  </div>

                  {curso.certificacao && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Certificação</p>
                        <p className="font-medium text-slate-900">
                          {curso.certificacao}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pré-requisitos */}
            {curso.prerequisitos.length > 0 && (
              <Card variant="bordered">
                <CardHeader>
                  <CardTitle>Pré-requisitos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {curso.prerequisitos.map((prereq, index) => (
                      <li
                        key={index}
                        className="text-sm text-slate-600 flex items-start gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2" />
                        {prereq}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

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
                      {format(new Date(curso.dataCriacao), "d 'de' MMMM 'de' yyyy", {
                        locale: pt,
                      })}
                    </p>
                    <p className="text-xs text-slate-400">por {curso.criadoPor}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-slate-500">Última atualização</p>
                    <p className="font-medium text-slate-900">
                      {format(new Date(curso.dataAtualizacao), "d 'de' MMMM 'de' yyyy", {
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
