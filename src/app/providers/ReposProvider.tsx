/**
 * App-wide repository access — prefers AuthProvider remote switch when available.
 * Location: src/app/providers/ReposProvider.tsx
 */
import { createContext, useContext, type ReactNode } from 'react'
import type { LocalRepositories } from '@/features/businesses'
import { useAuth } from './AuthProvider'

const DEFAULT_WORKSPACE_ID = 'ws_personal'

const ReposContext = createContext<LocalRepositories | null>(null)

/** Thin bridge so existing useRepos() continues to work under AuthProvider. */
export function ReposProvider({ children }: { children: ReactNode }) {
  const { repos } = useAuth()
  return <ReposContext.Provider value={repos}>{children}</ReposContext.Provider>
}

export function useRepos(): LocalRepositories {
  const ctx = useContext(ReposContext)
  if (!ctx) throw new Error('useRepos must be used within ReposProvider')
  return ctx
}

export function useWorkspaceId(): string {
  return DEFAULT_WORKSPACE_ID
}
