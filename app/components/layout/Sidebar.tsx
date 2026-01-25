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
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/cursos', label: 'Cursos', icon: BookOpen },
  { href: '/programas', label: 'Programas', icon: Layers },
  { href: '/sessoes', label: 'Sessões', icon: Calendar },
  { href: '/planos', label: 'Planos de Sessão', icon: ClipboardList },
  { href: '/formadores', label: 'Formadores', icon: Users },
  { href: '/auditoria', label: 'Auditoria', icon: History },
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
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-slate-700/50">
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
        {menuItems.map((item) => {
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

      {/* User Info & Logout */}
      {!isCollapsed && user && (
        <div className="px-3 py-3 border-t border-slate-700/50">
          <div className="flex items-center gap-3 p-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">
              {user.nome.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.nome}</p>
              <p className="text-xs text-slate-400 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Logout & Collapse Button */}
      <div className="px-3 py-3 border-t border-slate-700/50 space-y-2">
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

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="
            flex items-center justify-center gap-2 w-full
            p-2.5 rounded-lg
            text-slate-400 bg-slate-800/50
            hover:bg-slate-700/50 hover:text-white
            transition-all duration-200
          "
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Recolher</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
