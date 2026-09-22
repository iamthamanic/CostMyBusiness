/**
 * Auth session provider + repository switching (remote when signed in).
 * Location: src/app/providers/AuthProvider.tsx
 */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { createLocalRepositories, type LocalRepositories } from '@/features/businesses'
import {
  createBrowserSupabaseClient,
  createRemoteBusinessRepository,
  createRemoteProductRepository,
  type AppSupabaseClient,
} from '@/integrations/supabase'

type AuthContextValue = {
  client: AppSupabaseClient | null
  session: Session | null
  user: User | null
  loading: boolean
  configured: boolean
  authError: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  repos: LocalRepositories
  usingRemote: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const localRef = useRef<LocalRepositories | null>(null)
  if (!localRef.current) localRef.current = createLocalRepositories()

  const client = useMemo(() => createBrowserSupabaseClient(), [])
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(Boolean(client))
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    if (!client) {
      setLoading(false)
      return
    }
    let active = true
    void client.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = client.auth.onAuthStateChange((_event, next) => {
      setSession(next)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [client])

  const repos = useMemo(() => {
    const local = localRef.current!
    if (!client || !session?.user) return local

    const getOwnerId = async () => {
      const uid = session.user.id
      if (!uid) throw new Error('Nicht angemeldet.')
      return uid
    }

    return {
      ...local,
      businesses: createRemoteBusinessRepository(client, getOwnerId),
      products: createRemoteProductRepository(client, getOwnerId),
    }
  }, [client, session])

  async function signIn(email: string, password: string) {
    if (!client) {
      setAuthError('Supabase ist nicht konfiguriert (VITE_SUPABASE_URL / ANON_KEY).')
      return
    }
    setAuthError(null)
    const { error } = await client.auth.signInWithPassword({ email, password })
    if (error) setAuthError('Anmeldung fehlgeschlagen. Bitte E-Mail und Passwort prüfen.')
  }

  async function signUp(email: string, password: string) {
    if (!client) {
      setAuthError('Supabase ist nicht konfiguriert (VITE_SUPABASE_URL / ANON_KEY).')
      return
    }
    setAuthError(null)
    const { error } = await client.auth.signUp({ email, password })
    if (error) setAuthError('Registrierung fehlgeschlagen. Bitte Eingaben prüfen.')
  }

  async function signOut() {
    if (!client) return
    setAuthError(null)
    await client.auth.signOut()
  }

  const value: AuthContextValue = {
    client,
    session,
    user: session?.user ?? null,
    loading,
    configured: Boolean(client),
    authError,
    signIn,
    signUp,
    signOut,
    repos,
    usingRemote: Boolean(client && session?.user),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
