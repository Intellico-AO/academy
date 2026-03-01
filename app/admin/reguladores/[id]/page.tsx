'use client';

import { use, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { ArrowLeft, Edit, Scale, UserPlus, Mail, User, CheckCircle } from 'lucide-react';

import { Header } from '../../../components/layout';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from '../../../components/ui';
import { AuditLog, Regulator, UserAccount } from '../../../types';
import * as regulatorsService from '../../../lib/regulatorsService';
import * as firebaseService from '../../../lib/firebaseService';
import * as authService from '../../../lib/authService';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DetalheReguladorPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const toast = useToast();

  const [regulator, setRegulator] = useState<Regulator | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);

  // Estado da conta de utilizador regulador
  const [reguladorUser, setReguladorUser] = useState<UserAccount | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserNome, setNewUserNome] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
      toast.error('Acesso negado', 'Apenas o responsável pode consultar reguladores.');
    }
  }, [user, router, toast]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await regulatorsService.getRegulator(id);
        setRegulator(data);
      } catch (error) {
        console.error('Erro ao carregar regulador:', error);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [id]);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const data = await firebaseService.getAuditLogs({
          entidadeTipo: 'regulador',
          entidadeId: id,
        });
        setLogs(data);
      } catch (error) {
        console.error('Erro ao carregar logs de auditoria de regulador:', error);
      } finally {
        setIsLoadingLogs(false);
      }
    };

    loadLogs();
  }, [id]);

  // Carregar conta de utilizador regulador (se existir)
  useEffect(() => {
    const loadReguladorUser = async () => {
      try {
        const db = (await import('../../../lib/firebase')).getFirebaseDb();
        if (!db) return;

        const { collection: col, query: q, where: w, getDocs: gd } = await import('firebase/firestore');
        const usersQuery = q(col(db, 'users'), w('reguladorId', '==', id), w('role', '==', 'regulador'));
        const snapshot = await gd(usersQuery);

        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0];
          setReguladorUser({ id: docSnap.id, ...docSnap.data() } as UserAccount);
        }
      } catch (error) {
        console.error('Erro ao carregar utilizador regulador:', error);
      } finally {
        setIsLoadingUser(false);
      }
    };

    loadReguladorUser();
  }, [id]);

  const handleCreateReguladorUser = async () => {
    if (!newUserNome.trim() || !newUserEmail.trim()) {
      toast.error('Campos obrigatórios', 'Preencha o nome e o email do utilizador.');
      return;
    }

    setIsCreatingUser(true);
    try {
      // Verificar se o email já existe
      const emailExists = await authService.checkEmailExists(newUserEmail);
      if (emailExists) {
        toast.error('Email já registado', 'Este email já está associado a outra conta.');
        setIsCreatingUser(false);
        return;
      }

      const newUser = await authService.createReguladorUser(
        newUserEmail.trim(),
        newUserNome.trim(),
        id
      );
      setReguladorUser(newUser);
      setShowCreateUser(false);
      setNewUserNome('');
      setNewUserEmail('');
      toast.success(
        'Conta criada',
        `A conta de regulador foi criada para ${newUser.email}. O utilizador irá definir a palavra-passe no primeiro login.`
      );
    } catch (error) {
      console.error('Erro ao criar utilizador regulador:', error);
      toast.error('Erro', 'Não foi possível criar a conta de utilizador. Tente novamente.');
    } finally {
      setIsCreatingUser(false);
    }
  };

  if (user && user.role !== 'admin') {
    return null;
  }

  if (isLoading) {
    return (
      <>
        <Header title="A carregar regulador..." />
        <div className="p-8 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (!regulator) {
    return (
      <>
        <Header title="Regulador não encontrado" />
        <div className="p-8">
          <p className="text-slate-500">
            O regulador solicitado não existe ou foi eliminado.
          </p>
          <Button onClick={() => router.push('/admin/reguladores')} className="mt-4">
            Voltar aos Reguladores
          </Button>
        </div>
      </>
    );
  }

  const tipoLabel =
    regulator.tipo === 'nacional'
      ? 'Nacional'
      : regulator.tipo === 'regional'
      ? 'Regional'
      : regulator.tipo === 'internacional'
      ? 'Internacional'
      : 'Outro';

  const getActivityDotClass = () => {
    const updatedAt = new Date(regulator.dataAtualizacao).getTime();
    const now = Date.now();
    const minutes = (now - updatedAt) / (1000 * 60);

    if (minutes <= 5) {
      return 'bg-emerald-500';
    }

    if (minutes > 5 && minutes <= 120) {
      return 'bg-orange-400';
    }

    return 'bg-slate-400';
  };

  const showUpdatedBanner = searchParams.get('updated') === '1';

  return (
    <>
      <Header title="Detalhes do Regulador" subtitle={regulator.nome} />

      <div className="p-8 max-w-4xl">
        {showUpdatedBanner && (
          <div className="mb-4 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-sm text-emerald-800">
              Regulador atualizado com sucesso. O que pretende fazer a seguir?
            </p>
            <div className="flex flex-wrap gap-2 justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push(`/admin/reguladores/${regulator.id}/editar`)}
              >
                Continuar a editar
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => router.push('/admin/reguladores')}
              >
                Sair para lista
              </Button>
            </div>
          </div>
        )}

        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Voltar</span>
        </button>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-black flex items-center justify-center text-yellow-400 overflow-hidden">
              {regulator.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={regulator.logoUrl}
                  alt={regulator.nome}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Scale className="w-6 h-6" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {regulator.nome}
              </h2>
              <p className="text-sm text-slate-500">
                {regulator.pais} • {tipoLabel}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge>{tipoLabel}</Badge>
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                leftIcon={<Edit className="w-4 h-4" />}
                onClick={() => router.push(`/admin/reguladores/${regulator.id}/editar`)}
              >
                Editar / Seguir a ver
              </Button>
              <Button
                variant="danger"
                onClick={() => router.push('/admin/reguladores')}
              >
                Sair para lista
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Informação de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              <p>
                <span className="font-medium">País:</span> {regulator.pais}
              </p>
              {regulator.website && (
                <p>
                  <span className="font-medium">Website:</span>{' '}
                  <a
                    href={regulator.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:underline"
                  >
                    {regulator.website}
                  </a>
                </p>
              )}
              {regulator.email && (
                <p>
                  <span className="font-medium">Email:</span> {regulator.email}
                </p>
              )}
              {regulator.telefone && (
                <p>
                  <span className="font-medium">Telefone:</span> {regulator.telefone}
                </p>
              )}
              {regulator.morada && (
                <p>
                  <span className="font-medium">Morada:</span> {regulator.morada}
                </p>
              )}
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Estado e Datas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              <p>
                <span className="font-medium">Estado:</span>{' '}
                <Badge>
                  <span
                    className={`inline-block w-2 h-2 rounded-full mr-2 ${getActivityDotClass()}`}
                  />
                  {regulator.status}
                </Badge>
              </p>
              <p>
                <span className="font-medium">Criado em:</span>{' '}
                {format(new Date(regulator.dataCriacao), "dd 'de' MMMM 'de' yyyy", {
                  locale: pt,
                })}
              </p>
              <p>
                <span className="font-medium">Última atualização:</span>{' '}
                {format(
                  new Date(regulator.dataAtualizacao),
                  "dd 'de' MMMM 'de' yyyy",
                  { locale: pt }
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        {regulator.descricao && (
          <Card variant="bordered" className="mt-6">
            <CardHeader>
              <CardTitle>Descrição</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700 whitespace-pre-line">
                {regulator.descricao}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Conta de Utilizador Regulador */}
        <Card variant="bordered" className="mt-6">
          <CardHeader>
            <CardTitle>Conta de Utilizador</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingUser ? (
              <p className="text-sm text-slate-500">A carregar...</p>
            ) : reguladorUser ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 rounded-lg border border-emerald-200 bg-emerald-50">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-emerald-900">
                      Conta de regulador ativa
                    </p>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      {reguladorUser.nome} ({reguladorUser.email})
                    </p>
                    <p className="text-xs text-emerald-600 mt-0.5">
                      {reguladorUser.uid
                        ? 'Palavra-passe já definida'
                        : 'A aguardar primeiro login para definir palavra-passe'}
                    </p>
                  </div>
                </div>
              </div>
            ) : showCreateUser ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  Crie uma conta para que o regulador possa aceder ao sistema.
                  O email será usado para login e para definir a palavra-passe no primeiro acesso.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Nome do utilizador
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={newUserNome}
                        onChange={(e) => setNewUserNome(e.target.value)}
                        placeholder="Nome completo"
                        disabled={isCreatingUser}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="email@regulador.com"
                        disabled={isCreatingUser}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleCreateReguladorUser}
                    isLoading={isCreatingUser}
                    disabled={isCreatingUser}
                    size="sm"
                  >
                    Criar conta
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowCreateUser(false);
                      setNewUserNome('');
                      setNewUserEmail('');
                    }}
                    disabled={isCreatingUser}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-500">
                  Este regulador ainda não tem conta de utilizador. Crie uma conta para que o regulador possa aceder ao sistema e gerir os centros de formação.
                </p>
                <Button
                  size="sm"
                  leftIcon={<UserPlus className="w-4 h-4" />}
                  onClick={() => setShowCreateUser(true)}
                >
                  Criar conta de regulador
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card variant="bordered" className="mt-6">
          <CardHeader>
            <CardTitle>Histórico de alterações</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingLogs ? (
              <p className="text-sm text-slate-500">A carregar histórico...</p>
            ) : logs.length === 0 ? (
              <p className="text-sm text-slate-500">
                Ainda não existem registos de auditoria para este regulador.
              </p>
            ) : (
              <div className="space-y-3 text-sm text-slate-600">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium text-slate-800 capitalize">
                        {log.acao} por {log.utilizador || 'Desconhecido'}
                      </p>
                      <p className="text-xs text-slate-500">{log.detalhes}</p>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {format(new Date(log.dataHora), "dd/MM/yyyy HH:mm", { locale: pt })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

