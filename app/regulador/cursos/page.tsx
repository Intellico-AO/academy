'use client';

import { useState } from 'react';
import { Header } from '../../components/layout';
import {
  Badge,
  Card,
  EmptyState,
  getStatusBadgeVariant,
  getStatusLabel,
} from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { BookOpen, Clock, Filter, Layers, Search } from 'lucide-react';
import { Status } from '../../types';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

export default function ReguladorCursosPage() {
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'todos'>('todos');

  const filteredCursos = state.cursos.filter((curso) => {
    const matchesSearch =
      curso.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curso.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || curso.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <Header
        title="Cursos"
        subtitle="Supervisão dos cursos registados no sistema"
      />

      <div className="p-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar cursos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Status | 'todos')}
              className="pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
            >
              <option value="todos">Todos os estados</option>
              <option value="rascunho">Rascunho</option>
              <option value="ativo">Ativo</option>
              <option value="arquivado">Arquivado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        {filteredCursos.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="w-8 h-8" />}
            title={searchTerm || statusFilter !== 'todos' ? 'Nenhum curso encontrado' : 'Sem cursos registados'}
            description={
              searchTerm || statusFilter !== 'todos'
                ? 'Tente ajustar os filtros de pesquisa.'
                : 'Os cursos registados aparecerão aqui para supervisão regulatória.'
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCursos.map((curso, index) => (
              <Card
                key={curso.id}
                variant="bordered"
                padding="none"
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                        {curso.codigo}
                      </span>
                      <h3 className="font-semibold text-slate-900 line-clamp-1">{curso.nome}</h3>
                    </div>
                  </div>

                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                    {curso.descricao || 'Sem descrição'}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{curso.duracaoTotal}h</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4" />
                      <span>{curso.modulos.length} módulos</span>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between rounded-b-xl overflow-hidden">
                  <Badge variant={getStatusBadgeVariant(curso.status)}>
                    {getStatusLabel(curso.status)}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    Atualizado {format(new Date(curso.dataAtualizacao), 'd MMM', { locale: pt })}
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
