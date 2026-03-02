'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
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
  getStatusBadgeVariant,
  getStatusLabel,
} from '../../../components/ui';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import * as authService from '../../../lib/authService';
import * as trainersService from '../../../lib/trainersService';
import * as reguladorNotasService from '../../../lib/reguladorNotasService';
import {
  Trainer,
  TrainingCenter,
  ReguladorNota,
  NotaCategoria,
  Status,
  VerificacaoCertificado,
} from '../../../types';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Award,
  Building2,
  GraduationCap,
  Briefcase,
  Calendar,
  Globe,
  FileText,
  Clock,
  MessageSquarePlus,
  Pencil,
  Trash2,
  Send,
  X,
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  ShieldQuestion,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
  { value: 'em_avaliacao', label: 'Em Avaliação' },
  { value: 'aguardando_aprovacao', label: 'Aguardando Aprovação' },
];

const VERIFICACAO_OPTIONS: { value: VerificacaoCertificado; label: string; icon: typeof ShieldCheck; color: string }[] = [
  { value: 'pendente', label: 'Pendente', icon: ShieldQuestion, color: 'text-slate-500' },
  { value: 'verificado', label: 'Verificado', icon: ShieldCheck, color: 'text-emerald-600' },
  { value: 'rejeitado', label: 'Rejeitado', icon: ShieldX, color: 'text-rose-600' },
  { value: 'expirado', label: 'Expirado', icon: ShieldAlert, color: 'text-amber-600' },
];

function getVerificacaoBadge(status?: VerificacaoCertificado) {
  switch (status) {
    case 'verificado':
      return { variant: 'success' as const, label: 'Verificado', icon: ShieldCheck };
    case 'rejeitado':
      return { variant: 'danger' as const, label: 'Rejeitado', icon: ShieldX };
    case 'expirado':
      return { variant: 'warning' as const, label: 'Expirado', icon: ShieldAlert };
    default:
      return { variant: 'default' as const, label: 'Pendente', icon: ShieldQuestion };
  }
}

// Categorias de notas para o formador
type FormadorNotaCategoria = 'informacoes_gerais' | 'contacto' | 'certificacoes';

const SECCOES: { categoria: FormadorNotaCategoria; label: string }[] = [
  { categoria: 'informacoes_gerais', label: 'Informações Pessoais' },
  { categoria: 'contacto', label: 'Contacto' },
  { categoria: 'certificacoes', label: 'Certificação e Competências' },
];

// Componente de notas por secção
function SeccaoNotas({
  categoria,
  notas,
  onAdd,
  onEdit,
  onDelete,
}: {
  categoria: string;
  notas: ReguladorNota[];
  onAdd: (conteudo: string, categoria: NotaCategoria) => Promise<void>;
  onEdit: (id: string, conteudo: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newNota, setNewNota] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const filteredNotas = notas.filter((n) => n.categoria === categoria);

  const handleAdd = async () => {
    if (!newNota.trim()) return;
    setIsSaving(true);
    try {
      await onAdd(newNota.trim(), categoria as NotaCategoria);
      setNewNota('');
      setIsAdding(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editingId || !editingText.trim()) return;
    setIsSaving(true);
    try {
      await onEdit(editingId, editingText.trim());
      setEditingId(null);
      setEditingText('');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-3">
      {filteredNotas.length > 0 && (
        <div className="space-y-2 mb-2">
          {filteredNotas.map((nota) => (
            <div
              key={nota.id}
              className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm"
            >
              {editingId === nota.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm resize-y min-h-[60px] focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => { setEditingId(null); setEditingText(''); }}
                      className="px-3 py-1 text-xs text-slate-600 hover:text-slate-800"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleEdit}
                      disabled={isSaving}
                      className="px-3 py-1 text-xs bg-amber-500 text-white rounded-md hover:bg-amber-600 disabled:opacity-50"
                    >
                      {isSaving ? 'A guardar...' : 'Guardar'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-slate-700 whitespace-pre-wrap">{nota.conteudo}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-400">
                      {nota.utilizador} &middot;{' '}
                      {format(new Date(nota.dataCriacao), "d 'de' MMM yyyy, HH:mm", { locale: pt })}
                      {nota.dataAtualizacao !== nota.dataCriacao && ' (editado)'}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditingId(nota.id); setEditingText(nota.conteudo); }}
                        className="p-1 text-slate-400 hover:text-amber-600 transition-colors"
                        title="Editar nota"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(nota.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Eliminar nota"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {isAdding ? (
        <div className="space-y-2">
          <textarea
            value={newNota}
            onChange={(e) => setNewNota(e.target.value)}
            placeholder="Escrever nota..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-y min-h-[60px] focus:outline-none focus:ring-2 focus:ring-amber-500"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setIsAdding(false); setNewNota(''); }}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Cancelar
            </button>
            <button
              onClick={handleAdd}
              disabled={isSaving || !newNota.trim()}
              className="px-3 py-1.5 text-xs bg-amber-500 text-white rounded-md hover:bg-amber-600 disabled:opacity-50 flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" /> {isSaving ? 'A guardar...' : 'Adicionar'}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 font-medium mt-1"
        >
          <MessageSquarePlus className="w-3.5 h-3.5" />
          Adicionar nota
        </button>
      )}
    </div>
  );
}

export default function DetalheFormadorPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  const [formador, setFormador] = useState<Trainer | null>(null);
  const [centro, setCentro] = useState<TrainingCenter | null>(null);
  const [notas, setNotas] = useState<ReguladorNota[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estado
  const [newStatus, setNewStatus] = useState<Status | ''>('');
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  // Verificação de certificado
  const [verificacaoStatus, setVerificacaoStatus] = useState<VerificacaoCertificado>('pendente');
  const [verificacaoNotas, setVerificacaoNotas] = useState('');
  const [isVerificando, setIsVerificando] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'regulador') {
      router.push('/');
      toast.error('Acesso negado');
    }
  }, [user, router, toast]);

  useEffect(() => {
    const load = async () => {
      try {
        const [formadorData, notasData] = await Promise.all([
          trainersService.getTrainer(id),
          reguladorNotasService.getNotasByReferencia(id),
        ]);

        setFormador(formadorData);
        setNotas(notasData);

        if (formadorData) {
          setNewStatus(formadorData.status);
          setVerificacaoStatus(formadorData.verificacaoCertificado || 'pendente');
          setVerificacaoNotas(formadorData.verificacaoNotas || '');
          const centroData = await authService.getTrainingCenter(formadorData.centroFormacaoId);
          setCentro(centroData);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do formador:', error);
        toast.error('Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [id, toast]);

  // Handlers de notas
  const handleAddNota = async (conteudo: string, categoria: NotaCategoria) => {
    if (!user || !formador) return;
    try {
      const nova = await reguladorNotasService.createNota({
        centroFormacaoId: formador.centroFormacaoId,
        reguladorId: user.id,
        categoria,
        referenciaId: id,
        referenciaNome: formador.nome,
        conteudo,
        utilizador: user.nome,
      });
      setNotas((prev) => [nova, ...prev]);
      toast.success('Nota adicionada');
    } catch (error) {
      console.error('Erro ao adicionar nota:', error);
      toast.error('Erro ao adicionar nota');
    }
  };

  const handleEditNota = async (notaId: string, conteudo: string) => {
    try {
      await reguladorNotasService.updateNota(notaId, conteudo);
      setNotas((prev) =>
        prev.map((n) =>
          n.id === notaId
            ? { ...n, conteudo, dataAtualizacao: new Date().toISOString() }
            : n
        )
      );
      toast.success('Nota atualizada');
    } catch (error) {
      console.error('Erro ao editar nota:', error);
      toast.error('Erro ao editar nota');
    }
  };

  const handleDeleteNota = async (notaId: string) => {
    try {
      await reguladorNotasService.deleteNota(notaId);
      setNotas((prev) => prev.filter((n) => n.id !== notaId));
      toast.success('Nota eliminada');
    } catch (error) {
      console.error('Erro ao eliminar nota:', error);
      toast.error('Erro ao eliminar nota');
    }
  };

  // Verificar certificado
  const handleVerificarCertificado = async () => {
    if (!formador || !user) return;
    setIsVerificando(true);
    try {
      await trainersService.verificarCertificado(id, {
        verificacaoCertificado: verificacaoStatus,
        verificacaoPor: user.nome,
        verificacaoNotas: verificacaoNotas || undefined,
      });
      setFormador({
        ...formador,
        verificacaoCertificado: verificacaoStatus,
        verificacaoData: new Date().toISOString(),
        verificacaoPor: user.nome,
        verificacaoNotas: verificacaoNotas,
      });
      const label = VERIFICACAO_OPTIONS.find((o) => o.value === verificacaoStatus)?.label || verificacaoStatus;
      toast.success('Verificação atualizada', `Certificado marcado como "${label}"`);
    } catch (error) {
      console.error('Erro ao verificar certificado:', error);
      toast.error('Erro ao verificar certificado');
    } finally {
      setIsVerificando(false);
    }
  };

  // Alterar estado
  const handleChangeStatus = async () => {
    if (!formador || !newStatus || newStatus === formador.status) return;
    setIsChangingStatus(true);
    try {
      await trainersService.updateTrainerStatus(id, newStatus);
      setFormador({ ...formador, status: newStatus });
      toast.success('Estado atualizado', `Formador alterado para "${getStatusLabel(newStatus)}"`);
    } catch (error) {
      console.error('Erro ao alterar estado:', error);
      toast.error('Erro ao alterar estado');
    } finally {
      setIsChangingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header title="Detalhes do Formador" subtitle="A carregar..." />
        <div className="p-8 flex justify-center">
          <LoadingSpinner />
        </div>
      </>
    );
  }

  if (!formador) {
    return (
      <>
        <Header title="Formador não encontrado" />
        <div className="p-8 text-center">
          <p className="text-slate-500 mb-4">O formador solicitado não foi encontrado.</p>
          <Button variant="ghost" onClick={() => router.push('/regulador/formadores')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar à lista
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title={formador.nome}
        subtitle="Detalhes do formador"
      />

      <div className="p-8 space-y-6">
        {/* Barra superior */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/regulador/formadores')}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar à lista
          </button>
          <Badge variant={getStatusBadgeVariant(formador.status)}>
            {getStatusLabel(formador.status)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Pessoais */}
            <Card variant="bordered">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-500" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-slate-500 font-medium">Nome</dt>
                    <dd className="text-slate-900 mt-0.5">{formador.nome}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 font-medium">NIF</dt>
                    <dd className="text-slate-900 mt-0.5">{formador.nif}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 font-medium">Data de Nascimento</dt>
                    <dd className="text-slate-900 mt-0.5">
                      {formador.dataNascimento
                        ? format(new Date(formador.dataNascimento), "d 'de' MMMM 'de' yyyy", { locale: pt })
                        : 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 font-medium">Nacionalidade</dt>
                    <dd className="text-slate-900 mt-0.5">{formador.nacionalidade}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 font-medium">Habilitações</dt>
                    <dd className="text-slate-900 mt-0.5">{formador.habilitacoes}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 font-medium">Experiência</dt>
                    <dd className="text-slate-900 mt-0.5">{formador.experienciaAnos} anos</dd>
                  </div>
                </dl>
                <SeccaoNotas
                  categoria="informacoes_gerais"
                  notas={notas}
                  onAdd={handleAddNota}
                  onEdit={handleEditNota}
                  onDelete={handleDeleteNota}
                />
              </CardContent>
            </Card>

            {/* Contacto */}
            <Card variant="bordered">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-sky-500" />
                  Contacto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-slate-500 font-medium">Email</dt>
                    <dd className="text-slate-900 mt-0.5">{formador.email}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 font-medium">Telefone</dt>
                    <dd className="text-slate-900 mt-0.5">{formador.telefone}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 font-medium">Morada</dt>
                    <dd className="text-slate-900 mt-0.5">{formador.morada}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 font-medium">Código Postal</dt>
                    <dd className="text-slate-900 mt-0.5">{formador.codigoPostal}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 font-medium">Localidade</dt>
                    <dd className="text-slate-900 mt-0.5">{formador.localidade}</dd>
                  </div>
                </dl>
                <SeccaoNotas
                  categoria="contacto"
                  notas={notas}
                  onAdd={handleAddNota}
                  onEdit={handleEditNota}
                  onDelete={handleDeleteNota}
                />
              </CardContent>
            </Card>

            {/* Certificação e Competências */}
            <Card variant="bordered">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-violet-500" />
                  Certificação e Competências
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <dt className="text-slate-500 font-medium">Certificação Pedagógica</dt>
                    <dd className="text-slate-900 mt-0.5">{formador.certificacaoPedagogica}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 font-medium">Número de Certificação</dt>
                    <dd className="text-slate-900 mt-0.5">{formador.numeroCertificacao || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 font-medium">Validade</dt>
                    <dd className="text-slate-900 mt-0.5">
                      {formador.validadeCertificacao
                        ? format(new Date(formador.validadeCertificacao), "d 'de' MMMM 'de' yyyy", { locale: pt })
                        : 'N/A'}
                    </dd>
                  </div>
                </dl>

                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Áreas de Competência</h4>
                  {formador.areasCompetencia?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {formador.areasCompetencia.map((area, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">Sem áreas de competência registadas</p>
                  )}
                </div>

                <SeccaoNotas
                  categoria="certificacoes"
                  notas={notas}
                  onAdd={handleAddNota}
                  onEdit={handleEditNota}
                  onDelete={handleDeleteNota}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Alterar Estado */}
            <Card variant="bordered">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="w-5 h-5 text-amber-500" />
                  Alterar Estado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-600 block mb-1.5">
                      Estado atual
                    </label>
                    <Badge variant={getStatusBadgeVariant(formador.status)}>
                      {getStatusLabel(formador.status)}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 block mb-1.5">
                      Novo estado
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as Status)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={handleChangeStatus}
                    isLoading={isChangingStatus}
                    disabled={!newStatus || newStatus === formador.status}
                  >
                    Confirmar Alteração
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Verificação de Certificado */}
            <Card variant="bordered">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldCheck className="w-5 h-5 text-violet-500" />
                  Verificação de Certificado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Estado atual da verificação */}
                  <div>
                    <label className="text-sm font-medium text-slate-600 block mb-1.5">
                      Estado atual
                    </label>
                    {(() => {
                      const badge = getVerificacaoBadge(formador.verificacaoCertificado);
                      const Icon = badge.icon;
                      return (
                        <div className="flex items-center gap-2">
                          <Badge variant={badge.variant}>
                            <Icon className="w-3.5 h-3.5 mr-1" />
                            {badge.label}
                          </Badge>
                        </div>
                      );
                    })()}
                    {formador.verificacaoData && (
                      <p className="text-xs text-slate-400 mt-1">
                        {format(new Date(formador.verificacaoData), "d 'de' MMM yyyy, HH:mm", { locale: pt })}
                        {formador.verificacaoPor && ` por ${formador.verificacaoPor}`}
                      </p>
                    )}
                  </div>

                  {/* Dados do certificado */}
                  <div className="p-3 bg-slate-50 rounded-lg text-sm space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tipo</span>
                      <span className="text-slate-900 font-medium">{formador.certificacaoPedagogica}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Número</span>
                      <span className="text-slate-900 font-medium">{formador.numeroCertificacao || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Validade</span>
                      <span className="text-slate-900 font-medium">
                        {formador.validadeCertificacao
                          ? format(new Date(formador.validadeCertificacao), 'dd/MM/yyyy')
                          : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Selecionar nova verificação */}
                  <div>
                    <label className="text-sm font-medium text-slate-600 block mb-1.5">
                      Resultado da verificação
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {VERIFICACAO_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const isSelected = verificacaoStatus === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => setVerificacaoStatus(opt.value)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                              isSelected
                                ? 'border-amber-400 bg-amber-50 text-amber-700'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-600' : opt.color}`} />
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notas da verificação */}
                  <div>
                    <label className="text-sm font-medium text-slate-600 block mb-1.5">
                      Observações
                    </label>
                    <textarea
                      value={verificacaoNotas}
                      onChange={(e) => setVerificacaoNotas(e.target.value)}
                      placeholder="Notas sobre a verificação do certificado..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-y min-h-[60px] focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={handleVerificarCertificado}
                    isLoading={isVerificando}
                    disabled={
                      verificacaoStatus === (formador.verificacaoCertificado || 'pendente') &&
                      verificacaoNotas === (formador.verificacaoNotas || '')
                    }
                  >
                    Confirmar Verificação
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Centro de Formação */}
            {centro && (
              <Card variant="bordered">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Building2 className="w-5 h-5 text-sky-500" />
                    Centro de Formação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="text-slate-500">Nome</dt>
                      <dd className="text-slate-900 font-medium mt-0.5">{centro.nome}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Localidade</dt>
                      <dd className="text-slate-900 mt-0.5">{centro.localidade}, {centro.pais}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            )}

            {/* Resumo */}
            <Card variant="bordered">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="w-5 h-5 text-slate-400" />
                  Resumo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-slate-500">Data de registo</dt>
                    <dd className="text-slate-900 font-medium mt-0.5">
                      {format(new Date(formador.dataCriacao), "d 'de' MMMM 'de' yyyy", { locale: pt })}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Última atualização</dt>
                    <dd className="text-slate-900 font-medium mt-0.5">
                      {format(new Date(formador.dataAtualizacao), "d 'de' MMMM 'de' yyyy", { locale: pt })}
                    </dd>
                  </div>
                  <div className="pt-3 border-t border-slate-100">
                    <dt className="text-slate-500">Notas do regulador</dt>
                    <dd className="text-slate-900 font-semibold text-lg mt-0.5">
                      {notas.length}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
