'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { FullPageLoader } from '../ui/LoadingSpinner';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { state } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Mostrar loading enquanto verifica autenticação
  if (authLoading) {
    return <FullPageLoader message="A verificar autenticação..." />;
  }

  // Se não estiver autenticado, não mostrar nada (vai redirecionar)
  if (!isAuthenticated) {
    return <FullPageLoader message="A redirecionar..." />;
  }

  // Mostrar loading enquanto carrega dados
  if (state.isLoading && !state.isInitialized) {
    return <FullPageLoader message="A carregar dados..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <main className="ml-64 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
