# Project Memory - FormaPro

## Identity

- **Package**: `course-planning` v0.1.0
- **Purpose**: Course planning and training management platform (Portuguese)
- **Framework**: Next.js 16 App Router + TypeScript 5 strict mode
- **Name**: FormaPro — Planeamento de Cursos e Formação

## Architecture Decisions

- **App Router** (not Pages Router) — `app/` directory with `layout.tsx`, `page.tsx`
- **Tailwind CSS v4** for styling — utility classes on native HTML elements
- **React Context** for state — AuthContext, AppContext, ToastContext
- **Firebase** for backend — Auth (email/password) + Firestore (NoSQL database)
- **Zod** for validation — schema validation on forms and data
- **Biome 2.3** for linting/formatting (not ESLint/Prettier)
- **pnpm** as package manager (pinned to 9.15.4)
- **DM Sans** as the primary font

## Key Patterns to Follow

- **Component layers**: `layout/` > `ui/` > `print/`
- **File naming**: PascalCase single files (`Button.tsx`, `Card.tsx`) in `app/components/ui/`
- **Imports**: Use `@/` path alias (e.g., `@/app/components/ui/Button`)
- **Types**: Centralized in `app/types/index.ts` — all data models defined there
- **Colors**: Tailwind color classes (emerald for primary, slate for neutral, rose for danger)
- **Services**: Firebase operations abstracted in `app/lib/` (authService, firebaseService, trainersService)
- **Context providers**: Defined in `app/context/` — wrapped via `ClientProviders`
- **Icons**: Lucide React for all icons
- **Tables**: TanStack React Table v8 for data tables
- **Dates**: date-fns with Portuguese locale
- **IDs**: uuid for generating unique identifiers
- **Props**: Defined inline in component files (not separate types files)

## Data Models (Firestore Collections)

- `trainingCenters` — Training/education centers (organizations)
- `users` — User accounts with roles (admin, gestor, formador)
- `trainers` — Trainer/instructor profiles with certifications
- `courses` — Courses with modules and objectives
- `programs` — Training programs combining multiple courses
- `sessions` — Training sessions (presencial, online, hibrido)
- `sessionPlans` — Detailed session teaching plans
- `demonstrationPlans` — Step-by-step demonstration guides
- `worksheets` — Educational worksheets with exercises
- `auditLogs` — Audit trail for compliance

## Routes

- `/(auth)/login` — Login page
- `/(auth)/registar` — Registration page
- `/(auth)/recuperar-password` — Password recovery
- `/(dashboard)/` — Dashboard with statistics
- `/(dashboard)/cursos` — Course management (CRUD)
- `/(dashboard)/formadores` — Trainer management
- `/(dashboard)/programas` — Training programs
- `/(dashboard)/sessoes` — Training sessions
- `/(dashboard)/planos` — Plans (session, demonstration, worksheets)
- `/(dashboard)/auditoria` — Audit logs

## Common Workflows

```bash
pnpm dev          # Dev server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Biome check
```

## Language

- UI and data models are in Portuguese (PT)
- Field names use Portuguese (e.g., `nome`, `dataCriacao`, `formadores`)
- Status values: `rascunho`, `ativo`, `arquivado`, `cancelado`
- User roles: `admin`, `gestor`, `formador`
