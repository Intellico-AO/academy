# FormaPro Academy — Documentação Técnica Completa

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Estrutura de Pastas](#3-estrutura-de-pastas)
4. [Sistema de Rotas (38 páginas)](#4-sistema-de-rotas)
5. [Sistema de Papéis e Permissões](#5-sistema-de-papéis-e-permissões)
6. [Fluxo de Autenticação](#6-fluxo-de-autenticação)
7. [Modelos de Dados (Firestore)](#7-modelos-de-dados-firestore)
8. [Contextos (State Management)](#8-contextos-state-management)
9. [Serviços (Camada de Dados)](#9-serviços-camada-de-dados)
10. [Componentes UI](#10-componentes-ui)
11. [Componentes de Layout](#11-componentes-de-layout)
12. [Fluxo de Dados](#12-fluxo-de-dados)
13. [Validação de Formulários](#13-validação-de-formulários)
14. [Sistema de Auditoria](#14-sistema-de-auditoria)
15. [Sistema de Impressão](#15-sistema-de-impressão)
16. [Variáveis de Ambiente](#16-variáveis-de-ambiente)
17. [Configuração do Biome (Linter)](#17-configuração-do-biome)
18. [Comandos de Desenvolvimento](#18-comandos-de-desenvolvimento)
19. [Diagramas de Fluxo](#19-diagramas-de-fluxo)
20. [Problemas Conhecidos e Notas Técnicas](#20-problemas-conhecidos-e-notas-técnicas)

---

## 1. Visão Geral

**FormaPro** é um SaaS multi-tenant para gestão de centros de formação profissional. Permite gerir cursos, programas, sessões formativas, formadores, formandos e documentos pedagógicos, com sistema de auditoria e conformidade regulatória.

**Repositório:** https://github.com/Intellico-AO/academy
**Projeto Firebase:** form-pro-44888

---

## 2. Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Next.js (App Router, Turbopack) | 16.1.4 |
| UI | React | 19.2.3 |
| Linguagem | TypeScript | 5 |
| Estilos | Tailwind CSS | 4 |
| Base de Dados | Firebase Firestore (Client SDK) | 12.8.0 |
| Autenticação | Firebase Authentication | 12.8.0 |
| Formulários | react-hook-form | 7.71.2 |
| Validação | zod | 4.3.6 |
| Resolvers | @hookform/resolvers | 5.2.2 |
| Ícones | lucide-react | 0.562.0 |
| Datas | date-fns | 4.1.0 |
| IDs | uuid | 13.0.0 |
| Linter | Biome | - |
| Package Manager | pnpm | 9.15.4 |

---

## 3. Estrutura de Pastas

```
app/
├── (auth)/                     # Rotas públicas de autenticação
│   ├── login/page.tsx
│   ├── registar/page.tsx
│   ├── recuperar-password/page.tsx
│   └── layout.tsx
│
├── (dashboard)/                # Dashboard principal (gestor/formador/formando)
│   ├── page.tsx                # Painel de controlo
│   ├── cursos/                 # CRUD de cursos
│   │   ├── page.tsx
│   │   ├── novo/page.tsx
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── editar/page.tsx
│   ├── programas/              # CRUD de programas
│   │   ├── page.tsx
│   │   ├── novo/page.tsx
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── editar/page.tsx
│   ├── sessoes/                # CRUD de sessões
│   │   ├── page.tsx
│   │   ├── nova/page.tsx
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── editar/page.tsx
│   ├── planos/                 # Documentos pedagógicos (planos, demonstrações, fichas)
│   │   └── page.tsx
│   ├── formadores/             # Gestão de formadores (gestor only)
│   │   ├── page.tsx
│   │   ├── novo/page.tsx
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── editar/page.tsx
│   ├── formandos/              # Gestão de formandos (gestor only)
│   │   ├── page.tsx
│   │   ├── novo/page.tsx
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── editar/page.tsx
│   ├── auditoria/page.tsx      # Logs de auditoria (gestor only)
│   └── layout.tsx              # MainLayout wrapper
│
├── admin/                      # Painel de administração (admin only)
│   ├── page.tsx
│   ├── reguladores/
│   │   ├── page.tsx
│   │   ├── novo/page.tsx
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── editar/page.tsx
│   ├── administradores/page.tsx
│   └── layout.tsx              # AdminLayout wrapper
│
├── regulador/                  # Painel do regulador (regulador only)
│   ├── page.tsx
│   ├── centros/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── formadores/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── cursos/page.tsx
│   └── layout.tsx              # ReguladorLayout wrapper
│
├── components/
│   ├── ui/                     # Componentes reutilizáveis
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── TextArea.tsx
│   │   ├── Select.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── EmptyState.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── index.ts
│   ├── layout/                 # Componentes estruturais
│   │   ├── Sidebar.tsx
│   │   ├── AdminSidebar.tsx
│   │   ├── ReguladorSidebar.tsx
│   │   ├── Header.tsx
│   │   ├── MainLayout.tsx
│   │   ├── AdminLayout.tsx
│   │   ├── ReguladorLayout.tsx
│   │   └── index.ts
│   ├── print/                  # Componentes de impressão
│   │   ├── PrintStyles.tsx
│   │   ├── SessionPlanPrint.tsx
│   │   ├── DemonstrationPlanPrint.tsx
│   │   ├── WorksheetPrint.tsx
│   │   └── index.ts
│   └── ClientProviders.tsx     # Provider wrapper (evita hydration mismatch)
│
├── context/
│   ├── AuthContext.tsx          # Estado de autenticação
│   ├── AppContext.tsx           # Estado da aplicação (useReducer)
│   └── ToastContext.tsx         # Notificações toast
│
├── lib/
│   ├── firebase.ts             # Inicialização Firebase
│   ├── authService.ts          # Autenticação + CRUD de utilizadores
│   ├── firebaseService.ts      # CRUD de cursos/programas/sessões/planos
│   ├── trainersService.ts      # Gestão de formadores
│   ├── formandosService.ts     # Gestão de formandos
│   ├── enrollmentService.ts    # Inscrições de formandos em cursos
│   ├── regulatorsService.ts    # Gestão de reguladores
│   └── reguladorNotasService.ts # Notas dos reguladores
│
├── types/
│   └── index.ts                # Todas as interfaces TypeScript
│
├── layout.tsx                  # Root layout
└── globals.css                 # Estilos globais + Tailwind
```

---

## 4. Sistema de Rotas

### 4.1 Rotas Públicas — `(auth)/`

| Rota | Ficheiro | Descrição |
|------|---------|-----------|
| `/login` | `(auth)/login/page.tsx` | Login em 2 passos (email → senha) |
| `/registar` | `(auth)/registar/page.tsx` | Registo de centro de formação (2 passos) |
| `/recuperar-password` | `(auth)/recuperar-password/page.tsx` | Recuperação de senha via email |

### 4.2 Dashboard — `(dashboard)/`

Acessível por: `gestor`, `formador`, `formando`

| Rota | Acesso | Descrição |
|------|--------|-----------|
| `/` | todos | Dashboard principal (vista diferente por papel) |
| `/cursos` | todos | Lista de cursos (formando: apenas inscritos) |
| `/cursos/novo` | gestor, formador | Criar curso |
| `/cursos/[id]` | todos | Detalhes do curso |
| `/cursos/[id]/editar` | gestor, formador | Editar curso |
| `/programas` | gestor, formador | Lista de programas |
| `/programas/novo` | gestor, formador | Criar programa |
| `/programas/[id]` | gestor, formador | Detalhes do programa |
| `/programas/[id]/editar` | gestor, formador | Editar programa |
| `/sessoes` | todos | Lista de sessões (formando: apenas dos seus cursos) |
| `/sessoes/nova` | gestor, formador | Criar sessão |
| `/sessoes/[id]` | todos | Detalhes da sessão |
| `/sessoes/[id]/editar` | gestor, formador | Editar sessão |
| `/planos` | todos | Documentos pedagógicos (formando: leitura + impressão) |
| `/formandos` | gestor | Lista de formandos |
| `/formandos/novo` | gestor | Registar formando |
| `/formandos/[id]` | gestor | Detalhes e inscrições do formando |
| `/formandos/[id]/editar` | gestor | Editar formando |
| `/formadores` | gestor | Lista de formadores |
| `/formadores/novo` | gestor | Registar formador |
| `/formadores/[id]` | gestor | Detalhes do formador |
| `/formadores/[id]/editar` | gestor | Editar formador |
| `/auditoria` | gestor | Logs de auditoria |

### 4.3 Administração — `admin/`

Acessível por: `admin` apenas

| Rota | Descrição |
|------|-----------|
| `/admin` | Dashboard administrativo |
| `/admin/reguladores` | Lista de reguladores |
| `/admin/reguladores/novo` | Criar regulador |
| `/admin/reguladores/[id]` | Detalhes do regulador |
| `/admin/reguladores/[id]/editar` | Editar regulador |
| `/admin/administradores` | Gestão de administradores (owner only) |

### 4.4 Regulador — `regulador/`

Acessível por: `regulador` apenas

| Rota | Descrição |
|------|-----------|
| `/regulador` | Dashboard do regulador |
| `/regulador/centros` | Lista de centros de formação |
| `/regulador/centros/[id]` | Detalhes de um centro |
| `/regulador/formadores` | Lista de formadores |
| `/regulador/formadores/[id]` | Detalhes de um formador |
| `/regulador/cursos` | Lista de cursos (leitura) |

---

## 5. Sistema de Papéis e Permissões

### 5.1 Tabela de Papéis

| Papel | Área de Acesso | Criado por | Descrição |
|-------|---------------|-----------|-----------|
| `admin` | `/admin` | Sistema / owner admin | Administrador da plataforma |
| `gestor` | `(dashboard)` | Registo de centro | Responsável do centro de formação |
| `formador` | `(dashboard)` | Gestor (via formadores) | Formador/professor |
| `regulador` | `/regulador` | Admin | Entidade reguladora |
| `formando` | `(dashboard)` | Gestor | Aluno/formando |

### 5.2 Permissões Detalhadas

```
┌────────────────────────┬─────────┬────────┬──────────┬───────────┬──────────┐
│ Funcionalidade         │ admin   │ gestor │ formador │ regulador │ formando │
├────────────────────────┼─────────┼────────┼──────────┼───────────┼──────────┤
│ Ver Dashboard          │    ✗    │   ✓    │    ✓     │     ✗     │    ✓*    │
│ Gerir Cursos           │    ✗    │   ✓    │    ✓     │     ✗     │    ✗     │
│ Ver Cursos             │    ✗    │   ✓    │    ✓     │     ✓     │    ✓**   │
│ Gerir Programas        │    ✗    │   ✓    │    ✓     │     ✗     │    ✗     │
│ Gerir Sessões          │    ✗    │   ✓    │    ✓     │     ✗     │    ✗     │
│ Ver Sessões            │    ✗    │   ✓    │    ✓     │     ✗     │    ✓**   │
│ Gerir Planos           │    ✗    │   ✓    │    ✓     │     ✗     │    ✗     │
│ Ver Planos + Imprimir  │    ✗    │   ✓    │    ✓     │     ✗     │    ✓**   │
│ Gerir Formadores       │    ✗    │   ✓    │    ✗     │     ✗     │    ✗     │
│ Gerir Formandos        │    ✗    │   ✓    │    ✗     │     ✗     │    ✗     │
│ Ver Auditoria          │    ✗    │   ✓    │    ✗     │     ✗     │    ✗     │
│ Gerir Reguladores      │    ✓    │   ✗    │    ✗     │     ✗     │    ✗     │
│ Gerir Administradores  │  owner  │   ✗    │    ✗     │     ✗     │    ✗     │
│ Auditar Centros        │    ✗    │   ✗    │    ✗     │     ✓     │    ✗     │
└────────────────────────┴─────────┴────────┴──────────┴───────────┴──────────┘

* Dashboard adaptado (apenas cursos inscritos e próximas sessões)
** Apenas conteúdo dos cursos em que está inscrito
```

### 5.3 Navegação Lateral (Sidebar) por Papel

**Gestor:** Dashboard, Cursos, Programas, Sessões, Planos de Sessão, Formandos, Formadores, Auditoria

**Formador:** Dashboard, Cursos, Programas, Sessões, Planos de Sessão

**Formando:** Dashboard, Cursos, Sessões, Planos de Sessão

**Admin:** Administração, Reguladores, Administradores

**Regulador:** Dashboard, Centros de Formação, Formadores, Cursos

### 5.4 Redirecionamentos Automáticos

```
Utilizador não autenticado   → /login
admin autenticado            → /admin      (não pode aceder /)
regulador autenticado        → /regulador  (não pode aceder /)
gestor/formador/formando     → /           (dashboard)
```

---

## 6. Fluxo de Autenticação

### 6.1 Login (Multi-step)

```
1. Utilizador insere email
2. Sistema verifica: checkEmailStatus(email)
   ├── hasAccount (user doc existe)?
   │   ├── com uid → pedir senha → signInWithEmailAndPassword()
   │   └── sem uid → pedir senha → createUserWithEmailAndPassword() + ligar ao doc
   ├── hasTrainer (formador sem conta)?
   │   └── pedir senha → criar UserAccount + Firebase Auth + ligar ao trainer
   └── nenhum → erro "Não tem conta registada"
3. Após login → atualizar ultimoAcesso
4. AuthContext carrega user + center
5. Redirect baseado no papel
```

### 6.2 Registo de Centro de Formação

```
1. Passo 1: Dados do centro (nome, NIF, email, telefone, morada)
2. Passo 2: Dados do responsável (nome, email, senha, telefone)
3. Sistema:
   a. Criar Firebase Auth para responsável
   b. Criar documento TrainingCenter no Firestore
   c. Criar UserAccount com role='admin' + centroFormacaoId
   d. Auto-criar Trainer a partir dos dados do responsável
4. Redirect → /login
```

### 6.3 Pré-registo (Formandos e Reguladores)

```
1. Gestor/Admin cria utilizador SEM senha (sem uid no Firestore)
2. No primeiro login, o utilizador define a senha
3. Sistema cria Firebase Auth e liga ao documento existente
```

### 6.4 Recuperação de Senha

```
1. Utilizador insere email → sendPasswordResetEmail()
2. Firebase envia email com link de recuperação
```

---

## 7. Modelos de Dados (Firestore)

### 7.1 Coleções e Interfaces

```typescript
// ==========================================
// users (UserAccount)
// ==========================================
interface UserAccount {
  id: string;
  uid?: string;           // Firebase Auth UID (ausente = pré-registo)
  nome: string;
  email: string;
  role: 'admin' | 'gestor' | 'formador' | 'regulador' | 'formando';
  centroFormacaoId: string;  // '' para admin/regulador
  ativo: boolean;
  avatarUrl?: string;
  dataNascimento?: string;
  adminRole?: 'owner' | 'manager';  // Apenas role='admin'
  reguladorId?: string;              // Apenas role='regulador'
  dataCriacao: string;
  ultimoAcesso?: string;
}

// ==========================================
// trainingCenters (TrainingCenter)
// ==========================================
interface TrainingCenter {
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
// courses (Course)
// ==========================================
interface Course {
  id: string;
  codigo: string;
  nome: string;
  descricao: string;
  objetivosGerais: string[];
  publicoAlvo: string;
  prerequisitos: string[];
  duracaoTotal: number;        // Calculado a partir dos módulos
  modulos: CourseModule[];
  metodologia: string;
  avaliacao: string;
  certificacao: string;
  centroFormacaoId: string;
  status: Status;
  dataCriacao: string;
  dataAtualizacao: string;
  criadoPor: string;
}

interface CourseModule {
  id: string;
  nome: string;
  descricao: string;
  duracaoHoras: number;
  objetivos: string[];
  conteudos: string[];
  ordem: number;
}

// ==========================================
// programs (Program)
// ==========================================
interface Program {
  id: string;
  codigo: string;
  nome: string;
  descricao: string;
  objetivos: string[];
  cursos: ProgramCourse[];     // Cursos que compõem o programa
  duracaoTotal: number;
  certificacao: string;
  centroFormacaoId: string;
  status: Status;
  dataCriacao: string;
  dataAtualizacao: string;
  criadoPor: string;
}

interface ProgramCourse {
  cursoId: string;
  ordem: number;
  obrigatorio: boolean;
}

// ==========================================
// sessions (Session)
// ==========================================
interface Session {
  id: string;
  cursoId: string;
  moduloId: string;
  nome: string;
  descricao: string;
  tipo: 'presencial' | 'online' | 'hibrido';
  dataInicio: string;
  dataFim: string;
  horaInicio: string;
  horaFim: string;
  local: string;
  capacidadeMaxima: number;
  formadorId?: string;
  formador: string;            // Nome do formador
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
// sessionPlans (SessionPlan)
// ==========================================
interface SessionPlan {
  id: string;
  sessaoId: string;
  introducao: string;
  desenvolvimento: string;
  conclusao: string;
  materiaisNecessarios: string[];
  tempoEstimado: number;
  metodologias: string[];
  avaliacaoFormativa: string;
  adaptacoes: string;
  observacoes: string;
  dataCriacao: string;
  dataAtualizacao: string;
  criadoPor: string;
}

// ==========================================
// demonstrationPlans (DemonstrationPlan)
// ==========================================
interface DemonstrationPlan {
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
// worksheets (Worksheet)
// ==========================================
interface Worksheet {
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
// trainers (Trainer)
// ==========================================
interface Trainer {
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
  certificacaoPedagogica: string;   // Certificação Pedagógica
  numeroCertificacao: string;
  validadeCertificacao: string;
  areasCompetencia: string[];
  experienciaAnos: number;
  centroFormacaoId: string;
  userId?: string;                   // Ligação ao UserAccount
  verificacaoCertificado?: 'pendente' | 'verificado' | 'rejeitado' | 'expirado';
  status: Status;
  dataCriacao: string;
  dataAtualizacao: string;
}

// ==========================================
// enrollments (Enrollment)
// ==========================================
interface Enrollment {
  id: string;
  formandoId: string;              // ID do UserAccount (formando)
  cursoId: string;
  centroFormacaoId: string;
  status: 'ativo' | 'concluido' | 'cancelado';
  dataInscricao: string;
  dataCriacao: string;
  dataAtualizacao: string;
}

// ==========================================
// regulators (Regulator)
// ==========================================
interface Regulator {
  id: string;
  nome: string;
  tipo: 'nacional' | 'regional' | 'internacional' | 'outro';
  pais: string;
  descricao?: string;
  website?: string;
  email?: string;
  telefone?: string;
  morada?: string;
  centroFormacaoId: string;
  status: Status;
  dataCriacao: string;
  dataAtualizacao: string;
}

// ==========================================
// auditLogs (AuditLog)
// ==========================================
interface AuditLog {
  id: string;
  entidadeTipo: 'curso' | 'programa' | 'sessao' | 'plano' | 'demonstracao' |
                'ficha' | 'centro' | 'formador' | 'utilizador' | 'regulador' |
                'administrador' | 'formando' | 'inscricao';
  entidadeId: string;
  entidadeNome: string;
  acao: 'criar' | 'editar' | 'eliminar' | 'arquivar' | 'ativar';
  detalhes: string;
  alteracoesAntes: Record<string, unknown> | null;
  alteracoesDepois: Record<string, unknown> | null;
  utilizador: string;
  centroFormacaoId: string;
  dataHora: string;
}
```

### 7.2 Diagrama de Relações

```
TrainingCenter (1) ──── (N) UserAccount
                    ──── (N) Course
                    ──── (N) Program
                    ──── (N) Session
                    ──── (N) Trainer
                    ──── (N) Regulator
                    ──── (N) AuditLog
                    ──── (N) Enrollment

Course (1) ──── (N) Session
           ──── (N) Enrollment
           ──── (N) ProgramCourse → Program

Session (1) ──── (1) SessionPlan
            ──── (1) DemonstrationPlan
            ──── (N) Worksheet

UserAccount (formando) ──── (N) Enrollment ──── (1) Course

Trainer ──── (0..1) UserAccount (via userId)
```

---

## 8. Contextos (State Management)

### 8.1 AuthContext

**Ficheiro:** `app/context/AuthContext.tsx`

```typescript
interface AuthContextType {
  firebaseUser: FirebaseUser | null;    // Firebase Auth user
  user: UserAccount | null;             // Firestore user doc
  center: TrainingCenter | null;        // Centro de formação associado
  isLoading: boolean;
  isAuthenticated: boolean;

  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  register(data: RegisterFormData): Promise<void>;
  resetPassword(email: string): Promise<void>;
  refreshUser(): Promise<void>;
  refreshCenter(): Promise<void>;
}
```

**Ciclo de vida:**
1. `onAuthStateChanged` do Firebase → deteta mudanças de auth
2. Se autenticado → busca `UserAccount` via `getUserByUid(uid)`
3. Se user tem `centroFormacaoId` → busca `TrainingCenter`
4. Atualiza state

### 8.2 AppContext

**Ficheiro:** `app/context/AppContext.tsx`

```typescript
interface AppState {
  cursos: Course[];
  programas: Program[];
  sessoes: Session[];
  planosSessao: SessionPlan[];
  planosDemonstracao: DemonstrationPlan[];
  fichasTrabalho: Worksheet[];
  auditLogs: AuditLog[];
  inscricoes: Enrollment[];
  formandos: UserAccount[];
  utilizadorAtual: string;
  isLoading: boolean;
  isInitialized: boolean;
}
```

**Ações do Reducer:**
- `SET_LOADING`, `SET_INITIALIZED`, `LOAD_DATA`
- `ADD/UPDATE/DELETE_CURSO`
- `ADD/UPDATE/DELETE_PROGRAMA`
- `ADD/UPDATE/DELETE_SESSAO`
- `ADD/UPDATE/DELETE_PLANO_SESSAO`
- `ADD/UPDATE/DELETE_PLANO_DEMONSTRACAO`
- `ADD/UPDATE/DELETE_FICHA_TRABALHO`
- `ADD_AUDIT_LOG`
- `ADD/UPDATE_FORMANDO`
- `ADD/DELETE/UPDATE_INSCRICAO`

**Métodos CRUD expostos:**
Cada entidade tem: `adicionar*()`, `atualizar*()`, `eliminar*()`, `get*()`

Cada operação CRUD:
1. Gera ID com `uuid`
2. Chama `firebaseService` para persistir
3. Faz dispatch no reducer para atualizar o state local
4. Cria log de auditoria automático

### 8.3 ToastContext

**Ficheiro:** `app/context/ToastContext.tsx`

```typescript
interface ToastContextType {
  addToast(toast: Omit<Toast, 'id'>): void;
  removeToast(id: string): void;
  success(title: string, message?: string): void;
  error(title: string, message?: string): void;
  info(title: string, message?: string): void;
  warning(title: string, message?: string): void;
}
```

Renderiza toasts no canto superior direito com animação. Portal renderizado em `#toast-container`.

---

## 9. Serviços (Camada de Dados)

### 9.1 firebase.ts — Inicialização

```typescript
// Inicializa Firebase App, Auth e Firestore
getFirebaseApp(): FirebaseApp | null
getFirebaseAuth(): Auth | null
getFirebaseDb(): Firestore | null
getFirebaseError(): string | null
```

### 9.2 authService.ts — Autenticação e Utilizadores

```typescript
// Autenticação
checkEmailStatus(email): Promise<EmailStatus>
signIn(email, password): Promise<FirebaseUser>
signOut(): Promise<void>
resetPassword(email): Promise<void>
onAuthChange(callback): () => void
registerTrainingCenter(data): Promise<{ center, user }>

// Utilizadores
getUserByUid(uid): Promise<UserAccount | null>
getUserById(id): Promise<UserAccount | null>
getUserByEmail(email): Promise<UserAccount | null>
getUsersByCenterId(centroFormacaoId): Promise<UserAccount[]>
createUser(email, password, nome, role, centroFormacaoId): Promise<UserAccount>
createFormandoUser(email, nome, centroFormacaoId, dataNascimento?): Promise<UserAccount>
createReguladorUser(email, nome, reguladorId): Promise<UserAccount>
createAdminUser(email, nome, adminRole): Promise<UserAccount>
updateUser(id, data): Promise<void>
deleteUser(id): Promise<void>
getAllAdminUsers(): Promise<UserAccount[]>

// Centros
getTrainingCenter(id): Promise<TrainingCenter | null>
updateTrainingCenter(id, data): Promise<void>
getAllTrainingCenters(): Promise<TrainingCenter[]>

// Verificações
checkEmailExists(email): Promise<boolean>
checkNifExists(nif): Promise<boolean>
```

### 9.3 firebaseService.ts — CRUD Principal

```typescript
// Cursos
getCourses / getCourse / createCourse / updateCourse / deleteCourse

// Programas
getPrograms / getProgram / createProgram / updateProgram / deleteProgram

// Sessões
getSessions / getSession / createSession / updateSession / deleteSession

// Planos de Sessão
getSessionPlans / getSessionPlan / getSessionPlanBySessionId
createSessionPlan / updateSessionPlan / deleteSessionPlan

// Planos de Demonstração
getDemonstrationPlans / getDemonstrationPlan / getDemonstrationPlanBySessionId
createDemonstrationPlan / updateDemonstrationPlan / deleteDemonstrationPlan

// Fichas de Trabalho
getWorksheets / getWorksheet / getWorksheetsBySessionId
createWorksheet / updateWorksheet / deleteWorksheet

// Audit Logs
getAuditLogs(filters?) / createAuditLog

// Inscrições / Formandos
getEnrollments / getFormandos

// Carregar tudo
loadAllData(): Promise<{ cursos, programas, sessoes, ... }>
```

### 9.4 trainersService.ts — Formadores

```typescript
getAllTrainers / getTrainers(centroId) / getTrainer(id)
createTrainer(centroId, data) / updateTrainer(id, data) / deleteTrainer(id)
archiveTrainer(id) / activateTrainer(id) / updateTrainerStatus(id, status)
verificarCertificado(id, data)
getActiveTrainers(centroId)
checkTrainerEmailExists(centroId, email) / checkTrainerNifExists(centroId, nif)
getTrainerByEmail(email)
```

### 9.5 formandosService.ts — Formandos

```typescript
getFormandos(centroId) / getFormando(id)
updateFormando(id, { nome?, dataNascimento? })
archiveFormando(id) / activateFormando(id)
checkFormandoEmailExists(centroId, email)
```

### 9.6 enrollmentService.ts — Inscrições

```typescript
getEnrollments(centroId) / getEnrollmentsByFormando(formandoId) / getEnrollmentsByCourse(cursoId)
createEnrollment(formandoId, cursoId, centroId)
updateEnrollmentStatus(id, status) / removeEnrollment(id)
checkEnrollmentExists(formandoId, cursoId)
```

### 9.7 regulatorsService.ts — Reguladores

```typescript
getRegulators(centroId) / getAllRegulators / getRegulator(id)
createRegulator(centroId, data) / updateRegulator(id, data) / deleteRegulator(id)
archiveRegulator(id) / activateRegulator(id)
```

### 9.8 reguladorNotasService.ts — Notas do Regulador

```typescript
getNotasByCentro(centroId) / getNotasByReferencia(refId)
createNota(data) / updateNota(id, conteudo) / deleteNota(id)
```

---

## 10. Componentes UI

### 10.1 Exportações de `app/components/ui/`

| Componente | Descrição | Variantes/Props |
|-----------|-----------|----------------|
| `Button` | Botão com suporte a ícones e loading | `variant`: primary, secondary, outline, ghost, danger; `size`: sm, md, lg; `leftIcon`, `isLoading` |
| `Input` | Campo de texto | `label`, `error`, `type`, `disabled` |
| `TextArea` | Campo multi-linha | `label`, `rows` |
| `Select` | Dropdown | `label`, `options: {value, label}[]`, `placeholder` |
| `Card` | Contentor visual | `variant`: bordered, elevated; `padding`: none, default |
| `CardHeader` | Cabeçalho do card | - |
| `CardTitle` | Título do card | - |
| `CardContent` | Conteúdo do card | - |
| `Badge` | Etiqueta de estado | `variant`: success, warning, danger, info, default |
| `Modal` | Diálogo modal | `isOpen`, `onClose`, `title`, `size`: sm, md, lg |
| `ModalFooter` | Rodapé do modal | - |
| `EmptyState` | Estado vazio | `icon`, `title`, `description`, `actionLabel`, `onAction` |
| `LoadingSpinner` | Spinner animado | `size` |
| `FullPageLoader` | Loader de página inteira | `message` |

### 10.2 Utilitários de Badge

```typescript
getStatusBadgeVariant(status: Status): string    // Mapeia status → variant
getStatusLabel(status: Status): string           // Mapeia status → texto PT
```

---

## 11. Componentes de Layout

| Componente | Ficheiro | Descrição |
|-----------|---------|-----------|
| `Sidebar` | `layout/Sidebar.tsx` | Menu lateral colapsável para dashboard |
| `AdminSidebar` | `layout/AdminSidebar.tsx` | Menu lateral para admin |
| `ReguladorSidebar` | `layout/ReguladorSidebar.tsx` | Menu lateral para regulador |
| `Header` | `layout/Header.tsx` | Cabeçalho com dropdown do utilizador (editar conta, logout) |
| `MainLayout` | `layout/MainLayout.tsx` | Wrapper do dashboard (auth guard + sidebar) |
| `AdminLayout` | `layout/AdminLayout.tsx` | Wrapper do admin (admin guard) |
| `ReguladorLayout` | `layout/ReguladorLayout.tsx` | Wrapper do regulador (regulador guard) |

### 11.1 Sidebar — Menu por Papel

```typescript
// Estrutura de menu com controlo por roles
interface MenuItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: UserRole[];  // Se undefined → visível para todos
}

const menuItems: MenuItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/cursos', label: 'Cursos', icon: BookOpen },
  { href: '/programas', label: 'Programas', icon: Layers, roles: ['gestor', 'formador'] },
  { href: '/sessoes', label: 'Sessões', icon: Calendar },
  { href: '/planos', label: 'Planos de Sessão', icon: ClipboardList },
  { href: '/formandos', label: 'Formandos', icon: GraduationCap, roles: ['gestor'] },
  { href: '/formadores', label: 'Formadores', icon: Users, roles: ['gestor'] },
  { href: '/auditoria', label: 'Auditoria', icon: History, roles: ['gestor'] },
];
```

---

## 12. Fluxo de Dados

### 12.1 Inicialização da Aplicação

```
1. Root Layout monta ClientProviders
   └── ToastProvider
       └── AuthProvider (escuta onAuthStateChanged)
           └── AppProvider (chama loadAllData() do Firestore)

2. AuthProvider:
   - Firebase Auth emite evento → callback
   - Se autenticado: getUserByUid(uid) → user
   - Se user.centroFormacaoId: getTrainingCenter(id) → center
   - Atualiza isAuthenticated, user, center

3. AppProvider:
   - useEffect → firebaseService.loadAllData()
   - Promise.all([getCourses, getPrograms, getSessions, ...])
   - dispatch({ type: 'LOAD_DATA', payload: data })
   - isInitialized = true
```

### 12.2 Operação CRUD (exemplo: criar curso)

```
1. Utilizador preenche formulário (react-hook-form + zod)
2. Submissão → adicionarCurso(data) no AppContext
3. AppContext:
   a. Gera dados completos (timestamps, uuid para módulos, etc.)
   b. await firebaseService.createCourse(cursoData) → retorna ID
   c. dispatch({ type: 'ADD_CURSO', payload: curso })
   d. await addAuditLog('curso', id, nome, 'criar', detalhes, null, curso)
4. Reducer atualiza state → re-render dos componentes
```

### 12.3 Filtragem de Dados para Formandos

```
1. Formando faz login → AuthContext carrega user com role='formando'
2. AppContext carrega TODOS os dados (incluindo inscricoes[])
3. Nas páginas, filtra-se pelo user:
   a. cursosFormando = inscricoes.filter(i => i.formandoId === user.id && i.status === 'ativo')
   b. sessoesFormando = sessoes.filter(s => cursosFormando.includes(s.cursoId))
4. UI esconde botões de criar/editar/eliminar se isFormando
```

### 12.4 Nota sobre Tempo Real

Atualmente **não há listeners em tempo real** (não usa `onSnapshot`). Os dados são carregados uma vez na inicialização. Para ver alterações feitas por outros utilizadores, é necessário recarregar a página ou chamar `refreshData()`.

---

## 13. Validação de Formulários

### 13.1 Stack de Validação

```
react-hook-form (gestão de estado do formulário)
       ↓
@hookform/resolvers (ponte entre react-hook-form e zod)
       ↓
zod (esquemas de validação)
```

### 13.2 Exemplo de Schema

```typescript
// Edição de perfil (Header.tsx)
const profileSchema = z.object({
  nome: z.string().min(1, 'O nome é obrigatório'),
  dataNascimento: z.string().optional(),
});
```

### 13.3 Form Data Types (definidos em types/index.ts)

```typescript
CourseFormData      // Criação/edição de cursos
ProgramFormData     // Criação/edição de programas
SessionFormData     // Criação/edição de sessões
TrainerFormData     // Criação/edição de formadores
DemonstrationPlanFormData  // Planos de demonstração
WorksheetFormData   // Fichas de trabalho
RegisterFormData    // Registo de centro de formação
```

---

## 14. Sistema de Auditoria

### 14.1 Entidades Auditadas

Todas as operações CRUD são automaticamente registadas via `addAuditLog()` no AppContext:

- Cursos (criar, editar, eliminar)
- Programas (criar, editar, eliminar)
- Sessões (criar, editar, eliminar)
- Planos de Sessão (criar, editar, eliminar)
- Planos de Demonstração (criar, editar, eliminar)
- Fichas de Trabalho (criar, editar, eliminar)

### 14.2 Dados Registados

```typescript
{
  entidadeTipo: 'curso',
  entidadeId: 'abc123',
  entidadeNome: 'Curso de TypeScript',
  acao: 'criar',
  detalhes: 'Curso "Curso de TypeScript" criado',
  alteracoesAntes: null,           // null para criação
  alteracoesDepois: { ... },       // Dados completos
  utilizador: 'João Silva',
  centroFormacaoId: '',
  dataHora: '2026-03-14T10:30:00.000Z'
}
```

### 14.3 Visualização

Acessível em `/auditoria` (gestor only). Mostra lista cronológica com filtros por tipo de entidade.

---

## 15. Sistema de Impressão

### 15.1 Componentes de Impressão

| Componente | Descrição |
|-----------|-----------|
| `PrintStyles` | CSS global para impressão (`@media print`) |
| `SessionPlanPrint` | Vista imprimível do plano de sessão |
| `DemonstrationPlanPrint` | Vista imprimível do plano de demonstração |
| `WorksheetPrint` | Vista imprimível da ficha de trabalho |

### 15.2 Funcionamento

```
1. Página marca conteúdo com classes .no-print e .print-only
2. PrintStyles define @media print { .no-print { display: none } }
3. Botão "Imprimir" chama window.print()
4. Browser renderiza apenas o conteúdo .print-only
```

---

## 16. Variáveis de Ambiente

**Ficheiro:** `.env.local`

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=form-pro-44888.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=form-pro-44888
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=form-pro-44888.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

Todas prefixadas com `NEXT_PUBLIC_` para acesso no client-side.

---

## 17. Configuração do Biome

**Ficheiro:** `biome.json`

```json
{
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedImports": "error",
        "noUnusedVariables": "error"
      },
      "style": { "noNonNullAssertion": "off" },
      "suspicious": { "noExplicitAny": "error" },
      "a11y": { "noSvgWithoutTitle": "error" }
    }
  },
  "formatter": {
    "indentWidth": 2,
    "lineWidth": 80,
    "semicolons": "always"
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingCommas": "es5"
    }
  }
}
```

---

## 18. Comandos de Desenvolvimento

```bash
pnpm dev          # Servidor de desenvolvimento (Turbopack)
pnpm build        # Build de produção
pnpm start        # Iniciar servidor de produção
pnpm lint         # Executar linter (biome check .)
```

---

## 19. Diagramas de Fluxo

### 19.1 Fluxo de Login

```
┌─────────┐     ┌──────────────┐     ┌─────────────────┐
│  /login │────▶│ Inserir email│────▶│checkEmailStatus()│
└─────────┘     └──────────────┘     └────────┬────────┘
                                               │
                    ┌──────────────────────────┼──────────────────────┐
                    │                          │                      │
              hasAccount=true           hasTrainer=true          nenhum
              com uid?                                                │
              ┌───┴───┐                                        ┌─────▼─────┐
              │       │                                        │   Erro:   │
            sim     não                                        │ sem conta │
              │       │                                        └───────────┘
      ┌───────▼──┐ ┌──▼──────────┐    ┌────────────────┐
      │signIn()  │ │criar auth + │    │criar user +    │
      │c/ pass   │ │ligar ao doc │    │auth + ligar    │
      └───┬──────┘ └──────┬──────┘    │ao trainer      │
          │               │           └───────┬────────┘
          └───────┬───────┘                   │
                  │                           │
           ┌──────▼───────┐                   │
           │ AuthContext   │◀──────────────────┘
           │ carrega user  │
           │ + center      │
           └──────┬───────┘
                  │
     ┌────────────┼────────────┬──────────────┐
     │            │            │              │
  admin       gestor      regulador      formando
     │            │            │              │
  /admin        /           /regulador       /
```

### 19.2 Fluxo de Inscrição de Formando

```
┌────────────────┐
│ Gestor acede   │
│ /formandos/novo│
└───────┬────────┘
        │
┌───────▼────────┐
│ Preenche:      │
│ - Nome         │
│ - Email        │
│ - Data Nasc.   │
│ - Curso        │
└───────┬────────┘
        │
┌───────▼──────────────┐     ┌──────────────────┐
│checkEmailExists()    │─sim─▶│ Erro: email já   │
│email já existe?      │     │ registado         │
└───────┬──────────────┘     └──────────────────┘
        │não
┌───────▼──────────────┐
│createFormandoUser()  │  Cria UserAccount sem uid
│role='formando'       │  (pré-registo)
└───────┬──────────────┘
        │
┌───────▼──────────────┐
│curso selecionado?    │
└───┬──────────────┬───┘
   sim             não
    │               │
┌───▼──────────┐    │
│createEnroll- │    │
│ment()        │    │
└───┬──────────┘    │
    └───────┬───────┘
            │
     ┌──────▼──────┐
     │  Sucesso!   │
     │ → /formandos│
     └─────────────┘
```

### 19.3 Fluxo de Dados na Aplicação

```
┌─────────────────────────────────────────────────┐
│                   Firebase                       │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐          │
│  │  Auth   │ │Firestore│ │ Storage  │          │
│  └────┬────┘ └────┬────┘ └──────────┘          │
└───────┼───────────┼─────────────────────────────┘
        │           │
   ┌────▼────┐ ┌────▼──────────┐
   │authSvc  │ │firebaseSvc    │
   │         │ │trainersSvc    │
   │         │ │formandosSvc   │
   │         │ │enrollmentSvc  │
   │         │ │regulatorsSvc  │
   └────┬────┘ └────┬──────────┘
        │           │
   ┌────▼────┐ ┌────▼──────┐
   │AuthCtx  │ │AppContext  │
   │user     │ │cursos      │
   │center   │ │sessoes     │
   │isAuth   │ │inscricoes  │
   └────┬────┘ │formandos   │
        │      │...         │
        │      └────┬───────┘
        │           │
   ┌────▼───────────▼──────┐
   │    Componentes React   │
   │  ┌────┐ ┌────┐ ┌────┐ │
   │  │Page│ │Sbar│ │Head│ │
   │  └────┘ └────┘ └────┘ │
   └────────────────────────┘
```

---

## 20. Problemas Conhecidos e Notas Técnicas

### 20.1 Inconsistência de Papéis no Registo

Ao registar um centro de formação, o responsável recebe `role: 'admin'` e `centroFormacaoId` do centro. No entanto, o `MainLayout` redireciona `role === 'admin'` para `/admin`. Isto significa que o responsável do centro é tratado como administrador da plataforma e não como gestor do centro.

**Impacto:** O responsável não acede ao dashboard. Usa o painel admin.

**Nota:** O papel `gestor` existe no sistema mas atualmente não é atribuído automaticamente durante o registo. Para usar um utilizador como gestor, é necessário criar manualmente um UserAccount com `role: 'gestor'`.

### 20.2 centroFormacaoId Vazio em Operações CRUD

As operações CRUD no AppContext definem `centroFormacaoId: ''` em todos os documentos criados (cursos, programas, sessões). Isto significa que os dados **não são isolados por centro de formação**. Na prática, todos os centros vêem todos os dados.

**Impacto:** Multi-tenancy não está completamente implementado a nível de dados.

### 20.3 Sem Listeners em Tempo Real

O sistema carrega todos os dados uma vez na inicialização via `loadAllData()`. Não existe `onSnapshot` para atualizações em tempo real. Alterações feitas por outros utilizadores só são visíveis após recarregar a página.

### 20.4 Sem Middleware de Rota

Não existe `middleware.ts` no Next.js para proteger rotas a nível de servidor. A proteção é feita exclusivamente no lado do cliente via `useEffect` nos layouts. Isto significa que um utilizador com acesso direto ao URL pode ver brevemente o conteúdo antes do redirect.

### 20.5 Carregamento Global de Dados

O `loadAllData()` carrega **todas** as coleções do Firestore de uma vez, independentemente do papel do utilizador. Um formando que só precisa de ver os seus cursos inscritos ainda carrega todos os cursos, programas, sessões, etc. da plataforma.

### 20.6 Inscrições — Validação de Conflitos

A validação de conflitos de horário na inscrição de formandos compara apenas `dataInicio` + `horaInicio/horaFim`. Não verifica conflitos em dias diferentes ou sessões que se estendem por múltiplos dias.

### 20.7 Lint Existente

O projeto tem ~334 erros de lint (Biome) pré-existentes, maioritariamente formatação e imports não utilizados. Não afetam o build.

---

*Documentação gerada em 2026-03-14. Versão do software: commit mais recente na branch `main`.*
