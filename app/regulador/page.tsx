'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { BarChart3, BookOpen, Calendar, Clock3, Layers, RefreshCw } from 'lucide-react';
import { Header } from '../components/layout';
import { useApp } from '../context/AppContext';
import { Button, Card, CardContent, CardHeader, CardTitle } from '../components/ui';

export default function ReguladorPage() {
  const { state, refreshData, getEstatisticas } = useApp();

  const stats = getEstatisticas();

  const latestLogs = useMemo(
    () => [...state.auditLogs].sort((a, b) => b.dataHora.localeCompare(a.dataHora)).slice(0, 6),
    [state.auditLogs]
  );

  return (
    <>
      <Header
        title="Ambiente do Regulador"
        subtitle="Visão geral da atividade formativa e auditoria"
      />

      <div className="p-8 space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-600">
            Acompanhe indicadores principais e os últimos registos de auditoria.
          </p>
          <Button
            variant="outline"
            onClick={refreshData}
            isLoading={state.isLoading}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Atualizar dados
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card variant="bordered" padding="md">
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Cursos ativos</p>
                <p className="text-2xl font-bold text-slate-900">{stats.cursosAtivos}</p>
              </div>
              <BookOpen className="w-7 h-7 text-emerald-500" />
            </CardContent>
          </Card>

          <Card variant="bordered" padding="md">
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Programas ativos</p>
                <p className="text-2xl font-bold text-slate-900">{stats.programasAtivos}</p>
              </div>
              <Layers className="w-7 h-7 text-emerald-500" />
            </CardContent>
          </Card>

          <Card variant="bordered" padding="md">
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Sessões agendadas</p>
                <p className="text-2xl font-bold text-slate-900">{stats.sessoesAgendadas}</p>
              </div>
              <Calendar className="w-7 h-7 text-emerald-500" />
            </CardContent>
          </Card>

          <Card variant="bordered" padding="md">
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Horas de formação</p>
                <p className="text-2xl font-bold text-slate-900">{stats.horasFormacao}</p>
              </div>
              <Clock3 className="w-7 h-7 text-emerald-500" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card variant="bordered" className="xl:col-span-2">
            <CardHeader className="mb-0">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                Últimos registos de auditoria
              </CardTitle>
            </CardHeader>
            <CardContent className="mt-4">
              {latestLogs.length === 0 ? (
                <p className="text-sm text-slate-500">Ainda não existem registos de auditoria.</p>
              ) : (
                <div className="space-y-3">
                  {latestLogs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-lg border border-slate-200 p-3"
                    >
                      <p className="text-sm font-medium text-slate-900">{log.entidadeNome}</p>
                      <p className="text-sm text-slate-600">{log.detalhes}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(log.dataHora).toLocaleString('pt-PT')} · {log.utilizador}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardHeader className="mb-0">
              <CardTitle>Ações rápidas</CardTitle>
            </CardHeader>
            <CardContent className="mt-4 space-y-2">
              <Link
                href="/regulador/reguladores"
                className="block rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"
              >
                Gerir reguladores
              </Link>
              <Link
                href="/regulador/cursos"
                className="block rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"
              >
                Ver catálogo de cursos
              </Link>
              <Link
                href="/regulador/programas"
                className="block rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"
              >
                Ver programas formativos
              </Link>
              <Link
                href="/regulador/sessoes"
                className="block rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"
              >
                Ver sessões agendadas
              </Link>
              <Link
                href="/regulador/auditoria"
                className="block rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"
              >
                Ver histórico de auditoria
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
