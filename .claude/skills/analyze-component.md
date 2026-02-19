---
name: analyze-component
description: Analyze a component against FormaPro project patterns and quality standards
user_invocable: true
---

# Analyze Component

Analyze the specified component(s) against FormaPro project conventions and report findings.

## Instructions

1. **Read the component files**
2. **Check each item** in the checklist below
3. **Report findings** organized by category with file:line references

## Checklist

### Tailwind CSS Usage
- [ ] Uses Tailwind utility classes on native HTML elements
- [ ] Responsive values use breakpoint prefixes: `sm:p-4 md:p-8`
- [ ] Hover states use `hover:` prefix (e.g., `hover:bg-emerald-700`)
- [ ] Focus states use `focus:ring-2 focus:ring-emerald-500`
- [ ] Inline `style={{}}` only for truly dynamic values

### Color Consistency
- [ ] Uses Tailwind color classes (emerald for primary, slate for neutral, rose for danger)
- [ ] No hard-coded color hex values (check for `#` followed by 3-8 hex chars)
- [ ] Consistent color palette across related components

### Type Safety
- [ ] Props interface properly defined
- [ ] No `any` type usage
- [ ] No `@ts-ignore` or `@ts-expect-error`
- [ ] Uses types from `app/types/index.ts` for data models
- [ ] Proper discriminated unions for state (if applicable)

### Component Patterns
- [ ] Uses `'use client'` directive if needed (hooks, event handlers, browser APIs)
- [ ] Uses composition over prop drilling
- [ ] Loading states handled with visual feedback
- [ ] Error states handled with user-visible messages

### State Management
- [ ] Uses React Context for shared state (not prop drilling deeply)
- [ ] No unnecessary `useState` — prefer derived values
- [ ] Side effects in `useEffect` with proper cleanup
- [ ] Firebase operations go through service layer in `app/lib/`

### Error Handling
- [ ] Async operations have try/catch
- [ ] User-facing errors show toast notifications
- [ ] Loading states handled (`isLoading` checks)
- [ ] Error states handled (not silently swallowed)

### Accessibility
- [ ] Icon-only buttons have `aria-label`
- [ ] Interactive elements are focusable
- [ ] Form inputs have associated labels
- [ ] Color is not the only indicator of state

### Imports
- [ ] Uses `@/` path alias (not relative `../../`)
- [ ] No unused imports (Biome enforces this)
- [ ] Types imported with `import type`

### Language
- [ ] UI text is in Portuguese
- [ ] Field names match data model conventions (Portuguese)

## Output Format

```
## Analysis: {ComponentName}

### Summary
{1-2 sentence overall assessment}

### Issues Found
1. **[Category]** file:line — Description
2. ...

### Good Practices
- {patterns done well}

### Recommendations
- {actionable improvements}
```
