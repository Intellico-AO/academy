---
name: add-feature
description: Add a new feature to FormaPro following project conventions
user_invocable: true
---

# Add Feature

Guide for adding a new feature to the FormaPro codebase following established patterns and conventions.

## Instructions

When the user describes a feature to add, follow these steps:

### Step 1: Classify the Feature

Determine which layers are affected:

| Layer | When to touch |
|-------|--------------|
| `app/components/ui/` | New reusable primitive (button variant, badge, input, etc.) |
| `app/components/layout/` | Page structure changes (sidebar, header) |
| `app/components/print/` | New printable document templates |
| `app/context/` | New context provider for shared state |
| `app/lib/` | New Firebase service or utility |
| `app/types/` | New data model or type definition |
| `app/(dashboard)/` | New dashboard page or CRUD feature |
| `app/(auth)/` | Authentication-related changes |

### Step 2: Create Files Following Conventions

**UI Component template:**
```typescript
// app/components/ui/FeatureName.tsx
'use client';

import { HTMLAttributes, forwardRef } from 'react';

interface FeatureNameProps extends HTMLAttributes<HTMLDivElement> {
  // Props here
}

export const FeatureName = forwardRef<HTMLDivElement, FeatureNameProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <div ref={ref} className={`${className}`} {...props} />
    );
  }
);

FeatureName.displayName = 'FeatureName';
```

**Dashboard page template:**
```typescript
// app/(dashboard)/feature-name/page.tsx
'use client';

import { useApp } from '@/app/context/AppContext';

export default function FeatureNamePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Feature Name</h1>
      {/* Content */}
    </div>
  );
}
```

**Firebase service template:**
```typescript
// app/lib/featureService.ts
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION = 'collectionName';

export async function getItems(centroFormacaoId: string) {
  const q = query(
    collection(db, COLLECTION),
    where('centroFormacaoId', '==', centroFormacaoId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
```

**Context provider template:**
```typescript
// app/context/FeatureContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FeatureContextType {
  // State and actions
}

const FeatureContext = createContext<FeatureContextType | undefined>(undefined);

export function FeatureProvider({ children }: { children: ReactNode }) {
  // Implementation
  return (
    <FeatureContext.Provider value={{}}>
      {children}
    </FeatureContext.Provider>
  );
}

export function useFeature() {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error('useFeature must be used within a FeatureProvider');
  }
  return context;
}
```

### Step 3: Follow These Rules

**Styling:**
- Use Tailwind CSS v4 utility classes on native HTML elements
- Use Tailwind color classes: emerald (primary), slate (neutral), rose (danger)
- Use responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`
- Use `hover:` prefix for interaction states
- Use `focus:ring-2 focus:ring-emerald-500` for focus states

**State:**
- Use React Context for shared state (follow AuthContext/AppContext patterns)
- Use `useState` for local component state
- Use `useEffect` for side effects and data loading

**Data:**
- All Firebase operations go through service files in `app/lib/`
- Use Zod for form/input validation
- Use the types from `app/types/index.ts` for data models
- Generate IDs with `uuid`
- Format dates with `date-fns` and Portuguese locale

**Error handling:**
- Wrap async operations in try/catch
- Show user-facing errors via toast notifications (ToastContext)
- Log errors to console for debugging

**Icons:**
- Use Lucide React for all icons
- Import individually: `import { IconName } from 'lucide-react'`

**Imports:**
- Use `@/` path alias for all imports
- Import types with `import type { ... }` or inline `import { type ... }`

**Language:**
- UI text in Portuguese
- Field names in Portuguese (e.g., `nome`, `email`, `dataCriacao`)
- Status values: `rascunho`, `ativo`, `arquivado`, `cancelado`

### Step 4: Verification Checklist

Before considering the feature complete:

- [ ] TypeScript compiles: `pnpm build`
- [ ] Biome passes: `pnpm lint`
- [ ] No `any` types
- [ ] Icon buttons have `aria-label`
- [ ] Loading states handled
- [ ] Error states handled with user-visible feedback
- [ ] Imports use `@/` alias
- [ ] UI text is in Portuguese
- [ ] Firebase operations go through service layer
- [ ] Types defined in or imported from `app/types/index.ts`
