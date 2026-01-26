'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Header } from '../../components/layout';
import { Button, Card, CardContent, Badge, getStatusBadgeVariant, getStatusLabel, EmptyState, Modal, ModalFooter } from '../../components/ui';
import { Plus, Search, UserCircle, Mail, Phone, Award, MoreVertical, Edit, Trash2, Eye, Filter, Archive } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Trainer, Status } from '../../types';
import * as trainersService from '../../lib/trainersService';

export default function FormadoresPage() {
  const { center, user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'todos'>('todos');
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMenu, setShowMenu] = useState<string | null>(null);

  // Verificar se é admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
      toast.error('Acesso negado', 'Apenas o responsável pode gerir formadores.');
    }
  }, [user, router, toast]);

  useEffect(() => {
    if (center?.id && user?.role === 'admin') {
      loadTrainers();
    }
  }, [center?.id, user?.role]);

  const loadTrainers = async () => {
    if (!center?.id) return;
    
    setIsLoading(true);
    try {
      const data = await trainersService.getTrainers(center.id);
      setTrainers(data);
    } catch (error) {
      console.error('Erro ao carregar formadores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTrainers = trainers.filter((trainer) => {
    const matchesSearch =
      trainer.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.nif.includes(searchTerm);
    const matchesStatus = statusFilter === 'todos' || trainer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async () => {
    if (selectedTrainer) {
      try {
        await trainersService.deleteTrainer(selectedTrainer.id);
        setTrainers((prev) => prev.filter((t) => t.id !== selectedTrainer.id));
        toast.success('Formador eliminado', `${selectedTrainer.nome} foi eliminado com sucesso.`);
        setShowDeleteModal(false);
        setSelectedTrainer(null);
      } catch (error) {
        console.error('Erro ao eliminar formador:', error);
        toast.error('Erro', 'Não foi possível eliminar o formador. Tente novamente.');
      }
    }
  };

  const handleArchive = async (trainer: Trainer) => {
    try {
      await trainersService.archiveTrainer(trainer.id);
      setTrainers((prev) =>
        prev.map((t) => (t.id === trainer.id ? { ...t, status: 'arquivado' as Status } : t))
      );
      toast.success('Formador arquivado', `${trainer.nome} foi arquivado.`);
      setShowMenu(null);
    } catch (error) {
      console.error('Erro ao arquivar formador:', error);
      toast.error('Erro', 'Não foi possível arquivar o formador. Tente novamente.');
    }
  };

  const handleActivate = async (trainer: Trainer) => {
    try {
      await trainersService.activateTrainer(trainer.id);
      setTrainers((prev) =>
        prev.map((t) => (t.id === trainer.id ? { ...t, status: 'ativo' as Status } : t))
      );
      toast.success('Formador ativado', `${trainer.nome} foi ativado.`);
      setShowMenu(null);
    } catch (error) {
      console.error('Erro ao ativar formador:', error);
      toast.error('Erro', 'Não foi possível ativar o formador. Tente novamente.');
    }
  };

  // Verificar permissões antes de renderizar
  if (user && user.role !== 'admin') {
    return null; // Será redirecionado pelo useEffect
  }

  if (isLoading) {
    return (
      <>
        <Header title="Formadores" subtitle="A carregar..." />
        <div className="p-8 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Formadores"
        subtitle="Gerir formadores do centro de formação"
      />

      <div className="p-8">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar formadores..."
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
                <option value="ativo">Ativo</option>
                <option value="arquivado">Arquivado</option>
              </select>
            </div>
            <Link href="/formadores/novo">
              <Button leftIcon={<Plus className="w-4 h-4" />}>
                Novo Formador
              </Button>
            </Link>
          </div>
        </div>

        {/* Trainers List */}
        {filteredTrainers.length === 0 ? (
          <EmptyState
            icon={<UserCircle className="w-8 h-8" />}
            title={searchTerm || statusFilter !== 'todos' ? 'Nenhum formador encontrado' : 'Nenhum formador registado'}
            description={
              searchTerm || statusFilter !== 'todos'
                ? 'Tente ajustar os filtros de pesquisa'
                : 'Registe formadores para gerir a equipa do centro de formação'
            }
            actionLabel={!searchTerm && statusFilter === 'todos' ? 'Registar primeiro formador' : undefined}
            onAction={!searchTerm && statusFilter === 'todos' ? () => window.location.href = '/formadores/novo' : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTrainers.map((trainer, index) => (
              <Card
                key={trainer.id}
                variant="bordered"
                padding="none"
                className={`card-hover animate-fade-in`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-lg font-bold">
                        {trainer.nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 line-clamp-1">
                          {trainer.nome}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {trainer.certificacaoPedagogica} {trainer.numeroCertificacao}
                        </p>
                      </div>
                    </div>
                    <div className="relative overflow-visible">
                      <button
                        onClick={() => setShowMenu(showMenu === trainer.id ? null : trainer.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-slate-400" />
                      </button>
                      {showMenu === trainer.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 animate-scale-in">
                          <Link
                            href={`/formadores/${trainer.id}`}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Eye className="w-4 h-4" />
                            Ver detalhes
                          </Link>
                          <Link
                            href={`/formadores/${trainer.id}/editar`}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Edit className="w-4 h-4" />
                            Editar
                          </Link>
                          <hr className="my-1 border-slate-200" />
                          {trainer.status !== 'ativo' && (
                            <button
                              onClick={() => handleActivate(trainer)}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50 w-full text-left"
                            >
                              Ativar formador
                            </button>
                          )}
                          {trainer.status === 'ativo' && (
                            <button
                              onClick={() => handleArchive(trainer)}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 w-full text-left"
                            >
                              <Archive className="w-4 h-4" />
                              Arquivar
                            </button>
                          )}
                          <hr className="my-1 border-slate-200" />
                          <button
                            onClick={() => {
                              setSelectedTrainer(trainer);
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
                      <span className="truncate">{trainer.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{trainer.telefone || 'Não definido'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      <span>{trainer.experienciaAnos} anos de experiência</span>
                    </div>
                  </div>

                  {trainer.areasCompetencia.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {trainer.areasCompetencia.slice(0, 3).map((area, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full"
                        >
                          {area}
                        </span>
                      ))}
                      {trainer.areasCompetencia.length > 3 && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                          +{trainer.areasCompetencia.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <Badge variant={getStatusBadgeVariant(trainer.status)}>
                    {getStatusLabel(trainer.status)}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    Desde {format(new Date(trainer.dataCriacao), "MMM yyyy", { locale: pt })}
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
          setSelectedTrainer(null);
        }}
        title="Eliminar Formador"
        size="sm"
      >
        <p className="text-slate-600">
          Tem a certeza que pretende eliminar o formador <strong>{selectedTrainer?.nome}</strong>?
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
