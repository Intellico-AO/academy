'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  Calendar,
  ClipboardList,
  History,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Users,
  Building2,
  LogOut,
} from 'lucide-react';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
  { href: '/cursos', label: 'Cursos', icon: BookOpen, adminOnly: false },
  { href: '/programas', label: 'Programas', icon: Layers, adminOnly: false },
  { href: '/sessoes', label: 'Sessões', icon: Calendar, adminOnly: false },
  { href: '/planos', label: 'Planos de Sessão', icon: ClipboardList, adminOnly: false },
  { href: '/formadores', label: 'Formadores', icon: Users, adminOnly: true },
  { href: '/auditoria', label: 'Auditoria', icon: History, adminOnly: true },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, center, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao terminar sessão:', error);
    }
  };

  return (
    <aside
      className={`
        fixed left-0 top-0 bottom-0 z-40
        flex flex-col
        bg-gradient-to-b from-slate-900 to-slate-800
        border-r border-slate-700/50
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Logo & Collapse Button */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-slate-700/50 relative">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500 text-white">
          <GraduationCap className="w-6 h-6" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white tracking-tight">
              FormaPro
            </span>
            <span className="text-xs text-slate-400">Gestão Formativa</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="
            absolute right-2 top-1/2 -translate-y-1/2
            p-1.5 rounded-md
            text-slate-400 hover:bg-slate-700/50 hover:text-white
            transition-all duration-200
          "
          title={isCollapsed ? 'Expandir' : 'Recolher'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Centro de Formação Info */}
      {!isCollapsed && center && (
        <div className="px-4 py-3 border-b border-slate-700/50">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{center.nome}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems
          .filter((item) => !item.adminOnly || user?.role === 'admin')
          .map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-all duration-200
                  group relative
                  ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                  }
                `}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                    !isActive && 'group-hover:scale-110'
                  }`}
                />
                {!isCollapsed && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
                {isActive && (
                  <div className="absolute left-0 w-1 h-6 bg-emerald-500 rounded-r-full" />
                )}
              </Link>
            );
          })}
      </nav>

      {/* Logout Button */}
      <div className="px-3 py-3 border-t border-slate-700/50">
        {!isCollapsed && (
          <button
            onClick={handleSignOut}
            className="
              flex items-center justify-center gap-2 w-full
              p-2.5 rounded-lg
              text-slate-400 bg-slate-800/50
              hover:bg-rose-500/20 hover:text-rose-400
              transition-all duration-200
            "
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Terminar Sessão</span>
          </button>
        )}
        {isCollapsed && (
          <button
            onClick={handleSignOut}
            className="
              flex items-center justify-center
              w-full p-2.5 rounded-lg
              text-slate-400 bg-slate-800/50
              hover:bg-rose-500/20 hover:text-rose-400
              transition-all duration-200
            "
            title="Terminar Sessão"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
