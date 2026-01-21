# AGENTS.md (Next.js 16)

This repository uses **Next.js 16** with the **App Router** and **TypeScript**.  
This document defines the rules and conventions that AI agents or contributors must follow when implementing changes.

---

## 1) Agent Goal

- Implement features or fixes using **small, safe changes**.
- Maintain visual and architectural consistency.
- Ensure code quality and adherence to best practices.

---

## 2) Tech Stack & Conventions

- Framework: **Next.js 16 (App Router)**
- Language: **TypeScript**
- Styling: **Tailwind CSS** (if applicable)
- UI Library: *(e.g., ShadCN or custom components, if applicable)*
- Forms: *(react-hook-form + zod, if applicable)*
- Data fetching: `fetch`, SWR, or React Query (depending on project setup)

**Golden Rule:**  
Prefer **Server Components** by default.  
Use "use client" only when necessary (event handlers, local state, hooks, etc.).

---

## 3) Expected Project Structure (App Router)

Typical structure:

- `app/`
  - `(group)/` (route groups if used)
  - `layout.tsx`
  - `page.tsx`
  - `loading.tsx`
  - `error.tsx`
  - `not-found.tsx`
  - `api/` (Route Handlers)
- `components/`
- `lib/` (helpers, fetchers, utilities)
- `services/` (SDKs / wrappers)
- `types/`
- `styles/`

**Rule:**  
Do not place complex business logic inside UI components.  
Move logic to `lib/` or `services/`.

---

## 4) Implementation Rules (Next.js 16)

### Server vs Client Components

- **Server Components**
  - Data fetching on the server.
  - Initial rendering and SEO.
  - Preferred for `page.tsx` and `layout.tsx`.

- **Client Components** (`"use client"`)
  - Interactive forms.
  - Modals, dropdowns, client-side state.
  - Hooks like `useState`, `useEffect`, `useRouter`, etc.

---

### Data Fetching

**On the Server:**

- Use `fetch()` with correct caching strategy:
  - `cache: "no-store"` for highly dynamic data.
  - `next: { revalidate: N }` for ISR.

**On the Client:**

- Follow the existing project pattern (SWR / React Query / direct fetch).
- **Do not duplicate fetchers** – centralize in:
  - `lib/fetcher.ts` or
  - `services/*`

---

### Route Handlers (API)

- Prefer `app/api/.../route.ts`
- Validate inputs (zod recommended)
- Standard response format:

```ts
return Response.json({ ... }, { status: 200 });
```

- Error handling:
  - Never expose stack traces to the client in production.
  - Standardize errors as:

```json
{
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {}
}
```

---

## 5) Code Standards

- Strict TypeScript – avoid `any`.
- Do not add new dependencies unless necessary.
- Keep imports organized.
- Use `const` by default.
- Avoid complex logic inside JSX.

### Components

- Explicitly typed props.
- Clear naming: `UserTable`, `LeadForm`, `SeoTabs`, etc.
- Avoid large components:
  - If > ~300 lines → split into smaller parts.

### Styling (if Tailwind is used)

- Prefer utility classes and existing patterns.
- Do not hardcode colors/sizes if design tokens exist.
- Reuse UI components whenever possible.

---

## 6) Forms (if applicable)

- Use `react-hook-form` + `zod` if already in the project.
- Keep schemas in:

```
lib/validation/*
```

- Validate both **frontend and backend** whenever possible.

---

## 7) Authentication & Security (if applicable)

- Never expose secrets to the client.
- Secure cookies:
  - `httpOnly`
  - `secure`
  - `sameSite`
- Never log tokens.
- Respect existing `middleware.ts` route protection.

---

## 8) Testing & Quality

Before submitting changes, always run:

1. `npm run lint`
2. `npm run typecheck` (if available)
3. `npm test` (if available)

Manually test:

- SSR and CSR behavior
- Loading / empty / error states
- Basic responsiveness

**Do not deliver code** with TypeScript or ESLint errors unless explicitly justified.

---

## 9) Performance Guidelines

- Avoid unnecessary re-renders in Client Components.
- Lazy-load heavy libraries when possible.
- Use `next/image` for images.
- Avoid passing inline objects/functions to memoized components.

---

## 10) Git & Pull Request Standards

### Commits

Use clear messages:

- `feat: add user profile page`
- `fix: resolve login redirect bug`
- `refactor: extract form validation`
- `chore: update dependencies`

---

### Pull Request Requirements

Each PR must include:

- What changed and why
- Screenshots if UI was modified
- Steps to test
- Risks or tradeoffs

Checklist:

- [ ] Lint passes
- [ ] Typecheck passes
- [ ] Tests pass (if applicable)
- [ ] Manually tested
- [ ] No secrets included
- [ ] No dead code or debug logs

---

## 11) Expected Response Format (for Agents)

When delivering changes:

- Brief description (2–6 bullets)
- List of modified files
- How to test
- Risks or considerations

---

## 12) Repository Preferences (Customize)

Consistency with the existing codebase is more important than introducing new patterns.
