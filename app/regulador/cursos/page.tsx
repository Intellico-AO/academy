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
import * as firebaseService from '../../lib/firebaseService';
import { Course, TrainingCenter, Status } from '../../types';
import {
  BookOpen,
  Search,
  Filter,
  Clock,
  Layers,
  Building2,
  Target,
} from 'lucide-react';

export default function ReguladorCursosPage() {
  const { user } = useAuth();
  const [cursos, setCursos] = useState<Course[]>([]);
  const [centros, setCentros] = useState<TrainingCenter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'todos'>('todos');

  useEffect(() => {
    async function fetchData() {
      try {
        const [cursosData, centrosData] = await Promise.all([
          firebaseService.getCourses(),
          authService.getAllTrainingCenters(),
        ]);
        setCursos(cursosData);
        setCentros(centrosData);
      } catch (error) {
        console.error('Erro ao carregar cursos:', error);
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

  const filteredCursos = useMemo(
    () =>
      cursos.filter((curso) => {
        const term = searchTerm.toLowerCase();
        const centroNome = getCentroNome(curso.centroFormacaoId).toLowerCase();
        const matchesSearch =
          curso.nome.toLowerCase().includes(term) ||
          curso.codigo.toLowerCase().includes(term) ||
          centroNome.includes(term) ||
          curso.descricao.toLowerCase().includes(term);
        const matchesStatus =
          statusFilter === 'todos' || curso.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [cursos, searchTerm, statusFilter, centros]
  );

  if (isLoading) {
    return (
      <>
        <Header title="Cursos" subtitle="A carregar cursos..." />
        <div className="p-8 flex justify-center">
          <LoadingSpinner />
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Cursos"
        subtitle={`${cursos.length} cursos registados`}
      />

      <div className="p-8">
        {/* Filtros */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-[320px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar por nome, código, centro..."
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
              <option value="rascunho">Rascunho</option>
              <option value="arquivado">Arquivado</option>
            </select>
          </div>
        </div>

        {/* Lista */}
        {filteredCursos.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="w-8 h-8" />}
            title={
              searchTerm || statusFilter !== 'todos'
                ? 'Nenhum curso encontrado'
                : 'Nenhum curso registado'
            }
            description={
              searchTerm || statusFilter !== 'todos'
                ? 'Tente ajustar os filtros de pesquisa.'
                : 'Ainda não existem cursos registados no sistema.'
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCursos.map((curso, index) => (
              <Card
                key={curso.id}
                variant="bordered"
                padding="none"
                className="card-hover animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-white">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 line-clamp-1">
                        {curso.nome}
                      </h3>
                      <p className="text-sm text-slate-500">{curso.codigo}</p>
                    </div>
                  </div>

                  {curso.descricao && (
                    <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                      {curso.descricao}
                    </p>
                  )}

                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="truncate">
                        {getCentroNome(curso.centroFormacaoId)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span>{curso.duracaoTotal}h de duração</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span>
                        {curso.modulos.length}{' '}
                        {curso.modulos.length === 1 ? 'módulo' : 'módulos'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{curso.publicoAlvo}</span>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <Badge variant={getStatusBadgeVariant(curso.status)}>
                    {getStatusLabel(curso.status)}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    Desde{' '}
                    {format(new Date(curso.dataCriacao), 'MMM yyyy', {
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
