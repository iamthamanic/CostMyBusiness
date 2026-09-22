/**
 * App-wide local repository provider (single workspace for V1 personal use).
 * Location: src/app/providers/ReposProvider.tsx
 */
import { createContext, useContext, useMemo, useRef, type ReactNode } from 'react'
import { createLocalRepositories, type LocalRepositories } from '@/features/businesses'

const DEFAULT_WORKSPACE_ID = 'ws_personal'

const ReposContext = createContext<LocalRepositories | null>(null)

export function ReposProvider({ children }: { children: ReactNode }) {
  const reposRef = useRef<LocalRepositories | null>(null)
  if (!reposRef.current) {
    reposRef.current = createLocalRepositories()
  }
  const value = useMemo(() => reposRef.current!, [])
  return <ReposContext.Provider value={value}>{children}</ReposContext.Provider>
}

export function useRepos(): LocalRepositories {
  const ctx = useContext(ReposContext)
  if (!ctx) throw new Error('useRepos must be used within ReposProvider')
  return ctx
}

export function useWorkspaceId(): string {
  return DEFAULT_WORKSPACE_ID
}
