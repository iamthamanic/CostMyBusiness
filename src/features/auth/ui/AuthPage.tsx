/**
 * German sign-in / sign-up form for managed Supabase Auth.
 * Location: src/features/auth/ui/AuthPage.tsx
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'
import { Button, Field } from '@/shared/ui'

export function AuthPage() {
  const { configured, user, loading, authError, signIn, signUp, signOut, usingRemote } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit() {
    setBusy(true)
    try {
      if (mode === 'signin') await signIn(email.trim(), password)
      else await signUp(email.trim(), password)
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <p aria-busy="true">Sitzung wird geladen…</p>

  return (
    <section className="mx-auto flex max-w-md flex-col gap-4">
      <header>
        <h1 className="text-2xl font-semibold">Konto</h1>
        <p className="text-sm text-[color:var(--ink-muted)]">
          Anmeldung über Supabase Auth. Ohne Session bleiben Daten lokal im Browser.
        </p>
      </header>

      {!configured ? (
        <p role="status" className="rounded-[12px] border border-dashed border-[color:var(--line-default)] p-4 text-sm">
          Supabase ist nicht konfiguriert. Setzen Sie <code>VITE_SUPABASE_URL</code> und{' '}
          <code>VITE_SUPABASE_ANON_KEY</code> in der Umgebung. Der Service-Role-Key darf nie im Client
          landen.
        </p>
      ) : null}

      {user ? (
        <div className="rounded-[12px] border border-[color:var(--line-default)] bg-[color:var(--surface-panel)] p-4">
          <p className="text-sm">
            Angemeldet als <strong>{user.email}</strong>
          </p>
          <p className="mt-1 text-xs text-[color:var(--ink-muted)]">
            {usingRemote
              ? 'Unternehmen/Produkte werden remote (RLS) gespeichert.'
              : 'Lokaler Speicher aktiv.'}
          </p>
          <div className="mt-3 flex gap-2">
            <Button variant="danger" onClick={() => void signOut()}>
              Abmelden
            </Button>
            <Link to="/businesses" className="rounded-md px-3 py-2 text-sm text-[color:var(--accent-analysis)]">
              Zu Unternehmen
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-[12px] border border-[color:var(--line-default)] bg-[color:var(--surface-panel)] p-4">
          <div className="mb-3 flex gap-2">
            <button
              type="button"
              aria-pressed={mode === 'signin'}
              className={`rounded-md px-3 py-2 text-sm ${
                mode === 'signin'
                  ? 'bg-[color:var(--accent-analysis)] text-white'
                  : 'border border-[color:var(--line-default)]'
              }`}
              onClick={() => setMode('signin')}
            >
              Anmelden
            </button>
            <button
              type="button"
              aria-pressed={mode === 'signup'}
              className={`rounded-md px-3 py-2 text-sm ${
                mode === 'signup'
                  ? 'bg-[color:var(--accent-analysis)] text-white'
                  : 'border border-[color:var(--line-default)]'
              }`}
              onClick={() => setMode('signup')}
            >
              Registrieren
            </button>
          </div>
          <div className="flex flex-col gap-3">
            <Field
              label="E-Mail"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <Field
              label="Passwort"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
            {authError ? (
              <p role="alert" className="text-sm text-[color:var(--semantic-cost)]">
                {authError}
              </p>
            ) : null}
            <Button onClick={() => void onSubmit()} disabled={busy || !configured}>
              {busy ? 'Bitte warten…' : mode === 'signin' ? 'Anmelden' : 'Konto erstellen'}
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}
