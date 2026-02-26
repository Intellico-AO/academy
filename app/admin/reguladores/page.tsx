'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Scale, Search, Filter, Plus, MoreVertical, Edit, Trash2, Eye, Download, Upload } from 'lucide-react';

import { Header } from '../../components/layout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  EmptyState,
  Modal,
  ModalFooter,
  getStatusBadgeVariant,
  getStatusLabel,
} from '../../components/ui';
import { Regulator, RegulatorFormData, Status, UserAccount } from '../../types';
import * as regulatorsService from '../../lib/regulatorsService';
import * as firebaseService from '../../lib/firebaseService';
import * as authService from '../../lib/authService';

export default function ReguladoresPage() {
  const { center, user } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const canManageRegulators = user?.role === 'admin' || user?.role === 'regulador';
  const regulatorsBasePath =
    user?.role === 'regulador' ? '/regulador/reguladores' : '/admin/reguladores';

  const [regulators, setRegulators] = useState<Regulator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'todos'>('todos');
  const [tipoFilter, setTipoFilter] = useState<'todos' | Regulator['tipo']>('todos');
  const [selectedRegulator, setSelectedRegulator] = useState<Regulator | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  useEffect(() => {
    if (user && !canManageRegulators) {
      router.push('/');
      toast.error('Acesso negado', 'Sem permissões para gerir reguladores.');
    }
  }, [user, canManageRegulators, router, toast]);

  useEffect(() => {
    if (center?.id && canManageRegulators) {
      loadRegulators();
      loadUsers();
    }
  }, [center?.id, canManageRegulators]);

  const loadRegulators = async () => {
    if (!center?.id) return;

    setIsLoading(true);
    try {
      const data = await regulatorsService.getRegulators(center.id);
      setRegulators(data);
    } catch (error) {
      console.error('Erro ao carregar reguladores:', error);
      toast.error('Erro', 'Não foi possível carregar a lista de reguladores.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    if (!center?.id) return;

    setIsLoadingUsers(true);
    try {
      const data = await authService.getUsersByCenterId(center.id);
      setUsers(data);
    } catch (error) {
      console.error('Erro ao carregar utilizadores:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const filteredRegulators = useMemo(
    () =>
      regulators.filter((reg) => {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
          reg.nome.toLowerCase().includes(term) ||
          reg.pais.toLowerCase().includes(term) ||
          (reg.website ?? '').toLowerCase().includes(term);
        const matchesStatus = statusFilter === 'todos' || reg.status === statusFilter;
        const matchesTipo = tipoFilter === 'todos' || reg.tipo === tipoFilter;
        return matchesSearch && matchesStatus && matchesTipo;
      }),
    [regulators, searchTerm, statusFilter, tipoFilter]
  );

  const handleDelete = async () => {
    if (!selectedRegulator) return;

    try {
      const before = selectedRegulator;

      await regulatorsService.deleteRegulator(selectedRegulator.id);
      setRegulators((prev) => prev.filter((r) => r.id !== selectedRegulator.id));

      if (before && center) {
        try {
          await firebaseService.createAuditLog({
            entidadeTipo: 'regulador',
            entidadeId: before.id,
            entidadeNome: before.nome,
            acao: 'eliminar',
            detalhes: `Regulador "${before.nome}" eliminado.`,
            alteracoesAntes: before as unknown as Record<string, unknown>,
            alteracoesDepois: null,
            utilizador: user?.nome || user?.email || 'Desconhecido',
            centroFormacaoId: center.id,
            dataHora: new Date().toISOString(),
          });
        } catch (logError) {
          console.error('Erro ao registar log de auditoria de regulador:', logError);
        }
      }

      toast.success(
        'Regulador eliminado',
        `${selectedRegulator.nome} foi eliminado com sucesso.`
      );
      setShowDeleteModal(false);
      setSelectedRegulator(null);
    } catch (error) {
      console.error('Erro ao eliminar regulador:', error);
      toast.error('Erro', 'Não foi possível eliminar o regulador. Tente novamente.');
    }
  };

  const handleArchiveToggle = async (regulator: Regulator) => {
    try {
      const before = regulator;
      let afterStatus: Status;

      if (regulator.status === 'ativo') {
        await regulatorsService.archiveRegulator(regulator.id);
        setRegulators((prev) =>
          prev.map((r) =>
            r.id === regulator.id ? { ...r, status: 'arquivado' as Status } : r
          )
        );
        toast.success('Regulador arquivado', `${regulator.nome} foi arquivado.`);
        afterStatus = 'arquivado';
      } else {
        await regulatorsService.activateRegulator(regulator.id);
        setRegulators((prev) =>
          prev.map((r) =>
            r.id === regulator.id ? { ...r, status: 'ativo' as Status } : r
          )
        );
        toast.success('Regulador ativado', `${regulator.nome} foi ativado.`);
        afterStatus = 'ativo';
      }

      if (center) {
        try {
          const after: Regulator = { ...before, status: afterStatus };
          await firebaseService.createAuditLog({
            entidadeTipo: 'regulador',
            entidadeId: regulator.id,
            entidadeNome: after.nome,
            acao: afterStatus === 'ativo' ? 'ativar' : 'arquivar',
            detalhes:
              afterStatus === 'ativo'
                ? `Regulador "${after.nome}" ativado.`
                : `Regulador "${after.nome}" arquivado.`,
            alteracoesAntes: before as unknown as Record<string, unknown>,
            alteracoesDepois: after as unknown as Record<string, unknown>,
            utilizador: user?.nome || user?.email || 'Desconhecido',
            centroFormacaoId: center.id,
            dataHora: new Date().toISOString(),
          });
        } catch (logError) {
          console.error('Erro ao registar log de auditoria de regulador:', logError);
        }
      }
      setMenuOpenId(null);
    } catch (error) {
      console.error('Erro ao atualizar estado do regulador:', error);
      toast.error('Erro', 'Não foi possível atualizar o estado. Tente novamente.');
    }
  };

  const handleExportCsv = () => {
    if (!regulators.length) {
      toast.info('Sem dados', 'Não existem reguladores para exportar.');
      return;
    }

    const headers = [
      'nome',
      'tipo',
      'pais',
      'website',
      'email',
      'telefone',
      'morada',
      'descricao',
      'status',
    ];

    const lines = regulators.map((r) =>
      [
        r.nome,
        r.tipo,
        r.pais,
        r.website || '',
        r.email || '',
        r.telefone || '',
        r.morada || '',
        (r.descricao || '').replace(/\r?\n/g, ' '),
        r.status,
      ]
        .map((value) => `"${(value ?? '').toString().replace(/"/g, '""')}"`)
        .join(',')
    );

    const csvContent = [headers.join(','), ...lines].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'reguladores.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !center?.id) return;

    setIsImporting(true);

    try {
      const text = await file.text();
      const [headerLine, ...rows] = text.split(/\r?\n/).filter((l) => l.trim());
      const headers = headerLine.split(',').map((h) => h.trim().toLowerCase());

      const idx = (name: string) => headers.indexOf(name);

      const created: Regulator[] = [];

      for (const row of rows) {
        const cols = row
          .split(',')
          .map((c) => c.replace(/^"|"$/g, '').replace(/""/g, '"'));

        const nome = cols[idx('nome')] || '';
        const tipo = (cols[idx('tipo')] as Regulator['tipo']) || 'nacional';
        const pais = cols[idx('pais')] || '';

        if (!nome || !pais) continue;

        const data: RegulatorFormData = {
          nome,
          tipo,
          pais,
          website: cols[idx('website')] || undefined,
          email: cols[idx('email')] || undefined,
          telefone: cols[idx('telefone')] || undefined,
          morada: cols[idx('morada')] || undefined,
          descricao: cols[idx('descricao')] || undefined,
        };

        const regulator = await regulatorsService.createRegulator(center.id, data);
        created.push(regulator);

        try {
          await firebaseService.createAuditLog({
            entidadeTipo: 'regulador',
            entidadeId: regulator.id,
            entidadeNome: regulator.nome,
            acao: 'criar',
            detalhes: `Regulador "${regulator.nome}" importado via CSV.`,
            alteracoesAntes: null,
            alteracoesDepois: regulator as unknown as Record<string, unknown>,
            utilizador: user?.nome || user?.email || 'Desconhecido',
            centroFormacaoId: center.id,
            dataHora: new Date().toISOString(),
          });
        } catch (logError) {
          console.error('Erro ao registar log de auditoria de regulador (import):', logError);
        }
      }

      if (created.length) {
        setRegulators((prev) => [...prev, ...created]);
        toast.success(
          'Importação concluída',
          `${created.length} regulador(es) importado(s) com sucesso.`
        );
      } else {
        toast.info('Sem registros válidos', 'Nenhum regulador válido encontrado no ficheiro.');
      }
    } catch (error) {
      console.error('Erro ao importar reguladores:', error);
      toast.error('Erro', 'Não foi possível importar os reguladores. Verifique o ficheiro.');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (user && !canManageRegulators) {
    return null;
  }

  const getActivityDotClass = (reg: Regulator) => {
    const updatedAt = new Date(reg.dataAtualizacao).getTime();
    const now = Date.now();
    const diffMs = now - updatedAt;
    const minutes = diffMs / (1000 * 60);

    // Verde: ativo muito recente (<5 minutos)
    if (minutes <= 5) {
      return 'bg-emerald-500';
    }

    // Laranja: atualizado nas últimas 2 horas
    if (minutes > 5 && minutes <= 120) {
      return 'bg-orange-400';
    }

    // Cinzento: mais de 2 horas sem atualização
    return 'bg-slate-400';
  };

  const getUserActivityDotClass = (userAccount: UserAccount) => {
    if (!userAccount.ultimoAcesso) {
      return 'bg-slate-400';
    }

    const lastAccess = new Date(userAccount.ultimoAcesso).getTime();
    const now = Date.now();
    const minutes = (now - lastAccess) / (1000 * 60);

    if (minutes <= 5) {
      return 'bg-emerald-500';
    }

    if (minutes > 5 && minutes <= 120) {
      return 'bg-orange-400';
    }

    return 'bg-slate-400';
  };

  if (isLoading) {
    return (
      <>
        <Header title="Reguladores" subtitle="A carregar reguladores..." />
        <div className="p-8 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Reguladores"
        subtitle="Gestão de entidades reguladoras"
      />

      <div className="p-8">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2.2fr)_minmax(280px,0.8fr)] gap-6 items-start">
          <div>
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
                  onChange={(e) => setStatusFilter(e.target.value as Status | 'todos')}
                  className="w-full pl-7 pr-6 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
                >
                  <option value="todos">Estados</option>
                  <option value="ativo">Ativo</option>
                  <option value="arquivado">Arquivado</option>
                </select>
              </div>
              <div className="relative w-[130px]">
                <Filter className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <select
                  value={tipoFilter}
                  onChange={(e) =>
                    setTipoFilter(e.target.value as 'todos' | Regulator['tipo'])
                  }
                  className="w-full pl-7 pr-6 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
                >
                  <option value="todos">Tipos</option>
                  <option value="nacional">Nacional</option>
                  <option value="regional">Regional</option>
                  <option value="internacional">Internacional</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="w-3.5 h-3.5" />}
                onClick={handleExportCsv}
                className="shrink-0"
              >
                Exportar
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Upload className="w-3.5 h-3.5" />}
                onClick={handleImportClick}
                isLoading={isImporting}
                className="shrink-0"
              >
                Importar
              </Button>
              <Link href={`${regulatorsBasePath}/novo`} className="shrink-0">
                <Button size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                  Novo Regulador
                </Button>
              </Link>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleImportChange}
            />

            {filteredRegulators.length === 0 ? (
              <EmptyState
                icon={<Scale className="w-8 h-8" />}
                title={
                  searchTerm || statusFilter !== 'todos'
                    ? 'Nenhum regulador encontrado'
                    : 'Nenhum regulador registado'
                }
                description={
                  searchTerm || statusFilter !== 'todos'
                    ? 'Tente ajustar os filtros de pesquisa.'
                    : 'Registe as entidades reguladoras relevantes para o seu centro.'
                }
                actionLabel={
                  !searchTerm && statusFilter === 'todos'
                    ? 'Adicionar primeiro regulador'
                    : undefined
                }
                onAction={
                  !searchTerm && statusFilter === 'todos'
                    ? () => router.push(`${regulatorsBasePath}/novo`)
                    : undefined
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                {filteredRegulators.map((reg, index) => (
                  <Card
                    key={reg.id}
                    variant="bordered"
                    padding="none"
                    className="card-hover animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-black flex items-center justify-center text-yellow-400">
                            <Scale className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 line-clamp-1">
                              {reg.nome}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {reg.pais} •{' '}
                              {reg.tipo === 'nacional'
                                ? 'Nacional'
                                : reg.tipo === 'regional'
                                ? 'Regional'
                                : reg.tipo === 'internacional'
                                ? 'Internacional'
                                : 'Outro'}
                            </p>
                          </div>
                        </div>
                        <div className="relative overflow-visible">
                          <button
                            onClick={() =>
                              setMenuOpenId(menuOpenId === reg.id ? null : reg.id)
                            }
                            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                          >
                            <MoreVertical className="w-5 h-5 text-slate-400" />
                          </button>
                          {menuOpenId === reg.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 animate-scale-in">
                              <Link
                                href={`${regulatorsBasePath}/${reg.id}`}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                              >
                                <Eye className="w-4 h-4" />
                                Ver detalhes
                              </Link>
                              <Link
                                href={`${regulatorsBasePath}/${reg.id}/editar`}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                              >
                                <Edit className="w-4 h-4" />
                                Editar
                              </Link>
                              <hr className="my-1 border-slate-200" />
                              <button
                                onClick={() => handleArchiveToggle(reg)}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 w-full text-left"
                              >
                                {reg.status === 'ativo'
                                  ? 'Arquivar regulador'
                                  : 'Ativar regulador'}
                              </button>
                              <hr className="my-1 border-slate-200" />
                              <button
                                onClick={() => {
                                  setSelectedRegulator(reg);
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
                      </div>

                      {reg.descricao && (
                        <p className="text-sm text-slate-600 line-clamp-3 mb-3">
                          {reg.descricao}
                        </p>
                      )}

                      <div className="space-y-1 text-xs text-slate-500">
                        {reg.website && (
                          <p className="truncate">
                            <span className="font-medium">Website:</span>{' '}
                            <a
                              href={reg.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:underline"
                            >
                              {reg.website}
                            </a>
                          </p>
                        )}
                        {reg.email && (
                          <p className="truncate">
                            <span className="font-medium">Email:</span> {reg.email}
                          </p>
                        )}
                        {reg.telefone && (
                          <p className="truncate">
                            <span className="font-medium">Telefone:</span>{' '}
                            {reg.telefone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                      <Badge variant={getStatusBadgeVariant(reg.status)}>
                        <span
                          className={`inline-block w-2 h-2 rounded-full mr-2 ${getActivityDotClass(
                            reg
                          )}`}
                        />
                        {getStatusLabel(reg.status)}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        Desde{' '}
                        {format(new Date(reg.dataCriacao), "MMM yyyy", { locale: pt })}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <aside className="w-full xl:w-auto">
            <Card variant="bordered" className="sticky top-24">
              <CardHeader>
                <CardTitle>Utilizadores do centro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoadingUsers ? (
                  <p className="text-sm text-slate-500">A carregar utilizadores...</p>
                ) : users.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Ainda não existem utilizadores associados a este centro.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                    {users.map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between gap-3 rounded-md border border-slate-100 px-3 py-2 bg-white"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`inline-block w-2.5 h-2.5 rounded-full ${getUserActivityDotClass(
                              u
                            )}`}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {u.nome}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {u.role === 'admin'
                                ? 'Administrador'
                                : u.role === 'gestor'
                                ? 'Gestor'
                                : u.role === 'regulador'
                                ? 'Regulador'
                                : 'Formador'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] text-slate-500">
                            {u.ultimoAcesso
                              ? format(new Date(u.ultimoAcesso), "dd/MM HH:mm", {
                                  locale: pt,
                                })
                              : 'Nunca entrou'}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {u.ativo ? 'Ativo' : 'Inativo'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedRegulator(null);
        }}
        title="Eliminar Regulador"
        size="sm"
      >
        <p className="text-slate-600">
          Tem a certeza que pretende eliminar o regulador{' '}
          <strong>{selectedRegulator?.nome}</strong>? Esta ação não pode ser
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
