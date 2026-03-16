'use client';

import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  Archive,
  BookOpen,
  Calendar,
  Edit,
  Eye,
  Filter,
  GraduationCap,
  Mail,
  MoreVertical,
  Plus,
  Search,
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
  CardContent,
  EmptyState,
  Modal,
  ModalFooter,
} from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import * as authService from '../../lib/authService';
import * as formandosService from '../../lib/formandosService';
import type { UserAccount } from '../../types';

export default function FormandosPage() {
  const { center, user } = useAuth();
  const { state } = useApp();
  const router = useRouter();
  const toast = useToast();
  const [formandos, setFormandos] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'todos' | 'ativo' | 'inativo'
  >('todos');
  const [selectedFormando, setSelectedFormando] = useState<UserAccount | null>(
    null
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMenu, setShowMenu] = useState<string | null>(null);

  // Verificar se é gestor
  useEffect(() => {
    if (user && user.role !== 'responsavel' && user.role !== 'assistente') {
      router.push('/');
      toast.error('Acesso negado', 'Apenas o responsável ou assistente pode gerir formandos.');
    }
  }, [user, router, toast]);

  useEffect(() => {
    if (center?.id) {
      loadFormandos();
    }
  }, [center?.id]);

  const loadFormandos = async () => {
    if (!center?.id) return;

    setIsLoading(true);
    try {
      const data = await formandosService.getFormandos(center.id);
      setFormandos(data);
    } catch (error) {
      console.error('Erro ao carregar formandos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFormandos = formandos.filter((formando) => {
    const matchesSearch =
      formando.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formando.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'todos' ||
      (statusFilter === 'ativo' && formando.ativo) ||
      (statusFilter === 'inativo' && !formando.ativo);
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async () => {
    if (selectedFormando) {
      try {
        await authService.deleteUser(selectedFormando.id);
        setFormandos((prev) =>
          prev.filter((f) => f.id !== selectedFormando.id)
        );
        toast.success(
          'Formando eliminado',
          `${selectedFormando.nome} foi eliminado com sucesso.`
        );
        setShowDeleteModal(false);
        setSelectedFormando(null);
      } catch (error) {
        console.error('Erro ao eliminar formando:', error);
        toast.error('Erro', 'Não foi possível eliminar o formando.');
      }
    }
  };

  const handleArchive = async (formando: UserAccount) => {
    try {
      await formandosService.archiveFormando(formando.id);
      setFormandos((prev) =>
        prev.map((f) => (f.id === formando.id ? { ...f, ativo: false } : f))
      );
      toast.success('Formando desativado', `${formando.nome} foi desativado.`);
      setShowMenu(null);
    } catch (error) {
      console.error('Erro ao desativar formando:', error);
      toast.error('Erro', 'Não foi possível desativar o formando.');
    }
  };

  const handleActivate = async (formando: UserAccount) => {
    try {
      await formandosService.activateFormando(formando.id);
      setFormandos((prev) =>
        prev.map((f) => (f.id === formando.id ? { ...f, ativo: true } : f))
      );
      toast.success('Formando ativado', `${formando.nome} foi ativado.`);
      setShowMenu(null);
    } catch (error) {
      console.error('Erro ao ativar formando:', error);
      toast.error('Erro', 'Não foi possível ativar o formando.');
    }
  };

  // Contar cursos inscritos
  const getFormandoCursos = (formandoId: string) => {
    return state.inscricoes.filter(
      (i) => i.formandoId === formandoId && i.status === 'ativo'
    ).length;
  };

  if (user && user.role !== 'responsavel' && user.role !== 'assistente') {
    return null;
  }

  if (isLoading) {
    return (
      <>
        <Header title="Formandos" subtitle="A carregar..." breadcrumbs={[{ label: 'Formandos' }]} />
        <div className="p-8 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Formandos"
        subtitle="Gerir formandos inscritos no centro de formação"
        breadcrumbs={[{ label: 'Formandos' }]}
      />

      <div className="p-8">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar formandos..."
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
            <Link href="/formandos/novo">
              <Button leftIcon={<Plus className="w-4 h-4" />}>
                Novo Formando
              </Button>
            </Link>
          </div>
        </div>

        {/* Formandos List */}
        {filteredFormandos.length === 0 ? (
          <EmptyState
            icon={<GraduationCap className="w-8 h-8" />}
            title={
              searchTerm || statusFilter !== 'todos'
                ? 'Nenhum formando encontrado'
                : 'Nenhum formando registado'
            }
            description={
              searchTerm || statusFilter !== 'todos'
                ? 'Tente ajustar os filtros de pesquisa'
                : 'Registe formandos e inscreva-os em cursos do centro de formação'
            }
            actionLabel={
              !searchTerm && statusFilter === 'todos'
                ? 'Registar primeiro formando'
                : undefined
            }
            onAction={
              !searchTerm && statusFilter === 'todos'
                ? () => router.push('/formandos/novo')
                : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredFormandos.map((formando, index) => {
              const numCursos = getFormandoCursos(formando.id);

              return (
                <Card
                  key={formando.id}
                  variant="bordered"
                  padding="none"
                  className="card-hover animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-lg font-bold">
                          {formando.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 line-clamp-1">
                            {formando.nome}
                          </h3>
                          <p className="text-sm text-slate-500">Formando</p>
                        </div>
                      </div>
                      <div className="relative overflow-visible">
                        <button
                          onClick={() =>
                            setShowMenu(
                              showMenu === formando.id ? null : formando.id
                            )
                          }
                          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-slate-400" />
                        </button>
                        {showMenu === formando.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 animate-scale-in">
                            <Link
                              href={`/formandos/${formando.id}`}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <Eye className="w-4 h-4" />
                              Ver detalhes
                            </Link>
                            <Link
                              href={`/formandos/${formando.id}/editar`}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <Edit className="w-4 h-4" />
                              Editar
                            </Link>
                            <hr className="my-1 border-slate-200" />
                            {formando.ativo ? (
                              <button
                                onClick={() => handleArchive(formando)}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 w-full text-left"
                              >
                                <Archive className="w-4 h-4" />
                                Desativar
                              </button>
                            ) : (
                              <button
                                onClick={() => handleActivate(formando)}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50 w-full text-left"
                              >
                                Ativar
                              </button>
                            )}
                            <hr className="my-1 border-slate-200" />
                            <button
                              onClick={() => {
                                setSelectedFormando(formando);
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

                    <div className="space-y-2 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{formando.email}</span>
                      </div>
                      {formando.dataNascimento && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {format(
                              new Date(formando.dataNascimento),
                              "d 'de' MMMM 'de' yyyy",
                              { locale: pt }
                            )}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <span>
                          {numCursos}{' '}
                          {numCursos === 1
                            ? 'curso inscrito'
                            : 'cursos inscritos'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <Badge variant={formando.ativo ? 'success' : 'default'}>
                      {formando.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      Desde{' '}
                      {format(new Date(formando.dataCriacao), 'MMM yyyy', {
                        locale: pt,
                      })}
                    </span>
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
          setSelectedFormando(null);
        }}
        title="Eliminar Formando"
        size="sm"
      >
        <p className="text-slate-600">
          Tem a certeza que pretende eliminar o formando{' '}
          <strong>{selectedFormando?.nome}</strong>? Esta ação não pode ser
          revertida.
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
