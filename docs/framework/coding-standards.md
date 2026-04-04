# Coding Standards & Development Guidelines

**Document:** Code style, patterns, and best practices  
**Status:** Development Reference  
**Date:** 2026-04-03  
**Owner:** @qa (Quinn)  

---

## 🎯 Core Principles

1. **Clarity First** — Code is read more often than written
2. **Type Safety** — Use TypeScript strictly (no `any` unless justified)
3. **Test-Driven** — Write tests for all features + edge cases
4. **Performance-Conscious** — Measure + optimize critical paths
5. **Accessibility-Required** — WCAG AA minimum (color, keyboard, screen readers)
6. **Security-By-Default** — Validate inputs, sanitize outputs, no hardcoded secrets

---

## 📝 TypeScript Standards

### File Structure

```typescript
// 1. Imports (grouped: external, internal, types)
import React, { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';

import { Button } from '@/components/atoms/Button';
import { useCreatives } from '@/hooks/useCreatives';

import type { Creative } from '@/types/api';

// 2. Types/Interfaces
interface MyComponentProps {
  title: string;
  count: number;
  onSubmit: (data: FormData) => Promise<void>;
}

// 3. Component
export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  count,
  onSubmit,
}) => {
  // ...
};
```

### Type Annotations

```typescript
// ✅ DO: Explicit types for function parameters
function calculateTotal(items: number[], taxRate: number): number {
  return items.reduce((sum, item) => sum + item, 0) * (1 + taxRate);
}

// ❌ DON'T: Avoid `any`
function calculateTotal(items: any[], taxRate: any): any {
  // ...
}

// ✅ DO: Use interfaces for object shapes
interface Creative {
  id: string;
  name: string;
  type: 'image' | 'video' | 'carousel';
  status: 'draft' | 'approved' | 'done';
  tags: string[];
  createdAt: Date;
}

// ✅ DO: Use generics for reusable components
function useApi<T>(url: string): { data: T | null; loading: boolean } {
  // ...
}
```

### No `any` Rule

```typescript
// ❌ BANNED in production code
const result: any = fetchData(); // Defeats TypeScript purpose

// ✅ ALLOWED ONLY with JSDoc comment + reasoning
// @ts-ignore - Third-party API returns untyped response
const result = fetchData(); // Use sparingly, with ticket reference

// ✅ Better: Type the unknown response
const result = (await fetchData()) as CreativeResponse;
```

---

## ⚛️ React Component Standards

### Functional Components Only

```typescript
// ✅ DO: Use functional components with hooks
export const CreativeCard: React.FC<{ creative: Creative }> = ({
  creative,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div onMouseEnter={() => setIsHovered(true)}>
      {/* ... */}
    </div>
  );
};

// ❌ DON'T: Class components (legacy)
class CreativeCard extends React.Component {
  // ...
}
```

### Hook Rules

```typescript
// ✅ DO: Call hooks at top level (not in loops/conditions)
function MyComponent() {
  const [count, setCount] = useState(0); // Top level
  const data = useSelector((state) => state.creatives); // Top level

  if (count > 0) {
    // Don't call hooks here!
  }

  return <div>{count}</div>;
}

// ✅ DO: Create custom hooks for reusable logic
function useCreativeSearch(query: string) {
  const [results, setResults] = useState<Creative[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Search logic
  }, [query]);

  return { results, loading };
}
```

### Memoization

```typescript
// ✅ DO: Memoize expensive components
const FileCard = React.memo(
  ({ creative }: { creative: Creative }) => {
    return <div>{creative.name}</div>;
  },
  (prev, next) => prev.creative.id === next.creative.id
);

// ✅ DO: Memoize expensive calculations
const ChartData = useMemo(
  () => aggregateCreativesByType(creatives),
  [creatives]
);

// ✅ DO: Memoize callbacks
const handleSearch = useCallback((query: string) => {
  dispatch(searchCreatives(query));
}, [dispatch]);
```

---

## 🎨 Styling Standards

### Tailwind CSS Only

```typescript
// ✅ DO: Use Tailwind classes
<div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4">
  <span className="text-lg font-semibold text-slate-900">
    Title
  </span>
</div>

// ❌ DON'T: Inline styles
<div style={{ display: 'flex', gap: '16px' }}>

// ❌ DON'T: CSS modules (use Tailwind)
<div className={styles.container}>
```

### Design Tokens

```typescript
// ✅ DO: Use semantic design tokens aligned with the MVP
<button className="bg-blue-600 text-white hover:bg-blue-700">
  Primary
</button>

<button className="border border-slate-300 bg-white text-slate-900 hover:bg-slate-50">
  Secondary
</button>

// ✅ DO: Consistent spacing scale
<div className="p-4 gap-3 mb-6">
  {/* Spacing: 4px, 12px, 24px, ... */}
</div>
```

### Dark Mode Support

```typescript
// ✅ DO: Keep tokens theme-friendly when dark mode is supported
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content
</div>

// ✅ DO: Avoid making dark mode a product assumption unless the PRD requires it
// Use CSS variables for complex themes
```

---

## 📦 Component Organization (Atomic Design)

### Atoms (Base Components)

```typescript
// src/components/atoms/Button.tsx
interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading,
  children,
  disabled,
  ...props
}) => {
  return (
    <button
      className={clsx(
        'font-semibold rounded-lg transition-colors',
        variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
        variant === 'secondary' &&
          'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white',
        size === 'sm' && 'px-3 py-1 text-sm',
        size === 'md' && 'px-4 py-2 text-base',
        size === 'lg' && 'px-6 py-3 text-lg'
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};
```

### Molecules (Combinations)

```typescript
// src/components/molecules/FormField.tsx
interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  children,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      {children}
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
};
```

### Organisms (Complex Sections)

```typescript
// src/components/organisms/CreativeGrid.tsx
export const CreativeGrid: React.FC = () => {
  const creatives = useSelector(selectCreatives);

  return (
    <div className="grid grid-cols-4 gap-4">
      {creatives.map((creative) => (
        <FileCard key={creative.id} creative={creative} />
      ))}
    </div>
  );
};
```

---

## 🔄 State Management Standards

### Redux Slices

```typescript
// src/store/slices/creativeSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Creative } from '@/types/api';

interface CreativeState {
  items: Creative[];
  selected: Creative | null;
  loading: boolean;
  error: string | null;
}

const initialState: CreativeState = {
  items: [],
  selected: null,
  loading: false,
  error: null,
};

export const creativeSlice = createSlice({
  name: 'creative',
  initialState,
  reducers: {
    setCreatives(state, action: PayloadAction<Creative[]>) {
      state.items = action.payload;
      state.error = null;
    },
    selectCreative(state, action: PayloadAction<Creative>) {
      state.selected = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
  },
});

export const { setCreatives, selectCreative, setLoading, setError } =
  creativeSlice.actions;
export default creativeSlice.reducer;
```

### RTK Query APIs

```typescript
// src/store/api/creativeApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Creative } from '@/types/api';

export const creativeApi = createApi({
  reducerPath: 'creativeApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Creative'],
  endpoints: (builder) => ({
    getCreatives: builder.query<Creative[], { type?: string }>({
      query: ({ type }) => ({
        url: '/creatives',
        params: { type },
      }),
      providesTags: ['Creative'],
    }),
    updateCreative: builder.mutation<
      Creative,
      { id: string; data: Partial<Creative> }
    >({
      query: ({ id, data }) => ({
        url: `/creatives/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Creative'],
    }),
  }),
});

export const { useGetCreativesQuery, useUpdateCreativeMutation } = creativeApi;
```

---

## 🧪 Testing Standards

### Unit Tests

```typescript
// src/lib/__tests__/validation.test.ts
import { validateCreative } from '@/lib/validation';

describe('validateCreative', () => {
  it('should accept valid creative', () => {
    const creative = {
      name: 'Test Image',
      type: 'image',
      status: 'draft',
    };

    expect(() => validateCreative(creative)).not.toThrow();
  });

  it('should reject invalid type', () => {
    const creative = {
      name: 'Test',
      type: 'invalid',
      status: 'draft',
    };

    expect(() => validateCreative(creative)).toThrow('Invalid type');
  });

  it('should require name field', () => {
    const creative = {
      type: 'image',
      status: 'draft',
    };

    expect(() => validateCreative(creative)).toThrow('Name required');
  });
});
```

### Component Tests

```typescript
// src/components/atoms/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button', () => {
  it('should render with label', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('should call onClick handler', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when loading', () => {
    render(<Button isLoading>Submit</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Test Coverage Requirements

| Type | Minimum | Target |
|------|---------|--------|
| Statements | 70% | 85% |
| Branches | 65% | 80% |
| Functions | 70% | 85% |
| Lines | 70% | 85% |

---

## 🔒 Security Standards

### Input Validation

```typescript
// ✅ DO: Validate all inputs
import { z } from 'zod';

const CreateCreativeSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(['image', 'video', 'carousel']),
  tags: z.array(z.string()).max(10),
});

// ❌ DON'T: Trust user input
const creative = req.body; // Never use directly

// ✅ DO: Parse and validate
const creative = CreateCreativeSchema.parse(req.body);
```

### No Hardcoded Secrets

```typescript
// ❌ BANNED: Hardcoded secrets
const API_KEY = '12345-abcde-secret';

// ✅ DO: Use environment variables
const API_KEY = process.env.RCLONE_TOKEN;
if (!API_KEY) throw new Error('RCLONE_TOKEN not configured');
```

### Sanitize Database Queries

```typescript
// ✅ DO: Use Prisma (prevents SQL injection)
const creatives = await prisma.creative.findMany({
  where: { type: userInput.type },
});

// ❌ DON'T: String concatenation
const query = `SELECT * FROM creative WHERE type = '${userInput.type}'`;
```

---

## 📊 Performance Standards

### Bundle Size

- Target: <500 KB gzipped (initial load)
- Check: `npm run build && ls -lh .next/static/chunks/`

### Runtime Performance

- Paint: First Contentful Paint <2 seconds
- Interaction: Time to Interactive <3 seconds
- Search: <500ms for 1K+ files
- Filter: <300ms for multi-filter

### Code Splitting

```typescript
// ✅ DO: Lazy load heavy components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

// ✅ DO: Use React.Suspense
<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

---

## ✅ Pre-Commit Checklist

Before committing code:

- [ ] TypeScript compiles without errors: `npm run typecheck`
- [ ] ESLint passes: `npm run lint`
- [ ] Prettier formatting: `npm run format`
- [ ] Tests pass: `npm test`
- [ ] No console errors/warnings
- [ ] No hardcoded secrets
- [ ] No `any` types (unless justified)
- [ ] Components are memoized (if expensive)
- [ ] Accessibility checked (keyboard nav, color contrast)
- [ ] Performance tested (no regressions)

---

## 🔍 Code Review Checklist

Reviewers check:

- [ ] Code follows standards above
- [ ] Tests cover happy path + edge cases
- [ ] No regressions in performance
- [ ] Security best practices followed
- [ ] Accessibility compliant
- [ ] No hardcoded values
- [ ] Clear variable/function names
- [ ] Comments explain "why" (not "what")
- [ ] Types are correct and explicit
- [ ] Error handling is comprehensive

---

## 📚 Related Documentation

- **Tech Stack:** docs/tech-stack.md (dependencies + versions)
- **Source Tree:** docs/source-tree.md (file organization)
- **Architecture:** docs/fullstack-architecture.md (system design)
- **Frontend Spec:** docs/front-end-spec.md (UI/UX guidelines)

---

## 🛠️ Useful Commands

```bash
# Setup & Install
npm install
npm run setup

# Development
npm run dev        # Start dev server
npm run build      # Production build
npm start          # Run production build

# Code Quality
npm run lint       # ESLint check
npm run format     # Prettier format
npm run typecheck  # TypeScript check
npm test           # Jest tests
npm run test:watch # Tests in watch mode

# Database
npx prisma studio # View database GUI
npx prisma migrate dev --name "description"  # Create migration

# Monitoring
npm run analyze    # Bundle size analysis
npm run format:check # Check formatting without changing
```

---

**Document Owner:** @qa (Quinn)  
**Last Updated:** 2026-04-03  
**Status:** Ready for Development  
**Review Cycle:** Quarterly (or after major framework updates)
