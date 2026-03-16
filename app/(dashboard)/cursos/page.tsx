'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Header } from '../../components/layout';
import { Button, Card, CardContent, Badge, getStatusBadgeVariant, getStatusLabel, EmptyState, Modal, ModalFooter } from '../../components/ui';
import { Plus, Search, BookOpen, Clock, Layers, MoreVertical, Edit, Trash2, Eye, Filter, Send } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Course, Status } from '../../types';

export default function CursosPage() {
  const { user } = useAuth();
  const { state, eliminarCurso, atualizarCurso } = useApp();
  const isFormando = user?.role === 'formando';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'todos'>('todos');
  const [selectedCurso, setSelectedCurso] = useState<Course | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMenu, setShowMenu] = useState<string | null>(null);

  // Formandos só vêem cursos em que estão inscritos
  const cursosFormando = useMemo(() => {
    if (!isFormando || !user) return null;
    return state.inscricoes
      .filter((i) => i.formandoId === user.id && i.status === 'ativo')
      .map((i) => i.cursoId);
  }, [isFormando, user, state.inscricoes]);

  const cursosBase = isFormando && cursosFormando
    ? state.cursos.filter((c) => cursosFormando.includes(c.id))
    : state.cursos;

  const filteredCursos = cursosBase.filter((curso) => {
    const matchesSearch =
      curso.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curso.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || curso.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = () => {
    if (selectedCurso) {
      eliminarCurso(selectedCurso.id);
      setShowDeleteModal(false);
      setSelectedCurso(null);
    }
  };

  const handleStatusChange = (curso: Course, newStatus: Status) => {
    atualizarCurso(curso.id, { ...curso, status: newStatus } as never);
    setShowMenu(null);
  };

  return (
    <>
      <Header
        title="Cursos"
        subtitle="Gerir cursos formativos e respetivos módulos"
        breadcrumbs={[{ label: 'Cursos' }]}
      />

      <div className="p-8">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar cursos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as Status | 'todos')}
                className="pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
              >
                <option value="todos">Todos os estados</option>
                <option value="rascunho">Rascunho</option>
                <option value="aguardando_aprovacao">Aguardando Aprovação</option>
                <option value="ativo">Ativo</option>
                <option value="arquivado">Arquivado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            {!isFormando && (
              <Link href="/cursos/novo">
                <Button leftIcon={<Plus className="w-4 h-4" />}>
                  Novo Curso
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Cursos List */}
        {filteredCursos.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="w-8 h-8" />}
            title={searchTerm || statusFilter !== 'todos' ? 'Nenhum curso encontrado' : 'Nenhum curso criado'}
            description={
              searchTerm || statusFilter !== 'todos'
                ? 'Tente ajustar os filtros de pesquisa'
                : 'Comece a criar cursos para organizar a sua oferta formativa'
            }
            actionLabel={!searchTerm && statusFilter === 'todos' ? 'Criar primeiro curso' : undefined}
            onAction={!searchTerm && statusFilter === 'todos' ? () => window.location.href = '/cursos/novo' : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCursos.map((curso, index) => (
              <Card
                key={curso.id}
                variant="bordered"
                padding="none"
                className={`card-hover animate-fade-in`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                          {curso.codigo}
                        </span>
                        <h3 className="font-semibold text-slate-900 line-clamp-1">
                          {curso.nome}
                        </h3>
                      </div>
                    </div>
                    <div className="relative overflow-visible">
                      <button
                        onClick={() => setShowMenu(showMenu === curso.id ? null : curso.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-slate-400" />
                      </button>
                      {showMenu === curso.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 animate-scale-in">
                          <Link
                            href={`/cursos/${curso.id}`}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Eye className="w-4 h-4" />
                            Ver detalhes
                          </Link>
                          {!isFormando && (
                            <>
                              <Link
                                href={`/cursos/${curso.id}/editar`}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                              >
                                <Edit className="w-4 h-4" />
                                Editar
                              </Link>
                              <hr className="my-1 border-slate-200" />
                              {(curso.status === 'rascunho') && (
                                <button
                                  onClick={() => handleStatusChange(curso, 'aguardando_aprovacao')}
                                  className="flex items-center gap-2 px-3 py-2 text-sm text-violet-600 hover:bg-violet-50 w-full text-left"
                                >
                                  <Send className="w-4 h-4" />
                                  Submeter para Aprovação
                                </button>
                              )}
                              {curso.status !== 'arquivado' && (
                                <button
                                  onClick={() => handleStatusChange(curso, 'arquivado')}
                                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 w-full text-left"
                                >
                                  Arquivar
                                </button>
                              )}
                              <hr className="my-1 border-slate-200" />
                              <button
                                onClick={() => {
                                  setSelectedCurso(curso);
                                  setShowDeleteModal(true);
                                  setShowMenu(null);
                                }}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 w-full text-left"
                              >
                                <Trash2 className="w-4 h-4" />
                                Eliminar
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                    {curso.descricao || 'Sem descrição'}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{curso.duracaoTotal}h</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4" />
                      <span>{curso.modulos.length} módulos</span>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between rounded-b-xl overflow-hidden">
                  <Badge variant={getStatusBadgeVariant(curso.status)}>
                    {getStatusLabel(curso.status)}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    Atualizado {format(new Date(curso.dataAtualizacao), "d MMM", { locale: pt })}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCurso(null);
        }}
        title="Eliminar Curso"
        size="sm"
      >
        <p className="text-slate-600">
          Tem a certeza que pretende eliminar o curso <strong>{selectedCurso?.nome}</strong>?
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
