'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { FullPageLoader } from '../ui/LoadingSpinner';
import { ReguladorSidebar } from './ReguladorSidebar';

interface ReguladorLayoutProps {
  children: ReactNode;
}

export function ReguladorLayout({ children }: ReguladorLayoutProps) {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { state } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user && user.role !== 'regulador') {
      router.push('/');
    }
  }, [user, authLoading, isAuthenticated, router]);

  if (authLoading) {
    return <FullPageLoader message="A verificar autenticação..." />;
  }

  if (!isAuthenticated) {
    return <FullPageLoader message="A redirecionar..." />;
  }

  if (user && user.role !== 'regulador') {
    return <FullPageLoader message="A redirecionar..." />;
  }

  if (state.isLoading && !state.isInitialized) {
    return <FullPageLoader message="A carregar dados..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ReguladorSidebar />
      <main className="ml-64 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
