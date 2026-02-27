'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  User,
  Bell,
  ToggleLeft,
  ToggleRight,
  Clock,
  Shield,
  Award,
  BookOpen,
} from 'lucide-react';

import { Header } from '../../../components/layout';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Modal,
  ModalFooter,
  getStatusBadgeVariant,
  getStatusLabel,
} from '../../../components/ui';
import { TrainingCenter, Status, Notification, NotificationType } from '../../../types';
import * as trainingCentersService from '../../../lib/trainingCentersService';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DetalheCentroFormacaoPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  const [center, setCenter] = useState<TrainingCenter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);

  // Modal de notificação
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyType, setNotifyType] = useState<NotificationType>('informacao');
  const [notifySubject, setNotifySubject] = useState('');
  const [notifyMessage, setNotifyMessage] = useState('');
  const [isSendingNotification, setIsSendingNotification] = useState(false);

  // Modal de mudança de estado
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<Status>('ativo');
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  useEffect(() => {
    const loadCenter = async () => {
      try {
        const data = await trainingCentersService.getTrainingCenterById(id);
        setCenter(data);
      } catch (error) {
        console.error('Erro ao carregar centro de formação:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCenter();
  }, [id]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await trainingCentersService.getNotificationsByCenter(id);
        setNotifications(data);
      } catch (error) {
        console.error('Erro ao carregar notificações:', error);
      } finally {
        setIsLoadingNotifications(false);
      }
    };

    loadNotifications();
  }, [id]);

  const handleSendNotification = async () => {
    if (!center || !user || !notifySubject.trim() || !notifyMessage.trim()) {
      toast.error('Campos obrigatórios', 'Preencha o assunto e a mensagem.');
      return;
    }

    setIsSendingNotification(true);
    try {
      const notification = await trainingCentersService.sendNotification({
        centroFormacaoId: center.id,
        centroFormacaoNome: center.nome,
        reguladorId: user.id,
        reguladorNome: user.nome,
        tipo: notifyType,
        assunto: notifySubject,
        mensagem: notifyMessage,
      });

      setNotifications((prev) => [notification, ...prev]);
      toast.success('Notificação enviada', `Notificação enviada para ${center.nome}.`);
      setShowNotifyModal(false);
      setNotifySubject('');
      setNotifyMessage('');
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      toast.error('Erro', 'Não foi possível enviar a notificação.');
    } finally {
      setIsSendingNotification(false);
    }
  };

  const handleChangeStatus = async () => {
    if (!center || !user) return;

    setIsChangingStatus(true);
    try {
      await trainingCentersService.updateTrainingCenterStatus(center.id, newStatus);
      setCenter((prev) => prev ? { ...prev, status: newStatus } : prev);

      const notifyTypeForStatus: NotificationType = newStatus === 'ativo' ? 'ativacao' : 'suspensao';
      const notification = await trainingCentersService.sendNotification({
        centroFormacaoId: center.id,
        centroFormacaoNome: center.nome,
        reguladorId: user.id,
        reguladorNome: user.nome,
        tipo: notifyTypeForStatus,
        assunto: newStatus === 'ativo'
          ? 'Centro de Formação Ativado'
          : 'Centro de Formação Suspenso/Arquivado',
        mensagem: newStatus === 'ativo'
          ? `O seu centro de formação "${center.nome}" foi ativado pelo regulador.`
          : `O seu centro de formação "${center.nome}" foi suspenso/arquivado pelo regulador.`,
      });

      setNotifications((prev) => [notification, ...prev]);
      toast.success('Estado atualizado', `${center.nome} foi ${getStatusLabel(newStatus).toLowerCase()}.`);
      setShowStatusModal(false);
    } catch (error) {
      console.error('Erro ao alterar estado:', error);
      toast.error('Erro', 'Não foi possível alterar o estado.');
    } finally {
      setIsChangingStatus(false);
    }
  };

  const getNotifyTypeBadge = (tipo: NotificationType) => {
    const map: Record<NotificationType, { variant: 'info' | 'warning' | 'danger' | 'success' | 'default'; label: string }> = {
      informacao: { variant: 'info', label: 'Informação' },
      aviso: { variant: 'warning', label: 'Aviso' },
      urgente: { variant: 'danger', label: 'Urgente' },
      suspensao: { variant: 'danger', label: 'Suspensão' },
      ativacao: { variant: 'success', label: 'Ativação' },
    };
    return map[tipo];
  };

  if (isLoading) {
    return (
      <>
        <Header title="A carregar centro..." />
        <div className="p-8 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-sky-500 rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (!center) {
    return (
      <>
        <Header title="Centro não encontrado" />
        <div className="p-8">
          <p className="text-slate-500">
            O centro de formação solicitado não existe ou foi eliminado.
          </p>
          <Button onClick={() => router.push('/regulador/centros-formacao')} className="mt-4">
            Voltar à lista
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Detalhes do Centro de Formação" subtitle={center.nome} />

      <div className="p-8 max-w-5xl">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Voltar</span>
        </button>

        {/* Cabeçalho do centro */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center text-white">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{center.nome}</h2>
              <p className="text-sm text-slate-500">
                {center.localidade}, {center.pais} • NIF: {center.nif}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={getStatusBadgeVariant(center.status)}>
              {getStatusLabel(center.status)}
            </Badge>
            <Button
              variant="outline"
              leftIcon={<Bell className="w-4 h-4" />}
              onClick={() => {
                setNotifyType('informacao');
                setNotifySubject('');
                setNotifyMessage('');
                setShowNotifyModal(true);
              }}
            >
              Notificar
            </Button>
            <Button
              variant={center.status === 'ativo' ? 'danger' : 'primary'}
              leftIcon={
                center.status === 'ativo'
                  ? <ToggleRight className="w-4 h-4" />
                  : <ToggleLeft className="w-4 h-4" />
              }
              onClick={() => {
                setNewStatus(center.status === 'ativo' ? 'arquivado' : 'ativo');
                setShowStatusModal(true);
              }}
            >
              {center.status === 'ativo' ? 'Suspender' : 'Ativar'}
            </Button>
          </div>
        </div>

        {/* Cards de informação */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Informação de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{center.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{center.telefone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{center.morada}, {center.codigoPostal} {center.localidade}</span>
              </div>
              {center.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <a
                    href={center.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-600 hover:underline"
                  >
                    {center.website}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Responsável</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <span className="font-medium">{center.responsavel}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{center.emailResponsavel}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{center.telefoneResponsavel}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Certificações</CardTitle>
            </CardHeader>
            <CardContent>
              {center.certificacoes.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {center.certificacoes.map((cert, idx) => (
                    <Badge key={idx} variant="info">
                      <Award className="w-3 h-3 mr-1" />
                      {cert}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">Nenhuma certificação registada.</p>
              )}
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Áreas de Formação</CardTitle>
            </CardHeader>
            <CardContent>
              {center.areasFormacao.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {center.areasFormacao.map((area, idx) => (
                    <Badge key={idx} variant="default">
                      <BookOpen className="w-3 h-3 mr-1" />
                      {area}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">Nenhuma área registada.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Datas */}
        <Card variant="bordered" className="mb-6">
          <CardHeader>
            <CardTitle>Estado e Datas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-400" />
                <span>
                  <span className="font-medium">Estado:</span>{' '}
                  <Badge variant={getStatusBadgeVariant(center.status)}>
                    {getStatusLabel(center.status)}
                  </Badge>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>
                  <span className="font-medium">Criado em:</span>{' '}
                  {format(new Date(center.dataCriacao), "dd/MM/yyyy", { locale: pt })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>
                  <span className="font-medium">Atualizado:</span>{' '}
                  {format(new Date(center.dataAtualizacao), "dd/MM/yyyy HH:mm", { locale: pt })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Histórico de Notificações */}
        <Card variant="bordered">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>Histórico de Notificações</CardTitle>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Bell className="w-3.5 h-3.5" />}
                onClick={() => {
                  setNotifyType('informacao');
                  setNotifySubject('');
                  setNotifyMessage('');
                  setShowNotifyModal(true);
                }}
              >
                Nova Notificação
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingNotifications ? (
              <p className="text-sm text-slate-500">A carregar notificações...</p>
            ) : notifications.length === 0 ? (
              <p className="text-sm text-slate-400">
                Ainda não foram enviadas notificações a este centro.
              </p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {notifications.map((notif) => {
                  const typeBadge = getNotifyTypeBadge(notif.tipo);
                  return (
                    <div
                      key={notif.id}
                      className="rounded-lg border border-slate-100 p-4 bg-white hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>
                          <h4 className="font-medium text-slate-900 text-sm">
                            {notif.assunto}
                          </h4>
                        </div>
                        <span className="text-xs text-slate-400">
                          {format(new Date(notif.dataCriacao), "dd/MM/yyyy HH:mm", { locale: pt })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 whitespace-pre-line">
                        {notif.mensagem}
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        Enviada por: {notif.reguladorNome}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Notificação */}
      <Modal
        isOpen={showNotifyModal}
        onClose={() => setShowNotifyModal(false)}
        title={`Notificar ${center?.nome || ''}`}
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
            o centro <strong>{center?.nome}</strong>?
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
