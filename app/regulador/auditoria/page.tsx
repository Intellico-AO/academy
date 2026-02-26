'use client';

import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../../components/layout';
import { Card, CardContent, Badge, EmptyState } from '../../components/ui';
import {
  Archive,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Edit,
  Filter,
  History,
  Layers,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { AuditAction, AuditLog } from '../../types';

export default function ReguladorAuditoriaPage() {
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState<AuditLog['entidadeTipo'] | 'todos'>('todos');
  const [acaoFilter, setAcaoFilter] = useState<AuditAction | 'todos'>('todos');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const filteredLogs = state.auditLogs.filter((log) => {
    const matchesSearch =
      log.entidadeNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.detalhes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.utilizador.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = tipoFilter === 'todos' || log.entidadeTipo === tipoFilter;
    const matchesAcao = acaoFilter === 'todos' || log.acao === acaoFilter;
    return matchesSearch && matchesTipo && matchesAcao;
  });

  const getEntidadeIcon = (tipo: AuditLog['entidadeTipo']) => {
    switch (tipo) {
      case 'curso':
        return BookOpen;
      case 'programa':
        return Layers;
      case 'sessao':
        return Calendar;
      case 'plano':
        return ClipboardList;
      default:
        return History;
    }
  };

  const getEntidadeColor = (tipo: AuditLog['entidadeTipo']) => {
    switch (tipo) {
      case 'curso':
        return 'bg-emerald-100 text-emerald-600';
      case 'programa':
        return 'bg-sky-100 text-sky-600';
      case 'sessao':
        return 'bg-violet-100 text-violet-600';
      case 'plano':
        return 'bg-amber-100 text-amber-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const getAcaoIcon = (acao: AuditAction) => {
    switch (acao) {
      case 'criar':
        return Plus;
      case 'editar':
        return Edit;
      case 'eliminar':
        return Trash2;
      case 'arquivar':
        return Archive;
      case 'ativar':
        return CheckCircle;
      default:
        return History;
    }
  };

  const getAcaoColor = (acao: AuditAction) => {
    switch (acao) {
      case 'criar':
        return 'bg-emerald-100 text-emerald-600';
      case 'editar':
        return 'bg-amber-100 text-amber-600';
      case 'eliminar':
        return 'bg-rose-100 text-rose-600';
      case 'arquivar':
        return 'bg-slate-100 text-slate-600';
      case 'ativar':
        return 'bg-sky-100 text-sky-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const getAcaoLabel = (acao: AuditAction) => {
    switch (acao) {
      case 'criar':
        return 'Criação';
      case 'editar':
        return 'Edição';
      case 'eliminar':
        return 'Eliminação';
      case 'arquivar':
        return 'Arquivo';
      case 'ativar':
        return 'Ativação';
      default:
        return acao;
    }
  };

  const getTipoLabel = (tipo: AuditLog['entidadeTipo']) => {
    switch (tipo) {
      case 'curso':
        return 'Curso';
      case 'programa':
        return 'Programa';
      case 'sessao':
        return 'Sessão';
      case 'plano':
        return 'Plano';
      default:
        return tipo;
    }
  };

  const groupedLogs = filteredLogs.reduce((groups, log) => {
    const date = format(new Date(log.dataHora), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(log);
    return groups;
  }, {} as Record<string, AuditLog[]>);

  const sortedDates = Object.keys(groupedLogs).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <>
      <Header
        title="Auditoria"
        subtitle="Rastreabilidade das alterações para supervisão regulatória"
      />

      <div className="p-8">
        <Card variant="bordered" className="mb-6">
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar no histórico..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={tipoFilter}
                    onChange={(e) => setTipoFilter(e.target.value as AuditLog['entidadeTipo'] | 'todos')}
                    className="pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
                  >
                    <option value="todos">Todos os tipos</option>
                    <option value="curso">Cursos</option>
                    <option value="programa">Programas</option>
                    <option value="sessao">Sessões</option>
                    <option value="plano">Planos</option>
                  </select>
                </div>
                <select
                  value={acaoFilter}
                  onChange={(e) => setAcaoFilter(e.target.value as AuditAction | 'todos')}
                  className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
                >
                  <option value="todos">Todas as ações</option>
                  <option value="criar">Criação</option>
                  <option value="editar">Edição</option>
                  <option value="eliminar">Eliminação</option>
                  <option value="arquivar">Arquivo</option>
                  <option value="ativar">Ativação</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{state.auditLogs.length}</p>
            <p className="text-sm text-slate-500">Total de registos</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {state.auditLogs.filter((l) => l.acao === 'criar').length}
            </p>
            <p className="text-sm text-slate-500">Criações</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">
              {state.auditLogs.filter((l) => l.acao === 'editar').length}
            </p>
            <p className="text-sm text-slate-500">Edições</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
            <p className="text-2xl font-bold text-rose-600">
              {state.auditLogs.filter((l) => l.acao === 'eliminar').length}
            </p>
            <p className="text-sm text-slate-500">Eliminações</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
            <p className="text-2xl font-bold text-slate-600">
              {new Set(state.auditLogs.map((l) => l.utilizador)).size}
            </p>
            <p className="text-sm text-slate-500">Utilizadores</p>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <EmptyState
            icon={<History className="w-8 h-8" />}
            title={searchTerm || tipoFilter !== 'todos' || acaoFilter !== 'todos' ? 'Nenhum registo encontrado' : 'Sem histórico de alterações'}
            description={
              searchTerm || tipoFilter !== 'todos' || acaoFilter !== 'todos'
                ? 'Tente ajustar os filtros de pesquisa.'
                : 'O histórico de alterações aparecerá aqui à medida que forem feitas operações no sistema.'
            }
          />
        ) : (
          <div className="space-y-6">
            {sortedDates.map((date) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-sm font-medium text-slate-500 px-3 py-1 bg-slate-100 rounded-full">
                    {format(new Date(date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: pt })}
                  </span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <div className="space-y-3">
                  {groupedLogs[date].map((log) => {
                    const EntidadeIcon = getEntidadeIcon(log.entidadeTipo);
                    const AcaoIcon = getAcaoIcon(log.acao);
                    const isExpanded = expandedLog === log.id;
                    const hasDetails = log.alteracoesAntes || log.alteracoesDepois;

                    return (
                      <Card
                        key={log.id}
                        variant="bordered"
                        padding="none"
                        className="overflow-hidden animate-fade-in"
                      >
                        <div
                          className={`p-4 ${hasDetails ? 'cursor-pointer hover:bg-slate-50' : ''}`}
                          onClick={() => hasDetails && setExpandedLog(isExpanded ? null : log.id)}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-lg ${getEntidadeColor(log.entidadeTipo)}`}>
                              <EntidadeIcon className="w-5 h-5" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-slate-900">
                                  {log.entidadeNome}
                                </span>
                                <Badge variant="default" className="capitalize">
                                  {getTipoLabel(log.entidadeTipo)}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-600 mb-2">
                                {log.detalhes}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-slate-400">
                                <span className="flex items-center gap-1">
                                  <span className={`p-1 rounded ${getAcaoColor(log.acao)}`}>
                                    <AcaoIcon className="w-3 h-3" />
                                  </span>
                                  {getAcaoLabel(log.acao)}
                                </span>
                                <span>{format(new Date(log.dataHora), 'HH:mm:ss')}</span>
                                <span>por {log.utilizador}</span>
                              </div>
                            </div>

                            {hasDetails && (
                              <div className="flex items-center text-slate-400">
                                {isExpanded ? (
                                  <ChevronDown className="w-5 h-5" />
                                ) : (
                                  <ChevronRight className="w-5 h-5" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {isExpanded && hasDetails && (
                          <div className="px-4 pb-4 pt-0 border-t border-slate-100 bg-slate-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              {log.alteracoesAntes && (
                                <div>
                                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                                    Estado Anterior
                                  </p>
                                  <pre className="text-xs bg-white p-3 rounded-lg border border-slate-200 overflow-auto max-h-48">
                                    {JSON.stringify(log.alteracoesAntes, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {log.alteracoesDepois && (
                                <div>
                                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                                    Estado Após
                                  </p>
                                  <pre className="text-xs bg-white p-3 rounded-lg border border-slate-200 overflow-auto max-h-48">
                                    {JSON.stringify(log.alteracoesDepois, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
