'use client';

import { use, useEffect, useState, useMemo } from 'react';
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
import * as firebaseService from '../../../lib/firebaseService';
import * as trainersService from '../../../lib/trainersService';
import * as reguladorNotasService from '../../../lib/reguladorNotasService';
import {
  TrainingCenter,
  Course,
  Trainer,
  ReguladorNota,
  NotaCategoria,
  Status,
} from '../../../types';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  User,
  Award,
  BookOpen,
  GraduationCap,
  MessageSquarePlus,
  Pencil,
  Trash2,
  Send,
  X,
  Clock,
  FileText,
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

// Componente para exibir e gerir notas de uma secção
function SeccaoNotas({
  categoria,
  referenciaId,
  referenciaNome,
  notas,
  onAdd,
  onEdit,
  onDelete,
}: {
  categoria: NotaCategoria;
  referenciaId?: string;
  referenciaNome?: string;
  notas: ReguladorNota[];
  onAdd: (conteudo: string, categoria: NotaCategoria, referenciaId?: string, referenciaNome?: string) => Promise<void>;
  onEdit: (id: string, conteudo: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newNota, setNewNota] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const filteredNotas = notas.filter(
    (n) =>
      n.categoria === categoria &&
      (referenciaId ? n.referenciaId === referenciaId : !n.referenciaId)
  );

  const handleAdd = async () => {
    if (!newNota.trim()) return;
    setIsSaving(true);
    try {
      await onAdd(newNota.trim(), categoria, referenciaId, referenciaNome);
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
      {/* Notas existentes */}
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

      {/* Botão adicionar / Formulário */}
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

// Componente para cada formador com controlo de estado
function FormadorItem({
  formador,
  notas,
  onAddNota,
  onEditNota,
  onDeleteNota,
  onStatusChange,
}: {
  formador: Trainer;
  notas: ReguladorNota[];
  onAddNota: (conteudo: string, categoria: NotaCategoria, referenciaId?: string, referenciaNome?: string) => Promise<void>;
  onEditNota: (id: string, conteudo: string) => Promise<void>;
  onDeleteNota: (id: string) => Promise<void>;
  onStatusChange: (formadorId: string, status: Status) => Promise<void>;
}) {
  const [selectedStatus, setSelectedStatus] = useState<Status>(formador.status);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (selectedStatus === formador.status) return;
    setIsSaving(true);
    try {
      await onStatusChange(formador.id, selectedStatus);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="border border-slate-100 rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-medium text-slate-900 text-sm">
            {formador.nome}
          </h4>
          <p className="text-xs text-slate-500">
            {formador.email} &middot; {formador.experienciaAnos} anos de experiência
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as Status)}
            className="px-2 py-1 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {selectedStatus !== formador.status && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-2 py-1 text-xs bg-amber-500 text-white rounded-md hover:bg-amber-600 disabled:opacity-50"
            >
              {isSaving ? '...' : 'Guardar'}
            </button>
          )}
        </div>
      </div>
      {formador.areasCompetencia?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-1">
          {formador.areasCompetencia.map((area, i) => (
            <span
              key={i}
              className="inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full"
            >
              {area}
            </span>
          ))}
        </div>
      )}
      <SeccaoNotas
        categoria="formador"
        referenciaId={formador.id}
        referenciaNome={formador.nome}
        notas={notas}
        onAdd={onAddNota}
        onEdit={onEditNota}
        onDelete={onDeleteNota}
      />
    </div>
  );
}

export default function DetalheCentroPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  const [centro, setCentro] = useState<TrainingCenter | null>(null);
  const [cursos, setCursos] = useState<Course[]>([]);
  const [formadores, setFormadores] = useState<Trainer[]>([]);
  const [notas, setNotas] = useState<ReguladorNota[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estado para alterar status
  const [newStatus, setNewStatus] = useState<Status | ''>('');
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  // Verificar acesso
  useEffect(() => {
    if (user && user.role !== 'regulador') {
      router.push('/');
      toast.error('Acesso negado');
    }
  }, [user, router, toast]);

  // Carregar dados
  useEffect(() => {
    const load = async () => {
      try {
        const [centroData, allCursos, allFormadores, notasData] =
          await Promise.all([
            authService.getTrainingCenter(id),
            firebaseService.getCourses(),
            trainersService.getAllTrainers(),
            reguladorNotasService.getNotasByCentro(id),
          ]);

        setCentro(centroData);
        setCursos(allCursos.filter((c) => c.centroFormacaoId === id));
        setFormadores(allFormadores.filter((f) => f.centroFormacaoId === id));
        setNotas(notasData);

        if (centroData) {
          setNewStatus(centroData.status);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do centro:', error);
        toast.error('Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [id, toast]);

  // Handlers de notas
  const handleAddNota = async (
    conteudo: string,
    categoria: NotaCategoria,
    referenciaId?: string,
    referenciaNome?: string
  ) => {
    if (!user) return;
    try {
      const nova = await reguladorNotasService.createNota({
        centroFormacaoId: id,
        reguladorId: user.id,
        categoria,
        referenciaId,
        referenciaNome,
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

  // Handler de alteração de estado do formador
  const handleChangeFormadorStatus = async (formadorId: string, status: Status) => {
    try {
      await trainersService.updateTrainerStatus(formadorId, status);
      setFormadores((prev) =>
        prev.map((f) =>
          f.id === formadorId ? { ...f, status } : f
        )
      );
      toast.success('Estado do formador atualizado');
    } catch (error) {
      console.error('Erro ao alterar estado do formador:', error);
      toast.error('Erro ao alterar estado do formador');
    }
  };

  // Handler de alteração de estado do centro
  const handleChangeStatus = async () => {
    if (!centro || !newStatus || newStatus === centro.status) return;
    setIsChangingStatus(true);
    try {
      await authService.updateTrainingCenter(id, { status: newStatus });
      setCentro({ ...centro, status: newStatus });
      toast.success('Estado atualizado', `Centro alterado para "${getStatusLabel(newStatus)}"`);
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
        <Header title="Detalhes do Centro" subtitle="A carregar..." />
        <div className="p-8 flex justify-center">
          <LoadingSpinner />
        </div>
      </>
    );
  }

  if (!centro) {
    return (
      <>
        <Header title="Centro não encontrado" />
        <div className="p-8 text-center">
          <p className="text-slate-500 mb-4">O centro de formação solicitado não foi encontrado.</p>
          <Button variant="ghost" onClick={() => router.push('/regulador/centros')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar à lista
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title={centro.nome}
        subtitle="Detalhes do centro de formação"
      />

      <div className="p-8 space-y-6">
        {/* Barra superior */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/regulador/centros')}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar à lista
          </button>
          <Badge variant={getStatusBadgeVariant(centro.status)}>
            {getStatusLabel(centro.status)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Gerais */}
            <Card variant="bordered">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-sky-500" />
                  Informações Gerais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-slate-500 font-medium">Nome</dt>
                    <dd className="text-slate-900 mt-0.5">{centro.nome}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 font-medium">NIF</dt>
                    <dd className="text-slate-900 mt-0.5">{centro.nif}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 font-medium">Morada</dt>
                    <dd className="text-slate-900 mt-0.5">{centro.morada}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 font-medium">Código Postal</dt>
                    <dd className="text-slate-900 mt-0.5">{centro.codigoPostal}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 font-medium">Localidade</dt>
                    <dd className="text-slate-900 mt-0.5">{centro.localidade}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 font-medium">País</dt>
                    <dd className="text-slate-900 mt-0.5">{centro.pais}</dd>
                  </div>
                  {centro.website && (
                    <div className="sm:col-span-2">
                      <dt className="text-slate-500 font-medium">Website</dt>
                      <dd className="mt-0.5">
                        <a
                          href={centro.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-600 hover:underline"
                        >
                          {centro.website}
                        </a>
                      </dd>
                    </div>
                  )}
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
                  <Mail className="w-5 h-5 text-emerald-500" />
                  Contacto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-slate-500 font-medium">Email</dt>
                    <dd className="text-slate-900 mt-0.5">{centro.email}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 font-medium">Telefone</dt>
                    <dd className="text-slate-900 mt-0.5">{centro.telefone}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 font-medium">Responsável</dt>
                    <dd className="text-slate-900 mt-0.5">{centro.responsavel}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 font-medium">Email do Responsável</dt>
                    <dd className="text-slate-900 mt-0.5">{centro.emailResponsavel}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 font-medium">Telefone do Responsável</dt>
                    <dd className="text-slate-900 mt-0.5">{centro.telefoneResponsavel}</dd>
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

            {/* Certificações e Áreas */}
            <Card variant="bordered">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-violet-500" />
                  Certificações e Áreas de Formação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-2">Certificações</h4>
                    {centro.certificacoes?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {centro.certificacoes.map((cert, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2.5 py-1 bg-violet-50 text-violet-700 text-xs font-medium rounded-full"
                          >
                            {cert}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 italic">Sem certificações registadas</p>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-2">Áreas de Formação</h4>
                    {centro.areasFormacao?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {centro.areasFormacao.map((area, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2.5 py-1 bg-sky-50 text-sky-700 text-xs font-medium rounded-full"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 italic">Sem áreas de formação registadas</p>
                    )}
                  </div>
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

            {/* Cursos */}
            <Card variant="bordered">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-500" />
                  Cursos ({cursos.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cursos.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">Nenhum curso registado neste centro.</p>
                ) : (
                  <div className="space-y-4">
                    {cursos.map((curso) => (
                      <div
                        key={curso.id}
                        className="border border-slate-100 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-slate-900 text-sm">
                              {curso.nome}
                            </h4>
                            <p className="text-xs text-slate-500">
                              Código: {curso.codigo} &middot; {curso.duracaoTotal}h &middot;{' '}
                              {curso.modulos?.length || 0} módulos
                            </p>
                          </div>
                          <Badge variant={getStatusBadgeVariant(curso.status)}>
                            {getStatusLabel(curso.status)}
                          </Badge>
                        </div>
                        {curso.descricao && (
                          <p className="text-sm text-slate-600 line-clamp-2 mb-1">
                            {curso.descricao}
                          </p>
                        )}
                        <SeccaoNotas
                          categoria="curso"
                          referenciaId={curso.id}
                          referenciaNome={curso.nome}
                          notas={notas}
                          onAdd={handleAddNota}
                          onEdit={handleEditNota}
                          onDelete={handleDeleteNota}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Formadores */}
            <Card variant="bordered">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-emerald-500" />
                  Formadores ({formadores.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {formadores.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">Nenhum formador registado neste centro.</p>
                ) : (
                  <div className="space-y-4">
                    {formadores.map((formador) => (
                      <FormadorItem
                        key={formador.id}
                        formador={formador}
                        notas={notas}
                        onAddNota={handleAddNota}
                        onEditNota={handleEditNota}
                        onDeleteNota={handleDeleteNota}
                        onStatusChange={(formadorId, status) => handleChangeFormadorStatus(formadorId, status)}
                      />
                    ))}
                  </div>
                )}
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
                    <Badge variant={getStatusBadgeVariant(centro.status)}>
                      {getStatusLabel(centro.status)}
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
                    disabled={!newStatus || newStatus === centro.status}
                  >
                    Confirmar Alteração
                  </Button>
                </div>
              </CardContent>
            </Card>

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
                      {format(new Date(centro.dataCriacao), "d 'de' MMMM 'de' yyyy", { locale: pt })}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Última atualização</dt>
                    <dd className="text-slate-900 font-medium mt-0.5">
                      {format(new Date(centro.dataAtualizacao), "d 'de' MMMM 'de' yyyy", { locale: pt })}
                    </dd>
                  </div>
                  <div className="pt-3 border-t border-slate-100">
                    <dt className="text-slate-500">Cursos</dt>
                    <dd className="text-slate-900 font-semibold text-lg mt-0.5">
                      {cursos.length}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Formadores</dt>
                    <dd className="text-slate-900 font-semibold text-lg mt-0.5">
                      {formadores.length}
                    </dd>
                  </div>
                  <div>
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
