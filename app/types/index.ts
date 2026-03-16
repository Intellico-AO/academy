// ==========================================
// TIPOS BASE
// ==========================================

export type Status = 'rascunho' | 'ativo' | 'arquivado' | 'cancelado' | 'inativo' | 'em_avaliacao' | 'aguardando_aprovacao';
export type SessionType = 'presencial' | 'online' | 'hibrido';
export type AuditAction = 'criar' | 'editar' | 'eliminar' | 'arquivar' | 'ativar';
export type UserRole = 'admin' | 'responsavel' | 'assistente' | 'formador' | 'regulador' | 'formando';
export type EnrollmentStatus = 'ativo' | 'concluido' | 'cancelado';
export type AdminRole = 'owner' | 'manager';

// ==========================================
// CENTRO DE FORMAÇÃO
// ==========================================

export interface TrainingCenter {
  id: string;
  nome: string;
  nif: string;
  email: string;
  telefone: string;
  morada: string;
  codigoPostal: string;
  localidade: string;
  pais: string;
  website?: string;
  logoUrl?: string;
  responsavel: string;
  emailResponsavel: string;
  telefoneResponsavel: string;
  certificacoes: string[];
  areasFormacao: string[];
  status: Status;
  dataCriacao: string;
  dataAtualizacao: string;
}

// ==========================================
// REGULADORES
// ==========================================

export interface Regulator {
  id: string;
  nome: string;
  tipo: 'nacional' | 'regional' | 'internacional' | 'outro';
  pais: string;
  descricao?: string;
  website?: string;
  email?: string;
  telefone?: string;
  morada?: string;
  logoUrl?: string;
  cursosCertificados?: string[];
  programasCertificados?: string[];
  notasInternas?: string;
  centroFormacaoId: string;
  status: Status;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface RegulatorFormData {
  nome: string;
  tipo: 'nacional' | 'regional' | 'internacional' | 'outro';
  pais: string;
  descricao?: string;
  website?: string;
  email?: string;
  telefone?: string;
  morada?: string;
  logoUrl?: string;
  cursosCertificados?: string[];
  programasCertificados?: string[];
  notasInternas?: string;
}

// ==========================================
// NOTAS DO REGULADOR
// ==========================================

export type NotaCategoria =
  | 'informacoes_gerais'
  | 'contacto'
  | 'certificacoes'
  | 'curso'
  | 'formador'
  | 'programa';

export interface ReguladorNota {
  id: string;
  centroFormacaoId: string;
  reguladorId: string;
  categoria: NotaCategoria;
  referenciaId?: string;
  referenciaNome?: string;
  conteudo: string;
  utilizador: string;
  dataCriacao: string;
  dataAtualizacao: string;
}

// ==========================================
// UTILIZADOR / CONTA
// ==========================================

export interface UserAccount {
  id: string;
  uid?: string; // Firebase Auth UID; ausente = utilizador pré-registado (pendente de definir palavra-passe no 1.º login)
  nome: string;
  email: string;
  role: UserRole;
  roles?: UserRole[]; // Papéis adicionais do utilizador (permite alternar entre ambientes)
  centroFormacaoId: string;
  centrosFormacaoIds?: string[]; // Centros adicionais a que o utilizador está associado
  ativo: boolean;
  avatarUrl?: string;
  dataNascimento?: string;
  adminRole?: AdminRole; // 'owner' = gestão total, 'manager' = admin sem gerir admins (apenas role='admin')
  reguladorId?: string; // Liga o utilizador à entidade reguladora (apenas role='regulador')
  dataCriacao: string;
  ultimoAcesso?: string;
}

// ==========================================
// FORMADOR
// ==========================================

export type VerificacaoCertificado = 'pendente' | 'verificado' | 'rejeitado' | 'expirado';

export interface Trainer {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  nif: string;
  morada: string;
  codigoPostal: string;
  localidade: string;
  dataNascimento: string;
  nacionalidade: string;
  habilitacoes: string;
  certificacaoPedagogica: string; // CAP/CCP
  numeroCertificacao: string;
  validadeCertificacao: string;
  areasCompetencia: string[];
  experienciaAnos: number;
  curriculo?: string;
  fotografia?: string;
  centroFormacaoId: string;
  userId?: string; // Se o formador tiver conta no sistema
  verificacaoCertificado?: VerificacaoCertificado;
  verificacaoData?: string;
  verificacaoPor?: string;
  verificacaoNotas?: string;
  status: Status;
  dataCriacao: string;
  dataAtualizacao: string;
}

// ==========================================
// MÓDULOS DE CURSO
// ==========================================

export interface CourseModule {
  id: string;
  nome: string;
  descricao: string;
  duracaoHoras: number;
  objetivos: string[];
  conteudos: string[];
  ordem: number;
}

// ==========================================
// CURSOS
// ==========================================

export interface Course {
  id: string;
  codigo: string;
  nome: string;
  descricao: string;
  objetivosGerais: string[];
  publicoAlvo: string;
  prerequisitos: string[];
  duracaoTotal: number;
  modulos: CourseModule[];
  avaliacao: string;
  certificacao: string;
  formadorId?: string;
  formadorNome?: string;
  centroFormacaoId: string;
  status: Status;
  dataCriacao: string;
  dataAtualizacao: string;
  criadoPor: string;
}

// ==========================================
// PROGRAMAS FORMATIVOS
// ==========================================

export interface ProgramCourse {
  cursoId: string;
  ordem: number;
  obrigatorio: boolean;
}

export interface Program {
  id: string;
  codigo: string;
  nome: string;
  descricao: string;
  objetivos: string[];
  cursos: ProgramCourse[];
  duracaoTotal: number;
  certificacao: string;
  centroFormacaoId: string;
  status: Status;
  dataCriacao: string;
  dataAtualizacao: string;
  criadoPor: string;
}

// ==========================================
// SESSÕES FORMATIVAS
// ==========================================

export interface SessionResource {
  id: string;
  tipo: 'material' | 'equipamento' | 'sala' | 'outro';
  nome: string;
  descricao: string;
  quantidade: number;
}

export interface SessionActivity {
  id: string;
  nome: string;
  descricao: string;
  duracaoMinutos: number;
  tipo: 'teorica' | 'pratica' | 'avaliacao' | 'intervalo';
  recursos: string[];
  ordem: number;
}

export interface Session {
  id: string;
  cursoId: string;
  moduloId: string;
  nome: string;
  descricao: string;
  tipo: SessionType;
  data: string;
  horaInicio: string;
  horaFim: string;
  local: string;
  capacidadeMaxima: number;
  formadorId?: string;
  formador: string;
  atividades: SessionActivity[];
  recursos: SessionResource[];
  objetivosSessao: string[];
  notas: string;
  centroFormacaoId: string;
  status: Status;
  dataCriacao: string;
  dataAtualizacao: string;
  criadoPor: string;
}

// ==========================================
// PLANOS DE SESSÃO
// ==========================================

export interface SessionPlan {
  id: string;
  sessaoId: string;
  introducao: string;
  desenvolvimento: string;
  conclusao: string;
  metodos: string[];
  tecnicas: string[];
  avaliacaoFormativa: string;
  adaptacoes: string;
  observacoes: string;
  dataCriacao: string;
  dataAtualizacao: string;
  criadoPor: string;
}

// ==========================================
// PLANO DE DEMONSTRAÇÃO
// ==========================================

export interface DemonstrationStep {
  id: string;
  ordem: number;
  descricao: string;
  tempoMinutos: number;
  materiaisNecessarios: string[];
  pontosChave: string[];
  errosComuns: string[];
}

export interface DemonstrationPlan {
  id: string;
  sessaoId: string;
  titulo: string;
  objetivoGeral: string;
  objetivosEspecificos: string[];
  publicoAlvo: string;
  duracaoTotal: number;
  materiaisEquipamentos: string[];
  condicoesSeguranca: string[];
  preparacaoPrevia: string;
  etapas: DemonstrationStep[];
  criteriosAvaliacao: string[];
  observacoes: string;
  dataCriacao: string;
  dataAtualizacao: string;
  criadoPor: string;
}

// ==========================================
// FICHA DE TRABALHO
// ==========================================

export interface WorksheetExercise {
  id: string;
  ordem: number;
  tipo: 'multipla_escolha' | 'verdadeiro_falso' | 'resposta_curta' | 'resposta_longa' | 'pratico' | 'correspondencia';
  pergunta: string;
  opcoes?: string[];
  respostaCorreta?: string;
  pontuacao: number;
  instrucoes?: string;
}

export interface Worksheet {
  id: string;
  sessaoId: string;
  titulo: string;
  subtitulo?: string;
  objetivos: string[];
  instrucoes: string;
  tempoRecomendado: number;
  exercicios: WorksheetExercise[];
  criteriosAvaliacao: string;
  totalPontos: number;
  observacoes: string;
  dataCriacao: string;
  dataAtualizacao: string;
  criadoPor: string;
}

// ==========================================
// INSCRIÇÕES (FORMANDOS EM CURSOS)
// ==========================================

export interface Enrollment {
  id: string;
  formandoId: string;
  cursoId: string;
  centroFormacaoId: string;
  status: EnrollmentStatus;
  dataInscricao: string;
  dataCriacao: string;
  dataAtualizacao: string;
}

// ==========================================
// AUDITORIA
// ==========================================

export interface AuditLog {
  id: string;
  entidadeTipo:
    | 'curso'
    | 'programa'
    | 'sessao'
    | 'plano'
    | 'demonstracao'
    | 'ficha'
    | 'centro'
    | 'formador'
    | 'utilizador'
    | 'regulador'
    | 'administrador'
    | 'formando'
    | 'inscricao';
  entidadeId: string;
  entidadeNome: string;
  acao: AuditAction;
  detalhes: string;
  alteracoesAntes: Record<string, unknown> | null;
  alteracoesDepois: Record<string, unknown> | null;
  utilizador: string;
  centroFormacaoId: string;
  dataHora: string;
  ipAddress?: string;
}

// ==========================================
// FORMULÁRIOS
// ==========================================

export interface TrainingCenterFormData {
  nome: string;
  nif: string;
  email: string;
  telefone: string;
  morada: string;
  codigoPostal: string;
  localidade: string;
  pais: string;
  website?: string;
  responsavel: string;
  emailResponsavel: string;
  telefoneResponsavel: string;
  certificacoes: string[];
  areasFormacao: string[];
}

export interface TrainerFormData {
  nome: string;
  email: string;
  telefone: string;
  nif: string;
  morada: string;
  codigoPostal: string;
  localidade: string;
  dataNascimento: string;
  nacionalidade: string;
  habilitacoes: string;
  certificacaoPedagogica: string;
  numeroCertificacao: string;
  validadeCertificacao: string;
  areasCompetencia: string[];
  experienciaAnos: number;
  curriculo?: string;
}

export interface CourseFormData {
  codigo: string;
  nome: string;
  descricao: string;
  objetivosGerais: string[];
  publicoAlvo: string;
  prerequisitos: string[];
  avaliacao: string;
  certificacao: string;
  formadorId?: string;
  formadorNome?: string;
  modulos: Omit<CourseModule, 'id' | 'ordem'>[];
}

export interface ProgramFormData {
  codigo: string;
  nome: string;
  descricao: string;
  objetivos: string[];
  cursos: ProgramCourse[];
  certificacao: string;
}

export interface SessionFormData {
  cursoId: string;
  moduloId: string;
  nome: string;
  descricao: string;
  tipo: SessionType;
  data: string;
  horaInicio: string;
  horaFim: string;
  local: string;
  capacidadeMaxima: number;
  formadorId?: string;
  formador: string;
  objetivosSessao: string[];
  notas: string;
  atividades: Omit<SessionActivity, 'id' | 'ordem'>[];
  recursos: Omit<SessionResource, 'id'>[];
}

export interface DemonstrationPlanFormData {
  titulo: string;
  objetivoGeral: string;
  objetivosEspecificos: string[];
  publicoAlvo: string;
  materiaisEquipamentos: string[];
  condicoesSeguranca: string[];
  preparacaoPrevia: string;
  etapas: Omit<DemonstrationStep, 'id'>[];
  criteriosAvaliacao: string[];
  observacoes: string;
}

export interface WorksheetFormData {
  titulo: string;
  subtitulo?: string;
  objetivos: string[];
  instrucoes: string;
  tempoRecomendado: number;
  exercicios: Omit<WorksheetExercise, 'id'>[];
  criteriosAvaliacao: string;
  observacoes: string;
}

// ==========================================
// ESTATÍSTICAS DASHBOARD
// ==========================================

export interface DashboardStats {
  totalCursos: number;
  cursosAtivos: number;
  totalProgramas: number;
  programasAtivos: number;
  totalSessoes: number;
  sessoesAgendadas: number;
  horasFormacao: number;
  totalFormadores: number;
}

// ==========================================
// REGISTO
// ==========================================

export interface RegisterFormData {
  // Dados do Centro
  centroNome: string;
  centroNif: string;
  centroEmail: string;
  centroTelefone: string;
  centroMorada: string;
  centroCodigoPostal: string;
  centroLocalidade: string;
  centroPais: string;
  // Dados do Responsável/Admin
  responsavelNome: string;
  responsavelEmail: string;
  responsavelPassword: string;
  responsavelTelefone: string;
}
