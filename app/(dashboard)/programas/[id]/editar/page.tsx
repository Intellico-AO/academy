'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../../../context/AppContext';
import { Header } from '../../../../components/layout';
import { Button, Input, TextArea, Card, CardContent, CardHeader, CardTitle, Select } from '../../../../components/ui';
import { ArrowLeft, Plus, Trash2, Save, BookOpen, GripVertical } from 'lucide-react';
import { ProgramFormData, ProgramCourse, Status } from '../../../../types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditarProgramaPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { getPrograma, atualizarPrograma, state } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const programa = getPrograma(id);

  const [formData, setFormData] = useState<ProgramFormData & { status: Status }>({
    codigo: '',
    nome: '',
    descricao: '',
    objetivos: [''],
    cursos: [],
    certificacao: '',
    status: 'rascunho',
  });

  const [selectedCursoId, setSelectedCursoId] = useState('');

  useEffect(() => {
    if (programa && !isLoaded) {
      setFormData({
        codigo: programa.codigo,
        nome: programa.nome,
        descricao: programa.descricao,
        objetivos: programa.objetivos.length > 0 ? programa.objetivos : [''],
        cursos: programa.cursos,
        certificacao: programa.certificacao,
        status: programa.status,
      });
      setIsLoaded(true);
    }
  }, [programa, isLoaded]);

  if (!programa) {
    return (
      <>
        <Header title="Programa não encontrado" />
        <div className="p-8">
          <p className="text-slate-500">O programa solicitado não existe ou foi eliminado.</p>
          <Button onClick={() => router.push('/programas')} className="mt-4">
            Voltar aos Programas
          </Button>
        </div>
      </>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      atualizarPrograma(id, {
        ...formData,
        objetivos: formData.objetivos.filter((o) => o.trim()),
      });
      router.push(`/programas/${id}`);
    } catch (error) {
      console.error('Erro ao atualizar programa:', error);
      setIsSubmitting(false);
    }
  };

  const addObjectivo = () => {
    setFormData((prev) => ({
      ...prev,
      objetivos: [...prev.objetivos, ''],
    }));
  };

  const updateObjectivo = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      objetivos: prev.objetivos.map((o, i) => (i === index ? value : o)),
    }));
  };

  const removeObjectivo = (index: number) => {
    if (formData.objetivos.length > 1) {
      setFormData((prev) => ({
        ...prev,
        objetivos: prev.objetivos.filter((_, i) => i !== index),
      }));
    }
  };

  const addCurso = () => {
    if (selectedCursoId && !formData.cursos.find((c) => c.cursoId === selectedCursoId)) {
      const newCurso: ProgramCourse = {
        cursoId: selectedCursoId,
        ordem: formData.cursos.length + 1,
        obrigatorio: true,
      };
      setFormData((prev) => ({
        ...prev,
        cursos: [...prev.cursos, newCurso],
      }));
      setSelectedCursoId('');
    }
  };

  const removeCurso = (cursoId: string) => {
    setFormData((prev) => ({
      ...prev,
      cursos: prev.cursos.filter((c) => c.cursoId !== cursoId).map((c, i) => ({
        ...c,
        ordem: i + 1,
      })),
    }));
  };

  const toggleObrigatorio = (cursoId: string) => {
    setFormData((prev) => ({
      ...prev,
      cursos: prev.cursos.map((c) =>
        c.cursoId === cursoId ? { ...c, obrigatorio: !c.obrigatorio } : c
      ),
    }));
  };

  const getCursoInfo = (cursoId: string) => {
    return state.cursos.find((c) => c.id === cursoId);
  };

  const cursosDisponiveis = state.cursos.filter(
    (c) => !formData.cursos.find((pc) => pc.cursoId === c.id)
  );

  const totalDuration = formData.cursos.reduce((acc, pc) => {
    const curso = getCursoInfo(pc.cursoId);
    return acc + (curso?.duracaoTotal || 0);
  }, 0);

  return (
    <>
      <Header title="Editar Programa" subtitle={programa.nome} />

      <div className="p-8 max-w-5xl">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Voltar</span>
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  label="Código do Programa"
                  placeholder="Ex: PROG-001"
                  value={formData.codigo}
                  onChange={(e) => setFormData((prev) => ({ ...prev, codigo: e.target.value }))}
                  required
                />
                <div className="md:col-span-2">
                  <Input
                    label="Nome do Programa"
                    placeholder="Ex: Programa de Certificação em Gestão"
                    value={formData.nome}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
                    required
                  />
                </div>
                <Select
                  label="Estado"
                  value={formData.status}
                  onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as Status }))}
                  options={[
                    { value: 'rascunho', label: 'Rascunho' },
                    { value: 'ativo', label: 'Ativo' },
                    { value: 'arquivado', label: 'Arquivado' },
                    { value: 'cancelado', label: 'Cancelado' },
                  ]}
                />
              </div>

              <TextArea
                label="Descrição"
                placeholder="Descreva o programa, o seu propósito e o percurso formativo..."
                value={formData.descricao}
                onChange={(e) => setFormData((prev) => ({ ...prev, descricao: e.target.value }))}
                rows={4}
              />

              <Input
                label="Certificação"
                placeholder="Ex: Diploma de Especialização em Gestão de Projetos"
                value={formData.certificacao}
                onChange={(e) => setFormData((prev) => ({ ...prev, certificacao: e.target.value }))}
              />
            </CardContent>
          </Card>

          {/* Objetivos */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Objetivos do Programa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.objetivos.map((obj, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Objetivo ${index + 1}`}
                    value={obj}
                    onChange={(e) => updateObjectivo(index, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeObjectivo(index)}
                    className="!px-2"
                    disabled={formData.objetivos.length === 1}
                  >
                    <Trash2 className="w-4 h-4 text-slate-400" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addObjectivo}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Adicionar Objetivo
              </Button>
            </CardContent>
          </Card>

          {/* Cursos do Programa */}
          <Card variant="bordered">
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle>Cursos do Programa</CardTitle>
                <span className="text-sm text-slate-500">
                  {formData.cursos.length} cursos • {totalDuration}h total
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {/* Lista de Cursos Adicionados */}
              {formData.cursos.length > 0 && (
                <div className="space-y-3 mb-6">
                  {formData.cursos.map((programCurso, index) => {
                    const curso = getCursoInfo(programCurso.cursoId);
                    if (!curso) return null;
                    
                    return (
                      <div
                        key={programCurso.cursoId}
                        className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <GripVertical className="w-5 h-5 text-slate-300 cursor-grab" />
                        <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900">{curso.nome}</p>
                            <span className="text-xs text-slate-400">({curso.codigo})</span>
                          </div>
                          <p className="text-sm text-slate-500">
                            {curso.duracaoTotal}h • {curso.modulos.length} módulos
                          </p>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={programCurso.obrigatorio}
                            onChange={() => toggleObrigatorio(programCurso.cursoId)}
                            className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                          />
                          <span className="text-sm text-slate-600">Obrigatório</span>
                        </label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCurso(programCurso.cursoId)}
                          className="!px-2"
                        >
                          <Trash2 className="w-4 h-4 text-rose-500" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Adicionar Curso */}
              {cursosDisponiveis.length > 0 && (
                <div className="p-4 bg-sky-50/50 rounded-lg border border-sky-200 border-dashed">
                  <h4 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-sky-600" />
                    Adicionar Curso ao Programa
                  </h4>
                  <div className="flex gap-3">
                    <Select
                      options={cursosDisponiveis.map((c) => ({
                        value: c.id,
                        label: `${c.codigo} - ${c.nome} (${c.duracaoTotal}h)`,
                      }))}
                      placeholder="Selecionar curso..."
                      value={selectedCursoId}
                      onChange={(e) => setSelectedCursoId(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={addCurso}
                      leftIcon={<Plus className="w-4 h-4" />}
                      disabled={!selectedCursoId}
                    >
                      Adicionar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              leftIcon={<Save className="w-4 h-4" />}
              disabled={!formData.codigo || !formData.nome}
            >
              Guardar Alterações
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
