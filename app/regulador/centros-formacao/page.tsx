'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  Building2,
  Search,
  Filter,
  Eye,
  Bell,
  ToggleLeft,
  ToggleRight,
  MapPin,
  Mail,
  Phone,
} from 'lucide-react';

import { Header } from '../../components/layout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Modal,
  ModalFooter,
  getStatusBadgeVariant,
  getStatusLabel,
} from '../../components/ui';
import { TrainingCenter, Status, NotificationType } from '../../types';
import * as trainingCentersService from '../../lib/trainingCentersService';

export default function CentrosFormacaoPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [centers, setCenters] = useState<TrainingCenter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'todos'>('todos');

  // Modal de notificação
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<TrainingCenter | null>(null);
  const [notifyType, setNotifyType] = useState<NotificationType>('informacao');
  const [notifySubject, setNotifySubject] = useState('');
  const [notifyMessage, setNotifyMessage] = useState('');
  const [isSendingNotification, setIsSendingNotification] = useState(false);

  // Modal de mudança de estado
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<Status>('ativo');
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  useEffect(() => {
    loadCenters();
  }, []);

  const loadCenters = async () => {
    setIsLoading(true);
    try {
      const data = await trainingCentersService.getAllTrainingCenters();
      setCenters(data);
    } catch (error) {
      console.error('Erro ao carregar centros de formação:', error);
      toast.error('Erro', 'Não foi possível carregar a lista de centros de formação.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCenters = useMemo(
    () =>
      centers.filter((center) => {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
          center.nome.toLowerCase().includes(term) ||
          center.localidade.toLowerCase().includes(term) ||
          center.email.toLowerCase().includes(term) ||
          center.nif.toLowerCase().includes(term);
        const matchesStatus = statusFilter === 'todos' || center.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [centers, searchTerm, statusFilter]
  );

  const handleOpenNotifyModal = (center: TrainingCenter) => {
    setSelectedCenter(center);
    setNotifyType('informacao');
    setNotifySubject('');
    setNotifyMessage('');
    setShowNotifyModal(true);
  };

  const handleSendNotification = async () => {
    if (!selectedCenter || !user || !notifySubject.trim() || !notifyMessage.trim()) {
      toast.error('Campos obrigatórios', 'Preencha o assunto e a mensagem.');
      return;
    }

    setIsSendingNotification(true);
    try {
      await trainingCentersService.sendNotification({
        centroFormacaoId: selectedCenter.id,
        centroFormacaoNome: selectedCenter.nome,
        reguladorId: user.id,
        reguladorNome: user.nome,
        tipo: notifyType,
        assunto: notifySubject,
        mensagem: notifyMessage,
      });

      toast.success(
        'Notificação enviada',
        `Notificação enviada para ${selectedCenter.nome} com sucesso.`
      );
      setShowNotifyModal(false);
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      toast.error('Erro', 'Não foi possível enviar a notificação.');
    } finally {
      setIsSendingNotification(false);
    }
  };

  const handleOpenStatusModal = (center: TrainingCenter) => {
    setSelectedCenter(center);
    setNewStatus(center.status === 'ativo' ? 'arquivado' : 'ativo');
    setShowStatusModal(true);
  };

  const handleChangeStatus = async () => {
    if (!selectedCenter) return;

    setIsChangingStatus(true);
    try {
      await trainingCentersService.updateTrainingCenterStatus(selectedCenter.id, newStatus);

      setCenters((prev) =>
        prev.map((c) =>
          c.id === selectedCenter.id ? { ...c, status: newStatus } : c
        )
      );

      if (user) {
        const notifyTypeForStatus: NotificationType = newStatus === 'ativo' ? 'ativacao' : 'suspensao';
        await trainingCentersService.sendNotification({
          centroFormacaoId: selectedCenter.id,
          centroFormacaoNome: selectedCenter.nome,
          reguladorId: user.id,
          reguladorNome: user.nome,
          tipo: notifyTypeForStatus,
          assunto: newStatus === 'ativo'
            ? 'Centro de Formação Ativado'
            : 'Centro de Formação Suspenso/Arquivado',
          mensagem: newStatus === 'ativo'
            ? `O seu centro de formação "${selectedCenter.nome}" foi ativado pelo regulador.`
            : `O seu centro de formação "${selectedCenter.nome}" foi suspenso/arquivado pelo regulador. Contacte o regulador para mais informações.`,
        });
      }

      toast.success(
        'Estado atualizado',
        `${selectedCenter.nome} foi ${newStatus === 'ativo' ? 'ativado' : 'arquivado'} com sucesso.`
      );
      setShowStatusModal(false);
    } catch (error) {
      console.error('Erro ao alterar estado:', error);
      toast.error('Erro', 'Não foi possível alterar o estado do centro.');
    } finally {
      setIsChangingStatus(false);
    }
  };

  const getNotifyTypeLabel = (tipo: NotificationType) => {
    const labels: Record<NotificationType, string> = {
      informacao: 'Informação',
      aviso: 'Aviso',
      urgente: 'Urgente',
      suspensao: 'Suspensão',
      ativacao: 'Ativação',
    };
    return labels[tipo];
  };

  if (isLoading) {
    return (
      <>
        <Header title="Centros de Formação" subtitle="A carregar centros..." />
        <div className="p-8 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-sky-500 rounded-full animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Centros de Formação"
        subtitle={`${centers.length} centro(s) registado(s)`}
      />

      <div className="p-8">
        {/* Filtros */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-[320px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar por nome, localidade, email ou NIF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div className="relative w-[140px]">
            <Filter className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Status | 'todos')}
              className="w-full pl-7 pr-6 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none cursor-pointer"
            >
              <option value="todos">Todos os estados</option>
              <option value="ativo">Ativo</option>
              <option value="rascunho">Rascunho</option>
              <option value="arquivado">Arquivado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        {/* Lista de centros */}
        {filteredCenters.length === 0 ? (
          <EmptyState
            icon={<Building2 className="w-8 h-8" />}
            title={
              searchTerm || statusFilter !== 'todos'
                ? 'Nenhum centro encontrado'
                : 'Nenhum centro de formação registado'
            }
            description={
              searchTerm || statusFilter !== 'todos'
                ? 'Tente ajustar os filtros de pesquisa.'
                : 'Ainda não existem centros de formação no sistema.'
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCenters.map((center, index) => (
              <Card
                key={center.id}
                variant="bordered"
                padding="none"
                className="card-hover animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center text-white">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 line-clamp-1">
                          {center.nome}
                        </h3>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {center.localidade}, {center.pais}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500 mb-4">
                    <p className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      {center.email}
                    </p>
                    <p className="flex items-center gap-1.5 truncate">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      {center.telefone}
                    </p>
                    <p className="text-xs">
                      <span className="font-medium">NIF:</span> {center.nif}
                    </p>
                    <p className="text-xs">
                      <span className="font-medium">Responsável:</span> {center.responsavel}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/regulador/centros-formacao/${center.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                        Ver
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenNotifyModal(center)}
                      leftIcon={<Bell className="w-3.5 h-3.5" />}
                    >
                      Notificar
                    </Button>
                    <Button
                      variant={center.status === 'ativo' ? 'ghost' : 'primary'}
                      size="sm"
                      onClick={() => handleOpenStatusModal(center)}
                      leftIcon={
                        center.status === 'ativo'
                          ? <ToggleRight className="w-3.5 h-3.5" />
                          : <ToggleLeft className="w-3.5 h-3.5" />
                      }
                    >
                      {center.status === 'ativo' ? 'Suspender' : 'Ativar'}
                    </Button>
                  </div>
                </div>

                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <Badge variant={getStatusBadgeVariant(center.status)}>
                    {getStatusLabel(center.status)}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    Desde{' '}
                    {format(new Date(center.dataCriacao), "MMM yyyy", { locale: pt })}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Notificação */}
      <Modal
        isOpen={showNotifyModal}
        onClose={() => setShowNotifyModal(false)}
        title={`Notificar ${selectedCenter?.nome || ''}`}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tipo de Notificação
            </label>
            <select
              value={notifyType}
              onChange={(e) => setNotifyType(e.target.value as NotificationType)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="informacao">Informação</option>
              <option value="aviso">Aviso</option>
              <option value="urgente">Urgente</option>
              <option value="suspensao">Suspensão</option>
              <option value="ativacao">Ativação</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Assunto
            </label>
            <input
              type="text"
              value={notifySubject}
              onChange={(e) => setNotifySubject(e.target.value)}
              placeholder="Assunto da notificação..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mensagem
            </label>
            <textarea
              value={notifyMessage}
              onChange={(e) => setNotifyMessage(e.target.value)}
              placeholder="Escreva a mensagem..."
              rows={5}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 text-sm text-slate-600">
            <Bell className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>
              Tipo selecionado: <strong>{getNotifyTypeLabel(notifyType)}</strong> — Esta notificação será
              enviada ao centro <strong>{selectedCenter?.nome}</strong>.
            </span>
          </div>
        </div>

        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowNotifyModal(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSendNotification}
            isLoading={isSendingNotification}
          >
            Enviar Notificação
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal de Mudança de Estado */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Alterar Estado do Centro"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            Tem a certeza que pretende{' '}
            <strong>{newStatus === 'ativo' ? 'ativar' : 'suspender/arquivar'}</strong>{' '}
            o centro <strong>{selectedCenter?.nome}</strong>?
          </p>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Novo Estado
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as Status)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="ativo">Ativo</option>
              <option value="arquivado">Arquivado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 text-sm text-amber-700">
            <Bell className="w-4 h-4 flex-shrink-0" />
            <span>
              Será enviada uma notificação automática ao centro sobre a alteração de estado.
            </span>
          </div>
        </div>

        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowStatusModal(false)}>
            Cancelar
          </Button>
          <Button
            variant={newStatus === 'ativo' ? 'primary' : 'danger'}
            onClick={handleChangeStatus}
            isLoading={isChangingStatus}
          >
            {newStatus === 'ativo' ? 'Ativar Centro' : 'Alterar Estado'}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
