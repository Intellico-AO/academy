'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useApp } from '../../../context/AppContext';
import { Header } from '../../../components/layout';
import { Button, Input, TextArea, Card, CardContent, CardHeader, CardTitle, Select } from '../../../components/ui';
import * as trainersService from '../../../lib/trainersService';
import type { Trainer } from '../../../types';
import { ArrowLeft, Plus, Trash2, GripVertical, Save, BookOpen, Edit, ChevronUp, ChevronDown } from 'lucide-react';
import { CourseFormData, CourseModule } from '../../../types';

type ModuleFormData = Omit<CourseModule, 'id' | 'ordem'>;

export default function NovoCursoPage() {
  const router = useRouter();
  const { center, user } = useAuth();
  const { adicionarCurso } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const podeEscalarFormador = user?.role === 'responsavel' || user?.role === 'assistente';

  useEffect(() => {
    if (center?.id) {
      trainersService.getActiveTrainers(center.id).then(setTrainers);
    }
  }, [center?.id]);

  const [formData, setFormData] = useState<CourseFormData>({
    codigo: '',
    nome: '',
    descricao: '',
    objetivosGerais: [''],
    publicoAlvo: '',
    prerequisitos: [''],
    avaliacao: '',
    certificacao: '',
    modulos: [],
  });

  const [currentModule, setCurrentModule] = useState<ModuleFormData>({
    nome: '',
    descricao: '',
    duracaoHoras: 1,
    objetivos: [''],
    conteudos: [''],
  });
  const [editingModuleIndex, setEditingModuleIndex] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const curso = await adicionarCurso({
        ...formData,
        objetivosGerais: formData.objetivosGerais.filter((o) => o.trim()),
        prerequisitos: formData.prerequisitos.filter((p) => p.trim()),
      });
      router.push(`/cursos/${curso.id}`);
    } catch (error) {
      console.error('Erro ao criar curso:', error);
      setIsSubmitting(false);
    }
  };

  const addObjectivo = () => {
    setFormData((prev) => ({
      ...prev,
      objetivosGerais: [...prev.objetivosGerais, ''],
    }));
  };

  const updateObjectivo = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      objetivosGerais: prev.objetivosGerais.map((o, i) => (i === index ? value : o)),
    }));
  };

  const removeObjectivo = (index: number) => {
    if (formData.objetivosGerais.length > 1) {
      setFormData((prev) => ({
        ...prev,
        objetivosGerais: prev.objetivosGerais.filter((_, i) => i !== index),
      }));
    }
  };

  const addPrerequisito = () => {
    setFormData((prev) => ({
      ...prev,
      prerequisitos: [...prev.prerequisitos, ''],
    }));
  };

  const updatePrerequisito = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      prerequisitos: prev.prerequisitos.map((p, i) => (i === index ? value : p)),
    }));
  };

  const removePrerequisito = (index: number) => {
    if (formData.prerequisitos.length > 1) {
      setFormData((prev) => ({
        ...prev,
        prerequisitos: prev.prerequisitos.filter((_, i) => i !== index),
      }));
    }
  };

  const addModuleObjectivo = () => {
    setCurrentModule((prev) => ({
      ...prev,
      objetivos: [...prev.objetivos, ''],
    }));
  };

  const updateModuleObjectivo = (index: number, value: string) => {
    setCurrentModule((prev) => ({
      ...prev,
      objetivos: prev.objetivos.map((o, i) => (i === index ? value : o)),
    }));
  };

  const removeModuleObjectivo = (index: number) => {
    if (currentModule.objetivos.length > 1) {
      setCurrentModule((prev) => ({
        ...prev,
        objetivos: prev.objetivos.filter((_, i) => i !== index),
      }));
    }
  };

  const addModuleConteudo = () => {
    setCurrentModule((prev) => ({
      ...prev,
      conteudos: [...prev.conteudos, ''],
    }));
  };

  const updateModuleConteudo = (index: number, value: string) => {
    setCurrentModule((prev) => ({
      ...prev,
      conteudos: prev.conteudos.map((c, i) => (i === index ? value : c)),
    }));
  };

  const removeModuleConteudo = (index: number) => {
    if (currentModule.conteudos.length > 1) {
      setCurrentModule((prev) => ({
        ...prev,
        conteudos: prev.conteudos.filter((_, i) => i !== index),
      }));
    }
  };

  const resetModuleForm = () => {
    setCurrentModule({
      nome: '',
      descricao: '',
      duracaoHoras: 1,
      objetivos: [''],
      conteudos: [''],
    });
    setEditingModuleIndex(null);
  };

  const addModule = () => {
    if (!currentModule.nome.trim()) return;

    const moduleData = {
      ...currentModule,
      objetivos: currentModule.objetivos.filter((o) => o.trim()),
      conteudos: currentModule.conteudos.filter((c) => c.trim()),
    };

    if (editingModuleIndex !== null) {
      // Atualizar módulo existente
      setFormData((prev) => ({
        ...prev,
        modulos: prev.modulos.map((m, i) => (i === editingModuleIndex ? moduleData : m)),
      }));
    } else {
      // Adicionar novo módulo
      setFormData((prev) => ({
        ...prev,
        modulos: [...prev.modulos, moduleData],
      }));
    }
    resetModuleForm();
  };

  const editModule = (index: number) => {
    const modulo = formData.modulos[index];
    setCurrentModule({
      nome: modulo.nome,
      descricao: modulo.descricao,
      duracaoHoras: modulo.duracaoHoras,
      objetivos: modulo.objetivos.length > 0 ? modulo.objetivos : [''],
      conteudos: modulo.conteudos.length > 0 ? modulo.conteudos : [''],
    });
    setEditingModuleIndex(index);
  };

  const removeModule = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      modulos: prev.modulos.filter((_, i) => i !== index),
    }));
    if (editingModuleIndex === index) resetModuleForm();
  };

  const moveModule = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.modulos.length) return;
    setFormData((prev) => {
      const modulos = [...prev.modulos];
      [modulos[index], modulos[newIndex]] = [modulos[newIndex], modulos[index]];
      return { ...prev, modulos };
    });
  };

  const totalDuration = formData.modulos.reduce((acc, m) => acc + m.duracaoHoras, 0);

  const buildAiContext = () => {
    const parts: string[] = ['FORMULÁRIO: Curso Formativo'];
    if (formData.codigo) parts.push(`Código: ${formData.codigo}`);
    if (formData.nome) parts.push(`Nome: ${formData.nome}`);
    if (formData.descricao) parts.push(`Descrição: ${formData.descricao}`);
    if (formData.publicoAlvo) parts.push(`Público-alvo: ${formData.publicoAlvo}`);
    if (formData.objetivosGerais.some((o) => o.trim())) parts.push(`Objetivos: ${formData.objetivosGerais.filter((o) => o.trim()).join('; ')}`);
    if (formData.modulos.length > 0) parts.push(`Módulos: ${formData.modulos.map((m) => m.nome).join(', ')}`);
    if (formData.avaliacao) parts.push(`Avaliação: ${formData.avaliacao}`);
    if (formData.certificacao) parts.push(`Certificação: ${formData.certificacao}`);
    return parts.join('\n');
  };

  return (
    <>
      <Header title="Novo Curso" subtitle="Criar um novo curso formativo" breadcrumbs={[{ label: 'Cursos', href: '/cursos' }, { label: 'Novo Curso' }]} />

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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Código do Curso"
                  placeholder="Ex: FORM-001"
                  value={formData.codigo}
                  onChange={(e) => setFormData((prev) => ({ ...prev, codigo: e.target.value }))}
                  required
                />
                <div className="md:col-span-2">
                  <Input
                    label="Nome do Curso"
                    placeholder="Ex: Introdução à Gestão de Projetos"
                    value={formData.nome}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <TextArea
                label="Descrição"
                placeholder="Descreva o curso, o seu propósito e conteúdo principal..."
                value={formData.descricao}
                onChange={(e) => setFormData((prev) => ({ ...prev, descricao: e.target.value }))}
                onAiGenerate={(text) => setFormData((prev) => ({ ...prev, descricao: text }))}
                aiContext={buildAiContext()}
                rows={4}
              />

              <Input
                label="Público-Alvo"
                placeholder="Ex: Profissionais de TI com 2+ anos de experiência"
                value={formData.publicoAlvo}
                onChange={(e) => setFormData((prev) => ({ ...prev, publicoAlvo: e.target.value }))}
              />

              {podeEscalarFormador && (
                <Select
                  label="Formador Responsável"
                  options={trainers.map((t) => ({ value: t.id, label: t.nome }))}
                  placeholder="Selecione um formador (opcional)"
                  value={formData.formadorId || ''}
                  onChange={(e) => {
                    const trainer = trainers.find((t) => t.id === e.target.value);
                    setFormData((prev) => ({
                      ...prev,
                      formadorId: e.target.value || undefined,
                      formadorNome: trainer?.nome || undefined,
                    }));
                  }}
                />
              )}
            </CardContent>
          </Card>

          {/* Objetivos Gerais */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Objetivos Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.objetivosGerais.map((obj, index) => (
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
                    disabled={formData.objetivosGerais.length === 1}
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

          {/* Pré-requisitos */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Pré-requisitos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.prerequisitos.map((prereq, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Pré-requisito ${index + 1}`}
                    value={prereq}
                    onChange={(e) => updatePrerequisito(index, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePrerequisito(index)}
                    className="!px-2"
                    disabled={formData.prerequisitos.length === 1}
                  >
                    <Trash2 className="w-4 h-4 text-slate-400" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPrerequisito}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Adicionar Pré-requisito
              </Button>
            </CardContent>
          </Card>

          {/* Módulos */}
          <Card variant="bordered">
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle>Módulos do Curso</CardTitle>
                <span className="text-sm text-slate-500">
                  {formData.modulos.length} módulos • {totalDuration}h total
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {/* Lista de Módulos Adicionados */}
              {formData.modulos.length > 0 && (
                <div className="space-y-3 mb-6">
                  {formData.modulos.map((modulo, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-4 rounded-lg border ${editingModuleIndex === index ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'}`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          onClick={() => moveModule(index, 'up')}
                          disabled={index === 0}
                          className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveModule(index, 'down')}
                          disabled={index === formData.modulos.length - 1}
                          className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{modulo.nome}</p>
                        <p className="text-sm text-slate-500">
                          {modulo.duracaoHoras}h • {modulo.objetivos.length} objetivos •{' '}
                          {modulo.conteudos.length} conteúdos
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editModule(index)}
                        className="!px-2"
                      >
                        <Edit className="w-4 h-4 text-slate-500" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeModule(index)}
                        className="!px-2"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Formulário Novo/Editar Módulo */}
              <div className={`p-4 rounded-lg border border-dashed ${editingModuleIndex !== null ? 'bg-amber-50/50 border-amber-300' : 'bg-emerald-50/50 border-emerald-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-slate-900 flex items-center gap-2">
                    <BookOpen className={`w-4 h-4 ${editingModuleIndex !== null ? 'text-amber-600' : 'text-emerald-600'}`} />
                    {editingModuleIndex !== null ? `Editar Módulo ${editingModuleIndex + 1}` : 'Adicionar Novo Módulo'}
                  </h4>
                  {editingModuleIndex !== null && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={resetModuleForm}
                    >
                      Cancelar edição
                    </Button>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-3">
                      <Input
                        label="Nome do Módulo"
                        placeholder="Ex: Fundamentos de Gestão"
                        value={currentModule.nome}
                        onChange={(e) =>
                          setCurrentModule((prev) => ({ ...prev, nome: e.target.value }))
                        }
                      />
                    </div>
                    <Input
                      label="Duração (horas)"
                      type="number"
                      min={1}
                      value={currentModule.duracaoHoras}
                      onChange={(e) =>
                        setCurrentModule((prev) => ({
                          ...prev,
                          duracaoHoras: parseInt(e.target.value) || 1,
                        }))
                      }
                    />
                  </div>

                  <TextArea
                    label="Descrição do Módulo"
                    placeholder="Descreva o conteúdo e propósito deste módulo..."
                    value={currentModule.descricao}
                    onChange={(e) =>
                      setCurrentModule((prev) => ({ ...prev, descricao: e.target.value }))
                    }
                    onAiGenerate={(text) => setCurrentModule((prev) => ({ ...prev, descricao: text }))}
                    aiContext={buildAiContext() + (currentModule.nome ? `\nMódulo atual: ${currentModule.nome}` : '')}
                    rows={2}
                  />

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Objetivos do Módulo
                    </label>
                    <div className="space-y-2">
                      {currentModule.objetivos.map((obj, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder={`Objetivo ${index + 1}`}
                            value={obj}
                            onChange={(e) => updateModuleObjectivo(index, e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeModuleObjectivo(index)}
                            className="!px-2"
                            disabled={currentModule.objetivos.length === 1}
                          >
                            <Trash2 className="w-4 h-4 text-slate-400" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={addModuleObjectivo}
                        leftIcon={<Plus className="w-4 h-4" />}
                      >
                        Adicionar Objetivo
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Conteúdos Programáticos
                    </label>
                    <div className="space-y-2">
                      {currentModule.conteudos.map((cont, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder={`Conteúdo ${index + 1}`}
                            value={cont}
                            onChange={(e) => updateModuleConteudo(index, e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeModuleConteudo(index)}
                            className="!px-2"
                            disabled={currentModule.conteudos.length === 1}
                          >
                            <Trash2 className="w-4 h-4 text-slate-400" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={addModuleConteudo}
                        leftIcon={<Plus className="w-4 h-4" />}
                      >
                        Adicionar Conteúdo
                      </Button>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <Button
                      type="button"
                      variant={editingModuleIndex !== null ? 'primary' : 'secondary'}
                      onClick={addModule}
                      leftIcon={editingModuleIndex !== null ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      disabled={!currentModule.nome.trim()}
                    >
                      {editingModuleIndex !== null ? 'Guardar Alterações' : 'Adicionar Módulo'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Avaliação */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Avaliação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <TextArea
                label="Avaliação"
                placeholder="Descreva os critérios e métodos de avaliação..."
                value={formData.avaliacao}
                onChange={(e) => setFormData((prev) => ({ ...prev, avaliacao: e.target.value }))}
                onAiGenerate={(text) => setFormData((prev) => ({ ...prev, avaliacao: text }))}
                aiContext={buildAiContext()}
                rows={3}
              />

              <Input
                label="Certificação"
                placeholder="Ex: Certificado de Conclusão emitido pela entidade formadora"
                value={formData.certificacao}
                onChange={(e) => setFormData((prev) => ({ ...prev, certificacao: e.target.value }))}
              />
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
              Guardar Curso
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
