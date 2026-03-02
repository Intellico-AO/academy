'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  ShieldCheck,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-react';

import { Header } from '../../components/layout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  ModalFooter,
  Select,
} from '../../components/ui';
import { AdminRole, UserAccount } from '../../types';
import * as authService from '../../lib/authService';
import * as firebaseService from '../../lib/firebaseService';

// Admins sem adminRole definido são tratados como 'owner' (retrocompatibilidade)
const isOwner = (u: UserAccount | null | undefined) =>
  u?.role === 'admin' && (u.adminRole || 'owner') === 'owner';

const getAdminRoleLabel = (admin: UserAccount) =>
  (admin.adminRole || 'owner') === 'owner' ? 'Proprietário' : 'Gestor';

export default function AdministradoresPage() {
  const { user, center } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const [admins, setAdmins] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativo' | 'inativo'>('todos');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // Modal de criação
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ nome: '', email: '', adminRole: 'manager' as AdminRole });
  const [isCreating, setIsCreating] = useState(false);

  // Modal de eliminação
  const [selectedAdmin, setSelectedAdmin] = useState<UserAccount | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (user && !isOwner(user)) {
      router.push('/admin');
      toast.error('Acesso negado', 'Apenas owners podem gerir administradores.');
    }
  }, [user, router, toast]);

  useEffect(() => {
    if (isOwner(user)) {
      loadData();
    }
  }, [user?.role, user?.adminRole]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const adminsData = await authService.getAllAdminUsers();
      setAdmins(adminsData);
    } catch (error) {
      console.error('Erro ao carregar administradores:', error);
      toast.error('Erro', 'Não foi possível carregar a lista de administradores.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAdmins = useMemo(
    () =>
      admins.filter((admin) => {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
          admin.nome.toLowerCase().includes(term) ||
          admin.email.toLowerCase().includes(term);
        const matchesStatus =
          statusFilter === 'todos' ||
          (statusFilter === 'ativo' && admin.ativo) ||
          (statusFilter === 'inativo' && !admin.ativo);
        return matchesSearch && matchesStatus;
      }),
    [admins, searchTerm, statusFilter]
  );

  const handleCreate = async () => {
    if (!createForm.nome.trim() || !createForm.email.trim()) {
      toast.error('Campos obrigatórios', 'Preencha o nome e email.');
      return;
    }

    setIsCreating(true);
    try {
      const exists = await authService.checkEmailExists(createForm.email.trim());
      if (exists) {
        toast.error('Email já existe', 'Já existe um utilizador com este email.');
        setIsCreating(false);
        return;
      }

      const newAdmin = await authService.createAdminUser(
        createForm.email.trim(),
        createForm.nome.trim(),
        createForm.adminRole
      );

      setAdmins((prev) => [...prev, newAdmin]);

      if (center) {
        try {
          await firebaseService.createAuditLog({
            entidadeTipo: 'administrador',
            entidadeId: newAdmin.id,
            entidadeNome: newAdmin.nome,
            acao: 'criar',
            detalhes: `Administrador "${newAdmin.nome}" criado como manager.`,
            alteracoesAntes: null,
            alteracoesDepois: newAdmin as unknown as Record<string, unknown>,
            utilizador: user?.nome || user?.email || 'Desconhecido',
            centroFormacaoId: center.id,
            dataHora: new Date().toISOString(),
          });
        } catch (logError) {
          console.error('Erro ao registar log de auditoria:', logError);
        }
      }

      toast.success(
        'Administrador criado',
        'A conta foi criada. O utilizador irá definir a palavra-passe no primeiro login.'
      );
      setShowCreateModal(false);
      setCreateForm({ nome: '', email: '', adminRole: 'manager' });
    } catch (error) {
      console.error('Erro ao criar administrador:', error);
      toast.error('Erro', 'Não foi possível criar o administrador. Tente novamente.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleAtivo = async (admin: UserAccount) => {
    if (admin.id === user?.id) {
      toast.error('Ação não permitida', 'Não pode desativar a sua própria conta.');
      setMenuOpenId(null);
      return;
    }

    try {
      const novoEstado = !admin.ativo;
      await authService.updateUser(admin.id, { ativo: novoEstado });
      setAdmins((prev) =>
        prev.map((a) => (a.id === admin.id ? { ...a, ativo: novoEstado } : a))
      );

      if (center) {
        try {
          await firebaseService.createAuditLog({
            entidadeTipo: 'administrador',
            entidadeId: admin.id,
            entidadeNome: admin.nome,
            acao: novoEstado ? 'ativar' : 'arquivar',
            detalhes: novoEstado
              ? `Administrador "${admin.nome}" ativado.`
              : `Administrador "${admin.nome}" desativado.`,
            alteracoesAntes: { ativo: !novoEstado } as unknown as Record<string, unknown>,
            alteracoesDepois: { ativo: novoEstado } as unknown as Record<string, unknown>,
            utilizador: user?.nome || user?.email || 'Desconhecido',
            centroFormacaoId: center.id,
            dataHora: new Date().toISOString(),
          });
        } catch (logError) {
          console.error('Erro ao registar log de auditoria:', logError);
        }
      }

      toast.success(
        novoEstado ? 'Administrador ativado' : 'Administrador desativado',
        `${admin.nome} foi ${novoEstado ? 'ativado' : 'desativado'}.`
      );
      setMenuOpenId(null);
    } catch (error) {
      console.error('Erro ao atualizar estado do administrador:', error);
      toast.error('Erro', 'Não foi possível atualizar o estado. Tente novamente.');
    }
  };

  const handleDelete = async () => {
    if (!selectedAdmin) return;

    if (selectedAdmin.id === user?.id) {
      toast.error('Ação não permitida', 'Não pode eliminar a sua própria conta.');
      setShowDeleteModal(false);
      setSelectedAdmin(null);
      return;
    }

    try {
      await authService.deleteUser(selectedAdmin.id);
      setAdmins((prev) => prev.filter((a) => a.id !== selectedAdmin.id));

      if (center) {
        try {
          await firebaseService.createAuditLog({
            entidadeTipo: 'administrador',
            entidadeId: selectedAdmin.id,
            entidadeNome: selectedAdmin.nome,
            acao: 'eliminar',
            detalhes: `Administrador "${selectedAdmin.nome}" eliminado.`,
            alteracoesAntes: selectedAdmin as unknown as Record<string, unknown>,
            alteracoesDepois: null,
            utilizador: user?.nome || user?.email || 'Desconhecido',
            centroFormacaoId: center.id,
            dataHora: new Date().toISOString(),
          });
        } catch (logError) {
          console.error('Erro ao registar log de auditoria:', logError);
        }
      }

      toast.success(
        'Administrador eliminado',
        `${selectedAdmin.nome} foi eliminado com sucesso.`
      );
      setShowDeleteModal(false);
      setSelectedAdmin(null);
    } catch (error) {
      console.error('Erro ao eliminar administrador:', error);
      toast.error('Erro', 'Não foi possível eliminar o administrador. Tente novamente.');
    }
  };

  const getActivityDotClass = (admin: UserAccount) => {
    if (!admin.ultimoAcesso) return 'bg-slate-400';

    const lastAccess = new Date(admin.ultimoAcesso).getTime();
    const now = Date.now();
    const minutes = (now - lastAccess) / (1000 * 60);

    if (minutes <= 5) return 'bg-emerald-500';
    if (minutes <= 120) return 'bg-orange-400';
    return 'bg-slate-400';
  };

  const getInitials = (nome: string) => {
    return nome
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  if (user && !isOwner(user)) {
    return null;
  }

  if (isLoading) {
    return (
      <>
        <Header title="Administradores" subtitle="A carregar administradores..." />
        <div className="p-8 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Administradores"
        subtitle="Gestão de administradores do sistema"
      />

      <div className="p-8">
        {/* Barra de ferramentas */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[180px] max-w-[280px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="relative w-[130px]">
            <Filter className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as 'todos' | 'ativo' | 'inativo')
              }
              className="w-full pl-7 pr-6 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
            >
              <option value="todos">Estados</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
          <Button
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setShowCreateModal(true)}
          >
            Novo Administrador
          </Button>
        </div>

        {/* Lista de administradores */}
        {filteredAdmins.length === 0 ? (
          <EmptyState
            icon={<ShieldCheck className="w-8 h-8" />}
            title={
              searchTerm || statusFilter !== 'todos'
                ? 'Nenhum administrador encontrado'
                : 'Nenhum administrador registado'
            }
            description={
              searchTerm || statusFilter !== 'todos'
                ? 'Tente ajustar os filtros de pesquisa.'
                : 'Adicione administradores para gerir os centros de formação.'
            }
            actionLabel={
              !searchTerm && statusFilter === 'todos'
                ? 'Adicionar primeiro administrador'
                : undefined
            }
            onAction={
              !searchTerm && statusFilter === 'todos'
                ? () => setShowCreateModal(true)
                : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
            {filteredAdmins.map((admin, index) => (
              <Card
                key={admin.id}
                variant="bordered"
                padding="none"
                className="card-hover animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white font-semibold text-sm">
                        {getInitials(admin.nome)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 line-clamp-1">
                          {admin.nome}
                          {admin.id === user?.id && (
                            <span className="ml-2 text-xs text-emerald-600 font-normal">(Você)</span>
                          )}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {admin.email}
                          <span className="ml-1.5 text-xs text-slate-400">
                            · {getAdminRoleLabel(admin)}
                          </span>
                        </p>
                      </div>
                    </div>
                    {admin.id !== user?.id && (
                      <div className="relative overflow-visible">
                        <button
                          onClick={() =>
                            setMenuOpenId(menuOpenId === admin.id ? null : admin.id)
                          }
                          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-slate-400" />
                        </button>
                        {menuOpenId === admin.id && (
                          <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 animate-scale-in">
                            <button
                              onClick={() => handleToggleAtivo(admin)}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 w-full text-left"
                            >
                              {admin.ativo ? (
                                <>
                                  <UserX className="w-4 h-4" />
                                  Desativar administrador
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-4 h-4" />
                                  Ativar administrador
                                </>
                              )}
                            </button>
                            <hr className="my-1 border-slate-200" />
                            <button
                              onClick={() => {
                                setSelectedAdmin(admin);
                                setShowDeleteModal(true);
                                setMenuOpenId(null);
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

                  <div className="space-y-1 text-xs text-slate-500">
                    <p>
                      <span className="font-medium">Último acesso:</span>{' '}
                      {admin.ultimoAcesso
                        ? format(new Date(admin.ultimoAcesso), "dd/MM/yyyy 'às' HH:mm", {
                            locale: pt,
                          })
                        : 'Nunca acedeu'}
                    </p>
                    <p>
                      <span className="font-medium">Conta criada:</span>{' '}
                      {format(new Date(admin.dataCriacao), "dd/MM/yyyy", { locale: pt })}
                    </p>
                  </div>
                </div>

                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <Badge variant={admin.ativo ? 'success' : 'default'}>
                    <span
                      className={`inline-block w-2 h-2 rounded-full mr-2 ${getActivityDotClass(admin)}`}
                    />
                    {admin.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    {admin.uid ? 'Conta configurada' : 'Pendente de ativação'}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de criação */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setCreateForm({ nome: '', email: '', adminRole: 'manager' });
        }}
        title="Novo Administrador"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Nome *"
            placeholder="Nome completo do administrador"
            value={createForm.nome}
            onChange={(e) =>
              setCreateForm((prev) => ({ ...prev, nome: e.target.value }))
            }
          />
          <Input
            label="Email *"
            type="email"
            placeholder="email@exemplo.com"
            value={createForm.email}
            onChange={(e) =>
              setCreateForm((prev) => ({ ...prev, email: e.target.value }))
            }
          />
          <Select
            label="Papel *"
            value={createForm.adminRole}
            onChange={(e) =>
              setCreateForm((prev) => ({ ...prev, adminRole: e.target.value as AdminRole }))
            }
            options={[
              { value: 'manager', label: 'Gestor — Administrador sem gestão de admins' },
              { value: 'owner', label: 'Proprietário — Acesso total, pode gerir administradores' },
            ]}
          />
          <p className="text-xs text-slate-500">
            O administrador irá definir a palavra-passe no primeiro login.
          </p>
        </div>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setShowCreateModal(false);
              setCreateForm({ nome: '', email: '', adminRole: 'manager' });
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreate}
            isLoading={isCreating}
            disabled={!createForm.nome.trim() || !createForm.email.trim()}
          >
            Criar Administrador
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal de eliminação */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedAdmin(null);
        }}
        title="Eliminar Administrador"
        size="sm"
      >
        <p className="text-slate-600">
          Tem a certeza que pretende eliminar o administrador{' '}
          <strong>{selectedAdmin?.nome}</strong>? Esta ação não pode ser revertida.
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
