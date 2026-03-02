'use client';

import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import Link from 'next/link';
import { Header } from '../../components/layout';
import {
  Card,
  Badge,
  EmptyState,
  getStatusBadgeVariant,
  getStatusLabel,
} from '../../components/ui';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import * as authService from '../../lib/authService';
import * as trainersService from '../../lib/trainersService';
import { Trainer, TrainingCenter, Status } from '../../types';
import {
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  Award,
  Building2,
  ChevronRight,
} from 'lucide-react';

export default function ReguladorFormadoresPage() {
  const { user } = useAuth();
  const [formadores, setFormadores] = useState<Trainer[]>([]);
  const [centros, setCentros] = useState<TrainingCenter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'todos'>('todos');

  useEffect(() => {
    async function fetchData() {
      try {
        const [formadoresData, centrosData] = await Promise.all([
          trainersService.getAllTrainers(),
          authService.getAllTrainingCenters(),
        ]);
        setFormadores(formadoresData);
        setCentros(centrosData);
      } catch (error) {
        console.error('Erro ao carregar formadores:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const getCentroNome = (centroId: string) => {
    const centro = centros.find((c) => c.id === centroId);
    return centro?.nome || 'Desconhecido';
  };

  const filteredFormadores = useMemo(
    () =>
      formadores.filter((f) => {
        const term = searchTerm.toLowerCase();
        const centroNome = getCentroNome(f.centroFormacaoId).toLowerCase();
        const matchesSearch =
          f.nome.toLowerCase().includes(term) ||
          f.email.toLowerCase().includes(term) ||
          centroNome.includes(term) ||
          f.areasCompetencia.some((a) => a.toLowerCase().includes(term));
        const matchesStatus =
          statusFilter === 'todos' || f.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [formadores, searchTerm, statusFilter, centros]
  );

  if (isLoading) {
    return (
      <>
        <Header title="Formadores" subtitle="A carregar formadores..." />
        <div className="p-8 flex justify-center">
          <LoadingSpinner />
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Formadores"
        subtitle={`${formadores.length} formadores registados`}
      />

      <div className="p-8">
        {/* Filtros */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-[320px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar por nome, email, centro, área..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div className="relative w-[180px]">
            <Filter className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as Status | 'todos')
              }
              className="w-full pl-7 pr-6 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none cursor-pointer"
            >
              <option value="todos">Todos os estados</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
              <option value="em_avaliacao">Em Avaliação</option>
              <option value="aguardando_aprovacao">Aguardando Aprovação</option>
              <option value="arquivado">Arquivado</option>
            </select>
          </div>
        </div>

        {/* Lista */}
        {filteredFormadores.length === 0 ? (
          <EmptyState
            icon={<Users className="w-8 h-8" />}
            title={
              searchTerm || statusFilter !== 'todos'
                ? 'Nenhum formador encontrado'
                : 'Nenhum formador registado'
            }
            description={
              searchTerm || statusFilter !== 'todos'
                ? 'Tente ajustar os filtros de pesquisa.'
                : 'Ainda não existem formadores registados no sistema.'
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredFormadores.map((formador, index) => (
              <Link
                key={formador.id}
                href={`/regulador/formadores/${formador.id}`}
                className="block group"
              >
                <Card
                  variant="bordered"
                  padding="none"
                  className="card-hover animate-fade-in transition-shadow group-hover:shadow-md"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-lg font-bold">
                        {formador.nome.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 line-clamp-1 group-hover:text-amber-600 transition-colors">
                          {formador.nome}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {formador.experienciaAnos} anos de experiência
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-amber-500 transition-colors flex-shrink-0 mt-1" />
                    </div>

                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="truncate">
                          {getCentroNome(formador.centroFormacaoId)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{formador.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span>{formador.telefone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="truncate">
                          {formador.certificacaoPedagogica} - {formador.numeroCertificacao || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {formador.areasCompetencia.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {formador.areasCompetencia.slice(0, 3).map((area) => (
                          <span
                            key={area}
                            className="px-2 py-0.5 text-xs bg-amber-50 text-amber-700 rounded-full"
                          >
                            {area}
                          </span>
                        ))}
                        {formador.areasCompetencia.length > 3 && (
                          <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-500 rounded-full">
                            +{formador.areasCompetencia.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <Badge variant={getStatusBadgeVariant(formador.status)}>
                      {getStatusLabel(formador.status)}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      Desde{' '}
                      {format(new Date(formador.dataCriacao), 'MMM yyyy', {
                        locale: pt,
                      })}
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
