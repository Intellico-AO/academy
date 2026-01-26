'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import { Header } from '../../components/layout';
import { Button, Card, CardContent, Badge, getStatusBadgeVariant, getStatusLabel, EmptyState, Modal, ModalFooter } from '../../components/ui';
import { Plus, Search, Calendar, Clock, MapPin, User, MoreVertical, Edit, Trash2, Eye, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Session, Status, SessionType } from '../../types';

export default function SessoesPage() {
  const { state, eliminarSessao, getCurso } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'todos'>('todos');
  const [tipoFilter, setTipoFilter] = useState<SessionType | 'todos'>('todos');
  const [selectedSessao, setSelectedSessao] = useState<Session | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMenu, setShowMenu] = useState<string | null>(null);

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

  // Ordenar por data
  const sortedSessoes = [...filteredSessoes].sort(
    (a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime()
  );

  const handleDelete = () => {
    if (selectedSessao) {
      eliminarSessao(selectedSessao.id);
      setShowDeleteModal(false);
      setSelectedSessao(null);
    }
  };

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
        title="Sessões Formativas"
        subtitle="Gerir e agendar sessões de formação"
      />

      <div className="p-8">
        {/* Actions Bar */}
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
            <Link href="/sessoes/nova">
              <Button leftIcon={<Plus className="w-4 h-4" />}>
                Nova Sessão
              </Button>
            </Link>
          </div>
        </div>

        {/* Sessões List */}
        {sortedSessoes.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-8 h-8" />}
            title={searchTerm || statusFilter !== 'todos' || tipoFilter !== 'todos' ? 'Nenhuma sessão encontrada' : 'Nenhuma sessão agendada'}
            description={
              searchTerm || statusFilter !== 'todos' || tipoFilter !== 'todos'
                ? 'Tente ajustar os filtros de pesquisa'
                : 'Agende sessões formativas para ministrar os conteúdos dos cursos'
            }
            actionLabel={!searchTerm && statusFilter === 'todos' && tipoFilter === 'todos' ? 'Agendar primeira sessão' : undefined}
            onAction={!searchTerm && statusFilter === 'todos' && tipoFilter === 'todos' ? () => window.location.href = '/sessoes/nova' : undefined}
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
                  className={`card-hover animate-fade-in`}
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <div className="flex">
                    {/* Date Column */}
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

                    {/* Content */}
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
                          <div className="relative overflow-visible">
                            <button
                              onClick={() => setShowMenu(showMenu === sessao.id ? null : sessao.id)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                              <MoreVertical className="w-5 h-5 text-slate-400" />
                            </button>
                            {showMenu === sessao.id && (
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 animate-scale-in">
                                <Link
                                  href={`/sessoes/${sessao.id}`}
                                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                >
                                  <Eye className="w-4 h-4" />
                                  Ver detalhes
                                </Link>
                                <Link
                                  href={`/sessoes/${sessao.id}/editar`}
                                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                >
                                  <Edit className="w-4 h-4" />
                                  Editar
                                </Link>
                                <Link
                                  href={`/planos?sessao=${sessao.id}`}
                                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                >
                                  <Calendar className="w-4 h-4" />
                                  Plano de Sessão
                                </Link>
                                <hr className="my-1 border-slate-200" />
                                <button
                                  onClick={() => {
                                    setSelectedSessao(sessao);
                                    setShowDeleteModal(true);
                                    setShowMenu(null);
                                  }}
                                  className="flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 w-full text-left"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Eliminar
                                </button>
                              </div>
                            )}
                          </div>
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedSessao(null);
        }}
        title="Eliminar Sessão"
        size="sm"
      >
        <p className="text-slate-600">
          Tem a certeza que pretende eliminar a sessão <strong>{selectedSessao?.nome}</strong>?
          Esta ação não pode ser revertida.
        </p>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Eliminar
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
