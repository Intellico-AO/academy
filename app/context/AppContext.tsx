'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Course,
  Program,
  Session,
  SessionPlan,
  DemonstrationPlan,
  Worksheet,
  AuditLog,
  AuditAction,
  CourseFormData,
  ProgramFormData,
  SessionFormData,
  DemonstrationPlanFormData,
  WorksheetFormData,
  DashboardStats,
} from '../types';
import * as firebaseService from '../lib/firebaseService';

// ==========================================
// ESTADO
// ==========================================

interface AppState {
  cursos: Course[];
  programas: Program[];
  sessoes: Session[];
  planosSessao: SessionPlan[];
  planosDemonstracao: DemonstrationPlan[];
  fichasTrabalho: Worksheet[];
  auditLogs: AuditLog[];
  utilizadorAtual: string;
  isLoading: boolean;
  isInitialized: boolean;
}

const initialState: AppState = {
  cursos: [],
  programas: [],
  sessoes: [],
  planosSessao: [],
  planosDemonstracao: [],
  fichasTrabalho: [],
  auditLogs: [],
  utilizadorAtual: 'Admin',
  isLoading: true,
  isInitialized: false,
};

// ==========================================
// AÇÕES
// ==========================================

type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'LOAD_DATA'; payload: Partial<AppState> }
  | { type: 'ADD_CURSO'; payload: Course }
  | { type: 'UPDATE_CURSO'; payload: Course }
  | { type: 'DELETE_CURSO'; payload: string }
  | { type: 'ADD_PROGRAMA'; payload: Program }
  | { type: 'UPDATE_PROGRAMA'; payload: Program }
  | { type: 'DELETE_PROGRAMA'; payload: string }
  | { type: 'ADD_SESSAO'; payload: Session }
  | { type: 'UPDATE_SESSAO'; payload: Session }
  | { type: 'DELETE_SESSAO'; payload: string }
  | { type: 'ADD_PLANO_SESSAO'; payload: SessionPlan }
  | { type: 'UPDATE_PLANO_SESSAO'; payload: SessionPlan }
  | { type: 'DELETE_PLANO_SESSAO'; payload: string }
  | { type: 'ADD_PLANO_DEMONSTRACAO'; payload: DemonstrationPlan }
  | { type: 'UPDATE_PLANO_DEMONSTRACAO'; payload: DemonstrationPlan }
  | { type: 'DELETE_PLANO_DEMONSTRACAO'; payload: string }
  | { type: 'ADD_FICHA_TRABALHO'; payload: Worksheet }
  | { type: 'UPDATE_FICHA_TRABALHO'; payload: Worksheet }
  | { type: 'DELETE_FICHA_TRABALHO'; payload: string }
  | { type: 'ADD_AUDIT_LOG'; payload: AuditLog };

// ==========================================
// REDUCER
// ==========================================

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: action.payload };
    case 'LOAD_DATA':
      return { ...state, ...action.payload, isLoading: false, isInitialized: true };
    case 'ADD_CURSO':
      return { ...state, cursos: [...state.cursos, action.payload] };
    case 'UPDATE_CURSO':
      return {
        ...state,
        cursos: state.cursos.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };
    case 'DELETE_CURSO':
      return {
        ...state,
        cursos: state.cursos.filter((c) => c.id !== action.payload),
      };
    case 'ADD_PROGRAMA':
      return { ...state, programas: [...state.programas, action.payload] };
    case 'UPDATE_PROGRAMA':
      return {
        ...state,
        programas: state.programas.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
      };
    case 'DELETE_PROGRAMA':
      return {
        ...state,
        programas: state.programas.filter((p) => p.id !== action.payload),
      };
    case 'ADD_SESSAO':
      return { ...state, sessoes: [...state.sessoes, action.payload] };
    case 'UPDATE_SESSAO':
      return {
        ...state,
        sessoes: state.sessoes.map((s) =>
          s.id === action.payload.id ? action.payload : s
        ),
      };
    case 'DELETE_SESSAO':
      return {
        ...state,
        sessoes: state.sessoes.filter((s) => s.id !== action.payload),
      };
    case 'ADD_PLANO_SESSAO':
      return { ...state, planosSessao: [...state.planosSessao, action.payload] };
    case 'UPDATE_PLANO_SESSAO':
      return {
        ...state,
        planosSessao: state.planosSessao.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
      };
    case 'DELETE_PLANO_SESSAO':
      return {
        ...state,
        planosSessao: state.planosSessao.filter((p) => p.id !== action.payload),
      };
    case 'ADD_PLANO_DEMONSTRACAO':
      return { ...state, planosDemonstracao: [...state.planosDemonstracao, action.payload] };
    case 'UPDATE_PLANO_DEMONSTRACAO':
      return {
        ...state,
        planosDemonstracao: state.planosDemonstracao.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
      };
    case 'DELETE_PLANO_DEMONSTRACAO':
      return {
        ...state,
        planosDemonstracao: state.planosDemonstracao.filter((p) => p.id !== action.payload),
      };
    case 'ADD_FICHA_TRABALHO':
      return { ...state, fichasTrabalho: [...state.fichasTrabalho, action.payload] };
    case 'UPDATE_FICHA_TRABALHO':
      return {
        ...state,
        fichasTrabalho: state.fichasTrabalho.map((f) =>
          f.id === action.payload.id ? action.payload : f
        ),
      };
    case 'DELETE_FICHA_TRABALHO':
      return {
        ...state,
        fichasTrabalho: state.fichasTrabalho.filter((f) => f.id !== action.payload),
      };
    case 'ADD_AUDIT_LOG':
      return { ...state, auditLogs: [action.payload, ...state.auditLogs] };
    default:
      return state;
  }
}

// ==========================================
// CONTEXTO
// ==========================================

interface AppContextType {
  state: AppState;
  refreshData: () => Promise<void>;
  // Cursos
  adicionarCurso: (data: CourseFormData) => Promise<Course>;
  atualizarCurso: (id: string, data: Partial<CourseFormData>) => Promise<void>;
  eliminarCurso: (id: string) => Promise<void>;
  getCurso: (id: string) => Course | undefined;
  // Programas
  adicionarPrograma: (data: ProgramFormData) => Promise<Program>;
  atualizarPrograma: (id: string, data: Partial<ProgramFormData>) => Promise<void>;
  eliminarPrograma: (id: string) => Promise<void>;
  getPrograma: (id: string) => Program | undefined;
  // Sessões
  adicionarSessao: (data: SessionFormData) => Promise<Session>;
  atualizarSessao: (id: string, data: Partial<SessionFormData>) => Promise<void>;
  eliminarSessao: (id: string) => Promise<void>;
  getSessao: (id: string) => Session | undefined;
  // Planos de Sessão
  adicionarPlanoSessao: (sessaoId: string, data: Omit<SessionPlan, 'id' | 'sessaoId' | 'dataCriacao' | 'dataAtualizacao' | 'criadoPor'>) => Promise<SessionPlan>;
  atualizarPlanoSessao: (id: string, data: Partial<SessionPlan>) => Promise<void>;
  eliminarPlanoSessao: (id: string) => Promise<void>;
  getPlanoSessao: (sessaoId: string) => SessionPlan | undefined;
  // Planos de Demonstração
  adicionarPlanoDemonstracao: (sessaoId: string, data: DemonstrationPlanFormData) => Promise<DemonstrationPlan>;
  atualizarPlanoDemonstracao: (id: string, data: Partial<DemonstrationPlanFormData>) => Promise<void>;
  eliminarPlanoDemonstracao: (id: string) => Promise<void>;
  getPlanoDemonstracao: (sessaoId: string) => DemonstrationPlan | undefined;
  // Fichas de Trabalho
  adicionarFichaTrabalho: (sessaoId: string, data: WorksheetFormData) => Promise<Worksheet>;
  atualizarFichaTrabalho: (id: string, data: Partial<WorksheetFormData>) => Promise<void>;
  eliminarFichaTrabalho: (id: string) => Promise<void>;
  getFichaTrabalho: (sessaoId: string) => Worksheet | undefined;
  getFichasTrabalhoSessao: (sessaoId: string) => Worksheet[];
  // Auditoria
  getAuditLogs: (filtros?: { entidadeTipo?: string; entidadeId?: string }) => AuditLog[];
  // Estatísticas
  getEstatisticas: () => DashboardStats;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ==========================================
// PROVIDER
// ==========================================

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Carregar dados do Firebase na inicialização
  useEffect(() => {
    const loadData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const data = await firebaseService.loadAllData();
        dispatch({ type: 'LOAD_DATA', payload: data });
      } catch (error) {
        console.error('Erro ao carregar dados do Firebase:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({ type: 'SET_INITIALIZED', payload: true });
      }
    };

    loadData();
  }, []);

  const refreshData = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const data = await firebaseService.loadAllData();
      dispatch({ type: 'LOAD_DATA', payload: data });
    } catch (error) {
      console.error('Erro ao recarregar dados:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Helper para adicionar log de auditoria
  const addAuditLog = useCallback(
    async (
      entidadeTipo: AuditLog['entidadeTipo'],
      entidadeId: string,
      entidadeNome: string,
      acao: AuditAction,
      detalhes: string,
      antes: Record<string, unknown> | null = null,
      depois: Record<string, unknown> | null = null
    ) => {
      const log: Omit<AuditLog, 'id'> = {
        entidadeTipo,
        entidadeId,
        entidadeNome,
        acao,
        detalhes,
        alteracoesAntes: antes,
        alteracoesDepois: depois,
        utilizador: state.utilizadorAtual,
        centroFormacaoId: '',
        dataHora: new Date().toISOString(),
      };
      
      try {
        const id = await firebaseService.createAuditLog(log);
        dispatch({ type: 'ADD_AUDIT_LOG', payload: { ...log, id } });
      } catch (error) {
        console.error('Erro ao criar log de auditoria:', error);
      }
    },
    [state.utilizadorAtual]
  );

  // ==========================================
  // CURSOS
  // ==========================================

  const adicionarCurso = useCallback(
    async (data: CourseFormData): Promise<Course> => {
      const agora = new Date().toISOString();
      const duracaoTotal = data.modulos.reduce((acc, m) => acc + m.duracaoHoras, 0);
      
      const cursoData: Omit<Course, 'id'> = {
        ...data,
        duracaoTotal,
        centroFormacaoId: '',
        modulos: data.modulos.map((m, i) => ({
          ...m,
          id: uuidv4(),
          ordem: i + 1,
        })),
        status: 'rascunho',
        dataCriacao: agora,
        dataAtualizacao: agora,
        criadoPor: state.utilizadorAtual,
      };

      const id = await firebaseService.createCourse(cursoData);
      const curso = { ...cursoData, id };
      
      dispatch({ type: 'ADD_CURSO', payload: curso });
      await addAuditLog('curso', id, curso.nome, 'criar', `Curso "${curso.nome}" criado`, null, curso as unknown as Record<string, unknown>);
      
      return curso;
    },
    [state.utilizadorAtual, addAuditLog]
  );

  const atualizarCurso = useCallback(
    async (id: string, data: Partial<CourseFormData>) => {
      const cursoExistente = state.cursos.find((c) => c.id === id);
      if (!cursoExistente) return;

      const duracaoTotal = data.modulos 
        ? data.modulos.reduce((acc, m) => acc + m.duracaoHoras, 0)
        : cursoExistente.duracaoTotal;

      const cursoAtualizado: Course = {
        ...cursoExistente,
        ...data,
        duracaoTotal,
        modulos: data.modulos 
          ? data.modulos.map((m, i) => ({
              ...m,
              id: uuidv4(),
              ordem: i + 1,
            }))
          : cursoExistente.modulos,
        dataAtualizacao: new Date().toISOString(),
      };

      await firebaseService.updateCourse(id, cursoAtualizado);
      dispatch({ type: 'UPDATE_CURSO', payload: cursoAtualizado });
      await addAuditLog(
        'curso',
        id,
        cursoAtualizado.nome,
        'editar',
        `Curso "${cursoAtualizado.nome}" atualizado`,
        cursoExistente as unknown as Record<string, unknown>,
        cursoAtualizado as unknown as Record<string, unknown>
      );
    },
    [state.cursos, addAuditLog]
  );

  const eliminarCurso = useCallback(
    async (id: string) => {
      const curso = state.cursos.find((c) => c.id === id);
      if (!curso) return;

      await firebaseService.deleteCourse(id);
      dispatch({ type: 'DELETE_CURSO', payload: id });
      await addAuditLog('curso', id, curso.nome, 'eliminar', `Curso "${curso.nome}" eliminado`, curso as unknown as Record<string, unknown>, null);
    },
    [state.cursos, addAuditLog]
  );

  const getCurso = useCallback(
    (id: string) => state.cursos.find((c) => c.id === id),
    [state.cursos]
  );

  // ==========================================
  // PROGRAMAS
  // ==========================================

  const adicionarPrograma = useCallback(
    async (data: ProgramFormData): Promise<Program> => {
      const agora = new Date().toISOString();
      
      const duracaoTotal = data.cursos.reduce((acc, pc) => {
        const curso = state.cursos.find((c) => c.id === pc.cursoId);
        return acc + (curso?.duracaoTotal || 0);
      }, 0);

      const programaData: Omit<Program, 'id'> = {
        ...data,
        duracaoTotal,
        centroFormacaoId: '',
        status: 'rascunho',
        dataCriacao: agora,
        dataAtualizacao: agora,
        criadoPor: state.utilizadorAtual,
      };

      const id = await firebaseService.createProgram(programaData);
      const programa = { ...programaData, id };
      
      dispatch({ type: 'ADD_PROGRAMA', payload: programa });
      await addAuditLog('programa', id, programa.nome, 'criar', `Programa "${programa.nome}" criado`, null, programa as unknown as Record<string, unknown>);
      
      return programa;
    },
    [state.utilizadorAtual, state.cursos, addAuditLog]
  );

  const atualizarPrograma = useCallback(
    async (id: string, data: Partial<ProgramFormData>) => {
      const programaExistente = state.programas.find((p) => p.id === id);
      if (!programaExistente) return;

      const cursosAtuais = data.cursos || programaExistente.cursos;
      const duracaoTotal = cursosAtuais.reduce((acc, pc) => {
        const curso = state.cursos.find((c) => c.id === pc.cursoId);
        return acc + (curso?.duracaoTotal || 0);
      }, 0);

      const programaAtualizado: Program = {
        ...programaExistente,
        ...data,
        duracaoTotal,
        dataAtualizacao: new Date().toISOString(),
      };

      await firebaseService.updateProgram(id, programaAtualizado);
      dispatch({ type: 'UPDATE_PROGRAMA', payload: programaAtualizado });
      await addAuditLog(
        'programa',
        id,
        programaAtualizado.nome,
        'editar',
        `Programa "${programaAtualizado.nome}" atualizado`,
        programaExistente as unknown as Record<string, unknown>,
        programaAtualizado as unknown as Record<string, unknown>
      );
    },
    [state.programas, state.cursos, addAuditLog]
  );

  const eliminarPrograma = useCallback(
    async (id: string) => {
      const programa = state.programas.find((p) => p.id === id);
      if (!programa) return;

      await firebaseService.deleteProgram(id);
      dispatch({ type: 'DELETE_PROGRAMA', payload: id });
      await addAuditLog('programa', id, programa.nome, 'eliminar', `Programa "${programa.nome}" eliminado`, programa as unknown as Record<string, unknown>, null);
    },
    [state.programas, addAuditLog]
  );

  const getPrograma = useCallback(
    (id: string) => state.programas.find((p) => p.id === id),
    [state.programas]
  );

  // ==========================================
  // SESSÕES
  // ==========================================

  const adicionarSessao = useCallback(
    async (data: SessionFormData): Promise<Session> => {
      const agora = new Date().toISOString();

      const sessaoData: Omit<Session, 'id'> = {
        ...data,
        centroFormacaoId: '',
        atividades: data.atividades.map((a, i) => ({
          ...a,
          id: uuidv4(),
          ordem: i + 1,
        })),
        recursos: data.recursos.map((r) => ({
          ...r,
          id: uuidv4(),
        })),
        status: 'rascunho',
        dataCriacao: agora,
        dataAtualizacao: agora,
        criadoPor: state.utilizadorAtual,
      };

      const id = await firebaseService.createSession(sessaoData);
      const sessao = { ...sessaoData, id };
      
      dispatch({ type: 'ADD_SESSAO', payload: sessao });
      await addAuditLog('sessao', id, sessao.nome, 'criar', `Sessão "${sessao.nome}" criada`, null, sessao as unknown as Record<string, unknown>);
      
      return sessao;
    },
    [state.utilizadorAtual, addAuditLog]
  );

  const atualizarSessao = useCallback(
    async (id: string, data: Partial<SessionFormData>) => {
      const sessaoExistente = state.sessoes.find((s) => s.id === id);
      if (!sessaoExistente) return;

      const sessaoAtualizada: Session = {
        ...sessaoExistente,
        ...data,
        atividades: data.atividades 
          ? data.atividades.map((a, i) => ({
              ...a,
              id: uuidv4(),
              ordem: i + 1,
            }))
          : sessaoExistente.atividades,
        recursos: data.recursos
          ? data.recursos.map((r) => ({
              ...r,
              id: uuidv4(),
            }))
          : sessaoExistente.recursos,
        dataAtualizacao: new Date().toISOString(),
      };

      await firebaseService.updateSession(id, sessaoAtualizada);
      dispatch({ type: 'UPDATE_SESSAO', payload: sessaoAtualizada });
      await addAuditLog(
        'sessao',
        id,
        sessaoAtualizada.nome,
        'editar',
        `Sessão "${sessaoAtualizada.nome}" atualizada`,
        sessaoExistente as unknown as Record<string, unknown>,
        sessaoAtualizada as unknown as Record<string, unknown>
      );
    },
    [state.sessoes, addAuditLog]
  );

  const eliminarSessao = useCallback(
    async (id: string) => {
      const sessao = state.sessoes.find((s) => s.id === id);
      if (!sessao) return;

      await firebaseService.deleteSession(id);
      dispatch({ type: 'DELETE_SESSAO', payload: id });
      await addAuditLog('sessao', id, sessao.nome, 'eliminar', `Sessão "${sessao.nome}" eliminada`, sessao as unknown as Record<string, unknown>, null);
    },
    [state.sessoes, addAuditLog]
  );

  const getSessao = useCallback(
    (id: string) => state.sessoes.find((s) => s.id === id),
    [state.sessoes]
  );

  // ==========================================
  // PLANOS DE SESSÃO
  // ==========================================

  const adicionarPlanoSessao = useCallback(
    async (sessaoId: string, data: Omit<SessionPlan, 'id' | 'sessaoId' | 'dataCriacao' | 'dataAtualizacao' | 'criadoPor'>): Promise<SessionPlan> => {
      const agora = new Date().toISOString();
      const sessao = state.sessoes.find((s) => s.id === sessaoId);

      const planoData: Omit<SessionPlan, 'id'> = {
        sessaoId,
        ...data,
        dataCriacao: agora,
        dataAtualizacao: agora,
        criadoPor: state.utilizadorAtual,
      };

      const id = await firebaseService.createSessionPlan(planoData);
      const plano = { ...planoData, id };
      
      dispatch({ type: 'ADD_PLANO_SESSAO', payload: plano });
      await addAuditLog('plano', id, sessao?.nome || 'Plano de Sessão', 'criar', `Plano de sessão criado para "${sessao?.nome}"`, null, plano as unknown as Record<string, unknown>);
      
      return plano;
    },
    [state.utilizadorAtual, state.sessoes, addAuditLog]
  );

  const atualizarPlanoSessao = useCallback(
    async (id: string, data: Partial<SessionPlan>) => {
      const planoExistente = state.planosSessao.find((p) => p.id === id);
      if (!planoExistente) return;

      const sessao = state.sessoes.find((s) => s.id === planoExistente.sessaoId);

      const planoAtualizado: SessionPlan = {
        ...planoExistente,
        ...data,
        dataAtualizacao: new Date().toISOString(),
      };

      await firebaseService.updateSessionPlan(id, planoAtualizado);
      dispatch({ type: 'UPDATE_PLANO_SESSAO', payload: planoAtualizado });
      await addAuditLog(
        'plano',
        id,
        sessao?.nome || 'Plano de Sessão',
        'editar',
        `Plano de sessão atualizado para "${sessao?.nome}"`,
        planoExistente as unknown as Record<string, unknown>,
        planoAtualizado as unknown as Record<string, unknown>
      );
    },
    [state.planosSessao, state.sessoes, addAuditLog]
  );

  const eliminarPlanoSessao = useCallback(
    async (id: string) => {
      const plano = state.planosSessao.find((p) => p.id === id);
      if (!plano) return;

      const sessao = state.sessoes.find((s) => s.id === plano.sessaoId);

      await firebaseService.deleteSessionPlan(id);
      dispatch({ type: 'DELETE_PLANO_SESSAO', payload: id });
      await addAuditLog('plano', id, sessao?.nome || 'Plano de Sessão', 'eliminar', `Plano de sessão eliminado`, plano as unknown as Record<string, unknown>, null);
    },
    [state.planosSessao, state.sessoes, addAuditLog]
  );

  const getPlanoSessao = useCallback(
    (sessaoId: string) => state.planosSessao.find((p) => p.sessaoId === sessaoId),
    [state.planosSessao]
  );

  // ==========================================
  // PLANOS DE DEMONSTRAÇÃO
  // ==========================================

  const adicionarPlanoDemonstracao = useCallback(
    async (sessaoId: string, data: DemonstrationPlanFormData): Promise<DemonstrationPlan> => {
      const agora = new Date().toISOString();
      const sessao = state.sessoes.find((s) => s.id === sessaoId);
      const duracaoTotal = data.etapas.reduce((acc, e) => acc + e.tempoMinutos, 0);

      const planoData: Omit<DemonstrationPlan, 'id'> = {
        sessaoId,
        ...data,
        duracaoTotal,
        etapas: data.etapas.map((e, i) => ({
          ...e,
          id: uuidv4(),
          ordem: i + 1,
        })),
        dataCriacao: agora,
        dataAtualizacao: agora,
        criadoPor: state.utilizadorAtual,
      };

      const id = await firebaseService.createDemonstrationPlan(planoData);
      const plano = { ...planoData, id };
      
      dispatch({ type: 'ADD_PLANO_DEMONSTRACAO', payload: plano });
      await addAuditLog('demonstracao', id, plano.titulo, 'criar', `Plano de demonstração "${plano.titulo}" criado para "${sessao?.nome}"`, null, plano as unknown as Record<string, unknown>);
      
      return plano;
    },
    [state.utilizadorAtual, state.sessoes, addAuditLog]
  );

  const atualizarPlanoDemonstracao = useCallback(
    async (id: string, data: Partial<DemonstrationPlanFormData>) => {
      const planoExistente = state.planosDemonstracao.find((p) => p.id === id);
      if (!planoExistente) return;

      const duracaoTotal = data.etapas 
        ? data.etapas.reduce((acc, e) => acc + e.tempoMinutos, 0)
        : planoExistente.duracaoTotal;

      const planoAtualizado: DemonstrationPlan = {
        ...planoExistente,
        ...data,
        duracaoTotal,
        etapas: data.etapas 
          ? data.etapas.map((e, i) => ({
              ...e,
              id: uuidv4(),
              ordem: i + 1,
            }))
          : planoExistente.etapas,
        dataAtualizacao: new Date().toISOString(),
      };

      await firebaseService.updateDemonstrationPlan(id, planoAtualizado);
      dispatch({ type: 'UPDATE_PLANO_DEMONSTRACAO', payload: planoAtualizado });
      await addAuditLog(
        'demonstracao',
        id,
        planoAtualizado.titulo,
        'editar',
        `Plano de demonstração "${planoAtualizado.titulo}" atualizado`,
        planoExistente as unknown as Record<string, unknown>,
        planoAtualizado as unknown as Record<string, unknown>
      );
    },
    [state.planosDemonstracao, addAuditLog]
  );

  const eliminarPlanoDemonstracao = useCallback(
    async (id: string) => {
      const plano = state.planosDemonstracao.find((p) => p.id === id);
      if (!plano) return;

      await firebaseService.deleteDemonstrationPlan(id);
      dispatch({ type: 'DELETE_PLANO_DEMONSTRACAO', payload: id });
      await addAuditLog('demonstracao', id, plano.titulo, 'eliminar', `Plano de demonstração "${plano.titulo}" eliminado`, plano as unknown as Record<string, unknown>, null);
    },
    [state.planosDemonstracao, addAuditLog]
  );

  const getPlanoDemonstracao = useCallback(
    (sessaoId: string) => state.planosDemonstracao.find((p) => p.sessaoId === sessaoId),
    [state.planosDemonstracao]
  );

  // ==========================================
  // FICHAS DE TRABALHO
  // ==========================================

  const adicionarFichaTrabalho = useCallback(
    async (sessaoId: string, data: WorksheetFormData): Promise<Worksheet> => {
      const agora = new Date().toISOString();
      const sessao = state.sessoes.find((s) => s.id === sessaoId);
      const totalPontos = data.exercicios.reduce((acc, e) => acc + e.pontuacao, 0);

      const fichaData: Omit<Worksheet, 'id'> = {
        sessaoId,
        ...data,
        totalPontos,
        exercicios: data.exercicios.map((e, i) => ({
          ...e,
          id: uuidv4(),
          ordem: i + 1,
        })),
        dataCriacao: agora,
        dataAtualizacao: agora,
        criadoPor: state.utilizadorAtual,
      };

      const id = await firebaseService.createWorksheet(fichaData);
      const ficha = { ...fichaData, id };
      
      dispatch({ type: 'ADD_FICHA_TRABALHO', payload: ficha });
      await addAuditLog('ficha', id, ficha.titulo, 'criar', `Ficha de trabalho "${ficha.titulo}" criada para "${sessao?.nome}"`, null, ficha as unknown as Record<string, unknown>);
      
      return ficha;
    },
    [state.utilizadorAtual, state.sessoes, addAuditLog]
  );

  const atualizarFichaTrabalho = useCallback(
    async (id: string, data: Partial<WorksheetFormData>) => {
      const fichaExistente = state.fichasTrabalho.find((f) => f.id === id);
      if (!fichaExistente) return;

      const totalPontos = data.exercicios 
        ? data.exercicios.reduce((acc, e) => acc + e.pontuacao, 0)
        : fichaExistente.totalPontos;

      const fichaAtualizada: Worksheet = {
        ...fichaExistente,
        ...data,
        totalPontos,
        exercicios: data.exercicios 
          ? data.exercicios.map((e, i) => ({
              ...e,
              id: uuidv4(),
              ordem: i + 1,
            }))
          : fichaExistente.exercicios,
        dataAtualizacao: new Date().toISOString(),
      };

      await firebaseService.updateWorksheet(id, fichaAtualizada);
      dispatch({ type: 'UPDATE_FICHA_TRABALHO', payload: fichaAtualizada });
      await addAuditLog(
        'ficha',
        id,
        fichaAtualizada.titulo,
        'editar',
        `Ficha de trabalho "${fichaAtualizada.titulo}" atualizada`,
        fichaExistente as unknown as Record<string, unknown>,
        fichaAtualizada as unknown as Record<string, unknown>
      );
    },
    [state.fichasTrabalho, addAuditLog]
  );

  const eliminarFichaTrabalho = useCallback(
    async (id: string) => {
      const ficha = state.fichasTrabalho.find((f) => f.id === id);
      if (!ficha) return;

      await firebaseService.deleteWorksheet(id);
      dispatch({ type: 'DELETE_FICHA_TRABALHO', payload: id });
      await addAuditLog('ficha', id, ficha.titulo, 'eliminar', `Ficha de trabalho "${ficha.titulo}" eliminada`, ficha as unknown as Record<string, unknown>, null);
    },
    [state.fichasTrabalho, addAuditLog]
  );

  const getFichaTrabalho = useCallback(
    (sessaoId: string) => state.fichasTrabalho.find((f) => f.sessaoId === sessaoId),
    [state.fichasTrabalho]
  );

  const getFichasTrabalhoSessao = useCallback(
    (sessaoId: string) => state.fichasTrabalho.filter((f) => f.sessaoId === sessaoId),
    [state.fichasTrabalho]
  );

  // ==========================================
  // AUDITORIA
  // ==========================================

  const getAuditLogs = useCallback(
    (filtros?: { entidadeTipo?: string; entidadeId?: string }) => {
      let logs = state.auditLogs;
      
      if (filtros?.entidadeTipo) {
        logs = logs.filter((l) => l.entidadeTipo === filtros.entidadeTipo);
      }
      if (filtros?.entidadeId) {
        logs = logs.filter((l) => l.entidadeId === filtros.entidadeId);
      }
      
      return logs;
    },
    [state.auditLogs]
  );

  // ==========================================
  // ESTATÍSTICAS
  // ==========================================

  const getEstatisticas = useCallback((): DashboardStats => {
    const hoje = new Date();
    
    return {
      totalCursos: state.cursos.length,
      cursosAtivos: state.cursos.filter((c) => c.status === 'ativo').length,
      totalProgramas: state.programas.length,
      programasAtivos: state.programas.filter((p) => p.status === 'ativo').length,
      totalSessoes: state.sessoes.length,
      sessoesAgendadas: state.sessoes.filter((s) => new Date(s.dataInicio) >= hoje).length,
      horasFormacao: state.cursos.reduce((acc, c) => acc + c.duracaoTotal, 0),
      totalFormadores: 0,
    };
  }, [state.cursos, state.programas, state.sessoes]);

  const value: AppContextType = {
    state,
    refreshData,
    adicionarCurso,
    atualizarCurso,
    eliminarCurso,
    getCurso,
    adicionarPrograma,
    atualizarPrograma,
    eliminarPrograma,
    getPrograma,
    adicionarSessao,
    atualizarSessao,
    eliminarSessao,
    getSessao,
    adicionarPlanoSessao,
    atualizarPlanoSessao,
    eliminarPlanoSessao,
    getPlanoSessao,
    adicionarPlanoDemonstracao,
    atualizarPlanoDemonstracao,
    eliminarPlanoDemonstracao,
    getPlanoDemonstracao,
    adicionarFichaTrabalho,
    atualizarFichaTrabalho,
    eliminarFichaTrabalho,
    getFichaTrabalho,
    getFichasTrabalhoSessao,
    getAuditLogs,
    getEstatisticas,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ==========================================
// HOOK
// ==========================================

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
}
