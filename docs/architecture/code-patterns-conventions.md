# Code Patterns & Conventions

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| **Components** | PascalCase | `CreativeLibraryWorkspace.tsx` |
| **Hooks** | camelCase with `use` prefix | `useOnlineStatus.ts` |
| **Files/Utils** | camelCase or hyphenated | `creativeFiles.ts`, `file-utils.ts` |
| **Types/Interfaces** | PascalCase | `CreativeFile`, `FileMetadata` |
| **Constants** | UPPER_SNAKE_CASE | (in utils/constants) |
| **CSS Classes** | Tailwind utility classes | `flex items-center justify-between` |

## Component Patterns (Atomic Design)

**Atoms** — Standalone, reusable base components
```typescript
export function MotionButton({ children, ...props }) {
  return <motion.button {...props}>{children}</motion.button>
}
```

**Molecules** — Small groups of atoms
```typescript
function StatusNotice({ status, message }) {
  return (
    <div>
      <Badge>{status}</Badge>
      <p>{message}</p>
    </div>
  )
}
```

**Organisms** — Complex features combining multiple molecules
```typescript
function CreativeLibraryWorkspace() {
  // Full featured workspace component
  return (
    <section>
      <FileList />
      <MetadataForm />
      <VersionHistoryPanel />
    </section>
  )
}
```

## Redux Patterns

**Store Configuration:**
```typescript
export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    files: filesReducer,
    metadata: metadataReducer,
    versioning: versioningReducer,
    projects: projectsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({...}).concat(apiSlice.middleware),
})
```

**Typed Hooks:**
```typescript
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
```

**Custom Hooks for Redux:**
```typescript
function useProjects() {
  const dispatch = useAppDispatch()
  const projects = useAppSelector(state => state.projects.data)
  return { projects, dispatch }
}
```

## Data Transformation Patterns

**Prisma ↔ App Type Mapping:**
```typescript
// Bridge persisted SQLite format to app-facing contract
export function toAppFileMetadata(metadata: PersistedFileMetadata): FileMetadata {
  return {
    ...metadata,
    tags: parseFileMetadataTags(metadata.tags), // JSON.parse from string
  }
}

export function toPersistedFileMetadata(metadata: FileMetadata): PersistedFileMetadata {
  return {
    ...metadata,
    tags: serializeFileMetadataTags(metadata.tags), // JSON.stringify
  }
}
```

**Note:** SQLite stores tags as JSON-encoded string; app works with string arrays

## API Route Patterns

**Standard Handler:**
```typescript
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' })
  }
  
  if (req.method === 'GET') {
    try {
      const file = await prisma.creativeFile.findUnique({
        where: { id },
        include: { metadata: true },
      })
      return res.status(200).json(file)
    } catch (err) {
      console.error('Error:', err)
      return res.status(500).json({ error: 'Internal error' })
    }
  }
}
```

**Validation Pattern:**
```typescript
if (typeof notes === 'string' && notes.length > 500) {
  return res.status(400).json({ error: 'Notes can have up to 500 characters.' })
}

if (Array.isArray(tags) && tags.length > 20) {
  return res.status(400).json({ error: 'You can add up to 20 tags.' })
}
```

## Theme and i18n Patterns

**Theme Context:**
```typescript
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
```

**Brand Colors:**
```typescript
export const productBrand = {
  primary: '#3B82F6',    // Blue
  secondary: '#8B5CF6',  // Purple
  accent: '#EC4899',     // Pink
  // ...
}
```

**i18n Translation:**
```typescript
function Component() {
  const { t } = useTranslation()
  return <h1>{t('creative_library.title')}</h1>
}
```

## Custom Hook Patterns

**Online Status Hook:**
```typescript
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
  
  useEffect(() => {
    window.addEventListener('online', () => setIsOnline(true))
    window.addEventListener('offline', () => setIsOnline(false))
    // Cleanup...
  }, [])
  
  return isOnline
}
```

**Data Fetching Hook:**
```typescript
export function useProjects() {
  const dispatch = useAppDispatch()
  const projects = useAppSelector(state => state.projects.data)
  
  useEffect(() => {
    dispatch(fetchProjects())
  }, [dispatch])
  
  return projects
}
```

---
