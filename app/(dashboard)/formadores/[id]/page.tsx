'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '../../../components/layout';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, getStatusBadgeVariant, getStatusLabel } from '../../../components/ui';
import { ArrowLeft, Edit, Mail, Phone, MapPin, Calendar, Award, FileText, User, Building } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Trainer } from '../../../types';
import * as trainersService from '../../../lib/trainersService';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function FormadorDetalhesPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTrainer();
  }, [id]);

  const loadTrainer = async () => {
    try {
      const data = await trainersService.getTrainer(id);
      setTrainer(data);
    } catch (error) {
      console.error('Erro ao carregar formador:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header title="A carregar..." />
        <div className="p-8 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (!trainer) {
    return (
      <>
        <Header title="Formador não encontrado" />
        <div className="p-8">
          <p className="text-slate-500">O formador solicitado não existe ou foi eliminado.</p>
          <Button onClick={() => router.push('/formadores')} className="mt-4">
            Voltar aos Formadores
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title={trainer.nome}
        subtitle={`${trainer.certificacaoPedagogica} ${trainer.numeroCertificacao}`}
      />

      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Voltar</span>
          </button>

          <div className="flex items-center gap-3">
            <Badge variant={getStatusBadgeVariant(trainer.status)} className="text-sm px-3 py-1">
              {getStatusLabel(trainer.status)}
            </Badge>
            <Link href={`/formadores/${trainer.id}/editar`}>
              <Button leftIcon={<Edit className="w-4 h-4" />}>
                Editar
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações de Contacto */}
            <Card variant="bordered">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-500" />
                  Informações de Contacto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">Email</p>
                      <p className="font-medium text-slate-900">{trainer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Phone className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">Telefone</p>
                      <p className="font-medium text-slate-900">{trainer.telefone || 'Não definido'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <FileText className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">NIF</p>
                      <p className="font-medium text-slate-900">{trainer.nif || 'Não definido'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">Data de Nascimento</p>
                      <p className="font-medium text-slate-900">
                        {trainer.dataNascimento 
                          ? format(new Date(trainer.dataNascimento), "d 'de' MMMM 'de' yyyy", { locale: pt })
                          : 'Não definida'}
                      </p>
                    </div>
                  </div>
                </div>

                {trainer.morada && (
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg mt-4">
                    <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Morada</p>
                      <p className="font-medium text-slate-900">
                        {trainer.morada}
                        {trainer.codigoPostal && `, ${trainer.codigoPostal}`}
                        {trainer.localidade && ` ${trainer.localidade}`}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Qualificações */}
            <Card variant="bordered">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Qualificações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                    <p className="text-sm text-amber-600 font-medium">Certificação Pedagógica</p>
                    <p className="text-lg font-semibold text-slate-900 mt-1">
                      {trainer.certificacaoPedagogica}
                    </p>
                    <p className="text-sm text-slate-600">{trainer.numeroCertificacao}</p>
                    {trainer.validadeCertificacao && (
                      <p className="text-xs text-slate-500 mt-2">
                        Válido até {format(new Date(trainer.validadeCertificacao), "d/MM/yyyy")}
                      </p>
                    )}
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">Habilitações</p>
                    <p className="font-medium text-slate-900 mt-1">
                      {trainer.habilitacoes || 'Não especificadas'}
                    </p>
                    <p className="text-sm text-slate-600 mt-2">
                      {trainer.experienciaAnos} anos de experiência
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Áreas de Competência */}
            {trainer.areasCompetencia.length > 0 && (
              <Card variant="bordered">
                <CardHeader>
                  <CardTitle>Áreas de Competência</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {trainer.areasCompetencia.map((area, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-lg"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Currículo */}
            {trainer.curriculo && (
              <Card variant="bordered">
                <CardHeader>
                  <CardTitle>Currículo / Resumo Profissional</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 whitespace-pre-wrap">{trainer.curriculo}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card variant="bordered">
              <CardContent className="text-center py-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                  {trainer.nome.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-xl font-bold text-slate-900">{trainer.nome}</h3>
                <p className="text-slate-500">{trainer.nacionalidade}</p>
                <div className="mt-4">
                  <Badge variant={getStatusBadgeVariant(trainer.status)}>
                    {getStatusLabel(trainer.status)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Info Rápida */}
            <Card variant="bordered">
              <CardHeader>
                <CardTitle>Informações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-slate-500">Registado em</p>
                    <p className="font-medium text-slate-900">
                      {format(new Date(trainer.dataCriacao), "d 'de' MMMM 'de' yyyy", { locale: pt })}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Última atualização</p>
                    <p className="font-medium text-slate-900">
                      {format(new Date(trainer.dataAtualizacao), "d 'de' MMMM 'de' yyyy", { locale: pt })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
