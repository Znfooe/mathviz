import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

/**
 * 收藏功能：按实验 path 收藏，localStorage 持久化，跨标签页同步
 */
const STORAGE_KEY = 'mathviz-favorites-v1'

interface FavoritesContextValue {
  favorites: string[]
  isFavorite: (path: string) => boolean
  toggleFavorite: (path: string) => void
  removeFavorite: (path: string) => void
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

function load(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
    } catch {}
  }, [favorites])

  // 跨标签页同步
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setFavorites(load())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const toggleFavorite = useCallback((path: string) => {
    setFavorites((prev) => (prev.includes(path) ? prev.filter((p) => p !== path) : [path, ...prev]))
  }, [])

  const removeFavorite = useCallback((path: string) => {
    setFavorites((prev) => prev.filter((p) => p !== path))
  }, [])

  const isFavorite = useCallback((path: string) => favorites.includes(path), [favorites])

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, removeFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider')
  return ctx
}
