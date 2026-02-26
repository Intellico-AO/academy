'use client';

import { useState, useMemo, useEffect } from 'react';
import { Header } from '../components/layout';
import { Card, CardContent } from '../components/ui';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useApp } from '../context/AppContext';
import {
  collection,
  getDocs,
} from 'firebase/firestore';
import { getFirebaseDb } from '../lib/firebase';
import { UserAccount, TrainingCenter } from '../types';
import {
  Users,
  MousePointerClick,
  BookOpen,
  Layers,
  Calendar,
  Timer,
  BarChart3,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  CalendarDays,
  CalendarRange,
  Building2,
  FileText,
  ClipboardList,
} from 'lucide-react';

type Periodo = 'dia' | 'mes';

export default function AdminPage() {
  const { state } = useApp();
  const [periodo, setPeriodo] = useState<Periodo>('dia');
  const [usuarios, setUsuarios] = useState<UserAccount[]>([]);
  const [centros, setCentros] = useState<TrainingCenter[]>([]);
  const [loadingExtra, setLoadingExtra] = useState(true);

  useEffect(() => {
    async function fetchAdminData() {
      const db = getFirebaseDb();
      if (!db) {
        setLoadingExtra(false);
        return;
      }
      try {
        const [usersSnap, centersSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'trainingCenters')),
        ]);
        setUsuarios(usersSnap.docs.map(d => ({ id: d.id, ...d.data() }) as UserAccount));
        setCentros(centersSnap.docs.map(d => ({ id: d.id, ...d.data() }) as TrainingCenter));
      } catch (err) {
        console.error('Erro ao carregar dados de admin:', err);
      } finally {
        setLoadingExtra(false);
      }
    }
    fetchAdminData();
  }, []);

  const usuariosAtivos = useMemo(
    () => usuarios.filter(u => u.ativo).length,
    [usuarios]
  );

  const centrosAtivos = useMemo(
    () => centros.filter(c => c.status === 'ativo').length,
    [centros]
  );

  const acessosPorDia = useMemo(() => {
    const hoje = new Date();
    const dias: { data: string; acessos: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(hoje);
      d.setDate(d.getDate() - i);
      const chave = d.toISOString().slice(0, 10);
      const label = `${d.getDate()} ${d.toLocaleDateString('pt-PT', { month: 'short' })}`;
      const count = state.auditLogs.filter(
        log => log.dataHora.slice(0, 10) === chave
      ).length;
      dias.push({ data: label, acessos: count });
    }
    return dias;
  }, [state.auditLogs]);

  const acessosPorMes = useMemo(() => {
    const hoje = new Date();
    const meses: { data: string; acessos: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const chave = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString('pt-PT', { month: 'short' });
      const count = state.auditLogs.filter(
        log => log.dataHora.slice(0, 7) === chave
      ).length;
      meses.push({ data: label.charAt(0).toUpperCase() + label.slice(1), acessos: count });
    }
    return meses;
  }, [state.auditLogs]);

  const totalAcessosHoje = useMemo(() => {
    const hoje = new Date().toISOString().slice(0, 10);
    return state.auditLogs.filter(log => log.dataHora.slice(0, 10) === hoje).length;
  }, [state.auditLogs]);

  const totalAcessosMes = useMemo(() => {
    const mesAtual = new Date().toISOString().slice(0, 7);
    return state.auditLogs.filter(log => log.dataHora.slice(0, 7) === mesAtual).length;
  }, [state.auditLogs]);

  const usoFuncionalidades = useMemo(() => {
    const contagens: Record<string, { label: string; count: number; cor: string }> = {
      curso: { label: 'Gestão de Cursos', count: 0, cor: 'bg-emerald-500' },
      programa: { label: 'Programas Formativos', count: 0, cor: 'bg-sky-500' },
      sessao: { label: 'Sessões de Formação', count: 0, cor: 'bg-violet-500' },
      plano: { label: 'Planos de Sessão', count: 0, cor: 'bg-amber-500' },
      demonstracao: { label: 'Planos de Demonstração', count: 0, cor: 'bg-rose-500' },
      ficha: { label: 'Fichas de Trabalho', count: 0, cor: 'bg-indigo-500' },
    };

    for (const log of state.auditLogs) {
      if (contagens[log.entidadeTipo]) {
        contagens[log.entidadeTipo].count++;
      }
    }

    const items = Object.values(contagens).sort((a, b) => b.count - a.count);
    const max = Math.max(...items.map(i => i.count), 1);

    return items.map(item => ({
      nome: item.label,
      usos: item.count,
      percentagem: Math.round((item.count / max) * 100),
      cor: item.cor,
    }));
  }, [state.auditLogs]);

  const horasFormacao = useMemo(
    () => state.cursos.reduce((acc, c) => acc + c.duracaoTotal, 0),
    [state.cursos]
  );

  const sessoesAgendadas = useMemo(() => {
    const hoje = new Date();
    return state.sessoes.filter(s => new Date(s.dataInicio) >= hoje).length;
  }, [state.sessoes]);

  const metricas = useMemo(() => [
    {
      label: 'Usuários Ativos',
      valor: usuariosAtivos.toString(),
      subValor: `de ${usuarios.length} total`,
      icon: Users,
      bgColor: 'bg-emerald-500',
    },
    {
      label: 'Centros de Formação',
      valor: centrosAtivos.toString(),
      subValor: `de ${centros.length} total`,
      icon: Building2,
      bgColor: 'bg-sky-500',
    },
    {
      label: 'Cursos',
      valor: state.cursos.length.toString(),
      subValor: `${state.cursos.filter(c => c.status === 'ativo').length} ativos`,
      icon: BookOpen,
      bgColor: 'bg-violet-500',
    },
    {
      label: 'Programas',
      valor: state.programas.length.toString(),
      subValor: `${state.programas.filter(p => p.status === 'ativo').length} ativos`,
      icon: Layers,
      bgColor: 'bg-amber-500',
    },
    {
      label: 'Sessões',
      valor: state.sessoes.length.toString(),
      subValor: `${sessoesAgendadas} agendadas`,
      icon: Calendar,
      bgColor: 'bg-rose-500',
    },
    {
      label: 'Horas de Formação',
      valor: `${horasFormacao}h`,
      subValor: 'horas totais',
      icon: Timer,
      bgColor: 'bg-indigo-500',
    },
  ], [usuariosAtivos, usuarios, centrosAtivos, centros, state.cursos, state.programas, state.sessoes, sessoesAgendadas, horasFormacao]);

  const dadosGrafico = periodo === 'dia' ? acessosPorDia : acessosPorMes;
  const maxAcessos = Math.max(...dadosGrafico.map(d => d.acessos), 1);

  const atividadeRecente = useMemo(() => {
    return state.auditLogs.slice(0, 8).map(log => {
      const acaoLabels: Record<string, string> = {
        criar: 'Criou',
        editar: 'Editou',
        eliminar: 'Eliminou',
        arquivar: 'Arquivou',
        ativar: 'Ativou',
      };
      const tipoLabels: Record<string, string> = {
        curso: 'curso',
        programa: 'programa',
        sessao: 'sessão',
        plano: 'plano de sessão',
        demonstracao: 'plano de demonstração',
        ficha: 'ficha de trabalho',
        centro: 'centro',
        formador: 'formador',
        utilizador: 'utilizador',
      };
      const acaoLabel = acaoLabels[log.acao] || log.acao;
      const tipoLabel = tipoLabels[log.entidadeTipo] || log.entidadeTipo;

      let dataFormatada = '';
      try {
        const d = new Date(log.dataHora);
        dataFormatada = `${d.getDate()} ${d.toLocaleDateString('pt-PT', { month: 'short' })} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      } catch {
        dataFormatada = log.dataHora;
      }

      return {
        id: log.id,
        resumo: `${acaoLabel} ${tipoLabel} "${log.entidadeNome}"`,
        utilizador: log.utilizador,
        data: dataFormatada,
        acao: log.acao,
      };
    });
  }, [state.auditLogs]);

  const acaoCores: Record<string, string> = {
    criar: 'bg-emerald-100 text-emerald-700',
    editar: 'bg-amber-100 text-amber-700',
    eliminar: 'bg-rose-100 text-rose-700',
    arquivar: 'bg-slate-100 text-slate-700',
    ativar: 'bg-sky-100 text-sky-700',
  };

  if (loadingExtra) {
    return (
      <>
        <Header title="Administração" subtitle="Painel de administração do sistema" />
        <div className="p-8 flex justify-center">
          <LoadingSpinner />
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Administração"
        subtitle="Painel de administração do sistema"
      />

      <div className="p-8 space-y-6">
        {/* Cards de métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gráfico de atividades */}
          <Card variant="bordered" className="lg:col-span-2 animate-fade-in">
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-slate-400" />
                  <h3 className="text-lg font-semibold text-slate-900">
                    Atividades Registadas
                  </h3>
                  <span className="text-sm text-slate-400 ml-1">
                    ({periodo === 'dia'
                      ? `${totalAcessosHoje} hoje`
                      : `${totalAcessosMes} este mês`})
                  </span>
                </div>
                <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setPeriodo('dia')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      periodo === 'dia'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <CalendarDays className="w-3.5 h-3.5" />
                    Diário
                  </button>
                  <button
                    onClick={() => setPeriodo('mes')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      periodo === 'mes'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <CalendarRange className="w-3.5 h-3.5" />
                    Mensal
                  </button>
                </div>
              </div>

              {/* Bar chart */}
              <div className="flex items-end gap-3 h-52">
                {dadosGrafico.map((d) => {
                  const altura = (d.acessos / maxAcessos) * 100;
                  return (
                    <div key={d.data} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs font-semibold text-slate-600">
                        {d.acessos}
                      </span>
                      <div className="w-full flex justify-center">
                        <div
                          className="w-full max-w-12 rounded-t-lg bg-gradient-to-t from-emerald-500 to-emerald-400 transition-all duration-500 hover:from-emerald-600 hover:to-emerald-500"
                          style={{ height: `${altura}%`, minHeight: '8px' }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">{d.data}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Uso de funcionalidades */}
          <Card variant="bordered" className="animate-fade-in">
            <CardContent>
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-slate-400" />
                <h3 className="text-lg font-semibold text-slate-900">
                  Uso de Funcionalidades
                </h3>
              </div>

              <div className="space-y-4">
                {usoFuncionalidades.map((f) => (
                  <div key={f.nome}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-slate-700">{f.nome}</span>
                      <span className="text-sm text-slate-500">
                        {f.usos} {f.usos === 1 ? 'ação' : 'ações'}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${f.cor} transition-all duration-700`}
                        style={{ width: `${f.percentagem}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Atividade recente */}
        <Card variant="bordered" className="animate-fade-in">
          <CardContent>
            <div className="flex items-center gap-2 mb-6">
              <ClipboardList className="w-5 h-5 text-slate-400" />
              <h3 className="text-lg font-semibold text-slate-900">
                Atividade Recente
              </h3>
              <span className="ml-auto text-sm text-slate-400">
                {state.auditLogs.length} registos totais
              </span>
            </div>

            {atividadeRecente.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Nenhuma atividade registada ainda.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ação</th>
                      <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Descrição</th>
                      <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Utilizador</th>
                      <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {atividadeRecente.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 pr-4">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${acaoCores[item.acao] || 'bg-slate-100 text-slate-700'}`}>
                            {item.acao.charAt(0).toUpperCase() + item.acao.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-sm text-slate-700">{item.resumo}</span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-sm text-slate-500">{item.utilizador}</span>
                        </td>
                        <td className="py-3">
                          <span className="text-sm text-slate-400">{item.data}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
