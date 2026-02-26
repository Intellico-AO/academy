'use client';

import { use, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { ArrowLeft, Edit, Scale } from 'lucide-react';

import { Header } from '../../../components/layout';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '../../../components/ui';
import { AuditLog, Regulator } from '../../../types';
import * as regulatorsService from '../../../lib/regulatorsService';
import * as firebaseService from '../../../lib/firebaseService';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DetalheReguladorPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const toast = useToast();
  const canManageRegulators = user?.role === 'admin' || user?.role === 'regulador';
  const regulatorsBasePath =
    user?.role === 'regulador' ? '/regulador/reguladores' : '/admin/reguladores';

  const [regulator, setRegulator] = useState<Regulator | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);

  useEffect(() => {
    if (user && !canManageRegulators) {
      router.push('/');
      toast.error('Acesso negado', 'Sem permissões para aceder ao regulador.');
    }
  }, [user, canManageRegulators, router, toast]);

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

  if (user && !canManageRegulators) {
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
          <Button onClick={() => router.push(regulatorsBasePath)} className="mt-4">
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
                onClick={() => router.push(`${regulatorsBasePath}/${regulator.id}/editar`)}
              >
                Continuar a editar
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => router.push(regulatorsBasePath)}
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
                onClick={() => router.push(`${regulatorsBasePath}/${regulator.id}/editar`)}
              >
                Editar / Seguir a ver
              </Button>
              <Button
                variant="danger"
                onClick={() => router.push(regulatorsBasePath)}
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

