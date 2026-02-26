'use client';

import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpDown,
  Bell,
  BookOpen,
  Building2,
  Calendar,
  Clock,
  Globe,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Send,
  Shield,
  User,
  Users,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header } from '../../../components/layout';
import {
  Badge,
  getStatusBadgeVariant,
  getStatusLabel,
} from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Modal, ModalFooter } from '../../../components/ui/Modal';
import { Select } from '../../../components/ui/Select';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import * as centersService from '../../../lib/trainingCentersService';
import type { Status, TrainingCenter, UserAccount } from '../../../types';

export default function CentroDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();
  const centerId = params.id as string;

  const [center, setCenter] = useState<TrainingCenter | null>(null);
  const [stats, setStats] = useState<centersService.CenterStats | null>(null);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal: Mudar estado
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<Status>('ativo');
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  // Modal: Notificar
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifySubject, setNotifySubject] = useState('');
  const [notifyMessage, setNotifyMessage] = useState('');
  const [isSendingNotification, setIsSendingNotification] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [centerData, statsData, usersData] = await Promise.all([
          centersService.getTrainingCenter(centerId),
          centersService.getCenterStats(centerId),
          centersService.getUsersByCenter(centerId),
        ]);

        if (!centerData) {
          toast.error('Erro', 'Centro de formação não encontrado.');
          router.push('/admin/centros');
          return;
        }

        setCenter(centerData);
        setStats(statsData);
        setUsers(usersData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro', 'Não foi possível carregar os dados do centro.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [centerId, router, toast]);

  const handleChangeStatus = async () => {
    if (!center || !user) return;
    if (newStatus === center.status) {
      toast.warning('Sem alteração', 'O estado selecionado é igual ao atual.');
      return;
    }

    setIsChangingStatus(true);
    try {
      await centersService.updateTrainingCenterStatus(center.id, newStatus);
      await centersService.createStatusChangeLog(
        center.id,
        center.nome,
        center.status,
        newStatus,
        user.nome
      );

      setCenter({
        ...center,
        status: newStatus,
        dataAtualizacao: new Date().toISOString(),
      });
      toast.success(
        'Estado alterado',
        `Estado atualizado para "${getStatusLabel(newStatus)}".`
      );
      setShowStatusModal(false);
    } catch (error) {
      console.error('Erro ao alterar estado:', error);
      toast.error('Erro', 'Não foi possível alterar o estado.');
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleSendNotification = async () => {
    if (!center || !user) return;
    if (!notifySubject.trim() || !notifyMessage.trim()) {
      toast.warning('Campos obrigatórios', 'Preencha o assunto e a mensagem.');
      return;
    }

    setIsSendingNotification(true);
    try {
      await centersService.createNotificationLog(
        center.id,
        center.nome,
        notifySubject,
        notifyMessage,
        user.nome
      );

      toast.success(
        'Notificação registada',
        'Notificação enviada com sucesso.'
      );
      setShowNotifyModal(false);
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      toast.error('Erro', 'Não foi possível enviar a notificação.');
    } finally {
      setIsSendingNotification(false);
    }
  };

  const openStatusModal = () => {
    if (center) {
      setNewStatus(center.status);
      setShowStatusModal(true);
    }
  };

  const openNotifyModal = () => {
    setNotifySubject('');
    setNotifyMessage('');
    setShowNotifyModal(true);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'gestor':
        return 'Gestor';
      case 'formador':
        return 'Formador';
      default:
        return role;
    }
  };

  if (isLoading) {
    return (
      <>
        <Header title="Centro de Formação" subtitle="A carregar detalhes..." />
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" message="A carregar dados do centro..." />
        </div>
      </>
    );
  }

  if (!center) {
    return null;
  }

  return (
    <>
      <Header title={center.nome} subtitle="Detalhes do centro de formação" />

      <div className="p-8 space-y-6">
        {/* Barra de ações */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Button
            variant="ghost"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => router.push('/admin/centros')}
          >
            Voltar à lista
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              leftIcon={<Bell className="w-4 h-4" />}
              onClick={openNotifyModal}
            >
              Notificar
            </Button>
            <Button
              leftIcon={<ArrowUpDown className="w-4 h-4" />}
              onClick={openStatusModal}
            >
              Mudar Estado
            </Button>
          </div>
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Users className="w-5 h-5 text-sky-600" />}
            label="Utilizadores"
            value={stats?.totalUtilizadores ?? 0}
            bgColor="bg-sky-50"
          />
          <StatCard
            icon={<BookOpen className="w-5 h-5 text-emerald-600" />}
            label="Cursos"
            value={stats?.totalCursos ?? 0}
            bgColor="bg-emerald-50"
          />
          <StatCard
            icon={<GraduationCap className="w-5 h-5 text-violet-600" />}
            label="Formadores"
            value={stats?.totalFormadores ?? 0}
            bgColor="bg-violet-50"
          />
          <StatCard
            icon={<Shield className="w-5 h-5 text-amber-600" />}
            label="Estado"
            value={getStatusLabel(center.status)}
            bgColor="bg-amber-50"
            badge={
              <Badge variant={getStatusBadgeVariant(center.status)}>
                {getStatusLabel(center.status)}
              </Badge>
            }
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informação do Centro */}
          <Card padding="none" className="lg:col-span-2">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                Informações do Centro
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoField label="Nome" value={center.nome} />
                <InfoField label="NIF" value={center.nif} />
                <InfoField
                  label="Email"
                  value={center.email}
                  icon={<Mail className="w-4 h-4" />}
                />
                <InfoField
                  label="Telefone"
                  value={center.telefone}
                  icon={<Phone className="w-4 h-4" />}
                />
                <InfoField
                  label="Morada"
                  value={center.morada}
                  icon={<MapPin className="w-4 h-4" />}
                />
                <InfoField label="Código Postal" value={center.codigoPostal} />
                <InfoField label="Localidade" value={center.localidade} />
                <InfoField label="País" value={center.pais} />
                {center.website && (
                  <InfoField
                    label="Website"
                    value={center.website}
                    icon={<Globe className="w-4 h-4" />}
                    isLink
                  />
                )}
                <InfoField
                  label="Data de Criação"
                  value={formatDate(center.dataCriacao)}
                  icon={<Calendar className="w-4 h-4" />}
                />
                <InfoField
                  label="Última Atualização"
                  value={formatDate(center.dataAtualizacao)}
                  icon={<Clock className="w-4 h-4" />}
                />
              </div>

              {(center.certificacoes.length > 0 ||
                center.areasFormacao.length > 0) && (
                <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {center.certificacoes.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-2">
                        Certificações
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {center.certificacoes.map((cert) => (
                          <Badge key={cert} variant="info">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {center.areasFormacao.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-2">
                        Áreas de Formação
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {center.areasFormacao.map((area) => (
                          <Badge key={area} variant="default">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Responsável */}
          <div className="space-y-6">
            <Card padding="none">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-600" />
                  Responsável
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-lg font-bold">
                    {center.responsavel.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {center.responsavel}
                    </p>
                    <p className="text-xs text-slate-500">
                      Responsável do Centro
                    </p>
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400" />
                    {center.emailResponsavel}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {center.telefoneResponsavel}
                  </div>
                </div>
              </div>
            </Card>

            {/* Utilizadores do centro */}
            <Card padding="none">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  Utilizadores ({users.length})
                </h3>
              </div>
              <div className="divide-y divide-slate-100">
                {users.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-sm text-slate-500">
                      Nenhum utilizador registado.
                    </p>
                  </div>
                ) : (
                  users.slice(0, 10).map((u) => (
                    <div
                      key={u.id}
                      className="px-6 py-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold flex-shrink-0">
                          {u.nome.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {u.nome}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {u.email}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          u.role === 'admin'
                            ? 'danger'
                            : u.role === 'gestor'
                              ? 'info'
                              : 'default'
                        }
                      >
                        {getRoleLabel(u.role)}
                      </Badge>
                    </div>
                  ))
                )}
                {users.length > 10 && (
                  <div className="px-6 py-3 text-center">
                    <p className="text-xs text-slate-500">
                      + {users.length - 10} utilizador
                      {users.length - 10 !== 1 ? 'es' : ''} adicional
                      {users.length - 10 !== 1 ? 'is' : ''}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal: Mudar Estado */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Alterar Estado do Centro"
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-sm font-medium text-slate-900">{center.nome}</p>
            <p className="text-xs text-slate-500 mt-0.5">NIF: {center.nif}</p>
          </div>

          <div>
            <p className="text-sm text-slate-600 mb-2">
              Estado atual:{' '}
              <Badge variant={getStatusBadgeVariant(center.status)}>
                {getStatusLabel(center.status)}
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
      </Modal>

      {/* Modal: Notificar */}
      <Modal
        isOpen={showNotifyModal}
        onClose={() => setShowNotifyModal(false)}
        title="Enviar Notificação"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <p className="text-sm font-medium text-slate-900">
                {center.nome}
              </p>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Destinatário: {center.emailResponsavel}
            </p>
          </div>

          <div>
            <label
              htmlFor="detail-notify-subject"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Assunto
            </label>
            <input
              id="detail-notify-subject"
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
              htmlFor="detail-notify-message"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Mensagem
            </label>
            <textarea
              id="detail-notify-message"
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
      </Modal>
    </>
  );
}

// Componente auxiliar para campos de informação
function InfoField({
  label,
  value,
  icon,
  isLink,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  isLink?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      <div className="flex items-center gap-2">
        {icon && <span className="text-slate-400">{icon}</span>}
        {isLink ? (
          <a
            href={value.startsWith('http') ? value : `https://${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm text-slate-900">{value || '—'}</p>
        )}
      </div>
    </div>
  );
}

// Componente auxiliar para cartões de estatísticas
function StatCard({
  icon,
  label,
  value,
  bgColor,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  bgColor: string;
  badge?: React.ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center flex-shrink-0`}
        >
          {icon}
        </div>
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          {badge || <p className="text-xl font-bold text-slate-900">{value}</p>}
        </div>
      </div>
    </Card>
  );
}
