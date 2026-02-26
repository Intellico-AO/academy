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

export default function ReguladorProgramasPage() {
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'todos'>('todos');

  const filteredProgramas = state.programas.filter((programa) => {
    const matchesSearch =
      programa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      programa.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || programa.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <Header
        title="Programas"
        subtitle="Supervisão dos programas formativos"
      />

      <div className="p-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar programas..."
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

        {filteredProgramas.length === 0 ? (
          <EmptyState
            icon={<Layers className="w-8 h-8" />}
            title={searchTerm || statusFilter !== 'todos' ? 'Nenhum programa encontrado' : 'Sem programas registados'}
            description={
              searchTerm || statusFilter !== 'todos'
                ? 'Tente ajustar os filtros de pesquisa.'
                : 'Os programas registados aparecerão aqui para supervisão regulatória.'
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProgramas.map((programa, index) => (
              <Card
                key={programa.id}
                variant="bordered"
                padding="none"
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                        {programa.codigo}
                      </span>
                      <h3 className="font-semibold text-slate-900 line-clamp-1">
                        {programa.nome}
                      </h3>
                    </div>
                  </div>

                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                    {programa.descricao || 'Sem descrição'}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{programa.duracaoTotal}h</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      <span>{programa.cursos.length} cursos</span>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between rounded-b-xl overflow-hidden">
                  <Badge variant={getStatusBadgeVariant(programa.status)}>
                    {getStatusLabel(programa.status)}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    Atualizado {format(new Date(programa.dataAtualizacao), 'd MMM', { locale: pt })}
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
