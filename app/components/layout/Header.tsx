'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Search, Save, Edit, LogOut, ChevronDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal, ModalFooter } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import * as authService from '../../lib/authService';

const profileSchema = z.object({
  nome: z.string().min(1, 'O nome é obrigatório'),
  dataNascimento: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user, refreshUser, signOut } = useAuth();
  const toast = useToast();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'gestor':
        return 'Gestor';
      case 'formador':
        return 'Formador';
      case 'regulador':
        return 'Regulador';
      default:
        return 'Utilizador';
    }
  };

  const handleOpenProfile = () => {
    if (user) {
      reset({
        nome: user.nome,
        dataNascimento: user.dataNascimento || '',
      });
      setShowDropdown(false);
      setShowProfile(true);
    }
  };

  const handleSignOut = async () => {
    setShowDropdown(false);
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao terminar sessão:', error);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    try {
      await authService.updateUser(user.id, data);
      await refreshUser();
      toast.success('Dados atualizados', 'Os dados da sua conta foram atualizados com sucesso.');
      setShowProfile(false);
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      toast.error('Erro', 'Não foi possível atualizar os dados. Tente novamente.');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="flex items-center justify-between px-8 py-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Pesquisar..."
                className="
                  w-64 pl-10 pr-4 py-2
                  bg-slate-100 border-0 rounded-lg
                  text-sm text-slate-900
                  placeholder:text-slate-400
                  focus:outline-none focus:ring-2 focus:ring-emerald-500
                  transition-all duration-200
                "
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
            </button>

            {/* User */}
            {user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-3 pl-4 border-l border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                    {user.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-slate-900">{user.nome}</p>
                    <p className="text-xs text-slate-500">{getRoleLabel(user.role)}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 hidden md:block transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <button
                      onClick={handleOpenProfile}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Editar conta
                    </button>
                    <hr className="my-1 border-slate-200" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Terminar sessão
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modal de Edição de Conta */}
      <Modal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        title="Editar Conta"
        size="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              label="Nome"
              {...register('nome')}
              error={errors.nome?.message}
              disabled={isSubmitting}
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-500">
                {user?.email}
              </div>
            </div>
            <Input
              label="Data de Nascimento"
              type="date"
              {...register('dataNascimento')}
              disabled={isSubmitting}
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Perfil
              </label>
              <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-500">
                {getRoleLabel(user?.role)}
              </div>
            </div>
          </div>
          <ModalFooter>
            <Button variant="ghost" type="button" onClick={() => setShowProfile(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting} leftIcon={<Save className="w-4 h-4" />}>
              Guardar
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}
