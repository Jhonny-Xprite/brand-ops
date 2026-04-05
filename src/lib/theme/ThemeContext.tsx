import {
  createContext,
  type Dispatch,
  type SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type ThemeMode = 'dark' | 'light'

interface ThemeContextValue {
  theme: ThemeMode
  setTheme: Dispatch<SetStateAction<ThemeMode>>
  toggleTheme: () => void
}

const STORAGE_KEY = 'brand-ops:theme-mode'

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  setTheme: () => undefined,
  toggleTheme: () => undefined,
})

function getSystemTheme(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  if (typeof window.matchMedia !== 'function') {
    return 'dark'
  }

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function applyTheme(theme: ThemeMode) {
  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('dark')

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const persistedTheme = window.localStorage.getItem(STORAGE_KEY)
    const nextTheme =
      persistedTheme === 'light' || persistedTheme === 'dark'
        ? persistedTheme
        : getSystemTheme()

    setThemeState(nextTheme)
    applyTheme(nextTheme)
  }, [])

  useEffect(() => {
    applyTheme(theme)

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, theme)
    }
  }, [theme])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme: setThemeState,
      toggleTheme: () => setThemeState((current) => (current === 'dark' ? 'light' : 'dark')),
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
