'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, CheckCircle, Archive, FileText, Bell } from 'lucide-react';

import { Header } from '../components/layout';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui';
import * as trainingCentersService from '../lib/trainingCentersService';

export default function ReguladorDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, ativos: 0, arquivados: 0, rascunho: 0 });
  const [notificationCount, setNotificationCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [centerStats, notifications] = await Promise.all([
          trainingCentersService.getTrainingCentersStats(),
          user?.id ? trainingCentersService.getNotificationsByRegulator(user.id) : Promise.resolve([]),
        ]);
        setStats(centerStats);
        setNotificationCount(notifications.length);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) loadData();
  }, [user]);

  const statCards = [
    {
      label: 'Total de Centros',
      value: stats.total,
      icon: Building2,
      color: 'bg-sky-500',
      bgColor: 'bg-sky-50',
      textColor: 'text-sky-700',
    },
    {
      label: 'Centros Ativos',
      value: stats.ativos,
      icon: CheckCircle,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
    },
    {
      label: 'Centros Arquivados',
      value: stats.arquivados,
      icon: Archive,
      color: 'bg-slate-500',
      bgColor: 'bg-slate-50',
      textColor: 'text-slate-700',
    },
    {
      label: 'Notificações Enviadas',
      value: notificationCount,
      icon: Bell,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
    },
  ];

  if (isLoading) {
    return (
      <>
        <Header title="Painel do Regulador" subtitle="A carregar dados..." />
        <div className="p-8 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-sky-500 rounded-full animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Painel do Regulador"
        subtitle={`Bem-vindo, ${user?.nome || 'Regulador'}`}
      />

      <div className="p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.label}
                variant="bordered"
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="flex items-center gap-4 py-5">
                  <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/regulador/centros-formacao" className="group">
            <Card variant="bordered" className="card-hover h-full">
              <CardContent className="flex items-center gap-4 py-8">
                <div className="w-14 h-14 rounded-xl bg-sky-50 flex items-center justify-center group-hover:bg-sky-100 transition-colors">
                  <Building2 className="w-7 h-7 text-sky-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Centros de Formação</h3>
                  <p className="text-sm text-slate-500">
                    Listar, ver detalhes, notificar e gerir estados
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/regulador/centros-formacao" className="group">
            <Card variant="bordered" className="card-hover h-full">
              <CardContent className="flex items-center gap-4 py-8">
                <div className="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                  <FileText className="w-7 h-7 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Relatórios</h3>
                  <p className="text-sm text-slate-500">
                    Visualizar estatísticas e relatórios de centros
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </>
  );
}
