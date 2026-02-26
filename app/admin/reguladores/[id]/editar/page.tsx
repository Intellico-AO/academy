'use client';

import { use, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Scale } from 'lucide-react';

import { Header } from '../../../../components/layout';
import { useAuth } from '../../../../context/AuthContext';
import { useToast } from '../../../../context/ToastContext';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  TextArea,
} from '../../../../components/ui';
import { Regulator, RegulatorFormData, Status } from '../../../../types';
import * as regulatorsService from '../../../../lib/regulatorsService';
import * as firebaseService from '../../../../lib/firebaseService';
import { uploadRegulatorImage } from '../../../../lib/storageService';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditarReguladorPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  const [regulator, setRegulator] = useState<Regulator | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<RegulatorFormData & { status: Status }>({
    nome: '',
    tipo: 'nacional',
    pais: '',
    descricao: '',
    website: '',
    email: '',
    telefone: '',
    morada: '',
    cursosCertificados: [],
    programasCertificados: [],
    notasInternas: '',
    status: 'ativo',
  });
  const [cursosText, setCursosText] = useState('');
  const [programasText, setProgramasText] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [saveModal, setSaveModal] = useState<{
    open: boolean;
    type: 'success' | 'error';
    message: string;
  }>({
    open: false,
    type: 'success',
    message: '',
  });

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
      toast.error('Acesso negado', 'Apenas o responsável pode editar reguladores.');
    }
  }, [user, router, toast]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await regulatorsService.getRegulator(id);
        if (data) {
          setRegulator(data);
          setFormData({
            nome: data.nome,
            tipo: data.tipo,
            pais: data.pais,
            descricao: data.descricao || '',
            website: data.website || '',
            email: data.email || '',
            telefone: data.telefone || '',
            morada: data.morada || '',
            logoUrl: data.logoUrl,
            cursosCertificados: data.cursosCertificados || [],
            programasCertificados: data.programasCertificados || [],
            notasInternas: data.notasInternas || '',
            status: data.status,
          });
          setCursosText((data.cursosCertificados || []).join('\n'));
          setProgramasText((data.programasCertificados || []).join('\n'));
          if (data.logoUrl) {
            setLogoPreview(data.logoUrl);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar regulador:', err);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [id]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const cursosCertificados = cursosText
        .split('\n')
        .map((c) => c.trim())
        .filter(Boolean);
      const programasCertificados = programasText
        .split('\n')
        .map((p) => p.trim())
        .filter(Boolean);

      const before = regulator;

      let logoUrl = formData.logoUrl;
      if (logoFile) {
        logoUrl = await uploadRegulatorImage(logoFile, regulator.id);
      }

      await regulatorsService.updateRegulator(regulator.id, {
        ...formData,
        descricao: formData.descricao?.trim() || undefined,
        website: formData.website?.trim() || undefined,
        email: formData.email?.trim() || undefined,
        telefone: formData.telefone?.trim() || undefined,
        morada: formData.morada?.trim() || undefined,
        logoUrl,
        cursosCertificados: cursosCertificados.length ? cursosCertificados : undefined,
        programasCertificados: programasCertificados.length
          ? programasCertificados
          : undefined,
      });

      try {
        const after: Regulator = {
          ...before,
          ...formData,
          logoUrl,
          cursosCertificados,
          programasCertificados,
        } as Regulator;

        await firebaseService.createAuditLog({
          entidadeTipo: 'regulador',
          entidadeId: regulator.id,
          entidadeNome: after.nome,
          acao: 'editar',
          detalhes: `Regulador "${after.nome}" atualizado.`,
          alteracoesAntes: before as unknown as Record<string, unknown>,
          alteracoesDepois: after as unknown as Record<string, unknown>,
          utilizador: user?.nome || user?.email || 'Desconhecido',
          centroFormacaoId: before.centroFormacaoId,
          dataHora: new Date().toISOString(),
        });
      } catch (logError) {
        console.error('Erro ao registar log de auditoria de regulador:', logError);
      }

      const successMsg = 'As alterações foram guardadas com sucesso.';
      toast.success('Regulador atualizado', successMsg);
      setSaveModal({
        open: true,
        type: 'success',
        message: successMsg,
      });

      setTimeout(() => {
        router.push(`/admin/reguladores/${regulator.id}?updated=1`);
      }, 900);
    } catch (err) {
      console.error('Erro ao atualizar regulador:', err);
      const msg = 'Não foi possível atualizar o regulador. Tente novamente.';
      setError(msg);
      toast.error('Erro', msg);
      setSaveModal({
        open: true,
        type: 'error',
        message: msg,
      });
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header title="Editar Regulador" subtitle={regulator.nome} />

      <div className="p-8 max-w-3xl">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Voltar</span>
        </button>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-red-600" />
                Dados do Regulador
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Nome da Entidade *"
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, nome: e.target.value }))
                    }
                    required
                  />
                </div>
                <Select
                  label="Estado"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as Status,
                    }))
                  }
                  options={[
                    { value: 'ativo', label: 'Ativo' },
                    { value: 'arquivado', label: 'Arquivado' },
                  ]}
                />
                <Select
                  label="Tipo"
                  value={formData.tipo}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tipo: e.target.value as RegulatorFormData['tipo'],
                    }))
                  }
                  options={[
                    { value: 'nacional', label: 'Nacional' },
                    { value: 'regional', label: 'Regional' },
                    { value: 'internacional', label: 'Internacional' },
                    { value: 'outro', label: 'Outro' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="País *"
                  value={formData.pais}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, pais: e.target.value }))
                  }
                  required
                />
                <Input
                  label="Website"
                  placeholder="https://www.exemplo.pt"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, website: e.target.value }))
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
                <Input
                  label="Telefone"
                  value={formData.telefone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, telefone: e.target.value }))
                  }
                />
              </div>

              <Input
                label="Morada"
                value={formData.morada}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, morada: e.target.value }))
                }
              />

              <div className="grid grid-cols-1 md:grid-cols-[auto,1fr] gap-4 items-center">
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center ring-0 hover:ring-2 hover:ring-emerald-400 transition-all duration-200"
                  >
                    {logoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logoPreview}
                        alt="Logo do regulador"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-slate-500 text-center px-2">
                        Sem foto
                      </span>
                    )}
                  </button>
                  <span className="text-xs text-slate-500 text-center">
                    Foto / logotipo
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Adicionar/alterar foto para o cadastro
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setLogoFile(file);
                        const previewUrl = URL.createObjectURL(file);
                        setLogoPreview(previewUrl);
                      }
                    }}
                    className="block w-full text-sm text-slate-600
                      file:mr-3 file:py-1.5 file:px-3
                      file:rounded-md file:border-0
                      file:text-sm file:font-medium
                      file:bg-emerald-50 file:text-emerald-700
                      hover:file:bg-emerald-100
                    "
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Formatos suportados: JPG, PNG, até ~2MB.
                  </p>
                </div>
              </div>

              <TextArea
                label="Descrição"
                value={formData.descricao}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    descricao: e.target.value,
                  }))
                }
                rows={4}
              />

              <TextArea
                label="Cursos certificados por este regulador (um por linha, opcional)"
                value={cursosText}
                onChange={(e) => setCursosText(e.target.value)}
                rows={3}
              />

              <TextArea
                label="Programas certificados por este regulador (um por linha, opcional)"
                value={programasText}
                onChange={(e) => setProgramasText(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              leftIcon={<Save className="w-4 h-4" />}
              disabled={!formData.nome || !formData.pais}
            >
              Guardar Alterações
            </Button>
          </div>
        </form>

        {saveModal.open && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-xl shadow-xl px-6 py-5 max-w-sm w-full text-center border border-slate-200">
              <p
                className={`text-sm mb-3 ${
                  saveModal.type === 'success' ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {saveModal.message}
              </p>
              <Button
                size="sm"
                variant={saveModal.type === 'success' ? 'primary' : 'danger'}
                onClick={() => setSaveModal((prev) => ({ ...prev, open: false }))}
              >
                OK
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

