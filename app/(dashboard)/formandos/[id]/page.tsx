'use client';

import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Calendar,
  Edit,
  Mail,
  Plus,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header } from '../../../components/layout';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Modal,
  ModalFooter,
  Select,
} from '../../../components/ui';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import * as enrollmentService from '../../../lib/enrollmentService';
import * as formandosService from '../../../lib/formandosService';
import type { Enrollment, UserAccount } from '../../../types';

export default function FormandoDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const { user, center } = useAuth();
  const { state } = useApp();
  const toast = useToast();
  const [formando, setFormando] = useState<UserAccount | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showRemoveEnrollmentModal, setShowRemoveEnrollmentModal] =
    useState(false);
  const [selectedEnrollment, setSelectedEnrollment] =
    useState<Enrollment | null>(null);
  const [newCourseId, setNewCourseId] = useState('');

  const formandoId = params.id as string;

  useEffect(() => {
    if (user && user.role !== 'responsavel' && user.role !== 'assistente') {
      router.push('/');
      return;
    }
    loadFormando();
  }, [formandoId, user]);

  const loadFormando = async () => {
    setIsLoading(true);
    try {
      const data = await formandosService.getFormando(formandoId);
      if (data) {
        setFormando(data);
        const enrollmentData =
          await enrollmentService.getEnrollmentsByFormando(formandoId);
        setEnrollments(enrollmentData);
      } else {
        toast.error(
          'Formando não encontrado',
          'O formando solicitado não existe.'
        );
        router.push('/formandos');
      }
    } catch (error) {
      console.error('Erro ao carregar formando:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar conflitos de horário entre sessões do novo curso e cursos já inscritos
  const checkScheduleConflicts = (cursoId: string): string[] => {
    const conflicts: string[] = [];
    const cursosInscritos = enrollments
      .filter((e) => e.status === 'ativo')
      .map((e) => e.cursoId);

    const sessoesNovoCurso = state.sessoes.filter((s) => s.cursoId === cursoId);
    const sessoesExistentes = state.sessoes.filter((s) =>
      cursosInscritos.includes(s.cursoId)
    );

    for (const novaSessao of sessoesNovoCurso) {
      for (const existente of sessoesExistentes) {
        // Verificar se as datas se sobrepõem
        if (novaSessao.data === existente.data) {
          // Verificar sobreposição de horários
          const novaInicio = novaSessao.horaInicio;
          const novaFim = novaSessao.horaFim;
          const existInicio = existente.horaInicio;
          const existFim = existente.horaFim;

          if (novaInicio < existFim && novaFim > existInicio) {
            const cursoExistente = state.cursos.find(
              (c) => c.id === existente.cursoId
            );
            conflicts.push(
              `"${novaSessao.nome}" conflita com "${existente.nome}" (${cursoExistente?.nome}) em ${novaSessao.data} ${novaInicio}-${novaFim}`
            );
          }
        }
      }
    }

    return conflicts;
  };

  const handleAddCourse = async () => {
    if (!newCourseId || !center?.id) return;

    // Verificar se já está inscrito
    const alreadyEnrolled = await enrollmentService.checkEnrollmentExists(
      formandoId,
      newCourseId
    );
    if (alreadyEnrolled) {
      toast.error('Já inscrito', 'O formando já está inscrito neste curso.');
      return;
    }

    // Verificar conflitos de horário
    const conflicts = checkScheduleConflicts(newCourseId);
    if (conflicts.length > 0) {
      toast.error(
        'Conflito de horários',
        `Existem conflitos de horário:\n${conflicts.slice(0, 3).join('\n')}`
      );
      return;
    }

    try {
      const enrollment = await enrollmentService.createEnrollment(
        formandoId,
        newCourseId,
        center.id
      );
      setEnrollments((prev) => [...prev, enrollment]);
      const curso = state.cursos.find((c) => c.id === newCourseId);
      toast.success(
        'Inscrição realizada',
        `Inscrito em "${curso?.nome}" com sucesso.`
      );
      setShowAddCourseModal(false);
      setNewCourseId('');
    } catch (error) {
      console.error('Erro ao inscrever:', error);
      toast.error('Erro', 'Não foi possível realizar a inscrição.');
    }
  };

  const handleRemoveEnrollment = async () => {
    if (!selectedEnrollment) return;

    try {
      await enrollmentService.removeEnrollment(selectedEnrollment.id);
      setEnrollments((prev) =>
        prev.filter((e) => e.id !== selectedEnrollment.id)
      );
      const curso = state.cursos.find(
        (c) => c.id === selectedEnrollment.cursoId
      );
      toast.success(
        'Inscrição removida',
        `Inscrição em "${curso?.nome}" removida.`
      );
      setShowRemoveEnrollmentModal(false);
      setSelectedEnrollment(null);
    } catch (error) {
      console.error('Erro ao remover inscrição:', error);
      toast.error('Erro', 'Não foi possível remover a inscrição.');
    }
  };

  // Cursos disponíveis para inscrição (ativos e não já inscritos)
  const cursosInscritos = enrollments
    .filter((e) => e.status === 'ativo')
    .map((e) => e.cursoId);
  const cursosDisponiveis = state.cursos.filter(
    (c) => c.status === 'ativo' && !cursosInscritos.includes(c.id) && (!center?.id || c.centroFormacaoId === center.id)
  );

  if (isLoading) {
    return (
      <>
        <Header title="Detalhes do Formando" subtitle="A carregar..." />
        <div className="p-8 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (!formando) return null;

  return (
    <>
      <Header
        title={formando.nome}
        subtitle="Detalhes e inscrições do formando"
        breadcrumbs={[{ label: 'Formandos', href: '/formandos' }, { label: formando.nome }]}
      />

      <div className="p-8 max-w-4xl">
        {/* Voltar e ações */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/formandos')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Voltar
          </Button>
          <Link href={`/formandos/${formandoId}/editar`}>
            <Button variant="outline" leftIcon={<Edit className="w-4 h-4" />}>
              Editar
            </Button>
          </Link>
        </div>

        {/* Dados pessoais */}
        <Card variant="bordered" className="mb-6">
          <CardHeader>
            <CardTitle>Dados Pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-2xl font-bold">
                {formando.nome.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {formando.nome}
                </h2>
                <Badge variant={formando.ativo ? 'success' : 'default'}>
                  {formando.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-sm font-medium text-slate-900">
                    {formando.email}
                  </p>
                </div>
              </div>
              {formando.dataNascimento && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Data de Nascimento</p>
                    <p className="text-sm font-medium text-slate-900">
                      {format(
                        new Date(formando.dataNascimento),
                        "d 'de' MMMM 'de' yyyy",
                        { locale: pt }
                      )}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Registado desde</p>
                  <p className="text-sm font-medium text-slate-900">
                    {format(
                      new Date(formando.dataCriacao),
                      "d 'de' MMMM 'de' yyyy",
                      { locale: pt }
                    )}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cursos inscritos */}
        <Card variant="bordered">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>Cursos Inscritos</CardTitle>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setShowAddCourseModal(true)}
                disabled={cursosDisponiveis.length === 0}
              >
                Inscrever em Curso
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {enrollments.filter((e) => e.status === 'ativo').length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Nenhum curso inscrito.</p>
                <p className="text-sm text-slate-400">
                  Clique em &quot;Inscrever em Curso&quot; para adicionar.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {enrollments
                  .filter((e) => e.status === 'ativo')
                  .map((enrollment) => {
                    const curso = state.cursos.find(
                      (c) => c.id === enrollment.cursoId
                    );
                    const sessoesCurso = state.sessoes.filter(
                      (s) => s.cursoId === enrollment.cursoId
                    );

                    return (
                      <div
                        key={enrollment.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-900">
                              {curso?.nome || 'Curso desconhecido'}
                            </h4>
                            <p className="text-sm text-slate-500">
                              {curso?.codigo} • {curso?.duracaoTotal}h •{' '}
                              {sessoesCurso.length} sessões
                            </p>
                            <p className="text-xs text-slate-400">
                              Inscrito em{' '}
                              {format(
                                new Date(enrollment.dataInscricao),
                                'd MMM yyyy',
                                { locale: pt }
                              )}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedEnrollment(enrollment);
                            setShowRemoveEnrollmentModal(true);
                          }}
                          className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors"
                          title="Remover inscrição"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal: Inscrever em curso */}
      <Modal
        isOpen={showAddCourseModal}
        onClose={() => {
          setShowAddCourseModal(false);
          setNewCourseId('');
        }}
        title="Inscrever em Curso"
        size="md"
      >
        <div className="space-y-4">
          <Select
            label="Selecionar curso"
            options={cursosDisponiveis.map((c) => ({
              value: c.id,
              label: `${c.nome} (${c.codigo})`,
            }))}
            placeholder="Escolha um curso..."
            value={newCourseId}
            onChange={(e) => setNewCourseId(e.target.value)}
          />
          {newCourseId && checkScheduleConflicts(newCourseId).length > 0 && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2 text-amber-700 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium text-sm">
                  Conflitos de horário detetados
                </span>
              </div>
              <ul className="text-xs text-amber-600 space-y-1">
                {checkScheduleConflicts(newCourseId).map((conflict, i) => (
                  <li key={i}>• {conflict}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddCourseModal(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleAddCourse}
            disabled={
              !newCourseId || checkScheduleConflicts(newCourseId).length > 0
            }
          >
            Inscrever
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal: Remover inscrição */}
      <Modal
        isOpen={showRemoveEnrollmentModal}
        onClose={() => {
          setShowRemoveEnrollmentModal(false);
          setSelectedEnrollment(null);
        }}
        title="Remover Inscrição"
        size="sm"
      >
        <p className="text-slate-600">
          Tem a certeza que pretende remover a inscrição de{' '}
          <strong>{formando?.nome}</strong> do curso{' '}
          <strong>
            {
              state.cursos.find((c) => c.id === selectedEnrollment?.cursoId)
                ?.nome
            }
          </strong>
          ?
        </p>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => setShowRemoveEnrollmentModal(false)}
          >
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleRemoveEnrollment}>
            Remover
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
