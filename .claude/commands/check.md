Run all code quality checks (lint, typecheck, build) in parallel and report a summary.

Steps:
1. Run these commands in parallel:
   - `pnpm lint` (Biome lint + format)
   - `pnpm build` (Next.js build, includes TypeScript type checking)
2. After both complete, print a summary table showing pass/fail status and error counts for each check.
3. If any check failed, list the specific errors concisely.
