import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { cartoons } from '@/content/cartoon'

const KEY = 'csrf-progress'

type StoredState = {
  completed: string[]
  tutorials: string[]
  labs: string[]
  visits: string[]
  /** Cartoon episode ids watched to the end. */
  cartoons: string[]
  /** Last watched scene index per cartoon id. */
  cartoonPos: Record<string, number>
  /** Cartoon episode ids whose quiz has been passed. */
  quizzes: string[]
}

const EMPTY: StoredState = {
  completed: [],
  tutorials: [],
  labs: [],
  visits: [],
  cartoons: [],
  cartoonPos: {},
  quizzes: [],
}

function load(): StoredState {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed = raw ? (JSON.parse(raw) as Partial<StoredState>) : {}
    const visits = Array.isArray(parsed.visits) ? parsed.visits : []
    const today = dayKey()
    return {
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      tutorials: Array.isArray(parsed.tutorials) ? parsed.tutorials : [],
      labs: Array.isArray(parsed.labs) ? parsed.labs : [],
      cartoons: Array.isArray(parsed.cartoons) ? parsed.cartoons : [],
      quizzes: Array.isArray(parsed.quizzes) ? parsed.quizzes : [],
      cartoonPos:
        parsed.cartoonPos && typeof parsed.cartoonPos === 'object'
          ? (parsed.cartoonPos as Record<string, number>)
          : {},
      visits: visits.includes(today) ? visits : [...visits, today],
    }
  } catch {
    return { ...EMPTY, visits: [dayKey()] }
  }
}

function dayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

function streakFrom(days: string[]) {
  if (days.length === 0) return 0
  const set = new Set(days)
  let count = 0
  const cur = new Date()
  for (;;) {
    const key = `${cur.getFullYear()}-${cur.getMonth() + 1}-${cur.getDate()}`
    if (set.has(key)) {
      count += 1
      cur.setDate(cur.getDate() - 1)
    } else break
  }
  return count
}

type ProgressContextValue = {
  completed: string[]
  tutorials: string[]
  labs: string[]
  visits: string[]
  streak: number
  watchedCartoons: string[]
  passedQuizzes: string[]
  cartoonTotal: number
  watchedCartoonCount: number
  isChapterDone: (slug: string) => boolean
  isTutorialWatched: (id: string) => boolean
  isLabSolved: (id: string) => boolean
  isCartoonWatched: (id: string) => boolean
  cartoonPosition: (id: string) => number
  isQuizPassed: (id: string) => boolean
  toggleChapter: (slug: string) => void
  markChapterDone: (slug: string) => void
  markTutorialWatched: (id: string) => void
  markLabSolved: (id: string) => void
  markCartoonWatched: (id: string) => void
  setCartoonPosition: (id: string, index: number) => void
  markQuizPassed: (id: string) => void
  reset: () => void
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredState>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* ignore */
    }
  }, [state])

  const toggleChapter = useCallback((slug: string) => {
    setState((prev) => ({
      ...prev,
      completed: prev.completed.includes(slug)
        ? prev.completed.filter((s) => s !== slug)
        : [...prev.completed, slug],
    }))
  }, [])

  const markChapterDone = useCallback((slug: string) => {
    setState((prev) =>
      prev.completed.includes(slug)
        ? prev
        : { ...prev, completed: [...prev.completed, slug] },
    )
  }, [])

  const markTutorialWatched = useCallback((id: string) => {
    setState((prev) =>
      prev.tutorials.includes(id) ? prev : { ...prev, tutorials: [...prev.tutorials, id] },
    )
  }, [])

  const markLabSolved = useCallback((id: string) => {
    setState((prev) =>
      prev.labs.includes(id) ? prev : { ...prev, labs: [...prev.labs, id] },
    )
  }, [])

  const markCartoonWatched = useCallback((id: string) => {
    setState((prev) =>
      prev.cartoons.includes(id) ? prev : { ...prev, cartoons: [...prev.cartoons, id] },
    )
  }, [])

  const setCartoonPosition = useCallback((id: string, index: number) => {
    setState((prev) =>
      prev.cartoonPos[id] === index ? prev : { ...prev, cartoonPos: { ...prev.cartoonPos, [id]: index } },
    )
  }, [])

  const markQuizPassed = useCallback((id: string) => {
    setState((prev) =>
      prev.quizzes.includes(id) ? prev : { ...prev, quizzes: [...prev.quizzes, id] },
    )
  }, [])

  const reset = useCallback(() => setState({ ...EMPTY, visits: [dayKey()] }), [])

  const value = useMemo<ProgressContextValue>(
    () => ({
      completed: state.completed,
      tutorials: state.tutorials,
      labs: state.labs,
      visits: state.visits,
      streak: streakFrom(state.visits),
      watchedCartoons: state.cartoons,
      passedQuizzes: state.quizzes,
      cartoonTotal: cartoons.length,
      watchedCartoonCount: cartoons.filter((c) => state.cartoons.includes(c.id)).length,
      isChapterDone: (slug) => state.completed.includes(slug),
      isTutorialWatched: (id) => state.tutorials.includes(id),
      isLabSolved: (id) => state.labs.includes(id),
      isCartoonWatched: (id) => state.cartoons.includes(id),
      cartoonPosition: (id) => state.cartoonPos[id] ?? 0,
      isQuizPassed: (id) => state.quizzes.includes(id),
      toggleChapter,
      markChapterDone,
      markTutorialWatched,
      markLabSolved,
      markCartoonWatched,
      setCartoonPosition,
      markQuizPassed,
      reset,
    }),
    [state, toggleChapter, markChapterDone, markTutorialWatched, markLabSolved, markCartoonWatched, setCartoonPosition, markQuizPassed, reset],
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used within a ProgressProvider')
  return ctx
}
