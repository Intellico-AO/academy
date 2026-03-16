'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth, getRoleLabel } from '../../context/AuthContext';
import { ChevronDown, Check } from 'lucide-react';
import type { UserRole } from '../../types';

const roleColors: Record<UserRole, string> = {
  admin: 'bg-rose-500/20 text-rose-400',
  responsavel: 'bg-emerald-500/20 text-emerald-400',
  assistente: 'bg-sky-500/20 text-sky-400',
  formador: 'bg-violet-500/20 text-violet-400',
  regulador: 'bg-amber-500/20 text-amber-400',
  formando: 'bg-cyan-500/20 text-cyan-400',
};

export function RoleSwitcher() {
  const { activeRole, availableRoles, switchRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Não mostrar se só tem 1 papel
  if (availableRoles.length <= 1) return null;

  return (
    <div ref={ref} className="px-4 py-2 border-b border-slate-700/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          w-full flex items-center justify-between
          px-3 py-2 rounded-lg
          bg-slate-800/50 hover:bg-slate-700/50
          transition-all duration-200
          text-sm
        "
      >
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${activeRole ? roleColors[activeRole] : ''}`}
          >
            {activeRole ? getRoleLabel(activeRole) : ''}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="mt-1 py-1 bg-slate-800 rounded-lg border border-slate-700/50 animate-scale-in">
          {availableRoles.map((role) => (
            <button
              key={role}
              onClick={() => {
                if (role !== activeRole) {
                  switchRole(role);
                }
                setIsOpen(false);
              }}
              className={`
                w-full flex items-center justify-between px-3 py-2 text-sm
                transition-colors duration-150
                ${role === activeRole ? 'text-white bg-slate-700/50' : 'text-slate-400 hover:text-white hover:bg-slate-700/30'}
              `}
            >
              <span className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${roleColors[role]}`}
                >
                  {getRoleLabel(role)}
                </span>
              </span>
              {role === activeRole && (
                <Check className="w-4 h-4 text-emerald-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
