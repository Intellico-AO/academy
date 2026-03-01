'use client';

import { useState, useEffect, useMemo } from 'react';
import { Header } from '../components/layout';
import { Card, CardContent } from '../components/ui';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import * as authService from '../lib/authService';
import * as trainersService from '../lib/trainersService';
import * as firebaseService from '../lib/firebaseService';
import { TrainingCenter, Trainer, Course } from '../types';
import {
  Building2,
  Users,
  BookOpen,
  Timer,
  TrendingUp,
  Activity,
} from 'lucide-react';

export default function ReguladorDashboardPage() {
  const { user } = useAuth();
  const [centros, setCentros] = useState<TrainingCenter[]>([]);
  const [formadores, setFormadores] = useState<Trainer[]>([]);
  const [cursos, setCursos] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [centrosData, formadoresData, cursosData] = await Promise.all([
          authService.getAllTrainingCenters(),
          trainersService.getAllTrainers(),
          firebaseService.getCourses(),
        ]);
        setCentros(centrosData);
        setFormadores(formadoresData);
        setCursos(cursosData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const centrosAtivos = useMemo(
    () => centros.filter((c) => c.status === 'ativo').length,
    [centros]
  );

  const formadoresAtivos = useMemo(
    () => formadores.filter((f) => f.status === 'ativo').length,
    [formadores]
  );

  const cursosAtivos = useMemo(
    () => cursos.filter((c) => c.status === 'ativo').length,
    [cursos]
  );

  const horasFormacao = useMemo(
    () => cursos.reduce((acc, c) => acc + c.duracaoTotal, 0),
    [cursos]
  );

  const metricas = useMemo(
    () => [
      {
        label: 'Centros de Formação',
        valor: centros.length.toString(),
        subValor: `${centrosAtivos} ativos`,
        icon: Building2,
        bgColor: 'bg-sky-500',
      },
      {
        label: 'Formadores',
        valor: formadores.length.toString(),
        subValor: `${formadoresAtivos} ativos`,
        icon: Users,
        bgColor: 'bg-emerald-500',
      },
      {
        label: 'Cursos',
        valor: cursos.length.toString(),
        subValor: `${cursosAtivos} ativos`,
        icon: BookOpen,
        bgColor: 'bg-violet-500',
      },
      {
        label: 'Horas de Formação',
        valor: `${horasFormacao}h`,
        subValor: 'horas totais',
        icon: Timer,
        bgColor: 'bg-amber-500',
      },
    ],
    [centros, formadores, cursos, centrosAtivos, formadoresAtivos, cursosAtivos, horasFormacao]
  );

  // Centros recentes (últimos 5)
  const centrosRecentes = useMemo(
    () =>
      [...centros]
        .sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime())
        .slice(0, 5),
    [centros]
  );

  // Cursos recentes (últimos 5)
  const cursosRecentes = useMemo(
    () =>
      [...cursos]
        .sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime())
        .slice(0, 5),
    [cursos]
  );

  if (isLoading) {
    return (
      <>
        <Header title="Dashboard" subtitle="Painel do regulador" />
        <div className="p-8 flex justify-center">
          <LoadingSpinner />
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Dashboard" subtitle="Painel do regulador" />

      <div className="p-8 space-y-6">
        {/* Cards de métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {metricas.map((m, idx) => {
            const Icon = m.icon;
            return (
              <Card
                key={m.label}
                variant="bordered"
                className={`card-hover animate-fade-in stagger-${idx + 1}`}
              >
                <CardContent>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2.5 rounded-xl ${m.bgColor} text-white`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{m.valor}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{m.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{m.subValor}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Centros recentes */}
          <Card variant="bordered" className="animate-fade-in">
            <CardContent>
              <div className="flex items-center gap-2 mb-6">
                <Building2 className="w-5 h-5 text-slate-400" />
                <h3 className="text-lg font-semibold text-slate-900">
                  Centros de Formação Recentes
                </h3>
              </div>

              {centrosRecentes.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  Nenhum centro registado ainda.
                </p>
              ) : (
                <div className="space-y-3">
                  {centrosRecentes.map((centro) => (
                    <div
                      key={centro.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {centro.nome}
                        </p>
                        <p className="text-xs text-slate-500">
                          {centro.localidade} • {centro.responsavel}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          centro.status === 'ativo'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {centro.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cursos recentes */}
          <Card variant="bordered" className="animate-fade-in">
            <CardContent>
              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="w-5 h-5 text-slate-400" />
                <h3 className="text-lg font-semibold text-slate-900">
                  Cursos Recentes
                </h3>
              </div>

              {cursosRecentes.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  Nenhum curso registado ainda.
                </p>
              ) : (
                <div className="space-y-3">
                  {cursosRecentes.map((curso) => (
                    <div
                      key={curso.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {curso.nome}
                        </p>
                        <p className="text-xs text-slate-500">
                          {curso.codigo} • {curso.duracaoTotal}h
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          curso.status === 'ativo'
                            ? 'bg-emerald-100 text-emerald-700'
                            : curso.status === 'rascunho'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {curso.status === 'ativo'
                          ? 'Ativo'
                          : curso.status === 'rascunho'
                          ? 'Rascunho'
                          : 'Arquivado'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
