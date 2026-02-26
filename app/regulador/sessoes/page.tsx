'use client';

import { useState } from 'react';
import { Header } from '../../components/layout';
import { Badge, Card, EmptyState, getStatusBadgeVariant, getStatusLabel } from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { Calendar, Clock, Filter, MapPin, Search, User } from 'lucide-react';
import { SessionType, Status } from '../../types';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

export default function ReguladorSessoesPage() {
  const { state, getCurso } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'todos'>('todos');
  const [tipoFilter, setTipoFilter] = useState<SessionType | 'todos'>('todos');

  const filteredSessoes = state.sessoes.filter((sessao) => {
    const curso = getCurso(sessao.cursoId);
    const matchesSearch =
      sessao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sessao.formador.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curso?.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || sessao.status === statusFilter;
    const matchesTipo = tipoFilter === 'todos' || sessao.tipo === tipoFilter;
    return matchesSearch && matchesStatus && matchesTipo;
  });

  const sortedSessoes = [...filteredSessoes].sort(
    (a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime()
  );

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

  return (
    <>
      <Header
        title="Sessões"
        subtitle="Acompanhamento das sessões formativas planeadas"
      />

      <div className="p-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar sessões..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as Status | 'todos')}
                className="pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
              >
                <option value="todos">Todos os estados</option>
                <option value="rascunho">Rascunho</option>
                <option value="ativo">Agendado</option>
                <option value="arquivado">Concluído</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value as SessionType | 'todos')}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
            >
              <option value="todos">Todos os tipos</option>
              <option value="presencial">Presencial</option>
              <option value="online">Online</option>
              <option value="hibrido">Híbrido</option>
            </select>
          </div>
        </div>

        {sortedSessoes.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-8 h-8" />}
            title={searchTerm || statusFilter !== 'todos' || tipoFilter !== 'todos' ? 'Nenhuma sessão encontrada' : 'Sem sessões registadas'}
            description={
              searchTerm || statusFilter !== 'todos' || tipoFilter !== 'todos'
                ? 'Tente ajustar os filtros de pesquisa.'
                : 'As sessões registadas aparecerão aqui para acompanhamento regulatório.'
            }
          />
        ) : (
          <div className="space-y-4">
            {sortedSessoes.map((sessao, index) => {
              const curso = getCurso(sessao.cursoId);
              const isUpcoming = new Date(sessao.dataInicio) >= new Date();

              return (
                <Card
                  key={sessao.id}
                  variant="bordered"
                  padding="none"
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <div className="flex">
                    <div className={`w-24 flex-shrink-0 flex flex-col items-center justify-center p-4 ${isUpcoming ? 'bg-violet-50' : 'bg-slate-50'}`}>
                      <span className={`text-3xl font-bold ${isUpcoming ? 'text-violet-600' : 'text-slate-400'}`}>
                        {format(new Date(sessao.dataInicio), 'd')}
                      </span>
                      <span className={`text-sm font-medium uppercase ${isUpcoming ? 'text-violet-500' : 'text-slate-400'}`}>
                        {format(new Date(sessao.dataInicio), 'MMM', { locale: pt })}
                      </span>
                      <span className="text-xs text-slate-400 mt-1">
                        {format(new Date(sessao.dataInicio), 'yyyy')}
                      </span>
                    </div>

                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-slate-900">{sessao.nome}</h3>
                          {curso && (
                            <p className="text-sm text-slate-500">
                              {curso.nome} • {curso.codigo}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getTipoBadgeVariant(sessao.tipo)}>
                            {getTipoLabel(sessao.tipo)}
                          </Badge>
                          <Badge variant={getStatusBadgeVariant(sessao.status)}>
                            {sessao.status === 'ativo' ? 'Agendado' : getStatusLabel(sessao.status)}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-slate-500 mt-3">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>{sessao.horaInicio} - {sessao.horaFim}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          <span>{sessao.local || 'Local não definido'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User className="w-4 h-4" />
                          <span>{sessao.formador || 'Formador não atribuído'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
