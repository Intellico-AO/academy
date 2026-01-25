'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { UserAccount, TrainingCenter, RegisterFormData } from '../types';
import * as authService from '../lib/authService';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: UserAccount | null;
  center: TrainingCenter | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshCenter: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserAccount | null>(null);
  const [center, setCenter] = useState<TrainingCenter | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Observar alterações de autenticação
  useEffect(() => {
    const unsubscribe = authService.onAuthChange(async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        try {
          const userAccount = await authService.getUserByUid(fbUser.uid);
          setUser(userAccount);

          if (userAccount?.centroFormacaoId) {
            const trainingCenter = await authService.getTrainingCenter(userAccount.centroFormacaoId);
            setCenter(trainingCenter);
          }
        } catch (error) {
          console.error('Erro ao carregar dados do utilizador:', error);
        }
      } else {
        setUser(null);
        setCenter(null);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await authService.signIn(email, password);
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

  const value: AuthContextType = {
    firebaseUser,
    user,
    center,
    isLoading,
    isAuthenticated: !!user,
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
