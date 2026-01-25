'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../../context/AppContext';
import { Header } from '../../../components/layout';
import { Button, Input, TextArea, Card, CardContent, CardHeader, CardTitle } from '../../../components/ui';
import { ArrowLeft, Plus, Trash2, GripVertical, Save, BookOpen } from 'lucide-react';
import { CourseFormData, CourseModule } from '../../../types';

type ModuleFormData = Omit<CourseModule, 'id' | 'ordem'>;

export default function NovoCursoPage() {
  const router = useRouter();
  const { adicionarCurso } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CourseFormData>({
    codigo: '',
    nome: '',
    descricao: '',
    objetivosGerais: [''],
    publicoAlvo: '',
    prerequisitos: [''],
    metodologia: '',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const curso = adicionarCurso({
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

  const addModule = () => {
    if (currentModule.nome.trim()) {
      setFormData((prev) => ({
        ...prev,
        modulos: [
          ...prev.modulos,
          {
            ...currentModule,
            objetivos: currentModule.objetivos.filter((o) => o.trim()),
            conteudos: currentModule.conteudos.filter((c) => c.trim()),
          },
        ],
      }));
      setCurrentModule({
        nome: '',
        descricao: '',
        duracaoHoras: 1,
        objetivos: [''],
        conteudos: [''],
      });
    }
  };

  const removeModule = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      modulos: prev.modulos.filter((_, i) => i !== index),
    }));
  };

  const totalDuration = formData.modulos.reduce((acc, m) => acc + m.duracaoHoras, 0);

  return (
    <>
      <Header title="Novo Curso" subtitle="Criar um novo curso formativo" />

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
                rows={4}
              />

              <Input
                label="Público-Alvo"
                placeholder="Ex: Profissionais de TI com 2+ anos de experiência"
                value={formData.publicoAlvo}
                onChange={(e) => setFormData((prev) => ({ ...prev, publicoAlvo: e.target.value }))}
              />
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
                      className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <GripVertical className="w-5 h-5 text-slate-300 cursor-grab" />
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
                        onClick={() => removeModule(index)}
                        className="!px-2"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Formulário Novo Módulo */}
              <div className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-200 border-dashed">
                <h4 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  Adicionar Novo Módulo
                </h4>
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

                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={addModule}
                      leftIcon={<Plus className="w-4 h-4" />}
                      disabled={!currentModule.nome.trim()}
                    >
                      Adicionar Módulo
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metodologia e Avaliação */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Metodologia e Avaliação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <TextArea
                label="Metodologia"
                placeholder="Descreva a metodologia pedagógica utilizada no curso..."
                value={formData.metodologia}
                onChange={(e) => setFormData((prev) => ({ ...prev, metodologia: e.target.value }))}
                rows={3}
              />

              <TextArea
                label="Avaliação"
                placeholder="Descreva os critérios e métodos de avaliação..."
                value={formData.avaliacao}
                onChange={(e) => setFormData((prev) => ({ ...prev, avaliacao: e.target.value }))}
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
