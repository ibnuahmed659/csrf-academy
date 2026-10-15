import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const KEY = 'csrf-profile'

type Stored = { name: string; createdAt: string }

const EMPTY: Stored = { name: '', createdAt: '' }

function load(): Stored {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as Partial<Stored>
    return {
      name: typeof parsed.name === 'string' ? parsed.name : '',
      createdAt: typeof parsed.createdAt === 'string' ? parsed.createdAt : '',
    }
  } catch {
    return EMPTY
  }
}

type ProfileContextValue = {
  name: string
  initial: string
  displayName: string
  hasProfile: boolean
  createdAt: string
  setName: (name: string) => void
  clear: () => void
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Stored>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* ignore */
    }
  }, [state])

  const setName = useCallback((name: string) => {
    setState((prev) => ({
      name: name.slice(0, 40),
      createdAt: prev.createdAt || new Date().toISOString(),
    }))
  }, [])

  const clear = useCallback(() => setState(EMPTY), [])

  const value = useMemo<ProfileContextValue>(() => {
    const name = state.name.trim()
    return {
      name,
      initial: name ? name[0].toUpperCase() : '?',
      displayName: name || 'Learner',
      hasProfile: name.length > 0,
      createdAt: state.createdAt,
      setName,
      clear,
    }
  }, [state.name, state.createdAt, setName, clear])

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used within a ProfileProvider')
  return ctx
}
