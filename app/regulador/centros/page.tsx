'use client';

import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Header } from '../../components/layout';
import {
  Card,
  CardContent,
  Badge,
  EmptyState,
  getStatusBadgeVariant,
  getStatusLabel,
} from '../../components/ui';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import * as authService from '../../lib/authService';
import { TrainingCenter, Status } from '../../types';
import {
  Building2,
  Search,
  Filter,
  MapPin,
  Mail,
  Phone,
  Globe,
  User,
} from 'lucide-react';

export default function ReguladorCentrosPage() {
  const { user } = useAuth();
  const [centros, setCentros] = useState<TrainingCenter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'todos'>('todos');

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await authService.getAllTrainingCenters();
        setCentros(data);
      } catch (error) {
        console.error('Erro ao carregar centros de formação:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredCentros = useMemo(
    () =>
      centros.filter((centro) => {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
          centro.nome.toLowerCase().includes(term) ||
          centro.localidade.toLowerCase().includes(term) ||
          centro.responsavel.toLowerCase().includes(term) ||
          centro.email.toLowerCase().includes(term);
        const matchesStatus =
          statusFilter === 'todos' || centro.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [centros, searchTerm, statusFilter]
  );

  if (isLoading) {
    return (
      <>
        <Header title="Centros de Formação" subtitle="A carregar centros..." />
        <div className="p-8 flex justify-center">
          <LoadingSpinner />
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Centros de Formação"
        subtitle={`${centros.length} centros registados`}
      />

      <div className="p-8">
        {/* Filtros */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-[320px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar por nome, localidade, responsável..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div className="relative w-[140px]">
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
              <option value="arquivado">Arquivado</option>
            </select>
          </div>
        </div>

        {/* Lista */}
        {filteredCentros.length === 0 ? (
          <EmptyState
            icon={<Building2 className="w-8 h-8" />}
            title={
              searchTerm || statusFilter !== 'todos'
                ? 'Nenhum centro encontrado'
                : 'Nenhum centro registado'
            }
            description={
              searchTerm || statusFilter !== 'todos'
                ? 'Tente ajustar os filtros de pesquisa.'
                : 'Ainda não existem centros de formação registados no sistema.'
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCentros.map((centro, index) => (
              <Card
                key={centro.id}
                variant="bordered"
                padding="none"
                className="card-hover animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center text-white">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 line-clamp-1">
                        {centro.nome}
                      </h3>
                      <p className="text-sm text-slate-500">
                        NIF: {centro.nif}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{centro.responsavel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{centro.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span>{centro.telefone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="truncate">
                        {centro.localidade}, {centro.pais}
                      </span>
                    </div>
                    {centro.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <a
                          href={centro.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-600 hover:underline truncate"
                        >
                          {centro.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <Badge variant={getStatusBadgeVariant(centro.status)}>
                    {getStatusLabel(centro.status)}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    Desde{' '}
                    {format(new Date(centro.dataCriacao), 'MMM yyyy', {
                      locale: pt,
                    })}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
