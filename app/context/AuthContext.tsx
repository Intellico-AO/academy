'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { UserAccount, TrainingCenter, RegisterFormData, UserRole } from '../types';
import * as authService from '../lib/authService';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: UserAccount | null;
  center: TrainingCenter | null;
  centers: TrainingCenter[];
  isLoading: boolean;
  isAuthenticated: boolean;
  activeRole: UserRole | null;
  availableRoles: UserRole[];
  switchRole: (role: UserRole) => void;
  switchCenter: (centerId: string) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshCenter: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mapear papel para rota base
function getRoleRoute(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'regulador':
      return '/regulador';
    default:
      return '/';
  }
}

// Label do papel
export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case 'admin':
      return 'Administrador';
    case 'responsavel':
      return 'Responsável';
    case 'assistente':
      return 'Assistente';
    case 'formador':
      return 'Formador';
    case 'regulador':
      return 'Regulador';
    case 'formando':
      return 'Formando';
    default:
      return role;
  }
}

// Carregar todos os centros do utilizador
async function loadUserCenters(userAccount: UserAccount): Promise<TrainingCenter[]> {
  const centerIds = new Set<string>();

  if (userAccount.centroFormacaoId) {
    centerIds.add(userAccount.centroFormacaoId);
  }

  if (userAccount.centrosFormacaoIds) {
    for (const id of userAccount.centrosFormacaoIds) {
      centerIds.add(id);
    }
  }

  const results = await Promise.all(
    Array.from(centerIds).map((id) => authService.getTrainingCenter(id))
  );

  return results.filter((c): c is TrainingCenter => c !== null);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserAccount | null>(null);
  const [center, setCenter] = useState<TrainingCenter | null>(null);
  const [centers, setCenters] = useState<TrainingCenter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);

  // Calcular papéis disponíveis
  const availableRoles: UserRole[] = user
    ? Array.from(new Set([user.role, ...(user.roles || [])]))
    : [];

  // Observar alterações de autenticação
  useEffect(() => {
    const unsubscribe = authService.onAuthChange(async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        try {
          const userAccount = await authService.getUserByUid(fbUser.uid);
          setUser(userAccount);

          // Definir papel activo (preferir o guardado em sessionStorage)
          if (userAccount) {
            const savedRole = sessionStorage.getItem('activeRole') as UserRole | null;
            const allRoles = [userAccount.role, ...(userAccount.roles || [])];
            if (savedRole && allRoles.includes(savedRole)) {
              setActiveRole(savedRole);
            } else {
              setActiveRole(userAccount.role);
            }

            // Carregar todos os centros
            const allCenters = await loadUserCenters(userAccount);
            setCenters(allCenters);

            // Definir centro activo (preferir o guardado em sessionStorage)
            const savedCenterId = sessionStorage.getItem('activeCenterId');
            const savedCenter = savedCenterId
              ? allCenters.find((c) => c.id === savedCenterId)
              : null;

            if (savedCenter) {
              setCenter(savedCenter);
            } else if (allCenters.length > 0) {
              // Por defeito, usar o centro principal
              const primaryCenter = allCenters.find((c) => c.id === userAccount.centroFormacaoId) || allCenters[0];
              setCenter(primaryCenter);
            }
          }
        } catch (error) {
          console.error('Erro ao carregar dados do utilizador:', error);
        }
      } else {
        setUser(null);
        setCenter(null);
        setCenters([]);
        setActiveRole(null);
        sessionStorage.removeItem('activeRole');
        sessionStorage.removeItem('activeCenterId');
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    setActiveRole(role);
    sessionStorage.setItem('activeRole', role);
    // Navegar para a rota base do papel
    window.location.href = getRoleRoute(role);
  }, []);

  const switchCenter = useCallback((centerId: string) => {
    const newCenter = centers.find((c) => c.id === centerId);
    if (newCenter) {
      setCenter(newCenter);
      sessionStorage.setItem('activeCenterId', centerId);
    }
  }, [centers]);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const fbUser = await authService.signIn(email, password);

      // Carregar dados do utilizador imediatamente após login
      const userAccount = await authService.getUserByUid(fbUser.uid);
      if (userAccount) {
        setUser(userAccount);
        setActiveRole(userAccount.role);

        // Carregar todos os centros
        const allCenters = await loadUserCenters(userAccount);
        setCenters(allCenters);

        if (allCenters.length > 0) {
          const primaryCenter = allCenters.find((c) => c.id === userAccount.centroFormacaoId) || allCenters[0];
          setCenter(primaryCenter);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setCenter(null);
      setCenters([]);
      setActiveRole(null);
      sessionStorage.removeItem('activeRole');
      sessionStorage.removeItem('activeCenterId');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const { center: newCenter, user: newUser } = await authService.registerTrainingCenter(data);
      setUser(newUser);
      setCenter(newCenter);
      setCenters([newCenter]);
      setActiveRole(newUser.role);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    await authService.resetPassword(email);
  };

  const refreshUser = async () => {
    if (firebaseUser) {
      const userAccount = await authService.getUserByUid(firebaseUser.uid);
      setUser(userAccount);
    }
  };

  const refreshCenter = async () => {
    if (user?.centroFormacaoId) {
      const trainingCenter = await authService.getTrainingCenter(user.centroFormacaoId);
      setCenter(trainingCenter);
    }
  };

  // Expor o user com o papel activo sobreposto
  const effectiveUser: UserAccount | null = user && activeRole
    ? { ...user, role: activeRole }
    : user;

  const value: AuthContextType = {
    firebaseUser,
    user: effectiveUser,
    center,
    centers,
    isLoading,
    isAuthenticated: !!user,
    activeRole,
    availableRoles,
    switchRole,
    switchCenter,
    signIn,
    signOut,
    register,
    resetPassword,
    refreshUser,
    refreshCenter,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
