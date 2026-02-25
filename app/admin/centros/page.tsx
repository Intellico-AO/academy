'use client';

import {
  AlertTriangle,
  ArrowUpDown,
  Bell,
  Building2,
  ChevronDown,
  Eye,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Send,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Header } from '../../components/layout';
import {
  Badge,
  getStatusBadgeVariant,
  getStatusLabel,
} from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import * as centersService from '../../lib/trainingCentersService';
import type { Status, TrainingCenter } from '../../types';

type SortField = 'nome' | 'localidade' | 'status' | 'dataCriacao';
type SortDirection = 'asc' | 'desc';

export default function CentrosFormacaoPage() {
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();

  const [centers, setCenters] = useState<TrainingCenter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [sortField, setSortField] = useState<SortField>('nome');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Modal: Mudar estado
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<TrainingCenter | null>(
    null
  );
  const [newStatus, setNewStatus] = useState<Status>('ativo');
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  // Modal: Notificar
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifySubject, setNotifySubject] = useState('');
  const [notifyMessage, setNotifyMessage] = useState('');
  const [isSendingNotification, setIsSendingNotification] = useState(false);

  const loadCenters = async () => {
    setIsLoading(true);
    try {
      const data = await centersService.getAllTrainingCenters();
      setCenters(data);
    } catch (error) {
      console.error('Erro ao carregar centros:', error);
      toast.error('Erro', 'Não foi possível carregar os centros de formação.');
    } finally {
      setIsLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: carregamento inicial
  useEffect(() => {
    loadCenters();
  }, []);

  const filteredAndSortedCenters = useMemo(() => {
    let result = [...centers];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.nome.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term) ||
          c.localidade.toLowerCase().includes(term) ||
          c.nif.includes(term) ||
          c.responsavel.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'todos') {
      result = result.filter((c) => c.status === statusFilter);
    }

    result.sort((a, b) => {
      const aVal = a[sortField] ?? '';
      const bVal = b[sortField] ?? '';
      const comparison = String(aVal).localeCompare(String(bVal), 'pt');
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [centers, searchTerm, statusFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Abrir modal de mudança de estado
  const openStatusModal = (center: TrainingCenter) => {
    setSelectedCenter(center);
    setNewStatus(center.status);
    setShowStatusModal(true);
  };

  const handleChangeStatus = async () => {
    if (!selectedCenter || !user) return;
    if (newStatus === selectedCenter.status) {
      toast.warning('Sem alteração', 'O estado selecionado é igual ao atual.');
      return;
    }

    setIsChangingStatus(true);
    try {
      await centersService.updateTrainingCenterStatus(
        selectedCenter.id,
        newStatus
      );
      await centersService.createStatusChangeLog(
        selectedCenter.id,
        selectedCenter.nome,
        selectedCenter.status,
        newStatus,
        user.nome
      );

      setCenters((prev) =>
        prev.map((c) =>
          c.id === selectedCenter.id
            ? {
                ...c,
                status: newStatus,
                dataAtualizacao: new Date().toISOString(),
              }
            : c
        )
      );

      toast.success(
        'Estado alterado',
        `O centro "${selectedCenter.nome}" foi atualizado para "${getStatusLabel(newStatus)}".`
      );
      setShowStatusModal(false);
    } catch (error) {
      console.error('Erro ao alterar estado:', error);
      toast.error('Erro', 'Não foi possível alterar o estado do centro.');
    } finally {
      setIsChangingStatus(false);
    }
  };

  // Abrir modal de notificação
  const openNotifyModal = (center: TrainingCenter) => {
    setSelectedCenter(center);
    setNotifySubject('');
    setNotifyMessage('');
    setShowNotifyModal(true);
  };

  const handleSendNotification = async () => {
    if (!selectedCenter || !user) return;
    if (!notifySubject.trim() || !notifyMessage.trim()) {
      toast.warning('Campos obrigatórios', 'Preencha o assunto e a mensagem.');
      return;
    }

    setIsSendingNotification(true);
    try {
      await centersService.createNotificationLog(
        selectedCenter.id,
        selectedCenter.nome,
        notifySubject,
        notifyMessage,
        user.nome
      );

      toast.success(
        'Notificação registada',
        `Notificação enviada para "${selectedCenter.nome}" com sucesso.`
      );
      setShowNotifyModal(false);
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      toast.error('Erro', 'Não foi possível enviar a notificação.');
    } finally {
      setIsSendingNotification(false);
    }
  };

  const statusCounts = useMemo(() => {
    const counts = {
      todos: centers.length,
      ativo: 0,
      rascunho: 0,
      arquivado: 0,
      cancelado: 0,
    };
    for (const c of centers) {
      counts[c.status] = (counts[c.status] || 0) + 1;
    }
    return counts;
  }, [centers]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  return (
    <>
      <Header
        title="Centros de Formação"
        subtitle="Gestão e monitorização de todos os centros de formação registados"
      />

      <div className="p-8 space-y-6">
        {/* Cartões de resumo */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Todos', key: 'todos' as const, color: 'bg-slate-500' },
            { label: 'Ativos', key: 'ativo' as const, color: 'bg-emerald-500' },
            {
              label: 'Rascunho',
              key: 'rascunho' as const,
              color: 'bg-amber-500',
            },
            {
              label: 'Arquivados',
              key: 'arquivado' as const,
              color: 'bg-slate-400',
            },
            {
              label: 'Cancelados',
              key: 'cancelado' as const,
              color: 'bg-rose-500',
            },
          ].map((item) => (
            <button
              type="button"
              key={item.key}
              onClick={() => setStatusFilter(item.key)}
              className={`
                p-4 rounded-xl border transition-all duration-200 text-left
                ${
                  statusFilter === item.key
                    ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="text-sm font-medium text-slate-600">
                  {item.label}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {statusCounts[item.key]}
              </p>
            </button>
          ))}
        </div>

        {/* Barra de pesquisa e filtros */}
        <Card padding="md">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Pesquisar por nome, email, localidade, NIF ou responsável..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="
                  w-full pl-10 pr-4 py-2.5
                  bg-slate-50 border border-slate-200 rounded-lg
                  text-sm text-slate-900
                  placeholder:text-slate-400
                  focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                  transition-all duration-200
                "
              />
            </div>
            <Button
              variant="outline"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={loadCenters}
              disabled={isLoading}
            >
              Atualizar
            </Button>
          </div>
        </Card>

        {/* Tabela */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner
              size="lg"
              message="A carregar centros de formação..."
            />
          </div>
        ) : filteredAndSortedCenters.length === 0 ? (
          <EmptyState
            icon={<Building2 className="w-8 h-8" />}
            title="Nenhum centro encontrado"
            description={
              searchTerm || statusFilter !== 'todos'
                ? 'Tente ajustar os filtros de pesquisa.'
                : 'Ainda não existem centros de formação registados.'
            }
          />
        ) : (
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <SortableHeader
                      label="Centro"
                      field="nome"
                      currentField={sortField}
                      direction={sortDirection}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Localidade"
                      field="localidade"
                      currentField={sortField}
                      direction={sortDirection}
                      onSort={handleSort}
                    />
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Responsável
                    </th>
                    <SortableHeader
                      label="Estado"
                      field="status"
                      currentField={sortField}
                      direction={sortDirection}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Data Criação"
                      field="dataCriacao"
                      currentField={sortField}
                      direction={sortDirection}
                      onSort={handleSort}
                    />
                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAndSortedCenters.map((center) => (
                    <tr
                      key={center.id}
                      className="hover:bg-slate-50/50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">
                              {center.nome}
                            </p>
                            <p className="text-xs text-slate-500">
                              NIF: {center.nif}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">
                            {center.localidade}, {center.pais}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{center.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            {center.telefone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-700">
                          {center.responsavel}
                        </p>
                        <p className="text-xs text-slate-500">
                          {center.emailResponsavel}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusBadgeVariant(center.status)}>
                          {getStatusLabel(center.status)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(center.dataCriacao)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              router.push(`/admin/centros/${center.id}`)
                            }
                            className="p-2 rounded-lg text-slate-500 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                            title="Ver detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openNotifyModal(center)}
                            className="p-2 rounded-lg text-slate-500 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                            title="Notificar"
                          >
                            <Bell className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openStatusModal(center)}
                            className="p-2 rounded-lg text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                            title="Mudar estado"
                          >
                            <ArrowUpDown className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/50">
              <p className="text-sm text-slate-500">
                {filteredAndSortedCenters.length} de {centers.length} centro
                {centers.length !== 1 ? 's' : ''} apresentado
                {filteredAndSortedCenters.length !== 1 ? 's' : ''}
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Modal: Mudar Estado */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Alterar Estado do Centro"
        size="sm"
      >
        {selectedCenter && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium text-slate-900">
                {selectedCenter.nome}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                NIF: {selectedCenter.nif}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-600 mb-2">
                Estado atual:{' '}
                <Badge variant={getStatusBadgeVariant(selectedCenter.status)}>
                  {getStatusLabel(selectedCenter.status)}
                </Badge>
              </p>
            </div>

            <Select
              label="Novo estado"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as Status)}
              options={[
                { value: 'ativo', label: 'Ativo' },
                { value: 'rascunho', label: 'Rascunho' },
                { value: 'arquivado', label: 'Arquivado' },
                { value: 'cancelado', label: 'Cancelado' },
              ]}
            />

            {newStatus === 'cancelado' && (
              <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-rose-700">
                  Ao cancelar um centro de formação, os utilizadores associados
                  poderão perder acesso ao sistema.
                </p>
              </div>
            )}

            <ModalFooter>
              <Button
                variant="ghost"
                onClick={() => setShowStatusModal(false)}
                disabled={isChangingStatus}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleChangeStatus}
                isLoading={isChangingStatus}
                leftIcon={<ArrowUpDown className="w-4 h-4" />}
              >
                Alterar Estado
              </Button>
            </ModalFooter>
          </div>
        )}
      </Modal>

      {/* Modal: Notificar */}
      <Modal
        isOpen={showNotifyModal}
        onClose={() => setShowNotifyModal(false)}
        title="Enviar Notificação"
        size="md"
      >
        {selectedCenter && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <p className="text-sm font-medium text-slate-900">
                  {selectedCenter.nome}
                </p>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Destinatário: {selectedCenter.emailResponsavel}
              </p>
            </div>

            <div>
              <label
                htmlFor="notify-subject"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Assunto
              </label>
              <input
                id="notify-subject"
                type="text"
                value={notifySubject}
                onChange={(e) => setNotifySubject(e.target.value)}
                placeholder="Ex: Atualização de documentação pendente"
                className="
                  w-full px-3.5 py-2.5
                  bg-white border border-slate-300 rounded-lg
                  text-slate-900 text-sm
                  placeholder:text-slate-400
                  focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                  transition-all duration-200
                "
              />
            </div>

            <div>
              <label
                htmlFor="notify-message"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Mensagem
              </label>
              <textarea
                id="notify-message"
                value={notifyMessage}
                onChange={(e) => setNotifyMessage(e.target.value)}
                placeholder="Escreva a mensagem a enviar ao centro de formação..."
                rows={5}
                className="
                  w-full px-3.5 py-2.5
                  bg-white border border-slate-300 rounded-lg
                  text-slate-900 text-sm
                  placeholder:text-slate-400
                  focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                  transition-all duration-200
                  resize-none
                "
              />
            </div>

            <ModalFooter>
              <Button
                variant="ghost"
                onClick={() => setShowNotifyModal(false)}
                disabled={isSendingNotification}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSendNotification}
                isLoading={isSendingNotification}
                leftIcon={<Send className="w-4 h-4" />}
              >
                Enviar Notificação
              </Button>
            </ModalFooter>
          </div>
        )}
      </Modal>
    </>
  );
}

// Componente auxiliar para cabeçalhos ordenáveis
function SortableHeader({
  label,
  field,
  currentField,
  direction,
  onSort,
}: {
  label: string;
  field: SortField;
  currentField: SortField;
  direction: SortDirection;
  onSort: (field: SortField) => void;
}) {
  const isActive = currentField === field;

  return (
    <th className="text-left px-6 py-3">
      <button
        type="button"
        onClick={() => onSort(field)}
        className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700 transition-colors"
      >
        {label}
        <ChevronDown
          className={`w-3 h-3 transition-transform ${
            isActive && direction === 'asc' ? 'rotate-180' : ''
          } ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}
        />
      </button>
    </th>
  );
}
