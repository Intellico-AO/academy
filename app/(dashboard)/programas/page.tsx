'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import { Header } from '../../components/layout';
import { Button, Card, CardContent, Badge, getStatusBadgeVariant, getStatusLabel, EmptyState, Modal, ModalFooter } from '../../components/ui';
import { Plus, Search, Layers, Clock, BookOpen, MoreVertical, Edit, Trash2, Eye, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Program, Status } from '../../types';

export default function ProgramasPage() {
  const { state, eliminarPrograma, atualizarPrograma } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'todos'>('todos');
  const [selectedPrograma, setSelectedPrograma] = useState<Program | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const filteredProgramas = state.programas.filter((programa) => {
    const matchesSearch =
      programa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      programa.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || programa.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = () => {
    if (selectedPrograma) {
      eliminarPrograma(selectedPrograma.id);
      setShowDeleteModal(false);
      setSelectedPrograma(null);
    }
  };

  const handleStatusChange = (programa: Program, newStatus: Status) => {
    atualizarPrograma(programa.id, { ...programa, status: newStatus } as never);
    setShowMenu(null);
  };

  const getCursosCount = (programa: Program) => programa.cursos.length;
  
  const getCursosObrigatorios = (programa: Program) => 
    programa.cursos.filter((c) => c.obrigatorio).length;

  return (
    <>
      <Header
        title="Programas Formativos"
        subtitle="Gerir programas de formação compostos por múltiplos cursos"
      />

      <div className="p-8">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar programas..."
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
                <option value="ativo">Ativo</option>
                <option value="arquivado">Arquivado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <Link href="/programas/novo">
              <Button leftIcon={<Plus className="w-4 h-4" />}>
                Novo Programa
              </Button>
            </Link>
          </div>
        </div>

        {/* Programas List */}
        {filteredProgramas.length === 0 ? (
          <EmptyState
            icon={<Layers className="w-8 h-8" />}
            title={searchTerm || statusFilter !== 'todos' ? 'Nenhum programa encontrado' : 'Nenhum programa criado'}
            description={
              searchTerm || statusFilter !== 'todos'
                ? 'Tente ajustar os filtros de pesquisa'
                : 'Crie programas formativos para organizar os cursos em percursos de aprendizagem'
            }
            actionLabel={!searchTerm && statusFilter === 'todos' ? 'Criar primeiro programa' : undefined}
            onAction={!searchTerm && statusFilter === 'todos' ? () => window.location.href = '/programas/novo' : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProgramas.map((programa, index) => (
              <Card
                key={programa.id}
                variant="bordered"
                padding="none"
                className={`card-hover animate-fade-in overflow-hidden`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white">
                        <Layers className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                          {programa.codigo}
                        </span>
                        <h3 className="font-semibold text-slate-900 line-clamp-1">
                          {programa.nome}
                        </h3>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setShowMenu(showMenu === programa.id ? null : programa.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-slate-400" />
                      </button>
                      {showMenu === programa.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10 animate-scale-in">
                          <Link
                            href={`/programas/${programa.id}`}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Eye className="w-4 h-4" />
                            Ver detalhes
                          </Link>
                          <Link
                            href={`/programas/${programa.id}/editar`}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Edit className="w-4 h-4" />
                            Editar
                          </Link>
                          <hr className="my-1 border-slate-200" />
                          {programa.status !== 'ativo' && (
                            <button
                              onClick={() => handleStatusChange(programa, 'ativo')}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50 w-full text-left"
                            >
                              Ativar programa
                            </button>
                          )}
                          {programa.status !== 'arquivado' && (
                            <button
                              onClick={() => handleStatusChange(programa, 'arquivado')}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 w-full text-left"
                            >
                              Arquivar
                            </button>
                          )}
                          <hr className="my-1 border-slate-200" />
                          <button
                            onClick={() => {
                              setSelectedPrograma(programa);
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

                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                    {programa.descricao || 'Sem descrição'}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{programa.duracaoTotal}h</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      <span>{getCursosCount(programa)} cursos</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-600">
                      <span>{getCursosObrigatorios(programa)} obrigatórios</span>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <Badge variant={getStatusBadgeVariant(programa.status)}>
                    {getStatusLabel(programa.status)}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    Atualizado {format(new Date(programa.dataAtualizacao), "d MMM", { locale: pt })}
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
          setSelectedPrograma(null);
        }}
        title="Eliminar Programa"
        size="sm"
      >
        <p className="text-slate-600">
          Tem a certeza que pretende eliminar o programa <strong>{selectedPrograma?.nome}</strong>?
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
