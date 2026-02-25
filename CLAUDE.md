# CLAUDE.md - FormaPro Academy

## Commands
- `pnpm dev` - Start dev server (Turbopack)
- `pnpm build` - Production build
- `pnpm lint` - Run Biome linter (`biome check .`)

## Architecture
- Next.js 16 App Router with route groups: `(auth)`, `(dashboard)`, `admin/`
- Firebase client SDK for auth and Firestore
- Context-based state: AuthContext, AppContext, ToastContext
- Forms use react-hook-form + zod + @hookform/resolvers

## Conventions
- Language: Portuguese (PT) for UI text and code comments
- Commit messages: emoji prefix (`:sparkles: feat:`, `:bug: fix:`)
- Components in `app/components/ui/` (reusable) and `app/components/layout/` (structural)
- Types centralized in `app/types/index.ts`
- Services in `app/lib/` (authService, firebaseService, trainersService)

## Roles
- `admin` - Redirected to `/admin`, no access to dashboard
- `gestor` - Full dashboard access except admin pages
- `formador` - Limited dashboard access
