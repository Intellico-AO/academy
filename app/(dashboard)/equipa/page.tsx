'use client';

import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  Archive,
  Filter,
  Mail,
  MoreVertical,
  Plus,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header } from '../../components/layout';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Modal,
  ModalFooter,
} from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import * as authService from '../../lib/authService';
import * as equipaService from '../../lib/equipaService';
import type { UserAccount } from '../../types';

export default function EquipaPage() {
  const { center, user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [membros, setMembros] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'todos' | 'ativo' | 'inativo'
  >('todos');
  const [selectedMembro, setSelectedMembro] = useState<UserAccount | null>(
    null
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMenu, setShowMenu] = useState<string | null>(null);

  // Apenas responsável pode gerir equipa
  useEffect(() => {
    if (user && user.role !== 'responsavel') {
      router.push('/');
      toast.error(
        'Acesso negado',
        'Apenas o responsável pode gerir a equipa.'
      );
    }
  }, [user, router, toast]);

  useEffect(() => {
    if (center?.id) {
      loadEquipa();
    }
  }, [center?.id]);

  const loadEquipa = async () => {
    if (!center?.id) return;

    setIsLoading(true);
    try {
      const data = await equipaService.getEquipa(center.id);
      setMembros(data);
    } catch (error) {
      console.error('Erro ao carregar equipa:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMembros = membros.filter((membro) => {
    const matchesSearch =
      membro.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      membro.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'todos' ||
      (statusFilter === 'ativo' && membro.ativo) ||
      (statusFilter === 'inativo' && !membro.ativo);
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async () => {
    if (selectedMembro) {
      // Não permitir eliminar-se a si próprio
      if (selectedMembro.id === user?.id) {
        toast.error(
          'Ação não permitida',
          'Não pode eliminar a sua própria conta.'
        );
        setShowDeleteModal(false);
        setSelectedMembro(null);
        return;
      }

      try {
        await authService.deleteUser(selectedMembro.id);
        setMembros((prev) =>
          prev.filter((m) => m.id !== selectedMembro.id)
        );
        toast.success(
          'Membro eliminado',
          `${selectedMembro.nome} foi eliminado com sucesso.`
        );
        setShowDeleteModal(false);
        setSelectedMembro(null);
      } catch (error) {
        console.error('Erro ao eliminar membro:', error);
        toast.error('Erro', 'Não foi possível eliminar o membro.');
      }
    }
  };

  const handleArchive = async (membro: UserAccount) => {
    if (membro.id === user?.id) {
      toast.error(
        'Ação não permitida',
        'Não pode desativar a sua própria conta.'
      );
      setShowMenu(null);
      return;
    }

    try {
      await equipaService.archiveMembro(membro.id);
      setMembros((prev) =>
        prev.map((m) =>
          m.id === membro.id ? { ...m, ativo: false } : m
        )
      );
      toast.success(
        'Membro desativado',
        `${membro.nome} foi desativado.`
      );
      setShowMenu(null);
    } catch (error) {
      console.error('Erro ao desativar membro:', error);
      toast.error('Erro', 'Não foi possível desativar o membro.');
    }
  };

  const handleActivate = async (membro: UserAccount) => {
    try {
      await equipaService.activateMembro(membro.id);
      setMembros((prev) =>
        prev.map((m) =>
          m.id === membro.id ? { ...m, ativo: true } : m
        )
      );
      toast.success('Membro ativado', `${membro.nome} foi ativado.`);
      setShowMenu(null);
    } catch (error) {
      console.error('Erro ao ativar membro:', error);
      toast.error('Erro', 'Não foi possível ativar o membro.');
    }
  };

  const getRoleLabel = (role: string) => {
    return role === 'responsavel' ? 'Responsável' : 'Assistente';
  };

  const getRoleIcon = (role: string) => {
    return role === 'responsavel' ? ShieldCheck : Shield;
  };

  if (user && user.role !== 'responsavel') {
    return null;
  }

  if (isLoading) {
    return (
      <>
        <Header title="Equipa" subtitle="A carregar..." breadcrumbs={[{ label: 'Equipa' }]} />
        <div className="p-8 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Equipa"
        subtitle="Gerir responsáveis e assistentes do centro de formação"
        breadcrumbs={[{ label: 'Equipa' }]}
      />

      <div className="p-8">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar membros..."
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
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as 'todos' | 'ativo' | 'inativo'
                  )
                }
                className="pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
              >
                <option value="todos">Todos os estados</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
            <Link href="/equipa/novo">
              <Button leftIcon={<Plus className="w-4 h-4" />}>
                Novo Membro
              </Button>
            </Link>
          </div>
        </div>

        {/* Lista de membros */}
        {filteredMembros.length === 0 ? (
          <EmptyState
            icon={<ShieldCheck className="w-8 h-8" />}
            title={
              searchTerm || statusFilter !== 'todos'
                ? 'Nenhum membro encontrado'
                : 'Apenas você na equipa'
            }
            description={
              searchTerm || statusFilter !== 'todos'
                ? 'Tente ajustar os filtros de pesquisa'
                : 'Adicione responsáveis ou assistentes para ajudar na gestão do centro'
            }
            actionLabel={
              !searchTerm && statusFilter === 'todos'
                ? 'Adicionar membro'
                : undefined
            }
            onAction={
              !searchTerm && statusFilter === 'todos'
                ? () => router.push('/equipa/novo')
                : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMembros.map((membro, index) => {
              const RoleIcon = getRoleIcon(membro.role);
              const isSelf = membro.id === user?.id;

              return (
                <Card
                  key={membro.id}
                  variant="bordered"
                  padding="none"
                  className="card-hover animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-lg font-bold">
                          {membro.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 line-clamp-1">
                            {membro.nome}
                            {isSelf && (
                              <span className="text-xs text-slate-400 ml-1">
                                (você)
                              </span>
                            )}
                          </h3>
                          <div className="flex items-center gap-1.5 text-sm text-slate-500">
                            <RoleIcon className="w-3.5 h-3.5" />
                            <span>{getRoleLabel(membro.role)}</span>
                          </div>
                        </div>
                      </div>
                      {!isSelf && (
                        <div className="relative overflow-visible">
                          <button
                            onClick={() =>
                              setShowMenu(
                                showMenu === membro.id
                                  ? null
                                  : membro.id
                              )
                            }
                            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                          >
                            <MoreVertical className="w-5 h-5 text-slate-400" />
                          </button>
                          {showMenu === membro.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 animate-scale-in">
                              {membro.ativo ? (
                                <button
                                  onClick={() => handleArchive(membro)}
                                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 w-full text-left"
                                >
                                  <Archive className="w-4 h-4" />
                                  Desativar
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleActivate(membro)
                                  }
                                  className="flex items-center gap-2 px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50 w-full text-left"
                                >
                                  Ativar
                                </button>
                              )}
                              <hr className="my-1 border-slate-200" />
                              <button
                                onClick={() => {
                                  setSelectedMembro(membro);
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
                      )}
                    </div>

                    <div className="space-y-2 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{membro.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <Badge
                      variant={membro.ativo ? 'success' : 'default'}
                    >
                      {membro.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      Desde{' '}
                      {format(
                        new Date(membro.dataCriacao),
                        'MMM yyyy',
                        { locale: pt }
                      )}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de confirmação de eliminação */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedMembro(null);
        }}
        title="Eliminar Membro"
        size="sm"
      >
        <p className="text-slate-600">
          Tem a certeza que pretende eliminar{' '}
          <strong>{selectedMembro?.nome}</strong>? Esta ação não pode
          ser revertida.
        </p>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => setShowDeleteModal(false)}
          >
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
